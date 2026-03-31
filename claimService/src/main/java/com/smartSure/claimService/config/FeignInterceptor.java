package com.smartSure.claimService.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.smartSure.claimService.util.HeaderUtils;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class FeignInterceptor implements RequestInterceptor {

    @Value("${internal.secret}")
    private String internalSecret;

    @Override
    public void apply(RequestTemplate template) {

        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            HeaderUtils.copyHeaders(request, template);
        }

        // Always ensure X-Internal-Secret is set — even if RequestContextHolder was null
        if (!template.headers().containsKey("X-Internal-Secret")) {
            template.header("X-Internal-Secret", internalSecret);
        }
    }
}