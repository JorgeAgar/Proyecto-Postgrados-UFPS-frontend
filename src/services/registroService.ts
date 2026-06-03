export type RegistroSelectOption = {
	value: string;
	label: string;
};

export type RegistroSelectOptions = {
	documento: RegistroSelectOption[];
	estadoCivil: RegistroSelectOption[];
	sexoBiologico: RegistroSelectOption[];
	paisNacimiento: RegistroSelectOption[];
	departamentoNacimiento: RegistroSelectOption[];
	paisTrabajo: RegistroSelectOption[];
	municipio: RegistroSelectOption[];
	departamentoExpedicion: RegistroSelectOption[];
	zonaResidencia: RegistroSelectOption[];
	paisResidencia: RegistroSelectOption[];
	departamentoResidencia: RegistroSelectOption[];
	grupoEtnico: RegistroSelectOption[];
	puebloIndigena: RegistroSelectOption[];
	capacidadExcepcional: RegistroSelectOption[];
	discapacidades: RegistroSelectOption[];
	siNo: RegistroSelectOption[];
	departamentoTrabajo: RegistroSelectOption[];
	programaInscripcion: RegistroSelectOption[];
	vinculacionPrograma: RegistroSelectOption[];
};

export type RegistroOpcionesResultado = {
	opciones: RegistroSelectOptions;
	errores: string[];
};

export type RegistroFormularioData = {
	nombres: string;
	apellidos: string;
	tipoDocumento: string;
	numeroDocumento: string;
	estadoCivil: string;
	sexoBiologico: string;
	fechaNacimiento: string;
	paisNacimiento: string;
	departamentoNacimiento: string;
	municipioNacimiento: string;
	fechaExpedicion: string;
	departamentoExpedicion: string;
	municipioExpedicion: string;
	zonaResidencia: string;
	paisResidencia: string;
	departamentoResidencia: string;
	municipioResidencia: string;
	direccionResidencia: string;
	correoPersonal: string;
	telefonoContacto: string;
	grupoEtnico: string;
	puebloIndigena: string;
	tipoDiscapacidad: string;
	capacidadExcepcional: string;
	empresaTrabajo: string;
	paisTrabajo: string;
	departamentoTrabajo: string;
	municipioTrabajo: string;
	direccionTrabajo: string;
	experienciaLaboral: string;
	programaInscripcion: string;
	cohorteInscripcion: string;
	vinculacionPrograma: string;
	tituloPregrado: string;
	promedioPregrado: string;
	titulosPostgrado: string;
	egresadoUFPS: string;
	usuarioRegistro: string;
	contrasenaRegistro: string;
};

type RegistrarNuevoUsuarioResponse = {
	idPersona?: number;
	idAspirante?: number;
	idUsuario?: number;
	nombreusuario?: string;
};

const BASE_URL = import.meta.env.VITE_API_URL;
const REGISTRO_BASE = "/api/application/case/inscripciones";

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
		let message = `No se pudieron cargar los datos (${response.status})`;
		try {
			const body = await response.json() as Record<string, unknown>;
			if (typeof body.message === "string" && body.message) {
				message = body.message;
			}
		} catch {
			// ignore — use generic message
		}
		throw new Error(message);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return response.json() as Promise<T>;
}

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
let departamentosCache: RegistroSelectOption[] | null = null;
let departamentosPromise: Promise<RegistroSelectOption[]> | null = null;
type MunicipiosCacheEntry = {
	departamentoId: string;
	municipios: RegistroSelectOption[];
};

let municipiosCache: MunicipiosCacheEntry[] = [];
const municipiosPendientes: Record<string, Promise<RegistroSelectOption[]>> = {};
let programasPromise: Promise<RegistroSelectOption[]> | null = null;

export async function listarPaisesRegistro() {
	if (!paisesPromise) {
		paisesPromise = fetchSelectOptions(`${REGISTRO_BASE}/paises`, ["nombre", "pais"]).catch((error) => {
			paisesPromise = null;
			throw error;
		});
	}

	return paisesPromise;
}

export async function listarDepartamentosPorPaisRegistro(idPais: string) {
	return fetchSelectOptions(`${REGISTRO_BASE}/paises/${encodeURIComponent(idPais)}/departamentos`, ["nombre", "departamento"]);
}

async function listarMunicipiosPorDepartamentoRegistroInterno(idDepartamento: string) {
	return fetchSelectOptions(`${REGISTRO_BASE}/departamentos/${encodeURIComponent(idDepartamento)}/municipios`, ["nombre", "municipio"]);
}

async function obtenerPaisPredeterminadoId() {
	const paises = await listarPaisesRegistro();
	const paisPredeterminado = paises.find((pais) => normalizeText(pais.label) === "colombia") ?? paises[0];
	return paisPredeterminado?.value ?? null;
}

async function listarDepartamentosBaseRegistro() {
	if (departamentosCache) {
		return departamentosCache;
	}

	if (!departamentosPromise) {
		departamentosPromise = (async () => {
			const idPais = await obtenerPaisPredeterminadoId();
			if (!idPais) {
				return [] as RegistroSelectOption[];
			}

			return listarDepartamentosPorPaisRegistro(idPais);
		})().catch((error) => {
			departamentosPromise = null;
			throw error;
		}).then((departamentos) => {
			departamentosCache = departamentos;
			return departamentos;
		});
	}

	return departamentosPromise;
}

async function obtenerDepartamentoPredeterminadoId() {
	const departamentos = await listarDepartamentosBaseRegistro();
	const departamentoPredeterminado = departamentos.find((departamento) => normalizeText(departamento.label) === "norte de santander") ?? departamentos[0];
	return departamentoPredeterminado?.value ?? null;
}

function obtenerMunicipiosCache(idDepartamento: string) {
	return municipiosCache.find((entry) => entry.departamentoId === idDepartamento) ?? null;
}

async function listarMunicipiosBaseRegistro() {
	const idDepartamento = await obtenerDepartamentoPredeterminadoId();
	if (!idDepartamento) {
		return [];
	}

	return listarMunicipiosPorDepartamentoRegistroInterno(idDepartamento);
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

export async function listarMunicipiosPorDepartamentoRegistro(idDepartamento: string) {
	const municipiosCacheados = obtenerMunicipiosCache(idDepartamento);
	if (municipiosCacheados) {
		return municipiosCacheados.municipios;
	}

	const pendiente = municipiosPendientes[idDepartamento];
	if (pendiente) {
		return pendiente;
	}

	const request = fetchSelectOptions(`${REGISTRO_BASE}/departamentos/${encodeURIComponent(idDepartamento)}/municipios`, ["nombre", "municipio"])
		.then((municipios) => {
			const cacheExistente = obtenerMunicipiosCache(idDepartamento);
			if (cacheExistente) {
				cacheExistente.municipios = municipios;
			} else {
				municipiosCache.push({ departamentoId: idDepartamento, municipios });
			}

			return municipios;
		})
		.catch((error) => {
			municipiosCache = municipiosCache.filter((entry) => entry.departamentoId !== idDepartamento);
			throw error;
		})
		.finally(() => {
			delete municipiosPendientes[idDepartamento];
		});

	municipiosPendientes[idDepartamento] = request;
	return request;
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

export function listarCapacidadesExcepcionalesRegistro() {
	return fetchSelectOptions(`${REGISTRO_BASE}/capacidades-excepcionales`, ["nombre", "capacidadExcepcional"]);
}

export function listarDiscapacidadesRegistro() {
	return fetchSelectOptions(`${REGISTRO_BASE}/discapacidades`, ["nombre", "tipo"]);
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
			`${REGISTRO_BASE}/programas`,
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

function toNumero(value: string) {
	const numero = Number(value);
	return Number.isFinite(numero) ? numero : undefined;
}

function toTexto(value: string) {
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function toEnteroSeleccion(value: string) {
	const numero = toNumero(value);
	return typeof numero === "number" ? numero : 0;
}

function toIdUbicacion(value: string) {
	if (value === "EXTRANJERO") return 1;
	return toNumero(value);
}

function construirPayloadNuevoUsuario(form: RegistroFormularioData) {
	return {
		nombres: form.nombres.trim(),
		apellidos: form.apellidos.trim(),
		idTipoDoc: toNumero(form.tipoDocumento),
		numeroDocumento: form.numeroDocumento.trim(),
		idEstadoCivil: toNumero(form.estadoCivil),
		idGenero: toNumero(form.sexoBiologico),
		fechaNacimiento: form.fechaNacimiento,
		fechaExpedicionDocumento: form.fechaExpedicion,
		idDeptoExpedicionDoc: toNumero(form.departamentoExpedicion),
		idMunicipioExpedicionDoc: toNumero(form.municipioExpedicion),
		titulosPostgrado: toTexto(form.titulosPostgrado),
		tituloPregrado: form.tituloPregrado.trim(),
		email: form.correoPersonal.trim(),
		empresa: form.empresaTrabajo.trim(),
		telefonoContacto: form.telefonoContacto.trim(),
		promedioPonderadoAcumulado: toNumero(form.promedioPregrado),
		idGrupoEtnico: toNumero(form.grupoEtnico),
		idPuebloIndigena: toNumero(form.puebloIndigena) ?? 0,
		idCapacidadExcepcional: toEnteroSeleccion(form.capacidadExcepcional),
		egresadoUfpsCucuta: form.egresadoUFPS === "si",
		experienciaLaboral: form.experienciaLaboral.trim(),
		idDiscapacidad: toEnteroSeleccion(form.tipoDiscapacidad),
		ubicacionNacimiento: {
			idDeptoNacimiento: toIdUbicacion(form.departamentoNacimiento),
			idMunicipioNacimiento: toIdUbicacion(form.municipioNacimiento),
		},
		ubicacionTrabajo: {
			idDptoTrabajo: toIdUbicacion(form.departamentoTrabajo),
			idMunicipioTrabajo: toIdUbicacion(form.municipioTrabajo),
			direccionTrabajo: toTexto(form.direccionTrabajo),
		},
		ubicacionResidencia: {
			zonaResidencia: form.zonaResidencia,
			idDeptoResidencia: toIdUbicacion(form.departamentoResidencia),
			idMunicipioResidencia: toIdUbicacion(form.municipioResidencia),
			direccionResidencia: form.direccionResidencia.trim(),
		},
		idCohorte: toNumero(form.cohorteInscripcion),
		idTipoVinculacion: toNumero(form.vinculacionPrograma),
		usuario: form.usuarioRegistro.trim(),
		contrasena: form.contrasenaRegistro,
	};
}

export async function registrarAspiranteCompleto(form: RegistroFormularioData) {
	const payload = construirPayloadNuevoUsuario(form);
	const respuesta = await fetchJson<RegistrarNuevoUsuarioResponse>(`${REGISTRO_BASE}/formulario/registrar-nuevo-usuario`, {
		method: "POST",
		body: JSON.stringify(payload),
	});

	return respuesta;
}

export async function listarOpcionesRegistro(): Promise<RegistroOpcionesResultado> {
	const resultados = await Promise.allSettled([
		listarDocumentosRegistro(),
		listarEstadosCivilesRegistro(),
		listarSexosBiologicosRegistro(),
		listarDepartamentosNacimientoRegistro(),
		listarDepartamentosExpedicionRegistro(),
		listarZonasResidenciaRegistro(),
		listarDepartamentosResidenciaRegistro(),
		listarGruposEtnicosRegistro(),
		listarPueblosIndigenasRegistro(),
		listarCapacidadesExcepcionalesRegistro(),
		listarDiscapacidadesRegistro(),
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
		paisNacimiento: [],
		departamentoNacimiento: obtenerValor(3),
		municipio: [],
		departamentoExpedicion: obtenerValor(4),
		zonaResidencia: obtenerValor(5),
		paisResidencia: [],
		departamentoResidencia: obtenerValor(6),
		grupoEtnico: obtenerValor(7),
		puebloIndigena: obtenerValor(8),
		capacidadExcepcional: obtenerValor(9),
		discapacidades: obtenerValor(10),
		siNo: obtenerValor(11),
		paisTrabajo: [],
		departamentoTrabajo: obtenerValor(12),
		programaInscripcion: obtenerValor(13),
		vinculacionPrograma: obtenerValor(14),
	};

	if (errores.length > 0) {
		console.error("Algunas opciones del registro no se pudieron cargar:", errores);
	}

	return {
		opciones,
		errores,
	};
}