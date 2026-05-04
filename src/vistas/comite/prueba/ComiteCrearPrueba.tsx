import { useState } from "react";
import { useNavigate } from "react-router";
import { pruebaService } from "../../../services/comiteService";

// ── Mock data — reemplazar con fetch al backend ───────────────────────────────
// TODO (backend): GET /v1/programas y GET /v1/cohortes

const PROGRAMAS = [
  "Maestría en Ingeniería de Software",
  "Especialización en Redes",
  "Maestría en Ciencias Computacionales",
];

const COHORTES = ["2025-1", "2025-2", "2026-1"];

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function ComiteCrearPrueba() {
  const navigate = useNavigate();

  // ── Estado del formulario ──────────────────────────────────────────────────
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [peso, setPeso] = useState<number | "">("");
  const [programa, setPrograma] = useState("");
  const [cohorte, setCohorte] = useState("");
  const [fechaAplicacion, setFechaAplicacion] = useState("");
  const [hora, setHora] = useState("");

  // ── Estado UI ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) =>
    setFieldErrors((p) => ({ ...p, [field]: "" }));

  // ── Validación ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!descripcion.trim()) errs.descripcion = "La descripción es obligatoria.";
    if (peso === "" || isNaN(Number(peso))) errs.peso = "El peso es obligatorio.";
    else if (Number(peso) <= 0 || Number(peso) > 100)
      errs.peso = "El peso debe estar entre 1 y 100.";
    if (!programa) errs.programa = "Selecciona un programa.";
    if (!cohorte) errs.cohorte = "Selecciona una cohorte.";
    if (!fechaAplicacion) errs.fechaAplicacion = "La fecha de aplicación es obligatoria.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const pesoNum = Number(peso);

    // Validar suma de pesos — la nueva prueba actúa como criterio de evaluación.
    // TODO (backend): el endpoint debe retornar error 422 si la suma excede 100%.
    const sumaActual = pruebaService.getSumaPesos(programa, cohorte);
    if (sumaActual + pesoNum > 100) {
      setError(
        `La suma de los pesos de ${programa} — ${cohorte} llegaría a ${sumaActual + pesoNum}%. Debe ser exactamente 100%. Actualmente hay ${sumaActual}% asignado; esta prueba puede tener máximo ${100 - sumaActual}%.`
      );
      return;
    }

    // Validar nombre duplicado en mismo programa/cohorte.
    // TODO (backend): el endpoint también valida esto y retorna error 409.
    if (pruebaService.existeNombre(nombre.trim(), programa, cohorte)) {
      setError(
        `Ya existe una prueba con el nombre "${nombre.trim()}" en ${programa} — ${cohorte}.`
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // TODO (backend): reemplazar por:
      // await apiFetch("/v1/pruebas", { method: "POST", body: JSON.stringify({...}) })
      await pruebaService.create({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        peso: pesoNum,
        programa,
        cohorte,
        fechaAplicacion,
        hora: hora.trim() || undefined,
        estado: "Borrador",
      });

      const nuevaSuma = sumaActual + pesoNum;
      setSuccess(
        `Prueba "${nombre.trim()}" creada correctamente. Suma de pesos para ${programa} — ${cohorte}: ${nuevaSuma}%${
          nuevaSuma === 100 ? " ✓ (completo)" : ` (faltan ${100 - nuevaSuma}%)`
        }.`
      );
      // Limpiar formulario
      setNombre("");
      setDescripcion("");
      setPeso("");
      setPrograma("");
      setCohorte("");
      setFechaAplicacion("");
      setHora("");
      setFieldErrors({});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear la prueba.");
    } finally {
      setLoading(false);
    }
  };

  // Suma en tiempo real para indicar disponible
  const sumaActual =
    programa && cohorte ? pruebaService.getSumaPesos(programa, cohorte) : null;

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Crear prueba de admisión</h1>
        <p className="mt-1 text-sm text-gray-500">
          La prueba se incorpora como criterio de evaluación; la suma de todos los
          pesos del programa y cohorte debe ser exactamente{" "}
          <strong>100%</strong>.
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
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre de la prueba <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              clearFieldError("nombre");
              setError(null);
            }}
            placeholder="Ej: Prueba de fundamentos de software"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
          />
          {fieldErrors.nombre && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.nombre}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Descripción <span className="text-red-600">*</span>
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => {
              setDescripcion(e.target.value);
              clearFieldError("descripcion");
              setError(null);
            }}
            placeholder="Describe en qué consiste esta prueba de admisión..."
            rows={3}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition resize-none"
          />
          {fieldErrors.descripcion && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.descripcion}</p>
          )}
        </div>

        {/* Peso */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Peso porcentual (%) <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={100}
              value={peso}
              onChange={(e) => {
                setPeso(e.target.value === "" ? "" : Number(e.target.value));
                clearFieldError("peso");
                setError(null);
              }}
              placeholder="0"
              className="w-28 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
            />
            {sumaActual !== null && peso !== "" && (
              <span
                className={`text-xs font-semibold ${
                  sumaActual + Number(peso) > 100
                    ? "text-red-600"
                    : "text-emerald-700"
                }`}
              >
                Total: {sumaActual + Number(peso)}% / 100%
              </span>
            )}
          </div>
          {fieldErrors.peso && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.peso}</p>
          )}
          {sumaActual !== null && (
            <p className="mt-1 text-xs text-gray-400">
              Asignado actualmente: {sumaActual}% → disponible:{" "}
              {100 - sumaActual}%
            </p>
          )}
        </div>

        {/* Programa */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Programa <span className="text-red-600">*</span>
          </label>
          <select
            value={programa}
            onChange={(e) => {
              setPrograma(e.target.value);
              clearFieldError("programa");
              setError(null);
            }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
          >
            <option value="">Selecciona un programa</option>
            {PROGRAMAS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
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
            onChange={(e) => {
              setCohorte(e.target.value);
              clearFieldError("cohorte");
              setError(null);
            }}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
          >
            <option value="">Selecciona una cohorte</option>
            {COHORTES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {fieldErrors.cohorte && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.cohorte}</p>
          )}
        </div>

        {/* Fecha y hora de aplicación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fecha de aplicación <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={fechaAplicacion}
              onChange={(e) => {
                setFechaAplicacion(e.target.value);
                clearFieldError("fechaAplicacion");
                setError(null);
              }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
            />
            {fieldErrors.fechaAplicacion && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.fechaAplicacion}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Hora de aplicación{" "}
              <span className="text-gray-400 font-normal text-xs">(opcional)</span>
            </label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 flex-1 bg-red-700 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Spinner />}
            {loading ? "Guardando..." : "Guardar prueba"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/comite/prueba")}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}