package com.smartSure.claimService.service;

import com.smartSure.claimService.client.PolicyClient;
import com.smartSure.claimService.dto.ClaimResponse;
import com.smartSure.claimService.dto.PolicyDTO;
import com.smartSure.claimService.dto.PolicyResponse;
import com.smartSure.claimService.entity.Claim;
import com.smartSure.claimService.entity.Status;
import com.smartSure.claimService.exception.ClaimNotFoundException;
import com.smartSure.claimService.repository.ClaimRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimQueryServiceImplTest {

    @Mock private ClaimRepository claimRepository;
    @Mock private PolicyClient    policyClient;

    @InjectMocks
    private ClaimQueryServiceImpl claimQueryService;

    private Claim claim;
    private static final Long CLAIM_ID = 1L;
    private static final Long POLICY_ID = 42L;

    @BeforeEach
    void setUp() {
        claim = new Claim();
        claim.setId(CLAIM_ID);
        claim.setPolicyId(POLICY_ID);
        claim.setStatus(Status.DRAFT);
        claim.setAmount(new BigDecimal("1000.00"));
    }

    @Test
    void getClaimById_success() {
        when(claimRepository.findById(CLAIM_ID)).thenReturn(Optional.of(claim));
        ClaimResponse resp = claimQueryService.getClaimById(CLAIM_ID);
        assertNotNull(resp);
        assertEquals(CLAIM_ID, resp.getId());
    }

    @Test
    void getClaimById_notFound_throwsException() {
        when(claimRepository.findById(CLAIM_ID)).thenReturn(Optional.empty());
        assertThrows(ClaimNotFoundException.class, () -> claimQueryService.getClaimById(CLAIM_ID));
    }

    @Test
    void getAllClaims_returnsList() {
        when(claimRepository.findAll()).thenReturn(List.of(claim));
        List<ClaimResponse> resp = claimQueryService.getAllClaims();
        assertEquals(1, resp.size());
    }

    @Test
    void getAllUnderReviewClaims_returnsFilteredList() {
        claim.setStatus(Status.UNDER_REVIEW);
        when(claimRepository.findByStatus(Status.UNDER_REVIEW)).thenReturn(List.of(claim));
        List<ClaimResponse> resp = claimQueryService.getAllUnderReviewClaims();
        assertEquals(1, resp.size());
    }

    @Test
    void getPolicyForClaim_integratesWithPolicyClient() {
        PolicyResponse policy = new PolicyResponse();
        policy.setId(POLICY_ID);
        policy.setCoverageAmount(new BigDecimal("5000.00"));
        policy.setCustomerId(100L);
        
        when(claimRepository.findById(CLAIM_ID)).thenReturn(Optional.of(claim));
        when(policyClient.getPolicyById(POLICY_ID)).thenReturn(policy);

        PolicyDTO resp = claimQueryService.getPolicyForClaim(CLAIM_ID);

        assertNotNull(resp);
        assertEquals(POLICY_ID, resp.getPolicyID());
        assertEquals(new BigDecimal("5000.00"), resp.getAmount());
    }
}
