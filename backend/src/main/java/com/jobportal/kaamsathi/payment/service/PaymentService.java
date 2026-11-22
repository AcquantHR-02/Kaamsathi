package com.jobportal.kaamsathi.payment.service;

import com.jobportal.kaamsathi.auth.service.UserService;
import com.jobportal.kaamsathi.common.dto.PageResponse;
import com.jobportal.kaamsathi.common.exception.ApiException;
import com.jobportal.kaamsathi.common.exception.ErrorCode;
import com.jobportal.kaamsathi.common.util.Paging;
import com.jobportal.kaamsathi.company.service.CompanyService;
import com.jobportal.kaamsathi.file.entity.FileKind;
import com.jobportal.kaamsathi.file.service.FileService;
import com.jobportal.kaamsathi.payment.dto.PaymentRequestResponse;
import com.jobportal.kaamsathi.payment.dto.SubmitPaymentRequest;
import com.jobportal.kaamsathi.payment.entity.PaymentRequest;
import com.jobportal.kaamsathi.payment.entity.PaymentStatus;
import com.jobportal.kaamsathi.payment.entity.Plan;
import com.jobportal.kaamsathi.payment.entity.Subscription;
import com.jobportal.kaamsathi.payment.repository.PaymentRequestRepository;
import com.jobportal.kaamsathi.payment.event.PaymentApproved;
import com.jobportal.kaamsathi.payment.event.PaymentRejected;
import com.jobportal.kaamsathi.payment.repository.SubscriptionRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Payments. Owner: send a (fake) payment for a plan + billing history.
 * Admin: queue of waiting payments, approve (→ subscription starts) or reject.
 */
@Service
public class PaymentService {

    private final PaymentRequestRepository paymentRequestRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PlanService planService;
    private final PaymentProvider paymentProvider;      // interface → today ManualApprovalProvider
    private final CompanyService companyService;
    private final UserService userService;
    private final FileService fileService;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    public PaymentService(PaymentRequestRepository paymentRequestRepository,
                          SubscriptionRepository subscriptionRepository, PlanService planService,
                          PaymentProvider paymentProvider, CompanyService companyService,
                          UserService userService, FileService fileService,
                          ApplicationEventPublisher events, Clock clock) {
        this.events = events;
        this.paymentRequestRepository = paymentRequestRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.planService = planService;
        this.paymentProvider = paymentProvider;
        this.companyService = companyService;
        this.userService = userService;
        this.fileService = fileService;
        this.clock = clock;
    }

    /**
     * Owner says "I paid for this plan". Order = cheap checks first, file upload last
     * (so a rejected request doesn't leave a stray screenshot on disk).
     */
    @Transactional
    public PaymentRequestResponse submit(UUID ownerId, SubmitPaymentRequest request, MultipartFile screenshot) {
        UUID companyId = companyService.requireVerifiedCompany(ownerId);       // 409 no company / not verified
        Plan plan = planService.requireBuyable(request.planId());               // 404 unknown / hidden plan
        if (paymentRequestRepository.existsByCompanyIdAndStatus(companyId, PaymentStatus.PENDING_APPROVAL)) {
            throw new ApiException(ErrorCode.PAYMENT_ALREADY_PENDING);         // friendly check
        }

        UUID screenshotId = null;
        if (screenshot != null && !screenshot.isEmpty()) {                     // optional
            screenshotId = fileService.upload(ownerId, FileKind.PAYMENT_PROOF, screenshot).id(); // 413 / 415
        }

        String transactionId = request.transactionId().trim();
        int amount = plan.getPriceRupees();                                     // COPY the price now
        Instant now = clock.instant();
        PaymentRequest payment = new PaymentRequest(UUID.randomUUID(), companyId, plan.getId(),
                amount, transactionId, screenshotId, ownerId, now);

        // ask the provider (fake one always says PENDING_APPROVAL; a real gateway could decide now)
        PaymentStatus decision = paymentProvider.check(transactionId, amount);
        if (decision == PaymentStatus.REJECTED) {
            payment.reject(null, "Payment could not be verified", now);       // null reviewer = system
        } else if (decision == PaymentStatus.APPROVED) {
            payment.approve(null, now);
        }

        try {
            paymentRequestRepository.saveAndFlush(payment);                    // INSERT now → race fails inside try
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(ErrorCode.PAYMENT_ALREADY_PENDING);         // DB UNIQUE pending_company_id
        }
        if (decision == PaymentStatus.APPROVED) {
            Subscription s = startSubscription(payment, plan, now);            // payment row exists now (FK)
            events.publishEvent(new PaymentApproved(payment.getId(), companyId, plan.getName(),
                    s.getStartsAt(), s.getEndsAt()));
        }
        return toResponse(payment, plan.getName());
    }

    // owner's billing history, newest first
    @Transactional(readOnly = true)
    public PageResponse<PaymentRequestResponse> listMine(UUID ownerId, Integer page, Integer size) {
        UUID companyId = userService.getCompanyId(ownerId);
        if (companyId == null) {
            throw new ApiException(ErrorCode.COMPANY_REQUIRED);
        }
        Page<PaymentRequest> requests =
                paymentRequestRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, Paging.of(page, size));
        Map<UUID, String> planNames = planService.namesByIds(
                requests.getContent().stream().map(PaymentRequest::getPlanId).toList());
        Map<UUID, String> companyNames = companyService.namesByIds(List.of(companyId));
        return PageResponse.from(requests, r ->
                PaymentRequestResponse.from(r, planNames.get(r.getPlanId()), companyNames.get(r.getCompanyId())));
    }

    // ---- admin ----

    // dashboard numbers
    @Transactional(readOnly = true)
    public long countByStatus(PaymentStatus status) {
        return paymentRequestRepository.countByStatus(status);
    }

    @Transactional(readOnly = true)
    public long approvedRevenueRupees() {
        return paymentRequestRepository.sumApprovedRupees();
    }

    // approval queue: oldest waiting first (first come, first served)
    @Transactional(readOnly = true)
    public List<PaymentRequestResponse> listPending() {
        List<PaymentRequest> pending =
                paymentRequestRepository.findByStatusOrderByCreatedAtAsc(PaymentStatus.PENDING_APPROVAL);
        Map<UUID, String> planNames = planService.namesByIds(
                pending.stream().map(PaymentRequest::getPlanId).toList());
        Map<UUID, String> companyNames = companyService.namesByIds(
                pending.stream().map(PaymentRequest::getCompanyId).toList());     // 1 query for all companies
        return pending.stream()
                .map(r -> PaymentRequestResponse.from(r, planNames.get(r.getPlanId()), companyNames.get(r.getCompanyId())))
                .toList();
    }

    @Transactional
    public PaymentRequestResponse approve(UUID adminId, UUID paymentId) {
        PaymentRequest payment = findPendingForUpdate(paymentId);                // 404 / 409, row locked
        Plan plan = planService.require(payment.getPlanId());                   // may be hidden by now: still OK
        Instant now = clock.instant();
        payment.approve(adminId, now);                                          // dirty checking → UPDATE
        Subscription subscription = startSubscription(payment, plan, now);
        events.publishEvent(new PaymentApproved(payment.getId(), payment.getCompanyId(), plan.getName(),
                subscription.getStartsAt(), subscription.getEndsAt()));
        return toResponse(payment, plan.getName());
    }

    @Transactional
    public PaymentRequestResponse reject(UUID adminId, UUID paymentId, String reason) {
        PaymentRequest payment = findPendingForUpdate(paymentId);
        payment.reject(adminId, reason.trim(), clock.instant());
        Plan plan = planService.require(payment.getPlanId());
        events.publishEvent(new PaymentRejected(payment.getId(), payment.getCompanyId(), plan.getName(),
                payment.getRejectionReason()));
        return toResponse(payment, plan.getName());
    }

    // ---- helpers ----

    // one payment → reply with plan + company names
    private PaymentRequestResponse toResponse(PaymentRequest payment, String planName) {
        String companyName = companyService.namesByIds(List.of(payment.getCompanyId())).get(payment.getCompanyId());
        return PaymentRequestResponse.from(payment, planName, companyName);
    }

    // SELECT ... FOR UPDATE: a 2nd admin click waits here, then sees "already reviewed"
    private PaymentRequest findPendingForUpdate(UUID paymentId) {
        PaymentRequest payment = paymentRequestRepository.findForUpdateById(paymentId)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));
        if (!payment.isPending()) {
            throw new ApiException(ErrorCode.PAYMENT_NOT_PENDING);
        }
        return payment;
    }

    /**
     * New plan period. Renewal while a period is still running → the new one starts when the old one ends
     * (the owner never loses paid days). Limits are COPIED from the plan.
     */
    private Subscription startSubscription(PaymentRequest payment, Plan plan, Instant now) {
        Instant start = subscriptionRepository.findLatest(payment.getCompanyId())
                .map(Subscription::getEndsAt)
                .filter(end -> end.isAfter(now))                                // ended already → start now
                .orElse(now);
        Instant end = start.plus(Duration.ofDays(plan.getDurationDays()));

        Subscription subscription = new Subscription(UUID.randomUUID(), payment.getCompanyId(), plan.getId(),
                payment.getId(), plan.getJobSlots(), plan.getRecruiterSeats(), start, end, now);
        try {
            subscriptionRepository.saveAndFlush(subscription);                  // INSERT now → race fails inside try
        } catch (DataIntegrityViolationException e) {
            throw new ApiException(ErrorCode.PAYMENT_NOT_PENDING);              // UNIQUE payment_request_id
        }
        return subscription;
    }

    // audit log label: "Sahyadri Softech · Growth · Rs 2499"; unknown id → null
    @Transactional(readOnly = true)
    public String auditLabel(UUID paymentId) {
        return paymentRequestRepository.findById(paymentId)
                .map(p -> companyService.namesByIds(List.of(p.getCompanyId())).get(p.getCompanyId())
                        + " · " + planService.namesByIds(List.of(p.getPlanId())).get(p.getPlanId())
                        + " · Rs " + p.getAmountRupees())
                .orElse(null);
    }
}
