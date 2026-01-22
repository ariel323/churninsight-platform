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
            logger.debug("[JWT] Username extraído exitosamente: {}", username);
            return username;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.warn("[JWT] Token expirado: {}", e.getMessage());
            throw new RuntimeException("Token expirado", e);
        } catch (io.jsonwebtoken.MalformedJwtException e) {
            logger.error("[JWT] Token malformado: {}", e.getMessage());
            throw new RuntimeException("Token inválido", e);
        } catch (io.jsonwebtoken.security.SignatureException e) {
            logger.error("[JWT] Firma del token inválida: {}", e.getMessage());
            throw new RuntimeException("Token con firma inválida", e);
        } catch (Exception e) {
            logger.error("[JWT] Error inesperado extrayendo username: {}", e.getMessage(), e);
            throw new RuntimeException("Error procesando token", e);
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
        try {
            Date now = new Date(System.currentTimeMillis());
            Date expiry = new Date(System.currentTimeMillis() + JWT_EXPIRATION);
            
            String token = Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSignInKey())
                .compact();
            
            logger.info("[JWT] Token generado exitosamente para usuario: {} (expira: {})", 
                userDetails.getUsername(), expiry);
            return token;
        } catch (Exception e) {
            logger.error("[JWT] Error generando token para {}: {}", userDetails.getUsername(), e.getMessage());
            throw new RuntimeException("Error generando token", e);
        }
    }
    
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            boolean usernameMatches = username.equals(userDetails.getUsername());
            boolean notExpired = !isTokenExpired(token);
            boolean valid = usernameMatches && notExpired;
            
            logger.debug("[JWT] Validación de token para {}: username matches={}, not expired={}, valid={}", 
                username, usernameMatches, notExpired, valid);
            
            if (!valid) {
                if (!usernameMatches) {
                    logger.warn("[JWT] Token inválido: username no coincide. Token={}, UserDetails={}", 
                        username, userDetails.getUsername());
                }
                if (!notExpired) {
                    logger.warn("[JWT] Token inválido: token expirado para usuario {}", username);
                }
            }
            
            return valid;
        } catch (Exception e) {
            logger.error("[JWT] Error validando token: {} - {}", e.getClass().getSimpleName(), e.getMessage());
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
