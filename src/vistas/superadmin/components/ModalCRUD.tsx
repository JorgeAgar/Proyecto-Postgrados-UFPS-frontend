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
  POST:   "bg-green-100 text-green-800 border-green-200",
  PUT:    "bg-amber-100 text-amber-800 border-amber-200",
  DELETE: "bg-red-100 text-red-800 border-red-200",
  PATCH:  "bg-purple-100 text-purple-800 border-purple-200",
};

const LABEL: Record<string, string> = {
  GET:    "GET (general)",
  GET_ID: "GET (individual)",
  POST:   "POST",
  PUT:    "PUT",
  DELETE: "DELETE",
  PATCH:  "PATCH",
};

// Duración en ms — debe coincidir exactamente con las clases CSS del proyecto
const ANIM_DURATION = 220;

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

export default function ModalCRUD({ entidad, metodo, baseUrl, schemaEjemplo, onClose, onResult }: ModalCRUDProps) {
  // Textarea siempre inicia vacío — el schema se muestra en el panel izquierdo
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  // Incrementa con cada nuevo mensaje: fuerza a React a montar siempre un nodo nuevo
  // para que animate-fade-in corra en CADA feedback, no solo el primero
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Cierre con animación de salida simétrica a la entrada
  const triggerClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimer.current = setTimeout(() => onClose(), ANIM_DURATION);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") triggerClose(); };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) triggerClose();
  };

  const showFeedback = (type: "success" | "error", msg: string) => {
    setFeedbackKey((k) => k + 1); // nuevo nodo → nueva animación
    setFeedback({ type, msg });
  };

  const handleEjecutar = async () => {
    setFeedback(null);

    // Validar que el textarea no esté vacío
    if (!jsonInput.trim()) {
      showFeedback("error", "El campo JSON no puede estar vacío.");
      return;
    }

    // Parsear JSON
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      showFeedback("error", "El JSON ingresado no es válido. Verifique la sintaxis.");
      return;
    }

    // Construir URL — si el JSON incluye "id" y el método lo requiere, se agrega a la ruta
    let url = baseUrl;
    const httpMethod = metodo === "GET_ID" ? "GET" : metodo;
    if (
      ["GET_ID", "PUT", "DELETE", "PATCH"].includes(metodo) &&
      parsed !== null &&
      typeof parsed === "object" &&
      "id" in (parsed as object)
    ) {
      const id = (parsed as Record<string, unknown>).id;
      if (id !== undefined && id !== 0 && id !== "") {
        url = `${baseUrl}/${id}`;
      }
    }

    setLoading(true);
    try {
      const opts: RequestInit = {
        method: httpMethod,
        headers: { "Content-Type": "application/json" },
      };
      if (httpMethod !== "GET" && parsed !== null) {
        opts.body = JSON.stringify(parsed);
      }

      const res = await fetch(url, opts);
      const contentType = res.headers.get("content-type") || "";
      let data: unknown = null;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        showFeedback("error", `Error ${res.status}: ${res.statusText}`);
        return;
      }

      showFeedback("success", "Operación ejecutada exitosamente.");
      setJsonInput("");

      if (metodo === "GET" || metodo === "GET_ID") {
        onResult(data);
      }
    } catch (err) {
      showFeedback("error", `No se pudo conectar con el servidor. ${err instanceof Error ? err.message : ""}`);
    } finally {
      setLoading(false);
    }
  };

  const colorClass = METHOD_COLORS[metodo === "GET_ID" ? "GET" : metodo] ?? "bg-gray-100 text-gray-800 border-gray-200";

  return (
    /*
     * OVERLAY
     * animate-overlay-in / animate-overlay-out: misma duración (ANIM_DURATION)
     * pointerEvents desactivados durante la salida para evitar clicks accidentales
     */
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={isClosing ? "animate-overlay-out" : "animate-overlay-in"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        pointerEvents: isClosing ? "none" : "auto",
      }}
    >
      {/*
       * CONTENEDOR DEL MODAL
       * height fijo → el tamaño NUNCA cambia por contenido (feedback, spinner, etc.)
       * El body tiene overflow-y-auto + min-h-0 para que el feedback aparezca
       * con scroll interno sin afectar las dimensiones del modal.
       */}
      <div
        className={isClosing ? "animate-modal-out" : "animate-modal-in"}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          width: "100%",
          maxWidth: 768,
          height: "min(90vh, 580px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── HEADER — flexShrink 0: nunca se comprime ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="text-lg font-bold text-slate-900 capitalize">{entidad}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${colorClass}`}>
              {LABEL[metodo] ?? metodo}
            </span>
          </div>

          {/*
           * Botón cerrar: width/height fijos en style para que hover:bg
           * no desplace el layout ni un subpíxel.
           */}
          <button
            onClick={triggerClose}
            title="Cerrar"
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors rounded-lg"
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── BODY — flex-1 + overflow-y-auto + min-h-0 ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,        /* clave en flexbox para que el scroll interno funcione */
            overflowY: "auto",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Dos columnas: ejemplo (izq.) | editable (der.) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ flex: 1, minHeight: 0 }}>

            {/* Izquierda: schema de ejemplo — solo lectura */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Ejemplo de estructura
              </span>
              <pre
                className="font-mono text-xs text-slate-700 leading-relaxed"
                style={{
                  flex: 1,
                  minHeight: 200,
                  maxHeight: 300,
                  overflowY: "auto",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  padding: 16,
                  margin: 0,
                }}
              >
                {JSON.stringify(schemaEjemplo, null, 2)}
              </pre>
            </div>

            {/* Derecha: editable, siempre vacío al abrir */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Ingrese el JSON para la operación
              </span>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={'{\n  "campo": "valor"\n}'}
                className="font-mono text-xs text-slate-800"
                style={{
                  flex: 1,
                  minHeight: 200,
                  maxHeight: 300,
                  resize: "none",
                  borderRadius: 12,
                  padding: 16,
                  background: "#fff",
                  /*
                   * border SIEMPRE 1px — nunca cambia de grosor.
                   * El efecto focus usa box-shadow inset: no ocupa espacio externo,
                   * por tanto el modal NO crece ni se mueve al hacer click/focus.
                   */
                  border: "1px solid #e2e8f0",
                  outline: "none",
                  boxShadow: "none",
                  transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "inset 0 0 0 2px #94a3b8";
                  e.currentTarget.style.borderColor = "#94a3b8";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                }}
              />
            </div>
          </div>

          {/*
           * FEEDBACK — vive dentro del área con scroll.
           * Cuando aparece, el body hace scroll interno sin modificar
           * el alto total del modal.
           */}
          {feedback && (
            <div
              key={feedbackKey}
              className={`animate-fade-in rounded-lg text-sm border ${
                feedback.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
              style={{ flexShrink: 0, padding: "12px 16px" }}
            >
              {feedback.msg}
            </div>
          )}
        </div>

        {/* ── FOOTER — flexShrink 0: nunca se comprime ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          {/*
           * Botón Ejecutar: width/height fijos en style.
           * El spinner aparece/desaparece sin cambiar las dimensiones del botón.
           */}
          <button
            onClick={handleEjecutar}
            disabled={loading}
            className="bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              width: 200,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            {loading && <Spinner />}
            {loading ? "Ejecutando..." : "Ejecutar operación"}
          </button>
        </div>
      </div>
    </div>
  );
}