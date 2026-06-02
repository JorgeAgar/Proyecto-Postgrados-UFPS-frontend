import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams, useLocation } from "react-router";
import {
	ArrowLeftIcon,
	ArrowDownTrayIcon,
	DocumentTextIcon,
} from "@heroicons/react/24/outline";
import type { ProgramaOutletContext } from "../../../layouts/ProgramaLayout";
import {
	aprobarComprobante,
	rechazarComprobante,
	obtenerComprobantesAspirante,
	type ComprobantePagoApi,
	type ComprobantesAspiranteResponse,
} from "../../../services/programa/validacionPagosAspiranteService";

interface Comprobante {
	id: string;
	idComprobante: number;
	nombreTitulo: string;
	estado: ComprobantePagoApi["estado"];
	motivoRechazo: string | null;
	linkArchivo: string;
	monto: number | null;
	fechaEnvio: string | null;
}

function Spinner() {
	return (
		<svg className="animate-spin h-5 w-5 text-red-700 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
		</svg>
	);
}

function SpinnerSm() {
	return (
		<svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
		</svg>
	);
}

function obtenerTipoArchivo(linkArchivo: string) {
	const ruta = (() => {
		try { return new URL(linkArchivo).pathname; }
		catch { return linkArchivo; }
	})();
	const extension = ruta.split(".").pop()?.toLowerCase();
	if (extension === "pdf") return "pdf";
	if (extension === "png" || extension === "jpg" || extension === "jpeg") return "imagen";
	return "otro";
}

function calcularPorcentaje(verificados: number, total: number) {
	if (total === 0) return 0;
	return Math.round((verificados / total) * 100);
}

function formatMonto(monto: number | null): string {
	if (monto === null) return "–";
	return `$${monto.toLocaleString("es-CO")}`;
}

export default function ValidacionPagosAspirante() {
	const navigate = useNavigate();
	const location = useLocation();
	const { mostrarAlerta, mostrarConfirm } = useOutletContext<ProgramaOutletContext>();
	const { cohorteId, aspiranteId } = useParams();
	const aspiranteIdNumerico = aspiranteId ? Number(aspiranteId) : undefined;

	const nombreCohorte = (location.state as { nombreCohorte?: string; activa?: boolean } | null)?.nombreCohorte;
	const activa = (location.state as { nombreCohorte?: string; activa?: boolean } | null)?.activa ?? false;

	const [aspirante, setAspirante] = useState<ComprobantesAspiranteResponse | null>(null);
	const [comprobantes, setComprobantes] = useState<Comprobante[]>([]);
	const [comprobanteSeleccionadoId, setComprobanteSeleccionadoId] = useState<string | null>(null);
	const [cargando, setCargando] = useState(true);
	const [mostrarConfirmacionAprobar, setMostrarConfirmacionAprobar] = useState(false);
	const [cerrandoConfirmacionAprobar, setCerrandoConfirmacionAprobar] = useState(false);
	const [mostrarDialogoRechazo, setMostrarDialogoRechazo] = useState(false);
	const [cerrandoDialogoRechazo, setCerrandoDialogoRechazo] = useState(false);
	const [motivoRechazo, setMotivoRechazo] = useState("");
	const [accionEnviando, setAccionEnviando] = useState<"APROBAR" | "RECHAZAR" | null>(null);

	useEffect(() => {
		const cargar = async () => {
			if (!aspiranteIdNumerico || Number.isNaN(aspiranteIdNumerico)) {
				mostrarAlerta("Los parámetros de la ruta no son válidos.", "error");
				setCargando(false);
				return;
			}
			setCargando(true);
			try {
				const data = await obtenerComprobantesAspirante(aspiranteIdNumerico);
				const normalizados: Comprobante[] = data.comprobantes.map((c) => ({
					id: String(c.id),
					idComprobante: c.id,
					nombreTitulo: c.nombreTitulo,
					estado: c.estado,
					motivoRechazo: c.motivoRechazo,
					linkArchivo: c.linkArchivo,
					monto: c.monto,
					fechaEnvio: c.fechaEnvio,
				}));
				setAspirante(data);
				setComprobantes(normalizados);
				setComprobanteSeleccionadoId(normalizados[0]?.id ?? null);
			} catch {
				mostrarAlerta("No se pudieron cargar los comprobantes del aspirante.", "error");
			} finally {
				setCargando(false);
			}
		};
		cargar();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [aspiranteIdNumerico]);

	const comprobanteSeleccionado = comprobantes.find((c) => c.id === comprobanteSeleccionadoId) ?? null;
	const tipoArchivoSeleccionado = comprobanteSeleccionado
		? obtenerTipoArchivo(comprobanteSeleccionado.linkArchivo)
		: null;

	const comprobantesAprobados = comprobantes.filter((c) => c.estado === "APROBADO").length;
	const totalComprobantes = comprobantes.length;
	const todosVerificados = totalComprobantes > 0 && comprobantesAprobados === totalComprobantes;

	const cerrarModalAprobar = () => {
		setCerrandoConfirmacionAprobar(true);
		setTimeout(() => {
			setMostrarConfirmacionAprobar(false);
			setCerrandoConfirmacionAprobar(false);
		}, 170);
	};

	const cerrarModalRechazo = () => {
		setCerrandoDialogoRechazo(true);
		setTimeout(() => {
			setMostrarDialogoRechazo(false);
			setCerrandoDialogoRechazo(false);
			setMotivoRechazo("");
		}, 170);
	};

	const actualizarComprobanteSeleccionado = async (estado: "APROBADO" | "RECHAZADO") => {
		if (!comprobanteSeleccionado) return;

		const respuesta =
			estado === "APROBADO"
				? await aprobarComprobante(comprobanteSeleccionado.idComprobante)
				: await rechazarComprobante(comprobanteSeleccionado.idComprobante, motivoRechazo.trim());

		setComprobantes((prev) => {
			const actualizados = prev.map((c) =>
				c.id === comprobanteSeleccionado.id
					? { ...c, estado: respuesta.estado, motivoRechazo: respuesta.motivoRechazo ?? null }
					: c,
			);
			const siguiente = actualizados.find(
				(c) => c.id !== comprobanteSeleccionado.id && c.estado !== "APROBADO",
			);
			setComprobanteSeleccionadoId(siguiente?.id ?? comprobanteSeleccionado.id);
			return actualizados;
		});
	};

	const confirmarAprobar = async () => {
		try {
			setAccionEnviando("APROBAR");
			await actualizarComprobanteSeleccionado("APROBADO");
			cerrarModalAprobar();
			mostrarConfirm("Comprobante verificado correctamente.");
		} catch {
			mostrarAlerta("No se pudo actualizar el estado del comprobante.");
		} finally {
			setAccionEnviando(null);
		}
	};

	const confirmarRechazo = async () => {
		if (!motivoRechazo.trim()) return;
		try {
			setAccionEnviando("RECHAZAR");
			await actualizarComprobanteSeleccionado("RECHAZADO");
			cerrarModalRechazo();
			mostrarConfirm("Comprobante rechazado.");
		} catch {
			mostrarAlerta("No se pudo actualizar el estado del comprobante.");
		} finally {
			setAccionEnviando(null);
		}
	};

	return (
		<div className="p-6 bg-gray-100 min-h-full" style={{ fontFamily: "Segoe UI, sans-serif" }}>
			<div className="">
				<button
					type="button"
					onClick={() =>
						navigate(`/programa/pagos/cohorte/${cohorteId}`, { state: { nombreCohorte, activa } })
					}
					className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors animate-fade-in"
				>
					<ArrowLeftIcon className="h-4 w-4 shrink-0" />
					<span className="text-sm font-medium truncate">
						Pagos / {nombreCohorte ?? `Cohorte ${cohorteId}`} / Aspirantes
					</span>
				</button>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-auto lg:h-[calc(100vh-160px)]">
					{cargando ? (
						<>
							<div className="space-y-4">
								<div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center min-h-36">
									<div className="flex items-center gap-3 text-neutral-400 text-sm">
										<Spinner />
										Cargando información del aspirante...
									</div>
								</div>
								<div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center min-h-40">
									<div className="flex items-center gap-3 text-neutral-400 text-sm">
										<Spinner />
										Cargando comprobantes...
									</div>
								</div>
							</div>
							<div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center min-h-52">
								<div className="flex items-center gap-3 text-neutral-400 text-sm">
									<Spinner />
									Cargando visualizador...
								</div>
							</div>
						</>
					) : aspirante ? (
						<>
							{/* Columna izquierda */}
							<div className="space-y-3 sm:space-y-4 lg:overflow-y-auto animate-fade-in-up delay-100">
								{/* Info aspirante */}
								<div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
									<h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
										Información del aspirante
									</h2>
									<div className="space-y-3 sm:space-y-4">
										<div>
											<div className="text-xs text-neutral-400 mb-1">Nombre completo</div>
											<div className="text-sm font-semibold text-gray-900">{aspirante.nombreAspirante}</div>
										</div>
										<div>
											<div className="text-xs text-neutral-400 mb-1">Documento de identidad</div>
											<div className="text-sm text-gray-900">{aspirante.cedula}</div>
										</div>
										<div className="pt-1">
											<div className="flex justify-between items-center mb-2">
												<span className="text-xs text-gray-600">Progreso de verificación</span>
												<span className="text-sm font-semibold text-gray-900">
													{comprobantesAprobados}/{totalComprobantes}
												</span>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-2">
												<div
													className="bg-red-700 h-2 rounded-full transition-all"
													style={{
														width: `${calcularPorcentaje(comprobantesAprobados, totalComprobantes)}%`,
													}}
												/>
											</div>
										</div>
									</div>
								</div>

								{/* Lista comprobantes */}
								<div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
									<h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
										<DocumentTextIcon className="h-4 w-4 shrink-0" />
										Comprobantes de pago
									</h2>
									<div className="space-y-2">
										{comprobantes.map((comprobante) => (
											<button
												key={comprobante.id}
												type="button"
												onClick={() => setComprobanteSeleccionadoId(comprobante.id)}
												className={`w-full text-left px-3 sm:px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-3 min-h-[3rem] ${
													comprobanteSeleccionado?.id === comprobante.id
														? "border-red-700 bg-red-50"
														: "border-gray-200 hover:border-gray-300 bg-white"
												}`}
											>
												<div className="flex-1 min-w-0">
													<div className="text-sm font-medium text-gray-900 truncate">
														{comprobante.nombreTitulo}
													</div>
													{comprobante.monto !== null && (
														<div className="text-xs text-neutral-400 mt-0.5">
															{formatMonto(comprobante.monto)}
														</div>
													)}
												</div>
												<div
													className={`shrink-0 self-center w-5 h-5 aspect-square rounded-full border-2 flex items-center justify-center ${
														comprobante.estado === "APROBADO"
															? "border-green-500 bg-green-500"
															: comprobante.estado === "RECHAZADO"
																? "border-red-700 bg-red-700"
																: "border-yellow-400 bg-yellow-50"
													}`}
												>
													{comprobante.estado === "APROBADO" && (
														<svg
															className="w-2.5 h-2.5 text-white"
															fill="none"
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2.5"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path d="M5 13l4 4L19 7" />
														</svg>
													)}
													{comprobante.estado === "RECHAZADO" && (
														<svg
															className="w-2.5 h-2.5 text-white"
															fill="none"
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2.5"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path d="M6 18L18 6M6 6l12 12" />
														</svg>
													)}
												</div>
											</button>
										))}
									</div>
								</div>
							</div>

							{/* Columna derecha — visualizador */}
							<div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 flex flex-col animate-fade-in-up delay-200 min-h-[360px] sm:min-h-[480px] lg:min-h-0">
								<div className="flex items-center justify-between mb-4 gap-3">
									<div className="flex-1 min-w-0">
										<h2 className="text-sm font-semibold text-gray-900 truncate">
											{comprobanteSeleccionado?.nombreTitulo ?? "Comprobante"}
										</h2>
										{comprobanteSeleccionado?.fechaEnvio && (
											<div className="text-xs text-neutral-400 mt-0.5">
												Enviado: {comprobanteSeleccionado.fechaEnvio}
											</div>
										)}
									</div>
									<button
										type="button"
										onClick={() => {
											if (comprobanteSeleccionado?.linkArchivo) {
												window.open(comprobanteSeleccionado.linkArchivo, "_blank", "noopener,noreferrer");
											}
										}}
										className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm"
									>
										<ArrowDownTrayIcon className="h-4 w-4 shrink-0" />
										<span className="hidden sm:inline">Descargar</span>
									</button>
								</div>

								<div className="flex-1 min-h-0 overflow-hidden bg-gray-100 rounded-lg flex flex-col mb-4 min-h-[240px] sm:min-h-[280px]">
									{comprobanteSeleccionado ? (
										tipoArchivoSeleccionado === "pdf" ? (
											<object
												key={comprobanteSeleccionado.id}
												data={comprobanteSeleccionado.linkArchivo}
												type="application/pdf"
												className="block h-full w-full"
											>
												<p className="p-4 text-sm text-gray-500">
													Tu navegador no soporta visualización de PDFs.{" "}
													<a
														href={comprobanteSeleccionado.linkArchivo}
														className="text-red-700 underline"
													>
														Descárgalo aquí
													</a>
													.
												</p>
											</object>
										) : tipoArchivoSeleccionado === "imagen" ? (
											<div className="flex h-full min-h-0 items-center justify-center p-4">
												<img
													src={comprobanteSeleccionado.linkArchivo}
													alt={comprobanteSeleccionado.nombreTitulo}
													className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
												/>
											</div>
										) : (
											<div className="flex h-full min-h-0 items-center justify-center text-sm text-gray-500 px-6 text-center">
												Formato no compatible para previsualización.
											</div>
										)
									) : (
										<div className="flex h-full min-h-0 items-center justify-center text-sm text-neutral-400">
											Selecciona un comprobante para visualizarlo.
										</div>
									)}
								</div>

								{comprobanteSeleccionado && (
									<div className="space-y-3">
										{comprobanteSeleccionado.motivoRechazo && (
											<div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
												<div className="text-xs font-semibold text-red-700 mb-1">Motivo de rechazo</div>
												<div className="text-sm text-red-700">{comprobanteSeleccionado.motivoRechazo}</div>
											</div>
										)}
										{todosVerificados && (
											<div className="text-center">
												<span className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-lg border border-green-200">
													<svg
														className="w-4 h-4 shrink-0"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														viewBox="0 0 24 24"
													>
														<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
													</svg>
													Todos los pagos verificados
												</span>
											</div>
										)}
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
											<button
												type="button"
												onClick={() => setMostrarDialogoRechazo(true)}
												disabled={accionEnviando !== null}
												className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-red-700 border-2 border-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Rechazar
											</button>
											<button
												type="button"
												onClick={() => setMostrarConfirmacionAprobar(true)}
												disabled={
													accionEnviando !== null || comprobanteSeleccionado.estado === "APROBADO"
												}
												title={
													comprobanteSeleccionado.estado === "APROBADO"
														? "Este comprobante ya está verificado"
														: undefined
												}
												className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Verificar pago
											</button>
										</div>
									</div>
								)}
							</div>
						</>
					) : null}
				</div>

				{/* Modal: Confirmar verificación */}
				{mostrarConfirmacionAprobar && (
					<div
						className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
							cerrandoConfirmacionAprobar ? "animate-overlay-out" : "animate-overlay-in"
						}`}
					>
						<div
							className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full mx-4 ${
								cerrandoConfirmacionAprobar ? "animate-modal-out" : "animate-modal-in"
							}`}
						>
							<div className="p-6 border-b border-gray-200">
								<h3 className="text-lg font-semibold text-gray-900">Confirmar verificación</h3>
							</div>
							<div className="p-6">
								<p className="text-sm text-gray-700">
									¿Está seguro de verificar el comprobante{" "}
									<strong>"{comprobanteSeleccionado?.nombreTitulo}"</strong>?
								</p>
							</div>
							<div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
								<button
									type="button"
									onClick={cerrarModalAprobar}
									disabled={accionEnviando !== null}
									className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center disabled:opacity-60"
								>
									Cancelar
								</button>
								<button
									type="button"
									onClick={confirmarAprobar}
									disabled={accionEnviando !== null}
									className="flex items-center justify-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{accionEnviando === "APROBAR" ? (
										<>
											<SpinnerSm />
											Verificando...
										</>
									) : (
										"Sí, verificar"
									)}
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Modal: Rechazar comprobante */}
				{mostrarDialogoRechazo && (
					<div
						className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
							cerrandoDialogoRechazo ? "animate-overlay-out" : "animate-overlay-in"
						}`}
					>
						<div
							className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-4 ${
								cerrandoDialogoRechazo ? "animate-modal-out" : "animate-modal-in"
							}`}
						>
							<div className="p-6 border-b border-gray-200">
								<h3 className="text-lg font-semibold text-gray-900">Rechazar comprobante</h3>
							</div>
							<div className="p-6 space-y-3">
								<p className="text-sm text-gray-700">
									Está rechazando{" "}
									<strong>"{comprobanteSeleccionado?.nombreTitulo}"</strong>. Ingrese el motivo:
								</p>
								<textarea
									value={motivoRechazo}
									onChange={(e) => setMotivoRechazo(e.target.value)}
									placeholder="Ingrese el motivo del rechazo..."
									rows={4}
									disabled={accionEnviando !== null}
									className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 outline-none transition hover:border-gray-300 focus:border-red-300 focus:ring-2 focus:ring-red-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
								/>
								{!motivoRechazo.trim() && (
									<p className="text-xs text-neutral-400">El motivo es obligatorio para rechazar.</p>
								)}
							</div>
							<div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
								<button
									type="button"
									onClick={cerrarModalRechazo}
									disabled={accionEnviando !== null}
									className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center disabled:opacity-60"
								>
									Cancelar
								</button>
								<button
									type="button"
									onClick={confirmarRechazo}
									disabled={!motivoRechazo.trim() || accionEnviando !== null}
									className="flex items-center justify-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{accionEnviando === "RECHAZAR" ? (
										<>
											<SpinnerSm />
											Rechazando...
										</>
									) : (
										"Rechazar comprobante"
									)}
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
