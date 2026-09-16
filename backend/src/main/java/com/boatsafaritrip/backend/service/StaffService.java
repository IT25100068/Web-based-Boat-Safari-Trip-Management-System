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

    private void validate(Staff staff) {
        if (staff.getName() == null || staff.getName().isBlank()) {
            throw new IllegalArgumentException("Staff name is required");
        }
        if (staff.getRole() == null || staff.getRole().isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }
    }
}