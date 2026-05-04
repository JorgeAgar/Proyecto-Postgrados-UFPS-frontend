import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { programaApiFetch } from "../../services/programaService";

interface CrearCohorteProps {
  onClose?: () => void;
}

export default function CrearCohorte({ onClose }: CrearCohorteProps) {
  const navigate = useNavigate();
  const [programa, setPrograma] = useState("");
  const [cohorte, setCohorte] = useState("");
  const [cupos, setCupos] = useState("");
  const [requisitos, setRequisitos] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validarCampos() {
    if (!programa.trim()) return "El campo Programa es obligatorio.";
    if (!cohorte.trim()) return "El campo Cohorte es obligatorio.";
    if (!cupos.trim()) return "El campo Cupos es obligatorio.";
    const n = Number(cupos);
    if (!Number.isInteger(n) || n <= 0) return "Cupos debe ser un número entero positivo.";
    if (!requisitos.trim()) return "El campo Requisitos es obligatorio.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validarCampos();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);

    try {
      // Intentar verificación de duplicados en servidor (si existe endpoint).
      let exists = false;
      try {
        const list = await programaApiFetch<any[]>("/api/oferta-academica/listall");
        exists = list.some((it) => (it.programa ?? "").toLowerCase() === programa.trim().toLowerCase() && (it.cohorte ?? "").toLowerCase() === cohorte.trim().toLowerCase());
      } catch (err) {
        // Si el endpoint no existe o falla, no bloqueamos la creación, pero avisamos.
      }

      if (exists) {
        setError(`Ya existe una oferta para el programa "${programa.trim()}" y la cohorte "${cohorte.trim()}".`);
        setLoading(false);
        return;
      }

      // Intentar crear en backend (si endpoint disponible)
      try {
        const payload = { programa: programa.trim(), cohorte: cohorte.trim(), cupos: Number(cupos), requisitos: requisitos.trim() };
        await programaApiFetch("/api/oferta-academica/create", { method: "POST", body: JSON.stringify(payload) });
        (onClose ?? (() => navigate("/programa/cohortes")))();
      } catch (err) {
        // Si falla la creación remota, mostrar mensaje razonable.
        const msg = err instanceof Error ? err.message : String(err);
        setError(`Error al crear (servidor): ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") (onClose ?? (() => navigate("/programa/inicio")))();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, navigate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => (onClose ?? (() => navigate("/programa/inicio")))()} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Crear cohorte</h2>
          <button onClick={() => (onClose ?? (() => navigate("/programa/inicio")))()} aria-label="Cerrar" className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Programa</label>
            <input value={programa} onChange={(e) => setPrograma(e.target.value)} className="mt-1 block w-full rounded border-gray-200 p-2" placeholder="Nombre del programa" />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Cohorte</label>
            <input value={cohorte} onChange={(e) => setCohorte(e.target.value)} className="mt-1 block w-full rounded border-gray-200 p-2" placeholder="Ej: 2026-1" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cupos</label>
            <input value={cupos} onChange={(e) => setCupos(e.target.value)} type="number" min={1} className="mt-1 block w-full rounded border-gray-200 p-2" placeholder="Número de cupos" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Requisitos</label>
            <textarea value={requisitos} onChange={(e) => setRequisitos(e.target.value)} className="mt-1 block w-full rounded border-gray-200 p-2" rows={4} placeholder="Requisitos para la cohorte" />
          </div>

          {error && <p className="text-red-600 md:col-span-2">{error}</p>}

          <div className="md:col-span-2 flex justify-end items-center gap-3 mt-2">
            <button type="button" onClick={() => (onClose ?? (() => navigate("/programa/inicio")))()} className="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" disabled={loading} className="bg-red-700 text-white px-4 py-2 rounded disabled:opacity-60">{loading ? "Guardando..." : "Crear cohorte"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
