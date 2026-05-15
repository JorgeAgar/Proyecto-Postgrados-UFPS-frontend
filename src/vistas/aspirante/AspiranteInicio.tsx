// ── Íconos (Heroicons) ────────────────────────────────────────────────────────

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className ?? "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className ?? "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className ?? "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function ExclamationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

type EstadoTarjeta = "completado" | "en-revision" | "pendiente";

interface TarjetaEstado {
  titulo: string;
  descripcion: string;
  estado: EstadoTarjeta;
  Icono: React.ComponentType<{ className?: string }>;
}

// ── Datos ─────────────────────────────────────────────────────────────────────

const TARJETAS: TarjetaEstado[] = [
  {
    titulo: "Formulario de inscripción",
    descripcion: "Tu proceso de inscripción ha sido registrado exitosamente.",
    estado: "completado",
    Icono: CheckCircleIcon,
  },
  {
    titulo: "Pago confirmado",
    descripcion: "Tu pago de inscripción ha sido verificado.",
    estado: "completado",
    Icono: CheckCircleIcon,
  },
  {
    titulo: "Documentos en revisión",
    descripcion: "Estamos verificando los documentos que has enviado.",
    estado: "en-revision",
    Icono: ClockIcon,
  },
  {
    titulo: "Entrevista pendiente",
    descripcion: "Te notificaremos cuando se programe tu entrevista.",
    estado: "pendiente",
    Icono: CalendarIcon,
  },
];

const ESTILOS_TARJETA: Record<EstadoTarjeta, { wrapper: string; iconoBg: string; icono: string }> = {
  completado:   { wrapper: "border-green-200",  iconoBg: "bg-green-100",  icono: "text-green-700" },
  "en-revision":{ wrapper: "border-amber-200",  iconoBg: "bg-amber-100",  icono: "text-amber-400" },
  pendiente:    { wrapper: "border-gray-200",    iconoBg: "bg-neutral-200",icono: "text-neutral-400" },
};

const PASOS = [
  {
    num: 1,
    titulo: "Revisión de documentos",
    descripcion: "Espera la validación de los documentos enviados. Si alguno es rechazado, podrás reemplazarlo.",
    activo: true,
  },
  {
    num: 2,
    titulo: "Programación de entrevista",
    descripcion: "Una vez aprobados tus documentos, se te asignará una fecha de entrevista.",
    activo: false,
  },
  {
    num: 3,
    titulo: "Resultado final",
    descripcion: "Recibirás la notificación sobre tu admisión al programa.",
    activo: false,
  },
];

// ── Componente ────────────────────────────────────────────────────────────────

export default function AspiranteInicio() {
  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="max-w-4xl mx-auto">

        {/* Encabezado */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Bienvenido al Sistema de Postgrados
          </h1>
          <p className="text-sm text-neutral-400">
            Panel de control de tu proceso de admisión
          </p>
        </div>

        {/* Alerta */}
        <div className="flex items-start gap-3 bg-amber-100 border border-amber-200 text-amber-400 rounded-lg px-4 py-3 mb-6 animate-fade-in-up delay-100">
          <ExclamationIcon />
          <p className="text-sm">
            <span className="font-semibold text-gray-900">Acción requerida: </span>
            Tus documentos están en revisión. Te notificaremos cuando haya actualizaciones.
          </p>
        </div>

        {/* Grid de tarjetas de estado */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          {TARJETAS.map((t, idx) => {
            const estilos = ESTILOS_TARJETA[t.estado];
            return (
              <div
                key={t.titulo}
                className={`bg-white border ${estilos.wrapper} rounded-lg p-5 animate-fade-in-up delay-${(idx + 2) * 100}`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4 ${estilos.iconoBg}`}>
                  <t.Icono className={`w-5 h-5 ${estilos.icono}`} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{t.titulo}</h3>
                <p className="text-sm text-neutral-400">{t.descripcion}</p>
              </div>
            );
          })}
        </div>

        {/* Próximos pasos */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 animate-fade-in-up delay-600">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Próximos pasos</h2>
          <div className="space-y-5">
            {PASOS.map(paso => (
              <div key={paso.num} className="flex gap-4">
                <div
                  className={`rounded-full w-8 h-8 flex items-center justify-center shrink-0 text-sm font-semibold ${
                    paso.activo
                      ? "bg-red-700/10 text-red-700"
                      : "bg-neutral-200 text-neutral-400"
                  }`}
                >
                  {paso.num}
                </div>
                <div>
                  <p className={`text-sm font-semibold mb-0.5 ${paso.activo ? "text-gray-900" : "text-neutral-400"}`}>
                    {paso.titulo}
                  </p>
                  <p className="text-sm text-neutral-400">{paso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
