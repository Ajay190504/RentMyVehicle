package com.rentmyvehicle.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicle_specifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "vehicle")
public class VehicleSpecification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "spec_key", nullable = false)
    private String specKey;

    @Column(name = "spec_value", nullable = false)
    private String specValue;
}
