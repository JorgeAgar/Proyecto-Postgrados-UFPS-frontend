import {
    DocumentCurrencyDollarIcon,
    InformationCircleIcon
} from "@heroicons/react/24/outline";   

function GenerarRecibo({ onGenerar }) {
  return (
    <div className="space-y-2">      
        <h1 className="flex text-xl font-bold  text-red-600 mt gap-2">
            <DocumentCurrencyDollarIcon className="w-5 h-5 text-red-600 mt-1" /> Generar Recibo de Pago
        </h1>
        <p>Genera tu recibo de pago para continuar con la Inscripción.</p>   
        <div className="bg-white rounded-xl shadow p-6 text-center space-y-3">

            <button
                onClick={onGenerar}
                className="font-bold bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
                <DocumentCurrencyDollarIcon className="w-5 h-5 inline-block mr-2" /> 
                Generar recibo de pago
            </button>
            <span className="block mt-2 text-sm text-gray-500">
                <InformationCircleIcon className="w-4 h-4 inline-block mr-1 text-gray-400" />
                Al generar el recibo, podrás descargarlo e imprimirlo para realizar el pago.
            </span>
        </div>
    </div>
  );
}

export default GenerarRecibo;