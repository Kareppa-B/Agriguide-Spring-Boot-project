package com.agriguid.service;

import com.agriguid.exception.ResourceNotFoundException;
import com.agriguid.model.FarmerVerificationStatus;
import com.agriguid.model.User;
import com.agriguid.model.UserRole;
import com.agriguid.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::sanitizeUser)
                .collect(Collectors.toList());
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id).map(this::sanitizeUser);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username).map(this::sanitizeUser);
    }

    public User getAuthenticatedUser(String username) {
        return userRepository.findByUsername(username)
                .map(this::sanitizeUser)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found: " + username));
    }

    public User updateOwnProfile(String username, User updates) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Permitted user updates only — never allow changing role, isVerifiedFarmer, or active status
        if (updates.getFullName() != null) user.setFullName(updates.getFullName());
        if (updates.getPhoneNumber() != null) user.setPhoneNumber(updates.getPhoneNumber());
        if (updates.getLocation() != null) user.setLocation(updates.getLocation());
        if (updates.getRegion() != null) user.setRegion(updates.getRegion());
        if (updates.getYearsOfExperience() != null) user.setYearsOfExperience(updates.getYearsOfExperience());
        if (updates.getSpecialization() != null) user.setSpecialization(updates.getSpecialization());

        return sanitizeUser(userRepository.save(user));
    }

    public User saveUser(User user) {
        user.setRegistrationDate(LocalDateTime.now());
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }
        if (user.getPassword() != null && !isBCryptHash(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return sanitizeUser(userRepository.save(user));
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (userDetails.getUsername() != null) user.setUsername(userDetails.getUsername());
        if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
        if (userDetails.getFullName() != null) user.setFullName(userDetails.getFullName());
        if (userDetails.getPhoneNumber() != null) user.setPhoneNumber(userDetails.getPhoneNumber());
        if (userDetails.getLocation() != null) user.setLocation(userDetails.getLocation());
        if (userDetails.getRegion() != null) user.setRegion(userDetails.getRegion());
        if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
        if (userDetails.getFarmerVerificationStatus() != null) {
            user.setFarmerVerificationStatus(userDetails.getFarmerVerificationStatus());
        } else if (userDetails.getIsVerifiedFarmer() != null) {
            user.setIsVerifiedFarmer(userDetails.getIsVerifiedFarmer());
        }
        if (userDetails.getYearsOfExperience() != null) user.setYearsOfExperience(userDetails.getYearsOfExperience());
        if (userDetails.getSpecialization() != null) user.setSpecialization(userDetails.getSpecialization());
        if (userDetails.getIsActive() != null) user.setIsActive(userDetails.getIsActive());

        if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()
                && !isBCryptHash(userDetails.getPassword())) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }

        return sanitizeUser(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public void deleteUserSafely(Long id, String currentAdminUsername) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        User currentAdmin = userRepository.findByUsername(currentAdminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        if (target.getId().equals(currentAdmin.getId())) {
            throw new IllegalStateException("Administrators cannot delete their own account.");
        }

        if (target.getRole() == UserRole.ADMIN) {
            long activeAdminCount = userRepository.findByRole(UserRole.ADMIN).stream()
                    .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                    .count();
            if (activeAdminCount <= 1) {
                throw new IllegalStateException("Cannot delete the last active administrator.");
            }
        }

        userRepository.delete(target);
    }

    public User toggleUserStatus(Long id, String currentAdminUsername) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        User currentAdmin = userRepository.findByUsername(currentAdminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        if (target.getId().equals(currentAdmin.getId())) {
            throw new IllegalStateException("Administrators cannot deactivate their own account.");
        }

        target.setIsActive(!Boolean.TRUE.equals(target.getIsActive()));
        return sanitizeUser(userRepository.save(target));
    }

    public List<User> getVerifiedFarmers() {
        return userRepository.findByIsVerifiedFarmerTrue().stream()
                .map(this::sanitizeUser)
                .collect(Collectors.toList());
    }

    public List<User> getFarmersForVerification(FarmerVerificationStatus statusFilter) {
        return userRepository.findByRole(UserRole.FARMER).stream()
                .filter(farmer -> {
                    if (statusFilter == null) return true;
                    return farmer.getFarmerVerificationStatus() == statusFilter;
                })
                .map(this::sanitizeUser)
                .collect(Collectors.toList());
    }

    public User verifyFarmer(Long userId, FarmerVerificationStatus status) {
        User farmer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with id: " + userId));

        if (farmer.getRole() != UserRole.FARMER) {
            throw new IllegalArgumentException("Target user is not a farmer");
        }

        farmer.setFarmerVerificationStatus(status);
        return sanitizeUser(userRepository.save(farmer));
    }

    public List<User> getUsersByRegion(String region) {
        return userRepository.findByRegion(region).stream()
                .map(this::sanitizeUser)
                .collect(Collectors.toList());
    }

    private User sanitizeUser(User user) {
        if (user == null) return null;
        user.setPassword(null);
        return user;
    }

    private boolean isBCryptHash(String password) {
        return password != null && (password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$"));
    }
}