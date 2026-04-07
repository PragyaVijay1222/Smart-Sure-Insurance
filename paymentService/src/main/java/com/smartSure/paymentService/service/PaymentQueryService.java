package com.smartSure.paymentService.service;

import com.smartSure.paymentService.dto.PaymentResponse;
import java.util.List;

public interface PaymentQueryService {
    PaymentResponse getPaymentById(Long id);
    List<PaymentResponse> getPaymentsByCustomer(Long customerId);
    List<PaymentResponse> getPaymentsByPolicy(Long policyId);
}
