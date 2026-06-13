package com.rentmyvehicle.dto;

import com.rentmyvehicle.model.VehicleCategory;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class VehicleCreateRequest {
    @NotNull(message = "Category is required")
    private VehicleCategory category;

    @NotBlank(message = "Subcategory is required")
    private String subcategory;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Location city is required")
    private String locationCity;

    private BigDecimal hourlyRate;
    private BigDecimal dailyRate;
    private BigDecimal monthlyRate;

    private Boolean operatorAvailable = false;

    @Valid
    private List<VehicleSpecificationDto> specifications = new ArrayList<>();
}
