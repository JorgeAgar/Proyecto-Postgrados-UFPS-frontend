import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  entrevistaService,
  catalogoService,
  type Entrevista,
  type AdministrativoFrontend,
  type TipoEntrevistaFrontend,
  type EstadoFrontend,
  type EntrevistaCreatePayload,
} from "../../../services/comiteService";

function Spinner({ small = false }: { small?: boolean }) {
  const cls = small ? "h-3.5 w-3.5" : "h-4 w-4 text-white";
  return (
    <svg className={`animate-spin ${cls}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Autocomplete genérico ─────────────────────────────────────────────────────

interface AutocompleteProps {
  placeholder: string;
  items: { id: number; nombre: string }[];
  selectedId: number | null;
  onSelect: (id: number, nombre: string) => void;
  onClear: () => void;
  error?: string;
  disabled?: boolean;
}

function Autocomplete({
  placeholder,
  items,
  selectedId,
  onSelect,
  onClear,
  error,
  disabled,
}: AutocompleteProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = items.find((i) => i.id === selectedId);

  useEffect(() => {
    if (selected) setQuery(selected.nombre);
    else if (!selectedId) setQuery("");
  }, [selectedId, selected]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query.trim()
    ? items.filter((i) => i.nombre.toLowerCase().includes(query.trim().toLowerCase()))
    : items.slice(0, 20);

  return (
    <div ref={ref} className="relative flex-1">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); if (!e.target.value) onClear(); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {selectedId && !disabled && (
          <button type="button" onClick={() => { onClear(); setQuery(""); setOpen(false); }} className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto text-sm">
          {filtered.map((item) => (
            <li
              key={item.id}
              onMouseDown={() => { onSelect(item.id, item.nombre); setQuery(item.nombre); setOpen(false); }}
              className={`px-3 py-2 cursor-pointer hover:bg-red-50 hover:text-red-700 transition-colors ${item.id === selectedId ? "bg-red-50 text-red-700 font-semibold" : "text-gray-700"}`}
            >
              {item.nombre}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function ReagendarEntrevista() {
  const navigate = useNavigate();
  const location = useLocation();

  const entrevistaInicial =
    (location.state as { entrevista?: Entrevista })?.entrevista ?? null;

  // Catálogos
  const [entrevistadores, setEntrevistadores] = useState<AdministrativoFrontend[]>([]);
  const [tiposEntrevista, setTiposEntrevista] = useState<TipoEntrevistaFrontend[]>([]);
  const [estados, setEstados] = useState<EstadoFrontend[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Campos editables
  const [entrevistadoresSel, setEntrevistadoresSel] = useState<(number | null)[]>([
    entrevistaInicial?.evaluadorId ?? null,
  ]);
  const [tipoEntrevistaId, setTipoEntrevistaId] = useState<number | null>(
    entrevistaInicial?.tipoEntrevistaId ?? null
  );
  const [estadoId, setEstadoId] = useState<number | null>(
    entrevistaInicial?.estadoId ?? null
  );
  const [fecha, setFecha] = useState(entrevistaInicial?.fecha ?? "");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Lugar — comentado porque no está en backend aún
  // const [lugar, setLugar] = useState("");

  useEffect(() => {
    if (!entrevistaInicial) {
      navigate("/comite/entrevista", { replace: true });
      return;
    }
    const cargar = async () => {
      setLoadingCatalogos(true);
      try {
        const [entrev, tipos, est] = await Promise.all([
          catalogoService.getEntrevistadores(),
          catalogoService.getTiposEntrevista(),
          catalogoService.getEstados(),
        ]);
        setEntrevistadores(entrev);
        setTiposEntrevista(tipos);
        setEstados(est);
      } catch {
        // ignorar error de catálogos en reagendar
      } finally {
        setLoadingCatalogos(false);
      }
    };
    cargar();
  }, []); // eslint-disable-line

  if (!entrevistaInicial) return null;

  const bloqueada = entrevistaInicial.estado?.toLowerCase() === "realizada";

  const clearFieldError = (field: string) =>
    setFieldErrors((p) => ({ ...p, [field]: "" }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (entrevistadoresSel[0] === null) errs.entrevistador_0 = "Selecciona al menos un entrevistador.";
    if (!tipoEntrevistaId) errs.tipoEntrevista = "Selecciona el tipo de entrevista.";
    if (!estadoId) errs.estado = "Selecciona un estado.";
    if (!fecha) errs.fecha = "La fecha es obligatoria.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const agregarEntrevistador = () =>
    setEntrevistadoresSel((prev) => [...prev, null]);

  const quitarEntrevistador = (idx: number) =>
    setEntrevistadoresSel((prev) => prev.filter((_, i) => i !== idx));

  const setEntrevistadorEnIdx = (idx: number, id: number | null) => {
    setEntrevistadoresSel((prev) => prev.map((v, i) => (i === idx ? id : v)));
    clearFieldError(`entrevistador_${idx}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (bloqueada) {
      setError("No se puede reagendar una entrevista que ya ha sido realizada.");
      return;
    }

    const entrevistadorPrincipalId = entrevistadoresSel[0]!;

    const payload: Partial<EntrevistaCreatePayload> = {
      fecha,
      idTipoentrevista: tipoEntrevistaId!,
      idEntrevistador: entrevistadorPrincipalId,
      idAspirante: entrevistaInicial.aspiranteId,
      idEstado: estadoId!,
    };

    setLoading(true);
    setError(null);
    try {
      await entrevistaService.update(entrevistaInicial.id, payload);
      setSuccess(
        `Entrevista reagendada correctamente para el ${fecha}. Los cambios han sido guardados.`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al reagendar la entrevista.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Reagendar entrevista</h1>
        <p className="mt-1 text-sm text-gray-500">
          Aspirante:{" "}
          <span className="font-semibold text-gray-700">{entrevistaInicial.aspiranteNombre}</span>
          {entrevistaInicial.tipoEntrevistaNombre && (
            <>
              {" "}—{" "}
              <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-1.5 py-0.5 rounded">
                {entrevistaInicial.tipoEntrevistaNombre}
              </span>
            </>
          )}
        </p>
      </div>

      {/* Aviso si está bloqueada */}
      {bloqueada && (
        <div className="animate-fade-in mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Reagendamiento bloqueado:</strong> Esta entrevista ya ha sido marcada como{" "}
          <strong>Realizada</strong>. No puede modificarse.
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

      <form
        onSubmit={handleSubmit}
        noValidate
        className="animate-fade-in-up delay-100 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
      >
        {/* Aspirante (solo lectura) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Aspirante</label>
            <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2.5 truncate">
              {entrevistaInicial.aspiranteNombre || "—"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-500 mb-1">Estado actual</label>
            <p className="text-sm text-gray-700 bg-gray-100 rounded-lg px-3 py-2.5 truncate">
              {entrevistaInicial.estado || "—"}
            </p>
          </div>
        </div>

        {loadingCatalogos ? (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400 text-sm">
            <Spinner small />
            Cargando datos del servidor...
          </div>
        ) : (
          <>
            {/* Entrevistadores (dinámicos) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Entrevistadores <span className="text-red-600">*</span>
              </label>
              <div className="space-y-2">
                {entrevistadoresSel.map((sel, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Autocomplete
                      placeholder={`Buscar entrevistador ${idx + 1}...`}
                      items={entrevistadores}
                      selectedId={sel}
                      onSelect={(id) => setEntrevistadorEnIdx(idx, id)}
                      onClear={() => setEntrevistadorEnIdx(idx, null)}
                      error={fieldErrors[`entrevistador_${idx}`]}
                      disabled={bloqueada || loading}
                    />
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => quitarEntrevistador(idx)}
                        className="mt-0.5 p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Quitar entrevistador"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {!bloqueada && (
                <button
                  type="button"
                  onClick={agregarEntrevistador}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Agregar entrevistador
                </button>
              )}
            </div>

            {/* Tipo de entrevista */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tipo de entrevista <span className="text-red-600">*</span>
              </label>
              <select
                value={tipoEntrevistaId ?? ""}
                onChange={(e) => {
                  setTipoEntrevistaId(e.target.value ? Number(e.target.value) : null);
                  clearFieldError("tipoEntrevista");
                  setError(null);
                }}
                disabled={bloqueada || loading}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Selecciona un tipo</option>
                {tiposEntrevista.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              {fieldErrors.tipoEntrevista && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.tipoEntrevista}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nuevo estado <span className="text-red-600">*</span>
              </label>
              <select
                value={estadoId ?? ""}
                onChange={(e) => {
                  setEstadoId(e.target.value ? Number(e.target.value) : null);
                  clearFieldError("estado");
                  setError(null);
                }}
                disabled={bloqueada || loading}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Selecciona un estado</option>
                {estados.map((est) => (
                  <option key={est.id} value={est.id}>{est.tipo}</option>
                ))}
              </select>
              {fieldErrors.estado && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.estado}</p>
              )}
            </div>

            {/* Nueva fecha */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nueva fecha <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => { setFecha(e.target.value); clearFieldError("fecha"); setError(null); }}
                disabled={bloqueada || loading}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {fieldErrors.fecha && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.fecha}</p>
              )}
            </div>

            {/* Lugar — comentado porque no está en backend aún */}
            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lugar</label>
              <input
                type="text"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                disabled={bloqueada || loading}
                placeholder="Ej: Sala 204 – Bloque A"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div> */}

            {/* Nota informativa */}
            {!bloqueada && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
                Los cambios se guardarán en el backend. Los entrevistadores adicionales se actualizarán
                de acuerdo a la selección actual.
              </div>
            )}
          </>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || bloqueada || !!success}
            className="flex items-center justify-center gap-2 flex-1 bg-red-700 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Spinner />}
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/comite/entrevista")}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            Volver
          </button>
        </div>
      </form>
    </div>
  );
}