package com.agriguid.repository;

import com.agriguid.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {
    List<Crop> findByCropNameContainingIgnoreCase(String cropName);
    List<Crop> findBySoilType(String soilType);
    List<Crop> findByClimateCondition(String climateCondition);
    List<Crop> findByCategory(String category);
    List<Crop> findBySoilTypeAndClimateCondition(String soilType, String climateCondition);
}