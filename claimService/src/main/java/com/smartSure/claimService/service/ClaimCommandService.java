package com.smartSure.claimService.service;

import com.smartSure.claimService.dto.ClaimRequest;
import com.smartSure.claimService.dto.ClaimResponse;
import com.smartSure.claimService.entity.Status;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface ClaimCommandService {
    ClaimResponse createClaim(ClaimRequest request);
    void deleteClaim(Long claimId);
    ClaimResponse submitClaim(Long claimId);
    ClaimResponse moveToStatus(Long claimId, Status nextStatus);
    ClaimResponse uploadClaimForm(Long claimId, MultipartFile file) throws IOException;
    ClaimResponse uploadAadhaarCard(Long claimId, MultipartFile file) throws IOException;
    ClaimResponse uploadEvidence(Long claimId, MultipartFile file) throws IOException;
}
