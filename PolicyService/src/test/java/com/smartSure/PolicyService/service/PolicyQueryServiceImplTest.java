package com.smartSure.PolicyService.service;

import com.smartSure.PolicyService.dto.policy.*;
import com.smartSure.PolicyService.entity.Policy;
import com.smartSure.PolicyService.mapper.PolicyMapper;
import com.smartSure.PolicyService.mapper.PremiumMapper;
import com.smartSure.PolicyService.repository.PolicyRepository;
import com.smartSure.PolicyService.repository.PolicyTypeRepository;
import com.smartSure.PolicyService.repository.PremiumRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PolicyQueryServiceImpl Unit Tests")
class PolicyQueryServiceImplTest {

    @Mock private PolicyRepository       policyRepository;
    @Mock private PolicyTypeRepository   policyTypeRepository;
    @Mock private PremiumRepository      premiumRepository;
    @Mock private PremiumCalculator      premiumCalculator;
    @Mock private PolicyMapper           policyMapper;
    @Mock private PremiumMapper          premiumMapper;

    @InjectMocks
    private PolicyQueryServiceImpl queryService;

    private final Long CUSTOMER_ID = 42L;
    private final Long POLICY_ID   = 1L;

    @Test
    @DisplayName("getCustomerPolicies: success")
    void getCustomerPolicies_success() {
        Pageable pageable = PageRequest.of(0, 10);
        Policy p = Policy.builder().id(POLICY_ID).customerId(CUSTOMER_ID).build();
        when(policyRepository.findByCustomerId(eq(CUSTOMER_ID), any())).thenReturn(new PageImpl<>(List.of(p)));
        when(policyMapper.toResponse(any())).thenReturn(PolicyResponse.builder().id(POLICY_ID).build());

        PolicyPageResponse result = queryService.getCustomerPolicies(CUSTOMER_ID, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo(POLICY_ID);
    }

    @Test
    @DisplayName("getPolicyById: as owner success")
    void getPolicyById_success() {
        Policy p = Policy.builder().id(POLICY_ID).customerId(CUSTOMER_ID).build();
        when(policyRepository.findById(POLICY_ID)).thenReturn(Optional.of(p));
        when(premiumRepository.findByPolicy_Id(POLICY_ID)).thenReturn(Collections.emptyList());
        when(policyMapper.toResponseWithPremiums(any(), anyList())).thenReturn(PolicyResponse.builder().id(POLICY_ID).build());

        PolicyResponse result = queryService.getPolicyById(POLICY_ID, CUSTOMER_ID, false);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(POLICY_ID);
    }
}
