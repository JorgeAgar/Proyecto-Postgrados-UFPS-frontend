import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { ArrowLeftIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { createCohorte, fetchSemestresDisponibles, type NuevaCohortePayload, type SemestreItem } from '../../../services/programa/programaCohorteService';
import { fetchCriteriosPrograma, type CriterioEvaluacion } from '../../../services/programa/programaCriteriosService';
import programaDocsService, { type RequiredDoc } from '../../../services/programa/programaDocsService';
import type { ProgramaOutletContext } from '../../../layouts/ProgramaLayout';

function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin shrink-0 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function CrearCohorte({ onSaved, onBack }: { onSaved?: () => void; onBack?: () => void | Promise<void> }) {
  const navigate = useNavigate();
  const { mostrarAlerta, mostrarConfirm } = useOutletContext<ProgramaOutletContext>();

  const [consejoDocs, setConsejoDocs] = useState<RequiredDoc[]>([]);
  const [programaDocs, setProgramaDocs] = useState<RequiredDoc[]>([]);
  const [criteriosPrograma, setCriteriosPrograma] = useState<CriterioEvaluacion[]>([]);
  const [semestres, setSemestres] = useState<SemestreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [cupos, setCupos] = useState(0);
  const [fechaLimiteDocumentos, setFechaLimiteDocumentos] = useState('');
  const [fechaLimitePago, setFechaLimitePago] = useState('');
  const [idSemestre, setIdSemestre] = useState<string>('');
  const [selectedProgramaDocIds, setSelectedProgramaDocIds] = useState<string[]>([]);
  const [selectedCriterios, setSelectedCriterios] = useState<Array<{ id?: string | number; nombre: string; peso: number }>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setSelectedProgramaDocIds([]);
        setSelectedCriterios([]);
        setIdSemestre('');
        const res = await programaDocsService.fetchRequiredDocuments();
        if (!mounted) return;
        setConsejoDocs(res.documentosConsejo ?? []);
        setProgramaDocs(res.documentosPrograma ?? []);
        try {
          const semestreList = await fetchSemestresDisponibles();
          if (!mounted) return;
          setSemestres(semestreList);
        } catch (err) {
          console.error('Error cargando semestres', err);
          if (mounted) mostrarAlerta('No se pudieron cargar los semestres disponibles.', 'error');
        }
        try {
          const cr = await fetchCriteriosPrograma();
          if (!mounted) return;
          setCriteriosPrograma(cr ?? []);
        } catch (err) {
          console.error('Error cargando criterios del programa', err);
          if (mounted) mostrarAlerta('No se pudieron cargar los criterios del programa.', 'error');
        }
      } catch (err) {
        console.error('Error cargando documentos requeridos', err);
        if (mounted) mostrarAlerta('No se pudieron cargar los documentos requeridos.', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPeso = useMemo(() => selectedCriterios.reduce((sum, criterio) => sum + (Number(criterio.peso) || 0), 0), [selectedCriterios]);

  const disabled = loading || saving;

  const toggleProgramaDoc = (docId: string, checked: boolean) => {
    setSelectedProgramaDocIds((prev) => {
      if (checked) return prev.includes(docId) ? prev : [...prev, docId];
      return prev.filter((current) => current !== docId);
    });
  };

  const toggleCriterio = (criterio: CriterioEvaluacion, checked: boolean) => {
    const criterioId = String(criterio.id ?? criterio.nombre);
    setSelectedCriterios((prev) => {
      if (checked) {
        if (prev.some((current) => String(current.id ?? current.nombre) === criterioId)) return prev;
        return [...prev, { id: criterio.id, nombre: criterio.nombre, peso: criterio.peso ?? 0 }];
      }
      return prev.filter((current) => String(current.id ?? current.nombre) !== criterioId);
    });
  };

  const setPesoCriterio = (criterioId: string | number, peso: number) => {
    setSelectedCriterios((prev) => prev.map((criterio) => (String(criterio.id ?? criterio.nombre) === String(criterioId) ? { ...criterio, peso } : criterio)));
  };

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/programa/cohortes');
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      mostrarAlerta('Ingresa el nombre de la cohorte.', 'advertencia');
      return;
    }
    if (!fechaInicio) {
      mostrarAlerta('Selecciona la fecha de inicio.', 'advertencia');
      return;
    }
    if (idSemestre === '') {
      mostrarAlerta('Selecciona un semestre para la cohorte.', 'advertencia');
      return;
    }
    if (selectedCriterios.length === 0) {
      mostrarAlerta('Selecciona al menos un criterio para continuar.', 'advertencia');
      return;
    }
    if (totalPeso !== 100) {
      mostrarAlerta('La suma de los puntos de criterios debe ser exactamente 100.', 'advertencia');
      return;
    }

    setSaving(true);
    try {
      const body: NuevaCohortePayload = {
        nombre: nombre.trim(),
        idSemestre,
        fechaInicio,
        cupos,
        fechaLimiteDocumentos,
        fechaLimitePago,
        documentosConsejo: consejoDocs.map((doc) => ({ idDocrequisito: doc.id, nombre: doc.nombre })),
        documentosPrograma: programaDocs
          .filter((doc) => selectedProgramaDocIds.includes(String(doc.id)))
          .map((doc) => ({ idDocrequisito: doc.id, nombre: doc.nombre })),
        criteriosCohorte: selectedCriterios.map((criterio) => ({ idCriterio: criterio.id, pesoSnapshot: criterio.peso ?? 0, idCohorte: 0 })),
      };

      await createCohorte(body);
      mostrarConfirm('Cohorte creada correctamente.');
      if (onSaved) onSaved();
      else navigate('/programa/cohortes');
    } catch (err) {
      console.error(err);
      mostrarAlerta('No se pudo crear la cohorte.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="max-w-5xl mx-auto">
        <button type="button" onClick={handleBack} className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors animate-fade-in">
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="font-medium">Volver a Cohortes</span>
        </button>

        <div className="flex items-center justify-between mb-6 animate-fade-in delay-75">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nueva cohorte</h1>
            <p className="text-sm text-neutral-500">Configura datos básicos, documentos y criterios antes de crearla.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 animate-fade-in-up delay-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Nombre de la cohorte</div>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={disabled}
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Cohorte-20 2026-1"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha de inicio</div>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                disabled={disabled}
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Cupos</div>
              <input
                type="number"
                min={0}
                value={cupos}
                onChange={(e) => setCupos(Number(e.target.value) || 0)}
                disabled={disabled}
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Semestre</div>
              <select
                value={idSemestre}
                onChange={(e) => setIdSemestre(e.target.value)}
                disabled={disabled}
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Selecciona un semestre</option>
                {semestres.map((semestre) => (
                  <option key={String(semestre.id)} value={String(semestre.id)}>
                    {semestre.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha límite cargue documentos</div>
              <input
                type="date"
                value={fechaLimiteDocumentos}
                onChange={(e) => setFechaLimiteDocumentos(e.target.value)}
                disabled={disabled}
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">Fecha límite pago inscripción</div>
              <input
                type="date"
                value={fechaLimitePago}
                onChange={(e) => setFechaLimitePago(e.target.value)}
                disabled={disabled}
                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Documentos requeridos</h2>
            </div>

            {loading ? (
              <div className="rounded-lg border border-gray-200 bg-neutral-50 p-4 flex items-center gap-3 text-sm text-neutral-500">
                <Spinner className="h-4 w-4 text-neutral-400" />
                Cargando documentos...
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Documentos del Consejo</div>
                  <div className="space-y-2">
                    {consejoDocs.length > 0 ? (
                      consejoDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-transparent bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 border-l-4 border-l-red-200">
                          <DocumentTextIcon className="w-5 h-5 text-neutral-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{doc.nombre}</div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100">Obligatorio</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-neutral-500">No hay documentos del consejo disponibles.</div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Documentos del Programa</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {programaDocs.length > 0 ? (
                      programaDocs.map((doc) => {
                        const checked = selectedProgramaDocIds.includes(String(doc.id));
                        return (
                          <label key={doc.id} className="flex items-center gap-3 rounded-lg border border-transparent p-3 bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 cursor-pointer border-l-4 border-l-gray-100">
                            <input type="checkbox" checked={checked} onChange={(e) => toggleProgramaDoc(String(doc.id), e.target.checked)} disabled={disabled} className="h-4 w-4" />
                            <DocumentTextIcon className="w-5 h-5 text-neutral-400" />
                            <span className="text-sm text-gray-900">{doc.nombre}</span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="text-sm text-neutral-500">No hay documentos del programa disponibles.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-sm font-semibold text-gray-800">Criterios de evaluación</h2>
              <span className={`text-xs font-semibold rounded-lg px-2.5 py-1 border ${totalPeso === 100 || selectedCriterios.length === 0 ? 'text-neutral-600 bg-neutral-100 border-neutral-200' : 'text-red-700 bg-red-100 border-red-200'}`}>
                {selectedCriterios.length > 0 ? `${totalPeso} / 100` : 'Sin criterios seleccionados'}
              </span>
            </div>

            {loading ? (
              <div className="rounded-lg border border-gray-200 bg-neutral-50 p-4 flex items-center gap-3 text-sm text-neutral-500">
                <Spinner className="h-4 w-4 text-neutral-400" />
                Cargando criterios...
              </div>
            ) : (
              <div className="space-y-2">
                {criteriosPrograma.length > 0 ? (
                  criteriosPrograma.map((criterio) => {
                    const criterioId = criterio.id ?? criterio.nombre;
                    const selected = selectedCriterios.some((current) => String(current.id ?? current.nombre) === String(criterioId));
                    const local = selectedCriterios.find((current) => String(current.id ?? current.nombre) === String(criterioId));
                    return (
                      <div
                        key={String(criterioId)}
                        className="flex flex-col gap-3 p-3 rounded-lg border border-transparent bg-white shadow-sm hover:shadow transition-shadow hover:border-gray-200 border-l-4 border-l-indigo-200"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={selected} onChange={(e) => toggleCriterio(criterio, e.target.checked)} disabled={disabled} className="h-4 w-4" />
                            <SparklesIcon className="w-5 h-5 text-indigo-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{criterio.nombre}</div>
                              <div className="text-xs text-neutral-500">Peso sugerido: {criterio.peso ?? 0}</div>
                            </div>
                          </label>

                          {selected && (
                            <div className="w-28">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={local?.peso ?? 0}
                                onChange={(e) => setPesoCriterio(criterioId, Number(e.target.value) || 0)}
                                disabled={disabled}
                                className="w-full text-sm text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-neutral-500">No hay criterios definidos para este programa.</div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={disabled}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={disabled || selectedCriterios.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && <Spinner />}
              <span>{saving ? 'Creando...' : 'Crear cohorte'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
