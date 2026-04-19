/**
 * AspiranteEntrevista
 *
 * Vista de entrevista del aspirante.
 *
 * TODO: conectar con el backend para obtener fecha, hora, evaluador y resultado.
 */

export default function AspiranteEntrevista() {
  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Entrevista</h1>
        <p className="mt-1 text-sm text-gray-500">
          Información sobre tu entrevista de admisión al programa de postgrado.
        </p>
      </div>

      <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <span className="font-semibold">Modo demo:</span> esta pantalla de entrevista es simulada y no posee datos.
      </div>

    </div>
  );
}
