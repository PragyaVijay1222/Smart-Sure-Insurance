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

    @Mock private PolicyRepository       policyRepository;
    @Mock private PolicyTypeRepository   policyTypeRepository;
    @Mock private PremiumRepository      premiumRepository;
    @Mock private AuditLogRepository     auditLogRepository;
    @Mock private PremiumCalculator      premiumCalculator;
    @Mock private PolicyMapper           policyMapper;
    @Mock private NotificationPublisher  notificationPublisher;
    @Mock private AuthServiceClient      authServiceClient;
    @Mock private PaymentServiceClient   paymentServiceClient;

    @InjectMocks
    private PolicyCommandServiceImpl commandService;

    private PolicyType     activePolicyType;
    private Policy         savedPolicy;
    private PolicyResponse policyResponse;
    private final Long     CUSTOMER_ID  = 42L;
    private final Long     POLICY_ID    = 1L;
    private final Long     POLICY_TYPE_ID = 10L;

    @BeforeEach
    void setUp() {
        activePolicyType = PolicyType.builder()
                .id(POLICY_TYPE_ID).name("Health").status(PolicyType.PolicyTypeStatus.ACTIVE)
                .maxCoverageAmount(new BigDecimal("1000000.00")).termMonths(12).build();

        savedPolicy = Policy.builder()
                .id(POLICY_ID).customerId(CUSTOMER_ID).policyType(activePolicyType)
                .status(Policy.PolicyStatus.ACTIVE).policyNumber("POL-123").build();

        policyResponse = PolicyResponse.builder().id(POLICY_ID).status("ACTIVE").build();
    }

    @Test
    void purchasePolicy_happyPath_success() {
        PolicyPurchaseRequest request = PolicyPurchaseRequest.builder()
                .policyTypeId(POLICY_TYPE_ID).coverageAmount(new BigDecimal("500000.00"))
                .paymentFrequency(Policy.PaymentFrequency.MONTHLY).startDate(LocalDate.now()).build();

        when(policyTypeRepository.findById(POLICY_TYPE_ID)).thenReturn(Optional.of(activePolicyType));
        when(premiumCalculator.calculatePremium(any(), any(), any(), any())).thenReturn(
                PremiumCalculationResponse.builder().calculatedPremium(new BigDecimal("1000")).build());
        when(policyMapper.toEntity(any())).thenReturn(savedPolicy);
        when(policyRepository.save(any())).thenReturn(savedPolicy);
        when(policyMapper.toResponse(any())).thenReturn(policyResponse);
        when(premiumCalculator.monthsBetweenInstallments(any())).thenReturn(1);
        when(premiumCalculator.installmentCount(anyInt(), any())).thenReturn(12);

        PolicyResponse result = commandService.purchasePolicy(CUSTOMER_ID, request);

        assertThat(result).isNotNull();
        verify(policyRepository).save(any());
        verify(notificationPublisher).publishPolicyPurchased(any());
    }

    @Test
    void cancelPolicy_success() {
        when(policyRepository.findById(POLICY_ID)).thenReturn(Optional.of(savedPolicy));
        when(policyRepository.save(any())).thenReturn(savedPolicy);
        when(policyMapper.toResponse(any())).thenReturn(policyResponse);

        PolicyResponse result = commandService.cancelPolicy(POLICY_ID, CUSTOMER_ID, "reason");

        assertThat(result).isNotNull();
        assertThat(savedPolicy.getStatus()).isEqualTo(Policy.PolicyStatus.CANCELLED);
        verify(notificationPublisher).publishPolicyCancelled(any());
    }

    @Test
    void payPremium_success() {
        PremiumPaymentRequest request = PremiumPaymentRequest.builder()
                .policyId(POLICY_ID).premiumId(1L).paymentMethod(Premium.PaymentMethod.UPI).build();
        Premium premium = Premium.builder().id(1L).policy(savedPolicy).status(Premium.PremiumStatus.PENDING).build();

        when(policyRepository.findById(POLICY_ID)).thenReturn(Optional.of(savedPolicy));
        when(premiumRepository.findByIdAndPolicyId(1L, POLICY_ID)).thenReturn(Optional.of(premium));
        when(paymentServiceClient.initiatePayment(anyString(), any())).thenReturn(
                com.smartSure.PolicyService.dto.client.PaymentInitiateResponse.builder().razorpayOrderId("ORD123").build());
        when(premiumRepository.save(any())).thenReturn(premium);

        PremiumResponse result = commandService.payPremium(CUSTOMER_ID, request);

        assertThat(result).isNotNull();
        assertThat(premium.getStatus()).isEqualTo(Premium.PremiumStatus.PAYMENT_IN_PROGRESS);
    }

    @Test
    void expirePolicies_success() {
        Policy p = Policy.builder().id(1L).status(Policy.PolicyStatus.ACTIVE).build();
        when(policyRepository.findExpiredActivePolicies(any(), any())).thenReturn(List.of(p));

        commandService.expirePolicies();

        assertThat(p.getStatus()).isEqualTo(Policy.PolicyStatus.EXPIRED);
        verify(auditLogRepository).save(any());
    }
}
