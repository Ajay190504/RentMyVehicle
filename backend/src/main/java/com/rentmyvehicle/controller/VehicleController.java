package com.rentmyvehicle.controller;

import com.rentmyvehicle.dto.ApiResponse;
import com.rentmyvehicle.dto.VehicleCreateRequest;
import com.rentmyvehicle.dto.VehicleDto;
import com.rentmyvehicle.dto.VehicleImageDto;
import com.rentmyvehicle.model.VehicleCategory;
import com.rentmyvehicle.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VehicleDto>>> searchVehicles(
            @RequestParam(required = false) VehicleCategory category,
            @RequestParam(required = false) String subcategory,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String rateType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<VehicleDto> vehicles = vehicleService.searchVehicles(category, subcategory, city, rateType, minPrice, maxPrice, pageable);
        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", vehicles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleDto>> getVehicleById(@PathVariable Long id) {
        VehicleDto vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle details retrieved successfully", vehicle));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<VehicleDto>> createVehicle(
            @Valid @RequestBody VehicleCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        VehicleDto response = vehicleService.createVehicle(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Vehicle listing created successfully. Awaiting admin approval.", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<VehicleDto>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        VehicleDto response = vehicleService.updateVehicle(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Vehicle listing updated successfully. Awaiting admin re-approval.", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        vehicleService.deleteVehicle(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Vehicle listing deleted successfully"));
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Page<VehicleDto>>> getMyVehicles(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<VehicleDto> vehicles = vehicleService.getOwnerVehicles(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Owner vehicle listings retrieved successfully", vehicles));
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<VehicleImageDto>> uploadVehicleImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        VehicleImageDto image = vehicleService.uploadVehicleImage(id, file, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", image));
    }

    @DeleteMapping("/images/{imageId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Void>> deleteVehicleImage(
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        vehicleService.deleteVehicleImage(imageId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully"));
    }
}
