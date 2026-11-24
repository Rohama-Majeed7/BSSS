/**
 * Centralized API Client & Fetch Helper
 * Handles standard JSON headers, response parsing, HTTP error mapping, and network failure handling.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  error?: string;
  data?: T;
  [key: string]: any;
}

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number = 500, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Core apiClient wrapper around window.fetch
 */
export async function apiClient<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options?.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      // Non-JSON response
      if (!res.ok) {
        throw new ApiError(
          `Request failed with status ${res.status}: ${res.statusText}`,
          res.status
        );
      }
      return {} as T;
    }

    if (!res.ok || json.ok === false) {
      const errorMsg =
        json?.error ||
        `Request to ${url} failed with status ${res.status} (${res.statusText || "Error"})`;
      throw new ApiError(errorMsg, res.status, json);
    }

    return json as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network / offline / server unreachable error
    throw new ApiError(
      err?.message || "Could not reach the server. Please check your network connection.",
      0
    );
  }
}

export const api = {
  get: <T = any>(url: string, options?: RequestInit) =>
    apiClient<T>(url, { ...options, method: "GET" }),
  post: <T = any>(url: string, body?: any, options?: RequestInit) =>
    apiClient<T>(url, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T = any>(url: string, body?: any, options?: RequestInit) =>
    apiClient<T>(url, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T = any>(url: string, body?: any, options?: RequestInit) =>
    apiClient<T>(url, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T = any>(url: string, options?: RequestInit) =>
    apiClient<T>(url, { ...options, method: "DELETE" }),
};
