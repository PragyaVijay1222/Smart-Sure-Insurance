package com.smartSure.paymentService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "AuthService")
public interface AuthServiceClient {

    @GetMapping("/user/internal/{userId}/email")
    String getUserEmail(@PathVariable("userId") Long userId);
}
