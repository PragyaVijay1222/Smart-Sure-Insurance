package com.smartSure.PolicyService.service;

import com.smartSure.PolicyService.dto.calculation.PremiumCalculationRequest;
import com.smartSure.PolicyService.dto.calculation.PremiumCalculationResponse;
import com.smartSure.PolicyService.dto.policy.*;
import com.smartSure.PolicyService.dto.premium.PremiumResponse;
import com.smartSure.PolicyService.entity.Policy;
import com.smartSure.PolicyService.exception.PolicyNotFoundException;
import com.smartSure.PolicyService.exception.PolicyTypeNotFoundException;
import com.smartSure.PolicyService.exception.UnauthorizedAccessException;
import com.smartSure.PolicyService.mapper.PolicyMapper;
import com.smartSure.PolicyService.mapper.PremiumMapper;
import com.smartSure.PolicyService.repository.PolicyRepository;
import com.smartSure.PolicyService.repository.PolicyTypeRepository;
import com.smartSure.PolicyService.repository.PremiumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PolicyQueryServiceImpl implements PolicyQueryService {

    private final PolicyRepository       policyRepository;
    private final PolicyTypeRepository   policyTypeRepository;
    private final PremiumRepository      premiumRepository;
    private final PremiumCalculator      premiumCalculator;
    private final PolicyMapper           policyMapper;
    private final PremiumMapper          premiumMapper;

    @Override
    @Transactional(readOnly = true)
    public PolicyPageResponse getCustomerPolicies(Long customerId, Pageable pageable) {
        Page<Policy> page = policyRepository.findByCustomerId(customerId, pageable);
        return toPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PolicyResponse getPolicyById(Long policyId, Long userId, boolean isAdmin) {
        Policy policy = policyRepository.findById(policyId).orElseThrow(() -> new PolicyNotFoundException(policyId));
        if (!isAdmin && !policy.getCustomerId().equals(userId)) throw new UnauthorizedAccessException();
        
        List<PremiumResponse> premiums = getPremiumsByPolicy(policyId, userId, isAdmin);
        return policyMapper.toResponseWithPremiums(policy, premiums);
    }

    @Override
    @Transactional(readOnly = true)
    public PolicyPageResponse getAllPolicies(Pageable pageable) {
        Page<Policy> page = policyRepository.findAll(pageable);
        return toPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PolicyResponse> getAdminCustomerPolicies(Long customerId) {
        return policyRepository.findByCustomerId(customerId).stream()
                .map(policy -> {
                    List<PremiumResponse> premiums = premiumRepository.findByPolicy_Id(policy.getId())
                            .stream().map(premiumMapper::toResponse).collect(java.util.stream.Collectors.toList());
                    return policyMapper.toResponseWithPremiums(policy, premiums);
                }).collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PremiumResponse> getPremiumsByPolicy(Long policyId, Long userId, boolean isAdmin) {
        // Enforce ownership check if not admin
        if (!isAdmin) {
             Policy p = policyRepository.findById(policyId).orElseThrow(() -> new PolicyNotFoundException(policyId));
             if (!p.getCustomerId().equals(userId)) throw new UnauthorizedAccessException();
        }
        return premiumRepository.findByPolicy_Id(policyId).stream()
                .map(premiumMapper::toResponse).collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PolicySummaryResponse getPolicySummary() {
        return PolicySummaryResponse.builder()
                .totalPolicies(policyRepository.count())
                .activePolicies(policyRepository.countByStatus(Policy.PolicyStatus.ACTIVE))
                .expiredPolicies(policyRepository.countByStatus(Policy.PolicyStatus.EXPIRED))
                .cancelledPolicies(policyRepository.countByStatus(Policy.PolicyStatus.CANCELLED))
                .totalPremiumCollected(premiumRepository.totalPremiumCollected(com.smartSure.PolicyService.entity.Premium.PremiumStatus.PAID))
                .totalCoverageProvided(policyRepository.sumActiveCoverages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PremiumCalculationResponse calculatePremium(PremiumCalculationRequest request) {
        return premiumCalculator.calculatePremium(
                policyTypeRepository.findById(request.getPolicyTypeId()).orElseThrow(() -> new PolicyTypeNotFoundException(request.getPolicyTypeId())),
                request.getCoverageAmount(), request.getPaymentFrequency(), request.getCustomerAge());
    }

    private PolicyPageResponse toPageResponse(Page<Policy> page) {
        return PolicyPageResponse.builder()
                .content(page.getContent().stream().map(policyMapper::toResponse).toList())
                .pageNumber(page.getNumber()).pageSize(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages()).last(page.isLast()).build();
    }
}
