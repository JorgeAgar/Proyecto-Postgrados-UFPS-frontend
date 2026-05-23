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

interface PruebaBackend {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  tiempo: string;
  idEstado: number;
  estado: string;
  idTipoprueba: number;
  tipoprueba: string;
  ubicacion: string;
  motivocambio: string | null;
}

// ── Tipos frontend ────────────────────────────────────────────────────────────

export type EstadoPrueba =
  | "confirmada"
  | "pendiente"
  | "solicitud_de_cambio"
  | "cancelada"
  | "completada";

export interface Prueba {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  tiempo: string;
  lugar: string;
  modalidad: string;
  estado: EstadoPrueba;
  motivocambio?: string;
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapEstado(estado: string): EstadoPrueba {
  const m: Record<string, EstadoPrueba> = {
    "CONFIRMADA":                "confirmada",
    "PENDIENTE DE CONFIRMACION": "pendiente",
    "SOLICITUD DE CAMBIO":       "solicitud_de_cambio",
    "CANCELADA":                 "cancelada",
    "COMPLETADA":                "completada",
  };
  return m[estado] ?? "pendiente";
}

// ── Funciones exportadas ──────────────────────────────────────────────────────

// GET /api/application/case/aspirantes/{idAspirante}/pruebas
export async function getPruebas(): Promise<Prueba[]> {
  const idAspirante = getAspiranteId();
  const list = await apiFetch<PruebaBackend[]>(
    `/api/application/case/aspirantes/${idAspirante}/pruebas`
  );
  return (list ?? []).map(p => ({
    id: String(p.id),
    nombre: p.nombre ?? "",
    descripcion: p.descripcion ?? "",
    fecha: p.fecha,
    tiempo: p.tiempo,
    lugar: p.ubicacion,
    modalidad: p.tipoprueba,
    estado: mapEstado(p.estado),
    motivocambio: p.motivocambio ?? undefined,
  }));
}

// PATCH /api/application/case/aspirantes/pruebas/{idPrueba}/aceptar
export async function aceptarPrueba(idPrueba: string): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/aspirantes/pruebas/${idPrueba}/aceptar`,
    { method: "PATCH" }
  );
}

// PATCH /api/application/case/aspirantes/pruebas/{idPrueba}/solicitar-cambio
export async function solicitarCambioPrueba(idPrueba: string, motivocambio: string): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/aspirantes/pruebas/${idPrueba}/solicitar-cambio`,
    { method: "PATCH", body: JSON.stringify({ motivocambio }) }
  );
}

// PATCH /api/application/case/aspirantes/pruebas/{idPrueba}/cancelar
export async function cancelarPrueba(idPrueba: string, motivocambio: string): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/aspirantes/pruebas/${idPrueba}/cancelar`,
    { method: "PATCH", body: JSON.stringify({ motivocambio }) }
  );
}
