package com.churninsight.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);
    
    // Clave secreta de 64 bytes (512 bits) para HS512 - DEBE SER LA MISMA EN GENERACIÓN Y VALIDACIÓN
    private static final String SECRET_KEY = "ChurnInsightBancoSecureKey2024SuperSecretKeyForJWTTokenGeneration!!";
    private static final long JWT_EXPIRATION = 24 * 60 * 60 * 1000; // 24 horas
    
    // Cache de la clave para evitar regenerarla
    private SecretKey cachedKey = null;
    
    public String extractUsername(String token) {
        try {
            String username = extractClaim(token, Claims::getSubject);
            logger.debug("[JWT] Username extraído: {}", username);
            return username;
        } catch (Exception e) {
            logger.error("[JWT] Error extrayendo username: {}", e.getMessage());
            throw e;
        }
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }
    
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        String token = Jwts.builder()
            .claims(extraClaims)
            .subject(userDetails.getUsername())
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
            .signWith(getSignInKey())
            .compact();
        logger.info("[JWT] Token generado para usuario: {}", userDetails.getUsername());
        return token;
    }
    
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean valid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
            logger.debug("[JWT] Token válido para {}: {}", username, valid);
            return valid;
        } catch (Exception e) {
            logger.error("[JWT] Error validando token: {}", e.getMessage());
            return false;
        }
    }
    
    private boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        boolean expired = expiration.before(new Date());
        if (expired) {
            logger.warn("[JWT] Token expirado. Expiración: {}", expiration);
        }
        return expired;
    }
    
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    private Claims extractAllClaims(String token) {
        try {
            // Usar verifyWith en lugar de setSigningKey para jjwt 0.12.x
            Claims claims = Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
            logger.debug("[JWT] Claims extraídos correctamente");
            return claims;
        } catch (Exception e) {
            logger.error("[JWT] Error parseando token: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            throw e;
        }
    }
    
    private SecretKey getSignInKey() {
        if (cachedKey == null) {
            byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
            logger.debug("[JWT] Generando clave con {} bytes", keyBytes.length);
            cachedKey = Keys.hmacShaKeyFor(keyBytes);
        }
        return cachedKey;
    }
}
