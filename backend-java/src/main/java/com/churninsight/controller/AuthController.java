package com.churninsight.controller;

import com.churninsight.security.JwtService;
import com.churninsight.service.UserService;
import com.churninsight.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    
    public AuthController(AuthenticationManager authenticationManager, 
                         JwtService jwtService,
                         UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", userDetails.getUsername());
            response.put("authorities", userDetails.getAuthorities());
            response.put("message", "Autenticación exitosa");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Credenciales inválidas");
            errorResponse.put("message", "Usuario o contraseña incorrectos");
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest registerRequest) {
        try {
            // Validaciones
            if (registerRequest.getUsername() == null || registerRequest.getUsername().length() < 4) {
                return ResponseEntity.badRequest().body(Map.of("error", "El usuario debe tener al menos 4 caracteres"));
            }
            
            if (registerRequest.getPassword() == null || registerRequest.getPassword().length() < 8) {
                return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 8 caracteres"));
            }
            
            if (registerRequest.getEmail() == null || !registerRequest.getEmail().contains("@")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email inválido"));
            }
            
            if (registerRequest.getFullName() == null || registerRequest.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El nombre completo es requerido"));
            }
            
            User user = userService.registerUser(
                registerRequest.getUsername(),
                registerRequest.getPassword(),
                registerRequest.getEmail(),
                registerRequest.getFullName()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Usuario registrado exitosamente");
            response.put("username", user.getUsername());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            String token = userService.generatePasswordResetToken(request.getEmail());
            
            // En un sistema real, aquí enviarías un email con el token
            // Por ahora, lo devolvemos en la respuesta (solo para desarrollo)
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Se ha generado un token de recuperación");
            response.put("token", token); // En producción, NO enviar esto en la respuesta
            response.put("info", "En producción, este token se enviaría por email");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
                return ResponseEntity.badRequest().body(Map.of("error", "La contraseña debe tener al menos 8 caracteres"));
            }
            
            userService.resetPassword(request.getToken(), request.getNewPassword());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Contraseña restablecida exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, String> response = new HashMap<>();
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("error", "Authorization header missing or invalid");
            return ResponseEntity.status(401).body(response);
        }

        String token = authHeader.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            var ud = userService.loadUserByUsername(username);
            if (ud == null || !jwtService.isTokenValid(token, ud)) {
                response.put("error", "Token inválido");
                return ResponseEntity.status(401).body(response);
            }
            response.put("message", "Token válido");
            response.put("username", ud.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Error validando token: " + e.getMessage());
            return ResponseEntity.status(401).body(response);
        }
    }
}

// DTOs
class LoginRequest {
    private String username;
    private String password;
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String fullName;
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
}

class ForgotPasswordRequest {
    private String email;
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}

class ResetPasswordRequest {
    private String token;
    private String newPassword;
    
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
