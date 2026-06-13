package com.rentmyvehicle.controller;

import com.rentmyvehicle.dto.ApiResponse;
import com.rentmyvehicle.dto.AuthResponse;
import com.rentmyvehicle.dto.LoginRequest;
import com.rentmyvehicle.dto.RegisterRequest;
import com.rentmyvehicle.dto.UserDto;
import com.rentmyvehicle.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        UserDto response = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User details fetched successfully", response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @RequestBody java.util.Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        String name = request.get("name");
        String phone = request.get("phone");
        UserDto updatedUser = authService.updateProfile(userDetails.getUsername(), name, phone);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updatedUser));
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        if (email == null || !authService.checkEmailExists(email)) {
            return ResponseEntity.status(404).body(ApiResponse.error("User not found with email: " + email));
        }
        authService.sendForgotPasswordEmail(email);
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent successfully. You can now reset your password.", "SUCCESS"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        if (email == null || newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid input. Password must be at least 6 characters."));
        }
        authService.resetPassword(email, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", "SUCCESS"));
    }
}
