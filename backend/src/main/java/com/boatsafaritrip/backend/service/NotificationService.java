package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Notification;
import com.boatsafaritrip.backend.model.User;
import com.boatsafaritrip.backend.repository.NotificationRepository;
import com.boatsafaritrip.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Notification createNotification(Notification notification) {
        if (notification.getRecipient() == null || notification.getRecipient().getId() == null) {
            throw new IllegalArgumentException("A recipient must be selected");
        }
        if (notification.getType() == null || notification.getType().isBlank()) {
            throw new IllegalArgumentException("Notification type is required");
        }
        if (notification.getMessage() == null || notification.getMessage().isBlank()) {
            throw new IllegalArgumentException("Message is required");
        }

        User recipient = userRepository.findById(notification.getRecipient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Selected recipient does not exist"));

        notification.setRecipient(recipient);
        notification.setStatus("SENT");
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public Notification updateNotification(Long id, Notification updated) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + id));

        if (updated.getMessage() == null || updated.getMessage().isBlank()) {
            throw new IllegalArgumentException("Message is required");
        }

        notification.setMessage(updated.getMessage());
        notification.setType(updated.getType());
        return notificationRepository.save(notification);
    }

    // Used by the system for automatic triggers (booking confirmed, payment verified, etc.)
    public Notification createSystemNotification(User recipient, String type, String message) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setMessage(message);
        notification.setStatus("SENT");
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + id));
        notificationRepository.delete(notification);
    }

    public List<Notification> getNotificationsByRecipient(Long recipientId) {
        return notificationRepository.findByRecipientId(recipientId);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public Notification save(Notification notification) {
        return notificationRepository.save(notification);
    }
}