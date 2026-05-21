import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import {
  getEntrevistas,
  aceptarEntrevista,
  solicitarCambioEntrevista,
  cancelarEntrevista,
  type EntrevistaConfirmada,
  type EntrevistaPendiente,
} from "../../services/aspirante/aspiranteEntrevistaService";
import type { AspiranteOutletContext } from "../../layouts/AspiranteLayout";

// ── Íconos (Heroicons) ────────────────────────────────────────────────────────

function CalendarDaysIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className ?? "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className ?? "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className ?? "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className ?? "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ExclamationCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className ?? "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
  );
}

function XMarkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const MODAL_SIZE: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const [visible, setVisible] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const id = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 170);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!visible) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm ${closing ? "animate-overlay-out" : "animate-overlay-in"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`${closing ? "animate-modal-out" : "animate-modal-in"} bg-white rounded-lg shadow-xl w-full ${MODAL_SIZE[size]} p-6`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-gray-600 transition-colors rounded"
            >
              <XMarkIcon />
            </button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DELAYS = ["delay-100", "delay-200", "delay-300", "delay-400", "delay-500", "delay-600"] as const;

// ── Componente principal ──────────────────────────────────────────────────────

export default function AspiranteEntrevista() {
  const { mostrarAlerta } = useOutletContext<AspiranteOutletContext>();

  const [confirmadas, setConfirmadas] = useState<EntrevistaConfirmada[]>([]);
  const [pendientes, setPendientes] = useState<EntrevistaPendiente[]>([]);

  const [modalAceptar, setModalAceptar] = useState<string | null>(null);
  const [modalCambio, setModalCambio] = useState<string | null>(null);
  const [modalCancelar, setModalCancelar] = useState<string | null>(null);
  const [motivoCambio, setMotivoCambio] = useState("");
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  const cargarEntrevistas = async () => {
    try {
      const { confirmadas: conf, pendientes: pend } = await getEntrevistas();
      setConfirmadas(conf);
      setPendientes(pend);
    } catch (err) {
      mostrarAlerta(err instanceof Error ? err.message : "No se pudieron cargar las entrevistas.");
    }
  };

  useEffect(() => {
    cargarEntrevistas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAceptar = async () => {
    if (!modalAceptar) return;
    try {
      await aceptarEntrevista(modalAceptar);
      setModalAceptar(null);
      await cargarEntrevistas();
    } catch (err) {
      setModalAceptar(null);
      mostrarAlerta(err instanceof Error ? err.message : "No se pudo aceptar la entrevista.");
    }
  };

  const handleSolicitarCambio = async () => {
    if (!modalCambio || !motivoCambio.trim()) return;
    try {
      await solicitarCambioEntrevista(modalCambio, motivoCambio);
      setModalCambio(null);
      setMotivoCambio("");
      await cargarEntrevistas();
    } catch (err) {
      setModalCambio(null);
      setMotivoCambio("");
      mostrarAlerta(err instanceof Error ? err.message : "No se pudo enviar la solicitud de cambio.");
    }
  };

  const handleCancelar = async () => {
    if (!modalCancelar || !motivoCancelacion.trim()) return;
    try {
      await cancelarEntrevista(modalCancelar, motivoCancelacion);
      setModalCancelar(null);
      setMotivoCancelacion("");
      await cargarEntrevistas();
    } catch (err) {
      setModalCancelar(null);
      setMotivoCancelacion("");
      mostrarAlerta(err instanceof Error ? err.message : "No se pudo cancelar la entrevista.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="max-w-4xl mx-auto">

        {/* Encabezado */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Entrevistas</h1>
          <p className="text-sm text-neutral-400">
            Gestiona tus solicitudes y entrevistas programadas
          </p>
        </div>

        {/* Entrevistas confirmadas */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 animate-fade-in-up delay-100">
            Entrevistas confirmadas
          </h2>

          {confirmadas.length > 0 ? (
            <div className="space-y-3">
              {confirmadas.map((entrevista, idx) => (
                <div
                  key={entrevista.id}
                  className={`bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors animate-fade-in-up ${DELAYS[idx + 1]}`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Confirmada
                    </span>
                    <span className="inline-block bg-neutral-200 text-neutral-600 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      {entrevista.modalidad}
                    </span>
                    <span className="ml-auto text-xs text-neutral-400">
                      {entrevista.tiempoRestante}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDaysIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="font-medium">{entrevista.fecha}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="font-medium">{entrevista.tiempo}</span>
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-gray-700">
                      <MapPinIcon className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <span>{entrevista.lugar}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setModalCancelar(entrevista.id)}
                      className="px-3 py-2 text-sm border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Cancelar entrevista
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center animate-fade-in-up delay-200">
              <p className="text-sm text-neutral-400">No tienes entrevistas confirmadas</p>
            </div>
          )}
        </div>

        {/* Otras entrevistas */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3 animate-fade-in-up delay-300">
            Otras entrevistas
          </h2>

          {pendientes.length > 0 ? (
            <div className="space-y-3">
              {pendientes.map((solicitud, idx) => (
                <div
                  key={solicitud.id}
                  className={`bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors animate-fade-in-up ${DELAYS[idx + 3]}`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {solicitud.estado === "cambio_solicitado" ? (
                      <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        <ExclamationCircleIcon className="w-3.5 h-3.5" />
                        Solicitud de cambio pendiente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-400 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        <ExclamationCircleIcon className="w-3.5 h-3.5" />
                        Pendiente de confirmación
                      </span>
                    )}
                    <span className="inline-block bg-neutral-200 text-neutral-600 border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      {solicitud.modalidad}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDaysIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="font-medium">{solicitud.fecha}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                        <span className="font-medium">{solicitud.tiempo}</span>
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-sm text-gray-700">
                      <MapPinIcon className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                      <span>{solicitud.lugar}</span>
                    </div>
                  </div>

                  {solicitud.estado === "pendiente" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModalAceptar(solicitud.id)}
                        className="px-3 py-2 text-sm bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium"
                      >
                        Aceptar
                      </button>
                      <button
                        onClick={() => setModalCambio(solicitud.id)}
                        className="px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-neutral-200 transition-colors"
                      >
                        Solicitar cambio
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center animate-fade-in-up delay-400">
              <p className="text-sm text-neutral-400">No tienes otras entrevistas pendientes</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Confirmar aceptar */}
      <Modal
        isOpen={modalAceptar !== null}
        onClose={() => setModalAceptar(null)}
        title="Confirmar entrevista"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-5">
          ¿Estás seguro de que deseas aceptar esta entrevista? Una vez confirmada, quedará registrada en tu calendario de actividades.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleAceptar}
            className="flex-1 bg-red-700 text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-red-800 transition-colors"
          >
            Sí, aceptar
          </button>
          <button
            onClick={() => setModalAceptar(null)}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </Modal>

      {/* Modal: Solicitar cambio */}
      <Modal
        isOpen={modalCambio !== null}
        onClose={() => { setModalCambio(null); setMotivoCambio(""); }}
        title="Solicitar cambio de fecha/hora"
        size="md"
      >
        <p className="text-sm text-gray-600 mb-4">
          Completa el formulario para solicitar un cambio en la fecha u hora de la entrevista.
        </p>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Motivo del cambio y disponibilidad <span className="text-red-500">*</span>
          </label>
          <textarea
            value={motivoCambio}
            onChange={(e) => setMotivoCambio(e.target.value)}
            rows={5}
            placeholder="Explica brevemente por qué solicitas el cambio e indica tus horarios disponibles para que los directivos puedan reasignarte una mejor fecha..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent resize-none transition-colors"
          />
          {!motivoCambio.trim() && (
            <p className="text-xs text-neutral-400 mt-1">El motivo es obligatorio para solicitar el cambio.</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSolicitarCambio}
            disabled={!motivoCambio.trim()}
            className="flex-1 bg-red-700 text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar solicitud
          </button>
          <button
            onClick={() => { setModalCambio(null); setMotivoCambio(""); }}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </Modal>

      {/* Modal: Cancelar entrevista */}
      <Modal
        isOpen={modalCancelar !== null}
        onClose={() => { setModalCancelar(null); setMotivoCancelacion(""); }}
        title="Cancelar entrevista"
        size="md"
      >
        <p className="text-sm text-gray-600 mb-4">
          Por favor, indica el motivo por el cual deseas cancelar la entrevista.
        </p>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Motivo de cancelación <span className="text-red-500">*</span>
          </label>
          <textarea
            value={motivoCancelacion}
            onChange={(e) => setMotivoCancelacion(e.target.value)}
            rows={4}
            placeholder="Explica brevemente por qué deseas cancelar la entrevista..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent resize-none transition-colors"
          />
          {!motivoCancelacion.trim() && (
            <p className="text-xs text-neutral-400 mt-1">El motivo es obligatorio para cancelar.</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCancelar}
            disabled={!motivoCancelacion.trim()}
            className="flex-1 bg-red-700 text-white text-sm font-semibold rounded-lg py-2.5 hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar cancelación
          </button>
          <button
            onClick={() => { setModalCancelar(null); setMotivoCancelacion(""); }}
            className="flex-1 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
        </div>
      </Modal>
    </div>
  );
}
