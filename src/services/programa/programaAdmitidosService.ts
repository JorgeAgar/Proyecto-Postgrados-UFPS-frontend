/*
  programaAdmitidosService.ts
  Servicio para la pantalla de admitidos/ranking del módulo Programa.
  - Usa VITE_API_URL
  - Incluye datos mock para desarrollo si el backend no responde
  - Las rutas son placeholders hasta que el backend real esté disponible
*/

const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

export type FiltroAdmision = 'todos' | 'admitidos' | 'por admitir';

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

const MOCK_RESPONSE: AdmitidosRankingResponse = {
  cohorteActual: {
    id: 'coh-actual-1',
    nombre: 'Cohorte-3 2025-1',
    activa: true,
    cuposDisponibles: 5,
    totalAdmitidos: 2,
  },
  aspirantes: [
    {
      id: '1',
      nombre: 'Roberto Jimenez Vargas',
      correo: 'roberto.jimenez@email.com',
      puntaje: 92.5,
      ranking: 1,
      admitido: true,
      completamenteCalificado: true,
    },
    {
      id: '2',
      nombre: 'Diana Carolina Morales',
      correo: 'diana.morales@email.com',
      puntaje: 88.0,
      ranking: 2,
      admitido: true,
      completamenteCalificado: true,
    },
    {
      id: '3',
      nombre: 'Andres Felipe Castro',
      correo: 'andres.castro@email.com',
      puntaje: 85.5,
      ranking: 3,
      admitido: false,
      completamenteCalificado: true,
    },
    {
      id: '4',
      nombre: 'Laura Milena Gutierrez',
      correo: 'laura.gutierrez@email.com',
      puntaje: 83.0,
      ranking: 4,
      admitido: false,
      completamenteCalificado: true,
    },
    {
      id: '5',
      nombre: 'Felipe Augusto Ramirez',
      correo: 'felipe.ramirez@email.com',
      puntaje: 81.5,
      ranking: 5,
      admitido: false,
      completamenteCalificado: true,
    },
    {
      id: '6',
      nombre: 'Claudia Patricia Rojas',
      correo: 'claudia.rojas@email.com',
      puntaje: 79.0,
      ranking: 6,
      admitido: false,
      completamenteCalificado: true,
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
    console.warn('[programaAdmitidosService] request failed, using mock', url, error);
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

export async function fetchRankingAdmitidos(programaId: string | number): Promise<AdmitidosRankingResponse> {
  const url = `${API_BASE}/api/dev/endpoint/programa/${programaId}/admitidos/ranking`;
  return tryFetch<AdmitidosRankingResponse>(url, { method: 'GET' }, MOCK_RESPONSE);
}

export async function admitirAspirante(
  programaId: string | number,
  aspiranteId: string,
): Promise<{ success: boolean; aspiranteId: string; admitido: boolean }> {
  const url = `${API_BASE}/api/dev/endpoint/programa/${programaId}/admitidos/${aspiranteId}`;
  return tryFetch<{ success: boolean; aspiranteId: string; admitido: boolean }>(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aspiranteId }),
    },
    { success: true, aspiranteId, admitido: true },
  );
}

export async function revertirAdmision(
  programaId: string | number,
  aspiranteId: string,
): Promise<{ success: boolean; aspiranteId: string; admitido: boolean }> {
  const url = `${API_BASE}/api/dev/endpoint/programa/${programaId}/admitidos/${aspiranteId}`;
  return tryFetch<{ success: boolean; aspiranteId: string; admitido: boolean }>(
    url,
    { method: 'DELETE' },
    { success: true, aspiranteId, admitido: false },
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
    "errorCode": "ADMITIDO_ALREADY_EXISTS",
    "details": { "aspiranteId": "1" }
  }

  1) GET /api/dev/endpoint/programa/:programaId/admitidos/ranking
     200 OK:
     {
       "cohorteActual": {
         "id": "coh-actual-1",
         "nombre": "Cohorte-3 2025-1",
         "activa": true,
         "cuposDisponibles": 5,
         "totalAdmitidos": 2
       },
       "aspirantes": [
         {
           "id": "1",
           "nombre": "Roberto Jimenez Vargas",
           "correo": "roberto.jimenez@email.com",
           "puntaje": 92.5,
           "ranking": 1,
           "admitido": true,
           "completamenteCalificado": true
         }
       ]
     }

  2) POST /api/dev/endpoint/programa/:programaId/admitidos/:aspiranteId
     - Admite al aspirante seleccionado.
     - Body sugerido:
       { "aspiranteId": "1" }
     200/201 OK:
       { "success": true, "aspiranteId": "1", "admitido": true }

  3) DELETE /api/dev/endpoint/programa/:programaId/admitidos/:aspiranteId
     - Revierte la admision (si la regla de negocio lo permite).
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
