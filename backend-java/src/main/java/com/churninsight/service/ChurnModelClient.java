package com.churninsight.service;

import com.churninsight.controller.ChurnPredictionRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Component
public class ChurnModelClient {

    private final RestTemplate rest = new RestTemplate();

    @Value("${python-service.url}")
    private String pythonUrl;

    /**
     * Realiza predicción de churn usando el servicio Python FastAPI
     * Retorna un Map con churn_probability
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> predict(ChurnPredictionRequest request) {
        String url = pythonUrl + "/predict";
        
        // Convertir request a lista de features en el orden correcto
        List<Double> features = new ArrayList<>();
        features.add(request.getAgeRisk());
        features.add(request.getNumOfProducts());
        features.add(request.getInactivo4070());
        features.add(request.getProductsRiskFlag());
        features.add(request.getCountryRiskFlag());
        
        Map<String, Object> body = new HashMap<>();
        body.put("features", features);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request_entity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> resp = rest.postForEntity(url, request_entity, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Python service error: " + resp.getStatusCode());
        }

        Object prob = resp.getBody().get("probability");
        double probability;
        
        if (prob instanceof Number) {
            probability = ((Number) prob).doubleValue();
        } else if (prob instanceof String) {
            probability = Double.parseDouble((String) prob);
        } else {
            throw new RuntimeException("Invalid response from python service");
        }
        
        // Retornar en formato esperado por el controlador
        Map<String, Object> result = new HashMap<>();
        result.put("churn_probability", probability);
        
        return result;
    }
}