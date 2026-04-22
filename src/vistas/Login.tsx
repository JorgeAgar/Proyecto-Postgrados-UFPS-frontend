import LoginForm from "../components/LoginForm";
import ufpsLogo from "../assets/logoufps.png";
import flujoabs from "../assets/flujoabs.jpg";
/**
 * Vista Login
 *
 * Layout de dos columnas:
 * - Izquierda: logos + acento rojo decorativo
 * - Derecha: panel de imagen institucional
 * - Centro superpuesto: tarjeta del formulario de login
 *
 * El componente Logo fue unificado aquí directamente ya que
 * solo se utiliza en esta vista (no ameritaba un componente separado).
 *
 * Responsive: en móvil el formulario ocupa todo el ancho.
 */
export default function Login() {
  return (
    <div className="animate-fade-in min-h-screen w-full relative overflow-hidden bg-gradient-to-b bg-no-repeat bg-cover bg-center from-red-50 via-white to-gray-100"
      style={{ backgroundImage:  `url(${flujoabs})`}} 
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
      <div className="flex items-center justify-center px-4 pb-10">
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
          <LoginForm />
        </div>
      </div>
    </div>
  );
}