type Programa = {
    id: number;
    codigo: number;
    nombrePrograma: string;
    duracionProgramaSemestres: number;
    nombreDirector: string;
}

// lista de programas de ejemplo
const programas: Programa[] = [
    {
        id: 1,
        codigo: 1001,
        nombrePrograma: "Ingeniería de Software",
        duracionProgramaSemestres: 8,
        nombreDirector: "Dr. Juan Pérez",
    },
    {
        id: 2,
        codigo: 1002,
        nombrePrograma: "Maestría en Administración",
        duracionProgramaSemestres: 4,
        nombreDirector: "Mg. María López",
    }
];

export default function DirectorFacultadProgramas() {
    return (
        <section className="min-h-full bg-linear-to-b from-slate-50 via-white to-slate-100 px-4 py-4 sm:px-6 sm:py-5">
            <div className="mx-auto w-full max-w-none">
            <header className="mb-3 animate-fade-in-up">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-700">
                        Facultad
                    </p>
                    <h1 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
                        Programas
                    </h1>
                </header>

                <div className="space-y-2.5">
                    {programas.map((programa, index) => (
                        <article
                            key={programa.id}
                            className="animate-fade-in-up w-full rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                            style={{ animationDelay: `${index * 120}ms` }}
                        >
                            <div className="flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700">
                                            Programa
                                        </span>
                                        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                                            Código {programa.codigo}
                                        </span>
                                    </div>

                                    <h2 className="mt-1 text-base sm:text-lg font-bold text-slate-900">
                                        {programa.nombrePrograma}
                                    </h2>

                                    <p className="mt-1 text-xs sm:text-sm text-slate-600">
                                        Director: <span className="font-semibold text-slate-800">{programa.nombreDirector}</span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 sm:justify-end">
                                    <div className="min-w-28 rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                            Código
                                        </p>
                                        <p className="mt-0.5 text-sm font-bold text-slate-900">
                                            {programa.codigo}
                                        </p>
                                    </div>

                                    <div className="min-w-35 rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                                            Duración
                                        </p>
                                        <p className="mt-0.5 text-sm font-bold text-slate-900">
                                            {programa.duracionProgramaSemestres} semestres
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}