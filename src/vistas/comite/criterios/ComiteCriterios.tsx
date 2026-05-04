import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  criteriosService,
  type CriterioEvaluacion,
} from "../../../services/comiteService";
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

// ── Componente ────────────────────────────────────────────────────────────────

export default function VerCriterios() {
  const [allCriterios, setAllCriterios] = useState<CriterioEvaluacion[]>([]);
  const [criterios, setCriterios] = useState<CriterioEvaluacion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  // ── Estado del modal de eliminación ────────────────────────────────────────
  const [criterioAEliminar, setCriterioAEliminar] = useState<CriterioEvaluacion | null>(null);
  const [loadingEliminar, setLoadingEliminar] = useState(false);

  const load = useCallback(async (p: number, filtro = busqueda) => {
    setLoading(true);
    setError(null);
    try {
      // Carga todos los datos una vez; el filtrado es local.
      // Cuando el backend esté listo, pasa el filtro como query param:
      // /v1/criterios?page=p&size=pageSize&nombre=filtro
      const res = await criteriosService.getAll(1, 9999);
      setAllCriterios(res.data);

      const filtrados = filtro.trim()
        ? res.data.filter(c =>
            c.nombre.toLowerCase().includes(filtro.trim().toLowerCase())
          )
        : res.data;

      const start = (p - 1) * pageSize;
      setCriterios(filtrados.slice(start, start + pageSize));
      setTotal(filtrados.length);
      setPage(p);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar criterios.");
    } finally {
      setLoading(false);
    }
  }, [busqueda, pageSize]);

  useEffect(() => { load(1); }, [load]);

  // Cuando el usuario escribe en el buscador, reinicia a página 1
  const handleBusqueda = (valor: string) => {
    setBusqueda(valor);
    const filtrados = valor.trim()
      ? allCriterios.filter(c =>
          c.nombre.toLowerCase().includes(valor.trim().toLowerCase())
        )
      : allCriterios;
    const start = 0;
    setCriterios(filtrados.slice(start, pageSize));
    setTotal(filtrados.length);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  // ── Eliminar criterio ──────────────────────────────────────────────────────
  const handleEliminar = async () => {
    if (!criterioAEliminar) return;

    // TODO (backend): reemplazar la llamada del servicio mock por el endpoint real.
    // Ejemplo: await fetch(`/v1/criterios/${criterioAEliminar.id}`, { method: "DELETE" });
    setLoadingEliminar(true);
    try {
      await criteriosService.delete(criterioAEliminar.id);
      setCriterioAEliminar(null);
      load(1, busqueda); // recarga la tabla
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar el criterio.");
      setCriterioAEliminar(null);
    } finally {
      setLoadingEliminar(false);
    }
  };

  // Barra de progreso visual para el peso
  function PesoBar({ peso }: { peso: number }) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-red-500 transition-all duration-500"
            style={{ width: `${peso}%` }}
          />
        </div>
        <span className="text-xs font-bold text-gray-700 w-9 text-right">{peso}%</span>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Criterios de evaluación</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} criterio{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to={`${BASE}/criterios/definir`}
          className="inline-flex items-center gap-2 bg-red-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-red-800 transition-colors shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo criterio
        </Link>
      </div>

      {/* Buscador por nombre */}
      <div className="animate-fade-in-up delay-50 mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </span>
          <input
            type="text"
            value={busqueda}
            onChange={e => handleBusqueda(e.target.value)}
            placeholder="Buscar por nombre del criterio..."
            className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition shadow-sm"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => handleBusqueda("")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
              title="Limpiar búsqueda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {busqueda && (
          <p className="mt-1.5 text-xs text-gray-500">
            {total} resultado{total !== 1 ? "s" : ""} para{" "}
            <span className="font-semibold text-gray-700">"{busqueda}"</span>
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="animate-fade-in mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
          <button onClick={() => load(page)} className="ml-3 underline font-semibold">Reintentar</button>
        </div>
      )}

      {/* Tabla */}
      <div className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : criterios.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            {busqueda ? (
              <>
                <p className="text-lg font-semibold">Sin resultados</p>
                <p className="text-sm mt-1">
                  No hay criterios que coincidan con{" "}
                  <span className="font-semibold text-gray-600">"{busqueda}"</span>.
                </p>
                <button
                  onClick={() => handleBusqueda("")}
                  className="mt-3 text-sm text-red-700 underline hover:text-red-900 transition-colors"
                >
                  Limpiar búsqueda
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">Sin criterios registrados</p>
                <p className="text-sm mt-1">Crea el primer criterio de evaluación para esta cohorte.</p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Descripción</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Peso</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Programa</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Cohorte</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {criterios.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {c.nombre}
                      {c.tienePuntajes && (
                        <span className="ml-2 inline-block text-[10px] font-bold uppercase bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">
                          Con puntajes
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell max-w-xs">
                      <span className="line-clamp-2">{c.descripcion}</span>
                    </td>
                    <td className="px-4 py-3 min-w-[120px]">
                      <PesoBar peso={c.peso} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[180px]">
                      <span className="truncate block">{c.programa}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                        {c.cohorte}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`${BASE}/criterios/editar`}
                          state={{ criterio: c }}
                          className="p-1.5 rounded-md text-gray-400 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          title="Editar"
                        >
                          <EditIcon />
                        </Link>
                        <button
                          onClick={() => setCriterioAEliminar(c)}
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
            {busqueda && <span className="text-gray-400"> (filtrado)</span>}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => load(page - 1, busqueda)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => load(p, busqueda)}
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
              onClick={() => load(page + 1, busqueda)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {criterioAEliminar && (
        <ModalEliminar
          titulo="Confirmar eliminación"
          onConfirm={handleEliminar}
          onCancel={() => setCriterioAEliminar(null)}
          loading={loadingEliminar}
        >
          <p className="font-semibold text-gray-800">{criterioAEliminar.nombre}</p>
          <p className="text-gray-500">{criterioAEliminar.programa}</p>
          <p className="text-gray-500">{criterioAEliminar.cohorte}</p>
        </ModalEliminar>
      )}
    </div>
  );
}