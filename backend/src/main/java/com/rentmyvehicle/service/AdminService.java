package com.rentmyvehicle.service;

import com.rentmyvehicle.dto.SubscriptionDto;
import com.rentmyvehicle.dto.UserDto;
import com.rentmyvehicle.dto.VehicleDto;
import com.rentmyvehicle.mapper.SubscriptionMapper;
import com.rentmyvehicle.mapper.UserMapper;
import com.rentmyvehicle.mapper.VehicleMapper;
import com.rentmyvehicle.model.VehicleStatus;
import com.rentmyvehicle.repository.SubscriptionRepository;
import com.rentmyvehicle.repository.UserRepository;
import com.rentmyvehicle.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserMapper userMapper;
    private final VehicleMapper vehicleMapper;
    private final SubscriptionMapper subscriptionMapper;

    public AdminService(UserRepository userRepository,
                        VehicleRepository vehicleRepository,
                        SubscriptionRepository subscriptionRepository,
                        UserMapper userMapper,
                        VehicleMapper vehicleMapper,
                        SubscriptionMapper subscriptionMapper) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userMapper = userMapper;
        this.vehicleMapper = vehicleMapper;
        this.subscriptionMapper = subscriptionMapper;
    }

    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toDto);
    }

    public Page<VehicleDto> getPendingVehicles(Pageable pageable) {
        return vehicleRepository.findByStatus(VehicleStatus.PENDING_APPROVAL, pageable).map(vehicleMapper::toDto);
    }

    public Page<SubscriptionDto> getAllSubscriptions(Pageable pageable) {
        return subscriptionRepository.findAll(pageable).map(subscriptionMapper::toDto);
    }
}
