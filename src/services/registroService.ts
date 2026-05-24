export type RegistroSelectOption = {
	value: string;
	label: string;
};

export type RegistroSelectOptions = {
	tipoDocumento: RegistroSelectOption[];
	estadoCivil: RegistroSelectOption[];
	sexoBiologico: RegistroSelectOption[];
	zonaResidencia: RegistroSelectOption[];
	grupoEtnico: RegistroSelectOption[];
	siNo: RegistroSelectOption[];
	vinculacionPrograma: RegistroSelectOption[];
};

const MOCK_DELAY_MS = 5000;

function delay(ms: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function withMockDelay<T>(value: T): Promise<T> {
	await delay(MOCK_DELAY_MS);
	return value;
}

const TIPO_DOCUMENTO_OPTIONS: RegistroSelectOption[] = [
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

const GRUPO_ETNICO_OPTIONS: RegistroSelectOption[] = [
	{ value: "ninguno", label: "Ninguno" },
	{ value: "afrodescendiente", label: "Afrodescendiente" },
	{ value: "raizal", label: "Raizal" },
	{ value: "rom", label: "Pueblo Rom" },
	{ value: "indigena", label: "Indígena" },
	{ value: "otro", label: "Otro" },
];

const SI_NO_OPTIONS: RegistroSelectOption[] = [
	{ value: "si", label: "Sí" },
	{ value: "no", label: "No" },
];

const VINCULACION_PROGRAMA_OPTIONS: RegistroSelectOption[] = [
	{ value: "nuevo", label: "Estudiante nuevo" },
	{ value: "transferencia_interna", label: "Transferencia interna" },
	{ value: "transferencia_externa", label: "Transferencia externa" },
	{ value: "transferencia_seccional", label: "Transferencia entre seccionales" },
	{ value: "doble_programa", label: "Doble programa" },
];

export function listarTiposDocumentoRegistro() {
	return withMockDelay(TIPO_DOCUMENTO_OPTIONS);
}

export function listarEstadosCivilesRegistro() {
	return withMockDelay(ESTADO_CIVIL_OPTIONS);
}

export function listarSexosBiologicosRegistro() {
	return withMockDelay(SEXO_BIOLOGICO_OPTIONS);
}

export function listarZonasResidenciaRegistro() {
	return withMockDelay(ZONA_RESIDENCIA_OPTIONS);
}

export function listarGruposEtnicosRegistro() {
	return withMockDelay(GRUPO_ETNICO_OPTIONS);
}

export function listarSiNoRegistro() {
	return withMockDelay(SI_NO_OPTIONS);
}

export function listarVinculacionesProgramaRegistro() {
	return withMockDelay(VINCULACION_PROGRAMA_OPTIONS);
}

export async function listarOpcionesRegistro(): Promise<RegistroSelectOptions> {
	const [tipoDocumento, estadoCivil, sexoBiologico, zonaResidencia, grupoEtnico, siNo, vinculacionPrograma] = await Promise.all([
		listarTiposDocumentoRegistro(),
		listarEstadosCivilesRegistro(),
		listarSexosBiologicosRegistro(),
		listarZonasResidenciaRegistro(),
		listarGruposEtnicosRegistro(),
		listarSiNoRegistro(),
		listarVinculacionesProgramaRegistro(),
	]);

	return {
		tipoDocumento,
		estadoCivil,
		sexoBiologico,
		zonaResidencia,
		grupoEtnico,
		siNo,
		vinculacionPrograma,
	};
}
