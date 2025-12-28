"""
Utility functions for data loading, processing, and validation
"""

import pandas as pd
import numpy as np
from pathlib import Path
import logging
from typing import Tuple, Dict, Any

logger = logging.getLogger(__name__)

# Get project root
PROJECT_ROOT = Path(__file__).parent.parent


def load_dataset(filepath: str) -> pd.DataFrame:
    """
    Load CSV dataset with validation
    
    Args:
        filepath: Path to CSV file
        
    Returns:
        pandas DataFrame
    """
    try:
        df = pd.read_csv(filepath)
        logger.info(f"Loaded {len(df)} records from {filepath}")
        return df
    except FileNotFoundError:
        logger.error(f"Dataset not found: {filepath}")
        raise
    except Exception as e:
        logger.error(f"Error loading dataset: {e}")
        raise


def validate_features(df: pd.DataFrame, required_features: list) -> bool:
    """
    Validate that all required features exist in DataFrame
    
    Args:
        df: DataFrame to validate
        required_features: List of required column names
        
    Returns:
        True if valid, raises Exception otherwise
    """
    missing = set(required_features) - set(df.columns)
    if missing:
        raise ValueError(f"Missing features: {missing}")
    logger.info(f"✅ All {len(required_features)} required features found")
    return True


def check_missing_values(df: pd.DataFrame) -> Dict[str, int]:
    """
    Check for missing values in DataFrame
    
    Args:
        df: DataFrame to check
        
    Returns:
        Dictionary with column names and missing counts
    """
    missing = df.isnull().sum()
    missing = missing[missing > 0]
    if len(missing) > 0:
        logger.warning(f"Found missing values:\n{missing}")
    return missing.to_dict()


def get_dataset_statistics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Get basic statistics about dataset
    
    Args:
        df: DataFrame to analyze
        
    Returns:
        Dictionary with statistics
    """
    stats = {
        'total_records': len(df),
        'total_features': len(df.columns),
        'numeric_features': list(df.select_dtypes(include=[np.number]).columns),
        'categorical_features': list(df.select_dtypes(include=['object']).columns),
        'missing_values': check_missing_values(df),
    }
    
    # Target distribution if 'Churn' exists
    if 'Churn' in df.columns:
        churn_dist = df['Churn'].value_counts(normalize=True).to_dict()
        stats['churn_distribution'] = churn_dist
        stats['churn_percentage'] = {
            'no_churn': f"{churn_dist.get(0, 0)*100:.1f}%",
            'churn': f"{churn_dist.get(1, 0)*100:.1f}%"
        }
    
    return stats


def scale_numeric_features(df: pd.DataFrame, numeric_cols: list) -> Tuple[pd.DataFrame, Any]:
    """
    Scale numeric features using StandardScaler
    
    Args:
        df: Input DataFrame
        numeric_cols: List of numeric column names
        
    Returns:
        Tuple of (scaled DataFrame, scaler object)
    """
    from sklearn.preprocessing import StandardScaler
    
    scaler = StandardScaler()
    df_scaled = df.copy()
    df_scaled[numeric_cols] = scaler.fit_transform(df[numeric_cols])
    
    logger.info(f"✅ Scaled {len(numeric_cols)} numeric features")
    return df_scaled, scaler


def encode_categorical_features(df: pd.DataFrame, categorical_cols: list) -> Tuple[pd.DataFrame, Any]:
    """
    Encode categorical features using OneHotEncoder
    
    Args:
        df: Input DataFrame
        categorical_cols: List of categorical column names
        
    Returns:
        Tuple of (encoded DataFrame, encoder object)
    """
    from sklearn.preprocessing import OneHotEncoder
    
    encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
    encoded = encoder.fit_transform(df[categorical_cols])
    
    # Get feature names
    feature_names = encoder.get_feature_names_out(categorical_cols)
    
    # Create DataFrame with encoded features
    df_encoded = df.copy()
    df_encoded = df_encoded.drop(categorical_cols, axis=1)
    for i, col in enumerate(feature_names):
        df_encoded[col] = encoded[:, i]
    
    logger.info(f"✅ Encoded {len(categorical_cols)} categorical features -> {len(feature_names)} features")
    return df_encoded, encoder


def split_train_test(df: pd.DataFrame, test_size: float = 0.3, random_state: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Split dataset into training and testing sets
    
    Args:
        df: Input DataFrame
        test_size: Proportion for test set
        random_state: Random seed for reproducibility
        
    Returns:
        Tuple of (train_df, test_df)
    """
    from sklearn.model_selection import train_test_split
    
    train, test = train_test_split(df, test_size=test_size, random_state=random_state)
    logger.info(f"✅ Split into Train ({len(train)}) and Test ({len(test)})")
    return train, test


def get_churn_distribution(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Get churn distribution statistics
    
    Args:
        df: DataFrame with 'Churn' column
        
    Returns:
        Dictionary with churn stats
    """
    if 'Churn' not in df.columns:
        raise ValueError("Dataset must contain 'Churn' column")
    
    dist = df['Churn'].value_counts(normalize=True)
    return {
        'no_churn_count': (df['Churn'] == 0).sum(),
        'churn_count': (df['Churn'] == 1).sum(),
        'no_churn_pct': f"{dist.get(0, 0)*100:.1f}%",
        'churn_pct': f"{dist.get(1, 0)*100:.1f}%"
    }


def handle_class_imbalance(X: pd.DataFrame, y: pd.Series, method: str = 'oversample'):
    """
    Handle class imbalance using oversampling or undersampling
    
    Args:
        X: Features DataFrame
        y: Target Series
        method: 'oversample' or 'undersample'
        
    Returns:
        Tuple of (balanced X, balanced y)
    """
    from sklearn.utils import resample
    
    if method == 'oversample':
        # Oversample minority class
        X_minority = X[y == 1]
        y_minority = y[y == 1]
        
        X_minority_resampled = resample(
            X_minority,
            n_samples=len(X[y == 0]),
            random_state=42
        )
        y_minority_resampled = resample(
            y_minority,
            n_samples=len(X[y == 0]),
            random_state=42
        )
        
        X_balanced = pd.concat([X[y == 0], X_minority_resampled])
        y_balanced = pd.concat([y[y == 0], y_minority_resampled])
        
    else:  # undersample
        # Undersample majority class
        X_majority = X[y == 0]
        y_majority = y[y == 0]
        
        X_majority_resampled = resample(
            X_majority,
            n_samples=len(X[y == 1]),
            random_state=42
        )
        y_majority_resampled = resample(
            y_majority,
            n_samples=len(X[y == 1]),
            random_state=42
        )
        
        X_balanced = pd.concat([X_majority_resampled, X[y == 1]])
        y_balanced = pd.concat([y_majority_resampled, y[y == 1]])
    
    logger.info(f"✅ Balanced dataset using {method}. New size: {len(X_balanced)}")
    return X_balanced, y_balanced


def save_dataset(df: pd.DataFrame, filepath: str) -> None:
    """
    Save DataFrame to CSV
    
    Args:
        df: DataFrame to save
        filepath: Target path
    """
    df.to_csv(filepath, index=False)
    logger.info(f"✅ Saved {len(df)} records to {filepath}")


def generate_synthetic_data(n_samples: int = 1000, seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic dataset for testing
    
    Args:
        n_samples: Number of samples
        seed: Random seed
        
    Returns:
        Generated DataFrame
    """
    np.random.seed(seed)
    
    data = {
        'Customer_ID': [f'CUST-{i:04d}' for i in range(1, n_samples + 1)],
        'Age': np.random.randint(18, 71, n_samples),
        'Location': np.random.choice(['Urban', 'Suburban', 'Rural'], n_samples),
        'Income_Level': np.random.choice(['Low', 'Medium', 'High'], n_samples),
        'Total_Transactions': np.random.randint(1, 1000, n_samples),
        'Avg_Transaction_Value': np.random.uniform(10, 1000, n_samples),
        'Active_Days': np.random.randint(1, 365, n_samples),
        'Last_Transaction_Days_Ago': np.random.randint(1, 365, n_samples),
        'Customer_Satisfaction_Score': np.random.randint(1, 11, n_samples),
        'App_Usage_Frequency': np.random.choice(['Daily', 'Weekly', 'Monthly'], n_samples),
    }
    
    df = pd.DataFrame(data)
    df['Churn'] = (df['Last_Transaction_Days_Ago'] > 120).astype(int)
    
    logger.info(f"✅ Generated synthetic dataset with {n_samples} samples")
    return df


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    # Example usage
    print("Data utilities module loaded successfully ✅")
