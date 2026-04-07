package com.smartSure.PolicyService.mapper;

import com.smartSure.PolicyService.dto.policy.PolicyPurchaseRequest;
import com.smartSure.PolicyService.dto.policy.PolicyResponse;
import com.smartSure.PolicyService.dto.premium.PremiumResponse;
import com.smartSure.PolicyService.entity.Policy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PremiumMapper.class, PolicyTypeMapper.class})
public interface PolicyMapper {

    @Mapping(target = "status", expression = "java(policy.getStatus() != null ? policy.getStatus().name() : null)")
    @Mapping(target = "paymentFrequency", expression = "java(policy.getPaymentFrequency() != null ? policy.getPaymentFrequency().name() : null)")
    @Mapping(target = "policyType", source = "policy.policyType")
    @Mapping(target = "premiums", ignore = true)
    @Mapping(target = "createdAt", expression = "java(policy.getCreatedAt() != null ? policy.getCreatedAt().toString() : null)")
    PolicyResponse toResponse(Policy policy);

    @Mapping(target = "status", expression = "java(policy.getStatus() != null ? policy.getStatus().name() : null)")
    @Mapping(target = "paymentFrequency", expression = "java(policy.getPaymentFrequency() != null ? policy.getPaymentFrequency().name() : null)")
    @Mapping(target = "policyType", source = "policy.policyType")
    @Mapping(target = "premiums", source = "premiumResponses")
    @Mapping(target = "createdAt", expression = "java(policy.getCreatedAt() != null ? policy.getCreatedAt().toString() : null)")
    PolicyResponse toResponseWithPremiums(Policy policy, List<PremiumResponse> premiumResponses);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "policyNumber", ignore = true)
    @Mapping(target = "customerId", ignore = true)
    @Mapping(target = "policyType", ignore = true)
    @Mapping(target = "premiumAmount", ignore = true)
    @Mapping(target = "endDate", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "remarks", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(target = "premiums", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Policy toEntity(PolicyPurchaseRequest request);
}