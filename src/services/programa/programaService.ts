/**
 * programaService.ts
 *
 * Servicio de autenticación para el módulo Programa (Director de Programa).
 * Implementa `login`, `logout`, `refreshSession` y helpers similares al patrón
 * usado en `superadminService.ts`.
 */

import { createAuthService, extractErrorMessage } from "../authService";

const BASE_URL = import.meta.env.VITE_API_URL;

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

  if ((res.status === 401 || res.status === 403) && !_isRetry) {
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
    const err = new Error(extractErrorMessage(body, res.status, res.statusText)) as Error & { body?: unknown; status?: number; statusText?: string };
    err.body = body;
    err.status = res.status;
    err.statusText = res.statusText;
    throw err;
  }

  // Handle empty responses (204 No Content or 200 with empty body)
  const text = await res.text().catch(() => "");
  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    // Not JSON — return raw text as unknown
    return text as unknown as T;
  }
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
  interface ProgramaIdResponse {
    idPrograma: number;
  }
  const resp = await programaApiFetch<ProgramaIdResponse>(
    `/api/application/case/director-programa/programa/director/${userId}`,
    { method: "GET" }
  );
  const id = resp.idPrograma;
  if (!id || typeof id !== "number") throw new Error("No se pudo obtener el id del programa desde el servidor.");
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

export const programaAuthService = {
  ...createAuthService({
    accessTokenKey: ACCESS_TOKEN_KEY,
    refreshTokenKey: REFRESH_TOKEN_KEY,
    sessionKey: SESSION_KEY,
    requestedRole: "Director de programa",
    extraKeys: [PROGRAMA_KEY],
    onLogin: () => {
      // Se limpia el programaId cacheado para que se resuelva de nuevo en la sesión nueva
      _programaIdCache = null;
    },
    onLogout: () => {
      _programaIdCache = null;
    },
  }),

  async setProgramaId() {
    await getProgramaRealId();
  },
};
