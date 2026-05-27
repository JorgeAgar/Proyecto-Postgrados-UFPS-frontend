import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
	AcademicCapIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	BriefcaseIcon,
	CheckCircleIcon,
	ClipboardDocumentListIcon,
	ExclamationCircleIcon,
	HomeIcon,
	EyeIcon,
	EyeSlashIcon,
	UserIcon,
} from "@heroicons/react/24/outline";
import ufpsLogo from "../assets/logoufps.png";
import { listarCohortesRegistro, listarOpcionesRegistro, type RegistroSelectOption, type RegistroSelectOptions } from "../services/registroService";

type TabId = "personales" | "residencia" | "especial" | "laboral" | "academica" | "usuario";

type FormState = {
	nombresApellidos: string;
	tipoDocumento: string;
	numeroDocumento: string;
	estadoCivil: string;
	sexoBiologico: string;
	fechaNacimiento: string;
	departamentoNacimiento: string;
	municipioNacimiento: string;
	fechaExpedicion: string;
	departamentoExpedicion: string;
	municipioExpedicion: string;
	zonaResidencia: string;
	departamentoResidencia: string;
	municipioResidencia: string;
	direccionResidencia: string;
	correoPersonal: string;
	telefonoContacto: string;
	grupoEtnico: string;
	puebloIndigena: string;
	tieneDiscapacidad: string;
	tipoDiscapacidad: string;
	capacidadExcepcional: string;
	empresaTrabajo: string;
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

type Errors = Partial<Record<keyof FormState, string>>;

const TABS: Array<{
	id: TabId;
	title: string;
	icon: typeof UserIcon;
	fields: Array<keyof FormState>;
}> = [
	{
		id: "personales",
		title: "Datos personales",
		icon: UserIcon,
		fields: [
			"nombresApellidos",
			"tipoDocumento",
			"numeroDocumento",
			"estadoCivil",
			"sexoBiologico",
			"fechaNacimiento",
			"departamentoNacimiento",
			"municipioNacimiento",
			"fechaExpedicion",
			"departamentoExpedicion",
			"municipioExpedicion",
		],
	},
	{
		id: "residencia",
		title: "Residencia y contacto",
		icon: HomeIcon,
		fields: [
			"zonaResidencia",
			"departamentoResidencia",
			"municipioResidencia",
			"direccionResidencia",
			"correoPersonal",
			"telefonoContacto",
		],
	},
	{
		id: "especial",
		title: "Población especial",
		icon: ClipboardDocumentListIcon,
		fields: [
			"grupoEtnico",
			"puebloIndigena",
			"tieneDiscapacidad",
			"tipoDiscapacidad",
			"capacidadExcepcional",
		],
	},
	{
		id: "laboral",
		title: "Datos laborales",
		icon: BriefcaseIcon,
		fields: [
			"empresaTrabajo",
			"departamentoTrabajo",
			"municipioTrabajo",
			"direccionTrabajo",
			"experienciaLaboral",
		],
	},
	{
		id: "academica",
		title: "Datos académicos",
		icon: AcademicCapIcon,
		fields: [
			"programaInscripcion",
			"cohorteInscripcion",
			"vinculacionPrograma",
			"tituloPregrado",
			"promedioPregrado",
			"titulosPostgrado",
			"egresadoUFPS",
		],
	},
	{
		id: "usuario",
		title: "Registro de usuario",
		icon: UserIcon,
		fields: ["usuarioRegistro", "contrasenaRegistro"],
	},
];

const INITIAL_FORM: FormState = {
	nombresApellidos: "",
	tipoDocumento: "",
	numeroDocumento: "",
	estadoCivil: "",
	sexoBiologico: "",
	fechaNacimiento: "",
	departamentoNacimiento: "",
	municipioNacimiento: "",
	fechaExpedicion: "",
	departamentoExpedicion: "",
	municipioExpedicion: "",
	zonaResidencia: "",
	departamentoResidencia: "",
	municipioResidencia: "",
	direccionResidencia: "",
	correoPersonal: "",
	telefonoContacto: "",
	grupoEtnico: "",
	puebloIndigena: "",
	tieneDiscapacidad: "",
	tipoDiscapacidad: "",
	capacidadExcepcional: "",
	empresaTrabajo: "",
	departamentoTrabajo: "",
	municipioTrabajo: "",
	direccionTrabajo: "",
	experienciaLaboral: "",
	programaInscripcion: "",
	cohorteInscripcion: "",
	vinculacionPrograma: "",
	tituloPregrado: "",
	promedioPregrado: "",
	titulosPostgrado: "",
	egresadoUFPS: "",
	usuarioRegistro: "",
	contrasenaRegistro: "",
};

function fieldClass(error?: string) {
	return [
		"mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition",
		error ? "border-red-200 focus:border-red-300 focus:ring-2 focus:ring-red-200" : "border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-200",
	].join(" ");
}

function Label({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
	return (
		<label htmlFor={htmlFor} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
			{children}
		</label>
	);
}

function Input({
	id,
	label,
	value,
	onChange,
	error,
	placeholder,
	type = "text",
	autoComplete,
}: {
	id: keyof FormState;
	label: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	placeholder?: string;
	type?: string;
	autoComplete?: string;
}) {
	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				autoComplete={autoComplete}
				className={fieldClass(error)}
			/>
			{error && <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-700"><ExclamationCircleIcon className="h-4 w-4 shrink-0" />{error}</p>}
		</div>
	);
}

function Select({
	id,
	label,
	value,
	onChange,
	options,
	error,
	loading,
	disabled,
}: {
	id: keyof FormState;
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: Array<RegistroSelectOption>;
	error?: string;
	loading?: boolean;
	disabled?: boolean;
}) {
	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			<select
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={loading || disabled}
				className={fieldClass(error)}
			>
				{loading ? (
					<option value="">Cargando opciones...</option>
				) : (
					<>
						<option value="">Selecciona una opción</option>
						{options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</>
				)}
			</select>
			{error && <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-700"><ExclamationCircleIcon className="h-4 w-4 shrink-0" />{error}</p>}
		</div>
	);
}

function TextArea({
	id,
	label,
	value,
	onChange,
	error,
	placeholder,
	rows = 4,
}: {
	id: keyof FormState;
	label: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	placeholder?: string;
	rows?: number;
}) {
	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			<textarea
				id={id}
				rows={rows}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={`${fieldClass(error)} resize-y`}
			/>
			{error && <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-700"><ExclamationCircleIcon className="h-4 w-4 shrink-0" />{error}</p>}
		</div>
	);
}

function PasswordInput({
	id,
	label,
	value,
	onChange,
	error,
	placeholder,
	showPassword,
	onToggleShowPassword,
}: {
	id: keyof FormState;
	label: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	placeholder?: string;
	showPassword: boolean;
	onToggleShowPassword: () => void;
}) {
	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			<div className="relative mt-1">
				<input
					id={id}
					type={showPassword ? "text" : "password"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className={`${fieldClass(error)} pr-12`}
				/>
				<button
					type="button"
					onClick={onToggleShowPassword}
					className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-500 transition hover:text-gray-700"
					aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
				>
					{showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
				</button>
			</div>
			{error && <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-700"><ExclamationCircleIcon className="h-4 w-4 shrink-0" />{error}</p>}
		</div>
	);
}

export default function Registro() {
	const [activeTab, setActiveTab] = useState<TabId>("personales");
	const [form, setForm] = useState<FormState>(INITIAL_FORM);
	const [errors, setErrors] = useState<Errors>({});
	const [submitted, setSubmitted] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [selectOptions, setSelectOptions] = useState<RegistroSelectOptions>({
		documento: [],
		estadoCivil: [],
		sexoBiologico: [],
		departamentoNacimiento: [],
		municipio: [],
		departamentoExpedicion: [],
		zonaResidencia: [],
		departamentoResidencia: [],
		grupoEtnico: [],
		puebloIndigena: [],
		siNo: [],
		departamentoTrabajo: [],
		programaInscripcion: [],
		vinculacionPrograma: [],
	});
	const [cohorteOptions, setCohorteOptions] = useState<Array<RegistroSelectOption>>([]);
	const [loadingSelectOptions, setLoadingSelectOptions] = useState(true);
	const [loadingCohorteOptions, setLoadingCohorteOptions] = useState(false);

	const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);

	useEffect(() => {
		let cancelled = false;

		async function loadOptions() {
			setLoadingSelectOptions(true);
			const options = await listarOpcionesRegistro();

			if (cancelled) return;

			setSelectOptions(options);
			setLoadingSelectOptions(false);
		}

		loadOptions().catch((error) => {
			console.error("No se pudieron cargar las opciones del registro:", error);
			if (!cancelled) setLoadingSelectOptions(false);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;

		async function loadCohortes() {
			if (!form.programaInscripcion) {
				setCohorteOptions([]);
				setLoadingCohorteOptions(false);
				return;
			}

			setLoadingCohorteOptions(true);
			try {
				const options = await listarCohortesRegistro(form.programaInscripcion);
				if (cancelled) return;
				setCohorteOptions(options);
			} catch (error) {
				console.error("No se pudieron cargar las cohortes del programa:", error);
				if (!cancelled) setCohorteOptions([]);
			} finally {
				if (!cancelled) setLoadingCohorteOptions(false);
			}
		}

		loadCohortes();

		return () => {
			cancelled = true;
		};
	}, [form.programaInscripcion]);

	function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
		setForm((current) => {
			const next = { ...current, [field]: value };
			if (field === "programaInscripcion") {
				next.cohorteInscripcion = "";
			}
			return next;
		});
		setSubmitted(false);
		setErrors((current) => ({ ...current, [field]: undefined }));
		if (field === "programaInscripcion") {
			setErrors((current) => ({ ...current, cohorteInscripcion: undefined }));
		}
	}

	function validateTab(tabId: TabId) {
		const nextErrors: Errors = {};

		const requireText = (field: keyof FormState, message: string) => {
			if (!String(form[field]).trim()) nextErrors[field] = message;
		};

		const currentTab = TABS.find((tab) => tab.id === tabId);
		if (!currentTab) return nextErrors;

		currentTab.fields.forEach((field) => {
			switch (field) {
				case "nombresApellidos": requireText(field, "Ingresa nombres y apellidos."); break;
				case "tipoDocumento": requireText(field, "Selecciona el tipo de documento."); break;
				case "numeroDocumento": requireText(field, "Ingresa el número de documento."); break;
				case "estadoCivil": requireText(field, "Selecciona el estado civil."); break;
				case "sexoBiologico": requireText(field, "Selecciona el sexo biológico."); break;
				case "fechaNacimiento": requireText(field, "Selecciona la fecha de nacimiento."); break;
				case "departamentoNacimiento": requireText(field, "Selecciona el departamento de nacimiento."); break;
				case "municipioNacimiento": requireText(field, "Selecciona el municipio de nacimiento."); break;
				case "fechaExpedicion": requireText(field, "Selecciona la fecha de expedición."); break;
				case "departamentoExpedicion": requireText(field, "Selecciona el departamento de expedición."); break;
				case "municipioExpedicion": requireText(field, "Selecciona el municipio de expedición."); break;
				case "zonaResidencia": requireText(field, "Selecciona la zona de residencia."); break;
				case "departamentoResidencia": requireText(field, "Indica el departamento de residencia."); break;
				case "municipioResidencia": requireText(field, "Indica el municipio de residencia."); break;
				case "direccionResidencia": requireText(field, "Ingresa la dirección de residencia."); break;
				case "correoPersonal": requireText(field, "Ingresa el correo personal."); break;
				case "telefonoContacto": requireText(field, "Ingresa el número de contacto."); break;
				case "grupoEtnico": requireText(field, "Selecciona el grupo étnico."); break;
				case "puebloIndigena": requireText(field, "Indica el pueblo indígena o N/A."); break;
				case "tieneDiscapacidad": requireText(field, "Indica si tienes discapacidad."); break;
				case "tipoDiscapacidad": {
					if (form.tieneDiscapacidad === "si" && !String(form.tipoDiscapacidad).trim()) {
						nextErrors.tipoDiscapacidad = "Indica el tipo de discapacidad.";
					}
					break;
				}
				case "capacidadExcepcional": requireText(field, "Indica si presentas capacidad excepcional."); break;
				case "empresaTrabajo": requireText(field, "Indica la empresa o escribe N/A."); break;
				case "departamentoTrabajo": requireText(field, "Indica el departamento de trabajo o N/A."); break;
				case "municipioTrabajo": requireText(field, "Indica el municipio de trabajo o N/A."); break;
				case "direccionTrabajo": requireText(field, "Indica la dirección laboral o N/A."); break;
				case "experienciaLaboral": requireText(field, "Describe tu experiencia laboral más reciente."); break;
				case "programaInscripcion": requireText(field, "Indica el programa al que te inscribes."); break;
				case "cohorteInscripcion": requireText(field, "Selecciona la cohorte."); break;
				case "vinculacionPrograma": requireText(field, "Selecciona el tipo de vinculación."); break;
				case "tituloPregrado": requireText(field, "Especifica el título de pregrado."); break;
				case "promedioPregrado": requireText(field, "Ingresa el promedio ponderado acumulado."); break;
				case "titulosPostgrado": requireText(field, "Indica los títulos de postgrado o Ninguno."); break;
				case "egresadoUFPS": requireText(field, "Indica si eres egresado de la UFPS."); break;
				case "usuarioRegistro": requireText(field, "Crea un usuario para el registro."); break;
				case "contrasenaRegistro": {
					const password = String(form.contrasenaRegistro).trim();
					if (!password) {
						nextErrors.contrasenaRegistro = "Crea una contraseña.";
					} else if (password.length < 8) {
						nextErrors.contrasenaRegistro = "La contraseña debe tener 8 caracteres o más.";
					}
					break;
				}
				default:
					break;
			}
		});

		return nextErrors;
	}

	function handleNext() {
		const currentErrors = validateTab(activeTab);
		if (Object.keys(currentErrors).length > 0) {
			setErrors((current) => ({ ...current, ...currentErrors }));
			return;
		}

		if (activeIndex < TABS.length - 1) {
			setActiveTab(TABS[activeIndex + 1].id);
		}
	}

	function handleBack() {
		if (activeIndex > 0) setActiveTab(TABS[activeIndex - 1].id);
	}

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const nextErrors = TABS.reduce<Errors>((acc, tab) => ({ ...acc, ...validateTab(tab.id) }), {});
		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			const firstInvalidTab = TABS.find((tab) => tab.fields.some((field) => nextErrors[field]));
			if (firstInvalidTab) setActiveTab(firstInvalidTab.id);
			setSubmitted(false);
			return;
		}

		setSubmitted(true);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<header className="w-full border-b border-gray-200 bg-white">
				<div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
					<img src={ufpsLogo} alt="Universidad Francisco de Paula Santander" className="h-12 w-auto shrink-0" />
					<div>
						<p className="text-lg font-bold text-gray-900 leading-tight">Universidad Francisco de Paula Santander</p>
						<p className="text-sm text-neutral-400">Inscripciones posgrados</p>
					</div>
				</div>
			</header>

			<div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

				{submitted && (
					<div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-100 px-4 py-3 text-green-700 animate-fade-in-up delay-75">
						<CheckCircleIcon className="h-5 w-5 shrink-0" />
						<div>
							<p className="text-sm font-semibold">Información validada correctamente</p>
							<p className="text-sm text-green-700/90">Puedes continuar revisando o preparar el envío final del registro.</p>
						</div>
					</div>
				)}

				<div className="space-y-6">
					<form onSubmit={handleSubmit} noValidate className="space-y-6">
						<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
								{TABS.map((tab, index) => {
									const active = tab.id === activeTab;
									const hasError = tab.fields.some((field) => Boolean(errors[field]));
									const complete = tab.fields.every((field) => String(form[field]).trim() !== "" && !errors[field]);

									return (
										<button
											key={tab.id}
											type="button"
											onClick={() => setActiveTab(tab.id)}
											className={[
												"rounded-lg border px-2 py-2 text-left transition-all hover:border-gray-300 sm:px-3",
												active ? "border-red-200 bg-red-50 shadow-sm" : "border-gray-200 bg-white",
											].join(" ")}
										>
											<div className="flex items-center gap-1.5 sm:gap-2">
												<span className="text-xs font-semibold leading-tight text-gray-900 sm:text-sm">{index + 1}. {tab.title}</span>
												{complete && <CheckCircleIcon className="h-3.5 w-3.5 shrink-0 text-green-700 sm:h-4 sm:w-4" />}
												{hasError && <ExclamationCircleIcon className="h-3.5 w-3.5 shrink-0 text-red-700 sm:h-4 sm:w-4" />}
											</div>
										</button>
									);
								})}
							</div>
						</div>

						<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-fade-in-up delay-100">
							{activeTab === "personales" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-lg font-semibold text-gray-900">Datos personales</h2>
										<p className="mt-1 text-sm text-neutral-400">Captura la información básica y de identificación del aspirante.</p>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<div className="md:col-span-2">
											<Input id="nombresApellidos" label="Nombres y apellidos" value={form.nombresApellidos} onChange={(value) => updateField("nombresApellidos", value)} error={errors.nombresApellidos} placeholder="Nombre completo del aspirante" autoComplete="name" />
										</div>
										<Select id="tipoDocumento" label="Tipo documento" value={form.tipoDocumento} onChange={(value) => updateField("tipoDocumento", value)} error={errors.tipoDocumento} options={selectOptions.documento} loading={loadingSelectOptions} />
										<Input id="numeroDocumento" label="Número de documento" value={form.numeroDocumento} onChange={(value) => updateField("numeroDocumento", value)} error={errors.numeroDocumento} placeholder="Número de identificación" autoComplete="off" />
										<Select id="estadoCivil" label="Estado civil" value={form.estadoCivil} onChange={(value) => updateField("estadoCivil", value)} error={errors.estadoCivil} options={selectOptions.estadoCivil} loading={loadingSelectOptions} />
										<Select id="sexoBiologico" label="Sexo biológico" value={form.sexoBiologico} onChange={(value) => updateField("sexoBiologico", value)} error={errors.sexoBiologico} options={selectOptions.sexoBiologico} loading={loadingSelectOptions} />
										<Input id="fechaNacimiento" label="Fecha de nacimiento" type="date" value={form.fechaNacimiento} onChange={(value) => updateField("fechaNacimiento", value)} error={errors.fechaNacimiento} />
										<Select id="departamentoNacimiento" label="Departamento de nacimiento" value={form.departamentoNacimiento} onChange={(value) => updateField("departamentoNacimiento", value)} error={errors.departamentoNacimiento} options={selectOptions.departamentoNacimiento} loading={loadingSelectOptions} />
										<Select id="municipioNacimiento" label="Municipio de nacimiento" value={form.municipioNacimiento} onChange={(value) => updateField("municipioNacimiento", value)} error={errors.municipioNacimiento} options={selectOptions.municipio} loading={loadingSelectOptions} />
										<Input id="fechaExpedicion" label="Fecha de expedición del documento" type="date" value={form.fechaExpedicion} onChange={(value) => updateField("fechaExpedicion", value)} error={errors.fechaExpedicion} />
										<Select id="departamentoExpedicion" label="Departamento de expedición del documento" value={form.departamentoExpedicion} onChange={(value) => updateField("departamentoExpedicion", value)} error={errors.departamentoExpedicion} options={selectOptions.departamentoExpedicion} loading={loadingSelectOptions} />
										<Select id="municipioExpedicion" label="Municipio de expedición del documento" value={form.municipioExpedicion} onChange={(value) => updateField("municipioExpedicion", value)} error={errors.municipioExpedicion} options={selectOptions.municipio} loading={loadingSelectOptions} />
									</div>
								</div>
							)}

							{activeTab === "residencia" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-lg font-semibold text-gray-900">Datos de residencia y contacto</h2>
										<p className="mt-1 text-sm text-neutral-400">Indica tu ubicación actual y la información de contacto principal.</p>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<Select id="zonaResidencia" label="Zona de residencia" value={form.zonaResidencia} onChange={(value) => updateField("zonaResidencia", value)} error={errors.zonaResidencia} options={selectOptions.zonaResidencia} loading={loadingSelectOptions} />
										<Select id="departamentoResidencia" label="Departamento de residencia" value={form.departamentoResidencia} onChange={(value) => updateField("departamentoResidencia", value)} error={errors.departamentoResidencia} options={selectOptions.departamentoResidencia} loading={loadingSelectOptions} />
										<Select id="municipioResidencia" label="Municipio de residencia" value={form.municipioResidencia} onChange={(value) => updateField("municipioResidencia", value)} error={errors.municipioResidencia} options={selectOptions.municipio} loading={loadingSelectOptions} />
										<Input id="direccionResidencia" label="Dirección de residencia" value={form.direccionResidencia} onChange={(value) => updateField("direccionResidencia", value)} error={errors.direccionResidencia} placeholder="Dirección completa" />
										<Input id="correoPersonal" label="Correo electrónico personal" type="email" value={form.correoPersonal} onChange={(value) => updateField("correoPersonal", value)} error={errors.correoPersonal} placeholder="correo@dominio.com" autoComplete="email" />
										<Input id="telefonoContacto" label="Número de teléfono de contacto" value={form.telefonoContacto} onChange={(value) => updateField("telefonoContacto", value)} error={errors.telefonoContacto} placeholder="Número de contacto" autoComplete="tel" />
									</div>
								</div>
							)}

							{activeTab === "especial" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-lg font-semibold text-gray-900">Datos de población especial</h2>
										<p className="mt-1 text-sm text-neutral-400">Completa los campos de inclusión y caracterización diferencial.</p>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<Select id="grupoEtnico" label="Grupo étnico" value={form.grupoEtnico} onChange={(value) => updateField("grupoEtnico", value)} error={errors.grupoEtnico} options={selectOptions.grupoEtnico} loading={loadingSelectOptions} />
										<Select id="puebloIndigena" label="Pueblo indígena" value={form.puebloIndigena} onChange={(value) => updateField("puebloIndigena", value)} error={errors.puebloIndigena} options={selectOptions.puebloIndigena} loading={loadingSelectOptions} />
										<Select id="tieneDiscapacidad" label="Persona con discapacidad" value={form.tieneDiscapacidad} onChange={(value) => updateField("tieneDiscapacidad", value)} error={errors.tieneDiscapacidad} options={selectOptions.siNo} loading={loadingSelectOptions} />
										<Input id="tipoDiscapacidad" label="Tipo de discapacidad" value={form.tipoDiscapacidad} onChange={(value) => updateField("tipoDiscapacidad", value)} error={errors.tipoDiscapacidad} placeholder={form.tieneDiscapacidad === "si" ? "Indica el tipo de discapacidad" : "Escribe N/A si no aplica"} />
										<Select id="capacidadExcepcional" label="Persona con capacidad excepcional" value={form.capacidadExcepcional} onChange={(value) => updateField("capacidadExcepcional", value)} error={errors.capacidadExcepcional} options={selectOptions.siNo} loading={loadingSelectOptions} />
									</div>
								</div>
							)}

							{activeTab === "laboral" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-lg font-semibold text-gray-900">Datos laborales</h2>
										<p className="mt-1 text-sm text-neutral-400">Si no estás laborando, escribe N/A en los campos correspondientes.</p>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<Input id="empresaTrabajo" label="Empresa, entidad o institución donde trabaja" value={form.empresaTrabajo} onChange={(value) => updateField("empresaTrabajo", value)} error={errors.empresaTrabajo} placeholder="Si no laboras, escribe N/A" />
										<Select id="departamentoTrabajo" label="Departamento donde trabaja" value={form.departamentoTrabajo} onChange={(value) => updateField("departamentoTrabajo", value)} error={errors.departamentoTrabajo} options={selectOptions.departamentoTrabajo} loading={loadingSelectOptions} />
										<Select id="municipioTrabajo" label="Municipio donde trabaja" value={form.municipioTrabajo} onChange={(value) => updateField("municipioTrabajo", value)} error={errors.municipioTrabajo} options={selectOptions.municipio} loading={loadingSelectOptions} />
										<Input id="direccionTrabajo" label="Dirección del lugar de trabajo" value={form.direccionTrabajo} onChange={(value) => updateField("direccionTrabajo", value)} error={errors.direccionTrabajo} placeholder="Si no laboras, escribe N/A" />
										<div className="md:col-span-2">
											<TextArea id="experienciaLaboral" label="Información de la experiencia laboral" value={form.experienciaLaboral} onChange={(value) => updateField("experienciaLaboral", value)} error={errors.experienciaLaboral} placeholder="Escriba en orden, inicie con la más reciente. Puede incluir cargo, empresa, funciones y fechas." rows={6} />
										</div>
									</div>
								</div>
							)}

							{activeTab === "academica" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-lg font-semibold text-gray-900">Datos académicos</h2>
										<p className="mt-1 text-sm text-neutral-400">Registra la relación con el programa y tus antecedentes académicos.</p>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<Select id="vinculacionPrograma" label="Tipo de vinculación al programa" value={form.vinculacionPrograma} onChange={(value) => updateField("vinculacionPrograma", value)} error={errors.vinculacionPrograma} options={selectOptions.vinculacionPrograma} loading={loadingSelectOptions} />
										<Input id="tituloPregrado" label="Título obtenido en pregrado" value={form.tituloPregrado} onChange={(value) => updateField("tituloPregrado", value)} error={errors.tituloPregrado} placeholder="Programa académico de pregrado" />
										<Input id="promedioPregrado" type="number" label="Promedio ponderado acumulado de pregrado" value={form.promedioPregrado} onChange={(value) => updateField("promedioPregrado", value)} error={errors.promedioPregrado} placeholder="Ej: 4.2" />
										<Input id="titulosPostgrado" label="Títulos obtenidos en postgrado" value={form.titulosPostgrado} onChange={(value) => updateField("titulosPostgrado", value)} error={errors.titulosPostgrado} placeholder="Si no tiene estudios de posgrado, escribe Ninguno" />
										<Select id="egresadoUFPS" label="¿Egresado de la UFPS Sede Central - Cúcuta?" value={form.egresadoUFPS} onChange={(value) => updateField("egresadoUFPS", value)} error={errors.egresadoUFPS} options={selectOptions.siNo} loading={loadingSelectOptions} />
										<Select id="programaInscripcion" label="Programa al que se está inscribiendo" value={form.programaInscripcion} onChange={(value) => updateField("programaInscripcion", value)} error={errors.programaInscripcion} options={selectOptions.programaInscripcion} loading={loadingSelectOptions} />
										<Select id="cohorteInscripcion" label="Cohorte a la que se está inscribiendo" value={form.cohorteInscripcion} onChange={(value) => updateField("cohorteInscripcion", value)} error={errors.cohorteInscripcion} options={cohorteOptions} loading={loadingCohorteOptions} disabled={!form.programaInscripcion} />
									</div>
								</div>
							)}

							{activeTab === "usuario" && (
								<div className="space-y-6">
									<div>
										<h2 className="text-lg font-semibold text-gray-900">Registro de usuario</h2>
										<p className="mt-1 text-sm text-neutral-400">Crea las credenciales que usarás para ingresar al sistema.</p>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										<Input id="usuarioRegistro" label="Usuario" value={form.usuarioRegistro} onChange={(value) => updateField("usuarioRegistro", value)} error={errors.usuarioRegistro} placeholder="Crea un nombre de usuario" autoComplete="username" />
										<PasswordInput id="contrasenaRegistro" label="Contraseña" value={form.contrasenaRegistro} onChange={(value) => updateField("contrasenaRegistro", value)} error={errors.contrasenaRegistro} placeholder="Mínimo 8 caracteres" showPassword={showPassword} onToggleShowPassword={() => setShowPassword((current) => !current)} />
									</div>
								</div>
							)}

							<div className="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
								<button
									type="button"
									onClick={handleBack}
									disabled={activeIndex === 0}
									className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<ArrowLeftIcon className="h-4 w-4" />
									Anterior
								</button>

								<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
									<button
										type="button"
										onClick={() => {
											setErrors({});
											setSubmitted(false);
											setForm(INITIAL_FORM);
											setShowPassword(false);
											setActiveTab("personales");
										}}
										className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300"
									>
										Reiniciar
									</button>

									{activeIndex < TABS.length - 1 ? (
										<button
											type="button"
											onClick={handleNext}
											className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
										>
											Siguiente
											<ArrowRightIcon className="h-4 w-4" />
										</button>
									) : (
										<button
											type="submit"
											className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
										>
											Enviar inscripción
											<CheckCircleIcon className="h-4 w-4" />
										</button>
									)}
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}