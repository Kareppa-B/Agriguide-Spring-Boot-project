package com.agriguid.repository;

import com.agriguid.model.FarmerExperience;
import com.agriguid.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FarmerExperienceRepository extends JpaRepository<FarmerExperience, Long> {

    @Query("SELECT e FROM FarmerExperience e WHERE e.crop.id = :cropId")
    List<FarmerExperience> findByCropId(@Param("cropId") Long cropId);

    @Query("SELECT e FROM FarmerExperience e WHERE e.user.id = :userId")
    List<FarmerExperience> findByUserId(@Param("userId") Long userId);

    List<FarmerExperience> findByUserOrderByPostedDateDesc(User user);

    List<FarmerExperience> findAllByOrderByPostedDateDesc();

    List<FarmerExperience> findByIsVerifiedTrueOrderByHelpfulCountDesc();

    @Query("SELECT e FROM FarmerExperience e WHERE e.crop.id = :cropId AND e.isVerified = true ORDER BY e.helpfulCount DESC")
    List<FarmerExperience> findByCropIdAndIsVerifiedTrueOrderByHelpfulCountDesc(@Param("cropId") Long cropId);

    List<FarmerExperience> findByRegion(String region);
}