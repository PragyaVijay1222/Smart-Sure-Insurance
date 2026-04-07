package com.smartSure.paymentService.service;

import com.smartSure.paymentService.dto.ConfirmPaymentRequest;
import com.smartSure.paymentService.dto.FailPaymentRequest;
import com.smartSure.paymentService.dto.PaymentRequest;
import com.smartSure.paymentService.dto.PaymentResponse;

public interface PaymentCommandService {
    PaymentResponse initiatePayment(Long customerId, PaymentRequest request);
    PaymentResponse confirmPayment(ConfirmPaymentRequest req);
    PaymentResponse failPayment(FailPaymentRequest req);
}
