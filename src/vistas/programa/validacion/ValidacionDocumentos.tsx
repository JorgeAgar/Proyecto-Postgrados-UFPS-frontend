import { useNavigate } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { calcularPorcentaje, cohortes } from "../../../services/programa/validacionService";

export function ValidacionDocumentosVista() {
	const navigate = useNavigate();

	return (
		<div className="p-8 bg-gray-100 min-h-full">
			<div className="max-w-5xl mx-auto">
				<h1 className="text-xl font-bold text-gray-900 mb-6">Validación de documentos</h1>

				<div className="space-y-4">
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
												<span className="font-semibold text-red-700">{cohorte.inscritos}</span>
											</div>
											{!cohorte.activa && cohorte.admitidos !== undefined && (
												<div className="text-sm">
													<span className="text-gray-600">Admitidos: </span>
													<span className="font-semibold text-red-700">{cohorte.admitidos}</span>
												</div>
											)}
										</div>

										<div className="text-sm">
											<span className="text-gray-600">Fecha límite: </span>
											<span className="font-semibold text-gray-800">{cohorte.fechaLimiteDocumentos}</span>
										</div>

										{cohorte.activa && cohorte.validados !== undefined && (
											<div className="mt-4">
												<div className="flex justify-between items-center mb-2">
													<span className="text-sm text-gray-600">
														Validados: {cohorte.validados} de {cohorte.inscritos}
													</span>
													<span className="text-sm font-semibold text-red-700">
														{calcularPorcentaje(cohorte.validados, cohorte.inscritos)}%
													</span>
												</div>
												<div className="w-full bg-gray-200 rounded-full h-2.5">
													<div
														className="bg-red-700 h-2.5 rounded-full transition-all"
														style={{
															width: `${calcularPorcentaje(cohorte.validados, cohorte.inscritos)}%`,
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