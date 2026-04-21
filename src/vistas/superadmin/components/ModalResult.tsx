import { useRef, useEffect, useState } from "react";

interface ModalResultProps {
  data: unknown;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function ModalResult({ data, onClose }: ModalResultProps) {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied]     = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const formatted = JSON.stringify(data, null, 2);

  const triggerClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    closeTimer.current = setTimeout(() => {
      onClose();
    }, 170); // sincronizado con animate-modal-out (0.17 s)
  };

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

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 ${isClosing ? "animate-overlay-out" : "animate-overlay-in"}`}
      style={{
        backgroundColor: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 60,
      }}
      onClick={triggerClose}
    >
      <div
        className={`${isClosing ? "animate-modal-out" : "animate-modal-in"} bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-base font-bold text-slate-900">Resultado de la operación</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Copiar JSON"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <button
              onClick={triggerClose}
              className="text-slate-400 hover:text-slate-700 transition-colors rounded-lg p-1 hover:bg-slate-100 flex-shrink-0 w-8 h-8 flex items-center justify-center"
              title="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-5">
          <pre className="text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap break-words">
            {formatted}
          </pre>
        </div>
      </div>
    </div>
  );
}
