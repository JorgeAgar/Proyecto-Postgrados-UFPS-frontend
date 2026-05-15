/*
  programaCriteriosService.ts
  Servicio de criterios de evaluación para la cohorte actual del programa.
  - Base URL: VITE_API_URL
  - Fallback mock en entorno de desarrollo
  - Contrato pensado para reemplazarse por backend real
*/

const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

export interface CohorteActualResumen {
  id: string;
  nombre: string;
  activa: boolean;
}

export interface CriterioEvaluacion {
  id: string;
  nombre: string;
  descripcion: string;
  peso: number;
}

export interface CriteriosCohorteActualResponse {
  cohorteActual: CohorteActualResumen;
  criterios: CriterioEvaluacion[];
}

export interface CriterioPayload {
  nombre: string;
  descripcion: string;
  peso: number;
}

const MOCK_RESPONSE: CriteriosCohorteActualResponse = {
  cohorteActual: {
    id: 'coh-actual-1',
    nombre: 'Cohorte-3 2025-1',
    activa: true,
  },
  criterios: [
    {
      id: '1',
      nombre: 'Promedio academico de pregrado',
      descripcion: 'Evaluacion del rendimiento academico durante la carrera de pregrado',
      peso: 25,
    },
    {
      id: '2',
      nombre: 'Experiencia laboral',
      descripcion: 'Anios de experiencia profesional en el area de estudio',
      peso: 20,
    },
    {
      id: '3',
      nombre: 'Produccion academica',
      descripcion: 'Publicaciones, ponencias y trabajos de investigacion',
      peso: 15,
    },
    {
      id: '4',
      nombre: 'Carta de motivacion',
      descripcion: 'Calidad y coherencia de la carta de motivacion presentada',
      peso: 15,
    },
    {
      id: '5',
      nombre: 'Referencias academicas',
      descripcion: 'Valoracion de las referencias academicas proporcionadas',
      peso: 10,
    },
    {
      id: '6',
      nombre: 'Entrevista',
      descripcion: 'Desempenio durante la entrevista con el comite de admision',
      peso: 10,
    },
  ],
};

async function tryFetch<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text && fallback !== undefined) return fallback;
    return JSON.parse(text) as T;
  } catch (error) {
    console.warn('[programaCriteriosService] request failed, using mock', url, error);
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

export async function fetchCriteriosCohorteActual(programaId: string | number): Promise<CriteriosCohorteActualResponse> {
  const url = `${API_BASE}/api/dev/endpoint/programa/${programaId}/cohorte-actual/criterios`;
  return tryFetch<CriteriosCohorteActualResponse>(url, { method: 'GET' }, MOCK_RESPONSE);
}

export async function createCriterio(
  programaId: string | number,
  cohorteId: string,
  payload: CriterioPayload,
): Promise<CriterioEvaluacion> {
  const url = `${API_BASE}/api/dev/endpoint/programa/${programaId}/cohorte/${cohorteId}/criterios`;
  const fallback: CriterioEvaluacion = { id: String(Date.now()), ...payload };
  return tryFetch<CriterioEvaluacion>(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    fallback,
  );
}

export async function updateCriterio(
  programaId: string | number,
  cohorteId: string,
  criterioId: string,
  payload: CriterioPayload,
): Promise<CriterioEvaluacion> {
  const url = `${API_BASE}/api/dev/endpoint/programa/${programaId}/cohorte/${cohorteId}/criterios/${criterioId}`;
  const fallback: CriterioEvaluacion = { id: criterioId, ...payload };
  return tryFetch<CriterioEvaluacion>(
    url,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    fallback,
  );
}

export async function deleteCriterio(programaId: string | number, cohorteId: string, criterioId: string): Promise<{ success: boolean }> {
  const url = `${API_BASE}/api/dev/endpoint/programa/${programaId}/cohorte/${cohorteId}/criterios/${criterioId}`;
  return tryFetch<{ success: boolean }>(url, { method: 'DELETE' }, { success: true });
}

export async function saveCriterios(
  programaId: string | number,
  cohorteId: string,
  criterios: CriterioEvaluacion[],
): Promise<{ success: boolean }> {
  const url = `${API_BASE}/api/dev/endpoint/programa/${programaId}/cohorte/${cohorteId}/criterios/save`;
  return tryFetch<{ success: boolean }>(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criterios }),
    },
    { success: true },
  );
}

/*
  ============================================================================
  CONTRATO BACKEND REQUERIDO (JSON + ENDPOINTS)
  ============================================================================

  Headers comunes:
  - Authorization: Bearer <token>
  - Content-Type: application/json

  Error recomendado:
  {
    "success": false,
    "message": "Descripcion legible",
    "errorCode": "CRITERIOS_INVALID_TOTAL",
    "details": { "total": 95 }
  }

  1) GET /api/dev/endpoint/programa/:programaId/cohorte-actual/criterios
     200 OK:
     {
       "cohorteActual": {
         "id": "coh-actual-1",
         "nombre": "Cohorte-3 2025-1",
         "activa": true
       },
       "criterios": [
         {
           "id": "1",
           "nombre": "Promedio academico de pregrado",
           "descripcion": "Evaluacion del rendimiento academico durante la carrera de pregrado",
           "peso": 25
         }
       ]
     }

  2) POST /api/dev/endpoint/programa/:programaId/cohorte/:cohorteId/criterios
     Body:
     {
       "nombre": "Entrevista",
       "descripcion": "Desempenio del aspirante en entrevista",
       "peso": 10
     }
     201 Created:
     {
       "id": "7",
       "nombre": "Entrevista",
       "descripcion": "Desempenio del aspirante en entrevista",
       "peso": 10
     }

  3) PUT /api/dev/endpoint/programa/:programaId/cohorte/:cohorteId/criterios/:criterioId
     Body:
     {
       "nombre": "Entrevista",
       "descripcion": "Entrevista con comite curricular",
       "peso": 12
     }
     200 OK:
     {
       "id": "7",
       "nombre": "Entrevista",
       "descripcion": "Entrevista con comite curricular",
       "peso": 12
     }

  4) DELETE /api/dev/endpoint/programa/:programaId/cohorte/:cohorteId/criterios/:criterioId
     200 OK:
     { "success": true }

  5) POST /api/dev/endpoint/programa/:programaId/cohorte/:cohorteId/criterios/save
     Body:
     {
       "criterios": [
         { "id": "1", "nombre": "...", "descripcion": "...", "peso": 25 }
       ]
     }
     200 OK:
     { "success": true }

  Regla de negocio obligatoria:
  - La suma total de pesos debe ser exactamente 100 al guardar.
  - Si no cumple, responder 409 o 422 con mensaje claro.
*/

export default {
  fetchCriteriosCohorteActual,
  createCriterio,
  updateCriterio,
  deleteCriterio,
  saveCriterios,
};
