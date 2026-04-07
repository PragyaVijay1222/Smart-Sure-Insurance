package com.smartSure.claimService.service;

import com.smartSure.claimService.client.PolicyClient;
import com.smartSure.claimService.client.UserClient;
import com.smartSure.claimService.dto.*;
import com.smartSure.claimService.entity.Claim;
import com.smartSure.claimService.entity.Status;
import com.smartSure.claimService.exception.ClaimDeletionNotAllowedException;
import com.smartSure.claimService.exception.DocumentNotUploadedException;
import com.smartSure.claimService.repository.ClaimRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimCommandServiceImplTest {

    @Mock private ClaimRepository claimRepository;
    @Mock private PolicyClient    policyClient;
    @Mock private UserClient      userClient;
    @Mock private RabbitTemplate  rabbitTemplate;

    @InjectMocks
    private ClaimCommandServiceImpl claimCommandService;

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
    void createClaim_success() {
        PolicyResponse policy = new PolicyResponse();
        policy.setId(POLICY_ID);
        policy.setCoverageAmount(new BigDecimal("5000.00"));
        
        when(policyClient.getPolicyById(POLICY_ID)).thenReturn(policy);
        when(claimRepository.save(any(Claim.class))).thenAnswer(i -> i.getArgument(0));

        ClaimRequest request = new ClaimRequest();
        request.setPolicyId(POLICY_ID);
        ClaimResponse resp = claimCommandService.createClaim(request);

        assertNotNull(resp);
        assertEquals(POLICY_ID, resp.getPolicyId());
        assertEquals(new BigDecimal("5000.00"), resp.getAmount());
        verify(claimRepository).save(any());
    }

    @Test
    void submitClaim_missingDocs_throwsException() {
        when(claimRepository.findById(CLAIM_ID)).thenReturn(Optional.of(claim));
        assertThrows(DocumentNotUploadedException.class, () -> claimCommandService.submitClaim(CLAIM_ID));
    }

    @Test
    void deleteClaim_notDraft_throwsException() {
        claim.setStatus(Status.UNDER_REVIEW);
        when(claimRepository.findById(CLAIM_ID)).thenReturn(Optional.of(claim));
        assertThrows(ClaimDeletionNotAllowedException.class, () -> claimCommandService.deleteClaim(CLAIM_ID));
    }

    @Test
    void moveToStatus_approved_publishesEvent() {
        claim.setStatus(Status.UNDER_REVIEW);
        
        PolicyResponse policy = new PolicyResponse();
        policy.setCustomerId(100L);
        
        UserResponseDto user = new UserResponseDto();
        user.setEmail("test@example.com");
        
        when(claimRepository.findById(CLAIM_ID)).thenReturn(Optional.of(claim));
        when(claimRepository.save(any())).thenReturn(claim);
        when(policyClient.getPolicyById(POLICY_ID)).thenReturn(policy);
        when(userClient.getUserById(100L)).thenReturn(user);

        claimCommandService.moveToStatus(CLAIM_ID, Status.APPROVED);

        verify(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));
    }
}
