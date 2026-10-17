package com.agriguid;

import com.agriguid.dto.LoginRequest;
import com.agriguid.dto.SignupRequest;
import com.agriguid.model.User;
import com.agriguid.model.UserRole;
import com.agriguid.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void testSignup_SuccessfullyHashesPasswordAndReturnsJwt() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setUsername("farmer_bob");
        request.setPassword("securePassword123");
        request.setEmail("bob@example.com");
        request.setFullName("Bob Farmer");
        request.setPhoneNumber("+91-9988776655");
        request.setRegion("Punjab");
        request.setLocation("Amritsar");
        request.setRole(UserRole.FARMER);
        request.setYearsOfExperience(5);

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.username", is("farmer_bob")))
                .andExpect(jsonPath("$.user.password").doesNotExist());

        // Verify password in DB is BCrypt hashed, NOT plain text
        User savedUser = userRepository.findByUsername("farmer_bob").orElseThrow();
        assertNotEquals("securePassword123", savedUser.getPassword());
        assertTrue(passwordEncoder.matches("securePassword123", savedUser.getPassword()));
        assertTrue(savedUser.getPassword().startsWith("$2a$") || savedUser.getPassword().startsWith("$2b$"));
    }

    @Test
    void testLogin_ValidCredentials_ReturnsToken() throws Exception {
        User user = new User();
        user.setUsername("worker_sam");
        user.setPassword(passwordEncoder.encode("workerPass123"));
        user.setEmail("sam@example.com");
        user.setRole(UserRole.WORKER);
        user.setIsActive(true);
        user.setRegistrationDate(LocalDateTime.now());
        userRepository.save(user);

        LoginRequest login = new LoginRequest("worker_sam", "workerPass123");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.username", is("worker_sam")))
                .andExpect(jsonPath("$.user.role", is("WORKER")));
    }

    @Test
    void testLogin_PlainTextPasswordMigration_TransparentlyUpgradesToBCrypt() throws Exception {
        // Legacy user with unhashed plain text password in DB
        User legacyUser = new User();
        legacyUser.setUsername("legacy_user");
        legacyUser.setPassword("plainTextPassword");
        legacyUser.setEmail("legacy@example.com");
        legacyUser.setRole(UserRole.FARMER);
        legacyUser.setIsActive(true);
        legacyUser.setRegistrationDate(LocalDateTime.now());
        userRepository.save(legacyUser);

        LoginRequest login = new LoginRequest("legacy_user", "plainTextPassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.token", notNullValue()));

        // Verify password was migrated and is now BCrypt hashed
        User updatedUser = userRepository.findByUsername("legacy_user").orElseThrow();
        assertNotEquals("plainTextPassword", updatedUser.getPassword());
        assertTrue(passwordEncoder.matches("plainTextPassword", updatedUser.getPassword()));
    }

    @Test
    void testLogin_DeactivatedAccount_ReturnsUnauthorizedWithMessage() throws Exception {
        User deactivated = new User();
        deactivated.setUsername("inactive_user");
        deactivated.setPassword(passwordEncoder.encode("somePassword"));
        deactivated.setEmail("inactive@example.com");
        deactivated.setRole(UserRole.FARMER);
        deactivated.setIsActive(false);
        deactivated.setRegistrationDate(LocalDateTime.now());
        userRepository.save(deactivated);

        LoginRequest login = new LoginRequest("inactive_user", "somePassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("deactivated")));
    }

    @Test
    void testLogin_InvalidPassword_ReturnsUnauthorized() throws Exception {
        User user = new User();
        user.setUsername("active_user");
        user.setPassword(passwordEncoder.encode("correctPassword"));
        user.setEmail("active@example.com");
        user.setRole(UserRole.WORKER);
        user.setIsActive(true);
        user.setRegistrationDate(LocalDateTime.now());
        userRepository.save(user);

        LoginRequest login = new LoginRequest("active_user", "wrongPassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid username or password")));
    }
}
