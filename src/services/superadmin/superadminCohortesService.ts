import { superadminApiFetch } from './superadminService';
import type { EstadoOutput } from './superadminSemestresService';
export { superadminSemestresService } from './superadminSemestresService';
export type { EstadoOutput, SemestreOutput } from './superadminSemestresService';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ModalidadOutput {
  id: number;
  nombre: string;
}

export interface PlazoOutput {
  id: number;
  idTipoplazo: number;
  fechainicio: string;
  fechafin: string;
  tipoplazo?: { id: number; tipo: string; descripcion?: string | null };
}

export interface FacultadOutput {
  id: number;
  nombre: string;
  correo: string;
  cargoList?: string[];
  programaList?: ProgramaOutput[];
}

export interface ProgramaOutput {
  id: number;
  codigo: number;
  nombre: string;
  duracion: number;
  correo: string;
  registrosnies: string;
  nivelformacion: string;
  titulo: string;
  rcmineducacion: string;
  creditos: number;
  periodicidad: string;
  valormatricula: number;
  idFacultad: number;
  idOtros: number;
  idSede: number;
  idTiporegistro?: number;
  sede?: { id: number; nombre: string };
  facultad?: string;
  tiporegistro?: { id: number; tipo: string };
  cohorteList?: string[];
}

export interface CohorteOutput {
  id: number;
  nombre: string;
  cupos: number;
  idEstado: number;
  idSemestre: number;
  idModalidad: number;
  idPlazodocumentacion: number;
  idPlazoinscripcion: number;
  idPlazopago: number;
  idPrograma: number;
  estado?: string | EstadoOutput;
  semestre?: { id: number; nombre: string; fechainicio: string; fechafin: string };
  modalidad?: { id: number; nombre: string };
}

// ── Facultades ────────────────────────────────────────────────────────────────

export const superadminFacultadesService = {
  listar: () =>
    superadminApiFetch<FacultadOutput[]>('/api/dev/endpoint/facultad/listall', { method: 'GET' }),

  crear: (data: { nombre: string; correo: string; idAdministrativo: number }) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/facultad/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizar: (data: { id: number; nombre: string; correo: string; idAdministrativo: number }) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/facultad/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  eliminar: (id: number) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/facultad/delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    }),
};

// ── Programas ─────────────────────────────────────────────────────────────────

export const superadminProgramasService = {
  listar: () =>
    superadminApiFetch<ProgramaOutput[]>('/api/dev/endpoint/programa/listall', { method: 'GET' }),

  listarPorFacultad: (idFacultad: number) =>
    superadminApiFetch<ProgramaOutput[]>('/api/dev/endpoint/programa/listbyfacultad', {
      method: 'POST',
      body: JSON.stringify({ id: idFacultad }),
    }),

  listarFacultades: () =>
    superadminApiFetch<FacultadOutput[]>('/api/dev/endpoint/facultad/listall', { method: 'GET' }),

  crear: (data: {
    codigo: number; nombre: string; duracion: number; correo: string;
    registrosnies: string; nivelformacion: string; titulo: string;
    rcmineducacion: string; creditos: number; periodicidad: string;
    valormatricula: number; idSede: number; idTiporegistro: number;
    idFacultad: number; idOtros: number;
  }) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/programa/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizar: (data: {
    id: number; codigo: number; nombre: string; duracion: number; correo: string;
    registrosnies: string; nivelformacion: string; titulo: string;
    rcmineducacion: string; creditos: number; periodicidad: string;
    valormatricula: number; idSede: number; idTiporegistro: number;
    idFacultad: number; idOtros: number;
  }) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/programa/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  eliminar: (id: number) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/programa/delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    }),
};

// ── Cohortes ──────────────────────────────────────────────────────────────────

export const superadminCohortesService = {
  listar: () =>
    superadminApiFetch<CohorteOutput[]>('/api/dev/endpoint/cohortes/listall', { method: 'GET' }),

  crear: (data: {
    nombre: string; cupos: number;
    idEstado: number; idSemestre: number; idModalidad: number;
    idPlazodocumentacion: number; idPlazoinscripcion: number; idPlazopago: number;
    idPrograma: number;
  }) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/cohortes/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizar: (data: {
    id: number; nombre: string; cupos: number;
    idEstado: number; idSemestre: number; idModalidad: number;
    idPlazodocumentacion: number; idPlazoinscripcion: number; idPlazopago: number;
    idPrograma: number;
  }) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/cohortes/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  eliminar: (id: number) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/cohortes/delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    }),
};

// ── Modalidades ───────────────────────────────────────────────────────────────

export const superadminModalidadesService = {
  listar: () =>
    superadminApiFetch<ModalidadOutput[]>('/api/dev/endpoint/modalidad/listall', { method: 'GET' }),
};

// ── Plazos ────────────────────────────────────────────────────────────────────

export const superadminPlazosService = {
  listar: () =>
    superadminApiFetch<PlazoOutput[]>('/api/dev/endpoint/plazo/listall', { method: 'GET' }),

  crear: (data: { fechainicio: string; fechafin: string; idTipoplazo: number }) =>
    superadminApiFetch<PlazoOutput>('/api/dev/endpoint/plazo/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizar: (data: { id: number; fechainicio: string; fechafin: string; idTipoplazo: number }) =>
    superadminApiFetch<PlazoOutput>('/api/dev/endpoint/plazo/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ── Administrativos ───────────────────────────────────────────────────────────

export interface AdministrativoOutput {
  id: number;
  idPersona: number;
  persona?: { id: number; nombres: string; apellidos: string; correo: string };
  cargo?: { id: number; nombre: string };
}

export const superadminAdministrativosService = {
  listar: () =>
    superadminApiFetch<AdministrativoOutput[]>('/api/dev/endpoint/administrativo/listall', { method: 'GET' }),
};

// ── Sedes ─────────────────────────────────────────────────────────────────────

export interface SedeOutput {
  id: number;
  nombre: string;
  ubicacion?: { id: number; direccion: string | null };
}

export const superadminSedesService = {
  listar: () =>
    superadminApiFetch<SedeOutput[]>('/api/dev/endpoint/sedes/listall', { method: 'GET' }),
};

// ── Otros valores ─────────────────────────────────────────────────────────────

export interface OtrosValoresOutput {
  id: number;
  carnet: boolean;
  estampilla: boolean;
  seguro: boolean;
}

export const superadminOtrosValoresService = {
  listar: () =>
    superadminApiFetch<OtrosValoresOutput[]>('/api/dev/endpoint/otrosvalores/listall', { method: 'GET' }),
};
