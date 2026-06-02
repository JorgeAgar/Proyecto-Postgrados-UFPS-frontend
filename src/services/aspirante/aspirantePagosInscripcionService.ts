import { aspiranteApiFetch, aspiranteApiUploadFile } from './aspiranteService';
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

export async function uploadInscripcionFactura(aspiranteId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  return aspiranteApiUploadFile<void>(
    `/api/application/case/aspirantes/${aspiranteId}/pagos/inscripcion/factura`,
    formData
  );
}
