package com.rentmyvehicle.mapper;

import com.rentmyvehicle.dto.SubscriptionPlanDto;
import com.rentmyvehicle.model.SubscriptionPlan;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SubscriptionPlanMapper {
    SubscriptionPlanDto toDto(SubscriptionPlan plan);
    SubscriptionPlan toEntity(SubscriptionPlanDto dto);
    List<SubscriptionPlanDto> toDtoList(List<SubscriptionPlan> plans);
}
