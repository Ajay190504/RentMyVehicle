package com.rentmyvehicle.controller;

import com.rentmyvehicle.dto.ApiResponse;
import com.rentmyvehicle.dto.BookingDto;
import com.rentmyvehicle.dto.SubscriptionDto;
import com.rentmyvehicle.dto.UserDto;
import com.rentmyvehicle.dto.VehicleDto;
import com.rentmyvehicle.service.AdminService;
import com.rentmyvehicle.service.BookingService;
import com.rentmyvehicle.service.VehicleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final VehicleService vehicleService;
    private final BookingService bookingService;

    public AdminController(AdminService adminService, VehicleService vehicleService, BookingService bookingService) {
        this.adminService = adminService;
        this.vehicleService = vehicleService;
        this.bookingService = bookingService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(@PageableDefault(size = 10) Pageable pageable) {
        Page<UserDto> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("All users retrieved successfully", users));
    }

    @GetMapping("/vehicles/pending")
    public ResponseEntity<ApiResponse<Page<VehicleDto>>> getPendingVehicles(@PageableDefault(size = 10) Pageable pageable) {
        Page<VehicleDto> vehicles = adminService.getPendingVehicles(pageable);
        return ResponseEntity.ok(ApiResponse.success("Pending vehicles retrieved successfully", vehicles));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<ApiResponse<Page<SubscriptionDto>>> getAllSubscriptions(@PageableDefault(size = 10) Pageable pageable) {
        Page<SubscriptionDto> subscriptions = adminService.getAllSubscriptions(pageable);
        return ResponseEntity.ok(ApiResponse.success("All subscriptions retrieved successfully", subscriptions));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<Page<BookingDto>>> getAllBookings(@PageableDefault(size = 10) Pageable pageable) {
        Page<BookingDto> bookings = bookingService.getAllBookings(pageable);
        return ResponseEntity.ok(ApiResponse.success("All bookings retrieved successfully", bookings));
    }

    @PatchMapping("/vehicles/{id}/approve")
    public ResponseEntity<ApiResponse<VehicleDto>> approveVehicle(@PathVariable Long id) {
        VehicleDto response = vehicleService.approveVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle approved successfully", response));
    }

    @PatchMapping("/vehicles/{id}/reject")
    public ResponseEntity<ApiResponse<VehicleDto>> rejectVehicle(@PathVariable Long id) {
        VehicleDto response = vehicleService.rejectVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle listing rejected", response));
    }
}
