import { useState } from "react";
import { useNavigate, useLocation } from "react-router";

// ── Íconos (Heroicons) ────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[18px] w-[18px] shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0 text-neutral-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0 text-neutral-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0 text-neutral-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Criterio {
  id: string;
  nombre: string;
  puntajeMaximo: number;
  puntaje: number;
}

interface Entrevista {
  id: string;
  fecha: string;
  hora: string;
  modalidad: "virtual" | "presencial";
  lugar: string;
  estado: "pendiente" | "confirmada" | "solicitud de cambio" | "cancelada" | "completada";
  motivo?: string;
}

// ── Helper: badge de estado entrevista ────────────────────────────────────────

function EntrevistaBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    confirmada:          "bg-green-100 text-green-700",
    "solicitud de cambio": "bg-amber-100 text-amber-600",
    pendiente:           "bg-yellow-100 text-yellow-600",
    cancelada:           "bg-red-100 text-red-700",
    completada:          "bg-neutral-200 text-neutral-600",
  };
  const labels: Record<string, string> = {
    confirmada:          "Confirmada",
    "solicitud de cambio": "Solicitud de cambio",
    pendiente:           "Pendiente de confirmación",
    cancelada:           "Cancelada",
    completada:          "Completada",
  };
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-lg ${map[estado] ?? "bg-gray-100 text-gray-700"}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

function ModalidadBadge({ modalidad }: { modalidad: string }) {
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-lg ${
      modalidad === "virtual" ? "bg-blue-100 text-blue-700" : "bg-neutral-200 text-neutral-700"
    }`}>
      {modalidad === "virtual" ? "Virtual" : "Presencial"}
    </span>
  );
}

// ── Helpers de formato ────────────────────────────────────────────────────────

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function formatFecha(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${parseInt(day)} de ${MESES[parseInt(month) - 1]} de ${year}`;
}

function formatHora(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function CalificacionAspirante() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { nombre?: string; correo?: string } | null;
  const aspiranteNombre = state?.nombre ?? "Aspirante";
  const aspiranteCorreo = state?.correo ?? "aspirante@email.com";

  const [criterios, setCriterios] = useState<Criterio[]>([
    { id: "1", nombre: "Promedio académico de pregrado", puntajeMaximo: 25, puntaje: 0 },
    { id: "2", nombre: "Experiencia laboral",            puntajeMaximo: 20, puntaje: 0 },
    { id: "3", nombre: "Producción académica",           puntajeMaximo: 15, puntaje: 0 },
    { id: "4", nombre: "Carta de motivación",            puntajeMaximo: 15, puntaje: 0 },
    { id: "5", nombre: "Referencias académicas",         puntajeMaximo: 15, puntaje: 0 },
    { id: "6", nombre: "Entrevista",                     puntajeMaximo: 10, puntaje: 0 },
  ]);

  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([
    {
      id: "1",
      fecha: "2026-05-18",
      hora: "15:00",
      modalidad: "virtual",
      lugar: "meet.google.com/xyz-abc-def",
      estado: "confirmada",
    },
    {
      id: "2",
      fecha: "2026-05-20",
      hora: "10:00",
      modalidad: "presencial",
      lugar: "Edificio Central, Sala 302",
      estado: "solicitud de cambio",
      motivo: "Tengo un compromiso académico a esa hora. ¿Podríamos cambiarla para la tarde?",
    },
    {
      id: "3",
      fecha: "2026-05-22",
      hora: "14:30",
      modalidad: "virtual",
      lugar: "teams.microsoft.com/meeting/abc-123",
      estado: "pendiente",
    },
  ]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [entrevistaEditando, setEntrevistaEditando] = useState<string | null>(null);
  const [nuevaEntrevista, setNuevaEntrevista] = useState({
    fecha: "",
    hora: "",
    modalidad: "virtual" as "virtual" | "presencial",
    lugar: "",
  });
  const [mostrarDialogoCancelar, setMostrarDialogoCancelar] = useState(false);
  const [entrevistaCancelarId, setEntrevistaCancelarId] = useState<string | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  // ── Handlers entrevista ───────────────────────────────────────────────────

  const handleAgendar = () => {
    if (!nuevaEntrevista.fecha || !nuevaEntrevista.hora || !nuevaEntrevista.lugar) return;
    if (entrevistaEditando) {
      setEntrevistas(prev =>
        prev.map(e =>
          e.id === entrevistaEditando
            ? { ...e, ...nuevaEntrevista, estado: "pendiente" as const, motivo: undefined }
            : e
        )
      );
      setEntrevistaEditando(null);
    } else {
      const nueva: Entrevista = {
        id: Date.now().toString(),
        ...nuevaEntrevista,
        estado: "pendiente",
      };
      setEntrevistas(prev => [...prev, nueva]);
    }
    setNuevaEntrevista({ fecha: "", hora: "", modalidad: "virtual", lugar: "" });
    setMostrarFormulario(false);
  };

  const handleReagendar = (e: Entrevista) => {
    setNuevaEntrevista({ fecha: e.fecha, hora: e.hora, modalidad: e.modalidad, lugar: e.lugar });
    setEntrevistaEditando(e.id);
    setMostrarFormulario(true);
  };

  const handleCompletarReunion = (id: string) => {
    setEntrevistas(prev =>
      prev.map(e => (e.id === id ? { ...e, estado: "completada" as const } : e))
    );
  };

  const handleCancelarConfirmada = () => {
    if (!entrevistaCancelarId || !motivoCancelacion.trim()) return;
    setEntrevistas(prev =>
      prev.map(e =>
        e.id === entrevistaCancelarId
          ? { ...e, estado: "cancelada" as const, motivo: motivoCancelacion }
          : e
      )
    );
    setMotivoCancelacion("");
    setEntrevistaCancelarId(null);
    setMostrarDialogoCancelar(false);
  };

  // ── Criterios ─────────────────────────────────────────────────────────────

  const handlePuntajeChange = (id: string, valor: string) => {
    const n = parseFloat(valor) || 0;
    setCriterios(prev =>
      prev.map(c => (c.id === id ? { ...c, puntaje: Math.min(n, c.puntajeMaximo) } : c))
    );
  };

  const puntajeTotal = criterios.reduce((s, c) => s + c.puntaje, 0);
  const puntajeMaximoTotal = criterios.reduce((s, c) => s + c.puntajeMaximo, 0);

  // ── Grupos de entrevistas ─────────────────────────────────────────────────

  const confirmadas    = entrevistas.filter(e => e.estado === "confirmada");
  const activas        = entrevistas.filter(e => e.estado === "pendiente" || e.estado === "solicitud de cambio");
  const historial      = entrevistas.filter(e => e.estado === "completada" || e.estado === "cancelada");

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="max-w-5xl mx-auto">

        {/* Volver */}
        <button
          onClick={() => navigate("/programa/admision/calificacion")}
          className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors font-medium animate-fade-in"
        >
          <ArrowLeftIcon />
          <span>Volver a Calificación</span>
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6 animate-fade-in delay-100">
          Calificar aspirante
        </h1>

        {/* Información del aspirante */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 animate-fade-in-up delay-200">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            Información del aspirante
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-neutral-400 mb-1">Nombre completo</div>
              <div className="text-sm font-semibold text-gray-900">{aspiranteNombre}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Cédula</div>
              <div className="text-sm text-gray-900">1098765432</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Correo</div>
              <div className="text-sm text-gray-900">{aspiranteCorreo}</div>
            </div>
          </div>
        </div>

        {/* Sección entrevistas */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Entrevistas
            </h2>
            <button
              onClick={() => { setEntrevistaEditando(null); setNuevaEntrevista({ fecha: "", hora: "", modalidad: "virtual", lugar: "" }); setMostrarFormulario(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium"
            >
              <PlusIcon />
              Agendar entrevista
            </button>
          </div>

          {/* Confirmadas */}
          {confirmadas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-600 mb-3">Entrevistas confirmadas</h3>
              <div className="space-y-3">
                {confirmadas.map(e => (
                  <div key={e.id} className="border border-green-200 bg-green-100/30 rounded-lg p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <EntrevistaBadge estado={e.estado} />
                      <ModalidadBadge modalidad={e.modalidad} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarIcon /><span>{formatFecha(e.fecha)}</span>
                        <ClockIcon /><span>{formatHora(e.hora)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPinIcon />
                        <span>{e.modalidad === "virtual" ? "Enlace: " : "Lugar: "}{e.lugar}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200 flex gap-2">
                      <button
                        onClick={() => handleCompletarReunion(e.id)}
                        className="flex-1 px-3 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800 transition-colors font-medium"
                      >
                        Completar reunión
                      </button>
                      <button
                        onClick={() => { setEntrevistaCancelarId(e.id); setMostrarDialogoCancelar(true); }}
                        className="flex-1 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 text-xs rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pendientes / solicitud de cambio */}
          {activas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-600 mb-3">Otras entrevistas</h3>
              <div className="space-y-3">
                {activas.map(e => (
                  <div key={e.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <EntrevistaBadge estado={e.estado} />
                      <ModalidadBadge modalidad={e.modalidad} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarIcon /><span>{formatFecha(e.fecha)}</span>
                        <ClockIcon /><span>{formatHora(e.hora)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPinIcon />
                        <span>{e.modalidad === "virtual" ? "Enlace: " : "Lugar: "}{e.lugar}</span>
                      </div>
                      {e.estado === "solicitud de cambio" && e.motivo && (
                        <>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs font-semibold text-neutral-400 mb-1">Motivo de solicitud:</div>
                            <div className="text-sm text-gray-700 italic">"{e.motivo}"</div>
                          </div>
                          <div className="mt-2">
                            <button
                              onClick={() => handleReagendar(e)}
                              className="px-3 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800 transition-colors font-medium"
                            >
                              Reagendar entrevista
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial */}
          {historial.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-3">Historial</h3>
              <div className="space-y-3">
                {historial.map(e => (
                  <div key={e.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <EntrevistaBadge estado={e.estado} />
                      <ModalidadBadge modalidad={e.modalidad} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarIcon /><span>{formatFecha(e.fecha)}</span>
                        <ClockIcon /><span>{formatHora(e.hora)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPinIcon />
                        <span>{e.modalidad === "virtual" ? "Enlace: " : "Lugar: "}{e.lugar}</span>
                      </div>
                      {e.estado === "cancelada" && e.motivo && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs font-semibold text-neutral-400 mb-1">Motivo de cancelación:</div>
                          <div className="text-sm text-gray-700 italic">"{e.motivo}"</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entrevistas.length === 0 && (
            <p className="text-center py-8 text-sm text-neutral-400">No hay entrevistas agendadas.</p>
          )}
        </div>

        {/* Tabla criterios */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in-up delay-400">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Criterios de evaluación
            </h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Criterio</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Puntaje máximo</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Puntaje obtenido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {criterios.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{c.nombre}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-600">{c.puntajeMaximo}</td>
                  <td className="px-6 py-4 text-center">
                    <input
                      type="number"
                      min="0"
                      max={c.puntajeMaximo}
                      step="0.1"
                      value={c.puntaje || ""}
                      onChange={e => handlePuntajeChange(c.id, e.target.value)}
                      placeholder="0"
                      className="w-24 text-sm text-center text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-colors"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Total</td>
                <td className="px-6 py-4 text-sm font-semibold text-center text-gray-900">{puntajeMaximoTotal}</td>
                <td className="px-6 py-4 text-center">
                  <span className="text-lg font-bold text-red-700">{puntajeTotal.toFixed(1)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => navigate("/programa/admision/calificacion")}
              className="px-6 py-2.5 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium"
            >
              Guardar calificación
            </button>
          </div>
        </div>

      </div>

      {/* Modal: Agendar / Reagendar entrevista */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-overlay-in">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-4 animate-modal-in">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {entrevistaEditando ? "Reagendar entrevista" : "Agendar entrevista"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Fecha</label>
                  <input
                    type="date"
                    value={nuevaEntrevista.fecha}
                    onChange={e => setNuevaEntrevista(p => ({ ...p, fecha: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Hora</label>
                  <input
                    type="time"
                    value={nuevaEntrevista.hora}
                    onChange={e => setNuevaEntrevista(p => ({ ...p, hora: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Modalidad</label>
                <div className="flex gap-4">
                  {(["virtual", "presencial"] as const).map(m => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="modalidad"
                        value={m}
                        checked={nuevaEntrevista.modalidad === m}
                        onChange={() => setNuevaEntrevista(p => ({ ...p, modalidad: m, lugar: "" }))}
                        className="accent-red-700"
                      />
                      <span className="text-sm text-gray-700 capitalize">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  {nuevaEntrevista.modalidad === "virtual" ? "Enlace virtual" : "Lugar"}
                </label>
                <input
                  type="text"
                  value={nuevaEntrevista.lugar}
                  onChange={e => setNuevaEntrevista(p => ({ ...p, lugar: e.target.value }))}
                  placeholder={nuevaEntrevista.modalidad === "virtual" ? "meet.google.com/xxx" : "Edificio, Sala..."}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => { setMostrarFormulario(false); setEntrevistaEditando(null); }}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgendar}
                className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
              >
                {entrevistaEditando ? "Reagendar" : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cancelar entrevista */}
      {mostrarDialogoCancelar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-overlay-in">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-4 animate-modal-in">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Cancelar entrevista</h3>
            </div>
            <div className="p-6">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Motivo de cancelación
              </label>
              <textarea
                value={motivoCancelacion}
                onChange={e => setMotivoCancelacion(e.target.value)}
                placeholder="Ingrese el motivo por el cual se cancela la entrevista..."
                rows={4}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent resize-none"
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => { setMostrarDialogoCancelar(false); setMotivoCancelacion(""); setEntrevistaCancelarId(null); }}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium"
              >
                Volver
              </button>
              <button
                onClick={handleCancelarConfirmada}
                disabled={!motivoCancelacion.trim()}
                className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar entrevista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
