import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  DocumentTextIcon,
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

export default function EditarCohorte({
  cohorte,
  onCancel,
  onSaved,
  availableCriterios: parentCriterios,
}: {
  cohorte: CohorteDetalle;
  onCancel: () => void;
  onSaved: (payload: Partial<{ cupos: number; fechaLimiteDocumentos: string; fechaLimitePago: string; nombre: string; fechaInicio: string; activa: boolean; documentos: DocumentoCohorte[]; criterios?: { id?: string | number; nombre?: string; peso?: number }[]; }>) => Promise<void>;
  availableCriterios?: CriterioEvaluacion[];
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [editClosing, setEditClosing] = useState(false);
  const [availableCriteriosState, setAvailableCriteriosState] = useState<CriterioEvaluacion[] | undefined>(
    parentCriterios && parentCriterios.length > 0 ? parentCriterios : undefined
  );
  const [availableConsejoDocs, setAvailableConsejoDocs] = useState<RequiredDoc[] | undefined>(
    cohorte.documentosAsignados?.documentosConsejo && cohorte.documentosAsignados.documentosConsejo.length > 0
      ? cohorte.documentosAsignados.documentosConsejo.map((d) => ({ id: d.idDocrequisito ?? d.id, nombre: (d.nombre ?? '').toString() })).filter((dd) => dd.nombre.trim().length > 0)
      : undefined
  );
  const [availableProgramaDocs, setAvailableProgramaDocs] = useState<RequiredDoc[] | undefined>(
    cohorte.documentosAsignados?.documentosPrograma && cohorte.documentosAsignados.documentosPrograma.length > 0
      ? cohorte.documentosAsignados.documentosPrograma.map((d) => ({ id: d.idDocrequisito ?? d.id, nombre: (d.nombre ?? '').toString() })).filter((dd) => dd.nombre.trim().length > 0)
      : undefined
  );
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isLoadingCriterios, setIsLoadingCriterios] = useState(false);
  const [criterioError, setCriterioError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [editedData, setEditedData] = useState<CohorteDetalle>(() => ({
    ...cohorte,
    documentos: (cohorte.documentos ?? []).map((d: DocumentoCohorte & Partial<{ __localId: string }>) => ({ ...(d as LocalDocumento), __localId: (d as LocalDocumento).__localId ?? genLocalId() })),
  } as CohorteDetalle));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!availableCriteriosState || availableCriteriosState.length === 0) {
        setIsLoadingCriterios(true);
        try {
          const cr = await fetchCriteriosPrograma();
          const resolved = cr ?? [];
          if (!mounted) return;
          setAvailableCriteriosState(resolved);
          setEditedData((prev) => {
            const existing = (prev.criterios ?? []).map((crit) => {
              const match = resolved.find((r) => (r.id ?? r.nombre) === crit.id || String(r.nombre).trim().toLowerCase() === String(crit.nombre).trim().toLowerCase());
              return match ? { id: match.id ?? crit.id, nombre: crit.nombre, peso: crit.peso } : { ...crit };
            });
            return { ...prev, criterios: existing } as CohorteDetalle;
          });
        } catch (err) {
          console.error('Error cargando criterios', err);
        } finally {
          setIsLoadingCriterios(false);
        }
      }

      if (!availableProgramaDocs || !availableConsejoDocs) {
        setIsLoadingDocs(true);
        try {
          const res = await programaDocsService.fetchRequiredDocuments();
          const consejo = (res.documentosConsejo ?? []).map((d) => ({ id: d.id, nombre: (d.nombre ?? '').toString() })).filter((dd) => dd.nombre.trim().length > 0);
          const programa = (res.documentosPrograma ?? []).map((d) => ({ id: d.id, nombre: (d.nombre ?? '').toString() })).filter((dd) => dd.nombre.trim().length > 0);
          if (!mounted) return;
          setAvailableConsejoDocs(consejo);
          setAvailableProgramaDocs(programa);

          setEditedData((prev) => {
            const byName = new Map<string, DocumentoCohorte>();
            (prev.documentos ?? []).forEach((doc) => {
              const nombre = (doc.nombre ?? '').toString().trim();
              if (nombre) byName.set(normalizeDocName(nombre), { nombre, obligatorio: Boolean(doc.obligatorio), __localId: (doc as LocalDocumento).__localId ?? genLocalId() } as DocumentoCohorte & { __localId?: string });
            });
            const consejoAssigned: DocumentAssignItem[] = cohorte.documentosAsignados?.documentosConsejo ?? [];
            consejoAssigned.forEach((pa) => {
              const match = consejo.find((d) => String(d.id) === String(pa.idDocrequisito ?? pa.id));
              const nombre = match ? String(match.nombre ?? '').trim() : String(pa.nombre ?? '').trim();
              if (nombre && !byName.has(normalizeDocName(nombre))) {
                byName.set(normalizeDocName(nombre), { nombre, obligatorio: true, __localId: genLocalId() } as DocumentoCohorte & { __localId?: string });
              }
            });
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
          console.error('Error cargando documentos', err);
        } finally {
          setIsLoadingDocs(false);
        }
      }
    };
    void load();
    return () => { mounted = false; };
  }, [availableCriteriosState, availableProgramaDocs, availableConsejoDocs, cohorte]);

  const documentosSeleccionables = useMemo(() => {
    const map = new Map<string, string>();
    (editedData.documentos ?? []).forEach((doc) => {
      const nombre = doc.nombre?.trim();
      if (nombre) map.set(normalizeDocName(nombre), nombre);
    });
    if (cohorte.documentosAsignados?.documentosPrograma) {
      cohorte.documentosAsignados.documentosPrograma.forEach((d) => {
        const nombre = (d.nombre ?? '').toString().trim();
        if (nombre) map.set(normalizeDocName(nombre), nombre);
      });
    }
    if (availableProgramaDocs) {
      availableProgramaDocs.forEach((d) => {
        const nombre = (d.nombre ?? '').toString().trim();
        if (nombre) map.set(normalizeDocName(nombre), nombre);
      });
    }
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

  const handleSave = useCallback(async () => {
    setDetailError(null);
    const documentosSincronizados = (editedData.documentos ?? []).map((doc) => ({ ...doc, nombre: (doc.nombre ?? '').trim() }));
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
      const criteriosSelected = editedData.criterios ?? [];
      if (criteriosSelected.length > 0) {
        const total = (criteriosSelected ?? []).reduce((s, c: CriterioItem) => s + (Number(c.peso ?? 0) || 0), 0);
        if (total !== 100) {
          setDetailError('La suma de los puntos de criterios debe ser exactamente 100.');
          setIsSaving(false);
          return;
        }
      }

      await onSaved({
        cupos: editedData.cupos,
        fechaLimiteDocumentos: editedData.fechaLimiteDocumentos,
        fechaLimitePago: editedData.fechaLimitePago,
        nombre: editedData.nombre,
        fechaInicio: editedData.fechaInicio,
        documentos: documentosSincronizados,
        criterios: editedData.criterios,
      });
      setEditClosing(true);
      setTimeout(() => onCancel(), 170);
    } finally {
      setIsSaving(false);
    }
  }, [editedData, onSaved, onCancel]);

  const handleCancelOrBack = () => {
    setEditClosing(true);
    setTimeout(() => {
      onCancel();
    }, 170);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-8 animate-fade-in-up delay-150 ${editClosing ? 'animate-modal-out' : ''}`}>
      {/* The editing UI is intentionally compact and matches CohorteDetalleView's editing appearance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
        <div>
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Nombre de la cohorte</div>
          <input type="text" value={editedData.nombre} onChange={(e) => setEditedData({ ...editedData, nombre: e.target.value })} className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2" placeholder="Nombre de la cohorte" />
        </div>
        <div>
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha de inicio</div>
          <input type="date" value={editedData.fechaInicio} onChange={(e) => setEditedData({ ...editedData, fechaInicio: e.target.value })} className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2" />
        </div>
        {editedData.activa && editedData.cupos !== undefined && (
          <div>
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Cupos</div>
            <input type="number" value={editedData.cupos} onChange={(e) => setEditedData({ ...editedData, cupos: Number(e.target.value) || 0 })} className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2" />
          </div>
        )}
        <div>
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha límite cargue documentos</div>
          <input type="date" value={editedData.fechaLimiteDocumentos} onChange={(e) => setEditedData({ ...editedData, fechaLimiteDocumentos: e.target.value })} className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2" />
        </div>
        <div>
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha límite pago inscripción</div>
          <input type="date" value={editedData.fechaLimitePago} onChange={(e) => setEditedData({ ...editedData, fechaLimitePago: e.target.value })} className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2" />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-semibold text-gray-800">Documentos requeridos</h2>
          {((editedData.documentos ?? []).length ?? 0) > 0 && (
            <span className="text-xs font-semibold text-red-700 bg-red-100 border border-red-200 rounded-lg px-2.5 py-1">{(editedData.documentos ?? []).length} seleccionados</span>
          )}
        </div>
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
                    <label key={`prog-edit-${(d as RequiredDoc).id ?? idx}`} className="flex items-center gap-3 rounded-lg border border-transparent p-3 bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 cursor-pointer border-l-4 border-l-gray-100">
                      <input type="checkbox" checked={selectedDocsMap[nombre] ?? false} onChange={(e) => setDocumentoSeleccion(nombre, e.target.checked)} className="h-4 w-4" />
                      <DocumentTextIcon className="w-5 h-5 text-neutral-400" />
                      <span className="text-sm text-gray-900">{nombre}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {detailError && <div className="mt-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">{detailError}</div>}

        <div className="mt-6">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Criterios de evaluación</h2>
          {isLoadingCriterios ? (
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
                      <input type="number" min={0} max={100} value={selected ? String((criterioSeleccionadoMap.get(c.id ?? c.nombre)?.peso) ?? c.peso) : String(c.peso)} onChange={(e) => setPesoCriterio(c.id ?? c.nombre, Number(e.target.value) || 0)} className="w-20 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-1" />
                      <div className="text-sm text-neutral-600">pts</div>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : Array.isArray(editedData.criterios) && editedData.criterios.length > 0 ? (
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
          )}
        </div>

        {criterioError && <div className="mt-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">{criterioError}</div>}

        <div className={`flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 ${editClosing ? 'animate-modal-out' : 'animate-fade-in-up'}`}>
          <button disabled={isSaving} onClick={handleCancelOrBack} className="px-6 py-2 bg-white text-gray-700 text-sm border border-gray-200 rounded-lg hover:bg-neutral-200 transition-colors font-medium disabled:opacity-60">Cancelar</button>
          <button disabled={isSaving || Boolean(criterioError)} onClick={handleSave} className="inline-flex items-center gap-2 px-6 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-60">{isSaving ? <Spinner className="h-4 w-4" /> : null}{isSaving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}
