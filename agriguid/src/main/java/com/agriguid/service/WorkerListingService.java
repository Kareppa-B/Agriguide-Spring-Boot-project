package com.agriguid.service;

import com.agriguid.exception.ResourceNotFoundException;
import com.agriguid.model.AvailabilityStatus;
import com.agriguid.model.User;
import com.agriguid.model.UserRole;
import com.agriguid.model.WorkerListing;
import com.agriguid.repository.UserRepository;
import com.agriguid.repository.WorkerListingRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WorkerListingService {

    private final WorkerListingRepository workerListingRepository;
    private final UserRepository userRepository;

    public WorkerListingService(WorkerListingRepository workerListingRepository,
                                 UserRepository userRepository) {
        this.workerListingRepository = workerListingRepository;
        this.userRepository = userRepository;
    }

    // ─── Public read operations ───────────────────────────────────────────────

    public List<WorkerListing> getAllWorkerListings() {
        return workerListingRepository.findByIsActiveTrueOrderByListedDateDesc();
    }

    public Optional<WorkerListing> getWorkerListingById(Long id) {
        return workerListingRepository.findById(id);
    }

    public List<WorkerListing> getWorkersByRegion(String region) {
        return workerListingRepository.findByRegionAndIsActiveTrueOrderByListedDateDesc(region);
    }

    public List<WorkerListing> getAvailableWorkers(String region) {
        return workerListingRepository.findByRegionAndAvailabilityAndIsActiveTrue(region, AvailabilityStatus.AVAILABLE);
    }

    public List<WorkerListing> getWorkersByAvailability(AvailabilityStatus availability) {
        return workerListingRepository.findByAvailabilityAndIsActiveTrue(availability);
    }

    public List<WorkerListing> searchWorkersBySkill(String skillSet) {
        return workerListingRepository.findBySkillSetContainingIgnoreCaseAndIsActiveTrue(skillSet);
    }

    // ─── Worker-owned write operations ────────────────────────────────────────

    /**
     * Create a new listing for the authenticated worker.
     * The username comes from Spring Security — never trust client-supplied owner IDs.
     */
    public WorkerListing createListing(WorkerListing listing, String authenticatedUsername) {
        User owner = resolveWorkerUser(authenticatedUsername);

        if (workerListingRepository.findByUser(owner).isPresent()) {
            throw new IllegalStateException("You already have an existing worker listing. Each worker account may only create one listing.");
        }

        validateListingFields(listing);

        listing.setUser(owner);
        listing.setListedDate(LocalDateTime.now());
        listing.setIsActive(true);

        return workerListingRepository.save(listing);
    }

    /**
     * Update an existing listing — only the owner or admin may do this.
     */
    public WorkerListing updateListing(Long id, WorkerListing details, String authenticatedUsername) {
        WorkerListing existing = workerListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker listing not found with id: " + id));

        verifyOwnership(existing, authenticatedUsername);
        validateListingFields(details);

        // Update only mutable user-controlled fields; preserve owner and listedDate
        existing.setWorkerName(details.getWorkerName());
        existing.setPhoneNumber(details.getPhoneNumber());
        existing.setSkillSet(details.getSkillSet());
        existing.setExperienceYears(details.getExperienceYears());
        existing.setRegion(details.getRegion());
        existing.setSpecificLocation(details.getSpecificLocation());
        existing.setAvailability(details.getAvailability());
        existing.setDailyRate(details.getDailyRate());
        existing.setHourlyRate(details.getHourlyRate());
        existing.setDescription(details.getDescription());
        if (details.getIsActive() != null) {
            existing.setIsActive(details.getIsActive());
        }

        return workerListingRepository.save(existing);
    }

    /**
     * Deactivate (soft-delete) a listing — ownership verified.
     */
    public void deactivateListing(Long id, String authenticatedUsername) {
        WorkerListing existing = workerListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker listing not found with id: " + id));

        verifyOwnership(existing, authenticatedUsername);
        existing.setIsActive(false);
        workerListingRepository.save(existing);
    }

    /**
     * Activate a previously deactivated listing — ownership verified.
     */
    public void activateListing(Long id, String authenticatedUsername) {
        WorkerListing existing = workerListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker listing not found with id: " + id));

        verifyOwnership(existing, authenticatedUsername);
        existing.setIsActive(true);
        workerListingRepository.save(existing);
    }

    /**
     * Hard-delete — ownership verified. Prefer deactivate in most cases.
     */
    public void deleteListing(Long id, String authenticatedUsername) {
        WorkerListing existing = workerListingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker listing not found with id: " + id));

        verifyOwnership(existing, authenticatedUsername);
        workerListingRepository.delete(existing);
    }

    /**
     * Get all listings belonging to the authenticated worker.
     */
    public List<WorkerListing> getMyListings(String authenticatedUsername) {
        User user = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return workerListingRepository.findByUserOrderByListedDateDesc(user);
    }

    /**
     * Get the single listing belonging to the authenticated worker.
     */
    public Optional<WorkerListing> getMyListing(String authenticatedUsername) {
        User user = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return workerListingRepository.findByUser(user);
    }

    /**
     * Update the authenticated worker's own listing.
     */
    public WorkerListing updateMyListing(WorkerListing details, String authenticatedUsername) {
        User owner = resolveWorkerUser(authenticatedUsername);
        WorkerListing existing = workerListingRepository.findByUser(owner)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found. Please create a profile first."));
        return updateListing(existing.getId(), details, authenticatedUsername);
    }

    /**
     * Delete the authenticated worker's own listing.
     */
    public void deleteMyListing(String authenticatedUsername) {
        User owner = resolveWorkerUser(authenticatedUsername);
        WorkerListing existing = workerListingRepository.findByUser(owner)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found."));
        deleteListing(existing.getId(), authenticatedUsername);
    }

    /**
     * Update availability for the authenticated worker's listing.
     */
    public WorkerListing updateMyAvailability(AvailabilityStatus availability, String authenticatedUsername) {
        if (availability == null) {
            throw new IllegalArgumentException("Availability status is required");
        }
        User owner = resolveWorkerUser(authenticatedUsername);
        WorkerListing existing = workerListingRepository.findByUser(owner)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found."));
        existing.setAvailability(availability);
        return workerListingRepository.save(existing);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private User resolveWorkerUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
        if (user.getRole() != UserRole.WORKER) {
            throw new SecurityException("Only users with the WORKER role may create worker listings");
        }
        return user;
    }

    private void verifyOwnership(WorkerListing listing, String authenticatedUsername) {
        User authenticatedUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));

        // Admins may manage any listing
        if (authenticatedUser.getRole() == UserRole.ADMIN) {
            return;
        }

        if (listing.getUser() == null ||
                !listing.getUser().getUsername().equals(authenticatedUsername)) {
            throw new SecurityException("You are not authorized to modify this listing");
        }
    }

    private void validateListingFields(WorkerListing listing) {
        if (listing.getWorkerName() == null || listing.getWorkerName().isBlank()) {
            throw new IllegalArgumentException("Worker name is required");
        }
        if (listing.getPhoneNumber() == null || listing.getPhoneNumber().isBlank()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        if (listing.getSkillSet() == null || listing.getSkillSet().isBlank()) {
            throw new IllegalArgumentException("Skill set is required");
        }
        if (listing.getRegion() == null || listing.getRegion().isBlank()) {
            throw new IllegalArgumentException("Region is required");
        }
        if (listing.getExperienceYears() == null || listing.getExperienceYears() < 0) {
            throw new IllegalArgumentException("Experience years must be 0 or greater");
        }
        if (listing.getDailyRate() != null && listing.getDailyRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Daily rate must be non-negative");
        }
        if (listing.getHourlyRate() != null && listing.getHourlyRate().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Hourly rate must be non-negative");
        }
        if (listing.getAvailability() == null) {
            throw new IllegalArgumentException("Availability status is required");
        }
    }
}