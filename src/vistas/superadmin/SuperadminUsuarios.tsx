import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Modal } from './components/Modal';

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

// ── Tipos ─────────────────────────────────────────────────────────────────────

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

// ── Datos mock ────────────────────────────────────────────────────────────────

const mockUsers: User[] = [
  { id: 1, name: 'Juan Pérez',     email: 'juan.perez@ufps.edu.co',     role: 'Docente'      },
  { id: 2, name: 'María González', email: 'maria.gonzalez@ufps.edu.co', role: 'Coordinador'  },
  { id: 3, name: 'Carlos Ruiz',    email: 'carlos.ruiz@ufps.edu.co',    role: 'Aspirante'    },
  { id: 4, name: 'Ana Martínez',   email: 'ana.martinez@ufps.edu.co',   role: 'Docente'      },
  { id: 5, name: 'Pedro Sánchez',  email: 'pedro.sanchez@ufps.edu.co',  role: 'Aspirante'    },
];

// ── Componente ────────────────────────────────────────────────────────────────

export default function SuperadminUsuarios() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers]               = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm]     = useState('');

  // ── Estado: modal crear/editar ───────────────────────────────────────────
  const [showUserModal, setShowUserModal]   = useState(false);
  const [editingUser, setEditingUser]       = useState<User | null>(null);
  const [formData, setFormData]             = useState({ name: '', email: '', role: '' });

  // ── Estado: modal eliminar ───────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete]       = useState<User | null>(null);

  // Soporte para ?action=create desde otros módulos
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      openCreateModal();
      setSearchParams({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: '' });
    setShowUserModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setShowUserModal(true);
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...editingUser, ...formData } : u))
      );
    } else {
      setUsers((prev) => [...prev, { id: Date.now(), ...formData }]);
    }
    setShowUserModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: '' });
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    }
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 md:p-8">
      {/* Encabezado */}
      <div className="animate-fade-in-up flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm">Administra los usuarios del sistema</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shrink-0"
        >
          <UserPlusIcon />
          Crear Usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="animate-fade-in-up delay-100 mb-5">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Buscar usuario por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="animate-fade-in-up delay-200 bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-5 py-3.5 text-left font-semibold">Nombre</th>
              <th className="px-5 py-3.5 text-left font-semibold">Correo Electrónico</th>
              <th className="px-5 py-3.5 text-left font-semibold">Rol</th>
              <th className="px-5 py-3.5 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900">{user.name}</td>
                <td className="px-5 py-3.5 text-gray-500">{user.email}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium"
                    >
                      <PencilIcon />
                      Editar
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
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
        {filteredUsers.length === 0 && (
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="usuario@ufps.edu.co"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent transition-colors"
              required
            >
              <option value="">Seleccionar rol</option>
              <option value="Aspirante">Aspirante</option>
              <option value="Docente">Docente</option>
              <option value="Coordinador">Coordinador</option>
              <option value="Admin">Administrador</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
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
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-700">
              <TrashIcon />
            </div>
            <p className="text-sm text-gray-500 pt-1">
              ¿Estás seguro de que deseas eliminar a{' '}
              <span className="font-semibold text-gray-800">{userToDelete?.name}</span>?
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
              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
