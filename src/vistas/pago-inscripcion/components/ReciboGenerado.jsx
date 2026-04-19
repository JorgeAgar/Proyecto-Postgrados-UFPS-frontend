import {
  CalendarIcon,
  UserIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  PrinterIcon,
  CreditCardIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import logo  from "../../../assets/logo-horizontal.jpg";

function ReciboGenerado({ recibo }) {
  if (!recibo) return null;

  return (
    <div className=" bg-white rounded-2xl shadow p-6 grid md:grid-cols-2 gap-6">

      {/* 🧾 RECIBO ESTILO FACTURA */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 space-y-4 bg-white">

        {/* HEADER */}
        <div className="flex text-center justify-between border-b-2 border-dashed border-gray-300 my-3 pb-3">
            <img
                      src={logo}
                      alt="UFPS"
                      className="h-15 object-contain"
                    />
          <h4 className="font-bold text-lg Sjustify-center items-center gap-2">

            RECIBO DE PAGO
            <p className=" font-bold text-right text-sm text-red-500">N°{recibo.numero}</p>
          </h4>
          
        </div>

        {/* INFO */}
        <div className="space-y-2 text-sm">

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-gray-600">
              <CalendarIcon className="w-4 h-4" /> Fecha de generación
            </span>
            <span>{recibo.fecha}</span>
          </div>

        <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-gray-600">
              <CalendarIcon className="w-4 h-4" /> Fecha de vencimiento
            </span>
            <span>{recibo.fechaVencimiento|| "2024-06-30"}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-gray-600">
              <UserIcon className="w-4 h-4" /> Aspirante
            </span>
            <span>Juan Pérez</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-gray-600">
              <AcademicCapIcon className="w-4 h-4" /> Programa
            </span>
            <span>Maestría</span>
          </div>

        </div>

        {/* TOTAL */} 
        <div className="flex justify-between border-t-2 border-dashed border-gray-300 my-3">
             <p className="text-l font-bold  flex justify-center items-center gap-2">
            VALOR A PAGAR:
            </p>
          <p className="text-2xl font-bold text-red-600 flex justify-center items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5" />
            $150.000 COP
          </p>

        </div>
        <div className="flex justify-between border-t-2 border-dashed border-gray-300 my-3">
             <p className="text-l font-bold  flex justify-center items-center gap-2">
            ESTADO:
            </p>
          <span className="inline-block mt-2 bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium ">
            <InformationCircleIcon className="w-4 h-4 inline-block ml-1 m-0.5" />
            {recibo.estado || "Pendiente de pago"}
          </span>

        </div>

      </div>

      {/* 🎯 ACCIONES */}
      <div className="space-y-4">

        {/* 📄 DESCARGAR */}
        <div className="bg-white rounded-xl shadow p-6 text-center space-y-3">
          <h4 className="font-semibold flex items-center gap-2 text-gray-800">
            <PrinterIcon className="w-5 h-5 text-red-600" />
            Descargar / Imprimir
          </h4>

          <p className="text-sm text-gray-500 mt-1">
            Descarga tu recibo en formato PDF
          </p>

          <button className=" font-bold text-red-500 border-red-500 flex items-center justify-center gap-2 mt-3 border px-4 py-2 rounded-lg w-full hover:bg-gray-100 transition">
            <ArrowDownTrayIcon className="w-5 h-5 text-red-500" />
            Descargar Recibo
          </button>
        </div>

        {/* 💳 PAGAR */}
        <div className="bg-white rounded-xl shadow p-6 text-center space-y-3">
          <h4 className="font-semibold flex items-center gap-2 text-gray-800">
            <CreditCardIcon className="w-5 h-5 text-red-600" />
            Pagar en línea
          </h4>

          <p className="text-sm text-gray-500 mt-1">
            Realiza el pago de forma segura
          </p>

          <button className=" font-bold flex items-center justify-center gap-2 mt-3 bg-red-600 text-white px-4 py-2 rounded-lg w-full hover:bg-red-700 transition">
            Pagar en línea
            <ArrowRightIcon className="w-5 h-5 text-white" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default ReciboGenerado;