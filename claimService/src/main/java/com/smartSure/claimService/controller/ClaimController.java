package com.smartSure.claimService.controller;

import com.smartSure.claimService.dto.ClaimRequest;
import com.smartSure.claimService.dto.ClaimResponse;
import com.smartSure.claimService.dto.PolicyDTO;
import com.smartSure.claimService.entity.FileData;
import com.smartSure.claimService.entity.Status;
import com.smartSure.claimService.service.ClaimCommandService;
import com.smartSure.claimService.service.ClaimQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimCommandService commandService;
    private final ClaimQueryService   queryService;

    // ─────────────────────────────────────────────
    // CRUD & COMMANDS
    // ─────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ClaimResponse> createClaim(@RequestBody ClaimRequest request) {
        return ResponseEntity.ok(commandService.createClaim(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        commandService.deleteClaim(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/submit")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ClaimResponse> submitClaim(@PathVariable Long id) {
        return ResponseEntity.ok(commandService.submitClaim(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClaimResponse> moveToStatus(
            @PathVariable Long id,
            @RequestParam Status next) {
        return ResponseEntity.ok(commandService.moveToStatus(id, next));
    }

    @PostMapping(value = "/{id}/upload/claim-form", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ClaimResponse> uploadClaimForm(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(commandService.uploadClaimForm(id, file));
    }

    @PostMapping(value = "/{id}/upload/aadhaar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ClaimResponse> uploadAadhaarCard(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(commandService.uploadAadhaarCard(id, file));
    }

    @PostMapping(value = "/{id}/upload/evidence", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ClaimResponse> uploadEvidence(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(commandService.uploadEvidence(id, file));
    }

    // ─────────────────────────────────────────────
    // QUERIES
    // ─────────────────────────────────────────────

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ClaimResponse> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(queryService.getClaimById(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClaimResponse>> getAllClaims() {
        return ResponseEntity.ok(queryService.getAllClaims());
    }

    @GetMapping("/under-review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClaimResponse>> getAllUnderReviewClaims() {
        return ResponseEntity.ok(queryService.getAllUnderReviewClaims());
    }

    @GetMapping("/my-claims")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ClaimResponse>> getMyClaims(org.springframework.security.core.Authentication authentication) {
        Long userId = Long.valueOf(authentication.getName());
        return ResponseEntity.ok(queryService.getClaimsByCustomer(userId));
    }

    @GetMapping("/{id}/policy")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<PolicyDTO> getPolicyForClaim(@PathVariable Long id) {
        return ResponseEntity.ok(queryService.getPolicyForClaim(id));
    }

    @GetMapping("/{id}/download/claim-form")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<byte[]> downloadClaimForm(@PathVariable Long id) {
        return buildFileResponse(queryService.downloadClaimForm(id));
    }

    @GetMapping("/{id}/download/aadhaar")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<byte[]> downloadAadhaarCard(@PathVariable Long id) {
        return buildFileResponse(queryService.downloadAadhaarCard(id));
    }

    @GetMapping("/{id}/download/evidence")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<byte[]> downloadEvidence(@PathVariable Long id) {
        return buildFileResponse(queryService.downloadEvidence(id));
    }

    @GetMapping("/admin/customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminCustomerClaims(@PathVariable Long customerId) {
        try {
            return ResponseEntity.ok(queryService.getClaimsByCustomer(customerId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("ClaimService Error: " + e.getMessage());
        }
    }

    @GetMapping("/admin/ping")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> pingAdmin() {
        return ResponseEntity.ok("ClaimService Admin API is reachable");
    }

    private ResponseEntity<byte[]> buildFileResponse(FileData file) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getFileName() + "\"")
                .body(file.getData());
    }
}