import { useNavigate } from 'react-router';

// ── Íconos ────────────────────────────────────────────────────────────────────

function UserPlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-7 h-7 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}

function AcademicCapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-7 h-7 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function SuperadminInicio() {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8">
      <div className="animate-fade-in-up mb-8">
        <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-500 text-sm">Bienvenido al sistema de gestión de posgrados</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Card: Usuarios — el wrapper anima, el button no tiene delay para que el hover sea inmediato */}
        <div className="animate-fade-in-up delay-100">
          <button
            onClick={() => navigate('/superadmin/usuarios')}
            className="group w-full bg-white border border-gray-200 rounded-lg p-7 hover:border-gray-300 hover:shadow-md transition-colors text-left"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-900 transition-colors">
              <span className="text-slate-700 group-hover:text-white transition-colors">
                <UserPlusIcon />
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Usuarios</h2>
            <p className="text-sm text-gray-500">Gestionar usuarios del sistema</p>
          </button>
        </div>

        {/* Card: Cohortes */}
        <div className="animate-fade-in-up delay-200">
          <button
            onClick={() => navigate('/superadmin/cohortes')}
            className="group w-full bg-white border border-gray-200 rounded-lg p-7 hover:border-gray-300 hover:shadow-md transition-colors text-left"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-900 transition-colors">
              <span className="text-slate-700 group-hover:text-white transition-colors">
                <AcademicCapIcon />
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Cohortes</h2>
            <p className="text-sm text-gray-500">Ver cohortes por semestre</p>
          </button>
        </div>
      </div>
    </div>
  );
}
