package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.SafetyInspection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SafetyInspectionRepository extends JpaRepository<SafetyInspection, Long> {
}