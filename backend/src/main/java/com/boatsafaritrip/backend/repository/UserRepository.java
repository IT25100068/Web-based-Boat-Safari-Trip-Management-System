package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}