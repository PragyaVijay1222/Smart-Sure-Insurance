package com.smartSure.PolicyService.service;

import com.smartSure.PolicyService.client.AuthServiceClient;
import com.smartSure.PolicyService.client.PaymentServiceClient;
import com.smartSure.PolicyService.dto.client.CustomerProfileResponse;
import com.smartSure.PolicyService.dto.client.PaymentInitiateRequest;
import com.smartSure.PolicyService.dto.client.PaymentInitiateResponse;
import com.smartSure.PolicyService.dto.event.PolicyCancelledEvent;
import com.smartSure.PolicyService.dto.event.PolicyPurchasedEvent;
import com.smartSure.PolicyService.dto.policy.*;
import com.smartSure.PolicyService.dto.premium.PremiumPaymentRequest;
import com.smartSure.PolicyService.dto.premium.PremiumResponse;
import com.smartSure.PolicyService.entity.Policy;
import com.smartSure.PolicyService.entity.PolicyType;
import com.smartSure.PolicyService.entity.Premium;
import com.smartSure.PolicyService.exception.*;
import com.smartSure.PolicyService.mapper.PolicyMapper;
import com.smartSure.PolicyService.mapper.PremiumMapper;
import com.smartSure.PolicyService.repository.AuditLogRepository;
import com.smartSure.PolicyService.repository.PolicyRepository;
import com.smartSure.PolicyService.repository.PolicyTypeRepository;
import com.smartSure.PolicyService.repository.PremiumRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyCommandServiceImpl implements PolicyCommandService {

    private final PolicyRepository policyRepository;
    private final PolicyTypeRepository policyTypeRepository;
    private final PremiumRepository premiumRepository;
    private final AuditLogRepository auditLogRepository;
    private final PremiumCalculator premiumCalculator;
    private final PolicyMapper policyMapper;
    private final PremiumMapper premiumMapper;
    private final NotificationPublisher notificationPublisher;
    private final AuthServiceClient authServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final PolicyQueryService queryService;

    @Override
    @Transactional
    @CircuitBreaker(name = "policyPurchase", fallbackMethod = "purchaseFallback")
    @RateLimiter(name = "policyPurchase", fallbackMethod = "purchaseRateLimitFallback")
    public PolicyResponse purchasePolicy(Long customerId, PolicyPurchaseRequest request) {
        log.info("Purchase request — customer={}, type={}", customerId, request.getPolicyTypeId());

        PolicyType type = policyTypeRepository.findById(request.getPolicyTypeId())
                .orElseThrow(() -> new PolicyTypeNotFoundException(request.getPolicyTypeId()));

        if (type.getStatus() != PolicyType.PolicyTypeStatus.ACTIVE) {
            throw new InactivePolicyTypeException(type.getName());
        }

        boolean exists = policyRepository.existsByCustomerIdAndPolicyType_IdAndStatusIn(
                customerId, type.getId(), List.of(Policy.PolicyStatus.CREATED, Policy.PolicyStatus.ACTIVE));
        if (exists)
            throw new DuplicatePolicyException();

        if (request.getCoverageAmount().compareTo(type.getMaxCoverageAmount()) > 0) {
            throw new CoverageExceedsLimitException(request.getCoverageAmount(), type.getMaxCoverageAmount());
        }

        BigDecimal premium = premiumCalculator.calculatePremium(type, request.getCoverageAmount(),
                request.getPaymentFrequency(), request.getCustomerAge()).getCalculatedPremium();

        Policy policy = policyMapper.toEntity(request);
        policy.setCustomerId(customerId);
        policy.setPolicyType(type);
        policy.setPremiumAmount(premium);
        policy.setPolicyNumber(generatePolicyNumber());
        policy.setEndDate(request.getStartDate().plusMonths(type.getTermMonths()));
        policy.setStatus(request.getStartDate().isAfter(LocalDate.now())
                ? Policy.PolicyStatus.CREATED
                : Policy.PolicyStatus.ACTIVE);

        Policy saved = policyRepository.save(policy);
        generatePremiumSchedule(saved, type.getTermMonths());
        saveAudit(saved.getId(), customerId, "CUSTOMER", "PURCHASED", null, saved.getStatus().name(), "New policy");

        CustomerProfileResponse profile = getCustomerProfileSafely(customerId);
        notificationPublisher.publishPolicyPurchased(PolicyPurchasedEvent.builder()
                .policyId(saved.getId()).policyNumber(saved.getPolicyNumber()).customerId(customerId)
                .customerEmail(profile != null ? profile.getEmail() : null)
                .customerName(profile != null && profile.getName() != null ? profile.getName() : "Customer")
                .policyTypeName(type.getName())
                .coverageAmount(saved.getCoverageAmount()).premiumAmount(saved.getPremiumAmount())
                .paymentFrequency(saved.getPaymentFrequency().name()).startDate(saved.getStartDate())
                .endDate(saved.getEndDate()).status(saved.getStatus().name()).build());

        return queryService.getPolicyById(saved.getId(), customerId, false);
    }

    public PolicyResponse purchaseFallback(Long customerId, PolicyPurchaseRequest request, Throwable t) {
        throw new ServiceUnavailableException("Policy purchase service", t);
    }

    public PolicyResponse purchaseRateLimitFallback(Long customerId, PolicyPurchaseRequest request, Throwable t) {
        throw new ServiceUnavailableException("Too many purchase requests. Please try again later.");
    }

    @Override
    @Transactional
    public PolicyResponse cancelPolicy(Long policyId, Long customerId, String reason) {
        Policy policy = policyRepository.findById(policyId).orElseThrow(() -> new PolicyNotFoundException(policyId));
        if (!policy.getCustomerId().equals(customerId))
            throw new UnauthorizedAccessException();
        if (policy.getStatus() == Policy.PolicyStatus.CANCELLED)
            throw new IllegalStateException("Already cancelled");

        String prev = policy.getStatus().name();
        policy.setStatus(Policy.PolicyStatus.CANCELLED);
        policy.setCancellationReason(reason);

        premiumRepository.findByPolicyIdAndStatus(policyId, Premium.PremiumStatus.PENDING)
                .forEach(p -> p.setStatus(Premium.PremiumStatus.WAIVED));

        Policy saved = policyRepository.save(policy);
        saveAudit(policyId, customerId, "CUSTOMER", "CANCELLED", prev, "CANCELLED", reason);

        CustomerProfileResponse cancelProfile = getCustomerProfileSafely(customerId);
        notificationPublisher.publishPolicyCancelled(PolicyCancelledEvent.builder()
                .policyId(saved.getId()).policyNumber(saved.getPolicyNumber()).customerId(customerId)
                .customerEmail(cancelProfile != null ? cancelProfile.getEmail() : null)
                .customerName(cancelProfile != null && cancelProfile.getName() != null ? cancelProfile.getName() : "Customer")
                .cancellationReason(reason).build());

        return policyMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PolicyResponse renewPolicy(Long customerId, PolicyRenewalRequest request) {
        Policy old = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new PolicyNotFoundException(request.getPolicyId()));
        if (!old.getCustomerId().equals(customerId))
            throw new UnauthorizedAccessException();

        old.setStatus(Policy.PolicyStatus.EXPIRED);
        PolicyType type = old.getPolicyType();
        BigDecimal coverage = request.getNewCoverageAmount() != null ? request.getNewCoverageAmount()
                : old.getCoverageAmount();
        Policy.PaymentFrequency freq = request.getPaymentFrequency() != null ? request.getPaymentFrequency()
                : old.getPaymentFrequency();
        BigDecimal premium = premiumCalculator.calculatePremium(type, coverage, freq, null).getCalculatedPremium();

        Policy renewal = Policy.builder().policyNumber(generatePolicyNumber()).customerId(customerId).policyType(type)
                .coverageAmount(coverage).premiumAmount(premium).paymentFrequency(freq)
                .startDate(old.getEndDate()).endDate(request.getNewEndDate()).status(Policy.PolicyStatus.ACTIVE)
                .build();

        Policy saved = policyRepository.save(renewal);
        generatePremiumSchedule(saved, type.getTermMonths());
        saveAudit(saved.getId(), customerId, "CUSTOMER", "RENEWED", null, "ACTIVE",
                "Renewed from " + old.getPolicyNumber());

        return queryService.getPolicyById(saved.getId(), customerId, false);
    }

    @Override
    @Transactional
    @CircuitBreaker(name = "paymentService", fallbackMethod = "payPremiumFallback")
    public PremiumResponse payPremium(Long customerId, PremiumPaymentRequest request) {
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new PolicyNotFoundException(request.getPolicyId()));
        if (!policy.getCustomerId().equals(customerId))
            throw new UnauthorizedAccessException();

        Premium premium = premiumRepository.findByIdAndPolicyId(request.getPremiumId(), request.getPolicyId())
                .orElseThrow(() -> new PremiumNotFoundException(request.getPremiumId(), request.getPolicyId()));

        if (premium.getStatus() == Premium.PremiumStatus.PAID)
            throw new IllegalStateException("Already paid");

        premium.setStatus(Premium.PremiumStatus.PAYMENT_IN_PROGRESS);
        premium.setPaymentMethod(request.getPaymentMethod());

        PaymentInitiateResponse payResp = paymentServiceClient.initiatePayment(String.valueOf(customerId),
                PaymentInitiateRequest.builder().policyId(policy.getId()).premiumId(premium.getId())
                        .amount(premium.getAmount()).paymentMethod(request.getPaymentMethod().name()).build());

        premium.setPaymentReference(payResp.getRazorpayOrderId());
        Premium saved = premiumRepository.save(premium);

        PremiumResponse resp = premiumMapper.toResponse(saved);
        resp.setRazorpayOrderId(payResp.getRazorpayOrderId());
        resp.setRazorpayKeyId(payResp.getRazorpayKeyId());
        return resp;
    }

    public PremiumResponse payPremiumFallback(Long customerId, PremiumPaymentRequest request, Throwable t) {
        throw new ServiceUnavailableException("Payment service", t);
    }

    @Override
    @Transactional
    public PolicyResponse adminUpdatePolicyStatus(Long policyId, PolicyStatusUpdateRequest request) {
        Policy policy = policyRepository.findById(policyId).orElseThrow(() -> new PolicyNotFoundException(policyId));
        String prev = policy.getStatus().name();
        policy.setStatus(request.getStatus());
        if (request.getReason() != null)
            policy.setCancellationReason(request.getReason());
        Policy saved = policyRepository.save(policy);
        saveAudit(policyId, 0L, "ADMIN", "STATUS_CHANGED", prev, request.getStatus().name(), request.getReason());
        return policyMapper.toResponse(saved);
    }

    @Override
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void expirePolicies() {
        List<Policy> expired = policyRepository.findExpiredActivePolicies(Policy.PolicyStatus.ACTIVE, LocalDate.now());
        expired.forEach(p -> {
            p.setStatus(Policy.PolicyStatus.EXPIRED);
            saveAudit(p.getId(), 0L, "SYSTEM", "EXPIRED", "ACTIVE", "EXPIRED", "Auto-expiry");
        });
    }

    @Override
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void markOverduePremiums() {
        log.info("Running markOverduePremiums scheduler...");
        premiumRepository.findOverduePremiums(Premium.PremiumStatus.PENDING, LocalDate.now())
                .forEach(p -> p.setStatus(Premium.PremiumStatus.OVERDUE));
    }

    @Override
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void sendPremiumDueReminders() {
        log.info("Running sendPremiumDueReminders scheduler...");
        LocalDate reminderDate = LocalDate.now().plusDays(7);
        premiumRepository.findByStatus(Premium.PremiumStatus.PENDING)
                .stream()
                .filter(p -> p.getDueDate().equals(reminderDate))
                .forEach(p -> {
                    CustomerProfileResponse profile = getCustomerProfileSafely(p.getPolicy().getCustomerId());
                    notificationPublisher.publishPremiumDueReminder(
                            com.smartSure.PolicyService.dto.event.PremiumDueReminderEvent.builder()
                                    .premiumId(p.getId())
                                    .policyId(p.getPolicy().getId())
                                    .policyNumber(p.getPolicy().getPolicyNumber())
                                    .customerId(p.getPolicy().getCustomerId())
                                    .customerEmail(profile != null ? profile.getEmail() : null)
                                    .customerName(profile != null ? profile.getName() : "Customer")
                                    .amount(p.getAmount())
                                    .dueDate(p.getDueDate())
                                    .build());
                });
    }

    @Override
    @Scheduled(cron = "0 5 9 * * *")
    @Transactional(readOnly = true)
    public void sendExpiryReminders() {
        log.info("Running sendExpiryReminders scheduler...");
        LocalDate reminderDate = LocalDate.now().plusDays(30);
        policyRepository.findExpiringPolicies(
                Policy.PolicyStatus.ACTIVE, reminderDate, reminderDate)
                .forEach(p -> {
                    CustomerProfileResponse profile = getCustomerProfileSafely(p.getCustomerId());
                    notificationPublisher.publishPolicyExpiryReminder(
                            com.smartSure.PolicyService.dto.event.PolicyExpiryReminderEvent.builder()
                                    .policyId(p.getId())
                                    .policyNumber(p.getPolicyNumber())
                                    .customerId(p.getCustomerId())
                                    .customerEmail(profile != null ? profile.getEmail() : null)
                                    .customerName(profile != null ? profile.getName() : "Customer")
                                    .policyTypeName(p.getPolicyType().getName())
                                    .endDate(p.getEndDate())
                                    .build());
                });
    }

    private String generatePolicyNumber() {
        return "POL-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-"
                + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }

    private void generatePremiumSchedule(Policy policy, int termMonths) {
        int interval = premiumCalculator.monthsBetweenInstallments(policy.getPaymentFrequency());
        int count = premiumCalculator.installmentCount(termMonths, policy.getPaymentFrequency());
        LocalDate dueDate = policy.getStartDate();
        List<Premium> premiums = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            premiums.add(Premium.builder().policy(policy).amount(policy.getPremiumAmount()).dueDate(dueDate)
                    .status(Premium.PremiumStatus.PENDING).build());
            dueDate = dueDate.plusMonths(interval);
        }
        premiumRepository.saveAll(premiums);
    }

    private void saveAudit(Long policyId, Long actorId, String role, String action, String fromStatus, String toStatus,
            String details) {
        try {
            auditLogRepository.save(com.smartSure.PolicyService.entity.AuditLog.builder().policyId(policyId)
                    .actorId(actorId).actorRole(role).action(action).fromStatus(fromStatus).toStatus(toStatus)
                    .details(details).build());
        } catch (Exception e) {
            log.error("Audit fail", e);
        }
    }

    private CustomerProfileResponse getCustomerProfileSafely(Long customerId) {
        try {
            return authServiceClient.getCustomerProfile(customerId);
        } catch (Exception e) {
            log.warn("Failed to fetch customer profile for id={}: {}", customerId, e.getMessage());
            return null;
        }
    }

}
