package com.smartSure.PolicyService.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        
        // Handle cases where principal might be a string (like in @WithMockUser tests)
        // or a different object type without crashing.
        return null;
    }

    public static String getCurrentRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getAuthorities().isEmpty()) {
            return null;
        }

        return auth.getAuthorities().iterator().next().getAuthority();
    }
}