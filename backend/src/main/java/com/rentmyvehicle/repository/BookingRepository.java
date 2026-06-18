package com.rentmyvehicle.repository;

import com.rentmyvehicle.model.Booking;
import com.rentmyvehicle.model.BookingStatus;
import com.rentmyvehicle.model.User;
import com.rentmyvehicle.model.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Page<Booking> findByCustomer(User customer, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.vehicle.owner = :owner")
    Page<Booking> findByOwner(@Param("owner") User owner, Pageable pageable);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle = :vehicle " +
           "AND b.status IN :statuses " +
           "AND (:start < b.endDatetime AND :end > b.startDatetime)")
    boolean existsOverlappingBooking(
            @Param("vehicle") Vehicle vehicle,
            @Param("statuses") List<BookingStatus> statuses,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    List<Booking> findByVehicleAndStatusIn(Vehicle vehicle, List<BookingStatus> statuses);

    boolean existsByVehicle(Vehicle vehicle);
}
