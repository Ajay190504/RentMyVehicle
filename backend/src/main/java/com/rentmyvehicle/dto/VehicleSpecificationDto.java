package com.rentmyvehicle.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleSpecificationDto {
    @NotBlank(message = "Specification key is required")
    private String specKey;

    @NotBlank(message = "Specification value is required")
    private String specValue;
}
