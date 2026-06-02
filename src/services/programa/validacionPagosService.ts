import { programaApiFetch, getProgramaRealId } from './programaService';

export interface CohorteValidacionPagosApi {
  id: number;
  nombre: string;
  activa: boolean;
  semestre: string;
  cupos: number;
  fechaLimitePago: string;
  fechaLimiteDocs: string;
  fechaLimiteInscripcion: string;
  totalInscritos: number;
  totalPazysalvo: number;
  totalValidados: number;
  totalCalificados: number;
  totalAdmitidos: number;
}

export async function obtenerCohortesPorProgramaPagos(): Promise<CohorteValidacionPagosApi[]> {
  const programaId = await getProgramaRealId();
  return programaApiFetch<CohorteValidacionPagosApi[]>(
    `/api/application/case/director-programa/programa/${programaId}/cohortes`
  );
}
