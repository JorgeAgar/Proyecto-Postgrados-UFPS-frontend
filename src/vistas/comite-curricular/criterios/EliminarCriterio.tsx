import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { criteriosService, type CriterioEvaluacion } from "../../../services/comiteCurricularService";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ModalConfirmacion({
  criterio,
  onConfirm,
  onCancel,
  loading,
}: {
  criterio: CriterioEvaluacion;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-overlay-in"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-modal-in">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-red-600" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">¿Eliminar criterio?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Estás a punto de eliminar <strong>"{criterio.nombre}"</strong> ({criterio.peso}%) del programa{" "}
              <em>{criterio.programa}</em> — cohorte <em>{criterio.cohorte}</em>.
            </p>
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Esta acción es irreversible. Asegúrate de redistribuir el {criterio.peso}% restante entre los demás criterios para que la suma total sea 100%.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center justify-center gap-2 flex-1 bg-red-700 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Spinner />}
            {loading ? "Eliminando..." : "Sí, eliminar"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EliminarCriterio() {
  const navigate = useNavigate();
  const location = useLocation();
  const criterioInicial = (location.state as { criterio?: CriterioEvaluacion })?.criterio ?? null;

  const [criterio] = useState<CriterioEvaluacion | null>(criterioInicial);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!criterioInicial) {
      navigate("/comite/criterios", { replace: true });
    }
  }, [criterioInicial, navigate]);

  if (!criterio) return null;

  const handleEliminar = async () => {
    // Bloquear si tiene puntajes
    if (criterio.tienePuntajes) {
      setError("No se puede eliminar este criterio porque ya existen aspirantes calificados con él.");
      setShowModal(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await criteriosService.delete(criterio.id);
      setShowModal(false);

      const sumaRestante = criteriosService.getSumaPesos(criterio.programa, criterio.cohorte);
      setSuccess(
        `Criterio "${criterio.nombre}" eliminado correctamente. Suma restante de ${criterio.programa} — ${criterio.cohorte}: ${sumaRestante}%${sumaRestante === 100 ? " ✓" : ` (faltan ${100 - sumaRestante}% — recuerda redistribuir los pesos)`}.`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar el criterio.");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Eliminar criterio de evaluación</h1>
        <p className="mt-1 text-sm text-gray-500">
          Revisa la información antes de confirmar la eliminación.
        </p>
      </div>

      {criterio.tienePuntajes && (
        <div className="animate-fade-in mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Eliminación bloqueada:</strong> Este criterio ya tiene aspirantes calificados. No puede eliminarse para preservar la integridad del proceso.
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

      {/* Tarjeta de resumen del criterio */}
      <div className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <dl className="space-y-4">
          {[
            { label: "Nombre", value: criterio.nombre },
            { label: "Descripción", value: criterio.descripcion },
            { label: "Peso (%)", value: `${criterio.peso}%` },
            { label: "Programa", value: criterio.programa },
            { label: "Cohorte", value: criterio.cohorte },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
              <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider sm:w-28 shrink-0">{label}</dt>
              <dd className="text-sm text-gray-800 font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            disabled={criterio.tienePuntajes || loading || !!success}
            className="flex-1 bg-red-700 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Eliminar criterio
          </button>
          <button
            onClick={() => navigate("/comite/criterios")}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <ModalConfirmacion
          criterio={criterio}
          onConfirm={handleEliminar}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
}
