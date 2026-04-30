/**
 * comiteCurricularService.ts
 *
 * Servicios reutilizables para el módulo Comité Curricular.
 * Todos los métodos usan fetch nativo, manejan errores y exponen
 * una interfaz limpia lista para conectar a los endpoints reales del backend.
 *
 * Para activar el backend real:
 *   1. Define VITE_API_URL en tu .env  (ej: VITE_API_URL=http://localhost:8080/api)
 *   2. Sustituye las funciones mock por las llamadas fetch reales (ya preparadas abajo).
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface CriterioEvaluacion {
  id: number;
  nombre: string;
  descripcion: string;
  peso: number;          // Porcentaje 0–100
  programa: string;
  cohorte: string;
  tienePuntajes?: boolean; // true si ya hay aspirantes calificados con este criterio
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Entrevista {
  id: number;
  aspiranteNombre: string;
  aspiranteDocumento: string;
  evaluadorNombre: string;
  fecha: string;
  hora: string;
  modalidad: "Presencial" | "Virtual";
  lugarOEnlace: string;
  programa: string;
  cohorte: string;
  /** Programada | Confirmada | No Confirmada | Realizada | Inasistencia | Cancelada */
  estado: string;
  creadoPor: string;
  motivoCancelacion?: string;
  tienePuntajes?: boolean;
}

export interface PruebaAdmision {
  id: number;
  nombre: string;
  programa: string;
  cohorte: string;
  fechaAplicacion: string;
  estado: string;
}

export interface Admision {
  id: number;
  aspiranteNombre: string;
  documento: string;
  programa: string;
  puntajeTotal: number;
  estado: "admitido" | "rechazado" | "pendiente";
}

// ── Helper ────────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// ── MOCK DATA (reemplazar por apiFetch cuando el backend esté listo) ──────────

const MOCK_CRITERIOS: CriterioEvaluacion[] = [
  { id: 1, nombre: "Hoja de vida académica", descripcion: "Evaluación del perfil académico del aspirante", peso: 30, programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", tienePuntajes: false },
  { id: 2, nombre: "Entrevista personal", descripcion: "Entrevista con el comité curricular", peso: 25, programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", tienePuntajes: false },
  { id: 3, nombre: "Prueba de conocimientos", descripcion: "Evaluación de competencias técnicas", peso: 30, programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", tienePuntajes: true },
  { id: 4, nombre: "Carta de motivación", descripcion: "Análisis de la propuesta de investigación", peso: 15, programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", tienePuntajes: false },
  { id: 5, nombre: "Experiencia profesional", descripcion: "Años y calidad de experiencia en el campo", peso: 20, programa: "Especialización en Redes", cohorte: "2025-1", tienePuntajes: false },
  { id: 6, nombre: "Entrevista técnica", descripcion: "Evaluación de competencias específicas", peso: 40, programa: "Especialización en Redes", cohorte: "2025-1", tienePuntajes: false },
  { id: 7, nombre: "Prueba de admisión", descripcion: "Examen escrito de fundamentos", peso: 40, programa: "Especialización en Redes", cohorte: "2025-1", tienePuntajes: false },
];

const MOCK_ENTREVISTAS: Entrevista[] = [
  { id: 1, aspiranteNombre: "Carlos Gómez", aspiranteDocumento: "1098765432", evaluadorNombre: "Dr. Ramírez Díaz", fecha: "2025-06-10", hora: "09:00", modalidad: "Presencial", lugarOEnlace: "Sala de reuniones 204 – Bloque A", programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", estado: "Confirmada", creadoPor: "comite@ufps.edu.co", tienePuntajes: false },
  { id: 2, aspiranteNombre: "Laura Martínez", aspiranteDocumento: "1020304050", evaluadorNombre: "Dra. Peña Torres", fecha: "2025-06-10", hora: "10:00", modalidad: "Virtual", lugarOEnlace: "https://meet.google.com/abc-defg-hij", programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", estado: "Programada", creadoPor: "comite@ufps.edu.co", tienePuntajes: false },
  { id: 3, aspiranteNombre: "Andrés Rojas", aspiranteDocumento: "9876543210", evaluadorNombre: "Dr. Ramírez Díaz", fecha: "2025-06-11", hora: "14:00", modalidad: "Presencial", lugarOEnlace: "Sala de reuniones 204 – Bloque A", programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", estado: "Programada", creadoPor: "comite@ufps.edu.co", tienePuntajes: false },
  { id: 4, aspiranteNombre: "Paola Suárez", aspiranteDocumento: "1057321456", evaluadorNombre: "Dra. Peña Torres", fecha: "2025-06-08", hora: "11:00", modalidad: "Virtual", lugarOEnlace: "https://teams.microsoft.com/l/meet/xyz", programa: "Especialización en Redes", cohorte: "2025-1", estado: "Realizada", creadoPor: "coordinacion@ufps.edu.co", tienePuntajes: true },
  { id: 5, aspiranteNombre: "Mario Cárdenas", aspiranteDocumento: "1087654321", evaluadorNombre: "Dr. López Vera", fecha: "2025-06-05", hora: "08:00", modalidad: "Presencial", lugarOEnlace: "Sala de reuniones 101 – Bloque B", programa: "Especialización en Redes", cohorte: "2025-1", estado: "Inasistencia", creadoPor: "comite@ufps.edu.co", tienePuntajes: false },
  { id: 6, aspiranteNombre: "Diana Fuentes", aspiranteDocumento: "1043219876", evaluadorNombre: "Dr. Ramírez Díaz", fecha: "2025-06-12", hora: "15:30", modalidad: "Virtual", lugarOEnlace: "https://zoom.us/j/123456789", programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", estado: "No Confirmada", creadoPor: "comite@ufps.edu.co", tienePuntajes: false },
];

const MOCK_PRUEBAS: PruebaAdmision[] = [
  { id: 1, nombre: "Prueba de Fundamentos de Software", programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", fechaAplicacion: "2025-06-15", estado: "Programada" },
  { id: 2, nombre: "Prueba de Redes y Comunicaciones", programa: "Especialización en Redes", cohorte: "2025-1", fechaAplicacion: "2025-06-20", estado: "Borrador" },
];

const MOCK_ADMISIONES: Admision[] = [
  { id: 1, aspiranteNombre: "Carlos Gómez", documento: "1098765432", programa: "Maestría en Ingeniería de Software", puntajeTotal: 87.5, estado: "pendiente" },
  { id: 2, aspiranteNombre: "Laura Martínez", documento: "1020304050", programa: "Maestría en Ingeniería de Software", puntajeTotal: 92.0, estado: "pendiente" },
  { id: 3, aspiranteNombre: "Andrés Rojas", documento: "9876543210", programa: "Maestría en Ingeniería de Software", puntajeTotal: 74.0, estado: "pendiente" },
];

// ── Servicios de Criterios ────────────────────────────────────────────────────

export const criteriosService = {
  /**
   * Obtiene criterios paginados.
   * TODO: reemplazar mock por: return apiFetch<PaginatedResponse<CriterioEvaluacion>>(`/v1/criterios?page=${page}&size=${pageSize}`)
   */
  async getAll(page = 1, pageSize = 5): Promise<PaginatedResponse<CriterioEvaluacion>> {
    await delay(400);
    const start = (page - 1) * pageSize;
    return {
      data: MOCK_CRITERIOS.slice(start, start + pageSize),
      total: MOCK_CRITERIOS.length,
      page,
      pageSize,
    };
  },

  /**
   * Crea un criterio.
   * TODO: return apiFetch<CriterioEvaluacion>("/v1/criterios", { method: "POST", body: JSON.stringify(criterio) })
   */
  async create(criterio: Omit<CriterioEvaluacion, "id" | "tienePuntajes">): Promise<CriterioEvaluacion> {
    await delay(600);
    const newId = Math.max(...MOCK_CRITERIOS.map(c => c.id)) + 1;
    const newCriterio = { ...criterio, id: newId, tienePuntajes: false };
    MOCK_CRITERIOS.push(newCriterio);
    return newCriterio;
  },

  /**
   * Actualiza un criterio.
   * TODO: return apiFetch<CriterioEvaluacion>(`/v1/criterios/${id}`, { method: "PUT", body: JSON.stringify(data) })
   */
  async update(id: number, data: Partial<CriterioEvaluacion>): Promise<CriterioEvaluacion> {
    await delay(600);
    const idx = MOCK_CRITERIOS.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Criterio no encontrado");
    MOCK_CRITERIOS[idx] = { ...MOCK_CRITERIOS[idx], ...data };
    return MOCK_CRITERIOS[idx];
  },

  /**
   * Elimina un criterio.
   * TODO: return apiFetch<void>(`/v1/criterios/${id}`, { method: "DELETE" })
   */
  async delete(id: number): Promise<void> {
    await delay(500);
    const idx = MOCK_CRITERIOS.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("Criterio no encontrado");
    MOCK_CRITERIOS.splice(idx, 1);
  },

  /**
   * Obtiene la suma de pesos de un programa/cohorte (excluyendo un id opcional).
   * Útil para validar que el total sea 100%.
   */
  getSumaPesos(programa: string, cohorte: string, excludeId?: number): number {
    return MOCK_CRITERIOS
      .filter(c => c.programa === programa && c.cohorte === cohorte && c.id !== excludeId)
      .reduce((sum, c) => sum + c.peso, 0);
  },

  /** Verifica si existe un nombre duplicado en programa/cohorte */
  existeNombre(nombre: string, programa: string, cohorte: string, excludeId?: number): boolean {
    return MOCK_CRITERIOS.some(
      c => c.nombre.toLowerCase() === nombre.toLowerCase()
        && c.programa === programa
        && c.cohorte === cohorte
        && c.id !== excludeId
    );
  },
};

// ── Servicios de Entrevista ───────────────────────────────────────────────────

export const entrevistaService = {
  /**
   * Obtiene todas las entrevistas paginadas.
   * TODO: return apiFetch<PaginatedResponse<Entrevista>>(`/v1/entrevistas?page=${page}&size=${pageSize}`)
   */
  async getAll(page = 1, pageSize = 5): Promise<PaginatedResponse<Entrevista>> {
    await delay(400);
    const start = (page - 1) * pageSize;
    return {
      data: MOCK_ENTREVISTAS.slice(start, start + pageSize),
      total: MOCK_ENTREVISTAS.length,
      page,
      pageSize,
    };
  },

  /**
   * Agenda una nueva entrevista.
   * TODO: return apiFetch<Entrevista>("/v1/entrevistas", { method: "POST", body: JSON.stringify(data) })
   */
  async create(data: Omit<Entrevista, "id" | "tienePuntajes">): Promise<Entrevista> {
    await delay(600);
    const newId = Math.max(...MOCK_ENTREVISTAS.map(e => e.id), 0) + 1;
    const nueva: Entrevista = { ...data, id: newId, tienePuntajes: false };
    MOCK_ENTREVISTAS.push(nueva);
    return nueva;
  },

  /**
   * Reagenda (actualiza) una entrevista existente.
   * TODO: return apiFetch<Entrevista>(`/v1/entrevistas/${id}`, { method: "PUT", body: JSON.stringify(data) })
   */
  async update(id: number, data: Partial<Entrevista>): Promise<Entrevista> {
    await delay(600);
    const idx = MOCK_ENTREVISTAS.findIndex(e => e.id === id);
    if (idx === -1) throw new Error("Entrevista no encontrada.");
    MOCK_ENTREVISTAS[idx] = { ...MOCK_ENTREVISTAS[idx], ...data };
    return MOCK_ENTREVISTAS[idx];
  },

  /**
   * Elimina una entrevista.
   * TODO: return apiFetch<void>(`/v1/entrevistas/${id}`, { method: "DELETE" })
   */
  async delete(id: number): Promise<void> {
    await delay(500);
    const idx = MOCK_ENTREVISTAS.findIndex(e => e.id === id);
    if (idx === -1) throw new Error("Entrevista no encontrada.");
    MOCK_ENTREVISTAS.splice(idx, 1);
  },

  /** Resumen de conteos para las cards del dashboard de entrevistas */
  getResumen() {
    const total = MOCK_ENTREVISTAS.length;
    const pendientes = MOCK_ENTREVISTAS.filter(e =>
      ["Programada", "No Confirmada"].includes(e.estado)
    ).length;
    const realizadas = MOCK_ENTREVISTAS.filter(e => e.estado === "Realizada").length;
    const fallidas = MOCK_ENTREVISTAS.filter(e => e.estado === "Inasistencia" || e.estado === "Cancelada").length;
    return { total, pendientes, realizadas, fallidas };
  },
};

// ── Servicios de Prueba ───────────────────────────────────────────────────────

export const pruebaService = {
  async getAll(): Promise<PruebaAdmision[]> {
    await delay(400);
    return [...MOCK_PRUEBAS];
  },
  // TODO: crear, editar, eliminar → apiFetch(...)
};

// ── Servicios de Admisión ─────────────────────────────────────────────────────

export const admisionService = {
  async getAll(): Promise<Admision[]> {
    await delay(400);
    return [...MOCK_ADMISIONES];
  },
  async admitir(id: number): Promise<void> {
    await delay(500);
    const a = MOCK_ADMISIONES.find(x => x.id === id);
    if (a) a.estado = "admitido";
  },
  async rechazar(id: number): Promise<void> {
    await delay(500);
    const a = MOCK_ADMISIONES.find(x => x.id === id);
    if (a) a.estado = "rechazado";
  },
  // TODO: generarListaAdmitidos, notificarAdmitidos → apiFetch(...)
};

// ── Auth Comité ───────────────────────────────────────────────────────────────

export const comiteAuthService = {
  /**
   * Login del comité curricular.
   * TODO: return apiFetch<{ token: string }>("/v1/comite/login", { method: "POST", body: JSON.stringify({ correo, password }) })
   */
  async login(correo: string, password: string): Promise<void> {
    await delay(800);
    // Demo: cualquier credencial con formato válido pasa
    if (!correo || !password) throw new Error("Credenciales inválidas");
    localStorage.setItem(
      "ufps_comite_session",
      JSON.stringify({ correo, loginAt: new Date().toISOString(), displayName: "Comité Curricular" })
    );
  },

  logout() {
    localStorage.removeItem("ufps_comite_session");
    localStorage.removeItem("auth_token");
  },

  getSession() {
    const raw = localStorage.getItem("ufps_comite_session");
    return raw ? JSON.parse(raw) : null;
  },
};

// ── Utilidades ────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}