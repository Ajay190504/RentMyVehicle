package com.rentmyvehicle.dto;

import com.rentmyvehicle.model.BookingStatus;
import com.rentmyvehicle.model.RateType;
import com.rentmyvehicle.model.VehicleCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private Long id;
    private Long vehicleId;
    private String vehicleTitle;
    private String vehicleImageUrl;
    private VehicleCategory vehicleCategory;
    private Long customerId;
    private String customerName;
    private RateType rateTypeUsed;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private Boolean operatorRequested;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private LocalDateTime createdAt;
}
