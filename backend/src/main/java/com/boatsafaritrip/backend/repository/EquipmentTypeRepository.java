package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EquipmentTypeRepository extends JpaRepository<EquipmentType, Long> {
    Optional<EquipmentType> findByName(String name);
    List<EquipmentType> findByIsMandatoryTrue();
}