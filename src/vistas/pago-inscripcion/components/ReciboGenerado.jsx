function ReciboGenerado({ recibo }) {
  if (!recibo) return null;

  return (
    <div className="bg-white rounded-xl shadow p-6 grid grid-cols-2 gap-6">

      {/* 🧾 RECIBO */}
      <div className="border rounded-lg p-4">
        <h4 className="font-bold mb-2">RECIBO DE PAGO</h4>

        <p><strong>N°:</strong> {recibo.numero}</p>
        <p><strong>Fecha:</strong> {recibo.fecha}</p>

        <hr className="my-2" />

        <p><strong>Aspirante:</strong> Juan Pérez</p>
        <p><strong>Programa:</strong> Maestría</p>

        <p className="mt-4 text-xl font-bold text-red-600">
          $150.000 COP
        </p>

        <span className="bg-yellow-200 px-2 py-1 rounded text-sm">
          Pendiente de pago
        </span>
      </div>

      {/* 🎯 ACCIONES */}
      <div className="space-y-4">

        <div className="border rounded-lg p-4">
          <h4 className="font-semibold">Descargar / Imprimir</h4>

          <button className="border px-4 py-2 mt-2 rounded-lg w-full">
            Descargar PDF
          </button>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-semibold">Pagar en línea</h4>

          <button className="bg-red-600 text-white px-4 py-2 mt-2 rounded-lg w-full">
            Pagar en línea
          </button>
        </div>

      </div>
    </div>
  );
}
export default ReciboGenerado;  