"""
Unit tests for feature extraction and validation
"""

import unittest
import pandas as pd
import numpy as np
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.data_utils import (
    load_dataset,
    validate_features,
    get_dataset_statistics,
    check_missing_values,
    get_churn_distribution,
    generate_synthetic_data
)


class TestDataUtilities(unittest.TestCase):
    """Test data utility functions"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test fixtures"""
        cls.df = generate_synthetic_data(n_samples=500)
    
    def test_generate_synthetic_data(self):
        """Test synthetic data generation"""
        self.assertEqual(len(self.df), 500)
        self.assertIn('Churn', self.df.columns)
        self.assertIn('Age', self.df.columns)
    
    def test_validate_features(self):
        """Test feature validation"""
        required = ['Age', 'Income_Level', 'Churn']
        self.assertTrue(validate_features(self.df, required))
    
    def test_validate_missing_features(self):
        """Test validation with missing features"""
        required = ['NonExistent', 'AlsoFake']
        with self.assertRaises(ValueError):
            validate_features(self.df, required)
    
    def test_get_dataset_statistics(self):
        """Test statistics calculation"""
        stats = get_dataset_statistics(self.df)
        
        self.assertEqual(stats['total_records'], 500)
        self.assertGreater(stats['total_features'], 0)
        self.assertIn('churn_distribution', stats)
        self.assertIn('numeric_features', stats)
        self.assertIn('categorical_features', stats)
    
    def test_check_missing_values(self):
        """Test missing value detection"""
        # Should have no missing values
        missing = check_missing_values(self.df)
        self.assertEqual(len(missing), 0)
    
    def test_get_churn_distribution(self):
        """Test churn distribution calculation"""
        dist = get_churn_distribution(self.df)
        
        self.assertIn('churn_count', dist)
        self.assertIn('no_churn_count', dist)
        self.assertGreater(dist['no_churn_count'], 0)
    
    def test_churn_definition(self):
        """Test that Churn is correctly defined"""
        # Churn = 1 if Last_Transaction_Days_Ago > 120
        for idx, row in self.df.iterrows():
            expected_churn = 1 if row['Last_Transaction_Days_Ago'] > 120 else 0
            self.assertEqual(row['Churn'], expected_churn)
    
    def test_data_types(self):
        """Test that data types are correct"""
        numeric_cols = ['Age', 'Total_Transactions', 'Avg_Transaction_Value']
        for col in numeric_cols:
            self.assertTrue(pd.api.types.is_numeric_dtype(self.df[col]))
        
        categorical_cols = ['Income_Level', 'Location']
        for col in categorical_cols:
            self.assertTrue(pd.api.types.is_object_dtype(self.df[col]))
    
    def test_feature_ranges(self):
        """Test that features are within expected ranges"""
        # Age should be 18-70
        self.assertTrue((self.df['Age'] >= 18).all())
        self.assertTrue((self.df['Age'] <= 70).all())
        
        # Total_Transactions should be 1-1000
        self.assertTrue((self.df['Total_Transactions'] >= 1).all())
        self.assertTrue((self.df['Total_Transactions'] <= 1000).all())
        
        # Churn should be 0 or 1
        self.assertTrue(self.df['Churn'].isin([0, 1]).all())


class TestFeatureValidation(unittest.TestCase):
    """Test feature-specific validations"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.df = generate_synthetic_data(n_samples=100)
    
    def test_income_level_values(self):
        """Test Income_Level has valid values"""
        valid_values = {'Low', 'Medium', 'High'}
        self.assertTrue(set(self.df['Income_Level'].unique()).issubset(valid_values))
    
    def test_location_values(self):
        """Test Location has valid values"""
        valid_values = {'Urban', 'Suburban', 'Rural'}
        self.assertTrue(set(self.df['Location'].unique()).issubset(valid_values))
    
    def test_app_usage_values(self):
        """Test App_Usage_Frequency has valid values"""
        valid_values = {'Daily', 'Weekly', 'Monthly'}
        self.assertTrue(set(self.df['App_Usage_Frequency'].unique()).issubset(valid_values))
    
    def test_satisfaction_score_range(self):
        """Test Customer_Satisfaction_Score is 1-10"""
        self.assertTrue((self.df['Customer_Satisfaction_Score'] >= 1).all())
        self.assertTrue((self.df['Customer_Satisfaction_Score'] <= 10).all())


class TestDataConsistency(unittest.TestCase):
    """Test data consistency and relationships"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.df = generate_synthetic_data(n_samples=200)
    
    def test_active_days_less_than_365(self):
        """Test Active_Days doesn't exceed 365"""
        self.assertTrue((self.df['Active_Days'] <= 365).all())
    
    def test_last_transaction_less_than_365(self):
        """Test Last_Transaction_Days_Ago doesn't exceed 365"""
        self.assertTrue((self.df['Last_Transaction_Days_Ago'] <= 365).all())
    
    def test_positive_transaction_values(self):
        """Test transaction values are positive"""
        self.assertTrue((self.df['Total_Transactions'] > 0).all())
        self.assertTrue((self.df['Avg_Transaction_Value'] > 0).all())


def run_tests():
    """Run all tests"""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    suite.addTests(loader.loadTestsFromTestCase(TestDataUtilities))
    suite.addTests(loader.loadTestsFromTestCase(TestFeatureValidation))
    suite.addTests(loader.loadTestsFromTestCase(TestDataConsistency))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_tests()
    exit(0 if success else 1)
