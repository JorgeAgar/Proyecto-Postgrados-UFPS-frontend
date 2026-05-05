import { useState, useEffect, useRef } from "react";
import type { BackendEndpoint } from "../../../services/superadminService";

// ── Props ─────────────────────────────────────────────────────────────────────

interface ModalCRUDProps {
  endpoint: BackendEndpoint;
  onClose: () => void;
  onResult: (data: unknown) => void;
}

// ── Constantes ────────────────────────────────────────────────────────────────

const BASE_URL = "https://proyectoposgradosbackend-production.up.railway.app/posgrados-project";

const METHOD_COLORS: Record<string, string> = {
  GET:    "bg-blue-100 text-blue-800 border-blue-200",
  POST:   "bg-green-100 text-green-800 border-green-200",
  PUT:    "bg-amber-100 text-amber-800 border-amber-200",
  DELETE: "bg-red-100 text-red-800 border-red-200",
  PATCH:  "bg-purple-100 text-purple-800 border-purple-200",
};

const ANIM_DURATION = 220;

// Un endpoint es "solo lectura" cuando es GET sin requestBody
function isReadOnly(ep: BackendEndpoint): boolean {
  return ep.methods.includes("GET") && !ep.requestBody;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

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

// ── ModalCRUD ─────────────────────────────────────────────────────────────────

export default function ModalCRUD({ endpoint, onClose, onResult }: ModalCRUDProps) {
  const readOnly = isReadOnly(endpoint);

  const schemaEjemplo = endpoint.requestBody?.template ?? null;
  const schemaStr = schemaEjemplo !== null ? JSON.stringify(schemaEjemplo, null, 2) : "— Sin body requerido —";

  const [jsonInput, setJsonInput] = useState(
    schemaEjemplo !== null ? JSON.stringify(schemaEjemplo, null, 2) : ""
  );

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  // AbortController para cancelar el fetch si el usuario cierra el modal
  const abortRef = useRef<AbortController | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ── Cierre: cancela fetch en vuelo si lo hay ──────────────────────────────

  const triggerClose = () => {
    if (isClosing) return;

    // Cancelar fetch en vuelo
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    setIsClosing(true);
    setLoading(false);
    closeTimerRef.current = setTimeout(() => onClose(), ANIM_DURATION);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") triggerClose(); };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      // Si el componente se desmonta con un fetch en vuelo, abortarlo
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
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

  // ── Ejecutar operación ────────────────────────────────────────────────────

  const handleEjecutar = async () => {
    setFeedback(null);

    let parsed: unknown = null;
    if (!readOnly) {
      if (!jsonInput.trim()) {
        showFeedback("error", "El campo JSON no puede estar vacío.");
        return;
      }
      try {
        parsed = JSON.parse(jsonInput);
      } catch {
        showFeedback("error", "El JSON ingresado no es válido. Verifique la sintaxis.");
        return;
      }
    }

    const httpMethod = endpoint.methods[0] ?? "GET";
    const url = `${BASE_URL}${endpoint.path}`;

    // Crear un nuevo AbortController para esta petición
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const token = localStorage.getItem("ufps_superadmin_access_token");
      const opts: RequestInit = {
        method: httpMethod,
        signal: controller.signal,          // ← señal de cancelación
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };

      if (httpMethod !== "GET" && parsed !== null) {
        opts.body = JSON.stringify(parsed);
      }

      const res = await fetch(url, opts);

      // Si el usuario ya cerró mientras esperábamos → no hacer nada
      if (controller.signal.aborted) return;

      const contentType = res.headers.get("content-type") || "";
      let data: unknown = null;

      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (controller.signal.aborted) return;

      if (!res.ok) {
        const errMsg =
          typeof data === "object" && data !== null && "message" in (data as object)
            ? (data as Record<string, string>).message
            : `Error ${res.status}: ${res.statusText}`;
        showFeedback("error", errMsg);
        return;
      }

      // GET puro: animar cierre y entregar datos al padre con delay seguro
      if (readOnly) {
        triggerClose();
        setTimeout(() => onResult(data), ANIM_DURATION + 50);
        return;
      }

      // Otros endpoints que devuelven lista/búsqueda → abrir ModalResult
      if (
        endpoint.handler.toLowerCase().includes("find") ||
        endpoint.handler.toLowerCase().includes("list")
      ) {
        onResult(data);
      }

      showFeedback("success", "Operación ejecutada exitosamente.");
      if (schemaEjemplo !== null) {
        setJsonInput(JSON.stringify(schemaEjemplo, null, 2));
      }
    } catch (err) {
      // Si fue cancelado por AbortController, no mostrar error
      if ((err as { name?: string })?.name === "AbortError") return;
      showFeedback("error", `No se pudo conectar con el servidor. ${err instanceof Error ? err.message : ""}`);
    } finally {
      // Limpiar ref solo si sigue siendo el mismo controller
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const primaryMethod = endpoint.methods[0]?.toUpperCase() ?? "GET";
  const colorClass = METHOD_COLORS[primaryMethod] ?? "bg-gray-100 text-gray-800 border-gray-200";
  const btnLabel = readOnly ? "Obtener datos" : "Ejecutar operación";

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
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${colorClass}`}>
              {endpoint.methods.join(" / ")}
            </span>
            <div style={{ minWidth: 0 }}>
              <span className="text-sm font-bold text-slate-900 block truncate">{endpoint.controller}</span>
              <span className="text-xs font-mono text-slate-500 block truncate">{endpoint.path}</span>
            </div>
          </div>

          <button
            onClick={triggerClose}
            title={loading ? "Cancelar operación" : "Cerrar"}
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
              color: loading ? "#ef4444" : "#94a3b8",
              outline: "none",
              transition: "color 0.15s ease, background-color 0.15s ease",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = loading ? "#b91c1c" : "#334155";
              e.currentTarget.style.backgroundColor = loading ? "#fef2f2" : "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = loading ? "#ef4444" : "#94a3b8";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 0 2px #94a3b8"; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* ── BODY ── */}
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

          {readOnly ? (
            /* GET sin body: mensaje estático, el spinner aparece solo al ejecutar */
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-500">
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-sm text-slate-500">Obteniendo datos...</span>
                  <span className="text-xs text-slate-400">Puedes cerrar para cancelar la operación.</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-slate-300" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <span className="text-sm text-center text-slate-500">
                    Este endpoint obtiene todos los registros sin parámetros.
                  </span>
                  <span className="text-xs text-center text-slate-400">
                    Haz clic en <strong className="text-slate-600">Obtener datos</strong> para ejecutar la consulta.
                  </span>
                </>
              )}
            </div>
          ) : (
            /* POST / PUT / DELETE: dos paneles */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Izquierdo — template de ejemplo */}
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
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {schemaStr}
                </pre>

                {endpoint.requestBody?.fields && endpoint.requestBody.fields.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1">
                    {endpoint.requestBody.fields.map((f, i) => (
                      <div key={i} className="flex flex-wrap gap-1.5 text-xs px-2 py-1 rounded bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-700">{f.name}</span>
                        <span className="text-slate-400 font-mono">{f.type.split(".").pop()}</span>
                        {f.required && <span className="text-red-500 font-semibold">required</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Derecho — textarea editable */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Ingrese el JSON para la operación
                </span>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={'{\n  "campo": "valor"\n}'}
                  disabled={loading}
                  className="font-mono text-xs text-slate-800"
                  style={{
                    height: 200,
                    resize: "none",
                    borderRadius: 10,
                    padding: 14,
                    background: loading ? "#f8fafc" : "#fff",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                    boxShadow: "none",
                    transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                    flexShrink: 0,
                    boxSizing: "border-box",
                    opacity: loading ? 0.6 : 1,
                  }}
                  onFocus={(e) => {
                    if (!loading) {
                      e.currentTarget.style.boxShadow = "inset 0 0 0 2px #94a3b8";
                      e.currentTarget.style.borderColor = "#94a3b8";
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                />
              </div>
            </div>
          )}

          {/* Feedback */}
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
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#1e293b"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0f172a"; }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 0 2px #94a3b8"; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            {loading && <Spinner />}
            {loading ? "Ejecutando..." : btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}