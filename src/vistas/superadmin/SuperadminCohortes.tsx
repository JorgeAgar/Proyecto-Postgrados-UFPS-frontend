import { useState, useEffect, useCallback } from 'react';
import { Modal } from './components/Modal';
import {
  superadminFacultadesService,
  superadminProgramasService,
  superadminCohortesService,
  superadminSemestresService,
  superadminModalidadesService,
  superadminPlazosService,
  type FacultadOutput,
  type ProgramaOutput,
  type CohorteOutput,
  type EstadoOutput,
  type SemestreOutput,
  type ModalidadOutput,
  type PlazoOutput,
} from '../../services/superadmin/superadminCohortesService';

// ── Íconos ────────────────────────────────────────────────────────────────────

function BuildingLibraryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  );
}

function AcademicCapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function ChevronRightIcon({ open }: { open: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-90' : 'rotate-0'}`}
      stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function FolderPlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Tipos de formulario ───────────────────────────────────────────────────────

type FacultadForm = {
  nombre: string;
  correo: string;
  idAdministrativo: number | '';
};

type ProgramaForm = {
  codigo: number | '';
  nombre: string;
  semestres: number | '';
  correo: string;
  registrosnies: string;
  nivelformacion: string;
  titulo: string;
  rcmineducacion: string;
  creditos: number | '';
  periodicidad: string;
  valormatricula: number | '';
  idSede: number | '';
  idAdministrativo: number | '';
  idFacultad: number | '';
  idOtros: number | '';
};

type CohorteForm = {
  nombre: string;
  cupos: number | '';
  requiereentrevista: boolean;
  requiereprueba: boolean;
  idEstado: number | '';
  idSemestre: number | '';
  idModalidad: number | '';
  idPlazodocumentacion: number | '';
  idPlazoinscripcion: number | '';
  idPlazopago: number | '';
};

const EMPTY_FAC: FacultadForm = { nombre: '', correo: '', idAdministrativo: '' };
const EMPTY_PROG: ProgramaForm = {
  codigo: '', nombre: '', semestres: '', correo: '', registrosnies: '',
  nivelformacion: '', titulo: '', rcmineducacion: '', creditos: '',
  periodicidad: '', valormatricula: '', idSede: '', idAdministrativo: '',
  idFacultad: '', idOtros: '',
};
const EMPTY_COH: CohorteForm = {
  nombre: '', cupos: '', requiereentrevista: false, requiereprueba: false,
  idEstado: '', idSemestre: '', idModalidad: '',
  idPlazodocumentacion: '', idPlazoinscripcion: '', idPlazopago: '',
};

// ── CohorteCard ───────────────────────────────────────────────────────────────

interface CohorteCardProps {
  cohorte: CohorteOutput;
  onEdit: (c: CohorteOutput, e: React.MouseEvent) => void;
  onDelete: (c: CohorteOutput, e: React.MouseEvent) => void;
}

function CohorteCard({ cohorte, onEdit, onDelete }: CohorteCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="bg-slate-900 p-2 rounded-lg shrink-0 text-white mt-0.5">
          <UsersIcon />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{cohorte.nombre}</h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span><span className="font-medium text-gray-700">Cupos:</span> {cohorte.cupos}</span>
            {cohorte.modalidad?.nombre && (
              <><span>·</span><span><span className="font-medium text-gray-700">Modalidad:</span> {cohorte.modalidad.nombre}</span></>
            )}
            {cohorte.semestre?.nombre && (
              <><span>·</span><span><span className="font-medium text-gray-700">Semestre:</span> {cohorte.semestre.nombre}</span></>
            )}
            {cohorte.estado && (
              <><span>·</span><span><span className="font-medium text-gray-700">Estado:</span> {cohorte.estado}</span></>
            )}
          </div>
          {(cohorte.requiereentrevista || cohorte.requiereprueba) && (
            <div className="flex gap-1.5 mt-1.5">
              {cohorte.requiereentrevista && (
                <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">Entrevista</span>
              )}
              {cohorte.requiereprueba && (
                <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-medium">Prueba</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={(e) => onEdit(cohorte, e)} title="Editar cohorte"
            className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <PencilIcon />
          </button>
          <button onClick={(e) => onDelete(cohorte, e)} title="Eliminar cohorte"
            className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ProgramaItem ──────────────────────────────────────────────────────────────

interface ProgramaItemProps {
  programa: ProgramaOutput;
  cohortes: CohorteOutput[];
  onEdit: (p: ProgramaOutput, e: React.MouseEvent) => void;
  onDelete: (p: ProgramaOutput, e: React.MouseEvent) => void;
  onAddCohorte: (programaId: number, e: React.MouseEvent) => void;
  onEditCohorte: (c: CohorteOutput, e: React.MouseEvent) => void;
  onDeleteCohorte: (c: CohorteOutput, e: React.MouseEvent) => void;
}

function ProgramaItem({
  programa, cohortes, onEdit, onDelete,
  onAddCohorte, onEditCohorte, onDeleteCohorte,
}: ProgramaItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className={['flex items-center justify-between px-5 py-3.5 transition-all', open ? 'bg-slate-800 text-white' : 'bg-gray-50 text-gray-900'].join(' ')}>
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <span className={open ? 'text-slate-300' : 'text-gray-400'}><AcademicCapIcon /></span>
          <div className="min-w-0">
            <div className="font-semibold text-sm truncate">{programa.nombre}</div>
            <div className={`text-xs ${open ? 'text-slate-300' : 'text-gray-400'}`}>
              Cód. {programa.codigo}
              {programa.nivelformacion ? ` · ${programa.nivelformacion}` : ''}
              {programa.sede?.nombre ? ` · Sede: ${programa.sede.nombre}` : ''}
              {` · ${cohortes.length} cohorte${cohortes.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button onClick={(e) => onEdit(programa, e)} title="Editar programa"
            className={`p-1.5 rounded-lg transition-colors ${open ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-gray-200'}`}>
            <PencilIcon />
          </button>
          <button onClick={(e) => onDelete(programa, e)} title="Eliminar programa"
            className={`p-1.5 rounded-lg transition-colors ${open ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-gray-200'}`}>
            <TrashIcon />
          </button>
          <button onClick={() => setOpen((o) => !o)}
            className={`p-1.5 rounded-lg transition-colors ${open ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:bg-gray-200'}`}>
            <ChevronRightIcon open={open} />
          </button>
        </div>
      </div>

      <div className={['overflow-hidden transition-all duration-300 ease-in-out', open ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'].join(' ')}>
        <div className="border-t border-gray-200 bg-white p-4 space-y-3">
          <button
            onClick={(e) => onAddCohorte(programa.id, e)}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <PlusIcon />Nueva Cohorte
          </button>

          {cohortes.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No hay cohortes registradas en este programa</p>
          )}

          {cohortes.map((c) => (
            <CohorteCard
              key={c.id}
              cohorte={c}
              onEdit={onEditCohorte}
              onDelete={onDeleteCohorte}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FacultadItem ──────────────────────────────────────────────────────────────

interface FacultadItemProps {
  facultad: FacultadOutput;
  programas: ProgramaOutput[];
  cohortes: CohorteOutput[];
  delay: string;
  onEditFacultad: (f: FacultadOutput, e: React.MouseEvent) => void;
  onDeleteFacultad: (f: FacultadOutput, e: React.MouseEvent) => void;
  onAddPrograma: (facultadId: number, e: React.MouseEvent) => void;
  onEditPrograma: (p: ProgramaOutput, e: React.MouseEvent) => void;
  onDeletePrograma: (p: ProgramaOutput, e: React.MouseEvent) => void;
  onAddCohorte: (programaId: number, e: React.MouseEvent) => void;
  onEditCohorte: (c: CohorteOutput, e: React.MouseEvent) => void;
  onDeleteCohorte: (c: CohorteOutput, e: React.MouseEvent) => void;
}

function FacultadItem({
  facultad, programas, cohortes, delay,
  onEditFacultad, onDeleteFacultad,
  onAddPrograma, onEditPrograma, onDeletePrograma,
  onAddCohorte, onEditCohorte, onDeleteCohorte,
}: FacultadItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`animate-fade-in-up ${delay} border border-gray-200 rounded-lg overflow-hidden bg-white`}>
      <div className={['flex items-center justify-between px-5 py-4 transition-all', open ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'].join(' ')}>
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <span className={open ? 'text-slate-300' : 'text-gray-400'}><BuildingLibraryIcon /></span>
          <div className="min-w-0">
            <div className="font-semibold">{facultad.nombre}</div>
            <div className={`text-xs ${open ? 'text-slate-300' : 'text-gray-400'}`}>
              {facultad.correo}
              {` · ${programas.length} programa${programas.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button onClick={(e) => onEditFacultad(facultad, e)} title="Editar facultad"
            className={`p-2 rounded-lg transition-colors ${open ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-gray-100'}`}>
            <PencilIcon />
          </button>
          <button onClick={(e) => onDeleteFacultad(facultad, e)} title="Eliminar facultad"
            className={`p-2 rounded-lg transition-colors ${open ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-gray-100'}`}>
            <TrashIcon />
          </button>
          <button onClick={() => setOpen((o) => !o)}
            className={`p-2 rounded-lg transition-colors ${open ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:bg-gray-100'}`}>
            <ChevronRightIcon open={open} />
          </button>
        </div>
      </div>

      <div className={['overflow-hidden transition-all duration-300 ease-in-out', open ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'].join(' ')}>
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
          <button
            onClick={(e) => onAddPrograma(facultad.id, e)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <PlusIcon />Nuevo Programa
          </button>

          {programas.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No hay programas en esta facultad</p>
          )}

          {programas.map((p) => (
            <ProgramaItem
              key={p.id}
              programa={p}
              cohortes={cohortes.filter((c) => c.idPrograma === p.id)}
              onEdit={onEditPrograma}
              onDelete={onDeletePrograma}
              onAddCohorte={onAddCohorte}
              onEditCohorte={onEditCohorte}
              onDeleteCohorte={onDeleteCohorte}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function SuperadminCohortes() {
  // ── Datos ─────────────────────────────────────────────────────────────────
  const [facultades, setFacultades] = useState<FacultadOutput[]>([]);
  const [programas, setProgramas]   = useState<ProgramaOutput[]>([]);
  const [cohortes, setCohortes]     = useState<CohorteOutput[]>([]);
  const [estados, setEstados]       = useState<EstadoOutput[]>([]);
  const [semestres, setSemestres]   = useState<SemestreOutput[]>([]);
  const [modalidades, setModalidades] = useState<ModalidadOutput[]>([]);
  const [plazos, setPlazos]         = useState<PlazoOutput[]>([]);
  const [loading, setLoading]       = useState(true);
  const [pageError, setPageError]   = useState<string | null>(null);

  // ── Modal: Facultad ───────────────────────────────────────────────────────
  const [showFacModal, setShowFacModal]     = useState(false);
  const [editingFac, setEditingFac]         = useState<FacultadOutput | null>(null);
  const [facForm, setFacForm]               = useState<FacultadForm>(EMPTY_FAC);
  const [facSubmitting, setFacSubmitting]   = useState(false);
  const [facFormError, setFacFormError]     = useState<string | null>(null);

  const [showDelFacModal, setShowDelFacModal] = useState(false);
  const [facToDelete, setFacToDelete]         = useState<FacultadOutput | null>(null);
  const [delFacming, setDelFacming]           = useState(false);
  const [delFacError, setDelFacError]         = useState<string | null>(null);

  // ── Modal: Programa ───────────────────────────────────────────────────────
  const [showProgModal, setShowProgModal]     = useState(false);
  const [editingProg, setEditingProg]         = useState<ProgramaOutput | null>(null);
  const [progForm, setProgForm]               = useState<ProgramaForm>(EMPTY_PROG);
  const [progSubmitting, setProgSubmitting]   = useState(false);
  const [progFormError, setProgFormError]     = useState<string | null>(null);

  const [showDelProgModal, setShowDelProgModal] = useState(false);
  const [progToDelete, setProgToDelete]         = useState<ProgramaOutput | null>(null);
  const [delProgming, setDelProgming]           = useState(false);
  const [delProgError, setDelProgError]         = useState<string | null>(null);

  // ── Modal: Cohorte ────────────────────────────────────────────────────────
  const [showCohModal, setShowCohModal]     = useState(false);
  const [editingCoh, setEditingCoh]         = useState<CohorteOutput | null>(null);
  const [cohForm, setCohForm]               = useState<CohorteForm>(EMPTY_COH);
  const [cohSubmitting, setCohSubmitting]   = useState(false);
  const [cohFormError, setCohFormError]     = useState<string | null>(null);
  const [cohContextProgId, setCohContextProgId] = useState<number | null>(null);

  const [showDelCohModal, setShowDelCohModal] = useState(false);
  const [cohToDelete, setCohToDelete]         = useState<CohorteOutput | null>(null);
  const [delCohming, setDelCohming]           = useState(false);
  const [delCohError, setDelCohError]         = useState<string | null>(null);

  // ── Carga ─────────────────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const [facs, progs, cohs, ests, sems, mods, plzs] = await Promise.all([
        superadminFacultadesService.listar(),
        superadminProgramasService.listar(),
        superadminCohortesService.listar(),
        superadminSemestresService.listarEstados(),
        superadminSemestresService.listar(),
        superadminModalidadesService.listar(),
        superadminPlazosService.listar(),
      ]);
      setFacultades(facs);
      setProgramas(progs);
      setCohortes(cohs);
      setEstados(ests);
      setSemestres(sems);
      setModalidades(mods);
      setPlazos(plzs);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Error al cargar datos del servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const numVal = (v: string) => (v === '' ? '' : Number(v));
  const setP = <K extends keyof ProgramaForm>(k: K, v: ProgramaForm[K]) =>
    setProgForm((f) => ({ ...f, [k]: v }));
  const setC = <K extends keyof CohorteForm>(k: K, v: CohorteForm[K]) =>
    setCohForm((f) => ({ ...f, [k]: v }));

  const plazoLabel = (p: PlazoOutput) =>
    p.tipoplazo
      ? `${p.tipoplazo.nombre} (${p.fechainicio} → ${p.fechafin})`
      : `Plazo #${p.id} (${p.fechainicio} → ${p.fechafin})`;

  // ── Handlers: Facultad ────────────────────────────────────────────────────

  const openCreateFac = () => {
    setEditingFac(null);
    setFacForm(EMPTY_FAC);
    setFacFormError(null);
    setShowFacModal(true);
  };

  const openEditFac = (f: FacultadOutput, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFac(f);
    setFacForm({ nombre: f.nombre, correo: f.correo, idAdministrativo: '' });
    setFacFormError(null);
    setShowFacModal(true);
  };

  const handleSaveFac = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFacFormError(null);
    if (!facForm.nombre.trim()) { setFacFormError('El nombre es obligatorio.'); return; }
    if (!facForm.correo.trim()) { setFacFormError('El correo es obligatorio.'); return; }
    setFacSubmitting(true);
    try {
      const payload = {
        nombre: facForm.nombre.trim(),
        correo: facForm.correo.trim(),
        idAdministrativo: (facForm.idAdministrativo as number) || 0,
      };
      if (editingFac) {
        await superadminFacultadesService.actualizar({ id: editingFac.id, ...payload });
      } else {
        await superadminFacultadesService.crear(payload);
      }
      setShowFacModal(false);
      await cargar();
    } catch (err) {
      setFacFormError(err instanceof Error ? err.message : 'Error al guardar la facultad.');
    } finally {
      setFacSubmitting(false);
    }
  };

  const openDeleteFac = (f: FacultadOutput, e: React.MouseEvent) => {
    e.stopPropagation();
    setFacToDelete(f);
    setDelFacError(null);
    setShowDelFacModal(true);
  };

  const confirmDeleteFac = async () => {
    if (!facToDelete) return;
    setDelFacming(true);
    setDelFacError(null);
    try {
      await superadminFacultadesService.eliminar(facToDelete.id);
      setShowDelFacModal(false);
      setFacToDelete(null);
      await cargar();
    } catch (err) {
      setDelFacError(err instanceof Error ? err.message : 'Error al eliminar la facultad.');
    } finally {
      setDelFacming(false);
    }
  };

  // ── Handlers: Programa ────────────────────────────────────────────────────

  const openCreateProg = (facultadId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProg(null);
    setProgForm({ ...EMPTY_PROG, idFacultad: facultadId });
    setProgFormError(null);
    setShowProgModal(true);
  };

  const openEditProg = (p: ProgramaOutput, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProg(p);
    setProgForm({
      codigo: p.codigo ?? '',
      nombre: p.nombre ?? '',
      semestres: p.semestres ?? '',
      correo: p.correo ?? '',
      registrosnies: p.registrosnies ?? '',
      nivelformacion: p.nivelformacion ?? '',
      titulo: p.titulo ?? '',
      rcmineducacion: p.rcmineducacion ?? '',
      creditos: p.creditos ?? '',
      periodicidad: p.periodicidad ?? '',
      valormatricula: p.valormatricula ?? '',
      idSede: p.idSede ?? '',
      idAdministrativo: '',
      idFacultad: p.idFacultad ?? '',
      idOtros: p.idOtros ?? '',
    });
    setProgFormError(null);
    setShowProgModal(true);
  };

  const handleSaveProg = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProgFormError(null);
    if (!progForm.nombre.trim()) { setProgFormError('El nombre es obligatorio.'); return; }
    if (progForm.codigo === '')   { setProgFormError('El código es obligatorio.'); return; }
    if (progForm.idFacultad === '') { setProgFormError('Selecciona una facultad.'); return; }
    setProgSubmitting(true);
    try {
      const payload = {
        codigo: progForm.codigo as number,
        nombre: progForm.nombre.trim(),
        semestres: (progForm.semestres as number) || 0,
        correo: progForm.correo.trim(),
        registrosnies: progForm.registrosnies.trim(),
        nivelformacion: progForm.nivelformacion.trim(),
        titulo: progForm.titulo.trim(),
        rcmineducacion: progForm.rcmineducacion.trim(),
        creditos: (progForm.creditos as number) || 0,
        periodicidad: progForm.periodicidad.trim(),
        valormatricula: (progForm.valormatricula as number) || 0,
        idSede: (progForm.idSede as number) || 0,
        idAdministrativo: (progForm.idAdministrativo as number) || 0,
        idFacultad: progForm.idFacultad as number,
        idOtros: (progForm.idOtros as number) || 0,
      };
      if (editingProg) {
        await superadminProgramasService.actualizar({ id: editingProg.id, ...payload });
      } else {
        await superadminProgramasService.crear(payload);
      }
      setShowProgModal(false);
      await cargar();
    } catch (err) {
      setProgFormError(err instanceof Error ? err.message : 'Error al guardar el programa.');
    } finally {
      setProgSubmitting(false);
    }
  };

  const openDeleteProg = (p: ProgramaOutput, e: React.MouseEvent) => {
    e.stopPropagation();
    setProgToDelete(p);
    setDelProgError(null);
    setShowDelProgModal(true);
  };

  const confirmDeleteProg = async () => {
    if (!progToDelete) return;
    setDelProgming(true);
    setDelProgError(null);
    try {
      await superadminProgramasService.eliminar(progToDelete.id);
      setShowDelProgModal(false);
      setProgToDelete(null);
      await cargar();
    } catch (err) {
      setDelProgError(err instanceof Error ? err.message : 'Error al eliminar el programa.');
    } finally {
      setDelProgming(false);
    }
  };

  // ── Handlers: Cohorte ─────────────────────────────────────────────────────

  const openCreateCoh = (programaId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCoh(null);
    setCohForm(EMPTY_COH);
    setCohFormError(null);
    setCohContextProgId(programaId);
    setShowCohModal(true);
  };

  const openEditCoh = (c: CohorteOutput, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCoh(c);
    setCohForm({
      nombre: c.nombre ?? '',
      cupos: c.cupos ?? '',
      requiereentrevista: c.requiereentrevista ?? false,
      requiereprueba: c.requiereprueba ?? false,
      idEstado: c.idEstado ?? '',
      idSemestre: c.idSemestre ?? '',
      idModalidad: c.idModalidad ?? '',
      idPlazodocumentacion: c.idPlazodocumentacion ?? '',
      idPlazoinscripcion: c.idPlazoinscripcion ?? '',
      idPlazopago: c.idPlazopago ?? '',
    });
    setCohContextProgId(c.idPrograma);
    setCohFormError(null);
    setShowCohModal(true);
  };

  const handleSaveCoh = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCohFormError(null);
    if (!cohForm.nombre.trim()) { setCohFormError('El nombre es obligatorio.'); return; }
    if (cohForm.cupos === '' || (cohForm.cupos as number) <= 0) { setCohFormError('Los cupos deben ser mayor a 0.'); return; }
    if (cohForm.idEstado === '')   { setCohFormError('Selecciona un estado.'); return; }
    if (cohForm.idSemestre === '') { setCohFormError('Selecciona un semestre.'); return; }
    if (cohForm.idModalidad === '') { setCohFormError('Selecciona una modalidad.'); return; }
    const idProg = editingCoh ? editingCoh.idPrograma : cohContextProgId;
    if (!idProg) { setCohFormError('Error interno: programa no definido.'); return; }
    setCohSubmitting(true);
    try {
      const payload = {
        nombre: cohForm.nombre.trim(),
        cupos: cohForm.cupos as number,
        requiereentrevista: cohForm.requiereentrevista,
        requiereprueba: cohForm.requiereprueba,
        idEstado: cohForm.idEstado as number,
        idSemestre: cohForm.idSemestre as number,
        idModalidad: cohForm.idModalidad as number,
        idPlazodocumentacion: (cohForm.idPlazodocumentacion as number) || 0,
        idPlazoinscripcion: (cohForm.idPlazoinscripcion as number) || 0,
        idPlazopago: (cohForm.idPlazopago as number) || 0,
        idPrograma: idProg,
      };
      if (editingCoh) {
        await superadminCohortesService.actualizar({ id: editingCoh.id, ...payload });
      } else {
        await superadminCohortesService.crear(payload);
      }
      setShowCohModal(false);
      await cargar();
    } catch (err) {
      setCohFormError(err instanceof Error ? err.message : 'Error al guardar la cohorte.');
    } finally {
      setCohSubmitting(false);
    }
  };

  const openDeleteCoh = (c: CohorteOutput, e: React.MouseEvent) => {
    e.stopPropagation();
    setCohToDelete(c);
    setDelCohError(null);
    setShowDelCohModal(true);
  };

  const confirmDeleteCoh = async () => {
    if (!cohToDelete) return;
    setDelCohming(true);
    setDelCohError(null);
    try {
      await superadminCohortesService.eliminar(cohToDelete.id);
      setShowDelCohModal(false);
      setCohToDelete(null);
      await cargar();
    } catch (err) {
      setDelCohError(err instanceof Error ? err.message : 'Error al eliminar la cohorte.');
    } finally {
      setDelCohming(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8">
      {/* Encabezado */}
      <div className="animate-fade-in-up flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Cohortes</h1>
          <p className="text-gray-500 text-sm">Gestiona facultades, programas y cohortes académicas</p>
        </div>
        <button
          onClick={openCreateFac}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shrink-0"
        >
          <FolderPlusIcon />
          Nueva Facultad
        </button>
      </div>

      {/* Error de página */}
      {pageError && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {pageError}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
          <Spinner />
          Cargando datos...
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl mx-auto">
          {facultades.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              No hay facultades creadas. Crea una con el botón de arriba.
            </div>
          )}
          {facultades.map((f, idx) => (
            <FacultadItem
              key={f.id}
              facultad={f}
              programas={programas.filter((p) => p.idFacultad === f.id)}
              cohortes={cohortes}
              delay={`delay-${Math.min((idx + 1) * 100, 500)}`}
              onEditFacultad={openEditFac}
              onDeleteFacultad={openDeleteFac}
              onAddPrograma={openCreateProg}
              onEditPrograma={openEditProg}
              onDeletePrograma={openDeleteProg}
              onAddCohorte={openCreateCoh}
              onEditCohorte={openEditCoh}
              onDeleteCohorte={openDeleteCoh}
            />
          ))}
        </div>
      )}

      {/* ── Modal: Facultad (crear / editar) ────────────────────────────────── */}
      <Modal
        isOpen={showFacModal}
        onClose={() => setShowFacModal(false)}
        title={editingFac ? 'Editar Facultad' : 'Nueva Facultad'}
      >
        <form onSubmit={handleSaveFac} className="space-y-4">
          {facFormError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{facFormError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
            <input
              type="text"
              placeholder="Facultad de Ingeniería"
              value={facForm.nombre}
              onChange={(e) => setFacForm({ ...facForm, nombre: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo</label>
            <input
              type="email"
              placeholder="facultad@ufps.edu.co"
              value={facForm.correo}
              onChange={(e) => setFacForm({ ...facForm, correo: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Administrativo</label>
            <input
              type="number"
              placeholder="1"
              value={facForm.idAdministrativo}
              onChange={(e) => setFacForm({ ...facForm, idAdministrativo: numVal(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={facSubmitting}
              className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {facSubmitting && <Spinner />}
              {editingFac ? 'Actualizar' : 'Crear'} Facultad
            </button>
            <button
              type="button"
              onClick={() => setShowFacModal(false)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Eliminar Facultad ─────────────────────────────────────────── */}
      <Modal isOpen={showDelFacModal} onClose={() => setShowDelFacModal(false)} title="Eliminar Facultad">
        <div className="space-y-4">
          {delFacError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{delFacError}</div>
          )}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <TrashIcon />
            </div>
            <p className="text-sm text-gray-500 pt-1">
              ¿Eliminar la facultad <span className="font-semibold text-gray-800">{facToDelete?.nombre}</span>?
              Esta acción también eliminará sus programas y cohortes asociadas.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDelFacModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={confirmDeleteFac} disabled={delFacming}
              className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {delFacming && <Spinner />}
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Programa (crear / editar) ────────────────────────────────── */}
      <Modal
        isOpen={showProgModal}
        onClose={() => setShowProgModal(false)}
        title={editingProg ? 'Editar Programa' : 'Nuevo Programa'}
        size="lg"
      >
        <form onSubmit={handleSaveProg} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {progFormError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{progFormError}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Código</label>
              <input type="number" placeholder="12345" value={progForm.codigo}
                onChange={(e) => setP('codigo', numVal(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Semestres</label>
              <input type="number" placeholder="4" value={progForm.semestres}
                onChange={(e) => setP('semestres', numVal(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del programa</label>
            <input type="text" placeholder="Maestría en Ingeniería de Software" value={progForm.nombre}
              onChange={(e) => setP('nombre', e.target.value)} autoFocus
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Título otorgado</label>
            <input type="text" placeholder="Magíster en Ingeniería de Software" value={progForm.titulo}
              onChange={(e) => setP('titulo', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nivel de formación</label>
              <select value={progForm.nivelformacion} onChange={(e) => setP('nivelformacion', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent">
                <option value="">Seleccionar</option>
                <option>Maestría</option>
                <option>Doctorado</option>
                <option>Especialización</option>
                <option>Especialización Médico-Quirúrgica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Periodicidad</label>
              <select value={progForm.periodicidad} onChange={(e) => setP('periodicidad', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent">
                <option value="">Seleccionar</option>
                <option>Semestral</option>
                <option>Anual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo del programa</label>
            <input type="email" placeholder="programa@ufps.edu.co" value={progForm.correo}
              onChange={(e) => setP('correo', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Registro SNIES</label>
              <input type="text" placeholder="12345" value={progForm.registrosnies}
                onChange={(e) => setP('registrosnies', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">RC Mineducación</label>
              <input type="text" placeholder="RC-001-2024" value={progForm.rcmineducacion}
                onChange={(e) => setP('rcmineducacion', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Créditos</label>
              <input type="number" placeholder="60" value={progForm.creditos}
                onChange={(e) => setP('creditos', numVal(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Valor matrícula</label>
              <input type="number" placeholder="5000000" value={progForm.valormatricula}
                onChange={(e) => setP('valormatricula', numVal(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Facultad</label>
            <select
              value={progForm.idFacultad}
              onChange={(e) => setP('idFacultad', e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            >
              <option value="">Seleccionar facultad</option>
              {facultades.map((f) => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Sede</label>
              <input type="number" placeholder="1" value={progForm.idSede}
                onChange={(e) => setP('idSede', numVal(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Administrativo</label>
              <input type="number" placeholder="1" value={progForm.idAdministrativo}
                onChange={(e) => setP('idAdministrativo', numVal(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ID Otros valores</label>
              <input type="number" placeholder="1" value={progForm.idOtros}
                onChange={(e) => setP('idOtros', numVal(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent" />
            </div>
          </div>

          <div className="flex gap-3 pt-1 sticky bottom-0 bg-white pb-1">
            <button type="submit" disabled={progSubmitting}
              className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              {progSubmitting && <Spinner />}
              {editingProg ? 'Actualizar' : 'Crear'} Programa
            </button>
            <button type="button" onClick={() => setShowProgModal(false)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Eliminar Programa ─────────────────────────────────────────── */}
      <Modal isOpen={showDelProgModal} onClose={() => setShowDelProgModal(false)} title="Eliminar Programa">
        <div className="space-y-4">
          {delProgError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{delProgError}</div>
          )}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <TrashIcon />
            </div>
            <p className="text-sm text-gray-500 pt-1">
              ¿Eliminar el programa <span className="font-semibold text-gray-800">{progToDelete?.nombre}</span>?
              Sus cohortes asociadas también serán eliminadas.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDelProgModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={confirmDeleteProg} disabled={delProgming}
              className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {delProgming && <Spinner />}
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Modal: Cohorte (crear / editar) ─────────────────────────────────── */}
      <Modal
        isOpen={showCohModal}
        onClose={() => setShowCohModal(false)}
        title={editingCoh ? 'Editar Cohorte' : 'Nueva Cohorte'}
        size="lg"
      >
        <form onSubmit={handleSaveCoh} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {cohFormError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{cohFormError}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
              <input
                type="text"
                placeholder="Cohorte 2026-1"
                value={cohForm.nombre}
                onChange={(e) => setC('nombre', e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cupos</label>
              <input
                type="number"
                placeholder="30"
                value={cohForm.cupos}
                onChange={(e) => setC('cupos', numVal(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
              <select
                value={cohForm.idEstado}
                onChange={(e) => setC('idEstado', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
              >
                <option value="">Seleccionar estado</option>
                {estados.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.tipo}{est.entidad ? ` (${est.entidad})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Semestre</label>
              <select
                value={cohForm.idSemestre}
                onChange={(e) => setC('idSemestre', e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
              >
                <option value="">Seleccionar semestre</option>
                {semestres.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Modalidad</label>
            <select
              value={cohForm.idModalidad}
              onChange={(e) => setC('idModalidad', e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            >
              <option value="">Seleccionar modalidad</option>
              {modalidades.map((m) => (
                <option key={m.id} value={m.id}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Plazo documentación</label>
            <select
              value={cohForm.idPlazodocumentacion}
              onChange={(e) => setC('idPlazodocumentacion', e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            >
              <option value="">Seleccionar plazo</option>
              {plazos.map((p) => (
                <option key={p.id} value={p.id}>{plazoLabel(p)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Plazo inscripción</label>
            <select
              value={cohForm.idPlazoinscripcion}
              onChange={(e) => setC('idPlazoinscripcion', e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            >
              <option value="">Seleccionar plazo</option>
              {plazos.map((p) => (
                <option key={p.id} value={p.id}>{plazoLabel(p)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Plazo pago</label>
            <select
              value={cohForm.idPlazopago}
              onChange={(e) => setC('idPlazopago', e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent"
            >
              <option value="">Seleccionar plazo</option>
              {plazos.map((p) => (
                <option key={p.id} value={p.id}>{plazoLabel(p)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={cohForm.requiereentrevista}
                  onChange={(e) => setC('requiereentrevista', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-slate-900 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">Requiere entrevista</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={cohForm.requiereprueba}
                  onChange={(e) => setC('requiereprueba', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-slate-900 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm font-medium text-gray-700">Requiere prueba</span>
            </label>
          </div>

          <div className="flex gap-3 pt-1 sticky bottom-0 bg-white pb-1">
            <button type="submit" disabled={cohSubmitting}
              className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
              {cohSubmitting && <Spinner />}
              {editingCoh ? 'Actualizar' : 'Crear'} Cohorte
            </button>
            <button type="button" onClick={() => setShowCohModal(false)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Eliminar Cohorte ──────────────────────────────────────────── */}
      <Modal isOpen={showDelCohModal} onClose={() => setShowDelCohModal(false)} title="Eliminar Cohorte">
        <div className="space-y-4">
          {delCohError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{delCohError}</div>
          )}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <TrashIcon />
            </div>
            <p className="text-sm text-gray-500 pt-1">
              ¿Eliminar la cohorte <span className="font-semibold text-gray-800">{cohToDelete?.nombre}</span>?
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDelCohModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={confirmDeleteCoh} disabled={delCohming}
              className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {delCohming && <Spinner />}
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
