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

// NOTE: This service provides static option lists. Remove artificial delays and mocks.
// These functions return the option lists immediately; replace with real endpoints if needed.

const DOCUMENTO_OPTIONS: RegistroSelectOption[] = [
	{ value: "CC", label: "Cédula de ciudadanía" },
	{ value: "TI", label: "Tarjeta de identidad" },
	{ value: "CE", label: "Cédula de extranjería" },
	{ value: "PA", label: "Pasaporte" },
];

const ESTADO_CIVIL_OPTIONS: RegistroSelectOption[] = [
	{ value: "soltero", label: "Soltero(a)" },
	{ value: "casado", label: "Casado(a)" },
	{ value: "union_libre", label: "Unión libre" },
	{ value: "divorciado", label: "Divorciado(a)" },
	{ value: "viudo", label: "Viudo(a)" },
];

const SEXO_BIOLOGICO_OPTIONS: RegistroSelectOption[] = [
	{ value: "femenino", label: "Femenino" },
	{ value: "masculino", label: "Masculino" },
	{ value: "intersexual", label: "Intersexual" },
	{ value: "otro", label: "Otro" },
	{ value: "prefiero_no_decir", label: "Prefiero no decirlo" },
];

const ZONA_RESIDENCIA_OPTIONS: RegistroSelectOption[] = [
	{ value: "urbana", label: "Urbana" },
	{ value: "rural", label: "Rural" },
];

const DEPARTAMENTO_NACIMIENTO_OPTIONS: RegistroSelectOption[] = [
	{ value: "norte_de_santander", label: "Norte de Santander" },
	{ value: "santander", label: "Santander" },
	{ value: "antioquia", label: "Antioquia" },
	{ value: "cundinamarca", label: "Cundinamarca" },
	{ value: "otro", label: "Otro" },
];

const MUNICIPIO_OPTIONS: RegistroSelectOption[] = [
	{ value: "cucuta", label: "Cúcuta" },
	{ value: "bucaramanga", label: "Bucaramanga" },
	{ value: "bogota", label: "Bogotá" },
	{ value: "medellin", label: "Medellín" },
	{ value: "otra", label: "Otra" },
];

const DEPARTAMENTO_EXPEDICION_OPTIONS: RegistroSelectOption[] = [
	{ value: "norte_de_santander", label: "Norte de Santander" },
	{ value: "santander", label: "Santander" },
	{ value: "antioquia", label: "Antioquia" },
	{ value: "cundinamarca", label: "Cundinamarca" },
	{ value: "otro", label: "Otro" },
];

const DEPARTAMENTO_RESIDENCIA_OPTIONS: RegistroSelectOption[] = [
	{ value: "norte_de_santander", label: "Norte de Santander" },
	{ value: "santander", label: "Santander" },
	{ value: "antioquia", label: "Antioquia" },
	{ value: "cundinamarca", label: "Cundinamarca" },
	{ value: "otro", label: "Otro" },
];

const GRUPO_ETNICO_OPTIONS: RegistroSelectOption[] = [
	{ value: "ninguno", label: "Ninguno" },
	{ value: "afrodescendiente", label: "Afrodescendiente" },
	{ value: "raizal", label: "Raizal" },
	{ value: "rom", label: "Pueblo Rom" },
	{ value: "indigena", label: "Indígena" },
	{ value: "otro", label: "Otro" },
];

const PUEBLO_INDIGENA_OPTIONS: RegistroSelectOption[] = [
	{ value: "ninguno", label: "Ninguno / No aplica" },
	{ value: "arhuaco", label: "Arhuaco" },
	{ value: "wayuu", label: "Wayuu" },
	{ value: "guajibo", label: "Guahibo" },
	{ value: "otro", label: "Otro" },
];

const SI_NO_OPTIONS: RegistroSelectOption[] = [
	{ value: "si", label: "Sí" },
	{ value: "no", label: "No" },
];

const DEPARTAMENTO_TRABAJO_OPTIONS: RegistroSelectOption[] = [
	{ value: "norte_de_santander", label: "Norte de Santander" },
	{ value: "santander", label: "Santander" },
	{ value: "antioquia", label: "Antioquia" },
	{ value: "cundinamarca", label: "Cundinamarca" },
	{ value: "otro", label: "Otro" },
];

const PROGRAMA_INSCRIPCION_OPTIONS: RegistroSelectOption[] = [
	{ value: "especializacion_gestion_publica", label: "Especialización en Gestión Pública" },
	{ value: "maestria_educacion", label: "Maestría en Educación" },
	{ value: "maestria_ingenieria", label: "Maestría en Ingeniería" },
	{ value: "doctorado_ciencias", label: "Doctorado en Ciencias" },
	{ value: "otro", label: "Otro" },
];

const VINCULACION_PROGRAMA_OPTIONS: RegistroSelectOption[] = [
	{ value: "nuevo", label: "Estudiante nuevo" },
	{ value: "transferencia_interna", label: "Transferencia interna" },
	{ value: "transferencia_externa", label: "Transferencia externa" },
	{ value: "transferencia_seccional", label: "Transferencia entre seccionales" },
	{ value: "doble_programa", label: "Doble programa" },
];

export function listarDocumentosRegistro() {
    return Promise.resolve(DOCUMENTO_OPTIONS);
}

export function listarEstadosCivilesRegistro() {
    return Promise.resolve(ESTADO_CIVIL_OPTIONS);
}

export function listarSexosBiologicosRegistro() {
    return Promise.resolve(SEXO_BIOLOGICO_OPTIONS);
}

export function listarDepartamentosNacimientoRegistro() {
    return Promise.resolve(DEPARTAMENTO_NACIMIENTO_OPTIONS);
}

export function listarMunicipiosRegistro() {
    return Promise.resolve(MUNICIPIO_OPTIONS);
}

export function listarDepartamentosExpedicionRegistro() {
    return Promise.resolve(DEPARTAMENTO_EXPEDICION_OPTIONS);
}

export function listarZonasResidenciaRegistro() {
    return Promise.resolve(ZONA_RESIDENCIA_OPTIONS);
}

export function listarDepartamentosResidenciaRegistro() {
    return Promise.resolve(DEPARTAMENTO_RESIDENCIA_OPTIONS);
}

export function listarGruposEtnicosRegistro() {
    return Promise.resolve(GRUPO_ETNICO_OPTIONS);
}

export function listarPueblosIndigenasRegistro() {
    return Promise.resolve(PUEBLO_INDIGENA_OPTIONS);
}

export function listarSiNoRegistro() {
    return Promise.resolve(SI_NO_OPTIONS);
}

export function listarDepartamentosTrabajoRegistro() {
    return Promise.resolve(DEPARTAMENTO_TRABAJO_OPTIONS);
}

export function listarProgramasInscripcionRegistro() {
    return Promise.resolve(PROGRAMA_INSCRIPCION_OPTIONS);
}

export function listarVinculacionesProgramaRegistro() {
    return Promise.resolve(VINCULACION_PROGRAMA_OPTIONS);
}

export async function listarOpcionesRegistro(): Promise<RegistroSelectOptions> {
	const [
		documento,
		estadoCivil,
		sexoBiologico,
		departamentoNacimiento,
		municipio,
		departamentoExpedicion,
		zonaResidencia,
		departamentoResidencia,
		grupoEtnico,
		puebloIndigena,
		siNo,
		departamentoTrabajo,
		programaInscripcion,
		vinculacionPrograma,
	] = await Promise.all([
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

	return {
		documento,
		estadoCivil,
		sexoBiologico,
		departamentoNacimiento,
		municipio,
		departamentoExpedicion,
		zonaResidencia,
		departamentoResidencia,
		grupoEtnico,
		puebloIndigena,
		siNo,
		departamentoTrabajo,
		programaInscripcion,
		vinculacionPrograma,
	};
}
