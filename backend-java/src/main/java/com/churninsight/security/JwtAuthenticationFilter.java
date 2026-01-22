package com.churninsight.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }
    
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;
        
        String requestUri = request.getRequestURI();
        log.info("[JWT-FILTER] Request: {} {}", request.getMethod(), requestUri);
        
        // Permitir rutas públicas sin autenticación
        if (requestUri.startsWith("/api/auth/") || 
            requestUri.equals("/actuator/health") ||
            requestUri.startsWith("/v3/api-docs") ||
            requestUri.startsWith("/swagger-ui")) {
            log.debug("[JWT-FILTER] Ruta pública, saltando autenticación: {}", requestUri);
            filterChain.doFilter(request, response);
            return;
        }
        
        log.debug("[JWT-FILTER] Authorization header presente: {}", authHeader != null);
        if (authHeader != null) {
            log.debug("[JWT-FILTER] Header value (primeros 30 chars): {}", 
                authHeader.substring(0, Math.min(30, authHeader.length())));
        }
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("[JWT-FILTER] No Bearer token encontrado para ruta protegida: {}", requestUri);
            filterChain.doFilter(request, response);
            return;
        }
        
        jwt = authHeader.substring(7);
        log.debug("[JWT-FILTER] Token JWT extraído (longitud: {})", jwt.length());
        
        try {
            username = jwtService.extractUsername(jwt);
            log.info("[JWT-FILTER] Username extraído del token: {}", username);
            
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                log.debug("[JWT-FILTER] Cargando detalles del usuario: {}", username);
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                log.debug("[JWT-FILTER] Usuario cargado con authorities: {}", userDetails.getAuthorities());
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    log.info("[JWT-FILTER] ✓ Token VÁLIDO - Autenticando usuario: {}", username);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("[JWT-FILTER] Authentication establecida en SecurityContext");
                } else {
                    log.error("[JWT-FILTER] ✗ Token INVÁLIDO para usuario: {}", username);
                }
            } else if (username != null) {
                log.debug("[JWT-FILTER] Usuario ya autenticado en el contexto de seguridad");
            }
        } catch (Exception e) {
            log.error("[JWT-FILTER] ✗ Excepción en autenticación JWT: {} - {}", 
                e.getClass().getSimpleName(), e.getMessage(), e);
        }
        
        filterChain.doFilter(request, response);
    }
}
