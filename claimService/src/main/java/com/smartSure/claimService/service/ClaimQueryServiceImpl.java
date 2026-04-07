package com.smartSure.claimService.service;

import com.smartSure.claimService.client.PolicyClient;
import com.smartSure.claimService.dto.ClaimResponse;
import com.smartSure.claimService.dto.PolicyDTO;
import com.smartSure.claimService.dto.PolicyResponse;
import com.smartSure.claimService.entity.Claim;
import com.smartSure.claimService.entity.FileData;
import com.smartSure.claimService.entity.Status;
import com.smartSure.claimService.exception.ClaimNotFoundException;
import com.smartSure.claimService.exception.DocumentNotUploadedException;
import com.smartSure.claimService.repository.ClaimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimQueryServiceImpl implements ClaimQueryService {

    private final ClaimRepository claimRepository;
    private final PolicyClient    policyClient;

    @Override
    @Transactional(readOnly = true)
    public ClaimResponse getClaimById(Long claimId) {
        return toResponse(findOrThrow(claimId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponse> getAllClaims() {
        return claimRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponse> getAllUnderReviewClaims() {
        return claimRepository.findByStatus(Status.UNDER_REVIEW).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaimsByCustomer(Long customerId) {
        List<Claim> claims = claimRepository.findByCustomerId(customerId);
        if (claims == null) return java.util.Collections.emptyList();
        
        return claims.stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PolicyDTO getPolicyForClaim(Long claimId) {
        Claim claim = findOrThrow(claimId);
        PolicyResponse policy = policyClient.getPolicyById(claim.getPolicyId());

        PolicyDTO finalDto = new PolicyDTO();
        finalDto.setAmount(policy.getCoverageAmount());
        finalDto.setPolicyID(policy.getId());
        finalDto.setCustomerId(policy.getCustomerId());
        
        return finalDto;
    }

    @Override
    @Transactional(readOnly = true)
    public FileData downloadClaimForm(Long claimId) {
        Claim claim = findOrThrow(claimId);
        if (claim.getClaimForm() == null) throw new DocumentNotUploadedException("Claim form", claimId);
        return claim.getClaimForm();
    }

    @Override
    @Transactional(readOnly = true)
    public FileData downloadAadhaarCard(Long claimId) {
        Claim claim = findOrThrow(claimId);
        if (claim.getAadhaarCard() == null) throw new DocumentNotUploadedException("Aadhaar card", claimId);
        return claim.getAadhaarCard();
    }

    @Override
    @Transactional(readOnly = true)
    public FileData downloadEvidence(Long claimId) {
        Claim claim = findOrThrow(claimId);
        if (claim.getEvidences() == null) throw new DocumentNotUploadedException("Evidence", claimId);
        return claim.getEvidences();
    }

    private Claim findOrThrow(Long claimId) {
        return claimRepository.findById(claimId).orElseThrow(() -> new ClaimNotFoundException(claimId));
    }

    private ClaimResponse toResponse(Claim claim) {
        if (claim == null) return null;
        
        return new ClaimResponse(
                claim.getId(), 
                claim.getPolicyId(), 
                claim.getAmount(), 
                claim.getStatus() != null ? claim.getStatus().name() : null,
                claim.getCustomerId(),
                claim.getTimeOfCreation(),
                claim.getIncidentDate() != null ? claim.getIncidentDate().toString() : null,
                claim.getIncidentLocation(),
                claim.getDescription(),
                claim.getClaimForm() != null, 
                claim.getAadhaarCard() != null, 
                claim.getEvidences() != null
        );
    }
}
