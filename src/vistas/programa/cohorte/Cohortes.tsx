import React, { useEffect, useMemo, useState } from 'react';
import { PlusIcon, ArrowPathIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import CrearCohorte from './CrearCohorte';
import CohorteDetalleView from './CohorteDetalleView';
import {
  abrirCohorte,
  fetchCohorteDetalle,
  fetchCohortes,
  cerrarCohorte,
  updateCohorte,
  type DocumentoCohorte,
  type CohorteDetalle,
  type CohorteItem,
} from '../../../services/programa/programaChortesService';


function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <ArrowPathIcon className={`animate-spin ${className}`} />;
}

export default function Cohortes() {
  const [view, setView] = useState<'list' | 'new' | 'detail'>('list');
  const [cohortes, setCohortes] = useState<CohorteItem[]>([]);
  const [selectedCohorteId, setSelectedCohorteId] = useState<string | null>(null);
  const [selectedDetalle, setSelectedDetalle] = useState<CohorteDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchCohortes();
        setCohortes(list);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la lista de cohortes.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCohorteId || view !== 'detail') return;
    (async () => {
      try {
        setDetailLoading(true);
        const detail = await fetchCohorteDetalle(selectedCohorteId);
        setSelectedDetalle(detail);
      } catch (err) {
        console.error(err);
      } finally {
        setDetailLoading(false);
      }
    })();
  }, [selectedCohorteId, view]);

  const selectedCohorte = useMemo(() => cohortes.find((c) => c.id === selectedCohorteId) || null, [cohortes, selectedCohorteId]);

  const handleSelectCohorte = (cohorte: CohorteItem) => {
    setSelectedCohorteId(cohorte.id);
    setView('detail');
  };

  const refreshList = async () => {
    setLoading(true);
    try {
      const list = await fetchCohortes();
      setCohortes(list);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar la lista de cohortes.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetalle = async (payload: Partial<{ cupos: number; fechaLimiteDocumentos: string; fechaLimitePago: string; nombre: string; fechaInicio: string; activa: boolean; documentos: DocumentoCohorte[] }>) => {
    if (!selectedCohorteId) return;
    try {
      const updated = await updateCohorte(selectedCohorteId, payload);
      setCohortes((prev) => prev.map((c) => (c.id === selectedCohorteId ? { ...c, ...updated } : c)));
      setSelectedDetalle((prev) => (prev ? { ...prev, ...updated } as CohorteDetalle : updated as CohorteDetalle));
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar la cohorte.');
    }
  };

  const handleToggleEstadoDetalle = async (nextActiva: boolean) => {
    if (!selectedCohorteId || !selectedDetalle) return;
    try {
      if (nextActiva) {
        const updated = await abrirCohorte(selectedCohorteId);
        setCohortes((prev) => prev.map((c) => (c.id === selectedCohorteId ? { ...c, ...updated } : c)));
        setSelectedDetalle((prev) => (prev ? { ...prev, ...updated } as CohorteDetalle : updated as CohorteDetalle));
        return;
      }
      const updated = await cerrarCohorte(selectedCohorteId);
      setCohortes((prev) => prev.map((c) => (c.id === selectedCohorteId ? { ...c, ...updated } : c)));
      setSelectedDetalle((prev) => (prev ? { ...prev, ...updated } as CohorteDetalle : updated as CohorteDetalle));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="p-8 bg-gray-100 min-h-full">
      <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-lg p-6 text-neutral-400">
        <div className="flex items-center gap-3">
          <Spinner className="h-5 w-5 text-red-700" />
          <span>Cargando cohortes...</span>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 bg-gray-100 min-h-full">
      <div className="max-w-5xl mx-auto bg-red-100 border border-red-200 rounded-lg p-6 text-red-700">{error}</div>
    </div>
  );

  if (view === 'new') {
    return (
      <CrearCohorte
        onSaved={async () => {
          await refreshList();
          setView('list');
        }}
        onBack={async () => {
          await refreshList();
          setView('list');
        }}
      />
    );
  }

  if (view === 'detail' && selectedDetalle) {
    return (
      <CohorteDetalleView
        cohorte={selectedDetalle}
        onBack={() => setView('list')}
        onSave={handleSaveDetalle}
        onToggleEstado={handleToggleEstadoDetalle}
      />
    );
  }

  if (view === 'detail' && selectedCohorte && !selectedDetalle) {
    return (
      <div className="p-8 bg-gray-100 min-h-full">
        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-lg p-6 text-neutral-400">
          <div className="flex items-center gap-3">
            <Spinner className="h-5 w-5 text-red-700" />
            <span>{detailLoading ? 'Cargando detalle de cohorte...' : 'Preparando vista de cohorte...'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-full">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <h1 className="text-xl font-bold text-gray-900">Cohortes</h1>
          <button onClick={() => setView('new')} className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium">
            <PlusIcon className="w-4 h-4" />
            <span>Nueva cohorte</span>
          </button>
        </div>

        <div className="space-y-4 animate-fade-in-up delay-100">
          {cohortes.map((cohorte) => (
            <button key={cohorte.id} onClick={() => handleSelectCohorte(cohorte)} className="w-full text-left p-6 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xl font-semibold text-gray-900">{cohorte.nombre}</h2>
                    {cohorte.activa && <span className="bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded-lg">Activa</span>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-6 flex-wrap">
                      <div className="text-sm"><span className="text-neutral-400">Inscritos: </span><span className="font-semibold text-red-700">{cohorte.totalInscritos ?? cohorte.inscritos ?? 0}</span></div>
                      <div className="text-sm"><span className="text-neutral-400">Cupos: </span><span className="font-semibold text-red-700">{cohorte.cupos}</span></div>
                    </div>
                  </div>
                </div>
                <ChevronRightIcon className="text-neutral-400 shrink-0 mt-1 w-6 h-6" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
