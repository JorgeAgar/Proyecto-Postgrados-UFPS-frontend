import { useEffect, useState } from "react";
import { Link } from "react-router";
import { listarProgramas } from "../../services/facultadService";
import type { Programa } from "./FacultadProgramaDetalle";


export default function FacultadProgramas() {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const cargarProgramas = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listarProgramas();
        console.log("Programas obtenidos:", data);

        if (active) {
          setProgramas(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setProgramas([]);
          setError(err instanceof Error ? err.message : "No se pudieron cargar los programas.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    cargarProgramas();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="min-h-full bg-linear-to-b from-slate-50 via-white to-slate-100 px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto w-full max-w-none">
        <header className="mb-3 animate-fade-in-up">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-700">
            Facultad
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">
              Programas
            </h1>

            <Link
              to="/facultad/crear-programa"
              className="inline-flex items-center justify-center rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-800 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              Añadir programa
            </Link>
          </div>
        </header>

        <div className="space-y-2.5">
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600 shadow-sm">
              Cargando programas...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm font-medium text-red-700 shadow-sm">
              {error}
            </div>
          )}

          {!loading && !error && programas.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600 shadow-sm">
              No hay programas disponibles.
            </div>
          )}

          {!loading && !error && programas.map((programa, index) => (
            <Link
              key={programa.id}
              to={`/facultad/programa/${programa.id}`}
              className="animate-fade-in-up block w-full rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <article className="w-full">
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

                    <h2 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
                      {programa.nombre}
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 sm:text-sm">
                      <p>
                        Director: {" "}
                        <span className="font-semibold text-slate-800">
                          {programa?.administrativo?.persona?.nombres ? programa?.administrativo?.persona?.nombres : "N/A"} {programa?.administrativo?.persona?.apellidos}
                        </span>
                      </p>
                      <p>
                        Correo: {" "}
                        <span className="font-semibold text-slate-800">
                          {programa?.correo}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <div className="min-w-35 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        Duración
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">
                        {programa.semestres} semestres
                      </p>
                    </div>
                    <div className="min-w-35 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                        Créditos
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">
                        {programa.creditos}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
