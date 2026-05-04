import { useState } from "react";
import { useNavigate } from "react-router";
import InputField from "../../components/InputField";
import ufpsLogo from "../../assets/NEGROufps.png";
import flujoabs from "../../assets/flujoabs.jpg";
import { superadminAuthService } from "../../services/superadminService";

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
    </svg>
  );
}

function ExclamationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

export default function LoginSuperAdmin() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ usuario?: string; password?: string }>({});

  // Muestra error bajo el input si hay un error en ese campo (cubre campo vacío al submit).
  const mostrarErrorUsuario  = !!fieldErrors.usuario;
  const mostrarErrorPassword = !!fieldErrors.password;

  const validate = () => {
    const errs: { usuario?: string; password?: string } = {};
    if (!usuario.trim()) errs.usuario = "El usuario es obligatorio.";
    if (!password.trim()) errs.password = "La contraseña es obligatoria.";
    else if (password.trim().length < 6) errs.password = "Mínimo 6 caracteres.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setError("Revisa los campos marcados para continuar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await superadminAuthService.login(usuario.trim(), password);
      navigate("/superadmin/inicio");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Credenciales inválidas.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="animate-fade-in min-h-screen w-full relative overflow-hidden bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${flujoabs})` }}
    >
      {/* ── Logos institucionales ── */}
      <div className="relative flex flex-col w-full min-h-[120px]">
        <div className="animate-slide-left delay-200 flex items-center gap-5 px-8 py-5">
          <img
            src={ufpsLogo}
            alt="Universidad Francisco de Paula Santander"
            className="h-14 w-auto"
          />
          <div className="w-px h-10 bg-gray-200" />
          <div className="flex flex-col items-center justify-center bg-gray-100 rounded px-3 py-2 border border-gray-200">
            <span
              className="text-xl font-extrabold leading-none"
              style={{ color: "var(--ufps-red)" }}
            >
              UFPS
            </span>
            <span className="text-[9px] text-gray-500 font-semibold mt-0.5 text-center leading-tight">
              Universidad Francisco de<br />Paula Santander
            </span>
          </div>
        </div>
      </div>

      {/* ── Tarjeta flotante de login ── */}
      <div className="flex items-center justify-center -mt-3 md:-mt-6">
        <div
          className="
            bg-white
            rounded-xl
            shadow-[0_8px_40px_rgba(0,0,0,0.15)]
            p-8
            w-full
            max-w-[360px]
            animate-fade-in-up
            delay-200
          "
        >
          <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
            <div className="text-center animate-fade-in-up bg-slate-900 text-white rounded-md p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ShieldIcon />
                <h1 className="text-2xl font-bold tracking-wide">Superadmin</h1>
              </div>
              <p className="text-xs mt-1 text-slate-300">Acceso restringido al panel administrativo</p>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-md text-sm border animate-fade-in bg-red-50 border-red-200 text-red-900">
                {error}
              </div>
            )}

            <div className="animate-fade-in-up">
              <label htmlFor="usuario" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                <UserIcon />
                Usuario
              </label>
              <div className="bg-gray-50 rounded-md border border-gray-200">
                <InputField
                  id="usuario"
                  type="text"
                  placeholder="superadmin"
                  value={usuario}
                  onChange={(v) => { setUsuario(v); setFieldErrors((p) => ({ ...p, usuario: undefined })); setError(null); }}
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
              {mostrarErrorUsuario && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
                  <ExclamationIcon />
                  {fieldErrors.usuario}
                </p>
              )}
            </div>

            <div className="animate-fade-in-up">
              <label htmlFor="sa-password" className="mb-1 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                <LockIcon />
                Contraseña
              </label>
              <div className="bg-gray-50 rounded-md border border-gray-200">
                <InputField
                  id="sa-password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(v) => { setPassword(v); setFieldErrors((p) => ({ ...p, password: undefined })); setError(null); }}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
              {mostrarErrorPassword && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
                  <ExclamationIcon />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* ¿Olvidaste tu contraseña? — navega sin recargar la página (SPA) */}
            <div className="text-right -mt-1 -mb-2">
              <button
                type="button"
                className="text-xs text-slate-600 hover:text-slate-900 hover:underline transition-colors"
                onClick={() =>
                  navigate(
                    "/recuperar-password?loginRuta=/superadmin/login&rol=Superadmin"
                  )
                }
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="mt-1 animate-fade-in-up">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full text-white font-bold bg-slate-900 rounded-md p-3 hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading && <Spinner />}
                {loading ? "Validando..." : "Iniciar sesión"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
