import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { criteriosService, type CriterioEvaluacion } from "../../../services/comiteService";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function EditarCriterio() {
  const navigate = useNavigate();
  const location = useLocation();

  // El criterio puede llegar por state (desde tabla) o podría cargarse por ID desde backend
  const criterioInicial = (location.state as { criterio?: CriterioEvaluacion })?.criterio ?? null;

  const [criterio, setCriterio] = useState<CriterioEvaluacion | null>(criterioInicial);
  const [nombre, setNombre] = useState(criterioInicial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(criterioInicial?.descripcion ?? "");
  const [peso, setPeso] = useState<number | "">(criterioInicial?.peso ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!criterioInicial) {
      // Si no llegó por state, redirigir a la lista
      navigate("/comite/criterios", { replace: true });
    }
  }, [criterioInicial, navigate]);

  if (!criterio) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nombre.trim()) errs.nombre = "El nombre es obligatorio.";
    if (!descripcion.trim()) errs.descripcion = "La descripción es obligatoria.";
    if (peso === "" || isNaN(Number(peso))) errs.peso = "El peso es obligatorio.";
    else if (Number(peso) <= 0 || Number(peso) > 100) errs.peso = "El peso debe ser entre 1 y 100.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Bloquear edición si ya tiene puntajes
    if (criterio.tienePuntajes) {
      setError("No se puede editar este criterio porque ya existen aspirantes calificados con él.");
      return;
    }

    const pesoNum = Number(peso);

    // Validar suma de pesos (excluyendo el criterio actual)
    const sumaRestante = criteriosService.getSumaPesos(criterio.programa, criterio.cohorte, criterio.id);
    if (sumaRestante + pesoNum > 100) {
      setError(
        `La suma quedaría en ${sumaRestante + pesoNum}%. Los demás criterios de ${criterio.programa} — ${criterio.cohorte} suman ${sumaRestante}%; el peso máximo para este criterio es ${100 - sumaRestante}%.`
      );
      return;
    }

    // Validar nombre duplicado
    if (
      nombre.trim().toLowerCase() !== criterio.nombre.toLowerCase() &&
      criteriosService.existeNombre(nombre.trim(), criterio.programa, criterio.cohorte, criterio.id)
    ) {
      setError(`Ya existe otro criterio con el nombre "${nombre.trim()}" en esta misma cohorte.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await criteriosService.update(criterio.id, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        peso: pesoNum,
      });
      setCriterio(updated);
      const nuevaSuma = sumaRestante + pesoNum;
      setSuccess(
        `Criterio actualizado. Suma total para ${criterio.programa} — ${criterio.cohorte}: ${nuevaSuma}%${nuevaSuma === 100 ? " ✓" : ` (faltan ${100 - nuevaSuma}%)`}.`
      );
      // Hook de backend: si el peso cambió y existen puntajes, el backend debe recalcularlos.
      // TODO: llamar a endpoint de recalculo cuando esté disponible.
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Editar criterio de evaluación</h1>
        <p className="mt-1 text-sm text-gray-500">
          Programa: <span className="font-semibold text-gray-700">{criterio.programa}</span> —
          Cohorte: <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-1.5 py-0.5 rounded ml-1">{criterio.cohorte}</span>
        </p>
      </div>

      {criterio.tienePuntajes && (
        <div className="animate-fade-in mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Aviso:</strong> Este criterio ya tiene aspirantes calificados. La edición está bloqueada para preservar la integridad de los puntajes.
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

      <form onSubmit={handleSubmit} noValidate className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nombre <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => { setNombre(e.target.value); setFieldErrors(p => ({ ...p, nombre: "" })); setError(null); }}
            disabled={criterio.tienePuntajes || loading}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {fieldErrors.nombre && <p className="mt-1 text-xs text-red-600">{fieldErrors.nombre}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Descripción <span className="text-red-600">*</span>
          </label>
          <textarea
            value={descripcion}
            onChange={e => { setDescripcion(e.target.value); setFieldErrors(p => ({ ...p, descripcion: "" })); setError(null); }}
            rows={3}
            disabled={criterio.tienePuntajes || loading}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition resize-none disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {fieldErrors.descripcion && <p className="mt-1 text-xs text-red-600">{fieldErrors.descripcion}</p>}
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
              onChange={e => { setPeso(e.target.value === "" ? "" : Number(e.target.value)); setFieldErrors(p => ({ ...p, peso: "" })); setError(null); }}
              disabled={criterio.tienePuntajes || loading}
              className="w-28 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {peso !== "" && (
              <span className={`text-xs font-semibold ${criteriosService.getSumaPesos(criterio.programa, criterio.cohorte, criterio.id) + Number(peso) > 100 ? "text-red-600" : "text-emerald-700"}`}>
                Total: {criteriosService.getSumaPesos(criterio.programa, criterio.cohorte, criterio.id) + Number(peso)}% / 100%
              </span>
            )}
          </div>
          {fieldErrors.peso && <p className="mt-1 text-xs text-red-600">{fieldErrors.peso}</p>}
        </div>

        {/* Campos informativos (solo lectura) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Programa</label>
            <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2.5 truncate">{criterio.programa}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Cohorte</label>
            <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2.5">{criterio.cohorte}</p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || criterio.tienePuntajes}
            className="flex items-center justify-center gap-2 flex-1 bg-red-700 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Spinner />}
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/comite/criterios")}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}
