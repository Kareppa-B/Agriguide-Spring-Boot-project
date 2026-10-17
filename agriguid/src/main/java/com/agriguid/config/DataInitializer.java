package com.agriguid.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.agriguid.model.AvailabilityStatus;
import com.agriguid.model.Crop;
import com.agriguid.model.EquipmentCondition;
import com.agriguid.model.EquipmentListing;
import com.agriguid.model.FarmerExperience;
import com.agriguid.model.FarmerVerificationStatus;
import com.agriguid.model.User;
import com.agriguid.model.UserRole;
import com.agriguid.model.WorkerListing;
import com.agriguid.repository.CropRepository;
import com.agriguid.repository.EquipmentListingRepository;
import com.agriguid.repository.FarmerExperienceRepository;
import com.agriguid.repository.UserRepository;
import com.agriguid.repository.WorkerListingRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CropRepository cropRepository;
    
    @Autowired
    private WorkerListingRepository workerRepository;
    
    @Autowired
    private EquipmentListingRepository equipmentRepository;
    
    @Autowired
    private FarmerExperienceRepository experienceRepository;

    @Override
    public void run(String... args) throws Exception {
        migrateLegacyEquipmentOwners();
        initializeUsers();
        if (cropRepository.count() == 0) {
            initializeCrops();
        }
        if (workerRepository.count() == 0) {
            initializeWorkers();
        } else {
            backfillWorkerUsers();
        }
        if (equipmentRepository.count() == 0) {
            initializeEquipment();
        } else {
            backfillEquipmentUsers();
        }
        if (experienceRepository.count() == 0) {
            initializeExperiences();
        } else {
            backfillExperienceUsers();
        }
    }

    private void migrateLegacyEquipmentOwners() {
        try {
            List<User> legacyUsers = userRepository.findByRole(UserRole.EQUIPMENT_OWNER);
            if (!legacyUsers.isEmpty()) {
                for (User u : legacyUsers) {
                    u.setRole(UserRole.FARMER);
                    userRepository.save(u);
                }
                System.out.println("✓ Migrated " + legacyUsers.size() + " legacy EQUIPMENT_OWNER users to FARMER role");
            }
        } catch (Exception e) {
            // Log and continue safely
            System.err.println("Notice on EQUIPMENT_OWNER migration: " + e.getMessage());
        }
    }

    private void initializeUsers() {
        // Admin
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("adminpassword"));
            admin.setFullName("System Administrator");
            admin.setEmail("admin@agriguid.com");
            admin.setRole(UserRole.ADMIN);
            admin.setRegistrationDate(LocalDateTime.now());
            admin.setIsActive(true);
            admin.setFarmerVerificationStatus(FarmerVerificationStatus.NONE);
            userRepository.save(admin);
        }

        // Worker User 1 - Ravi
        if (!userRepository.existsByUsername("worker_ravi")) {
            User worker = new User();
            worker.setUsername("worker_ravi");
            worker.setPassword(passwordEncoder.encode("password123"));
            worker.setFullName("Ravi Kumar");
            worker.setEmail("ravi@agriguid.com");
            worker.setPhoneNumber("+91-9876543210");
            worker.setRegion("Punjab");
            worker.setLocation("Ludhiana");
            worker.setRole(UserRole.WORKER);
            worker.setYearsOfExperience(8);
            worker.setSpecialization("Tractor Operation, Land Preparation");
            worker.setRegistrationDate(LocalDateTime.now());
            worker.setIsActive(true);
            worker.setFarmerVerificationStatus(FarmerVerificationStatus.NONE);
            userRepository.save(worker);
        }

        // Worker User 2 - Suresh
        if (!userRepository.existsByUsername("worker_suresh")) {
            User worker2 = new User();
            worker2.setUsername("worker_suresh");
            worker2.setPassword(passwordEncoder.encode("password123"));
            worker2.setFullName("Suresh Patel");
            worker2.setEmail("suresh@agriguid.com");
            worker2.setPhoneNumber("+91-9876543211");
            worker2.setRegion("Maharashtra");
            worker2.setLocation("Pune");
            worker2.setRole(UserRole.WORKER);
            worker2.setYearsOfExperience(5);
            worker2.setSpecialization("Irrigation Management, Drip System Installation");
            worker2.setRegistrationDate(LocalDateTime.now());
            worker2.setIsActive(true);
            worker2.setFarmerVerificationStatus(FarmerVerificationStatus.NONE);
            userRepository.save(worker2);
        }

        // Worker User 3 - Mukesh
        if (!userRepository.existsByUsername("worker_mukesh")) {
            User worker3 = new User();
            worker3.setUsername("worker_mukesh");
            worker3.setPassword(passwordEncoder.encode("password123"));
            worker3.setFullName("Mukesh Singh");
            worker3.setEmail("mukesh@agriguid.com");
            worker3.setPhoneNumber("+91-9876543212");
            worker3.setRegion("Haryana");
            worker3.setLocation("Karnal");
            worker3.setRole(UserRole.WORKER);
            worker3.setYearsOfExperience(10);
            worker3.setSpecialization("Harvesting, Team Management, Quality Control");
            worker3.setRegistrationDate(LocalDateTime.now());
            worker3.setIsActive(true);
            worker3.setFarmerVerificationStatus(FarmerVerificationStatus.NONE);
            userRepository.save(worker3);
        }

        // Worker User 4 - Ramesh
        if (!userRepository.existsByUsername("worker_ramesh")) {
            User worker4 = new User();
            worker4.setUsername("worker_ramesh");
            worker4.setPassword(passwordEncoder.encode("password123"));
            worker4.setFullName("Ramesh Yadav");
            worker4.setEmail("ramesh@agriguid.com");
            worker4.setPhoneNumber("+91-9876543213");
            worker4.setRegion("Karnataka");
            worker4.setLocation("Bangalore");
            worker4.setRole(UserRole.WORKER);
            worker4.setYearsOfExperience(6);
            worker4.setSpecialization("Pesticide Application, Drone Operation");
            worker4.setRegistrationDate(LocalDateTime.now());
            worker4.setIsActive(true);
            worker4.setFarmerVerificationStatus(FarmerVerificationStatus.NONE);
            userRepository.save(worker4);
        }

        // Farmer User - Raj (Verified)
        if (!userRepository.existsByUsername("farmer_raj")) {
            User farmer = new User();
            farmer.setUsername("farmer_raj");
            farmer.setPassword(passwordEncoder.encode("password123"));
            farmer.setFullName("Rajesh Patel");
            farmer.setEmail("rajesh@agriguid.com");
            farmer.setPhoneNumber("+91-9876543201");
            farmer.setRegion("Punjab");
            farmer.setLocation("Ludhiana");
            farmer.setRole(UserRole.FARMER);
            farmer.setIsVerifiedFarmer(true);
            farmer.setFarmerVerificationStatus(FarmerVerificationStatus.APPROVED);
            farmer.setYearsOfExperience(10);
            farmer.setSpecialization("Organic Rice & Wheat Cultivation");
            farmer.setRegistrationDate(LocalDateTime.now());
            farmer.setIsActive(true);
            userRepository.save(farmer);
        }

        // Farmer User - Anita (Pending Verification)
        if (!userRepository.existsByUsername("farmer_anita")) {
            User farmer2 = new User();
            farmer2.setUsername("farmer_anita");
            farmer2.setPassword(passwordEncoder.encode("password123"));
            farmer2.setFullName("Anita Sharma");
            farmer2.setEmail("anita@agriguid.com");
            farmer2.setPhoneNumber("+91-9876543202");
            farmer2.setRegion("Haryana");
            farmer2.setLocation("Ambala");
            farmer2.setRole(UserRole.FARMER);
            farmer2.setIsVerifiedFarmer(false);
            farmer2.setFarmerVerificationStatus(FarmerVerificationStatus.PENDING);
            farmer2.setYearsOfExperience(4);
            farmer2.setSpecialization("Horticulture & Drip Irrigated Vegetables");
            farmer2.setRegistrationDate(LocalDateTime.now());
            farmer2.setIsActive(true);
            userRepository.save(farmer2);
        }
    }

    private void backfillWorkerUsers() {
        List<WorkerListing> all = workerRepository.findAll();
        for (WorkerListing w : all) {
            if (w.getUser() == null) {
                // Find matching worker by name or fallback to separate worker accounts
                String name = w.getWorkerName();
                if (name != null) {
                    if (name.contains("Ravi")) {
                        userRepository.findByUsername("worker_ravi").ifPresent(w::setUser);
                    } else if (name.contains("Suresh")) {
                        userRepository.findByUsername("worker_suresh").ifPresent(w::setUser);
                    } else if (name.contains("Mukesh")) {
                        userRepository.findByUsername("worker_mukesh").ifPresent(w::setUser);
                    } else if (name.contains("Ramesh")) {
                        userRepository.findByUsername("worker_ramesh").ifPresent(w::setUser);
                    }
                }
                if (w.getUser() == null) {
                    userRepository.findByUsername("worker_ravi").ifPresent(w::setUser);
                }
                workerRepository.save(w);
            }
        }
    }

    private void backfillEquipmentUsers() {
        User farmerUser = userRepository.findByUsername("farmer_raj").orElse(null);
        User workerUser = userRepository.findByUsername("worker_ravi").orElse(null);
        List<EquipmentListing> all = equipmentRepository.findAll();
        int count = 0;
        for (EquipmentListing eq : all) {
            if (eq.getUser() == null) {
                eq.setUser(count % 2 == 0 ? farmerUser : workerUser);
                equipmentRepository.save(eq);
            }
            count++;
        }
    }

    private void backfillExperienceUsers() {
        User farmerUser = userRepository.findByUsername("farmer_raj").orElse(null);
        List<FarmerExperience> all = experienceRepository.findAll();
        for (FarmerExperience exp : all) {
            if (exp.getUser() == null) {
                exp.setUser(farmerUser);
                experienceRepository.save(exp);
            }
        }
    }

    private void initializeCrops() {
        // Rice
        Crop rice = new Crop();
        rice.setCropName("Rice");
        rice.setScientificName("Oryza sativa");
        rice.setCategory("Cereal");
        rice.setDescription("Rice is a staple food crop grown in waterlogged conditions. It is the primary food source for more than half of the world's population.");
        rice.setSoilType("Clay Loam");
        rice.setClimateCondition("Tropical and Subtropical");
        rice.setMinTemperature(20.0);
        rice.setMaxTemperature(35.0);
        rice.setRainfallRequirement("1000-2000mm annually");
        rice.setGrowingPeriodDays(120);
        rice.setCultivationSteps("1. Land preparation with puddling\n2. Transplanting seedlings\n3. Water management\n4. Weed control\n5. Fertilizer application\n6. Pest management\n7. Harvesting");
        rice.setEstimatedInvestment(new BigDecimal("35000"));
        rice.setExpectedYieldPerAcre(new BigDecimal("2500"));
        rice.setExpectedRevenuePerAcre(new BigDecimal("75000"));
        rice.setPesticidesRecommended("Chlorpyrifos for stem borer, Carbofuran for leaf folder");
        rice.setFertilizersRecommended("NPK 20:10:10, Urea, DAP");
        rice.setIrrigationRequirement("Continuous flooding during growing season");
        rice.setHarvestingSeason("October-November, April-May");
        cropRepository.save(rice);

        // Wheat
        Crop wheat = new Crop();
        wheat.setCropName("Wheat");
        wheat.setScientificName("Triticum aestivum");
        wheat.setCategory("Cereal");
        wheat.setDescription("Wheat is a major cereal grain used for making flour, bread, and various food products. It thrives in temperate climates.");
        wheat.setSoilType("Loamy");
        wheat.setClimateCondition("Temperate");
        wheat.setMinTemperature(10.0);
        wheat.setMaxTemperature(25.0);
        wheat.setRainfallRequirement("500-700mm annually");
        wheat.setGrowingPeriodDays(130);
        wheat.setCultivationSteps("1. Soil preparation and leveling\n2. Seed treatment\n3. Sowing\n4. Irrigation at critical stages\n5. Weed management\n6. Pest and disease control\n7. Harvesting and threshing");
        wheat.setEstimatedInvestment(new BigDecimal("30000"));
        wheat.setExpectedYieldPerAcre(new BigDecimal("2000"));
        wheat.setExpectedRevenuePerAcre(new BigDecimal("60000"));
        wheat.setPesticidesRecommended("Chlorpyrifos for aphids, Pendimethalin for weeds");
        wheat.setFertilizersRecommended("NPK 12:32:16, Urea top dressing");
        wheat.setIrrigationRequirement("4-6 irrigations during crop period");
        wheat.setHarvestingSeason("March-April");
        cropRepository.save(wheat);

        // Cotton
        Crop cotton = new Crop();
        cotton.setCropName("Cotton");
        cotton.setScientificName("Gossypium hirsutum");
        cotton.setCategory("Fiber");
        cotton.setDescription("Cotton is a major cash crop cultivated for its fiber. It requires warm climate and moderate rainfall.");
        cotton.setSoilType("Black Soil");
        cotton.setClimateCondition("Tropical and Subtropical");
        cotton.setMinTemperature(21.0);
        cotton.setMaxTemperature(30.0);
        cotton.setRainfallRequirement("600-1200mm annually");
        cotton.setGrowingPeriodDays(180);
        cotton.setCultivationSteps("1. Deep ploughing and soil preparation\n2. Seed treatment and sowing\n3. Gap filling\n4. Thinning\n5. Regular irrigation\n6. Fertilizer application\n7. Pest management\n8. Picking");
        cotton.setEstimatedInvestment(new BigDecimal("45000"));
        cotton.setExpectedYieldPerAcre(new BigDecimal("800"));
        cotton.setExpectedRevenuePerAcre(new BigDecimal("80000"));
        cotton.setPesticidesRecommended("Imidacloprid for whitefly, Spinosad for bollworm");
        cotton.setFertilizersRecommended("NPK 17:17:17, Urea, SSP");
        cotton.setIrrigationRequirement("6-8 irrigations during crop season");
        cotton.setHarvestingSeason("October-January");
        cropRepository.save(cotton);

        // Tomato
        Crop tomato = new Crop();
        tomato.setCropName("Tomato");
        tomato.setScientificName("Solanum lycopersicum");
        tomato.setCategory("Vegetable");
        tomato.setDescription("Tomato is a popular vegetable crop grown worldwide. It's rich in vitamins and minerals and used in various culinary preparations.");
        tomato.setSoilType("Sandy Loam");
        tomato.setClimateCondition("Warm Temperate");
        tomato.setMinTemperature(18.0);
        tomato.setMaxTemperature(27.0);
        tomato.setRainfallRequirement("600-800mm annually");
        tomato.setGrowingPeriodDays(90);
        tomato.setCultivationSteps("1. Nursery preparation and seedling raising\n2. Land preparation\n3. Transplanting\n4. Staking and pruning\n5. Regular irrigation\n6. Fertilizer application\n7. Pest and disease management\n8. Harvesting");
        tomato.setEstimatedInvestment(new BigDecimal("50000"));
        tomato.setExpectedYieldPerAcre(new BigDecimal("15000"));
        tomato.setExpectedRevenuePerAcre(new BigDecimal("120000"));
        tomato.setPesticidesRecommended("Mancozeb for blight, Imidacloprid for whitefly");
        tomato.setFertilizersRecommended("NPK 19:19:19, Micronutrient spray");
        tomato.setIrrigationRequirement("Drip irrigation or frequent light irrigation");
        tomato.setHarvestingSeason("Year-round depending on variety");
        cropRepository.save(tomato);

        // Sugarcane
        Crop sugarcane = new Crop();
        sugarcane.setCropName("Sugarcane");
        sugarcane.setScientificName("Saccharum officinarum");
        sugarcane.setCategory("Cash Crop");
        sugarcane.setDescription("Sugarcane is a tropical crop grown for sugar production. It requires high temperature and abundant water supply.");
        sugarcane.setSoilType("Loamy");
        sugarcane.setClimateCondition("Tropical");
        sugarcane.setMinTemperature(20.0);
        sugarcane.setMaxTemperature(35.0);
        sugarcane.setRainfallRequirement("1500-2500mm annually");
        sugarcane.setGrowingPeriodDays(365);
        sugarcane.setCultivationSteps("1. Deep ploughing and land leveling\n2. Trench preparation\n3. Planting seed canes\n4. Gap filling\n5. Earthing up\n6. Regular irrigation\n7. Fertilizer application\n8. Pest management\n9. Harvesting");
        sugarcane.setEstimatedInvestment(new BigDecimal("60000"));
        sugarcane.setExpectedYieldPerAcre(new BigDecimal("35000"));
        sugarcane.setExpectedRevenuePerAcre(new BigDecimal("100000"));
        sugarcane.setPesticidesRecommended("Chlorpyrifos for shoot borer, Imidacloprid for whitefly");
        sugarcane.setFertilizersRecommended("NPK 15:15:15, Urea, Potash");
        sugarcane.setIrrigationRequirement("Heavy irrigation every 10-15 days");
        sugarcane.setHarvestingSeason("December-March");
        cropRepository.save(sugarcane);

        // Maize
        Crop maize = new Crop();
        maize.setCropName("Maize");
        maize.setScientificName("Zea mays");
        maize.setCategory("Cereal");
        maize.setDescription("Maize or corn is a versatile crop used for food, feed, and industrial purposes. It grows well in warm climates.");
        maize.setSoilType("Loamy");
        maize.setClimateCondition("Warm Temperate");
        maize.setMinTemperature(15.0);
        maize.setMaxTemperature(30.0);
        maize.setRainfallRequirement("600-1000mm annually");
        maize.setGrowingPeriodDays(100);
        maize.setCultivationSteps("1. Land preparation\n2. Seed treatment\n3. Sowing at proper spacing\n4. Thinning\n5. Weed management\n6. Irrigation at critical stages\n7. Fertilizer application\n8. Pest control\n9. Harvesting");
        maize.setEstimatedInvestment(new BigDecimal("25000"));
        maize.setExpectedYieldPerAcre(new BigDecimal("2200"));
        maize.setExpectedRevenuePerAcre(new BigDecimal("55000"));
        maize.setPesticidesRecommended("Carbofuran for stem borer, Chlorpyrifos for fall armyworm");
        maize.setFertilizersRecommended("NPK 20:20:20, Urea split doses");
        maize.setIrrigationRequirement("3-4 irrigations at critical growth stages");
        maize.setHarvestingSeason("June-July, December-January");
        cropRepository.save(maize);

        System.out.println("✓ Initialized database with 6 sample crops");
    }
    
    private void initializeWorkers() {
        User workerRavi = userRepository.findByUsername("worker_ravi").orElse(null);
        User workerSuresh = userRepository.findByUsername("worker_suresh").orElse(null);
        User workerMukesh = userRepository.findByUsername("worker_mukesh").orElse(null);
        User workerRamesh = userRepository.findByUsername("worker_ramesh").orElse(null);

        // Worker 1 - Experienced Tractor Operator
        WorkerListing worker1 = new WorkerListing();
        worker1.setUser(workerRavi);
        worker1.setWorkerName("Ravi Kumar");
        worker1.setPhoneNumber("+91-9876543210");
        worker1.setSkillSet("Tractor Operation, Land Preparation, Harvesting");
        worker1.setExperienceYears(8);
        worker1.setRegion("Punjab");
        worker1.setSpecificLocation("Ludhiana");
        worker1.setAvailability(AvailabilityStatus.AVAILABLE);
        worker1.setDailyRate(new BigDecimal("800"));
        worker1.setHourlyRate(new BigDecimal("100"));
        worker1.setDescription("Experienced tractor operator with 8 years of experience in all types of farming operations.");
        worker1.setListedDate(LocalDateTime.now());
        worker1.setIsActive(true);
        workerRepository.save(worker1);

        // Worker 2 - Irrigation Specialist
        WorkerListing worker2 = new WorkerListing();
        worker2.setUser(workerSuresh);
        worker2.setWorkerName("Suresh Patel");
        worker2.setPhoneNumber("+91-9876543211");
        worker2.setSkillSet("Irrigation Management, Drip System Installation");
        worker2.setExperienceYears(5);
        worker2.setRegion("Maharashtra");
        worker2.setSpecificLocation("Pune");
        worker2.setAvailability(AvailabilityStatus.AVAILABLE);
        worker2.setDailyRate(new BigDecimal("700"));
        worker2.setHourlyRate(new BigDecimal("90"));
        worker2.setDescription("Specialist in modern irrigation systems and water management techniques.");
        worker2.setListedDate(LocalDateTime.now());
        worker2.setIsActive(true);
        workerRepository.save(worker2);

        // Worker 3 - Harvesting Crew Leader
        WorkerListing worker3 = new WorkerListing();
        worker3.setUser(workerMukesh);
        worker3.setWorkerName("Mukesh Singh");
        worker3.setPhoneNumber("+91-9876543212");
        worker3.setSkillSet("Harvesting, Team Management, Quality Control");
        worker3.setExperienceYears(10);
        worker3.setRegion("Haryana");
        worker3.setSpecificLocation("Karnal");
        worker3.setAvailability(AvailabilityStatus.BUSY);
        worker3.setDailyRate(new BigDecimal("1000"));
        worker3.setHourlyRate(new BigDecimal("125"));
        worker3.setDescription("Experienced crew leader managing harvesting operations for wheat and rice.");
        worker3.setListedDate(LocalDateTime.now());
        worker3.setIsActive(true);
        workerRepository.save(worker3);

        // Worker 4 - Pesticide Spraying Expert
        WorkerListing worker4 = new WorkerListing();
        worker4.setUser(workerRamesh);
        worker4.setWorkerName("Ramesh Yadav");
        worker4.setPhoneNumber("+91-9876543213");
        worker4.setSkillSet("Pesticide Application, Drone Operation, Crop Protection");
        worker4.setExperienceYears(6);
        worker4.setRegion("Karnataka");
        worker4.setSpecificLocation("Bangalore");
        worker4.setAvailability(AvailabilityStatus.AVAILABLE);
        worker4.setDailyRate(new BigDecimal("900"));
        worker4.setHourlyRate(new BigDecimal("110"));
        worker4.setDescription("Certified pesticide applicator with drone operation expertise.");
        worker4.setListedDate(LocalDateTime.now());
        worker4.setIsActive(true);
        workerRepository.save(worker4);

        System.out.println("✓ Initialized database with 4 unique worker listings");
    }
    
    private void initializeEquipment() {
        User farmerUser = userRepository.findByUsername("farmer_raj").orElse(null);
        User workerUser = userRepository.findByUsername("worker_ravi").orElse(null);

        // Equipment 1 - Tractor (Farmer owned)
        EquipmentListing eq1 = new EquipmentListing();
        eq1.setUser(farmerUser);
        eq1.setEquipmentName("Heavy Duty Tractor");
        eq1.setEquipmentType("Tractor");
        eq1.setBrand("Mahindra");
        eq1.setModel("575 DI");
        eq1.setDescription("75 HP tractor suitable for all farming operations including ploughing, harrowing, and transportation.");
        eq1.setRegion("Punjab");
        eq1.setSpecificLocation("Amritsar");
        eq1.setPhoneNumber("+91-9876543220");
        eq1.setAvailability(AvailabilityStatus.AVAILABLE);
        eq1.setDailyRentalCost(new BigDecimal("2000"));
        eq1.setHourlyRentalCost(new BigDecimal("250"));
        eq1.setCondition(EquipmentCondition.EXCELLENT);
        eq1.setListedDate(LocalDateTime.now());
        eq1.setIsActive(true);
        equipmentRepository.save(eq1);

        // Equipment 2 - Harvester Combine (Farmer owned)
        EquipmentListing eq2 = new EquipmentListing();
        eq2.setUser(farmerUser);
        eq2.setEquipmentName("Combine Harvester");
        eq2.setEquipmentType("Harvester");
        eq2.setBrand("John Deere");
        eq2.setModel("W210");
        eq2.setDescription("Modern combine harvester for wheat and rice. Can cover 5-7 acres per day.");
        eq2.setRegion("Haryana");
        eq2.setSpecificLocation("Panipat");
        eq2.setPhoneNumber("+91-9876543221");
        eq2.setAvailability(AvailabilityStatus.BUSY);
        eq2.setDailyRentalCost(new BigDecimal("5000"));
        eq2.setHourlyRentalCost(new BigDecimal("650"));
        eq2.setCondition(EquipmentCondition.GOOD);
        eq2.setListedDate(LocalDateTime.now());
        eq2.setIsActive(true);
        equipmentRepository.save(eq2);

        // Equipment 3 - Rotavator (Worker owned)
        EquipmentListing eq3 = new EquipmentListing();
        eq3.setUser(workerUser);
        eq3.setEquipmentName("Rotary Tiller (Rotavator)");
        eq3.setEquipmentType("Tillage Equipment");
        eq3.setBrand("Fieldking");
        eq3.setModel("FKR-180");
        eq3.setDescription("6 feet rotavator perfect for seedbed preparation and soil mixing.");
        eq3.setRegion("Maharashtra");
        eq3.setSpecificLocation("Nashik");
        eq3.setPhoneNumber("+91-9876543222");
        eq3.setAvailability(AvailabilityStatus.AVAILABLE);
        eq3.setDailyRentalCost(new BigDecimal("1200"));
        eq3.setHourlyRentalCost(new BigDecimal("150"));
        eq3.setCondition(EquipmentCondition.GOOD);
        eq3.setListedDate(LocalDateTime.now());
        eq3.setIsActive(true);
        equipmentRepository.save(eq3);

        // Equipment 4 - Sprayer (Farmer owned)
        EquipmentListing eq4 = new EquipmentListing();
        eq4.setUser(farmerUser);
        eq4.setEquipmentName("Power Sprayer");
        eq4.setEquipmentType("Sprayer");
        eq4.setBrand("Neptune");
        eq4.setModel("NF-25");
        eq4.setDescription("High-pressure sprayer for pesticides and fertilizers. 400-liter tank capacity.");
        eq4.setRegion("Gujarat");
        eq4.setSpecificLocation("Rajkot");
        eq4.setPhoneNumber("+91-9876543223");
        eq4.setAvailability(AvailabilityStatus.AVAILABLE);
        eq4.setDailyRentalCost(new BigDecimal("800"));
        eq4.setHourlyRentalCost(new BigDecimal("100"));
        eq4.setCondition(EquipmentCondition.EXCELLENT);
        eq4.setListedDate(LocalDateTime.now());
        eq4.setIsActive(true);
        equipmentRepository.save(eq4);

        // Equipment 5 - Seed Drill (Worker owned)
        EquipmentListing eq5 = new EquipmentListing();
        eq5.setUser(workerUser);
        eq5.setEquipmentName("9-Row Seed Drill");
        eq5.setEquipmentType("Seeding Equipment");
        eq5.setBrand("Shaktiman");
        eq5.setModel("SD-9");
        eq5.setDescription("Multi-crop seed drill suitable for wheat, maize, and soybean planting.");
        eq5.setRegion("Madhya Pradesh");
        eq5.setSpecificLocation("Indore");
        eq5.setPhoneNumber("+91-9876543224");
        eq5.setAvailability(AvailabilityStatus.AVAILABLE);
        eq5.setDailyRentalCost(new BigDecimal("1000"));
        eq5.setHourlyRentalCost(new BigDecimal("130"));
        eq5.setCondition(EquipmentCondition.GOOD);
        eq5.setListedDate(LocalDateTime.now());
        eq5.setIsActive(true);
        equipmentRepository.save(eq5);

        System.out.println("✓ Initialized database with 5 equipment listings");
    }
    
    private void initializeExperiences() {
        User farmerUser = userRepository.findByUsername("farmer_raj").orElse(null);
        User workerUser = userRepository.findByUsername("worker_ravi").orElse(null);

        // Experience 1 - Rice Farming
        Crop rice = cropRepository.findById(1L).orElse(null);
        FarmerExperience exp1 = new FarmerExperience();
        exp1.setUser(farmerUser);
        exp1.setCrop(rice);
        exp1.setTitle("Successful Organic Rice Farming in Punjab");
        exp1.setExperienceText("I've been growing organic rice for 12 years now. The transition from conventional to organic took 3 years but was worth it. The key is proper water management and using organic compost instead of chemical fertilizers.");
        exp1.setYearsGrowing(12);
        exp1.setRegion("Punjab");
        exp1.setAverageYield(2800.0);
        exp1.setTipsAndTricks("Use neem cake before transplanting. Maintain 2-3 inches of water during growing season. Introduce ducks for natural pest control.");
        exp1.setChallengesFaced("Initial yield drop during transition. Had to learn new pest management techniques. Finding reliable organic fertilizer sources was difficult.");
        exp1.setHelpfulCount(45);
        exp1.setPostedDate(LocalDateTime.now().minusDays(30));
        exp1.setIsVerified(true);
        experienceRepository.save(exp1);

        // Experience 2 - Wheat Farming
        Crop wheat = cropRepository.findById(2L).orElse(null);
        FarmerExperience exp2 = new FarmerExperience();
        exp2.setUser(farmerUser);
        exp2.setCrop(wheat);
        exp2.setTitle("High-Yield Wheat Cultivation Techniques");
        exp2.setExperienceText("After extensive research and experimentation, I've developed a cultivation method that consistently gives 25% higher yields than traditional methods. The secret lies in timely sowing and proper nutrient management.");
        exp2.setYearsGrowing(15);
        exp2.setRegion("Haryana");
        exp2.setAverageYield(2500.0);
        exp2.setTipsAndTricks("Sow between Nov 1-15 for best results. Use seed treatment with Trichoderma. Apply first irrigation 21 days after sowing.");
        exp2.setChallengesFaced("Rust disease in humid years. Managing labor during peak harvest season. Dealing with price fluctuations.");
        exp2.setHelpfulCount(67);
        exp2.setPostedDate(LocalDateTime.now().minusDays(45));
        exp2.setIsVerified(true);
        experienceRepository.save(exp2);

        // Experience 3 - Cotton Farming
        Crop cotton = cropRepository.findById(3L).orElse(null);
        FarmerExperience exp3 = new FarmerExperience();
        exp3.setUser(farmerUser);
        exp3.setCrop(cotton);
        exp3.setTitle("Integrated Pest Management for Cotton");
        exp3.setExperienceText("Cotton farming was becoming unprofitable due to high pesticide costs. Switched to IPM techniques 5 years ago and reduced chemical usage by 60% while maintaining yields.");
        exp3.setYearsGrowing(10);
        exp3.setRegion("Maharashtra");
        exp3.setAverageYield(950.0);
        exp3.setTipsAndTricks("Install pheromone traps every 50 meters. Use Bt cotton varieties. Intercrop with marigold to repel pests naturally.");
        exp3.setChallengesFaced("Convincing neighbors about IPM benefits. Initial learning curve for pest identification. Bollworm resistance in some areas.");
        exp3.setHelpfulCount(38);
        exp3.setPostedDate(LocalDateTime.now().minusDays(20));
        exp3.setIsVerified(true);
        experienceRepository.save(exp3);

        // Experience 4 - Drone Spraying (Worker shared experience)
        Crop tomato = cropRepository.findById(4L).orElse(null);
        FarmerExperience exp4 = new FarmerExperience();
        exp4.setUser(workerUser);
        exp4.setCrop(tomato);
        exp4.setTitle("Modern Drone Spraying Techniques for Tomato Farms");
        exp4.setExperienceText("As an experienced agricultural worker and drone operator, I've seen drone spraying reduce chemical drift by 80% and application time by 90%. Precision spraying protects tomato foliage evenly.");
        exp4.setYearsGrowing(6);
        exp4.setRegion("Karnataka");
        exp4.setAverageYield(18000.0);
        exp4.setTipsAndTricks("Calibrate flight speed based on wind speed. Use ultra-low volume nozzles for even atomization.");
        exp4.setChallengesFaced("Battery management on large fields and farmer hesitation toward new technology.");
        exp4.setHelpfulCount(52);
        exp4.setPostedDate(LocalDateTime.now().minusDays(15));
        exp4.setIsVerified(true);
        experienceRepository.save(exp4);

        System.out.println("✓ Initialized database with 4 experiences (farmers and workers)");
    }
}
