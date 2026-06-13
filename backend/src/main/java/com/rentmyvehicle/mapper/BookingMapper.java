package com.rentmyvehicle.mapper;

import com.rentmyvehicle.dto.BookingDto;
import com.rentmyvehicle.model.Booking;
import com.rentmyvehicle.model.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface BookingMapper {
    @Mapping(source = "vehicle.id", target = "vehicleId")
    @Mapping(source = "vehicle.title", target = "vehicleTitle")
    @Mapping(source = "vehicle.category", target = "vehicleCategory")
    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "customer.name", target = "customerName")
    @Mapping(target = "vehicleImageUrl", expression = "java(getPrimaryImageUrl(booking.getVehicle()))")
    BookingDto toDto(Booking booking);

    List<BookingDto> toDtoList(List<Booking> bookings);

    default String getPrimaryImageUrl(Vehicle vehicle) {
        if (vehicle == null || vehicle.getImages() == null || vehicle.getImages().isEmpty()) {
            return null;
        }
        return vehicle.getImages().stream()
                .filter(img -> img.getIsPrimary() != null && img.getIsPrimary())
                .findFirst()
                .map(img -> img.getImageUrl())
                .orElse(vehicle.getImages().get(0).getImageUrl());
    }
}
