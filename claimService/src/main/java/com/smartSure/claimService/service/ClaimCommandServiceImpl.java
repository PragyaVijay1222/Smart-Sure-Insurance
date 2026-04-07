package com.smartSure.claimService.service;

import com.smartSure.claimService.client.PolicyClient;
import com.smartSure.claimService.client.UserClient;
import com.smartSure.claimService.dto.*;
import com.smartSure.claimService.entity.Claim;
import com.smartSure.claimService.entity.FileData;
import com.smartSure.claimService.entity.Status;
import com.smartSure.claimService.exception.ClaimDeletionNotAllowedException;
import com.smartSure.claimService.exception.ClaimNotFoundException;
import com.smartSure.claimService.exception.DocumentNotUploadedException;
import com.smartSure.claimService.messaging.ClaimDecisionEvent;
import com.smartSure.claimService.messaging.RabbitMQConfig;
import com.smartSure.claimService.repository.ClaimRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClaimCommandServiceImpl implements ClaimCommandService {

    private final ClaimRepository claimRepository;
    private final PolicyClient    policyClient;
    private final UserClient      userClient;
    private final RabbitTemplate  rabbitTemplate;

    @Override
    @Transactional
    public ClaimResponse createClaim(ClaimRequest request) {
        PolicyResponse policy = policyClient.getPolicyById(request.getPolicyId());
        Claim claim = new Claim();
        claim.setPolicyId(request.getPolicyId());
        claim.setCustomerId(policy.getCustomerId());
        
        // Use user-provided amount if present, otherwise default to coverage
        claim.setAmount(request.getAmount() != null ? request.getAmount() : policy.getCoverageAmount());
        
        if (request.getIncidentDate() != null) {
            claim.setIncidentDate(java.time.LocalDate.parse(request.getIncidentDate()));
        }
        claim.setIncidentLocation(request.getIncidentLocation());
        claim.setDescription(request.getDescription());
        
        return toResponse(claimRepository.save(claim));
    }

    @Override
    @Transactional
    public void deleteClaim(Long claimId) {
        Claim claim = findOrThrow(claimId);
        if (claim.getStatus() != Status.DRAFT) throw new ClaimDeletionNotAllowedException(claimId);
        claimRepository.deleteById(claimId);
    }

    @Override
    @Transactional
    public ClaimResponse submitClaim(Long claimId) {
        Claim claim = findOrThrow(claimId);
        if (claim.getStatus() != Status.DRAFT)
            throw new IllegalStateException("Claim " + claimId + " cannot be submitted — not in DRAFT status.");
        
        // if (claim.getClaimForm() == null)   throw new DocumentNotUploadedException("Claim form", claimId);
        if (claim.getAadhaarCard() == null) {
            log.error("Submission failed for claim {}: Aadhaar card is missing.", claimId);
            throw new DocumentNotUploadedException("Aadhaar card", claimId);
        }
        if (claim.getEvidences() == null) {
            log.error("Submission failed for claim {}: Evidence document is missing.", claimId);
            throw new DocumentNotUploadedException("Evidence", claimId);
        }

        claim.setStatus(claim.getStatus().moveTo(Status.SUBMITTED));
        claim.setStatus(claim.getStatus().moveTo(Status.UNDER_REVIEW));
        return toResponse(claimRepository.save(claim));
    }

    @Override
    @Transactional
    public ClaimResponse moveToStatus(Long claimId, Status nextStatus) {
        Claim claim = findOrThrow(claimId);
        claim.setStatus(claim.getStatus().moveTo(nextStatus));
        Claim saved = claimRepository.save(claim);

        if (nextStatus == Status.APPROVED || nextStatus == Status.REJECTED) {
            publishDecisionEvent(saved, nextStatus);
        }
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ClaimResponse uploadClaimForm(Long claimId, MultipartFile file) throws IOException {
        Claim claim = findOrThrow(claimId);
        claim.setClaimForm(toFileData(file));
        return toResponse(claimRepository.save(claim));
    }

    @Override
    @Transactional
    public ClaimResponse uploadAadhaarCard(Long claimId, MultipartFile file) throws IOException {
        Claim claim = findOrThrow(claimId);
        claim.setAadhaarCard(toFileData(file));
        return toResponse(claimRepository.save(claim));
    }

    @Override
    @Transactional
    public ClaimResponse uploadEvidence(Long claimId, MultipartFile file) throws IOException {
        Claim claim = findOrThrow(claimId);
        claim.setEvidences(toFileData(file));
        return toResponse(claimRepository.save(claim));
    }

    private void publishDecisionEvent(Claim claim, Status decision) {
        try {
            PolicyResponse policy = policyClient.getPolicyById(claim.getPolicyId());
            UserResponseDto user = userClient.getUserById(policy.getCustomerId());

            ClaimDecisionEvent event = ClaimDecisionEvent.builder()
                    .claimId(claim.getId())
                    .policyId(claim.getPolicyId())
                    .decision(decision.name())
                    .amount(claim.getAmount())
                    .customerEmail(user.getEmail())
                    .customerName(user.getFirstName())
                    .decidedAt(LocalDateTime.now())
                    .build();

            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.CLAIM_DECISION_KEY, event);
            log.info("ClaimDecisionEvent published — claimId={}, decision={}", claim.getId(), decision);
        } catch (Exception e) {
            log.error("Failed to publish ClaimDecisionEvent for claim {}: {}", claim.getId(), e.getMessage());
        }
    }

    private Claim findOrThrow(Long claimId) {
        return claimRepository.findById(claimId).orElseThrow(() -> new ClaimNotFoundException(claimId));
    }

    private FileData toFileData(MultipartFile file) throws IOException {
        return new FileData(file.getOriginalFilename(), file.getContentType(), file.getBytes());
    }

    private ClaimResponse toResponse(Claim claim) {
        if (claim == null) return null;
        return new ClaimResponse(
                claim.getId(), 
                claim.getPolicyId(), 
                claim.getAmount(), 
                claim.getStatus() != null ? claim.getStatus().name() : null,
                claim.getCustomerId(),
                claim.getTimeOfCreation(),
                claim.getIncidentDate() != null ? claim.getIncidentDate().toString() : null,
                claim.getIncidentLocation(),
                claim.getDescription(),
                claim.getClaimForm() != null, 
                claim.getAadhaarCard() != null, 
                claim.getEvidences() != null
        );
    }
}
