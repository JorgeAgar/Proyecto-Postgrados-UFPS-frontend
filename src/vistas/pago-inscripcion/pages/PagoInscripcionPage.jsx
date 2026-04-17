
function PagoInscripcionPage(){

    return( <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Pago de Inscripción
        </h1>

        <p className="text-gray-600 mb-6">
          Completa tus datos para continuar con el pago.
        </p>

        <input
          type="text"
          placeholder="Nombre completo"
          className="w-full border p-2 rounded-lg mb-3"
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full border p-2 rounded-lg mb-4"
        />

        <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
          Continuar
        </button>
      </div>
    </div>
  );
}

export default PagoInscripcionPage;