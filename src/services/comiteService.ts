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

  // Manejo de respuestas vacías (típico en DELETE 204 No Content,
  // o 200 OK con body vacío).
  if (res.status === 204) {
    return undefined as T;
  }
  const contentLength = res.headers.get("content-length");
  if (contentLength === "0") {
    return undefined as T;
  }
  // Intentar leer como texto primero por si el body está vacío
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    // Si el backend respondió con texto plano (no JSON), devolver undefined
    return undefined as T;
  }
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
  tiempo?: string;
  calificacion?: number;
  tipoentrevista: TipoEntrevistaBackend;
  entrevistador: EntrevistadorBackend;
  aspirante: AspiranteBackend;
  estado: EstadoBackend;
  ubicacion?: { id: number } | null;
}

export interface EntrevistadoresBackend {
  id: number;
  entrevista: EntrevistaBackend;
  administrativo: AdministrativoBackend;
}

export interface EntrevistaCreatePayload {
  fecha: string;
  tiempo: string;
  idTipoentrevista: number;
  idEntrevistador: number;
  idAspirante: number;
  idEstado: number;
  idUbicacion: number;
}

export interface EntrevistaUpdatePayload {
  fecha: string;
  tiempo: string;
  calificacion: number;
  idTipoentrevista: number;
  idEntrevistador: number;
  idAspirante: number;
  idEstado: number;
  idUbicacion: number;
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
  /** id del registro en la tabla entrevistador (idEntrevistador en el payload) */
  evaluadorId: number;
  /** id del administrativo asociado al entrevistador principal */
  evaluadorAdministrativoId: number;
  entrevistadores: { id: number; nombre: string; administrativoId: number }[];
  fecha: string;
  hora: string;
  tipoEntrevistaId: number;
  tipoEntrevistaNombre: string;
  estado: string;
  estadoId: number;
  calificacion?: number | null;
  ubicacionId?: number | null;
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
  id: number;          // id que se usa en el dropdown (administrativo.id)
  nombre: string;
  /** id en la tabla `entrevistador` cuando proviene de getEntrevistadores;
   *  necesario para enviarse como `idEntrevistador` en la entrevista. */
  entrevistadorId?: number;
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

function nombreCompleto(p: PersonaBackend | null | undefined): string {
  return `${p?.nombres ?? ""} ${p?.apellidos ?? ""}`.trim();
}

// ── Caché en memoria (persiste durante la sesión, se limpia con clearCache) ───
//
// Decisión de diseño:
//   - El caché NO se limpia en cada getAll() para reutilizar datos entre páginas.
//   - Se limpia explícitamente solo al crear/actualizar/eliminar entrevistas,
//     asegurando consistencia sin sacrificar rendimiento.

const _cacheAspirante  = new Map<number, AspiranteBackend | null>();
const _cacheAdmin      = new Map<number, AdministrativoBackend | null>();

function _clearCache() {
  _cacheAspirante.clear();
  _cacheAdmin.clear();
}

// ── Helpers POST /list por id ─────────────────────────────────────────────────

async function fetchAspiranteById(id: number): Promise<AspiranteBackend | null> {
  try {
    return await apiFetch<AspiranteBackend>("/api/dev/endpoint/aspirante/list", {
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
 * Resuelve el nombre completo de un aspirante.
 *
 * Prioridad (de más a menos eficiente):
 *   1. persona embebida en la entrevista raw (evita cualquier fetch adicional)
 *   2. persona embebida en POST /aspirante/list (1 fetch)
 *   ✗ NO llama a /persona/list — la persona siempre viene dentro del aspirante
 */
async function resolverNombreAspirante(
  aspiranteId: number,
  personaEmbebida?: PersonaBackend | null
): Promise<string> {
  // Nivel 1: si ya viene la persona desde la entrevista raw, usarla directamente
  if (personaEmbebida?.nombres) {
    return nombreCompleto(personaEmbebida);
  }

  // Nivel 2: fetch del aspirante (que embebe persona con nombres y apellidos)
  const aspirante = await getAspirante(aspiranteId);
  if (!aspirante) return "";

  if (aspirante.persona?.nombres) {
    return nombreCompleto(aspirante.persona);
  }

  return "";
}

/**
 * Resuelve el nombre completo de un administrativo.
 *
 * Prioridad (de más a menos eficiente):
 *   1. persona embebida en el registro de entrevistadores (evita fetch adicional)
 *   2. persona embebida en POST /administrativo/list (1 fetch)
 *   ✗ NO llama a /persona/list — la persona siempre viene dentro del administrativo
 */
async function resolverNombreAdministrativo(
  adminId: number,
  personaEmbebida?: PersonaBackend | null
): Promise<string> {
  // Nivel 1: si ya viene la persona embebida en el registro relacionado, usarla
  if (personaEmbebida?.nombres) {
    return nombreCompleto(personaEmbebida);
  }

  // Nivel 2: fetch del administrativo (que embebe persona con nombres y apellidos)
  const admin = await getAdministrativo(adminId);
  if (!admin) return "";

  if (admin.persona?.nombres) {
    return nombreCompleto(admin.persona);
  }

  return "";
}

// ── Servicio de Entrevista (API REAL) ─────────────────────────────────────────

export const entrevistaService = {
  /**
   * getAll: Reconstruye entrevistas con datos completos.
   *
   * ESTRATEGIA DE REQUESTS (ordenada por eficiencia):
   *
   * ASPIRANTE:
   *   entrevista.aspirante.persona != null → usar directamente (0 fetches)
   *   entrevista.aspirante.persona == null → POST /aspirante/list (1 fetch, cacheado)
   *
   * ENTREVISTADOR PRINCIPAL:
   *   entrevistador.administrativo viene null en /entrevista/listall, se resuelve
   *   desde la tabla de entrevistadores relacionados si existe, o bien:
   *   → POST /administrativo/list (1 fetch, cacheado)
   *
   * ENTREVISTADORES ADICIONALES:
   *   rel.administrativo.persona != null → usar directamente (0 fetches)
   *   rel.administrativo.persona == null → POST /administrativo/list (1 fetch, cacheado)
   *
   * ✗ NUNCA se llama a /persona/list — la persona viene embebida en aspirante/administrativo.
   */
  async getAll(page = 1, pageSize = 5): Promise<PaginatedResponse<Entrevista>> {

    // ── PASO 1: Obtener lista base de entrevistas y tabla de entrevistadores ───
    const [entrevistasRaw, entrevistadoresRelRaw] = await Promise.all([
      apiFetch<EntrevistaBackend[]>("/api/dev/endpoint/entrevista/listall"),
      apiFetch<EntrevistadoresBackend[]>("/api/dev/endpoint/entrevistadores/listall")
        .catch(() => [] as EntrevistadoresBackend[]),
    ]);

    // ── PASO 2: Indexar entrevistadores por entrevista.id ─────────────────────
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
        // Pasa la persona embebida en la entrevista raw (si existe) para evitar
        // el fetch a /aspirante/list cuando los datos ya están disponibles.
        let aspiranteNombre = "";
        const aspiranteId = e.aspirante?.id;
        if (aspiranteId) {
          aspiranteNombre = await resolverNombreAspirante(
            aspiranteId,
            e.aspirante?.persona   // puede ser null → el helper hace el fetch solo si es necesario
          );
        }

        // ── ENTREVISTADOR PRINCIPAL ───────────────────────────────────────────
        // entrevistador.administrativo llega null desde /entrevista/listall;
        // se intenta resolver desde la tabla de entrevistadores relacionados primero.
        let evaluadorNombre = "Sin asignar";
        const adminIdPrincipal = e.entrevistador?.administrativo?.id;
        const adminPersonaPrincipal = e.entrevistador?.administrativo?.persona;

        if (adminIdPrincipal) {
          const nombre = await resolverNombreAdministrativo(adminIdPrincipal, adminPersonaPrincipal);
          if (nombre) evaluadorNombre = nombre;
        }

        // ── ENTREVISTADORES ADICIONALES ───────────────────────────────────────
        // Pasa la persona embebida del registro de entrevistadores si existe
        // para evitar el fetch a /administrativo/list cuando ya está disponible.
        const relaciones = entrevistadoresPorEntrevista.get(e.id) ?? [];
        const entrevistadoresList: { id: number; nombre: string; administrativoId: number }[] = [];

        await Promise.all(
          relaciones.map(async (rel) => {
            const adminId = rel.administrativo?.id;
            if (!adminId) return;
            const nombre = await resolverNombreAdministrativo(
              adminId,
              rel.administrativo?.persona  // puede ser null → el helper hace el fetch si es necesario
            );
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
          evaluadorAdministrativoId: adminIdPrincipal ?? 0,
          evaluadorNombre,
          entrevistadores: entrevistadoresList,
          fecha: e.fecha ?? "",
          hora: e.tiempo ?? "",
          tipoEntrevistaId: e.tipoentrevista?.id ?? 0,
          tipoEntrevistaNombre: e.tipoentrevista?.nombre ?? "",
          estado: e.estado?.tipo ?? "",
          estadoId: e.estado?.id ?? 0,
          calificacion: e.calificacion ?? null,
          ubicacionId: e.ubicacion?.id ?? null,
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
    todosLosAdminIds: number[] = []
  ): Promise<EntrevistaBackend> {
    // Sanitizamos el payload: enviamos exactamente los campos del schema
    // ENTREVISTA_CREATE de Swagger. Los ids ausentes se envían como 0 (no null).
    const payload = {
      fecha: data.fecha,
      tiempo: data.tiempo || "00:00:00",
      idTipoentrevista: data.idTipoentrevista ?? 0,
      idEntrevistador: data.idEntrevistador ?? 0,
      idAspirante: data.idAspirante ?? 0,
      idEstado: data.idEstado ?? 0,
      idUbicacion: data.idUbicacion ?? 0,
    };

    const nueva = await apiFetch<EntrevistaBackend>(
      "/api/dev/endpoint/entrevista/create",
      { method: "POST", body: JSON.stringify(payload) }
    );

    // Crear registros en entrevistadores para TODOS (incluido el principal)
    await Promise.all(
      todosLosAdminIds.map((idAdmin) =>
        apiFetch("/api/dev/endpoint/entrevistadores/create", {
          method: "POST",
          body: JSON.stringify({ idEntrevista: nueva.id, idAdministrativo: idAdmin }),
        }).catch(() => null)
      )
    );

    _clearCache();
    return nueva;
  },

  async update(id: number, data: EntrevistaUpdatePayload): Promise<EntrevistaBackend> {
    const payload = {
      id,
      fecha: data.fecha,
      tiempo: data.tiempo || "00:00:00",
      calificacion: data.calificacion ?? 0,
      idTipoentrevista: data.idTipoentrevista ?? 0,
      idEntrevistador: data.idEntrevistador ?? 0,
      idAspirante: data.idAspirante ?? 0,
      idEstado: data.idEstado ?? 0,
      idUbicacion: data.idUbicacion ?? 0,
    };
    const result = await apiFetch<EntrevistaBackend>("/api/dev/endpoint/entrevista/update", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    _clearCache();
    return result;
  },

  /**
   * updateConEntrevistadores: Reagenda una entrevista y sincroniza la tabla entrevistadores.
   *
   * Lógica de diff:
   * - Nuevos adminIds que no estaban antes → POST /entrevistadores/create
   * - Registros de entrevistadores cuyo adminId ya no aparece → DELETE /entrevistadores/delete
   * - El principal se actualiza en la entrevista vía idEntrevistador
   */
  async updateConEntrevistadores(
    entrevistaId: number,
    data: EntrevistaUpdatePayload,
    // Mapa de adminId → id_registro_entrevistadores (los que ya existían en el backend)
    entrevistadoresAnteriores: { id: number; administrativoId: number }[],
    // adminIds que el usuario dejó seleccionados ahora
    nuevosAdminIds: number[]
  ): Promise<EntrevistaBackend> {
    // 1. Actualizar la entrevista principal con TODOS los campos requeridos por
    //    el schema ENTREVISTA_UPDATE (sin null, faltantes como 0).
    const payload = {
      id: entrevistaId,
      fecha: data.fecha,
      tiempo: data.tiempo || "00:00:00",
      calificacion: data.calificacion ?? 0,
      idTipoentrevista: data.idTipoentrevista ?? 0,
      idEntrevistador: data.idEntrevistador ?? 0,
      idAspirante: data.idAspirante ?? 0,
      idEstado: data.idEstado ?? 0,
      idUbicacion: data.idUbicacion ?? 0,
    };
    const result = await apiFetch<EntrevistaBackend>("/api/dev/endpoint/entrevista/update", {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const prevAdminIds = new Set(entrevistadoresAnteriores.map((e) => e.administrativoId));
    const nextAdminIds = new Set(nuevosAdminIds);

    // 2. Crear los que son nuevos (no estaban antes)
    const paraCrear = nuevosAdminIds.filter((id) => !prevAdminIds.has(id));
    await Promise.all(
      paraCrear.map((idAdmin) =>
        apiFetch("/api/dev/endpoint/entrevistadores/create", {
          method: "POST",
          body: JSON.stringify({ idEntrevista: entrevistaId, idAdministrativo: idAdmin }),
        }).catch(() => null)
      )
    );

    // 3. Eliminar los que ya no están
    const paraEliminar = entrevistadoresAnteriores.filter(
      (e) => !nextAdminIds.has(e.administrativoId)
    );
    await Promise.all(
      paraEliminar.map((e) =>
        apiFetch("/api/dev/endpoint/entrevistadores/delete", {
          method: "DELETE",
          body: JSON.stringify({ id: e.id }),
        }).catch(() => null)
      )
    );

    _clearCache();
    return result;
  },

  /**
   * Obtiene los registros de la tabla entrevistadores filtrados por idEntrevista.
   * Retorna un array con id (de la tabla entrevistadores) y administrativoId.
   */
  async getEntrevistadoresPorEntrevista(
    entrevistaId: number
  ): Promise<{ id: number; administrativoId: number; nombre: string }[]> {
    const todos = await apiFetch<EntrevistadoresBackend[]>(
      "/api/dev/endpoint/entrevistadores/listall"
    );
    const filtrados = todos.filter((r) => r.entrevista?.id === entrevistaId);
    const results: { id: number; administrativoId: number; nombre: string }[] = [];
    await Promise.all(
      filtrados.map(async (r) => {
        const adminId = r.administrativo?.id;
        if (!adminId) return;
        const nombre = await resolverNombreAdministrativo(adminId, r.administrativo?.persona);
        results.push({ id: r.id, administrativoId: adminId, nombre });
      })
    );
    return results;
  },

  /**
   * Eliminación en cascada:
   *   1) Borra TODOS los registros en la tabla entrevistadores cuyo
   *      idEntrevista coincida (no se puede dejar huérfanos por FK).
   *   2) Borra la entrevista.
   *
   * El backend responde body vacío en DELETE; apiFetch lo maneja.
   */
  async delete(id: number): Promise<void> {
    // 1) Buscar los registros relacionados en la tabla entrevistadores
    const relacionados = await apiFetch<EntrevistadoresBackend[]>(
      "/api/dev/endpoint/entrevistadores/listall"
    ).catch(() => [] as EntrevistadoresBackend[]);

    const aBorrar = relacionados.filter((r) => r.entrevista?.id === id);

    // 2) Eliminar los registros de entrevistadores en paralelo
    await Promise.all(
      aBorrar.map((r) =>
        apiFetch("/api/dev/endpoint/entrevistadores/delete", {
          method: "DELETE",
          body: JSON.stringify({ id: r.id }),
        }).catch(() => null)
      )
    );

    // 3) Finalmente eliminar la entrevista
    await apiFetch<void>("/api/dev/endpoint/entrevista/delete", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    _clearCache();
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
    // Para cada entrevistador devolvemos:
    //   id              → administrativo.id (lo que se selecciona en la UI)
    //   entrevistadorId → entrevistador.id  (se usa como idEntrevistador en la entrevista)
    // Filtramos los que no tengan administrativo válido.
    return data
      .filter((e) => e.administrativo?.id)
      .map((e) => ({
        id: e.administrativo!.id,
        entrevistadorId: e.id,
        nombre: nombreCompleto(e.administrativo!.persona ?? ({} as PersonaBackend)),
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