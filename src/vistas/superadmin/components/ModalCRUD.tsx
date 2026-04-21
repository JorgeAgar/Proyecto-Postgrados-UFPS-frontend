import { useState, useEffect, useRef } from "react";

interface ModalCRUDProps {
  entidad: string;
  metodo: string;
  baseUrl: string;
  schemaEjemplo: object;
  onClose: () => void;
  onResult: (data: unknown) => void;
}

const METHOD_COLORS: Record<string, string> = {
  GET:    "bg-blue-100 text-blue-800 border-blue-200",
  GET_ID: "bg-blue-100 text-blue-700 border-blue-200",
  POST:   "bg-green-100 text-green-800 border-green-200",
  PUT:    "bg-amber-100 text-amber-800 border-amber-200",
  DELETE: "bg-red-100 text-red-800 border-red-200",
  PATCH:  "bg-purple-100 text-purple-800 border-purple-200",
};

const METHOD_LABEL: Record<string, string> = {
  GET:    "GET (general)",
  GET_ID: "GET (por ID)",
  POST:   "POST",
  PUT:    "PUT",
  DELETE: "DELETE",
  PATCH:  "PATCH",
};

// El método HTTP real que se enviará al backend
const HTTP_METHOD: Record<string, string> = {
  GET:    "GET",
  GET_ID: "GET",
  POST:   "POST",
  PUT:    "PUT",
  DELETE: "DELETE",
  PATCH:  "PATCH",
};

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

interface ModalWrapperProps {
  onOverlayClick: () => void;
  children: React.ReactNode;
}

/**
 * Wrapper con animación de entrada/salida.
 * Usa una clase CSS que se cambia en el proceso de cierre.
 */
function ModalWrapper({ onOverlayClick, children }: ModalWrapperProps) {
  return (
    <div
      className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onOverlayClick}
    >
      <div
        className="animate-modal-in bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default function ModalCRUD({
  entidad,
  metodo,
  baseUrl,
  schemaEjemplo,
  onClose,
  onResult,
}: ModalCRUDProps) {
  // El textarea editable siempre parte con el schema de ejemplo como referencia
  const [jsonInput, setJsonInput] = useState(JSON.stringify(schemaEjemplo, null, 2));
  const [loading, setLoading]     = useState(false);
  const [feedback, setFeedback]   = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Estado para animar el cierre
  const [isClosing, setIsClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") triggerClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimer.current = setTimeout(() => {
      onClose();
    }, 170); // duración de animate-modal-out
  };

  const handleEjecutar = async () => {
    setFeedback(null);

    // Validar que el textarea no esté vacío
    if (!jsonInput.trim()) {
      setFeedback({ type: "error", msg: "El campo JSON no puede estar vacío." });
      return;
    }

    // Validar JSON bien formado
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      setFeedback({ type: "error", msg: "El JSON ingresado no es válido. Verifique la sintaxis." });
      return;
    }

    const httpMethod = HTTP_METHOD[metodo] ?? metodo;

    // Construir URL: para operaciones que normalmente usan ID,
    // la persona lo incluye dentro del JSON como "id" o directamente en el textarea.
    // Si el JSON tiene un campo "id" y el método lo requiere, lo añadimos a la URL.
    let url = baseUrl;
    const parsedObj = parsed as Record<string, unknown>;
    if (
      ["GET_ID", "PUT", "DELETE", "PATCH"].includes(metodo) &&
      parsedObj?.id !== undefined &&
      parsedObj?.id !== 0 &&
      parsedObj?.id !== ""
    ) {
      url = `${baseUrl}/${parsedObj.id}`;
    }

    setLoading(true);
    try {
      const opts: RequestInit = {
        method: httpMethod,
        headers: { "Content-Type": "application/json" },
      };

      // GET no lleva body
      if (httpMethod !== "GET") {
        opts.body = JSON.stringify(parsed);
      }

      const res = await fetch(url, opts);
      const contentType = res.headers.get("content-type") ?? "";
      let data: unknown = null;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        setFeedback({ type: "error", msg: `Error ${res.status}: ${res.statusText}` });
        return;
      }

      setFeedback({ type: "success", msg: "Operación ejecutada exitosamente." });
      setJsonInput(JSON.stringify(schemaEjemplo, null, 2)); // resetear al schema base

      // Para GETs mostramos el resultado en el modal superior
      if (metodo === "GET" || metodo === "GET_ID") {
        onResult(data);
      }
    } catch (err) {
      setFeedback({
        type: "error",
        msg: `No se pudo conectar con el servidor. ${err instanceof Error ? err.message : ""}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const colorClass = METHOD_COLORS[metodo] ?? "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isClosing ? "animate-overlay-out" : "animate-overlay-in"}`}
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={triggerClose}
    >
      <div
        className={`${isClosing ? "animate-modal-out" : "animate-modal-in"} bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-slate-900 capitalize">{entidad}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colorClass}`}>
              {METHOD_LABEL[metodo] ?? metodo}
            </span>
          </div>
          <button
            onClick={triggerClose}
            className="text-slate-400 hover:text-slate-700 transition-colors rounded-lg p-1 hover:bg-slate-100"
            title="Cerrar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

          {/* Dos columnas siempre iguales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Izquierda: esquema de ejemplo — NO editable */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Ejemplo de estructura
              </span>
              <pre className="flex-1 min-h-[220px] max-h-[300px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed font-mono">
                {JSON.stringify(schemaEjemplo, null, 2)}
              </pre>
            </div>

            {/* Derecha: siempre editable */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Ingrese el JSON para la operación
              </span>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={'{\n  "campo": "valor"\n}'}
                className="flex-1 min-h-[220px] max-h-[300px] resize-none rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`animate-fade-in rounded-lg px-4 py-3 text-sm border ${
                feedback.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {feedback.msg}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-center flex-shrink-0">
          <button
            onClick={handleEjecutar}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 text-white font-bold px-8 py-2.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Spinner />}
            {loading ? "Ejecutando..." : "Ejecutar operación"}
          </button>
        </div>
      </div>
    </div>
  );
}
