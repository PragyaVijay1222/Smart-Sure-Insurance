package com.smartSure.adminService.service;

import com.smartSure.adminService.entity.AuditLog;
import com.smartSure.adminService.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogCommandServiceImpl implements AuditLogCommandService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public AuditLog log(Long adminId, String action, String targetEntity, Long targetId, String remarks) {
        AuditLog log = new AuditLog();
        log.setAdminId(adminId);
        log.setAction(action);
        log.setTargetEntity(targetEntity);
        log.setTargetId(targetId);
        log.setRemarks(remarks);
        return auditLogRepository.save(log);
    }
}
