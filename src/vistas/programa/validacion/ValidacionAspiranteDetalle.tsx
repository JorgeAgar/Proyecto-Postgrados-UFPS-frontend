import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  actualizarEstadoDocumento,
  obtenerCohortesPorPrograma,
  obtenerDocumentosAspirante,
  type CohorteValidacionApi,
  type DocumentoAspiranteValidacionApi,
  type DocumentosAspiranteResponse,
} from "../../../services/programa/validacionService";

interface Documento {
  id: number;
  nombre: string;
  estado: DocumentoAspiranteValidacionApi["estado"];
  motivoRechazo: string | null;
  linkArchivo: string;
}

function obtenerTipoArchivo(linkArchivo: string) {
  const ruta = (() => {
    try {
      return new URL(linkArchivo).pathname;
    } catch {
      return linkArchivo;
    }
  })();

  const extension = ruta.split(".").pop()?.toLowerCase();

  if (extension === "pdf") {
    return "pdf";
  }

  if (extension === "png" || extension === "jpg" || extension === "jpeg") {
    return "imagen";
  }

  return "otro";
}

function calcularPorcentaje(validados: number, total: number) {
  if (total === 0) return 0;
  return Math.round((validados / total) * 100);
}

export default function ValidacionAspiranteDetalle() {
  const navigate = useNavigate();
  const { cohorteId, aspiranteId } = useParams();
  const cohorteIdNumerico = cohorteId ? Number(cohorteId) : undefined;
  const aspiranteIdNumerico = aspiranteId ? Number(aspiranteId) : undefined;

  const [cohorte, setCohorte] = useState<CohorteValidacionApi | null>(null);
  const [aspirante, setAspirante] = useState<DocumentosAspiranteResponse | null>(null);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [documentoSeleccionadoId, setDocumentoSeleccionadoId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);
  const [mostrarConfirmacionAprobar, setMostrarConfirmacionAprobar] = useState(false);
  const [mostrarDialogoRechazo, setMostrarDialogoRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [accionEnviando, setAccionEnviando] = useState<"APROBAR" | "RECHAZAR" | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      if (
        !cohorteIdNumerico ||
        Number.isNaN(cohorteIdNumerico) ||
        !aspiranteIdNumerico ||
        Number.isNaN(aspiranteIdNumerico)
      ) {
        setError("Los parámetros de la ruta no son válidos.");
        setCargando(false);
        return;
      }

      setCargando(true);
      setError(null);

      try {
        const [cohortesData, documentosData] = await Promise.all([
          obtenerCohortesPorPrograma(),
          obtenerDocumentosAspirante(aspiranteIdNumerico),
        ]);

        if (!activo) {
          return;
        }

        const cohorteEncontrada = cohortesData.find((item) => item.id === cohorteIdNumerico) ?? null;
        const documentosNormalizados = documentosData.documentos.map((documento) => ({
          id: documento.id,
          nombre: documento.nombre,
          estado: documento.estado,
          motivoRechazo: documento.motivoRechazo,
          linkArchivo: documento.linkArchivo,
        }));

        setCohorte(cohorteEncontrada);
        setAspirante(documentosData);
        setDocumentos(documentosNormalizados);
        setDocumentoSeleccionadoId(documentosNormalizados[0]?.id ?? null);

        if (!cohorteEncontrada) {
          setError("No se encontró la cohorte asociada a este aspirante.");
        }
      } catch {
        if (activo) {
          setError("No se pudieron cargar los documentos del aspirante.");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarDatos();

    return () => {
      activo = false;
    };
  }, [cohorteIdNumerico, aspiranteIdNumerico]);

  const documentoSeleccionado =
    documentos.find((documento) => documento.id === documentoSeleccionadoId) ?? null;
  const tipoArchivoSeleccionado = documentoSeleccionado
    ? obtenerTipoArchivo(documentoSeleccionado.linkArchivo)
    : null;

  const documentosValidados = documentos.filter((documento) => documento.estado === "APROBADO").length;
  const totalDocumentos = documentos.length;
  const todosValidados = totalDocumentos > 0 && documentosValidados === totalDocumentos;

  const actualizarDocumentoSeleccionado = async (estado: "APROBADO" | "RECHAZADO") => {
    if (!documentoSeleccionado) {
      return;
    }

    const respuesta = await actualizarEstadoDocumento(documentoSeleccionado.id, {
      estado,
      motivoRechazo: estado === "RECHAZADO" ? motivoRechazo.trim() : null,
    });

    setDocumentos((prev) => {
      const documentosActualizados = prev.map((documento) =>
        documento.id === documentoSeleccionado.id
          ? {
              ...documento,
              estado: respuesta.estado,
              motivoRechazo: respuesta.motivoRechazo,
            }
          : documento,
      );

      const siguienteDocumento = documentosActualizados.find(
        (documento) => documento.id !== documentoSeleccionado.id && documento.estado !== "APROBADO",
      );

      setDocumentoSeleccionadoId(siguienteDocumento?.id ?? documentoSeleccionado.id);
      return documentosActualizados;
    });
  };

  const confirmarAprobar = async () => {
    try {
      setAccionEnviando("APROBAR");
      await actualizarDocumentoSeleccionado("APROBADO");
      setMostrarConfirmacionAprobar(false);
      setAccionError(null);
    } catch {
      setAccionError("No se pudo actualizar el estado del documento.");
    } finally {
      setAccionEnviando(null);
    }
  };

  const confirmarRechazo = async () => {
    if (!motivoRechazo.trim()) {
      return;
    }

    try {
      setAccionEnviando("RECHAZAR");
      await actualizarDocumentoSeleccionado("RECHAZADO");
      setMostrarDialogoRechazo(false);
      setMotivoRechazo("");
      setAccionError(null);
    } catch {
      setAccionError("No se pudo actualizar el estado del documento.");
    } finally {
      setAccionEnviando(null);
    }
  };

  if (cargando) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto text-sm text-gray-600">
          Cargando documentos del aspirante...
        </div>
      </div>
    );
  }

  if (error || !cohorte || !aspirante) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error ?? "No fue posible mostrar el detalle del aspirante."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(`/programa/validacion/cohorte/${cohorte.id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors animate-fade-in"
        >
          <ArrowLeftIcon className="h-4.5 w-4.5" />
          <span className="text-sm text-gray-500">
            Validación / {cohorte.nombre} / Aspirantes
          </span>
        </button>

        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          <div className="space-y-6 overflow-y-auto animate-fade-in-up delay-100">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Información del aspirante
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">
                    Nombre completo
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {aspirante.nombreAspirante}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Documento</div>
                  <div className="text-sm text-gray-900">
                    {aspirante.cedula}
                  </div>
                </div>
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">
                      Progreso de validación
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {documentosValidados}/{totalDocumentos}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-700 h-2 rounded-full transition-all"
                      style={{
                        width: `${calcularPorcentaje(documentosValidados, totalDocumentos)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="h-4.5 w-4.5" />
                Lista de documentos
              </h2>
              <div className="space-y-2">
                {documentos.map((documento) => (
                  <button
                    key={documento.id}
                    type="button"
                    onClick={() => setDocumentoSeleccionadoId(documento.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                      documentoSeleccionado?.id === documento.id
                        ? "border-red-700 bg-red-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <span className="text-sm text-gray-900">
                      {documento.nombre}
                    </span>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${documento.estado === "APROBADO" ? "border-green-500 bg-green-500" : documento.estado === "RECHAZADO" ? "border-red-500 bg-red-500" : "border-yellow-500"}`}
                    >
                      {documento.estado === "APROBADO" && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col animate-fade-in-up delay-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {documentoSeleccionado?.nombre ?? "Documento"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (documentoSeleccionado?.linkArchivo) {
                    window.open(documentoSeleccionado.linkArchivo, "_blank", "noopener,noreferrer");
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Descargar
              </button>
            </div>

            <div className="flex-1 bg-gray-100 rounded-lg flex flex-col mb-6">
              {documentoSeleccionado ? (
                tipoArchivoSeleccionado === "pdf" ? (
                  <object
                    data={documentoSeleccionado.linkArchivo}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                  >
                    <p>
                      Tu navegador no soporta visualización de PDFs. {" "}
                      <a href={documentoSeleccionado.linkArchivo}>Descárgalo aquí</a>.
                    </p>
                  </object>
                ) : tipoArchivoSeleccionado === "imagen" ? (
                  <div className="flex h-150 items-center justify-center p-4">
                    <img
                      src={documentoSeleccionado.linkArchivo}
                      alt={documentoSeleccionado.nombre}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="flex h-150 items-center justify-center text-sm text-gray-500 px-6 text-center">
                    No se pudo cargar el documento porque el formato no es compatible.
                  </div>
                )
              ) : (
                <div className="flex h-150 items-center justify-center text-sm text-gray-500">
                  No hay documento seleccionado.
                </div>
              )}
            </div>

            {accionError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {accionError}
              </div>
            )}

            {!todosValidados && documentoSeleccionado && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMostrarDialogoRechazo(true)}
                  className="px-6 py-3 bg-white text-red-700 border-2 border-red-700 rounded hover:bg-red-50 transition-colors font-medium"
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacionAprobar(true)}
                  className="px-6 py-3 bg-red-700 text-white rounded hover:bg-red-800 transition-colors font-medium"
                >
                  Aprobar
                </button>
              </div>
            )}
            {todosValidados && (
              <div className="text-center py-4">
                <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-lg">
                  ✓ Todos los documentos validados
                </span>
              </div>
            )}
          </div>
        </div>

        {mostrarConfirmacionAprobar && (
          <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px] flex items-center justify-center z-50 animate-overlay-in">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-modal-in">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar aprobación
                </h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700">
                  ¿Está seguro de que desea aprobar el documento "
                  {documentoSeleccionado?.nombre}"?
                </p>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (accionEnviando) {
                      return;
                    }
                    setMostrarConfirmacionAprobar(false);
                  }}
                  disabled={accionEnviando !== null}
                  className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarAprobar}
                  disabled={accionEnviando !== null}
                  className="px-6 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors text-sm font-medium"
                >
                  {accionEnviando === "APROBAR" ? "Aprobando..." : "Aprobar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarDialogoRechazo && (
          <div className="fixed inset-0 bg-black/25 backdrop-blur-[1px] flex items-center justify-center z-50 animate-overlay-in">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 animate-modal-in">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rechazar documento
                </h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 mb-4">
                  Está rechazando el documento "{documentoSeleccionado?.nombre}".
                  Por favor ingrese el motivo del rechazo:
                </p>
                <textarea
                  value={motivoRechazo}
                  onChange={(event) => setMotivoRechazo(event.target.value)}
                  placeholder="Ingrese el motivo del rechazo..."
                  rows={4}
                  className="w-full text-sm text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent resize-none"
                />
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (accionEnviando) {
                      return;
                    }
                    setMostrarDialogoRechazo(false);
                    setMotivoRechazo("");
                  }}
                  disabled={accionEnviando !== null}
                  className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarRechazo}
                  disabled={!motivoRechazo.trim() || accionEnviando !== null}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {accionEnviando === "RECHAZAR" ? "Rechazando..." : "Rechazar documento"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}