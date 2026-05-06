import { useState, useEffect } from "react";
import { admisionService, type Admision } from "../../../services/comiteService";

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

// ── Decisión de admisión ──────────────────────────────────────────────────────

export function DecisionAdmision() {
  const [aspirantes, setAspirantess] = useState<Admision[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    admisionService.getAll().then(data => {
      setAspirantess(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleDecision = async (id: number, decision: "admitido" | "rechazado") => {
    setActionLoading(id);
    setMessage(null);
    try {
      if (decision === "admitido") await admisionService.admitir(id);
      else await admisionService.rechazar(id);
      load();
      const nombre = aspirantes.find(a => a.id === id)?.aspiranteNombre ?? "";
      setMessage({ type: "ok", text: `${nombre} ha sido ${decision}.` });
    } catch {
      setMessage({ type: "err", text: "Error al procesar la decisión." });
    } finally {
      setActionLoading(null);
    }
  };

  const estadoBadge = (estado: Admision["estado"]) => {
    const map = {
      admitido: "bg-green-100 text-green-700",
      rechazado: "bg-red-100 text-red-700",
      pendiente: "bg-yellow-100 text-yellow-700",
    };
    return map[estado];
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Admitir / Rechazar aspirantes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Toma la decisión de admisión para cada aspirante evaluado.
        </p>
      </div>

      {message && (
        <div className={`animate-fade-in mb-4 rounded-lg border px-4 py-3 text-sm ${message.type === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <div className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aspirante</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Documento</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Programa</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Puntaje</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {aspirantes.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{a.aspiranteNombre}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{a.documento}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[200px]">
                      <span className="truncate block">{a.programa}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800">
                      {a.puntajeTotal.toFixed(1)}
                      <span className="text-xs text-gray-400 font-normal"> / 100</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded capitalize ${estadoBadge(a.estado)}`}>
                        {a.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {a.estado === "pendiente" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDecision(a.id, "admitido")}
                            disabled={actionLoading === a.id}
                            className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === a.id ? "..." : "Admitir"}
                          </button>
                          <button
                            onClick={() => handleDecision(a.id, "rechazado")}
                            disabled={actionLoading === a.id}
                            className="px-3 py-1.5 text-xs font-bold bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === a.id ? "..." : "Rechazar"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Procesado</span>
                      )}
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

// ── Lista de admitidos ─────────────────────────────────────────────────────────

export function ListaAdmitidos() {
  const [admitidos, setAdmitidos] = useState<Admision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admisionService.getAll().then(data => {
      setAdmitidos(data.filter(a => a.estado === "admitido"));
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="animate-fade-in-up delay-0 flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Lista de admitidos</h1>
          <p className="mt-1 text-sm text-gray-500">{admitidos.length} aspirante{admitidos.length !== 1 ? "s" : ""} admitido{admitidos.length !== 1 ? "s" : ""}.</p>
        </div>
        <button
          onClick={() => alert("Funcionalidad de generación de PDF próximamente.\nConecta el endpoint de exportación en comiteCurricularService.ts")}
          className="inline-flex items-center gap-2 bg-red-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-red-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Generar lista (PDF)
        </button>
      </div>

      <div className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <Spinner /> : admitidos.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg font-semibold">Sin admitidos aún</p>
            <p className="text-sm mt-1">Ve a "Admitir / Rechazar aspirantes" para procesar las decisiones.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aspirante</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Documento</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Puntaje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {admitidos
                  .sort((a, b) => b.puntajeTotal - a.puntajeTotal)
                  .map((a, idx) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 font-semibold">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{a.aspiranteNombre}</td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{a.documento}</td>
                      <td className="px-4 py-3 font-bold text-green-700">{a.puntajeTotal.toFixed(1)}</td>
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

// ── Notificar admitidos ────────────────────────────────────────────────────────

export function NotificarAdmitidos() {
  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Notificar aspirantes admitidos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Envía notificaciones por correo electrónico a los aspirantes admitidos.
        </p>
      </div>
      <div className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-green-600" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
          </svg>
        </div>
        <p className="text-lg font-bold text-gray-700">Notificaciones automáticas</p>
        <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
          Conecta el endpoint de notificaciones en <code className="text-xs bg-gray-100 px-1 rounded">comiteCurricularService.ts</code> para habilitar el envío de correos a los admitidos.
        </p>
        <button
          onClick={() => alert("Próximamente: integración con el sistema de correos institucional.")}
          className="mt-6 inline-flex items-center gap-2 bg-green-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors"
        >
          Enviar notificaciones
        </button>
      </div>
    </div>
  );
}
