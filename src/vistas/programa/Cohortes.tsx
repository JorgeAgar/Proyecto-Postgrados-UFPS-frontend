import { useEffect, useState } from "react";
import { getProgramas, updatePrograma } from "../../services/programaService";
import type { ProgramaBackend } from "../../services/programaService";

type Row = {
  programaId: number;
  nombre: string;
  codigo?: number;
  semestres?: number;
  correo?: string;
  sede?: string;
  facultad?: string;
  ofertas: number;
};

export default function Cohortes() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Partial<Row>>({});
  const [sortKey, setSortKey] = useState<keyof Row | null>("nombre");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProgramas();
        if (mounted) {
          const programs = Array.isArray(data) ? data : [];
          const mapped: Row[] = programs.map((p) => ({
            programaId: p.id,
            nombre: p.nombre,
            codigo: p.codigo,
            semestres: p.semestres,
            correo: p.correo,
            sede: p.sede?.nombre,
            facultad: p.facultad?.nombre,
            ofertas: Array.isArray(p.ofertaacademicaList) ? p.ofertaacademicaList.length : 0,
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
                <th onClick={() => sortBy("nombre")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Programa</th>
                <th onClick={() => sortBy("codigo")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Código</th>
                <th onClick={() => sortBy("semestres")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Semestres</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th onClick={() => sortBy("sede")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Sede</th>
                <th onClick={() => sortBy("facultad")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Facultad</th>
                <th onClick={() => sortBy("ofertas")} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">Ofertas</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((r) => (
                <tr key={r.programaId}>
                  {editingId === r.programaId ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap" colSpan={2}>
                        <input className="w-full rounded border-gray-200 p-1" value={String(editValues.nombre ?? r.nombre)} onChange={(e) => setEditValues((s) => ({ ...s, nombre: e.target.value }))} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input className="w-20 rounded border-gray-200 p-1" value={String(editValues.semestres ?? r.semestres ?? "")} onChange={(e) => setEditValues((s) => ({ ...s, semestres: Number(e.target.value) }))} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input className="w-40 rounded border-gray-200 p-1" value={String(editValues.correo ?? r.correo ?? "")} onChange={(e) => setEditValues((s) => ({ ...s, correo: e.target.value }))} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.sede ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.facultad ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input className="w-16 rounded border-gray-200 p-1" value={String(editValues.ofertas ?? r.ofertas)} onChange={(e) => setEditValues((s) => ({ ...s, ofertas: Number(e.target.value) }))} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => setEditingId(null)} className="mr-3 text-gray-600">Cancelar</button>
                        <button
                          onClick={async () => {
                            try {
                              const payload: Partial<ProgramaBackend> = {
                                nombre: String(editValues.nombre ?? r.nombre),
                                semestres: Number(editValues.semestres ?? r.semestres),
                                correo: String(editValues.correo ?? r.correo ?? ""),
                              };
                              await updatePrograma({ id: r.programaId, ...payload });
                              setRows((prev) => prev.map((row) => {
                                if (row.programaId !== r.programaId) return row;
                                return {
                                  ...row,
                                  nombre: payload.nombre ?? row.nombre,
                                  semestres: payload.semestres ?? row.semestres,
                                  correo: payload.correo ?? row.correo,
                                  ofertas: Number(editValues.ofertas ?? row.ofertas),
                                };
                              }));
                              setEditingId(null);
                              setEditValues({});
                            } catch (err) {
                              console.error(err);
                              alert((err as Error)?.message ?? "Error al guardar");
                            }
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Guardar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{r.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.codigo ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.semestres ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.correo ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.sede ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.facultad ?? "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.ofertas}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setEditingId(r.programaId);
                            setEditValues({ nombre: r.nombre, codigo: r.codigo, semestres: r.semestres, correo: r.correo, sede: r.sede, facultad: r.facultad, ofertas: r.ofertas });
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Editar
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
