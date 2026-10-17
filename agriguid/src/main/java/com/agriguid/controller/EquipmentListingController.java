package com.agriguid.controller;

import com.agriguid.model.EquipmentListing;
import com.agriguid.service.EquipmentListingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin(origins = "*")
public class EquipmentListingController {

    private final EquipmentListingService equipmentListingService;

    public EquipmentListingController(EquipmentListingService equipmentListingService) {
        this.equipmentListingService = equipmentListingService;
    }

    // ─── Public read endpoints ─────────────────────────────────────────────────

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<EquipmentListing>> getAllEquipment() {
        return ResponseEntity.ok(equipmentListingService.getAllEquipmentListings());
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<EquipmentListing> getEquipmentById(@PathVariable Long id) {
        return equipmentListingService.getEquipmentListingById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/region/{region}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<EquipmentListing>> getEquipmentByRegion(@PathVariable String region) {
        return ResponseEntity.ok(equipmentListingService.getEquipmentByRegion(region));
    }

    @GetMapping(value = "/available/{region}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<EquipmentListing>> getAvailableEquipment(@PathVariable String region) {
        return ResponseEntity.ok(equipmentListingService.getAvailableEquipment(region));
    }

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<EquipmentListing>> searchEquipment(@RequestParam String type) {
        return ResponseEntity.ok(equipmentListingService.searchEquipmentByType(type));
    }

    // ─── Authenticated write endpoints ────────────────────────────────────────

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createEquipmentListing(@RequestBody EquipmentListing listing,
                                                     Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            EquipmentListing created = equipmentListingService.saveEquipmentListing(listing, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateEquipmentListing(@PathVariable Long id,
                                                    @RequestBody EquipmentListing listing,
                                                    Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            EquipmentListing updated = equipmentListingService.updateEquipmentListing(id, listing, authentication.getName());
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping(value = "/my", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<EquipmentListing>> getMyEquipment(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(equipmentListingService.getMyEquipmentListings(authentication.getName()));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<?> updateAvailability(@PathVariable Long id,
                                                @RequestParam com.agriguid.model.AvailabilityStatus availability,
                                                Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            EquipmentListing updated = equipmentListingService.updateAvailability(id, availability, authentication.getName());
            return ResponseEntity.ok(updated);
        } catch (com.agriguid.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id,
                                          Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            EquipmentListing updated = equipmentListingService.toggleStatus(id, authentication.getName());
            return ResponseEntity.ok(updated);
        } catch (com.agriguid.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEquipmentListing(@PathVariable Long id,
                                                    Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Authentication required"));
        }
        try {
            equipmentListingService.deleteEquipmentListing(id, authentication.getName());
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}