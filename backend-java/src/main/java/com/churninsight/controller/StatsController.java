package com.churninsight.controller;

import com.churninsight.model.PredictionHistory;
import com.churninsight.model.PredictionHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class StatsController {

    @Autowired
    private PredictionHistoryRepository predictionHistoryRepository;
    
    /**
     * Endpoint para obtener estadísticas en tiempo real del sistema
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Authentication authentication) {
        Map<String, Object> stats = new HashMap<>();
        
        String username = authentication.getName();
        
        // Obtener todas las predicciones del usuario
        List<PredictionHistory> allPredictions = predictionHistoryRepository.findByUsernameOrderByPredictionDateDesc(username);
        
        // Contar clientes únicos analizados
        long activeUsers = allPredictions.stream()
            .map(PredictionHistory::getCustomerId)
            .distinct()
            .count();
        
        // Contar predicciones de hoy
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        long todayPredictions = predictionHistoryRepository.countByUsernameAndPredictionDateBetween(
            username, startOfDay, endOfDay);
        
        // Calcular tasa de retención (clientes con probabilidad < 50%)
        long lowRiskClients = allPredictions.stream()
            .filter(p -> p.getChurnProbability() < 0.5)
            .count();
        double retentionRate = allPredictions.isEmpty() ? 0.0 : 
            (lowRiskClients * 100.0) / allPredictions.size();
        
        stats.put("activeUsers", activeUsers);
        stats.put("retentionRate", retentionRate);
        stats.put("todayPredictions", todayPredictions);
        
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Endpoint para obtener KPIs de negocio
     */
    @GetMapping("/stats/kpis")
    public ResponseEntity<KPIsDTO> getKPIs(Authentication authentication) {
        String username = authentication.getName();
        
        // Obtener predicciones del último mes
        LocalDateTime lastMonth = LocalDateTime.now().minusMonths(1);
        List<PredictionHistory> recentPredictions = predictionHistoryRepository
            .findByUsernameOrderByPredictionDateDesc(username);
        
        // Filtrar predicciones del último mes
        List<PredictionHistory> lastMonthPredictions = recentPredictions.stream()
            .filter(p -> p.getPredictionDate().isAfter(lastMonth))
            .toList();
        
        // Calcular clientes en riesgo crítico (probabilidad > 0.75)
        long highRiskClients = recentPredictions.stream()
            .filter(p -> p.getChurnProbability() > 0.75)
            .map(PredictionHistory::getCustomerId)
            .distinct()
            .count();
        
        // Calcular capital en riesgo (suma de balances de clientes en riesgo crítico)
        // Solo sumar balances que no sean null
        double capitalAtRisk = recentPredictions.stream()
            .filter(p -> p.getChurnProbability() > 0.75)
            .filter(p -> p.getBalance() != null)
            .mapToDouble(PredictionHistory::getBalance)
            .sum();
        
        // Calcular riesgo promedio (como porcentaje)
        double averageRisk = recentPredictions.stream()
            .mapToDouble(PredictionHistory::getChurnProbability)
            .average()
            .orElse(0.0) * 100.0; // Convertir a porcentaje
        
        // Total de predicciones
        long totalPredictions = recentPredictions.size();
        
        // Precisión del modelo (simulado - en producción se calcularía comparando con resultados reales)
        // Por ahora, asumimos una precisión base de 0.85 (85%) como decimal
        double accuracyLastMonth = lastMonthPredictions.isEmpty() ? 0.0 : 0.85;
        
        KPIsDTO kpis = new KPIsDTO(
            (int) highRiskClients,
            capitalAtRisk,
            accuracyLastMonth,
            (int) totalPredictions,
            averageRisk
        );
        
        return ResponseEntity.ok(kpis);
    }
}
