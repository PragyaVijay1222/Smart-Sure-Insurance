package com.smartSure.paymentService.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.smartSure.paymentService.dto.PaymentResponse;
import com.smartSure.paymentService.entity.Payment;
import com.smartSure.paymentService.repository.PaymentRepository;

@ExtendWith(MockitoExtension.class)
public class PaymentQueryServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentQueryServiceImpl paymentQueryService;

    @Test
    void getPaymentById_success() {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        PaymentResponse result = paymentQueryService.getPaymentById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getPaymentById_notFound() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> paymentQueryService.getPaymentById(1L));
    }

    @Test
    void getPaymentsByCustomer_success() {
        when(paymentRepository.findByCustomerId(100L)).thenReturn(Collections.emptyList());
        List<PaymentResponse> result = paymentQueryService.getPaymentsByCustomer(100L);
        assertNotNull(result);
    }

    @Test
    void getPaymentsByPolicy_success() {
        when(paymentRepository.findByPolicyId(50L)).thenReturn(Collections.emptyList());
        List<PaymentResponse> result = paymentQueryService.getPaymentsByPolicy(50L);
        assertNotNull(result);
    }
}
