package com.rentmyvehicle.repository;

import com.rentmyvehicle.model.Subscription;
import com.rentmyvehicle.model.SubscriptionStatus;
import com.rentmyvehicle.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findFirstByOwnerAndStatusOrderByEndDateDesc(User owner, SubscriptionStatus status);
    List<Subscription> findByStatusAndEndDateBefore(SubscriptionStatus status, LocalDateTime dateTime);
    Optional<Subscription> findByRazorpayOrderId(String orderId);
}
