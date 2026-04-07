package com.smartSure.authService.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartSure.authService.dto.client.CustomerProfileResponse;
import com.smartSure.authService.entity.User;
import com.smartSure.authService.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/user/internal")
@RequiredArgsConstructor
public class InternalAuthController {

    private final UserRepository userRepository;

    /**
     * Get user email by userId
     * Used by PolicyService
     */
    @GetMapping("/{userId}/email")
    public ResponseEntity<String> getUserEmail(@PathVariable Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(user.getEmail());
    }

    /**
     * Get full user profile
     * Used by PolicyService
     */
    @GetMapping("/{userId}/profile")
    public ResponseEntity<CustomerProfileResponse> getProfile(@PathVariable Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Build name safely — avoid "null" literal if firstName or lastName is missing
        String firstName = user.getFirstName();
        String lastName  = user.getLastName();
        String fullName;
        if (firstName != null && lastName != null) {
            fullName = firstName + " " + lastName;
        } else if (firstName != null) {
            fullName = firstName;
        } else if (lastName != null) {
            fullName = lastName;
        } else {
            fullName = "Customer";
        }

        CustomerProfileResponse response = CustomerProfileResponse.builder()
                .id(user.getUserId())
                .name(fullName)
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();

        return ResponseEntity.ok(response);
    }
}