/*
  programaChortesService.ts
  Servicio para el módulo Cohortes de Programa.
  - Usa VITE_API_URL del .env
  - Incluye fallback mock para desarrollo
  - Endpoints actuales son placeholders para reemplazar con backend real
*/

import { programaApiFetch } from './programaService';

export interface CohorteItem {
  id: string;
  nombre: string;
  activa: boolean;
  semestre: string;
  cupos: number;
  fechaLimiteDocs: string;
  fechaLimiteInscripcion: string;
  totalInscritos: number;
  totalValidados: number;
  totalAdmitidos: number;
  inscritos?: number;
  admitidos?: number;
  fechaLimiteDocumentos?: string;
  fechaLimitePago?: string;
  fechaInicio?: string;
  documentos?: DocumentoCohorte[];
}

export interface DocumentoCohorte {
  nombre: string;
  obligatorio: boolean;
}

export interface AspiranteItem {
  id: string;
  nombre: string;
  cedula: string;
  correo: string;
}

export interface CriterioItem {
  nombre: string;
  peso: number;
}

export interface CohorteDetalle extends CohorteItem {
  criterios: CriterioItem[];
  inscritosData: AspiranteItem[];
  admitidosData: AspiranteItem[];
}

export interface NuevaCohortePayload {
  nombre: string;
  fechaInicio: string;
  cupos: number;
  fechaLimiteDocumentos: string;
  fechaLimitePago: string;
  documentos?: DocumentoCohorte[];
}

// Using `programaApiFetch` for authenticated requests; removing mock fallbacks for implemented methods.

export async function fetchCohortes(idUsuario: string | number): Promise<CohorteItem[]> {
  // 1) Obtener programaId desde el endpoint director-programa
  const directorPath = `/api/application/case/director-programa/programa/director/${idUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });

  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }

  if (!programaId) throw new Error('No se pudo resolver programaId desde el endpoint director-programa.');

  // 2) Solicitar cohortes usando el programaId obtenido
  const path = `/api/application/case/director-programa/programa/${programaId}/cohortes`;
  const data = await programaApiFetch<unknown[]>(path, { method: 'GET' });
  const normalized = data.map((item) => {
    const cohorte = item as Record<string, unknown>;
    return {
      id: String(cohorte.id ?? ''),
      nombre: String(cohorte.nombre ?? ''),
      activa: Boolean(cohorte.activa),
      semestre: String(cohorte.semestre ?? ''),
      cupos: Number(cohorte.cupos ?? 0),
      fechaLimiteDocs: String(cohorte.fechaLimiteDocs ?? cohorte.fechaLimiteDocumentos ?? ''),
      fechaLimiteInscripcion: String(cohorte.fechaLimiteInscripcion ?? cohorte.fechaLimitePago ?? ''),
      totalInscritos: Number(cohorte.totalInscritos ?? cohorte.inscritos ?? 0),
      totalValidados: Number(cohorte.totalValidados ?? 0),
      totalAdmitidos: Number(cohorte.totalAdmitidos ?? cohorte.admitidos ?? 0),
      inscritos: cohorte.inscritos !== undefined ? Number(cohorte.inscritos) : undefined,
      admitidos: cohorte.admitidos !== undefined ? Number(cohorte.admitidos) : undefined,
      fechaLimiteDocumentos: cohorte.fechaLimiteDocumentos !== undefined ? String(cohorte.fechaLimiteDocumentos) : undefined,
      fechaLimitePago: cohorte.fechaLimitePago !== undefined ? String(cohorte.fechaLimitePago) : undefined,
      fechaInicio: cohorte.fechaInicio !== undefined ? String(cohorte.fechaInicio) : undefined,
      documentos: Array.isArray(cohorte.documentos)
        ? cohorte.documentos.map((doc) => {
            const documento = doc as Record<string, unknown>;
            return {
              nombre: String(documento.nombre ?? ''),
              obligatorio: Boolean(documento.obligatorio),
            };
          })
        : undefined,
    } as CohorteItem;
  });
  normalized.sort((a, b) => {
    if (a.activa !== b.activa) return a.activa ? -1 : 1;
    const aDate = a.fechaInicio ? new Date(a.fechaInicio).getTime() : Number.MAX_SAFE_INTEGER;
    const bDate = b.fechaInicio ? new Date(b.fechaInicio).getTime() : Number.MAX_SAFE_INTEGER;
    return aDate - bDate;
  });
  console.log('[programaChortesService] fetchCohortes response:', normalized);
  return normalized;
}

export async function fetchCohorteDetalle(cohorteId: string): Promise<CohorteDetalle> {
  const path = `/api/application/case/director-programa/cohorte/${cohorteId}`;
  const data = await programaApiFetch<unknown>(path, { method: 'GET' });
  const cohorte = data as Record<string, unknown>;
  return {
    id: String(cohorte.id ?? cohorte._id ?? cohorte.cohorteId ?? cohorteId),
    nombre: String(cohorte.nombre ?? ''),
    activa: Boolean(cohorte.activa),
    semestre: String(cohorte.semestre ?? ''),
    cupos: Number(cohorte.cupos ?? 0),
    fechaLimiteDocs: String(cohorte.fechaLimiteDocs ?? cohorte.fechaLimiteDocumentos ?? ''),
    fechaLimiteInscripcion: String(cohorte.fechaLimiteInscripcion ?? cohorte.fechaLimitePago ?? ''),
    totalInscritos: Number(cohorte.totalInscritos ?? cohorte.inscritos ?? 0),
    totalValidados: Number(cohorte.totalValidados ?? 0),
    totalAdmitidos: Number(cohorte.totalAdmitidos ?? cohorte.admitidos ?? 0),
    inscritos: cohorte.inscritos !== undefined ? Number(cohorte.inscritos) : undefined,
    admitidos: cohorte.admitidos !== undefined ? Number(cohorte.admitidos) : undefined,
    fechaLimiteDocumentos: cohorte.fechaLimiteDocumentos !== undefined ? String(cohorte.fechaLimiteDocumentos) : undefined,
    fechaLimitePago: cohorte.fechaLimitePago !== undefined ? String(cohorte.fechaLimitePago) : undefined,
    fechaInicio: cohorte.fechaInicio !== undefined ? String(cohorte.fechaInicio) : undefined,
    documentos: Array.isArray(cohorte.documentos)
      ? cohorte.documentos.map((doc) => {
          const documento = doc as Record<string, unknown>;
          return {
            nombre: String(documento.nombre ?? ''),
            obligatorio: Boolean(documento.obligatorio),
          };
        })
      : [],
    criterios: Array.isArray(cohorte.criterios)
      ? cohorte.criterios.map((crit) => {
          const criterio = crit as Record<string, unknown>;
          return { nombre: String(criterio.nombre ?? ''), peso: Number(criterio.peso ?? 0) };
        })
      : [],
    inscritosData: Array.isArray(cohorte.inscritosData)
      ? cohorte.inscritosData.map((inscrito) => {
          const item = inscrito as Record<string, unknown>;
          return {
            id: String(item.id ?? ''),
            nombre: String(item.nombre ?? ''),
            cedula: String(item.cedula ?? ''),
            correo: String(item.correo ?? ''),
          };
        })
      : [],
    admitidosData: Array.isArray(cohorte.admitidosData)
      ? cohorte.admitidosData.map((admitido) => {
          const item = admitido as Record<string, unknown>;
          return {
            id: String(item.id ?? ''),
            nombre: String(item.nombre ?? ''),
            cedula: String(item.cedula ?? ''),
            correo: String(item.correo ?? ''),
          };
        })
      : [],
  };
}

export async function createCohorte(programaIdOrUsuario: string | number, payload: NuevaCohortePayload): Promise<CohorteItem> {
  // Resolve programaId from director endpoint if caller passed a userId
  const directorPath = `/api/application/case/director-programa/programa/director/${programaIdOrUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });
  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo resolver programaId desde el endpoint director-programa.');

  const path = `/api/application/case/director-programa/programa/${programaId}/cohortes`;
  const created = await programaApiFetch<CohorteItem>(path, { method: 'POST', body: JSON.stringify(payload) });
  return created;
}

export async function updateCohorte(cohorteId: string, payload: Partial<NuevaCohortePayload & { cupos: number; activa: boolean }>): Promise<CohorteItem> {
  const path = `/api/application/case/director-programa/cohorte/${cohorteId}`;
  const updated = await programaApiFetch<CohorteItem>(path, { method: 'PUT', body: JSON.stringify(payload) });
  return updated;
}

/*
  ============================================================================
  ESPECIFICACION BACKEND - COHORTES (DETALLADA)
  ============================================================================

  Base URL:
  - import.meta.env.VITE_API_URL

  Headers requeridos:
  - Authorization: Bearer <access_token>
  - Content-Type: application/json (POST/PUT)

  Formato de error recomendado (comun para todos):
  {
    "success": false,
    "message": "Mensaje legible para UI/logs",
    "errorCode": "COHORTE_NOT_FOUND",
    "details": { "field": "valor opcional" }
  }

  ----------------------------------------------------------------------------
  1) LISTAR COHORTES
  ----------------------------------------------------------------------------
  GET /api/dev/endpoint/programa/:programaId/cohortes

  Path params:
  - programaId: string | number

  200 OK (respuesta esperada):
  [
    {
      "id": "1",
      "nombre": "Cohorte-3 2025-1",
      "activa": true,
      "inscritos": 45,
      "admitidos": 0,
      "cupos": 30,
      "fechaLimiteDocumentos": "2026-05-15",
      "fechaLimitePago": "2026-05-20",
      "fechaInicio": "2026-06-01"
    }
  ]

  Notas:
  - `admitidos` puede omitirse en cohortes activas.
  - Fechas idealmente en ISO (YYYY-MM-DD). El frontend puede formatear.

  ----------------------------------------------------------------------------
  2) DETALLE DE COHORTE
  ----------------------------------------------------------------------------
  GET /api/dev/endpoint/cohorte/:cohorteId

  Path params:
  - cohorteId: string

  200 OK (respuesta esperada):
  {
    "id": "1",
    "nombre": "Cohorte-3 2025-1",
    "activa": true,
    "inscritos": 45,
    "admitidos": 0,
    "cupos": 30,
    "fechaLimiteDocumentos": "2026-05-15",
    "fechaLimitePago": "2026-05-20",
    "fechaInicio": "2026-06-01",
    "criterios": [
      { "nombre": "Promedio academico de pregrado", "peso": 25 },
      { "nombre": "Experiencia laboral", "peso": 20 }
    ],
    "inscritosData": [
      {
        "id": "asp-1",
        "nombre": "Juan Perez Garcia",
        "cedula": "1098765432",
        "correo": "juan.perez@email.com"
      }
    ],
    "admitidosData": [
      {
        "id": "asp-10",
        "nombre": "Roberto Jimenez Vargas",
        "cedula": "1098234765",
        "correo": "roberto.jimenez@email.com"
      }
    ]
  }

  Notas:
  - Si la cohorte esta activa, `admitidosData` puede ser [].
  - Validar que suma de `criterios.peso` sea 100 (regla de negocio sugerida).

  ----------------------------------------------------------------------------
  3) CREAR COHORTE
  ----------------------------------------------------------------------------
  POST /api/dev/endpoint/programa/:programaId/cohortes

  Path params:
  - programaId: string | number

  Body (request esperado):
  {
    "nombre": "Cohorte-30 2026-2",
    "fechaInicio": "2026-06-01",
    "cupos": 30,
    "fechaLimiteDocumentos": "2026-05-15",
    "fechaLimitePago": "2026-05-20",
    "documentos": [
      { "nombre": "Cédula", "obligatorio": true }
    ]
  }

  201 Created (respuesta esperada):
  {
    "id": "4",
    "nombre": "Cohorte-4 2026-1",
    "activa": true,
    "inscritos": 0,
    "cupos": 30,
    "fechaLimiteDocumentos": "2026-05-15",
    "fechaLimitePago": "2026-05-20",
    "fechaInicio": "2026-06-01"
  }

  Validaciones sugeridas:
  - `cupos` > 0
  - `fechaLimiteDocumentos` <= `fechaLimitePago` <= `fechaInicio`
  - Evitar dos cohortes activas simultaneas para mismo programa (si aplica)

  ----------------------------------------------------------------------------
  4) ACTUALIZAR COHORTE
  ----------------------------------------------------------------------------
  PUT /api/application/case/director-programa/cohorte/:cohorteId

  Path params:
  - cohorteId: string

  Body parcial permitido (request esperado):
  {
    "nombre": "Cohorte-30 2026-2",
    "cupos": 35,
    "fechaLimiteDocumentos": "2026-05-18",
    "fechaLimitePago": "2026-05-23",
    "fechaInicio": "2026-06-03",
    "activa": false,
    "documentos": [
      { "nombre": "Cédula", "obligatorio": true }
    ]
  }

  200 OK (respuesta esperada):
  {
    "id": "1",
    "nombre": "Cohorte-3 2025-1",
    "activa": true,
    "inscritos": 45,
    "cupos": 35,
    "fechaLimiteDocumentos": "2026-05-18",
    "fechaLimitePago": "2026-05-23",
    "fechaInicio": "2026-06-03"
  }

  Regla sugerida:
  - Solo permitir editar cohortes activas (409/422 si no cumple).
  - Para abrir/cerrar cohorte, el backend puede aceptar `activa: true|false` en este mismo endpoint o exponer acciones dedicadas `POST /cohorte/:id/abrir` y `POST /cohorte/:id/cerrar`.
  - No permitir dos cohortes activas simultáneas del mismo programa.

  ----------------------------------------------------------------------------
  CODIGOS HTTP RECOMENDADOS
  ----------------------------------------------------------------------------
  - 200 OK: consulta/actualizacion exitosa
  - 201 Created: creacion exitosa
  - 400 Bad Request: payload invalido
  - 401 Unauthorized: token invalido/no enviado
  - 403 Forbidden: sin permisos sobre programa/cohorte
  - 404 Not Found: programa/cohorte no existe
  - 409 Conflict: regla de negocio incumplida (ej. cohorte no editable)
  - 422 Unprocessable Entity: validacion semantica
  - 500 Internal Server Error: error no controlado
*/

export default {
  fetchCohortes,
  fetchCohorteDetalle,
  createCohorte,
  updateCohorte,
};
