import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeftIcon, ArrowDownTrayIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { calcularPorcentaje, obtenerAspirante, obtenerCohorte } from "../../../services/programa/validacionService";

interface Documento {
	id: string;
	nombre: string;
	validado: boolean;
}

export default function ValidacionAspiranteDetalle() {
	const navigate = useNavigate();
	const { cohorteId, aspiranteId } = useParams();
	const cohorte = useMemo(() => obtenerCohorte(cohorteId), [cohorteId]);
	const aspirante = useMemo(() => obtenerAspirante(cohorteId, aspiranteId), [cohorteId, aspiranteId]);

	const [documentos, setDocumentos] = useState<Documento[]>([
		{ id: "1", nombre: "Cédula de ciudadanía", validado: aspirante.estado === "validados" },
		{ id: "2", nombre: "Diploma de pregrado", validado: aspirante.estado === "validados" },
		{ id: "3", nombre: "Acta de grado", validado: aspirante.estado === "validados" },
		{ id: "4", nombre: "Hoja de vida", validado: aspirante.estado === "validados" },
		{ id: "5", nombre: "Certificado de notas", validado: aspirante.estado === "validados" },
	]);
	const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Documento>({ id: "1", nombre: "Cédula de ciudadanía", validado: aspirante.estado === "validados" });
	const [mostrarConfirmacionAprobar, setMostrarConfirmacionAprobar] = useState(false);
	const [mostrarDialogoRechazo, setMostrarDialogoRechazo] = useState(false);
	const [motivoRechazo, setMotivoRechazo] = useState("");

	const documentosValidados = documentos.filter((documento) => documento.validado).length;
	const totalDocumentos = documentos.length;
	const todosValidados = documentosValidados === totalDocumentos;

	const confirmarAprobar = () => {
		setDocumentos((docs) => docs.map((documento) => (documento.id === documentoSeleccionado.id ? { ...documento, validado: true } : documento)));
		const siguienteDoc = documentos.find((documento) => !documento.validado && documento.id !== documentoSeleccionado.id);
		if (siguienteDoc) {
			setDocumentoSeleccionado(siguienteDoc);
		}
		setMostrarConfirmacionAprobar(false);
	};

	const confirmarRechazo = () => {
		if (motivoRechazo.trim()) {
			setMostrarDialogoRechazo(false);
			setMotivoRechazo("");
		}
	};

	return (
		<div className="p-8 bg-gray-100 min-h-screen">
			<div className="max-w-7xl mx-auto">
				<button
					type="button"
					onClick={() => navigate(`/programa/validacion/cohortes/${cohorte.id}`)}
					className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
				>
					<ArrowLeftIcon className="h-4.5 w-4.5" />
					<span className="text-sm text-gray-500">Validación / {cohorte.nombre} / Aspirantes</span>
				</button>

				<div className="grid grid-cols-2 gap-6 h-[calc(100vh-180px)]">
					<div className="space-y-6 overflow-y-auto">
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-lg font-semibold text-gray-900 mb-6">Información del aspirante</h2>
							<div className="space-y-4">
								<div>
									<div className="text-xs text-gray-500 mb-1">Nombre completo</div>
									<div className="text-sm font-semibold text-gray-900">{aspirante.nombre}</div>
								</div>
								<div>
									<div className="text-xs text-gray-500 mb-1">Documento</div>
									<div className="text-sm text-gray-900">{aspirante.cedula}</div>
								</div>
								<div>
									<div className="text-xs text-gray-500 mb-1">Estado general</div>
									{todosValidados ? (
										<span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-lg">Validado</span>
									) : documentosValidados > 0 ? (
										<span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-lg">En progreso</span>
									) : (
										<span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-lg">Por validar</span>
									)}
								</div>
								<div className="pt-4">
									<div className="flex justify-between items-center mb-2">
										<span className="text-xs text-gray-600">Progreso de validación</span>
										<span className="text-sm font-semibold text-gray-900">{documentosValidados}/{totalDocumentos}</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-red-700 h-2 rounded-full transition-all"
											style={{ width: `${calcularPorcentaje(documentosValidados, totalDocumentos)}%` }}
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
										onClick={() => setDocumentoSeleccionado(documento)}
										className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-between ${
											documentoSeleccionado.id === documento.id ? "border-red-700 bg-red-50" : "border-gray-200 hover:border-gray-300 bg-white"
										}`}
									>
										<span className="text-sm text-gray-900">{documento.nombre}</span>
										<div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${documento.validado ? "border-green-500 bg-green-500" : "border-yellow-500"}`}>
											{documento.validado && (
												<svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
													<path d="M5 13l4 4L19 7" />
												</svg>
											)}
										</div>
									</button>
								))}
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6 flex flex-col">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold text-gray-900">{documentoSeleccionado.nombre}</h2>
							<button
								type="button"
								className="flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
							>
								<ArrowDownTrayIcon className="h-4 w-4" />
								Descargar
							</button>
						</div>

						<div className="flex-1 bg-gray-100 rounded-lg flex flex-col mb-6">
							<div className="flex justify-end px-6 pt-4">
								<span className="text-xs text-gray-500">Página 1 de 1</span>
							</div>
							<div className="flex-1 flex flex-col items-center justify-center py-16">
								<DocumentTextIcon className="text-gray-300 mb-4 h-16 w-16" />
								<p className="text-gray-500 font-medium">Vista previa del documento</p>
								<p className="text-gray-400 text-sm">{documentoSeleccionado.nombre}</p>
							</div>
						</div>

						{!todosValidados && (
							<div className="grid grid-cols-2 gap-4">
								<button type="button" onClick={() => setMostrarDialogoRechazo(true)} className="px-6 py-3 bg-white text-red-700 border-2 border-red-700 rounded hover:bg-red-50 transition-colors font-medium">
									Rechazar
								</button>
								<button type="button" onClick={() => setMostrarConfirmacionAprobar(true)} className="px-6 py-3 bg-red-700 text-white rounded hover:bg-red-800 transition-colors font-medium">
									Aprobar
								</button>
							</div>
						)}
						{todosValidados && (
							<div className="text-center py-4">
								<span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-lg">✓ Todos los documentos validados</span>
							</div>
						)}
					</div>
				</div>

				{mostrarConfirmacionAprobar && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
							<div className="p-6 border-b border-gray-200">
								<h3 className="text-lg font-semibold text-gray-900">Confirmar aprobación</h3>
							</div>
							<div className="p-6">
								<p className="text-sm text-gray-700">¿Está seguro de que desea aprobar el documento "{documentoSeleccionado.nombre}"?</p>
							</div>
							<div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
								<button type="button" onClick={() => setMostrarConfirmacionAprobar(false)} className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium">Cancelar</button>
								<button type="button" onClick={confirmarAprobar} className="px-6 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors text-sm font-medium">Aprobar</button>
							</div>
						</div>
					</div>
				)}

				{mostrarDialogoRechazo && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
							<div className="p-6 border-b border-gray-200">
								<h3 className="text-lg font-semibold text-gray-900">Rechazar documento</h3>
							</div>
							<div className="p-6">
								<p className="text-sm text-gray-700 mb-4">Está rechazando el documento "{documentoSeleccionado.nombre}". Por favor ingrese el motivo del rechazo:</p>
								<textarea value={motivoRechazo} onChange={(event) => setMotivoRechazo(event.target.value)} placeholder="Ingrese el motivo del rechazo..." rows={4} className="w-full text-sm text-gray-900 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent resize-none" />
							</div>
							<div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
								<button type="button" onClick={() => { setMostrarDialogoRechazo(false); setMotivoRechazo(""); }} className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium">Cancelar</button>
								<button type="button" onClick={confirmarRechazo} disabled={!motivoRechazo.trim()} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">Rechazar documento</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}