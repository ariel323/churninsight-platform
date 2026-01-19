package com.churninsight.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String fullName;
    
    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    
    @Column
    private String resetToken;
    
    @Column
    private LocalDateTime resetTokenExpiry;
    
    @Column
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    private boolean active = true;
    
    // Constructores
    public User() {}
    
    public User(String username, String password, String email, String fullName) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.fullName = fullName;
        this.createdAt = LocalDateTime.now();
        this.active = true;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getResetToken() {
        return resetToken;
    }
    
    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }
    
    public LocalDateTime getResetTokenExpiry() {
        return resetTokenExpiry;
    }
    
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public Set<Role> getRoles() {
        return roles;
    }
    
    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }
    
    public void addRole(Role role) {
        this.roles.add(role);
        role.getUsers().add(this);
    }
    
    public void removeRole(Role role) {
        this.roles.remove(role);
        role.getUsers().remove(this);
    }
    
    public boolean hasRole(String roleName) {
        return this.roles.stream()
            .anyMatch(role -> role.getName().equals(roleName));
    }
    
    /**
     * Verifica si el usuario tiene rol ADMIN
     */
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }
    
    /**
     * Verifica si el usuario tiene rol ANALISTA
     */
    public boolean isAnalista() {
        return hasRole("ANALISTA");
    }
    
    /**
     * Obtiene el rol principal (el de mayor jerarquía)
     * ADMIN > ANALISTA
     */
    public String getPrimaryRole() {
        if (hasRole("ADMIN")) {
            return "ADMIN";
        }
        if (hasRole("ANALISTA")) {
            return "ANALISTA";
        }
        return "USER";
    }
}
