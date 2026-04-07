package com.smartSure.claimService.service;

import com.smartSure.claimService.dto.ClaimResponse;
import com.smartSure.claimService.dto.PolicyDTO;
import com.smartSure.claimService.entity.FileData;
import java.util.List;

public interface ClaimQueryService {
    ClaimResponse getClaimById(Long claimId);
    List<ClaimResponse> getAllClaims();
    List<ClaimResponse> getAllUnderReviewClaims();
    List<ClaimResponse> getClaimsByCustomer(Long customerId);
    PolicyDTO getPolicyForClaim(Long claimId);
    FileData downloadClaimForm(Long claimId);
    FileData downloadAadhaarCard(Long claimId);
    FileData downloadEvidence(Long claimId);
}
