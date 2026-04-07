package com.smartSure.adminService.service;

import com.smartSure.adminService.entity.AuditLog;

public interface AuditLogCommandService {
    AuditLog log(Long adminId, String action, String targetEntity, Long targetId, String remarks);
}
