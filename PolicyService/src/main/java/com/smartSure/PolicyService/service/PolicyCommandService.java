package com.smartSure.PolicyService.service;

import com.smartSure.PolicyService.dto.policy.*;
import com.smartSure.PolicyService.dto.premium.PremiumPaymentRequest;
import com.smartSure.PolicyService.dto.premium.PremiumResponse;

/**
 * Command service for PolicyService - handles all write-side operations.
 */
public interface PolicyCommandService {
    PolicyResponse purchasePolicy(Long customerId, PolicyPurchaseRequest request);
    PolicyResponse cancelPolicy(Long policyId, Long customerId, String reason);
    PolicyResponse renewPolicy(Long customerId, com.smartSure.PolicyService.dto.policy.PolicyRenewalRequest request);
    com.smartSure.PolicyService.dto.premium.PremiumResponse payPremium(Long customerId, com.smartSure.PolicyService.dto.premium.PremiumPaymentRequest request);
    PolicyResponse adminUpdatePolicyStatus(Long policyId, PolicyStatusUpdateRequest request);
    
    // Scheduled tasks (also write operations)
    void expirePolicies();
    void markOverduePremiums();
    void sendPremiumDueReminders();
    void sendExpiryReminders();
}
