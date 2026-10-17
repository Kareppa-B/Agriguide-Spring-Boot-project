
package com.agriguid.model;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "crops")
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String cropName;
    private String scientificName;
    private String category;

    @Column(length = 2000)
    private String description;

    private String soilType;
    private String climateCondition;
    private Double minTemperature;
    private Double maxTemperature;
    private String rainfallRequirement;
    private Integer growingPeriodDays;

    @Column(length = 3000)
    private String cultivationSteps;

    private BigDecimal estimatedInvestment;
    private BigDecimal expectedYieldPerAcre;
    private BigDecimal expectedRevenuePerAcre;

    @Column(length = 2000)
    private String pesticidesRecommended;

    @Column(length = 2000)
    private String fertilizersRecommended;

    @Column(length = 2000)
    private String irrigationRequirement;

    private String harvestingSeason;

    @JsonIgnore
    @OneToMany(mappedBy = "crop")
    private List<FarmerExperience> farmerExperiences;

    // Constructors
    public Crop() {}

    public Crop(String cropName, String soilType,
                String climateCondition) {
        this.cropName = cropName;
        this.soilType = soilType;
        this.climateCondition = climateCondition;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getScientificName() {
        return scientificName;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSoilType() {
        return soilType;
    }

    public void setSoilType(String soilType) {
        this.soilType = soilType;
    }

    public String getClimateCondition() {
        return climateCondition;
    }

    public void setClimateCondition(String climateCondition) {
        this.climateCondition = climateCondition;
    }

    public Double getMinTemperature() {
        return minTemperature;
    }

    public void setMinTemperature(Double minTemperature) {
        this.minTemperature = minTemperature;
    }

    public Double getMaxTemperature() {
        return maxTemperature;
    }

    public void setMaxTemperature(Double maxTemperature) {
        this.maxTemperature = maxTemperature;
    }

    public String getRainfallRequirement() {
        return rainfallRequirement;
    }

    public void setRainfallRequirement(String rainfallRequirement) {
        this.rainfallRequirement = rainfallRequirement;
    }

    public Integer getGrowingPeriodDays() {
        return growingPeriodDays;
    }

    public void setGrowingPeriodDays(Integer growingPeriodDays) {
        this.growingPeriodDays = growingPeriodDays;
    }

    public String getCultivationSteps() {
        return cultivationSteps;
    }

    public void setCultivationSteps(String cultivationSteps) {
        this.cultivationSteps = cultivationSteps;
    }

    public BigDecimal getEstimatedInvestment() {
        return estimatedInvestment;
    }

    public void setEstimatedInvestment(BigDecimal estimatedInvestment) {
        this.estimatedInvestment = estimatedInvestment;
    }

    public BigDecimal getExpectedYieldPerAcre() {
        return expectedYieldPerAcre;
    }

    public void setExpectedYieldPerAcre(BigDecimal expectedYieldPerAcre) {
        this.expectedYieldPerAcre = expectedYieldPerAcre;
    }

    public BigDecimal getExpectedRevenuePerAcre() {
        return expectedRevenuePerAcre;
    }

    public void setExpectedRevenuePerAcre(BigDecimal expectedRevenuePerAcre) {
        this.expectedRevenuePerAcre = expectedRevenuePerAcre;
    }

    public String getPesticidesRecommended() {
        return pesticidesRecommended;
    }

    public void setPesticidesRecommended(String pesticidesRecommended) {
        this.pesticidesRecommended = pesticidesRecommended;
    }

    public String getFertilizersRecommended() {
        return fertilizersRecommended;
    }

    public void setFertilizersRecommended(String fertilizersRecommended) {
        this.fertilizersRecommended = fertilizersRecommended;
    }

    public String getIrrigationRequirement() {
        return irrigationRequirement;
    }

    public void setIrrigationRequirement(String irrigationRequirement) {
        this.irrigationRequirement = irrigationRequirement;
    }

    public String getHarvestingSeason() {
        return harvestingSeason;
    }

    public void setHarvestingSeason(String harvestingSeason) {
        this.harvestingSeason = harvestingSeason;
    }

    public List<FarmerExperience> getFarmerExperiences() {
        return farmerExperiences;
    }

    public void setFarmerExperiences(
            List<FarmerExperience> farmerExperiences) {
        this.farmerExperiences = farmerExperiences;
    }
}
