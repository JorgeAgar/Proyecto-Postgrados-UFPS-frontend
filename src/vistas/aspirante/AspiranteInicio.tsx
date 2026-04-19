import { Link } from "react-router";
import { readMockSession } from "../../utils/mockAuth";

function GridCard({
  title,
  description,
  to,
  colorClass,
}: {
  title: string;
  description: string;
  to: string;
  colorClass: string;
}) {
  return (
    <Link
      to={to}
      className={`block rounded-2xl border p-5 transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 ${colorClass}`}
    >
      <h3 className="font-bold text-gray-800 text-base">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </Link>
  );
}

/**
 * AspiranteInicio
 *
 * Vista de bienvenida del aspirante. Punto de entrada después del login.
 * Muestra accesos directos a las secciones principales del flujo.
 */
export default function AspiranteInicio() {
  const session = readMockSession();
  const displayName = session?.displayName ?? "Aspirante";

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      {/* Encabezado de bienvenida */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">
          Bienvenido al Sistema de Postgrados
        </h1>
        <p className="mt-2 text-gray-500">
          Hola,{" "}
          <span className="font-semibold text-red-700">{displayName}</span>. Usa
          el menú lateral para navegar.
        </p>
      </div>

      {/* Tarjetas de acceso rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GridCard
          title="Estado del aspirante"
          description="Consulta el estado actual de tu proceso de admisión."
          to="/aspirante/estado"
          colorClass="bg-red-50 border-red-100 hover:border-red-300"
        />
        <GridCard
          title="Documentos"
          description="Gestiona y sube los documentos requeridos."
          to="/aspirante/documentos"
          colorClass="bg-blue-50 border-blue-100 hover:border-blue-300"
        />
        <GridCard
          title="Entrevista"
          description="Revisa la información y fechas de tu entrevista."
          to="/aspirante/entrevista"
          colorClass="bg-green-50 border-green-100 hover:border-green-300"
        />
        <GridCard
          title="Prueba"
          description="Consulta los detalles y resultados de tu prueba de admisión."
          to="/aspirante/prueba"
          colorClass="bg-yellow-50 border-yellow-100 hover:border-yellow-300"
        />
      </div>
    </div>
  );
}
