package com.rentmyvehicle.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "subscription_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "max_vehicle_listings", nullable = false)
    private Integer maxVehicleListings;

    @Builder.Default
    @Column(name = "vehicle_limit")
    private Integer vehicleLimit = -1;

    @Column(name = "is_featured_listing", nullable = false)
    private Boolean isFeaturedListing;

    @Column(columnDefinition = "TEXT")
    private String description;
}
