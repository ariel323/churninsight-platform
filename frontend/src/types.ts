// Types for API requests and responses

export interface ChurnPredictionRequest {
  age: number;
  gender: string;
  balance: number;
  numOfProducts: number;
  country: string;
  isActiveMember: number;
  estimatedSalary: number;
  tenure: number;
  creditScore: number;
  // Campos opcionales para modelo simplificado (19/01/2026)
  deltaNumOfProducts?: number;
  hadComplaint?: boolean;
}

export interface ChurnPredictionResponse {
  churn_probability: number;
  prevision?: string;
  customer_id: string;
}

export interface ChurnFormData {
  numOfProducts: number;
  inactivo4070: number;
  productsRiskFlag: number;
  countryRiskFlag: number;
  balance: number;
  estimatedSalary: number;
  tenure: number;
  creditScore: number;
  country: string;
  isActiveMember: boolean; // Backend espera boolean (true/false)
  deltaNumOfProducts: number;
  hadComplaint: boolean;
}

export type IncomeLevel = "Bajo" | "Medio" | "Alto";
export type AppUsageFrequency = "Diaria" | "Semanal" | "Mensual";
