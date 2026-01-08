// Types for API requests and responses

export interface ChurnPredictionRequest {
  ageRisk: number;
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
}

export interface ChurnPredictionResponse {
  churn_probability: number;
  prevision?: string;
  customer_id: string;
}

export interface ChurnFormData {
  ageRisk: number;
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
}

export type IncomeLevel = "Bajo" | "Medio" | "Alto";
export type AppUsageFrequency = "Diaria" | "Semanal" | "Mensual";
