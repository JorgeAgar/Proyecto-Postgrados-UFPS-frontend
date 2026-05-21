import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  createCohorte,
  fetchCohorteDetalle,
  fetchCohortes,
  updateCohorte,
  type CohorteDetalle,
  type CohorteItem,
} from '../../../services/programa/programaChortesService';

type ViewMode = 'list' | 'new' | 'detail';

type NewCohorteForm = {
  fechaInicio: string;
  cupos: string;
  fechaLimiteDocumentos: string;
  fechaLimitePago: string;
};

function CohortesList({
  cohortes,
  onSelect,
  onNueva,
}: {
  cohortes: CohorteItem[];
  onSelect: (cohorte: CohorteItem) => void;
  onNueva: () => void;
}) {
  return (
    <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <h1 className="text-xl font-bold text-gray-900">Cohortes</h1>
          <button
            onClick={onNueva}
            className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Nueva cohorte</span>
          </button>
        </div>

        <div className="space-y-4 animate-fade-in-up delay-100">
          {cohortes.map((cohorte) => (
            <button
              key={cohorte.id}
              onClick={() => onSelect(cohorte)}
              className="w-full text-left p-6 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className="text-xl font-semibold text-gray-900">{cohorte.nombre}</h2>
                    {cohorte.activa && (
                      <span className="bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded-lg">Activa</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-6 flex-wrap">
                      <div className="text-sm">
                        <span className="text-neutral-400">Inscritos: </span>
                        <span className="font-semibold text-red-700">{cohorte.inscritos}</span>
                      </div>
                      {cohorte.activa && cohorte.cupos !== undefined && (
                        <div className="text-sm">
                          <span className="text-neutral-400">Cupos: </span>
                          <span className="font-semibold text-red-700">{cohorte.cupos}</span>
                        </div>
                      )}
                      {!cohorte.activa && cohorte.admitidos !== undefined && (
                        <div className="text-sm">
                          <span className="text-neutral-400">Admitidos: </span>
                          <span className="font-semibold text-red-700">{cohorte.admitidos}</span>
                        </div>
                      )}
                    </div>

                    {cohorte.fechaLimiteDocumentos && cohorte.fechaLimitePago && (
                      <div className="flex gap-6 text-sm flex-wrap">
                        <div>
                          <span className="text-neutral-400">Fecha límite cargue documentos: </span>
                          <span className="font-semibold text-gray-800">{cohorte.fechaLimiteDocumentos}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Fecha límite pago inscripción: </span>
                          <span className="font-semibold text-gray-800">{cohorte.fechaLimitePago}</span>
                        </div>
                      </div>
                    )}
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

function NuevaCohorteView({ onBack, onCreate }: { onBack: () => void; onCreate: (payload: NewCohorteForm) => Promise<void> }) {
  const [formData, setFormData] = useState<NewCohorteForm>({
    fechaInicio: '',
    cupos: '',
    fechaLimiteDocumentos: '',
    fechaLimitePago: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(formData);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors animate-fade-in">
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="font-medium">Volver a Cohortes</span>
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6 animate-fade-in delay-75">Nueva Cohorte</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-8 animate-fade-in-up delay-150">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-6">Información general</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Nombre de la cohorte</label>
              <div className="w-full text-sm text-neutral-400 bg-neutral-200 border border-gray-200 rounded-lg px-3 py-2">Cohorte nueva</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Fecha de inicio</label>
              <input
                type="text"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                placeholder="DD/MM/YYYY"
                required
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Cupos</label>
              <input
                type="number"
                value={formData.cupos}
                onChange={(e) => setFormData({ ...formData, cupos: e.target.value })}
                placeholder="0"
                required
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Fecha límite cargue documentos</label>
              <input
                type="text"
                value={formData.fechaLimiteDocumentos}
                onChange={(e) => setFormData({ ...formData, fechaLimiteDocumentos: e.target.value })}
                placeholder="DD/MM/YYYY"
                required
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Fecha límite pago inscripción</label>
              <input
                type="text"
                value={formData.fechaLimitePago}
                onChange={(e) => setFormData({ ...formData, fechaLimitePago: e.target.value })}
                placeholder="DD/MM/YYYY"
                required
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
            <button type="button" onClick={onBack} className="px-6 py-2 bg-white text-gray-700 text-sm border border-gray-200 rounded-lg hover:bg-neutral-200 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" className="px-6 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium">
              Crear cohorte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CohorteDetalleView({
  cohorte,
  onBack,
  onSave,
}: {
  cohorte: CohorteDetalle;
  onBack: () => void;
  onSave: (payload: Partial<{ cupos: number; fechaLimiteDocumentos: string; fechaLimitePago: string; fechaInicio: string }>) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editClosing, setEditClosing] = useState(false);
  const [isInscritosExpanded, setIsInscritosExpanded] = useState(false);
  const [isAdmitidosExpanded, setIsAdmitidosExpanded] = useState(false);
  const [editedData, setEditedData] = useState(cohorte);

  const closeEdit = (restore: boolean) => {
    setEditClosing(true);
    setTimeout(() => {
      if (restore) setEditedData(cohorte);
      setIsEditing(false);
      setEditClosing(false);
    }, 170);
  };

  const handleSave = async () => {
    await onSave({
      cupos: editedData.cupos,
      fechaLimiteDocumentos: editedData.fechaLimiteDocumentos,
      fechaLimitePago: editedData.fechaLimitePago,
      fechaInicio: editedData.fechaInicio,
    });
    closeEdit(false);
  };

  const handleCancel = () => closeEdit(true);

  return (
    <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors animate-fade-in">
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="font-medium">Volver a Cohortes</span>
        </button>

        <div className="flex items-center justify-between mb-6 animate-fade-in delay-75">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{editedData.nombre}</h1>
            {editedData.activa && <span className="bg-red-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg">Activa</span>}
          </div>

          {!isEditing && editedData.activa && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium"
            >
              <PencilSquareIcon className="w-4 h-4" />
              <span>Editar cohorte</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-fade-in-up delay-150">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-6">Información general</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha de inicio</div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.fechaInicio}
                  onChange={(e) => setEditedData({ ...editedData, fechaInicio: e.target.value })}
                  className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
                />
              ) : (
                <div className="text-sm text-gray-900">{editedData.fechaInicio}</div>
              )}
            </div>

            {editedData.activa && editedData.cupos !== undefined && (
              <div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Cupos</div>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedData.cupos}
                    onChange={(e) => setEditedData({ ...editedData, cupos: Number(e.target.value) || 0 })}
                    className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{editedData.cupos}</div>
                )}
              </div>
            )}

            {editedData.fechaLimiteDocumentos && (
              <div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha límite cargue documentos</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.fechaLimiteDocumentos}
                    onChange={(e) => setEditedData({ ...editedData, fechaLimiteDocumentos: e.target.value })}
                    className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{editedData.fechaLimiteDocumentos}</div>
                )}
              </div>
            )}

            {editedData.fechaLimitePago && (
              <div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha límite pago inscripción</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedData.fechaLimitePago}
                    onChange={(e) => setEditedData({ ...editedData, fechaLimitePago: e.target.value })}
                    className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{editedData.fechaLimitePago}</div>
                )}
              </div>
            )}
          </div>

          {isEditing && (
            <div className={`flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 ${editClosing ? 'animate-modal-out' : 'animate-fade-in-up'}`}>
              <button onClick={handleCancel} className="px-6 py-2 bg-white text-gray-700 text-sm border border-gray-200 rounded-lg hover:bg-neutral-200 transition-colors font-medium">
                Cancelar
              </button>
              <button onClick={handleSave} className="px-6 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium">
                Guardar
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 mt-4 p-6 animate-fade-in-up delay-300">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Criterios de evaluación</h2>
          <div className="space-y-3">
            {editedData.criterios.map((criterio, index) => (
              <div key={`${criterio.nombre}-${index}`} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                <span className="text-sm text-gray-900">{criterio.nombre}</span>
                <span className="text-sm font-semibold text-red-700">{criterio.peso}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 mt-4 animate-fade-in-up delay-400">
          <button onClick={() => setIsInscritosExpanded(!isInscritosExpanded)} className="w-full flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Inscritos</h2>
              <span className="text-sm font-semibold text-gray-900">({editedData.inscritosData.length})</span>
            </div>
            <ChevronDownIcon className={`text-neutral-400 transition-transform w-5 h-5 ${isInscritosExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isInscritosExpanded && (
            <div className="border-t border-gray-200 overflow-x-auto animate-accordion-open">
              <table className="w-full min-w-175">
                <thead className="bg-neutral-200 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400">Nombre</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400">Cédula</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400">Correo</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {editedData.inscritosData.map((inscrito) => (
                    <tr key={inscrito.id} className="hover:bg-neutral-200 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-900">{inscrito.nombre}</td>
                      <td className="px-6 py-3 text-sm text-neutral-400">{inscrito.cedula}</td>
                      <td className="px-6 py-3 text-sm text-neutral-400">{inscrito.correo}</td>
                      <td className="px-6 py-3 text-sm">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium">
                          <DocumentTextIcon className="w-3.5 h-3.5" />
                          Ver documentos
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!editedData.activa && editedData.admitidosData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 mt-4 animate-fade-in-up delay-500">
            <button onClick={() => setIsAdmitidosExpanded(!isAdmitidosExpanded)} className="w-full flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Admitidos</h2>
                <span className="text-sm font-semibold text-gray-900">({editedData.admitidosData.length})</span>
              </div>
              <ChevronDownIcon className={`text-neutral-400 transition-transform w-5 h-5 ${isAdmitidosExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isAdmitidosExpanded && (
              <div className="border-t border-gray-200 overflow-x-auto animate-accordion-open">
                <table className="w-full min-w-175">
                  <thead className="bg-neutral-200 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400">Nombre</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400">Cédula</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400">Correo</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-400">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {editedData.admitidosData.map((admitido) => (
                      <tr key={admitido.id} className="hover:bg-neutral-200 transition-colors">
                        <td className="px-6 py-3 text-sm text-gray-900">{admitido.nombre}</td>
                        <td className="px-6 py-3 text-sm text-neutral-400">{admitido.cedula}</td>
                        <td className="px-6 py-3 text-sm text-neutral-400">{admitido.correo}</td>
                        <td className="px-6 py-3 text-sm">
                          <button className="flex items-center gap-2 px-3 py-1.5 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium">
                            <DocumentTextIcon className="w-3.5 h-3.5" />
                            Ver documentos
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Cohortes() {
  const [view, setView] = useState<ViewMode>('list');
  const [cohortes, setCohortes] = useState<CohorteItem[]>([]);
  const [selectedCohorteId, setSelectedCohorteId] = useState<string | null>(null);
  const [selectedDetalle, setSelectedDetalle] = useState<CohorteDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const session = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ufps_programa_session') || '{}') : {};
  const programaId = session.programaId ?? session.userId ?? 'me';
  const idUsuario = session.userId ?? 'me';

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const list = await fetchCohortes(String(idUsuario));
        setCohortes(list);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la lista de cohortes.');
      } finally {
        setLoading(false);
      }
    })();
  }, [programaId]);

  useEffect(() => {
    if (!selectedCohorteId || view !== 'detail') return;
    (async () => {
      try {
        const detail = await fetchCohorteDetalle(selectedCohorteId);
        setSelectedDetalle(detail);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedCohorteId, view]);

  const selectedCohorte = useMemo(
    () => cohortes.find((c) => c.id === selectedCohorteId) || null,
    [cohortes, selectedCohorteId],
  );

  const handleSelectCohorte = (cohorte: CohorteItem) => {
    setSelectedCohorteId(cohorte.id);
    setView('detail');
  };

  const handleCreateCohorte = async (payload: NewCohorteForm) => {
    try {
      const created = await createCohorte(String(programaId), {
        fechaInicio: payload.fechaInicio,
        cupos: Number(payload.cupos),
        fechaLimiteDocumentos: payload.fechaLimiteDocumentos,
        fechaLimitePago: payload.fechaLimitePago,
      });
      setCohortes((prev) => [created, ...prev]);
      setView('list');
    } catch (err) {
      console.error(err);
      alert('No se pudo crear la cohorte');
    }
  };

  const handleSaveDetalle = async (payload: Partial<{ cupos: number; fechaLimiteDocumentos: string; fechaLimitePago: string; fechaInicio: string }>) => {
    if (!selectedCohorteId) return;
    try {
      const updated = await updateCohorte(selectedCohorteId, payload);
      setCohortes((prev) => prev.map((c) => (c.id === selectedCohorteId ? { ...c, ...updated } : c)));
      setSelectedDetalle((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar la cohorte');
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-lg p-6 text-neutral-400">Cargando cohortes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-5xl mx-auto bg-red-100 border border-red-200 rounded-lg p-6 text-red-700">{error}</div>
      </div>
    );
  }

  if (view === 'new') {
    return <NuevaCohorteView onBack={() => setView('list')} onCreate={handleCreateCohorte} />;
  }

  if (view === 'detail' && selectedDetalle) {
    return <CohorteDetalleView cohorte={selectedDetalle} onBack={() => setView('list')} onSave={handleSaveDetalle} />;
  }

  if (view === 'detail' && selectedCohorte && !selectedDetalle) {
    return (
      <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-lg p-6 text-neutral-400">Cargando detalle de cohorte...</div>
      </div>
    );
  }

  return <CohortesList cohortes={cohortes} onSelect={handleSelectCohorte} onNueva={() => setView('new')} />;
}
