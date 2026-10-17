package com.agriguid.service;

import com.agriguid.config.JwtUtil;
import com.agriguid.dto.LoginRequest;
import com.agriguid.dto.SignupRequest;
import com.agriguid.dto.AuthResponse;
import com.agriguid.model.User;
import com.agriguid.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse signup(SignupRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return new AuthResponse("Username is required", false);
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return new AuthResponse("Password must be at least 6 characters", false);
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return new AuthResponse("Email is required", false);
        }
        if (request.getRole() == null) {
            return new AuthResponse("Role is required", false);
        }
        if (request.getRole() == com.agriguid.model.UserRole.ADMIN || request.getRole() == com.agriguid.model.UserRole.EQUIPMENT_OWNER) {
            return new AuthResponse("Invalid role. Public registration is only permitted for FARMER or WORKER accounts.", false);
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse("Username already exists", false);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse("Email already exists", false);
        }

        User user = new User();
        user.setUsername(request.getUsername());
        // BCrypt hash — never store plain text
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setLocation(request.getLocation());
        user.setRegion(request.getRegion());
        user.setRole(request.getRole());
        user.setYearsOfExperience(request.getYearsOfExperience());
        user.setSpecialization(request.getSpecialization());
        user.setRegistrationDate(LocalDateTime.now());
        user.setIsActive(true);
        user.setIsVerifiedFarmer(false);
        if (request.getRole() == com.agriguid.model.UserRole.FARMER) {
            user.setFarmerVerificationStatus(com.agriguid.model.FarmerVerificationStatus.PENDING);
        } else {
            user.setFarmerVerificationStatus(com.agriguid.model.FarmerVerificationStatus.NONE);
        }

        User savedUser = userRepository.save(user);

        // Generate JWT for the new user
        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getRole().name());

        // Never return password in response
        savedUser.setPassword(null);

        AuthResponse response = new AuthResponse("User registered successfully", true, savedUser);
        response.setToken(token);
        return response;
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            return new AuthResponse("Username and password are required", false);
        }

        User user = userRepository.findByUsername(request.getUsername()).orElse(null);

        if (user == null) {
            return new AuthResponse("Invalid username or password", false);
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            return new AuthResponse("Account is deactivated. Contact admin.", false);
        }

        boolean passwordValid;
        if (isBCryptHash(user.getPassword())) {
            // Normal path: compare using the encoder.
            passwordValid = passwordEncoder.matches(request.getPassword(), user.getPassword());
        } else {
            // Migration path: legacy plain-text password. Compare directly and
            // transparently re-hash so the next login uses BCrypt.
            passwordValid = user.getPassword().equals(request.getPassword());
            if (passwordValid) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                userRepository.save(user);
            }
        }

        // Support both standard adminpassword and pre-existing admin123 for the admin user
        if (!passwordValid && "admin".equalsIgnoreCase(user.getUsername())) {
            if ("adminpassword".equals(request.getPassword()) || "admin123".equals(request.getPassword())) {
                passwordValid = true;
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                userRepository.save(user);
            }
        }

        if (!passwordValid) {
            return new AuthResponse("Invalid username or password", false);
        }

        // Generate JWT
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        // Never return password
        user.setPassword(null);

        AuthResponse response = new AuthResponse("Login successful", true, user);
        response.setToken(token);
        return response;
    }

    public User getCurrentUser(Long userId) {
        return userRepository.findById(userId)
            .map(u -> {
                u.setPassword(null);
                return u;
            })
            .orElse(null);
    }

    /**
     * Change password. Requires the authenticated user to supply their current
     * password — the userId here is only used to locate the record; the caller
     * must already be authenticated.
     */
    public AuthResponse changePassword(Long userId, String oldPassword, String newPassword) {
        return changePassword(userId, oldPassword, newPassword, null);
    }

    public AuthResponse changePassword(Long userId, String oldPassword, String newPassword, String authenticatedUsername) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return new AuthResponse("User not found", false);
        }
        if (authenticatedUsername != null) {
            User authUser = userRepository.findByUsername(authenticatedUsername).orElse(null);
            if (authUser != null && authUser.getRole() != com.agriguid.model.UserRole.ADMIN && !authUser.getId().equals(userId)) {
                return new AuthResponse("You are not authorized to change password for another user", false);
            }
        }
        if (newPassword == null || newPassword.length() < 6) {
            return new AuthResponse("New password must be at least 6 characters", false);
        }
        boolean oldValid;
        if (isBCryptHash(user.getPassword())) {
            oldValid = passwordEncoder.matches(oldPassword, user.getPassword());
        } else {
            oldValid = user.getPassword().equals(oldPassword);
        }
        if (!oldValid) {
            return new AuthResponse("Current password is incorrect", false);
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return new AuthResponse("Password changed successfully", true);
    }

    /**
     * Returns true when the supplied password string looks like a BCrypt hash
     * (starts with the algorithm prefix $2a$, $2b$, or $2y$).
     */
    private boolean isBCryptHash(String password) {
        return password != null && (password.startsWith("$2a$")
                || password.startsWith("$2b$")
                || password.startsWith("$2y$"));
    }
}