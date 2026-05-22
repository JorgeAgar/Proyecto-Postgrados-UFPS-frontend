import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
	obtenerAspirantesPorCohorte,
	obtenerCohortesPorPrograma,
	type AspiranteValidacionApi,
	type CohorteValidacionApi,
} from "../../../services/programa/validacionService";

/**
 * Vista de cohorte en validación de documentos, muestra la lista de aspirantes inscritos en el cohorte y su estado de validación
 * @returns la vista de cohorte en validación de documentos
 */
export default function ValidacionCohorteDetalle() {
	const navigate = useNavigate();
	const { cohorteId } = useParams();
	const cohorteIdNumerico = cohorteId ? Number(cohorteId) : undefined;
	const [cohorte, setCohorte] = useState<CohorteValidacionApi | null>(null);
	const [aspirantes, setAspirantes] = useState<AspiranteValidacionApi[]>([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "PAZ Y SALVO" | "VALIDADO_EN_PROGRESO" | "VALIDADO_POR_CALIFICAR">("TODOS");
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		let activo = true;

		async function cargarDatos() {
			if (!cohorteIdNumerico || Number.isNaN(cohorteIdNumerico)) {
				setError("La cohorte solicitada no es válida.");
				setCargando(false);
				return;
			}

			setCargando(true);
			setError(null);

			try {
				const [cohortesData, aspirantesData] = await Promise.all([
					obtenerCohortesPorPrograma(),
					obtenerAspirantesPorCohorte(cohorteIdNumerico),
				]);

				if (!activo) {
					return;
				}

				const cohorteEncontrada = cohortesData.find((item) => item.id === cohorteIdNumerico) ?? null;
				setCohorte(cohorteEncontrada);
				setAspirantes(aspirantesData);

				if (!cohorteEncontrada) {
					setError("No se encontró la cohorte solicitada.");
				}
			} catch {
				if (activo) {
					setError("No se pudieron cargar los aspirantes de la cohorte.");
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
	}, [cohorteIdNumerico]);

	if (cargando) {
		return (
			<div className="p-8 bg-gray-100 min-h-full">
				<div className="max-w-7xl mx-auto text-sm text-gray-600">
					Cargando aspirantes de la cohorte...
				</div>
			</div>
		);
	}

	if (error || !cohorte) {
		return (
			<div className="p-8 bg-gray-100 min-h-full">
				<div className="max-w-7xl mx-auto rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error ?? "No fue posible mostrar la cohorte solicitada."}
				</div>
			</div>
		);
	}

	const porValidar = aspirantes.filter((aspirante) => aspirante.estadoGeneral === "PAZ Y SALVO").length;
	const enProgreso = aspirantes.filter((aspirante) => aspirante.estadoGeneral === "VALIDADO_EN_PROGRESO").length;
	const validados = aspirantes.filter((aspirante) =>
		aspirante.estadoGeneral === "VALIDADO_POR_CALIFICAR" || aspirante.estadoGeneral === "VALIDADO_CALIFICADO",
	).length;
	const totalAspirantes = aspirantes.length;
	const obtenerUltimaActualizacion = (estadoGeneral: typeof aspirantes[number]["estadoGeneral"]) => {
		if (estadoGeneral === "VALIDADO_POR_CALIFICAR" || estadoGeneral === "VALIDADO_CALIFICADO") return "Hace 1 día";
		if (estadoGeneral === "VALIDADO_EN_PROGRESO") return "Hace 3 días";
		return "Sin actualizar";
	};

	const aspirantesFiltrados = aspirantes.filter((aspirante) => {
		const coincideEstado =
			filtroEstado === "TODOS" ||
			(filtroEstado === "VALIDADO_POR_CALIFICAR" &&
				(aspirante.estadoGeneral === "VALIDADO_POR_CALIFICAR" || aspirante.estadoGeneral === "VALIDADO_CALIFICADO")) ||
			aspirante.estadoGeneral === filtroEstado;
		const coincideBusqueda = aspirante.nombre.toLowerCase().includes(searchTerm.toLowerCase());
		return coincideEstado && coincideBusqueda;
	});

	return (
		<div className="p-8 bg-gray-100 min-h-full">
			<div className="max-w-7xl mx-auto">
				<button
					type="button"
					onClick={() => navigate("/programa/validacion")}
					className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors animate-fade-in"
				>
					<ArrowLeftIcon className="h-4.5 w-4.5" />
					<span className="font-medium">Volver a Validación de documentos</span>
				</button>

				<div className="flex items-center gap-3 mb-6 animate-fade-in delay-75">
					<h1 className="text-xl font-bold text-gray-900">{cohorte.nombre}</h1>
					{cohorte.activa && (
						<span className="bg-red-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg">
							Activa
						</span>
					)}
				</div>

				<div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 xl:grid-cols-4">
					<button
						type="button"
						onClick={() => setFiltroEstado("TODOS")}
						className={`bg-white rounded-lg shadow p-4 text-left transition-all hover:shadow-lg animate-fade-in-up ${
							filtroEstado === "TODOS" ? "ring-2 ring-red-600" : ""
						}`}
					>
						<div className="text-xs text-gray-800 mb-1">Todos los aspirantes</div>
						<div className="text-2xl font-semibold text-gray-950">{totalAspirantes}</div>
					</button>
					<button
						type="button"
						onClick={() => setFiltroEstado("PAZ Y SALVO")}
						className={`bg-white rounded-lg shadow p-4 text-left transition-all hover:shadow-lg animate-fade-in-up ${
							filtroEstado === "PAZ Y SALVO" ? "ring-2 ring-red-600" : ""
						}`}
					>
						<div className="text-xs text-gray-800 mb-1">Por validar</div>
						<div className="text-2xl font-semibold text-red-600">{porValidar}</div>
					</button>
					<button
						type="button"
						onClick={() => setFiltroEstado("VALIDADO_EN_PROGRESO")}
						className={`bg-white rounded-lg shadow p-4 text-left transition-all hover:shadow-lg animate-fade-in-up ${
							filtroEstado === "VALIDADO_EN_PROGRESO" ? "ring-2 ring-red-600" : ""
						}`}
					>
						<div className="text-xs text-gray-800 mb-1">En progreso</div>
						<div className="text-2xl font-semibold text-amber-500">{enProgreso}</div>
					</button>
					<button
						type="button"
						onClick={() => setFiltroEstado("VALIDADO_POR_CALIFICAR")}
						className={`bg-white rounded-lg shadow p-4 text-left transition-all hover:shadow-lg animate-fade-in-up ${
							filtroEstado === "VALIDADO_POR_CALIFICAR" ? "ring-2 ring-red-600" : ""
						}`}
					>
						<div className="text-xs text-gray-800 mb-1">Validados</div>
						<div className="text-2xl font-semibold text-green-600">{validados}</div>
					</button>
				</div>

				<div className="mb-6 animate-fade-in-up delay-400">
					<div className="relative">
						<MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Buscar aspirante por nombre..."
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
						/>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in-up delay-500">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nombre</th>
								<th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Cédula</th>
								<th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Correo</th>
								<th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Última actualización</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{aspirantesFiltrados.map((aspirante) => (
								<tr
									key={aspirante.id}
									onClick={() => navigate(`/programa/validacion/aspirantes/${cohorte.id}/${aspirante.id}`)}
									className="hover:bg-gray-50 transition-colors cursor-pointer"
								>
									<td className="px-6 py-4 text-sm text-gray-900">{aspirante.nombre}</td>
									<td className="px-6 py-4 text-sm text-gray-600">{aspirante.cedula}</td>
									<td className="px-6 py-4 text-sm text-gray-600">{aspirante.correo}</td>
									<td className="px-6 py-4 text-sm text-gray-600">{obtenerUltimaActualizacion(aspirante.estadoGeneral)}</td>
								</tr>
							))}
							{aspirantesFiltrados.length === 0 && (
								<tr>
									<td className="px-6 py-8 text-sm text-gray-500" colSpan={4}>
										No hay aspirantes que coincidan con los filtros actuales.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}