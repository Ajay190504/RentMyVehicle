package com.rentmyvehicle.controller;

import com.rentmyvehicle.dto.ApiResponse;
import com.rentmyvehicle.dto.SubscriptionPlanDto;
import com.rentmyvehicle.service.SubscriptionPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class SubscriptionPlanController {

    private final SubscriptionPlanService planService;

    public SubscriptionPlanController(SubscriptionPlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionPlanDto>>> getAllPlans() {
        List<SubscriptionPlanDto> plans = planService.getAllPlans();
        return ResponseEntity.ok(ApiResponse.success("Subscription plans retrieved successfully", plans));
    }
}
