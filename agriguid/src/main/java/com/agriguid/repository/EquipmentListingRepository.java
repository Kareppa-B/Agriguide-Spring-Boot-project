package com.agriguid.repository;

import com.agriguid.model.EquipmentListing;
import com.agriguid.model.AvailabilityStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipmentListingRepository extends JpaRepository<EquipmentListing, Long> {
    List<EquipmentListing> findByRegion(String region);
    List<EquipmentListing> findByAvailability(AvailabilityStatus availability);
    List<EquipmentListing> findByRegionAndAvailability(String region, AvailabilityStatus availability);
    List<EquipmentListing> findByRegionAndAvailabilityAndIsActiveTrue(String region, AvailabilityStatus availability);
    List<EquipmentListing> findByIsActiveTrueOrderByListedDateDesc();
    List<EquipmentListing> findByRegionAndIsActiveTrueOrderByListedDateDesc(String region);
    List<EquipmentListing> findByEquipmentTypeContainingIgnoreCase(String equipmentType);
    List<EquipmentListing> findByEquipmentTypeContainingIgnoreCaseAndIsActiveTrue(String equipmentType);
    List<EquipmentListing> findByUserOrderByListedDateDesc(com.agriguid.model.User user);
}