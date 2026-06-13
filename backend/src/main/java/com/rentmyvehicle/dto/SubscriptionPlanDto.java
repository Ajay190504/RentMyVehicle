package com.rentmyvehicle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanDto {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer durationDays;
    private Integer maxVehicleListings;
    private Boolean isFeaturedListing;
    private String description;
}
