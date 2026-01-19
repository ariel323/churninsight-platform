package com.churninsight.service;

import com.churninsight.model.Role;
import com.churninsight.model.RoleRepository;
import com.churninsight.model.User;
import com.churninsight.model.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        logger.info("[UserService] ========================================");
        logger.info("[UserService] Cargando usuario para autenticación: {}", usernameOrEmail);
        
        java.util.Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail);
        
        if (!userOpt.isPresent()) {
            userOpt = userRepository.findByEmail(usernameOrEmail);
        }
        
        User user = userOpt.orElseThrow(() -> {
            logger.error("[UserService] Usuario NO encontrado: {}", usernameOrEmail);
            return new UsernameNotFoundException("Usuario no encontrado: " + usernameOrEmail);
        });
        
        logger.info("[UserService] Usuario encontrado:");
        logger.info("[UserService]   - ID: {}", user.getId());
        logger.info("[UserService]   - Username: {}", user.getUsername());
        logger.info("[UserService]   - Email: {}", user.getEmail());
        logger.info("[UserService]   - Activo: {}", user.isActive());
        logger.info("[UserService]   - Roles: {}", user.getRoles());
        
        if (!user.isActive()) {
            logger.warn("[UserService] Usuario inactivo: {}", usernameOrEmail);
            throw new UsernameNotFoundException("Usuario inactivo");
        }
        
        // Cargar roles desde la relación Many-to-Many
        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
            .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName()))
            .collect(Collectors.toList());
        
        if (authorities.isEmpty()) {
            logger.error("[UserService] ¡Usuario sin roles asignados! Asignando ANALISTA por defecto");
            Role analistaRole = roleRepository.findByName("ANALISTA")
                .orElseThrow(() -> new RuntimeException("Rol ANALISTA no encontrado en la base de datos"));
            user.addRole(analistaRole);
            userRepository.save(user);
            authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_ANALISTA"));
        }
        
        logger.info("[UserService]   - Authorities: {}", authorities);
        logger.info("[UserService]   - Rol principal: {}", user.getPrimaryRole());
        logger.info("[UserService] ========================================");
        
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            authorities
        );
    }
    
    public User registerUser(String username, String password, String email, String fullName) {
        logger.info("[UserService] Registrando nuevo usuario: {}", username);
        
        if (userRepository.existsByUsername(username)) {
            logger.warn("[UserService] Username ya existe: {}", username);
            throw new RuntimeException("El nombre de usuario ya existe");
        }
        
        if (userRepository.existsByEmail(email)) {
            logger.warn("[UserService] Email ya existe: {}", email);
            throw new RuntimeException("El email ya está registrado");
        }
        
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setFullName(fullName);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        
        // Asignar rol ANALISTA por defecto
        Role analistaRole = roleRepository.findByName("ANALISTA")
            .orElseThrow(() -> new RuntimeException("Rol ANALISTA no encontrado"));
        user.addRole(analistaRole);
        
        User savedUser = userRepository.save(user);
        logger.info("[UserService] Usuario registrado exitosamente: {} con rol ANALISTA", username);
        
        return savedUser;
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
    
    /**
     * Verifica si un usuario tiene un rol específico
     */
    public boolean userHasRole(String username, String roleName) {
        User user = getUserByUsername(username);
        return user.hasRole(roleName);
    }
    
    /**
     * Verifica si un usuario es ADMIN
     */
    public boolean isAdmin(String username) {
        User user = getUserByUsername(username);
        return user.isAdmin();
    }
    
    /**
     * Verifica si un usuario es ANALISTA
     */
    public boolean isAnalista(String username) {
        User user = getUserByUsername(username);
        return user.isAnalista();
    }
    
    /**
     * Obtiene todos los roles de un usuario como lista de Strings
     */
    public List<String> getUserRoles(String username) {
        User user = getUserByUsername(username);
        return user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene el rol principal del usuario (más alto en jerarquía)
     */
    public String getUserPrimaryRole(String username) {
        User user = getUserByUsername(username);
        return user.getPrimaryRole();
    }
    
    public String generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("No se encontró usuario con ese email"));
        
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(24));
        
        userRepository.save(user);
        return token;
    }
    
    public void resetPassword(String token, String newPassword) {
        logger.info("[UserService] ========================================");
        logger.info("[UserService] Intentando restablecer contraseña con token");
        
        User user = userRepository.findByResetToken(token)
            .orElseThrow(() -> new RuntimeException("Token inválido o expirado"));
        
        logger.info("[UserService] Usuario encontrado para reseteo:");
        logger.info("[UserService]   - ID: {}", user.getId());
        logger.info("[UserService]   - Username: {}", user.getUsername());
        logger.info("[UserService]   - Email: {}", user.getEmail());
        logger.info("[UserService]   - Rol principal: {}", user.getPrimaryRole());
        logger.info("[UserService]   - Roles: {}", user.getRoles());
        logger.info("[UserService]   - Activo: {}", user.isActive());
        
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            logger.warn("[UserService] Token expirado para usuario {}", user.getUsername());
            throw new RuntimeException("El token ha expirado");
        }
        
        // Solo cambiar la contraseña, NO modificar roles
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        
        User savedUser = userRepository.save(user);
        
        logger.info("[UserService] ✓ Contraseña restablecida exitosamente");
        logger.info("[UserService]   - Username: {}", savedUser.getUsername());
        logger.info("[UserService]   - Rol principal: {}", savedUser.getPrimaryRole());
        logger.info("[UserService]   - Roles: {}", savedUser.getRoles());
        logger.info("[UserService] ========================================");
    }
}
