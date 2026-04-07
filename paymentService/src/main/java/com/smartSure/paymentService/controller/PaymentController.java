package com.smartSure.paymentService.controller;

import com.smartSure.paymentService.dto.ConfirmPaymentRequest;
import com.smartSure.paymentService.dto.FailPaymentRequest;
import com.smartSure.paymentService.dto.PaymentRequest;
import com.smartSure.paymentService.dto.PaymentResponse;
import com.smartSure.paymentService.service.PaymentCommandService;
import com.smartSure.paymentService.service.PaymentQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentCommandService paymentCommandService;
    private final PaymentQueryService paymentQueryService;

    // Step 1: Customer initiates payment — returns razorpayOrderId + razorpayKeyId for frontend checkout
    @PostMapping("/initiate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> initiatePayment(
            @AuthenticationPrincipal String userId,
            @RequestBody PaymentRequest request) {
        Long customerId;
        try {
            if (userId != null) {
                customerId = Long.parseLong(userId);
            } else {
                throw new RuntimeException("Unauthorized: User ID not found in security context");
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("Unauthorized: Invalid User ID format: " + userId);
        }
        return ResponseEntity.ok(paymentCommandService.initiatePayment(customerId, request));
    }

    // Step 2a: Frontend calls this after Razorpay success handler fires
    @PostMapping("/confirm")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @RequestBody ConfirmPaymentRequest request) {
        return ResponseEntity.ok(paymentCommandService.confirmPayment(request));
    }

    // Step 2b: Frontend calls this after Razorpay failure/dismissal
    @PostMapping("/fail")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> failPayment(
            @RequestBody FailPaymentRequest request) {
        return ResponseEntity.ok(paymentCommandService.failPayment(request));
    }

    // Get single payment by ID (customer or admin)
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentQueryService.getPaymentById(id));
    }

    // Customer views their own payment history
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(paymentQueryService.getPaymentsByCustomer(Long.parseLong(userId)));
    }

    // Admin or customer views all payments for a specific policy
    @GetMapping("/policy/{policyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByPolicy(@PathVariable Long policyId) {
        return ResponseEntity.ok(paymentQueryService.getPaymentsByPolicy(policyId));
    }
}
