import { useState, useEffect, useCallback, type ComponentType } from "react";
import { useOutletContext } from "react-router";
import { fetchEstadoProceso, type PasoProceso } from "../../services/aspirante/aspiranteInicioService";
import type { AspiranteOutletContext } from "../../layouts/AspiranteLayout";

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

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

type EstadoTarjeta = "completado" | "en-revision" | "pendiente";

interface TarjetaEstado {
  titulo: string;
  descripcion: string;
  estado: EstadoTarjeta;
  Icono: ComponentType<{ className?: string }>;
}

interface ProximoPaso {
  num: number;
  titulo: string;
  descripcion: string;
  activo: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ESTILOS_TARJETA: Record<EstadoTarjeta, { wrapper: string; iconoBg: string; icono: string }> = {
  completado:    { wrapper: "border-green-200",  iconoBg: "bg-green-100",   icono: "text-green-700" },
  "en-revision": { wrapper: "border-amber-200",  iconoBg: "bg-amber-100",   icono: "text-amber-400" },
  pendiente:     { wrapper: "border-gray-200",   iconoBg: "bg-neutral-200", icono: "text-neutral-400" },
};

const ICONOS_ESTADO: Record<EstadoTarjeta, ComponentType<{ className?: string }>> = {
  completado:    CheckCircleIcon,
  "en-revision": ClockIcon,
  pendiente:     CalendarIcon,
};

function toEstadoTarjeta(estado: PasoProceso["estado"]): EstadoTarjeta {
  if (estado === "en-progreso") return "en-revision";
  return estado as EstadoTarjeta;
}

function getDescripcionTarjeta(nombre: string, estado: EstadoTarjeta): string {
  if (estado === "completado") return `${nombre} completado exitosamente.`;
  if (estado === "en-revision") return `${nombre} en revisión. Te notificaremos cuando haya actualizaciones.`;
  return `${nombre} pendiente. Será procesado próximamente.`;
}

function getDescripcionPaso(nombre: string): string {
  const n = nombre.toLowerCase();
  if (n.includes("inscri")) return "Completa el formulario de inscripción con toda la información requerida.";
  if (n.includes("pago")) return "Realiza el pago de inscripción correspondiente y adjunta el comprobante.";
  if (n.includes("doc")) return "Espera la validación de los documentos enviados. Si alguno es rechazado, podrás reemplazarlo.";
  if (n.includes("calif")) return "Una vez aprobados tus documentos, se evaluará tu candidatura.";
  if (n.includes("result")) return "Recibirás la notificación sobre tu admisión al programa.";
  return "Próximamente recibirás información sobre este paso del proceso.";
}

function buildTarjetas(pasos: PasoProceso[]): TarjetaEstado[] {
  return pasos.map(p => {
    const estado = toEstadoTarjeta(p.estado);
    return {
      titulo: p.nombre,
      descripcion: getDescripcionTarjeta(p.nombre, estado),
      estado,
      Icono: ICONOS_ESTADO[estado],
    };
  });
}

function buildProximosPasos(pasos: PasoProceso[]): ProximoPaso[] {
  return pasos
    .filter(p => p.estado !== "completado")
    .map((p, idx) => ({
      num: idx + 1,
      titulo: p.nombre,
      descripcion: getDescripcionPaso(p.nombre),
      activo: idx === 0,
    }));
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function AspiranteInicio() {
  const { mostrarAlerta } = useOutletContext<AspiranteOutletContext>();

  const [cargando, setCargando] = useState(true);
  const [pasos, setPasos] = useState<PasoProceso[]>([]);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await fetchEstadoProceso();
      setPasos(data);
    } catch (err) {
      mostrarAlerta((err as Error).message ?? "No fue posible cargar la información del proceso.");
    } finally {
      setCargando(false);
    }
  }, [mostrarAlerta]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const tarjetas = buildTarjetas(pasos);
  const proximosPasos = buildProximosPasos(pasos);
  const pasoEnRevision = tarjetas.find(t => t.estado === "en-revision");
  const esAdmitido = pasos.some(p => p.nombre.toLowerCase().includes("result") && p.estado === "completado")
    || (pasos.length > 0 && pasos.every(p => p.estado === "completado"));

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="">

        {/* Encabezado */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Bienvenido al Sistema de Postgrados
          </h1>
          <p className="text-sm text-neutral-400">
            Panel de control de tu proceso de admisión
          </p>
        </div>

        {cargando ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 animate-fade-in-up delay-100 flex items-center justify-center gap-2 text-sm text-neutral-400">
            <Spinner />
            Cargando información del proceso...
          </div>
        ) : (
          <>
            {/* Banner admitido */}
            {esAdmitido && (
              <div className="bg-green-100 border border-green-200 rounded-lg px-5 py-4 mb-6 animate-fade-in-up delay-100">
                <h2 className="text-sm font-semibold text-green-700 mb-1">¡Felicitaciones! Fuiste admitido al programa</h2>
                <p className="text-sm text-green-700/80">
                  Para legalizar tu matrícula revisa tu correo registrado donde encontrarás los{" "}
                  <span className="font-semibold">plazos y montos de pago</span>. También puedes acercarte
                  a la oficina de Postgrados para más información.
                </p>
              </div>
            )}

            {/* Alerta — solo si hay un paso en revisión */}
            {pasoEnRevision && !esAdmitido && (
              <div className="flex items-start gap-3 bg-amber-100 border border-amber-200 text-amber-400 rounded-lg px-4 py-3 mb-6 animate-fade-in-up delay-100">
                <ExclamationIcon />
                <p className="text-sm">
                  <span className="font-semibold text-gray-900">Acción requerida: </span>
                  {pasoEnRevision.titulo} en revisión. Te notificaremos cuando haya actualizaciones.
                </p>
              </div>
            )}

            {/* Grid de tarjetas de estado */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              {tarjetas.map((t, idx) => {
                const estilos = ESTILOS_TARJETA[t.estado];
                const ultimaSola = tarjetas.length % 2 !== 0 && idx === tarjetas.length - 1;
                return (
                  <div
                    key={t.titulo}
                    className={`bg-white border ${estilos.wrapper} rounded-lg p-5 animate-fade-in-up delay-${(idx + 2) * 100} ${ultimaSola ? "sm:col-span-2 sm:w-1/2 sm:mx-auto" : ""}`}
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

            {/* Próximos pasos — solo si hay pasos pendientes */}
            {proximosPasos.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 animate-fade-in-up delay-600">
                <h2 className="text-sm font-semibold text-gray-900 mb-5">Próximos pasos</h2>
                <div className="space-y-5">
                  {proximosPasos.map(paso => (
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
            )}
          </>
        )}

      </div>
    </div>
  );
}
