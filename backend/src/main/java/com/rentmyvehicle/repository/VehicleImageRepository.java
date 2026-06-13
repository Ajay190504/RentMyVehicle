package com.rentmyvehicle.repository;

import com.rentmyvehicle.model.VehicleImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleImageRepository extends JpaRepository<VehicleImage, Long> {
}
