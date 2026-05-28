import { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router";
import { fetchEstadoProceso, type PasoProceso } from "../../services/aspirante/aspiranteEstadoService";
import type { AspiranteOutletContext } from "../../layouts/AspiranteLayout";

// ── Íconos (Heroicons) ────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <circle cx="12" cy="12" r="4" />
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

// ── Helper: mensaje dinámico ─────────────────────────────────────────────────

interface MensajeSiguiente {
  titulo: string;
  cuerpo: React.ReactNode;
}

function esResultadoCompletado(pasos: PasoProceso[]): boolean {
  return pasos.some(p => p.nombre.toLowerCase().includes("result") && p.estado === "completado")
    || (pasos.length > 0 && pasos.every(p => p.estado === "completado"));
}

function getMensajeSiguiente(pasos: PasoProceso[]): MensajeSiguiente {
  const enProgreso = pasos.find(p => p.estado === "en-progreso");

  if (esResultadoCompletado(pasos)) {
    return {
      titulo: "¡Felicitaciones, fuiste admitido!",
      cuerpo: (
        <>
          Has completado exitosamente el proceso de admisión al programa de postgrado.
          Para legalizar tu matrícula, revisa tu correo registrado donde encontrarás los{" "}
          <span className="font-medium text-gray-700">plazos y montos de pago</span> correspondientes.
          También puedes acercarte a la oficina de Postgrados para más información.
        </>
      ),
    };
  }

  if (!enProgreso) {
    return {
      titulo: "¿Qué sigue?",
      cuerpo: "Tu proceso de admisión aún no ha comenzado. Completa el formulario de inscripción para iniciar.",
    };
  }

  const n = enProgreso.nombre.toLowerCase();

  if (n.includes("inscri")) {
    return {
      titulo: "¿Qué sigue?",
      cuerpo: "Estás completando tu formulario de inscripción. Asegúrate de diligenciar todos los campos requeridos antes de enviarlo.",
    };
  }
  if (n.includes("pago")) {
    return {
      titulo: "¿Qué sigue?",
      cuerpo: "Tu pago de inscripción está siendo procesado. Una vez verificado por el equipo administrativo, podrás continuar con el siguiente paso.",
    };
  }
  if (n.includes("doc")) {
    return {
      titulo: "¿Qué sigue?",
      cuerpo: (
        <>
          El comité curricular está revisando tus documentos. Recibirás una notificación al correo
          registrado con el resultado. Si algún documento es rechazado, podrás subir una versión
          corregida desde la sección <span className="font-medium text-gray-700">Documentos</span>.
        </>
      ),
    };
  }
  if (n.includes("calif")) {
    return {
      titulo: "¿Qué sigue?",
      cuerpo: "Tu candidatura está siendo evaluada por el comité curricular. Te notificaremos cuando el proceso de calificación haya finalizado.",
    };
  }
  if (n.includes("result")) {
    return {
      titulo: "¿Qué sigue?",
      cuerpo: "El comité está procesando los resultados finales. Recibirás la notificación de tu admisión al programa muy pronto.",
    };
  }

  return {
    titulo: "¿Qué sigue?",
    cuerpo: `El paso "${enProgreso.nombre}" está en progreso. Te notificaremos cuando haya novedades.`,
  };
}

// ── Helper: círculo indicador ─────────────────────────────────────────────────

function Indicador({ estado }: { estado: PasoProceso["estado"] }) {
  if (estado === "completado") {
    return (
      <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
        <CheckIcon />
      </div>
    );
  }
  if (estado === "en-progreso") {
    return (
      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-400 flex items-center justify-center shrink-0">
        <ClockIcon />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-400 flex items-center justify-center shrink-0">
      <DotIcon />
    </div>
  );
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function AspiranteEstado() {
  const { mostrarAlerta } = useOutletContext<AspiranteOutletContext>();

  const [cargando, setCargando] = useState(true);
  const [pasos, setPasos] = useState<PasoProceso[]>([]);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const data = await fetchEstadoProceso();
      setPasos(data);
    } catch (err) {
      mostrarAlerta((err as Error).message ?? "No fue posible cargar el estado del proceso.");
    } finally {
      setCargando(false);
    }
  }, [mostrarAlerta]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const completados = pasos.filter(p => p.estado === "completado").length;
  const progreso = pasos.length > 0 ? Math.round((completados / pasos.length) * 100) : 0;

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="max-w-2xl mx-auto">

        {/* Encabezado */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Estado del aspirante</h1>
          <p className="text-sm text-neutral-400">Seguimiento de tu proceso de admisión</p>
        </div>

        {/* Tarjeta principal */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 animate-fade-in-up delay-100">
          {cargando ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-400">
              <Spinner />
              Cargando estado del proceso...
            </div>
          ) : (
            <>
              {/* Barra de progreso */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">Progreso del proceso</span>
                  <span className="text-sm font-bold text-red-700">{progreso}% completado</span>
                </div>
                <div className="bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-red-700 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
              </div>

              {/* Timeline de pasos */}
              <div className="space-y-0">
                {pasos.map((paso, idx) => {
                  const isLast = idx === pasos.length - 1;
                  const isCompleted = paso.estado === "completado";

                  return (
                    <div key={paso.id} className={`animate-fade-in-up delay-${(idx + 2) * 100} flex gap-4`}>
                      {/* Columna izquierda: círculo + línea */}
                      <div className="flex flex-col items-center">
                        <Indicador estado={paso.estado} />
                        {!isLast && (
                          <div
                            className={`w-0.5 h-8 mt-1 ${isCompleted ? "bg-green-200" : "bg-gray-200"}`}
                          />
                        )}
                      </div>

                      {/* Columna derecha: texto */}
                      <div className={`flex-1 ${!isLast ? "pb-2" : ""}`}>
                        <p className={`text-sm font-semibold mt-2.5 ${
                          paso.estado === "pendiente" ? "text-neutral-400" : "text-gray-900"
                        }`}>
                          {paso.nombre}
                        </p>
                        {paso.estado === "completado" && (
                          <p className="text-xs text-green-700 mt-0.5">Completado</p>
                        )}
                        {paso.estado === "en-progreso" && (
                          <p className="text-xs text-amber-500 mt-0.5">En progreso</p>
                        )}
                        {paso.estado === "pendiente" && (
                          <p className="text-xs text-neutral-400 mt-0.5">Pendiente</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Tarjeta informativa dinámica */}
        {!cargando && pasos.length > 0 && (() => {
          const { titulo, cuerpo } = getMensajeSiguiente(pasos);
          const esAdmitido = esResultadoCompletado(pasos);
          return (
            <div className={`rounded-lg p-5 mt-4 animate-fade-in-up delay-600 ${
              esAdmitido
                ? "bg-green-100 border border-green-200"
                : "bg-white border border-gray-200"
            }`}>
              <h2 className={`text-sm font-semibold mb-2 ${esAdmitido ? "text-green-700" : "text-gray-900"}`}>
                {titulo}
              </h2>
              <p className={`text-sm ${esAdmitido ? "text-green-700/80" : "text-neutral-400"}`}>{cuerpo}</p>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
