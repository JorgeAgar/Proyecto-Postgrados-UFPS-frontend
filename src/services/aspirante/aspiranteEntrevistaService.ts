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

interface EntrevistaBackend {
  id: number;
  fecha: string;
  tiempo: string;
  idEstado: number;
  estado: string;
  idTipoentrevista: number;
  tipoentrevista: string;
  ubicacion: string;
  motivocambio: string | null;
}

// ── Tipos frontend ────────────────────────────────────────────────────────────

export type EstadoEntrevista =
  | "confirmada"
  | "pendiente"
  | "solicitud_de_cambio"
  | "cancelada"
  | "completada";

export interface Entrevista {
  id: string;
  fecha: string;
  tiempo: string;
  lugar: string;
  modalidad: string;
  estado: EstadoEntrevista;
  motivocambio?: string;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapEstado(estado: string): EstadoEntrevista {
  const m: Record<string, EstadoEntrevista> = {
    "CONFIRMADA":                "confirmada",
    "PENDIENTE DE CONFIRMACION": "pendiente",
    "SOLICITUD DE CAMBIO":       "solicitud_de_cambio",
    "CANCELADA":                 "cancelada",
    "COMPLETADA":                "completada",
  };
  return m[estado] ?? "pendiente";
}

// ── Funciones exportadas ──────────────────────────────────────────────────────

// GET /api/application/case/aspirantes/{idAspirante}/entrevistas
export async function getEntrevistas(): Promise<Entrevista[]> {
  const idAspirante = getAspiranteId();
  const list = await apiFetch<EntrevistaBackend[]>(
    `/api/application/case/aspirantes/${idAspirante}/entrevistas`
  );
  return (list ?? []).map(e => ({
    id: String(e.id),
    fecha: e.fecha,
    tiempo: e.tiempo,
    lugar: e.ubicacion,
    modalidad: e.tipoentrevista,
    estado: mapEstado(e.estado),
    motivocambio: e.motivocambio ?? undefined,
  }));
}

// PATCH /api/application/case/aspirantes/entrevistas/{idEntrevista}/aceptar
export async function aceptarEntrevista(idEntrevista: string): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/aspirantes/entrevistas/${idEntrevista}/aceptar`,
    { method: "PATCH" }
  );
}

// PATCH /api/application/case/aspirantes/entrevistas/{idEntrevista}/solicitar-cambio
export async function solicitarCambioEntrevista(idEntrevista: string, motivocambio: string): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/aspirantes/entrevistas/${idEntrevista}/solicitar-cambio`,
    { method: "PATCH", body: JSON.stringify({ motivocambio }) }
  );
}

// PATCH /api/application/case/aspirantes/entrevistas/{idEntrevista}/cancelar
export async function cancelarEntrevista(idEntrevista: string, motivocambio: string): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/aspirantes/entrevistas/${idEntrevista}/cancelar`,
    { method: "PATCH", body: JSON.stringify({ motivocambio }) }
  );
}
