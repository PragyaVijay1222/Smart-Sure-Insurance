package com.smartSure.PolicyService.service;

import com.smartSure.PolicyService.dto.policytype.PolicyTypeRequest;
import com.smartSure.PolicyService.dto.policytype.PolicyTypeResponse;
import com.smartSure.PolicyService.entity.PolicyType;
import com.smartSure.PolicyService.exception.PolicyTypeNotFoundException;
import com.smartSure.PolicyService.mapper.PolicyTypeMapper;
import com.smartSure.PolicyService.repository.PolicyTypeRepository;
import com.smartSure.PolicyService.repository.PolicyRepository;
import com.smartSure.PolicyService.repository.PremiumRepository;
import com.smartSure.PolicyService.client.AuthServiceClient;
import com.smartSure.PolicyService.entity.Policy;
import com.smartSure.PolicyService.entity.Premium;
import com.smartSure.PolicyService.dto.client.CustomerProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import jakarta.annotation.PostConstruct;
import org.springframework.cache.CacheManager;
import java.util.Objects;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import com.smartSure.PolicyService.exception.ServiceUnavailableException;

import java.util.List;
@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyTypeService {

    private final PolicyTypeRepository policyTypeRepository;
    private final PolicyTypeMapper     policyTypeMapper;
    private final CacheManager         cacheManager;
    private final PolicyRepository     policyRepository;
    private final PremiumRepository    premiumRepository;
    private final AuthServiceClient    authServiceClient;
    private final NotificationService  notificationService;

    // Clears the cache on startup to ensure no stale empty lists are left from previous failures
    @PostConstruct
    public void clearStaleCaches() {
        log.info("PolicyService: Proactively clearing stale policy catalogues from Redis Cache...");
        try {
            Objects.requireNonNull(cacheManager.getCache("policyTypes")).clear();
            Objects.requireNonNull(cacheManager.getCache("policyById")).clear();
            log.info("PolicyService: Caches successfully evicted.");
        } catch (Exception e) {
            log.warn("PolicyService: Cache eviction failed (might be a fresh startup without Redis) — reason={}", e.getMessage());
        }
    }

    // ── Public ────────────────────────────────────────────────

    // Returns all active policy types ordered by category — cached and circuit-breaker protected
    @Cacheable("policyTypes")
    @CircuitBreaker(name = "policyTypeService", fallbackMethod = "getAllActivePolicyTypesFallback")
    public List<PolicyTypeResponse> getAllActivePolicyTypes() {
        return policyTypeRepository
                .findByStatusOrderByCategory(PolicyType.PolicyTypeStatus.ACTIVE)
                .stream()
                .map(policyTypeMapper::toResponse)
                .toList();
    }

    // Fallback for cache deserialization failures or DB outages
    public List<PolicyTypeResponse> getAllActivePolicyTypesFallback(Throwable t) {
        log.error("PolicyTypeService: getAllActivePolicyTypes CIRCUIT BREAKER fallback — reason={}", t.getMessage());
        // Bypass cache and go direct to DB if it's a Redis/Jackson failure
        return policyTypeRepository
                .findByStatusOrderByCategory(PolicyType.PolicyTypeStatus.ACTIVE)
                .stream()
                .map(policyTypeMapper::toResponse)
                .toList();
    }

    // Fetches a single policy type by ID — cached and circuit-breaker protected
    @Cacheable(value = "policyById", key = "#id")
    public PolicyTypeResponse getPolicyTypeById(Long id) {
        return policyTypeMapper.toResponse(getPolicyTypeEntity(id));
    }


    // Returns active policy types filtered by insurance category
    public List<PolicyTypeResponse> getByCategory(PolicyType.InsuranceCategory category) {
        return policyTypeRepository.findByCategory(category)
                .stream()
                .filter(pt -> pt.getStatus() == PolicyType.PolicyTypeStatus.ACTIVE)
                .map(policyTypeMapper::toResponse)
                .toList();
    }

    // ── Admin ─────────────────────────────────────────────────

    // Returns all policy types regardless of status — admin use only
    public List<PolicyTypeResponse> getAllPolicyTypes() {
        return policyTypeRepository.findAll()
                .stream()
                .map(policyTypeMapper::toResponse)
                .toList();
    }

    // Creates a new policy type, validates uniqueness and age range, then evicts the cache
    @Transactional
    @CacheEvict(value = {"policyTypes", "policyById"}, allEntries = true)
    public PolicyTypeResponse createPolicyType(PolicyTypeRequest request) {
        if (policyTypeRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Policy type already exists: " + request.getName());
        }
        validateAgeRange(request.getMinAge(), request.getMaxAge());

        PolicyType pt = PolicyType.builder()
                .name(request.getName())
                .description(request.getDescription())
                .category(request.getCategory())
                .basePremium(request.getBasePremium())
                .maxCoverageAmount(request.getMaxCoverageAmount())
                .deductibleAmount(request.getDeductibleAmount())
                .termMonths(request.getTermMonths())
                .minAge(request.getMinAge())
                .maxAge(request.getMaxAge())
                .coverageDetails(request.getCoverageDetails())
                .status(PolicyType.PolicyTypeStatus.ACTIVE)
                .build();

        return policyTypeMapper.toResponse(policyTypeRepository.save(pt));
    }

    // Updates all fields of an existing policy type and evicts the cache
    @Transactional
    @CacheEvict(value = {"policyTypes", "policyById"}, allEntries = true)
    public PolicyTypeResponse updatePolicyType(Long id, PolicyTypeRequest request) {
        PolicyType pt = getPolicyTypeEntity(id);
        validateAgeRange(request.getMinAge(), request.getMaxAge());

        pt.setName(request.getName());
        pt.setDescription(request.getDescription());
        pt.setCategory(request.getCategory());
        pt.setBasePremium(request.getBasePremium());
        pt.setMaxCoverageAmount(request.getMaxCoverageAmount());
        pt.setDeductibleAmount(request.getDeductibleAmount());
        pt.setTermMonths(request.getTermMonths());
        pt.setMinAge(request.getMinAge());
        pt.setMaxAge(request.getMaxAge());
        pt.setCoverageDetails(request.getCoverageDetails());

        return policyTypeMapper.toResponse(policyTypeRepository.save(pt));
    }

    // Soft-deletes a policy type by setting its status to DISCONTINUED and evicts the cache.
    // Also cancels all active/created policies and alerts customers.
    @Transactional
    @CacheEvict(value = {"policyTypes", "policyById"}, allEntries = true)
    public void deletePolicyType(Long id) {
        PolicyType pt = getPolicyTypeEntity(id);
        pt.setStatus(PolicyType.PolicyTypeStatus.DISCONTINUED);
        policyTypeRepository.save(pt);

        // Discontinue policies associated with this product
        List<Policy> activePolicies = policyRepository.findByPolicyType_Id(id).stream()
                .filter(p -> p.getStatus() == Policy.PolicyStatus.ACTIVE || p.getStatus() == Policy.PolicyStatus.CREATED)
                .toList();

        for (Policy policy : activePolicies) {
            policy.setStatus(Policy.PolicyStatus.DISCONTINUED);
            policy.setCancellationReason("Product Discontinued");
            policyRepository.save(policy);

            // Fetch customer detail
            String customerName = "Customer";
            String email = null;
            try {
                CustomerProfileResponse profile = authServiceClient.getCustomerProfile(policy.getCustomerId());
                if (profile != null) {
                    customerName = profile.getName();
                    email = profile.getEmail();
                } else {
                    email = authServiceClient.getCustomerEmail(policy.getCustomerId());
                }
            } catch (Exception e) {
                log.warn("Failed to retrieve customer info for ID: {}. Reason: {}", policy.getCustomerId(), e.getMessage());
            }

            if (email != null) {
                java.math.BigDecimal refundedAmount = premiumRepository.totalPaidAmountByPolicy(policy.getId(), Premium.PremiumStatus.PAID);
                notificationService.sendPolicyDiscontinuedEmail(email, customerName, policy.getPolicyNumber(), refundedAmount);
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────

    // Fetches a policy type entity by ID or throws PolicyTypeNotFoundException
    private PolicyType getPolicyTypeEntity(Long id) {
        return policyTypeRepository.findById(id)
                .orElseThrow(() -> new PolicyTypeNotFoundException(id));
    }

    // Throws IllegalArgumentException if minAge is greater than maxAge
    private void validateAgeRange(Integer minAge, Integer maxAge) {
        if (minAge != null && maxAge != null && minAge > maxAge) {
            throw new IllegalArgumentException("Min age cannot be greater than max age");
        }
    }
}