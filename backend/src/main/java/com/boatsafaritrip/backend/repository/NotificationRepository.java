package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
