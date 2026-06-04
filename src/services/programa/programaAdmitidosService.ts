/*
  programaAdmitidosService.ts
  Servicio para la pantalla de admitidos (vista de listado de cohortes) del módulo Programa.
  - Usa VITE_API_URL
  - Usa el backend real
*/
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

export function normalizeRankingResponse(data: unknown): AdmitidosRankingResponse {
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