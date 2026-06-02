export interface ComprobantePagoApi {
  id: number;
  nombreTitulo: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  motivoRechazo: string | null;
  linkArchivo: string;
  monto: number | null;
  fechaEnvio: string | null;
}

export interface ComprobantesAspiranteResponse {
  idAspirante: number;
  nombreAspirante: string;
  cedula: string;
  estadoGeneral: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  comprobantes: ComprobantePagoApi[];
}

export interface AccionComprobanteResponse {
  id: number;
  nombre: string;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  motivoRechazo?: string | null;
}

const MOCK_COMPROBANTES: ComprobantePagoApi[] = [
  {
    id: 1,
    nombreTitulo: "Comprobante de matrícula",
    estado: "PENDIENTE",
    motivoRechazo: null,
    linkArchivo: "https://picsum.photos/seed/comprobante1/400/600",
    monto: 2500000,
    fechaEnvio: "2026-05-28",
  },
  {
    id: 2,
    nombreTitulo: "Comprobante de derechos académicos",
    estado: "PENDIENTE",
    motivoRechazo: null,
    linkArchivo: "https://picsum.photos/seed/comprobante2/400/600",
    monto: 500000,
    fechaEnvio: "2026-05-29",
  },
];

export async function obtenerComprobantesAspirante(idAspirante: number): Promise<ComprobantesAspiranteResponse> {
  await new Promise<void>((r) => setTimeout(r, 600));
  return {
    idAspirante,
    nombreAspirante: "Carlos Andrés Rodríguez Martínez",
    cedula: "1094562345",
    estadoGeneral: "PENDIENTE",
    comprobantes: MOCK_COMPROBANTES.map((c) => ({ ...c })),
  };
}

export async function aprobarComprobante(idComprobante: number): Promise<AccionComprobanteResponse> {
  await new Promise<void>((r) => setTimeout(r, 700));
  return { id: idComprobante, nombre: "Comprobante", estado: "APROBADO", motivoRechazo: null };
}

export async function rechazarComprobante(
  idComprobante: number,
  motivoRechazo: string,
): Promise<AccionComprobanteResponse> {
  await new Promise<void>((r) => setTimeout(r, 700));
  return { id: idComprobante, nombre: "Comprobante", estado: "RECHAZADO", motivoRechazo };
}
