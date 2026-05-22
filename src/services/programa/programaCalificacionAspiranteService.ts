const BASE_URL = import.meta.env.VITE_API_URL as string;
const ACCESS_TOKEN_KEY = "ufps_programa_access_token";

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
  const contentLength = res.headers.get("content-length");
  if (contentLength === "0") return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

export interface EntrevistaBackend {
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

export interface AgendarPayload {
  fecha: string;
  tiempo: string;
  idTipoentrevista: number;
  ubicacion: string;
}

export interface ReagendarPayload {
  fecha: string;
  tiempo: string;
  idTipoentrevista: number;
  ubicacion: string;
}

export interface CriterioBackend {
  id: number;
  nombreCriterio: string;
  peso: number;
  puntajeObtenido: number;
}

export interface CriteriosResponse {
  criterios: CriterioBackend[];
  puntajeTotal: number;
}

export interface CalificarCriterioPayload {
  idAspirante: number;
  idCriterio: number;
  puntuacion: number;
}

// GET /api/application/case/director-programa/aspirantes/{idAspirante}/entrevistas
export async function getEntrevistasByAspirante(idAspirante: number): Promise<EntrevistaBackend[]> {
  return apiFetch<EntrevistaBackend[]>(
    `/api/application/case/director-programa/aspirantes/${idAspirante}/entrevistas`
  );
}

// POST /api/application/case/director-programa/aspirantes/{idAspirante}/entrevistas/agendar
export async function agendarEntrevista(idAspirante: number, data: AgendarPayload): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/aspirantes/${idAspirante}/entrevistas/agendar`,
    { method: "POST", body: JSON.stringify(data) }
  );
}

// PATCH /api/application/case/director-programa/entrevistas/{idEntrevista}/reagendar
export async function reagendarEntrevista(idEntrevista: number, data: ReagendarPayload): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/entrevistas/${idEntrevista}/reagendar`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

// PATCH /api/application/case/director-programa/entrevistas/{idEntrevista}/completar
export async function completarEntrevista(idEntrevista: number): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/entrevistas/${idEntrevista}/completar`,
    { method: "PATCH" }
  );
}

// PATCH /api/application/case/director-programa/entrevistas/{idEntrevista}/cancelar
export async function cancelarEntrevista(idEntrevista: number, motivocambio: string): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/entrevistas/${idEntrevista}/cancelar`,
    { method: "PATCH", body: JSON.stringify({ motivocambio }) }
  );
}

// GET /api/application/case/director-programa/{idAspirante}/criterios
export async function getCriteriosByAspirante(idAspirante: number): Promise<CriteriosResponse> {
  return apiFetch<CriteriosResponse>(
    `/api/application/case/director-programa/${idAspirante}/criterios`
  );
}

// POST /api/application/case/director-programa/{idAspirante}/criterios/calificar
export async function updateCriterio(data: CalificarCriterioPayload): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/${data.idAspirante}/criterios/calificar`,
    { method: "POST", body: JSON.stringify(data) }
  );
}

export interface PruebaBackend {
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

export interface CrearPruebaPayload {
  nombre: string;
  descripcion: string;
  fecha: string;
  tiempo: string;
  idTipoprueba: number;
  ubicacion: string;
}

export interface ReagendarPruebaPayload {
  fecha: string;
  tiempo: string;
  idTipoprueba: number;
  ubicacion: string;
}

// GET /api/application/case/director-programa/aspirantes/{idAspirante}/pruebas
export async function getPruebasByAspirante(idAspirante: number): Promise<PruebaBackend[]> {
  return apiFetch<PruebaBackend[]>(
    `/api/application/case/director-programa/aspirantes/${idAspirante}/pruebas`
  );
}

// POST /api/application/case/director-programa/aspirantes/{idAspirante}/pruebas/crear
export async function crearPrueba(idAspirante: number, data: CrearPruebaPayload): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/aspirantes/${idAspirante}/pruebas/crear`,
    { method: "POST", body: JSON.stringify(data) }
  );
}

// PATCH /api/application/case/director-programa/pruebas/{idPrueba}/reagendar
export async function reagendarPrueba(idPrueba: number, data: ReagendarPruebaPayload): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/pruebas/${idPrueba}/reagendar`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

// PATCH /api/application/case/director-programa/pruebas/{idPrueba}/completar
export async function completarPrueba(idPrueba: number): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/pruebas/${idPrueba}/completar`,
    { method: "PATCH" }
  );
}

// PATCH /api/application/case/director-programa/pruebas/{idPrueba}/cancelar
export async function cancelarPrueba(idPrueba: number, motivocambio: string): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/pruebas/${idPrueba}/cancelar`,
    { method: "PATCH", body: JSON.stringify({ motivocambio }) }
  );
}
