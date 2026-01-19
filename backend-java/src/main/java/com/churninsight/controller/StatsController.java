package com.churninsight.controller;

import com.churninsight.model.PredictionHistory;
import com.churninsight.model.PredictionHistoryRepository;
import com.churninsight.model.User;
import com.churninsight.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class StatsController {

    private final PredictionHistoryRepository historyRepository;
    private final UserService userService;

    public StatsController(PredictionHistoryRepository historyRepository, UserService userService) {
        this.historyRepository = historyRepository;
        this.userService = userService;
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(null);
        }
        
        String username = authentication.getName();
        
        // Verificar que el usuario existe y está activo
        try {
            User user = userService.getUserByUsername(username);
            if (!user.isActive()) {
                return ResponseEntity.status(403).body(null);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(null);
        }
        
        // Total de predicciones del usuario (Clientes Analizados)
        long totalPredictions = historyRepository.countByUsername(username);
        
        // Predicciones de hoy
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        long todayPredictions = historyRepository.countByUsernameAndPredictionDateBetween(
            username, startOfDay, endOfDay
        );
        
        // Calcular tasa de retención: % de clientes con probabilidad < 0.58 (umbral del modelo)
        // Según el notebook, el umbral óptimo del modelo XGBoost es 0.58
        long lowRiskCount = historyRepository.countByUsernameAndChurnProbabilityLessThan(
            username, 0.58
        );
        double retentionRate = totalPredictions > 0 
            ? (lowRiskCount * 100.0 / totalPredictions) 
            : 0.0;
        
        return ResponseEntity.ok(new StatsResponse(
            (int) totalPredictions,
            retentionRate,
            (int) todayPredictions
        ));
    }
    
    /**
     * Endpoint de KPIs globales - solo disponible para todos los usuarios autenticados
     * Los usuarios ANALISTA ven KPIs globales pero no pueden ver el detalle de otros usuarios
     * Los usuarios ADMIN pueden ver tanto KPIs globales como el detalle de todos los análisis
     */
    @GetMapping("/stats/kpis")
    public ResponseEntity<KPIsDTO> getKPIs(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(null);
        }
        
        String username = authentication.getName();
        
        // Verificar que el usuario existe y está activo
        try {
            User user = userService.getUserByUsername(username);
            if (!user.isActive()) {
                return ResponseEntity.status(403).body(null);
            }
            
            // Log de acceso con información del rol
            String primaryRole = user.getPrimaryRole();
            System.out.println("[INFO] Usuario " + username + " (" + primaryRole + ") accedió a KPIs globales");
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(null);
        }
        
        // Obtener todas las predicciones (optimizado con proyección)
        long totalPredictions = historyRepository.count();
        
        // Calcular clientes en riesgo crítico (>75%) usando query nativa optimizada
        long highRiskCount = historyRepository.countByChurnProbabilityGreaterThan(0.75);
        
        // Calcular capital en riesgo (suma de balances de clientes en riesgo crítico)
        Double capitalAtRisk = historyRepository.sumBalanceByChurnProbabilityGreaterThan(0.75);
        if (capitalAtRisk == null) capitalAtRisk = 0.0;
        
        // Calcular riesgo promedio usando query optimizada
        Double averageRisk = historyRepository.averageChurnProbability();
        if (averageRisk == null) averageRisk = 0.0;
        
        // Accuracy del modelo (placeholder - en producción comparar con churn real)
        double accuracy = 0.87;
        
        KPIsDTO kpis = new KPIsDTO(
            highRiskCount,
            capitalAtRisk,
            accuracy,
            totalPredictions,
            averageRisk * 100 // Convertir a porcentaje
        );
        
        return ResponseEntity.ok(kpis);
    }
}

// DTO para respuesta de estadísticas
class StatsResponse {
    private int activeUsers;
    private double retentionRate;
    private int todayPredictions;
    
    public StatsResponse(int activeUsers, double retentionRate, int todayPredictions) {
        this.activeUsers = activeUsers;
        this.retentionRate = retentionRate;
        this.todayPredictions = todayPredictions;
    }
    
    public int getActiveUsers() { return activeUsers; }
    public double getRetentionRate() { return retentionRate; }
    public int getTodayPredictions() { return todayPredictions; }
}
