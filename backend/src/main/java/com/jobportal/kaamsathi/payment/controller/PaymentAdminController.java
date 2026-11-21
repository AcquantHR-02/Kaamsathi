package com.jobportal.kaamsathi.payment.controller;

import com.jobportal.kaamsathi.payment.dto.PaymentRequestResponse;
import com.jobportal.kaamsathi.payment.dto.RejectPaymentRequest;
import com.jobportal.kaamsathi.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Admin approval queue for (fake) payments. Every method here is ADMIN only (class-level @PreAuthorize).
 */
@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasRole('ADMIN')")
public class PaymentAdminController {

    private final PaymentService paymentService;

    public PaymentAdminController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /** GET /api/admin/payments/pending → 200 + waiting payments, oldest first */
    @GetMapping("/pending")
    public List<PaymentRequestResponse> pending() {
        return paymentService.listPending();
    }

    /** POST /api/admin/payments/{id}/approve → 200 (subscription starts) */
    @PostMapping("/{id}/approve")
    public PaymentRequestResponse approve(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return paymentService.approve(UUID.fromString(jwt.getSubject()), id);
    }

    /** POST /api/admin/payments/{id}/reject {reason} → 200 (owner may send a new request) */
    @PostMapping("/{id}/reject")
    public PaymentRequestResponse reject(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id,
                                         @Valid @RequestBody RejectPaymentRequest request) {
        return paymentService.reject(UUID.fromString(jwt.getSubject()), id, request.reason());
    }
}
