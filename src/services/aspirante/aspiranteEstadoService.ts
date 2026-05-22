const BASE_URL = import.meta.env.VITE_API_URL as string;
const ACCESS_TOKEN_KEY = "ufps_aspirante_access_token";

// ── apiFetch ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as Record<string, string>)?.message ?? `Error ${res.status}: ${res.statusText}`
    );
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

function getAspiranteId(): number {
  const session = JSON.parse(localStorage.getItem("session") ?? "{}");
  return Number(session.userId ?? 0);
}

// ── Tipos backend ─────────────────────────────────────────────────────────────

interface PasoBackend {
  id: number;
  name: string;
  status: string;
}

// ── Tipos frontend ────────────────────────────────────────────────────────────

export type EstadoPaso = "completado" | "en-progreso" | "pendiente";

export interface PasoProceso {
  id: number;
  nombre: string;
  estado: EstadoPaso;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapEstado(apiStatus: string): EstadoPaso {
  const s = apiStatus.toLowerCase().trim();
  if (s === "completado") return "completado";
  if (s.includes("revis")) return "en-progreso";
  return "pendiente";
}

// ── Función exportada ─────────────────────────────────────────────────────────

// GET /api/application/case/aspirantes/{idAspirante}/estado-proceso
export async function fetchEstadoProceso(): Promise<PasoProceso[]> {
  const idAspirante = getAspiranteId();
  const list = await apiFetch<PasoBackend[]>(
    `/api/application/case/aspirantes/${idAspirante}/estado-proceso`
  );
  return (list ?? []).map(p => ({
    id: p.id,
    nombre: p.name,
    estado: mapEstado(p.status),
  }));
}

export default { fetchEstadoProceso };
