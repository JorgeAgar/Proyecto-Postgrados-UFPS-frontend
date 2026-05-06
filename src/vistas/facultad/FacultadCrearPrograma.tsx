import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";

type FormState = {
    nombre: string;
    duracion: string;
    creditos: string;
    correo: string;
    periodicidad: string;
    nivelFormacion: string;
    tituloOtorgado: string;
    sede: string;
    registroCalificado: string;
    registroSnies: string;
};

const initialFormState: FormState = {
    nombre: "",
    duracion: "",
    creditos: "",
    correo: "",
    periodicidad: "",
    nivelFormacion: "",
    tituloOtorgado: "",
    sede: "",
    registroCalificado: "",
    registroSnies: "",
};

export default function FacultadCrearPrograma() {
    const [formState, setFormState] = useState<FormState>(initialFormState);

    const updateField = (field: keyof FormState, value: string) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const payload = {
            ...formState,
            duracion: Number(formState.duracion) || 0,
            creditos: Number(formState.creditos) || 0,
            correo: formState.correo.trim(),
            nombre: formState.nombre.trim(),
            periodicidad: formState.periodicidad.trim(),
            nivelFormacion: formState.nivelFormacion.trim(),
            tituloOtorgado: formState.tituloOtorgado.trim(),
            sede: formState.sede.trim(),
            registroCalificado: formState.registroCalificado.trim(),
            registroSnies: formState.registroSnies.trim(),
        };

        console.log("Valores del nuevo programa:", payload);
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
                                {nivelFormacionOptions.map((option) => (
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
                                {periodicidadOptions.map((option) => (
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

                        <Field label="Sede">
                            <select
                                value={formState.sede}
                                onChange={(event) => updateField("sede", event.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                                <option value="">Selecciona una opción</option>
                                {sedeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
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

const nivelFormacionOptions = [
    "Pregrado",
    "Especialización",
    "Maestría",
    "Doctorado",
];

const periodicidadOptions = ["Semestral", "Anual", "Trimestral", "Cuatrimestral"];

const sedeOptions = ["Sede Central", "Sede Norte", "Sede Sur", "Sede Virtual"];