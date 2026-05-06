import { Link } from "react-router";
import { comiteAuthService } from "../../services/comiteService";

// ── Sub-componentes ───────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  color,
  delay,
}: {
  title: string;
  value: string | number;
  sub: string;
  color: string;
  delay: string;
}) {
  return (
    <div className={`animate-fade-in-up ${delay} rounded-2xl border bg-white p-5 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{title}</p>
      <p className={`mt-1 text-4xl font-black ${color}`}>{value}</p>
      <p className="mt-1 text-sm text-gray-500">{sub}</p>
    </div>
  );
}

function QuickLink({
  to,
  label,
  description,
  colorClass,
  delay,
}: {
  to: string;
  label: string;
  description: string;
  colorClass: string;
  delay: string;
}) {
  return (
    <Link
      to={to}
      className={`animate-fade-in-up ${delay} block rounded-2xl border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${colorClass}`}
    >
      <h3 className="font-bold text-gray-800 text-sm">{label}</h3>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </Link>
  );
}

// ── Vista principal ───────────────────────────────────────────────────────────

export default function ComiteInicio() {
  const session = comiteAuthService.getSession();
  const displayName = session?.displayName ?? "Comité Curricular";

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">

      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-1.5 rounded-full bg-red-700" />
          <div>
            <h1 className="text-2xl font-black text-gray-900">Panel del Comité Curricular</h1>
            <p className="text-sm text-gray-500">
              Bienvenido,{" "}
              <span className="font-semibold text-red-700">{displayName}</span>.
              {" "}Gestiona criterios, entrevistas, pruebas y admisiones.
            </p>
          </div>
        </div>
      </div>

      {/* Indicadores rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard title="Criterios"    value={7} sub="Definidos esta cohorte" color="text-red-700"    delay="delay-100" />
        <StatCard title="Entrevistas"  value={3} sub="Programadas"            color="text-blue-700"   delay="delay-200" />
        <StatCard title="Pruebas"      value={2} sub="Activas"                color="text-green-700"  delay="delay-300" />
        <StatCard title="Aspirantes"   value={4} sub="En evaluación"          color="text-orange-600" delay="delay-400" />
      </div>

      {/* Accesos rápidos */}
      <h2 className="animate-fade-in-up delay-300 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
        Accesos rápidos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <QuickLink
          to="/comite/criterios"
          label="Ver criterios de evaluación"
          description="Consulta todos los criterios definidos para la cohorte actual."
          colorClass="bg-red-50 border-red-100 hover:border-red-300"
          delay="delay-100"
        />
        <QuickLink
          to="/comite/criterios/definir"
          label="Definir nuevo criterio"
          description="Registra un nuevo criterio de evaluación con su peso porcentual."
          colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
          delay="delay-150"
        />
        <QuickLink
          to="/comite/entrevista"
          label="Ver entrevistas"
          description="Revisa las entrevistas agendadas con los aspirantes."
          colorClass="bg-green-50 border-green-100 hover:border-green-300"
          delay="delay-200"
        />
        <QuickLink
          to="/comite/prueba"
          label="Ver pruebas de admisión"
          description="Consulta y gestiona las pruebas de admisión activas."
          colorClass="bg-yellow-50 border-yellow-100 hover:border-yellow-300"
          delay="delay-250"
        />
        <QuickLink
          to="/comite/admision"
          label="Admitir / Rechazar aspirantes"
          description="Toma decisiones de admisión basadas en las valoraciones."
          colorClass="bg-purple-50 border-purple-100 hover:border-purple-300"
          delay="delay-300"
        />
        <QuickLink
          to="/comite/admision/lista"
          label="Lista de admitidos"
          description="Genera y consulta la lista oficial de aspirantes admitidos."
          colorClass="bg-emerald-50 border-emerald-100 hover:border-emerald-300"
          delay="delay-400  "
        />
      </div>

      {/* Flujo del proceso
      <h2 className="animate-fade-in-up delay-400 text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
        Flujo del proceso
      </h2>
      <div className="animate-fade-in-up delay-500 rounded-2xl border bg-white p-5 shadow-sm">
        <ol className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">
          {[
            { n: "1", label: "Inscripción", active: false },
            { n: "2", label: "Validación",  active: false },
            { n: "3", label: "Admisión",    active: true  },
            { n: "4", label: "Legalización",active: false },
          ].map((step, i, arr) => (
            <li key={step.n} className="flex items-center gap-2 flex-1">
              <div
                className={[
                  "flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold shrink-0",
                  step.active
                    ? "bg-red-700 text-white ring-4 ring-red-100"
                    : "bg-gray-100 text-gray-500",
                ].join(" ")}
              >
                {step.n}
              </div>
              <span className={`text-sm font-semibold ${step.active ? "text-red-700" : "text-gray-400"}`}>
                {step.label}
              </span>
              {i < arr.length - 1 && (
                <div className="hidden sm:block flex-1 h-px bg-gray-200 mx-2" />
              )}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-xs text-gray-400">
          El Comité Curricular actúa principalmente en la etapa de{" "}
          <span className="font-semibold text-red-700">Admisión</span>: define criterios,
          valora aspirantes y aprueba la lista de admitidos.
        </p>
      </div> */}

      {/* Aviso de configuración */}
      <div className="animate-fade-in-up delay-400 mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-sm font-semibold text-amber-800">Recuerda</p>
        <p className="mt-1 text-sm text-amber-700">
          La suma de los pesos de los criterios por programa y cohorte debe ser exactamente{" "}
          <strong>100%</strong>. Completa esta configuración antes del inicio del proceso de admisión.
        </p>
      </div>

    </div>
  );
}