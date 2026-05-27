import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams, useOutletContext } from "react-router";
import {
  getEntrevistasByAspirante,
  agendarEntrevista,
  reagendarEntrevista,
  editarEntrevista,
  completarEntrevista,
  cancelarEntrevista,
  getCriteriosByAspirante,
  updateCriterio,
  getPruebasByAspirante,
  crearPrueba,
  reagendarPrueba,
  editarPrueba,
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

function RefreshIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
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

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-300 ease-in-out ${open ? "rotate-180" : "rotate-0"}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Criterio {
  id: number;
  nombre: string;
  peso: number;
  puntaje: number | null;
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
    confirmada:            "bg-blue-100 text-blue-700 border border-blue-200",
    "solicitud de cambio": "bg-amber-100 text-amber-600 border border-amber-200",
    pendiente:             "bg-yellow-100 text-yellow-600 border border-yellow-200",
    cancelada:             "bg-red-100 text-red-700 border border-red-200",
    completada:            "bg-green-100 text-green-700 border border-green-200",
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

  const state = location.state as { nombre?: string; correo?: string; documento?: number; cohorteId?: number; nombreCohorte?: string } | null;
  const aspiranteNombre = state?.nombre ?? "Aspirante";
  const aspiranteCorreo = state?.correo ?? "aspirante@email.com";
  const aspiranteDocumento = state?.documento ?? null;
  const cohorteId = state?.cohorteId ?? null;
  const nombreCohorte = state?.nombreCohorte ?? null;

  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [puntajeTotalBackend, setPuntajeTotalBackend] = useState(0);
  const [entrevistas, setEntrevistas] = useState<Entrevista[]>([]);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [entrevistaEditando, setEntrevistaEditando] = useState<string | null>(null);
  const [modoEdicionEntrevista, setModoEdicionEntrevista] = useState<"reagendar" | "editar">("reagendar");
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
  const [modoEdicionPrueba, setModoEdicionPrueba] = useState<"reagendar" | "editar">("reagendar");
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

  const [cerrandoFormulario, setCerrandoFormulario] = useState(false);
  const [cerrandoDialogoCancelar, setCerrandoDialogoCancelar] = useState(false);
  const [cerrandoConfirmarGuardar, setCerrandoConfirmarGuardar] = useState(false);
  const [cerrandoFormularioPrueba, setCerrandoFormularioPrueba] = useState(false);
  const [cerrandoDialogoCancelarPrueba, setCerrandoDialogoCancelarPrueba] = useState(false);

  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [historialPruebasAbierto, setHistorialPruebasAbierto] = useState(false);

  const [mostrarConfirmarCompletar, setMostrarConfirmarCompletar] = useState(false);
  const [entrevistaCompletarId, setEntrevistaCompletarId] = useState<string | null>(null);
  const [cerrandoConfirmarCompletar, setCerrandoConfirmarCompletar] = useState(false);

  const [mostrarConfirmarCompletarPrueba, setMostrarConfirmarCompletarPrueba] = useState(false);
  const [pruebaCompletarId, setPruebaCompletarId] = useState<string | null>(null);
  const [cerrandoConfirmarCompletarPrueba, setCerrandoConfirmarCompletarPrueba] = useState(false);

  // ── Carga de datos ────────────────────────────────────────────────────────

  const cargarEntrevistas = useCallback(async () => {
    if (!aspiranteId) return;
    setCargandoEntrevistas(true);
    setEntrevistas([]);
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
    setCriterios([]);
    setPuntajeTotalBackend(0);
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
    setPruebas([]);
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
    setCerrandoFormulario(true);
    setTimeout(() => {
      setMostrarFormulario(false);
      setCerrandoFormulario(false);
      setEntrevistaEditando(null);
      setModoEdicionEntrevista("reagendar");
      setErroresAgendar({});
      setNuevaEntrevista({ fecha: "", hora: "", modalidad: "virtual", lugar: "" });
    }, 170);
  };

  const cerrarDialogoCancelar = () => {
    setCerrandoDialogoCancelar(true);
    setTimeout(() => {
      setMostrarDialogoCancelar(false);
      setCerrandoDialogoCancelar(false);
      setMotivoCancelacion("");
      setEntrevistaCancelarId(null);
    }, 170);
  };

  const cerrarConfirmarGuardar = () => {
    setCerrandoConfirmarGuardar(true);
    setTimeout(() => {
      setMostrarConfirmarGuardar(false);
      setCerrandoConfirmarGuardar(false);
    }, 170);
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
        const payload = {
          fecha: nuevaEntrevista.fecha,
          tiempo: nuevaEntrevista.hora,
          idTipoentrevista,
          ubicacion: nuevaEntrevista.lugar,
        };
        if (modoEdicionEntrevista === "editar") {
          await editarEntrevista(parseInt(entrevistaEditando), payload);
        } else {
          await reagendarEntrevista(parseInt(entrevistaEditando), payload);
        }
        setEntrevistaEditando(null);
      } else {
        await agendarEntrevista(aspiranteId, {
          fecha: nuevaEntrevista.fecha,
          tiempo: nuevaEntrevista.hora,
          idTipoentrevista,
          ubicacion: nuevaEntrevista.lugar,
        });
      }
      const mensajeExito = entrevistaEditando
        ? (modoEdicionEntrevista === "editar" ? "Entrevista editada con éxito." : "Entrevista reagendada con éxito.")
        : "Entrevista agendada con éxito.";
      cerrarModalAgendar();
      await cargarEntrevistas();
      mostrarConfirm(mensajeExito);
    } catch {
      mostrarAlerta("Hubo un error");
    } finally {
      setCargandoEntrevista(false);
    }
  };

  const handleReagendar = (e: Entrevista) => {
    setNuevaEntrevista({ fecha: e.fecha, hora: e.hora, modalidad: e.modalidad, lugar: e.lugar });
    setEntrevistaEditando(e.id);
    setModoEdicionEntrevista("reagendar");
    setErroresAgendar({});
    setMostrarFormulario(true);
  };

  const handleEditarEntrevista = (e: Entrevista) => {
    setNuevaEntrevista({ fecha: e.fecha, hora: e.hora, modalidad: e.modalidad, lugar: e.lugar });
    setEntrevistaEditando(e.id);
    setModoEdicionEntrevista("editar");
    setErroresAgendar({});
    setMostrarFormulario(true);
  };

  const cerrarConfirmarCompletar = () => {
    setCerrandoConfirmarCompletar(true);
    setTimeout(() => {
      setMostrarConfirmarCompletar(false);
      setCerrandoConfirmarCompletar(false);
      setEntrevistaCompletarId(null);
    }, 170);
  };

  const handleCompletarReunion = (entrevistaId: string) => {
    setEntrevistaCompletarId(entrevistaId);
    setMostrarConfirmarCompletar(true);
  };

  const handleCompletarReunionConfirmado = async () => {
    if (!entrevistaCompletarId) return;
    const id = entrevistaCompletarId;
    cerrarConfirmarCompletar();
    setCompletandoId(id);
    try {
      await completarEntrevista(parseInt(id));
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
      await cancelarEntrevista(parseInt(entrevistaCancelarId), `El director de programa canceló la entrevista por el motivo: ${motivoCancelacion.trim()}`);
      cerrarDialogoCancelar();
      await cargarEntrevistas();
      mostrarConfirm("Entrevista cancelada con éxito.");
    } catch {
      mostrarAlerta("Hubo un error");
      cerrarDialogoCancelar();
    } finally {
      setCargandoCancelar(false);
    }
  };

  // ── Criterios ─────────────────────────────────────────────────────────────

  const handlePuntajeChange = (id: number, valor: string) => {
    const max = criterios.find(c => c.id === id)?.peso ?? 100;
    const n: number | null = valor === "" ? null : Math.min(max, Math.max(0, parseFloat(valor) || 0));
    setCriterios(prev => prev.map(c => (c.id === id ? { ...c, puntaje: n } : c)));
  };

  const handleGuardarCalificacion = async () => {
    cerrarConfirmarGuardar();
    setCargandoGuardar(true);
    try {
      const conValor = criterios.filter(c => c.puntaje !== null);
      await Promise.all(
        conValor.map(c =>
          updateCriterio({
            idAspirante: aspiranteId,
            idCriterio: c.id,
            puntajeObtenido: c.puntaje as number,
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
    setCerrandoFormularioPrueba(true);
    setTimeout(() => {
      setMostrarFormularioPrueba(false);
      setCerrandoFormularioPrueba(false);
      setPruebaEditando(null);
      setModoEdicionPrueba("reagendar");
      setErroresPrueba({});
      setNuevaPrueba({ nombre: "", descripcion: "", fecha: "", hora: "", modalidad: "virtual", lugar: "" });
    }, 170);
  };

  const cerrarDialogoCancelarPrueba = () => {
    setCerrandoDialogoCancelarPrueba(true);
    setTimeout(() => {
      setMostrarDialogoCancelarPrueba(false);
      setCerrandoDialogoCancelarPrueba(false);
      setMotivoCancelacionPrueba("");
      setPruebaCancelarId(null);
    }, 170);
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
        if (modoEdicionPrueba === "editar") {
          await editarPrueba(parseInt(pruebaEditando), {
            nombre: nuevaPrueba.nombre.trim(),
            descripcion: nuevaPrueba.descripcion.trim(),
            fecha: nuevaPrueba.fecha,
            tiempo: nuevaPrueba.hora,
            idTipoprueba,
            ubicacion: nuevaPrueba.lugar,
          });
        } else {
          await reagendarPrueba(parseInt(pruebaEditando), {
            fecha: nuevaPrueba.fecha,
            tiempo: nuevaPrueba.hora,
            idTipoprueba,
            ubicacion: nuevaPrueba.lugar,
          });
        }
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
      const mensajeExitoPrueba = pruebaEditando
        ? (modoEdicionPrueba === "editar" ? "Prueba editada con éxito." : "Prueba reagendada con éxito.")
        : "Prueba creada con éxito.";
      cerrarModalPrueba();
      await cargarPruebas();
      mostrarConfirm(mensajeExitoPrueba);
    } catch {
      mostrarAlerta("Hubo un error");
    } finally {
      setCargandoPrueba(false);
    }
  };

  const handleReagendarPrueba = (p: Prueba) => {
    setNuevaPrueba({ nombre: p.nombre, descripcion: p.descripcion, fecha: p.fecha, hora: p.hora, modalidad: p.modalidad, lugar: p.lugar });
    setPruebaEditando(p.id);
    setModoEdicionPrueba("reagendar");
    setErroresPrueba({});
    setMostrarFormularioPrueba(true);
  };

  const handleEditarPrueba = (p: Prueba) => {
    setNuevaPrueba({ nombre: p.nombre, descripcion: p.descripcion, fecha: p.fecha, hora: p.hora, modalidad: p.modalidad, lugar: p.lugar });
    setPruebaEditando(p.id);
    setModoEdicionPrueba("editar");
    setErroresPrueba({});
    setMostrarFormularioPrueba(true);
  };

  const cerrarConfirmarCompletarPrueba = () => {
    setCerrandoConfirmarCompletarPrueba(true);
    setTimeout(() => {
      setMostrarConfirmarCompletarPrueba(false);
      setCerrandoConfirmarCompletarPrueba(false);
      setPruebaCompletarId(null);
    }, 170);
  };

  const handleCompletarPrueba = (pruebaId: string) => {
    setPruebaCompletarId(pruebaId);
    setMostrarConfirmarCompletarPrueba(true);
  };

  const handleCompletarPruebaConfirmado = async () => {
    if (!pruebaCompletarId) return;
    const id = pruebaCompletarId;
    cerrarConfirmarCompletarPrueba();
    setCompletandoPruebaId(id);
    try {
      await completarPrueba(parseInt(id));
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
      await cancelarPrueba(parseInt(pruebaCancelarId), `El director de programa canceló la prueba por el motivo: ${motivoCancelacionPrueba.trim()}`);
      cerrarDialogoCancelarPrueba();
      await cargarPruebas();
      mostrarConfirm("Prueba cancelada con éxito.");
    } catch {
      mostrarAlerta("Hubo un error");
      cerrarDialogoCancelarPrueba();
    } finally {
      setCargandoCancelarPrueba(false);
    }
  };

  // ── Grupos de entrevistas ─────────────────────────────────────────────────

  const confirmadas = entrevistas.filter(e => e.estado === "confirmada");
  const activas     = [
    ...entrevistas.filter(e => e.estado === "solicitud de cambio"),
    ...entrevistas.filter(e => e.estado === "pendiente"),
  ];
  const historial   = [
    ...entrevistas.filter(e => e.estado === "completada"),
    ...entrevistas.filter(e => e.estado === "cancelada"),
  ];

  const confirmadasPruebas = pruebas.filter(p => p.estado === "confirmada");
  const activasPruebas     = [
    ...pruebas.filter(p => p.estado === "solicitud de cambio"),
    ...pruebas.filter(p => p.estado === "pendiente"),
  ];
  const historialPruebas   = [
    ...pruebas.filter(p => p.estado === "completada"),
    ...pruebas.filter(p => p.estado === "cancelada"),
  ];

  // ── UI ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-100 min-h-full">
      <div className="max-w-5xl mx-auto">

        {/* Volver */}
        <button
          onClick={() => navigate(
            cohorteId
              ? `/programa/admision/calificacion/cohorte/${cohorteId}`
              : "/programa/admision/calificacion",
            cohorteId && nombreCohorte ? { state: { nombreCohorte } } : undefined
          )}
          className="flex items-center gap-2 text-red-700 hover:text-red-800 mb-6 transition-colors animate-fade-in group"
        >
          <ArrowLeftIcon />
          <div className="flex flex-col items-start">
            <span className="font-medium text-sm leading-tight">Volver</span>
            {nombreCohorte && (
              <span className="text-xs text-neutral-400 group-hover:text-red-700/70 transition-colors leading-tight">
                Cohorte: {nombreCohorte}
              </span>
            )}
          </div>
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
            <div className="flex items-center gap-2">
              <button
                onClick={cargarEntrevistas}
                disabled={cargandoEntrevistas}
                title="Recargar entrevistas"
                className="p-2 text-neutral-400 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargandoEntrevistas ? <Spinner /> : <RefreshIcon />}
              </button>
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
          </div>

          {/* Confirmadas */}
          {confirmadas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-600 mb-3">Entrevistas confirmadas</h3>
              <div className="space-y-3">
                {confirmadas.map(e => (
                  <div key={e.id} className="border border-blue-200 bg-blue-50/30 rounded-lg p-4">
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
                    <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2">
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
                      {e.estado === "pendiente" && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleEditarEntrevista(e)}
                            className="px-3 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800 transition-colors font-medium"
                          >
                            Editar entrevista
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial */}
          {historial.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setHistorialAbierto(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors group focus:outline-none"
              >
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                  Historial
                  <span className="ml-2 text-neutral-400 font-normal">({historial.length})</span>
                </span>
                <ChevronDownIcon open={historialAbierto} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  historialAbierto ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-4 space-y-3">
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
            <div className="flex items-center gap-2">
              <button
                onClick={cargarPruebas}
                disabled={cargandoPruebas}
                title="Recargar pruebas"
                className="p-2 text-neutral-400 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargandoPruebas ? <Spinner /> : <RefreshIcon />}
              </button>
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
          </div>

          {/* Confirmadas */}
          {confirmadasPruebas.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-600 mb-3">Pruebas confirmadas</h3>
              <div className="space-y-3">
                {confirmadasPruebas.map(p => (
                  <div key={p.id} className="border border-blue-200 bg-blue-50/30 rounded-lg p-4">
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
                    <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2">
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
                      {p.estado === "pendiente" && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleEditarPrueba(p)}
                            className="px-3 py-1.5 bg-red-700 text-white text-xs rounded-lg hover:bg-red-800 transition-colors font-medium"
                          >
                            Editar prueba
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial */}
          {historialPruebas.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setHistorialPruebasAbierto(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors group focus:outline-none"
              >
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                  Historial
                  <span className="ml-2 text-neutral-400 font-normal">({historialPruebas.length})</span>
                </span>
                <ChevronDownIcon open={historialPruebasAbierto} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  historialPruebasAbierto ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-4 space-y-3">
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
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Criterios de evaluación
            </h2>
            <button
              onClick={cargarCriterios}
              disabled={cargandoCriterios}
              title="Recargar criterios"
              className="p-2 text-neutral-400 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargandoCriterios ? <Spinner /> : <RefreshIcon />}
            </button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Criterio</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">Puntaje Máximo</th>
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
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{c.peso}</td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max={c.peso}
                        step="0.1"
                        value={c.puntaje ?? ""}
                        onChange={e => handlePuntajeChange(c.id, e.target.value)}
                        placeholder="-"
                        disabled={cargandoGuardar}
                        className="w-24 text-sm text-center text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
              onClick={() => { (document.activeElement as HTMLElement)?.blur(); setMostrarConfirmarGuardar(true); }}
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
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${cerrandoFormulario ? "animate-overlay-out" : "animate-overlay-in"}`}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-4 ${cerrandoFormulario ? "animate-modal-out" : "animate-modal-in"}`}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {entrevistaEditando
                  ? (modoEdicionEntrevista === "editar" ? "Editar entrevista" : "Reagendar entrevista")
                  : "Agendar entrevista"}
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
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgendar}
                disabled={cargandoEntrevista}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargandoEntrevista
                  ? <><Spinner />{entrevistaEditando ? (modoEdicionEntrevista === "editar" ? "Guardando..." : "Reagendando...") : "Agendando..."}</>
                  : (entrevistaEditando ? (modoEdicionEntrevista === "editar" ? "Guardar cambios" : "Reagendar") : "Agendar")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar guardar calificación */}
      {mostrarConfirmarGuardar && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${cerrandoConfirmarGuardar ? "animate-overlay-out" : "animate-overlay-in"}`}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full mx-4 ${cerrandoConfirmarGuardar ? "animate-modal-out" : "animate-modal-in"}`}>
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
                onClick={cerrarConfirmarGuardar}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarCalificacion}
                className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium text-center"
              >
                Sí, guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cancelar entrevista */}
      {mostrarDialogoCancelar && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${cerrandoDialogoCancelar ? "animate-overlay-out" : "animate-overlay-in"}`}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-4 ${cerrandoDialogoCancelar ? "animate-modal-out" : "animate-modal-in"}`}>
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
                onClick={cerrarDialogoCancelar}
                disabled={cargandoCancelar}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center disabled:opacity-60"
              >
                Volver
              </button>
              <button
                onClick={handleCancelarConfirmada}
                disabled={!motivoCancelacion.trim() || cargandoCancelar}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargandoCancelar ? <><Spinner />Cancelando...</> : "Cancelar entrevista"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Crear / Reagendar prueba */}
      {mostrarFormularioPrueba && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${cerrandoFormularioPrueba ? "animate-overlay-out" : "animate-overlay-in"}`}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-4 ${cerrandoFormularioPrueba ? "animate-modal-out" : "animate-modal-in"}`}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {pruebaEditando
                  ? (modoEdicionPrueba === "editar" ? "Editar prueba" : "Reagendar prueba")
                  : "Crear prueba"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {(!pruebaEditando || modoEdicionPrueba === "editar") && (
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
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearPrueba}
                disabled={cargandoPrueba}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cargandoPrueba
                  ? <><Spinner />{pruebaEditando ? (modoEdicionPrueba === "editar" ? "Guardando..." : "Reagendando...") : "Creando..."}</>
                  : (pruebaEditando ? (modoEdicionPrueba === "editar" ? "Guardar cambios" : "Reagendar") : "Crear")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar completar entrevista */}
      {mostrarConfirmarCompletar && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${cerrandoConfirmarCompletar ? "animate-overlay-out" : "animate-overlay-in"}`}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full mx-4 ${cerrandoConfirmarCompletar ? "animate-modal-out" : "animate-modal-in"}`}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Completar reunión</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700">
                ¿Está seguro de marcar esta entrevista como completada? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={cerrarConfirmarCompletar}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompletarReunionConfirmado}
                className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium text-center"
              >
                Sí, completar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar completar prueba */}
      {mostrarConfirmarCompletarPrueba && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${cerrandoConfirmarCompletarPrueba ? "animate-overlay-out" : "animate-overlay-in"}`}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full mx-4 ${cerrandoConfirmarCompletarPrueba ? "animate-modal-out" : "animate-modal-in"}`}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Completar prueba</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700">
                ¿Está seguro de marcar esta prueba como completada? Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={cerrarConfirmarCompletarPrueba}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center"
              >
                Cancelar
              </button>
              <button
                onClick={handleCompletarPruebaConfirmado}
                className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium text-center"
              >
                Sí, completar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cancelar prueba */}
      {mostrarDialogoCancelarPrueba && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${cerrandoDialogoCancelarPrueba ? "animate-overlay-out" : "animate-overlay-in"}`}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-4 ${cerrandoDialogoCancelarPrueba ? "animate-modal-out" : "animate-modal-in"}`}>
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
                onClick={cerrarDialogoCancelarPrueba}
                disabled={cargandoCancelarPrueba}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium text-center disabled:opacity-60"
              >
                Volver
              </button>
              <button
                onClick={handleCancelarPruebaConfirmada}
                disabled={!motivoCancelacionPrueba.trim() || cargandoCancelarPrueba}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
