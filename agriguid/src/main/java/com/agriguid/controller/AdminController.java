package com.agriguid.controller;

import com.agriguid.model.*;
import com.agriguid.repository.*;
import com.agriguid.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private WorkerListingService workerListingService;

    @Autowired
    private WorkerListingRepository workerListingRepository;

    @Autowired
    private EquipmentListingService equipmentListingService;

    @Autowired
    private EquipmentListingRepository equipmentListingRepository;

    @Autowired
    private FarmerExperienceService experienceService;

    @Autowired
    private FarmerExperienceRepository experienceRepository;

    @Autowired
    private CropService cropService;

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private UserRepository userRepository;

    // ─── 0. Admin Dashboard Stats ───────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalUsers = userRepository.count();
        long pendingFarmers = userRepository.findByRole(UserRole.FARMER).stream()
                .filter(u -> u.getFarmerVerificationStatus() == FarmerVerificationStatus.PENDING)
                .count();
        long totalWorkers = workerListingRepository.count();
        long totalEquipment = equipmentListingRepository.count();
        long totalExperiences = experienceRepository.count();
        long totalCrops = cropRepository.count();

        stats.put("totalUsers", totalUsers);
        stats.put("pendingFarmers", pendingFarmers);
        stats.put("totalWorkers", totalWorkers);
        stats.put("totalEquipment", totalEquipment);
        stats.put("totalExperiences", totalExperiences);
        stats.put("totalCrops", totalCrops);

        return ResponseEntity.ok(stats);
    }

    // ─── 1. User Management ─────────────────────────────────────────────────
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Boolean isActive) {
        
        List<User> users = userService.getAllUsers().stream()
                .filter(u -> {
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase();
                        boolean matchName = u.getFullName() != null && u.getFullName().toLowerCase().contains(q);
                        boolean matchUsername = u.getUsername() != null && u.getUsername().toLowerCase().contains(q);
                        boolean matchEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(q);
                        if (!matchName && !matchUsername && !matchEmail) return false;
                    }
                    if (role != null && u.getRole() != role) return false;
                    if (region != null && !region.isBlank() && !region.equalsIgnoreCase(u.getRegion())) return false;
                    if (isActive != null && !isActive.equals(u.getIsActive())) return false;
                    return true;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id, Authentication authentication) {
        try {
            User updated = userService.toggleUserStatus(id, authentication.getName());
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication authentication) {
        try {
            userService.deleteUserSafely(id, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── 2. Farmer Verification ─────────────────────────────────────────────
    @GetMapping("/farmers")
    public ResponseEntity<List<User>> getFarmers(@RequestParam(required = false) FarmerVerificationStatus status) {
        return ResponseEntity.ok(userService.getFarmersForVerification(status));
    }

    @PatchMapping("/farmers/{id}/verify")
    public ResponseEntity<?> verifyFarmer(
            @PathVariable Long id,
            @RequestParam FarmerVerificationStatus status) {
        try {
            User updated = userService.verifyFarmer(id, status);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─── 3. Worker Listing Moderation ───────────────────────────────────────
    @GetMapping("/workers")
    public ResponseEntity<List<WorkerListing>> getAllWorkerListings() {
        return ResponseEntity.ok(workerListingRepository.findAll());
    }

    @PutMapping("/workers/{id}")
    public ResponseEntity<?> updateWorkerListing(
            @PathVariable Long id,
            @RequestBody WorkerListing listing,
            Authentication authentication) {
        WorkerListing updated = workerListingService.updateListing(id, listing, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/workers/{id}/toggle-status")
    public ResponseEntity<?> toggleWorkerListingStatus(
            @PathVariable Long id,
            Authentication authentication) {
        WorkerListing existing = workerListingRepository.findById(id)
                .orElseThrow(() -> new com.agriguid.exception.ResourceNotFoundException("Worker listing not found: " + id));
        if (Boolean.TRUE.equals(existing.getIsActive())) {
            workerListingService.deactivateListing(id, authentication.getName());
        } else {
            workerListingService.activateListing(id, authentication.getName());
        }
        return ResponseEntity.ok(Map.of("message", "Worker listing status updated"));
    }

    @DeleteMapping("/workers/{id}")
    public ResponseEntity<?> deleteWorkerListing(
            @PathVariable Long id,
            Authentication authentication) {
        workerListingService.deleteListing(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // ─── 4. Equipment Moderation ────────────────────────────────────────────
    @GetMapping("/equipment")
    public ResponseEntity<List<EquipmentListing>> getAllEquipmentListings() {
        return ResponseEntity.ok(equipmentListingRepository.findAll());
    }

    @PutMapping("/equipment/{id}")
    public ResponseEntity<?> updateEquipmentListing(
            @PathVariable Long id,
            @RequestBody EquipmentListing listing,
            Authentication authentication) {
        EquipmentListing updated = equipmentListingService.updateEquipmentListing(id, listing, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/equipment/{id}/toggle-status")
    public ResponseEntity<?> toggleEquipmentListingStatus(
            @PathVariable Long id,
            Authentication authentication) {
        EquipmentListing updated = equipmentListingService.toggleStatus(id, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/equipment/{id}")
    public ResponseEntity<?> deleteEquipmentListing(
            @PathVariable Long id,
            Authentication authentication) {
        equipmentListingService.deleteEquipmentListing(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    // ─── 5. Experience Moderation ───────────────────────────────────────────
    @GetMapping("/experiences")
    public ResponseEntity<List<FarmerExperience>> getAllExperiences() {
        return ResponseEntity.ok(experienceService.getAllExperiences());
    }

    @PatchMapping("/experiences/{id}/verify")
    public ResponseEntity<?> verifyExperience(
            @PathVariable Long id,
            @RequestParam boolean verified) {
        FarmerExperience updated = experienceService.verifyExperience(id, verified);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/experiences/{id}")
    public ResponseEntity<?> deleteExperience(
            @PathVariable Long id,
            Authentication authentication) {
        experienceService.deleteExperience(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
