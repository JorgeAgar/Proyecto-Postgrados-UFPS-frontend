import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { crearPrograma, listarSedes, obtenerPosiblesDirectores } from "../../services/facultadService";
import type { Sede } from "./FacultadProgramaDetalle";
import type { ProgramaRequest } from "../../services/facultadService";

type FormState = {
    codigo: string;
    nombre: string;
    duracion: string;
    creditos: string;
    correo: string;
    periodicidad: string;
    nivelFormacion: string;
    tituloOtorgado: string;
    sede: string;
    directorId: string;
    registroCalificado: string;
    registroSnies: string;
};

const initialFormState: FormState = {
    codigo: "",
    nombre: "",
    duracion: "",
    creditos: "",
    correo: "",
    periodicidad: "",
    nivelFormacion: "",
    tituloOtorgado: "",
    sede: "",
    directorId: "",
    registroCalificado: "",
    registroSnies: "",
};

type DirectorOption = {
    id: number;
    persona?: {
        nombres?: string;
        apellidos?: string;
    };
};

export default function FacultadCrearPrograma() {
    const [formState, setFormState] = useState<FormState>(initialFormState);
    const [sedeOptions, setSedeOptions] = useState<Sede[]>([]);
    const [directorOptions, setDirectorOptions] = useState<DirectorOption[]>([]);

    useEffect(() => {
        let active = true;

        const cargarOpciones = async () => {
            if (!active) {
                return;
            }

            try {
                const [sedes, directores] = await Promise.all([
                    listarSedes(),
                    obtenerPosiblesDirectores(),
                ]);

                if (!active) {
                    return;
                }

                setSedeOptions(sedes);
                setDirectorOptions(directores as DirectorOption[]);
            } catch (error) {
                console.error("Error cargando opciones del formulario:", error);
                if (!active) {
                    return;
                }
                setSedeOptions([]);
                setDirectorOptions([]);
            }
        };

        cargarOpciones();

        return () => {
            active = false;
        };
    }, []);

    const updateField = (field: keyof FormState, value: string) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const payload: ProgramaRequest = {
            codigo: Number(formState.codigo) || 0,
            nombre: formState.nombre.trim(),
            semestres: Number(formState.duracion) || 0,
            correo: formState.correo.trim(),
            registrosnies: formState.registroSnies.trim(),
            nivelformacion: formState.nivelFormacion.trim(),
            titulo: formState.tituloOtorgado.trim(),
            rcmineducacion: formState.registroCalificado.trim(),
            creditos: Number(formState.creditos) || 0,
            periodicidad: formState.periodicidad.trim(),
            valorMatricula: 0,
            idSede: Number(formState.sede) || 0,
            idAdministrativo: formState.directorId ? Number(formState.directorId) : null,
            idFacultad: 1,
            idOtros: null,
        };

        console.log("Payload a enviar:", payload);

        try {
            const nuevoPrograma = await crearPrograma(payload);
            console.log("Programa creado correctamente:", nuevoPrograma);
            setFormState(initialFormState);
        } catch (error) {
            console.error("Error al crear el programa:", error);
        }
    };

    return (
        <main className="flex flex-col gap-8 p-8">
            <Link
                to="/facultad/programas"
                className="text-red-600 text-md flex w-fit flex-row flex-nowrap items-center gap-1 hover:text-red-700 hover:underline"
            >
                {chevronLeft} Volver a programas
            </Link>

            <div className="flex flex-row justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-700">
                        Facultad
                    </p>
                    <h1 className="m-0 p-0 text-2xl font-semibold text-slate-900">
                        Crear programa
                    </h1>
                </div>
            </div>

            <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-7">
                <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Información General
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 md:gap-y-9">
                        <Field label="Código">
                            <input
                                type="number"
                                value={formState.codigo}
                                onChange={(event) => updateField("codigo", event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                        </Field>

                        <Field label="Nombre del programa">
                            <input
                                type="text"
                                value={formState.nombre}
                                onChange={(event) => updateField("nombre", event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                        </Field>

                        <Field label="Duración (semestres)">
                            <input
                                type="number"
                                value={formState.duracion}
                                onChange={(event) => updateField("duracion", event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                        </Field>

                        <Field label="Créditos">
                            <input
                                type="number"
                                value={formState.creditos}
                                onChange={(event) => updateField("creditos", event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                        </Field>

                        <Field label="Correo">
                            <input
                                type="email"
                                value={formState.correo}
                                onChange={(event) => updateField("correo", event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                        </Field>

                        <Field label="Nivel de formación">
                            <select
                                value={formState.nivelFormacion}
                                onChange={(event) =>
                                    updateField("nivelFormacion", event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                                <option value="">Selecciona una opción</option>
                                {NIVEL_FORMACION_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Periodicidad">
                            <select
                                value={formState.periodicidad}
                                onChange={(event) =>
                                    updateField("periodicidad", event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                                <option value="">Selecciona una opción</option>
                                {PERIODICIDAD_OPTIONS.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Título otorgado">
                            <input
                                type="text"
                                value={formState.tituloOtorgado}
                                onChange={(event) =>
                                    updateField("tituloOtorgado", event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                        </Field>

                        <Field label="Director de programa">
                            <select
                                value={formState.directorId}
                                onChange={(event) => updateField("directorId", event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                                <option value="">sin director</option>
                                {directorOptions.map((director) => (
                                    <option key={director.id} value={director.id}>
                                        {director.persona?.nombres ?? ""} {director.persona?.apellidos ?? ""}
                                    </option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Registro SNIES">
                            <input
                                type="text"
                                value={formState.registroSnies}
                                onChange={(event) => updateField("registroSnies", event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                        </Field>

                        <Field label="Registro Calificado">
                            <input
                                type="text"
                                value={formState.registroCalificado}
                                onChange={(event) =>
                                    updateField("registroCalificado", event.target.value)
                                }
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            />
                        </Field>

                        <Field label="Sede">
                            <select
                                value={formState.sede}
                                onChange={(event) => updateField("sede", event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                                <option value="">Selecciona una opción</option>
                                {sedeOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                        {option.nombre}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setFormState(initialFormState)}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            Limpiar campos
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            Crear programa
                        </button>
                    </div>
                </form>
            </section>

        </main>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                {label}
            </label>
            {children}
        </div>
    );
}

const chevronLeft = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-4"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
        />
    </svg>
);

const NIVEL_FORMACION_OPTIONS = [
    "Diplomado",
    "Especialización",
    "Maestría",
    "Doctorado",
];

const PERIODICIDAD_OPTIONS = ["Anual", "Semestral"];