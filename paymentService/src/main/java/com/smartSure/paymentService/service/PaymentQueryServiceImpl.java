package com.smartSure.paymentService.service;

import com.smartSure.paymentService.dto.PaymentResponse;
import com.smartSure.paymentService.entity.Payment;
import com.smartSure.paymentService.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentQueryServiceImpl implements PaymentQueryService {

    private final PaymentRepository paymentRepository;

    @Override
    public PaymentResponse getPaymentById(Long id) {
        return toResponse(paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + id)), null);
    }

    @Override
    public List<PaymentResponse> getPaymentsByCustomer(Long customerId) {
        return paymentRepository.findByCustomerId(customerId).stream()
                .map(p -> toResponse(p, null)).toList();
    }

    @Override
    public List<PaymentResponse> getPaymentsByPolicy(Long policyId) {
        return paymentRepository.findByPolicyId(policyId).stream()
                .map(p -> toResponse(p, null)).toList();
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
