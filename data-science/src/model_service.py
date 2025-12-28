"""
Servicio FastAPI para predicciones de churn.
"""

print("Starting model_service.py")

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np
from pathlib import Path

print("Imports successful")

app = FastAPI(title="ChurnInsight ML Service", version="1.0.0")

# Cargar el modelo (placeholder por ahora)
MODEL_PATH = Path(__file__).parent.parent / "models" / "churn_model.pkl"

class PredictionRequest(BaseModel):
    Age: float
    Total_Transactions: float
    Avg_Transaction_Value: float
    Active_Days: float
    Customer_Satisfaction_Score: float
    Income_Level: str
    App_Usage_Frequency: str

class PredictionResponse(BaseModel):
    churn: bool
    probability: float

@app.get("/")
def root():
    return {"message": "ChurnInsight ML Service", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy", "model": "churn_model_v1"}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    try:
        # Placeholder: lógica simple para demo
        # En producción, cargar el modelo real y hacer predicción
        
        # Lógica dummy basada en los datos
        risk_score = 0.0
        
        if request.Income_Level == "Low":
            risk_score += 0.3
        elif request.Income_Level == "Medium":
            risk_score += 0.1
            
        if request.App_Usage_Frequency == "Low":
            risk_score += 0.4
        elif request.App_Usage_Frequency == "Medium":
            risk_score += 0.2
            
        if request.Customer_Satisfaction_Score < 3.0:
            risk_score += 0.3
            
        if request.Total_Transactions < 50:
            risk_score += 0.2
            
        # Normalizar a 0-1
        probability = min(risk_score, 1.0)
        
        # Umbral para churn
        churn = probability > 0.5
        
        return PredictionResponse(churn=churn, probability=probability)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)