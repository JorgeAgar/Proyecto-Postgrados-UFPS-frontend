import { useState, useEffect, useRef } from "react";
import type { BackendEndpoint } from "../../../services/superadminService";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EntityCardProps {
  controller: string;
  endpoints: BackendEndpoint[];
  isOpen: boolean;
  onToggle: () => void;
  onEndpointClick: (ep: BackendEndpoint) => void;
}

// ── Method colors (igual que original) ───────────────────────────────────────

const METHOD_COLORS: Record<string, string> = {
  GET:    "border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100",
  POST:   "border-green-300 text-green-800 bg-green-50 hover:bg-green-100",
  PUT:    "border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100",
  DELETE: "border-red-300 text-red-800 bg-red-50 hover:bg-red-100",
  PATCH:  "border-purple-300 text-purple-800 bg-purple-50 hover:bg-purple-100",
};

function getMethodColor(methods: string[]) {
  const m = methods[0]?.toUpperCase() ?? "";
  return METHOD_COLORS[m] ?? "border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100";
}

// ── ChevronIcon (idéntico al original) ───────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 text-slate-400 flex-shrink-0"
      style={{
        transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
      }}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── EntityCard ────────────────────────────────────────────────────────────────

export default function EntityCard({
  controller,
  endpoints,
  isOpen,
  onToggle,
  onEndpointClick,
}: EntityCardProps) {
  const [visible, setVisible] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setClosing(false);
      setVisible(true);
    } else {
      if (visible) {
        setClosing(true);
        closeTimer.current = setTimeout(() => {
          setVisible(false);
          setClosing(false);
        }, 320);
      }
    }
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const handleButtonClick = (e: React.MouseEvent, ep: BackendEndpoint) => {
    e.stopPropagation();
    onEndpointClick(ep);
  };

  return (
    <div
      className={`w-full max-w-3xl mx-auto rounded-xl border shadow-sm cursor-pointer select-none
        ${isOpen
          ? "border-slate-400 bg-white shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow"
        }`}
      style={{ transition: "border-color 0.2s, box-shadow 0.2s" }}
      onClick={handleCardClick}
    >
      {/* Header — mismo layout que original */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-bold text-slate-800">{controller}</span>
          <span className="text-xs text-slate-400 font-medium flex-shrink-0">
            ({endpoints.length})
          </span>
        </div>
        <ChevronIcon open={isOpen} />
      </div>

      {/* Acordeón animado — idéntico al original */}
      {visible && (
        <div
          className={closing ? "animate-accordion-close" : "animate-accordion-open"}
          style={{ overflow: "hidden" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-t border-slate-100 px-5 py-4 flex flex-col gap-2">
            {endpoints.map((ep, idx) => {
              const colorClass = getMethodColor(ep.methods);
              // Label: método(s) + path corto
              const methodLabel = ep.methods.join(" / ");
              // Mostrar solo la última parte del path para legibilidad
              const pathShort = ep.path.split("/").slice(-2).join("/");
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleButtonClick(e, ep)}
                  className={`w-full text-left text-sm font-semibold px-4 py-2.5 rounded-lg border transition-colors ${colorClass}`}
                >
                  <span className="font-bold mr-2">{methodLabel}</span>
                  <span className="font-mono text-xs opacity-80">/{pathShort}</span>
                  {ep.handler && (
                    <span className="ml-2 text-xs font-normal opacity-60">· {ep.handler}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}