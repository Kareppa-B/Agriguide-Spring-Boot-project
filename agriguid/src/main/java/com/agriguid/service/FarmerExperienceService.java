package com.agriguid.service;

import com.agriguid.model.FarmerExperience;
import com.agriguid.model.User;
import com.agriguid.model.UserRole;
import com.agriguid.repository.FarmerExperienceRepository;
import com.agriguid.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FarmerExperienceService {

    @Autowired
    private FarmerExperienceRepository experienceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.agriguid.repository.CropRepository cropRepository;

    public List<FarmerExperience> getAllExperiences() {
        return experienceRepository.findAllByOrderByPostedDateDesc();
    }

    public Optional<FarmerExperience> getExperienceById(Long id) {
        return experienceRepository.findById(id);
    }

    public List<FarmerExperience> getExperiencesByCropId(Long cropId) {
        return experienceRepository.findByCropIdAndIsVerifiedTrueOrderByHelpfulCountDesc(cropId);
    }

    public List<FarmerExperience> getExperiencesByUserId(Long userId) {
        return experienceRepository.findByUserId(userId);
    }

    public List<FarmerExperience> getMyExperiences(String authenticatedUsername) {
        User user = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
        return experienceRepository.findByUserOrderByPostedDateDesc(user);
    }

    public FarmerExperience saveExperience(FarmerExperience experience, String authenticatedUsername) {
        User owner = resolveExperienceAuthor(authenticatedUsername);
        experience.setUser(owner);
        experience.setPostedDate(LocalDateTime.now());
        if (experience.getHelpfulCount() == null) {
            experience.setHelpfulCount(0);
        }
        // Admin posts are auto-verified; users posts require moderation/verification
        if (owner.getRole() == UserRole.ADMIN) {
            experience.setIsVerified(true);
        } else if (experience.getIsVerified() == null) {
            experience.setIsVerified(false);
        }

        // Link Crop if specified
        if (experience.getCrop() != null && experience.getCrop().getId() != null) {
            cropRepository.findById(experience.getCrop().getId()).ifPresent(experience::setCrop);
        }

        return experienceRepository.save(experience);
    }

    public FarmerExperience updateExperience(Long id, FarmerExperience expDetails, String authenticatedUsername) {
        FarmerExperience experience = experienceRepository.findById(id)
            .orElseThrow(() -> new com.agriguid.exception.ResourceNotFoundException("Experience not found with id: " + id));

        verifyOwnership(experience, authenticatedUsername);

        experience.setTitle(expDetails.getTitle());
        experience.setExperienceText(expDetails.getExperienceText());
        experience.setYearsGrowing(expDetails.getYearsGrowing());
        experience.setRegion(expDetails.getRegion());
        experience.setAverageYield(expDetails.getAverageYield());
        experience.setTipsAndTricks(expDetails.getTipsAndTricks());
        experience.setChallengesFaced(expDetails.getChallengesFaced());

        if (expDetails.getCrop() != null && expDetails.getCrop().getId() != null) {
            cropRepository.findById(expDetails.getCrop().getId()).ifPresent(experience::setCrop);
        }

        return experienceRepository.save(experience);
    }

    public FarmerExperience incrementHelpfulCount(Long id) {
        FarmerExperience experience = experienceRepository.findById(id)
            .orElseThrow(() -> new com.agriguid.exception.ResourceNotFoundException("Experience not found with id: " + id));

        int current = experience.getHelpfulCount() != null ? experience.getHelpfulCount() : 0;
        experience.setHelpfulCount(current + 1);
        return experienceRepository.save(experience);
    }

    public void deleteExperience(Long id, String authenticatedUsername) {
        FarmerExperience experience = experienceRepository.findById(id)
            .orElseThrow(() -> new com.agriguid.exception.ResourceNotFoundException("Experience not found with id: " + id));
        verifyOwnership(experience, authenticatedUsername);
        experienceRepository.delete(experience);
    }

    public List<FarmerExperience> getTopExperiences() {
        return experienceRepository.findByIsVerifiedTrueOrderByHelpfulCountDesc();
    }

    public FarmerExperience verifyExperience(Long id, boolean isVerified) {
        FarmerExperience experience = experienceRepository.findById(id)
            .orElseThrow(() -> new com.agriguid.exception.ResourceNotFoundException("Experience not found with id: " + id));
        experience.setIsVerified(isVerified);
        return experienceRepository.save(experience);
    }

    private User resolveExperienceAuthor(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
        if (user.getRole() != UserRole.FARMER && user.getRole() != UserRole.WORKER && user.getRole() != UserRole.ADMIN) {
            throw new SecurityException("Only FARMER, WORKER, or ADMIN users may create experiences");
        }
        return user;
    }

    private void verifyOwnership(FarmerExperience experience, String authenticatedUsername) {
        User authenticatedUser = userRepository.findByUsername(authenticatedUsername)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));

        if (authenticatedUser.getRole() == UserRole.ADMIN) {
            return;
        }

        if (experience.getUser() == null ||
                !experience.getUser().getUsername().equals(authenticatedUsername)) {
            throw new SecurityException("You are not authorized to modify this experience");
        }
    }
}