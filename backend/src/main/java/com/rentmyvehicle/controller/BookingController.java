package com.rentmyvehicle.controller;

import com.rentmyvehicle.dto.ApiResponse;
import com.rentmyvehicle.dto.BookingCreateRequest;
import com.rentmyvehicle.dto.BookingDto;
import com.rentmyvehicle.model.BookingStatus;
import com.rentmyvehicle.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingDto>> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingDto booking = bookingService.createBooking(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Booking requested successfully", booking));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingDto>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingDto booking = bookingService.cancelBooking(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<BookingDto>> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        BookingDto booking = bookingService.updateBookingStatus(id, status, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Booking status updated to " + status, booking));
    }

    @GetMapping("/customer")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<BookingDto>>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<BookingDto> bookings = bookingService.getCustomerBookings(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Customer bookings retrieved successfully", bookings));
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Page<BookingDto>>> getIncomingBookings(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<BookingDto> bookings = bookingService.getOwnerBookings(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Owner incoming bookings retrieved successfully", bookings));
    }
}
