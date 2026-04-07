package com.smartSure.adminService.service;

import com.smartSure.adminService.dto.client.ClaimDTO;
import com.smartSure.adminService.dto.client.PolicyDTO;
import com.smartSure.adminService.dto.update.PolicyStatusUpdateRequest;
import com.smartSure.adminService.feign.ClaimFeignClient;
import com.smartSure.adminService.feign.PolicyFeignClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminCommandServiceImpl implements AdminCommandService {

    private final ClaimFeignClient claimFeignClient;
    private final PolicyFeignClient policyFeignClient;
    private final AuditLogCommandService auditLogCommandService;

    @Override
    public ClaimDTO approveClaim(Long adminId, Long claimId, String remarks) {
        ClaimDTO updated = claimFeignClient.updateClaimStatus(claimId, "APPROVED");
        auditLogCommandService.log(adminId, "APPROVE_CLAIM", "Claim", claimId, remarks);
        return updated;
    }

    @Override
    public ClaimDTO rejectClaim(Long adminId, Long claimId, String remarks) {
        ClaimDTO updated = claimFeignClient.updateClaimStatus(claimId, "REJECTED");
        auditLogCommandService.log(adminId, "REJECT_CLAIM", "Claim", claimId, remarks);
        return updated;
    }

    @Override
    public ClaimDTO markUnderReview(Long adminId, Long claimId) {
        ClaimDTO claim = claimFeignClient.getClaimById(claimId);
        if ("SUBMITTED".equals(claim.getStatus())) {
            ClaimDTO updated = claimFeignClient.updateClaimStatus(claimId, "UNDER_REVIEW");
            auditLogCommandService.log(adminId, "MARK_UNDER_REVIEW", "Claim", claimId, "Claim moved to under review");
            return updated;
        }
        auditLogCommandService.log(adminId, "MARK_UNDER_REVIEW", "Claim", claimId, "Claim already under review");
        return claim;
    }

    @Override
    public PolicyDTO cancelPolicy(Long adminId, Long policyId, String reason) {
        PolicyStatusUpdateRequest req = new PolicyStatusUpdateRequest("CANCELLED", reason);
        PolicyDTO updated = policyFeignClient.updatePolicyStatus(policyId, req);
        auditLogCommandService.log(adminId, "CANCEL_POLICY", "Policy", policyId, reason);
        return updated;
    }
}
