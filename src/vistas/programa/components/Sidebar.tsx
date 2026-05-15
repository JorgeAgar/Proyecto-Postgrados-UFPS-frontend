import { useNavigate } from "react-router";
import AppSidebar, { type AppNavItem } from "../../../components/AppSidebar";

// ── Íconos ────────────────────────────────────────────────────────────────────

function InicioIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
    </svg>
  );
}


function CohorteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M7 17h10" />
    </svg>
  );
}

function AdmisionIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

// ── Navegación ────────────────────────────────────────────────────────────────

const NAV_ITEMS: AppNavItem[] = [
  { label: "Inicio",         to: "/programa/inicio",         Icon: InicioIcon },
  { label: "Cohortes",       to: "/programa/cohortes",       Icon: CohorteIcon },
  {
    label: "Admisión",
    Icon: AdmisionIcon,
    base: "/programa/admision",
    subItems: [
      { label: "Calificación", to: "/programa/admision/calificacion" },
      { label: "Admitidos",    to: "/programa/admision/admitidos" },
    ],
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface SidebarDirectorProgramaProps {
  mobileOpen: boolean;
  onClose: () => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function SidebarDirectorPrograma({
  mobileOpen,
  onClose,
}: SidebarDirectorProgramaProps) {
  const navigate = useNavigate();
  const sessionRaw = localStorage.getItem("ufps_programa_session");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  const handleLogout = () => {
    localStorage.removeItem("ufps_programa_session");
    localStorage.removeItem("ufps_programa_access_token");
    localStorage.removeItem("ufps_programa_refresh_token");
    navigate("/");
  };

  return (
    <AppSidebar
      title="Sistema de Postgrados"
      roleLabel="Director"
      session={session}
      navItems={NAV_ITEMS}
      onLogout={handleLogout}
      mobileOpen={mobileOpen}
      onClose={onClose}
    />
  );
}
