package com.agriguid.controller;

import com.agriguid.dto.LoginRequest;
import com.agriguid.dto.SignupRequest;
import com.agriguid.dto.AuthResponse;
import com.agriguid.model.User;
import com.agriguid.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<User> getCurrentUser(@PathVariable Long userId) {
        User user = authService.getCurrentUser(userId);
        
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<AuthResponse> changePassword(
            @RequestParam Long userId,
            @RequestParam String oldPassword,
            @RequestParam String newPassword,
            org.springframework.security.core.Authentication authentication) {
        
        String authUsername = authentication != null ? authentication.getName() : null;
        AuthResponse response = authService.changePassword(userId, oldPassword, newPassword, authUsername);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        // In a stateless REST API, logout is handled on the client side
        // by removing the stored user data and token
        return ResponseEntity.ok(new AuthResponse("Logged out successfully", true));
    }
}