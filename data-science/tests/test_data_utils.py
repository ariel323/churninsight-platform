"""
Tests para el módulo de data science de ChurnInsight.
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys

# Añadir el directorio src al path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from src.data_utils import load_data, create_churn_target, preprocess_features_for_api, classify_churn_probability
from src.model_trainer import ChurnModelTrainer


class TestDataUtils:
    """Tests para las utilidades de datos."""

    def test_classify_churn_probability(self):
        """Test de clasificación de probabilidades."""
        assert classify_churn_probability(0.8) == "alto_riesgo"
        assert classify_churn_probability(0.5) == "medio_riesgo"
        assert classify_churn_probability(0.2) == "bajo_riesgo"

    def test_preprocess_features_for_api(self):
        """Test de preprocesamiento de features para API."""
        customer_data = {
            'monthly_charges': 65.5,
            'tenure_months': 24,
            'contract_type': 'month-to-month',
            'internet_service': 'fiber_optic',
            'total_charges': 1572.0
        }

        features = preprocess_features_for_api(customer_data)

        assert isinstance(features, np.ndarray)
        assert features.shape == (1, 6)  # 6 features según configuración

    def test_create_churn_target(self):
        """Test de creación del target de churn."""
        # Crear datos de prueba
        data = {
            'Last_Transaction_Days_Ago': [30, 150, 90, 200]
        }
        df = pd.DataFrame(data)

        df_with_churn = create_churn_target(df, threshold_days=120)

        assert 'Churn' in df_with_churn.columns
        assert df_with_churn['Churn'].tolist() == [0, 1, 0, 1]


class TestModelTrainer:
    """Tests para el entrenador de modelos."""

    def test_create_preprocessing_pipeline(self):
        """Test de creación del pipeline de preprocesamiento."""
        trainer = ChurnModelTrainer()
        pipeline = trainer.create_preprocessing_pipeline()

        assert pipeline is not None
        assert hasattr(pipeline, 'transformers')


if __name__ == "__main__":
    pytest.main([__file__])