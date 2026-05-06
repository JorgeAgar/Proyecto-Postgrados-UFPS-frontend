import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  entrevistaService,
  catalogoService,
  type AspiranteFrontend,
  type AdministrativoFrontend,
  type TipoEntrevistaFrontend,
  type EstadoFrontend,
  type EntrevistaCreatePayload,
} from "../../../services/comiteService";

// ── Spinner ───────────────────────────────────────────────────────────────────

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
  label: string;
  placeholder: string;
  items: { id: number; nombre: string }[];
  selectedId: number | null;
  onSelect: (id: number, nombre: string) => void;
  onClear: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

function Autocomplete({
  label,
  placeholder,
  items,
  selectedId,
  onSelect,
  onClear,
  error,
  disabled,
  required,
}: AutocompleteProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = items.find((i) => i.id === selectedId);

  useEffect(() => {
    if (selected) setQuery(selected.nombre);
    else setQuery("");
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

  const handleInput = (val: string) => {
    setQuery(val);
    setOpen(true);
    if (!val) onClear();
  };

  const handleSelect = (item: { id: number; nombre: string }) => {
    onSelect(item.id, item.nombre);
    setQuery(item.nombre);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {selectedId && !disabled && (
          <button
            type="button"
            onClick={() => { onClear(); setQuery(""); setOpen(false); }}
            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700"
          >
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
              onMouseDown={() => handleSelect(item)}
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

export default function AgendarEntrevista() {
  const navigate = useNavigate();

  // Catálogos del backend
  const [aspirantes, setAspirantes] = useState<AspiranteFrontend[]>([]);
  const [entrevistadores, setEntrevistadores] = useState<AdministrativoFrontend[]>([]);
  const [tiposEntrevista, setTiposEntrevista] = useState<TipoEntrevistaFrontend[]>([]);
  const [estados, setEstados] = useState<EstadoFrontend[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);
  const [errorCatalogos, setErrorCatalogos] = useState<string | null>(null);

  // Campos del formulario
  const [aspiranteId, setAspiranteId] = useState<number | null>(null);
  const [tipoEntrevistaId, setTipoEntrevistaId] = useState<number | null>(null);
  const [estadoId, setEstadoId] = useState<number | null>(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");

  // Entrevistadores: lista dinámica (al menos uno)
  const [entrevistadoresSel, setEntrevistadoresSel] = useState<(number | null)[]>([null]);

  // UI
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Lugar — comentado porque no está en backend aún
  // const [lugar, setLugar] = useState("");

  useEffect(() => {
    const cargar = async () => {
      setLoadingCatalogos(true);
      setErrorCatalogos(null);
      try {
        const [asp, entrev, tipos, est] = await Promise.all([
          catalogoService.getAspirantes(),
          catalogoService.getEntrevistadores(),
          catalogoService.getTiposEntrevista(),
          catalogoService.getEstados(),
        ]);
        setAspirantes(asp);
        setEntrevistadores(entrev);
        setTiposEntrevista(tipos);
        setEstados(est);
      } catch (err: unknown) {
        setErrorCatalogos(
          err instanceof Error ? err.message : "Error al cargar datos del servidor."
        );
      } finally {
        setLoadingCatalogos(false);
      }
    };
    cargar();
  }, []);

  const clearFieldError = (field: string) =>
    setFieldErrors((p) => ({ ...p, [field]: "" }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!aspiranteId) errs.aspirante = "Selecciona un aspirante.";
    if (entrevistadoresSel[0] === null) errs.entrevistador_0 = "Selecciona al menos un entrevistador.";
    if (!tipoEntrevistaId) errs.tipoEntrevista = "Selecciona el tipo de entrevista.";
    if (!estadoId) errs.estado = "Selecciona un estado.";
    if (!fecha) errs.fecha = "La fecha es obligatoria.";
    if (!hora) errs.hora = "La hora es obligatoria.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const agregarEntrevistador = () => {
    setEntrevistadoresSel((prev) => [...prev, null]);
  };

  const quitarEntrevistador = (idx: number) => {
    setEntrevistadoresSel((prev) => prev.filter((_, i) => i !== idx));
  };

  const setEntrevistadorEnIdx = (idx: number, id: number | null) => {
    setEntrevistadoresSel((prev) => prev.map((v, i) => (i === idx ? id : v)));
    clearFieldError(`entrevistador_${idx}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const principalAdminId = entrevistadoresSel[0]!;
    // Resolver el id de la tabla `entrevistador` (no es el mismo que administrativo.id).
    // El backend espera idEntrevistador = id en la tabla entrevistador.
    const principalEntrev = entrevistadores.find((x) => x.id === principalAdminId);
    const idEntrevistadorTabla = principalEntrev?.entrevistadorId ?? 0;

    // Todos los adminIds seleccionados (incluyendo el principal)
    const todosLosAdminIds = entrevistadoresSel.filter((id): id is number => id !== null);

    // Normalizar tiempo a HH:mm:ss (el input type="time" devuelve "HH:mm")
    const tiempoFmt = hora.length === 5 ? `${hora}:00` : hora;

    const payload: EntrevistaCreatePayload = {
      fecha,
      tiempo: tiempoFmt,
      idTipoentrevista: tipoEntrevistaId!,
      idEntrevistador: idEntrevistadorTabla,
      idAspirante: aspiranteId!,
      idEstado: estadoId!,
      idUbicacion: 1,
    };

    setLoading(true);
    setError(null);
    try {
      // Pasar todos los adminIds (el service crea registros en tabla entrevistadores para todos)
      await entrevistaService.create(payload, todosLosAdminIds);
      const aspirante = aspirantes.find((a) => a.id === aspiranteId);
      setSuccess(
        `Entrevista agendada correctamente para ${aspirante?.nombre ?? "el aspirante"} el ${fecha}.`
      );
      // Limpiar formulario
      setAspiranteId(null);
      setTipoEntrevistaId(null);
      setEstadoId(null);
      setFecha("");
      setHora("");
      setEntrevistadoresSel([null]);
      setFieldErrors({});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al agendar la entrevista.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 mb-6">
        <h1 className="text-2xl font-black text-gray-900">Agendar entrevista</h1>
        <p className="mt-1 text-sm text-gray-500">
          Solo pueden ser agendados aspirantes registrados en el sistema.
          Puedes agregar varios entrevistadores por entrevista.
        </p>
      </div>

      {/* Error de catálogos */}
      {errorCatalogos && (
        <div className="animate-fade-in mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorCatalogos}
        </div>
      )}

      {/* Mensajes globales */}
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
        {loadingCatalogos ? (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400 text-sm">
            <Spinner small />
            Cargando datos del servidor...
          </div>
        ) : (
          <>
            {/* Aspirante */}
            <Autocomplete
              label="Aspirante"
              placeholder="Buscar aspirante por nombre..."
              items={aspirantes}
              selectedId={aspiranteId}
              onSelect={(id) => { setAspiranteId(id); clearFieldError("aspirante"); setError(null); }}
              onClear={() => setAspiranteId(null)}
              error={fieldErrors.aspirante}
              required
            />

            {/* Entrevistadores (dinámicos) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Entrevistadores <span className="text-red-600">*</span>
              </label>
              <div className="space-y-2">
                {entrevistadoresSel.map((sel, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="flex-1">
                      {idx === 0 && (
                        <p className="text-xs text-red-700 font-semibold mb-0.5">Principal</p>
                      )}
                      <Autocomplete
                        label=""
                        placeholder={`Buscar entrevistador ${idx + 1}...`}
                        items={entrevistadores}
                        selectedId={sel}
                        onSelect={(id) => setEntrevistadorEnIdx(idx, id)}
                        onClear={() => setEntrevistadorEnIdx(idx, null)}
                        error={fieldErrors[`entrevistador_${idx}`]}
                      />
                    </div>
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
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
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
                Estado inicial <span className="text-red-600">*</span>
              </label>
              <select
                value={estadoId ?? ""}
                onChange={(e) => {
                  setEstadoId(e.target.value ? Number(e.target.value) : null);
                  clearFieldError("estado");
                  setError(null);
                }}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
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

            {/* Fecha y Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Fecha <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => { setFecha(e.target.value); clearFieldError("fecha"); setError(null); }}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                />
                {fieldErrors.fecha && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.fecha}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Hora <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => { setHora(e.target.value); clearFieldError("hora"); setError(null); }}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
                />
                {fieldErrors.hora && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.hora}</p>
                )}
              </div>
            </div>

            {/* Lugar — comentado porque no está en backend aún */}
            {/* <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Lugar</label>
              <input
                type="text"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                placeholder="Ej: Sala 204 – Bloque A"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
              />
            </div> */}

            {/* Nota informativa */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700">
              Al guardar, se registrará la entrevista con todos los entrevistadores seleccionados
              y quedará disponible en el listado de entrevistas.
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 flex-1 bg-red-700 text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Spinner />}
                {loading ? "Agendando..." : "Agendar entrevista"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/comite/entrevista")}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}