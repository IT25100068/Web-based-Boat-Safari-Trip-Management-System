package com.boatsafaritrip.backend.controller;

import com.boatsafaritrip.backend.model.User;
import com.boatsafaritrip.backend.repository.UserRepository;
import com.boatsafaritrip.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String STAFF_DOMAIN = "@boatsafaritrip.com";
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern NIC_OLD_PATTERN = Pattern.compile("^[0-9]{9}[vVxX]$");
    private static final Pattern NIC_NEW_PATTERN = Pattern.compile("^[0-9]{12}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^0[0-9]{9}$");
    private static final Pattern NAME_PATTERN =
            Pattern.compile("^[A-Z][a-zA-Z]*(\\s[A-Z][a-zA-Z]*)+$");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Public self-registration — customers only
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        validateCommonFields(user);

        if (user.getEmail().toLowerCase().endsWith(STAFF_DOMAIN)) {
            throw new IllegalArgumentException("This email domain is reserved for staff accounts");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("CUSTOMER");
        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole());
        return buildAuthResponse(saved, token);
    }

    // Staff-only endpoint — only an existing staff member can create another staff account
    @PostMapping("/register-staff")
    public Map<String, Object> registerStaff(@RequestBody User user) {
        validateCommonFields(user);

        if (!user.getEmail().toLowerCase().endsWith(STAFF_DOMAIN)) {
            throw new IllegalArgumentException("Staff accounts must use an email ending in " + STAFF_DOMAIN);
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("STAFF");
        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole());
        return buildAuthResponse(saved, token);
    }

    // Single, unified login — role is determined automatically from the account
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            throw new IllegalArgumentException("Email and password are required");
        }

        Optional<User> found = userRepository.findByEmail(email);
        if (found.isEmpty() || !passwordEncoder.matches(password, found.get().getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = found.get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return buildAuthResponse(user, token);
    }

    private void validateCommonFields(User user) {
        if (user.getName() == null || user.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (!NAME_PATTERN.matcher(user.getName().trim()).matches()) {
            throw new IllegalArgumentException("Enter your full name with First and Last name, each starting with a capital letter (e.g. Nimal Perera)");
        }
        if (user.getEmail() == null || !EMAIL_PATTERN.matcher(user.getEmail()).matches()) {
            throw new IllegalArgumentException("A valid email address is required");
        }
        if (user.getPassword() == null || user.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        if (user.getPhone() == null || !PHONE_PATTERN.matcher(user.getPhone()).matches()) {
            throw new IllegalArgumentException("Enter a valid 10-digit Sri Lankan phone number starting with 0 (e.g. 0771234567)");
        }
        if (userRepository.findByPhone(user.getPhone()).isPresent()) {
            throw new IllegalArgumentException("An account with this phone number already exists");
        }
        if (user.getNicNumber() == null) {
            throw new IllegalArgumentException("NIC number is required");
        }
        boolean validOld = NIC_OLD_PATTERN.matcher(user.getNicNumber()).matches();
        boolean validNew = NIC_NEW_PATTERN.matcher(user.getNicNumber()).matches();
        if (!validOld && !validNew) {
            throw new IllegalArgumentException("Enter a valid NIC: old format is 9 digits + 'V' (e.g. 912345678V), new format is 12 digits");
        }
        if (userRepository.findByNicNumber(user.getNicNumber()).isPresent()) {
            throw new IllegalArgumentException("An account with this NIC number already exists");
        }
        if (user.getAddress() == null || user.getAddress().isBlank()) {
            throw new IllegalArgumentException("Address is required");
        }
    }

    private Map<String, Object> buildAuthResponse(User user, String token) {
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        return response;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleInvalidInput(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return error;
    }
}