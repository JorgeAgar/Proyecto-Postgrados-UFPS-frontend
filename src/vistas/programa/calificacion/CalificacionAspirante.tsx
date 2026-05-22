import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams, useOutletContext } from "react-router";
import {
  getEntrevistasByAspirante,
  agendarEntrevista,
  reagendarEntrevista,
  completarEntrevista,
  cancelarEntrevista,
  getCriteriosByAspirante,
  updateCriterio,
  getPruebasByAspirante,
  crearPrueba,
  reagendarPrueba,
  completarPrueba,
  cancelarPrueba,
} from "../../../services/programa/programaCalificacionAspiranteService";
import type { ProgramaOutletContext } from "../../../layouts/ProgramaLayout";

// ── Íconos (Heroicons) ────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-[18px] w-[18px] shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0 text-neutral-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0 text-neutral-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0 text-neutral-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Criterio {
  id: number;
  nombre: string;
  peso: number;
  puntaje: number;
}

interface Entrevista {
  id: string;
  fecha: string;
  hora: string;
  modalidad: "virtual" | "presencial";
  lugar: string;
  estado: "pendiente" | "confirmada" | "solicitud de cambio" | "cancelada" | "completada";
  motivo?: string;
}

interface Prueba {
  id: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  hora: string;
  modalidad: "virtual" | "presencial";
  lugar: string;
  estado: "pendiente" | "confirmada" | "solicitud de cambio" | "cancelada" | "completada";
  motivo?: string;
}

// ── Helpers de mapeo backend → frontend ──────────────────────────────────────

function mapEstadoEntrevista(estado: string): Entrevista["estado"] {
  const m: Record<string, Entrevista["estado"]> = {
    "CONFIRMADA":                "confirmada",
    "PENDIENTE DE CONFIRMACION": "pendiente",
    "SOLICITUD DE CAMBIO":       "solicitud de cambio",
    "COMPLETADA":                "completada",
    "CANCELADA":                 "cancelada",
  };
  return m[estado] ?? "pendiente";
}

function mapModalidad(idTipoentrevista: number): "virtual" | "presencial" {
  return idTipoentrevista === 1 ? "presencial" : "virtual";
}

function modalidadToId(modalidad: "virtual" | "presencial"): number {
  return modalidad === "presencial" ? 1 : 2;
}

// ── Helper: badge de estado entrevista ────────────────────────────────────────

function EntrevistaBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    confirmada:            "bg-green-100 text-green-700",
    "solicitud de cambio": "bg-amber-100 text-amber-600",
    pendiente:             "bg-yellow-100 text-yellow-600",
    cancelada:             "bg-red-100 text-red-700",
    completada:            "bg-neutral-200 text-neutral-600",
  };
  const labels: Record<string, string> = {
    confirmada:            "Confirmada",
    "solicitud de cambio": "Solicitud de cambio",
    pendiente:             "Pendiente de confirmación",
    cancelada:             "Cancelada",
    completada:            "Completada",
  };
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-lg ${map[estado] ?? "bg-gray-100 text-gray-700"}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

function ModalidadBadge({ modalidad }: { modalidad: string }) {
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-lg ${
      modalidad === "virtual" ? "bg-blue-100 text-blue-700" : "bg-neutral-200 text-neutral-700"
    }`}>
      {modalidad === "virtual" ? "Virtual" : "Presencial"}
    </span>
  );
}

// ── Helpers de formato ────────────────────────────────────────────────────────

const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];

function formatFecha(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${parseInt(day)} de ${MESES[parseInt(month) - 1]} de ${year}`;
}

function formatHora(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function CalificacionAspirante() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { mostrarAlerta, mostrarConfirm } = useOutletContext<ProgramaOutletContext>();
  const aspiranteId = parseInt(id ?? "0");

  const state = location.state as { nombre?: string; correo?: string; documento?: number } | null;
  const aspiranteNombre = state?.nombre ?? "Aspirante";
  const aspiranteCorreo = state?.correo ?? "aspirante@email.com";
  const aspiranteDocumento = state?.documento ?? null;

  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [puntajeTotalBackend, setPuntajeTotalBackend] = useState(0);
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [entrevistaEditando, setEntrevistaEditando] = useState<string | null>(null);
  const [nuevaEntrevista, setNuevaEntrevista] = useState({
    fecha: "",
    hora: "",
    modalidad: "virtual" as "virtual" | "presencial",
    lugar: "",
  });
  const [erroresAgendar, setErroresAgendar] = useState<{ fecha?: string; hora?: string; lugar?: string }>({});

  const [mostrarDialogoCancelar, setMostrarDialogoCancelar] = useState(false);
  const [entrevistaCancelarId, setEntrevistaCancelarId] = useState<string | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");

  const [cargandoEntrevistas, setCargandoEntrevistas] = useState(true);
  const [cargandoCriterios, setCargandoCriterios] = useState(true);
  const [cargandoPruebas, setCargandoPruebas] = useState(true);

  const [cargandoEntrevista, setCargandoEntrevista] = useState(false);
  const [completandoId, setCompletandoId] = useState<string | null>(null);
  const [cargandoCancelar, setCargandoCancelar] = useState(false);
  const [cargandoGuardar, setCargandoGuardar] = useState(false);
  const [mostrarConfirmarGuardar, setMostrarConfirmarGuardar] = useState(false);

  // ── Estado de pruebas ─────────────────────────────────────────────────────
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  const [mostrarFormularioPrueba, setMostrarFormularioPrueba] = useState(false);
  const [pruebaEditando, setPruebaEditando] = useState<string | null>(null);
  const [nuevaPrueba, setNuevaPrueba] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    hora: "",
    modalidad: "virtual" as "virtual" | "presencial",
    lugar: "",
  });
  const [erroresPrueba, setErroresPrueba] = useState<{
    nombre?: string;
    descripcion?: string;
    fecha?: string;
    hora?: string;
    lugar?: string;
  }>({});
  const [mostrarDialogoCancelarPrueba, setMostrarDialogoCancelarPrueba] = useState(false);
  const [pruebaCancelarId, setPruebaCancelarId] = useState<string | null>(null);
  const [motivoCancelacionPrueba, setMotivoCancelacionPrueba] = useState("");
  const [cargandoPrueba, setCargandoPrueba] = useState(false);
  const [completandoPruebaId, setCompletandoPruebaId] = useState<string | null>(null);
  const [cargandoCancelarPrueba, setCargandoCancelarPrueba] = useState(false);

  // ── Carga de datos ────────────────────────────────────────────────────────

  const cargarEntrevistas = useCallback(async () => {
    if (!aspiranteId) return;
    setCargandoEntrevistas(true);
    try {
      const data = await getEntrevistasByAspirante(aspiranteId);
      setEntrevistas(
        (data ?? []).map(e => ({
          id: String(e.id),
          fecha: e.fecha ?? "",
          hora: e.tiempo ?? "",
          modalidad: mapModalidad(e.idTipoentrevista),
          lugar: e.ubicacion ?? "",
          estado: mapEstadoEntrevista(e.estado),
          motivo: e.motivocambio ?? undefined,
        }))
      );
    } catch {
      mostrarAlerta("Hubo un error");
    } finally {
      setCargandoEntrevistas(false);
    }
  }, [aspiranteId]);

  const cargarCriterios = useCallback(async () => {
    if (!aspiranteId) return;
    setCargandoCriterios(true);
    try {
      const res = await getCriteriosByAspirante(aspiranteId);
      setCriterios(
        (res?.criterios ?? []).map(c => ({
          id: c.id,
          nombre: c.nombreCriterio,
          peso: c.peso,
          puntaje: c.puntajeObtenido,
        }))
      );
      setPuntajeTotalBackend(res?.puntajeTotal ?? 0);
    } catch {
      mostrarAlerta("Hubo un error");
    } finally {
      setCargandoCriterios(false);
    }
  }, [aspiranteId]);

  const cargarPruebas = useCallback(async () => {
    if (!aspiranteId) return;
    setCargandoPruebas(true);
    try {
      const data = await getPruebasByAspirante(aspiranteId);
      setPruebas(
        (data ?? []).map(p => ({
          id: String(p.id),
          nombre: p.nombre ?? "",
          descripcion: p.descripcion ?? "",
          fecha: p.fecha ?? "",
          hora: p.tiempo ?? "",
          modalidad: mapModalidad(p.idTipoprueba),
          lugar: p.ubicacion ?? "",
          estado: mapEstadoEntrevista(p.estado),
          motivo: p.motivocambio ?? undefined,
        }))
      );
    } catch {
      mostrarAlerta("Hubo un error");
    } finally {
      setCargandoPruebas(false);
    }
  }, [aspiranteId]);

  useEffect(() => {
    cargarEntrevistas();
    cargarCriterios();
    cargarPruebas();
  }, [cargarEntrevistas, cargarCriterios, cargarPruebas]);

  // ── Handlers entrevista ───────────────────────────────────────────────────

  const cerrarModalAgendar = () => {
    setMostrarFormulario(false);
    setEntrevistaEditando(null);
    setErroresAgendar({});
  };

  const handleAgendar = async () => {
    const errs: typeof erroresAgendar = {};
    if (!nuevaEntrevista.fecha) errs.fecha = "La fecha es obligatoria";
    if (!nuevaEntrevista.hora) errs.hora = "La hora es obligatoria";
    if (!nuevaEntrevista.lugar.trim()) errs.lugar = "Este campo es obligatorio";
    if (Object.keys(errs).length > 0) { setErroresAgendar(errs); return; }
    setErroresAgendar({});

    const idTipoentrevista = modalidadToId(nuevaEntrevista.modalidad);
    setCargandoEntrevista(true);
    try {
      if (entrevistaEditando) {
        await reagendarEntrevista(parseInt(entrevistaEditando), {
          fecha: nuevaEntrevista.fecha,
          tiempo: nuevaEntrevista.hora,
          idTipoentrevista,
          ubicacion: nuevaEntrevista.lugar,
        });
        setEntrevistaEditando(null);
      } else {
        await agendarEntrevista(aspiranteId, {
          fecha: nuevaEntrevista.fecha,
          tiempo: nuevaEntrevista.hora,
          idTipoentrevista,
          ubicacion: nuevaEntrevista.lugar,
        });
      }
      setNuevaEntrevista({ fecha: "", hora: "", modalidad: "virtual", lugar: "" });
      setMostrarFormulario(false);
      await cargarEntrevistas();
      mostrarConfirm(entrevistaEditando ? "Entrevista reagendada con éxito." : "Entrevista agendada con éxito.");
    } catch {
      mostrarAlerta("Hubo un error");
    } finally {
      setCargandoEntrevista(false);
    }
  };

  const handleReagendar = (e: Entrevista) => {
    setNuevaEntrevista({ fecha: e.fecha, hora: e.hora, modalidad: e.modalidad, lugar: e.lugar });
    setEntrevistaEditando(e.id);
    setErroresAgendar({});
    setMostrarFormulario(true);
  };

  const handleCompletarReunion = async (entrevistaId: string) => {
    setCompletandoId(entrevistaId);
    try {
      await completarEntrevista(parseInt(entrevistaId));
      await cargarEntrevistas();
      mostrarConfirm("Reunión completada con éxito.");
    } catch {
      mostrarAlerta("Hubo un error");
    } finally {
      setCompletandoId(null);
    }
  };

  const handleCancelarConfirmada = async () => {
    if (!entrevistaCancelarId || !motivoCancelacion.trim()) return;
    setCargandoCancelar(true);
    try {
      await cancelarEntrevista(parseInt(entrevistaCancelarId), motivoCancelacion.trim());
      setMotivoCancelacion("");
      setEntrevistaCancelarId(null);
      setMostrarDialogoCancelar(false);
      await cargarEntrevistas();
      mostrarConfirm("Entrevista cancelada con éxito.");
    } catch {
      mostrarAlerta("Hubo un error");
      setMostrarDialogoCancelar(false);
    } finally {
      setCargandoCancelar(false);
    }
  };

  // ── Criterios ─────────────────────────────────────────────────────────────

  const handlePuntajeChange = (id: number, valor: string) => {
    const n = Math.min(100, Math.max(0, parseFloat(valor) || 0));
    setCriterios(prev => prev.map(c => (c.id === id ? { ...c, puntaje: n } : c)));
  };

  const handleGuardarCalificacion = async () => {
    setMostrarConfirmarGuardar(false);
    setCargandoGuardar(true);
    try {
      await Promise.all(
        criterios.map(c =>
          updateCriterio({
            idAspirante: aspiranteId,
            idCriterio: c.id,
            puntajeObtenido: c.puntaje,
          })
        )
      );
      await cargarCriterios();
      mostrarConfirm("Calificación guardada con éxito.");
    } catch {
      mostrarAlerta("Hubo un error");
    } finally {
      setCargandoGuardar(false);
    }
  };

  // ── Handlers prueba ───────────────────────────────────────────────────────

  const cerrarModalPrueba = () => {
    setMostrarFormularioPrueba(false);
    setPruebaEditando(null);
    setErroresPrueba({});
  };

  const handleCrearPrueba = async () => {
    const errs: typeof erroresPrueba = {};
    if (!nuevaPrueba.nombre.trim()) errs.nombre = "El nombre es obligatorio";
    if (!nuevaPrueba.descripcion.trim()) errs.descripcion = "La descripción es obligatoria";
    if (!nuevaPrueba.fecha) errs.fecha = "La fecha es obligatoria";
    if (!nuevaPrueba.hora) errs.hora = "La hora es obligatoria";
    if (!nuevaPrueba.lugar.trim()) errs.lugar = "Este campo es obligatorio";
    if (Object.keys(errs).length > 0) { setErroresPrueba(errs); return; }
    setErroresPrueba({});

    const idTipoprueba = modalidadToId(nuevaPrueba.modalidad);
    setCargandoPrueba(true);
    try {
      if (pruebaEditando) {
        await reagendarPrueba(parseInt(pruebaEditando), {
          fecha: nuevaPrueba.fecha,
          tiempo: nuevaPrueba.hora,
          idTipoprueba,
          ubicacion: nuevaPrueba.lugar,
        });
        setPruebaEditando(null);
      } else {
        await crearPrueba(aspiranteId, {
          nombre: nuevaPrueba.nombre.trim(),
          descripcion: nuevaPrueba.descripcion.trim(),
          fecha: nuevaPrueba.fecha,
          tiempo: nuevaPrueba.hora,
          idTipoprueba,
          ubicacion: nuevaPrueba.lugar,
        });
      }
      setNuevaPrueba({ nombre: "", descripcion: "", fecha: "", hora: "", modalidad: "virtual", lugar: "" });
      setMostrarFormularioPrueba(false);
      await cargarPruebas();
      mostrarConfirm(pruebaEditando ? "Prueba reagendada con éxito." : "Prueba creada con éxito.");
    } catch {
      mostrarAlerta("Hubo un error");
    } finally {
      setCargandoPrueba(false);
    }
  };

  const handleReagendarPrueba = (p: Prueba) => {
    setNuevaPrueba({ nombre: p.nombre, descripcion: p.descripcion, fecha: p.fecha, hora: p.hora, modalidad: p.modalidad, lugar: p.lugar });
    setPruebaEditando(p.id);
    setErroresPrueba({});
    setMostrarFormularioPrueba(true);
  };

  const handleCompletarPrueba = async (pruebaId: string) => {
    setCompletandoPruebaId(pruebaId);
    try {
      await completarPrueba(parseInt(pruebaId));
      await cargarPruebas();
      mostrarConfirm("Prueba completada con éxito.");
    } catch {
      mostrarAlerta("Hubo un error");
    } finally {
      setCompletandoPruebaId(null);
    }
  };

  const handleCancelarPruebaConfirmada = async () => {
    if (!pruebaCancelarId || !motivoCancelacionPrueba.trim()) return;
    setCargandoCancelarPrueba(true);
    try {
      await cancelarPrueba(parseInt(pruebaCancelarId), motivoCancelacionPrueba.trim());
      setMotivoCancelacionPrueba("");
      setPruebaCancelarId(null);
      setMostrarDialogoCancelarPrueba(false);
      await cargarPruebas();
      mostrarConfirm("Prueba cancelada con éxito.");
    } catch {
      mostrarAlerta("Hubo un error");
      setMostrarDialogoCancelarPrueba(false);
    } finally {
      setCargandoCancelarPrueba(false);
    }
  };

  // ── Grupos de entrevistas ─────────────────────────────────────────────────

  const confirmadas = entrevistas.filter(e => e.estado === "confirmada");
  const activas     = entrevistas.filter(e => e.estado === "pendiente" || e.estado === "solicitud de cambio");
  const historial   = entrevistas.filter(e => e.estado === "completada" || e.estado === "cancelada");

  const confirmadasPruebas = pruebas.filter(p => p.estado === "confirmada");
  const activasPruebas     = pruebas.filter(p => p.estado === "pendiente" || p.estado === "solicitud de cambio");
  const historialPruebas   = pruebas.filter(p => p.estado === "completada" || p.estado === "cancelada");

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="max-w-5xl mx-auto">

        {/* Volver */}
        <button
          onClick={() => navigate("/programa/admision/calificacion")}
          className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors font-medium animate-fade-in"
        >
          <ArrowLeftIcon />
          <span>Volver a Calificación</span>
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6 animate-fade-in delay-100">
          Calificar aspirante
        </h1>

        {/* Información del aspirante */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 animate-fade-in-up delay-200">
          <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            Información del aspirante
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-neutral-400 mb-1">Nombre completo</div>
              <div className="text-sm font-semibold text-gray-900">{aspiranteNombre}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Documento</div>
              <div className="text-sm text-gray-900">{aspiranteDocumento ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Correo</div>
              <div className="text-sm text-gray-900">{aspiranteCorreo}</div>
            </div>
          </div>
        </div>

        {/* Sección entrevistas */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Entrevistas
            </h2>
            <button
              onClick={() => {
                setEntrevistaEditando(null);
                setNuevaEntrevista({ fecha: "", hora: "", modalidad: "virtual", lugar: "" });
                setErroresAgendar({});
                setMostrarFormulario(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium"
            >
              <PlusIcon />
              Agendar entrevista
            </button>
          </div>

          {/* Confirmadas */}
          {confirmadas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-600 mb-3">Entrevistas confirmadas</h3>
              <div className="space-y-3">
                {confirmadas.map(e => (
                  <div key={e.id} className="border border-green-200 bg-green-100/30 rounded-lg p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <EntrevistaBadge estado={e.estado} />
                      <ModalidadBadge modalidad={e.modalidad} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarIcon /><span>{formatFecha(e.fecha)}</span>
                        <ClockIcon /><span>{formatHora(e.hora)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPinIcon />
                        <span>{e.modalidad === "virtual" ? "Enlace: " : "Lugar: "}{e.lugar}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200 flex gap-2">
                      <button
                        onClick={() => handleCompletarReunion(e.id)}
                        disabled={completandoId === e.id}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {completandoId === e.id ? <><Spinner />Completando...</> : "Completar reunión"}
                      </button>
                      <button
                        onClick={() => { setEntrevistaCancelarId(e.id); setMostrarDialogoCancelar(true); }}
                        disabled={completandoId === e.id}
                        className="flex-1 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 text-xs rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pendientes / solicitud de cambio */}
          {activas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-600 mb-3">Otras entrevistas</h3>
              <div className="space-y-3">
                {activas.map(e => (
                  <div key={e.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <EntrevistaBadge estado={e.estado} />
                      <ModalidadBadge modalidad={e.modalidad} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarIcon /><span>{formatFecha(e.fecha)}</span>
                        <ClockIcon /><span>{formatHora(e.hora)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPinIcon />
                        <span>{e.modalidad === "virtual" ? "Enlace: " : "Lugar: "}{e.lugar}</span>
                      </div>
                      {e.estado === "solicitud de cambio" && e.motivo && (
                        <>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs font-semibold text-neutral-400 mb-1">Motivo de solicitud:</div>
                            <div className="text-sm text-gray-700 italic">"{e.motivo}"</div>
                          </div>
                          <div className="mt-2">
                            <button
                              onClick={() => handleReagendar(e)}
                              className="px-3 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800 transition-colors font-medium"
                            >
                              Reagendar entrevista
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial */}
          {historial.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-3">Historial</h3>
              <div className="space-y-3">
                {historial.map(e => (
                  <div key={e.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <EntrevistaBadge estado={e.estado} />
                      <ModalidadBadge modalidad={e.modalidad} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarIcon /><span>{formatFecha(e.fecha)}</span>
                        <ClockIcon /><span>{formatHora(e.hora)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPinIcon />
                        <span>{e.modalidad === "virtual" ? "Enlace: " : "Lugar: "}{e.lugar}</span>
                      </div>
                      {e.estado === "cancelada" && e.motivo && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs font-semibold text-neutral-400 mb-1">Motivo de cancelación:</div>
                          <div className="text-sm text-gray-700 italic">"{e.motivo}"</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cargandoEntrevistas ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-400">
              <Spinner />
              Cargando entrevistas...
            </div>
          ) : entrevistas.length === 0 && (
            <p className="text-center py-8 text-sm text-neutral-400">No hay entrevistas agendadas.</p>
          )}
        </div>

        {/* Sección pruebas */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 animate-fade-in-up delay-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Pruebas
            </h2>
            <button
              onClick={() => {
                setPruebaEditando(null);
                setNuevaPrueba({ nombre: "", descripcion: "", fecha: "", hora: "", modalidad: "virtual", lugar: "" });
                setErroresPrueba({});
                setMostrarFormularioPrueba(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium"
            >
              <PlusIcon />
              Crear prueba
            </button>
          </div>

          {/* Confirmadas */}
          {confirmadasPruebas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-600 mb-3">Pruebas confirmadas</h3>
              <div className="space-y-3">
                {confirmadasPruebas.map(p => (
                  <div key={p.id} className="border border-green-200 bg-green-100/30 rounded-lg p-4">
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-gray-900">{p.nombre}</div>
                      {p.descripcion && <div className="text-xs text-gray-500 mt-0.5">{p.descripcion}</div>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <EntrevistaBadge estado={p.estado} />
                      <ModalidadBadge modalidad={p.modalidad} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarIcon /><span>{formatFecha(p.fecha)}</span>
                        <ClockIcon /><span>{formatHora(p.hora)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPinIcon />
                        <span>{p.modalidad === "virtual" ? "Enlace: " : "Lugar: "}{p.lugar}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200 flex gap-2">
                      <button
                        onClick={() => handleCompletarPrueba(p.id)}
                        disabled={completandoPruebaId === p.id}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {completandoPruebaId === p.id ? <><Spinner />Completando...</> : "Completar prueba"}
                      </button>
                      <button
                        onClick={() => { setPruebaCancelarId(p.id); setMostrarDialogoCancelarPrueba(true); }}
                        disabled={completandoPruebaId === p.id}
                        className="flex-1 px-3 py-1.5 bg-white text-gray-700 border border-gray-200 text-xs rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pendientes / solicitud de cambio */}
          {activasPruebas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-600 mb-3">Otras pruebas</h3>
              <div className="space-y-3">
                {activasPruebas.map(p => (
                  <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-gray-900">{p.nombre}</div>
                      {p.descripcion && <div className="text-xs text-gray-500 mt-0.5">{p.descripcion}</div>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <EntrevistaBadge estado={p.estado} />
                      <ModalidadBadge modalidad={p.modalidad} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarIcon /><span>{formatFecha(p.fecha)}</span>
                        <ClockIcon /><span>{formatHora(p.hora)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPinIcon />
                        <span>{p.modalidad === "virtual" ? "Enlace: " : "Lugar: "}{p.lugar}</span>
                      </div>
                      {p.estado === "solicitud de cambio" && p.motivo && (
                        <>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-xs font-semibold text-neutral-400 mb-1">Motivo de solicitud:</div>
                            <div className="text-sm text-gray-700 italic">"{p.motivo}"</div>
                          </div>
                          <div className="mt-2">
                            <button
                              onClick={() => handleReagendarPrueba(p)}
                              className="px-3 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800 transition-colors font-medium"
                            >
                              Reagendar prueba
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial */}
          {historialPruebas.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-600 mb-3">Historial</h3>
              <div className="space-y-3">
                {historialPruebas.map(p => (
                  <div key={p.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-gray-900">{p.nombre}</div>
                      {p.descripcion && <div className="text-xs text-gray-500 mt-0.5">{p.descripcion}</div>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <EntrevistaBadge estado={p.estado} />
                      <ModalidadBadge modalidad={p.modalidad} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CalendarIcon /><span>{formatFecha(p.fecha)}</span>
                        <ClockIcon /><span>{formatHora(p.hora)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPinIcon />
                        <span>{p.modalidad === "virtual" ? "Enlace: " : "Lugar: "}{p.lugar}</span>
                      </div>
                      {p.estado === "cancelada" && p.motivo && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs font-semibold text-neutral-400 mb-1">Motivo de cancelación:</div>
                          <div className="text-sm text-gray-700 italic">"{p.motivo}"</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cargandoPruebas ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-neutral-400">
              <Spinner />
              Cargando pruebas...
            </div>
          ) : pruebas.length === 0 && (
            <p className="text-center py-8 text-sm text-neutral-400">No hay pruebas registradas.</p>
          )}
        </div>

        {/* Tabla criterios */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-fade-in-up delay-400">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Criterios de evaluación
            </h2>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Criterio</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Peso</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Puntaje obtenido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cargandoCriterios ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                      <Spinner />
                      Cargando criterios...
                    </div>
                  </td>
                </tr>
              ) : criterios.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-neutral-400">
                    No hay criterios de evaluación registrados.
                  </td>
                </tr>
              ) : (
                criterios.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{c.nombre}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{c.peso}%</td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={c.puntaje || ""}
                        onChange={e => handlePuntajeChange(c.id, e.target.value)}
                        placeholder="0"
                        disabled={cargandoGuardar}
                        className="w-24 text-sm text-center text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {criterios.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">Total</td>
                  <td />
                  <td className="px-6 py-4 text-center">
                    <span className="text-lg font-bold text-red-700">{puntajeTotalBackend.toFixed(1)}</span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
          </div>
          <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-4">
            <button
              onClick={() => setMostrarConfirmarGuardar(true)}
              disabled={cargandoGuardar || criterios.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargandoGuardar ? <><Spinner />Guardando...</> : "Guardar calificación"}
            </button>
          </div>
        </div>

      </div>

      {/* Modal: Agendar / Reagendar entrevista */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-overlay-in">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-4 animate-modal-in">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {entrevistaEditando ? "Reagendar entrevista" : "Agendar entrevista"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Fecha</label>
                  <input
                    type="date"
                    value={nuevaEntrevista.fecha}
                    onChange={e => {
                      setNuevaEntrevista(p => ({ ...p, fecha: e.target.value }));
                      setErroresAgendar(p => ({ ...p, fecha: undefined }));
                    }}
                    disabled={cargandoEntrevista}
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${erroresAgendar.fecha ? "border-red-400" : "border-gray-200"}`}
                  />
                  {erroresAgendar.fecha && (
                    <p className="text-xs text-red-500 mt-1">{erroresAgendar.fecha}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Hora</label>
                  <input
                    type="time"
                    value={nuevaEntrevista.hora}
                    onChange={e => {
                      setNuevaEntrevista(p => ({ ...p, hora: e.target.value }));
                      setErroresAgendar(p => ({ ...p, hora: undefined }));
                    }}
                    disabled={cargandoEntrevista}
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${erroresAgendar.hora ? "border-red-400" : "border-gray-200"}`}
                  />
                  {erroresAgendar.hora && (
                    <p className="text-xs text-red-500 mt-1">{erroresAgendar.hora}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Modalidad</label>
                <div className="flex gap-4">
                  {(["virtual", "presencial"] as const).map(m => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="modalidad"
                        value={m}
                        checked={nuevaEntrevista.modalidad === m}
                        onChange={() => setNuevaEntrevista(p => ({ ...p, modalidad: m, lugar: "" }))}
                        disabled={cargandoEntrevista}
                        className="accent-red-700 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-700 capitalize">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  {nuevaEntrevista.modalidad === "virtual" ? "Enlace virtual" : "Lugar"}
                </label>
                <input
                  type="text"
                  value={nuevaEntrevista.lugar}
                  onChange={e => {
                    setNuevaEntrevista(p => ({ ...p, lugar: e.target.value }));
                    setErroresAgendar(p => ({ ...p, lugar: undefined }));
                  }}
                  placeholder={nuevaEntrevista.modalidad === "virtual" ? "meet.google.com/xxx" : "Edificio, Sala..."}
                  disabled={cargandoEntrevista}
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${erroresAgendar.lugar ? "border-red-400" : "border-gray-200"}`}
                />
                {erroresAgendar.lugar && (
                  <p className="text-xs text-red-500 mt-1">{erroresAgendar.lugar}</p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={cerrarModalAgendar}
                disabled={cargandoEntrevista}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgendar}
                disabled={cargandoEntrevista}
                className="flex items-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargandoEntrevista
                  ? <><Spinner />{entrevistaEditando ? "Reagendando..." : "Agendando..."}</>
                  : (entrevistaEditando ? "Reagendar" : "Agendar")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar guardar calificación */}
      {mostrarConfirmarGuardar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-overlay-in">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full mx-4 animate-modal-in">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Confirmar calificación</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700">
                ¿Está seguro de guardar las calificaciones para este aspirante? Esta acción actualizará el puntaje registrado.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setMostrarConfirmarGuardar(false)}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarCalificacion}
                className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
              >
                Sí, guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cancelar entrevista */}
      {mostrarDialogoCancelar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-overlay-in">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-4 animate-modal-in">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Cancelar entrevista</h3>
            </div>
            <div className="p-6">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Motivo de cancelación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivoCancelacion}
                onChange={e => setMotivoCancelacion(e.target.value)}
                placeholder="Ingrese el motivo por el cual se cancela la entrevista..."
                rows={4}
                disabled={cargandoCancelar}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {!motivoCancelacion.trim() && (
                <p className="text-xs text-neutral-400 mt-1">El motivo es obligatorio para cancelar.</p>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => { setMostrarDialogoCancelar(false); setMotivoCancelacion(""); setEntrevistaCancelarId(null); }}
                disabled={cargandoCancelar}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium disabled:opacity-60"
              >
                Volver
              </button>
              <button
                onClick={handleCancelarConfirmada}
                disabled={!motivoCancelacion.trim() || cargandoCancelar}
                className="flex items-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargandoCancelar ? <><Spinner />Cancelando...</> : "Cancelar entrevista"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear / Reagendar prueba */}
      {mostrarFormularioPrueba && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-overlay-in">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-4 animate-modal-in">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {pruebaEditando ? "Reagendar prueba" : "Crear prueba"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {!pruebaEditando && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-2 block">Nombre</label>
                    <input
                      type="text"
                      value={nuevaPrueba.nombre}
                      onChange={e => {
                        setNuevaPrueba(p => ({ ...p, nombre: e.target.value }));
                        setErroresPrueba(p => ({ ...p, nombre: undefined }));
                      }}
                      placeholder="Nombre de la prueba"
                      disabled={cargandoPrueba}
                      className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${erroresPrueba.nombre ? "border-red-400" : "border-gray-200"}`}
                    />
                    {erroresPrueba.nombre && (
                      <p className="text-xs text-red-500 mt-1">{erroresPrueba.nombre}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-2 block">Descripción</label>
                    <textarea
                      value={nuevaPrueba.descripcion}
                      onChange={e => {
                        setNuevaPrueba(p => ({ ...p, descripcion: e.target.value }));
                        setErroresPrueba(p => ({ ...p, descripcion: undefined }));
                      }}
                      placeholder="Descripción de la prueba"
                      rows={3}
                      disabled={cargandoPrueba}
                      className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed ${erroresPrueba.descripcion ? "border-red-400" : "border-gray-200"}`}
                    />
                    {erroresPrueba.descripcion && (
                      <p className="text-xs text-red-500 mt-1">{erroresPrueba.descripcion}</p>
                    )}
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Fecha</label>
                  <input
                    type="date"
                    value={nuevaPrueba.fecha}
                    onChange={e => {
                      setNuevaPrueba(p => ({ ...p, fecha: e.target.value }));
                      setErroresPrueba(p => ({ ...p, fecha: undefined }));
                    }}
                    disabled={cargandoPrueba}
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${erroresPrueba.fecha ? "border-red-400" : "border-gray-200"}`}
                  />
                  {erroresPrueba.fecha && (
                    <p className="text-xs text-red-500 mt-1">{erroresPrueba.fecha}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-2 block">Hora</label>
                  <input
                    type="time"
                    value={nuevaPrueba.hora}
                    onChange={e => {
                      setNuevaPrueba(p => ({ ...p, hora: e.target.value }));
                      setErroresPrueba(p => ({ ...p, hora: undefined }));
                    }}
                    disabled={cargandoPrueba}
                    className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${erroresPrueba.hora ? "border-red-400" : "border-gray-200"}`}
                  />
                  {erroresPrueba.hora && (
                    <p className="text-xs text-red-500 mt-1">{erroresPrueba.hora}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Modalidad</label>
                <div className="flex gap-4">
                  {(["virtual", "presencial"] as const).map(m => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="modalidadPrueba"
                        value={m}
                        checked={nuevaPrueba.modalidad === m}
                        onChange={() => setNuevaPrueba(p => ({ ...p, modalidad: m, lugar: "" }))}
                        disabled={cargandoPrueba}
                        className="accent-red-700 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-gray-700 capitalize">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  {nuevaPrueba.modalidad === "virtual" ? "Enlace virtual" : "Lugar"}
                </label>
                <input
                  type="text"
                  value={nuevaPrueba.lugar}
                  onChange={e => {
                    setNuevaPrueba(p => ({ ...p, lugar: e.target.value }));
                    setErroresPrueba(p => ({ ...p, lugar: undefined }));
                  }}
                  placeholder={nuevaPrueba.modalidad === "virtual" ? "meet.google.com/xxx" : "Edificio, Sala..."}
                  disabled={cargandoPrueba}
                  className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${erroresPrueba.lugar ? "border-red-400" : "border-gray-200"}`}
                />
                {erroresPrueba.lugar && (
                  <p className="text-xs text-red-500 mt-1">{erroresPrueba.lugar}</p>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={cerrarModalPrueba}
                disabled={cargandoPrueba}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearPrueba}
                disabled={cargandoPrueba}
                className="flex items-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargandoPrueba
                  ? <><Spinner />{pruebaEditando ? "Reagendando..." : "Creando..."}</>
                  : (pruebaEditando ? "Reagendar" : "Crear")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cancelar prueba */}
      {mostrarDialogoCancelarPrueba && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-overlay-in">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-4 animate-modal-in">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Cancelar prueba</h3>
            </div>
            <div className="p-6">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Motivo de cancelación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivoCancelacionPrueba}
                onChange={e => setMotivoCancelacionPrueba(e.target.value)}
                placeholder="Ingrese el motivo por el cual se cancela la prueba..."
                rows={4}
                disabled={cargandoCancelarPrueba}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {!motivoCancelacionPrueba.trim() && (
                <p className="text-xs text-neutral-400 mt-1">El motivo es obligatorio para cancelar.</p>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => { setMostrarDialogoCancelarPrueba(false); setMotivoCancelacionPrueba(""); setPruebaCancelarId(null); }}
                disabled={cargandoCancelarPrueba}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium disabled:opacity-60"
              >
                Volver
              </button>
              <button
                onClick={handleCancelarPruebaConfirmada}
                disabled={!motivoCancelacionPrueba.trim() || cargandoCancelarPrueba}
                className="flex items-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargandoCancelarPrueba ? <><Spinner />Cancelando...</> : "Cancelar prueba"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
