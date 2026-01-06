package com.churninsight.service;

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

@Component
public class ChurnModelClient {

    private final RestTemplate rest = new RestTemplate();

    @Value("${python-service.url}")
    private String pythonUrl;

    @SuppressWarnings("unchecked")
    public double predict(List<Double> features) {
        String url = pythonUrl + "/predict";
        Map<String, Object> body = new HashMap<>();
        body.put("features", features);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Map> resp = rest.postForEntity(url, request, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Python service error: " + resp.getStatusCode());
        }

        Object prob = resp.getBody().get("probability");
        if (prob instanceof Number) {
            return ((Number) prob).doubleValue();
        }
        if (prob instanceof String) {
            return Double.parseDouble((String) prob);
        }
        throw new RuntimeException("Invalid response from python service");
    }
}