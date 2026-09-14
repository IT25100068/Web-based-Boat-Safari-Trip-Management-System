package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.SafariPackage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SafariPackageRepository extends JpaRepository<SafariPackage, Long> {
}