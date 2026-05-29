import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams, useOutletContext } from "react-router";
import {
  fetchRankingAdmitidosByCohorte,
  admitirAspirante,
  revertirAdmision,
  fetchAdmittedList,
  type AspiranteRankingItem,
  type FiltroAdmision,
  type AdmittedListResponse,
} from "../../../services/programa/programaAdmitidosCohorteService";
import type { ProgramaOutletContext } from "../../../layouts/ProgramaLayout";

// ── Íconos (Heroicons) ────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[18px] w-[18px] shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[18px] w-[18px]">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 10.607Z" />
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

function RefreshIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function ListBulletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
    </svg>
  );
}

function XMarkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin shrink-0 ${className ?? "h-4 w-4"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Helpers de impresión ──────────────────────────────────────────────────────

function handlePrint(listaData: AdmittedListResponse) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const fechaHoy = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const filas = listaData.aspirantes
    .map(
      (a, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${a.nombre}</td>
        <td>${a.numerodocumento}</td>
        <td>${a.correo}</td>
        <td>${typeof a.puntaje === "number" ? a.puntaje.toFixed(1) : a.puntaje}</td>
      </tr>`
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Lista de Admitidos — ${listaData.cohorteActual.nombre}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #111; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitle { font-size: 13px; color: #666; margin-bottom: 20px; }
          .info { display: flex; gap: 32px; margin-bottom: 24px; flex-wrap: wrap; }
          .info-item { font-size: 13px; color: #555; }
          .info-item strong { color: #111; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f0f0f0; border: 1px solid #d0d0d0; padding: 8px 12px; text-align: left; font-weight: 600; }
          td { border: 1px solid #d0d0d0; padding: 8px 12px; }
          tr:nth-child(even) td { background: #fafafa; }
          @media print { @page { margin: 20mm; } body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>Lista de Admitidos</h1>
        <p class="subtitle">Programa de Postgrados UFPS &mdash; ${fechaHoy}</p>
        <div class="info">
          <div class="info-item">Cohorte: <strong>${listaData.cohorteActual.nombre}</strong></div>
          <div class="info-item">Total admitidos: <strong>${listaData.cohorteActual.totalAdmitidos}</strong></div>
          <div class="info-item">Cupos disponibles: <strong>${listaData.cohorteActual.cuposDisponibles}</strong></div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Nombre</th><th>Documento</th><th>Correo</th><th>Puntaje</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 400);
}

const POR_PAGINA = 10;

// ── Componente principal ──────────────────────────────────────────────────────

export default function AdmitidosCohorte() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cohorteId } = useParams<{ cohorteId: string }>();
  const { mostrarAlerta, mostrarConfirm } = useOutletContext<ProgramaOutletContext>();

  const nombreCohorteState = (location.state as { nombreCohorte?: string } | null)?.nombreCohorte;

  // ── Estado de ranking ─────────────────────────────────────────────────────
  const [rankingLoading, setRankingLoading] = useState(false);
  const [cohorteNombre, setCohorteNombre] = useState(nombreCohorteState ?? "");
  const [cohorteActiva, setCohorteActiva] = useState(false);
  const [cuposDisponibles, setCuposDisponibles] = useState(0);
  const [totalAdmitidos, setTotalAdmitidos] = useState(0);
  const [aspirantes, setAspirantes] = useState<AspiranteRankingItem[]>([]);

  // ── Estado de búsqueda/filtro ─────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroAdmision, setFiltroAdmision] = useState<FiltroAdmision>("todos");
  const [pagina, setPagina] = useState(1);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtroCerrando, setFiltroCerrando] = useState(false);

  // ── Estado de confirmación (admitir / revertir) ───────────────────────────
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [confirmacionCerrando, setConfirmacionCerrando] = useState(false);
  const [aspiranteObjetivo, setAspiranteObjetivo] = useState<AspiranteRankingItem | null>(null);
  const [procesando, setProcesando] = useState(false);

  // ── Estado de lista de admitidos (modal) ──────────────────────────────────
  const [mostrarLista, setMostrarLista] = useState(false);
  const [listaCerrando, setListaCerrando] = useState(false);
  const [listaLoading, setListaLoading] = useState(false);
  const [listaData, setListaData] = useState<AdmittedListResponse | null>(null);

  // ── Carga inicial del ranking ─────────────────────────────────────────────

  const loadRanking = async (id: string) => {
    setRankingLoading(true);
    try {
      const data = await fetchRankingAdmitidosByCohorte(id);
      setCohorteNombre(data.cohorteActual.nombre || nombreCohorteState || "");
      setCohorteActiva(data.cohorteActual.activa);
      setCuposDisponibles(data.cohorteActual.cuposDisponibles);
      setTotalAdmitidos(data.cohorteActual.totalAdmitidos);
      setAspirantes(data.aspirantes);
    } catch {
      mostrarAlerta("Error al cargar el ranking de la cohorte. Intenta de nuevo.", "error");
    } finally {
      setRankingLoading(false);
    }
  };

  useEffect(() => {
    if (!cohorteId) {
      mostrarAlerta("No se encontró el identificador de la cohorte.", "error");
      return;
    }
    loadRanking(cohorteId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohorteId]);

  useEffect(() => { setPagina(1); }, [searchTerm, filtroAdmision]);

  // ── Aspirantes filtrados ──────────────────────────────────────────────────

  const aspirantesFiltrados = useMemo(() => {
    return aspirantes.filter((a) => {
      const coincideBusqueda =
        a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.correo.toLowerCase().includes(searchTerm.toLowerCase());
      const coincideAdmision =
        filtroAdmision === "todos" ||
        (filtroAdmision === "admitidos" && a.admitido) ||
        (filtroAdmision === "porAdmitir" && !a.admitido);
      return a.completamenteCalificado && coincideBusqueda && coincideAdmision;
    });
  }, [aspirantes, searchTerm, filtroAdmision]);

  // ── Handlers filtro ───────────────────────────────────────────────────────

  const cerrarFiltro = (nuevoFiltro?: FiltroAdmision) => {
    setFiltroCerrando(true);
    setTimeout(() => {
      if (nuevoFiltro !== undefined) setFiltroAdmision(nuevoFiltro);
      setMostrarFiltros(false);
      setFiltroCerrando(false);
    }, 120);
  };

  // ── Handlers admisión ─────────────────────────────────────────────────────

  const handleAdmitir = (aspirante: AspiranteRankingItem) => {
    setAspiranteObjetivo(aspirante);
    setMostrarConfirmacion(true);
  };

  const handleQuitarAdmision = (aspirante: AspiranteRankingItem) => {
    setAspiranteObjetivo(aspirante);
    setMostrarConfirmacion(true);
  };

  const cerrarConfirmacion = () => {
    setConfirmacionCerrando(true);
    setTimeout(() => {
      setMostrarConfirmacion(false);
      setAspiranteObjetivo(null);
      setConfirmacionCerrando(false);
    }, 170);
  };

  const confirmarAccion = async () => {
    if (!aspiranteObjetivo || !cohorteId) return;
    setProcesando(true);
    try {
      if (aspiranteObjetivo.admitido) {
        await revertirAdmision(cohorteId, aspiranteObjetivo.id);
        setAspirantes((prev) =>
          prev.map((a) => (a.id === aspiranteObjetivo.id ? { ...a, admitido: false } : a))
        );
        setTotalAdmitidos((prev) => Math.max(prev - 1, 0));
        cerrarConfirmacion();
        mostrarConfirm("Admisión revertida correctamente.");
      } else {
        if (totalAdmitidos >= cuposDisponibles) {
          mostrarAlerta("No hay cupos disponibles para admitir más aspirantes.", "advertencia");
          cerrarConfirmacion();
          return;
        }
        await admitirAspirante(cohorteId, aspiranteObjetivo.id);
        setAspirantes((prev) =>
          prev.map((a) => (a.id === aspiranteObjetivo.id ? { ...a, admitido: true } : a))
        );
        setTotalAdmitidos((prev) => prev + 1);
        cerrarConfirmacion();
        mostrarConfirm("Aspirante admitido correctamente.");
      }
    } catch {
      mostrarAlerta("No se pudo completar la operación de admisión. Intenta de nuevo.", "error");
      cerrarConfirmacion();
    } finally {
      setProcesando(false);
    }
  };

  // ── Handlers generar lista ────────────────────────────────────────────────

  const handleGenerarLista = async () => {
    if (!cohorteId) return;
    setListaData(null);
    setListaLoading(true);
    setMostrarLista(true);
    try {
      const data = await fetchAdmittedList(cohorteId);
      setListaData(data);
    } catch {
      mostrarAlerta("Error al generar la lista de admitidos. Intenta de nuevo.", "error");
      cerrarLista();
    } finally {
      setListaLoading(false);
    }
  };

  const cerrarLista = () => {
    setListaCerrando(true);
    setTimeout(() => {
      setMostrarLista(false);
      setListaData(null);
      setListaCerrando(false);
    }, 170);
  };

  const totalPaginas = Math.ceil(aspirantesFiltrados.length / POR_PAGINA);
  const aspirantesPagina = aspirantesFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-100 min-h-full" style={{ fontFamily: "Segoe UI, sans-serif" }}>
      <div className="">

        {/* Encabezado */}
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <button
              onClick={() => navigate("/programa/admision/admitidos")}
              className="flex items-center gap-1 text-sm text-neutral-400 hover:text-red-700 transition-colors"
            >
              <ArrowLeftIcon />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admitidos</h1>
              {cohorteNombre && (
                <p className="text-sm text-neutral-400 mt-0.5">Cohorte: {cohorteNombre}</p>
              )}
            </div>
            {cohorteActiva && (
              <span className="bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded-lg shrink-0">
                Activa
              </span>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              onClick={() => cohorteId && loadRanking(cohorteId)}
              disabled={rankingLoading}
              title="Recargar ranking"
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {rankingLoading ? <Spinner className="h-4 w-4 text-red-700" /> : <RefreshIcon />}
              <span>Refrescar</span>
            </button>
            <button
              onClick={handleGenerarLista}
              disabled={rankingLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ListBulletIcon />
              Generar lista de admitidos
            </button>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 animate-fade-in-up delay-100">
            <div className="text-xs text-neutral-400 mb-1">Admitidos / cupos</div>
            <div className="text-2xl font-bold text-red-700">{totalAdmitidos}<span className="text-base font-normal text-neutral-400"> / {cuposDisponibles}</span></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 animate-fade-in-up delay-200">
            <div className="text-xs text-neutral-400 mb-1">Por admitir</div>
            <div className="text-2xl font-bold text-amber-400">
              {aspirantesFiltrados.filter((a) => !a.admitido).length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 animate-fade-in-up delay-300">
            <div className="text-xs text-neutral-400 mb-1">Completamente calificados</div>
            <div className="text-2xl font-bold text-green-700">
              {aspirantes.filter((a) => a.completamenteCalificado).length}
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="relative z-10 flex gap-3 mb-6 animate-fade-in-up delay-400">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Buscar aspirante por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-colors"
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
              <div className={`absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg z-50 ${filtroCerrando ? "animate-dropdown-out" : "animate-dropdown-in"}`}>
                <div className="p-2">
                  <div className="text-xs font-semibold text-neutral-400 uppercase px-3 py-2">
                    Estado de admisión
                  </div>
                  {([
                    { value: "todos" as FiltroAdmision, label: "Todos" },
                    { value: "admitidos" as FiltroAdmision, label: "Admitidos" },
                    { value: "porAdmitir" as FiltroAdmision, label: "Por admitir" },
                  ]).map((opcion) => (
                    <button
                      key={opcion.value}
                      onClick={() => cerrarFiltro(opcion.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filtroAdmision === opcion.value
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

        {/* Tabla de ranking */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in-up delay-500">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Ranking</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Correo</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Puntaje</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Admisión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankingLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                        <Spinner className="h-5 w-5 text-red-700" />
                        Cargando ranking...
                      </div>
                    </td>
                  </tr>
                ) : aspirantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-neutral-400">
                      No hay aspirantes que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  aspirantesPagina.map((aspirante) => (
                    <tr
                      key={aspirante.id}
                      className={`transition-colors ${
                        aspirante.admitido ? "bg-green-50 hover:bg-green-100/60" : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm">
                        <span className="font-bold text-red-700 text-base">#{aspirante.ranking}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{aspirante.nombre}</td>
                      <td className="px-6 py-4 text-sm text-neutral-400">{aspirante.correo}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-semibold text-red-700">{aspirante.puntaje.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {aspirante.admitido ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-lg border border-green-200">
                              <CheckCircleIcon />
                              Admitido
                            </span>
                            <button
                              onClick={() => handleQuitarAdmision(aspirante)}
                              disabled={procesando}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-60 transition-colors font-medium"
                            >
                              {procesando && aspiranteObjetivo?.id === aspirante.id ? <Spinner className="h-3.5 w-3.5 text-white" /> : null}
                              Revertir
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAdmitir(aspirante)}
                            disabled={totalAdmitidos >= cuposDisponibles || procesando}
                            className="px-4 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {procesando && aspiranteObjetivo?.id === aspirante.id ? <Spinner className="h-3.5 w-3.5 text-white inline mr-1" /> : null}
                            Admitir
                          </button>
                        )}
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
                {(pagina - 1) * POR_PAGINA + 1}–{Math.min(pagina * POR_PAGINA, aspirantesFiltrados.length)} de {aspirantesFiltrados.length} aspirantes
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagina((p) => p - 1)}
                  disabled={pagina === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
                >
                  <ChevronLeftIcon />
                  Anterior
                </button>
                <span className="text-sm font-medium text-gray-600 px-1">{pagina} / {totalPaginas}</span>
                <button
                  onClick={() => setPagina((p) => p + 1)}
                  disabled={pagina === totalPaginas}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-700"
                >
                  Siguiente
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Confirmar admitir / revertir ───────────────────────────────── */}
      {mostrarConfirmacion && aspiranteObjetivo && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${confirmacionCerrando ? "animate-overlay-out" : "animate-overlay-in"}`}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full mx-4 ${confirmacionCerrando ? "animate-modal-out" : "animate-modal-in"}`}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {aspiranteObjetivo.admitido ? "Revertir admisión" : "Confirmar admisión"}
              </h3>
              <button
                onClick={cerrarConfirmacion}
                disabled={procesando}
                className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-400 disabled:opacity-50"
              >
                <XMarkIcon />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-700">
                {aspiranteObjetivo.admitido
                  ? `¿Estás seguro de revertir la admisión de ${aspiranteObjetivo.nombre}?`
                  : `¿Estás seguro de admitir a ${aspiranteObjetivo.nombre}?`}
              </p>
              {!aspiranteObjetivo.admitido && totalAdmitidos >= cuposDisponibles && (
                <div className="mt-3 text-sm text-amber-400 bg-amber-100 border border-amber-200 rounded-lg px-3 py-2">
                  No hay cupos disponibles para admitir más aspirantes.
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={cerrarConfirmacion}
                disabled={procesando}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                disabled={procesando || (!aspiranteObjetivo.admitido && totalAdmitidos >= cuposDisponibles)}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {procesando ? <><Spinner className="h-4 w-4 text-white" />Procesando...</> : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Lista de admitidos ─────────────────────────────────────────── */}
      {mostrarLista && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${listaCerrando ? "animate-overlay-out" : "animate-overlay-in"}`}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col ${listaCerrando ? "animate-modal-out" : "animate-modal-in"}`}>
            {/* Cabecera */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Lista de Admitidos</h3>
                {listaData && (
                  <p className="text-sm text-neutral-400 mt-0.5">Cohorte: {listaData.cohorteActual.nombre}</p>
                )}
              </div>
              <button
                onClick={cerrarLista}
                className="p-1 rounded-lg hover:bg-neutral-200 text-neutral-400"
              >
                <XMarkIcon />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="flex-1 overflow-y-auto p-6">
              {listaLoading ? (
                <div className="flex items-center justify-center gap-3 py-16 text-sm text-neutral-400">
                  <Spinner className="h-6 w-6 text-red-700" />
                  Generando lista...
                </div>
              ) : listaData ? (
                <>
                  {/* Resumen cohorte */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-neutral-400 mb-0.5">Total admitidos</div>
                      <div className="text-xl font-bold text-red-700">{listaData.cohorteActual.totalAdmitidos}</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-neutral-400 mb-0.5">Cupos disponibles</div>
                      <div className="text-xl font-bold text-gray-800">{listaData.cohorteActual.cuposDisponibles}</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 col-span-2 sm:col-span-1">
                      <div className="text-xs text-neutral-400 mb-0.5">Estado cohorte</div>
                      <div className="mt-1">
                        {listaData.cohorteActual.activa ? (
                          <span className="bg-red-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg">Activa</span>
                        ) : (
                          <span className="bg-neutral-200 text-neutral-500 text-xs font-semibold px-2.5 py-1 rounded-lg">Inactiva</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tabla de aspirantes */}
                  {listaData.aspirantes.length === 0 ? (
                    <p className="text-center py-8 text-sm text-neutral-400">No hay aspirantes admitidos en esta cohorte.</p>
                  ) : (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-600">Documento</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-600">Correo</th>
                              <th className="text-left px-4 py-3 font-semibold text-gray-600">Puntaje</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {listaData.aspirantes.map((a, idx) => (
                              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-neutral-400">{idx + 1}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">{a.nombre}</td>
                                <td className="px-4 py-3 text-gray-600">{a.numerodocumento}</td>
                                <td className="px-4 py-3 text-gray-600">{a.correo}</td>
                                <td className="px-4 py-3">
                                  <span className="font-semibold text-red-700">{typeof a.puntaje === "number" ? a.puntaje.toFixed(1) : a.puntaje}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Pie */}
            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end shrink-0">
              <button
                onClick={cerrarLista}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center"
              >
                Cerrar
              </button>
              {listaData && listaData.aspirantes.length > 0 && (
                <button
                  onClick={() => handlePrint(listaData)}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
                >
                  <PrinterIcon />
                  Imprimir / Exportar PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
