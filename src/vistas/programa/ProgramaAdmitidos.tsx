import { useEffect, useMemo, useState } from 'react';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  fetchRankingAdmitidosByCohorte,
  admitirAspirante,
  revertirAdmision,
  type AspiranteRankingItem,
  type FiltroAdmision,
} from '../../services/programa/programaAdmitidosService';
import { fetchCohortes, type CohorteItem } from '../../services/programa/programaChortesService';

export default function ProgramaAdmitidos() {
  const [cohortes, setCohortes] = useState<CohorteItem[]>([]);
  const [cohortesLoading, setCohortesLoading] = useState(true);
  const [selectedCohorteId, setSelectedCohorteId] = useState<string | null>(null);

  // removed unused loading states
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAdmision, setFiltroAdmision] = useState<FiltroAdmision>('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [confirmacionCerrando, setConfirmacionCerrando] = useState(false);
  const [aspiranteObjetivo, setAspiranteObjetivo] = useState<AspiranteRankingItem | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [cohorteNombre, setCohorteNombre] = useState('');
  const [cohorteActiva, setCohorteActiva] = useState(false);
  const [cuposDisponibles, setCuposDisponibles] = useState(0);
  const [totalAdmitidos, setTotalAdmitidos] = useState(0);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);
  const [aspirantes, setAspirantes] = useState<AspiranteRankingItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setCohortesLoading(true);
        setError(null);
        const list = await fetchCohortes();
        setCohortes(list);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la lista de cohortes.');
      } finally {
        setCohortesLoading(false);
      }
    })();
  }, []);

  const loadRankingForCohorte = async (cohorteId: string) => {
    setLocalErrorMessage(null);
    setSuccessMessage(null);
    setRankingLoading(true);
    setError(null);
    try {
      const data = await fetchRankingAdmitidosByCohorte(cohorteId);
      setCohorteNombre(data.cohorteActual.nombre);
      setCohorteActiva(data.cohorteActual.activa);
      setCuposDisponibles(data.cohorteActual.cuposDisponibles);
      setTotalAdmitidos(data.cohorteActual.totalAdmitidos);
      setAspirantes(data.aspirantes);
    } catch (err) {
      console.error(err);
      setLocalErrorMessage('No se pudo cargar el ranking para la cohorte seleccionada.');
      setError('No se pudo cargar el ranking para la cohorte seleccionada.');
    } finally {
      setRankingLoading(false);
    }
  };

  const aspirantesFiltrados = useMemo(() => {
    return aspirantes.filter((aspirante) => {
      const coincideBusqueda = aspirante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || aspirante.correo.toLowerCase().includes(searchTerm.toLowerCase());
      const coincideAdmision =
        filtroAdmision === 'todos' ||
        (filtroAdmision === 'admitidos' && aspirante.admitido) ||
        (filtroAdmision === 'porAdmitir' && !aspirante.admitido);
      return aspirante.completamenteCalificado && coincideBusqueda && coincideAdmision;
    });
  }, [aspirantes, searchTerm, filtroAdmision]);

  const handleAdmitir = (aspirante: AspiranteRankingItem) => {
    setAspiranteObjetivo(aspirante);
    setMostrarConfirmacion(true);
  };
  const handleQuitarAdmision = (aspirante: AspiranteRankingItem) => {
    setAspiranteObjetivo(aspirante);
    setMostrarConfirmacion(true);
  };

  const confirmarAccion = async () => {
    if (!aspiranteObjetivo) return;
    setProcesando(true);
    try {
      if (aspiranteObjetivo.admitido) {
        if (!selectedCohorteId) {
          setLocalErrorMessage('No hay cohorte seleccionada.');
          return;
        }
        await revertirAdmision(selectedCohorteId, aspiranteObjetivo.id);
        setAspirantes((prev) => prev.map((a) => (a.id === aspiranteObjetivo.id ? { ...a, admitido: false } : a)));
        setTotalAdmitidos((prev) => Math.max(prev - 1, 0));
        setSuccessMessage('Admisión revertida correctamente.');
      } else {
        if (!selectedCohorteId) {
          setLocalErrorMessage('No hay cohorte seleccionada.');
          return;
        }
        if (totalAdmitidos >= cuposDisponibles) {
          setLocalErrorMessage('No hay cupos disponibles para admitir más aspirantes.');
          return;
        }
        await admitirAspirante(selectedCohorteId, aspiranteObjetivo.id);
        setAspirantes((prev) => prev.map((a) => (a.id === aspiranteObjetivo.id ? { ...a, admitido: true } : a)));
        setTotalAdmitidos((prev) => prev + 1);
        setSuccessMessage('Aspirante admitido correctamente.');
      }

      setConfirmacionCerrando(true);
      setTimeout(() => {
        setMostrarConfirmacion(false);
        setAspiranteObjetivo(null);
        setConfirmacionCerrando(false);
      }, 170);
    } catch (err) {
      console.error(err);
      setLocalErrorMessage('No se pudo completar la operación de admisión.');
    } finally {
      setProcesando(false);
    }
  };

  const cancelarAccion = () => {
    setConfirmacionCerrando(true);
    setTimeout(() => {
      setMostrarConfirmacion(false);
      setAspiranteObjetivo(null);
      setConfirmacionCerrando(false);
    }, 170);
  };

  // Auto-clear notifications
  useEffect(() => {
    if (!successMessage) return;
    const id = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(id);
  }, [successMessage]);

  useEffect(() => {
    if (!localErrorMessage) return;
    const id = setTimeout(() => setLocalErrorMessage(null), 6000);
    return () => clearTimeout(id);
  }, [localErrorMessage]);

  if (cohortesLoading) {
    return (
      <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-lg p-6 text-neutral-400 flex items-center gap-3">
          <ArrowPathIcon className="w-5 h-5 animate-spin text-neutral-400" />
          <div className="text-sm">Cargando cohortes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-7xl mx-auto bg-red-100 border border-red-200 rounded-lg p-6 text-red-700 flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 mt-0.5" />
          <div>{error}</div>
        </div>
      </div>
    );
  }

  // If no cohort selected, show cohort list
  if (!selectedCohorteId) {
    return (
      <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900 mb-6 animate-fade-in">Admitidos</h1>
          <div className="space-y-4 animate-fade-in-up delay-100">
            {cohortes.map((cohorte) => (
              <button
                key={cohorte.id}
                type="button"
                onClick={async () => {
                  setSelectedCohorteId(cohorte.id);
                  await loadRankingForCohorte(cohorte.id);
                }}
                className="w-full text-left p-6 rounded-lg bg-white border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-xl font-semibold text-gray-900">{cohorte.nombre}</h2>
                      {cohorte.activa && (
                        <span className="bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded-lg">Activa</span>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-6">
                        <div className="text-sm">
                          <span className="text-neutral-400">Inscritos: </span>
                          <span className="font-semibold text-red-700">{cohorte.totalInscritos ?? cohorte.inscritos ?? 0}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-neutral-400">Cupos: </span>
                          <span className="font-semibold text-red-700">{cohorte.cupos}</span>
                        </div>
                      </div>

                      {/* Progress: Admitidos / Calificados (uses totalValidados or totalCalificados) */}
                      {(() => {
                        const porAdmitir = (cohorte.totalCalificados ?? 0);
                        const admitidos = (cohorte.totalAdmitidos ?? 0);
                        const total = admitidos + porAdmitir;
                        const pct = total > 0 ? Math.min(100, Math.round((admitidos / total) * 100)) : 0;
                        return (
                          <div>
                            <div className="text-xs text-neutral-400 mb-1">Admitidos / total</div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div className="h-3 bg-red-700" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="text-sm mt-2">
                              <span className="font-semibold text-red-700">{admitidos}</span>
                              <span className="text-neutral-400"> / </span>
                              <span className="font-semibold">{total}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <ChevronRightIcon className="text-gray-400 shrink-0 mt-1 h-6 w-6" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Selected cohort: show ranking
  return (
    <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCohorteId(null);
                setAspirantes([]);
              }}
              className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-0 transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4 rotate-180" />
              <span className="font-medium">Volver a cohortes</span>
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => {
                  if (!selectedCohorteId) {
                    setLocalErrorMessage('No hay cohorte seleccionada.');
                    return;
                  }
                  void loadRankingForCohorte(selectedCohorteId);
                }}
                disabled={rankingLoading || !selectedCohorteId}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 disabled:opacity-60"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Refrescar
              </button>
              {rankingLoading && (
                <div className="inline-flex items-center gap-2 text-sm text-neutral-500">
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{cohorteNombre}</h1>
            {cohorteActiva && (
              <span className="bg-red-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg">Activa</span>
            )}
          </div>
        </div>

        {/* Notification panels */}
        <div className="space-y-2 mb-4">
          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800">{successMessage}</div>
          )}
          {localErrorMessage && (
            <div className="p-3 rounded-lg bg-red-100 border border-red-200 text-red-700">{localErrorMessage}</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 animate-fade-in-up delay-100">
            <div className="text-xs text-neutral-400 mb-1">Aspirantes admitidos / cupos</div>
            <div className="text-3xl font-bold text-red-700">{totalAdmitidos}/{cuposDisponibles}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 animate-fade-in-up delay-200">
            <div className="text-xs text-neutral-400 mb-1">Por admitir</div>
            <div className="text-3xl font-bold text-amber-400">
              {Math.max(aspirantesFiltrados.filter((a) => !a.admitido).length, 0)}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 animate-fade-in-up delay-300">
            <div className="text-xs text-neutral-400 mb-1">Completamente calificados</div>
            <div className="text-3xl font-bold text-green-700">{aspirantes.filter((a) => a.completamenteCalificado).length}</div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-3 mb-6 animate-fade-in-up delay-400">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar aspirante por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent bg-white"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-neutral-200 transition-colors bg-white"
            >
              <FunnelIcon className="w-5 h-5 text-neutral-400" />
              <span className="text-sm font-medium text-gray-700">Filtrar</span>
            </button>
            {mostrarFiltros && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 animate-dropdown-in">
                <div className="p-2">
                  <div className="text-xs font-semibold text-neutral-400 uppercase px-3 py-2">Estado de admisión</div>
                  {([
                    ['todos', 'Todos'],
                    ['admitidos', 'Admitidos'],
                    ['porAdmitir', 'Por admitir'],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => {
                        setFiltroAdmision(value as FiltroAdmision);
                        setMostrarFiltros(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-neutral-200 ${
                        filtroAdmision === value ? 'bg-red-100 text-red-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-fade-in-up delay-500">
          {rankingLoading ? (
            <div className="p-12 text-center text-neutral-400 flex flex-col items-center gap-3">
              <ArrowPathIcon className="w-6 h-6 animate-spin text-neutral-400" />
              <div className="text-sm">Cargando ranking...</div>
            </div>
          ) : aspirantesFiltrados.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">
              No hay aspirantes por admitir.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-neutral-200 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400">Ranking</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400">Nombre</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400">Correo</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-400">Puntaje</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-neutral-400">Admisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {aspirantesFiltrados.map((aspirante) => (
                  <tr key={aspirante.id} className={`transition-colors ${aspirante.admitido ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-neutral-200'}`}>
                    <td className="px-6 py-4 text-sm"><span className="font-bold text-red-700 text-base">#{aspirante.ranking}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-900">{aspirante.nombre}</td>
                    <td className="px-6 py-4 text-sm text-neutral-400">{aspirante.correo}</td>
                    <td className="px-6 py-4 text-sm"><span className="font-semibold text-red-700 text-base">{aspirante.puntaje.toFixed(1)}</span></td>
                    <td className="px-6 py-4 text-center">
                      {aspirante.admitido ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="inline-flex items-center gap-2 bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded-lg">
                            <CheckCircleIcon className="w-4 h-4" />
                            Admitido
                          </span>
                          <button
                            onClick={() => handleQuitarAdmision(aspirante)}
                            disabled={procesando}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-60 transition-colors"
                          >
                            <ArrowPathIcon className="w-4 h-4 text-white" />
                            Revertir
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAdmitir(aspirante)}
                          className="px-4 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-60"
                          disabled={totalAdmitidos >= cuposDisponibles || procesando}
                        >
                          Admitir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {mostrarConfirmacion && aspiranteObjetivo && (
          <div className={`fixed inset-0 bg-black/20 flex items-center justify-center z-50 px-4 ${confirmacionCerrando ? 'animate-overlay-out' : 'animate-overlay-in'}`}>
            <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full ${confirmacionCerrando ? 'animate-modal-out' : 'animate-modal-in'}`}>
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {aspiranteObjetivo.admitido ? 'Quitar admisión' : 'Confirmar admisión'}
                </h3>
                <button onClick={cancelarAccion} className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-400">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-700">
                  {aspiranteObjetivo.admitido
                    ? `¿Deseas quitar la admisión a ${aspiranteObjetivo.nombre}?`
                    : `¿Deseas admitir a ${aspiranteObjetivo.nombre}?`}
                </p>
                {!aspiranteObjetivo.admitido && totalAdmitidos >= cuposDisponibles && (
                  <div className="mt-3 text-sm text-amber-400 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">
                    No hay cupos disponibles.
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button onClick={cancelarAccion} className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium">
                  Cancelar
                </button>
                <button
                  onClick={confirmarAccion}
                  disabled={procesando || (!aspiranteObjetivo.admitido && totalAdmitidos >= cuposDisponibles)}
                  className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {procesando ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
