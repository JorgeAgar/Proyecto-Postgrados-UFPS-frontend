/**
 * ModalEliminar — Modal de confirmación de eliminación reutilizable.
 *
 * Uso para CRITERIOS:
 *   <ModalEliminar
 *     titulo="Confirmar eliminación"
 *     onConfirm={handleEliminar}
 *     onCancel={() => setModalAbierto(false)}
 *     loading={loading}
 *   >
 *     <p><strong>{criterio.nombre}</strong></p>
 *     <p>{criterio.programa}</p>
 *   </ModalEliminar>
 *
 * Uso para ENTREVISTAS:
 *   <ModalEliminar
 *     titulo="Confirmar eliminación"
 *     onConfirm={handleEliminar}
 *     onCancel={() => setModalAbierto(false)}
 *     loading={loading}
 *   >
 *     <p><strong>{entrevista.aspiranteNombre}</strong></p>
 *     <p>{entrevista.evaluadorNombre}</p>
 *     <p>{entrevista.programa}</p>
 *   </ModalEliminar>
 *
 * TODO (backend): en onConfirm, conectar con el endpoint de eliminación correspondiente.
 */

import { useEffect } from "react";

function SpinnerBtn() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

interface ModalEliminarProps {
  /** Título que aparece en la parte superior del modal */
  titulo?: string;
  /** Contenido central del modal: datos del elemento a eliminar */
  children: React.ReactNode;
  /** Callback al confirmar. TODO: conectar al endpoint de eliminación en el backend. */
  onConfirm: () => void;
  /** Callback al cancelar o cerrar el modal */
  onCancel: () => void;
  /** Muestra spinner y deshabilita botones mientras se procesa */
  loading?: boolean;
}

export default function ModalEliminar({
  titulo = "Confirmar eliminación",
  children,
  onConfirm,
  onCancel,
  loading = false,
}: ModalEliminarProps) {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [loading, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo difuminado */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-overlay-in"
        onClick={!loading ? onCancel : undefined}
        aria-hidden="true"
      />

      {/* Modal centrado */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-modal-in">
        {/* Ícono + Título */}
        <div className="flex items-start gap-4 mb-4">
          <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-red-600"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 pt-1">{titulo}</h2>
        </div>

        {/* Datos del elemento a eliminar */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 space-y-1 mb-6">
          {children}
        </div>

        {/* Botones: Confirmar (izquierda) | Cancelar (derecha) */}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center justify-center gap-2 flex-1 bg-red-700 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <SpinnerBtn />}
            {loading ? "Eliminando..." : "Confirmar"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
