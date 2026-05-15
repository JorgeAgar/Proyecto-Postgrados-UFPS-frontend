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

function CriteriosIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 6h11M8.5 12h11M8.5 18h11" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
    </svg>
  );
}

// ── Navegación ────────────────────────────────────────────────────────────────

const NAV_ITEMS: AppNavItem[] = [
  { label: "Inicio",        to: "/programa/inicio",        Icon: InicioIcon },
  { label: "Cohortes",      to: "/programa/cohortes",      Icon: CohorteIcon },
  { label: "Criterios",     to: "/programa/criterios",     Icon: CriteriosIcon },
];

// ── Componente ────────────────────────────────────────────────────────────────

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function SidebarPrograma({ mobileOpen, onClose }: SidebarProps) {
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
