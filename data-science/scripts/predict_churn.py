import sys
import json
import joblib
import pandas as pd
from pathlib import Path
import logging

# Configure logging to stderr to avoid mixing with JSON output
logging.basicConfig(
    level=logging.INFO,
    stream=sys.stderr,  # Enviar logs a stderr en lugar de stdout
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Get the model path relative to this script
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
MODEL_PATH = PROJECT_ROOT / "models" / "churn_model.pkl"

def predict_churn(data):
    """
    Make a churn prediction using the trained model
    
    Args:
        data: Dictionary with customer features
    
    Returns:
        Dictionary with prediction and probabilities
    """
    try:
        # Validate required fields
        required_fields = [
            'Age', 'Income_Level', 'Total_Transactions', 'Avg_Transaction_Value',
            'Active_Days', 'App_Usage_Frequency', 'Customer_Satisfaction_Score',
            'Last_Transaction_Days_Ago'
        ]
        
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            return {'error': f'Missing fields: {missing_fields}', 'status': 'error'}
        
        logger.info(f"Loading model from: {MODEL_PATH}")
        
        # Load the model
        if not MODEL_PATH.exists():
            return {'error': f'Model not found at {MODEL_PATH}', 'status': 'error'}
        
        model = joblib.load(str(MODEL_PATH))
        logger.info("Model loaded successfully")
        
        # Convert input to DataFrame
        df = pd.DataFrame([data])
        logger.info(f"Input data: {df.to_dict()}")

        # Make prediction
        prediction = model.predict(df)[0]
        probabilities = model.predict_proba(df)[0]

        # Return result
        result = {
            'prediction': int(prediction),
            'probability_no_churn': float(probabilities[0]),
            'probability_churn': float(probabilities[1]),
            'status': 'success'
        }
        
        logger.info(f"Prediction result: {result}")
        return result

    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        return {'error': str(e), 'status': 'error'}

if __name__ == '__main__':
    # Read JSON from command line argument (file path or JSON string)
    if len(sys.argv) > 1:
        input_arg = sys.argv[1]
        # Check if it's a file path
        if input_arg.endswith('.json'):
            try:
                with open(input_arg, 'r') as f:
                    input_data = f.read()
            except:
                input_data = input_arg  # fallback to treating as JSON string
        else:
            input_data = input_arg
    else:
        input_data = sys.stdin.read()
    try:
        data = json.loads(input_data)
        result = predict_churn(data)
        # Solo imprimir el JSON resultado (stdout)
        print(json.dumps(result))
    except json.JSONDecodeError as e:
        print(json.dumps({'error': f'Invalid JSON: {str(e)}', 'status': 'error'}))
    except Exception as e:
        print(json.dumps({'error': str(e), 'status': 'error'}))