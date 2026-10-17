package com.agriguid.repository;

import com.agriguid.model.AvailabilityStatus;
import com.agriguid.model.User;
import com.agriguid.model.WorkerListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerListingRepository extends JpaRepository<WorkerListing, Long> {

    // Public search — active listings only
    List<WorkerListing> findByIsActiveTrueOrderByListedDateDesc();
    List<WorkerListing> findByRegionAndIsActiveTrueOrderByListedDateDesc(String region);
    List<WorkerListing> findBySkillSetContainingIgnoreCaseAndIsActiveTrue(String skillSet);

    // Availability — active only
    List<WorkerListing> findByRegionAndAvailabilityAndIsActiveTrue(String region, AvailabilityStatus availability);
    List<WorkerListing> findByAvailabilityAndIsActiveTrue(AvailabilityStatus availability);

    // Keep original method for backward compat
    List<WorkerListing> findByRegionAndAvailability(String region, AvailabilityStatus availability);

    // Worker's own listings (all and active-only)
    List<WorkerListing> findByUserOrderByListedDateDesc(User user);
    List<WorkerListing> findByUserAndIsActiveTrueOrderByListedDateDesc(User user);
    Optional<WorkerListing> findByUser(User user);
    
    @Query("SELECT w FROM WorkerListing w WHERE w.user.id = :userId")
    Optional<WorkerListing> findByUserId(@Param("userId") Long userId);

    boolean existsByUser(User user);

    // Legacy — kept for compatibility
    List<WorkerListing> findByRegion(String region);
    List<WorkerListing> findByAvailability(AvailabilityStatus availability);
}