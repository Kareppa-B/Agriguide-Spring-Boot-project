package com.agriguid.service;

import com.agriguid.model.EquipmentListing;
import com.agriguid.model.AvailabilityStatus;
import com.agriguid.model.User;
import com.agriguid.model.UserRole;
import com.agriguid.repository.EquipmentListingRepository;
import com.agriguid.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EquipmentListingService {

    @Autowired
    private EquipmentListingRepository equipmentListingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<EquipmentListing> getAllEquipmentListings() {
        return equipmentListingRepository.findByIsActiveTrueOrderByListedDateDesc();
    }

    public Optional<EquipmentListing> getEquipmentListingById(Long id) {
        return equipmentListingRepository.findById(id);
    }

    public List<EquipmentListing> getEquipmentByRegion(String region) {
        return equipmentListingRepository.findByRegionAndIsActiveTrueOrderByListedDateDesc(region);
    }

    public List<EquipmentListing> getAvailableEquipment(String region) {
        return equipmentListingRepository.findByRegionAndAvailabilityAndIsActiveTrue(region, AvailabilityStatus.AVAILABLE);
    }

    public List<EquipmentListing> getMyEquipmentListings(String authenticatedUsername) {
        User user = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
        return equipmentListingRepository.findByUserOrderByListedDateDesc(user);
    }

    public EquipmentListing saveEquipmentListing(EquipmentListing listing, String authenticatedUsername) {
        User owner = resolveEquipmentOwner(authenticatedUsername);
        listing.setUser(owner);
        listing.setListedDate(LocalDateTime.now());
        listing.setIsActive(true);
        return equipmentListingRepository.save(listing);
    }

    public EquipmentListing updateEquipmentListing(Long id, EquipmentListing listingDetails, String authenticatedUsername) {
        EquipmentListing listing = equipmentListingRepository.findById(id)
            .orElseThrow(() -> new com.agriguid.exception.ResourceNotFoundException("Equipment listing not found with id: " + id));

        verifyOwnership(listing, authenticatedUsername);

        listing.setEquipmentName(listingDetails.getEquipmentName());
        listing.setEquipmentType(listingDetails.getEquipmentType());
        listing.setBrand(listingDetails.getBrand());
        listing.setModel(listingDetails.getModel());
        listing.setDescription(listingDetails.getDescription());
        listing.setRegion(listingDetails.getRegion());
        listing.setSpecificLocation(listingDetails.getSpecificLocation());
        listing.setPhoneNumber(listingDetails.getPhoneNumber());
        listing.setAvailability(listingDetails.getAvailability());
        listing.setDailyRentalCost(listingDetails.getDailyRentalCost());
        listing.setHourlyRentalCost(listingDetails.getHourlyRentalCost());
        listing.setCondition(listingDetails.getCondition());
        if (listingDetails.getIsActive() != null) {
            listing.setIsActive(listingDetails.getIsActive());
        }

        return equipmentListingRepository.save(listing);
    }

    public EquipmentListing updateAvailability(Long id, AvailabilityStatus availability, String authenticatedUsername) {
        EquipmentListing listing = equipmentListingRepository.findById(id)
            .orElseThrow(() -> new com.agriguid.exception.ResourceNotFoundException("Equipment listing not found with id: " + id));
        verifyOwnership(listing, authenticatedUsername);
        listing.setAvailability(availability);
        return equipmentListingRepository.save(listing);
    }

    public EquipmentListing toggleStatus(Long id, String authenticatedUsername) {
        EquipmentListing listing = equipmentListingRepository.findById(id)
            .orElseThrow(() -> new com.agriguid.exception.ResourceNotFoundException("Equipment listing not found with id: " + id));
        verifyOwnership(listing, authenticatedUsername);
        listing.setIsActive(!Boolean.TRUE.equals(listing.getIsActive()));
        return equipmentListingRepository.save(listing);
    }

    public void deleteEquipmentListing(Long id, String authenticatedUsername) {
        EquipmentListing listing = equipmentListingRepository.findById(id)
            .orElseThrow(() -> new com.agriguid.exception.ResourceNotFoundException("Equipment listing not found with id: " + id));
        verifyOwnership(listing, authenticatedUsername);
        equipmentListingRepository.delete(listing);
    }

    public List<EquipmentListing> searchEquipmentByType(String equipmentType) {
        return equipmentListingRepository.findByEquipmentTypeContainingIgnoreCaseAndIsActiveTrue(equipmentType);
    }

    private User resolveEquipmentOwner(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
        // Allow FARMER, WORKER, and ADMIN to create equipment listings!
        if (user.getRole() != UserRole.FARMER && user.getRole() != UserRole.WORKER && user.getRole() != UserRole.ADMIN) {
            throw new SecurityException("Only FARMER, WORKER, or ADMIN users may create equipment listings");
        }
        return user;
    }

    private void verifyOwnership(EquipmentListing listing, String authenticatedUsername) {
        User authenticatedUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));

        if (authenticatedUser.getRole() == UserRole.ADMIN) {
            return;
        }

        if (listing.getUser() == null ||
                !listing.getUser().getUsername().equals(authenticatedUsername)) {
            throw new SecurityException("You are not authorized to modify this equipment listing");
        }
    }
}