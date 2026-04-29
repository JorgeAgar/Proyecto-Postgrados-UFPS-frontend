/**
 * Vistas del módulo Entrevista del Comité Curricular.
 * Estructura visual profesional con placeholders funcionales listos para conectar al backend.
 */
import { useState, useEffect } from "react";
import { entrevistaService, type Entrevista } from "../../../services/comiteCurricularService";

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

function PlaceholderSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-red-600" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-700">Próximamente disponible</p>
        <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
          Esta sección está preparada estructuralmente. Conecta el endpoint del backend correspondiente en <code className="text-xs bg-gray-100 px-1 rounded">comiteCurricularService.ts</code> para activar la funcionalidad completa.
        </p>
      </div>
    </div>
  );
}

// ── Ver entrevistas ───────────────────────────────────────────────────────────

export function VerEntrevistas() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    entrevistaService.getAll().then(data => {
      setEntrevistas(data);
      setLoading(false);
    });
  }, []);

  const estadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      Programada: "bg-blue-100 text-blue-700",
      Pendiente: "bg-yellow-100 text-yellow-700",
      Realizada: "bg-green-100 text-green-700",
      Cancelada: "bg-red-100 text-red-700",
    };
    return colors[estado] ?? "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Entrevistas</h1>
        <p className="mt-1 text-sm text-gray-500">Listado de entrevistas programadas con los aspirantes.</p>
      </div>

      <div className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aspirante</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Modalidad</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entrevistas.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{e.aspiranteNombre}</td>
                    <td className="px-4 py-3 text-gray-600">{e.fecha}</td>
                    <td className="px-4 py-3 text-gray-600">{e.hora}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{e.modalidad}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${estadoBadge(e.estado)}`}>
                        {e.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function AgendarEntrevista() {
  return <PlaceholderSection title="Agendar entrevista" description="Configura fecha, hora, modalidad y asigna el aspirante." />;
}

export function ReagendarEntrevista() {
  return <PlaceholderSection title="Reagendar entrevista" description="Modifica la fecha u hora de una entrevista ya programada." />;
}

export function EliminarEntrevista() {
  return <PlaceholderSection title="Eliminar entrevista" description="Cancela y elimina una entrevista del sistema." />;
}
