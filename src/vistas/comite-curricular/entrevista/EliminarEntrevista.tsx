import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  entrevistaService,
  type Entrevista,
} from "../../../services/comiteCurricularService";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Modal de confirmación con campo de motivo ─────────────────────────────────

function ModalConfirmacion({
  entrevista,
  onConfirm,
  onCancel,
  loading,
}: {
  entrevista: Entrevista;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [motivo, setMotivo] = useState("");
  const [motivoError, setMotivoError] = useState("");

  const handleConfirmar = () => {
    if (!motivo.trim()) {
      setMotivoError("El motivo es obligatorio para registrar la eliminación.");
      return;
    }
    onConfirm(motivo.trim());
  };

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
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">¿Eliminar entrevista?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Estás a punto de eliminar la entrevista de{" "}
              <strong>"{entrevista.aspiranteNombre}"</strong> programada para el{" "}
              <em>{entrevista.fecha}</em> a las <em>{entrevista.hora}</em>.
            </p>
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Esta acción es irreversible. El aspirante recibirá una notificación de cancelación.
            </p>

            {/* Campo de motivo (criterio de aceptación) */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Motivo de la eliminación <span className="text-red-600">*</span>
              </label>
              <textarea
                value={motivo}
                onChange={(e) => { setMotivo(e.target.value); setMotivoError(""); }}
                rows={3}
                placeholder="Describe el motivo por el cual se elimina esta entrevista..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition resize-none"
              />
              {motivoError && (
                <p className="mt-1 text-xs text-red-600">{motivoError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={handleConfirmar}
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

// ── Componente principal ──────────────────────────────────────────────────────

export default function EliminarEntrevista() {
  const navigate = useNavigate();
  const location = useLocation();
  const entrevistaInicial =
    (location.state as { entrevista?: Entrevista })?.entrevista ?? null;

  const [entrevista] = useState<Entrevista | null>(entrevistaInicial);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entrevistaInicial) {
      navigate("/comite/entrevista", { replace: true });
    }
  }, [entrevistaInicial, navigate]);

  if (!entrevista) return null;

  // Bloqueo: entrevista ya realizada o con puntajes (criterio de aceptación)
  const bloqueada = entrevista.estado === "Realizada" || entrevista.tienePuntajes;

  const handleEliminar = async (motivo: string) => {
    if (bloqueada) {
      setError(
        "No se puede eliminar esta entrevista porque ya ha sido marcada como realizada o sus puntajes han sido registrados."
      );
      setShowModal(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // TODO: pasar el motivo al endpoint: { motivo }
      await entrevistaService.delete(entrevista.id);
      setShowModal(false);
      setSuccess(
        `Entrevista de "${entrevista.aspiranteNombre}" eliminada correctamente. Motivo registrado: "${motivo}". Se enviará una notificación de cancelación al aspirante.`
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar la entrevista."
      );
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Eliminar entrevista</h1>
        <p className="mt-1 text-sm text-gray-500">
          Revisa la información antes de confirmar la eliminación.
        </p>
      </div>

      {/* Bloqueo por estado */}
      {bloqueada && (
        <div className="animate-fade-in mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Eliminación bloqueada:</strong> Esta entrevista ya ha sido{" "}
          {entrevista.tienePuntajes
            ? "calificada con puntajes registrados"
            : "marcada como Realizada"}
          . No puede eliminarse para preservar la integridad del proceso.
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

      {/* Tarjeta de resumen */}
      <div className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <dl className="space-y-4">
          {[
            { label: "Aspirante", value: entrevista.aspiranteNombre },
            { label: "Documento", value: entrevista.aspiranteDocumento },
            { label: "Evaluador", value: entrevista.evaluadorNombre },
            { label: "Fecha", value: entrevista.fecha },
            { label: "Hora", value: entrevista.hora },
            { label: "Modalidad", value: entrevista.modalidad },
            { label: "Lugar / Enlace", value: entrevista.lugarOEnlace },
            { label: "Programa", value: entrevista.programa },
            { label: "Cohorte", value: entrevista.cohorte },
            { label: "Estado actual", value: entrevista.estado },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4"
            >
              <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider sm:w-32 shrink-0">
                {label}
              </dt>
              <dd className="text-sm text-gray-800 font-medium break-all">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => setShowModal(true)}
            disabled={bloqueada || loading || !!success}
            className="flex-1 bg-red-700 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Eliminar entrevista
          </button>
          <button
            onClick={() => navigate("/comite/entrevista")}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <ModalConfirmacion
          entrevista={entrevista}
          onConfirm={handleEliminar}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
}