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
}

export interface ReagendarPayload {
  id: number;
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

export interface UpdateCriterioPayload {
  id: number;
  idAspirante: number;
  idCriterio: number;
  puntuacion: number;
  observaciones: string | null;
}

export async function getEntrevistasByAspirante(id: number): Promise<EntrevistaBackend[]> {
  return apiFetch<EntrevistaBackend[]>(
    "/api/application/case/director-programa/aspirants/interviewsById",
    { method: "POST", body: JSON.stringify({ id }) }
  );
}

export async function agendarEntrevista(data: AgendarPayload): Promise<void> {
  return apiFetch<void>(
    "/api/application/case/director-programa/interview/schedule",
    { method: "POST", body: JSON.stringify(data) }
  );
}

// Endpoint de reagendar: PUT /api/application/case/director-programa/interview/reschedule
export async function reagendarEntrevista(data: ReagendarPayload): Promise<void> {
  return apiFetch<void>(
    "/api/application/case/director-programa/interview/reschedule",
    { method: "PUT", body: JSON.stringify(data) }
  );
}

export async function completarEntrevista(id: number): Promise<void> {
  return apiFetch<void>(
    "/api/application/case/director-programa/interview/complete",
    { method: "PUT", body: JSON.stringify({ id }) }
  );
}

export async function cancelarEntrevista(id: number): Promise<void> {
  return apiFetch<void>(
    "/api/application/case/director-programa/interview/cancel",
    { method: "PUT", body: JSON.stringify({ id }) }
  );
}

export async function getCriteriosByAspirante(id: number): Promise<CriteriosResponse> {
  return apiFetch<CriteriosResponse>(
    "/api/application/case/director-programa/aspirants/criteriosById",
    { method: "POST", body: JSON.stringify({ id }) }
  );
}

export async function updateCriterio(data: UpdateCriterioPayload): Promise<void> {
  return apiFetch<void>(
    "/api/application/case/director-programa/calificacion/criterio/update",
    { method: "PUT", body: JSON.stringify(data) }
  );
}
