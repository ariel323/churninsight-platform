"""
Configuration file for data science module
Production and development settings
"""

import os
from pathlib import Path

# Project paths
PROJECT_ROOT = Path(__file__).parent
DATA_DIR = PROJECT_ROOT / "data"
MODELS_DIR = PROJECT_ROOT / "models"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
SRC_DIR = PROJECT_ROOT / "src"

# Model configuration
MODEL_PATH = MODELS_DIR / "churn_model.pkl"
DATASET_PATH = DATA_DIR / "dataset.csv"

# Feature names (must match training data order)
FEATURE_COLUMNS = [
    'Age', 'Income_Level', 'Total_Transactions', 'Avg_Transaction_Value',
    'Active_Days', 'App_Usage_Frequency', 'Customer_Satisfaction_Score', 
    'Last_Transaction_Days_Ago'
]

NUMERIC_FEATURES = [
    'Age', 'Total_Transactions', 'Avg_Transaction_Value', 'Active_Days', 
    'Customer_Satisfaction_Score', 'Last_Transaction_Days_Ago'
]

CATEGORICAL_FEATURES = ['Income_Level', 'App_Usage_Frequency']

# API Configuration
API_HOST = os.getenv('API_HOST', 'localhost')
API_PORT = int(os.getenv('API_PORT', '8000'))

# Logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = PROJECT_ROOT / 'logs' / 'app.log'

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)
(PROJECT_ROOT / 'logs').mkdir(exist_ok=True)
