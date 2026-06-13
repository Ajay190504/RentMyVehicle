package com.rentmyvehicle.service;

import com.rentmyvehicle.dto.BookingIntervalDto;
import com.rentmyvehicle.dto.VehicleCreateRequest;
import com.rentmyvehicle.dto.VehicleDto;
import com.rentmyvehicle.dto.VehicleImageDto;
import com.rentmyvehicle.dto.VehicleSpecificationDto;
import com.rentmyvehicle.exception.BadRequestException;
import com.rentmyvehicle.exception.ResourceNotFoundException;
import com.rentmyvehicle.mapper.VehicleMapper;
import com.rentmyvehicle.model.*;
import com.rentmyvehicle.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleImageRepository imageRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final GcsService gcsService;
    private final VehicleMapper vehicleMapper;
    private final BookingRepository bookingRepository;

    public VehicleService(VehicleRepository vehicleRepository,
                          VehicleImageRepository imageRepository,
                          UserRepository userRepository,
                          SubscriptionRepository subscriptionRepository,
                          GcsService gcsService,
                          VehicleMapper vehicleMapper,
                          BookingRepository bookingRepository) {
        this.vehicleRepository = vehicleRepository;
        this.imageRepository = imageRepository;
        this.userRepository = userRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.gcsService = gcsService;
        this.vehicleMapper = vehicleMapper;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public VehicleDto createVehicle(VehicleCreateRequest request, String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found"));

        validateRates(request.getHourlyRate(), request.getDailyRate(), request.getMonthlyRate());

        // Enforce subscription quota limits
        Subscription activeSub = subscriptionRepository
                .findFirstByOwnerAndStatusOrderByEndDateDesc(owner, SubscriptionStatus.ACTIVE)
                .orElseThrow(() -> new BadRequestException("An active subscription is required to create a vehicle listing."));

        if (activeSub.getPlan().getMaxVehicleListings() != -1) {
            long activeCount = vehicleRepository.countByOwnerAndStatusNot(owner, VehicleStatus.REJECTED);
            if (activeCount >= activeSub.getPlan().getMaxVehicleListings()) {
                throw new BadRequestException("Listing quota exceeded for your current plan (" 
                        + activeSub.getPlan().getMaxVehicleListings() + " listings max). Please upgrade.");
            }
        }

        Vehicle vehicle = Vehicle.builder()
                .owner(owner)
                .category(request.getCategory())
                .subcategory(request.getSubcategory())
                .title(request.getTitle())
                .description(request.getDescription())
                .locationCity(request.getLocationCity())
                .hourlyRate(request.getHourlyRate())
                .dailyRate(request.getDailyRate())
                .monthlyRate(request.getMonthlyRate())
                .operatorAvailable(request.getOperatorAvailable() != null && request.getOperatorAvailable())
                .status(VehicleStatus.PENDING_APPROVAL)
                .build();

        if (request.getSpecifications() != null) {
            List<VehicleSpecification> specs = new ArrayList<>();
            for (VehicleSpecificationDto specDto : request.getSpecifications()) {
                specs.add(VehicleSpecification.builder()
                        .vehicle(vehicle)
                        .specKey(specDto.getSpecKey())
                        .specValue(specDto.getSpecValue())
                        .build());
            }
            vehicle.setSpecifications(specs);
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        return vehicleMapper.toDto(saved);
    }

    @Transactional
    public VehicleDto updateVehicle(Long vehicleId, VehicleCreateRequest request, String email) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (!vehicle.getOwner().getEmail().equals(email)) {
            throw new BadRequestException("You are not authorized to update this vehicle listing");
        }

        validateRates(request.getHourlyRate(), request.getDailyRate(), request.getMonthlyRate());

        vehicle.setCategory(request.getCategory());
        vehicle.setSubcategory(request.getSubcategory());
        vehicle.setTitle(request.getTitle());
        vehicle.setDescription(request.getDescription());
        vehicle.setLocationCity(request.getLocationCity());
        vehicle.setHourlyRate(request.getHourlyRate());
        vehicle.setDailyRate(request.getDailyRate());
        vehicle.setMonthlyRate(request.getMonthlyRate());
        vehicle.setOperatorAvailable(request.getOperatorAvailable() != null && request.getOperatorAvailable());
        vehicle.setStatus(VehicleStatus.PENDING_APPROVAL); // Re-verification required after updates

        // Repopulate specs
        vehicle.getSpecifications().clear();
        if (request.getSpecifications() != null) {
            for (VehicleSpecificationDto specDto : request.getSpecifications()) {
                vehicle.getSpecifications().add(VehicleSpecification.builder()
                        .vehicle(vehicle)
                        .specKey(specDto.getSpecKey())
                        .specValue(specDto.getSpecValue())
                        .build());
            }
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        return vehicleMapper.toDto(saved);
    }

    @Transactional
    public void deleteVehicle(Long vehicleId, String email) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (!vehicle.getOwner().getEmail().equals(email)) {
            throw new BadRequestException("You are not authorized to delete this vehicle listing");
        }

        vehicleRepository.delete(vehicle);
    }

    public VehicleDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
        VehicleDto dto = vehicleMapper.toDto(vehicle);

        List<Booking> activeBookings = bookingRepository.findByVehicleAndStatusIn(
                vehicle,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.ONGOING)
        );

        List<BookingIntervalDto> intervals = activeBookings.stream()
                .map(b -> BookingIntervalDto.builder()
                        .startDatetime(b.getStartDatetime())
                        .endDatetime(b.getEndDatetime())
                        .build())
                .collect(java.util.stream.Collectors.toList());

        dto.setActiveBookings(intervals);
        return dto;
    }

    public Page<VehicleDto> searchVehicles(VehicleCategory category, String subcategory, String city,
                                          String rateType, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        Page<Vehicle> vehicles = vehicleRepository.searchVehicles(category, subcategory, city, rateType, minPrice, maxPrice, pageable);
        return vehicles.map(vehicleMapper::toDto);
    }

    public Page<VehicleDto> getOwnerVehicles(String email, Pageable pageable) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Page<Vehicle> vehicles = vehicleRepository.findByOwner(owner, pageable);
        return vehicles.map(vehicleMapper::toDto);
    }

    @Transactional
    public VehicleDto approveVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
        vehicle.setStatus(VehicleStatus.ACTIVE);
        Vehicle saved = vehicleRepository.save(vehicle);
        return vehicleMapper.toDto(saved);
    }

    @Transactional
    public VehicleDto rejectVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
        vehicle.setStatus(VehicleStatus.REJECTED);
        Vehicle saved = vehicleRepository.save(vehicle);
        return vehicleMapper.toDto(saved);
    }

    @Transactional
    public VehicleImageDto uploadVehicleImage(Long vehicleId, MultipartFile file, String email) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (!vehicle.getOwner().getEmail().equals(email)) {
            throw new BadRequestException("You are not authorized to add images to this vehicle listing");
        }

        String url = gcsService.uploadFile(file);

        boolean isPrimary = vehicle.getImages().isEmpty();

        VehicleImage img = VehicleImage.builder()
                .vehicle(vehicle)
                .imageUrl(url)
                .isPrimary(isPrimary)
                .build();

        VehicleImage saved = imageRepository.save(img);
        return vehicleMapper.toImageDto(saved);
    }

    private void validateRates(BigDecimal hourly, BigDecimal daily, BigDecimal monthly) {
        boolean atLeastOneSet = (hourly != null && hourly.compareTo(BigDecimal.ZERO) > 0) ||
                               (daily != null && daily.compareTo(BigDecimal.ZERO) > 0) ||
                               (monthly != null && monthly.compareTo(BigDecimal.ZERO) > 0);
        if (!atLeastOneSet) {
            throw new BadRequestException("At least one rental rate (hourly, daily, or monthly) must be set and greater than zero.");
        }
    }
}
