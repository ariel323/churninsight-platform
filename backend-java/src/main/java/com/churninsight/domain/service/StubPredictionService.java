package com.churninsight.domain.service;

import com.churninsight.api.dto.PredictionRequest;
import com.churninsight.api.dto.PredictionResponse;
import org.springframework.stereotype.Service;

@Service
public class StubPredictionService implements PredictionService {

    @Override
    public PredictionResponse predict(PredictionRequest request) {
        double probabilidad = calcularProbabilidadDinamica(request);
        
        return clasificarConTusUmbrales(probabilidad);
        // Mock simple y rápido (<10ms) basado en reglas de negocio
        double probability = calculateMockProbability(request);
        String forecast = probability > 0.5 ? "SI" : "NO";
        
        return new PredictionResponse(
            request.getCustomerId(),
            forecast,
            probability
        );
    }
    
    private double calculateMockProbability(PredictionRequest request) {
        // Lógica simple para generar probabilidad mock
        double score = 0.0;
        
        // Factores que aumentan riesgo de churn
        if (request.getMonthlyCharges() > 70) score += 0.2;
        if (request.getTenureMonths() < 12) score += 0.3;
        if ("Month-to-month".equalsIgnoreCase(request.getContractType())) score += 0.25;
        if ("Fiber optic".equalsIgnoreCase(request.getInternetService())) score += 0.15;
        
        return Math.min(score, 0.95); // Máximo 95%
    }

    private double calcularProbabilidadDinamica(PredictionRequest req) {
        if (req == null) return 0.0;

        double score = 0.1; 

        if (req.getMonthlyCharges() != null && req.getMonthlyCharges() > 70.0) {
            score += 0.4;
        }

        if (req.getTenureMonths() != null && req.getTenureMonths() < 6) {
            score += 0.4;
        }

        return Math.min(score, 0.99); 
    }

    private PredictionResponse clasificarConTusUmbrales(double prob) {
        String prevision;

        if (prob > 0.70) {
            prevision = "Va a cancelar";
        } else if (prob >= 0.40) {
            prevision = "En observación";
        } else {
            prevision = "Va a continuar";
        }

        return new PredictionResponse(prevision, prob);
    }
}