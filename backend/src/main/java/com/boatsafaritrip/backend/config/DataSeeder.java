package com.boatsafaritrip.backend.config;

import com.boatsafaritrip.backend.model.EquipmentType;
import com.boatsafaritrip.backend.repository.EquipmentTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private EquipmentTypeRepository typeRepository;

    @Override
    public void run(String... args) {
        seedIfMissing("Life Jacket - Adult", "LIFESAVING", true);
        seedIfMissing("Life Jacket - Child", "LIFESAVING", true);
        seedIfMissing("Life Ring / Life Buoy", "LIFESAVING", true);
        seedIfMissing("Fire Extinguisher (Dry Powder)", "FIRE_SAFETY", true);
        seedIfMissing("First Aid Kit", "EMERGENCY", true);
        seedIfMissing("Emergency Whistle", "EMERGENCY", true);
        seedIfMissing("Navigation Lights", "NAVIGATION", true);
    }

    private void seedIfMissing(String name, String category, boolean mandatory) {
        if (typeRepository.findByName(name).isEmpty()) {
            EquipmentType type = new EquipmentType();
            type.setName(name);
            type.setCategory(category);
            type.setIsMandatory(mandatory);
            typeRepository.save(type);
        }
    }
}