/*
  programaCohorteService.ts
  Servicio para el listado y creación de cohortes del módulo Programa.
  - Usa VITE_API_URL del .env
  - Endpoints del backend real
*/

import { programaApiFetch, getProgramaRealId } from './programaService';

export interface CohorteItem {
  id: string;
  nombre: string;
  activa: boolean;
  semestre: string;
  cupos: number;
  fechaLimiteDocs: string;
  fechaLimiteInscripcion: string;
  totalInscritos: number;
  totalValidados: number;
  totalCalificados?: number;
  totalAdmitidos: number;
  inscritos?: number;
  admitidos?: number;
  fechaLimiteDocumentos?: string;
  fechaLimitePago?: string;
  fechaInicio?: string;
  documentos?: DocumentoCohorte[];
}

export interface DocumentoCohorte {
  nombre: string;
  obligatorio: boolean;
}

export interface DocumentAssignItem {
  id: number;
  idDocrequisito: number;
  idCohorte: number;
  nombre?: string;
}

export interface AspiranteItem {
  id: string;
  nombre: string;
  cedula: string;
  correo: string;
}

export interface CriterioItem {
  id?: string | number;
  idCriterioevaluacion?: string | number;
  nombre: string;
  peso: number;
}

export interface CohorteDetalle extends CohorteItem {
  criterios: CriterioItem[];
  inscritosData: AspiranteItem[];
  admitidosData: AspiranteItem[];
  documentosAsignados?: {
    documentosConsejo?: DocumentAssignItem[];
    documentosPrograma?: DocumentAssignItem[];
  };
}

export interface NuevaCohortePayload {
  nombre: string;
  fechaInicio: string;
  cupos: number;
  fechaLimiteDocumentos: string;
  fechaLimitePago: string;
  documentos?: DocumentoCohorte[];
  documentosConsejo?: { idDocrequisito?: number | string; idCohorte?: number | string; nombre?: string }[];
  documentosPrograma?: { idDocrequisito?: number | string; idCohorte?: number | string; nombre?: string }[];
  criteriosCohorte?: { idCriterio?: number | string; idCohorte?: number | string; pesoSnapshot?: number }[];
}

export async function fetchCohortes(): Promise<CohorteItem[]> {
  const programaId = await getProgramaRealId();
  const path = `/api/application/case/director-programa/programa/${programaId}/cohortes`;
  const data = await programaApiFetch<unknown[]>(path, { method: 'GET' });
  const normalized = data.map((item) => {
    const cohorte = item as Record<string, unknown>;
    return {
      id: String(cohorte.id ?? ''),
      nombre: String(cohorte.nombre ?? ''),
      activa: Boolean(cohorte.activa),
      semestre: String(cohorte.semestre ?? ''),
      cupos: Number(cohorte.cupos ?? 0),
      fechaLimiteDocs: String(cohorte.fechaLimiteDocs ?? cohorte.fechaLimiteDocumentos ?? ''),
      fechaLimiteInscripcion: String(cohorte.fechaLimiteInscripcion ?? cohorte.fechaLimitePago ?? ''),
      totalInscritos: Number(cohorte.totalInscritos ?? cohorte.inscritos ?? 0),
      totalValidados: Number(cohorte.totalValidados ?? 0),
      totalCalificados: cohorte.totalCalificados !== undefined ? Number(cohorte.totalCalificados) : Number(cohorte.totalValidados ?? 0),
      totalAdmitidos: Number(cohorte.totalAdmitidos ?? cohorte.admitidos ?? 0),
      inscritos: cohorte.inscritos !== undefined ? Number(cohorte.inscritos) : undefined,
      admitidos: cohorte.admitidos !== undefined ? Number(cohorte.admitidos) : undefined,
      fechaLimiteDocumentos: cohorte.fechaLimiteDocumentos !== undefined ? String(cohorte.fechaLimiteDocumentos) : undefined,
      fechaLimitePago: cohorte.fechaLimitePago !== undefined ? String(cohorte.fechaLimitePago) : undefined,
      fechaInicio: cohorte.fechaInicio !== undefined ? String(cohorte.fechaInicio) : undefined,
      documentos: Array.isArray(cohorte.documentos)
        ? cohorte.documentos.map((doc) => {
            const documento = doc as Record<string, unknown>;
            return {
              nombre: String(documento.nombre ?? ''),
              obligatorio: Boolean(documento.obligatorio),
            };
          })
        : undefined,
    } as CohorteItem;
  });
  normalized.sort((a, b) => {
    if (a.activa !== b.activa) return a.activa ? -1 : 1;
    const aDate = a.fechaInicio ? new Date(a.fechaInicio).getTime() : Number.MAX_SAFE_INTEGER;
    const bDate = b.fechaInicio ? new Date(b.fechaInicio).getTime() : Number.MAX_SAFE_INTEGER;
    return aDate - bDate;
  });
  return normalized;
}

export async function createCohorte(payload: NuevaCohortePayload): Promise<CohorteItem> {
  const programaId = await getProgramaRealId();
  const path = `/api/application/case/director-programa/programa/${programaId}/cohortes`;
  return programaApiFetch<CohorteItem>(path, { method: 'POST', body: JSON.stringify(payload) });
}

export default {
  fetchCohortes,
  createCohorte,
};
