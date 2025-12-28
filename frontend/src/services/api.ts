import { PredictionRequest, PredictionResponse } from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// Interfaces para tipos de datos
export interface StatsData {
  activeUsers: number;
  retentionRate: number;
  todayPredictions: number;
}

export interface PredictionHistory {
  id: number;
  customerId: string;
  probability: number;
  prediction: string;
  age: number;
  incomeLevel: string;
  createdAt: string;
}

// Función para sanitizar y validar datos
const sanitizeInput = (value: string): string => {
  return value.trim().replace(/[<>]/g, "");
};

// Función para realizar la predicción con validaciones de seguridad
export const predictChurn = async (
  data: PredictionRequest
): Promise<PredictionResponse> => {
  // Validaciones de seguridad adicionales
  if (!data.customer_id || data.customer_id.length > 100) {
    throw new Error("ID de cliente inválido");
  }

  if (data.age < 18 || data.age > 70) {
    throw new Error("Edad fuera del rango permitido");
  }

  if (
    data.customer_satisfaction_score < 1 ||
    data.customer_satisfaction_score > 10
  ) {
    throw new Error("Puntuación de satisfacción fuera del rango permitido");
  }

  // Sanitizar el ID del cliente
  const sanitizedData = {
    ...data,
    customer_id: sanitizeInput(data.customer_id),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
      },
      body: JSON.stringify(sanitizedData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("Datos de entrada inválidos");
      } else if (response.status === 500) {
        throw new Error("Error interno del servidor");
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    }

    const result: PredictionResponse = await response.json();

    // Validar la respuesta
    if (!result.customer_id || typeof result.probabilidad !== "number") {
      throw new Error("Respuesta del servidor inválida");
    }

    // Asegurar que la probabilidad esté en el rango correcto
    if (result.probabilidad < 0 || result.probabilidad > 1) {
      throw new Error("Probabilidad fuera del rango permitido");
    }

    return result;
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
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
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
 * Obtiene el historial de predicciones
 */
export const fetchHistory = async (
  sortBy: "date" | "income" = "date",
  limit: number = 50
): Promise<PredictionHistory[]> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
      `${API_BASE_URL}/history?sortBy=${sortBy}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: controller.signal,
      }
    );

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
