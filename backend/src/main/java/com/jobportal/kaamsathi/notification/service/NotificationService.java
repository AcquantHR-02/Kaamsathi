package com.jobportal.kaamsathi.notification.service;

import com.jobportal.kaamsathi.auth.service.UserService;
import com.jobportal.kaamsathi.common.dto.PageResponse;
import com.jobportal.kaamsathi.common.exception.ApiException;
import com.jobportal.kaamsathi.common.exception.ErrorCode;
import com.jobportal.kaamsathi.common.util.Paging;
import com.jobportal.kaamsathi.notification.dto.NotificationResponse;
import com.jobportal.kaamsathi.notification.dto.UnreadCountResponse;
import com.jobportal.kaamsathi.notification.entity.Notification;
import com.jobportal.kaamsathi.notification.entity.NotificationType;
import com.jobportal.kaamsathi.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;

/**
 * In-app notifications (the bell) + emails.
 * notify(...) is called by the event listeners; the rest is the user's own bell list.
 */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailSender emailSender;
    private final UserService userService;
    private final Clock clock;

    public NotificationService(NotificationRepository notificationRepository, EmailSender emailSender,
                               UserService userService, Clock clock) {
        this.notificationRepository = notificationRepository;
        this.emailSender = emailSender;
        this.userService = userService;
        this.clock = clock;
    }

    /**
     * One message to several users: a bell row each + an email each.
     * REQUIRES_NEW: listeners run AFTER the business transaction committed, so we need our own
     * transaction (joining the finished one would silently write nothing).
     * Deleted users (no email found) are skipped.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notify(Collection<UUID> userIds, NotificationType type, String title, String body, String link) {
        Map<UUID, String> emails = userService.emailsByIds(userIds);
        for (UUID userId : userIds) {
            String email = emails.get(userId);
            if (email == null) {
                continue;
            }
            notificationRepository.save(new Notification(UUID.randomUUID(), userId, type, title, body, link,
                    clock.instant()));
            emailSender.send(email, title, body);
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> listMine(UUID userId, Integer page, Integer size) {
        return PageResponse.from(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, Paging.of(page, size)),
                NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount(UUID userId) {
        return new UnreadCountResponse(notificationRepository.countByUserIdAndReadAtIsNull(userId));
    }

    @Transactional
    public NotificationResponse markRead(UUID userId, UUID id) {
        Notification n = notificationRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ApiException(ErrorCode.NOTIFICATION_NOT_FOUND));
        n.markRead(clock.instant());
        return NotificationResponse.from(n);
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllRead(userId, clock.instant());
    }
}
