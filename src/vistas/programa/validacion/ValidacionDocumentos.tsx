import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import type { CohorteApi } from "../../../services/programa/validacionService";
import { getCohortesPrograma } from "../../../services/programa/validacionService";

export function ValidacionDocumentosVista() {
	const navigate = useNavigate();
	const [cohortes, setCohortes] = useState<CohorteApi[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const formatearFecha = (fecha: string) => {
		const fechaLocal = new Date(`${fecha}T00:00:00`);
		return new Intl.DateTimeFormat("es-CO", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		}).format(fechaLocal);
	};

	useEffect(() => {
		let activo = true;

		(async () => {
			try {
				setLoading(true);
				setError(null);
				const cohortesPrograma = await getCohortesPrograma();

				if (activo) {
					setCohortes(cohortesPrograma);
				}
			} catch (err) {
				console.error("Error cargando cohortes para validación de documentos:", err);
				if (activo) {
					setError("No se pudieron cargar las cohortes.");
				}
			} finally {
				if (activo) {
					setLoading(false);
				}
			}
		})();

		return () => {
			activo = false;
		};
	}, []);

	if (loading) {
		return (
			<div className="p-8 bg-gray-100 min-h-full">
				<div className="max-w-5xl mx-auto rounded-lg border border-gray-200 bg-white p-6 text-gray-500">
					Cargando cohortes...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8 bg-gray-100 min-h-full">
				<div className="max-w-5xl mx-auto rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
					{error}
				</div>
			</div>
		);
	}

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
										<div className="flex flex-wrap gap-x-6 gap-y-2">
											<div className="text-sm">
												<span className="text-gray-600">Inscritos: </span>
												<span className="font-semibold text-red-700">{cohorte.inscritos}</span>
											</div>
											<div className="text-sm">
												<span className="text-gray-600">Admitidos: </span>
												<span className="font-semibold text-red-700">{cohorte.admitidos}</span>
											</div>
											<div className="text-sm">
												<span className="text-gray-600">Cupos: </span>
												<span className="font-semibold text-red-700">{cohorte.cupos}</span>
											</div>
										</div>

										<div className="text-sm">
											<span className="text-gray-600">Fecha límite: </span>
											<span className="font-semibold text-gray-800">{formatearFecha(cohorte.fechaLimiteDocumentos)}</span>
										</div>

										<div className="text-sm">
											<span className="text-gray-600">Inicio: </span>
											<span className="font-semibold text-gray-800">{formatearFecha(cohorte.fechaInicio)}</span>
										</div>

										<div className="text-sm">
											<span className="text-gray-600">Pago límite: </span>
											<span className="font-semibold text-gray-800">{formatearFecha(cohorte.fechaLimitePago)}</span>
										</div>
									</div>
								</div>

								<ChevronRightIcon className="text-gray-400 shrink-0 mt-1 h-6 w-6" />
							</div>
						</button>
					))}
				</div>

				{cohortes.length === 0 && (
					<div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
						No hay cohortes disponibles para validar.
					</div>
				)}
			</div>
		</div>
	);
}

export default function ValidacionDocumentos() {
	return <ValidacionDocumentosVista />;
}