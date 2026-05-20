export interface Cohorte {
	id: string | number;
	nombre: string;
	activa: boolean;
	inscritos: number;
	validados?: number;
	admitidos?: number;
	cupos?: number;
	fechaLimiteDocumentos: string;
	fechaLimitePago?: string;
	fechaInicio?: string;
}

export interface CohorteApi {
	id: number;
	nombre: string;
	activa: boolean;
	inscritos: number;
	admitidos: number;
	cupos: number;
	fechaLimiteDocumentos: string;
	fechaLimitePago: string;
	fechaInicio: string;
}

export interface AspiranteValidacion {
	id: string;
	nombre: string;
	cedula: string;
	documentosValidados: number;
	totalDocumentos: number;
	correo: string;
	ultimaActualizacion: string;
	estado: "por validar" | "en progreso" | "validados";
	documentos: DocumentoValidacion[];
}

export const aspirantesPorCohorte: Record<string, AspiranteValidacion[]> = {
	"1": [
		{ id: "1", nombre: "María Fernanda Pérez González", cedula: "1098765432", documentosValidados: 7, totalDocumentos: 7, correo: "maria.perez@email.com", ultimaActualizacion: "27 de abril de 2026", estado: "validados", documentos: [] },
		{ id: "2", nombre: "Jorge Luis Gómez Ramírez", cedula: "1065432109", documentosValidados: 7, totalDocumentos: 7, correo: "jorge.gomez@email.com", ultimaActualizacion: "29 de abril de 2026", estado: "validados", documentos: [] },
		{ id: "3", nombre: "Carlos Andrés Rodríguez Martínez", cedula: "1087654321", documentosValidados: 5, totalDocumentos: 7, correo: "carlos.rodriguez@email.com", ultimaActualizacion: "28 de abril de 2026", estado: "en progreso", documentos: [] },
		{ id: "4", nombre: "Ana Lucía Torres Sánchez", cedula: "1076543210", documentosValidados: 4, totalDocumentos: 7, correo: "ana.torres@email.com", ultimaActualizacion: "26 de abril de 2026", estado: "en progreso", documentos: [] },
		{ id: "5", nombre: "Luis Fernando Martínez Castro", cedula: "1098234567", documentosValidados: 0, totalDocumentos: 7, correo: "luis.martinez@email.com", ultimaActualizacion: "30 de abril de 2026", estado: "por validar", documentos: [] },
		{ id: "6", nombre: "Patricia Isabel Hernández López", cedula: "1087234561", documentosValidados: 0, totalDocumentos: 7, correo: "patricia.hernandez@email.com", ultimaActualizacion: "25 de abril de 2026", estado: "por validar", documentos: [] },
	],
	"2": [
		{ id: "1", nombre: "Natalia Gómez Silva", cedula: "1001122334", documentosValidados: 7, totalDocumentos: 7, correo: "natalia.gomez@email.com", ultimaActualizacion: "20 de junio de 2024", estado: "validados", documentos: [] },
		{ id: "2", nombre: "Felipe Álvarez Torres", cedula: "1002233445", documentosValidados: 7, totalDocumentos: 7, correo: "felipe.alvarez@email.com", ultimaActualizacion: "21 de junio de 2024", estado: "validados", documentos: [] },
		{ id: "3", nombre: "Laura Castellanos Pérez", cedula: "1003344556", documentosValidados: 3, totalDocumentos: 7, correo: "laura.castellanos@email.com", ultimaActualizacion: "19 de junio de 2024", estado: "en progreso", documentos: [] },
	],
	"3": [
		{ id: "1", nombre: "Ricardo Luna Herrera", cedula: "1004455667", documentosValidados: 7, totalDocumentos: 7, correo: "ricardo.luna@email.com", ultimaActualizacion: "8 de enero de 2024", estado: "validados", documentos: [] },
	],
};

export function calcularPorcentaje(validados: number, total: number) {
	return Math.round((validados / total) * 100);
}

export function obtenerCohorte(cohorteId?: number, cohortes: Cohorte[] = []) {
	return cohortes.find((cohorte) => cohorte.id === cohorteId);
}

export function obtenerAspirantes(cohorteId?: number) {
	return aspirantesPorCohorte[cohorteId ?? ""] ?? aspirantesPorCohorte["1"];
}

export function obtenerAspirante(cohorteId: number, aspiranteId: number) {
	return obtenerAspirantes(cohorteId).find((aspirante) => aspirante.id === aspiranteId.toString()) ?? obtenerAspirantes(cohorteId)[0];
}

const ACCESS_TOKEN_KEY = "ufps_programa_access_token";
const SESSION_KEY = "ufps_programa_session";

function getAccessToken(): string {
	const token = localStorage.getItem(ACCESS_TOKEN_KEY);
	if (!token) throw new Error("No se encontró el token de acceso.");
	return token;
}

function getUserIdFromSession(): number | null {
	const raw = localStorage.getItem(SESSION_KEY);
	if (!raw) return null;
	try {
		const session = JSON.parse(raw) as { userId?: number | string };
		const parsed = typeof session.userId === "string" ? Number(session.userId) : session.userId;
		return Number.isFinite(parsed) ? (parsed as number) : null;
	} catch {
		return null;
	}
}

let idPrograma: number = -1;

export async function getIdPrograma() {
	if (idPrograma > -1) return idPrograma;

	const idUsuario = getUserIdFromSession();
	if (!idUsuario) throw new Error("No se encontró el userId en la sesión.");

	const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/application/case/director-programa/programa/director/${idUsuario}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      }
    },
  ).catch((err) => {
    console.error("Error en la solicitud de id de programa:", err);
    throw err;
  });

  if (!response.ok) {
	const errorText = await response.text();
	console.error("Error en la respuesta del servidor:", errorText);
	throw new Error(`Error ${response.status}: ${errorText}`);
  }

	const rawData = await response.json();
	let programaId: number | null = null;

	if (typeof rawData === "number") {
		programaId = rawData;
	} else if (rawData !== null && typeof rawData === "object") {
		const d = rawData as Record<string, unknown>;
		const val = d.idPrograma ?? d.programaId ?? d.id ?? null;
		programaId = typeof val === "number" ? val : typeof val === "string" ? Number(val) : null;
	}

	if (!Number.isFinite(programaId)) {
		throw new Error("El backend no devolvió un id de programa válido para el usuario autenticado.");
	}

	idPrograma = programaId as number;
	return idPrograma;

}

/**
 * 
 * @returns array con las cohortes del programa del usuario
 */
export async function getCohortesPrograma(): Promise<CohorteApi[]> {
	const id_programa = await getIdPrograma();
	const response = await fetch(
	`${import.meta.env.VITE_API_URL}/api/application/case/director-programa/programa/${id_programa}/cohortes`,
	{
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${getAccessToken()}`,
		}
	}).catch((err) => {
		console.error("Error en la solicitud de cohortes del programa:", err);
		throw err;
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error("Error en fetching de cohortes programa:", errorText);
		throw new Error(`Error ${response.status}: ${errorText}`);
	}

	const data = await response.json();
	return data;
}

interface DocumentoRaw {
	id: number;
	idEstadodocumento: number;
	estadodocumento?: { id: number; estado: string };
	fechacargue?: string;
	enlaceurl?: string;
	keyfile?: string;
	observaciones?: string;
	tipodocumento?: { id: number; descripcion: string; extension: string; tipo: string };
}

export interface DocumentoValidacion {
	id: number;
	nombre: string;
	enlaceurl: string;
	validado: boolean;
	rechazado: boolean;
	observaciones: string;
}

interface PersonaRaw {
	nombres?: string;
	apellidos?: string;
	nombre?: string;
	apellido?: string;
	primerNombre?: string;
	primerApellido?: string;
	numerodocumento?: string | number;
	cedula?: string | number;
	correo?: string;
	email?: string;
}

interface AspiranteRaw {
	id: number;
	idCohorte: number;
	idEstado: number;
	idPersona: number;
	persona: string | PersonaRaw;
	documentoList?: DocumentoRaw[];
}

function extractPersona(persona: string | PersonaRaw): { nombre: string; cedula: string; correo: string } {
	if (!persona) return { nombre: "N/A", cedula: "N/A", correo: "N/A" };
	if (typeof persona === "string") return { nombre: persona || "N/A", cedula: "N/A", correo: "N/A" };

	console.debug("[validacionService] persona object:", persona);

	const nombres = persona.nombres ?? persona.nombre ?? persona.primerNombre ?? "";
	const apellidos = persona.apellidos ?? persona.apellido ?? persona.primerApellido ?? "";
	const nombre = [nombres, apellidos].filter(Boolean).join(" ") || "N/A";
	const cedula = String(persona.numerodocumento ?? persona.cedula ?? "N/A");
	const correo = persona.correo ?? persona.email ?? "N/A";
	return { nombre, cedula, correo };
}

function mapEstadoDocumentos(docs: DocumentoRaw[]): "por validar" | "en progreso" | "validados" {
	if (!docs || docs.length === 0) return "por validar";
	const aprobados = docs.filter(d =>
		d.estadodocumento?.estado?.toLowerCase().includes("aprobad")
	).length;
	if (aprobados === docs.length) return "validados";
	if (aprobados > 0) return "en progreso";
	return "por validar";
}

export async function getAspirantesCohorte(cohorteId: number): Promise<AspiranteValidacion[]> {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/api/application/case/director-programa/cohorte/${cohorteId}/aspirantes/paz-y-salvo`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${getAccessToken()}`,
			},
		}
	).catch((err) => {
		console.error("Error en la solicitud de aspirantes:", err);
		throw err;
	});

	if (!response.ok) {
		const errorText = await response.text();
		console.error("Error fetching aspirantes:", errorText);
		throw new Error(`Error ${response.status}: ${errorText}`);
	}

	const data = (await response.json()) as AspiranteRaw[];

	return data.map((a) => {
			const docs = a.documentoList ?? [];
			const aprobados = docs.filter(d =>
				d.estadodocumento?.estado?.toLowerCase().includes("aprobad")
			).length;
			const ultimoDoc = docs
				.filter((d) => d.fechacargue)
				.sort((x, y) => (y.fechacargue! > x.fechacargue! ? 1 : -1))[0];

			return {
				id: String(a.id),
				...extractPersona(a.persona),
				documentosValidados: aprobados,
				totalDocumentos: docs.length,
				ultimaActualizacion: ultimoDoc?.fechacargue
					? new Date(`${ultimoDoc.fechacargue}T00:00:00`).toLocaleDateString("es-CO", {
						day: "numeric",
						month: "long",
						year: "numeric",
					})
					: "—",
				estado: mapEstadoDocumentos(docs),
				documentos: docs.map((d) => ({
					id: d.id,
					nombre: d.tipodocumento?.descripcion ?? `Documento ${d.id}`,
					enlaceurl: d.enlaceurl ?? "",
					validado: d.estadodocumento?.estado?.toLowerCase().includes("aprobad") ?? false,
					rechazado: d.estadodocumento?.estado?.toLowerCase().includes("rechazad") ?? false,
					observaciones: d.observaciones ?? "",
				})),
			};
		});
}

export async function getDocumentosAspirante(aspiranteId: number): Promise<DocumentoValidacion[]> {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/api/application/case/director-programa/listByAspirantId`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken()}` },
			body: JSON.stringify({ id: aspiranteId }),
		}
	).catch((err) => {
		console.error("Error en la solicitud de documentos:", err);
		throw err;
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Error ${response.status}: ${text}`);
	}

	const data = (await response.json()) as DocumentoRaw[];
	return data.map((d) => ({
		id: d.id,
		nombre: d.tipodocumento?.descripcion ?? `Documento ${d.id}`,
		enlaceurl: d.enlaceurl ?? "",
		validado: d.estadodocumento?.estado?.toLowerCase().includes("aprobad") ?? false,
		rechazado: d.estadodocumento?.estado?.toLowerCase().includes("rechazad") ?? false,
		observaciones: d.observaciones ?? "",
	}));
}

export async function aprobarDocumento(id: number): Promise<void> {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/api/application/case/director-programa/approveByDocumentId`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken()}` },
			body: JSON.stringify({ id }),
		}
	);
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Error ${response.status}: ${text}`);
	}
}

export async function rechazarDocumento(id: number, observaciones: string): Promise<void> {
	const response = await fetch(
		`${import.meta.env.VITE_API_URL}/api/application/case/director-programa/rejectByDocumentId`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAccessToken()}` },
			body: JSON.stringify({ id, observaciones }),
		}
	);
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Error ${response.status}: ${text}`);
	}
}