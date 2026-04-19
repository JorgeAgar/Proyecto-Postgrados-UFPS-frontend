/**
 * AspirantePrueba
 *
 * Vista de prueba de admisión del aspirante.
 *
 * TODO: conectar con el backend para obtener datos solicitados.
 */

export default function AspirantePrueba() {
  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Prueba de admisión</h1>
        <p className="mt-1 text-sm text-gray-500">
          Detalles y resultado de tu prueba de admisión al programa de postgrado.
        </p>
      </div>

      <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <span className="font-semibold">Modo demo:</span> la pantalla es simulada.
      </div>
    </div>
  );
}
