

import { getProgramaRealId } from './programaService';

/**
 * Saca el token de acceso de la cookie de sesión para usarlo en las solicitudes al backend.
 * @returns el token de acceso
 */
function getAccessToken() {
  return localStorage.getItem("ufps_programa_access_token") ?? null;
}

/**
 * Intenta refrescar el token de acceso usando el token de refresco almacenado.
 */
async function refreshToken() {
  const refreshToken = localStorage.getItem("ufps_programa_refresh_token");
  if (!refreshToken) {
    throw new Error("No se encontró el token de refresco.");
  }

  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if(!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  localStorage.setItem("ufps_programa_access_token", data.accessToken);
  localStorage.setItem("ufps_programa_refresh_token", data.refreshToken);
  localStorage.setItem("ufps_programa_session", JSON.stringify({ userId: data.userId, username: data.username, roles: data.roles, displayName: data.username, loginAt: new Date().toISOString() }));
}

export interface DocumentoRequerido {
  id: number;
  nombre: string;
  obligatorio: boolean;
  idCohorte?: number;
}

export interface CohorteValidacionApi {
  id: number;
  nombre: string;
  activa: boolean;
  semestre: string;
  cupos: number;
  fechaLimiteDocs: string;
  fechaLimiteInscripcion: string;
  totalInscritos: number;
  totalValidados: number;
  totalAdmitidos: number | null;
  documentos: DocumentoRequerido[];
}

export interface AspiranteValidacionApi {
  id: number;
  nombre: string;
  cedula: string;
  correo: string;
  documentosValidados: number;
  totalDocumentos: number;
  estadoGeneral: "ADMITIDO" | "INSCRITO" | "PAZ Y SALVO" | "VALIDADO_CALIFICADO" | "VALIDADO_EN_PROGRESO" | "VALIDADO_POR_CALIFICAR";
}

export interface DocumentoAspiranteValidacionApi {
  id: number;
  nombre: string;
  estado: string;
  motivoRechazo: string | null;
  linkArchivo: string;
}

export interface DocumentosAspiranteResponse {
  idAspirante: number;
  nombreAspirante: string;
  cedula: string;
  estadoGeneral: "APROBADO" | "PENDIENTE" | "RECHAZADO";
  documentos: DocumentoAspiranteValidacionApi[];
}

export interface ActualizarDocumentoEstadoPayload {
  estado: "APROBADO" | "RECHAZADO";
  motivoRechazo?: string | null;
}

export interface ActualizarDocumentoEstadoResponse {
  id: number;
  nombre: string;
  estado: "APROBADO" | "RECHAZADO" | "PENDIENTE";
  motivoRechazo: string | null;
}

/**
 * Obtiene la lista de cohortes del programa al que pertenece el usuario, incluyendo información relevante para la validación de documentos.
 * @returns la lista de cohortes del programa al que pertenece el usuario
 */
export async function obtenerCohortesPorPrograma(): Promise<CohorteValidacionApi[]> {
	const programaId = await getProgramaRealId();
	const response = await fetch(`${import.meta.env.VITE_API_URL}/api/application/case/director-programa/programa/${programaId}/cohortes`, {
	  method: "GET",
	  headers: {
	    Authorization: `Bearer ${getAccessToken()}`,
	  },
	});
	if (!response.ok) {
    if(response.status === 403) {
      console.warn("Token de acceso posiblemente expirado, intentando refrescar token...");
      await refreshToken().then(() => {
        console.log("Token refrescado exitosamente, reintentando solicitud...");
        return obtenerCohortesPorPrograma();
      }).catch((err) => {
        console.error("Error al refrescar token después de un 403:", err);
        localStorage.removeItem("ufps_programa_access_token");
        localStorage.removeItem("ufps_programa_refresh_token");
        localStorage.removeItem("ufps_programa_session");
        console.warn("Redirigiendo al login del programa...");
        window.location.href = "/programa/login";
      });
    }
	  throw new Error(`Error ${response.status}: ${await response.text()}`);
	}
	return await response.json();
}

/**
 * Obtiene la lista de aspirantes de un cohorte específico.
 * @param idCohorte la id del cohorte a la que se consultan los aspirantes
 * @returns la lista de aspirantes inscritos en el cohorte
 */
export async function obtenerAspirantesPorCohorte(idCohorte: number): Promise<AspiranteValidacionApi[]> {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/api/application/case/director-programa/cohortes/${idCohorte}/aspirantes`, {
	  method: "GET",
	  headers: {
	    Authorization: `Bearer ${getAccessToken()}`,
	  },
	});
	if (!response.ok) {
    if(response.status === 403) {
      console.warn("Token de acceso posiblemente expirado, intentando refrescar token...");
      await refreshToken().then(() => {
        console.log("Token refrescado exitosamente, reintentando solicitud...");
        return obtenerAspirantesPorCohorte(idCohorte);
      }).catch((err) => {
        console.error("Error al refrescar token después de un 403:", err);
        localStorage.removeItem("ufps_programa_access_token");
        localStorage.removeItem("ufps_programa_refresh_token");
        localStorage.removeItem("ufps_programa_session");
        localStorage.removeItem("ufps_programa_id");
        console.warn("Redirigiendo al login del programa...");
        window.location.href = "/programa/login";
      });
    }
	  throw new Error(`Error ${response.status}: ${await response.text()}`);
	}
	return await response.json();
}

/**
 * Obtiene la lista de documentos de un aspirante específico.
 * @param idAspirante la id del aspirante al que se le quieren consultar los documentos
 * @returns la lista de documentos del aspirante
 */
export async function obtenerDocumentosAspirante(idAspirante: number): Promise<DocumentosAspiranteResponse> {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/api/application/case/director-programa/aspirantes/${idAspirante}/documentos`, {
	  method: "GET",
	  headers: {
	    Authorization: `Bearer ${getAccessToken()}`,
	  },
	});
	if (!response.ok) {
    if(response.status === 403) {
      console.warn("Token de acceso posiblemente expirado, intentando refrescar token...");
      await refreshToken().then(() => {
        console.log("Token refrescado exitosamente, reintentando solicitud...");
        return obtenerDocumentosAspirante(idAspirante);
      }).catch((err) => {
        console.error("Error al refrescar token después de un 403:", err);
        localStorage.removeItem("ufps_programa_access_token");
        localStorage.removeItem("ufps_programa_refresh_token");
        localStorage.removeItem("ufps_programa_session");
        localStorage.removeItem("ufps_programa_id");
        console.warn("Redirigiendo al login del programa...");
        window.location.href = "/programa/login";
      });
    }
	  throw new Error(`Error ${response.status}: ${await response.text()}`);
	}
	return await response.json();
}

/**
 * Aprueba o rechaza un documento de un aspirante específico, actualizando su estado en el sistema.
 * @param idDocumento id del documento a actualizar
 * @param payload si se aprobó o rechazó el documento, y en caso de rechazo, el motivo de este
 * @returns la respuesta de la actualización del estado del documento
 */
export async function actualizarEstadoDocumento(
  idDocumento: number,
	payload: ActualizarDocumentoEstadoPayload,
): Promise<ActualizarDocumentoEstadoResponse> {
	const response = await fetch(`${import.meta.env.VITE_API_URL}/api/application/case/director-programa/documentos/${idDocumento}/estado`, {
	  method: "PATCH",
	  headers: {
	    "Content-Type": "application/json",
	    Authorization: `Bearer ${getAccessToken()}`,
	  },
	  body: JSON.stringify(payload),
	});
	if (!response.ok) {
    if(response.status === 403) {
      console.warn("Token de acceso posiblemente expirado, intentando refrescar token...");
      await refreshToken().then(() => {
        console.log("Token refrescado exitosamente, reintentando solicitud...");
        return actualizarEstadoDocumento(idDocumento, payload);
      }).catch((err) => {
        console.error("Error al refrescar token después de un 403:", err);
        localStorage.removeItem("ufps_programa_access_token");
        localStorage.removeItem("ufps_programa_refresh_token");
        localStorage.removeItem("ufps_programa_session");
        localStorage.removeItem("ufps_programa_id");
        window.location.href = "/programa/login";
      });
    }
	  throw new Error(`Error ${response.status}: ${await response.text()}`);
	}
	return await response.json();
}

export default {
	obtenerCohortesPorPrograma,
	obtenerAspirantesPorCohorte,
	obtenerDocumentosAspirante,
	actualizarEstadoDocumento,
};