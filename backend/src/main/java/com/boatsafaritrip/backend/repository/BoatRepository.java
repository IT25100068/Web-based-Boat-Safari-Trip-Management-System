package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.Boat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoatRepository extends JpaRepository<Boat, Long> {
}