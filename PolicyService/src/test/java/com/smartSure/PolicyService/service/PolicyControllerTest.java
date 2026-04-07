package com.smartSure.PolicyService.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.smartSure.PolicyService.controller.PolicyController;
import com.smartSure.PolicyService.dto.policy.*;
import com.smartSure.PolicyService.dto.premium.PremiumPaymentRequest;
import com.smartSure.PolicyService.dto.premium.PremiumResponse;
import com.smartSure.PolicyService.entity.Policy;
import com.smartSure.PolicyService.entity.Premium;
import com.smartSure.PolicyService.exception.*;
import com.smartSure.PolicyService.security.HeaderAuthenticationFilter;
import com.smartSure.PolicyService.security.InternalRequestFilter;
import com.smartSure.PolicyService.security.SecurityUtils;
import com.smartSure.PolicyService.config.SecurityConfig;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.annotation.Import;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PolicyController.class)
@Import(SecurityConfig.class)
@ExtendWith(MockitoExtension.class)
@DisplayName("PolicyController Web Layer Tests (CQRS)")
class PolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PolicyCommandService commandService;

    @MockBean
    private PolicyQueryService   queryService;

    @MockBean
    private InternalRequestFilter internalRequestFilter;

    @MockBean
    private HeaderAuthenticationFilter headerAuthenticationFilter;

    private MockedStatic<SecurityUtils> mockedSecurityUtils;
    private ObjectMapper objectMapper;

    private PolicyResponse samplePolicyResponse;

    @BeforeEach
    void setUp() throws Exception {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        doAnswer(invocation -> {
            invocation.getArgument(2, jakarta.servlet.FilterChain.class)
                    .doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(internalRequestFilter).doFilter(any(), any(), any());

        doAnswer(invocation -> {
            invocation.getArgument(2, jakarta.servlet.FilterChain.class)
                    .doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(headerAuthenticationFilter).doFilter(any(), any(), any());

        samplePolicyResponse = PolicyResponse.builder()
                .id(1L)
                .policyNumber("POL-123")
                .status("ACTIVE")
                .build();

        mockedSecurityUtils = mockStatic(SecurityUtils.class);
        mockedSecurityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(42L);
        mockedSecurityUtils.when(SecurityUtils::getCurrentRole).thenReturn("ROLE_CUSTOMER");
    }

    @AfterEach
    void tearDown() {
        if (mockedSecurityUtils != null) {
            mockedSecurityUtils.close();
        }
    }

    @Nested
    @DisplayName("POST /api/policies/purchase")
    class PurchasePolicyEndpoint {
        @Test
        @WithMockUser(roles = "CUSTOMER")
        void purchasePolicy_success() throws Exception {
            String validJson = "{\"policyTypeId\":10, \"coverageAmount\":500000, \"paymentFrequency\":\"MONTHLY\", \"startDate\":\"" + LocalDate.now() + "\", \"customerAge\":30}";
            
            when(commandService.purchasePolicy(eq(42L), any())).thenReturn(samplePolicyResponse);
            
            mockMvc.perform(post("/api/policies/purchase")
                            .with(csrf())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(validJson))
                    .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("GET /api/policies/my")
    class GetMyPoliciesEndpoint {
        @Test
        @WithMockUser(roles = "CUSTOMER")
        void getMyPolicies_success() throws Exception {
            PolicyPageResponse pageResp = PolicyPageResponse.builder().content(List.of(samplePolicyResponse)).totalElements(1L).build();
            when(queryService.getCustomerPolicies(eq(42L), any())).thenReturn(pageResp);
            mockMvc.perform(get("/api/policies/my")).andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/policies/{policyId}")
    class GetPolicyByIdEndpoint {
        @Test
        @WithMockUser(roles = "CUSTOMER")
        void getPolicyById_success() throws Exception {
            when(queryService.getPolicyById(eq(1L), eq(42L), anyBoolean())).thenReturn(samplePolicyResponse);
            mockMvc.perform(get("/api/policies/1")).andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("PUT /api/policies/{policyId}/cancel")
    class CancelPolicyEndpoint {
        @Test
        @WithMockUser(roles = "CUSTOMER")
        void cancelPolicy_success() throws Exception {
            when(commandService.cancelPolicy(eq(1L), eq(42L), any())).thenReturn(samplePolicyResponse);
            mockMvc.perform(put("/api/policies/1/cancel").with(csrf())).andExpect(status().isOk());
        }
    }
}
