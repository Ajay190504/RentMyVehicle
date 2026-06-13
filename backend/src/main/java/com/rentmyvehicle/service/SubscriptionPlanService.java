package com.rentmyvehicle.service;

import com.rentmyvehicle.dto.SubscriptionPlanDto;
import com.rentmyvehicle.exception.ResourceNotFoundException;
import com.rentmyvehicle.mapper.SubscriptionPlanMapper;
import com.rentmyvehicle.model.SubscriptionPlan;
import com.rentmyvehicle.repository.SubscriptionPlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionPlanMapper planMapper;

    public SubscriptionPlanService(SubscriptionPlanRepository planRepository, SubscriptionPlanMapper planMapper) {
        this.planRepository = planRepository;
        this.planMapper = planMapper;
    }

    public List<SubscriptionPlanDto> getAllPlans() {
        List<SubscriptionPlan> plans = planRepository.findAll();
        return planMapper.toDtoList(plans);
    }

    public SubscriptionPlan getPlanById(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found with ID: " + id));
    }
}
