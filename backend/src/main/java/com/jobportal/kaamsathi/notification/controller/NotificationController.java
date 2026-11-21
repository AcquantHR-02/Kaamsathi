package com.jobportal.kaamsathi.notification.controller;

import com.jobportal.kaamsathi.common.dto.PageResponse;
import com.jobportal.kaamsathi.notification.dto.NotificationResponse;
import com.jobportal.kaamsathi.notification.dto.UnreadCountResponse;
import com.jobportal.kaamsathi.notification.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * The bell. Any logged-in user, always their OWN notifications (user id from the token).
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** GET /api/notifications?page=&size= → newest first */
    @GetMapping
    public PageResponse<NotificationResponse> list(@AuthenticationPrincipal Jwt jwt,
                                                   @RequestParam(required = false) Integer page,
                                                   @RequestParam(required = false) Integer size) {
        return notificationService.listMine(userId(jwt), page, size);
    }

    /** GET /api/notifications/unread-count → {"unread": n} */
    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount(@AuthenticationPrincipal Jwt jwt) {
        return notificationService.unreadCount(userId(jwt));
    }

    /** POST /api/notifications/{id}/read → 200 (someone else's id → 404) */
    @PostMapping("/{id}/read")
    public NotificationResponse read(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return notificationService.markRead(userId(jwt), id);
    }

    /** POST /api/notifications/read-all → 204 */
    @PostMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void readAll(@AuthenticationPrincipal Jwt jwt) {
        notificationService.markAllRead(userId(jwt));
    }

    private static UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
