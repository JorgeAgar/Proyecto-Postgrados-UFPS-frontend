import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { programaApiFetch } from "../../services/programaService";

type Row = {
  programaId: number;
  nombre: string;
  ofertaId?: number;
  codigo?: number;
  semestres?: number;
  correo?: string;
  sede?: string;
  facultad?: string;
  ofertas: number; // here we use 'cupos' from oferta academica
  modalidad?: string;
  jornada?: string;
  cohorte?: string;
  plazo?: string;
  encuentros?: string;
  raw?: OfertaBackend;
};

// Minimal backend type for oferta academica entries returned by the API
type OfertaBackend = {
  id?: number;
  _id?: number;
  programa?: {
    id?: number;
    nombre?: string;
    codigo?: number;
    semestres?: number;
    correo?: string;
    sede?: { nombre?: string } | string;
    facultad?: { nombre?: string } | string;
    ofertaacademicaList?: unknown[];
  } | null;
  cupos?: number;
  modalidad?: { nombre?: string } | string | null;
  jornada?: { tipo?: string } | string | null;
  cohorte?: { nombre?: string } | string | null;
  plazo?: { fechainicio?: string; fechafin?: string; tipoplazo?: { nombre?: string } } | null;
  encuentros?: string | null;
};

type SortIndicatorProps = {
  col: keyof Row;
  sortKey: keyof Row | null;
  sortDir: "asc" | "desc";
};

function SortIndicator({ col, sortKey, sortDir }: SortIndicatorProps) {
  const active = sortKey === col;
  if (!active) {
    return (
      <svg className="inline-block h-3 w-3 text-gray-300" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M2 4 L5 1 L8 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 6 L5 9 L8 6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return sortDir === "asc" ? (
    <svg className="inline-block h-3 w-3 text-indigo-600" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M2 6 L5 3 L8 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg className="inline-block h-3 w-3 text-indigo-600" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M2 4 L5 7 L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Cohortes() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<keyof Row | null>("nombre");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // fetch oferta academica list (cohortes/offertas)
        const data = await programaApiFetch<OfertaBackend[]>('/api/dev/endpoint/ofertaacademica/listall');
        if (mounted) {
          const ofertas = Array.isArray(data) ? data : [];
          const mapped: Row[] = ofertas.map((o) => ({
            programaId: o.programa?.id ?? 0,
            ofertaId: o.id ?? o._id ?? 0,
            nombre: o.programa?.nombre ?? "-",
            codigo: o.programa?.codigo,
            semestres: o.programa?.semestres,
            correo: o.programa?.correo,
            sede: typeof o.programa?.sede === 'string' ? (o.programa?.sede as string) : o.programa?.sede?.nombre,
            facultad: typeof o.programa?.facultad === 'string' ? (o.programa?.facultad as string) : o.programa?.facultad?.nombre,
            ofertas: typeof o.cupos === 'number' ? o.cupos : (Array.isArray(o.programa?.ofertaacademicaList) ? o.programa.ofertaacademicaList.length : 0),
            modalidad: typeof o.modalidad === 'string' ? o.modalidad : (o.modalidad?.nombre ?? ""),
            jornada: typeof o.jornada === 'string' ? o.jornada : (o.jornada?.tipo ?? ""),
            cohorte: typeof o.cohorte === 'string' ? o.cohorte : (o.cohorte?.nombre ?? ""),
            plazo: o.plazo ? `${o.plazo.fechainicio ?? ""} → ${o.plazo.fechafin ?? ""} (${o.plazo.tipoplazo?.nombre ?? ""})` : "",
            encuentros: o.encuentros ?? "",
            raw: o,
          }));
          setRows(mapped);
        }
      } catch {
        if (mounted) {
          setRows([]);
          setError("No se pudo cargar la lista de programas. Verifica el endpoint o la conexión.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    load();
    return () => { mounted = false; };
  }, []);


  function sortBy(key: keyof Row) {
    // compute new direction synchronously to avoid using stale state
    const newDir = sortKey === key ? (sortDir === "asc" ? "desc" : "asc") : "asc";
    setSortKey(key);
    setSortDir(newDir);
    setRows((prev) => {
      const copy = [...prev];
      copy.sort((a, b) => {
        const ra = a as unknown as Record<string, unknown>;
        const rb = b as unknown as Record<string, unknown>;
        const va = ra[key];
        const vb = rb[key];
        if (va == null && vb == null) return 0;
        if (va == null) return newDir === "asc" ? -1 : 1;
        if (vb == null) return newDir === "asc" ? 1 : -1;
        if (typeof va === "number" && typeof vb === "number") return newDir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
        return newDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
      return copy;
    });
  }

  

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Cohortes</h2>
        <p className="text-sm text-gray-500">Listado de cohortes del programa</p>
      </div>

      {loading && <p>Cargando cohortes...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && rows.length === 0 && <div className="p-6 bg-white rounded shadow">No se encontraron programas.</div>}

      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Programa</span>
                      <button type="button" onClick={() => sortBy("nombre")} className="ml-2 p-1" aria-label="Ordenar por Programa"><SortIndicator col="nombre" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Código</span>
                      <button type="button" onClick={() => sortBy("codigo")} className="ml-2 p-1" aria-label="Ordenar por Código"><SortIndicator col="codigo" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Semestres</span>
                      <button type="button" onClick={() => sortBy("semestres")} className="ml-2 p-1" aria-label="Ordenar por Semestres"><SortIndicator col="semestres" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Contacto</span>
                      <button type="button" onClick={() => sortBy("correo")} className="ml-2 p-1" aria-label="Ordenar por Contacto"><SortIndicator col="correo" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Sede</span>
                      <button type="button" onClick={() => sortBy("sede")} className="ml-2 p-1" aria-label="Ordenar por Sede"><SortIndicator col="sede" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Facultad</span>
                      <button type="button" onClick={() => sortBy("facultad")} className="ml-2 p-1" aria-label="Ordenar por Facultad"><SortIndicator col="facultad" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Modalidad</span>
                      <button type="button" onClick={() => sortBy("modalidad")} className="ml-2 p-1" aria-label="Ordenar por Modalidad"><SortIndicator col="modalidad" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Jornada</span>
                      <button type="button" onClick={() => sortBy("jornada")} className="ml-2 p-1" aria-label="Ordenar por Jornada"><SortIndicator col="jornada" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Cohorte</span>
                      <button type="button" onClick={() => sortBy("cohorte")} className="ml-2 p-1" aria-label="Ordenar por Cohorte"><SortIndicator col="cohorte" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Plazo</span>
                      <button type="button" onClick={() => sortBy("plazo")} className="ml-2 p-1" aria-label="Ordenar por Plazo"><SortIndicator col="plazo" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Encuentros</span>
                      <button type="button" onClick={() => sortBy("encuentros")} className="ml-2 p-1" aria-label="Ordenar por Encuentros"><SortIndicator col="encuentros" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Ofertas</span>
                      <button type="button" onClick={() => sortBy("ofertas")} className="ml-2 p-1" aria-label="Ordenar por Ofertas"><SortIndicator col="ofertas" sortKey={sortKey} sortDir={sortDir} /></button>
                    </div>
                  </th>
                  <th className="px-6 py-3" />
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((r) => (
                <tr key={r.ofertaId ?? r.programaId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{r.nombre}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.codigo ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.semestres ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.correo ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.sede ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.facultad ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.modalidad ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.jornada ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.cohorte ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.plazo ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.encuentros ?? "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.ofertas}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/programa/editar-cohorte/${r.ofertaId}`)}
                      title="Editar cohorte"
                      className="inline-flex items-center gap-2 bg-red-700 text-white px-3 py-1 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 15a1 1 0 011-1h3.586l9.293-9.293a1 1 0 00-1.414-1.414L5 12.586V16a1 1 0 01-1 1H3a1 1 0 01-1-1v-1z" clipRule="evenodd" />
                      </svg>
                      <span>Editar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
