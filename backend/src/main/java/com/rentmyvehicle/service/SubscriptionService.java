package com.rentmyvehicle.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.rentmyvehicle.dto.SubscriptionDto;
import com.rentmyvehicle.dto.SubscriptionOrderResponse;
import com.rentmyvehicle.dto.SubscriptionVerificationRequest;
import com.rentmyvehicle.exception.BadRequestException;
import com.rentmyvehicle.exception.ResourceNotFoundException;
import com.rentmyvehicle.mapper.SubscriptionMapper;
import com.rentmyvehicle.model.Subscription;
import com.rentmyvehicle.model.SubscriptionPlan;
import com.rentmyvehicle.model.SubscriptionStatus;
import com.rentmyvehicle.model.User;
import com.rentmyvehicle.repository.SubscriptionPlanRepository;
import com.rentmyvehicle.repository.SubscriptionRepository;
import com.rentmyvehicle.repository.UserRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final UserRepository userRepository;
    private final SubscriptionMapper subscriptionMapper;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                               SubscriptionPlanRepository planRepository,
                               UserRepository userRepository,
                               SubscriptionMapper subscriptionMapper) {
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
        this.userRepository = userRepository;
        this.subscriptionMapper = subscriptionMapper;
    }

    public SubscriptionOrderResponse createOrder(Long planId, String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Owner user not found"));

        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));

        String orderId;
        BigDecimal amount = plan.getPrice();

        // Check if we are in mock mode
        if ("rzp_test_dummy".equals(razorpayKeyId) || razorpayKeyId == null || razorpayKeyId.isEmpty()) {
            orderId = "order_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
        } else {
            try {
                RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                JSONObject orderRequest = new JSONObject();
                // Razorpay expects amount in paise (1 INR = 100 paise)
                orderRequest.put("amount", amount.multiply(new BigDecimal(100)).intValue());
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", "sub_receipt_" + owner.getId() + "_" + System.currentTimeMillis());

                Order order = client.orders.create(orderRequest);
                orderId = order.get("id");
            } catch (Exception e) {
                throw new BadRequestException("Failed to create Razorpay order: " + e.getMessage());
            }
        }

        return SubscriptionOrderResponse.builder()
                .orderId(orderId)
                .amount(amount)
                .keyId(razorpayKeyId)
                .planName(plan.getName())
                .build();
    }

    @Transactional
    public SubscriptionDto verifyPayment(SubscriptionVerificationRequest request, String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Owner user not found"));

        SubscriptionPlan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Subscription plan not found"));

        boolean isMock = request.getRazorpayOrderId().startsWith("order_mock_") || "dummy_secret".equals(razorpayKeySecret);

        if (!isMock) {
            boolean verified = verifySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature(),
                    razorpayKeySecret
            );
            if (!verified) {
                throw new BadRequestException("Razorpay payment signature verification failed");
            }
        }

        // Cancel previous active subscriptions for this owner
        Optional<Subscription> existingActive = subscriptionRepository
                .findFirstByOwnerAndStatusOrderByEndDateDesc(owner, SubscriptionStatus.ACTIVE);

        if (existingActive.isPresent()) {
            Subscription oldSub = existingActive.get();
            oldSub.setStatus(SubscriptionStatus.CANCELLED);
            subscriptionRepository.save(oldSub);
        }

        // Create new active subscription
        Subscription newSub = Subscription.builder()
                .owner(owner)
                .plan(plan)
                .razorpayOrderId(request.getRazorpayOrderId())
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .status(SubscriptionStatus.ACTIVE)
                .startDate(LocalDateTime.now())
                .endDate(LocalDateTime.now().plusDays(plan.getDurationDays()))
                .build();

        Subscription saved = subscriptionRepository.save(newSub);
        return subscriptionMapper.toDto(saved);
    }

    public SubscriptionDto getActiveSubscription(String email) {
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return subscriptionRepository.findFirstByOwnerAndStatusOrderByEndDateDesc(owner, SubscriptionStatus.ACTIVE)
                .map(subscriptionMapper::toDto)
                .orElse(null);
    }

    // Runs every day at 12:00 AM (midnight)
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void expireSubscriptions() {
        System.out.println("Running daily subscription expiry job at " + LocalDateTime.now());
        List<Subscription> expiredList = subscriptionRepository
                .findByStatusAndEndDateBefore(SubscriptionStatus.ACTIVE, LocalDateTime.now());

        for (Subscription sub : expiredList) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(sub);
            System.out.println("Expired subscription ID: " + sub.getId() + " for owner: " + sub.getOwner().getEmail());
        }
    }

    private boolean verifySignature(String orderId, String paymentId, String signature, String secret) {
        try {
            String data = orderId + "|" + paymentId;
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawMac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : rawMac) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}
