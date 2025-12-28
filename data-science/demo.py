"""
Script de ejemplo para ejecutar el flujo completo de ChurnInsight.
"""

import logging
import sys
from pathlib import Path

# Añadir el directorio src al path
sys.path.append(str(Path(__file__).parent / "src"))

from src.model_trainer import ChurnModelTrainer
from src.data_utils import load_data, create_churn_target
from src.config import DATA_DIR, MODELS_DIR

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Demostración del flujo completo de ChurnInsight."""
    try:
        logger.info("=== ChurnInsight - Demostración del Flujo Completo ===")

        # 1. Cargar datos
        logger.info("1. Cargando datos...")
        data_path = DATA_DIR / "digital_wallet_ltv_dataset.csv"
        df = load_data(str(data_path))
        df = create_churn_target(df)

        logger.info(f"Datos cargados: {df.shape[0]} filas, {df.shape[1]} columnas")
        logger.info(f"Distribución de Churn: {df['Churn'].value_counts().to_dict()}")

        # 2. Entrenar modelo
        logger.info("2. Entrenando modelo...")
        trainer = ChurnModelTrainer()
        X, y = trainer.load_and_preprocess_data(str(data_path))
        metrics = trainer.train_model(X, y)

        logger.info("3. Métricas del modelo:")
        logger.info(f"   Accuracy: {metrics['accuracy']:.4f}")

        # 3. Guardar modelo
        model_path = trainer.save_model()
        logger.info(f"4. Modelo guardado en: {model_path}")

        # 4. Ejemplo de predicción
        logger.info("5. Ejemplo de predicción...")

        # Datos de ejemplo
        sample_data = {
            'customer_id': 'TEST-001',
            'monthly_charges': 65.5,
            'tenure_months': 24,
            'contract_type': 'month-to-month',
            'internet_service': 'fiber_optic',
            'total_charges': 1572.0
        }

        # Crear DataFrame para predicción
        sample_df = pd.DataFrame([{
            'Age': 35,
            'Income_Level': 'Medium',
            'Total_Transactions': 50,
            'Avg_Transaction_Value': 150.0,
            'Active_Days': 200,
            'App_Usage_Frequency': 'Daily',
            'Customer_Satisfaction_Score': 4.2,
            'Last_Transaction_Days_Ago': 30
        }])

        prediction = trainer.predict(sample_df)
        probability = trainer.predict_proba(sample_df)

        logger.info(f"   Predicción para cliente de prueba: {prediction[0]}")
        logger.info(f"   Probabilidad: {probability[0][1]:.4f}")

        logger.info("=== Demostración completada exitosamente! ===")

    except Exception as e:
        logger.error(f"Error en la demostración: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    import pandas as pd
    main()