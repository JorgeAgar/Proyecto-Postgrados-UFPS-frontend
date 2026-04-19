/**
 * AspiranteDocumentos
 *
 * Vista de documentos del aspirante.
 *
 * TODO: conectar con el backend para listar, subir y verificar documentos.
 */

export default function AspiranteDocumentos() {
  return (
    <div className="p-6 sm:p-8 max-w-2xl mx-auto">
 
      {/* Encabezado */}
      <div className="animate-fade-in-up delay-0 mb-8">
        <h1 className="text-2xl font-black text-gray-900">Documentos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Lista de documentos requeridos para tu proceso de admisión.
        </p>
      </div>
 
      {/* Banner demo */}
      <div className="animate-fade-in delay-100 mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        <span className="font-semibold">Modo demo:</span> todavía no esta diseñado este apartado, es simulado.
      </div>

    </div>
  );
}
