package com.jobportal.kaamsathi.notification.dto;

import com.jobportal.kaamsathi.notification.entity.Notification;
import com.jobportal.kaamsathi.notification.entity.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        NotificationType type,
        String title,
        String body,
        String link,
        boolean read,
        Instant readAt,
        Instant createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(n.getId(), n.getType(), n.getTitle(), n.getBody(), n.getLink(),
                n.getReadAt() != null, n.getReadAt(), n.getCreatedAt());
    }
}
