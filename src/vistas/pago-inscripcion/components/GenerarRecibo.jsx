function GenerarRecibo({ onGenerar }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 text-center">
      <h3 className="font-semibold mb-2">
        Generar recibo de pago
      </h3>

      <button
        onClick={onGenerar}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
      >
        Generar recibo de pago
      </button>
    </div>
  );
}

export default GenerarRecibo;