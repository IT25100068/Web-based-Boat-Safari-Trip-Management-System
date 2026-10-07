package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientId(Long recipientId);
}
