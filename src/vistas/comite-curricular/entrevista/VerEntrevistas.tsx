import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  entrevistaService,
  type Entrevista,
} from "../../../services/comiteCurricularService";
import ModalEliminar from "../ModalEliminar";

const BASE = "/comite";

// ── Íconos ────────────────────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

// ── Badges de estado ──────────────────────────────────────────────────────────

function estadoBadgeClasses(estado: string) {
  const map: Record<string, string> = {
    Programada: "bg-blue-50 text-blue-700",
    Confirmada: "bg-emerald-50 text-emerald-700",
    "No Confirmada": "bg-yellow-50 text-yellow-700",
    Realizada: "bg-gray-100 text-gray-600",
    Inasistencia: "bg-red-50 text-red-700",
    Cancelada: "bg-red-100 text-red-800",
  };
  return map[estado] ?? "bg-gray-100 text-gray-600";
}

// ── Tarjeta de resumen ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4`}>
      <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function VerEntrevistas() {
  const [allEntrevistas, setAllEntrevistas] = useState<Entrevista[]>([]);
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroModalidad, setFiltroModalidad] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // ── Estado del modal de eliminación ────────────────────────────────────────
  const [entrevistaAEliminar, setEntrevistaAEliminar] = useState<Entrevista | null>(null);
  const [loadingEliminar, setLoadingEliminar] = useState(false);

  // Resumen
  const resumen = entrevistaService.getResumen();

  const applyFilters = useCallback(
    (
      all: Entrevista[],
      texto: string,
      modalidad: string,
      estado: string,
      p: number
    ) => {
      let filtrados = all;
      if (texto.trim()) {
        const q = texto.trim().toLowerCase();
        filtrados = filtrados.filter(
          (e) =>
            e.aspiranteNombre.toLowerCase().includes(q) ||
            e.evaluadorNombre.toLowerCase().includes(q)
        );
      }
      if (modalidad) {
        filtrados = filtrados.filter((e) => e.modalidad === modalidad);
      }
      if (estado) {
        filtrados = filtrados.filter((e) => e.estado === estado);
      }
      const start = (p - 1) * pageSize;
      setEntrevistas(filtrados.slice(start, start + pageSize));
      setTotal(filtrados.length);
      setPage(p);
    },
    [pageSize]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await entrevistaService.getAll(1, 9999);
      setAllEntrevistas(res.data);
      applyFilters(res.data, busqueda, filtroModalidad, filtroEstado, 1);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al cargar entrevistas."
      );
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    load();
  }, [load]);

  const handleBusqueda = (valor: string) => {
    setBusqueda(valor);
    applyFilters(allEntrevistas, valor, filtroModalidad, filtroEstado, 1);
  };

  const handleModalidad = (valor: string) => {
    setFiltroModalidad(valor);
    applyFilters(allEntrevistas, busqueda, valor, filtroEstado, 1);
  };

  const handleEstado = (valor: string) => {
    setFiltroEstado(valor);
    applyFilters(allEntrevistas, busqueda, filtroModalidad, valor, 1);
  };

  const handlePage = (p: number) => {
    applyFilters(allEntrevistas, busqueda, filtroModalidad, filtroEstado, p);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroModalidad("");
    setFiltroEstado("");
    applyFilters(allEntrevistas, "", "", "", 1);
  };

  const hayFiltros = busqueda || filtroModalidad || filtroEstado;
  const totalPages = Math.ceil(total / pageSize);

  // ── Eliminar entrevista ────────────────────────────────────────────────────
  const handleEliminar = async () => {
    if (!entrevistaAEliminar) return;

    // TODO (backend): reemplazar la llamada del servicio mock por el endpoint real.
    // Ejemplo: await fetch(`/v1/entrevistas/${entrevistaAEliminar.id}`, { method: "DELETE" });
    setLoadingEliminar(true);
    try {
      await entrevistaService.delete(entrevistaAEliminar.id);
      setEntrevistaAEliminar(null);
      load(); // recarga la tabla
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar la entrevista.");
      setEntrevistaAEliminar(null);
    } finally {
      setLoadingEliminar(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Entrevistas</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} entrevista{total !== 1 ? "s" : ""} registrada{total !== 1 ? "s" : ""}
            {hayFiltros && <span className="text-gray-400"> (filtrado)</span>}
          </p>
        </div>
        <Link
          to={`${BASE}/entrevista/agendar`}
          className="inline-flex items-center gap-2 bg-red-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-red-800 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agendar entrevista
        </Link>
      </div>

      {/* Tarjetas de resumen */}
      <div className="animate-fade-in-up delay-0 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Total"
          value={resumen.total}
          color="bg-red-50"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-red-600" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
        />
        <StatCard
          label="Pendientes"
          value={resumen.pendientes}
          color="bg-blue-50"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-blue-600" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          }
        />
        <StatCard
          label="Realizadas"
          value={resumen.realizadas}
          color="bg-emerald-50"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-emerald-600" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Fallidas / Inasistidas"
          value={resumen.fallidas}
          color="bg-amber-50"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-amber-600" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
      </div>

      {/* Buscador */}
      <div className="animate-fade-in-up delay-50 mb-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => handleBusqueda(e.target.value)}
            placeholder="Buscar por aspirante o evaluador..."
            className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition shadow-sm"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => handleBusqueda("")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filtros desplegables */}
      <div className="animate-fade-in-up delay-50 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setMostrarFiltros((o) => !o)}
            className={[
              "inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors",
              mostrarFiltros || filtroModalidad || filtroEstado
                ? "border-red-400 bg-red-50 text-red-700"
                : "border-gray-200 text-gray-500 hover:bg-gray-50",
            ].join(" ")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2" />
            </svg>
            Filtros
            {(filtroModalidad || filtroEstado) && (
              <span className="ml-1 h-4 w-4 rounded-full bg-red-700 text-white text-[10px] font-bold flex items-center justify-center">
                {[filtroModalidad, filtroEstado].filter(Boolean).length}
              </span>
            )}
          </button>

          {hayFiltros && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="text-xs text-red-700 underline hover:text-red-900 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {mostrarFiltros && (
          <div className="mt-2 flex flex-wrap gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Modalidad</label>
              <select
                value={filtroModalidad}
                onChange={(e) => handleModalidad(e.target.value)}
                className="text-sm rounded-lg border border-gray-200 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
              >
                <option value="">Todas</option>
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => handleEstado(e.target.value)}
                className="text-sm rounded-lg border border-gray-200 bg-white px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
              >
                <option value="">Todos</option>
                <option value="Programada">Programada</option>
                <option value="Confirmada">Confirmada</option>
                <option value="No Confirmada">No Confirmada</option>
                <option value="Realizada">Realizada</option>
                <option value="Inasistencia">Inasistencia</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>
        )}

        {hayFiltros && (
          <p className="mt-1.5 text-xs text-gray-500">
            {total} resultado{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="animate-fade-in mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
          <button onClick={load} className="ml-3 underline font-semibold">Reintentar</button>
        </div>
      )}

      {/* Tabla */}
      <div className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : entrevistas.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            {hayFiltros ? (
              <>
                <p className="text-lg font-semibold">Sin resultados</p>
                <p className="text-sm mt-1">No hay entrevistas que coincidan con los filtros aplicados.</p>
                <button
                  onClick={limpiarFiltros}
                  className="mt-3 text-sm text-red-700 underline hover:text-red-900 transition-colors"
                >
                  Limpiar filtros
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">Sin entrevistas registradas</p>
                <p className="text-sm mt-1">Agenda la primera entrevista para esta cohorte.</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aspirante</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Evaluador</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Modalidad</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Programa</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entrevistas.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{e.aspiranteNombre}</p>
                      <p className="text-xs text-gray-400">{e.aspiranteDocumento}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{e.evaluadorNombre}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <p className="font-medium">{e.fecha}</p>
                      <p className="text-xs text-gray-400">{e.hora}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${e.modalidad === "Virtual" ? "bg-violet-50 text-violet-700" : "bg-orange-50 text-orange-700"}`}>
                        {e.modalidad}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      <span className="truncate block max-w-[160px]">{e.programa}</span>
                      <span className="inline-block mt-0.5 bg-red-50 text-red-700 text-xs font-semibold px-1.5 py-0.5 rounded">{e.cohorte}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${estadoBadgeClasses(e.estado)}`}>
                        {e.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`${BASE}/entrevista/reagendar`}
                          state={{ entrevista: e }}
                          className="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          title="Reagendar"
                        >
                          <EditIcon />
                        </Link>
                        <button
                          onClick={() => setEntrevistaAEliminar(e)}
                          className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-700 transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="animate-fade-in mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePage(p)}
                className={[
                  "px-3 py-1.5 rounded-lg border transition-colors",
                  p === page
                    ? "border-red-700 bg-red-700 text-white font-bold"
                    : "border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {entrevistaAEliminar && (
        <ModalEliminar
          titulo="Confirmar eliminación"
          onConfirm={handleEliminar}
          onCancel={() => setEntrevistaAEliminar(null)}
          loading={loadingEliminar}
        >
          <p className="font-semibold text-gray-800">{entrevistaAEliminar.aspiranteNombre}</p>
          <p className="text-gray-500">{entrevistaAEliminar.evaluadorNombre}</p>
          <p className="text-gray-500">{entrevistaAEliminar.programa}</p>
        </ModalEliminar>
      )}
    </div>
  );
}