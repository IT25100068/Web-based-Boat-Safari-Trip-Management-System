package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.SafetyEquipment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SafetyEquipmentRepository extends JpaRepository<SafetyEquipment, Long> {
    List<SafetyEquipment> findByBoatId(Long boatId);
}