export type RegistroSelectOption = {
	value: string;
	label: string;
};

export type RegistroSelectOptions = {
	documento: RegistroSelectOption[];
	estadoCivil: RegistroSelectOption[];
	sexoBiologico: RegistroSelectOption[];
	departamentoNacimiento: RegistroSelectOption[];
	municipio: RegistroSelectOption[];
	departamentoExpedicion: RegistroSelectOption[];
	zonaResidencia: RegistroSelectOption[];
	departamentoResidencia: RegistroSelectOption[];
	grupoEtnico: RegistroSelectOption[];
	puebloIndigena: RegistroSelectOption[];
	siNo: RegistroSelectOption[];
	departamentoTrabajo: RegistroSelectOption[];
	programaInscripcion: RegistroSelectOption[];
	vinculacionPrograma: RegistroSelectOption[];
};

export type RegistroOpcionesResultado = {
	opciones: RegistroSelectOptions;
	errores: string[];
};

const BASE_URL = import.meta.env.VITE_API_URL;

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
	const headers = {
		"Content-Type": "application/json",
		...init?.headers,
	};

	const response = await fetch(`${BASE_URL}${path}`, {
		...init,
		method: init?.method ?? "GET",
		headers,
	});

	if (!response.ok) {
		throw new Error(`No se pudieron cargar los datos (${response.status})`);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}

const REGISTRO_BASE = "/api/application/case/inscripciones";

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object";
}

function normalizeText(value: string) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function extractItems(response: unknown): Record<string, unknown>[] {
	if (Array.isArray(response)) {
		return response.filter(isRecord);
	}

	if (isRecord(response)) {
		for (const key of ["items", "data", "result", "content"]) {
			const value = response[key];
			if (Array.isArray(value)) {
				return value.filter(isRecord);
			}
		}
	}

	return [];
}

function toLabel(value: unknown): string | null {
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed ? trimmed : null;
	}

	if (typeof value === "number" && Number.isFinite(value)) {
		return String(value);
	}

	return null;
}

function toSelectOptions(response: unknown, labelKeys: string[]): RegistroSelectOption[] {
	return extractItems(response).map((item, index) => {
		const rawValue = item.id ?? item.cohorteId ?? item.value ?? item.codigo ?? index + 1;
		const label = labelKeys.map((key) => toLabel(item[key])).find((entry): entry is string => Boolean(entry)) ?? `Opción ${index + 1}`;

		return {
			value: String(rawValue),
			label,
		};
	});
}

async function fetchSelectOptions(path: string, labelKeys: string[]): Promise<RegistroSelectOption[]> {
	return toSelectOptions(await fetchJson<unknown>(path), labelKeys);
}

async function fetchSelectOptionsFromPaths(paths: string[], labelKeys: string[]): Promise<RegistroSelectOption[]> {
	let lastError: unknown = null;

	for (const path of paths) {
		try {
			return await fetchSelectOptions(path, labelKeys);
		} catch (error) {
			lastError = error;
			if (!(error instanceof Error) || !error.message.includes("(404)")) {
				throw error;
			}
		}
	}

	if (lastError instanceof Error) {
		throw lastError;
	}

	throw new Error("No se pudieron cargar los datos de registro");
}

const SI_NO_OPTIONS: RegistroSelectOption[] = [
	{ value: "si", label: "Sí" },
	{ value: "no", label: "No" },
];

let paisesPromise: Promise<RegistroSelectOption[]> | null = null;
let departamentosPromise: Promise<RegistroSelectOption[]> | null = null;
let municipiosPromise: Promise<RegistroSelectOption[]> | null = null;
let programasPromise: Promise<RegistroSelectOption[]> | null = null;

async function listarPaisesRegistro() {
	if (!paisesPromise) {
		paisesPromise = fetchSelectOptions(`${REGISTRO_BASE}/paises`, ["nombre", "pais"]).catch((error) => {
			paisesPromise = null;
			throw error;
		});
	}

	return paisesPromise;
}

async function listarDepartamentosPorPaisRegistro(idPais: string) {
	return fetchSelectOptions(`${REGISTRO_BASE}/paises/${encodeURIComponent(idPais)}/departamentos`, ["nombre", "departamento"]);
}

async function listarMunicipiosPorDepartamentoRegistro(idDepartamento: string) {
	return fetchSelectOptions(`${REGISTRO_BASE}/departamentos/${encodeURIComponent(idDepartamento)}/municipios`, ["nombre", "municipio"]);
}

async function obtenerPaisPredeterminadoId() {
	const paises = await listarPaisesRegistro();
	const paisPredeterminado = paises.find((pais) => normalizeText(pais.label) === "colombia") ?? paises[0];
	return paisPredeterminado?.value ?? null;
}

async function listarDepartamentosBaseRegistro() {
	if (!departamentosPromise) {
		departamentosPromise = (async () => {
			const idPais = await obtenerPaisPredeterminadoId();
			if (!idPais) {
				return [];
			}

			return listarDepartamentosPorPaisRegistro(idPais);
		})().catch((error) => {
			departamentosPromise = null;
			throw error;
		});
	}

	return departamentosPromise;
}

async function obtenerDepartamentoPredeterminadoId() {
	const departamentos = await listarDepartamentosBaseRegistro();
	const departamentoPredeterminado = departamentos.find((departamento) => normalizeText(departamento.label) === "norte de santander") ?? departamentos[0];
	return departamentoPredeterminado?.value ?? null;
}

async function listarMunicipiosBaseRegistro() {
	if (!municipiosPromise) {
		municipiosPromise = (async () => {
			const idDepartamento = await obtenerDepartamentoPredeterminadoId();
			if (!idDepartamento) {
				return [];
			}

			return listarMunicipiosPorDepartamentoRegistro(idDepartamento);
		})().catch((error) => {
			municipiosPromise = null;
			throw error;
		});
	}

	return municipiosPromise;
}

export function listarDocumentosRegistro() {
	return fetchSelectOptions(`${REGISTRO_BASE}/tipos-documento`, ["tipo", "nombre"]);
}

export function listarEstadosCivilesRegistro() {
	return fetchSelectOptions(`${REGISTRO_BASE}/estados-civiles`, ["tipo", "nombre"]);
}

export function listarSexosBiologicosRegistro() {
	return fetchSelectOptions(`${REGISTRO_BASE}/generos`, ["genero", "nombre"]);
}

export function listarDepartamentosNacimientoRegistro() {
	return listarDepartamentosBaseRegistro();
}

export function listarMunicipiosRegistro() {
	return listarMunicipiosBaseRegistro();
}

export function listarDepartamentosExpedicionRegistro() {
	return listarDepartamentosBaseRegistro();
}

export function listarZonasResidenciaRegistro() {
	return fetchSelectOptions(`${REGISTRO_BASE}/zonas-residencia`, ["nombre", "zona"]);
}

export function listarDepartamentosResidenciaRegistro() {
	return listarDepartamentosBaseRegistro();
}

export function listarGruposEtnicosRegistro() {
	return fetchSelectOptions(`${REGISTRO_BASE}/grupos-etnicos`, ["nombre", "grupoEtnico"]);
}

export function listarPueblosIndigenasRegistro() {
	return fetchSelectOptions(`${REGISTRO_BASE}/pueblos-indigenas`, ["nombre", "puebloIndigena"]);
}

export function listarSiNoRegistro() {
	return Promise.resolve(SI_NO_OPTIONS);
}

export function listarDepartamentosTrabajoRegistro() {
	return listarDepartamentosBaseRegistro();
}

export function listarProgramasInscripcionRegistro() {
	if (!programasPromise) {
		programasPromise = fetchSelectOptionsFromPaths([
			`${REGISTRO_BASE}/programas-inscripcion`,
		], ["nombre", "programa", "titulo"]).catch((error) => {
			programasPromise = null;
			throw error;
		});
	}

	return programasPromise;
}

export function listarVinculacionesProgramaRegistro() {
	return fetchSelectOptions(`${REGISTRO_BASE}/tipos-vinculacion`, ["nombre", "tipo", "descripcion"]);
}

export async function listarCohortesRegistro(idPrograma: string) {
	const cohortes = await fetchJson<Array<Record<string, unknown>>>(
		`${REGISTRO_BASE}/programa/${encodeURIComponent(idPrograma)}/cohortes`
	);

	return cohortes.map((cohorte, index) => ({
		value: String(cohorte.id ?? cohorte.cohorteId ?? index + 1),
		label: String(cohorte.nombre ?? cohorte.label ?? `Cohorte ${index + 1}`),
	}));
}

export async function registrarInscripcion(payload: Record<string, unknown>) {
	return fetchJson<unknown>("/api/v1/inscripciones", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function registrarUsuarioAspirante(payload: {
	idPersona: number;
	usuario: string;
	contrasena: string;
}) {
	return fetchJson<unknown>("/api/application/case/registro", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function listarOpcionesRegistro(): Promise<RegistroOpcionesResultado> {
	const resultados = await Promise.allSettled([
		listarDocumentosRegistro(),
		listarEstadosCivilesRegistro(),
		listarSexosBiologicosRegistro(),
		listarDepartamentosNacimientoRegistro(),
		listarMunicipiosRegistro(),
		listarDepartamentosExpedicionRegistro(),
		listarZonasResidenciaRegistro(),
		listarDepartamentosResidenciaRegistro(),
		listarGruposEtnicosRegistro(),
		listarPueblosIndigenasRegistro(),
		listarSiNoRegistro(),
		listarDepartamentosTrabajoRegistro(),
		listarProgramasInscripcionRegistro(),
		listarVinculacionesProgramaRegistro(),
	]);

	const errores: string[] = [];
	const obtenerValor = (index: number) => {
		const resultado = resultados[index];
		if (resultado.status === "fulfilled") {
			return resultado.value;
		}

		errores.push(resultado.reason instanceof Error ? resultado.reason.message : "No se pudieron cargar algunas opciones del registro.");
		return [] as RegistroSelectOption[];
	};

	const opciones: RegistroSelectOptions = {
		documento: obtenerValor(0),
		estadoCivil: obtenerValor(1),
		sexoBiologico: obtenerValor(2),
		departamentoNacimiento: obtenerValor(3),
		municipio: obtenerValor(4),
		departamentoExpedicion: obtenerValor(5),
		zonaResidencia: obtenerValor(6),
		departamentoResidencia: obtenerValor(7),
		grupoEtnico: obtenerValor(8),
		puebloIndigena: obtenerValor(9),
		siNo: obtenerValor(10),
		departamentoTrabajo: obtenerValor(11),
		programaInscripcion: obtenerValor(12),
		vinculacionPrograma: obtenerValor(13),
	};

	if (errores.length > 0) {
		console.error("Algunas opciones del registro no se pudieron cargar:", errores);
	}

	return {
		opciones,
		errores,
	};
}
