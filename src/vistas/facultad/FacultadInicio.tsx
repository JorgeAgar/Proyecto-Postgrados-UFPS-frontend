import { useEffect, useMemo, useState } from "react";
import { BuildingLibraryIcon, ExclamationTriangleIcon, UsersIcon } from "@heroicons/react/24/outline";
import { listarCohortesActivas } from "../../services/facultadService";

type cohorteSemestre = {
    id: number;
    nombre: string;
    fechainicio: string;
    fechafin: string;
    idEstado: number;
    estado: string;
    cohorteList: string[];
};

type cohorteCriterio = {
    id: number;
    nombre: string;
    descripcion: string;
    peso: number;
    idCohorte: number;
    cohorte: string;
};

type cohorteActiva = {
    id: number;
    nombre: string;
    cupos: string;
    requiereentrevista: boolean;
    requiereprueba: boolean;
    idEstado: number;
    idSemestre: number;
    idModalidad: number;
    idPlazodocumentacion: number;
    idPlazoinscripcion: number;
    idPlazopago: number;
    idPrograma: number;
    id_estado: number;
    id_semestre: number;
    id_modalidad: number;
    id_plazodocumentacion: number;
    id_plazoinscripcion: number;
    id_plazopago: number;
    id_programa: number;
    estado: string;
    semestre: cohorteSemestre;
    modalidad: {
        id: number;
        nombre: string;
    };
    plazodocumentacion: string;
    plazoinscripcion: string;
    plazopago: string;
    programa: string;
    aspiranteList: string[];
    criterioEvaluacionList: cohorteCriterio[];
    inscritosEnProceso: number;
};

type cohorteActivaVista = Omit<cohorteActiva, "programa"> & {
    programa: string | {
        id?: number;
        codigo?: number | string;
        nombre?: string;
    };
};

function obtenerNombrePrograma(programa: cohorteActivaVista["programa"]) {
    if (typeof programa === "string") {
        return programa;
    }

    return programa.nombre ?? "Programa sin nombre";
}

function obtenerCodigoPrograma(programa: cohorteActivaVista["programa"]) {
    if (typeof programa === "string") {
        return "-";
    }

    return programa.codigo ?? "-";
}

function obtenerCupos(cohorte: cohorteActivaVista) {
    const cupos = Number(cohorte.cupos);
    return Number.isFinite(cupos) && cupos > 0 ? cupos : 0;
}

function obtenerPorcentajeOcupado(inscritos: number, cupos: number) {
    if (cupos <= 0) {
        return 0;
    }

    return Math.min(100, Math.round((inscritos / cupos) * 100));
}

export default function FacultadInicio() {
    const [cohortes, setCohortes] = useState<cohorteActivaVista[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await listarCohortesActivas();

                if (!cancelled) {
                    setCohortes(Array.isArray(result) ? (result as cohorteActivaVista[]) : []);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) {
                    setError("No fue posible cargar las cohortes activas.");
                    setCohortes([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const totalInscritos = useMemo(
        () => cohortes.reduce((acc, cohorte) => acc + (cohorte.inscritosEnProceso ?? 0), 0),
        [cohortes],
    );

    if (loading) {
        return (
            <div className="min-h-full bg-slate-50 p-8" style={{ fontFamily: "Segoe UI, sans-serif" }}>
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
                        Cargando programas activos...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-full bg-slate-50 p-8" style={{ fontFamily: "Segoe UI, sans-serif" }}>
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
                        <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                        <div>{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8" style={{ fontFamily: "Segoe UI, sans-serif" }}>
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Programas que abrieron cohorte</h1>
                        <p className="mt-1 text-sm text-slate-500">{totalInscritos} inscritos en proceso</p>
                    </div>
                    <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm sm:flex">
                        <UsersIcon className="h-4 w-4 text-red-700" />
                        {cohortes.length} programas activos
                    </div>
                </div>

                {cohortes.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
                        No hay programas activos para mostrar.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cohortes.map((cohorte) => {
                            const cupos = obtenerCupos(cohorte);
                            const inscritos = cohorte.inscritosEnProceso ?? 0;
                            const ocupacion = obtenerPorcentajeOcupado(inscritos, cupos);

                            return (
                                <article
                                    key={cohorte.id}
                                    className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:px-6"
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                                                <BuildingLibraryIcon className="h-6 w-6" />
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                    <h2 className="text-lg font-semibold leading-tight text-slate-950 sm:text-xl">
                                                        {obtenerNombrePrograma(cohorte.programa)}
                                                    </h2>
                                                    <span className="text-sm text-slate-400">Cód. {obtenerCodigoPrograma(cohorte.programa)}</span>
                                                </div>

                                                <div className="mt-2 text-sm text-slate-500">
                                                    {inscritos} inscritos de {cupos || "-"} cupos
                                                </div>
                                            </div>
                                        </div>

                                        <div className="min-w-45 sm:text-right">
                                            <div className="mb-2 text-right text-lg font-bold text-slate-950">
                                                {inscritos} <span className="text-sm font-medium text-slate-400">/ {cupos || "-"} cupos</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                                                <div className="h-full rounded-full bg-red-700 transition-all" style={{ width: `${ocupacion}%` }} />
                                            </div>
                                            <div className="mt-2 text-sm text-slate-500">{ocupacion}% ocupado</div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}