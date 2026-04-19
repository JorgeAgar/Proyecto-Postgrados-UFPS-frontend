import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { clearMockSession, readMockSession } from "../../utils/mockAuth";

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 9h18" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4a2 2 0 01-.6-1.4V10a6 6 0 10-12 0v4.2a2 2 0 01-.6 1.4L4 17h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 20a2.5 2.5 0 005 0" />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v6h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 13h6M10 17h6" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16v-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16v-3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h8a2 2 0 012 2v12a2 2 0 01-2 2H9" />
    </svg>
  );
}

const QUICK_ACTIONS = [
  {
    title: "Programar comite",
    subtitle: "Agenda una revision para esta semana",
    icon: CalendarIcon,
  },
  {
    title: "Revisar notificaciones",
    subtitle: "Tienes 7 alertas pendientes",
    icon: BellIcon,
  },
  {
    title: "Gestionar expedientes",
    subtitle: "Abre y valida documentos cargados",
    icon: DocsIcon,
  },
  {
    title: "Ver indicadores",
    subtitle: "Consulta avance del proceso de admision",
    icon: ChartIcon,
  },
];

const ACTIVITY = [
  "14 aspirantes nuevos registrados hoy",
  "6 solicitudes listas para aprobacion",
  "2 casos requieren verificacion de documentos",
];

export default function FuncionarioHome() {
  const navigate = useNavigate();
  const session = useMemo(() => readMockSession(), []);

  if (!session || session.userRole !== "funcionario") {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <section className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Sesion no disponible</h1>
          <p className="text-sm text-slate-600 mt-2">
            Para entrar al Home de funcionario, inicia sesion desde el formulario demo.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Volver al login
          </Link>
        </section>
      </main>
    );
  }

  const handleLogout = () => {
    clearMockSession();
    navigate("/");
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="bg-gradient-to-r from-red-950 via-red-800 to-amber-700 text-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.18em] text-red-200">Portal de funcionarios</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black leading-tight">
            Bienvenido, equipo administrativo UFPS
          </h1>
          <p className="mt-3 text-sm text-red-100 max-w-3xl">
            Flujo simulado activo. Este Home permite validar experiencia de usuario y navegacion
            antes de conectar autenticacion real y servicios backend.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-white/15 px-3 py-1">Usuario: {session.email}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">Acceso: Funcionario</span>
            <span className="rounded-full bg-white/15 px-3 py-1">Sesion demo</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <article className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Acciones rapidas</h2>
            <p className="text-sm text-slate-600 mt-1">Accede a los modulos mas usados del proceso de admisiones.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {QUICK_ACTIONS.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    type="button"
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-red-300 hover:bg-red-50 transition-colors"
                  >
                    <span className="inline-flex items-center justify-center rounded-lg bg-white border border-slate-200 p-2 text-red-700">
                      <Icon />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-600">{item.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Actividad reciente</h2>
            <ul className="mt-4 space-y-3">
              {ACTIVITY.map((item) => (
                <li key={item} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <aside className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-slate-900">Sesion simulada</h2>
          <p className="mt-2 text-sm text-slate-600">
            Puedes cerrar sesion para volver al login y probar de nuevo el flujo de ingreso.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <LogoutIcon />
            Cerrar sesion demo
          </button>
        </aside>
      </section>
    </main>
  );
}
