import { useNavigate } from "react-router";
import type { ComponentType } from "react";


interface ShortcutCardProps {
  title: string;
  desc: string;
  Icon: ComponentType<unknown>;
  onOpen?: () => void;
}

function ShortcutCard({ title, desc, Icon, onOpen }: ShortcutCardProps) {
  return (
    <div className="h-full rounded-xl border border-gray-100 bg-white/80 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-start gap-4">
        <div className="rounded-lg p-3 bg-red-100 text-red-700">
          <Icon />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{desc}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={onOpen} className="inline-flex items-center gap-2 rounded-md bg-red-700 px-3 py-2 text-white font-semibold hover:bg-red-800">Abrir</button>
      </div>
    </div>
  );
}

function CreateIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21v-3l11-11 3 3L7 21H4z" />
    </svg>
  );
}

export default function ProgramaInicio() {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Inicio</h1>
        <p className="text-sm text-gray-600 mt-1">Panel de control — accesos rápidos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <ShortcutCard title="Crear cohorte" desc="Inicia el proceso para crear una nueva cohorte." Icon={CreateIcon} onOpen={() => navigate('/programa/crear-cohorte')} />
        <ShortcutCard title="Editar cohorte" desc="Busca y edita cohorte existentes." Icon={EditIcon} />
      </div>
    </div>
  );
}
