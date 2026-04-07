package com.smartSure.adminService.service;

import com.smartSure.adminService.dto.client.ClaimDTO;
import com.smartSure.adminService.dto.client.PolicyDTO;

public interface AdminCommandService {
    ClaimDTO approveClaim(Long adminId, Long claimId, String remarks);
    ClaimDTO rejectClaim(Long adminId, Long claimId, String remarks);
    ClaimDTO markUnderReview(Long adminId, Long claimId);
    PolicyDTO cancelPolicy(Long adminId, Long policyId, String reason);
}
