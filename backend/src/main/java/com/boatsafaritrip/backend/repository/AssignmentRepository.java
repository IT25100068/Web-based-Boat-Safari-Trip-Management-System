package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
}