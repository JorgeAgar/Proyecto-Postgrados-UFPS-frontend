/**
 * superadminService.ts
 *
 * Servicio de autenticación y peticiones autenticadas para el módulo SUPERADMIN.
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

const ACCESS_TOKEN_KEY  = "ufps_superadmin_access_token";
const REFRESH_TOKEN_KEY = "ufps_superadmin_refresh_token";
const SESSION_KEY       = "ufps_superadmin_session";

const SUPERADMIN_ROLES = [
  "SUPER_ADMINISTRADOR", "SUPERADMIN", "SUPER_ADMIN",
  "Super Administrador", "SUPER ADMINISTRADOR",
];

// ── Tipos para el catálogo de endpoints ──────────────────────────────────────

export interface EndpointField {
  name: string;
  type: string;
  required: boolean;
  example: unknown;
  fields?: EndpointField[];
}

export interface EndpointRequestBody {
  type: string;
  required: boolean;
  template: unknown;
  fields: EndpointField[];
}

export interface EndpointQueryParam {
  name: string;
  source: string;
  type: string;
  required: boolean;
  example: unknown;
}

export interface EndpointPathVariable {
  name: string;
  source: string;
  type: string;
  required: boolean;
  example: unknown;
}

export interface BackendEndpoint {
  path: string;
  methods: string[];
  consumes: string[];
  produces: string[];
  controller: string;
  handler: string;
  requestBody: EndpointRequestBody | null;
  queryParameters: EndpointQueryParam[];
  pathVariables: EndpointPathVariable[];
}

export interface SuperAdminCatalog {
  role: string;
  description: string;
  total: number;
  endpoints: BackendEndpoint[];
}

export interface EntityGroup {
  controller: string;
  endpoints: BackendEndpoint[];
}

// ── Tipos auth ────────────────────────────────────────────────────────────────

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  roles: string[];
}

// ── Refresh interno ───────────────────────────────────────────────────────────

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
    const data = await res.json() as LoginResponse;
    if (data.accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    const prevRaw = localStorage.getItem(SESSION_KEY);
    const prev = prevRaw ? JSON.parse(prevRaw) : {};
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ ...prev, userId: data.userId, username: data.username, roles: data.roles })
    );
    return data.accessToken;
  } catch {
    return null;
  }
}

// ── Helper de fetch autenticado ───────────────────────────────────────────────

export async function superadminApiFetch<T>(
  path: string,
  options?: RequestInit,
  _isRetry = false
): Promise<T> {
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
    return superadminApiFetch<T>(path, options, true);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body: unknown;
    try { body = JSON.parse(text); } catch { body = text; }
    throw new Error(extractErrorMessage(body, res.status, res.statusText));
  }

  if (res.status === 204) return undefined as T;
  if (res.headers.get("content-length") === "0") return undefined as T;
  const respText = await res.text();
  if (!respText) return undefined as T;
  try {
    return JSON.parse(respText) as T;
  } catch {
    return undefined as T;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasSuperAdminRole(roles: string[]): boolean {
  return roles.some((r) =>
    SUPERADMIN_ROLES.some((sr) => r.toUpperCase().includes(sr.toUpperCase()))
  );
}

// ── Catálogo dinámico de endpoints ────────────────────────────────────────────

/**
 * Obtiene el catálogo completo desde GET /api/application/case/super-admin/endpoints
 * y lo devuelve agrupado por controller (entidad).
 */
export async function getSuperAdminEndpoints(): Promise<{
  catalog: SuperAdminCatalog;
  groups: EntityGroup[];
}> {
  const catalog = await superadminApiFetch<SuperAdminCatalog>(
    "/api/application/case/super-admin/endpoints"
  );

  const groupMap = new Map<string, BackendEndpoint[]>();
  for (const ep of catalog.endpoints) {
    const key = ep.controller;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(ep);
  }

  const groups: EntityGroup[] = Array.from(groupMap.entries())
    .map(([controller, endpoints]) => ({ controller, endpoints }))
    .sort((a, b) => a.controller.localeCompare(b.controller));

  return { catalog, groups };
}

// ── Auth Superadmin ───────────────────────────────────────────────────────────

export const superadminAuthService = {
  async login(username: string, password: string): Promise<void> {
    if (!username.trim() || !password.trim()) {
      throw new Error("Usuario y contraseña son obligatorios.");
    }

    let data: LoginResponse;
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password, requestedRole: "Super Administrador" }),
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("Usuario o contraseña incorrectos.");
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(extractErrorMessage(body, res.status, res.statusText));
      }

      data = await res.json();
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
      }
      throw err;
    }

    if (!hasSuperAdminRole(data.roles)) {
      throw new Error(
        "Tu cuenta no tiene permisos de Superadministrador. Verifica tu rol con el administrador."
      );
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
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

  async refreshSession(): Promise<boolean> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data: LoginResponse = await res.json();
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

  logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getSession(): { userId: number; username: string; roles: string[]; displayName: string; loginAt: string } | null {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    const session = this.getSession();
    if (!session) return false;
    return hasSuperAdminRole(session.roles);
  },
};