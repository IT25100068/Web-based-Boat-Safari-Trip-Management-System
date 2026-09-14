package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Booking;
import com.boatsafaritrip.backend.model.SafariPackage;
import com.boatsafaritrip.backend.repository.BookingRepository;
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

    public Booking createBooking(Booking booking) {
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

        if (pkg.getAvailableSeats() == null || pkg.getAvailableSeats() < booking.getNumberOfSeats()) {
            throw new IllegalArgumentException("Not enough seats available for this package");
        }

        booking.setSafariPackage(pkg);
        booking.setStatus("PENDING");
        booking.setBookingDate(LocalDate.now());
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(Long id, Booking updatedBooking) {
        Booking booking = getBookingById(id);
        booking.setTripDate(updatedBooking.getTripDate());
        booking.setNumberOfSeats(updatedBooking.getNumberOfSeats());
        return bookingRepository.save(booking);
    }

    public Booking confirmBooking(Long id) {
        Booking booking = getBookingById(id);

        SafariPackage pkg = booking.getSafariPackage();
        if (pkg.getAvailableSeats() < booking.getNumberOfSeats()) {
            throw new IllegalArgumentException("Not enough seats remaining to confirm this booking");
        }
        pkg.setAvailableSeats(pkg.getAvailableSeats() - booking.getNumberOfSeats());
        packageRepository.save(pkg);

        booking.setStatus("CONFIRMED");
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);

        if ("CONFIRMED".equals(booking.getStatus())) {
            SafariPackage pkg = booking.getSafariPackage();
            pkg.setAvailableSeats(pkg.getAvailableSeats() + booking.getNumberOfSeats());
            packageRepository.save(pkg);
        }

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }
}