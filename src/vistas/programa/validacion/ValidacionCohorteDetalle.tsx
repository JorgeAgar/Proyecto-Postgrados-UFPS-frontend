import { useNavigate, useParams } from "react-router";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useMemo, useState } from "react";
import { obtenerAspirantes, obtenerCohorte } from "../../../services/programa/validacionService";

export default function ValidacionCohorteDetalle() {
	const navigate = useNavigate();
	const { cohorteId } = useParams();
	const cohorte = useMemo(() => obtenerCohorte(cohorteId), [cohorteId]);
	const [filtroEstado, setFiltroEstado] = useState<"todos" | "por validar" | "en progreso" | "validados">("todos");
	const [searchTerm, setSearchTerm] = useState("");

	const aspirantes = obtenerAspirantes(cohorte.id);
	const porValidar = aspirantes.filter((aspirante) => aspirante.estado === "por validar").length;
	const enProgreso = aspirantes.filter((aspirante) => aspirante.estado === "en progreso").length;
	const validados = aspirantes.filter((aspirante) => aspirante.estado === "validados").length;

	const aspirantesFiltrados = aspirantes.filter((aspirante) => {
		const coincideEstado = filtroEstado === "todos" || aspirante.estado === filtroEstado;
		const coincideBusqueda = aspirante.nombre.toLowerCase().includes(searchTerm.toLowerCase());
		return coincideEstado && coincideBusqueda;
	});

	return (
		<div className="p-8 bg-gray-100 min-h-full">
			<div className="max-w-7xl mx-auto">
				<button
					type="button"
					onClick={() => navigate("/programa/validacion")}
					className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors"
				>
					<ArrowLeftIcon className="h-4.5 w-4.5" />
					<span className="font-medium">Volver a Validación de documentos</span>
				</button>

				<div className="flex items-center gap-3 mb-6">
					<h1 className="text-xl font-bold text-gray-900">{cohorte.nombre}</h1>
					{cohorte.activa && (
						<span className="bg-red-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg">
							Activa
						</span>
					)}
				</div>

				<div className="grid grid-cols-3 gap-4 mb-6">
					<button
						type="button"
						onClick={() => setFiltroEstado("por validar")}
						className={`bg-white rounded-lg shadow p-4 text-left transition-all hover:shadow-md ${
							filtroEstado === "por validar" ? "ring-2 ring-red-700" : ""
						}`}
					>
						<div className="text-xs text-gray-500 mb-1">Por validar</div>
						<div className="text-2xl font-semibold text-gray-900">{porValidar}</div>
					</button>
					<button
						type="button"
						onClick={() => setFiltroEstado("en progreso")}
						className={`bg-white rounded-lg shadow p-4 text-left transition-all hover:shadow-md ${
							filtroEstado === "en progreso" ? "ring-2 ring-red-700" : ""
						}`}
					>
						<div className="text-xs text-gray-500 mb-1">En progreso</div>
						<div className="text-2xl font-semibold text-orange-600">{enProgreso}</div>
					</button>
					<button
						type="button"
						onClick={() => setFiltroEstado("validados")}
						className={`bg-white rounded-lg shadow p-4 text-left transition-all hover:shadow-md ${
							filtroEstado === "validados" ? "ring-2 ring-red-700" : ""
						}`}
					>
						<div className="text-xs text-gray-500 mb-1">Validados</div>
						<div className="text-2xl font-semibold text-green-600">{validados}</div>
					</button>
				</div>

				<div className="mb-6">
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

				<div className="bg-white rounded-lg shadow overflow-hidden">
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
									onClick={() => navigate(`/programa/validacion/cohortes/${cohorte.id}/aspirantes/${aspirante.id}`)}
									className="hover:bg-gray-50 transition-colors cursor-pointer"
								>
									<td className="px-6 py-4 text-sm text-gray-900">{aspirante.nombre}</td>
									<td className="px-6 py-4 text-sm text-gray-600">{aspirante.cedula}</td>
									<td className="px-6 py-4 text-sm text-gray-600">{aspirante.correo}</td>
									<td className="px-6 py-4 text-sm text-gray-600">{aspirante.ultimaActualizacion}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}