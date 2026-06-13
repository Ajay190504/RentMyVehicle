package com.rentmyvehicle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RentMyVehicleApplication {
    public static void main(String[] args) {
        SpringApplication.run(RentMyVehicleApplication.class, args);
    }
}
