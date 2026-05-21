

/**
 * Saca el token de acceso de la cookie de sesión para usarlo en las solicitudes al backend.
 * @returns el token de acceso
 */
// function getAccessToken() {
//   return localStorage.getItem("ufps_programa_access_token") ?? null;
// }

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
}

export interface AspiranteCohorteValidacionApi {
  id: number;
  nombre: string;
  cedula: string;
  correo: string;
  documentosValidados: number;
  totalDocumentos: number;
  estadoGeneral: "por validar" | "en progreso" | "validados";
}

export interface DocumentoAspiranteValidacionApi {
  id: number;
  nombre: string;
  estado: "APROBADO" | "RECHAZADO" | "PENDIENTE";
  motivoRechazo: string | null;
  linkArchivo: string;
}

export interface DocumentosAspiranteResponse {
  idAspirante: number;
  nombreAspirante: string;
  cedula: string;
  estadoGeneral: "por validar" | "en progreso" | "validados";
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

const COHORTES_MOCK: CohorteValidacionApi[] = [
  {
    id: 1,
    nombre: "Cohorte-3 2025-1",
    activa: true,
    semestre: "2025-1",
    cupos: 45,
    fechaLimiteDocs: "2026-05-15",
    fechaLimiteInscripcion: "2025-02-10",
    totalInscritos: 45,
    totalValidados: 32,
    totalAdmitidos: null,
  },
  {
    id: 2,
    nombre: "Cohorte-2 2024-2",
    activa: false,
    semestre: "2024-2",
    cupos: 40,
    fechaLimiteDocs: "2024-07-10",
    fechaLimiteInscripcion: "2024-06-15",
    totalInscritos: 38,
    totalValidados: 38,
    totalAdmitidos: 32,
  },
];

const ASPIRANTES_POR_COHORTE_MOCK: Record<number, AspiranteCohorteValidacionApi[]> = {
  1: [
    {
      id: 11,
      nombre: "Carlos Andrés Rodríguez Martínez",
      cedula: "1087654321",
      correo: "carlos.rodriguez@email.com",
      documentosValidados: 5,
      totalDocumentos: 7,
      estadoGeneral: "en progreso",
    },
    {
      id: 12,
      nombre: "María Fernanda Pérez González",
      cedula: "1098765432",
      correo: "maria.perez@email.com",
      documentosValidados: 7,
      totalDocumentos: 7,
      estadoGeneral: "validados",
    },
    {
      id: 13,
      nombre: "Juan Sebastián Gómez Herrera",
      cedula: "1076543210",
      correo: "juan.gomez@email.com",
      documentosValidados: 0,
      totalDocumentos: 7,
      estadoGeneral: "por validar",
    },
  ],
  2: [
    {
      id: 21,
      nombre: "Laura Sofía Ramírez Torres",
      cedula: "1001122334",
      correo: "laura.ramirez@email.com",
      documentosValidados: 7,
      totalDocumentos: 7,
      estadoGeneral: "validados",
    },
  ],
};

const DOCUMENTOS_POR_ASPIRANTE_MOCK: Record<number, DocumentosAspiranteResponse> = {
  11: {
    idAspirante: 11,
    nombreAspirante: "Carlos Andrés Rodríguez Martínez",
    cedula: "1087654321",
    estadoGeneral: "en progreso",
    documentos: [
      {
        id: 101,
        nombre: "Cédula de ciudadanía",
        estado: "APROBADO",
        motivoRechazo: null,
        linkArchivo: "https://storage.ufps.edu.co/docs/cedula_1087654321.pdf?token=mock",
      },
      {
        id: 102,
        nombre: "Diploma de pregrado",
        estado: "RECHAZADO",
        motivoRechazo: "El documento es ilegible y borroso en las firmas.",
        linkArchivo: "https://storage.ufps.edu.co/docs/diploma_1087654321.pdf?token=mock",
      },
      {
        id: 103,
        nombre: "Acta de grado",
        estado: "PENDIENTE",
        motivoRechazo: null,
        linkArchivo: "https://storage.ufps.edu.co/docs/acta_1087654321.pdf?token=mock",
      },
    ],
  },
  12: {
    idAspirante: 12,
    nombreAspirante: "María Fernanda Pérez González",
    cedula: "1098765432",
    estadoGeneral: "validados",
    documentos: [
      {
        id: 201,
        nombre: "Cédula de ciudadanía",
        estado: "APROBADO",
        motivoRechazo: null,
        linkArchivo: "https://storage.ufps.edu.co/docs/cedula_1098765432.pdf?token=mock",
      },
      {
        id: 202,
        nombre: "Diploma de pregrado",
        estado: "APROBADO",
        motivoRechazo: null,
        linkArchivo: "https://storage.ufps.edu.co/docs/diploma_1098765432.pdf?token=mock",
      },
      {
        id: 203,
        nombre: "Acta de grado",
        estado: "APROBADO",
        motivoRechazo: null,
        linkArchivo: "https://storage.ufps.edu.co/docs/acta_1098765432.pdf?token=mock",
      },
    ],
  },
  13: {
    idAspirante: 13,
    nombreAspirante: "Juan Sebastián Gómez Herrera",
    cedula: "1076543210",
    estadoGeneral: "por validar",
    documentos: [
      {
        id: 301,
        nombre: "Cédula de ciudadanía",
        estado: "PENDIENTE",
        motivoRechazo: null,
        linkArchivo: "https://storage.ufps.edu.co/docs/cedula_1076543210.pdf?token=mock",
      },
      {
        id: 302,
        nombre: "Diploma de pregrado",
        estado: "PENDIENTE",
        motivoRechazo: null,
        linkArchivo: "https://storage.ufps.edu.co/docs/diploma_1076543210.pdf?token=mock",
      },
      {
        id: 303,
        nombre: "Acta de grado",
        estado: "PENDIENTE",
        motivoRechazo: null,
        linkArchivo: "https://storage.ufps.edu.co/docs/acta_1076543210.pdf?token=mock",
      },
    ],
  },
  21: {
    idAspirante: 21,
    nombreAspirante: "Laura Sofía Ramírez Torres",
    cedula: "1001122334",
    estadoGeneral: "validados",
    documentos: [
      {
        id: 401,
        nombre: "Cédula de ciudadanía",
        estado: "APROBADO",
        motivoRechazo: null,
        linkArchivo: "https://storage.ufps.edu.co/docs/cedula_1001122334.pdf?token=mock",
      },
      {
        id: 402,
        nombre: "Diploma de pregrado",
        estado: "APROBADO",
        motivoRechazo: null,
        linkArchivo: "https://storage.ufps.edu.co/docs/diploma_1001122334.pdf?token=mock",
      },
      {
        id: 403,
        nombre: "Acta de grado",
        estado: "APROBADO",
        motivoRechazo: null,
        linkArchivo: "https://storage.ufps.edu.co/docs/acta_1001122334.pdf?token=mock",
      },
    ],
  },
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}


/**
 * Devuelve la id del programa del que es director el usuario en base a la id del usuario.
 * Mientras el backend no está desplegado retorna un valor mock.
 */
// async function getIdPrograma() {
// 	const idUsuario = JSON.parse(localStorage.getItem("ufps_programa_session") ?? "{}").id;

// 	// const response = await fetch(
//   //   `${import.meta.env.VITE_API_URL}/api/application/case/director-programa/programa/director/${idUsuario}`,
//   //   {
//   //     method: "GET",
//   //     headers: {
//   //       "Content-Type": "application/json",
//   //       Authorization: `Bearer ${getAccessToken()}`,
//   //     }
//   //   },
//   // ).catch((err) => {
//   //   console.error("Error en la solicitud de id de programa:", err);
//   //   throw err;
//   // });

//   // if (!response.ok) {
// 	// const errorText = await response.text();
// 	// console.error("Error en la respuesta del servidor:", errorText);
// 	// throw new Error(`Error ${response.status}: ${errorText}`);
//   // }

//   // const data = await response.json();
//   // return data.idPrograma;

// 	void idUsuario;
// 	return ID_PROGRAMA_MOCK;
// }

export async function obtenerCohortesPorPrograma(): Promise<CohorteValidacionApi[]> {
	// const response = await fetch(`${import.meta.env.VITE_API_URL}/api/application/case/cohortes`, {
	//   method: "GET",
	//   headers: {
	//     Authorization: `Bearer ${getAccessToken()}`,
	//   },
	// });
	// if (!response.ok) {
	//   throw new Error(`Error ${response.status}: ${await response.text()}`);
	// }
	// return await response.json();
	return clone(COHORTES_MOCK);
}

export async function obtenerAspirantesPorCohorte(idCohorte: number): Promise<AspiranteCohorteValidacionApi[]> {
	// const response = await fetch(`${import.meta.env.VITE_API_URL}/api/application/case/cohortes/${idCohorte}/aspirantes`, {
	//   method: "GET",
	//   headers: {
	//     Authorization: `Bearer ${getAccessToken()}`,
	//   },
	// });
	// if (!response.ok) {
	//   throw new Error(`Error ${response.status}: ${await response.text()}`);
	// }
	// return await response.json();
  return clone(ASPIRANTES_POR_COHORTE_MOCK[idCohorte] ?? []);
}

export async function obtenerDocumentosAspirante(idAspirante: number): Promise<DocumentosAspiranteResponse> {
	// const response = await fetch(`${import.meta.env.VITE_API_URL}/api/application/case/aspirantes/${idAspirante}/documentos`, {
	//   method: "GET",
	//   headers: {
	//     Authorization: `Bearer ${getAccessToken()}`,
	//   },
	// });
	// if (!response.ok) {
	//   throw new Error(`Error ${response.status}: ${await response.text()}`);
	// }
	// return await response.json();
  const documento = DOCUMENTOS_POR_ASPIRANTE_MOCK[idAspirante];
	if (!documento) throw new Error("No se encontró el aspirante en los datos mock.");
	return clone(documento);
}

export async function actualizarEstadoDocumento(
  idDocumento: number,
	payload: ActualizarDocumentoEstadoPayload,
): Promise<ActualizarDocumentoEstadoResponse> {
	// const response = await fetch(`${import.meta.env.VITE_API_URL}/api/application/case/documentos/${idDocumento}/estado`, {
	//   method: "PATCH",
	//   headers: {
	//     "Content-Type": "application/json",
	//     Authorization: `Bearer ${getAccessToken()}`,
	//   },
	//   body: JSON.stringify(payload),
	// });
	// if (!response.ok) {
	//   throw new Error(`Error ${response.status}: ${await response.text()}`);
	// }
	// return await response.json();
	const documento = Object.values(DOCUMENTOS_POR_ASPIRANTE_MOCK)
		.flatMap((registro) => registro.documentos)
    .find((item) => item.id === idDocumento);

	if (!documento) throw new Error("No se encontró el documento en los datos mock.");

	return clone({
		id: documento.id,
		nombre: documento.nombre,
		estado: payload.estado,
		motivoRechazo: payload.estado === "RECHAZADO" ? (payload.motivoRechazo ?? null) : null,
	});
}

export default {
	obtenerCohortesPorPrograma,
	obtenerAspirantesPorCohorte,
	obtenerDocumentosAspirante,
	actualizarEstadoDocumento,
};