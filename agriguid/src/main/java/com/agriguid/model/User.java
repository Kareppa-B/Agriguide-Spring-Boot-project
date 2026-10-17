package com.agriguid.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@JsonIgnoreProperties({"password", "workerListings", "equipmentListings", "experiences"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String password;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String location;
    private String region;
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    private Boolean isVerifiedFarmer;
    
    @Enumerated(EnumType.STRING)
    private FarmerVerificationStatus farmerVerificationStatus;
    
    private Integer yearsOfExperience;
    
    @Column(length = 1000)
    private String specialization;
    
    private LocalDateTime registrationDate;
    private Boolean isActive;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<FarmerExperience> experiences;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<WorkerListing> workerListings;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<EquipmentListing> equipmentListings;

    public User() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @JsonIgnore
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public Boolean getIsVerifiedFarmer() {
        return isVerifiedFarmer;
    }

    public void setIsVerifiedFarmer(Boolean isVerifiedFarmer) {
        this.isVerifiedFarmer = isVerifiedFarmer;
        if (Boolean.TRUE.equals(isVerifiedFarmer)) {
            this.farmerVerificationStatus = FarmerVerificationStatus.APPROVED;
        } else if (this.farmerVerificationStatus == null && this.role == UserRole.FARMER) {
            this.farmerVerificationStatus = FarmerVerificationStatus.PENDING;
        }
    }

    public FarmerVerificationStatus getFarmerVerificationStatus() {
        if (farmerVerificationStatus == null) {
            if (Boolean.TRUE.equals(isVerifiedFarmer)) {
                return FarmerVerificationStatus.APPROVED;
            } else if (role == UserRole.FARMER) {
                return FarmerVerificationStatus.PENDING;
            } else {
                return FarmerVerificationStatus.NONE;
            }
        }
        return farmerVerificationStatus;
    }

    public void setFarmerVerificationStatus(FarmerVerificationStatus farmerVerificationStatus) {
        this.farmerVerificationStatus = farmerVerificationStatus;
        this.isVerifiedFarmer = (farmerVerificationStatus == FarmerVerificationStatus.APPROVED);
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public List<FarmerExperience> getExperiences() {
        return experiences;
    }

    public void setExperiences(List<FarmerExperience> experiences) {
        this.experiences = experiences;
    }

    public List<WorkerListing> getWorkerListings() {
        return workerListings;
    }

    public void setWorkerListings(List<WorkerListing> workerListings) {
        this.workerListings = workerListings;
    }

    public List<EquipmentListing> getEquipmentListings() {
        return equipmentListings;
    }

    public void setEquipmentListings(List<EquipmentListing> equipmentListings) {
        this.equipmentListings = equipmentListings;
    }
}
