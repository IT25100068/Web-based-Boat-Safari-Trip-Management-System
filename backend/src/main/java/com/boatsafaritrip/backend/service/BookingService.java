package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Booking;
import com.boatsafaritrip.backend.model.Payment;
import com.boatsafaritrip.backend.model.SafariPackage;
import com.boatsafaritrip.backend.repository.BookingRepository;
import com.boatsafaritrip.backend.repository.PaymentRepository;
import com.boatsafaritrip.backend.repository.SafariPackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private SafariPackageRepository packageRepository;
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationFactory notificationFactory;


    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    public List<Booking> getBookingsByCustomer(Long customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }

    public Booking createBooking(Booking booking, String requesterRole) {
        if (booking.getNumberOfSeats() == null || booking.getNumberOfSeats() <= 0) {
            throw new IllegalArgumentException("Number of seats must be greater than zero");
        }
        if (booking.getTripDate() == null) {
            throw new IllegalArgumentException("Trip date is required");
        }
        if (booking.getSafariPackage() == null || booking.getSafariPackage().getId() == null) {
            throw new IllegalArgumentException("A safari package must be selected");
        }
        if (booking.getCustomer() == null || booking.getCustomer().getId() == null) {
            throw new IllegalArgumentException("A customer must be selected");
        }

        SafariPackage pkg = packageRepository.findById(booking.getSafariPackage().getId())
                .orElseThrow(() -> new IllegalArgumentException("Selected safari package does not exist"));

        if (!"ACTIVE".equals(pkg.getStatus())) {
            throw new IllegalArgumentException("This safari package is no longer available for booking");
        }
        if (pkg.getScheduleDate().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("This trip's scheduled date has already passed");
        }

        if (pkg.getAvailableSeats() == null || pkg.getAvailableSeats() < booking.getNumberOfSeats()) {
            throw new IllegalArgumentException("Not enough seats available for this package. Only " + pkg.getAvailableSeats() + " seats remaining.");
        }

        booking.setSafariPackage(pkg);
        booking.setStatus("PENDING");
        booking.setBookingDate(LocalDate.now());
        booking.setCreatedBy(requesterRole);
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(Long id, Booking updatedBooking, String requesterRole) {
        Booking booking = getBookingById(id);

        if ("STAFF".equals(requesterRole) && "CUSTOMER".equals(booking.getCreatedBy())) {
            throw new IllegalArgumentException("Staff cannot modify a booking the customer made themselves");
        }
        if (!"PENDING".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Only pending bookings can be modified");
        }
        if (updatedBooking.getNumberOfSeats() == null || updatedBooking.getNumberOfSeats() <= 0) {
            throw new IllegalArgumentException("Number of seats must be greater than zero");
        }

        SafariPackage pkg = booking.getSafariPackage();
        if (updatedBooking.getNumberOfSeats() > pkg.getAvailableSeats()) {
            throw new IllegalArgumentException("Only " + pkg.getAvailableSeats() + " seats are available for this package");
        }

        booking.setNumberOfSeats(updatedBooking.getNumberOfSeats());
        return bookingRepository.save(booking);
    }

    public Booking confirmBooking(Long id) {
        Booking booking = getBookingById(id);

        Payment payment = paymentRepository.findByBookingId(id)
                .orElseThrow(() -> new IllegalArgumentException("This booking cannot be confirmed until it has been paid for"));

        if (!"VERIFIED".equals(payment.getStatus())) {
            throw new IllegalArgumentException("This booking cannot be confirmed until payment is verified. Current payment status: " + payment.getStatus());
        }

        booking.setStatus("CONFIRMED");
        Booking saved = bookingRepository.save(booking);

        notificationService.save(notificationFactory.createBookingConfirmation(
                booking.getCustomer(), booking.getSafariPackage().getDestination(), booking.getTripDate().toString()));

        return saved;
    }

    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);

        if ("CONFIRMED".equals(booking.getStatus())) {
            SafariPackage pkg = booking.getSafariPackage();
            pkg.setAvailableSeats(pkg.getAvailableSeats() + booking.getNumberOfSeats());
            packageRepository.save(pkg);
        }

        booking.setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);

        notificationService.save(notificationFactory.createCancellation(
                booking.getCustomer(), booking.getSafariPackage().getDestination()));

        return saved;
    }
}