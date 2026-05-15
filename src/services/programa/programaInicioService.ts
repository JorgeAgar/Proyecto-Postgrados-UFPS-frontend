/*
  programaInicioService.ts
  Servicio para el dashboard de inicio del módulo Programa.
  - Usa VITE_API_URL desde .env.
  - Endpoints son placeholders (fake) y pueden reemplazarse por los reales.
  - Incluye fallback mock para desarrollo si la API falla.
*/

const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

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

const MOCK_DATA: ProgramaInicioData = {
  cohorteActual: {
    id: 3,
    nombre: 'Cohorte-3 2025-1',
    activa: true,
    fechaLimiteDocumentos: '15/05/2026',
    fechaLimitePago: '20/05/2026',
  },
  validacion: {
    totalInscritos: 45,
    aspirantesValidados: 6,
  },
  calificacion: {
    totalValidados: 6,
    aspirantesCalificados: 2,
  },
};

async function tryFetch<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    console.warn('[programaInicioService] request failed, using mock data', url, error);
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

/**
 * Obtiene toda la data del inicio de Programa.
 */
export async function fetchProgramaInicioData(programaId: string | number): Promise<ProgramaInicioData> {
  const url = `${API_BASE}/api/dev/endpoint/programa/${programaId}/inicio`;
  return tryFetch<ProgramaInicioData>(url, { method: 'GET' }, MOCK_DATA);
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
