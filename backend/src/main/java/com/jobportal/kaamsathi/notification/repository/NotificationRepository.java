package com.jobportal.kaamsathi.notification.repository;

import com.jobportal.kaamsathi.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * DB access for `notifications` (notification module only).
 */
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    // the bell list, newest first
    Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    // the red badge number
    long countByUserIdAndReadAtIsNull(UUID userId);

    // someone else's notification = "not found"
    Optional<Notification> findByIdAndUserId(UUID id, UUID userId);

    // "mark all as read": one UPDATE instead of loading every row
    @Modifying
    @Query("UPDATE Notification n SET n.readAt = :now WHERE n.userId = :userId AND n.readAt IS NULL")
    int markAllRead(@Param("userId") UUID userId, @Param("now") Instant now);
}
