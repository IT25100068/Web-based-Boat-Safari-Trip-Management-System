package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Notification;
import com.boatsafaritrip.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Notification createNotification(Notification notification) {
        if (notification.getRecipientName() == null || notification.getRecipientName().isBlank()) {
            throw new IllegalArgumentException("Recipient name is required");
        }
        if (notification.getType() == null || notification.getType().isBlank()) {
            throw new IllegalArgumentException("Notification type is required");
        }
        if (notification.getMessage() == null || notification.getMessage().isBlank()) {
            throw new IllegalArgumentException("Message is required");
        }
        notification.setStatus("SENT"); // simulated — instantly "sent"
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }
}