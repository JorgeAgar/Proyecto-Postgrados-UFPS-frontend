/*
  programaChortesService.ts
  Servicio para el módulo Cohortes de Programa.
  - Usa VITE_API_URL del .env
  - Incluye fallback mock para desarrollo
  - Endpoints actuales son placeholders para reemplazar con backend real
*/

const API_BASE = (import.meta.env.VITE_API_URL as string) || '';
import { programaApiFetch } from './programaService';

export interface CohorteItem {
  id: string;
  nombre: string;
  activa: boolean;
  inscritos: number;
  admitidos?: number;
  cupos?: number;
  fechaLimiteDocumentos?: string;
  fechaLimitePago?: string;
  fechaInicio: string;
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
  fechaInicio: string;
  cupos: number;
  fechaLimiteDocumentos: string;
  fechaLimitePago: string;
}

const MOCK_COHORTES: CohorteItem[] = [
  {
    id: '1',
    nombre: 'Cohorte-3 2025-1',
    activa: true,
    inscritos: 45,
    cupos: 30,
    fechaLimiteDocumentos: '15/05/2026',
    fechaLimitePago: '20/05/2026',
    fechaInicio: '01/06/2026',
  },
  {
    id: '2',
    nombre: 'Cohorte-2 2024-2',
    activa: false,
    inscritos: 38,
    admitidos: 32,
    fechaLimiteDocumentos: '10/07/2024',
    fechaLimitePago: '15/07/2024',
    fechaInicio: '01/08/2024',
  },
  {
    id: '3',
    nombre: 'Cohorte-1 2024-1',
    activa: false,
    inscritos: 42,
    admitidos: 35,
    fechaLimiteDocumentos: '10/01/2024',
    fechaLimitePago: '15/01/2024',
    fechaInicio: '01/02/2024',
  },
];

const MOCK_CRITERIOS: CriterioItem[] = [
  { nombre: 'Promedio academico de pregrado', peso: 25 },
  { nombre: 'Experiencia laboral', peso: 20 },
  { nombre: 'Produccion academica', peso: 15 },
  { nombre: 'Carta de motivacion', peso: 15 },
  { nombre: 'Referencias academicas', peso: 15 },
  { nombre: 'Entrevista', peso: 10 },
];

const MOCK_INSCRITOS: AspiranteItem[] = [
  { id: '1', nombre: 'Juan Perez Garcia', cedula: '1098765432', correo: 'juan.perez@email.com' },
  { id: '2', nombre: 'Maria Gonzalez Lopez', cedula: '1065432109', correo: 'maria.gonzalez@email.com' },
  { id: '3', nombre: 'Carlos Rodriguez Martinez', cedula: '1087654321', correo: 'carlos.rodriguez@email.com' },
  { id: '4', nombre: 'Ana Fernandez Sanchez', cedula: '1076543210', correo: 'ana.fernandez@email.com' },
  { id: '5', nombre: 'Luis Martinez Torres', cedula: '1098234567', correo: 'luis.martinez@email.com' },
];

const MOCK_ADMITIDOS: AspiranteItem[] = [
  { id: '1', nombre: 'Roberto Jimenez Vargas', cedula: '1098234765', correo: 'roberto.jimenez@email.com' },
  { id: '2', nombre: 'Diana Carolina Morales', cedula: '1087234561', correo: 'diana.morales@email.com' },
  { id: '3', nombre: 'Andres Felipe Castro', cedula: '1076234512', correo: 'andres.castro@email.com' },
];

async function tryFetch<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text && fallback !== undefined) return fallback;
    return JSON.parse(text) as T;
  } catch (error) {
    console.warn('[programaChortesService] request failed, returning mock', url, error);
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

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
  const data = await programaApiFetch<CohorteItem[]>(path, { method: 'GET' });
  console.log('[programaChortesService] fetchCohortes response:', data);
  return data;
}

export async function fetchCohorteDetalle(cohorteId: string): Promise<CohorteDetalle> {
  const url = `${API_BASE}/api/dev/endpoint/cohorte/${cohorteId}`;
  const base = MOCK_COHORTES.find(c => c.id === cohorteId) || MOCK_COHORTES[0];
  const fallback: CohorteDetalle = {
    ...base,
    criterios: MOCK_CRITERIOS,
    inscritosData: MOCK_INSCRITOS,
    admitidosData: base.activa ? [] : MOCK_ADMITIDOS,
  };
  return tryFetch<CohorteDetalle>(url, { method: 'GET' }, fallback);
}

export async function createCohorte(programaId: string | number, payload: NuevaCohortePayload): Promise<CohorteItem> {
  const url = `${API_BASE}/api/dev/endpoint/programa/${programaId}/cohortes`;
  const fallback: CohorteItem = {
    id: String(Date.now()),
    nombre: `Cohorte-${Math.floor(Math.random() * 10) + 4} 2026-1`,
    activa: true,
    inscritos: 0,
    cupos: payload.cupos,
    fechaLimiteDocumentos: payload.fechaLimiteDocumentos,
    fechaLimitePago: payload.fechaLimitePago,
    fechaInicio: payload.fechaInicio,
  };
  return tryFetch<CohorteItem>(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    fallback,
  );
}

export async function updateCohorte(cohorteId: string, payload: Partial<NuevaCohortePayload & { cupos: number }>): Promise<CohorteItem> {
  const url = `${API_BASE}/api/dev/endpoint/cohorte/${cohorteId}`;
  const base = MOCK_COHORTES.find(c => c.id === cohorteId) || MOCK_COHORTES[0];
  const fallback: CohorteItem = {
    ...base,
    fechaInicio: payload.fechaInicio ?? base.fechaInicio,
    cupos: payload.cupos ?? base.cupos,
    fechaLimiteDocumentos: payload.fechaLimiteDocumentos ?? base.fechaLimiteDocumentos,
    fechaLimitePago: payload.fechaLimitePago ?? base.fechaLimitePago,
  };
  return tryFetch<CohorteItem>(
    url,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    fallback,
  );
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
    "fechaInicio": "2026-06-01",
    "cupos": 30,
    "fechaLimiteDocumentos": "2026-05-15",
    "fechaLimitePago": "2026-05-20"
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
  PUT /api/dev/endpoint/cohorte/:cohorteId

  Path params:
  - cohorteId: string

  Body parcial permitido (request esperado):
  {
    "cupos": 35,
    "fechaLimiteDocumentos": "2026-05-18",
    "fechaLimitePago": "2026-05-23",
    "fechaInicio": "2026-06-03"
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
