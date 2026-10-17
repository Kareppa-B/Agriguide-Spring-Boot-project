package com.agriguid.controller;

import com.agriguid.model.WorkerListing;
import com.agriguid.service.WorkerListingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "*")
public class WorkerListingController {

    private final WorkerListingService workerListingService;

    public WorkerListingController(WorkerListingService workerListingService) {
        this.workerListingService = workerListingService;
    }

    // ─── Public read endpoints ─────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<WorkerListing>> getAllWorkers() {
        return ResponseEntity.ok(workerListingService.getAllWorkerListings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerListing> getWorkerById(@PathVariable Long id) {
        return workerListingService.getWorkerListingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<List<WorkerListing>> getWorkersByRegion(@PathVariable String region) {
        return ResponseEntity.ok(workerListingService.getWorkersByRegion(region));
    }

    @GetMapping("/available/{region}")
    public ResponseEntity<List<WorkerListing>> getAvailableWorkers(@PathVariable String region) {
        return ResponseEntity.ok(workerListingService.getAvailableWorkers(region));
    }

    @GetMapping("/availability/{availability}")
    public ResponseEntity<List<WorkerListing>> getWorkersByAvailability(@PathVariable com.agriguid.model.AvailabilityStatus availability) {
        return ResponseEntity.ok(workerListingService.getWorkersByAvailability(availability));
    }

    @GetMapping("/search")
    public ResponseEntity<List<WorkerListing>> searchWorkers(@RequestParam String skill) {
        return ResponseEntity.ok(workerListingService.searchWorkersBySkill(skill));
    }

    // ─── Authenticated read: worker's own listings ────────────────────────────

    /**
     * Returns the authenticated worker's own listings.
     */
    @GetMapping("/my")
    public ResponseEntity<List<WorkerListing>> getMyListings(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(workerListingService.getMyListings(authentication.getName()));
    }

    /**
     * Returns the authenticated worker's own single profile listing.
     */
    @GetMapping("/me")
    public ResponseEntity<WorkerListing> getMyProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return workerListingService.getMyListing(authentication.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update the authenticated worker's profile.
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody WorkerListing listing,
                                             Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            WorkerListing updated = workerListingService.updateMyListing(listing, authentication.getName());
            return ResponseEntity.ok(updated);
        } catch (com.agriguid.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete the authenticated worker's profile.
     */
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteMyProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            workerListingService.deleteMyListing(authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (com.agriguid.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update the authenticated worker's availability.
     */
    @PatchMapping("/me/availability")
    public ResponseEntity<?> updateMyAvailability(@RequestParam com.agriguid.model.AvailabilityStatus availability,
                                                  Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            WorkerListing updated = workerListingService.updateMyAvailability(availability, authentication.getName());
            return ResponseEntity.ok(updated);
        } catch (com.agriguid.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Authenticated write endpoints ────────────────────────────────────────

    /**
     * Create a listing. Only authenticated WORKER users may call this.
     * The authenticated principal's username is used — client-supplied owner ID is ignored.
     */
    @PostMapping
    public ResponseEntity<?> createWorkerListing(@RequestBody WorkerListing listing,
                                                  Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            WorkerListing created = workerListingService.createListing(listing, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update a listing. Only the owning WORKER (or ADMIN) may call this.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateWorkerListing(@PathVariable Long id,
                                                  @RequestBody WorkerListing listing,
                                                  Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            WorkerListing updated = workerListingService.updateListing(id, listing, authentication.getName());
            return ResponseEntity.ok(updated);
        } catch (com.agriguid.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Deactivate (soft-delete) a listing. Preferred over hard delete.
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivateListing(@PathVariable Long id,
                                                Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            workerListingService.deactivateListing(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Listing deactivated successfully"));
        } catch (com.agriguid.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Activate a listing.
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<?> activateListing(@PathVariable Long id,
                                              Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            workerListingService.activateListing(id, authentication.getName());
            return ResponseEntity.ok(Map.of("message", "Listing activated successfully"));
        } catch (com.agriguid.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Hard delete — ownership verified.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkerListing(@PathVariable Long id,
                                                  Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            workerListingService.deleteListing(id, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (com.agriguid.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }
}
