package com.churninsight.config;

import com.churninsight.model.Role;
import com.churninsight.model.RoleRepository;
import com.churninsight.model.User;
import com.churninsight.model.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Garantiza que los roles base y el usuario admin existan al iniciar.
 * Sincroniza automáticamente el usuario admin con la configuración esperada.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_EMAIL = "admin@churninsight.com";
    private static final String DEFAULT_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("[DataInitializer] ========================================");
        log.info("[DataInitializer] Iniciando sincronización de roles y usuario admin");
        log.info("[DataInitializer] ========================================");
        
        // Asegurar que existan los roles base
        Role adminRole = ensureRole("ADMIN", "Administrador con acceso completo");
        Role analistaRole = ensureRole("ANALISTA", "Usuario analista estándar");
        
        log.info("[DataInitializer] Roles asegurados - ADMIN ID: {}, ANALISTA ID: {}", 
            adminRole.getId(), analistaRole.getId());

        // Buscar usuario admin por email primero, luego por username
        Optional<User> adminOpt = userRepository.findByEmail(ADMIN_EMAIL);
        
        if (!adminOpt.isPresent()) {
            adminOpt = userRepository.findByUsername(ADMIN_USERNAME);
        }

        // Si no existe, crear usuario admin
        if (adminOpt.isEmpty()) {
            createAdminUser(adminRole, analistaRole);
            return;
        }

        // Si existe, sincronizar configuración
        syncAdminUser(adminOpt.get(), adminRole, analistaRole);
    }

    /**
     * Crea un nuevo usuario admin con la configuración por defecto
     */
    private void createAdminUser(Role adminRole, Role analistaRole) {
        log.warn("[DataInitializer] No se encontró admin. Creando usuario admin por defecto.");
        
        User admin = new User();
        admin.setUsername(ADMIN_USERNAME);
        admin.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
        admin.setEmail(ADMIN_EMAIL);
        admin.setFullName("Administrador del Sistema");
        admin.setActive(true);
        
        // Asignar ambos roles
        admin.addRole(adminRole);
        admin.addRole(analistaRole);
        
        User savedAdmin = userRepository.save(admin);
        log.info("[DataInitializer] ✓ Admin creado exitosamente");
        log.info("[DataInitializer]   - ID: {}", savedAdmin.getId());
        log.info("[DataInitializer]   - Username: {}", savedAdmin.getUsername());
        log.info("[DataInitializer]   - Email: {}", savedAdmin.getEmail());
        log.info("[DataInitializer]   - Rol principal: {}", savedAdmin.getPrimaryRole());
        log.info("[DataInitializer]   - Roles: {}", savedAdmin.getRoles());
        log.info("[DataInitializer] ========================================");
    }

    /**
     * Sincroniza la configuración del usuario admin existente
     */
    private void syncAdminUser(User admin, Role adminRole, Role analistaRole) {
        log.info("[DataInitializer] Admin encontrado - sincronizando configuración");
        log.info("[DataInitializer]   - ID: {}", admin.getId());
        log.info("[DataInitializer]   - Username: {}", admin.getUsername());
        log.info("[DataInitializer]   - Email: {}", admin.getEmail());
        log.info("[DataInitializer]   - Rol principal: {}", admin.getPrimaryRole());
        log.info("[DataInitializer]   - Roles actuales: {}", admin.getRoles());
        
        boolean changed = false;

        // 1. Sincronizar email
        if (!ADMIN_EMAIL.equals(admin.getEmail())) {
            log.info("[DataInitializer]   → Actualizando email: {} → {}", admin.getEmail(), ADMIN_EMAIL);
            admin.setEmail(ADMIN_EMAIL);
            changed = true;
        }

        // 2. Sincronizar username
        if (!ADMIN_USERNAME.equals(admin.getUsername())) {
            log.info("[DataInitializer]   → Actualizando username: {} → {}", admin.getUsername(), ADMIN_USERNAME);
            admin.setUsername(ADMIN_USERNAME);
            changed = true;
        }

        // 3. Activar usuario si está inactivo
        if (!admin.isActive()) {
            log.info("[DataInitializer]   → Activando usuario admin");
            admin.setActive(true);
            changed = true;
        }

        // 4. Validar contraseña (solo si está vacía)
        if (admin.getPassword() == null || admin.getPassword().isBlank()) {
            log.warn("[DataInitializer]   → Contraseña vacía, estableciendo contraseña por defecto");
            admin.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
            changed = true;
        }

        // 5. Asegurar rol ADMIN en la lista de roles
        if (!admin.hasRole("ADMIN")) {
            log.info("[DataInitializer]   → Agregando rol ADMIN a la lista de roles");
            admin.addRole(adminRole);
            changed = true;
        }

        // 6. Asegurar rol ANALISTA para compatibilidad
        if (!admin.hasRole("ANALISTA")) {
            log.info("[DataInitializer]   → Agregando rol ANALISTA para compatibilidad");
            admin.addRole(analistaRole);
            changed = true;
        }

        // Guardar cambios si es necesario
        if (changed) {
            User savedAdmin = userRepository.save(admin);
            log.info("[DataInitializer] ✓ Admin sincronizado exitosamente");
            log.info("[DataInitializer]   - Rol principal: {}", savedAdmin.getPrimaryRole());
            log.info("[DataInitializer]   - Roles finales: {}", savedAdmin.getRoles());
        } else {
            log.info("[DataInitializer] ✓ Admin ya está correctamente configurado");
        }
        
        log.info("[DataInitializer] ========================================");
    }

    /**
     * Asegura que un rol exista en la base de datos
     */
    private Role ensureRole(String name, String description) {
        return roleRepository.findByName(name)
            .orElseGet(() -> {
                log.info("[DataInitializer] Creando rol: {}", name);
                return roleRepository.save(new Role(name, description));
            });
    }
}
