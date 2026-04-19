import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { clearMockSession, readMockSession } from "../../utils/mockAuth";

function TrendUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l5-5 4 4 7-7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 8h6v6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 00-3-3.87" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h8l5 5v13H7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 3v5h5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 13h6M10 17h6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
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

const KPI_CARDS = [
  {
    title: "Aspirantes activos",
    value: "214",
    delta: "+12 hoy",
    icon: UsersIcon,
    color: "text-red-700",
    bg: "bg-red-50",
  },
  {
    title: "Expedientes revisados",
    value: "89",
    delta: "+18 esta semana",
    icon: FileIcon,
    color: "text-sky-700",
    bg: "bg-sky-50",
  },
  {
    title: "Tasa de aprobacion",
    value: "72%",
    delta: "+4.3%",
    icon: TrendUpIcon,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    title: "Tiempo promedio",
    value: "2.8 dias",
    delta: "-0.6 dias",
    icon: ClockIcon,
    color: "text-violet-700",
    bg: "bg-violet-50",
  },
];

const PIPELINE = [
  { stage: "Registro", total: 214, widthClass: "w-full" },
  { stage: "Validacion documental", total: 163, widthClass: "w-3/4" },
  { stage: "Revision academica", total: 121, widthClass: "w-7/12" },
  { stage: "Comite", total: 84, widthClass: "w-2/5" },
  { stage: "Admitidos", total: 61, widthClass: "w-[30%]" },
];

const TODAY_TASKS = [
  { time: "08:30", task: "Revision de documentos pendientes", owner: "Equipo de soporte" },
  { time: "10:00", task: "Comite de admisiones", owner: "Coordinacion academica" },
  { time: "14:30", task: "Publicacion de resultados parciales", owner: "Secretaria" },
  { time: "16:00", task: "Cierre de incidencias", owner: "Mesa de ayuda" },
];

export default function FuncionarioDashboard() {
  const navigate = useNavigate();
  const session = useMemo(() => readMockSession(), []);

  if (!session || session.userRole !== "funcionario") {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <section className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Acceso restringido</h1>
          <p className="text-sm text-slate-600 mt-2">
            Inicia sesion como funcionario para acceder al dashboard.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Ir al login
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
      <section className="bg-gradient-to-r from-slate-950 via-slate-800 to-red-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-red-200">Dashboard funcionario</p>
              <h1 className="mt-2 text-3xl font-black">Control de admisiones UFPS</h1>
              <p className="mt-2 text-sm text-slate-200">
                Vista simulada para validar el flujo operativo mientras se conecta backend.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/funcionario/home"
                className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
              >
                Volver al home
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                <LogoutIcon />
                Cerrar sesion
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/15 px-3 py-1">Usuario: {session.email}</span>
            <span className="rounded-full bg-white/15 px-3 py-1">Rol: Funcionario</span>
            <span className="rounded-full bg-amber-300/25 px-3 py-1 text-amber-100">Modo demo</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPI_CARDS.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                  <span className={`inline-flex rounded-lg p-2 ${item.bg} ${item.color}`}>
                    <Icon />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-black text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{item.delta}</p>
              </article>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Pipeline de admisiones</h2>
            <p className="mt-1 text-sm text-slate-600">Seguimiento por etapa del proceso actual.</p>
            <div className="mt-5 space-y-4">
              {PIPELINE.map((item) => (
                <div key={item.stage}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">{item.stage}</span>
                    <span className="text-slate-500">{item.total} casos</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r from-red-700 to-amber-500 ${item.widthClass}`} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Agenda del dia</h2>
            <p className="mt-1 text-sm text-slate-600">Tareas programadas para el equipo.</p>
            <ul className="mt-5 space-y-3">
              {TODAY_TASKS.map((item) => (
                <li key={item.time} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-red-700">{item.time}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.task}</p>
                  <p className="text-xs text-slate-600 mt-1">Responsable: {item.owner}</p>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
