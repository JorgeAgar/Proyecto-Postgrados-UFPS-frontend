/**
 * programaService.ts
 *
 * Servicio de autenticación para el módulo Programa (Director de Programa).
 * Implementa `login`, `logout`, `refreshSession` y helpers similares al patrón
 * usado en `superadminService.ts`.
 */

const BASE_URL = import.meta.env.VITE_API_URL;

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

const ACCESS_TOKEN_KEY = "ufps_programa_access_token";
const REFRESH_TOKEN_KEY = "ufps_programa_refresh_token";
const SESSION_KEY = "ufps_programa_session";
const PROGRAMA_KEY = "ufps_programa_id";

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

export async function programaApiFetch<T>(path: string, options?: RequestInit, _isRetry = false): Promise<T> {
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
    return programaApiFetch<T>(path, options, true);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body: unknown;
    try { body = JSON.parse(text); } catch { body = text; }
    throw new Error(extractErrorMessage(body, res.status, res.statusText));
  }

  return res.json() as Promise<T>;
}

let _programaIdCache: number | null = null;

export async function getProgramaRealId(): Promise<number> {
  if (_programaIdCache !== null) return _programaIdCache;
  const stored = localStorage.getItem(PROGRAMA_KEY);
  if (stored) {
    const parsed = Number(stored);
    if (!isNaN(parsed) && parsed > 0) {
      _programaIdCache = parsed;
      return _programaIdCache;
    }
  }
  const session = programaAuthService.getSession();
  const userId = session?.userId ?? 0;
  const resp = await programaApiFetch<unknown>(
    `/api/application/case/director-programa/programa/director/${userId}`,
    { method: "GET" }
  );
  let id: number | undefined;
  if (typeof resp === "number") {
    id = resp;
  } else {
    const obj = resp as Record<string, unknown>;
    id = (obj["programaId"] ?? obj["idPrograma"] ?? obj["id"]) as number | undefined;
  }
  if (!id) throw new Error("No se pudo obtener el id del programa desde el servidor.");
  _programaIdCache = id;
  localStorage.setItem(PROGRAMA_KEY, String(id));
  return _programaIdCache;
}

// ── Helpers específicos de Programa ──────────────────────────────────────────
export interface ProgramaBackend {
  id: number;
  codigo?: number;
  nombre: string;
  semestres?: number;
  correo?: string;
  sede?: { id?: number; nombre?: string };
  facultad?: { id?: number; nombre?: string };
  ofertaacademicaList?: Array<{ id?: number; encuentros?: string }>;
}

export async function getProgramas(): Promise<ProgramaBackend[]> {
  const url = `${BASE_URL}/api/dev/endpoint/programa/listall`;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body: unknown;
    try { body = JSON.parse(text); } catch { body = text; }
    throw new Error(extractErrorMessage(body, res.status, res.statusText));
  }

  return (await res.json()) as ProgramaBackend[];
}

export async function updatePrograma(data: Partial<ProgramaBackend> | Record<string, unknown>): Promise<ProgramaBackend> {
  const url = `${BASE_URL}/api/dev/endpoint/programa/update`;
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(data) });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body: unknown;
    try { body = JSON.parse(text); } catch { body = text; }
    throw new Error(extractErrorMessage(body, res.status, res.statusText));
  }

  return (await res.json()) as ProgramaBackend;
}

export const programaAuthService = {
  async login(usuario: string, password: string, requestedRole = "Director de programa"): Promise<void> {
    if (!usuario.trim() || !password) throw new Error("Usuario y contraseña son obligatorios.");

    let data: LoginResponse;
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario.trim(), password, requestedRole }),
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
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: data.userId, username: data.username, roles: data.roles, displayName: data.username, loginAt: new Date().toISOString() }));

    try {
      await getProgramaRealId();
    } catch {
      // idPrograma se obtendrá en el primer uso
    }
  },

  async setProgramaId() {
    await getProgramaRealId();
  },

  logout() {
    _programaIdCache = null;
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(PROGRAMA_KEY);
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
      localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: data.userId, username: data.username, roles: data.roles, displayName: data.username, loginAt: new Date().toISOString() }));
      return true;
    } catch {
      return false;
    }
  },

  getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  isAuthenticated() {
    return !!this.getSession();
  },
};
