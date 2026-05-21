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

export interface EntrevistaConfirmada {
  id: string;
  fecha: string;
  tiempo: string;
  lugar: string;
  modalidad: string;
  tiempoRestante: string;
}

export interface EntrevistaPendiente {
  id: string;
  fecha: string;
  tiempo: string;
  lugar: string;
  modalidad: string;
  estado: "pendiente" | "cambio_solicitado";
}

export interface EntrevistasData {
  confirmadas: EntrevistaConfirmada[];
  pendientes: EntrevistaPendiente[];
}

// ── Formatters ────────────────────────────────────────────────────────────────

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function formatFecha(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} de ${MESES[month - 1]}, ${year}`;
}

function calcularTiempoRestante(iso: string): string {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(`${iso}T00:00:00`);
  const diff = Math.round((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff < 0) return `Hace ${Math.abs(diff)} día${Math.abs(diff) !== 1 ? "s" : ""}`;
  return `En ${diff} día${diff !== 1 ? "s" : ""}`;
}

function mapEntrevistas(list: EntrevistaBackend[]): EntrevistasData {
  const confirmadas: EntrevistaConfirmada[] = [];
  const pendientes: EntrevistaPendiente[] = [];

  for (const e of list) {
    const fecha = formatFecha(e.fecha);
    const lugar = e.ubicacion;
    const modalidad = e.tipoentrevista;

    if (e.estado === "CONFIRMADA") {
      confirmadas.push({
        id: String(e.id),
        fecha,
        tiempo: e.tiempo,
        lugar,
        modalidad,
        tiempoRestante: calcularTiempoRestante(e.fecha),
      });
    } else if (e.estado === "PENDIENTE DE CONFIRMACION") {
      pendientes.push({ id: String(e.id), fecha, tiempo: e.tiempo, lugar, modalidad, estado: "pendiente" });
    } else if (e.estado === "SOLICITUD DE CAMBIO") {
      pendientes.push({ id: String(e.id), fecha, tiempo: e.tiempo, lugar, modalidad, estado: "cambio_solicitado" });
    }
  }

  return { confirmadas, pendientes };
}

// ── Funciones exportadas ──────────────────────────────────────────────────────

// GET /api/application/case/aspirantes/{idAspirante}/entrevistas
export async function getEntrevistas(): Promise<EntrevistasData> {
  const idAspirante = getAspiranteId();
  const list = await apiFetch<EntrevistaBackend[]>(
    `/api/application/case/aspirantes/${idAspirante}/entrevistas`
  );
  return mapEntrevistas(list ?? []);
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
