import { useState, useEffect, useCallback } from 'react';
import { Modal } from './components/Modal';
import {
  superadminUsuariosService,
  type UsuarioOutput,
  type RolOutput,
  type PersonaBasica,
} from '../../services/superadmin/superadminUsuariosService';

// ── Íconos ────────────────────────────────────────────────────────────────────

function UserPlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

// ── Tipos locales ─────────────────────────────────────────────────────────────

type UserForm = {
  nombreusuario: string;
  password: string;
  idPersona: number | '';
  idRol: number | '';
};

const EMPTY_FORM: UserForm = { nombreusuario: '', password: '', idPersona: '', idRol: '' };

// ── Componente ────────────────────────────────────────────────────────────────

export default function SuperadminUsuarios() {
  const [usuarios, setUsuarios]   = useState<UsuarioOutput[]>([]);
  const [roles, setRoles]         = useState<RolOutput[]>([]);
  const [personas, setPersonas]   = useState<PersonaBasica[]>([]);
  const [loading, setLoading]     = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showUserModal, setShowUserModal]     = useState(false);
  const [editingUser, setEditingUser]         = useState<UsuarioOutput | null>(null);
  const [formData, setFormData]               = useState<UserForm>(EMPTY_FORM);
  const [submitting, setSubmitting]           = useState(false);
  const [formError, setFormError]             = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete]       = useState<UsuarioOutput | null>(null);
  const [deleting, setDeleting]               = useState(false);
  const [deleteError, setDeleteError]         = useState<string | null>(null);

  const [showPassword, setShowPassword]               = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // ── Carga inicial ─────────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    try {
      const [us, rs, ps] = await Promise.all([
        superadminUsuariosService.listar(),
        superadminUsuariosService.listarRoles(),
        superadminUsuariosService.listarPersonas(),
      ]);
      setUsuarios(us);
      setRoles(rs);
      setPersonas(ps);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Error al cargar datos del servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Handlers: modal crear/editar ──────────────────────────────────────────

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setShowPassword(false);
    setShowCurrentPassword(false);
    setShowUserModal(true);
  };

  const openEditModal = (user: UsuarioOutput) => {
    setEditingUser(user);
    setFormData({
      nombreusuario: user.nombreusuario,
      password: '',
      idPersona: user.idPersona,
      idRol: user.idRol,
    });
    setFormError(null);
    setShowPassword(false);
    setShowCurrentPassword(false);
    setShowUserModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.nombreusuario.trim()) {
      setFormError('El nombre de usuario es obligatorio.');
      return;
    }
    if (formData.idPersona === '') {
      setFormError('Selecciona una persona.');
      return;
    }
    if (formData.idRol === '') {
      setFormError('Selecciona un rol.');
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      setFormError('La contraseña es obligatoria al crear un usuario.');
      return;
    }

    setSubmitting(true);
    try {
      let claveId = editingUser?.idClave ?? 0;

      if (formData.password.trim()) {
        const clave = await superadminUsuariosService.crearClave(formData.password.trim());
        claveId = clave.id;
      }

      if (editingUser) {
        await superadminUsuariosService.actualizar({
          id: editingUser.id,
          nombreusuario: formData.nombreusuario.trim(),
          idPersona: formData.idPersona as number,
          idRol: formData.idRol as number,
          idClave: claveId,
        });
      } else {
        await superadminUsuariosService.crear({
          nombreusuario: formData.nombreusuario.trim(),
          idPersona: formData.idPersona as number,
          idRol: formData.idRol as number,
          idClave: claveId,
        });
      }

      setShowUserModal(false);
      await cargar();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Handlers: modal eliminar ──────────────────────────────────────────────

  const openDeleteModal = (user: UsuarioOutput) => {
    setUserToDelete(user);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await superadminUsuariosService.eliminar(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      await cargar();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar el usuario.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const nombreCompleto = (u: UsuarioOutput) =>
    u.persona ? `${u.persona.nombres ?? ''} ${u.persona.apellidos ?? ''}`.trim() : '—';

  const filtered = usuarios.filter((u) => {
    const s = searchTerm.toLowerCase();
    return (
      nombreCompleto(u).toLowerCase().includes(s) ||
      u.nombreusuario.toLowerCase().includes(s) ||
      (u.persona?.correo ?? '').toLowerCase().includes(s)
    );
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8">
      {/* Encabezado */}
      <div className="animate-fade-in-up flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm">Administra los usuarios del sistema</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={cargar}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshIcon />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <UserPlusIcon />
            Crear Usuario
          </button>
        </div>
      </div>

      {/* Error de página */}
      {pageError && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {pageError}
        </div>
      )}

      {/* Buscador */}
      <div className="animate-fade-in-up delay-100 mb-5">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="animate-fade-in-up delay-200 bg-white border border-gray-200 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Cargando usuarios...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-5 py-3.5 text-left font-semibold">Nombre</th>
                <th className="px-5 py-3.5 text-left font-semibold">Correo</th>
                <th className="px-5 py-3.5 text-left font-semibold">Usuario</th>
                <th className="px-5 py-3.5 text-left font-semibold">Rol</th>
                <th className="px-5 py-3.5 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{nombreCompleto(u)}</td>
                  <td className="px-5 py-3.5 text-gray-500">{u.persona?.correo ?? '—'}</td>
                  <td className="px-5 py-3.5 text-gray-700 font-mono text-xs">{u.nombreusuario}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                      {u.rol?.nombre ?? `Rol #${u.idRol}`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                      >
                        <PencilIcon />
                        Editar
                      </button>
                      <button
                        onClick={() => openDeleteModal(u)}
                        className="flex items-center justify-center p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            No se encontraron usuarios
          </div>
        )}
      </div>

      {/* Modal: Crear / Editar Usuario */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {formError}
            </div>
          )}

          {/* Nombre de usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre de usuario
            </label>
            <input
              type="text"
              placeholder="usuario123"
              value={formData.nombreusuario}
              onChange={(e) => setFormData({ ...formData, nombreusuario: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
              autoFocus
            />
          </div>

          {/* Persona */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Persona
            </label>
            <select
              value={formData.idPersona}
              onChange={(e) => setFormData({ ...formData, idPersona: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
            >
              <option value="">Seleccionar persona</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombres} {p.apellidos}{p.correo ? ` — ${p.correo}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
            <select
              value={formData.idRol}
              onChange={(e) => setFormData({ ...formData, idRol: e.target.value === '' ? '' : Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
            >
              <option value="">Seleccionar rol</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
          </div>

          {/* Contraseña actual (solo al editar) */}
          {editingUser && editingUser.clave?.valor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña actual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={editingUser.clave.valor}
                  readOnly
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-default focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showCurrentPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          )}

          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {editingUser ? <>Nueva contraseña <span className="text-gray-400 font-normal">(dejar vacío para no cambiar)</span></> : 'Contraseña'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {editingUser ? 'Actualizar' : 'Crear'} Usuario
            </button>
            <button
              type="button"
              onClick={() => setShowUserModal(false)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirmar eliminar */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Usuario"
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {deleteError}
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <TrashIcon />
            </div>
            <p className="text-sm text-gray-500 pt-1">
              ¿Estás seguro de que deseas eliminar al usuario{' '}
              <span className="font-semibold text-gray-800">
                {userToDelete ? userToDelete.nombreusuario : ''}
              </span>?
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleting}
              className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {deleting && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
