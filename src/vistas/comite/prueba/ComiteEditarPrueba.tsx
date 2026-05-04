import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { pruebaService, type PruebaAdmision } from "../../../services/comiteService";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function ComiteEditarPrueba() {
  const navigate = useNavigate();
  const location = useLocation();

  // La prueba puede llegar por state (desde tabla) o cargarse por ID desde backend.
  // TODO (backend): si no llega por state, hacer GET /v1/pruebas/:id usando searchParams.get("id")
  const pruebaInicial =
    (location.state as { prueba?: PruebaAdmision })?.prueba ?? null;

  const [prueba, setPrueba] = useState<PruebaAdmision | null>(pruebaInicial);
  const [nombre, setNombre] = useState(pruebaInicial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(pruebaInicial?.descripcion ?? "");
  const [peso, setPeso] = useState<number | "">(pruebaInicial?.peso ?? "");
  const [fechaAplicacion, setFechaAplicacion] = useState(
    pruebaInicial?.fechaAplicacion ?? ""
  );
  const [hora, setHora] = useState(pruebaInicial?.hora ?? "");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!pruebaInicial) {
      // Si no llegó por state, redirigir a la lista
      navigate("/comite/prueba", { replace: true });
    }
  }, [pruebaInicial, navigate]);

  if (!prueba) return null;

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
    if (!fechaAplicacion) errs.fechaAplicacion = "La fecha de aplicación es obligatoria.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Bloquear edición si ya tiene puntajes — criterio de aceptación.
    if (prueba.tienePuntajes) {
      setError(
        "No se puede editar esta prueba porque ya existen aspirantes con calificaciones registradas para ella."
      );
      return;
    }

    const pesoNum = Number(peso);

    // Validar suma de pesos (excluyendo la prueba actual).
    // TODO (backend): el endpoint valida esto y retorna error 422 si excede 100%.
    const sumaRestante = pruebaService.getSumaPesos(
      prueba.programa,
      prueba.cohorte,
      prueba.id
    );
    if (sumaRestante + pesoNum > 100) {
      setError(
        `La suma quedaría en ${sumaRestante + pesoNum}%. Las demás pruebas de ${prueba.programa} — ${prueba.cohorte} suman ${sumaRestante}%; el peso máximo para esta prueba es ${100 - sumaRestante}%.`
      );
      return;
    }

    // Validar nombre duplicado (solo si cambió).
    if (
      nombre.trim().toLowerCase() !== prueba.nombre.toLowerCase() &&
      pruebaService.existeNombre(nombre.trim(), prueba.programa, prueba.cohorte, prueba.id)
    ) {
      setError(
        `Ya existe otra prueba con el nombre "${nombre.trim()}" en esta misma cohorte.`
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // TODO (backend): reemplazar por:
      // await apiFetch(`/v1/pruebas/${prueba.id}`, { method: "PUT", body: JSON.stringify({...}) })
      // Si el peso cambió y existen valoraciones, el backend debe recalcular los puntajes integrales
      // afectados y registrar el evento en auditoría.
      const updated = await pruebaService.update(prueba.id, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        peso: pesoNum,
        fechaAplicacion,
        hora: hora.trim() || undefined,
      });
      setPrueba(updated);
      const nuevaSuma = sumaRestante + pesoNum;
      setSuccess(
        `Prueba actualizada correctamente. Suma total para ${prueba.programa} — ${prueba.cohorte}: ${nuevaSuma}%${
          nuevaSuma === 100 ? " ✓" : ` (faltan ${100 - nuevaSuma}%)`
        }.`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar la prueba.");
    } finally {
      setLoading(false);
    }
  };

  // Suma en tiempo real (excluyendo la prueba actual)
  const sumaRestante = pruebaService.getSumaPesos(prueba.programa, prueba.cohorte, prueba.id);

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Editar prueba de admisión</h1>
        <p className="mt-1 text-sm text-gray-500">
          Programa:{" "}
          <span className="font-semibold text-gray-700">{prueba.programa}</span> —
          Cohorte:{" "}
          <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-1.5 py-0.5 rounded ml-1">
            {prueba.cohorte}
          </span>
        </p>
      </div>

      {/* Aviso si ya tiene puntajes */}
      {prueba.tienePuntajes && (
        <div className="animate-fade-in mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Aviso:</strong> Esta prueba ya tiene aspirantes calificados. La edición está bloqueada para preservar la integridad de los puntajes.
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
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              clearFieldError("nombre");
              setError(null);
            }}
            disabled={prueba.tienePuntajes || loading}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
            rows={3}
            disabled={prueba.tienePuntajes || loading}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition resize-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {fieldErrors.descripcion && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.descripcion}</p>
          )}
        </div>

        {/* Peso */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Peso (%) <span className="text-red-600">*</span>
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
              disabled={prueba.tienePuntajes || loading}
              className="w-28 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {peso !== "" && (
              <span
                className={`text-xs font-semibold ${
                  sumaRestante + Number(peso) > 100
                    ? "text-red-600"
                    : "text-emerald-700"
                }`}
              >
                Total: {sumaRestante + Number(peso)}% / 100%
              </span>
            )}
          </div>
          {fieldErrors.peso && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.peso}</p>
          )}
        </div>

        {/* Fecha y hora */}
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
              disabled={prueba.tienePuntajes || loading}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
              disabled={prueba.tienePuntajes || loading}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Campos informativos (solo lectura) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Programa</label>
            <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2.5 truncate">
              {prueba.programa}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Cohorte</label>
            <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2.5">
              {prueba.cohorte}
            </p>
          </div>
        </div>

        {/* Estado (solo lectura) */}
        <div>
          <label className="block text-sm font-semibold text-gray-500 mb-1">Estado</label>
          <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2.5">
            {prueba.estado}
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || prueba.tienePuntajes}
            className="flex items-center justify-center gap-2 flex-1 bg-red-700 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Spinner />}
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/comite/prueba")}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}