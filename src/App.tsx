/**
 * App.tsx - Enrutamiento Principal
 * 
 * Configuración de rutas de la aplicación.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

// Layouts
import { FuncionarioLayout, SuperAdminLayout, AuthLayout } from './layouts';
import AspiranteLayout from './layouts/AspiranteLayout';

// Pages
import { LoginPage } from './pages';
import { 
  InicioPage, 
  EstadoPage, 
  DocumentosPage, 
  EntrevistaPage, 
  PruebaPage 
} from './pages/aspirante';
import DeleteProgramsPage from './pages/funcionario/DeleteProgramsPage';

function Dashboard() {
  return <div>Dashboard - Página en construcción</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<LoginPage />} />
        </Route>
        
        {/* Rutas de Aspirante */}
        <Route element={<AspiranteLayout />}>
          <Route path="/aspirante" element={<Navigate to="/aspirante/inicio" replace />} />
          <Route path="/aspirante/inicio" element={<InicioPage />} />
          <Route path="/aspirante/estado" element={<EstadoPage />} />
          <Route path="/aspirante/documentos" element={<DocumentosPage />} />
          <Route path="/aspirante/entrevista" element={<EntrevistaPage />} />
          <Route path="/aspirante/prueba" element={<PruebaPage />} />
        </Route>
        
        {/* Rutas de Funcionario */}
        <Route element={<FuncionarioLayout />}>
          <Route path="/funcionario" element={<Navigate to="/funcionario/home" replace />} />
          <Route path="/funcionario/home" element={<Dashboard />} />
          <Route path="/funcionario/programas" element={<DeleteProgramsPage />} />
        </Route>
        
        {/* Rutas de Super Admin */}
        <Route element={<SuperAdminLayout />}>
          <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="/superadmin/dashboard" element={<Dashboard />} />
        </Route>
        
        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}