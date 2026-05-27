/**
 * posgradosService.ts
 *
 * Servicio de autenticación y peticiones autenticadas para el módulo POSGRADOS.
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string ?? "").replace(/\/$/, "");

const HTTP_STATUS_TEXT: Record<number, string> = {
  400: "Solicitud incorrecta",
  401: "No autorizado",
  403: "Acceso denegado",
  404: "Recurso no encontrado",
  409: "Conflicto con el estado actual",
  422: "Datos no procesables",
  500: "Error interno del servidor",
  502: "Error de puerta de enlace",
  503: "Servicio no disponible",
};

function extractErrorMessage(body: unknown, status: number, statusText: string): string {
  if (typeof body === "string") {
    const trimmed = body.trim();
    if (trimmed && !trimmed.startsWith("<")) return trimmed;
  }
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message) return obj.message;
    if (typeof obj.mensaje === "string" && obj.mensaje) return obj.mensaje;
    const skip = new Set(["timestamp", "path", "trace", "error", "status"]);
    for (const [key, val] of Object.entries(obj)) {
      if (!skip.has(key) && typeof val === "string" && val) return val;
    }
  }
  const desc = statusText || HTTP_STATUS_TEXT[status];
  return desc ? `Error ${status}: ${desc}` : `Error ${status}`;
}

export const ACCESS_TOKEN_KEY  = "ufps_posgrados_access_token";
export const REFRESH_TOKEN_KEY = "ufps_posgrados_refresh_token";
export const SESSION_KEY       = "ufps_posgrados_session";

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  userId?: number;
  username?: string;
  roles?: string[];
}

async function _doRefresh(): Promise<string | null> {
  const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!rt) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as LoginResponse;
    if (data.accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    const prevRaw = localStorage.getItem(SESSION_KEY);
    const prev = prevRaw ? JSON.parse(prevRaw) : {};
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...prev, userId: data.userId, username: data.username, roles: data.roles }));
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function posgradosApiFetch<T>(path: string, options?: RequestInit, _isRetry = false): Promise<T> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !_isRetry) {
    const newToken = await _doRefresh();
    if (!newToken) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);
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

export const posgradosAuthService = {
  async login(username: string, password: string): Promise<void> {
    if (!username.trim() || !password) throw new Error("Usuario y contraseña son obligatorios.");

    let data: LoginResponse;
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password, requestedRole: "POSGRADOS" }),
      });

      if (res.status === 401 || res.status === 403) throw new Error("Usuario o contraseña incorrectos.");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(extractErrorMessage(body, res.status, res.statusText));
      }

      data = await res.json();
    } catch (err) {
      if (err instanceof TypeError) throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
      throw err as Error;
    }

    if (!data.accessToken) throw new Error("Respuesta inválida del servidor: falta accessToken.");

    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        displayName: data.username,
        loginAt: new Date().toISOString(),
      })
    );
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  async refreshSession(): Promise<boolean> {
    const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!rt) return false;
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as LoginResponse;
      if (data.accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          userId: data.userId,
          username: data.username,
          roles: data.roles,
          displayName: data.username,
          loginAt: new Date().toISOString(),
        })
      );
      return true;
    } catch {
      return false;
    }
  },

  getSession(): { userId: number; username: string; roles: string[]; displayName: string; loginAt: string } | null {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getSession();
  },
};
