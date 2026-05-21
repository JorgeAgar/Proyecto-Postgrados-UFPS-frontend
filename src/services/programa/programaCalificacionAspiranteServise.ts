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
  hora: string;
  idEstado: number;
  idTipoentrevista: number;
  ubicacion: string;
  motivocambio: string | null;
}

export interface AgendarPayload {
  fecha: string;
  tiempo: string;
  idTipoentrevista: number;
  idAspirante: number;
  ubicacion: string;
  motivocambio: string;
}

export interface ReagendarPayload {
  id: number;
  fecha: string;
  tiempo: string;
  idTipoentrevista: number;
  ubicacion: string;
  motivocambio: string;
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

// GET /api/application/case/director-programa/{idAspirante}/entrevistas
export async function getEntrevistasByAspirante(idAspirante: number): Promise<EntrevistaBackend[]> {
  return apiFetch<EntrevistaBackend[]>(
    `/api/application/case/director-programa/${idAspirante}/entrevistas`
  );
}

// POST /api/application/case/director-programa/{idAspirante}/entrevistas/agendar
export async function agendarEntrevista(data: AgendarPayload): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/${data.idAspirante}/entrevistas/agendar`,
    { method: "POST", body: JSON.stringify(data) }
  );
}

// PATCH /api/application/case/director-programa/{idAspirante}/entrevistas/reagendar
export async function reagendarEntrevista(idAspirante: number, data: ReagendarPayload): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/${idAspirante}/entrevistas/reagendar`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

// PATCH /api/application/case/director-programa/{idAspirante}/entrevistas/completar
export async function completarEntrevista(idAspirante: number, idEntrevista: number): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/${idAspirante}/entrevistas/completar`,
    { method: "PATCH", body: JSON.stringify({ id: idEntrevista }) }
  );
}

// PATCH /api/application/case/director-programa/{idAspirante}/entrevistas/cancelar
export async function cancelarEntrevista(idAspirante: number, idEntrevista: number, motivocambio: string): Promise<void> {
  return apiFetch<void>(
    `/api/application/case/director-programa/${idAspirante}/entrevistas/cancelar`,
    { method: "PATCH", body: JSON.stringify({ id: idEntrevista, motivocambio }) }
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
