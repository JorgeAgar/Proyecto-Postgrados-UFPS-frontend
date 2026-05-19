import { superadminApiFetch } from './superadminService';

export interface PersonaBasica {
  id: number;
  nombres: string;
  apellidos: string;
  correo: string;
}

export interface RolOutput {
  id: number;
  nombre: string;
}

export interface ClaveOutput {
  id: number;
  valor: string;
}

export interface UsuarioOutput {
  id: number;
  nombreusuario: string;
  idClave: number;
  idPersona: number;
  idRol: number;
  persona?: PersonaBasica & Record<string, unknown>;
  rol?: RolOutput;
  clave?: ClaveOutput;
}

export const superadminUsuariosService = {
  listar: () =>
    superadminApiFetch<UsuarioOutput[]>('/api/dev/endpoint/usuario/listall', { method: 'GET' }),

  listarRoles: () =>
    superadminApiFetch<RolOutput[]>('/api/dev/endpoint/rol/listall', { method: 'GET' }),

  listarPersonas: () =>
    superadminApiFetch<PersonaBasica[]>('/api/dev/endpoint/persona/listall', { method: 'GET' }),

  crearClave: (valor: string) =>
    superadminApiFetch<ClaveOutput>('/api/dev/endpoint/clave/create', {
      method: 'POST',
      body: JSON.stringify({ valor }),
    }),

  crear: (data: { nombreusuario: string; idPersona: number; idRol: number; idClave: number }) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/usuario/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  actualizar: (data: { id: number; nombreusuario: string; idPersona: number; idRol: number; idClave: number }) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/usuario/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  eliminar: (id: number) =>
    superadminApiFetch<unknown>('/api/dev/endpoint/usuario/delete', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    }),
};
