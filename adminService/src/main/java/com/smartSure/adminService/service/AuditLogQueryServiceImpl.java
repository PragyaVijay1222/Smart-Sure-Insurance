package com.smartSure.adminService.service;

import com.smartSure.adminService.entity.AuditLog;
import com.smartSure.adminService.exception.ResourceNotFoundException;
import com.smartSure.adminService.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogQueryServiceImpl implements AuditLogQueryService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public List<AuditLog> getLogsByAdmin(Long adminId) {
        return auditLogRepository.findByAdminId(adminId);
    }

    @Override
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }

    @Override
    public List<AuditLog> getLogsByEntity(String targetEntity) {
        return auditLogRepository.findByTargetEntity(targetEntity);
    }

    @Override
    public List<AuditLog> getLogsByEntityAndId(String targetEntity, Long targetId) {
        return auditLogRepository.findByTargetEntityAndTargetId(targetEntity, targetId);
    }

    @Override
    public List<AuditLog> getLogsByDateRange(LocalDateTime from, LocalDateTime to) {
        return auditLogRepository.findByDateRange(from, to);
    }

    @Override
    public List<AuditLog> getRecentLogs(int limit) {
        return auditLogRepository.findRecentLogs(PageRequest.of(0, limit));
    }

    @Override
    public AuditLog getLogById(Long id) {
        return auditLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuditLog not found with id: " + id));
    }
}
