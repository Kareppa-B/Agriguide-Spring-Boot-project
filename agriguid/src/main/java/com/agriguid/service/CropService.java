package com.agriguid.service;

import com.agriguid.model.Crop;
import com.agriguid.repository.CropRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CropService {
    
    @Autowired
    private CropRepository cropRepository;
    
    public List<Crop> getAllCrops() {
        return cropRepository.findAll();
    }
    
    public Optional<Crop> getCropById(Long id) {
        return cropRepository.findById(id);
    }
    
    public Crop saveCrop(Crop crop) {
        return cropRepository.save(crop);
    }
    
    public Crop updateCrop(Long id, Crop cropDetails) {
        Crop crop = cropRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Crop not found with id: " + id));
        
        crop.setCropName(cropDetails.getCropName());
        crop.setScientificName(cropDetails.getScientificName());
        crop.setCategory(cropDetails.getCategory());
        crop.setDescription(cropDetails.getDescription());
        crop.setSoilType(cropDetails.getSoilType());
        crop.setClimateCondition(cropDetails.getClimateCondition());
        crop.setMinTemperature(cropDetails.getMinTemperature());
        crop.setMaxTemperature(cropDetails.getMaxTemperature());
        crop.setRainfallRequirement(cropDetails.getRainfallRequirement());
        crop.setGrowingPeriodDays(cropDetails.getGrowingPeriodDays());
        crop.setCultivationSteps(cropDetails.getCultivationSteps());
        crop.setEstimatedInvestment(cropDetails.getEstimatedInvestment());
        crop.setExpectedYieldPerAcre(cropDetails.getExpectedYieldPerAcre());
        crop.setExpectedRevenuePerAcre(cropDetails.getExpectedRevenuePerAcre());
        crop.setPesticidesRecommended(cropDetails.getPesticidesRecommended());
        crop.setFertilizersRecommended(cropDetails.getFertilizersRecommended());
        crop.setIrrigationRequirement(cropDetails.getIrrigationRequirement());
        crop.setHarvestingSeason(cropDetails.getHarvestingSeason());
        
        return cropRepository.save(crop);
    }
    
    @Autowired
    private com.agriguid.repository.FarmerExperienceRepository experienceRepository;

    public void deleteCrop(Long id) {
        Crop crop = cropRepository.findById(id)
            .orElseThrow(() -> new com.agriguid.exception.ResourceNotFoundException("Crop not found with id: " + id));

        int experienceCount = experienceRepository.findByCropId(id).size();
        if (experienceCount > 0) {
            throw new IllegalStateException("Cannot delete crop '" + crop.getCropName() + "' because " + experienceCount + " existing experience post(s) reference it.");
        }

        cropRepository.delete(crop);
    }
    
    public List<Crop> searchCropsByName(String name) {
        return cropRepository.findByCropNameContainingIgnoreCase(name);
    }
    
    public List<Crop> getCropsBySoilType(String soilType) {
        return cropRepository.findBySoilType(soilType);
    }
    
    public List<Crop> getCropsByClimate(String climate) {
        return cropRepository.findByClimateCondition(climate);
    }
    
    public List<Crop> getCropsBySoilAndClimate(String soilType, String climate) {
        return cropRepository.findBySoilTypeAndClimateCondition(soilType, climate);
    }
}