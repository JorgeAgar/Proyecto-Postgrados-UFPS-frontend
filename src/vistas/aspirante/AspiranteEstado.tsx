/**
 * AspiranteEstado
 *
 * Vista de estado del proceso del aspirante.
 * Muestra el progreso y estado actual de cada etapa del proceso de admisión.
 *
 * TODO: conectar con el backend para obtener datos reales del aspirante.
 */

export default function AspiranteEstado() {
  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Estado del aspirante</h1>
        <p className="mt-1 text-sm text-gray-500">
          Seguimiento de tu proceso de admisión a postgrados UFPS.
        </p>
      </div>

      {/* Banner de estado demo */}
      <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <span className="font-semibold">Modo demo:</span> esta página de estado es simulada, sin datos.
      </div>

    </div>
  );
}
