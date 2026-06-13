package com.rentmyvehicle.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubscriptionOrderRequest {
    @NotNull(message = "Plan ID is required")
    private Long planId;
}
