import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams, useLocation } from "react-router";
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { ProgramaOutletContext } from "../../../layouts/ProgramaLayout";
import {
	obtenerAspirantesPorCohortePagos,
	type AspirantePagosApi,
} from "../../../services/programa/validacionPagosCohorteService";

function Spinner() {
	return (
		<svg className="animate-spin h-6 w-6 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
		</svg>
	);
}

function FunnelIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[18px] w-[18px]">
			<path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
		</svg>
	);
}

const POR_PAGINA = 10;

type EstadoPago = "pendiente" | "en-revision" | "verificado";

function resolverEstadoPago(comprobantesEnviados: number, comprobantesVerificados: number): EstadoPago {
	if (comprobantesEnviados === 0) return "pendiente";
	if (comprobantesVerificados === comprobantesEnviados) return "verificado";
	return "en-revision";
}

function EstadoPagoBadge({
	comprobantesEnviados,
	comprobantesVerificados,
}: {
	comprobantesEnviados: number;
	comprobantesVerificados: number;
}) {
	const estado = resolverEstadoPago(comprobantesEnviados, comprobantesVerificados);
	if (estado === "verificado") {
		return (
			<span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-lg">
				Verificado
			</span>
		);
	}
	if (estado === "en-revision") {
		return (
			<span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-lg">
				En revisión
			</span>
		);
	}
	return (
		<span className="inline-block bg-neutral-200 text-neutral-600 text-xs font-semibold px-3 py-1 rounded-lg">
			Pendiente
		</span>
	);
}

export default function ValidacionPagosCohorte() {
	const navigate = useNavigate();
	const location = useLocation();
	const { mostrarAlerta } = useOutletContext<ProgramaOutletContext>();
	const { cohorteId } = useParams();
	const cohorteIdNumerico = cohorteId ? Number(cohorteId) : undefined;

	const nombreCohorte = (location.state as { nombreCohorte?: string; activa?: boolean } | null)?.nombreCohorte;
	const activa = (location.state as { nombreCohorte?: string; activa?: boolean } | null)?.activa ?? false;

	const [aspirantes, setAspirantes] = useState<AspirantePagosApi[]>([]);
	const [cargando, setCargando] = useState(true);
	const [filtroEstado, setFiltroEstado] = useState<"todos" | EstadoPago>("todos");
	const [mostrarFiltros, setMostrarFiltros] = useState(false);
	const [filtroCerrando, setFiltroCerrando] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [pagina, setPagina] = useState(1);

	useEffect(() => { setPagina(1); }, [searchTerm, filtroEstado]);

	useEffect(() => {
		if (!cohorteIdNumerico || Number.isNaN(cohorteIdNumerico)) {
			mostrarAlerta("La cohorte solicitada no es válida.", "error");
			navigate("/programa/pagos");
			return;
		}
		const cargar = async () => {
			setCargando(true);
			try {
				const datos = await obtenerAspirantesPorCohortePagos(cohorteIdNumerico);
				setAspirantes(datos);
			} catch {
				mostrarAlerta("No se pudieron cargar los aspirantes de la cohorte.", "error");
			} finally {
				setCargando(false);
			}
		};
		cargar();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cohorteIdNumerico]);

	const cerrarFiltro = (nuevoEstado?: "todos" | EstadoPago) => {
		setFiltroCerrando(true);
		setTimeout(() => {
			if (nuevoEstado !== undefined) setFiltroEstado(nuevoEstado);
			setMostrarFiltros(false);
			setFiltroCerrando(false);
		}, 120);
	};

	const pendientes  = aspirantes.filter((a) => resolverEstadoPago(a.comprobantesEnviados, a.comprobantesVerificados) === "pendiente").length;
	const enRevision  = aspirantes.filter((a) => resolverEstadoPago(a.comprobantesEnviados, a.comprobantesVerificados) === "en-revision").length;
	const verificados = aspirantes.filter((a) => resolverEstadoPago(a.comprobantesEnviados, a.comprobantesVerificados) === "verificado").length;
	const totalAspirantes = aspirantes.length;

	const aspirantesFiltrados = aspirantes.filter((aspirante) => {
		const estado = resolverEstadoPago(aspirante.comprobantesEnviados, aspirante.comprobantesVerificados);
		const coincideEstado = filtroEstado === "todos" || estado === filtroEstado;
		const coincideBusqueda = aspirante.nombre.toLowerCase().includes(searchTerm.toLowerCase());
		return coincideEstado && coincideBusqueda;
	});

	const totalPaginas = Math.ceil(aspirantesFiltrados.length / POR_PAGINA);
	const aspirantesPagina = aspirantesFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

	return (
		<div className="p-6 bg-gray-100 min-h-full" style={{ fontFamily: "Segoe UI, sans-serif" }}>
			<div className="">
				<div className="flex items-center gap-3 mb-6 animate-fade-in">
					<button
						onClick={() => navigate("/programa/pagos")}
						className="flex items-center gap-1 text-sm text-neutral-400 hover:text-red-700 transition-colors"
					>
						<ArrowLeftIcon className="h-[18px] w-[18px] shrink-0" />
					</button>
					<div>
						<h1 className="text-xl font-bold text-gray-900">Validación de Pagos</h1>
						{nombreCohorte && (
							<div className="flex items-center gap-2 mt-0.5">
								<span className="text-sm text-neutral-400">Cohorte: {nombreCohorte}</span>
								{activa && (
									<span className="bg-red-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg animate-fade-in">
										Activa
									</span>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Tarjetas de estadísticas */}
				<div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 xl:grid-cols-4">
					<div className="bg-white rounded-lg shadow p-4 text-left animate-fade-in-up">
						<div className="text-xs text-gray-800 mb-1">Todos los aspirantes</div>
						<div className="text-2xl font-semibold text-gray-950">{totalAspirantes}</div>
					</div>
					<div className="bg-white rounded-lg shadow p-4 text-left animate-fade-in-up">
						<div className="text-xs text-gray-800 mb-1">Pendientes</div>
						<div className="text-2xl font-semibold text-neutral-500">{pendientes}</div>
					</div>
					<div className="bg-white rounded-lg shadow p-4 text-left animate-fade-in-up">
						<div className="text-xs text-gray-800 mb-1">En revisión</div>
						<div className="text-2xl font-semibold text-amber-500">{enRevision}</div>
					</div>
					<div className="bg-white rounded-lg shadow p-4 text-left animate-fade-in-up">
						<div className="text-xs text-gray-800 mb-1">Verificados</div>
						<div className="text-2xl font-semibold text-green-600">{verificados}</div>
					</div>
				</div>

				{/* Barra de búsqueda y filtro */}
				<div className="relative z-10 flex gap-3 mb-6 animate-fade-in-up delay-400">
					<div className="flex-1 relative">
						<MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
						<input
							type="text"
							placeholder="Buscar aspirante por nombre..."
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent text-sm transition-colors"
						/>
					</div>

					<div className="relative">
						<button
							onClick={() => (mostrarFiltros ? cerrarFiltro() : setMostrarFiltros(true))}
							className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-gray-600 bg-white"
						>
							<FunnelIcon />
							<span className="text-sm font-medium">Filtrar</span>
						</button>

						{mostrarFiltros && (
							<div
								className={`absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 ${
									filtroCerrando ? "animate-dropdown-out" : "animate-dropdown-in"
								}`}
							>
								<div className="p-2">
									<div className="text-xs font-semibold text-neutral-400 uppercase px-3 py-2">
										Estado de pago
									</div>
									{(
										[
											{ value: "todos" as const,       label: "Todos" },
											{ value: "pendiente" as const,   label: "Pendiente" },
											{ value: "en-revision" as const, label: "En revisión" },
											{ value: "verificado" as const,  label: "Verificado" },
										] as const
									).map((opcion) => (
										<button
											key={opcion.value}
											onClick={() => cerrarFiltro(opcion.value)}
											className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
												filtroEstado === opcion.value
													? "bg-red-50 text-red-700 font-medium"
													: "text-gray-700 hover:bg-gray-100"
											}`}
										>
											{opcion.label}
										</button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Tabla */}
				{cargando ? (
					<div className="flex items-center justify-center py-20 animate-fade-in">
						<div className="flex items-center gap-3 text-neutral-400 text-sm">
							<Spinner />
							Cargando aspirantes...
						</div>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in-up delay-500">
						<div className="overflow-x-auto">
							<table className="w-full min-w-[640px]">
								<thead className="bg-gray-50 border-b border-gray-200">
									<tr>
										<th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nombre</th>
										<th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Cédula</th>
										<th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Correo</th>
										<th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{aspirantesFiltrados.length === 0 ? (
										<tr>
											<td className="px-6 py-8 text-sm text-gray-500" colSpan={4}>
												No hay aspirantes que coincidan con los filtros actuales.
											</td>
										</tr>
									) : (
										aspirantesPagina.map((aspirante) => (
											<tr
												key={aspirante.id}
												onClick={() =>
													navigate(
														`/programa/pagos/aspirantes/${cohorteId}/${aspirante.id}`,
														{ state: { nombreCohorte, activa } },
													)
												}
												className="hover:bg-gray-50 transition-colors cursor-pointer"
											>
												<td className="px-6 py-4 text-sm text-gray-900">{aspirante.nombre}</td>
												<td className="px-6 py-4 text-sm text-gray-600">{aspirante.cedula}</td>
												<td className="px-6 py-4 text-sm text-gray-600">{aspirante.correo}</td>
												<td className="px-6 py-4 text-sm">
													<EstadoPagoBadge
														comprobantesEnviados={aspirante.comprobantesEnviados}
														comprobantesVerificados={aspirante.comprobantesVerificados}
													/>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
						{totalPaginas > 1 && (
							<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
								<span className="text-xs text-neutral-400">
									{(pagina - 1) * POR_PAGINA + 1}–
									{Math.min(pagina * POR_PAGINA, aspirantesFiltrados.length)} de{" "}
									{aspirantesFiltrados.length} aspirantes
								</span>
								<div className="flex items-center gap-2">
									<button
										onClick={() => setPagina((p) => p - 1)}
										disabled={pagina === 1}
										className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
									>
										<ChevronLeftIcon className="h-4 w-4" />
										Anterior
									</button>
									<span className="text-sm font-medium text-gray-600 px-1">
										{pagina} / {totalPaginas}
									</span>
									<button
										onClick={() => setPagina((p) => p + 1)}
										disabled={pagina === totalPaginas}
										className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
									>
										Siguiente
										<ChevronRightIcon className="h-4 w-4" />
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
