import { programaApiFetch } from './programaService';

export interface AspiranteValidacionApi {
  id: number;
  nombre: string;
  cedula: string;
  correo: string;
  documentosValidados: number;
  totalDocumentos: number;
  estadoGeneral: "ADMITIDO" | "INSCRITO" | "PAZ Y SALVO" | "VALIDADO_CALIFICADO" | "VALIDADO_EN_PROGRESO" | "VALIDADO_POR_CALIFICAR";
}

export async function obtenerAspirantesPorCohorte(idCohorte: number): Promise<AspiranteValidacionApi[]> {
  return programaApiFetch<AspiranteValidacionApi[]>(
    `/api/application/case/director-programa/cohortes/${idCohorte}/aspirantes`
  );
}
