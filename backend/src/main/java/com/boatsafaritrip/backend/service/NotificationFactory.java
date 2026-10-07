package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Notification;
import com.boatsafaritrip.backend.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class NotificationFactory {

    public Notification createBookingConfirmation(User recipient, String destination, String tripDate) {
        return build(recipient, "BOOKING_CONFIRMATION",
                "Your booking for " + destination + " on " + tripDate + " has been confirmed.");
    }

    public Notification createCancellation(User recipient, String destination) {
        return build(recipient, "CANCELLATION",
                "Your booking for " + destination + " has been cancelled.");
    }

    public Notification createPaymentVerified(User recipient, String destination, String amount) {
        return build(recipient, "PAYMENT_UPDATE",
                "Your payment of LKR " + amount + " for " + destination + " has been verified.");
    }

    public Notification createPaymentRefunded(User recipient, String destination, String amount) {
        return build(recipient, "PAYMENT_UPDATE",
                "Your payment of LKR " + amount + " for " + destination + " has been refunded.");
    }

    private Notification build(User recipient, String type, String message) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setType(type);
        n.setMessage(message);
        n.setStatus("SENT");
        n.setCreatedAt(LocalDateTime.now());
        n.setIsRead(false);
        return n;
    }
}