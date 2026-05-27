import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { CohorteDetalle, DocumentoCohorte, CriterioItem, DocumentAssignItem } from '../../../services/programa/programaChortesService';
import type { CriterioEvaluacion } from '../../../services/programa/programaCriteriosService';
import { fetchCriteriosPrograma } from '../../../services/programa/programaCriteriosService';
import programaDocsService, { type RequiredDoc } from '../../../services/programa/programaDocsService';

function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <ArrowPathIcon className={`animate-spin ${className}`} />;
}

function genLocalId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeDocName(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ');
}

type LocalDocumento = DocumentoCohorte & { __localId?: string };

export default function CohorteDetalleView({
  cohorte,
  onBack,
  onSave,
  onToggleEstado,
  startEditing,
  hideEditControls,
  availableCriterios,
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
      criterios?: { id?: string | number; nombre?: string; peso?: number }[];
    }>
  ) => Promise<void>;
  availableCriterios?: CriterioEvaluacion[];
  onToggleEstado: (nextActiva: boolean) => Promise<void>;
  startEditing?: boolean;
  hideEditControls?: boolean;
}) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(() => Boolean(startEditing));
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingEstado, setIsTogglingEstado] = useState(false);
  const [editClosing, setEditClosing] = useState(false);
  const [isInscritosExpanded, setIsInscritosExpanded] = useState(false);
  const [isAdmitidosExpanded, setIsAdmitidosExpanded] = useState(false);
  const [availableCriteriosState, setAvailableCriteriosState] = useState<CriterioEvaluacion[] | undefined>(
    availableCriterios && availableCriterios.length > 0 ? availableCriterios : undefined
  );
  const [availableConsejoDocs, setAvailableConsejoDocs] = useState<RequiredDoc[] | undefined>(
    cohorte.documentosAsignados?.documentosConsejo && cohorte.documentosAsignados.documentosConsejo.length > 0
      ? cohorte.documentosAsignados.documentosConsejo
        .map((d) => ({ id: d.idDocrequisito ?? d.id, nombre: (d.nombre ?? '').toString() }))
        .filter((dd) => dd.nombre.trim().length > 0)
      : undefined
  );
  const [availableProgramaDocs, setAvailableProgramaDocs] = useState<RequiredDoc[] | undefined>(
    cohorte.documentosAsignados?.documentosPrograma && cohorte.documentosAsignados.documentosPrograma.length > 0
      ? cohorte.documentosAsignados.documentosPrograma
        .map((d) => ({ id: d.idDocrequisito ?? d.id, nombre: (d.nombre ?? '').toString() }))
        .filter((dd) => dd.nombre.trim().length > 0)
      : undefined
  );
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isLoadingCriterios, setIsLoadingCriterios] = useState(false);
  const [criterioError, setCriterioError] = useState<string | null>(null);

  // keep state in sync with prop when prop becomes available (important for create flow)
  useEffect(() => {
    // If parent provides criterios (non-empty), sync to local state
    if (availableCriterios && availableCriterios.length > 0) {
      setAvailableCriteriosState(availableCriterios);
      // inject ids into editedData criterios if they match by name
      setEditedData((prev) => {
        const merged = (prev.criterios ?? []).map((crit) => {
          const match = availableCriterios.find((r) => (r.id ?? r.nombre) === crit.id || String(r.nombre).trim().toLowerCase() === String(crit.nombre).trim().toLowerCase());
          return match ? { id: match.id ?? crit.id, nombre: crit.nombre, peso: crit.peso } : { ...crit };
        });
        return { ...prev, criterios: merged } as CohorteDetalle;
      });
      setIsLoadingCriterios(false);
    } else {
      // if parent has empty array and we don't have state yet, mark loading
      if (!availableCriteriosState) setIsLoadingCriterios(true);
    }
  }, [availableCriterios, availableCriteriosState]);
  const [editedData, setEditedData] = useState<CohorteDetalle>(() => ({
    ...cohorte,
    documentos: (cohorte.documentos ?? []).map((d: DocumentoCohorte & Partial<{ __localId: string }>) => ({ ...(d as LocalDocumento), __localId: (d as LocalDocumento).__localId ?? genLocalId() })),
  } as CohorteDetalle));
  const [detailError, setDetailError] = useState<string | null>(null);

  const documentosSeleccionables = useMemo(() => {
    const map = new Map<string, string>();
    // Include existing edited documents
    (editedData.documentos ?? []).forEach((doc) => {
      const nombre = doc.nombre?.trim();
      if (nombre) map.set(normalizeDocName(nombre), nombre);
    });
    // Also include program-level required docs (if provided via cohorte.documentosAsignados)
    if (cohorte.documentosAsignados?.documentosPrograma) {
      cohorte.documentosAsignados.documentosPrograma.forEach((d) => {
        const nombre = (d.nombre ?? '').toString().trim();
        if (nombre) map.set(normalizeDocName(nombre), nombre);
      });
    }
    // include fetched available program docs when editing
    if (availableProgramaDocs) {
      availableProgramaDocs.forEach((d) => {
        const nombre = (d.nombre ?? '').toString().trim();
        if (nombre) map.set(normalizeDocName(nombre), nombre);
      });
    }
    // include fetched consejo docs as well (so they appear selected if present)
    if (availableConsejoDocs) {
      availableConsejoDocs.forEach((d) => {
        const nombre = (d.nombre ?? '').toString().trim();
        if (nombre) map.set(normalizeDocName(nombre), nombre);
      });
    }
    return Array.from(map.values());
  }, [editedData.documentos, cohorte.documentosAsignados?.documentosPrograma, availableProgramaDocs, availableConsejoDocs]);

  const selectedDocsMap = useMemo(() => {
    const selected = new Set((editedData.documentos ?? []).map((doc) => normalizeDocName(doc.nombre ?? '')));
    return documentosSeleccionables.reduce<Record<string, boolean>>((acc, doc) => {
      acc[doc] = selected.has(normalizeDocName(doc));
      return acc;
    }, {});
  }, [documentosSeleccionables, editedData.documentos]);

  const closeEdit = (restore: boolean) => {
    setEditClosing(true);
    setTimeout(() => {
      if (restore) {
        setEditedData(cohorte);
      }
      setIsEditing(false);
      setDetailError(null);
      setEditClosing(false);
    }, 170);
  };

  const handleStartEdit = useCallback(async () => {
    setIsEditing(true);
    if (!availableCriteriosState || (Array.isArray(availableCriteriosState) && availableCriteriosState.length === 0)) {
      setIsLoadingCriterios(true);
      try {
        const cr = await fetchCriteriosPrograma();
        const resolved = cr ?? [];
        setAvailableCriteriosState(resolved);
        // If cohort already has criterios by name, attach their ids from resolved criterios so they appear selected
        setEditedData((prev) => {
          const existing = (prev.criterios ?? []).map((crit) => {
            const match = resolved.find((r) => (r.id ?? r.nombre) === crit.id || String(r.nombre).trim().toLowerCase() === String(crit.nombre).trim().toLowerCase());
            return match ? { id: match.id ?? crit.id, nombre: crit.nombre, peso: crit.peso } : { ...crit };
          });
          return { ...prev, criterios: existing } as CohorteDetalle;
        });
      } catch (err) {
        console.error('Error cargando criterios al iniciar edición', err);
      } finally {
        setIsLoadingCriterios(false);
      }
    }
    // load required documents for selection when editing
    if (!availableProgramaDocs || !availableConsejoDocs) {
      setIsLoadingDocs(true);
      try {
        const res = await programaDocsService.fetchRequiredDocuments();
        const consejo = (res.documentosConsejo ?? []).map((d) => ({ id: d.id, nombre: (d.nombre ?? '').toString() })).filter((dd) => dd.nombre.trim().length > 0);
        const programa = (res.documentosPrograma ?? []).map((d) => ({ id: d.id, nombre: (d.nombre ?? '').toString() })).filter((dd) => dd.nombre.trim().length > 0);
        setAvailableConsejoDocs(consejo);
        setAvailableProgramaDocs(programa);
        // ensure editedData.documentos contains assigned docs so checkboxes reflect selection
        setEditedData((prev) => {
          const byName = new Map<string, DocumentoCohorte>();
          (prev.documentos ?? []).forEach((doc) => {
            const nombre = (doc.nombre ?? '').toString().trim();
            if (nombre) byName.set(normalizeDocName(nombre), { nombre, obligatorio: Boolean(doc.obligatorio), __localId: (doc as LocalDocumento).__localId ?? genLocalId() } as DocumentoCohorte & { __localId?: string });
          });
          // add consejo docs as obligatorio (prefer fetched name, fallback to assigned item name)
          const consejoAssigned: DocumentAssignItem[] = cohorte.documentosAsignados?.documentosConsejo ?? [];
          consejoAssigned.forEach((pa) => {
            // try to find matching fetched consejo doc by id
            const match = consejo.find((d) => String(d.id) === String(pa.idDocrequisito ?? pa.id));
            const nombre = match ? String(match.nombre ?? '').trim() : String(pa.nombre ?? '').trim();
            if (nombre && !byName.has(normalizeDocName(nombre))) {
              byName.set(normalizeDocName(nombre), { nombre, obligatorio: true, __localId: genLocalId() } as DocumentoCohorte & { __localId?: string });
            }
          });
          // add programa docs (not obligatorio by default) - prefer fetched name by id
          const progAssigned: DocumentAssignItem[] = cohorte.documentosAsignados?.documentosPrograma ?? [];
          progAssigned.forEach((pa) => {
            const match = programa.find((d) => String(d.id) === String(pa.idDocrequisito ?? pa.id));
            const nombre = match ? String(match.nombre ?? '').trim() : String(pa.nombre ?? '').trim();
            if (nombre && !byName.has(normalizeDocName(nombre))) {
              byName.set(normalizeDocName(nombre), { nombre, obligatorio: false, __localId: genLocalId() } as DocumentoCohorte & { __localId?: string });
            }
          });
          return { ...prev, documentos: Array.from(byName.values()) } as CohorteDetalle;
        });
      } catch (err) {
        console.error('Error cargando documentos requeridos al iniciar edición', err);
      } finally {
        setIsLoadingDocs(false);
      }
    }
  }, [availableCriteriosState, availableProgramaDocs, availableConsejoDocs, cohorte]);

  // If component is mounted with `startEditing` true, start the edit flow (load docs/criterios)
  useEffect(() => {
    if (startEditing) {
      // fire-and-forget
      void handleStartEdit();
    }
  }, [startEditing, handleStartEdit]);

  const handleSave = async () => {
    setDetailError(null);

    const documentosSincronizados = (editedData.documentos ?? []).map((doc) => ({
      ...doc,
      nombre: (doc.nombre ?? '').trim(),
    }));

    if (Number(editedData.cupos) < 0) {
      setDetailError('Los cupos no pueden ser negativos.');
      return;
    }
    if (documentosSincronizados.some((doc) => !doc.nombre.trim())) {
      setDetailError('Todos los documentos deben tener nombre.');
      return;
    }
    if (documentosSincronizados.length === 0) {
      setDetailError('Selecciona al menos un documento requerido para la cohorte.');
      return;
    }

    setIsSaving(true);
    try {
      setEditedData((prev) => ({ ...prev, documentos: documentosSincronizados }));
      // validate criterios exact 100 if any selected
      const criteriosSelected = editedData.criterios ?? [];
      if (criteriosSelected.length > 0) {
        const total = (criteriosSelected ?? []).reduce((s, c: CriterioItem) => s + (Number(c.peso ?? 0) || 0), 0);
        if (total !== 100) {
          setDetailError('La suma de los puntos de criterios debe ser exactamente 100.');
          setIsSaving(false);
          return;
        }
      }

      await onSave({
        cupos: editedData.cupos,
        fechaLimiteDocumentos: editedData.fechaLimiteDocumentos,
        fechaLimitePago: editedData.fechaLimitePago,
        nombre: editedData.nombre,
        fechaInicio: editedData.fechaInicio,
        documentos: documentosSincronizados,
        criterios: editedData.criterios,
      });
      closeEdit(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleEstado = async () => {
    setDetailError(null);
    const nextActiva = !editedData.activa;
    setIsTogglingEstado(true);
    try {
      await onToggleEstado(nextActiva);
      setEditedData((prev) => ({ ...prev, activa: nextActiva }));
    } finally {
      setIsTogglingEstado(false);
    }
  };

  

  const setDocumentoSeleccion = (nombre: string, checked: boolean) => {
    const normalized = normalizeDocName(nombre);
    setEditedData((prev) => {
      const documentos = [...(prev.documentos ?? [])];
      const index = documentos.findIndex((doc) => normalizeDocName(doc.nombre ?? '') === normalized);

      if (checked && index === -1) {
        documentos.push({ nombre, obligatorio: false, __localId: genLocalId() } as LocalDocumento);
      }

      if (!checked && index !== -1) {
        documentos.splice(index, 1);
      }

      return { ...prev, documentos };
    });
  };

  const criterioSeleccionadoMap = useMemo(() => {
    const map = new Map<string | number, { id?: string | number; nombre: string; peso: number }>();
    (editedData.criterios ?? []).forEach((c: CriterioItem) => {
      map.set(c.id ?? c.nombre, { id: c.id, nombre: c.nombre, peso: c.peso });
    });
    return map;
  }, [editedData.criterios]);

  const totalPeso = useMemo(() => (editedData.criterios ?? []).reduce((s, c: CriterioItem) => s + (Number(c.peso ?? 0) || 0), 0), [editedData.criterios]);

  // validate criterios total (must not exceed 100)
  useEffect(() => {
    if ((editedData.criterios ?? []).length > 0) {
      if (totalPeso > 100) setCriterioError('La suma de los puntos de criterios no puede ser mayor a 100.');
      else if (totalPeso < 100) setCriterioError('La suma de los puntos de criterios debe ser exactamente 100.');
      else setCriterioError(null);
    } else {
      setCriterioError(null);
    }
  }, [totalPeso, editedData.criterios]);

  const toggleCriterioSeleccion = (c: CriterioEvaluacion, checked: boolean) => {
    setEditedData((prev) => {
      const criterios = [...(prev.criterios ?? [])];
      const index = criterios.findIndex((it: CriterioItem) => (it.id ?? it.nombre) === (c.id ?? c.nombre));
      if (checked && index === -1) {
        criterios.push({ id: c.id, nombre: c.nombre, peso: c.peso });
      }
      if (!checked && index !== -1) {
        criterios.splice(index, 1);
      }
      return { ...prev, criterios } as CohorteDetalle;
    });
  };

  const setPesoCriterio = (criterioId: string | number, peso: number) => {
    setEditedData((prev) => ({
      ...prev,
      criterios: (prev.criterios ?? []).map((c: CriterioItem) => ((c.id ?? c.nombre) === criterioId ? { ...c, peso } : c)),
    } as CohorteDetalle));
  };

  // If this view is used as the creation inline form, cancel should go back
  const handleCancelOrBack = () => {
    if (hideEditControls) {
      // creation flow: go back to list
      onBack();
      return;
    }
    closeEdit(true);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="max-w-5xl mx-auto">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors animate-fade-in">
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="font-medium">Volver a Cohortes</span>
        </button>

        <div className="flex items-center justify-between mb-6 animate-fade-in delay-75">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{editedData.nombre}</h1>
            {editedData.activa && <span className="bg-red-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg">Activa</span>}
          </div>

          <div className="flex items-center gap-3">
            {!isEditing && !hideEditControls && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>Editar cohorte</span>
              </button>
            )}

            {!hideEditControls && (
              <button
                onClick={handleToggleEstado}
                disabled={isTogglingEstado}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                  editedData.activa
                    ? 'bg-neutral-200 text-gray-800 hover:bg-neutral-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isTogglingEstado ? <Spinner className="h-4 w-4" /> : null}
                <span>
                  {isTogglingEstado
                    ? 'Actualizando estado...'
                    : editedData.activa
                      ? 'Cerrar cohorte'
                      : 'Abrir cohorte'}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-fade-in-up delay-150">

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
                <h2 className="text-sm font-semibold text-gray-800">Documentos requeridos</h2>
                {((editedData.documentos ?? []).length ?? 0) > 0 && (
                  <span className="text-xs font-semibold text-red-700 bg-red-100 border border-red-200 rounded-lg px-2.5 py-1">
                    {(editedData.documentos ?? []).length} seleccionados
                  </span>
                )}
              </div>

            {isEditing ? (
              <div className="space-y-4">
                {(isLoadingDocs ? [] : (availableConsejoDocs ?? cohorte.documentosAsignados?.documentosConsejo)) && (isLoadingDocs ? true : ((availableConsejoDocs ?? cohorte.documentosAsignados?.documentosConsejo)!.length > 0)) && (
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Documentos del Consejo (obligatorios)</div>
                    <div className="space-y-2 mb-4">
                      {(isLoadingDocs ? Array.from({ length: 1 }) : (availableConsejoDocs ?? cohorte.documentosAsignados?.documentosConsejo ?? [])).map((d, idx) => (
                        isLoadingDocs ? (
                          <div key={`con-loading-${idx}`} className="flex items-center gap-3 p-3 rounded-lg border border-transparent bg-neutral-50 shadow-sm">
                            <Spinner className="h-4 w-4 text-neutral-400" />
                            <div className="text-sm text-neutral-500">Cargando documentos del consejo...</div>
                          </div>
                        ) : (
                          <div key={(d as RequiredDoc).id} className="flex items-center gap-3 p-3 rounded-lg border border-transparent bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 border-l-4 border-l-red-200">
                            <DocumentTextIcon className="w-5 h-5 text-neutral-400" />
                            <div className="text-sm text-gray-900">{(d as RequiredDoc).nombre}</div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {cohorte.documentosAsignados?.documentosPrograma && cohorte.documentosAsignados.documentosPrograma.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Documentos del Programa (seleccionables)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {(isLoadingDocs ? Array.from({ length: 2 }) : (availableProgramaDocs ?? cohorte.documentosAsignados?.documentosPrograma ?? [])).map((d, idx) => {
                                    if (isLoadingDocs) return (
                                      <div key={`prog-loading-${idx}`} className="flex items-center gap-3 rounded-lg border border-transparent p-3 bg-neutral-50 shadow-sm">
                                        <Spinner className="h-4 w-4 text-neutral-400" />
                                        <div className="text-sm text-neutral-500">Cargando documentos del programa...</div>
                                      </div>
                                    );
                                    const nombre = ((d as RequiredDoc).nombre ?? '').toString().trim();
                                    return (
                                      <label
                                        key={`prog-edit-${(d as RequiredDoc).id ?? idx}`}
                                        className="flex items-center gap-3 rounded-lg border border-transparent p-3 bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 cursor-pointer border-l-4 border-l-gray-100"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={selectedDocsMap[nombre] ?? false}
                                          onChange={(e) => setDocumentoSeleccion(nombre, e.target.checked)}
                                          className="h-4 w-4"
                                        />
                                        <DocumentTextIcon className="w-5 h-5 text-neutral-400" />
                                        <span className="text-sm text-gray-900">{nombre}</span>
                                      </label>
                                    );
                                  })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {((editedData.documentos ?? [])?.length ?? 0) > 0 ? (
                  (editedData.documentos ?? []).map((doc: LocalDocumento, index) => (
                    <div
                      key={doc.__localId ?? index}
                      className={`flex items-center gap-3 p-3 rounded-lg border border-transparent bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 border-l-4 ${
                        doc.obligatorio ? 'border-l-red-200' : 'border-l-transparent'
                      }`}
                    >
                      <DocumentTextIcon className="w-5 h-5 text-neutral-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{doc.nombre}</div>
                      </div>
                      {doc.obligatorio ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">Obligatorio</span>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div>
                    {cohorte.documentosAsignados?.documentosConsejo && cohorte.documentosAsignados.documentosConsejo.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Documentos del Consejo</div>
                        <div className="space-y-2">
                          {cohorte.documentosAsignados.documentosConsejo.map((d) => (
                            <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-transparent bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 border-l-4 border-l-red-200">
                              <DocumentTextIcon className="w-5 h-5 text-neutral-400" />
                              <div className="text-sm text-gray-900">{d.nombre}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {cohorte.documentosAsignados?.documentosPrograma && cohorte.documentosAsignados.documentosPrograma.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Documentos del Programa</div>
                        <div className="space-y-2">
                          {cohorte.documentosAsignados.documentosPrograma.map((d) => (
                            <div key={`prog-${d.id}`} className="flex items-center gap-3 p-3 rounded-lg border border-transparent bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 border-l-4 border-l-gray-100">
                              <DocumentTextIcon className="w-5 h-5 text-neutral-400" />
                              <div className="text-sm text-gray-900">{d.nombre}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {detailError && <div className="mt-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">{detailError}</div>}

          <div className="mt-6">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Criterios de evaluación</h2>
            {isEditing ? (
              isLoadingCriterios ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 border border-gray-100">
                    <Spinner className="h-4 w-4 text-neutral-400" />
                    <div className="text-sm text-neutral-500">Cargando criterios...</div>
                  </div>
                </div>
              ) : availableCriteriosState && availableCriteriosState.length > 0 ? (
                <div className="space-y-2">
                  {availableCriteriosState.map((c: CriterioEvaluacion) => {
                    const selected = criterioSeleccionadoMap.has(c.id ?? c.nombre);
                    return (
                      <label key={`crit-${c.id}`} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-transparent bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 border-l-4 border-l-indigo-100 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={selected} onChange={(e) => toggleCriterioSeleccion(c, e.target.checked)} className="h-4 w-4" />
                          <SparklesIcon className="w-5 h-5 text-indigo-400" />
                          <div className="text-sm text-gray-900">{c.nombre}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={selected ? String((criterioSeleccionadoMap.get(c.id ?? c.nombre)?.peso) ?? c.peso) : String(c.peso)}
                            onChange={(e) => setPesoCriterio(c.id ?? c.nombre, Number(e.target.value) || 0)}
                            className="w-20 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-1"
                          />
                          <div className="text-sm text-neutral-600">pts</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                Array.isArray(editedData.criterios) && editedData.criterios.length > 0 ? (
                  <div className="space-y-2">
                    {editedData.criterios.map((crit: CriterioItem, idx) => (
                      <div key={`${crit.id ?? crit.nombre}-${idx}`} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-transparent bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 border-l-4 border-l-indigo-200">
                        <div className="flex items-center gap-3">
                          <SparklesIcon className="w-5 h-5 text-indigo-400" />
                          <div className="text-sm text-gray-900">{crit.nombre}</div>
                        </div>
                        <div className="text-sm text-neutral-600 font-semibold">{crit.peso} pts</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500">No hay criterios definidos para esta cohorte.</div>
                )
              )
            ) : (
              Array.isArray(editedData.criterios) && editedData.criterios.length > 0 ? (
                <div className="space-y-2">
                  {editedData.criterios.map((crit: CriterioItem, idx) => (
                    <div key={`${crit.id ?? crit.nombre}-${idx}`} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-transparent bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 border-l-4 border-l-indigo-200">
                      <div className="flex items-center gap-3">
                        <SparklesIcon className="w-5 h-5 text-indigo-400" />
                        <div className="text-sm text-gray-900">{crit.nombre}</div>
                      </div>
                      <div className="text-sm text-neutral-600 font-semibold">{crit.peso} pts</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-neutral-500">No hay criterios definidos para esta cohorte.</div>
              )
            )}
          </div>

          {criterioError && <div className="mt-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">{criterioError}</div>}

          {isEditing && (
            <div className={`flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 ${editClosing ? 'animate-modal-out' : 'animate-fade-in-up'}`}>
              <button disabled={isSaving} onClick={handleCancelOrBack} className="px-6 py-2 bg-white text-gray-700 text-sm border border-gray-200 rounded-lg hover:bg-neutral-200 transition-colors font-medium disabled:opacity-60">
                Cancelar
              </button>
              <button disabled={isSaving || Boolean(criterioError)} onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-60">
                {isSaving ? <Spinner className="h-4 w-4" /> : null}
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}
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
