import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router';
import {
  abrirCohorte,
  createCohorte,
  fetchCohorteDetalle,
  fetchCohortes,
  cerrarCohorte,
  updateCohorte,
  type DocumentoCohorte,
  type CohorteDetalle,
  type CohorteItem,
} from '../../../services/programa/programaChortesService';

function genLocalId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

type LocalDocumento = DocumentoCohorte & { __localId?: string };

function buildLocalDocumentoMap(documentos: Array<DocumentoCohorte | LocalDocumento>) {
  const map: Record<string, string> = {};
  documentos.forEach((doc, index) => {
    const localId = (doc as LocalDocumento).__localId ?? String(index);
    map[localId] = doc.nombre ?? '';
  });
  return map;
}

type ViewMode = 'list' | 'new' | 'detail';

type NewCohorteForm = {
  nombre: string;
  fechaInicio: string;
  cupos: string;
  fechaLimiteDocumentos: string;
  fechaLimitePago: string;
  documentos: { nombre: string; obligatorio: boolean }[];
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
                          <span className="font-semibold text-red-700">{cohorte.totalInscritos ?? cohorte.inscritos ?? 0}</span>
                      </div>
                        <div className="text-sm">
                          <span className="text-neutral-400">Cupos: </span>
                          <span className="font-semibold text-red-700">{cohorte.cupos}</span>
                        </div>
                    </div>

                      {(cohorte.fechaLimiteDocs || cohorte.fechaLimiteDocumentos) && (cohorte.fechaLimiteInscripcion || cohorte.fechaLimitePago) && (
                      <div className="flex gap-6 text-sm flex-wrap">
                        <div>
                          <span className="text-neutral-400">Fecha límite cargue documentos: </span>
                            <span className="font-semibold text-gray-800">{cohorte.fechaLimiteDocs || cohorte.fechaLimiteDocumentos}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Fecha límite pago inscripción: </span>
                            <span className="font-semibold text-gray-800">{cohorte.fechaLimiteInscripcion || cohorte.fechaLimitePago}</span>
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
    nombre: '',
    fechaInicio: '',
    cupos: '',
    fechaLimiteDocumentos: '',
    fechaLimitePago: '',
    documentos: [{ nombre: '', obligatorio: false }],
  });

  const updateDocumento = (index: number, value: Partial<{ nombre: string; obligatorio: boolean }>) => {
    setFormData((prev) => ({
      ...prev,
      documentos: prev.documentos.map((doc, i) => (i === index ? { ...doc, ...value } : doc)),
    }));
  };

  const addDocumento = () => {
    setFormData((prev) => ({
      ...prev,
      documentos: [...prev.documentos, { nombre: '', obligatorio: false }],
    }));
  };

  const removeDocumento = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;
    if (Number(formData.cupos) < 0) return;
    if (formData.documentos.some((doc) => !doc.nombre.trim())) return;
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
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Cohorte-30 2026-2"
                required
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Fecha de inicio</label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                required
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Cupos</label>
              <input
                type="number"
                min="0"
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
                type="date"
                value={formData.fechaLimiteDocumentos}
                onChange={(e) => setFormData({ ...formData, fechaLimiteDocumentos: e.target.value })}
                required
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 block">Fecha límite pago inscripción</label>
              <input
                type="date"
                value={formData.fechaLimitePago}
                onChange={(e) => setFormData({ ...formData, fechaLimitePago: e.target.value })}
                required
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Documentos requeridos</h2>
              <button type="button" onClick={addDocumento} className="text-sm font-medium text-red-700 hover:text-red-800">
                + Agregar documento
              </button>
            </div>

            <div className="space-y-3">
              {formData.documentos.map((doc, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center rounded-lg border border-gray-200 p-3">
                  <input
                    type="text"
                    value={doc.nombre}
                    onChange={(e) => updateDocumento(index, { nombre: e.target.value })}
                    placeholder="Nombre del documento"
                    className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700 px-2">
                    <input
                      type="checkbox"
                      checked={doc.obligatorio}
                      onChange={(e) => updateDocumento(index, { obligatorio: e.target.checked })}
                      className="h-4 w-4"
                    />
                    Obligatorio
                  </label>
                  <button type="button" onClick={() => removeDocumento(index)} className="text-sm text-gray-500 hover:text-red-700 justify-self-start md:justify-self-end">
                    Eliminar
                  </button>
                </div>
              ))}
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
  onToggleEstado,
  hasAnotherActiveCohorte,
}: {
  cohorte: CohorteDetalle;
  onBack: () => void;
  onSave: (
    payload: Partial<{
      cupos: number;
      fechaLimiteDocumentos: string;
      fechaLimitePago: string;
      nombre: string;
      fechaInicio: string;
      activa: boolean;
      documentos: DocumentoCohorte[];
    }>
  ) => Promise<void>;
  onToggleEstado: (nextActiva: boolean) => Promise<void>;
  hasAnotherActiveCohorte: boolean;
}) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editClosing, setEditClosing] = useState(false);
  const [isInscritosExpanded, setIsInscritosExpanded] = useState(false);
  const [isAdmitidosExpanded, setIsAdmitidosExpanded] = useState(false);
  const [editedData, setEditedData] = useState<CohorteDetalle>(() => ({
    ...cohorte,
    documentos: (cohorte.documentos ?? []).map((d: DocumentoCohorte & Partial<{ __localId: string }>) => ({ ...(d as LocalDocumento), __localId: (d as LocalDocumento).__localId ?? genLocalId() })),
  } as CohorteDetalle));
  const [localDocNames, setLocalDocNames] = useState<Record<string, string>>(() => buildLocalDocumentoMap(cohorte.documentos ?? []));
  const [detailError, setDetailError] = useState<string | null>(null);

  const commitDocumentoNombre = (index: number) => {
    setEditedData((prev) => {
      const documentos = [...(prev.documentos ?? [])];
      const current = documentos[index];
      if (!current) return prev;

      const localId = (current as LocalDocumento).__localId ?? String(index);
      const nombre = (localDocNames[localId] ?? current.nombre ?? '').trim();

      documentos[index] = { ...current, nombre };
      return { ...prev, documentos };
    });
  };

  const syncLocalNamesFromDocuments = (documentos: Array<DocumentoCohorte | LocalDocumento>) => {
    setLocalDocNames(buildLocalDocumentoMap(documentos));
  };

  const closeEdit = (restore: boolean) => {
    setEditClosing(true);
    setTimeout(() => {
      if (restore) {
        setEditedData(cohorte);
        syncLocalNamesFromDocuments(cohorte.documentos ?? []);
      }
      setIsEditing(false);
      setDetailError(null);
      setEditClosing(false);
    }, 170);
  };

  const handleSave = async () => {
    setDetailError(null);

    const documentosSincronizados = (editedData.documentos ?? []).map((doc, index) => {
      const localId = (doc as LocalDocumento).__localId ?? String(index);
      return {
        ...doc,
        nombre: (localDocNames[localId] ?? doc.nombre ?? '').trim(),
      };
    });

    if (Number(editedData.cupos) < 0) {
      setDetailError('Los cupos no pueden ser negativos.');
      return;
    }
    if (documentosSincronizados.some((doc) => !doc.nombre.trim())) {
      setDetailError('Todos los documentos deben tener nombre.');
      return;
    }

    setEditedData((prev) => ({ ...prev, documentos: documentosSincronizados }));
    await onSave({
      cupos: editedData.cupos,
      fechaLimiteDocumentos: editedData.fechaLimiteDocumentos,
      fechaLimitePago: editedData.fechaLimitePago,
      nombre: editedData.nombre,
      fechaInicio: editedData.fechaInicio,
      documentos: documentosSincronizados,
    });
    syncLocalNamesFromDocuments(documentosSincronizados);
    closeEdit(false);
  };

  const handleToggleEstado = async () => {
    setDetailError(null);
    const nextActiva = !editedData.activa;
    await onToggleEstado(nextActiva);
    setEditedData((prev) => ({ ...prev, activa: nextActiva }));
  };

  const updateDocumento = (index: number, value: Partial<DocumentoCohorte>) => {
    setEditedData((prev) => ({
      ...prev,
      documentos: (prev.documentos ?? []).map((doc, i) => (i === index ? { ...doc, ...value } : doc)),
    }));
  };

  const addDocumento = () => {
    setEditedData((prev) => ({
      ...prev,
      documentos: [...(prev.documentos ?? []), { nombre: '', obligatorio: false, __localId: genLocalId() } as LocalDocumento],
    }));
  };

  const removeDocumento = (index: number) => {
    setEditedData((prev) => ({
      ...prev,
      documentos: (prev.documentos ?? []).filter((_, i) => i !== index),
    }));
    setLocalDocNames((prev) => {
      const next = { ...prev };
      const current = editedData.documentos?.[index];
      if (current) {
        delete next[(current as LocalDocumento).__localId ?? String(index)];
      }
      return next;
    });
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

          <div className="flex items-center gap-3">
            {!isEditing && (
              <button
                onClick={() => {
                  syncLocalNamesFromDocuments(editedData.documentos ?? []);
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>Editar cohorte</span>
              </button>
            )}

            <button
              onClick={handleToggleEstado}
              disabled={!editedData.activa && hasAnotherActiveCohorte}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                editedData.activa
                  ? 'bg-neutral-200 text-gray-800 hover:bg-neutral-300'
                  : hasAnotherActiveCohorte
                    ? 'bg-emerald-300 text-white cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <span>{editedData.activa ? 'Cerrar cohorte' : hasAnotherActiveCohorte ? 'Hay otra cohorte activa' : 'Abrir cohorte'}</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-fade-in-up delay-150">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-6">Información general</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Nombre de la cohorte</div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.nombre}
                  onChange={(e) => setEditedData({ ...editedData, nombre: e.target.value })}
                  className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
                  placeholder="Nombre de la cohorte"
                />
              ) : (
                <div className="text-sm text-gray-900">{editedData.nombre}</div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha de inicio</div>
              {isEditing ? (
                <input
                  type="date"
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
                    type="date"
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
                    type="date"
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

          <div className="mt-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Documentos requeridos</h2>
              {isEditing && (
                <button type="button" onClick={addDocumento} className="text-sm font-medium text-red-700 hover:text-red-800">
                  + Agregar documento
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(editedData.documentos ?? []).map((doc: LocalDocumento, index) => (
                  <div key={doc.__localId ?? index} className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-center rounded-lg border border-gray-200 p-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={localDocNames[doc.__localId ?? String(index)] ?? doc.nombre}
                        onChange={(e) => setLocalDocNames((s) => ({ ...s, [doc.__localId ?? String(index)]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            commitDocumentoNombre(index);
                            e.currentTarget.blur();
                          }
                        }}
                        onBlur={() => commitDocumentoNombre(index)}
                        placeholder="Nombre del documento"
                        className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{doc.nombre}</div>
                    )}

                  {isEditing ? (
                    <label className="flex items-center gap-2 text-sm text-gray-700 px-2">
                      <input
                        type="checkbox"
                        checked={doc.obligatorio}
                        onChange={(e) => updateDocumento(index, { obligatorio: e.target.checked })}
                        className="h-4 w-4"
                      />
                      Obligatorio
                    </label>
                  ) : (
                    <span className={`text-sm font-semibold ${doc.obligatorio ? 'text-red-700' : 'text-gray-500'}`}>{doc.obligatorio ? 'Obligatorio' : 'Opcional'}</span>
                  )}

                  {isEditing ? (
                    <button type="button" onClick={() => removeDocumento(index)} className="text-sm text-gray-500 hover:text-red-700 justify-self-start md:justify-self-end">
                      Eliminar
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
          </div>

          {detailError && <div className="mt-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">{detailError}</div>}

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
                        <button
                          type="button"
                          onClick={() => navigate(`/programa/validacion/aspirantes/${cohorte.id}/${inscrito.id}`)}
                          className="flex items-center gap-2 px-3 py-1.5 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                        >
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
                          <button
                            type="button"
                            onClick={() => navigate(`/programa/validacion/aspirantes/${cohorte.id}/${admitido.id}`)}
                            className="flex items-center gap-2 px-3 py-1.5 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-xs font-medium"
                          >
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
  }, [idUsuario]);

  useEffect(() => {
    if (!selectedCohorteId || view !== 'detail') return;
    (async () => {
      try {
        const detail = await fetchCohorteDetalle(selectedCohorteId);
        // ensure documentos have stable local ids to avoid remounts
        const mapped: CohorteDetalle = {
          ...detail,
          documentos: (detail.documentos ?? []).map((d) => ({ ...(d as LocalDocumento), __localId: (d as LocalDocumento).__localId ?? genLocalId() })),
        } as CohorteDetalle;
        setSelectedDetalle(mapped);
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
        nombre: payload.nombre,
        fechaInicio: payload.fechaInicio,
        cupos: Number(payload.cupos),
        fechaLimiteDocumentos: payload.fechaLimiteDocumentos,
        fechaLimitePago: payload.fechaLimitePago,
        documentos: payload.documentos,
      });
      setCohortes((prev) => [created, ...prev]);
      setView('list');
    } catch (err) {
      console.error(err);
      alert('No se pudo crear la cohorte');
    }
  };

  const handleSaveDetalle = async (
      payload: Partial<{
        cupos: number;
        fechaLimiteDocumentos: string;
        fechaLimitePago: string;
        nombre: string;
        fechaInicio: string;
        activa: boolean;
        documentos: DocumentoCohorte[];
      }>
  ) => {
    if (!selectedCohorteId) return;
    try {
      const updated = await updateCohorte(selectedCohorteId, payload);
      // preserve __localId for documentos when merging backend response
      setCohortes((prev) => prev.map((c) => (c.id === selectedCohorteId ? { ...c, ...updated } : c)));
      setSelectedDetalle((prev) => {
        if (!prev) return (updated as unknown) as CohorteDetalle;
        const mergedDocs: LocalDocumento[] = (updated.documentos ?? []).map((d: DocumentoCohorte, i: number) => ({
          ...(d as LocalDocumento),
          __localId: (prev.documentos && prev.documentos[i] && (prev.documentos[i] as LocalDocumento).__localId) ?? genLocalId(),
        }));
        return { ...prev, ...updated, documentos: mergedDocs } as CohorteDetalle;
      });
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar la cohorte');
    }
  };

  const handleToggleEstadoDetalle = async (nextActiva: boolean) => {
    if (!selectedCohorteId || !selectedDetalle) return;

    if (nextActiva) {
      const hasAnotherActive = cohortes.some((cohorte) => cohorte.activa && cohorte.id !== selectedCohorteId);
      if (hasAnotherActive) {
        throw new Error('Solo se puede abrir una cohorte si no hay ninguna cohorte activa.');
      }
      const updated = await abrirCohorte(selectedCohorteId);
      setCohortes((prev) => prev.map((c) => (c.id === selectedCohorteId ? { ...c, ...updated } : c)));
    setSelectedDetalle((prev) => {
      if (!prev) return { ...(updated as Partial<CohorteDetalle>) } as CohorteDetalle;
      const mergedDocs: LocalDocumento[] = (updated.documentos ?? []).map((d: DocumentoCohorte, i: number) => ({
        ...(d as LocalDocumento),
        __localId: (prev.documentos && prev.documentos[i] && (prev.documentos[i] as LocalDocumento).__localId) ?? genLocalId(),
      }));
      return { ...prev, ...updated, documentos: mergedDocs } as CohorteDetalle;
    });
      return;
    }

    const updated = await cerrarCohorte(selectedCohorteId);
    setCohortes((prev) => prev.map((c) => (c.id === selectedCohorteId ? { ...c, ...updated } : c)));
    setSelectedDetalle((prev) => {
      if (!prev) return { ...(updated as Partial<CohorteDetalle>) } as CohorteDetalle;
      const mergedDocs: LocalDocumento[] = (updated.documentos ?? []).map((d: DocumentoCohorte, i: number) => ({
        ...(d as LocalDocumento),
        __localId: (prev.documentos && prev.documentos[i] && (prev.documentos[i] as LocalDocumento).__localId) ?? genLocalId(),
      }));
      return { ...prev, ...(updated as Partial<CohorteDetalle>), documentos: mergedDocs } as CohorteDetalle;
    });
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
    return (
      <CohorteDetalleView
        cohorte={selectedDetalle}
        onBack={() => setView('list')}
        onSave={handleSaveDetalle}
        onToggleEstado={handleToggleEstadoDetalle}
        hasAnotherActiveCohorte={cohortes.some((cohorte) => cohorte.activa && cohorte.id !== selectedDetalle.id)}
      />
    );
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
