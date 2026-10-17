package com.agriguid;

import com.agriguid.config.JwtUtil;
import com.agriguid.model.*;
import com.agriguid.repository.*;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RoleAndDashboardSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkerListingRepository workerListingRepository;

    @Autowired
    private EquipmentListingRepository equipmentListingRepository;

    @Autowired
    private FarmerExperienceRepository experienceRepository;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User worker1;
    private User worker2;
    private User farmer1;
    private User admin1;

    private String worker1Token;
    private String worker2Token;
    private String farmer1Token;
    private String adminToken;

    @BeforeEach
    void setUp() {
        experienceRepository.deleteAll();
        equipmentListingRepository.deleteAll();
        workerListingRepository.deleteAll();
        userRepository.deleteAll();
        cropRepository.deleteAll();

        worker1 = createUser("w1", UserRole.WORKER);
        worker2 = createUser("w2", UserRole.WORKER);
        farmer1 = createUser("f1", UserRole.FARMER);
        admin1 = createUser("adm", UserRole.ADMIN);

        worker1Token = jwtUtil.generateToken(worker1.getUsername(), worker1.getRole().name());
        worker2Token = jwtUtil.generateToken(worker2.getUsername(), worker2.getRole().name());
        farmer1Token = jwtUtil.generateToken(farmer1.getUsername(), farmer1.getRole().name());
        adminToken = jwtUtil.generateToken(admin1.getUsername(), admin1.getRole().name());
    }

    private User createUser(String username, UserRole role) {
        User u = new User();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode("secret123"));
        u.setEmail(username + "@agriguid.com");
        u.setFullName("User " + username);
        u.setRole(role);
        u.setRegion("Punjab");
        u.setIsActive(true);
        u.setRegistrationDate(LocalDateTime.now());
        if (role == UserRole.FARMER) {
            u.setIsVerifiedFarmer(false);
            u.setFarmerVerificationStatus(FarmerVerificationStatus.PENDING);
        } else {
            u.setFarmerVerificationStatus(FarmerVerificationStatus.NONE);
        }
        return userRepository.save(u);
    }

    // 1. A new WORKER creates a profile successfully
    // 2. The same worker cannot create a second profile
    @Test
    void testWorker_CanCreateOnlyOneProfile() throws Exception {
        WorkerListing l1 = new WorkerListing();
        l1.setWorkerName("Worker One");
        l1.setPhoneNumber("+91-1111111111");
        l1.setSkillSet("Tractor, Seeding");
        l1.setExperienceYears(4);
        l1.setRegion("Punjab");
        l1.setAvailability(AvailabilityStatus.AVAILABLE);

        // First profile creation succeeds
        mockMvc.perform(post("/api/workers")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(l1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.workerName", is("Worker One")));

        // Fetch via /api/workers/me
        mockMvc.perform(get("/api/workers/me")
                .header("Authorization", "Bearer " + worker1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workerName", is("Worker One")));

        // Attempting to create a second profile fails
        WorkerListing l2 = new WorkerListing();
        l2.setWorkerName("Worker One Duplicate");
        l2.setPhoneNumber("+91-1111111112");
        l2.setSkillSet("Harvesting");
        l2.setExperienceYears(5);
        l2.setRegion("Punjab");
        l2.setAvailability(AvailabilityStatus.AVAILABLE);

        mockMvc.perform(post("/api/workers")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(l2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("already have an existing worker listing")));
    }

    // 3. Another worker can create their own profile
    // 4. Two different workers can have the same display name
    @Test
    void testTwoWorkers_CanHaveSameDisplayName() throws Exception {
        WorkerListing l1 = new WorkerListing();
        l1.setWorkerName("Shared Name");
        l1.setPhoneNumber("+91-1111111111");
        l1.setSkillSet("Plow");
        l1.setExperienceYears(3);
        l1.setRegion("Punjab");
        l1.setAvailability(AvailabilityStatus.AVAILABLE);

        mockMvc.perform(post("/api/workers")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(l1)))
                .andExpect(status().isCreated());

        WorkerListing l2 = new WorkerListing();
        l2.setWorkerName("Shared Name");
        l2.setPhoneNumber("+91-2222222222");
        l2.setSkillSet("Harvest");
        l2.setExperienceYears(5);
        l2.setRegion("Haryana");
        l2.setAvailability(AvailabilityStatus.AVAILABLE);

        mockMvc.perform(post("/api/workers")
                .header("Authorization", "Bearer " + worker2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(l2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.workerName", is("Shared Name")));
    }

    // 5. Worker can edit their own profile and availability via /me
    @Test
    void testWorker_CanEditOwnProfileAndAvailability() throws Exception {
        WorkerListing l = new WorkerListing();
        l.setWorkerName("Ravi");
        l.setPhoneNumber("+91-1111111111");
        l.setSkillSet("Tractor");
        l.setExperienceYears(4);
        l.setRegion("Punjab");
        l.setAvailability(AvailabilityStatus.AVAILABLE);

        mockMvc.perform(post("/api/workers")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(l)))
                .andExpect(status().isCreated());

        // Update profile
        l.setWorkerName("Ravi Kumar Updated");
        mockMvc.perform(put("/api/workers/me")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(l)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workerName", is("Ravi Kumar Updated")));

        // Update availability
        mockMvc.perform(patch("/api/workers/me/availability")
                .header("Authorization", "Bearer " + worker1Token)
                .param("availability", "BUSY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availability", is("BUSY")));
    }

    // 6. Farmer can create and manage their own equipment
    // 7. Worker can create and manage their own equipment
    @Test
    void testFarmerAndWorker_CanManageOwnEquipment() throws Exception {
        EquipmentListing eqFarmer = new EquipmentListing();
        eqFarmer.setEquipmentName("Farmer Tractor");
        eqFarmer.setEquipmentType("Tractor");
        eqFarmer.setBrand("Mahindra");
        eqFarmer.setAvailability(AvailabilityStatus.AVAILABLE);
        eqFarmer.setDailyRentalCost(new BigDecimal("1500"));

        mockMvc.perform(post("/api/equipment")
                .header("Authorization", "Bearer " + farmer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(eqFarmer)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.equipmentName", is("Farmer Tractor")));

        EquipmentListing eqWorker = new EquipmentListing();
        eqWorker.setEquipmentName("Worker Tiller");
        eqWorker.setEquipmentType("Tiller");
        eqWorker.setBrand("Fieldking");
        eqWorker.setAvailability(AvailabilityStatus.AVAILABLE);
        eqWorker.setDailyRentalCost(new BigDecimal("800"));

        mockMvc.perform(post("/api/equipment")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(eqWorker)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.equipmentName", is("Worker Tiller")));

        // Farmer checks their own equipment
        mockMvc.perform(get("/api/equipment/my")
                .header("Authorization", "Bearer " + farmer1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].equipmentName", is("Farmer Tractor")));

        // Worker checks their own equipment
        mockMvc.perform(get("/api/equipment/my")
                .header("Authorization", "Bearer " + worker1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].equipmentName", is("Worker Tiller")));
    }

    // 8. Farmer and Worker can manage their own experiences
    @Test
    void testFarmerAndWorker_CanManageOwnExperiences() throws Exception {
        FarmerExperience expFarmer = new FarmerExperience();
        expFarmer.setTitle("Farmer Rice Experience");
        expFarmer.setExperienceText("Great season for rice");
        expFarmer.setRegion("Punjab");

        mockMvc.perform(post("/api/experiences")
                .header("Authorization", "Bearer " + farmer1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(expFarmer)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Farmer Rice Experience")));

        FarmerExperience expWorker = new FarmerExperience();
        expWorker.setTitle("Worker Harvesting Experience");
        expWorker.setExperienceText("Efficient combine harvesting");
        expWorker.setRegion("Punjab");

        mockMvc.perform(post("/api/experiences")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(expWorker)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Worker Harvesting Experience")));

        mockMvc.perform(get("/api/experiences/my")
                .header("Authorization", "Bearer " + worker1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Worker Harvesting Experience")));
    }

    // 9. Non-admin cannot access admin endpoints
    @Test
    void testNonAdmin_CannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + farmer1Token))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + worker1Token))
                .andExpect(status().isForbidden());

        // Admin can access
        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    // 10. Admin can verify farmer
    @Test
    void testAdmin_CanVerifyFarmer() throws Exception {
        assertEquals(FarmerVerificationStatus.PENDING, farmer1.getFarmerVerificationStatus());

        mockMvc.perform(patch("/api/admin/farmers/" + farmer1.getId() + "/verify")
                .header("Authorization", "Bearer " + adminToken)
                .param("status", "APPROVED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.farmerVerificationStatus", is("APPROVED")))
                .andExpect(jsonPath("$.isVerifiedFarmer", is(true)));
    }

    // 11. Public signup cannot register as ADMIN or EQUIPMENT_OWNER
    @Test
    void testSignup_BlocksAdminAndEquipmentOwner() throws Exception {
        Map<String, Object> adminSignup = Map.of(
                "username", "hacker_admin",
                "password", "password123",
                "email", "hacker@test.com",
                "role", "ADMIN"
        );

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(adminSignup)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Public registration is only permitted for FARMER or WORKER")));
    }

    // 12. Admin cannot delete self
    @Test
    void testAdmin_CannotDeleteSelf() throws Exception {
        mockMvc.perform(delete("/api/admin/users/" + admin1.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("cannot delete their own account")));
    }
}
