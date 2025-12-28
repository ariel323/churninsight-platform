// Types for API requests and responses
export interface PredictionRequest {
  customer_id: string;
  age: number;
  income_level: string;
  total_transactions: number;
  avg_transaction_value: number;
  active_days: number;
  app_usage_frequency: string;
  customer_satisfaction_score: number;
  last_transaction_days_ago: number;
}

export interface PredictionResponse {
  customer_id: string;
  prevision: string;
  probabilidad: number;
}

export interface FormData {
  customer_id: string;
  age: string;
  income_level: string;
  total_transactions: string;
  avg_transaction_value: string;
  active_days: string;
  app_usage_frequency: string;
  customer_satisfaction_score: string;
  last_transaction_days_ago: string;
}

export type IncomeLevel = "Bajo" | "Medio" | "Alto";
export type AppUsageFrequency = "Diaria" | "Semanal" | "Mensual";
