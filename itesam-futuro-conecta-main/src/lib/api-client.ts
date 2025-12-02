import { toast } from "sonner";

import { mockApi } from "@/mocks/mock-api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const TOKEN_STORAGE_KEY = "itesam:token";
const USE_MOCK_API = (import.meta.env.VITE_USE_MOCK_API ?? "true") !== "false";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  showErrorToast?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
  metrics?: Record<string, number>;
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

const buildQueryString = (params?: ApiRequestOptions["params"]) => {
  if (!params) return "";
  const url = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.append(key, String(value));
  });
  const queryString = url.toString();
  return queryString ? `?${queryString}` : "";
};

const parseError = async (response: Response): Promise<ApiError> => {
  let message = response.statusText;
  let details: unknown;

  try {
    const data = await response.clone().json();
    if (data) {
      message = data.message ?? data.error ?? message;
      details = data.details ?? data.errors ?? data;
    }
  } catch (error) {
    // Ignore JSON parsing errors - keep the default message
  }

  return {
    status: response.status,
    message,
    details,
  };
};

async function request<T>(path: string, method: HttpMethod, options: ApiRequestOptions = {}): Promise<T> {
  const { params, skipAuth = false, showErrorToast = true, headers, body, ...rest } = options;

  if (USE_MOCK_API) {
    try {
      return await mockApi.handle<T>(path, method, { params, skipAuth, showErrorToast, headers, body, ...rest });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao executar requisição simulada";
      if (showErrorToast) {
        toast.error(message);
      }
      throw {
        status: 400,
        message,
      } as ApiError;
    }
  }

  const queryString = buildQueryString(params);
  const url = `${API_URL}${path}${queryString}`;

  const token = !skipAuth ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(url, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body
      ? isFormData
        ? body
        : typeof body === "string"
          ? body
          : JSON.stringify(body)
      : undefined,
    ...rest,
  });

  if (!response.ok) {
    const error = await parseError(response);

    if (showErrorToast) {
      toast.error(error.message || "Erro ao comunicar com a API");
    }

    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, "GET", options),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, "POST", { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, "PATCH", { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, "PUT", { ...options, body }),
  delete: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, "DELETE", options),
  getTokenKey: () => TOKEN_STORAGE_KEY,
};

export type { PaginatedResponse as ApiPaginatedResponse };
