import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { obtenerCohortesPorPrograma, type CohorteValidacionApi } from "../../../services/programa/validacionService";

function calcularPorcentaje(validados: number, total: number) {
	if (total === 0) return 0;
	return Math.round((validados / total) * 100);
}

export function ValidacionDocumentosVista() {
	const navigate = useNavigate();
	const [cohortes, setCohortes] = useState<CohorteValidacionApi[]>([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let activo = true;

		async function cargarCohortes() {
			setCargando(true);
			setError(null);

			try {
				const datos = await obtenerCohortesPorPrograma();
				if (activo) {
					setCohortes(datos);
				}
			} catch {
				if (activo) {
					setError("No se pudieron cargar las cohortes para validación.");
				}
			} finally {
				if (activo) {
					setCargando(false);
				}
			}
		}

		void cargarCohortes();

		return () => {
			activo = false;
		};
	}, []);

	if (cargando) {
		return (
			<div className="p-8 bg-gray-100 min-h-full">
				<div className="max-w-5xl mx-auto text-sm text-gray-600">
					Cargando cohortes de validación...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8 bg-gray-100 min-h-full">
				<div className="max-w-5xl mx-auto rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 bg-gray-100 min-h-full">
			<div className="max-w-5xl mx-auto">
				<h1 className="text-xl font-bold text-gray-900 mb-6 animate-fade-in">Validación de documentos</h1>

				{cohortes.length === 0 && (
					<div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
						No hay cohortes disponibles para mostrar.
					</div>
				)}

				<div className="space-y-4 animate-fade-in-up delay-100">
					{cohortes.map((cohorte) => (
						<button
							key={cohorte.id}
							type="button"
							onClick={() => navigate(`/programa/validacion/cohorte/${cohorte.id}`)}
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
			</div>
		</div>
	);
}

export default function ValidacionDocumentos() {
	return <ValidacionDocumentosVista />;
}