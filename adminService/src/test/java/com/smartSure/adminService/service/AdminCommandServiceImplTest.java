package com.smartSure.adminService.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.smartSure.adminService.dto.client.ClaimDTO;
import com.smartSure.adminService.dto.client.PolicyDTO;
import com.smartSure.adminService.dto.update.PolicyStatusUpdateRequest;
import com.smartSure.adminService.feign.ClaimFeignClient;
import com.smartSure.adminService.feign.PolicyFeignClient;

@ExtendWith(MockitoExtension.class)
public class AdminCommandServiceImplTest {

    @Mock
    private ClaimFeignClient claimFeignClient;

    @Mock
    private PolicyFeignClient policyFeignClient;

    @Mock
    private AuditLogCommandService auditLogCommandService;

    @InjectMocks
    private AdminCommandServiceImpl adminCommandService;

    @Test
    void approveClaim_success() {
        ClaimDTO claim = new ClaimDTO();
        when(claimFeignClient.updateClaimStatus(1L, "APPROVED")).thenReturn(claim);

        ClaimDTO result = adminCommandService.approveClaim(100L, 1L, "Approved");

        assertNotNull(result);
        verify(auditLogCommandService).log(100L, "APPROVE_CLAIM", "Claim", 1L, "Approved");
    }

    @Test
    void rejectClaim_success() {
        ClaimDTO claim = new ClaimDTO();
        when(claimFeignClient.updateClaimStatus(1L, "REJECTED")).thenReturn(claim);

        ClaimDTO result = adminCommandService.rejectClaim(100L, 1L, "Rejected");

        assertNotNull(result);
        verify(auditLogCommandService).log(100L, "REJECT_CLAIM", "Claim", 1L, "Rejected");
    }

    @Test
    void markUnderReview_success() {
        ClaimDTO claim = new ClaimDTO();
        claim.setStatus("SUBMITTED");
        when(claimFeignClient.getClaimById(1L)).thenReturn(claim);
        when(claimFeignClient.updateClaimStatus(1L, "UNDER_REVIEW")).thenReturn(claim);

        ClaimDTO result = adminCommandService.markUnderReview(100L, 1L);

        assertNotNull(result);
        verify(auditLogCommandService).log(100L, "MARK_UNDER_REVIEW", "Claim", 1L, "Claim moved to under review");
    }

    @Test
    void cancelPolicy_success() {
        PolicyDTO policy = new PolicyDTO();
        when(policyFeignClient.updatePolicyStatus(eq(1L), any(PolicyStatusUpdateRequest.class))).thenReturn(policy);

        PolicyDTO result = adminCommandService.cancelPolicy(100L, 1L, "Reason");

        assertNotNull(result);
        verify(auditLogCommandService).log(100L, "CANCEL_POLICY", "Policy", 1L, "Reason");
    }
}
