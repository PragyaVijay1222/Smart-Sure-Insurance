package com.smartSure.paymentService.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.smartSure.paymentService.config.RabbitMQConfig;
import com.smartSure.paymentService.dto.ConfirmPaymentRequest;
import com.smartSure.paymentService.dto.FailPaymentRequest;
import com.smartSure.paymentService.client.AuthServiceClient;
import com.smartSure.paymentService.dto.EmailMessage;
import com.smartSure.paymentService.dto.PaymentCompletedEvent;
import com.smartSure.paymentService.dto.PaymentRequest;
import com.smartSure.paymentService.dto.PaymentResponse;
import com.smartSure.paymentService.entity.Payment;
import com.smartSure.paymentService.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentCommandServiceImpl implements PaymentCommandService {

    private final PaymentRepository paymentRepository;
    private final RabbitTemplate rabbitTemplate;
    private final RazorpayProvider razorpayProvider;
    private final AuthServiceClient authServiceClient;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Override
    public PaymentResponse initiatePayment(Long customerId, PaymentRequest request) {
        try {
            RazorpayClient razorpay = razorpayProvider.createClient();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", request.getAmount().multiply(new BigDecimal("100")).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_pol" + request.getPolicyId() + "_pre" + request.getPremiumId());

            Order order = razorpay.orders.create(orderRequest);

            Payment payment = Payment.builder()
                    .policyId(request.getPolicyId())
                    .premiumId(request.getPremiumId())
                    .customerId(customerId)
                    .amount(request.getAmount())
                    .paymentMethod(request.getPaymentMethod())
                    .status(Payment.PaymentStatus.PENDING)
                    .razorpayOrderId(order.get("id"))
                    .build();

            Payment saved = paymentRepository.save(payment);
            log.info("Payment initiated — policyId={}, premiumId={}, orderId={}",
                    request.getPolicyId(), request.getPremiumId(), order.get("id"));

            return toResponse(saved, razorpayKeyId);

        } catch (Exception e) {
            log.error("Payment initiation failed: {}", e.getMessage());
            throw new RuntimeException("Payment initiation failed: " + e.getMessage());
        }
    }

    @Override
    public PaymentResponse confirmPayment(ConfirmPaymentRequest req) {
        Payment payment = paymentRepository.findByRazorpayOrderId(req.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + req.getRazorpayOrderId()));

        payment.setStatus(Payment.PaymentStatus.SUCCESS);
        payment.setRazorpayPaymentId(req.getRazorpayPaymentId());
        payment.setUpdatedAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);

        PaymentCompletedEvent event = PaymentCompletedEvent.builder()
                .paymentId(saved.getId())
                .policyId(saved.getPolicyId())
                .premiumId(saved.getPremiumId())
                .customerId(saved.getCustomerId())
                .amount(saved.getAmount())
                .paymentMethod(saved.getPaymentMethod() != null ? saved.getPaymentMethod().name() : null)
                .razorpayPaymentId(req.getRazorpayPaymentId())
                .paidAt(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.PAYMENT_COMPLETED_KEY, event);
        log.info("PaymentCompletedEvent published — premiumId={}", saved.getPremiumId());

        // Send Success Email
        try {
            String email = authServiceClient.getUserEmail(saved.getCustomerId());
            EmailMessage emailMessage = EmailMessage.builder()
                    .to(email)
                    .subject("Payment Successful - Smart Sure")
                    .body("Your payment of INR " + saved.getAmount() + " for Policy ID " + saved.getPolicyId() + " was successful. Thank you for choosing Smart Sure!")
                    .build();
            rabbitTemplate.convertAndSend(RabbitMQConfig.EMAIL_EXCHANGE, RabbitMQConfig.EMAIL_ROUTING_KEY, emailMessage);
            log.info("Success notification published for customerId={}", saved.getCustomerId());
        } catch (Exception e) {
            log.warn("Failed to send success notification: {}", e.getMessage());
        }

        return toResponse(saved, null);
    }

    @Override
    public PaymentResponse failPayment(FailPaymentRequest req) {
        Payment payment = paymentRepository.findByRazorpayOrderId(req.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + req.getRazorpayOrderId()));
        payment.setStatus(Payment.PaymentStatus.FAILED);
        payment.setFailureReason(req.getReason());
        payment.setUpdatedAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);

        // Send Failure Email
        try {
            String email = authServiceClient.getUserEmail(saved.getCustomerId());
            EmailMessage emailMessage = EmailMessage.builder()
                    .to(email)
                    .subject("Payment Failed - Smart Sure")
                    .body("Your payment of INR " + saved.getAmount() + " for Policy ID " + saved.getPolicyId() + " has failed. Reason: " + req.getReason())
                    .build();
            rabbitTemplate.convertAndSend(RabbitMQConfig.EMAIL_EXCHANGE, RabbitMQConfig.EMAIL_ROUTING_KEY, emailMessage);
            log.info("Failure notification published for customerId={}", saved.getCustomerId());
        } catch (Exception e) {
            log.warn("Failed to send failure notification: {}", e.getMessage());
        }

        return toResponse(saved, null);
    }

    private PaymentResponse toResponse(Payment p, String keyId) {
        return PaymentResponse.builder()
                .id(p.getId())
                .policyId(p.getPolicyId())
                .premiumId(p.getPremiumId())
                .customerId(p.getCustomerId())
                .amount(p.getAmount())
                .status(p.getStatus().name())
                .paymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod().name() : null)
                .razorpayOrderId(p.getRazorpayOrderId())
                .razorpayPaymentId(p.getRazorpayPaymentId())
                .razorpayKeyId(keyId)
                .createdAt(p.getCreatedAt())
                .build();
    }
}
