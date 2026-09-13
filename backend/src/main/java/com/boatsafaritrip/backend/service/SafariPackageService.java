package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.SafariPackage;
import com.boatsafaritrip.backend.repository.SafariPackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SafariPackageService {

    @Autowired
    private SafariPackageRepository packageRepository;

    public List<SafariPackage> getAllPackages() {
        return packageRepository.findAll();
    }

    public SafariPackage getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new PackageNotFoundException("Safari package not found with id: " + id));
    }

    public SafariPackage createPackage(SafariPackage pkg) {
        validate(pkg);
        pkg.setAvailableSeats(pkg.getTotalSeats());
        pkg.setStatus("ACTIVE");
        return packageRepository.save(pkg);
    }

    public SafariPackage updatePackage(Long id, SafariPackage updated) {
        SafariPackage pkg = getPackageById(id);
        validate(updated);

        pkg.setDestination(updated.getDestination());
        pkg.setDescription(updated.getDescription());
        pkg.setPrice(updated.getPrice());
        pkg.setTotalSeats(updated.getTotalSeats());
        pkg.setScheduleDate(updated.getScheduleDate());
        pkg.setScheduleTime(updated.getScheduleTime());
        return packageRepository.save(pkg);
    }

    public SafariPackage toggleStatus(Long id) {
        SafariPackage pkg = getPackageById(id);
        pkg.setStatus("ACTIVE".equals(pkg.getStatus()) ? "INACTIVE" : "ACTIVE");
        return packageRepository.save(pkg);
    }

    public void deletePackage(Long id) {
        SafariPackage pkg = getPackageById(id);
        packageRepository.delete(pkg);
    }

    private void validate(SafariPackage pkg) {
        if (pkg.getDestination() == null || pkg.getDestination().isBlank()) {
            throw new IllegalArgumentException("Destination is required");
        }
        if (pkg.getPrice() == null || pkg.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero");
        }
        if (pkg.getTotalSeats() == null || pkg.getTotalSeats() <= 0) {
            throw new IllegalArgumentException("Total seats must be greater than zero");
        }
        if (pkg.getScheduleDate() == null) {
            throw new IllegalArgumentException("Schedule date is required");
        }
    }
}