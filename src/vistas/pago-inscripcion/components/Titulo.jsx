import {CreditCardIcon} from "@heroicons/react/24/outline";

function Titulo() {
  return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
            <CreditCardIcon className="w-15 h-15 text-red-600" />
        </div>
        <div>   
        <h2 className="text-3xl font-bold">Pago de Inscripción</h2>
        <p className="text-gray-600">
        Consulta la información de tu inscripción, genera tu recibo y paga en línea.
      </p>
        </div>
    </div>
  );
}

export default Titulo;