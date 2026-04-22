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
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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
    setFeedbackKey((k) => k + 1);
    setFeedback({ type, msg });
  };

  const handleEjecutar = async () => {
    setFeedback(null);

    if (!jsonInput.trim()) {
      showFeedback("error", "El campo JSON no puede estar vacío.");
      return;
    }

    let parsed: unknown = null;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      showFeedback("error", "El JSON ingresado no es válido. Verifique la sintaxis.");
      return;
    }

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
       * ─────────────────────────────────────────────────────────────────────
       * FIX RAÍZ:
       *   boxSizing: "border-box"  → borde y padding internos no suman al
       *                              tamaño declarado del contenedor.
       *   overflow: "hidden"       → cualquier outline/shadow desbordante de
       *                              un hijo queda recortado y no empuja el
       *                              tamaño del modal.
       * ─────────────────────────────────────────────────────────────────────
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
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* ── HEADER ── */}
        <div style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid #e2e8f0",
          gap: 8,
          boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <span className="text-base font-bold text-slate-900 capitalize truncate">{entidad}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${colorClass}`}>
              {LABEL[metodo] ?? metodo}
            </span>
          </div>

          {/*
           * BOTÓN CERRAR — FIX:
           * • border: "1px solid transparent" siempre presente (no aparece
           *   ni desaparece) → el box model es INMUTABLE en hover/focus.
           * • outline: "none" elimina el outline nativo del browser (2px que
           *   sumaban al layout en algunos navegadores al hacer click/focus).
           * • El feedback visual de hover/focus usa background-color y
           *   box-shadow INSET respectivamente (ninguno afecta el box model).
           */}
          <button
            onClick={triggerClose}
            title="Cerrar"
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: "1px solid transparent",
              borderRadius: 8,
              background: "transparent",
              cursor: "pointer",
              color: "#94a3b8",
              outline: "none",
              transition: "color 0.15s ease, background-color 0.15s ease",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#334155";
              e.currentTarget.style.backgroundColor = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "inset 0 0 0 2px #94a3b8";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── BODY — scroll interno ── */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          boxSizing: "border-box",
        }}>

          {/* Paneles: dos columnas en md+, una columna en móvil */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Panel izquierdo — solo lectura */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Ejemplo de estructura
              </span>
              <pre
                className="font-mono text-xs text-slate-700 leading-relaxed"
                style={{
                  height: 200,
                  overflowY: "auto",
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  padding: 14,
                  margin: 0,
                  flexShrink: 0,
                  boxSizing: "border-box",
                }}
              >
                {JSON.stringify(schemaEjemplo, null, 2)}
              </pre>
            </div>

            {/* Panel derecho — editable */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Ingrese el JSON para la operación
              </span>
              {/*
               * TEXTAREA — FIX:
               * • border siempre "1px solid" (solo cambia COLOR, no grosor)
               *   → el box model nunca se altera.
               * • outline: "none" suprime el outline nativo del browser.
               * • Focus feedback = box-shadow INSET (no afecta box model).
               * • boxSizing: "border-box" → padding+border incluidos en
               *   height:200, el elemento no crece al hacer focus.
               */}
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={'{\n  "campo": "valor"\n}'}
                className="font-mono text-xs text-slate-800"
                style={{
                  height: 200,
                  resize: "none",
                  borderRadius: 10,
                  padding: 14,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  outline: "none",
                  boxShadow: "none",
                  transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                  flexShrink: 0,
                  boxSizing: "border-box",
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
           * FEEDBACK — siempre debajo de los paneles.
           * Su aparición SÍ puede expandir el body con scroll interno
           * (comportamiento permitido según el alcance del ajuste).
           */}
          {feedback && (
            <div
              key={feedbackKey}
              className={`animate-fade-in rounded-lg text-sm border ${
                feedback.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
              style={{ padding: "11px 14px", flexShrink: 0, boxSizing: "border-box" }}
            >
              {feedback.msg}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "center",
          padding: "14px 20px",
          borderTop: "1px solid #e2e8f0",
          boxSizing: "border-box",
        }}>
          {/*
           * BOTÓN EJECUTAR — FIX (misma estrategia que botón cerrar):
           * • border: "1px solid transparent" siempre presente.
           * • outline: "none" suprime el focus-ring nativo del browser.
           * • Hover = background-color vía onMouseEnter/Leave (no Tailwind,
           *   para evitar que Tailwind añada ring/outline automático).
           * • Focus = box-shadow INSET (no afecta box model).
           * • boxSizing: "border-box" → width:200 / height:42 son exactos.
           */}
          <button
            onClick={handleEjecutar}
            disabled={loading}
            style={{
              width: 200,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              flexShrink: 0,
              border: "1px solid transparent",
              borderRadius: 8,
              background: "#0f172a",
              color: "#fff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              outline: "none",
              transition: "background-color 0.15s ease, opacity 0.15s ease",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#1e293b";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#0f172a";
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = "inset 0 0 0 2px #94a3b8";
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
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