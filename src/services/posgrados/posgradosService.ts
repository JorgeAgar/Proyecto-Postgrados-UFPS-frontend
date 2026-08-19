/**
 * posgradosService.ts
 *
 * Servicio de autenticación y peticiones autenticadas para el módulo POSGRADOS.
 */

import { createAuthService, extractErrorMessage } from "../authService";

const BASE_URL = (import.meta.env.VITE_API_URL as string ?? "").replace(/\/$/, "");

export const ACCESS_TOKEN_KEY  = "ufps_posgrados_access_token";
export const REFRESH_TOKEN_KEY = "ufps_posgrados_refresh_token";
export const SESSION_KEY       = "ufps_posgrados_session";

export async function posgradosApiFetch<T>(path: string, options?: RequestInit, _isRetry = false): Promise<T> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)?.trim();
  // console.log("token: ", token);
  if (!token) {
    throw new Error("No hay token de acceso para esta sesión.");
  }

  const headers = new Headers(options?.headers);

  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if ((res.status === 401 || res.status === 403) && !_isRetry) {
    const refreshed = await posgradosAuthService.refreshSession();
    if (!refreshed) {
      posgradosAuthService.logout();
      throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
    }
    return posgradosApiFetch<T>(path, options, true);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body: unknown;
    try { body = JSON.parse(text); } catch { body = text; }
    throw new Error(extractErrorMessage(body, res.status, res.statusText));
  }

  if (res.status === 204) return undefined as T;
  if (res.headers.get("content-length") === "0") return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

export const posgradosAuthService = createAuthService({
  accessTokenKey: ACCESS_TOKEN_KEY,
  refreshTokenKey: REFRESH_TOKEN_KEY,
  sessionKey: SESSION_KEY,
  requestedRole: "POSGRADOS",
});
