package com.boatsafaritrip.backend.repository;

import com.boatsafaritrip.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
    Optional<User> findByPhone(String phone);
    Optional<User> findByNicNumber(String nicNumber);
}