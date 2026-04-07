package com.smartSure.adminService.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import com.smartSure.adminService.entity.AuditLog;
import com.smartSure.adminService.exception.ResourceNotFoundException;
import com.smartSure.adminService.repository.AuditLogRepository;

@ExtendWith(MockitoExtension.class)
public class AuditLogQueryServiceImplTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditLogQueryServiceImpl auditLogQueryService;

    @Test
    void getLogsByAdmin_success() {
        when(auditLogRepository.findByAdminId(100L)).thenReturn(Collections.emptyList());
        List<AuditLog> result = auditLogQueryService.getLogsByAdmin(100L);
        assertNotNull(result);
    }

    @Test
    void getAllLogs_success() {
        when(auditLogRepository.findAll()).thenReturn(Collections.emptyList());
        List<AuditLog> result = auditLogQueryService.getAllLogs();
        assertNotNull(result);
    }

    @Test
    void getRecentLogs_success() {
        when(auditLogRepository.findRecentLogs(any(Pageable.class))).thenReturn(Collections.emptyList());
        List<AuditLog> result = auditLogQueryService.getRecentLogs(10);
        assertNotNull(result);
    }

    @Test
    void getLogById_success() {
        AuditLog log = new AuditLog();
        when(auditLogRepository.findById(1L)).thenReturn(Optional.of(log));
        AuditLog result = auditLogQueryService.getLogById(1L);
        assertNotNull(result);
    }

    @Test
    void getLogById_notFound() {
        when(auditLogRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> auditLogQueryService.getLogById(1L));
    }

    @Test
    void getLogsByDateRange_success() {
        LocalDateTime now = LocalDateTime.now();
        when(auditLogRepository.findByDateRange(any(), any())).thenReturn(Collections.emptyList());
        List<AuditLog> result = auditLogQueryService.getLogsByDateRange(now, now);
        assertNotNull(result);
    }
}
