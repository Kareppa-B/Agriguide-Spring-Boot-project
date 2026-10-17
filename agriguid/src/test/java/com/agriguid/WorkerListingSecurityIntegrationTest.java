package com.agriguid;

import com.agriguid.config.JwtUtil;
import com.agriguid.model.AvailabilityStatus;
import com.agriguid.model.User;
import com.agriguid.model.UserRole;
import com.agriguid.model.WorkerListing;
import com.agriguid.repository.UserRepository;
import com.agriguid.repository.WorkerListingRepository;
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

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class WorkerListingSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WorkerListingRepository workerListingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private User workerUser1;
    private User workerUser2;
    private User farmerUser;
    private String worker1Token;
    private String worker2Token;
    private String farmerToken;

    @BeforeEach
    void setUp() {
        workerListingRepository.deleteAll();
        userRepository.deleteAll();

        // Create Worker 1
        workerUser1 = new User();
        workerUser1.setUsername("worker_alpha");
        workerUser1.setPassword(passwordEncoder.encode("password123"));
        workerUser1.setEmail("worker1@example.com");
        workerUser1.setRole(UserRole.WORKER);
        workerUser1.setIsActive(true);
        workerUser1.setRegistrationDate(LocalDateTime.now());
        workerUser1 = userRepository.save(workerUser1);
        worker1Token = jwtUtil.generateToken(workerUser1.getUsername(), workerUser1.getRole().name());

        // Create Worker 2
        workerUser2 = new User();
        workerUser2.setUsername("worker_beta");
        workerUser2.setPassword(passwordEncoder.encode("password123"));
        workerUser2.setEmail("worker2@example.com");
        workerUser2.setRole(UserRole.WORKER);
        workerUser2.setIsActive(true);
        workerUser2.setRegistrationDate(LocalDateTime.now());
        workerUser2 = userRepository.save(workerUser2);
        worker2Token = jwtUtil.generateToken(workerUser2.getUsername(), workerUser2.getRole().name());

        // Create Farmer
        farmerUser = new User();
        farmerUser.setUsername("farmer_charlie");
        farmerUser.setPassword(passwordEncoder.encode("password123"));
        farmerUser.setEmail("farmer@example.com");
        farmerUser.setRole(UserRole.FARMER);
        farmerUser.setIsActive(true);
        farmerUser.setRegistrationDate(LocalDateTime.now());
        farmerUser = userRepository.save(farmerUser);
        farmerToken = jwtUtil.generateToken(farmerUser.getUsername(), farmerUser.getRole().name());
    }

    // ─── 1. Public Browsing & Search (excludes inactive) ─────────────────────

    @Test
    void testPublicSearch_ExcludesInactiveListings() throws Exception {
        // Active listing
        WorkerListing active = new WorkerListing();
        active.setUser(workerUser1);
        active.setWorkerName("John Harvester");
        active.setPhoneNumber("+91-1111111111");
        active.setSkillSet("Harvesting, Tractor");
        active.setRegion("Punjab");
        active.setSpecificLocation("Amritsar");
        active.setAvailability(AvailabilityStatus.AVAILABLE);
        active.setDailyRate(new BigDecimal("900"));
        active.setHourlyRate(new BigDecimal("110"));
        active.setExperienceYears(6);
        active.setListedDate(LocalDateTime.now());
        active.setIsActive(true);
        workerListingRepository.save(active);

        // Inactive listing
        WorkerListing inactive = new WorkerListing();
        inactive.setUser(workerUser2);
        inactive.setWorkerName("Hidden Worker");
        inactive.setPhoneNumber("+91-2222222222");
        inactive.setSkillSet("Harvesting, Irrigation");
        inactive.setRegion("Punjab");
        inactive.setSpecificLocation("Ludhiana");
        inactive.setAvailability(AvailabilityStatus.AVAILABLE);
        inactive.setDailyRate(new BigDecimal("700"));
        inactive.setHourlyRate(new BigDecimal("80"));
        inactive.setExperienceYears(3);
        inactive.setListedDate(LocalDateTime.now());
        inactive.setIsActive(false); // Inactive!
        workerListingRepository.save(inactive);

        // 1. All active workers
        mockMvc.perform(get("/api/workers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].workerName", is("John Harvester")));

        // 2. Region filter
        mockMvc.perform(get("/api/workers/region/Punjab"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].workerName", is("John Harvester")));

        // 3. Available in region filter
        mockMvc.perform(get("/api/workers/available/Punjab"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].workerName", is("John Harvester")));

        // 4. Skill search
        mockMvc.perform(get("/api/workers/search").param("skill", "Harvesting"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].workerName", is("John Harvester")));

        // 5. Availability filter
        mockMvc.perform(get("/api/workers/availability/AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].workerName", is("John Harvester")));
    }

    // ─── 2. Unauthenticated Requests ─────────────────────────────────────────

    @Test
    void testUnauthenticated_CreateWorkerListing_ReturnsUnauthorized() throws Exception {
        WorkerListing listing = createSampleListingDto();

        mockMvc.perform(post("/api/workers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(listing)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testUnauthenticated_GetMyListings_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/workers/my"))
                .andExpect(status().isUnauthorized());
    }

    // ─── 3. Farmer Restrictions ──────────────────────────────────────────────

    @Test
    void testFarmer_CannotCreateWorkerListing() throws Exception {
        WorkerListing listing = createSampleListingDto();

        mockMvc.perform(post("/api/workers")
                .header("Authorization", "Bearer " + farmerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(listing)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testFarmer_CannotUpdateWorkerListing() throws Exception {
        WorkerListing saved = saveListingForUser(workerUser1, true);

        WorkerListing updateDto = createSampleListingDto();
        updateDto.setWorkerName("Farmer Tampering Name");

        mockMvc.perform(put("/api/workers/" + saved.getId())
                .header("Authorization", "Bearer " + farmerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testFarmer_CannotDeactivateOrDeleteWorkerListing() throws Exception {
        WorkerListing saved = saveListingForUser(workerUser1, true);

        mockMvc.perform(patch("/api/workers/" + saved.getId() + "/deactivate")
                .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/workers/" + saved.getId())
                .header("Authorization", "Bearer " + farmerToken))
                .andExpect(status().isForbidden());
    }

    // ─── 4. Worker Ownership & Lifecycle ─────────────────────────────────────

    @Test
    void testWorker_CanCreateAndManageOwnListing() throws Exception {
        WorkerListing dto = createSampleListingDto();
        dto.setWorkerName("Alpha Worker Official");

        // 1. Create
        String responseContent = mockMvc.perform(post("/api/workers")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.workerName", is("Alpha Worker Official")))
                .andExpect(jsonPath("$.isActive", is(true)))
                .andExpect(jsonPath("$.userId", is(workerUser1.getId().intValue())))
                .andReturn().getResponse().getContentAsString();

        WorkerListing created = objectMapper.readValue(responseContent, WorkerListing.class);
        Long listingId = created.getId();

        // Verify foreign key in DB
        WorkerListing inDb = workerListingRepository.findById(listingId).orElseThrow();
        assertNotNull(inDb.getUser());
        assertEquals(workerUser1.getId(), inDb.getUser().getId());

        // 2. View my listings
        mockMvc.perform(get("/api/workers/my")
                .header("Authorization", "Bearer " + worker1Token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].workerName", is("Alpha Worker Official")));

        // 3. Update own listing
        dto.setWorkerName("Alpha Worker Updated");
        dto.setDailyRate(new BigDecimal("1200"));
        mockMvc.perform(put("/api/workers/" + listingId)
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.workerName", is("Alpha Worker Updated")))
                .andExpect(jsonPath("$.dailyRate", is(1200)));

        // 4. Deactivate
        mockMvc.perform(patch("/api/workers/" + listingId + "/deactivate")
                .header("Authorization", "Bearer " + worker1Token))
                .andExpect(status().isOk());

        WorkerListing deactivated = workerListingRepository.findById(listingId).orElseThrow();
        assertFalse(deactivated.getIsActive());

        // Verify public list excludes it
        mockMvc.perform(get("/api/workers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // 5. Reactivate
        mockMvc.perform(patch("/api/workers/" + listingId + "/activate")
                .header("Authorization", "Bearer " + worker1Token))
                .andExpect(status().isOk());

        WorkerListing reactivated = workerListingRepository.findById(listingId).orElseThrow();
        assertTrue(reactivated.getIsActive());

        // 6. Delete
        mockMvc.perform(delete("/api/workers/" + listingId)
                .header("Authorization", "Bearer " + worker1Token))
                .andExpect(status().isNoContent());

        assertTrue(workerListingRepository.findById(listingId).isEmpty());
    }

    // ─── 5. Cross-Worker Protection ──────────────────────────────────────────

    @Test
    void testWorker_CannotModifyAnotherWorkersListing() throws Exception {
        WorkerListing worker1Listing = saveListingForUser(workerUser1, true);

        WorkerListing updateAttempt = createSampleListingDto();
        updateAttempt.setWorkerName("Hacked by Worker 2");

        // Worker 2 attempts to update Worker 1's listing
        mockMvc.perform(put("/api/workers/" + worker1Listing.getId())
                .header("Authorization", "Bearer " + worker2Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateAttempt)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("not authorized")));

        // Worker 2 attempts to deactivate Worker 1's listing
        mockMvc.perform(patch("/api/workers/" + worker1Listing.getId() + "/deactivate")
                .header("Authorization", "Bearer " + worker2Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("not authorized")));

        // Worker 2 attempts to delete Worker 1's listing
        mockMvc.perform(delete("/api/workers/" + worker1Listing.getId())
                .header("Authorization", "Bearer " + worker2Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", containsString("not authorized")));

        // Verify Worker 1's listing remains intact
        WorkerListing intact = workerListingRepository.findById(worker1Listing.getId()).orElseThrow();
        assertEquals(workerUser1.getId(), intact.getUser().getId());
        assertEquals("Sample Worker", intact.getWorkerName());
    }

    // ─── 6. Validation Errors (400 Bad Request) ──────────────────────────────

    @Test
    void testValidation_NegativeRateAndMissingFields_ReturnBadRequest() throws Exception {
        // Missing worker name
        WorkerListing missingName = createSampleListingDto();
        missingName.setWorkerName("");
        mockMvc.perform(post("/api/workers")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(missingName)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Worker name is required")));

        // Negative experience
        WorkerListing negExp = createSampleListingDto();
        negExp.setExperienceYears(-2);
        mockMvc.perform(post("/api/workers")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(negExp)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Experience years must be 0 or greater")));

        // Negative daily rate
        WorkerListing negRate = createSampleListingDto();
        negRate.setDailyRate(new BigDecimal("-50"));
        mockMvc.perform(post("/api/workers")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(negRate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", containsString("Daily rate must be non-negative")));
    }

    // ─── 7. Missing Records (404 Not Found) ──────────────────────────────────

    @Test
    void testMissingRecords_ReturnNotFound() throws Exception {
        WorkerListing updateDto = createSampleListingDto();

        // Non-existent ID: 99999
        mockMvc.perform(put("/api/workers/99999")
                .header("Authorization", "Bearer " + worker1Token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", containsString("not found")));

        mockMvc.perform(patch("/api/workers/99999/deactivate")
                .header("Authorization", "Bearer " + worker1Token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", containsString("not found")));

        mockMvc.perform(delete("/api/workers/99999")
                .header("Authorization", "Bearer " + worker1Token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error", containsString("not found")));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private WorkerListing createSampleListingDto() {
        WorkerListing listing = new WorkerListing();
        listing.setWorkerName("Sample Worker");
        listing.setPhoneNumber("+91-9876543299");
        listing.setSkillSet("Plowing, Seeding");
        listing.setRegion("Punjab");
        listing.setSpecificLocation("Jalandhar");
        listing.setAvailability(AvailabilityStatus.AVAILABLE);
        listing.setDailyRate(new BigDecimal("850"));
        listing.setHourlyRate(new BigDecimal("100"));
        listing.setExperienceYears(4);
        listing.setDescription("Hardworking agricultural laborer.");
        return listing;
    }

    private WorkerListing saveListingForUser(User user, boolean active) {
        WorkerListing listing = createSampleListingDto();
        listing.setUser(user);
        listing.setListedDate(LocalDateTime.now());
        listing.setIsActive(active);
        return workerListingRepository.save(listing);
    }
}
