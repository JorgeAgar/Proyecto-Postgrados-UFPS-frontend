import { programaApiFetch, getProgramaRealId } from './programaService';

export interface PagoMatriculaApi {
  id: number;
  idPago: number;
  idAspirante: number;
  aspirante: string;
  fechavencimiento: string;
  urlrecibo: string;
  urlfactura: string;
  referenciapago: string;
  valorpago: number;
  idEstado: number;
  estado: string;
}

export interface AccionPagoMatriculaAprobarResponse {
  id: number;
  idAspirante: number;
  idEstado: number;
  idPagoconcepto: number;
  valorPagoPesos: number;
  aspirante: string;
  estado: string;
  pagoconcepto: {
    id: number;
    tipo: string;
  };
}

export async function obtenerPagosMatricula(): Promise<PagoMatriculaApi[]> {
  const idPrograma = await getProgramaRealId();
  return programaApiFetch<PagoMatriculaApi[]>(
    `/api/application/case/director-programa/pagos/matricula?idPrograma=${encodeURIComponent(String(idPrograma))}`,
  );
}

export async function aprobarPagoMatricula(idRecibo: number): Promise<AccionPagoMatriculaAprobarResponse> {
  return programaApiFetch<AccionPagoMatriculaAprobarResponse>(
    `/api/application/case/director-programa/pagos/matricula/${idRecibo}/aprobar`,
    { method: 'PATCH' },
  );
}

export async function rechazarPagoMatricula(idRecibo: number): Promise<PagoMatriculaApi> {
  return programaApiFetch<PagoMatriculaApi>(
    `/api/application/case/director-programa/pagos/matricula/${idRecibo}/estado`,
    { method: 'PATCH' },
  );
}
