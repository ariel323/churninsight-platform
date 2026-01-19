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
  deltaBalance?: number;
  deltaNumOfProducts?: number;
  recentInactive?: boolean;
  productUsageDrop?: boolean;
  hadComplaint?: boolean;
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
  deltaBalance: number;
  deltaNumOfProducts: number;
  recentInactive: boolean;
  productUsageDrop: boolean;
  hadComplaint: boolean;
}

export type IncomeLevel = "Bajo" | "Medio" | "Alto";
export type AppUsageFrequency = "Diaria" | "Semanal" | "Mensual";
