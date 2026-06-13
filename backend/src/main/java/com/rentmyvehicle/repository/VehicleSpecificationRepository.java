package com.rentmyvehicle.repository;

import com.rentmyvehicle.model.VehicleSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleSpecificationRepository extends JpaRepository<VehicleSpecification, Long> {
}
