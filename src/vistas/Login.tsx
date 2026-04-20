import LoginForm from "../componentes/LoginForm";
import ufpsLogoHorizontal from "../assets/logo-horizontal.jpg";

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
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-b from-red-50 via-white to-gray-100">
      {/* ── Logos institucionales ── */}
      <div className="relative flex flex-col items-start w-full min-h-[120px] ">
        <div className="animate-slide-left delay-100 rounded-xl border border-gray-200 bg-white/90 shadow-sm px-4 py-3">
          <img
            src={ufpsLogoHorizontal}
            alt="Universidad Francisco de Paula Santander"
            className="h-20 w-auto"
          />
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