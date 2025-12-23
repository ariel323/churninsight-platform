package com.churninsight.domain.service;

import com.churninsight.api.dto.PredictionRequest;
import com.churninsight.api.dto.PredictionResponse;
import org.springframework.web.client.RestTemplate;

public class FastApiPredictionService implements PredictionService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String FASTAPI_URL = "http://localhost:8000/predict";

    @Override
    public PredictionResponse predict(PredictionRequest request) {
        //Por ahora devolvemos un objeto vacío para evitar el error de compilación
        return new PredictionResponse("Pendiente de integración real", 0.0);
    }
}