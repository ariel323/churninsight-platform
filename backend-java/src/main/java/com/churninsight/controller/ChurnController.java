package com.churninsight.controller;

import com.churninsight.model.PredictionHistory;
import com.churninsight.model.PredictionHistoryRepository;
import com.churninsight.service.ChurnModelClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/churn")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class ChurnController {
    
    private static final Logger logger = LoggerFactory.getLogger(ChurnController.class);
    
    private final ChurnModelClient churnModelClient;
    private final PredictionHistoryRepository predictionHistoryRepository;
    
    public ChurnController(ChurnModelClient churnModelClient,
                          PredictionHistoryRepository predictionHistoryRepository) {
        this.churnModelClient = churnModelClient;
        this.predictionHistoryRepository = predictionHistoryRepository;
    }
    
    /**
     * Endpoint para realizar predicciones de churn
     */
    @PostMapping("/predict")
    public ResponseEntity<?> predictChurn(@RequestBody ChurnPredictionRequest request) {
        try {
            logger.info("[ChurnController] Predicción solicitada por usuario autenticado");
            
            // Obtener usuario autenticado
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth != null ? auth.getName() : "anonymous";
            
            logger.debug("[ChurnController] Usuario: {}", username);
            logger.debug("[ChurnController] Request: ageRisk={}, numOfProducts={}", 
                request.getAgeRisk(), request.getNumOfProducts());
            
            // Llamar al servicio de ML para obtener la predicción
            Map<String, Object> prediction = churnModelClient.predict(request);
            
            // Generar customer ID único
            String customerId = UUID.randomUUID().toString().substring(0, 8);
            
            // Guardar en historial
            PredictionHistory history = new PredictionHistory();
            history.setCustomerId(customerId);
            history.setChurnProbability((Double) prediction.get("churn_probability"));
            history.setAgeRisk(request.getAgeRisk());
            history.setNumOfProducts((int) request.getNumOfProducts()); // Convertir a int
            history.setInactivo4070(request.getInactivo4070());
            history.setProductsRiskFlag(request.getProductsRiskFlag());
            history.setCountryRiskFlag(request.getCountryRiskFlag());
            history.setIsActiveMember(request.getIsActiveMember());
            history.setPredictionDate(LocalDateTime.now());
            history.setUsername(username);
            
            // Guardar campos adicionales para análisis de negocio
            history.setBalance(request.getBalance());
            history.setEstimatedSalary(request.getEstimatedSalary());
            history.setCountry(request.getCountry());
            history.setTenure(request.getTenure());
            
            predictionHistoryRepository.save(history);
            
            logger.info("[ChurnController] Predicción guardada. Customer ID: {}, Probability: {}", 
                customerId, prediction.get("churn_probability"));
            
            // Respuesta al cliente
            Map<String, Object> response = new HashMap<>();
            response.put("churn_probability", prediction.get("churn_probability"));
            response.put("customer_id", customerId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("[ChurnController] Error en predicción: {}", e.getMessage(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al procesar la predicción");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Endpoint para obtener el historial de predicciones del usuario
     */
    @GetMapping("/history")
    public ResponseEntity<List<PredictionHistory>> getHistory() {
        try {
            // Obtener usuario autenticado
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth != null ? auth.getName() : "anonymous";
            
            logger.info("[ChurnController] Historial solicitado por usuario: {}", username);
            
            // Obtener últimas 50 predicciones del usuario
            List<PredictionHistory> history = predictionHistoryRepository
                .findTop50ByUsernameOrderByPredictionDateDesc(username);
            
            logger.debug("[ChurnController] Historial obtenido: {} registros", history.size());
            
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            logger.error("[ChurnController] Error obteniendo historial: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of()); // Retornar lista vacía en caso de error
        }
    }
    
    /**
     * Endpoint para obtener el historial de un cliente específico
     */
    @GetMapping("/customer/{customerId}/history")
    public ResponseEntity<List<PredictionHistory>> getCustomerHistory(@PathVariable String customerId) {
        try {
            logger.info("[ChurnController] Historial solicitado para customer: {}", customerId);
            
            List<PredictionHistory> history = predictionHistoryRepository
                .findByCustomerIdOrderByPredictionDateDesc(customerId);
            
            logger.debug("[ChurnController] Historial obtenido: {} registros", history.size());
            
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            logger.error("[ChurnController] Error obteniendo historial de customer: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }
}
