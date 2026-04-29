import { useState, useEffect } from "react";
import { pruebaService, type PruebaAdmision } from "../../../services/comiteCurricularService";

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
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-700">Próximamente disponible</p>
        <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
          Conecta el endpoint correspondiente en <code className="text-xs bg-gray-100 px-1 rounded">comiteCurricularService.ts</code> para activar esta funcionalidad.
        </p>
      </div>
    </div>
  );
}

const estadoBadge = (estado: string) => {
  const map: Record<string, string> = {
    Programada: "bg-blue-100 text-blue-700",
    Borrador: "bg-gray-100 text-gray-600",
    Aplicada: "bg-green-100 text-green-700",
    Cancelada: "bg-red-100 text-red-700",
  };
  return map[estado] ?? "bg-gray-100 text-gray-700";
};

export function VerPruebas() {
  const [pruebas, setPruebas] = useState<PruebaAdmision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pruebaService.getAll().then(data => { setPruebas(data); setLoading(false); });
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Pruebas de admisión</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona las pruebas de conocimiento de cada cohorte.</p>
      </div>

      <div className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Programa</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Cohorte</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pruebas.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[200px]"><span className="truncate block">{p.programa}</span></td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-2 py-1 rounded">{p.cohorte}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.fechaAplicacion}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded ${estadoBadge(p.estado)}`}>{p.estado}</span>
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

export function CrearPrueba() {
  return <PlaceholderSection title="Crear prueba de admisión" description="Configura nombre, programa, cohorte y fecha de aplicación." />;
}

export function EditarPrueba() {
  return <PlaceholderSection title="Editar prueba de admisión" description="Modifica los datos de una prueba existente." />;
}

export function EliminarPrueba() {
  return <PlaceholderSection title="Eliminar prueba de admisión" description="Elimina una prueba del sistema (requiere confirmación)." />;
}
