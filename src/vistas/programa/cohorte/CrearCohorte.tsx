import { useEffect, useState } from 'react';
import CohorteDetalleView from './CohorteDetalleView';
import { createCohorte, type CohorteDetalle, type NuevaCohortePayload, type DocumentoCohorte } from '../../../services/programa/programaChortesService';
import { fetchCriteriosPrograma, type CriterioEvaluacion } from '../../../services/programa/programaCriteriosService';
import { useNavigate } from 'react-router';
import programaDocsService, { type RequiredDoc } from '../../../services/programa/programaDocsService';

export default function CrearCohorte({ onSaved, onBack }: { onSaved?: () => void; onBack?: () => void | Promise<void> }) {
  const navigate = useNavigate();

  const initial: CohorteDetalle = {
    id: 'new',
    nombre: 'Nueva cohorte',
    activa: true,
    semestre: '',
    cupos: 0,
    fechaLimiteDocumentos: '2026-04-10',
    fechaLimitePago: '2026-04-30',
    fechaLimiteDocs: '2026-04-10',
    fechaLimiteInscripcion: '2026-04-30',
    totalInscritos: 0,
    totalValidados: 0,
    totalAdmitidos: 0,
    inscritosData: [],
    admitidosData: [],
    criterios: [],
    documentos: [],
    documentosAsignados: { documentosConsejo: [], documentosPrograma: [] },
  } as CohorteDetalle;

  const [consejoDocs, setConsejoDocs] = useState<RequiredDoc[]>([]);
  const [programaDocs, setProgramaDocs] = useState<RequiredDoc[]>([]);
  const [criteriosPrograma, setCriteriosPrograma] = useState<CriterioEvaluacion[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await programaDocsService.fetchRequiredDocuments();
        setConsejoDocs(res.documentosConsejo ?? []);
        setProgramaDocs(res.documentosPrograma ?? []);
        // load criterios disponibles para el programa
        try {
          const cr = await fetchCriteriosPrograma();
          setCriteriosPrograma(cr ?? []);
        } catch (err) {
          console.error('Error cargando criterios del programa', err);
        }
      } catch (err) {
        console.error('Error cargando documentos requeridos', err);
      }
    })();
  }, []);

  const handleSave = async (payload: Partial<{
    cupos: number;
    fechaLimiteDocumentos: string;
    fechaLimitePago: string;
    nombre: string;
    fechaInicio: string;
    documentos: DocumentoCohorte[];
    criterios?: { id?: string | number; nombre?: string; peso?: number }[];
  }>) => {
    // Map consejo docs (mandatory) and selected program docs
    const documentosConsejo = (consejoDocs ?? []).map((d) => ({ idDocrequisito: d.id, nombre: d.nombre }));

    const selectedProgramaNames = (payload.documentos ?? []).map((d) => (d.nombre ?? '').trim());
    const documentosPrograma = (programaDocs ?? [])
      .filter((d) => selectedProgramaNames.includes((d.nombre ?? '').trim()))
      .map((d) => ({ idDocrequisito: d.id, nombre: d.nombre }));

    const body: NuevaCohortePayload = {
      nombre: payload.nombre ?? initial.nombre,
      fechaInicio: payload.fechaInicio ?? '',
      cupos: payload.cupos ?? 0,
      fechaLimiteDocumentos: payload.fechaLimiteDocumentos ?? '',
      fechaLimitePago: payload.fechaLimitePago ?? '',
      documentosConsejo,
      documentosPrograma,
      criteriosCohorte: (payload.criterios ?? []).map((c) => ({ idCriterio: c.id, pesoSnapshot: c.peso ?? 0, idCohorte: 0 })),
    };
    await createCohorte(body);
    if (onSaved) onSaved();
    else navigate('/programa/cohortes');
  };

  const documentosAsignados = {
    documentosConsejo: (consejoDocs ?? []).map((d) => ({ id: Number(d.id ?? 0), idDocrequisito: d.id, idCohorte: 0, nombre: d.nombre })),
    documentosPrograma: (programaDocs ?? []).map((d) => ({ id: Number(d.id ?? 0), idDocrequisito: d.id, idCohorte: 0, nombre: d.nombre })),
  };

  const cohorteWithDocs = { ...initial, documentosAsignados, criterios: [] } as CohorteDetalle;

  return (
    <CohorteDetalleView
      cohorte={cohorteWithDocs}
      onBack={onBack ?? (() => navigate('/programa/cohortes'))}
      onSave={handleSave}
      onToggleEstado={async () => {}}
      startEditing
      hideEditControls
      availableCriterios={criteriosPrograma}
    />
  );
}
