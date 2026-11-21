package com.jobportal.kaamsathi.notification.listener;

import com.jobportal.kaamsathi.application.entity.ApplicationStatus;
import com.jobportal.kaamsathi.application.event.ApplicantsWaiting;
import com.jobportal.kaamsathi.application.event.ApplicationAutoClosed;
import com.jobportal.kaamsathi.application.event.ApplicationStatusChanged;
import com.jobportal.kaamsathi.application.event.ApplicationSubmitted;
import com.jobportal.kaamsathi.auth.event.RecruiterInvited;
import com.jobportal.kaamsathi.auth.service.UserService;
import com.jobportal.kaamsathi.company.event.CompanyRejected;
import com.jobportal.kaamsathi.company.event.CompanyVerified;
import com.jobportal.kaamsathi.job.event.JobBlocked;
import com.jobportal.kaamsathi.job.event.JobExpired;
import com.jobportal.kaamsathi.job.event.JobExpiring;
import com.jobportal.kaamsathi.notification.entity.NotificationType;
import com.jobportal.kaamsathi.notification.service.EmailSender;
import com.jobportal.kaamsathi.notification.service.NotificationService;
import com.jobportal.kaamsathi.payment.event.PaymentApproved;
import com.jobportal.kaamsathi.payment.event.PaymentRejected;
import com.jobportal.kaamsathi.payment.event.SubscriptionExpired;
import com.jobportal.kaamsathi.payment.event.SubscriptionExpiring;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * Hears business events and turns them into bell messages + emails.
 * @TransactionalEventListener = runs only AFTER the publisher's transaction COMMITTED
 * (a rolled-back action never sends "your company is verified").
 * Each handler catches its own errors: the user's action already succeeded, a failed message must not undo it.
 */
@Component
public class NotificationListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationListener.class);
    private static final DateTimeFormatter DATE =
            DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH).withZone(ZoneId.of("Asia/Kolkata"));

    private final NotificationService notifications;
    private final EmailSender emailSender;
    private final UserService userService;

    public NotificationListener(NotificationService notifications, EmailSender emailSender, UserService userService) {
        this.notifications = notifications;
        this.emailSender = emailSender;
        this.userService = userService;
    }

    @TransactionalEventListener
    public void on(CompanyVerified e) {
        safely("CompanyVerified", () -> notifications.notify(userService.companyOwnerIds(e.companyId()),
                NotificationType.COMPANY_VERIFIED, "Your company is verified",
                e.companyName() + " is verified. You can now post jobs and invite recruiters.",
                "/employer/company"));
    }

    @TransactionalEventListener
    public void on(CompanyRejected e) {
        safely("CompanyRejected", () -> notifications.notify(userService.companyOwnerIds(e.companyId()),
                NotificationType.COMPANY_REJECTED, "Company verification rejected",
                e.companyName() + " was not verified: " + e.reason() + ". Please fix the details and submit again.",
                "/employer/company"));
    }

    @TransactionalEventListener
    public void on(RecruiterInvited e) {
        safely("RecruiterInvited", () -> emailSender.send(e.email(), "You are invited to Kaamsathi",
                "You were invited as a recruiter. Set your password (link valid 7 days): " + e.acceptLink()));
    }

    @TransactionalEventListener
    public void on(ApplicationSubmitted e) {
        safely("ApplicationSubmitted", () -> notifications.notify(userService.companyMemberIds(e.companyId()),
                NotificationType.APPLICATION_SUBMITTED, "New applicant",
                "Someone applied to \"" + e.jobTitle() + "\".",
                "/employer/jobs/" + e.jobId() + "/applicants"));
    }

    @TransactionalEventListener
    public void on(ApplicationStatusChanged e) {
        safely("ApplicationStatusChanged", () -> notifications.notify(List.of(e.seekerId()),
                NotificationType.APPLICATION_STATUS_CHANGED, "Update on your application",
                statusText(e.status(), e.jobTitle()),
                "/seeker/applications/" + e.applicationId()));
    }

    @TransactionalEventListener
    public void on(PaymentApproved e) {
        safely("PaymentApproved", () -> notifications.notify(userService.companyOwnerIds(e.companyId()),
                NotificationType.PAYMENT_APPROVED, "Your plan is active",
                "Payment for " + e.planName() + " is approved. Plan period: " + date(e.startsAt())
                        + " to " + date(e.endsAt()) + ".",
                "/employer/billing"));
    }

    @TransactionalEventListener
    public void on(PaymentRejected e) {
        safely("PaymentRejected", () -> notifications.notify(userService.companyOwnerIds(e.companyId()),
                NotificationType.PAYMENT_REJECTED, "Payment not approved",
                "Payment for " + e.planName() + " was not approved: " + e.reason() + ". You can send a new one.",
                "/employer/billing"));
    }

    @TransactionalEventListener
    public void on(JobBlocked e) {
        safely("JobBlocked", () -> notifications.notify(userService.companyMemberIds(e.companyId()),
                NotificationType.JOB_BLOCKED, "Your job was blocked",
                "\"" + e.title() + "\" was blocked by Kaamsathi: " + e.reason()
                        + ". Contact support if you think this is a mistake.",
                "/employer/jobs/" + e.jobId()));
    }

    // ---- scheduler events (Phase 5.3) ----

    @TransactionalEventListener
    public void on(JobExpiring e) {
        safely("JobExpiring", () -> notifications.notify(userService.companyMemberIds(e.companyId()),
                NotificationType.JOB_EXPIRING, "Your job ends soon",
                "\"" + e.title() + "\" will close on " + date(e.expiresAt()) + ".",
                "/employer/jobs/" + e.jobId()));
    }

    @TransactionalEventListener
    public void on(JobExpired e) {
        safely("JobExpired", () -> notifications.notify(userService.companyMemberIds(e.companyId()),
                NotificationType.JOB_EXPIRED, "Your job has expired",
                "\"" + e.title() + "\" reached 60 days and is closed. Applicants who got no reply were told politely.",
                "/employer/jobs/" + e.jobId()));
    }

    @TransactionalEventListener
    public void on(ApplicantsWaiting e) {
        safely("ApplicantsWaiting", () -> notifications.notify(userService.companyMemberIds(e.companyId()),
                NotificationType.APPLICANTS_WAITING, "Applicants are waiting",
                e.count() + " applicant(s) for \"" + e.jobTitle() + "\" have waited 10 days. Please reply within"
                        + " 4 more days, or they will be closed automatically.",
                "/employer/jobs/" + e.jobId() + "/applicants"));
    }

    @TransactionalEventListener
    public void on(ApplicationAutoClosed e) {
        String why = e.jobEnded()
                ? "The job \"" + e.jobTitle() + "\" is no longer open, so your application was closed."
                : "The company has not replied to your application for \"" + e.jobTitle() + "\" in 14 days,"
                        + " so we closed it for you.";
        safely("ApplicationAutoClosed", () -> notifications.notify(List.of(e.seekerId()),
                NotificationType.APPLICATION_AUTO_CLOSED, "Application closed",
                why + " Thank you for applying. Keep going, the right job is out there.",
                "/seeker/applications/" + e.applicationId()));
    }

    @TransactionalEventListener
    public void on(SubscriptionExpiring e) {
        safely("SubscriptionExpiring", () -> notifications.notify(userService.companyOwnerIds(e.companyId()),
                NotificationType.SUBSCRIPTION_EXPIRING, "Your plan ends soon",
                "Your " + e.planName() + " plan ends on " + date(e.endsAt()) + ". Renew to keep posting jobs.",
                "/employer/billing"));
    }

    @TransactionalEventListener
    public void on(SubscriptionExpired e) {
        safely("SubscriptionExpired", () -> notifications.notify(userService.companyOwnerIds(e.companyId()),
                NotificationType.SUBSCRIPTION_EXPIRED, "Your plan has ended",
                "Your " + e.planName() + " plan ended on " + date(e.endedAt()) + ". Live jobs keep running until"
                        + " they expire; new posts need a new plan after 3 grace days.",
                "/employer/billing"));
    }

    // ---- helpers ----

    // kind words per stage; a rejection is told politely
    private static String statusText(ApplicationStatus status, String jobTitle) {
        String job = "\"" + jobTitle + "\"";
        return switch (status) {
            case SHORTLISTED -> "Good news! You are shortlisted for " + job + ".";
            case INTERVIEW -> "You are invited to an interview for " + job + ". The company will contact you.";
            case OFFERED -> "You got an offer for " + job + "!";
            case HIRED -> "Congratulations! You are hired for " + job + ".";
            case REJECTED -> "Thank you for applying to " + job + ". The company has decided not to move forward."
                    + " Keep going, the right job is out there.";
            default -> "Your application for " + job + " is now " + status + ".";
        };
    }

    private static String date(Instant at) {
        return DATE.format(at);
    }

    private static void safely(String event, Runnable action) {
        try {
            action.run();
        } catch (RuntimeException ex) {
            log.error("Notification for {} failed", event, ex);
        }
    }
}
