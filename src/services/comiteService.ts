/**
 * comiteCurricularService.ts
 *
 * Servicios reutilizables para el módulo Comité Curricular.
 * El módulo de ENTREVISTA usa la API REST real del backend.
 * Los demás módulos (criterios, pruebas, admisiones) conservan sus mocks.
 */

const BASE_URL =
  "https://proyectoposgradosbackend-production.up.railway.app/posgrados-project";

// ── Claves de almacenamiento (definidas aquí para que apiFetch las use) ───────

const ACCESS_TOKEN_KEY_EARLY   = "ufps_comite_access_token";
const REFRESH_TOKEN_KEY_EARLY  = "ufps_comite_refresh_token";
const COMITE_SESSION_KEY_EARLY = "ufps_comite_session";

// ── Refresh interno (sin circular dependency con comiteAuthService) ────────────

async function _doRefresh(): Promise<string | null> {
  const rt = localStorage.getItem(REFRESH_TOKEN_KEY_EARLY);
  if (!rt) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return null;
    const data = await res.json() as {
      accessToken: string; refreshToken: string;
      userId: number; username: string; roles: string[];
    };
    localStorage.setItem(ACCESS_TOKEN_KEY_EARLY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY_EARLY, data.refreshToken);
    const prevRaw = localStorage.getItem(COMITE_SESSION_KEY_EARLY);
    const prev = prevRaw ? JSON.parse(prevRaw) : {};
    localStorage.setItem(COMITE_SESSION_KEY_EARLY,
      JSON.stringify({ ...prev, userId: data.userId, username: data.username, roles: data.roles }));
    return data.accessToken;
  } catch {
    return null;
  }
}

// ── Helper de fetch autenticado con auto-refresh en 401/403 ──────────────────

async function apiFetch<T>(path: string, options?: RequestInit, _isRetry = false): Promise<T> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY_EARLY);
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if ((res.status === 401 || res.status === 403) && !_isRetry) {
    const newToken = await _doRefresh();
    if (!newToken) {
      localStorage.removeItem(ACCESS_TOKEN_KEY_EARLY);
      localStorage.removeItem(REFRESH_TOKEN_KEY_EARLY);
      localStorage.removeItem(COMITE_SESSION_KEY_EARLY);
      throw new Error("Sesión expirada. Por favor, inicia sesión de nuevo.");
    }
    return apiFetch<T>(path, options, true);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as Record<string, string>)?.message ??
        `Error ${res.status}: ${res.statusText}`
    );
  }

  return res.json() as Promise<T>;
}

// ── Tipos internos del backend ────────────────────────────────────────────────

interface PersonaBackend {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  fechanacimiento?: string;
  celular?: string;
  telefono?: string;
}

interface AdministrativoBackend {
  id: number;
  fechainicio?: string;
  fechasalida?: string;
  persona: PersonaBackend;
  estado?: { id: number; tipo: string };
  cargo?: { id: number; nombre: string; descripcion: string };
}

interface EntrevistadorBackend {
  id: number;
  observaciones?: string;
  administrativo: AdministrativoBackend;
}

interface AspiranteBackend {
  id: number;
  persona: PersonaBackend;
}

interface TipoEntrevistaBackend {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface EstadoBackend {
  id: number;
  tipo: string;
}

export interface EntrevistaBackend {
  id: number;
  fecha: string;
  calificacion?: number;
  tipoentrevista: TipoEntrevistaBackend;
  entrevistador: EntrevistadorBackend;
  aspirante: AspiranteBackend;
  estado: EstadoBackend;
}

export interface EntrevistadoresBackend {
  id: number;
  entrevista: EntrevistaBackend;
  administrativo: AdministrativoBackend;
}

export interface EntrevistaCreatePayload {
  fecha: string;
  calificacion: number;
  idTipoentrevista: number;
  idEntrevistador: number;
  idAspirante: number;
  idEstado: number;
}

export interface EntrevistadoresCreatePayload {
  idEntrevista: number;
  idAdministrativo: number;
}

// ── Tipos del frontend ────────────────────────────────────────────────────────

export interface CriterioEvaluacion {
  id: number;
  nombre: string;
  descripcion: string;
  peso: number;
  programa: string;
  cohorte: string;
  tienePuntajes?: boolean;
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
  aspiranteId: number;
  evaluadorNombre: string;
  evaluadorId: number;
  entrevistadores: { id: number; nombre: string; administrativoId: number }[];
  fecha: string;
  hora: string;
  tipoEntrevistaId: number;
  tipoEntrevistaNombre: string;
  estado: string;
  estadoId: number;
  calificacion?: number | null;
  tienePuntajes?: boolean;
  modalidad?: "Presencial" | "Virtual";
  lugarOEnlace?: string;
  programa?: string;
  cohorte?: string;
  creadoPor?: string;
}

export interface AspiranteFrontend {
  id: number;
  nombre: string;
  documento?: string;
}

export interface AdministrativoFrontend {
  id: number;
  nombre: string;
}

export interface TipoEntrevistaFrontend {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface EstadoFrontend {
  id: number;
  tipo: string;
}

export interface PruebaAdmision {
  id: number;
  nombre: string;
  descripcion?: string;
  peso?: number;
  programa: string;
  cohorte: string;
  fechaAplicacion: string;
  hora?: string;
  estado: string;
  tienePuntajes?: boolean;
}

export interface Admision {
  id: number;
  aspiranteNombre: string;
  documento: string;
  programa: string;
  puntajeTotal: number;
  estado: "admitido" | "rechazado" | "pendiente";
}

// ── Helpers de mapeo ──────────────────────────────────────────────────────────

function nombreCompleto(p: PersonaBackend): string {
  return `${p?.nombres ?? ""} ${p?.apellidos ?? ""}`.trim();
}

// ── Helpers POST /list por id (buscan un registro concreto por su id) ────────

async function fetchAspiranteById(id: number): Promise<AspiranteBackend | null> {
  try {
    return await apiFetch<AspiranteBackend>("/api/dev/endpoint/aspirante/list", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  } catch { return null; }
}

async function fetchPersonaById(id: number): Promise<PersonaBackend | null> {
  try {
    return await apiFetch<PersonaBackend>("/api/dev/endpoint/persona/list", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  } catch { return null; }
}

async function fetchAdministrativoById(id: number): Promise<AdministrativoBackend | null> {
  try {
    return await apiFetch<AdministrativoBackend>("/api/dev/endpoint/administrativo/list", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  } catch { return null; }
}

// ── Caché en memoria para evitar llamadas duplicadas dentro de la misma carga ─

const _cachePersona    = new Map<number, PersonaBackend | null>();
const _cacheAspirante  = new Map<number, AspiranteBackend | null>();
const _cacheAdmin      = new Map<number, AdministrativoBackend | null>();

async function getPersona(id: number): Promise<PersonaBackend | null> {
  if (_cachePersona.has(id)) return _cachePersona.get(id)!;
  const val = await fetchPersonaById(id);
  _cachePersona.set(id, val);
  return val;
}

async function getAspirante(id: number): Promise<AspiranteBackend | null> {
  if (_cacheAspirante.has(id)) return _cacheAspirante.get(id)!;
  const val = await fetchAspiranteById(id);
  _cacheAspirante.set(id, val);
  return val;
}

async function getAdministrativo(id: number): Promise<AdministrativoBackend | null> {
  if (_cacheAdmin.has(id)) return _cacheAdmin.get(id)!;
  const val = await fetchAdministrativoById(id);
  _cacheAdmin.set(id, val);
  return val;
}

/**
 * Resuelve el nombre completo de un aspirante dado su id.
 *
 * entrevista.aspirante.id
 *   → POST /aspirante/list { id }  → aspirante.persona.id
 *   → POST /persona/list  { id }   → persona.nombres + persona.apellidos
 */
async function resolverNombreAspirante(aspiranteId: number): Promise<string> {
  const aspirante = await getAspirante(aspiranteId);
  if (!aspirante) return "";

  // Si persona ya viene anidada con nombres, usarla directamente
  if (aspirante.persona?.nombres) {
    return `${aspirante.persona.nombres} ${aspirante.persona.apellidos ?? ""}`.trim();
  }

  // Si solo viene el id de persona, ir a buscarla
  if (aspirante.persona?.id) {
    const persona = await getPersona(aspirante.persona.id);
    if (persona?.nombres) {
      return `${persona.nombres} ${persona.apellidos ?? ""}`.trim();
    }
  }

  return "";
}

/**
 * Resuelve el nombre completo de un administrativo dado su id.
 *
 * administrativo.id
 *   → POST /administrativo/list { id }  → administrativo.persona.id
 *   → POST /persona/list        { id }  → persona.nombres + persona.apellidos
 */
async function resolverNombreAdministrativo(adminId: number): Promise<string> {
  const admin = await getAdministrativo(adminId);
  if (!admin) return "";

  // Si persona ya viene anidada con nombres, usarla directamente
  if (admin.persona?.nombres) {
    return `${admin.persona.nombres} ${admin.persona.apellidos ?? ""}`.trim();
  }

  // Si solo viene el id de persona, ir a buscarla
  if (admin.persona?.id) {
    const persona = await getPersona(admin.persona.id);
    if (persona?.nombres) {
      return `${persona.nombres} ${persona.apellidos ?? ""}`.trim();
    }
  }

  return "";
}

// ── Servicio de Entrevista (API REAL) ─────────────────────────────────────────

export const entrevistaService = {
  /**
   * getAll: Reconstruye entrevistas con datos completos resolviendo tabla por tabla
   * usando los endpoints POST /list con búsqueda por id.
   *
   * FLUJO ASPIRANTE por entrevista:
   *   entrevista.aspirante.id
   *   → POST /aspirante/list     { id }  → aspirante con persona.id
   *   → POST /persona/list       { id }  → nombres + apellidos
   *
   * FLUJO ENTREVISTADORES por entrevista:
   *   GET /entrevistadores/listall → filtrar por entrevistadores.entrevista.id == entrevista.id
   *   → por cada registro: entrevistadores.administrativo.id
   *   → POST /administrativo/list { id } → administrativo con persona.id
   *   → POST /persona/list        { id } → nombres + apellidos
   */
  async getAll(page = 1, pageSize = 5): Promise<PaginatedResponse<Entrevista>> {

    // Limpiar caché antes de cada carga completa
    _cachePersona.clear();
    _cacheAspirante.clear();
    _cacheAdmin.clear();

    // ── PASO 1: Obtener lista base de entrevistas y tabla de entrevistadores ───
    const [entrevistasRaw, entrevistadoresRelRaw] = await Promise.all([
      apiFetch<EntrevistaBackend[]>("/api/dev/endpoint/entrevista/listall"),
      apiFetch<EntrevistadoresBackend[]>("/api/dev/endpoint/entrevistadores/listall")
        .catch(() => [] as EntrevistadoresBackend[]),
    ]);

    // ── PASO 2: Indexar entrevistadores por entrevista.id ─────────────────────
    // entrevista.id → registros de la tabla entrevistadores con ese id de entrevista
    const entrevistadoresPorEntrevista = new Map<number, EntrevistadoresBackend[]>();
    for (const rel of entrevistadoresRelRaw) {
      const eid = rel.entrevista?.id;
      if (!eid) continue;
      if (!entrevistadoresPorEntrevista.has(eid)) entrevistadoresPorEntrevista.set(eid, []);
      entrevistadoresPorEntrevista.get(eid)!.push(rel);
    }

    // ── PASO 3: Resolver cada entrevista en paralelo ───────────────────────────
    const mapped: Entrevista[] = await Promise.all(
      entrevistasRaw.map(async (e) => {

        // ── ASPIRANTE ─────────────────────────────────────────────────────────
        // entrevista.aspirante.id → POST /aspirante/list → persona.id → POST /persona/list
        let aspiranteNombre = "";
        const aspiranteId = e.aspirante?.id;
        if (aspiranteId) {
          aspiranteNombre = await resolverNombreAspirante(aspiranteId);
        }

        // ── ENTREVISTADOR PRINCIPAL ───────────────────────────────────────────
        // entrevista.entrevistador.administrativo.id → POST /administrativo/list → persona.id → POST /persona/list
        let evaluadorNombre = "Sin asignar";
        const adminIdPrincipal = e.entrevistador?.administrativo?.id;
        if (adminIdPrincipal) {
          const nombre = await resolverNombreAdministrativo(adminIdPrincipal);
          if (nombre) evaluadorNombre = nombre;
        }

        // ── ENTREVISTADORES ADICIONALES ───────────────────────────────────────
        // GET /entrevistadores/listall filtrado por entrevista.id
        // → por cada uno: administrativo.id → POST /administrativo/list → persona.id → POST /persona/list
        const relaciones = entrevistadoresPorEntrevista.get(e.id) ?? [];
        const entrevistadoresList: { id: number; nombre: string; administrativoId: number }[] = [];

        await Promise.all(
          relaciones.map(async (rel) => {
            const adminId = rel.administrativo?.id;
            if (!adminId) return;
            const nombre = await resolverNombreAdministrativo(adminId);
            if (nombre) {
              entrevistadoresList.push({
                id: rel.id,
                nombre,
                administrativoId: adminId,
              });
            }
          })
        );

        return {
          id: e.id,
          aspiranteId: aspiranteId ?? 0,
          aspiranteNombre,
          aspiranteDocumento: "",
          evaluadorId: e.entrevistador?.id ?? 0,
          evaluadorNombre,
          entrevistadores: entrevistadoresList,
          fecha: e.fecha ?? "",
          hora: "",
          tipoEntrevistaId: e.tipoentrevista?.id ?? 0,
          tipoEntrevistaNombre: e.tipoentrevista?.nombre ?? "",
          estado: e.estado?.tipo ?? "",
          estadoId: e.estado?.id ?? 0,
          calificacion: e.calificacion ?? null,
          tienePuntajes: false,
        };
      })
    );

    const start = (page - 1) * pageSize;
    return {
      data: mapped.slice(start, start + pageSize),
      total: mapped.length,
      page,
      pageSize,
    };
  },

  async create(
    data: EntrevistaCreatePayload,
    entrevistadoresAdicionalesIds: number[] = []
  ): Promise<EntrevistaBackend> {
    const nueva = await apiFetch<EntrevistaBackend>(
      "/api/dev/endpoint/entrevista/create",
      { method: "POST", body: JSON.stringify(data) }
    );

    const extras = entrevistadoresAdicionalesIds.filter(
      (id) => id !== data.idEntrevistador
    );
    await Promise.all(
      extras.map((idAdmin) =>
        apiFetch("/api/dev/endpoint/entrevistadores/create", {
          method: "POST",
          body: JSON.stringify({ idEntrevista: nueva.id, idAdministrativo: idAdmin }),
        }).catch(() => null)
      )
    );

    return nueva;
  },

  async update(id: number, data: Partial<EntrevistaCreatePayload>): Promise<EntrevistaBackend> {
    return apiFetch<EntrevistaBackend>("/api/dev/endpoint/entrevista/update", {
      method: "PUT",
      body: JSON.stringify({ id, ...data }),
    });
  },

  async delete(id: number): Promise<void> {
    await apiFetch<void>("/api/dev/endpoint/entrevista/delete", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  },

  getResumenFromList(entrevistas: Entrevista[]) {
    const normalizar = (e: string) => e?.toLowerCase() ?? "";
    const total = entrevistas.length;
    const pendientes = entrevistas.filter((e) =>
      ["programada", "no confirmada", "pendiente"].includes(normalizar(e.estado))
    ).length;
    const realizadas = entrevistas.filter((e) =>
      ["realizada"].includes(normalizar(e.estado))
    ).length;
    const fallidas = entrevistas.filter((e) =>
      ["inasistencia", "cancelada"].includes(normalizar(e.estado))
    ).length;
    return { total, pendientes, realizadas, fallidas };
  },

  getResumen() {
    return { total: 0, pendientes: 0, realizadas: 0, fallidas: 0 };
  },
};

// ── Servicio de catálogos (formularios de entrevista) ─────────────────────────

export const catalogoService = {
  async getAspirantes(): Promise<AspiranteFrontend[]> {
    const data = await apiFetch<AspiranteBackend[]>("/api/dev/endpoint/aspirante/listall");
    return data.map((a) => ({ id: a.id, nombre: nombreCompleto(a.persona), documento: "" }));
  },

  async getAdministrativos(): Promise<AdministrativoFrontend[]> {
    const data = await apiFetch<AdministrativoBackend[]>("/api/dev/endpoint/administrativo/listall");
    return data.map((a) => ({ id: a.id, nombre: nombreCompleto(a.persona) }));
  },

  async getTiposEntrevista(): Promise<TipoEntrevistaFrontend[]> {
    const data = await apiFetch<TipoEntrevistaBackend[]>("/api/dev/endpoint/tipoentrevista/listall");
    return data.map((t) => ({ id: t.id, nombre: t.nombre, descripcion: t.descripcion }));
  },

  async getEstados(): Promise<EstadoFrontend[]> {
    const data = await apiFetch<EstadoBackend[]>("/api/dev/endpoint/estado/listall");
    return data.map((e) => ({ id: e.id, tipo: e.tipo }));
  },

  async getEntrevistadores(): Promise<AdministrativoFrontend[]> {
    const data = await apiFetch<EntrevistadorBackend[]>("/api/dev/endpoint/entrevistador/listall");
    return data.map((e) => ({
      id: e.administrativo?.id ?? e.id,
      nombre: nombreCompleto(e.administrativo?.persona ?? ({} as PersonaBackend)),
    }));
  },
};

// ── MOCK DATA ─────────────────────────────────────────────────────────────────

const MOCK_CRITERIOS: CriterioEvaluacion[] = [
  { id: 1, nombre: "Hoja de vida académica", descripcion: "Evaluación del perfil académico del aspirante", peso: 30, programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", tienePuntajes: false },
  { id: 2, nombre: "Entrevista personal", descripcion: "Entrevista con el comité curricular", peso: 25, programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", tienePuntajes: false },
  { id: 3, nombre: "Prueba de conocimientos", descripcion: "Evaluación de competencias técnicas", peso: 30, programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", tienePuntajes: true },
  { id: 4, nombre: "Carta de motivación", descripcion: "Análisis de la propuesta de investigación", peso: 15, programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", tienePuntajes: false },
  { id: 5, nombre: "Experiencia profesional", descripcion: "Años y calidad de experiencia en el campo", peso: 20, programa: "Especialización en Redes", cohorte: "2025-1", tienePuntajes: false },
  { id: 6, nombre: "Entrevista técnica", descripcion: "Evaluación de competencias específicas", peso: 40, programa: "Especialización en Redes", cohorte: "2025-1", tienePuntajes: false },
  { id: 7, nombre: "Prueba de admisión", descripcion: "Examen escrito de fundamentos", peso: 40, programa: "Especialización en Redes", cohorte: "2025-1", tienePuntajes: false },
];

const MOCK_PRUEBAS: PruebaAdmision[] = [
  { id: 1, nombre: "Prueba de Fundamentos de Software", descripcion: "Evaluación escrita de conceptos de ingeniería de software.", peso: 30, programa: "Maestría en Ingeniería de Software", cohorte: "2025-1", fechaAplicacion: "2025-06-15", hora: "08:00", estado: "Programada", tienePuntajes: false },
  { id: 2, nombre: "Prueba de Redes y Comunicaciones", descripcion: "Examen teórico-práctico sobre protocolos de red.", peso: 40, programa: "Especialización en Redes", cohorte: "2025-1", fechaAplicacion: "2025-06-20", hora: "10:00", estado: "Borrador", tienePuntajes: true },
];

const MOCK_ADMISIONES: Admision[] = [
  { id: 1, aspiranteNombre: "Carlos Gómez", documento: "1098765432", programa: "Maestría en Ingeniería de Software", puntajeTotal: 87.5, estado: "pendiente" },
  { id: 2, aspiranteNombre: "Laura Martínez", documento: "1020304050", programa: "Maestría en Ingeniería de Software", puntajeTotal: 92.0, estado: "pendiente" },
  { id: 3, aspiranteNombre: "Andrés Rojas", documento: "9876543210", programa: "Maestría en Ingeniería de Software", puntajeTotal: 74.0, estado: "pendiente" },
];

// ── Criterios (MOCK) ──────────────────────────────────────────────────────────

export const criteriosService = {
  async getAll(page = 1, pageSize = 5): Promise<PaginatedResponse<CriterioEvaluacion>> {
    await delay(400);
    const start = (page - 1) * pageSize;
    return { data: MOCK_CRITERIOS.slice(start, start + pageSize), total: MOCK_CRITERIOS.length, page, pageSize };
  },
  async create(criterio: Omit<CriterioEvaluacion, "id" | "tienePuntajes">): Promise<CriterioEvaluacion> {
    await delay(600);
    const newId = Math.max(...MOCK_CRITERIOS.map((c) => c.id)) + 1;
    const newCriterio = { ...criterio, id: newId, tienePuntajes: false };
    MOCK_CRITERIOS.push(newCriterio);
    return newCriterio;
  },
  async update(id: number, data: Partial<CriterioEvaluacion>): Promise<CriterioEvaluacion> {
    await delay(600);
    const idx = MOCK_CRITERIOS.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Criterio no encontrado");
    MOCK_CRITERIOS[idx] = { ...MOCK_CRITERIOS[idx], ...data };
    return MOCK_CRITERIOS[idx];
  },
  async delete(id: number): Promise<void> {
    await delay(500);
    const idx = MOCK_CRITERIOS.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Criterio no encontrado");
    MOCK_CRITERIOS.splice(idx, 1);
  },
  getSumaPesos(programa: string, cohorte: string, excludeId?: number): number {
    return MOCK_CRITERIOS.filter((c) => c.programa === programa && c.cohorte === cohorte && c.id !== excludeId).reduce((sum, c) => sum + c.peso, 0);
  },
  existeNombre(nombre: string, programa: string, cohorte: string, excludeId?: number): boolean {
    return MOCK_CRITERIOS.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase() && c.programa === programa && c.cohorte === cohorte && c.id !== excludeId);
  },
};

// ── Pruebas (MOCK) ────────────────────────────────────────────────────────────

export const pruebaService = {
  async getAll(page = 1, pageSize = 100): Promise<PaginatedResponse<PruebaAdmision>> {
    await delay(400);
    const start = (page - 1) * pageSize;
    return { data: MOCK_PRUEBAS.slice(start, start + pageSize), total: MOCK_PRUEBAS.length, page, pageSize };
  },
  async create(data: Omit<PruebaAdmision, "id" | "tienePuntajes">): Promise<PruebaAdmision> {
    await delay(600);
    const newId = Math.max(...MOCK_PRUEBAS.map((p) => p.id), 0) + 1;
    const nueva: PruebaAdmision = { ...data, id: newId, tienePuntajes: false };
    MOCK_PRUEBAS.push(nueva);
    return nueva;
  },
  async update(id: number, data: Partial<PruebaAdmision>): Promise<PruebaAdmision> {
    await delay(600);
    const idx = MOCK_PRUEBAS.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Prueba no encontrada.");
    MOCK_PRUEBAS[idx] = { ...MOCK_PRUEBAS[idx], ...data };
    return MOCK_PRUEBAS[idx];
  },
  async delete(id: number): Promise<void> {
    await delay(500);
    const idx = MOCK_PRUEBAS.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Prueba no encontrada.");
    if (MOCK_PRUEBAS[idx].tienePuntajes) throw new Error("No se puede eliminar esta prueba porque ya existen aspirantes con calificaciones registradas.");
    MOCK_PRUEBAS.splice(idx, 1);
  },
  getSumaPesos(programa: string, cohorte: string, excludeId?: number): number {
    return MOCK_PRUEBAS.filter((p) => p.programa === programa && p.cohorte === cohorte && p.id !== excludeId).reduce((sum, p) => sum + (p.peso ?? 0), 0);
  },
  existeNombre(nombre: string, programa: string, cohorte: string, excludeId?: number): boolean {
    return MOCK_PRUEBAS.some((p) => p.nombre.toLowerCase() === nombre.toLowerCase() && p.programa === programa && p.cohorte === cohorte && p.id !== excludeId);
  },
};

// ── Admisiones (MOCK) ─────────────────────────────────────────────────────────

export const admisionService = {
  async getAll(): Promise<Admision[]> {
    await delay(400);
    return [...MOCK_ADMISIONES];
  },
  async admitir(id: number): Promise<void> {
    await delay(500);
    const a = MOCK_ADMISIONES.find((x) => x.id === id);
    if (a) a.estado = "admitido";
  },
  async rechazar(id: number): Promise<void> {
    await delay(500);
    const a = MOCK_ADMISIONES.find((x) => x.id === id);
    if (a) a.estado = "rechazado";
  },
};

// ── Auth Comité (API REAL) ────────────────────────────────────────────────────

// Re-exporta las claves ya definidas arriba para uso interno del servicio
const COMITE_SESSION_KEY = COMITE_SESSION_KEY_EARLY;
const ACCESS_TOKEN_KEY   = ACCESS_TOKEN_KEY_EARLY;
const REFRESH_TOKEN_KEY  = REFRESH_TOKEN_KEY_EARLY;

// Roles que se consideran válidos para acceder al panel de Comité
const COMITE_ROLES = ["COMITE", "COMITÉ", "COMITE_CURRICULAR", "SUPER_ADMINISTRADOR"];

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  roles: string[];
}

function hasComiteRole(roles: string[]): boolean {
  return roles.some((r) =>
    COMITE_ROLES.some((cr) => r.toUpperCase().includes(cr.toUpperCase()))
  );
}

export const comiteAuthService = {
  /** Autentica contra el backend real y guarda los tokens si el usuario tiene rol COMITÉ. */
  async login(username: string, password: string): Promise<void> {
    if (!username.trim() || !password.trim()) {
      throw new Error("Usuario y contraseña son obligatorios.");
    }

    let data: LoginResponse;
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("Usuario o contraseña incorrectos.");
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as Record<string, string>)?.message ??
            `Error del servidor (${res.status}).`
        );
      }

      data = await res.json();
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
      }
      throw err;
    }

    if (!hasComiteRole(data.roles)) {
      throw new Error(
        "Tu cuenta no tiene permisos de Comité Curricular. Verifica tu rol con el administrador."
      );
    }

    // Guardar tokens
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(
      COMITE_SESSION_KEY,
      JSON.stringify({
        userId: data.userId,
        username: data.username,
        roles: data.roles,
        displayName: data.username,
        loginAt: new Date().toISOString(),
      })
    );
  },

  /** Refresca el accessToken usando el refreshToken almacenado. */
  async refreshSession(): Promise<boolean> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const data: LoginResponse = await res.json();
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      localStorage.setItem(
        COMITE_SESSION_KEY,
        JSON.stringify({
          userId: data.userId,
          username: data.username,
          roles: data.roles,
          displayName: data.username,
          loginAt: new Date().toISOString(),
        })
      );
      return true;
    } catch {
      return false;
    }
  },

  /** Elimina todos los datos de sesión del Comité. */
  logout() {
    localStorage.removeItem(COMITE_SESSION_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  /** Retorna la sesión activa o null si no existe. */
  getSession() {
    const raw = localStorage.getItem(COMITE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /** Retorna el accessToken actual para usarlo en peticiones autenticadas. */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};

// ── Utilidades ────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}