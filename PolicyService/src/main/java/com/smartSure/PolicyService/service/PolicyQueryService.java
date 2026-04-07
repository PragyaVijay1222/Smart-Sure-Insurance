package com.smartSure.PolicyService.service;

import com.smartSure.PolicyService.dto.calculation.PremiumCalculationRequest;
import com.smartSure.PolicyService.dto.calculation.PremiumCalculationResponse;
import com.smartSure.PolicyService.dto.policy.*;
import com.smartSure.PolicyService.dto.premium.PremiumResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Query service for PolicyService - handles all read-side operations.
 */
public interface PolicyQueryService {
    PolicyPageResponse getCustomerPolicies(Long customerId, Pageable pageable);
    PolicyResponse getPolicyById(Long policyId, Long userId, boolean isAdmin);
    PolicyPageResponse getAllPolicies(Pageable pageable);
    List<PolicyResponse> getAdminCustomerPolicies(Long customerId);
    List<PremiumResponse> getPremiumsByPolicy(Long policyId, Long userId, boolean isAdmin);
    PolicySummaryResponse getPolicySummary();
    PremiumCalculationResponse calculatePremium(PremiumCalculationRequest request);
}
