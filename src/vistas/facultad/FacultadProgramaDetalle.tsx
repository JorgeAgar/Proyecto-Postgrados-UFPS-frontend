import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { Item } from "./componentes/InfoProgramaDetalle";
import InfoProgramaDetalle from "./componentes/InfoProgramaDetalle";
import ModalEliminar from "../comite/ModalEliminar";
import {
  editarPrograma,
  eliminarPrograma,
  listarPeriodicidades,
  listarNivelesFormacion,
  listarSedes,
  obtenerDetallePrograma,
  obtenerPosiblesDirectores,
} from "../../services/facultadService";
import type { ProgramaUpdateRequest } from "../../services/facultadService";

export type Sede = {
  id: number;
  nombre: string;
  ubicacion: unknown;
};

type Persona = {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
  fechaNacimiento: string;
  celular: string;
  telefono: string;
  ubicacion: unknown;
  genero: unknown;
};

type Administrativo = {
  id: number;
  fechaInicio: string;
  fechaSalida: string | null;
  persona: Persona;
  estado: unknown;
  cargo: unknown;
};

export type Programa = {
  id: number;
  codigo: number;
  nombre: string;
  semestres: number;
  correo: string;
  registrosnies: string;
  nivelformacion: string;
  titulo: string;
  rcmineducacion: string;
  creditos: number;
  periodicidad: string;
  valorMatricula: number;
  sede: Sede;
  administrativo: Administrativo | null;
  facultad: unknown;
};

export default function FacultadProgramaDetalle() {
  const { programa: programaParam } = useParams();
  const navigate = useNavigate();
  const programaId = Number(programaParam);

  const [programa, setPrograma] = useState<Programa | null>(null);
  const [posiblesDirectores, setPosiblesDirectores] = useState<Administrativo[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [eliminandoPrograma, setEliminandoPrograma] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sedeOptions, setSedeOptions] = useState<Sede[]>([]);
  const [nivelFormacionOptions, setNivelFormacionOptions] = useState<string[]>([]);
  const [periodicidadOptions, setPeriodicidadOptions] = useState<string[]>([]);
  const [formState, setFormState] = useState({
    codigo: "",
    duracion: "",
    creditos: "",
    correo: "",
    periodicidad: "",
    nivelFormacion: "",
    titulo: "",
    sede: "",
    rcmineducacion: "",
    registroSnies: "",
    directorId: "",
  });

  useEffect(() => {
    let active = true;

    const cargarPrograma = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!Number.isFinite(programaId)) {
          throw new Error("No se pudo identificar el programa solicitado.");
        }

        const data = (await obtenerDetallePrograma(programaId)) as Programa;
        console.log("Detalle del programa obtenido:", data);

        if (!active) {
          return;
        }

        setPrograma(data);
        setFormState({
          codigo: data.codigo.toString(),
          duracion: data.semestres.toString(),
          creditos: data.creditos.toString(),
          correo: data.correo,
          periodicidad: data.periodicidad,
          nivelFormacion: data.nivelformacion,
          titulo: data.titulo,
          sede: data.sede.id.toString(),
          rcmineducacion: data.rcmineducacion,
          registroSnies: data.registrosnies,
          directorId: data.administrativo?.id.toString() || "0",
        });
      } catch (err) {
        if (!active) {
          return;
        }
        console.error("Error al cargar el detalle del programa:", err);
        setPrograma(null);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el detalle del programa."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    cargarPrograma();

    return () => {
      active = false;
    };
  }, [programaId]);

  useEffect(() => {
    let active = true;

    const cargarOpciones = async () => {
      try {
        const [directores, periodicidades] = await Promise.all([
          obtenerPosiblesDirectores(),
          listarPeriodicidades(),
        ]);
        const [sedes, nivelesFormacion] = await Promise.all([
          listarSedes(),
          listarNivelesFormacion(),
        ]);

        if (!active) {
          return;
        }

        setPosiblesDirectores(directores as Administrativo[]);
        setPeriodicidadOptions(periodicidades);
        setSedeOptions(sedes);
        setNivelFormacionOptions(nivelesFormacion);
      } catch (err) {
        if (!active) {
          return;
        }

        console.error("Error al cargar opciones del formulario:", err);
        setPosiblesDirectores([]);
        setPeriodicidadOptions([]);
        setSedeOptions([]);
        setNivelFormacionOptions([]);
      }
    };

    cargarOpciones();

    return () => {
      active = false;
    };
  }, []);

  // Prepara el formulario con los valores actuales para editar.
  const startEditing = () => {
    if (!programa) {
      return;
    }

    setFormState({
      codigo: programa.codigo.toString(),
      duracion: programa.semestres.toString(),
      creditos: programa.creditos.toString(),
      correo: programa.correo,
      periodicidad: programa.periodicidad,
      nivelFormacion: programa.nivelformacion,
      titulo: programa.titulo,
      sede: programa.sede.id.toString(),
      rcmineducacion: programa.rcmineducacion,
      registroSnies: programa.registrosnies,
      directorId: programa.administrativo?.id.toString() || "0",
    });
    setIsEditing(true);
  };

  // Revierte el formulario a los valores originales y sale de edición.
  const cancelEditing = () => {
    if (!programa) {
      return;
    }

    setFormState({
      codigo: programa.codigo.toString(),
      duracion: programa.semestres.toString(),
      creditos: programa.creditos.toString(),
      correo: programa.correo,
      periodicidad: programa.periodicidad,
      nivelFormacion: programa.nivelformacion,
      titulo: programa.titulo,
      sede: programa.sede.id.toString(),
      rcmineducacion: programa.rcmineducacion,
      registroSnies: programa.registrosnies,
      directorId: programa.administrativo?.id.toString() || "0",
    });
    setIsEditing(false);
  };

  const abrirModalEliminar = () => {
    setMostrarModalEliminar(true);
  };

  const cancelarEliminacion = () => {
    setMostrarModalEliminar(false);
  };

  const confirmarEliminacion = async () => {
    if (!programa) {
      return;
    }

    try {
      setEliminandoPrograma(true);
      await eliminarPrograma(programa.id);
      setMostrarModalEliminar(false);
      navigate("/facultad/programas");
    } catch (err) {
      console.error("Error al eliminar el programa:", err);
    } finally {
      setEliminandoPrograma(false);
    }
  };

  // Normaliza el formulario, arma el payload y actualiza el estado local.
  const saveEditing = async () => {
    if (!programa) {
      return;
    }

    const selectedDirector =
      formState.directorId === "0"
        ? null
        : posiblesDirectores.find(
            (director) => director.id === Number(formState.directorId)
          ) ?? programa.administrativo;

    const payload: ProgramaUpdateRequest = {
      id: programa.id,
      nombre: programa.nombre,
      codigo: Number(formState.codigo) || 0,
      semestres: Number(formState.duracion) || 0,
      creditos: Number(formState.creditos) || 0,
      correo: formState.correo.trim(),
      periodicidad: formState.periodicidad.trim(),
      nivelformacion: formState.nivelFormacion.trim(),
      titulo: formState.titulo.trim(),
      registrosnies: formState.registroSnies.trim(),
      rcmineducacion: formState.rcmineducacion.trim(),
      valorMatricula: programa.valorMatricula ?? 0,
      idSede: Number(formState.sede) || programa.sede.id,
      idAdministrativo: selectedDirector?.id ?? null,
      idFacultad: 1,
      idOtros: null,
    };

    console.log("Payload para API (programa):", payload);

    try {
      await editarPrograma(payload);

      setPrograma({
        ...programa,
        codigo: payload.codigo,
        nombre: payload.nombre,
        semestres: payload.semestres,
        creditos: payload.creditos,
        correo: payload.correo,
        periodicidad: payload.periodicidad,
        nivelformacion: payload.nivelformacion,
        titulo: payload.titulo,
        rcmineducacion: payload.rcmineducacion,
        registrosnies: payload.registrosnies,
        valorMatricula: payload.valorMatricula ?? 0,
        sede: {
          ...programa.sede,
          id: payload.idSede,
        },
        administrativo: selectedDirector,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error al guardar el programa:", err);
    }
  };

  if (loading) {
    return (
      <main className="flex flex-col gap-8 p-8">
        <Link
          to="/facultad/programas"
          className="text-red-600 text-md hover:text-red-700 hover:underline w-fit flex flex-row flex-nowrap items-center gap-1"
        >
          {chevronLeft} Volver a programas
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600 shadow-sm">
          Cargando programa...
        </div>
      </main>
    );
  }

  if (error || !programa) {
    return (
      <main className="flex flex-col gap-8 p-8">
        <Link
          to="/facultad/programas"
          className="text-red-600 text-md hover:text-red-700 hover:underline w-fit flex flex-row flex-nowrap items-center gap-1"
        >
          {chevronLeft} Volver a programas
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm font-medium text-red-700 shadow-sm">
          {error ?? "No se encontró el programa solicitado."}
        </div>
      </main>
    );
  }

  const items: Item[] = [];
  items.push({ titulo: "Código", descripcion: programa.codigo.toString() });
  items.push({
    titulo: "Duración",
    descripcion: programa.semestres.toString() + " semestres",
  });
  items.push({
    titulo: "Director",
    descripcion:
      (programa.administrativo?.persona?.nombres || "N/A") +
      " " +
      (programa.administrativo?.persona?.apellidos || ""),
  });
  items.push({ titulo: "Periodicidad", descripcion: programa.periodicidad });
  items.push({ titulo: "Créditos", descripcion: programa.creditos.toString() });
  items.push({ titulo: "Correo", descripcion: programa.correo });
  items.push({ titulo: "Nivel de formación", descripcion: programa.nivelformacion });
  items.push({ titulo: "Título otorgado", descripcion: programa.titulo });
  items.push({ titulo: "Sede", descripcion: programa.sede.nombre });
  items.push({
    titulo: "Registro calificado",
    descripcion: programa.rcmineducacion,
  });
  items.push({ titulo: "Registro SNIES", descripcion: programa.registrosnies });

  return (
    <main className="flex flex-col gap-8 p-8">
      <Link
        to="/facultad/programas"
        className="text-red-600 text-md hover:text-red-700 hover:underline w-fit flex flex-row flex-nowrap items-center gap-1"
      >
        {chevronLeft} Volver a programas
      </Link>
      <div className="flex flex-row justify-between">
        <h1 className="m-0 p-0 font-semibold text-2xl">{programa.nombre}</h1>
        {!isEditing && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={abrirModalEliminar}
              className="rounded-lg border border-red-200 bg-white px-4 py-1 font-semibold text-red-700 transition-colors hover:bg-red-50 hover:border-red-300"
            >
              Eliminar programa
            </button>
            <button
              type="button"
              onClick={startEditing}
              className="bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold px-4 py-1"
            >
              Editar programa
            </button>
          </div>
        )}
      </div>
      {!isEditing && <InfoProgramaDetalle items={items} />}
      {isEditing && (
        <section className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-7">
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Información General
          </h2>
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 md:gap-y-9">
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Código
              </label>
              <input
                type="number"
                value={formState.codigo}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    codigo: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Duración
              </label>
              <input
                type="number"
                value={formState.duracion}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    duracion: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Director
              </label>
              <select
                value={formState.directorId}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    directorId: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
              >
                <option value="0">sin director</option>
                {posiblesDirectores.map((director) => (
                  <option key={director.id} value={director.id}>
                    {director.persona.nombres} {director.persona.apellidos}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Periodicidad
              </label>
              <select
                value={formState.periodicidad}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    periodicidad: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">Selecciona una opción</option>
                {periodicidadOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Créditos
              </label>
              <input
                type="number"
                value={formState.creditos}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    creditos: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Correo
              </label>
              <input
                type="email"
                value={formState.correo}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    correo: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Nivel de formación
              </label>
              <select
                value={formState.nivelFormacion}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    nivelFormacion: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">Selecciona una opción</option>
                {nivelFormacionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Título otorgado
              </label>
              <input
                type="text"
                value={formState.titulo}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    titulo: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Sede
              </label>
              <select
                value={formState.sede}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    sede: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="">Selecciona una opción</option>
                {sedeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Registro calificado
              </label>
              <input
                type="text"
                value={formState.rcmineducacion}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    rcmineducacion: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                Registro SNIES
              </label>
              <input
                type="text"
                value={formState.registroSnies}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    registroSnies: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={cancelEditing}
              className="border border-gray-200 text-gray-600 font-semibold rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={saveEditing}
              className="bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold px-4 py-2 text-sm"
            >
              Guardar
            </button>
          </div>
        </section>
      )}
      {mostrarModalEliminar && programa && (
        <ModalEliminar
          titulo="Confirmar eliminación"
          onConfirm={confirmarEliminacion}
          onCancel={cancelarEliminacion}
          loading={eliminandoPrograma}
        >
          <p className="font-semibold text-gray-800">{programa.nombre}</p>
          <p className="text-gray-500">ID: {programa.id}</p>
        </ModalEliminar>
      )}
    </main>
  );
}

const chevronLeft = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5 8.25 12l7.5-7.5"
    />
  </svg>
);
