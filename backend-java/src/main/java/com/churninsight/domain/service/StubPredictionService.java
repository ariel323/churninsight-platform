package com.churninsight.domain.service;

import com.churninsight.api.dto.PredictionRequest;
import com.churninsight.api.dto.PredictionResponse;
import org.springframework.stereotype.Service;

@Service
public class StubPredictionService implements PredictionService {

    @Override
    public PredictionResponse predict(PredictionRequest request) {
        double probabilidad = calcularProbabilidadDinamica(request);
        String prevision = clasificarChurn(probabilidad);
        
        return new PredictionResponse(request.getCustomerId(), prevision, probabilidad);
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

    private String clasificarChurn(double probabilidad) {
        if (probabilidad > 0.70) {
            return "Va a cancelar";
        } else if (probabilidad >= 0.40) {
            return "En observación";
        } else {
            return "Va a continuar";
        }
    }
}