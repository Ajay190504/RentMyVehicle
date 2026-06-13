package com.rentmyvehicle.bootstrap;

import com.rentmyvehicle.model.Role;
import com.rentmyvehicle.model.SubscriptionPlan;
import com.rentmyvehicle.model.User;
import com.rentmyvehicle.repository.SubscriptionPlanRepository;
import com.rentmyvehicle.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubscriptionPlanRepository planRepository;
    private final PasswordEncoder passwordEncoder;
    private final javax.sql.DataSource dataSource;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    public DatabaseSeeder(UserRepository userRepository, SubscriptionPlanRepository planRepository, PasswordEncoder passwordEncoder, javax.sql.DataSource dataSource) {
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.passwordEncoder = passwordEncoder;
        this.dataSource = dataSource;
    }

    @Override
    @jakarta.transaction.Transactional
    public void run(String... args) throws Exception {
        try (java.sql.Connection conn = dataSource.getConnection();
             java.sql.Statement stmt = conn.createStatement()) {
            
            // Whitelist of valid columns for vehicles table (case-insensitive check)
            java.util.Set<String> validColumns = java.util.Set.of(
                "id", "owner_id", "category", "subcategory", "title", "description", 
                "location_city", "hourly_rate", "daily_rate", "monthly_rate", 
                "operator_available", "status", "created_at"
            );

            // Fetch columns of the vehicles table
            try (java.sql.ResultSet rs = conn.getMetaData().getColumns(null, null, "vehicles", null)) {
                while (rs.next()) {
                    String columnName = rs.getString("COLUMN_NAME");
                    if (columnName != null && !validColumns.contains(columnName.toLowerCase())) {
                        try {
                            // Find and drop foreign keys referencing this column
                            try (java.sql.PreparedStatement ps = conn.prepareStatement(
                                    "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vehicles' AND COLUMN_NAME = ?")) {
                                ps.setString(1, columnName);
                                try (java.sql.ResultSet fkRs = ps.executeQuery()) {
                                    while (fkRs.next()) {
                                        String fkName = fkRs.getString("CONSTRAINT_NAME");
                                        if (fkName != null && !"PRIMARY".equalsIgnoreCase(fkName)) {
                                            try (java.sql.Statement dropFkStmt = conn.createStatement()) {
                                                dropFkStmt.executeUpdate("ALTER TABLE vehicles DROP FOREIGN KEY " + fkName);
                                                System.out.println("Dropped foreign key constraint: '" + fkName + "' on column '" + columnName + "'");
                                            } catch (Exception fkEx) {
                                                System.err.println("Failed to drop foreign key '" + fkName + "': " + fkEx.getMessage());
                                            }
                                        }
                                    }
                                }
                            }

                            stmt.executeUpdate("ALTER TABLE vehicles DROP COLUMN " + columnName);
                            System.out.println("Cleaned up obsolete database column: '" + columnName + "' from vehicles table.");
                        } catch (Exception dropEx) {
                            System.err.println("Failed to drop obsolete column '" + columnName + "': " + dropEx.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Note: could not perform legacy database columns cleanup via JDBC: " + e.getMessage());
        }

        try {
            @SuppressWarnings("unchecked")
            java.util.List<Object[]> rows = entityManager.createNativeQuery("SELECT id, name FROM vehicle_categories").getResultList();
            System.out.println("========== VEHICLE CATEGORIES ==========");
            for (Object[] row : rows) {
                System.out.println("ID: " + row[0] + " | Name: " + row[1]);
            }
            System.out.println("========================================");
        } catch (Exception e) {
            System.err.println("Failed to fetch vehicle categories: " + e.getMessage());
        }
        seedPlans();
        seedUsers();
    }

    private void seedPlans() {
        if (planRepository.count() == 0) {
            SubscriptionPlan starter = SubscriptionPlan.builder()
                    .name("Starter")
                    .price(new BigDecimal("999.00"))
                    .durationDays(30)
                    .maxVehicleListings(3)
                    .isFeaturedListing(false)
                    .description("Perfect for casual owners looking to rent out a few personal vehicles.")
                    .build();

            SubscriptionPlan professional = SubscriptionPlan.builder()
                    .name("Professional")
                    .price(new BigDecimal("2999.00"))
                    .durationDays(30)
                    .maxVehicleListings(10)
                    .isFeaturedListing(true)
                    .description("Best for small agencies or owners with a fleet of cars.")
                    .build();

            SubscriptionPlan enterprise = SubscriptionPlan.builder()
                    .name("Enterprise")
                    .price(new BigDecimal("9999.00"))
                    .durationDays(30)
                    .maxVehicleListings(-1) // Unlimited
                    .isFeaturedListing(false)
                    .description("Designed for large commercial operators and heavy vehicle suppliers.")
                    .build();

            planRepository.saveAll(List.of(starter, professional, enterprise));
            System.out.println("Seeded default subscription plans.");
        }
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@rent.com")) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@rent.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("9999999999")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded default admin user.");
        }

        if (!userRepository.existsByEmail("owner@rent.com")) {
            User owner = User.builder()
                    .name("Fleet Owner")
                    .email("owner@rent.com")
                    .password(passwordEncoder.encode("owner123"))
                    .phone("8888888888")
                    .role(Role.OWNER)
                    .build();
            userRepository.save(owner);
            System.out.println("Seeded default owner user.");
        }

        if (!userRepository.existsByEmail("customer@rent.com")) {
            User customer = User.builder()
                    .name("Standard Customer")
                    .email("customer@rent.com")
                    .password(passwordEncoder.encode("customer123"))
                    .phone("7777777777")
                    .role(Role.CUSTOMER)
                    .build();
            userRepository.save(customer);
            System.out.println("Seeded default customer user.");
        }
    }
}
