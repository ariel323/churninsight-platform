import os
import pickle
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "churn_prediction_model.pkl")

class PredictRequest(BaseModel):
    features: list[float]

class PredictResponse(BaseModel):
    prediction: int
    probability: float

app = FastAPI(title="Churn Predictor")

# Ajusta orígenes: frontend (ej. http://localhost:3000) y backend java si es necesario
origins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Cargar modelo
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        arr = [req.features]
        pred_proba = float(model.predict_proba(arr)[0,1]) if hasattr(model, "predict_proba") else 0.0
        pred = int(model.predict(arr)[0])
        return PredictResponse(prediction=pred, probability=pred_proba)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))