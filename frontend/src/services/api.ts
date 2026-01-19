import { ChurnPredictionRequest, ChurnPredictionResponse } from "../types";

const normalizeApiBaseUrl = (raw: string | undefined): string => {
  const fallback = "http://localhost:8080/api";
  const value = (raw ?? "").trim();

  if (!value) return fallback;

  // Common misconfig: ":8080/api" (missing host+scheme)
  if (value.startsWith(":")) return `http://localhost${value}`;

  // Common misconfig: "localhost:8080/api" (missing scheme)
  if (/^localhost[:/]/i.test(value) || /^127\.0\.0\.1[:/]/i.test(value)) {
    return `http://${value}`;
  }

  // If it already includes a scheme (http/https), keep it.
  if (/^https?:\/\//i.test(value)) return value;

  // If it's a relative path like "/api", make it absolute to current origin.
  if (value.startsWith("/")) {
    return `${window.location.origin}${value.replace(/\/+$/, "")}`;
  }

  return value;
};

export const API_BASE_URL = normalizeApiBaseUrl(process.env.REACT_APP_API_URL);

// Interfaces para tipos de datos
export interface StatsData {
  activeUsers: number;
  retentionRate: number;
  todayPredictions: number;
}

export interface KPIsData {
  totalHighRiskClients: number;
  capitalAtRisk: number;
  accuracyLastMonth: number;
  totalPredictions: number;
  averageRisk: number;
}

export interface HistoricalPrediction {
  date: string;
  probability: number;
}

export interface PredictionHistory {
  id: number;
  customerId: string;
  churnProbability: number;
  ageRisk: number;
  numOfProducts: number;
  inactivo4070: number;
  productsRiskFlag: number;
  countryRiskFlag: number;
  predictionDate: string;
  isActiveMember: boolean; // Backend devuelve boolean (true/false)
  // Nuevas variables - Fase 3
  balance?: number;
  estimatedSalary?: number;
  country?: string;
  tenure?: number;
}

// Paginación genérica
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// Resumen por analista para ADMIN
export interface AnalystSummary {
  username: string;
  fullName: string;
  email: string;
  totalAnalyses: number;
  lastPredictionDate: string;
  averageChurnProbability: number;
}

// Reporte por periodo (mensual/anual) para analistas
export interface AnalystPeriodReport {
  year: number;
  month?: number | null;
  totalAnalyses: number;
  highRiskCount: number;
  averageChurnProbability: number;
}

// Función para sanitizar y validar datos
const sanitizeInput = (value: string): string => {
  return value.trim().replace(/[<>]/g, "");
};

// Función auxiliar para obtener headers con autenticación
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Función para decodificar JWT y obtener roles
export const getUserRoles = (): string[] => {
  // 1) Preferir roles almacenados en localStorage desde la respuesta de login
  const stored = localStorage.getItem("roles");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  // 2) Fallback: intentar decodificar el JWT
  const token = localStorage.getItem("token");
  if (!token) return [];

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Algunas implementaciones usan 'roles', otras 'authorities' con prefijo ROLE_
    const rawRoles = payload.roles || payload.authorities || [];
    if (Array.isArray(rawRoles)) {
      return rawRoles.map((r: string) => r.replace(/^ROLE_/, ""));
    }
    return [];
  } catch (error) {
    console.error("Error decodificando token:", error);
    return [];
  }
};

// Función para verificar si el usuario tiene un rol específico
export const hasRole = (role: string): boolean => {
  const roles = getUserRoles();
  return roles.includes(role);
};

// Función para verificar si el usuario es administrador
export const isAdmin = (): boolean => {
  return hasRole("ADMIN");
};

// ADMIN: Obtener resumen por analistas
export const fetchAnalystSummaries = async (): Promise<AnalystSummary[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/analysts`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
};

// ADMIN: Obtener historial por analista con paginación
export const fetchHistoryByAnalyst = async (
  username: string,
  page = 0,
  size = 50,
): Promise<Page<PredictionHistory>> => {
  const response = await fetch(
    `${API_BASE_URL}/admin/history/by-analyst?username=${encodeURIComponent(
      username,
    )}&page=${page}&size=${size}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
};

// ADMIN: Obtener historial por analista filtrado por rango de fechas
export const fetchHistoryByAnalystRange = async (
  username: string,
  from: string, // formato YYYY-MM-DD
  to: string, // formato YYYY-MM-DD
  page = 0,
  size = 50,
): Promise<Page<PredictionHistory>> => {
  const response = await fetch(
    `${API_BASE_URL}/admin/history/by-analyst-range?username=${encodeURIComponent(
      username,
    )}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(
      to,
    )}&page=${page}&size=${size}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    },
  );
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
};

// ADMIN: Obtener reporte por periodo (mensual/anual) para un analista
export const fetchAnalystPeriodReport = async (
  username: string,
  from: string,
  to: string,
  granularity: "monthly" | "yearly" = "monthly",
): Promise<AnalystPeriodReport[]> => {
  const response = await fetch(
    `${API_BASE_URL}/admin/report/analyst-period?username=${encodeURIComponent(
      username,
    )}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(
      to,
    )}&granularity=${granularity}`,
    { method: "GET", headers: getAuthHeaders() },
  );
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
};

// Función para realizar la predicción con validaciones de seguridad
export const predictChurn = async (
  data: ChurnPredictionRequest,
): Promise<ChurnPredictionResponse> => {
  // Validaciones básicas
  if (data.age < 18 || data.age > 100) {
    throw new Error("Edad debe estar entre 18 y 100");
  }

  if (data.numOfProducts < 1 || data.numOfProducts > 10) {
    throw new Error("Número de productos inválido");
  }

  // Enviar datos crudos al backend (el backend computará las características)
  const backendData = data;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

    const response = await fetch(`${API_BASE_URL}/churn/predict`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(backendData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        const hasToken = Boolean(localStorage.getItem("token"));
        if (hasToken) {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
        }
        throw new Error(
          "Sesión no válida. Inicia sesión nuevamente para continuar.",
        );
      }
      if (response.status === 400) {
        throw new Error("Datos de entrada inválidos");
      } else if (response.status === 500) {
        throw new Error("Error interno del servidor");
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    }

    const result = await response.json();

    // La respuesta del backend debe incluir churn_probability y customer_id
    const probability = result.churn_probability;
    const customer_id = result.customer_id;

    // Validar la respuesta
    if (typeof probability !== "number" || typeof customer_id !== "string") {
      throw new Error("Respuesta del servidor inválida");
    }

    // Asegurar que la probabilidad esté en el rango correcto
    if (probability < 0 || probability > 1) {
      throw new Error("Probabilidad fuera del rango permitido");
    }

    return { churn_probability: probability, customer_id };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("La petición tardó demasiado tiempo");
      }
      throw error;
    }
    throw new Error("Error desconocido al conectar con el servidor");
  }
};

/**
 * Obtiene las estadísticas en tiempo real del sistema
 */
export const fetchStats = async (): Promise<StatsData> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: "GET",
      headers: getAuthHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token ausente/expirado: devolver defaults sin romper la UI
        return {
          activeUsers: 0,
          retentionRate: 0,
          todayPredictions: 0,
        };
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result: StatsData = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Retornar valores por defecto en caso de error
    return {
      activeUsers: 0,
      retentionRate: 0,
      todayPredictions: 0,
    };
  }
};

/**
 * Obtiene el historial de predicciones del usuario actual
 */
export const fetchHistory = async (): Promise<PredictionHistory[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${API_BASE_URL}/churn/history`, {
      method: "GET",
      headers: getAuthHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result: PredictionHistory[] = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching history:", error);
    return [];
  }
};

/**
 * Obtiene TODO el historial del sistema (todos los usuarios) con paginación
 */
export const fetchAllHistory = async (
  page: number = 0,
  size: number = 100,
): Promise<{
  content: PredictionHistory[];
  totalElements: number;
  totalPages: number;
}> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Mayor timeout para grandes cargas

    const response = await fetch(
      `${API_BASE_URL}/churn/history/all?page=${page}&size=${size}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching all history:", error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
};

/**
 * Obtiene los KPIs de negocio del último mes
 */
export const fetchKPIs = async (): Promise<KPIsData> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Aumentado a 30 segundos para grandes datasets

    const response = await fetch(`${API_BASE_URL}/stats/kpis`, {
      method: "GET",
      headers: getAuthHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token ausente/expirado: devolver defaults sin romper la UI
        return {
          totalHighRiskClients: 0,
          capitalAtRisk: 0,
          accuracyLastMonth: 0,
          totalPredictions: 0,
          averageRisk: 0,
        };
      }
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result: KPIsData = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    // Retornar valores por defecto en caso de error
    return {
      totalHighRiskClients: 0,
      capitalAtRisk: 0,
      accuracyLastMonth: 0,
      totalPredictions: 0,
      averageRisk: 0,
    };
  }
};

/**
 * Obtiene el historial de predicciones de un cliente específico
 */
export const fetchCustomerHistory = async (
  customerId: string,
  days: number = 30,
): Promise<HistoricalPrediction[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `${API_BASE_URL}/churn/customer/${customerId}/history?days=${days}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result: PredictionHistory[] = await response.json();
    // Transformar a formato esperado por el gráfico
    return result.map((item) => ({
      date: new Date(item.predictionDate).toLocaleDateString("es-ES"),
      probability: item.churnProbability,
    }));
  } catch (error) {
    console.error("Error fetching customer history:", error);
    return [];
  }
};
