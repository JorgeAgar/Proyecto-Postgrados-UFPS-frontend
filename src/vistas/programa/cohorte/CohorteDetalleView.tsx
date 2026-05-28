import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { CohorteDetalle, DocumentoCohorte, CriterioItem } from '../../../services/programa/programaChortesService';
import type { CriterioEvaluacion } from '../../../services/programa/programaCriteriosService';
import EditarCohorte from './EditarCohorte';

function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <ArrowPathIcon className={`animate-spin ${className}`} />;
}

export default function CohorteDetalleView({
  cohorte,
  onBack,
  onSave,
  onSaveConfirmed,
  onToggleEstado,
  availableCriterios = [],
}: {
  cohorte: CohorteDetalle;
  onBack?: () => void | Promise<void>;
  onSave: (payload: Partial<{ cupos: number; fechaLimiteDocumentos: string; fechaLimitePago: string; nombre: string; fechaInicio: string; activa?: boolean; documentosConsejo?: { idDocrequisito?: string | number; idCohorte?: string | number; nombre?: string }[]; documentosPrograma?: { idDocrequisito?: string | number; idCohorte?: string | number; nombre?: string }[]; criteriosCohorte?: { id?: string | number; idCriterio?: string | number; pesoSnapshot?: number }[] }>) => Promise<void> | void;
  onSaveConfirmed?: () => Promise<void> | void;
  onToggleEstado: (next: boolean) => Promise<void> | void;
  availableCriterios?: CriterioEvaluacion[];
}) {
  const navigate = useNavigate();
  const [editedData, setEditedData] = useState<CohorteDetalle>(cohorte);
  const [isEditing, setIsEditing] = useState(false);
  const [isTogglingEstado, setIsTogglingEstado] = useState(false);
  const [estadoError, setEstadoError] = useState<string | null>(null);
  const [isInscritosExpanded, setIsInscritosExpanded] = useState(true);
  const [isAdmitidosExpanded, setIsAdmitidosExpanded] = useState(false);

  useEffect(() => {
    setEditedData(cohorte);
    setEstadoError(null);
  }, [cohorte]);

  const totalCriterios = (editedData.criterios ?? []).reduce((acc, criterio) => acc + (Number(criterio.peso ?? 0) || 0), 0);

  const validarApertura = () => {
    if (Number(editedData.cupos ?? 0) <= 0) return 'La cohorte debe tener cupos mayores a 0 para poder abrirse.';
    if ((editedData.criterios ?? []).length === 0) return 'La cohorte debe tener al menos un criterio para poder abrirse.';
    if (totalCriterios !== 100) return 'La suma de los criterios debe ser exactamente 100 para poder abrir la cohorte.';
    return null;
  };

  const handleToggleEstado = async () => {
    if (!editedData.activa) {
      const validationError = validarApertura();
      if (validationError) {
        setEstadoError(validationError);
        return;
      }
    }

    setEstadoError(null);
    setIsTogglingEstado(true);
    try {
      const next = !editedData.activa;
      await onToggleEstado(next);
      setEditedData((p) => ({ ...(p as CohorteDetalle), activa: next }));
    } finally {
      setIsTogglingEstado(false);
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/programa/cohortes');
  };

  if (isEditing) {
    return (
      <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-5xl mx-auto">
          <button type="button" onClick={handleBack} className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors animate-fade-in">
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="font-medium">Volver a Cohortes</span>
          </button>

          <EditarCohorte
            cohorte={cohorte}
            onCancel={() => setIsEditing(false)}
            onSaved={async (payload) => {
              await onSave(payload as Partial<{ cupos: number; fechaLimiteDocumentos: string; fechaLimitePago: string; nombre: string; fechaInicio: string; activa?: boolean; documentosConsejo?: { idDocrequisito?: string | number; idCohorte?: string | number; nombre?: string }[]; documentosPrograma?: { idDocrequisito?: string | number; idCohorte?: string | number; nombre?: string }[]; criteriosCohorte?: { id?: string | number; idCriterio?: string | number; pesoSnapshot?: number }[] }>);
            }}
            onSavedConfirmed={onSaveConfirmed}
            availableCriterios={availableCriterios}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="max-w-5xl mx-auto">
        <button type="button" onClick={handleBack} className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors animate-fade-in">
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
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>Editar cohorte</span>
              </button>
            )}

            <button
              onClick={handleToggleEstado}
              disabled={isTogglingEstado}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                editedData.activa ? 'bg-neutral-200 text-gray-800 hover:bg-neutral-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isTogglingEstado ? <Spinner className="h-4 w-4" /> : null}
              <span>{isTogglingEstado ? 'Actualizando estado...' : editedData.activa ? 'Cerrar cohorte' : 'Abrir cohorte'}</span>
            </button>
          </div>
        </div>

        {estadoError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {estadoError}
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-fade-in-up delay-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Nombre de la cohorte</div>
              <div className="text-sm text-gray-900">{editedData.nombre}</div>
            </div>

            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha de inicio</div>
              <div className="text-sm text-gray-900">{editedData.fechaInicio}</div>
            </div>

            {editedData.cupos !== undefined && (
              <div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Cupos</div>
                <div className="text-sm text-gray-900">{editedData.cupos}</div>
              </div>
            )}

            {editedData.fechaLimiteDocumentos && (
              <div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha límite cargue documentos</div>
                <div className="text-sm text-gray-900">{editedData.fechaLimiteDocumentos}</div>
              </div>
            )}

            {editedData.fechaLimitePago && (
              <div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha límite pago inscripción</div>
                <div className="text-sm text-gray-900">{editedData.fechaLimitePago}</div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Documentos requeridos</h2>
              {((editedData.documentos ?? []).length ?? 0) > 0 && (
                <span className="text-xs font-semibold text-red-700 bg-red-100 border border-red-200 rounded-lg px-2.5 py-1">{(editedData.documentos ?? []).length} seleccionados</span>
              )}
            </div>

            <div className="space-y-3">
              {((editedData.documentos ?? [])?.length ?? 0) > 0 ? (
                (editedData.documentos ?? []).map((doc: DocumentoCohorte, index) => {
                  const obligatorio = ((doc as unknown) as { obligatorio?: boolean }).obligatorio;
                  return (
                    <div key={`doc-${index}`} className={`flex items-center gap-3 p-3 rounded-lg border border-transparent bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 border-l-4 ${
                      obligatorio ? 'border-l-red-200' : 'border-l-transparent'
                    }`}>
                      <DocumentTextIcon className="w-5 h-5 text-neutral-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{doc.nombre}</div>
                      </div>
                      {obligatorio ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">Obligatorio</span> : null}
                    </div>
                  );
                })
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

            <div className="mt-6">
              <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Criterios de evaluación</h2>
              {Array.isArray(editedData.criterios) && editedData.criterios.length > 0 ? (
                <div className="space-y-2">
                  {editedData.criterios.map((crit: CriterioItem, idx) => (
                    <div key={`${crit.id ?? crit.nombre}-${idx}`} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-transparent bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 border-l-4 border-l-indigo-200">
                      <div className="flex items-center gap-3">
                        <SparklesIcon className="w-5 h-5 text-indigo-400" />
                        <div className="text-sm text-gray-900">{crit.nombre}</div>
                      </div>
                      <div className="text-sm text-neutral-600 font-semibold">{crit.peso ?? 0} pts</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-neutral-500">No hay criterios definidos para esta cohorte.</div>
              )}
            </div>
          </div>

          {/* Inscritos */}
          <div className="bg-white rounded-lg border border-gray-200 mt-4 animate-fade-in-up delay-400">
            <button onClick={() => setIsInscritosExpanded(!isInscritosExpanded)} className="w-full flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Inscritos</h2>
                <span className="text-sm font-semibold text-gray-900">({editedData.inscritosData?.length ?? 0})</span>
              </div>
              <ChevronDownIcon className={`text-neutral-400 transition-transform w-5 h-5 ${isInscritosExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isInscritosExpanded && editedData.id !== 'new' && (
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
                    {(editedData.inscritosData ?? []).map((inscrito) => (
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

          {/* Admitidos */}
          {!editedData.activa && (editedData.admitidosData ?? []).length > 0 && editedData.id !== 'new' && (
            <div className="bg-white rounded-lg border border-gray-200 mt-4 animate-fade-in-up delay-500">
              <button onClick={() => setIsAdmitidosExpanded(!isAdmitidosExpanded)} className="w-full flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Admitidos</h2>
                  <span className="text-sm font-semibold text-gray-900">({(editedData.admitidosData ?? []).length})</span>
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
                      {(editedData.admitidosData ?? []).map((admitido) => (
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
    </div>
  );
}
