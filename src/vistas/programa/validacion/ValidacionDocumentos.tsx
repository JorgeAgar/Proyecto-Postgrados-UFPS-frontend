import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { obtenerCohortesPorPrograma, type CohorteValidacionApi } from "../../../services/programa/validacionService";
import type { ProgramaOutletContext } from "../../../layouts/ProgramaLayout";

function calcularPorcentaje(validados: number, total: number) {
	if (total === 0) return 0;
	return Math.round((validados / total) * 100);
}

function Spinner() {
	return (
		<svg className="animate-spin h-6 w-6 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
		</svg>
	);
}

export function ValidacionDocumentosVista() {
	const navigate = useNavigate();
	const { mostrarAlerta } = useOutletContext<ProgramaOutletContext>();
	const [cohortes, setCohortes] = useState<CohorteValidacionApi[]>([]);
	const [cargando, setCargando] = useState(true);

	useEffect(() => {
		const cargar = async () => {
			setCargando(true);
			try {
				const datos = await obtenerCohortesPorPrograma();
				setCohortes([...datos].sort((a, b) => Number(b.activa) - Number(a.activa)));
			} catch {
				mostrarAlerta("No se pudieron cargar las cohortes para validación.", "error");
			} finally {
				setCargando(false);
			}
		};
		cargar();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="p-6 bg-gray-100 min-h-full" style={{ fontFamily: "Segoe UI, sans-serif" }}>
			<div className="">
				<div className="mb-6 animate-fade-in">
					<h1 className="text-xl font-bold text-gray-900">Validación de documentos</h1>
					<h2 className="text-base font-semibold text-gray-700 mt-3">Cohortes</h2>
					<p className="text-sm text-neutral-400 mt-1">
						Selecciona una cohorte para validar los documentos de sus aspirantes.
					</p>
				</div>

				{cargando ? (
					<div className="flex items-center justify-center py-20 animate-fade-in">
						<div className="flex items-center gap-3 text-neutral-400 text-sm">
							<Spinner />
							Cargando cohortes...
						</div>
					</div>
				) : cohortes.length === 0 ? (
					<div className="flex items-center justify-center py-20 animate-fade-in">
						<p className="text-sm text-neutral-400">No hay cohortes disponibles.</p>
					</div>
				) : (
					<div className="space-y-4 animate-fade-in-up delay-100">
						{cohortes.map((cohorte) => (
							<button
								key={cohorte.id}
								type="button"
								onClick={() => navigate(`/programa/validacion/cohorte/${cohorte.id}`, { state: { nombreCohorte: cohorte.nombre, activa: cohorte.activa } })}
								className="w-full text-left p-6 rounded-lg bg-white border-2 border-gray-200 hover:border-gray-300 transition-all"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-3">
											<h2 className="text-xl font-semibold text-gray-900">{cohorte.nombre}</h2>
											{cohorte.activa && (
												<span className="bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded-lg">Activa</span>
											)}
										</div>

										<div className="space-y-3">
											<div className="flex gap-6">
												<div className="text-sm">
													<span className="text-gray-600">Inscritos: </span>
													<span className="font-semibold text-red-700">{cohorte.totalInscritos}</span>
												</div>
												{!cohorte.activa && cohorte.totalAdmitidos !== null && (
													<div className="text-sm">
														<span className="text-gray-600">Admitidos: </span>
														<span className="font-semibold text-red-700">{cohorte.totalAdmitidos}</span>
													</div>
												)}
											</div>

											<div className="text-sm">
												<span className="text-gray-600">Fecha límite: </span>
												<span className="font-semibold text-gray-800">{cohorte.fechaLimiteDocs}</span>
											</div>

											{cohorte.activa && (
												<div className="mt-4">
													<div className="flex justify-between items-center mb-2">
														<span className="text-sm text-gray-600">
															Validados: {cohorte.totalValidados} de {cohorte.totalInscritos}
														</span>
													</div>
													<div className="w-full bg-gray-200 rounded-full h-2.5">
														<div
															className="bg-red-700 h-2.5 rounded-full transition-all"
															style={{
																width: `${calcularPorcentaje(cohorte.totalValidados, cohorte.totalInscritos)}%`,
															}}
														/>
													</div>
												</div>
											)}
										</div>
									</div>

									<ChevronRightIcon className="text-gray-400 shrink-0 mt-1 h-6 w-6" />
								</div>
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default function ValidacionDocumentos() {
	return <ValidacionDocumentosVista />;
}
