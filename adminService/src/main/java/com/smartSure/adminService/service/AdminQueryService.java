package com.smartSure.adminService.service;

import com.smartSure.adminService.dto.client.ClaimDTO;
import com.smartSure.adminService.dto.client.PolicyDTO;
import com.smartSure.adminService.dto.client.UserDTO;
import com.smartSure.adminService.entity.AuditLog;

import java.util.List;

public interface AdminQueryService {
    List<ClaimDTO> getAllClaims();
    List<ClaimDTO> getUnderReviewClaims();
    ClaimDTO getClaimById(Long claimId);
    List<PolicyDTO> getAllPolicies();
    PolicyDTO getPolicyById(Long policyId);
    List<UserDTO> getAllUsers();
    UserDTO getUserById(Long userId);
    List<AuditLog> getRecentActivity(int limit);
    List<AuditLog> getEntityHistory(String entity, Long id);
}
