import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  calcularPorcentaje,
  getAspirantesCohorte,
  getDocumentosAspirante,
  aprobarDocumento,
  rechazarDocumento,
  type AspiranteValidacion,
  type DocumentoValidacion,
} from "../../../services/programa/validacionService";

export default function ValidacionAspiranteDetalle() {
  const navigate = useNavigate();
  const { cohorteId, aspiranteId } = useParams();

  const [aspirante, setAspirante] = useState<AspiranteValidacion | null>(null);
  const [loadingAspirante, setLoadingAspirante] = useState(true);
  const [errorAspirante, setErrorAspirante] = useState<string | null>(null);

  const [documentos, setDocumentos] = useState<DocumentoValidacion[]>([]);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<DocumentoValidacion | null>(null);

  const [mostrarConfirmacionAprobar, setMostrarConfirmacionAprobar] = useState(false);
  const [mostrarDialogoRechazo, setMostrarDialogoRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [accionando, setAccionando] = useState(false);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const [lista, docs] = await Promise.all([
          getAspirantesCohorte(Number(cohorteId)),
          getDocumentosAspirante(Number(aspiranteId)),
        ]);
        const encontrado = lista.find((a) => a.id === aspiranteId);
        if (activo) {
          setAspirante(encontrado ?? null);
          setDocumentos(docs);
          if (docs.length > 0) setDocumentoSeleccionado(docs[0]);
        }
      } catch {
        if (activo) setErrorAspirante("No se pudo cargar el aspirante.");
      } finally {
        if (activo) setLoadingAspirante(false);
      }
    })();
    return () => { activo = false; };
  }, [cohorteId, aspiranteId]);

  const documentosValidados = documentos.filter((d) => d.validado).length;
  const totalDocumentos = documentos.length;
  const todosValidados = totalDocumentos > 0 && documentosValidados === totalDocumentos;

  const confirmarAprobar = async () => {
    if (!documentoSeleccionado) return;
    setAccionando(true);
    setErrorAccion(null);
    try {
      await aprobarDocumento(documentoSeleccionado.id);
      const docsActualizados = documentos.map((d) =>
        d.id === documentoSeleccionado.id ? { ...d, validado: true, rechazado: false } : d
      );
      setDocumentos(docsActualizados);
      const siguiente = docsActualizados.find((d) => !d.validado && d.id !== documentoSeleccionado.id);
      if (siguiente) setDocumentoSeleccionado(siguiente);
      setMostrarConfirmacionAprobar(false);
    } catch {
      setErrorAccion("No se pudo aprobar el documento.");
    } finally {
      setAccionando(false);
    }
  };

  const confirmarRechazo = async () => {
    if (!documentoSeleccionado || !motivoRechazo.trim()) return;
    setAccionando(true);
    setErrorAccion(null);
    try {
      await rechazarDocumento(documentoSeleccionado.id, motivoRechazo.trim());
      setDocumentos((docs) =>
        docs.map((d) =>
          d.id === documentoSeleccionado.id ? { ...d, rechazado: true, validado: false } : d
        )
      );
      setMostrarDialogoRechazo(false);
      setMotivoRechazo("");
    } catch {
      setErrorAccion("No se pudo rechazar el documento.");
    } finally {
      setAccionando(false);
    }
  };

  if (loadingAspirante) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Cargando aspirante...</span>
      </div>
    );
  }

  if (errorAspirante || !aspirante) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          {errorAspirante ?? "No se encontró el aspirante."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(`/programa/validacion/cohorte/${cohorteId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="h-4.5 w-4.5" />
          <span className="text-sm text-gray-500">Validación / Aspirantes</span>
        </button>

        {errorAccion && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {errorAccion}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          <div className="space-y-6 overflow-y-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Información del aspirante
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Nombre completo</div>
                  <div className="text-sm font-semibold text-gray-900">{aspirante.nombre}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Estado general</div>
                  {todosValidados ? (
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-lg">
                      Validado
                    </span>
                  ) : documentosValidados > 0 ? (
                    <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-lg">
                      En progreso
                    </span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-lg">
                      Por validar
                    </span>
                  )}
                </div>
                <div className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Progreso de validación</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {documentosValidados}/{totalDocumentos}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-700 h-2 rounded-full transition-all"
                      style={{
                        width: totalDocumentos > 0
                          ? `${calcularPorcentaje(documentosValidados, totalDocumentos)}%`
                          : "0%",
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
              {documentos.length === 0 ? (
                <p className="text-sm text-gray-400">Este aspirante no tiene documentos cargados.</p>
              ) : (
                <div className="space-y-2">
                  {documentos.map((documento) => (
                    <button
                      key={documento.id}
                      type="button"
                      onClick={() => setDocumentoSeleccionado(documento)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                        documentoSeleccionado?.id === documento.id
                          ? "border-red-700 bg-red-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <span className="text-sm text-gray-900">{documento.nombre}</span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          documento.validado
                            ? "border-green-500 bg-green-500"
                            : documento.rechazado
                            ? "border-red-500 bg-red-500"
                            : "border-yellow-500"
                        }`}
                      >
                        {documento.validado && (
                          <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {documento.rechazado && (
                          <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            {documentoSeleccionado ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {documentoSeleccionado.nombre}
                  </h2>
                  {documentoSeleccionado.enlaceurl && (
                    <a
                      href={documentoSeleccionado.enlaceurl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Descargar
                    </a>
                  )}
                </div>

                <div className="flex-1 bg-gray-100 rounded-lg flex flex-col mb-6">
                  {documentoSeleccionado.enlaceurl ? (
                    <object
                      data={documentoSeleccionado.enlaceurl}
                      type="application/pdf"
                      width="100%"
                      height="600px"
                    >
                      <p className="p-4 text-sm text-gray-500">
                        Tu navegador no soporta visualización de PDFs.{" "}
                        <a href={documentoSeleccionado.enlaceurl} className="text-red-700 underline">
                          Descárgalo aquí
                        </a>.
                      </p>
                    </object>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                      No hay documento disponible para visualizar.
                    </div>
                  )}
                </div>

                {!documentoSeleccionado.validado && !documentoSeleccionado.rechazado && (
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
                {documentoSeleccionado.validado && (
                  <div className="text-center py-3">
                    <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-lg">
                      ✓ Documento aprobado
                    </span>
                  </div>
                )}
                {documentoSeleccionado.rechazado && (
                  <div className="text-center py-3">
                    <span className="inline-block bg-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-lg">
                      ✗ Documento rechazado
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Selecciona un documento para visualizarlo.
              </div>
            )}
          </div>
        </div>

        {mostrarConfirmacionAprobar && documentoSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Confirmar aprobación</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700">
                  ¿Está seguro de que desea aprobar el documento "{documentoSeleccionado.nombre}"?
                </p>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacionAprobar(false)}
                  disabled={accionando}
                  className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarAprobar}
                  disabled={accionando}
                  className="px-6 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {accionando ? "Aprobando..." : "Aprobar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarDialogoRechazo && documentoSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Rechazar documento</h3>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 mb-4">
                  Está rechazando el documento "{documentoSeleccionado.nombre}". Por favor ingrese el motivo:
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
                  onClick={() => { setMostrarDialogoRechazo(false); setMotivoRechazo(""); }}
                  disabled={accionando}
                  className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarRechazo}
                  disabled={!motivoRechazo.trim() || accionando}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {accionando ? "Rechazando..." : "Rechazar documento"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
