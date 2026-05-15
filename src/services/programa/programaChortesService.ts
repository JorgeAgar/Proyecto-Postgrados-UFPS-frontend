/*
  programaChortesService.ts
  Servicio para el módulo Cohortes de Programa.
  - Usa VITE_API_URL del .env
  - Incluye fallback mock para desarrollo
  - Endpoints actuales son placeholders para reemplazar con backend real
*/

const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

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

export async function fetchCohortes(programaId: string | number): Promise<CohorteItem[]> {
  const url = `${API_BASE}/api/dev/endpoint/programa/${programaId}/cohortes`;
  return tryFetch<CohorteItem[]>(url, { method: 'GET' }, MOCK_COHORTES);
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
  Endpoints backend requeridos para reemplazar mocks:

  1) GET /api/dev/endpoint/programa/:programaId/cohortes
     - Lista cohortes del programa.
     - Respuesta: CohorteItem[]

  2) GET /api/dev/endpoint/cohorte/:cohorteId
     - Devuelve detalle completo de cohorte con criterios, inscritos y admitidos.
     - Respuesta: CohorteDetalle

  3) POST /api/dev/endpoint/programa/:programaId/cohortes
     - Crea una nueva cohorte.
     - Body: { fechaInicio, cupos, fechaLimiteDocumentos, fechaLimitePago }
     - Respuesta: CohorteItem

  4) PUT /api/dev/endpoint/cohorte/:cohorteId
     - Actualiza datos de cohorte activa.
     - Body parcial permitido: { cupos, fechaLimiteDocumentos, fechaLimitePago, fechaInicio }
     - Respuesta: CohorteItem actualizado

  Requisitos de backend:
  - Autenticacion por token y autorizacion por programa.
  - Validar que solo cohortes activas se puedan editar (segun regla de negocio).
  - Enviar fechas idealmente ISO y frontend formatea para UI.
  - Errores estandar: 400/401/403/404/409/500 con mensaje legible.
*/

export default {
  fetchCohortes,
  fetchCohorteDetalle,
  createCohorte,
  updateCohorte,
};
