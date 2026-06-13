package com.rentmyvehicle.dto;

import com.rentmyvehicle.model.VehicleCategory;
import com.rentmyvehicle.model.VehicleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private VehicleCategory category;
    private String subcategory;
    private String title;
    private String description;
    private String locationCity;
    private BigDecimal hourlyRate;
    private BigDecimal dailyRate;
    private BigDecimal monthlyRate;
    private Boolean operatorAvailable;
    private VehicleStatus status;
    private LocalDateTime createdAt;
    private List<VehicleSpecificationDto> specifications;
    private List<VehicleImageDto> images;
    private List<BookingIntervalDto> activeBookings;
}
