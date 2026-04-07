package com.smartSure.adminService.service;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.smartSure.adminService.entity.AuditLog;
import com.smartSure.adminService.repository.AuditLogRepository;

@ExtendWith(MockitoExtension.class)
public class AuditLogCommandServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogCommandServiceImpl auditLogCommandService;

    @Test
    void log_success() {
        AuditLog log = new AuditLog();
        when(auditLogRepository.save(any(AuditLog.class))).thenReturn(log);

        AuditLog result = auditLogCommandService.log(100L, "ACTION", "Entity", 1L, "Remarks");

        assertNotNull(result);
        verify(auditLogRepository).save(any(AuditLog.class));
    }
}
