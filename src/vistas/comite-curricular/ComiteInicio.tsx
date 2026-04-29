import { Link } from "react-router";
import { comiteAuthService } from "../../services/comiteCurricularService";

const BASE = "/comite-curricular";

function StatCard({
  value,
  label,
  colorClass,
}: {
  value: string | number;
  label: string;
  colorClass: string;
}) {
  return (
    <div className={`animate-scale-in rounded-2xl border p-5 ${colorClass}`}>
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

function QuickCard({
  title,
  description,
  to,
  colorClass,
  delay,
}: {
  title: string;
  description: string;
  to: string;
  colorClass: string;
  delay: string;
}) {
  return (
    <Link
      to={to}
      className={`animate-fade-in-up ${delay} block rounded-2xl border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${colorClass}`}
    >
      <h3 className="font-bold text-gray-800 text-base">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </Link>
  );
}

export default function ComiteInicio() {
  const session = comiteAuthService.getSession();
  const displayName = session?.displayName ?? "Comité Curricular";

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 mb-8">
        <h1 className="text-3xl font-black text-gray-900">
          Panel del Comité Curricular
        </h1>
        <p className="mt-2 text-gray-500">
          Bienvenido,{" "}
          <span className="font-semibold text-red-700">{displayName}</span>.
          Gestiona los criterios de evaluación, entrevistas, pruebas y decisiones de admisión.
        </p>
      </div>

      {/* Estadísticas rápidas (mock) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard value={7} label="Criterios activos" colorClass="bg-red-50 border-red-100" />
        <StatCard value={3} label="Entrevistas programadas" colorClass="bg-blue-50 border-blue-100" />
        <StatCard value={2} label="Pruebas configuradas" colorClass="bg-yellow-50 border-yellow-100" />
        <StatCard value={3} label="Aspirantes en evaluación" colorClass="bg-green-50 border-green-100" />
      </div>

      {/* Accesos rápidos */}
      <h2 className="animate-fade-in-up delay-200 text-lg font-bold text-gray-700 mb-4">
        Accesos rápidos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickCard
          title="Criterios de evaluación"
          description="Ver, definir, editar o eliminar criterios para las cohortes activas."
          to={`${BASE}/criterios/ver`}
          colorClass="bg-red-50 border-red-100 hover:border-red-300"
          delay="delay-200"
        />
        <QuickCard
          title="Entrevistas"
          description="Agendar y gestionar entrevistas con los aspirantes del programa."
          to={`${BASE}/entrevista/ver`}
          colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
          delay="delay-300"
        />
        <QuickCard
          title="Pruebas de admisión"
          description="Crear y administrar las pruebas de conocimiento de cada cohorte."
          to={`${BASE}/prueba/ver`}
          colorClass="bg-yellow-50 border-yellow-100 hover:border-yellow-300"
          delay="delay-400"
        />
        <QuickCard
          title="Decisiones de admisión"
          description="Admitir o rechazar aspirantes y generar la lista oficial de admitidos."
          to={`${BASE}/admision/decision`}
          colorClass="bg-green-50 border-green-100 hover:border-green-300"
          delay="delay-500"
        />
      </div>

      {/* Aviso informativo */}
      <div className="animate-fade-in-up delay-600 mt-8 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-sm font-semibold text-amber-800">Recuerda</p>
        <p className="mt-1 text-sm text-amber-700">
          La suma de los pesos de los criterios de evaluación por programa y cohorte debe ser exactamente <strong>100%</strong>.
          Asegúrate de completar esta configuración antes del inicio del proceso de admisión.
        </p>
      </div>
    </div>
  );
}
