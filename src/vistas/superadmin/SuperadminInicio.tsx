import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import ufpsLogo from "../../assets/BLANCOufps.png";
import EntityCard from "./components/EntityCard";
import ModalCRUD from "./components/ModalCRUD";
import ModalResult from "./components/ModalResult";
import {
  superadminAuthService,
  getSuperAdminEndpoints,
  type EntityGroup,
  type SuperAdminCatalog,
  type BackendEndpoint,
} from "../../services/superadminService";

// ── Icons ─────────────────────────────────────────────────────────────────────

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4 flex-shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h8a2 2 0 012 2v12a2 2 0 01-2 2H9" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 flex-shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 20v-6h-6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.1 15A9 9 0 1020 9" />
    </svg>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<string>("Superadmin");
  const [catalog, setCatalog] = useState<SuperAdminCatalog | null>(null);
  const [groups, setGroups] = useState<EntityGroup[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [errorEntities, setErrorEntities] = useState<string | null>(null);
  const [openEntity, setOpenEntity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal CRUD: se abre con el endpoint real seleccionado
  const [modalEndpoint, setModalEndpoint] = useState<BackendEndpoint | null>(null);
  // Modal Result: se abre con la data de respuesta
  const [modalResult, setModalResult] = useState<unknown>(null);

  // Filtrar grupos según búsqueda (por nombre de controller)
  const filteredGroups = searchQuery.trim()
    ? groups.filter((g) =>
        g.controller.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : groups;

  useEffect(() => {
    if (!superadminAuthService.isAuthenticated()) {
      navigate("/superadmin/login");
      return;
    }
    const session = superadminAuthService.getSession();
    if (session?.username) setUsuario(session.username);
  }, [navigate]);

  const loadEntities = useCallback(async () => {
    setLoadingEntities(true);
    setErrorEntities(null);
    setOpenEntity(null);
    try {
      const { catalog: cat, groups: grps } = await getSuperAdminEndpoints();
      setCatalog(cat);
      setGroups(grps);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setErrorEntities(`No se pudieron cargar los endpoints: ${msg}`);
      setCatalog(null);
      setGroups([]);
    } finally {
      setLoadingEntities(false);
    }
  }, []);

  useEffect(() => { loadEntities(); }, [loadEntities]);

  const handleLogout = () => {
    superadminAuthService.logout();
    navigate("/superadmin/login");
  };

  const handleToggleEntity = (controller: string) => {
    setOpenEntity((prev) => (prev === controller ? null : controller));
  };

  const handleOverlayClick = () => {
    // Solo cerrar acordeón si no hay modal abierto
    if (!modalEndpoint) setOpenEntity(null);
  };

  // Al hacer clic en un endpoint dentro del EntityCard → abrir ModalCRUD
  const handleEndpointClick = (ep: BackendEndpoint) => {
    setModalEndpoint(ep);
  };

  // Resultado de una operación → solo guardar la data.
  // El ModalCRUD se cierra solo vía su propio triggerClose/onClose.
  // NO tocar modalEndpoint aquí para evitar desmontajes prematuros que
  // interfieren con la animación de salida y corrompen el estado de modalResult.
  const handleResult = (data: unknown) => {
    setModalResult(data);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative">

      {/* Overlay para cerrar acordeón */}
      {openEntity && !modalEndpoint && (
        <div className="fixed inset-0 z-10" onClick={handleOverlayClick} aria-hidden="true" />
      )}

      {/* ── HEADER — idéntico al original ─────────────────────────────────── */}
      <header className="relative z-20 animate-fade-in delay-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white shadow-lg flex-shrink-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          {/* Logo + info institucional */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <img src={ufpsLogo} alt="UFPS" className="h-10 sm:h-12 w-auto flex-shrink-0" />
            <div className="w-px h-8 sm:h-10 bg-white/20 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-300 uppercase tracking-widest leading-tight truncate">
                Universidad Francisco de Paula Santander
              </span>
              <span className="text-base sm:text-lg font-black leading-tight">Sistema de Postgrados</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldIcon />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-300">Panel de Superadministrador</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            className="flex items-center justify-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg transition-colors w-full sm:w-auto flex-shrink-0"
          >
            <LogoutIcon />
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="relative z-20 flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8">

        {/* Bienvenida */}
        <section className="animate-fade-in-up delay-100 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Bienvenido, <span className="capitalize">{usuario}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            En esta sección puedes gestionar dinámicamente las entidades del sistema y ejecutar
            operaciones sobre la base de datos mediante los endpoints disponibles en el backend.
          </p>
          {catalog && (
            <p className="mt-1 text-xs text-slate-400">
              {catalog.description} —{" "}
              <span className="font-semibold">{catalog.total} endpoints</span>{" "}
              en{" "}
              <span className="font-semibold">{groups.length} controllers</span>
            </p>
          )}
        </section>

        {/* Banner de error */}
        {errorEntities && (
          <div className="animate-fade-in mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-center gap-2">
            <span>⚠️</span>
            {errorEntities}
          </div>
        )}

        {/* Header de entidades + búsqueda */}
        <section className="animate-fade-in-up delay-200 mb-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Entidades del sistema
              {!loadingEntities && groups.length > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {searchQuery.trim() && filteredGroups.length !== groups.length
                    ? `${filteredGroups.length} de ${groups.length}`
                    : `(${groups.length})`}
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={loadEntities}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshIcon />
              Recargar
            </button>
          </div>

          {/* Buscador de controllers */}
          {!loadingEntities && groups.length > 0 && (
            <div className="relative w-full max-w-3xl mx-auto">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setOpenEntity(null); }}
                placeholder="Buscar controller / entidad..."
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setOpenEntity(null); }}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </section>

        {/* Lista de entidades (controllers agrupados) */}
        <section className="flex flex-col gap-3">
          {loadingEntities ? (
            <div className="animate-fade-in flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full max-w-3xl mx-auto h-14 rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="w-full max-w-3xl mx-auto rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
              {searchQuery.trim() ? `No hay controllers que coincidan con "${searchQuery}".` : "No se encontraron entidades."}
            </div>
          ) : (
            filteredGroups.map((group, idx) => (
              <div
                key={group.controller}
                className={`animate-fade-in-up delay-${Math.min(idx * 100 + 200, 600)}`}
              >
                <EntityCard
                  controller={group.controller}
                  endpoints={group.endpoints}
                  isOpen={openEntity === group.controller}
                  onToggle={() => handleToggleEntity(group.controller)}
                  onEndpointClick={handleEndpointClick}
                />
              </div>
            ))
          )}
        </section>
      </main>

      {/* ── Modales ────────────────────────────────────────────────────────── */}

      {modalEndpoint && (
        <ModalCRUD
          endpoint={modalEndpoint}
          onClose={() => setModalEndpoint(null)}
          onResult={handleResult}
        />
      )}

      {modalResult !== null && (
        <ModalResult
          data={modalResult}
          onClose={() => setModalResult(null)}
        />
      )}
    </div>
  );
}