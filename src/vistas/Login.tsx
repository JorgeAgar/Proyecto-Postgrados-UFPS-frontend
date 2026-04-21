import LoginForm from "../componentes/LoginForm";
import ufpsLogo from "../assets/logo-horizontal.jpg";
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
    <div
      className="animate-fade-in min-h-screen w-full relative overflow-hidden bg-no-repeat bg-cover bg-center"
 
    >
      {/* ── Logos institucionales ── */}
      <div className="relative flex flex-col w-full min-h-30">
        <div className="animate-slide-left delay-200 flex items-center gap-5 px-8 py-5">
          
          <img
            src={ufpsLogo}
            alt="Universidad Francisco de Paula Santander"
            className="h-20 w-auto"
          />
          <div className="w-px h-10 bg-gray-200" />
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
            max-w-90
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