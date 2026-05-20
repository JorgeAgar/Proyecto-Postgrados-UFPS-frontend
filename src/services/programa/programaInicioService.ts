/*
  programaInicioService.ts
  Servicio para el dashboard de inicio del módulo Programa.
  - Usa VITE_API_URL desde .env.
  - Endpoints son placeholders (fake) y pueden reemplazarse por los reales.
  - Incluye fallback mock para desarrollo si la API falla.
*/

import { programaApiFetch } from './programaService';

export interface CohorteActual {
  id: number;
  nombre: string;
  activa: boolean;
  fechaLimiteDocumentos: string; // formato DD/MM/YYYY para UI
  fechaLimitePago: string; // formato DD/MM/YYYY para UI
}

export interface ValidacionStats {
  totalInscritos: number;
  aspirantesValidados: number;
}

export interface CalificacionStats {
  totalValidados: number;
  aspirantesCalificados: number;
}

export interface ProgramaInicioData {
  cohorteActual: CohorteActual;
  validacion: ValidacionStats;
  calificacion: CalificacionStats;
}

// NOTE: Removed MOCK fallback data — service now delegates to backend and
// relies on `programaApiFetch` (which adds auth headers and refresh logic).

/**
 * Obtiene toda la data del inicio de Programa.
 */
export async function fetchProgramaInicioData(idUsuario: string | number): Promise<ProgramaInicioData> {
  // 1) Obtener el programa asociado al director (programaId)
  const directorPath = `/api/application/case/director-programa/programa/director/${idUsuario}`;
  const directorResp = await programaApiFetch<unknown>(directorPath, { method: 'GET' });

  let programaId: number | string | undefined;
  if (typeof directorResp === 'number') {
    programaId = directorResp;
  } else {
    const directorObj = directorResp as Record<string, unknown>;
    programaId = (directorObj['programaId'] ?? directorObj['id'] ?? ((directorObj['programa'] as Record<string, unknown> | undefined)?.['id'])) as number | string | undefined;
  }
  if (!programaId) throw new Error('No se pudo obtener programaId desde el endpoint de director-programa.');

  // 2) POST al endpoint correcto con body { id: programaId }
  const inicioPath = `/api/application/case/director-programa/programa/inicio`;
  const inicio = await programaApiFetch<ProgramaInicioData>(inicioPath, {
    method: 'POST',
    body: JSON.stringify({ id: programaId }),
  });

  return inicio;
}

export default {
  fetchProgramaInicioData,
};

/*
  Requisitos de backend para que esta vista funcione:

  1) GET /api/dev/endpoint/programa/:programaId/inicio
     Respuesta sugerida:
     {
       "cohorteActual": {
         "id": 3,
         "nombre": "Cohorte-3 2025-1",
         "activa": true,
         "fechaLimiteDocumentos": "2026-05-15",
         "fechaLimitePago": "2026-05-20"
       },
       "validacion": {
         "totalInscritos": 45,
         "aspirantesValidados": 6
       },
       "calificacion": {
         "totalValidados": 6,
         "aspirantesCalificados": 2
       }
     }

  Notas backend:
  - Idealmente devolver fechas ISO y en frontend formatearlas. En este mock se usa DD/MM/YYYY para simplicidad.
  - Validar autenticación por token y permisos de programa.
  - Recomendado incluir `programaId` derivado del token para evitar fuga entre programas.
  - Manejar errores con códigos claros: 401, 403, 404, 500.
*/
