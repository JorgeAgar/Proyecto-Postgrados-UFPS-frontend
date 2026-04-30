import { useState } from "react";
import { useNavigate } from "react-router";
import { entrevistaService } from "../../../services/comiteCurricularService";

// ── Mock data — reemplazar con fetch al backend ───────────────────────────────

const PROGRAMAS = [
  "Maestría en Ingeniería de Software",
  "Especialización en Redes",
  "Maestría en Ciencias Computacionales",
];

const COHORTES = ["2025-1", "2025-2", "2026-1"];

const EVALUADORES = [
  "Dr. Ramírez Díaz",
  "Dra. Peña Torres",
  "Dr. López Vera",
  "Dra. Herrera Blanco",
];

// Aspirantes con estado "Documentación validada" (criterio de aceptación)
const ASPIRANTES_VALIDADOS = [
  { id: 1, nombre: "Carlos Gómez", documento: "1098765432" },
  { id: 2, nombre: "Laura Martínez", documento: "1020304050" },
  { id: 3, nombre: "Andrés Rojas", documento: "9876543210" },
  { id: 4, nombre: "Diana Fuentes", documento: "1043219876" },
  { id: 5, nombre: "Paola Suárez", documento: "1057321456" },
];

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function AgendarEntrevista() {
  const navigate = useNavigate();

  // Campos del formulario
  const [aspiranteId, setAspiranteId] = useState<string>("");
  const [evaluador, setEvaluador] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [modalidad, setModalidad] = useState<"Presencial" | "Virtual" | "">("");
  const [lugarOEnlace, setLugarOEnlace] = useState("");
  const [programa, setPrograma] = useState("");
  const [cohorte, setCohorte] = useState("");

  // UI
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) =>
    setFieldErrors((p) => ({ ...p, [field]: "" }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!aspiranteId) errs.aspiranteId = "Selecciona un aspirante.";
    if (!evaluador) errs.evaluador = "Selecciona un evaluador.";
    if (!fecha) errs.fecha = "La fecha es obligatoria.";
    if (!hora) errs.hora = "La hora es obligatoria.";
    if (!modalidad) errs.modalidad = "Selecciona una modalidad.";
    if (!lugarOEnlace.trim()) errs.lugarOEnlace = "Ingresa el lugar o enlace de conexión.";
    if (!programa) errs.programa = "Selecciona un programa.";
    if (!cohorte) errs.cohorte = "Selecciona una cohorte.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const aspirante = ASPIRANTES_VALIDADOS.find((a) => a.id === Number(aspiranteId))!;

    setLoading(true);
    setError(null);
    try {
      await entrevistaService.create({
        aspiranteNombre: aspirante.nombre,
        aspiranteDocumento: aspirante.documento,
        evaluadorNombre: evaluador,
        fecha,
        hora,
        modalidad: modalidad as "Presencial" | "Virtual",
        lugarOEnlace: lugarOEnlace.trim(),
        programa,
        cohorte,
        estado: "Programada",
        creadoPor: "comite@ufps.edu.co", // TODO: leer de sesión activa
      });

      setSuccess(
        `Entrevista agendada correctamente para ${aspirante.nombre} el ${fecha} a las ${hora}. Se enviará una notificación al aspirante.`
      );

      // Limpiar formulario
      setAspiranteId("");
      setEvaluador("");
      setFecha("");
      setHora("");
      setModalidad("");
      setLugarOEnlace("");
      setPrograma("");
      setCohorte("");
      setFieldErrors({});
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al agendar la entrevista."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Agendar entrevista</h1>
        <p className="mt-1 text-sm text-gray-500">
          Solo pueden ser agendados aspirantes con estado{" "}
          <span className="font-semibold text-gray-700">Documentación validada</span>.
          El aspirante recibirá una notificación automática por correo.
        </p>
      </div>

      {/* Mensajes globales */}
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
        {/* Aspirante */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Aspirante <span className="text-red-600">*</span>
          </label>
          <select
            value={aspiranteId}
            onChange={(e) => { setAspiranteId(e.target.value); clearFieldError("aspiranteId"); setError(null); }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
          >
            <option value="">Selecciona un aspirante</option>
            {ASPIRANTES_VALIDADOS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre} — {a.documento}
              </option>
            ))}
          </select>
          {fieldErrors.aspiranteId && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.aspiranteId}</p>
          )}
        </div>

        {/* Evaluador */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Evaluador asignado <span className="text-red-600">*</span>
          </label>
          <select
            value={evaluador}
            onChange={(e) => { setEvaluador(e.target.value); clearFieldError("evaluador"); setError(null); }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
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
              Fecha <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => { setFecha(e.target.value); clearFieldError("fecha"); setError(null); }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
            />
            {fieldErrors.fecha && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.fecha}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Hora <span className="text-red-600">*</span>
            </label>
            <input
              type="time"
              value={hora}
              onChange={(e) => { setHora(e.target.value); clearFieldError("hora"); setError(null); }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
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
                  "flex-1 flex items-center gap-2.5 rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                  modalidad === m
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="modalidad"
                  value={m}
                  checked={modalidad === m}
                  onChange={() => { setModalidad(m); clearFieldError("modalidad"); setError(null); }}
                  className="accent-red-700"
                />
                <span className="text-sm font-medium text-gray-700">{m}</span>
              </label>
            ))}
          </div>
          {fieldErrors.modalidad && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.modalidad}</p>
          )}
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
            placeholder={
              modalidad === "Virtual"
                ? "Ej: https://meet.google.com/abc-defg"
                : "Ej: Sala 204 – Bloque A"
            }
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
          />
          {fieldErrors.lugarOEnlace && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.lugarOEnlace}</p>
          )}
        </div>

        {/* Programa */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Programa <span className="text-red-600">*</span>
          </label>
          <select
            value={programa}
            onChange={(e) => { setPrograma(e.target.value); clearFieldError("programa"); setError(null); }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
          >
            <option value="">Selecciona un programa</option>
            {PROGRAMAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          {fieldErrors.programa && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.programa}</p>
          )}
        </div>

        {/* Cohorte */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Cohorte <span className="text-red-600">*</span>
          </label>
          <select
            value={cohorte}
            onChange={(e) => { setCohorte(e.target.value); clearFieldError("cohorte"); setError(null); }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
          >
            <option value="">Selecciona una cohorte</option>
            {COHORTES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {fieldErrors.cohorte && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.cohorte}</p>
          )}
        </div>

        {/* Nota informativa */}
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
          Al guardar, el sistema verificará que la fecha esté dentro del calendario de la cohorte y
          enviará una notificación automática al aspirante con todos los datos de la entrevista.
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 flex-1 bg-red-700 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Spinner />}
            {loading ? "Agendando..." : "Agendar entrevista"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/comite/entrevista")}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}