/*
  programaCriteriosService.ts
  Servicio de criterios de evaluación para la cohorte actual del programa.
  - Base URL: VITE_API_URL
  - Fallback mock en entorno de desarrollo
  - Contrato pensado para reemplazarse por backend real
*/

import { programaApiFetch } from './programaService';

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

// NOTE: Removed mock response for fetchCriteriosCohorteActual — backend should provide real data.

// Note: legacy tryFetch and MOCK responses removed; service uses `programaApiFetch` and propagates errors.
export async function fetchCriteriosCohorteActual(idUsuario: string | number): Promise<CriteriosCohorteActualResponse> {
  // 1) Resolve programaId from director endpoint
  const directorPath = `/api/application/case/director-programa/programa/director/${idUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });

  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo obtener programaId desde el endpoint de director-programa.');

  // 2) Fetch criterios for cohorte actual
  const path = `/api/application/case/director-programa/programa/${programaId}/cohorte-actual/criterios`;
  const data = await programaApiFetch<CriteriosCohorteActualResponse>(path, { method: 'GET' });
  return data;
}

export async function fetchCriteriosPrograma(idUsuario: string | number): Promise<CriterioEvaluacion[]> {
  const directorPath = `/api/application/case/director-programa/programa/director/${idUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });

  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo obtener programaId desde el endpoint de director-programa.');

  const path = `/api/application/case/director-programa/programa/${programaId}/criterios`;
  const data = await programaApiFetch<CriterioEvaluacion[]>(path, { method: 'GET' });
  return data;
}

export async function createCriterioPrograma(programaIdOrUsuario: string | number, payload: CriterioPayload): Promise<CriterioEvaluacion> {
  const directorPath = `/api/application/case/director-programa/programa/director/${programaIdOrUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });
  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo obtener programaId desde el endpoint de director-programa.');

  const path = `/api/application/case/director-programa/programa/${programaId}/criterios`;
  const created = await programaApiFetch<CriterioEvaluacion>(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return created;
}

export async function updateCriterioPrograma(programaIdOrUsuario: string | number, criterioId: string, payload: CriterioPayload): Promise<CriterioEvaluacion> {
  const directorPath = `/api/application/case/director-programa/programa/director/${programaIdOrUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });
  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo obtener programaId desde el endpoint de director-programa.');

  const path = `/api/application/case/director-programa/programa/${programaId}/criterios/${criterioId}`;
  const updated = await programaApiFetch<CriterioEvaluacion>(path, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return updated;
}

export async function deleteCriterioPrograma(programaIdOrUsuario: string | number, criterioId: string): Promise<{ success: boolean }> {
  const directorPath = `/api/application/case/director-programa/programa/director/${programaIdOrUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });
  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo obtener programaId desde el endpoint de director-programa.');

  const path = `/api/application/case/director-programa/programa/${programaId}/criterios/${criterioId}`;
  await programaApiFetch<void>(path, { method: 'DELETE' });
  return { success: true };
}

export async function saveCriteriosPrograma(programaIdOrUsuario: string | number, criterios: CriterioEvaluacion[]): Promise<{ success: boolean }> {
  const directorPath = `/api/application/case/director-programa/programa/director/${programaIdOrUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });
  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo obtener programaId desde el endpoint de director-programa.');

  const path = `/api/application/case/director-programa/programa/${programaId}/criterios/save`;
  await programaApiFetch<void>(path, { method: 'POST', body: JSON.stringify({ criterios }) });
  return { success: true };
}


export async function createCriterio(
  programaIdOrUsuario: string | number,
  cohorteId: string,
  payload: CriterioPayload,
): Promise<CriterioEvaluacion> {
  // Resolve programaId in the same way as other services: accept either programaId or idUsuario
  let programaId: number | string | undefined = undefined;
  // If caller passed a numeric-looking id, assume it's a programaId; otherwise resolve via director endpoint
  // We'll attempt to resolve via director endpoint to be robust (id may be userId)
  const directorPath = `/api/application/case/director-programa/programa/director/${programaIdOrUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo obtener programaId desde el endpoint de director-programa.');

  const path = `/api/application/case/director-programa/programa/${programaId}/cohorte/${cohorteId}/criterios`;
  const created = await programaApiFetch<CriterioEvaluacion>(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return created;
}

export async function updateCriterio(
  programaIdOrUsuario: string | number,
  cohorteId: string,
  criterioId: string,
  payload: CriterioPayload,
): Promise<CriterioEvaluacion> {
  const directorPath = `/api/application/case/director-programa/programa/director/${programaIdOrUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });
  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo obtener programaId desde el endpoint de director-programa.');

  const path = `/api/application/case/director-programa/programa/${programaId}/cohorte/${cohorteId}/criterios/${criterioId}`;
  const updated = await programaApiFetch<CriterioEvaluacion>(path, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return updated;
}

export async function deleteCriterio(programaIdOrUsuario: string | number, cohorteId: string, criterioId: string): Promise<{ success: boolean }> {
  const directorPath = `/api/application/case/director-programa/programa/director/${programaIdOrUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });
  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo obtener programaId desde el endpoint de director-programa.');

  const path = `/api/application/case/director-programa/programa/${programaId}/cohorte/${cohorteId}/criterios/${criterioId}`;
  await programaApiFetch<void>(path, { method: 'DELETE' });
  return { success: true };
}

export async function saveCriterios(
  programaIdOrUsuario: string | number,
  cohorteId: string,
  criterios: CriterioEvaluacion[],
): Promise<{ success: boolean }> {
  const directorPath = `/api/application/case/director-programa/programa/director/${programaIdOrUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });
  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo obtener programaId desde el endpoint de director-programa.');

  const path = `/api/application/case/director-programa/programa/${programaId}/cohorte/${cohorteId}/criterios/save`;
  await programaApiFetch<void>(path, { method: 'POST', body: JSON.stringify({ criterios }) });
  return { success: true };
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

  4) DELETE /api/application/case/director-programa/programa/:programaId/cohorte/:cohorteId/criterios/:criterioId
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
  fetchCriteriosPrograma,
  createCriterioPrograma,
  updateCriterioPrograma,
  deleteCriterioPrograma,
  saveCriteriosPrograma,
};
