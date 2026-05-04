import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import ufpsLogo from "../../assets/BLANCOufps.png";
import EntityCard, { type EndpointDef } from "./components/EntityCard";
import ModalCRUD from "./components/ModalCRUD";
import ModalResult from "./components/ModalResult";
import { superadminAuthService, superadminApiFetch } from "../../services/superadminService";

// ── Tipos ────────────────────────────────────────────────────────────────────

interface EntityInfo {
  nombre: string;
  baseUrl: string;
  schema: object;
}

// ── Configuración de endpoints base ──────────────────────────────────────────

const BASE_API = "https://proyectoposgradosbackend-production.up.railway.app/posgrados-project/api/dev/endpoint";

const ENDPOINTS: EndpointDef[] = [
  { metodo: "GET",    label: "GET (general)"   },
  { metodo: "GET_ID", label: "GET (individual)" },
  { metodo: "POST",   label: "POST"            },
  { metodo: "PUT",    label: "PUT"             },
  { metodo: "DELETE", label: "DELETE"          },
  { metodo: "PATCH",  label: "PATCH"           },
];

const DEMO_ENTITIES: EntityInfo[] = [
  {
    nombre: "facultad",
    baseUrl: `${BASE_API}/facultad`,
    schema: { id: 0, nombre: "string", correoFacultad: "string", nombreDecano: "string" },
  },
  {
    nombre: "roles",
    baseUrl: `${BASE_API}/roles`,
    schema: { id: 0, nombre: "string", descripcion: "string" },
  },
  {
    nombre: "aspirante",
    baseUrl: `${BASE_API}/aspirante`,
    schema: { id: 0, nombres: "string", apellidos: "string", cedula: "string", correo: "string" },
  },
  {
    nombre: "programa",
    baseUrl: `${BASE_API}/programa`,
    schema: { id: 0, nombre: "string", codigo: "string", nivel: "string" },
  },
  {
    nombre: "convocatoria",
    baseUrl: `${BASE_API}/convocatoria`,
    schema: { id: 0, nombre: "string", fechaInicio: "string", fechaFin: "string", estado: "string" },
  },
];

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
  const [entities, setEntities] = useState<EntityInfo[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [errorEntities, setErrorEntities] = useState<string | null>(null);
  const [openEntity, setOpenEntity] = useState<string | null>(null);
  const [modalCRUD, setModalCRUD] = useState<{ entidad: EntityInfo; metodo: string } | null>(null);
  const [modalResult, setModalResult] = useState<unknown>(null);

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
    try {
      // Usa el endpoint real del backend que lista todas las entidades disponibles
      type CatalogResponse = { endpoints?: { entity?: string; baseUrl?: string }[] };
      const catalog = await superadminApiFetch<CatalogResponse>(
        "/api/application/case/super-admin/endpoints"
      ).catch(() => null);

      if (catalog && Array.isArray((catalog as { endpoints?: unknown[] }).endpoints)) {
        const typedCatalog = catalog as { endpoints: { entity?: string; baseUrl?: string }[] };
        const loaded: EntityInfo[] = typedCatalog.endpoints
          .filter((e) => e.entity)
          .map((e) => ({
            nombre: e.entity!,
            baseUrl: e.baseUrl ?? `${BASE_API}/${e.entity}`,
            schema: { id: 0, nombre: "string" },
          }));
        if (loaded.length > 0) {
          setEntities(loaded);
          setLoadingEntities(false);
          return;
        }
      }

      // Fallback: construir entidades desde las rutas conocidas del backend
      const knownEntities = [
        "usuario", "ubicacion", "tipoplazo", "tipoentrevista", "tipodocumento",
        "sedes", "rol", "programa", "plazo", "persona", "pais", "otrosvalores",
        "ofertaacademica", "municipio", "modalidad", "jornada", "genero",
        "facultad", "estadodocumento", "estado", "entrevistadores", "entrevistador",
        "entrevista", "documento", "departamento", "cohorte", "clave", "cargo",
        "cambiodocumento", "aspirante", "administrativo",
      ];
      const loaded: EntityInfo[] = knownEntities.map((nombre) => ({
        nombre,
        baseUrl: `${BASE_API}/${nombre}`,
        schema: { id: 0, nombre: "string" },
      }));
      setEntities(loaded);
    } catch {
      setEntities(DEMO_ENTITIES);
      setErrorEntities("No se pudieron cargar las entidades. Mostrando entidades de demostración.");
    } finally {
      setLoadingEntities(false);
    }
  }, []);

  useEffect(() => { loadEntities(); }, [loadEntities]);

  const handleLogout = () => {
    superadminAuthService.logout();
    navigate("/superadmin/login");
  };

  const handleToggleEntity = (nombre: string) => {
    setOpenEntity((prev) => (prev === nombre ? null : nombre));
  };

  const handleOverlayClick = () => { setOpenEntity(null); };

  const handleEndpointClick = (entidad: EntityInfo, metodo: string) => {
    setModalCRUD({ entidad, metodo });
  };

  const handleResult = (data: unknown) => { setModalResult(data); };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative">

      {/* Overlay para cerrar acordeón */}
      {openEntity && !modalCRUD && (
        <div className="fixed inset-0 z-10" onClick={handleOverlayClick} aria-hidden="true" />
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────────
          Móvil  (<sm): dos filas — logo+info arriba, botón cerrar sesión abajo
          Desktop (sm+): una fila — logo+info a la izquierda, botón a la derecha
      ── */}
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

          {/* Botón cerrar sesión
              - Móvil: ancho completo, centrado, con borde superior sutil
              - Desktop: botón compacto a la derecha */}
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
        </section>

        {/* Banner de error/demo */}
        {errorEntities && (
          <div className="animate-fade-in mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-center gap-2">
            <span>⚠️</span>
            {errorEntities}
          </div>
        )}

        {/* Header de entidades */}
        <section className="animate-fade-in-up delay-200 mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Entidades del sistema</h2>
          <button
            type="button"
            onClick={loadEntities}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshIcon />
            Recargar
          </button>
        </section>

        {/* Lista de entidades */}
        <section className="flex flex-col gap-3">
          {loadingEntities ? (
            <div className="animate-fade-in flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full max-w-3xl mx-auto h-14 rounded-xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            entities.map((entity, idx) => (
              <div
                key={entity.nombre}
                className={`animate-fade-in-up delay-${Math.min(idx * 100 + 200, 600)}`}
              >
                <EntityCard
                  entidad={entity.nombre}
                  endpoints={ENDPOINTS}
                  isOpen={openEntity === entity.nombre}
                  onToggle={() => handleToggleEntity(entity.nombre)}
                  onEndpointClick={(metodo) => handleEndpointClick(entity, metodo)}
                />
              </div>
            ))
          )}
        </section>
      </main>

      {/* Modales */}
      {modalCRUD && (
        <ModalCRUD
          entidad={modalCRUD.entidad.nombre}
          metodo={modalCRUD.metodo}
          baseUrl={modalCRUD.entidad.baseUrl}
          schemaEjemplo={modalCRUD.entidad.schema}
          onClose={() => setModalCRUD(null)}
          onResult={(data) => handleResult(data)}
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
