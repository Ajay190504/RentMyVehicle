package com.rentmyvehicle.repository;

import com.rentmyvehicle.model.User;
import com.rentmyvehicle.model.Vehicle;
import com.rentmyvehicle.model.VehicleCategory;
import com.rentmyvehicle.model.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Page<Vehicle> findByStatus(VehicleStatus status, Pageable pageable);
    Page<Vehicle> findByOwner(User owner, Pageable pageable);
    Page<Vehicle> findByOwnerAndStatusNot(User owner, VehicleStatus status, Pageable pageable);
    
    long countByOwnerAndStatusNot(User owner, VehicleStatus status);
    long countByOwnerAndStatusNotIn(User owner, List<VehicleStatus> statuses);

    @Query("SELECT v FROM Vehicle v WHERE v.status = 'ACTIVE' " +
           "AND (:category IS NULL OR v.category = :category) " +
           "AND (:subcategory IS NULL OR LOWER(v.subcategory) = LOWER(:subcategory)) " +
           "AND (:city IS NULL OR LOWER(v.locationCity) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (:minPrice IS NULL OR (CASE " +
           "  WHEN :rateType = 'HOURLY' THEN v.hourlyRate " +
           "  WHEN :rateType = 'DAILY' THEN v.dailyRate " +
           "  WHEN :rateType = 'MONTHLY' THEN v.monthlyRate " +
           "  ELSE COALESCE(v.dailyRate, v.hourlyRate, v.monthlyRate) END) >= :minPrice) " +
           "AND (:maxPrice IS NULL OR (CASE " +
           "  WHEN :rateType = 'HOURLY' THEN v.hourlyRate " +
           "  WHEN :rateType = 'DAILY' THEN v.dailyRate " +
           "  WHEN :rateType = 'MONTHLY' THEN v.monthlyRate " +
           "  ELSE COALESCE(v.dailyRate, v.hourlyRate, v.monthlyRate) END) <= :maxPrice)")
    Page<Vehicle> searchVehicles(
            @Param("category") VehicleCategory category,
            @Param("subcategory") String subcategory,
            @Param("city") String city,
            @Param("rateType") String rateType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );
}
