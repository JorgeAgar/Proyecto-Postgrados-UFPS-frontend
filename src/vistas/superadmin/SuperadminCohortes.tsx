import { useState } from 'react';
import { Modal } from './components/Modal';

// ── Íconos ────────────────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
    </svg>
  );
}

function ChevronRightIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={`w-5 h-5 shrink-0 transition-transform duration-300 ${open ? 'rotate-90' : 'rotate-0'}`}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Programa = {
  id: number;
  nombre: string;
  facultad: string;
  numeroEstudiantes: number;
};

type Semestre = {
  id: string;
  nombre: string;
  programas: Programa[];
};

// ── Datos mock ────────────────────────────────────────────────────────────────

const mockSemestres: Semestre[] = [
  {
    id: '2026-1',
    nombre: '2026-1',
    programas: [
      { id: 1,  nombre: 'Maestría en Ingeniería de Software',          facultad: 'Ingeniería', numeroEstudiantes: 45 },
      { id: 2,  nombre: 'Doctorado en Ciencias de la Computación',     facultad: 'Ciencias',   numeroEstudiantes: 12 },
      { id: 3,  nombre: 'Maestría en Inteligencia Artificial',         facultad: 'Ingeniería', numeroEstudiantes: 38 },
    ],
  },
  {
    id: '2025-2',
    nombre: '2025-2',
    programas: [
      { id: 4,  nombre: 'Maestría en Ciencia de Datos',                facultad: 'Ciencias',   numeroEstudiantes: 52 },
      { id: 5,  nombre: 'Doctorado en Matemáticas Aplicadas',          facultad: 'Ciencias',   numeroEstudiantes: 8  },
      { id: 6,  nombre: 'Maestría en Ingeniería Civil',                facultad: 'Ingeniería', numeroEstudiantes: 30 },
      { id: 7,  nombre: 'Maestría en Administración de Empresas',      facultad: 'Negocios',   numeroEstudiantes: 65 },
    ],
  },
  {
    id: '2025-1',
    nombre: '2025-1',
    programas: [
      { id: 8,  nombre: 'Maestría en Ingeniería Industrial',           facultad: 'Ingeniería',   numeroEstudiantes: 42 },
      { id: 9,  nombre: 'Doctorado en Física',                         facultad: 'Ciencias',     numeroEstudiantes: 10 },
      { id: 10, nombre: 'Maestría en Arquitectura',                    facultad: 'Arquitectura', numeroEstudiantes: 28 },
    ],
  },
  {
    id: '2024-2',
    nombre: '2024-2',
    programas: [
      { id: 11, nombre: 'Maestría en Derecho Corporativo',             facultad: 'Derecho',    numeroEstudiantes: 35 },
      { id: 12, nombre: 'Maestría en Psicología Clínica',              facultad: 'Psicología', numeroEstudiantes: 40 },
    ],
  },
];

// ── SemestreItem ──────────────────────────────────────────────────────────────

interface SemestreItemProps {
  semestre: Semestre;
  delay: string;
  onEdit: (semestre: Semestre, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onAddPrograma: (semestreId: string, e: React.MouseEvent) => void;
  onEditPrograma: (programa: Programa, semestreId: string, e: React.MouseEvent) => void;
  onDeletePrograma: (programaId: number, semestreId: string, e: React.MouseEvent) => void;
}

function SemestreItem({
  semestre,
  delay,
  onEdit,
  onDelete,
  onAddPrograma,
  onEditPrograma,
  onDeletePrograma,
}: SemestreItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`animate-fade-in-up ${delay} border border-gray-200 rounded-lg overflow-hidden bg-white`}>
      {/* Cabecera del semestre */}
      <div
        className={[
          'flex items-center justify-between px-5 py-4 transition-all',
          open ? 'bg-slate-900 text-white' : 'bg-white text-gray-900',
        ].join(' ')}
      >
        {/* Área clickeable para toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <span className={open ? 'text-slate-300' : 'text-gray-400'}>
            <CalendarIcon />
          </span>
          <div className="min-w-0">
            <div className="font-semibold">{semestre.nombre}</div>
            <div className={`text-sm ${open ? 'text-slate-300' : 'text-gray-500'}`}>
              {semestre.programas.length} programa{semestre.programas.length !== 1 ? 's' : ''}
            </div>
          </div>
        </button>

        {/* Acciones */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={(e) => onEdit(semestre, e)}
            title="Editar semestre"
            className={`p-2 rounded-lg transition-colors ${
              open ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <PencilIcon />
          </button>
          <button
            onClick={(e) => onDelete(semestre.id, e)}
            title="Eliminar semestre"
            className={`p-2 rounded-lg transition-colors ${
              open ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <TrashIcon />
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className={`p-2 rounded-lg transition-colors ${
              open ? 'text-white hover:bg-white/20' : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <ChevronRightIcon open={open} />
          </button>
        </div>
      </div>

      {/* Panel desplegable de programas */}
      <div
        className={[
          'overflow-hidden transition-all duration-300 ease-in-out',
          open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
          <div>
            <button
              onClick={(e) => onAddPrograma(semestre.id, e)}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              <PlusIcon />
              Agregar Programa
            </button>
          </div>

          {semestre.programas.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No hay programas en este semestre
            </p>
          )}

          {semestre.programas.map((programa) => (
            <div
              key={programa.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2 rounded-lg shrink-0 text-white">
                  <AcademicCapIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm mb-0.5 truncate">
                    {programa.nombre}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      <span className="font-medium text-gray-700">Facultad:</span> {programa.facultad}
                    </span>
                    <span>·</span>
                    <span>
                      <span className="font-medium text-gray-700">Estudiantes:</span>{' '}
                      {programa.numeroEstudiantes}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => onEditPrograma(programa, semestre.id, e)}
                    title="Editar programa"
                    className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <PencilIcon />
                  </button>
                  <button
                    onClick={(e) => onDeletePrograma(programa.id, semestre.id, e)}
                    title="Eliminar programa"
                    className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function SuperadminCohortes() {
  const [semestres, setSemestres] = useState<Semestre[]>(mockSemestres);

  // ── Estado: modales de semestre ──────────────────────────────────────────
  const [showSemestreModal, setShowSemestreModal] = useState(false);
  const [editingSemestre, setEditingSemestre] = useState<Semestre | null>(null);
  const [semestreFormData, setSemestreFormData] = useState({ nombre: '' });
  const [showDeleteSemestreModal, setShowDeleteSemestreModal] = useState(false);
  const [semestreToDelete, setSemestreToDelete] = useState<string | null>(null);

  // ── Estado: modales de programa ──────────────────────────────────────────
  const [showProgramaModal, setShowProgramaModal] = useState(false);
  const [editingPrograma, setEditingPrograma] = useState<Programa | null>(null);
  const [programaFormData, setProgramaFormData] = useState({
    nombre: '',
    facultad: '',
    numeroEstudiantes: '',
  });
  const [semestreIdParaPrograma, setSemestreIdParaPrograma] = useState<string | null>(null);
  const [showDeleteProgramaModal, setShowDeleteProgramaModal] = useState(false);
  const [programaToDelete, setProgramaToDelete] = useState<{
    programaId: number;
    semestreId: string;
  } | null>(null);

  // ── Handlers: semestre ───────────────────────────────────────────────────

  const openCreateSemestreModal = () => {
    setEditingSemestre(null);
    setSemestreFormData({ nombre: '' });
    setShowSemestreModal(true);
  };

  const openEditSemestreModal = (semestre: Semestre, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSemestre(semestre);
    setSemestreFormData({ nombre: semestre.nombre });
    setShowSemestreModal(true);
  };

  const openDeleteSemestreModal = (semestreId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSemestreToDelete(semestreId);
    setShowDeleteSemestreModal(true);
  };

  const handleSaveSemestre = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSemestre) {
      setSemestres((prev) =>
        prev.map((s) =>
          s.id === editingSemestre.id
            ? { ...s, id: semestreFormData.nombre, nombre: semestreFormData.nombre }
            : s
        )
      );
    } else {
      const newSemestre: Semestre = {
        id: semestreFormData.nombre,
        nombre: semestreFormData.nombre,
        programas: [],
      };
      setSemestres((prev) => [newSemestre, ...prev]);
    }
    setShowSemestreModal(false);
    setEditingSemestre(null);
    setSemestreFormData({ nombre: '' });
  };

  const confirmDeleteSemestre = () => {
    if (semestreToDelete) {
      setSemestres((prev) => prev.filter((s) => s.id !== semestreToDelete));
    }
    setShowDeleteSemestreModal(false);
    setSemestreToDelete(null);
  };

  // ── Handlers: programa ───────────────────────────────────────────────────

  const openCreateProgramaModal = (semestreId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPrograma(null);
    setProgramaFormData({ nombre: '', facultad: '', numeroEstudiantes: '' });
    setSemestreIdParaPrograma(semestreId);
    setShowProgramaModal(true);
  };

  const openEditProgramaModal = (
    programa: Programa,
    semestreId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setEditingPrograma(programa);
    setProgramaFormData({
      nombre: programa.nombre,
      facultad: programa.facultad,
      numeroEstudiantes: programa.numeroEstudiantes.toString(),
    });
    setSemestreIdParaPrograma(semestreId);
    setShowProgramaModal(true);
  };

  const openDeleteProgramaModal = (
    programaId: number,
    semestreId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setProgramaToDelete({ programaId, semestreId });
    setShowDeleteProgramaModal(true);
  };

  const handleSavePrograma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semestreIdParaPrograma) return;

    if (editingPrograma) {
      setSemestres((prev) =>
        prev.map((s) => {
          if (s.id !== semestreIdParaPrograma) return s;
          return {
            ...s,
            programas: s.programas.map((p) =>
              p.id === editingPrograma.id
                ? {
                    ...p,
                    nombre: programaFormData.nombre,
                    facultad: programaFormData.facultad,
                    numeroEstudiantes: parseInt(programaFormData.numeroEstudiantes),
                  }
                : p
            ),
          };
        })
      );
    } else {
      const newPrograma: Programa = {
        id: Date.now(),
        nombre: programaFormData.nombre,
        facultad: programaFormData.facultad,
        numeroEstudiantes: parseInt(programaFormData.numeroEstudiantes),
      };
      setSemestres((prev) =>
        prev.map((s) => {
          if (s.id !== semestreIdParaPrograma) return s;
          return { ...s, programas: [...s.programas, newPrograma] };
        })
      );
    }
    setShowProgramaModal(false);
    setEditingPrograma(null);
    setProgramaFormData({ nombre: '', facultad: '', numeroEstudiantes: '' });
    setSemestreIdParaPrograma(null);
  };

  const confirmDeletePrograma = () => {
    if (programaToDelete) {
      setSemestres((prev) =>
        prev.map((s) => {
          if (s.id !== programaToDelete.semestreId) return s;
          return {
            ...s,
            programas: s.programas.filter((p) => p.id !== programaToDelete.programaId),
          };
        })
      );
    }
    setShowDeleteProgramaModal(false);
    setProgramaToDelete(null);
  };

  const semestreToDeleteObj = semestres.find((s) => s.id === semestreToDelete);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8">
      {/* Encabezado */}
      <div className="animate-fade-in-up flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Cohortes por Semestre</h1>
          <p className="text-gray-500 text-sm">Selecciona un semestre para ver los programas activos</p>
        </div>
        <button
          onClick={openCreateSemestreModal}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shrink-0"
        >
          <FolderPlusIcon />
          Crear Semestre
        </button>
      </div>

      {/* Lista de semestres */}
      <div className="space-y-3 max-w-3xl mx-auto">
        {semestres.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No hay semestres creados. Crea uno nuevo con el botón de arriba.
          </div>
        )}
        {semestres.map((semestre, idx) => (
          <SemestreItem
            key={semestre.id}
            semestre={semestre}
            delay={`delay-${Math.min((idx + 1) * 100, 500)}`}
            onEdit={openEditSemestreModal}
            onDelete={openDeleteSemestreModal}
            onAddPrograma={openCreateProgramaModal}
            onEditPrograma={openEditProgramaModal}
            onDeletePrograma={openDeleteProgramaModal}
          />
        ))}
      </div>

      {/* Modal: Crear / Editar Semestre */}
      <Modal
        isOpen={showSemestreModal}
        onClose={() => setShowSemestreModal(false)}
        title={editingSemestre ? 'Editar Semestre' : 'Nuevo Semestre'}
      >
        <form onSubmit={handleSaveSemestre} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre del semestre (ej: 2026-1, 2026-2)
            </label>
            <input
              type="text"
              placeholder="2026-1"
              value={semestreFormData.nombre}
              onChange={(e) => setSemestreFormData({ nombre: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
              required
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              {editingSemestre ? 'Actualizar' : 'Crear'} Semestre
            </button>
            <button
              type="button"
              onClick={() => setShowSemestreModal(false)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Crear / Editar Programa */}
      <Modal
        isOpen={showProgramaModal}
        onClose={() => setShowProgramaModal(false)}
        title={editingPrograma ? 'Editar Programa' : 'Nuevo Programa'}
      >
        <form onSubmit={handleSavePrograma} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre del programa
            </label>
            <input
              type="text"
              placeholder="Maestría en Ingeniería de Software"
              value={programaFormData.nombre}
              onChange={(e) =>
                setProgramaFormData({ ...programaFormData, nombre: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Facultad</label>
            <input
              type="text"
              placeholder="Ingeniería"
              value={programaFormData.facultad}
              onChange={(e) =>
                setProgramaFormData({ ...programaFormData, facultad: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Número de estudiantes
            </label>
            <input
              type="number"
              placeholder="45"
              value={programaFormData.numeroEstudiantes}
              onChange={(e) =>
                setProgramaFormData({ ...programaFormData, numeroEstudiantes: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
              required
              min="1"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              {editingPrograma ? 'Actualizar' : 'Crear'} Programa
            </button>
            <button
              type="button"
              onClick={() => setShowProgramaModal(false)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirmar eliminar semestre */}
      <Modal
        isOpen={showDeleteSemestreModal}
        onClose={() => setShowDeleteSemestreModal(false)}
        title="Eliminar Semestre"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <TrashIcon />
            </div>
            <p className="text-sm text-gray-500 pt-1">
              ¿Estás seguro de que deseas eliminar el semestre{' '}
              <span className="font-semibold text-gray-800">{semestreToDeleteObj?.nombre}</span>?
              Esta acción no se puede deshacer y se eliminarán todos sus programas.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteSemestreModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteSemestre}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Confirmar eliminar programa */}
      <Modal
        isOpen={showDeleteProgramaModal}
        onClose={() => setShowDeleteProgramaModal(false)}
        title="Eliminar Programa"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <TrashIcon />
            </div>
            <p className="text-sm text-gray-500 pt-1">
              ¿Estás seguro de que deseas eliminar este programa? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteProgramaModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeletePrograma}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
