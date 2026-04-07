package com.smartSure.adminService.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.smartSure.adminService.dto.client.ClaimDTO;
import com.smartSure.adminService.dto.client.PolicyDTO;
import com.smartSure.adminService.dto.client.UserDTO;
import com.smartSure.adminService.entity.AuditLog;
import com.smartSure.adminService.feign.ClaimFeignClient;
import com.smartSure.adminService.feign.PolicyFeignClient;
import com.smartSure.adminService.feign.UserFeignClient;

@ExtendWith(MockitoExtension.class)
public class AdminQueryServiceImplTest {

    @Mock
    private ClaimFeignClient claimFeignClient;

    @Mock
    private PolicyFeignClient policyFeignClient;

    @Mock
    private UserFeignClient userFeignClient;

    @Mock
    private AuditLogQueryService auditLogQueryService;

    @InjectMocks
    private AdminQueryServiceImpl adminQueryService;

    @Test
    void getAllClaims_success() {
        when(claimFeignClient.getAllClaims()).thenReturn(Collections.emptyList());
        List<ClaimDTO> result = adminQueryService.getAllClaims();
        assertNotNull(result);
    }

    @Test
    void getUnderReviewClaims_success() {
        when(claimFeignClient.getUnderReviewClaims()).thenReturn(Collections.emptyList());
        List<ClaimDTO> result = adminQueryService.getUnderReviewClaims();
        assertNotNull(result);
    }

    @Test
    void getClaimById_success() {
        when(claimFeignClient.getClaimById(1L)).thenReturn(new ClaimDTO());
        ClaimDTO result = adminQueryService.getClaimById(1L);
        assertNotNull(result);
    }

    @Test
    void getAllPolicies_success() {
        when(policyFeignClient.getAllPolicies()).thenReturn(Collections.emptyList());
        List<PolicyDTO> result = adminQueryService.getAllPolicies();
        assertNotNull(result);
    }

    @Test
    void getPolicyById_success() {
        when(policyFeignClient.getPolicyById(1L, 1L, "ADMIN")).thenReturn(new PolicyDTO());
        PolicyDTO result = adminQueryService.getPolicyById(1L);
        assertNotNull(result);
    }

    @Test
    void getAllUsers_success() {
        when(userFeignClient.getAllUsers()).thenReturn(Collections.emptyList());
        List<UserDTO> result = adminQueryService.getAllUsers();
        assertNotNull(result);
    }

    @Test
    void getUserById_success() {
        when(userFeignClient.getUserById(1L)).thenReturn(new UserDTO());
        UserDTO result = adminQueryService.getUserById(1L);
        assertNotNull(result);
    }

    @Test
    void getRecentActivity_success() {
        when(auditLogQueryService.getRecentLogs(10)).thenReturn(Collections.emptyList());
        List<AuditLog> result = adminQueryService.getRecentActivity(10);
        assertNotNull(result);
    }

    @Test
    void getEntityHistory_success() {
        when(auditLogQueryService.getLogsByEntityAndId("Claim", 1L)).thenReturn(Collections.emptyList());
        List<AuditLog> result = adminQueryService.getEntityHistory("Claim", 1L);
        assertNotNull(result);
    }
}
