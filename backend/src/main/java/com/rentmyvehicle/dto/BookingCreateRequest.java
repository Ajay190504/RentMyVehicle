package com.rentmyvehicle.dto;

import com.rentmyvehicle.model.RateType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingCreateRequest {
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Rate type is required")
    private RateType rateTypeUsed;

    @NotNull(message = "Start date-time is required")
    private LocalDateTime startDatetime;

    @NotNull(message = "End date-time is required")
    private LocalDateTime endDatetime;

    private Boolean operatorRequested = false;
}
