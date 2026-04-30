import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  entrevistaService,
  type Entrevista,
} from "../../../services/comiteCurricularService";

const EVALUADORES = [
  "Dr. Ramírez Díaz",
  "Dra. Peña Torres",
  "Dr. López Vera",
  "Dra. Herrera Blanco",
];

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function ReagendarEntrevista() {
  const navigate = useNavigate();
  const location = useLocation();

  // La entrevista llega por state (desde la tabla de VerEntrevistas)
  const entrevistaInicial =
    (location.state as { entrevista?: Entrevista })?.entrevista ?? null;

  const [entrevista, setEntrevista] = useState<Entrevista | null>(entrevistaInicial);

  // Campos editables
  const [evaluador, setEvaluador] = useState(entrevistaInicial?.evaluadorNombre ?? "");
  const [fecha, setFecha] = useState(entrevistaInicial?.fecha ?? "");
  const [hora, setHora] = useState(entrevistaInicial?.hora ?? "");
  const [modalidad, setModalidad] = useState<"Presencial" | "Virtual">(
    (entrevistaInicial?.modalidad as "Presencial" | "Virtual") ?? "Presencial"
  );
  const [lugarOEnlace, setLugarOEnlace] = useState(
    entrevistaInicial?.lugarOEnlace ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!entrevistaInicial) {
      // Si no llegó por state, redirigir a la lista
      navigate("/comite/entrevista", { replace: true });
    }
  }, [entrevistaInicial, navigate]);

  if (!entrevista) return null;

  // Bloqueo si la entrevista ya fue realizada (criterio de aceptación)
  const bloqueada = entrevista.estado === "Realizada";

  const clearFieldError = (field: string) =>
    setFieldErrors((p) => ({ ...p, [field]: "" }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!evaluador) errs.evaluador = "Selecciona un evaluador.";
    if (!fecha) errs.fecha = "La fecha es obligatoria.";
    if (!hora) errs.hora = "La hora es obligatoria.";
    if (!lugarOEnlace.trim()) errs.lugarOEnlace = "Ingresa el lugar o enlace.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (bloqueada) {
      setError("No se puede reagendar una entrevista que ya ha sido realizada.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await entrevistaService.update(entrevista.id, {
        evaluadorNombre: evaluador,
        fecha,
        hora,
        modalidad,
        lugarOEnlace: lugarOEnlace.trim(),
      });
      setEntrevista(updated);
      setSuccess(
        `Entrevista reagendada correctamente para el ${fecha} a las ${hora}. El aspirante recibirá una notificación con los nuevos datos.`
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al reagendar la entrevista."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Reagendar entrevista</h1>
        <p className="mt-1 text-sm text-gray-500">
          Aspirante:{" "}
          <span className="font-semibold text-gray-700">{entrevista.aspiranteNombre}</span>
          {" "}—{" "}
          <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-1.5 py-0.5 rounded">
            {entrevista.cohorte}
          </span>
        </p>
      </div>

      {/* Aviso si está bloqueada */}
      {bloqueada && (
        <div className="animate-fade-in mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Reagendamiento bloqueado:</strong> Esta entrevista ya ha sido marcada como{" "}
          <strong>Realizada</strong>. No puede modificarse.
        </div>
      )}

      {success && (
        <div className="animate-fade-in mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}
      {error && (
        <div className="animate-fade-in mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
      >
        {/* Aspirante (solo lectura) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Aspirante</label>
            <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2.5 truncate">
              {entrevista.aspiranteNombre}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Programa</label>
            <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2.5 truncate">
              {entrevista.programa}
            </p>
          </div>
        </div>

        {/* Evaluador */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Evaluador asignado <span className="text-red-600">*</span>
          </label>
          <select
            value={evaluador}
            onChange={(e) => { setEvaluador(e.target.value); clearFieldError("evaluador"); setError(null); }}
            disabled={bloqueada || loading}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <option value="">Selecciona un evaluador</option>
            {EVALUADORES.map((ev) => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>
          {fieldErrors.evaluador && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.evaluador}</p>
          )}
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nueva fecha <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => { setFecha(e.target.value); clearFieldError("fecha"); setError(null); }}
              disabled={bloqueada || loading}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {fieldErrors.fecha && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.fecha}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nueva hora <span className="text-red-600">*</span>
            </label>
            <input
              type="time"
              value={hora}
              onChange={(e) => { setHora(e.target.value); clearFieldError("hora"); setError(null); }}
              disabled={bloqueada || loading}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {fieldErrors.hora && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.hora}</p>
            )}
          </div>
        </div>

        {/* Modalidad */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Modalidad <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-3">
            {(["Presencial", "Virtual"] as const).map((m) => (
              <label
                key={m}
                className={[
                  "flex-1 flex items-center gap-2.5 rounded-lg border px-4 py-3 transition-colors",
                  bloqueada || loading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                  modalidad === m
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="modalidad-reagendar"
                  value={m}
                  checked={modalidad === m}
                  onChange={() => { setModalidad(m); setError(null); }}
                  disabled={bloqueada || loading}
                  className="accent-red-700"
                />
                <span className="text-sm font-medium text-gray-700">{m}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Lugar o enlace */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {modalidad === "Virtual" ? "Enlace de conexión" : "Lugar"}{" "}
            <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={lugarOEnlace}
            onChange={(e) => { setLugarOEnlace(e.target.value); clearFieldError("lugarOEnlace"); setError(null); }}
            disabled={bloqueada || loading}
            placeholder={
              modalidad === "Virtual"
                ? "Ej: https://meet.google.com/abc-defg"
                : "Ej: Sala 204 – Bloque A"
            }
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {fieldErrors.lugarOEnlace && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.lugarOEnlace}</p>
          )}
        </div>

        {/* Nota informativa */}
        {!bloqueada && (
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
            El sistema verificará que la nueva fecha esté dentro del calendario vigente de la cohorte
            y enviará una notificación automática al aspirante con los datos actualizados.
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || bloqueada || !!success}
            className="flex items-center justify-center gap-2 flex-1 bg-red-700 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Spinner />}
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/comite/entrevista")}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}