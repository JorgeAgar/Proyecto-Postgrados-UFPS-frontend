/**
 * AspiranteEntrevista
 *
 * Vista de entrevista del aspirante.
 *
 * TODO: conectar con el backend para obtener los datos solicitados.
 */

export default function AspiranteEntrevista() {
  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
 
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 mb-8">
        <h1 className="text-2xl font-black text-gray-900">Entrevista</h1>
        <p className="mt-1 text-sm text-gray-500">
          Información sobre tu entrevista de admisión al programa de postgrado.
        </p>
      </div>
 
      {/* Banner demo */}
      <div className="animate-fade-in delay-100 mb-6 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <span className="font-semibold">Modo demo:</span> esta pantalla de entrevista es simulada y no posee datos.
      </div>

    </div>
  );
}
