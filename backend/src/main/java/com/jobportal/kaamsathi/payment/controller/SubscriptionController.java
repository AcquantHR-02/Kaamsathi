package com.jobportal.kaamsathi.payment.controller;

import com.jobportal.kaamsathi.payment.dto.MySubscriptionResponse;
import com.jobportal.kaamsathi.payment.service.SubscriptionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Owner's current plan. Path sits under /api/companies/me (it is about MY company), but the data
 * belongs to the payment module, so the controller lives here.
 */
@RestController
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    /** GET /api/companies/me/subscription → 200 {free, current, next} */
    @GetMapping("/api/companies/me/subscription")
    @PreAuthorize("hasRole('COMPANY_OWNER')")
    public MySubscriptionResponse mine(@AuthenticationPrincipal Jwt jwt) {
        return subscriptionService.getMine(UUID.fromString(jwt.getSubject()));
    }
}
