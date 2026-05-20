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

export interface AspiranteCalificacion {
  id: number;
  nombreCompleto: string;
  idEstado: number;
  correo: string;
  puntajeTotal: number;
}

export async function getAspirantes(): Promise<AspiranteCalificacion[]> {
  return apiFetch<AspiranteCalificacion[]>(
    "/api/application/case/director-programa/calificacion/listado"
  );
}

export async function getCountValidados(): Promise<number> {
  return apiFetch<number>(
    "/api/application/case/director-programa/calificacion/count/validados"
  );
}

export async function getCountPorCalificar(): Promise<number> {
  return apiFetch<number>(
    "/api/application/case/director-programa/calificacion/count/por-calificar"
  );
}

export async function getCountCalificados(): Promise<number> {
  return apiFetch<number>(
    "/api/application/case/director-programa/calificacion/count/calificados"
  );
}
