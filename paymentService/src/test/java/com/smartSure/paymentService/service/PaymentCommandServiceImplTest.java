package com.smartSure.paymentService.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.json.JSONObject;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import com.smartSure.paymentService.config.RabbitMQConfig;
import com.smartSure.paymentService.client.AuthServiceClient;
import com.smartSure.paymentService.dto.ConfirmPaymentRequest;
import com.smartSure.paymentService.dto.FailPaymentRequest;
import com.smartSure.paymentService.dto.PaymentRequest;
import com.smartSure.paymentService.dto.PaymentResponse;
import com.smartSure.paymentService.entity.Payment;
import com.smartSure.paymentService.repository.PaymentRepository;

@ExtendWith(MockitoExtension.class)
public class PaymentCommandServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private RazorpayProvider razorpayProvider;

    @Mock
    private AuthServiceClient authServiceClient;

    @InjectMocks
    private PaymentCommandServiceImpl paymentCommandService;

    @Test
    void initiatePayment_success() throws Exception {
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("1000"));
        request.setPolicyId(1L);
        request.setPremiumId(1L);

        RazorpayClient razorpayClient = mock(RazorpayClient.class);
        OrderClient orderClient = mock(OrderClient.class);
        Order order = mock(Order.class);
        
        razorpayClient.orders = orderClient;
        when(razorpayProvider.createClient()).thenReturn(razorpayClient);
        when(orderClient.create(any(JSONObject.class))).thenReturn(order);
        when(order.get("id")).thenReturn("order_123");

        Payment payment = new Payment();
        payment.setStatus(Payment.PaymentStatus.PENDING);
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);

        PaymentResponse response = paymentCommandService.initiatePayment(100L, request);

        assertNotNull(response);
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    void confirmPayment_success() {
        ConfirmPaymentRequest req = new ConfirmPaymentRequest();
        req.setRazorpayOrderId("order_123");
        req.setRazorpayPaymentId("pay_123");

        Payment payment = new Payment();
        payment.setCustomerId(100L);
        payment.setRazorpayOrderId("order_123");
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setAmount(new BigDecimal("1000"));
        payment.setPolicyId(1L);
        
        when(paymentRepository.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(authServiceClient.getUserEmail(100L)).thenReturn("user@example.com");

        PaymentResponse response = paymentCommandService.confirmPayment(req);

        assertNotNull(response);
        // Verify both events
        verify(rabbitTemplate).convertAndSend(eq(RabbitMQConfig.EXCHANGE), eq(RabbitMQConfig.PAYMENT_COMPLETED_KEY), any(Object.class));
        verify(rabbitTemplate).convertAndSend(eq(RabbitMQConfig.EMAIL_EXCHANGE), eq(RabbitMQConfig.EMAIL_ROUTING_KEY), any(Object.class));
        verify(authServiceClient).getUserEmail(100L);
    }

    @Test
    void failPayment_success() {
        FailPaymentRequest req = new FailPaymentRequest();
        req.setRazorpayOrderId("order_123");
        req.setReason("Failure Reason");

        Payment payment = new Payment();
        payment.setCustomerId(100L);
        payment.setRazorpayOrderId("order_123");
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setAmount(new BigDecimal("1000"));
        payment.setPolicyId(1L);

        when(paymentRepository.findByRazorpayOrderId("order_123")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(authServiceClient.getUserEmail(100L)).thenReturn("user@example.com");

        PaymentResponse response = paymentCommandService.failPayment(req);

        assertNotNull(response);
        verify(rabbitTemplate).convertAndSend(eq(RabbitMQConfig.EMAIL_EXCHANGE), eq(RabbitMQConfig.EMAIL_ROUTING_KEY), any(Object.class));
        verify(authServiceClient).getUserEmail(100L);
    }
}
