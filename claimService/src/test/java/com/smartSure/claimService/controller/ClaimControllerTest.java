package com.smartSure.claimService.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartSure.claimService.dto.ClaimRequest;
import com.smartSure.claimService.dto.ClaimResponse;
import com.smartSure.claimService.dto.PolicyDTO;
import com.smartSure.claimService.entity.Status;
import com.smartSure.claimService.service.ClaimCommandService;
import com.smartSure.claimService.service.ClaimQueryService;
import com.smartSure.claimService.config.SecurityConfig;
import com.smartSure.claimService.security.HeaderAuthenticationFilter;
import com.smartSure.claimService.security.InternalRequestFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.Mockito.lenient;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClaimController.class)
@Import(SecurityConfig.class)
@ExtendWith(MockitoExtension.class)
class ClaimControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClaimCommandService commandService;

    @MockBean
    private ClaimQueryService   queryService;

    @MockBean
    private InternalRequestFilter internalRequestFilter;

    @MockBean
    private HeaderAuthenticationFilter headerAuthenticationFilter;

    @Autowired
    private ObjectMapper objectMapper;

    private ClaimResponse claimResponse;
    private static final Long CLAIM_ID = 1L;
    private static final Long POLICY_ID = 42L;

    @BeforeEach
    void setUp() throws Exception {
        claimResponse = new ClaimResponse(CLAIM_ID, POLICY_ID, new BigDecimal("1000.00"), Status.DRAFT.name(), null, LocalDateTime.now(), null, null, null, false, false, false);
        
        // Bypass filters for testing
        lenient().doAnswer(invocation -> {
            jakarta.servlet.ServletRequest request = invocation.getArgument(0);
            jakarta.servlet.ServletResponse response = invocation.getArgument(1);
            jakarta.servlet.FilterChain filterChain = invocation.getArgument(2);
            filterChain.doFilter(request, response);
            return null;
        }).when(internalRequestFilter).doFilter(any(), any(), any());

        lenient().doAnswer(invocation -> {
            jakarta.servlet.ServletRequest request = invocation.getArgument(0);
            jakarta.servlet.ServletResponse response = invocation.getArgument(1);
            jakarta.servlet.FilterChain filterChain = invocation.getArgument(2);
            filterChain.doFilter(request, response);
            return null;
        }).when(headerAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @WithMockUser
    void createClaim_success() throws Exception {
        ClaimRequest request = new ClaimRequest();
        request.setPolicyId(POLICY_ID);
        
        when(commandService.createClaim(any(ClaimRequest.class))).thenReturn(claimResponse);

        mockMvc.perform(post("/api/claims").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(CLAIM_ID));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void deleteClaim_success() throws Exception {
        mockMvc.perform(delete("/api/claims/" + CLAIM_ID).with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void submitClaim_success() throws Exception {
        when(commandService.submitClaim(CLAIM_ID)).thenReturn(claimResponse);

        mockMvc.perform(put("/api/claims/" + CLAIM_ID + "/submit").with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void moveToStatus_success() throws Exception {
        when(commandService.moveToStatus(eq(CLAIM_ID), eq(Status.APPROVED))).thenReturn(claimResponse);

        mockMvc.perform(put("/api/claims/" + CLAIM_ID + "/status").with(csrf())
                .param("next", "APPROVED"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getClaimById_success() throws Exception {
        when(queryService.getClaimById(CLAIM_ID)).thenReturn(claimResponse);

        mockMvc.perform(get("/api/claims/" + CLAIM_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(CLAIM_ID));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllClaims_success() throws Exception {
        when(queryService.getAllClaims()).thenReturn(List.of(claimResponse));

        mockMvc.perform(get("/api/claims"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(CLAIM_ID));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getPolicyForClaim_success() throws Exception {
        PolicyDTO policyDTO = new PolicyDTO();
        policyDTO.setPolicyID(POLICY_ID);
        when(queryService.getPolicyForClaim(CLAIM_ID)).thenReturn(policyDTO);

        mockMvc.perform(get("/api/claims/" + CLAIM_ID + "/policy"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyID").value(POLICY_ID));
    }
}
