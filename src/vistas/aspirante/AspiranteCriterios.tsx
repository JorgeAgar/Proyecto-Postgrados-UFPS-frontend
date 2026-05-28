import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import { getCriterios, type Criterio } from "../../services/aspirante/aspiranteCriteriosService";
import type { AspiranteOutletContext } from "../../layouts/AspiranteLayout";

// ── Íconos ────────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function AspiranteCriterios() {
  const { mostrarAlerta } = useOutletContext<AspiranteOutletContext>();

  const [cargando, setCargando] = useState(true);
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [puntajeTotal, setPuntajeTotal] = useState(0);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const res = await getCriterios();
        setCriterios(res.criterios);
        setPuntajeTotal(res.puntajeTotal);
      } catch {
        mostrarAlerta("Error al cargar los criterios. Intenta de nuevo.");
      } finally {
        setCargando(false);
      }
    };
    cargar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="">

        {/* Encabezado */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-xl font-bold text-gray-900">Criterios de evaluación</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Aquí puedes consultar los criterios con los que serás evaluado y los puntajes registrados.
          </p>
        </div>

        {/* Tabla */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in-up delay-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Criterio</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Puntaje máximo</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Puntaje obtenido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cargando ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                        <Spinner />
                        Cargando criterios...
                      </div>
                    </td>
                  </tr>
                ) : criterios.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-sm text-neutral-400">
                      No hay criterios de evaluación registrados.
                    </td>
                  </tr>
                ) : (
                  criterios.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{c.nombre}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">{c.peso}</td>
                      <td className="px-6 py-4 text-center text-sm">
                        {c.puntaje !== null
                          ? <span className="font-semibold text-red-700">{c.puntaje.toFixed(1)}</span>
                          : <span className="text-neutral-400">—</span>
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {!cargando && criterios.length > 0 && (
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">Total</td>
                    <td />
                    <td className="px-6 py-4 text-center">
                      <span className="text-lg font-bold text-red-700">
                        {puntajeTotal > 0 ? puntajeTotal.toFixed(1) : "—"}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
