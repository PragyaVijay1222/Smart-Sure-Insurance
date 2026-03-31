package com.smartSure.PolicyService.service;

import com.smartSure.PolicyService.client.AuthServiceClient;
import com.smartSure.PolicyService.dto.event.PaymentCompletedEvent;
import com.smartSure.PolicyService.dto.event.PremiumPaidEvent;
import com.smartSure.PolicyService.entity.Policy;
import com.smartSure.PolicyService.entity.Premium;
import com.smartSure.PolicyService.repository.PremiumRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentSagaListener {

    private final PremiumRepository premiumRepository;
    private final NotificationPublisher notificationPublisher;
    private final AuthServiceClient authServiceClient;

    @RabbitListener(
        bindings = @org.springframework.amqp.rabbit.annotation.QueueBinding(
            value = @org.springframework.amqp.rabbit.annotation.Queue(value = "payment.completed.queue", durable = "true"),
            exchange = @org.springframework.amqp.rabbit.annotation.Exchange(value = "smartsure.exchange", type = "topic"),
            key = "payment.completed"
        )
    )
    @Transactional
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        log.info("SAGA: Received PaymentCompletedEvent for premiumId={}", event.getPremiumId());

        Premium premium = premiumRepository.findById(event.getPremiumId())
                .orElse(null);

        if (premium == null) {
            log.error("SAGA: Premium not found for id={}! Cannot complete payment.", event.getPremiumId());
            return;
        }

        if (premium.getStatus() == Premium.PremiumStatus.PAID) {
            log.warn("SAGA: Premium id={} is already marked as PAID.", premium.getId());
            return;
        }

        // Complete the saga
        premium.setStatus(Premium.PremiumStatus.PAID);
        premium.setPaidDate(LocalDate.now());
        // For Razorpay updates, we might want to store razorpay_payment_id
        // In premium, we had stored razorpay_order_id in paymentReference initially.
        // We can append or replace it.
        premium.setPaymentReference(event.getRazorpayPaymentId());
        
        try {
            premium.setPaymentMethod(Premium.PaymentMethod.valueOf(event.getPaymentMethod()));
        } catch (Exception e) {
            log.warn("SAGA: Unknown payment method {}", event.getPaymentMethod());
        }

        Premium saved = premiumRepository.save(premium);
        Policy policy = saved.getPolicy();

        log.info("SAGA: Successfully updated Premium id={} to PAID status.", saved.getId());

        // Fire notification 
        notificationPublisher.publishPremiumPaid(
                PremiumPaidEvent.builder()
                        .premiumId(saved.getId())
                        .policyId(policy.getId())
                        .policyNumber(policy.getPolicyNumber())
                        .customerId(policy.getCustomerId())
                        .customerEmail(getCustomerEmailSafely(policy.getCustomerId()))
                        .customerName("Customer")
                        .amount(saved.getAmount())
                        .paidDate(saved.getPaidDate())
                        .paymentMethod(saved.getPaymentMethod() != null ? saved.getPaymentMethod().name() : null)
                        .paymentReference(saved.getPaymentReference())
                        .build());
    }

    private String getCustomerEmailSafely(Long customerId) {
        try {
            return authServiceClient.getCustomerEmail(customerId);
        } catch (Exception e) {
            log.warn("Could not fetch customer email for customerId={}: {}", customerId, e.getMessage());
            return null;
        }
    }
}
