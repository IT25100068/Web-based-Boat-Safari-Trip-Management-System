package com.boatsafaritrip.backend.service;

import com.boatsafaritrip.backend.model.Staff;
import com.boatsafaritrip.backend.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StaffService {

    @Autowired
    private StaffRepository staffRepository;

    public List<Staff> getAllStaff() {
        return staffRepository.findAll();
    }

    public Staff getStaffById(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found with id: " + id));
    }

    public Staff createStaff(Staff staff) {
        validate(staff);
        staff.setAvailability("AVAILABLE");
        return staffRepository.save(staff);
    }

    public Staff updateStaff(Long id, Staff updated) {
        Staff staff = getStaffById(id);
        validate(updated);
        staff.setName(updated.getName());
        staff.setRole(updated.getRole());
        return staffRepository.save(staff);
    }

    public void deleteStaff(Long id) {
        Staff staff = getStaffById(id);
        if (!"AVAILABLE".equals(staff.getAvailability())) {
            throw new IllegalArgumentException("Cannot delete staff who are currently assigned");
        }
        staffRepository.delete(staff);
    }

    private static final java.util.regex.Pattern NAME_PATTERN =
            java.util.regex.Pattern.compile("^[A-Z][a-zA-Z]*(\\s[A-Z][a-zA-Z]*)+$");

    private void validate(Staff staff) {
        if (staff.getName() == null || !NAME_PATTERN.matcher(staff.getName().trim()).matches()) {
            throw new IllegalArgumentException("Enter staff's full name with First and Last name, letters only, each starting with a capital letter");
        }
        if (staff.getRole() == null || staff.getRole().isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }
        if (staff.getPhone() == null || !java.util.regex.Pattern.compile("^0[0-9]{9}$").matcher(staff.getPhone()).matches()) {
            throw new IllegalArgumentException("Enter a valid 10-digit phone number starting with 0");
        }
    }

    public Staff setAvailability(Long id, String availability) {
        Staff staff = getStaffById(id);
        if ("ASSIGNED".equals(staff.getAvailability())) {
            throw new IllegalArgumentException("Cannot change availability while staff is actively assigned to a trip");
        }
        staff.setAvailability(availability);
        return staffRepository.save(staff);
    }
}