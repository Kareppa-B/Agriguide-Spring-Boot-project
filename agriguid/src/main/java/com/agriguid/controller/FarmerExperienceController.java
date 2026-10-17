package com.agriguid.controller;

import com.agriguid.model.FarmerExperience;
import com.agriguid.service.FarmerExperienceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/experiences")
@CrossOrigin(origins = "*")
public class FarmerExperienceController {

    private final FarmerExperienceService experienceService;

    public FarmerExperienceController(FarmerExperienceService experienceService) {
        this.experienceService = experienceService;
    }

    // ─── Public read endpoints ─────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<FarmerExperience>> getAllExperiences() {
        return ResponseEntity.ok(experienceService.getAllExperiences());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmerExperience> getExperienceById(@PathVariable Long id) {
        return experienceService.getExperienceById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/crop/{cropId}")
    public ResponseEntity<List<FarmerExperience>> getExperiencesByCrop(@PathVariable Long cropId) {
        return ResponseEntity.ok(experienceService.getExperiencesByCropId(cropId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FarmerExperience>> getExperiencesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(experienceService.getExperiencesByUserId(userId));
    }

    @GetMapping("/top")
    public ResponseEntity<List<FarmerExperience>> getTopExperiences() {
        return ResponseEntity.ok(experienceService.getTopExperiences());
    }

    @GetMapping("/my")
    public ResponseEntity<List<FarmerExperience>> getMyExperiences(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(experienceService.getMyExperiences(authentication.getName()));
    }

    // ─── Authenticated write endpoints ────────────────────────────────────────

    @PostMapping
    public ResponseEntity<?> createExperience(@RequestBody FarmerExperience experience,
                                              Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            FarmerExperience created = experienceService.saveExperience(experience, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExperience(@PathVariable Long id,
                                              @RequestBody FarmerExperience experience,
                                              Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            FarmerExperience updated = experienceService.updateExperience(id, experience, authentication.getName());
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/helpful")
    public ResponseEntity<FarmerExperience> markAsHelpful(@PathVariable Long id) {
        return ResponseEntity.ok(experienceService.incrementHelpfulCount(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExperience(@PathVariable Long id,
                                             Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            experienceService.deleteExperience(id, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}