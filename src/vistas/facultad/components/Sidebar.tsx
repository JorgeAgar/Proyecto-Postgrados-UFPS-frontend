import { useNavigate } from "react-router";
import AppSidebar, { type AppNavItem } from "../../../components/AppSidebar";

function InicioIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
			<path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
			<path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
		</svg>
	);
}

function ProgramasIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" stroke="currentColor" strokeWidth="1.8">
			<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
			<path strokeLinecap="round" strokeLinejoin="round" d="M8 6v12" />
		</svg>
	);
}

const NAV_ITEMS: AppNavItem[] = [
	{ label: "Inicio", to: "/facultad/inicio", Icon: InicioIcon },
	{ label: "Programas", to: "/facultad/programas", Icon: ProgramasIcon },
];

interface SidebarFacultadProps {
	mobileOpen: boolean;
	onClose: () => void;
}

export default function SidebarFacultad({ mobileOpen, onClose }: SidebarFacultadProps) {
	const navigate = useNavigate();
	const sessionRaw = localStorage.getItem("session");
	const session = sessionRaw ? JSON.parse(sessionRaw) : null;

	const handleLogout = () => {
		localStorage.removeItem("session");
		localStorage.removeItem("auth_token");
		navigate("/");
	};

	return (
		<AppSidebar
			title="Sistema de Postgrados"
			roleLabel="Facultad"
			session={session}
			navItems={NAV_ITEMS}
			onLogout={handleLogout}
			mobileOpen={mobileOpen}
			onClose={onClose}
		/>
	);
}
