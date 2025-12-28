"""
Generate synthetic dataset for ChurnInsight
Used for testing and development without real customer data
"""

import pandas as pd
import numpy as np
import os
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"


def generate_synthetic_dataset(n_samples: int = 7000, seed: int = 42) -> pd.DataFrame:
    """
    Generate synthetic dataset for churn prediction
    
    Args:
        n_samples: Number of customer records to generate
        seed: Random seed for reproducibility
        
    Returns:
        DataFrame with synthetic data
    """
    np.random.seed(seed)
    logger.info(f"🔄 Generating synthetic dataset with {n_samples} samples...")
    
    # Generate base customer data
    data = {
        'Customer_ID': [f'CUST-{i:05d}' for i in range(1, n_samples + 1)],
        'Age': np.random.randint(18, 71, n_samples),
        'Location': np.random.choice(['Urban', 'Suburban', 'Rural'], n_samples),
        'Income_Level': np.random.choice(['Low', 'Medium', 'High'], n_samples),
        'Total_Transactions': np.random.randint(1, 1001, n_samples),
        'Avg_Transaction_Value': np.random.uniform(10, 1000, n_samples),
        'Max_Transaction_Value': np.random.uniform(100, 5000, n_samples),
        'Min_Transaction_Value': np.random.uniform(1, 100, n_samples),
        'Total_Spent': np.zeros(n_samples),  # Will calculate
        'Active_Days': np.random.randint(1, 366, n_samples),
        'Last_Transaction_Days_Ago': np.random.randint(1, 366, n_samples),
        'Loyalty_Points_Earned': np.random.randint(0, 10001, n_samples),
        'Referral_Count': np.random.randint(0, 51, n_samples),
        'Cashback_Received': np.random.uniform(0, 500, n_samples),
        'App_Usage_Frequency': np.random.choice(['Daily', 'Weekly', 'Monthly'], n_samples),
        'Preferred_Payment_Method': np.random.choice(['Credit Card', 'Debit Card', 'UPI', 'Wallet'], n_samples),
        'Support_Tickets_Raised': np.random.randint(0, 21, n_samples),
        'Issue_Resolution_Time': np.random.uniform(0.5, 48, n_samples),
        'Customer_Satisfaction_Score': np.random.randint(1, 11, n_samples),
        'LTV': np.random.uniform(100, 10000, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Calculate Total_Spent as function of transactions
    df['Total_Spent'] = (
        df['Total_Transactions'] * df['Avg_Transaction_Value'] + 
        np.random.uniform(-100, 100, n_samples)
    )
    
    # Define Churn target
    # Churn = 1 if customer hasn't made transaction in >120 days
    df['Churn'] = (df['Last_Transaction_Days_Ago'] > 120).astype(int)
    
    logger.info(f"✅ Generated {len(df)} customer records")
    logger.info(f"   - Churn: {(df['Churn'] == 1).sum()} ({(df['Churn'] == 1).sum() / len(df) * 100:.1f}%)")
    logger.info(f"   - No Churn: {(df['Churn'] == 0).sum()} ({(df['Churn'] == 0).sum() / len(df) * 100:.1f}%)")
    
    return df


def validate_dataset(df: pd.DataFrame) -> bool:
    """
    Validate generated dataset
    
    Args:
        df: DataFrame to validate
        
    Returns:
        True if valid, False otherwise
    """
    logger.info("🔍 Validating dataset...")
    
    checks = {
        "No missing values": df.isnull().sum().sum() == 0,
        "Churn in [0, 1]": df['Churn'].isin([0, 1]).all(),
        "Age in [18, 70]": (df['Age'] >= 18).all() and (df['Age'] <= 70).all(),
        "Transactions > 0": (df['Total_Transactions'] > 0).all(),
        "Active_Days in [1, 365]": (df['Active_Days'] >= 1).all() and (df['Active_Days'] <= 365).all(),
        "Last_Transaction in [1, 365]": (df['Last_Transaction_Days_Ago'] >= 1).all() and (df['Last_Transaction_Days_Ago'] <= 365).all(),
        "Income_Level in {Low, Medium, High}": set(df['Income_Level'].unique()).issubset({'Low', 'Medium', 'High'}),
        "Location in {Urban, Suburban, Rural}": set(df['Location'].unique()).issubset({'Urban', 'Suburban', 'Rural'}),
        "App_Usage in {Daily, Weekly, Monthly}": set(df['App_Usage_Frequency'].unique()).issubset({'Daily', 'Weekly', 'Monthly'}),
    }
    
    all_valid = True
    for check, result in checks.items():
        status = "✅" if result else "❌"
        logger.info(f"  {status} {check}")
        if not result:
            all_valid = False
    
    return all_valid


def save_dataset(df: pd.DataFrame, filepath: str) -> None:
    """
    Save dataset to CSV file
    
    Args:
        df: DataFrame to save
        filepath: Target file path
    """
    filepath = Path(filepath)
    filepath.parent.mkdir(parents=True, exist_ok=True)
    
    df.to_csv(filepath, index=False)
    logger.info(f"💾 Saved dataset to {filepath}")
    logger.info(f"   - File size: {filepath.stat().st_size / 1024:.1f} KB")


def split_train_test(df: pd.DataFrame, test_size: float = 0.3, seed: int = 42):
    """
    Split dataset into training and testing sets
    
    Args:
        df: Full dataset
        test_size: Proportion for test set
        seed: Random seed
        
    Returns:
        Tuple of (train_df, test_df)
    """
    from sklearn.model_selection import train_test_split
    
    logger.info(f"📊 Splitting dataset: {(1-test_size)*100:.0f}% train, {test_size*100:.0f}% test...")
    
    train, test = train_test_split(
        df,
        test_size=test_size,
        random_state=seed,
        stratify=df['Churn']  # Maintain churn distribution
    )
    
    logger.info(f"✅ Split completed:")
    logger.info(f"   - Train: {len(train)} records ({len(train)/len(df)*100:.1f}%)")
    logger.info(f"   - Test: {len(test)} records ({len(test)/len(df)*100:.1f}%)")
    
    # Check churn distribution in both sets
    logger.info(f"   - Train churn: {(train['Churn'] == 1).sum() / len(train) * 100:.1f}%")
    logger.info(f"   - Test churn: {(test['Churn'] == 1).sum() / len(test) * 100:.1f}%")
    
    return train, test


def print_dataset_summary(df: pd.DataFrame) -> None:
    """
    Print summary statistics of dataset
    
    Args:
        df: DataFrame to summarize
    """
    logger.info("\n📋 Dataset Summary:")
    logger.info(f"  Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    logger.info(f"  Memory: {df.memory_usage(deep=True).sum() / 1024:.1f} KB")
    
    logger.info("\n  Data Types:")
    for dtype, count in df.dtypes.value_counts().items():
        logger.info(f"    {dtype}: {count}")
    
    logger.info("\n  Numeric Features:")
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
    for col in numeric_cols[:5]:  # Show first 5
        logger.info(f"    {col}: {df[col].min():.1f} - {df[col].max():.1f} (mean: {df[col].mean():.1f})")
    
    logger.info("\n  Categorical Features:")
    cat_cols = df.select_dtypes(include=['object']).columns
    for col in cat_cols[:3]:  # Show first 3
        logger.info(f"    {col}: {df[col].nunique()} unique values")


def main():
    """Main execution function"""
    logger.info("=" * 60)
    logger.info("🚀 ChurnInsight Synthetic Data Generator")
    logger.info("=" * 60)
    
    try:
        # Step 1: Generate synthetic data
        df = generate_synthetic_dataset(n_samples=7000, seed=42)
        
        # Step 2: Validate
        if not validate_dataset(df):
            logger.error("❌ Dataset validation failed!")
            return False
        
        # Step 3: Print summary
        print_dataset_summary(df)
        
        # Step 4: Save main dataset
        main_path = DATA_DIR / "dataset.csv"
        save_dataset(df, str(main_path))
        
        # Step 5: Split and save
        train, test = split_train_test(df, test_size=0.3, seed=42)
        save_dataset(train, str(DATA_DIR / "dataset_train.csv"))
        save_dataset(test, str(DATA_DIR / "dataset_test.csv"))
        
        logger.info("\n" + "=" * 60)
        logger.info("✅ Dataset generation completed successfully!")
        logger.info("=" * 60)
        logger.info(f"\n📁 Generated files:")
        logger.info(f"   - {DATA_DIR / 'dataset.csv'}")
        logger.info(f"   - {DATA_DIR / 'dataset_train.csv'}")
        logger.info(f"   - {DATA_DIR / 'dataset_test.csv'}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error: {e}", exc_info=True)
        return False


if __name__ == '__main__':
    success = main()
    exit(0 if success else 1)
