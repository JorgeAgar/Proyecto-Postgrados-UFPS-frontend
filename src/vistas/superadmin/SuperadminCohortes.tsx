import { useState } from 'react';

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

// ── Tipos ────────────────────────────────────────────────────────────────────

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
      { id: 8,  nombre: 'Maestría en Ingeniería Industrial',           facultad: 'Ingeniería',  numeroEstudiantes: 42 },
      { id: 9,  nombre: 'Doctorado en Física',                         facultad: 'Ciencias',    numeroEstudiantes: 10 },
      { id: 10, nombre: 'Maestría en Arquitectura',                    facultad: 'Arquitectura',numeroEstudiantes: 28 },
    ],
  },
  {
    id: '2024-2',
    nombre: '2024-2',
    programas: [
      { id: 11, nombre: 'Maestría en Derecho Corporativo',             facultad: 'Derecho',     numeroEstudiantes: 35 },
      { id: 12, nombre: 'Maestría en Psicología Clínica',              facultad: 'Psicología',  numeroEstudiantes: 40 },
    ],
  },
];

// ── Subcomponente: acordeón de semestre ──────────────────────────────────────

function SemestreItem({ semestre, delay }: { semestre: Semestre; delay: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`animate-fade-in-up ${delay} border border-gray-200 rounded-lg overflow-hidden bg-white`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={[
          "w-full flex items-center justify-between px-5 py-4 transition-all",
          open ? "bg-slate-900 text-white" : "bg-white text-gray-900 hover:bg-gray-50",
        ].join(" ")}
      >
        <div className="flex items-center gap-3">
          <span className={open ? "text-slate-300" : "text-gray-400"}>
            <CalendarIcon />
          </span>
          <div className="text-left">
            <div className="font-semibold">{semestre.nombre}</div>
            <div className={`text-sm ${open ? "text-slate-300" : "text-gray-500"}`}>
              {semestre.programas.length} programa{semestre.programas.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <span className={open ? "text-white" : "text-gray-400"}>
          <ChevronRightIcon open={open} />
        </span>
      </button>

      {/* Submenú con animación fluida */}
      <div
        className={[
          "overflow-hidden transition-all duration-300 ease-in-out",
          open ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
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
                      <span className="font-medium text-gray-700">Estudiantes:</span> {programa.numeroEstudiantes}
                    </span>
                  </div>
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
  return (
    <div className="p-6 md:p-8">
      <div className="animate-fade-in-up mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Cohortes por Semestre</h1>
        <p className="text-gray-500 text-sm">Selecciona un semestre para ver los programas activos</p>
      </div>

      <div className="space-y-3 max-w-3xl mx-auto">
        {mockSemestres.map((semestre, idx) => (
          <SemestreItem
            key={semestre.id}
            semestre={semestre}
            delay={`delay-${(idx + 1) * 100}`}
          />
        ))}
      </div>
    </div>
  );
}
