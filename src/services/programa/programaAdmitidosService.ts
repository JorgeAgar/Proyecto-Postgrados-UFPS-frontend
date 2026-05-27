/*
  programaAdmitidosService.ts
  Servicio para la pantalla de admitidos/ranking del módulo Programa.
  - Usa VITE_API_URL
  - Usa el backend real sin mocks de fallback
  - Las rutas son placeholders hasta que el backend real esté disponible
*/

import { programaApiFetch, getProgramaRealId } from './programaService';

export type FiltroAdmision = 'todos' | 'admitidos' | 'porAdmitir';

export interface CohorteAdmitidosResumen {
  id: string;
  nombre: string;
  activa: boolean;
  cuposDisponibles: number;
  totalAdmitidos: number;
}

export interface AspiranteRankingItem {
  id: string;
  nombre: string;
  correo: string;
  puntaje: number;
  ranking: number;
  admitido: boolean;
  completamenteCalificado: boolean;
}

export interface AdmitidosRankingResponse {
  cohorteActual: CohorteAdmitidosResumen;
  aspirantes: AspiranteRankingItem[];
}

function normalizeRankingResponse(data: unknown): AdmitidosRankingResponse {
  const response = data as Record<string, unknown>;
  const cohorte = (response.cohorteActual ?? {}) as Record<string, unknown>;
  const aspirantesRaw = Array.isArray(response.aspirantes) ? response.aspirantes : [];

  const aspirantes = aspirantesRaw
    .map((item, index) => {
      const aspirante = item as Record<string, unknown>;
      return {
        id: String(aspirante.id ?? index),
        nombre: String(aspirante.nombre ?? ''),
        correo: String(aspirante.correo ?? ''),
        puntaje: Number(aspirante.puntaje ?? 0),
        ranking: Number(aspirante.ranking ?? index + 1),
        admitido: Boolean(aspirante.admitido),
        completamenteCalificado: Boolean(aspirante.completamenteCalificado ?? true),
      } satisfies AspiranteRankingItem;
    })
    .sort((a, b) => b.puntaje - a.puntaje)
    .map((aspirante, index) => ({ ...aspirante, ranking: index + 1 }));

  return {
    cohorteActual: {
      id: String(cohorte.id ?? ''),
      nombre: String(cohorte.nombre ?? ''),
      activa: Boolean(cohorte.activa),
      cuposDisponibles: Number(cohorte.cuposDisponibles ?? 0),
      totalAdmitidos: Number(cohorte.totalAdmitidos ?? 0),
    },
    aspirantes,
  };
}

export async function fetchRankingAdmitidos(): Promise<AdmitidosRankingResponse> {
  const programaId = await getProgramaRealId();
  const url = `/api/application/case/director-programa/programa/${programaId}/admitidos/ranking`;
  const data = await programaApiFetch<unknown>(url, { method: 'GET' });
  return normalizeRankingResponse(data);
}

export async function fetchRankingAdmitidosByCohorte(cohorteId: string): Promise<AdmitidosRankingResponse> {
  const url = `/api/application/case/director-programa/cohorte/${cohorteId}/admitidos/ranking`;
  const data = await programaApiFetch<unknown>(url, { method: 'GET' });
  return normalizeRankingResponse(data);
}

export async function admitirAspirante(cohorteId: string, aspiranteId: string): Promise<{ success: boolean; aspiranteId: string; admitido: boolean }> {
  const url = `/api/application/case/director-programa/cohorte/${cohorteId}/admitidos/${aspiranteId}`;
  return programaApiFetch<{ success: boolean; aspiranteId: string; admitido: boolean }>(url, {
    method: 'POST',
    body: JSON.stringify({ admitido: true }),
  });
}

export async function revertirAdmision(cohorteId: string, aspiranteId: string): Promise<{ success: boolean; aspiranteId: string; admitido: boolean }> {
  const url = `/api/application/case/director-programa/cohorte/${cohorteId}/admitidos/${aspiranteId}`;
  return programaApiFetch<{ success: boolean; aspiranteId: string; admitido: boolean }>(url, {
    method: 'POST',
    body: JSON.stringify({ admitido: false }),
  });
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
    "errorCode": "ADMITIDO_ALREADY_EXISTS",
    "details": { "aspiranteId": "1" }
  }

  1) GET /api/application/case/director-programa/programa/:programaId/admitidos/ranking
     200 OK:
     {
       "cohorteActual": {
         "id": 0,
         "nombre": "string",
         "activa": true,
         "cuposDisponibles": 0,
         "totalAdmitidos": 0
       },
       "aspirantes": [
         {
           "id": 0,
           "nombre": "string",
           "correo": "string",
           "puntaje": 0,
           "admitido": true
         }
       ]
     }

  Notas:
  - El frontend ordena `aspirantes` por `puntaje` descendente al recibir la respuesta.
  - `ranking` se recalcula en el frontend según ese orden.
  - Si el backend no envía `completamenteCalificado`, se asume `true` por compatibilidad.

  2) POST /api/application/case/director-programa/programa/:programaId/admitidos/:aspiranteId
     - Admite o revierte la admisión del aspirante según el body.
     - Body sugerido:
       { "admitido": true }
     200/201 OK:
       { "success": true, "aspiranteId": "1", "admitido": true }

     - Para revertir la admisión enviar:
       { "admitido": false }
     200 OK:
       { "success": true, "aspiranteId": "1", "admitido": false }

  Reglas de negocio sugeridas:
  - Solo aspirantes con `completamenteCalificado = true` pueden aparecer en el ranking.
  - `ranking` debe venir ordenado por `puntaje` descendente.
  - No permitir exceder `cuposDisponibles` al admitir.
  - Si la cohorte está cerrada o no activa, devolver 409/422.
  - Registrar auditoría de quién admitió/revirtió la admisión.
*/

export default {
  fetchRankingAdmitidos,
  admitirAspirante,
  revertirAdmision,
};
