package com.churninsight.service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;

@Service
public class ChurnPredictionService {

    @Value("${python.api.url:http://localhost:8000}")
    private String pythonApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class PredictionRequest {
        private double ageRisk;
        private double numOfProducts;
        private double inactivo4070;
        private double productsRiskFlag;
        private double countryRiskFlag;
        private double deltaBalance;
        private double deltaNumOfProducts;
        private boolean recentInactive;
        private boolean productUsageDrop;
        private boolean hadComplaint;

        // Getters y setters
        public double getAgeRisk() { return ageRisk; }
        public void setAgeRisk(double ageRisk) { this.ageRisk = ageRisk; }
        
        public double getNumOfProducts() { return numOfProducts; }
        public void setNumOfProducts(double numOfProducts) { this.numOfProducts = numOfProducts; }
        
        public double getInactivo4070() { return inactivo4070; }
        public void setInactivo4070(double inactivo4070) { this.inactivo4070 = inactivo4070; }
        
        public double getProductsRiskFlag() { return productsRiskFlag; }
        public void setProductsRiskFlag(double productsRiskFlag) { this.productsRiskFlag = productsRiskFlag; }
        
        public double getCountryRiskFlag() { return countryRiskFlag; }
        public void setCountryRiskFlag(double countryRiskFlag) { this.countryRiskFlag = countryRiskFlag; }
        
        public double getDeltaBalance() { return deltaBalance; }
        public void setDeltaBalance(double deltaBalance) { this.deltaBalance = deltaBalance; }
        
        public double getDeltaNumOfProducts() { return deltaNumOfProducts; }
        public void setDeltaNumOfProducts(double deltaNumOfProducts) { this.deltaNumOfProducts = deltaNumOfProducts; }
        
        public boolean isRecentInactive() { return recentInactive; }
        public void setRecentInactive(boolean recentInactive) { this.recentInactive = recentInactive; }
        
        public boolean isProductUsageDrop() { return productUsageDrop; }
        public void setProductUsageDrop(boolean productUsageDrop) { this.productUsageDrop = productUsageDrop; }
        
        public boolean isHadComplaint() { return hadComplaint; }
        public void setHadComplaint(boolean hadComplaint) { this.hadComplaint = hadComplaint; }
    }

    public double predictChurn(PredictionRequest request) {
        try {
            String url = pythonApiUrl + "/predict";
            
            // Crear payload JSON
            Map<String, Object> payload = new HashMap<>();
            payload.put("ageRisk", request.getAgeRisk());
            payload.put("numOfProducts", request.getNumOfProducts());
            payload.put("inactivo4070", request.getInactivo4070());
            payload.put("productsRiskFlag", request.getProductsRiskFlag());
            payload.put("countryRiskFlag", request.getCountryRiskFlag());
            payload.put("deltaBalance", request.getDeltaBalance());
            payload.put("deltaNumOfProducts", request.getDeltaNumOfProducts());
            payload.put("recentInactive", request.isRecentInactive());
            payload.put("productUsageDrop", request.isProductUsageDrop());
            payload.put("hadComplaint", request.isHadComplaint());
            
            // Llamada HTTP al Python
            ResponseEntity<Map> response = restTemplate.postForEntity(url, payload, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> body = response.getBody();
                return Double.parseDouble(body.get("probability").toString());
            } else {
                throw new RuntimeException("Error en predicción: " + response.getStatusCode());
            }
        } catch (RestClientException e) {
            System.err.println("Error llamando al servicio Python: " + e.getMessage());
            throw new RuntimeException("Servicio de predicción no disponible", e);
        } catch (Exception e) {
            System.err.println("Error procesando predicción: " + e.getMessage());
            throw new RuntimeException("Error interno en predicción", e);
        }
    }
}