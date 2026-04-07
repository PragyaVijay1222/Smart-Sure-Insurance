package com.smartSure.PolicyService.controller;

import com.smartSure.PolicyService.dto.calculation.PremiumCalculationRequest;
import com.smartSure.PolicyService.dto.calculation.PremiumCalculationResponse;
import com.smartSure.PolicyService.dto.policy.*;
import com.smartSure.PolicyService.dto.premium.PremiumPaymentRequest;
import com.smartSure.PolicyService.dto.premium.PremiumResponse;
import com.smartSure.PolicyService.service.PolicyCommandService;
import com.smartSure.PolicyService.service.PolicyQueryService;
import com.smartSure.PolicyService.security.SecurityUtils;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Policies", description = "Policy purchase, management, and premium payment")
public class PolicyController {

    private final PolicyCommandService commandService;
    private final PolicyQueryService queryService;

    // ==================== CUSTOMER APIs ====================

    @PostMapping("/purchase")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PolicyResponse> purchasePolicy(
            @Valid @RequestBody PolicyPurchaseRequest request) {

        Long customerId = SecurityUtils.getCurrentUserId();

        if (customerId == null) {
            throw new RuntimeException("Unauthorized: User not found in context");
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commandService.purchasePolicy(customerId, request));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PolicyPageResponse> getMyPolicies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Long customerId = SecurityUtils.getCurrentUserId();

        if (customerId == null) {
            throw new RuntimeException("Unauthorized: User not found in context");
        }

        Sort.Direction dir = Sort.Direction.DESC;
        if (direction != null && direction.equalsIgnoreCase("asc")) {
            dir = Sort.Direction.ASC;
        }

        return ResponseEntity
                .ok(queryService.getCustomerPolicies(customerId, PageRequest.of(page, size, Sort.by(dir, sortBy))));
    }

    @GetMapping("/{policyId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PolicyResponse> getPolicyById(@PathVariable Long policyId) {

        Long userId = SecurityUtils.getCurrentUserId();
        String role = SecurityUtils.getCurrentRole();

        boolean isAdmin = "ROLE_ADMIN".equals(role);

        return ResponseEntity.ok(queryService.getPolicyById(policyId, userId, isAdmin));
    }

    @PutMapping("/{policyId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PolicyResponse> cancelPolicy(
            @PathVariable Long policyId,
            @RequestParam(required = false) String reason) {

        Long customerId = SecurityUtils.getCurrentUserId();

        return ResponseEntity.ok(commandService.cancelPolicy(policyId, customerId, reason));
    }

    @PostMapping("/renew")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PolicyResponse> renewPolicy(
            @Valid @RequestBody PolicyRenewalRequest request) {

        Long customerId = SecurityUtils.getCurrentUserId();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commandService.renewPolicy(customerId, request));
    }

    // ==================== PREMIUM PAYMENT ====================

    @PostMapping("/premiums/pay")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PremiumResponse> payPremium(
            @Valid @RequestBody PremiumPaymentRequest request) {

        Long customerId = SecurityUtils.getCurrentUserId();

        return ResponseEntity.ok(commandService.payPremium(customerId, request));
    }

    @GetMapping("/{policyId}/premiums")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PremiumResponse>> getPremiums(
            @PathVariable Long policyId) {

        Long userId = SecurityUtils.getCurrentUserId();
        String role = SecurityUtils.getCurrentRole();
        boolean isAdmin = "ROLE_ADMIN".equals(role);

        return ResponseEntity.ok(queryService.getPremiumsByPolicy(policyId, userId, isAdmin));
    }

    // ==================== PREMIUM CALCULATION ====================

    @PostMapping("/calculate-premium")
    @PreAuthorize("permitAll()")
    public ResponseEntity<PremiumCalculationResponse> calculatePremium(
            @Valid @RequestBody PremiumCalculationRequest request) {

        return ResponseEntity.ok(queryService.calculatePremium(request));
    }

    // ==================== ADMIN APIs ====================

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PolicyPageResponse> getAllPolicies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;

        return ResponseEntity.ok(queryService.getAllPolicies(PageRequest.of(page, size, Sort.by(dir, sortBy))));
    }

    @PutMapping("/admin/{policyId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PolicyResponse> adminUpdateStatus(
            @PathVariable Long policyId,
            @Valid @RequestBody PolicyStatusUpdateRequest request) {

        return ResponseEntity.ok(commandService.adminUpdatePolicyStatus(policyId, request));
    }

    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PolicySummaryResponse> getPolicySummary() {

        return ResponseEntity.ok(queryService.getPolicySummary());
    }

    @GetMapping("/admin/customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminCustomerPolicies(@PathVariable Long customerId) {
        try {
            return ResponseEntity.ok(queryService.getAdminCustomerPolicies(customerId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("PolicyService Error: " + e.getMessage());
        }
    }

    @GetMapping("/admin/ping")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> pingAdmin() {
        return ResponseEntity.ok("PolicyService Admin API is reachable");
    }
}