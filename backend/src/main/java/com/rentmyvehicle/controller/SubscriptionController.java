package com.rentmyvehicle.controller;

import com.rentmyvehicle.dto.ApiResponse;
import com.rentmyvehicle.dto.SubscriptionDto;
import com.rentmyvehicle.dto.SubscriptionOrderRequest;
import com.rentmyvehicle.dto.SubscriptionOrderResponse;
import com.rentmyvehicle.dto.SubscriptionVerificationRequest;
import com.rentmyvehicle.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<SubscriptionOrderResponse>> createOrder(
            @Valid @RequestBody SubscriptionOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        SubscriptionOrderResponse response = subscriptionService.createOrder(request.getPlanId(), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Payment order created successfully", response));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> verifyPayment(
            @Valid @RequestBody SubscriptionVerificationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        SubscriptionDto response = subscriptionService.verifyPayment(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Subscription activated successfully", response));
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> getActiveSubscription(
            @AuthenticationPrincipal UserDetails userDetails) {
        SubscriptionDto response = subscriptionService.getActiveSubscription(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Active subscription retrieved successfully", response));
    }
}
