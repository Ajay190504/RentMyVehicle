package com.rentmyvehicle.mapper;

import com.rentmyvehicle.dto.UserDto;
import com.rentmyvehicle.model.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
    User toEntity(UserDto dto);
}
