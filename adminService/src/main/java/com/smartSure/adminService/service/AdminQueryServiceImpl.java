package com.smartSure.adminService.service;

import com.smartSure.adminService.dto.client.ClaimDTO;
import com.smartSure.adminService.dto.client.PolicyDTO;
import com.smartSure.adminService.dto.client.UserDTO;
import com.smartSure.adminService.entity.AuditLog;
import com.smartSure.adminService.feign.ClaimFeignClient;
import com.smartSure.adminService.feign.PolicyFeignClient;
import com.smartSure.adminService.feign.UserFeignClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminQueryServiceImpl implements AdminQueryService {

    private final ClaimFeignClient claimFeignClient;
    private final PolicyFeignClient policyFeignClient;
    private final UserFeignClient userFeignClient;
    private final AuditLogQueryService auditLogQueryService;

    @Override
    public List<ClaimDTO> getAllClaims() {
        return claimFeignClient.getAllClaims();
    }

    @Override
    public List<ClaimDTO> getUnderReviewClaims() {
        return claimFeignClient.getUnderReviewClaims();
    }

    @Override
    public ClaimDTO getClaimById(Long claimId) {
        return claimFeignClient.getClaimById(claimId);
    }

    @Override
    public List<PolicyDTO> getAllPolicies() {
        return policyFeignClient.getAllPolicies();
    }

    @Override
    public PolicyDTO getPolicyById(Long policyId) {
        return policyFeignClient.getPolicyById(policyId, policyId, "ADMIN");
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userFeignClient.getAllUsers();
    }

    @Override
    public UserDTO getUserById(Long userId) {
        return userFeignClient.getUserById(userId);
    }

    @Override
    public List<AuditLog> getRecentActivity(int limit) {
        return auditLogQueryService.getRecentLogs(limit);
    }

    @Override
    public List<AuditLog> getEntityHistory(String entity, Long id) {
        return auditLogQueryService.getLogsByEntityAndId(entity, id);
    }
}
