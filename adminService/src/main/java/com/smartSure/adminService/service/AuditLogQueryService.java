package com.smartSure.adminService.service;

import com.smartSure.adminService.entity.AuditLog;
import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogQueryService {
    List<AuditLog> getLogsByAdmin(Long adminId);
    List<AuditLog> getAllLogs();
    List<AuditLog> getLogsByEntity(String targetEntity);
    List<AuditLog> getLogsByEntityAndId(String targetEntity, Long targetId);
    List<AuditLog> getLogsByDateRange(LocalDateTime from, LocalDateTime to);
    List<AuditLog> getRecentLogs(int limit);
    AuditLog getLogById(Long id);
}
