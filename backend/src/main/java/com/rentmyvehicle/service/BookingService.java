package com.rentmyvehicle.service;

import com.rentmyvehicle.dto.BookingCreateRequest;
import com.rentmyvehicle.dto.BookingDto;
import com.rentmyvehicle.exception.BadRequestException;
import com.rentmyvehicle.exception.ResourceNotFoundException;
import com.rentmyvehicle.mapper.BookingMapper;
import com.rentmyvehicle.model.*;
import com.rentmyvehicle.repository.BookingRepository;
import com.rentmyvehicle.repository.UserRepository;
import com.rentmyvehicle.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    public BookingService(BookingRepository bookingRepository,
                          VehicleRepository vehicleRepository,
                          UserRepository userRepository,
                          BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.bookingMapper = bookingMapper;
    }

    @Transactional
    public BookingDto createBooking(BookingCreateRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer user not found"));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle listing not found"));

        if (vehicle.getStatus() != VehicleStatus.ACTIVE) {
            throw new BadRequestException("This vehicle listing is not currently active for booking.");
        }

        if (request.getStartDatetime().isAfter(request.getEndDatetime()) ||
                request.getStartDatetime().isEqual(request.getEndDatetime())) {
            throw new BadRequestException("Start date-time must be strictly before end date-time.");
        }

        LocalDateTime nowBuffer = LocalDateTime.now().minusMinutes(15);
        if (request.getStartDatetime().isBefore(nowBuffer)) {
            throw new BadRequestException("Start date-time must be in the present or future.");
        }

        // Check Booking Overlap
        boolean overlapExists = bookingRepository.existsOverlappingBooking(
                vehicle,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.ONGOING),
                request.getStartDatetime(),
                request.getEndDatetime()
        );

        if (overlapExists) {
            throw new BadRequestException("The vehicle is already booked for the selected date range.");
        }

        // Price calculations (Server-side)
        BigDecimal rate;
        long units = 1;
        Duration duration = Duration.between(request.getStartDatetime(), request.getEndDatetime());
        long durationSeconds = duration.toSeconds();

        switch (request.getRateTypeUsed()) {
            case HOURLY:
                rate = vehicle.getHourlyRate();
                if (rate == null) {
                    throw new BadRequestException("Hourly rate type is not available for this vehicle.");
                }
                units = (long) Math.ceil((double) durationSeconds / 3600.0);
                break;
            case DAILY:
                rate = vehicle.getDailyRate();
                if (rate == null) {
                    throw new BadRequestException("Daily rate type is not available for this vehicle.");
                }
                units = (long) Math.ceil((double) durationSeconds / 86400.0);
                break;
            case MONTHLY:
                rate = vehicle.getMonthlyRate();
                if (rate == null) {
                    throw new BadRequestException("Monthly rate type is not available for this vehicle.");
                }
                long totalDays = (long) Math.ceil((double) durationSeconds / 86400.0);
                units = (long) Math.ceil((double) totalDays / 30.0);
                break;
            default:
                throw new BadRequestException("Invalid rate type selected.");
        }

        units = Math.max(1, units);
        BigDecimal baseAmount = rate.multiply(new BigDecimal(units));
        BigDecimal operatorAmount = BigDecimal.ZERO;

        boolean hasOperator = request.getOperatorRequested() != null && request.getOperatorRequested() && vehicle.getOperatorAvailable();
        if (hasOperator) {
            BigDecimal operatorRate;
            switch (request.getRateTypeUsed()) {
                case HOURLY:
                    operatorRate = new BigDecimal("150.00");
                    break;
                case DAILY:
                    operatorRate = new BigDecimal("1000.00");
                    break;
                case MONTHLY:
                    operatorRate = new BigDecimal("15000.00");
                    break;
                default:
                    operatorRate = BigDecimal.ZERO;
            }
            operatorAmount = operatorRate.multiply(new BigDecimal(units));
        }

        BigDecimal totalAmount = baseAmount.add(operatorAmount);

        Booking booking = Booking.builder()
                .vehicle(vehicle)
                .customer(customer)
                .rateTypeUsed(request.getRateTypeUsed())
                .startDatetime(request.getStartDatetime())
                .endDatetime(request.getEndDatetime())
                .operatorRequested(hasOperator)
                .totalAmount(totalAmount)
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toDto(saved);
    }

    @Transactional
    public BookingDto cancelBooking(Long bookingId, String email) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking details not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // If the user is the renter (customer) of this booking
        if (booking.getCustomer().getEmail().equals(email)) {
            if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
                throw new BadRequestException("Only pending or confirmed bookings can be cancelled by the renter.");
            }
        } 
        // If the user is the host (owner of the vehicle)
        else if (booking.getVehicle().getOwner().getEmail().equals(email)) {
            if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
                throw new BadRequestException("Cannot cancel an already completed or cancelled booking.");
            }
        } else {
            throw new BadRequestException("You are not authorized to manage or cancel this booking.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toDto(saved);
    }

    @Transactional
    public BookingDto updateBookingStatus(Long bookingId, BookingStatus newStatus, String ownerEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking details not found"));

        if (!booking.getVehicle().getOwner().getEmail().equals(ownerEmail)) {
            throw new BadRequestException("You are not authorized to manage bookings for this vehicle.");
        }

        BookingStatus currentStatus = booking.getStatus();

        // Enforce valid state transitions
        if (newStatus == BookingStatus.CONFIRMED && currentStatus != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be confirmed.");
        }
        if (newStatus == BookingStatus.ONGOING) {
            if (currentStatus != BookingStatus.CONFIRMED) {
                throw new BadRequestException("Only confirmed bookings can be started (marked ongoing).");
            }
            if (LocalDateTime.now().isBefore(booking.getStartDatetime().minusMinutes(30))) {
                throw new BadRequestException("Cannot start rental before the scheduled start time.");
            }
        }
        if (newStatus == BookingStatus.COMPLETED) {
            if (currentStatus != BookingStatus.ONGOING) {
                throw new BadRequestException("Only ongoing bookings can be completed.");
            }
            if (LocalDateTime.now().isBefore(booking.getEndDatetime())) {
                throw new BadRequestException("Cannot complete rental before the scheduled end time.");
            }
        }
        if (newStatus == BookingStatus.CANCELLED && (currentStatus == BookingStatus.COMPLETED || currentStatus == BookingStatus.CANCELLED)) {
            throw new BadRequestException("Cannot cancel a completed or already cancelled booking.");
        }

        booking.setStatus(newStatus);
        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toDto(saved);
    }

    public Page<BookingDto> getCustomerBookings(String customerEmail, Pageable pageable) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer user not found"));
        return bookingRepository.findByCustomer(customer, pageable).map(bookingMapper::toDto);
    }

    public Page<BookingDto> getOwnerBookings(String ownerEmail, Pageable pageable) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner user not found"));
        return bookingRepository.findByOwner(owner, pageable).map(bookingMapper::toDto);
    }

    public Page<BookingDto> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable).map(bookingMapper::toDto);
    }
}
