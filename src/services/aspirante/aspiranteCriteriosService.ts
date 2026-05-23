import { aspiranteApiFetch, aspiranteAuthService } from "./aspiranteService";

function getAspiranteId(): number {
  const session = aspiranteAuthService.getSession();
  return Number(session?.userId ?? 0);
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface CriterioBackend {
  id: number;
  nombreCriterio: string;
  peso: number;
  puntajeObtenido: number;
}

interface CriteriosResponse {
  criterios: CriterioBackend[];
  puntajeTotal: number;
}

export interface Criterio {
  id: number;
  nombre: string;
  peso: number;
  puntaje: number | null;
}

export interface CriteriosResult {
  criterios: Criterio[];
  puntajeTotal: number;
}

// ── Funciones exportadas ──────────────────────────────────────────────────────

// GET /api/application/case/aspirantes/{idAspirante}/criterios
export async function getCriterios(): Promise<CriteriosResult> {
  const idAspirante = getAspiranteId();
  const res = await aspiranteApiFetch<CriteriosResponse>(
    `/api/application/case/aspirantes/${idAspirante}/criterios`
  );
  return {
    criterios: (res?.criterios ?? []).map(c => ({
      id: c.id,
      nombre: c.nombreCriterio,
      peso: c.peso,
      puntaje: c.puntajeObtenido > 0 ? c.puntajeObtenido : null,
    })),
    puntajeTotal: res?.puntajeTotal ?? 0,
  };
}
