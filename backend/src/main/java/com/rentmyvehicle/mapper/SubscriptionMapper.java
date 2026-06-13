package com.rentmyvehicle.mapper;

import com.rentmyvehicle.dto.SubscriptionDto;
import com.rentmyvehicle.model.Subscription;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {
    @Mapping(source = "plan.id", target = "planId")
    @Mapping(source = "plan.name", target = "planName")
    @Mapping(source = "plan.maxVehicleListings", target = "maxVehicleListings")
    SubscriptionDto toDto(Subscription subscription);
}
