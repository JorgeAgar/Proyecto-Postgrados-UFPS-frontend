import { aspiranteApiFetch } from './aspiranteService';
import type { ResumenPagoResponse, WompiCheckoutResponse } from './aspirantePagosService';

export async function fetchInscripcionResumen(aspiranteId: string): Promise<ResumenPagoResponse> {
  return aspiranteApiFetch<ResumenPagoResponse>(
    `/api/application/case/aspirantes/${aspiranteId}/pagos/inscripcion/resumen`
  );
}

export async function fetchInscripcionCheckout(aspiranteId: string): Promise<WompiCheckoutResponse> {
  return aspiranteApiFetch<WompiCheckoutResponse>(
    `/api/application/case/aspirantes/${aspiranteId}/pagos/inscripcion/checkout`,
    { method: 'POST' }
  );
}
