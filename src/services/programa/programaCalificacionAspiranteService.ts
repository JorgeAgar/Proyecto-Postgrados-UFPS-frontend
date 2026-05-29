const BASE_URL = import.meta.env.VITE_API_URL as string;
const ACCESS_TOKEN_KEY = "ufps_programa_access_token";

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

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let body: unknown;
    try { body = JSON.parse(text); } catch { body = text; }
    throw new Error(extractErrorMessage(body, res.status, res.statusText));
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
  puntajeObtenido: number | null;
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

// PATCH /api/application/case/director-programa/entrevistas/{idEntrevista}/editar
export async function editarEntrevista(idEntrevista: number, data: ReagendarPayload): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/entrevistas/${idEntrevista}/editar`,
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

// GET /api/application/case/director-programa/aspirantes/{idAspirante}/criterios
export async function getCriteriosByAspirante(idAspirante: number): Promise<CriteriosResponse> {
  return apiFetch<CriteriosResponse>(
    `/api/application/case/director-programa/aspirantes/${idAspirante}/criterios`
  );
}

// PATCH /api/application/case/director-programa/aspirantes/{idAspirante}/criterios/{idCriterio}/calificar
export async function updateCriterio(data: CalificarCriterioPayload): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/aspirantes/${data.idAspirante}/criterios/${data.idCriterio}/calificar`,
    { method: "PATCH", body: JSON.stringify({ puntajeObtenido: data.puntajeObtenido }) }
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

export interface EditarPruebaPayload {
  nombre: string;
  descripcion: string;
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

// PATCH /api/application/case/director-programa/pruebas/{idPrueba}/editar
export async function editarPrueba(idPrueba: number, data: EditarPruebaPayload): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/pruebas/${idPrueba}/editar`,
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
