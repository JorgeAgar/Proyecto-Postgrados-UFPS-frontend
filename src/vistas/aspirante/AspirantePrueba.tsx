/**
 * AspirantePrueba
 *
 * Vista de prueba de admisión del aspirante.
 *
 * TODO: conectar con el backend para obtener fecha, puntaje y resultado real.
 */

// interface InfoRowProps {
//   label: string;
//   value: string;
//   highlight?: boolean;
// }

// function InfoRow({ label, value, highlight }: InfoRowProps) {
//   return (
//     <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
//       <p className="text-sm text-gray-500">{label}</p>
//       <p className={`text-sm font-bold ${highlight ? "text-red-700" : "text-gray-800"}`}>{value}</p>
//     </div>
//   );
// }

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
