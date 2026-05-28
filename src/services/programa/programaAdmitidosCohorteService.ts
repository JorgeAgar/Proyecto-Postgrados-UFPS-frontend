/*
  programaAdmitidosCohorteService.ts
  Servicio para la pantalla de admisión de aspirantes dentro de una cohorte.
  - Usa VITE_API_URL
  - Usa el backend real
*/

import { programaApiFetch } from './programaService';
import type { FiltroAdmision, CohorteAdmitidosResumen, AspiranteRankingItem, AdmitidosRankingResponse } from './programaAdmitidosService';
import { normalizeRankingResponse } from './programaAdmitidosService';

export type { FiltroAdmision, CohorteAdmitidosResumen, AspiranteRankingItem, AdmitidosRankingResponse };

export interface AdmittedListAspiranteItem {
  id: number;
  nombre: string;
  numerodocumento: number;
  correo: string;
  puntaje: number;
}

export interface AdmittedListCohorte {
  id: number;
  nombre: string;
  activa: boolean;
  cuposDisponibles: number;
  totalAdmitidos: number;
}

export interface AdmittedListResponse {
  cohorteActual: AdmittedListCohorte;
  aspirantes: AdmittedListAspiranteItem[];
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

export async function fetchAdmittedList(cohorteId: string): Promise<AdmittedListResponse> {
  const url = `/api/application/case/director-programa/${cohorteId}/generateAdmittedList`;
  return programaApiFetch<AdmittedListResponse>(url, { method: 'GET' });
}

export default {
  fetchRankingAdmitidosByCohorte,
  admitirAspirante,
  revertirAdmision,
  fetchAdmittedList,
};
