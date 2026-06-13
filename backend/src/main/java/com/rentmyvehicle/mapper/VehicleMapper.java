package com.rentmyvehicle.mapper;

import com.rentmyvehicle.dto.VehicleDto;
import com.rentmyvehicle.dto.VehicleSpecificationDto;
import com.rentmyvehicle.dto.VehicleImageDto;
import com.rentmyvehicle.model.Vehicle;
import com.rentmyvehicle.model.VehicleSpecification;
import com.rentmyvehicle.model.VehicleImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VehicleMapper {
    @Mapping(source = "owner.id", target = "ownerId")
    @Mapping(source = "owner.name", target = "ownerName")
    VehicleDto toDto(Vehicle vehicle);

    VehicleSpecificationDto toSpecDto(VehicleSpecification spec);
    VehicleImageDto toImageDto(VehicleImage img);

    List<VehicleDto> toDtoList(List<Vehicle> vehicles);
}
