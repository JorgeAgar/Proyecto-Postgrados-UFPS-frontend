import {
  QuestionMarkCircleIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

function HelpSection() {
  return (
    <div className="bg-red-50 border border-red-100 rounded-xl px-6 py-4 flex items-center justify-between">

      <div className="flex items-center gap-4">
        
        <div className="bg-red-600 text-white rounded-full p-3">
          <QuestionMarkCircleIcon className="w-6 h-6" />
        </div>

        <div>
          <h3 className="font-semibold text-red-700">
            ¿Necesitas ayuda?
          </h3>
          <p className="text-gray-600 text-sm">
            Si tienes dudas sobre el proceso de pago, comunícate con nosotros.
          </p>
        </div>
      </div>

      <button className="flex items-center gap-2 border border-red-500 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition">
        <PhoneIcon className="w-5 h-5" />
        Contáctanos
      </button>

    </div>
  );
}

export default HelpSection;