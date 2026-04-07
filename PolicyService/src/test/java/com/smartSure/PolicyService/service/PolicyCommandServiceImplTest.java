package com.smartSure.PolicyService.service;

import com.smartSure.PolicyService.client.AuthServiceClient;
import com.smartSure.PolicyService.client.PaymentServiceClient;
import com.smartSure.PolicyService.dto.calculation.PremiumCalculationResponse;
import com.smartSure.PolicyService.dto.policy.*;
import com.smartSure.PolicyService.dto.premium.PremiumPaymentRequest;
import com.smartSure.PolicyService.dto.premium.PremiumResponse;
import com.smartSure.PolicyService.entity.*;
import com.smartSure.PolicyService.exception.*;
import com.smartSure.PolicyService.mapper.PolicyMapper;
import com.smartSure.PolicyService.mapper.PremiumMapper;
import com.smartSure.PolicyService.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PolicyCommandServiceImpl Unit Tests")
class PolicyCommandServiceImplTest {

    @Mock
    private PolicyRepository policyRepository;
    @Mock
    private PolicyTypeRepository policyTypeRepository;
    @Mock
    private PremiumRepository premiumRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private PremiumCalculator premiumCalculator;
    @Mock
    private PolicyMapper policyMapper;
    @Mock
    private PremiumMapper premiumMapper;
    @Mock
    private NotificationPublisher notificationPublisher;
    @Mock
    private AuthServiceClient authServiceClient;
    @Mock
    private PaymentServiceClient paymentServiceClient;
    @Mock
    private PolicyQueryService queryService;

    @InjectMocks
    private PolicyCommandServiceImpl commandService;

    private PolicyType activePolicyType;
    private Policy savedPolicy;
    private PolicyResponse policyResponse;
    private final Long CUSTOMER_ID = 42L;
    private final Long POLICY_ID = 1L;
    private final Long POLICY_TYPE_ID = 10L;

    @BeforeEach
    void setUp() {
        activePolicyType = PolicyType.builder()
                .id(POLICY_TYPE_ID).name("Health").status(PolicyType.PolicyTypeStatus.ACTIVE)
                .maxCoverageAmount(new BigDecimal("1000000.00")).termMonths(12).build();

        savedPolicy = Policy.builder()
                .id(POLICY_ID).customerId(CUSTOMER_ID).policyType(activePolicyType)
                .status(Policy.PolicyStatus.ACTIVE).policyNumber("POL-123")
                .startDate(LocalDate.now())
                .paymentFrequency(Policy.PaymentFrequency.MONTHLY)
                .coverageAmount(new BigDecimal("500000.00"))
                .premiumAmount(new BigDecimal("1000.00"))
                .build();

        policyResponse = PolicyResponse.builder().id(POLICY_ID).status("ACTIVE").build();
    }

    @Test
    @DisplayName("purchasePolicy: success")
    void purchasePolicy_success() {
        PolicyPurchaseRequest request = PolicyPurchaseRequest.builder()
                .policyTypeId(POLICY_TYPE_ID).coverageAmount(new BigDecimal("500000.00"))
                .paymentFrequency(Policy.PaymentFrequency.MONTHLY).startDate(LocalDate.now()).build();

        when(policyTypeRepository.findById(POLICY_TYPE_ID)).thenReturn(Optional.of(activePolicyType));
        when(premiumCalculator.calculatePremium(any(), any(), any(), any())).thenReturn(
                PremiumCalculationResponse.builder().calculatedPremium(new BigDecimal("1000")).build());
        when(policyMapper.toEntity(any())).thenReturn(savedPolicy);
        when(policyRepository.save(any())).thenReturn(savedPolicy);
        when(premiumCalculator.monthsBetweenInstallments(any())).thenReturn(1);
        when(premiumCalculator.installmentCount(anyInt(), any())).thenReturn(12);
        when(queryService.getPolicyById(anyLong(), anyLong(), anyBoolean())).thenReturn(policyResponse);

        PolicyResponse result = commandService.purchasePolicy(CUSTOMER_ID, request);

        assertThat(result).isNotNull();
        verify(policyRepository).save(any());
        verify(notificationPublisher).publishPolicyPurchased(any());
    }

    @Test
    @DisplayName("cancelPolicy: success")
    void cancelPolicy_success() {
        when(policyRepository.findById(POLICY_ID)).thenReturn(Optional.of(savedPolicy));
        when(policyRepository.save(any())).thenReturn(savedPolicy);
        when(policyMapper.toResponse(any())).thenReturn(policyResponse);

        PolicyResponse result = commandService.cancelPolicy(POLICY_ID, CUSTOMER_ID, "reason");

        assertThat(result).isNotNull();
        assertThat(savedPolicy.getStatus()).isEqualTo(Policy.PolicyStatus.CANCELLED);
    }
}
