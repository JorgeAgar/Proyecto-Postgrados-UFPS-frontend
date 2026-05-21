import { useEffect, useMemo, useState } from 'react';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  admitirAspirante,
  fetchRankingAdmitidos,
  revertirAdmision,
  type AspiranteRankingItem,
  type FiltroAdmision,
} from '../../services/programa/programaAdmitidosService';

export default function ProgramaAdmitidos() {
  const [loading, setLoading] = useState(true);
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
  const [aspirantes, setAspirantes] = useState<AspiranteRankingItem[]>([]);

  const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ufps_programa_session') || '{}') : {};
  const programaId = session.programaId ?? session.userId ?? 'me';

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRankingAdmitidos(String(programaId));
        setCohorteNombre(data.cohorteActual.nombre);
        setCohorteActiva(data.cohorteActual.activa);
        setCuposDisponibles(data.cohorteActual.cuposDisponibles);
        setTotalAdmitidos(data.cohorteActual.totalAdmitidos);
        setAspirantes(data.aspirantes);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la lista de admitidos.');
      } finally {
        setLoading(false);
      }
    })();
  }, [programaId]);

  const aspirantesFiltrados = useMemo(() => {
    return aspirantes.filter((aspirante) => {
      const coincideBusqueda = aspirante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || aspirante.correo.toLowerCase().includes(searchTerm.toLowerCase());
      const coincideAdmision =
        filtroAdmision === 'todos' ||
        (filtroAdmision === 'admitidos' && aspirante.admitido) ||
        (filtroAdmision === 'por admitir' && !aspirante.admitido);
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
        await revertirAdmision(String(programaId), aspiranteObjetivo.id);
        setAspirantes((prev) => prev.map((a) => (a.id === aspiranteObjetivo.id ? { ...a, admitido: false } : a)));
        setTotalAdmitidos((prev) => Math.max(prev - 1, 0));
      } else {
        await admitirAspirante(String(programaId), aspiranteObjetivo.id);
        if (totalAdmitidos >= cuposDisponibles) {
          alert('No hay cupos disponibles para admitir más aspirantes.');
          return;
        }
        setAspirantes((prev) => prev.map((a) => (a.id === aspiranteObjetivo.id ? { ...a, admitido: true } : a)));
        setTotalAdmitidos((prev) => prev + 1);
      }
      setConfirmacionCerrando(true);
      setTimeout(() => {
        setMostrarConfirmacion(false);
        setAspiranteObjetivo(null);
        setConfirmacionCerrando(false);
      }, 170);
    } catch (err) {
      console.error(err);
      alert('No se pudo completar la operación de admisión.');
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

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-7xl mx-auto bg-white border border-gray-200 rounded-lg p-6 text-neutral-400">Cargando ranking de admitidos...</div>
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

  return (
    <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <h1 className="text-xl font-bold text-gray-900">{cohorteNombre}</h1>
          {cohorteActiva && <span className="bg-red-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg">Activa</span>}
          <button
            onClick={() => window.location.reload()}
            className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refrescar
          </button>
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
                  {[
                    ['todos', 'Todos'],
                    ['admitidos', 'Admitidos'],
                    ['por admitir', 'Por admitir'],
                  ].map(([value, label]) => (
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
                      <button
                        onClick={() => handleQuitarAdmision(aspirante)}
                        className="inline-flex items-center gap-2 bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:bg-green-800 transition-colors"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        Admitido
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAdmitir(aspirante)}
                        className="px-4 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800 transition-colors font-medium"
                        disabled={totalAdmitidos >= cuposDisponibles}
                      >
                        Admitir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
