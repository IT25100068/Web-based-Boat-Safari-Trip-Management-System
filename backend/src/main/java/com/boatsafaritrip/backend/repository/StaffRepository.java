package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRepository extends JpaRepository<Staff, Long> {
}