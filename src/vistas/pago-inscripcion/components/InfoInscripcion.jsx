import { AcademicCapIcon, CalendarIcon, UserIcon, IdentificationIcon, BuildingOfficeIcon, TagIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

function InfoInscripcion() {
    return (
    <div className="grid md:grid-cols-2 gap- bg-white rounded-xl shadow p-6 ">

        {/* 🟨 COLUMNA IZQUIERDA */}
        <div className="space-y-4">

            <div className="flex items-start gap-2">
            <AcademicCapIcon className="w-5 h-5 text-red-600 mt-1" />
            <div className="grid grid-cols-[100px_1fr]">
                <strong>Programa</strong>
                <span>Maestría en Gerencia de Proyectos</span>
            </div>
            </div>

            <div className="flex items-start gap-2">
            <CalendarIcon className="w-5 h-5 text-red-600 mt-1" />
            <div className="grid grid-cols-[100px_1fr]">
                <strong>Periodo</strong>
                <span>2026-1</span>
            </div>
            </div>

            <div className="flex items-start gap-2">
            <UserIcon className="w-5 h-5 text-red-600 mt-1" />
            <div className="grid grid-cols-[100px_1fr]">
                <strong>Aspirante</strong>
                <span>Juan Pérez García</span>
            </div>
            </div>

            <div className="flex items-start gap-2">
            <IdentificationIcon className="w-5 h-5 text-red-600 mt-1" />
            <div className="grid grid-cols-[100px_1fr]">
                <strong>Documento</strong>
                <span>1.090.123.456</span>
            </div>
            </div>

        </div>

        {/* 🟨 COLUMNA DERECHA */}
        <div className="space-y-4">

            <div className="flex items-start gap-2">
            <BuildingOfficeIcon className="w-5 h-5 text-red-600 mt-1" />
            <div className="grid grid-cols-[100px_1fr]">
                <strong>Facultad</strong>
                <span>Ingenierías</span>
            </div>
            </div>

            <div className="flex items-start gap-2">
            <TagIcon className="w-5 h-5 text-red-600 mt-1" />
            <div className="grid grid-cols-[100px_1fr]">
                <strong>Tipo</strong>
                <span>Nuevo Aspirante</span>
            </div>
            </div>

            {/* 💰 VALOR */}
            <div className="flex items-start gap-2">
            <CurrencyDollarIcon className="w-6 h-6 text-red-600 mt-1" />
            <div className="grid grid-cols-[100px_1fr]">
                <strong>Valor</strong>
                <span className="text-red-600 text-xl font-bold">
                $150.000 COP
                </span>
            </div>
            </div>

        </div>

        </div>
    );
}

export default InfoInscripcion;