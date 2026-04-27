import React, { useState, useMemo } from 'react';
import DeleteProgramModal from '../../components/ui/DeleteProgramModal';
import { Button } from '../../components/ui/Button';
import useAuthStore, { useUserRole, useDisplayName } from '../../stores/authStore';
import type { Programa } from '../../types';

type LocalPrograma = Programa & { tieneEstudiantesActivos?: boolean };

const mockData: LocalPrograma[] = [
  { id: 'p1', nombre: 'Maestría en Ingeniería', codigo: 'MI-01', descripcion: '', duracion: '2 años', modalidad: 'presencial', costo: 0, requisitos: [], estado: 'activo', tieneEstudiantesActivos: false },
  { id: 'p2', nombre: 'Doctorado en Ciencias', codigo: 'DC-01', descripcion: '', duracion: '4 años', modalidad: 'hibrida', costo: 0, requisitos: [], estado: 'en_proceso', tieneEstudiantesActivos: false },
  { id: 'p3', nombre: 'Especialización en Gestión', codigo: 'EG-01', descripcion: '', duracion: '1 año', modalidad: 'virtual', costo: 0, requisitos: [], estado: 'activo', tieneEstudiantesActivos: true },
  { id: 'p4', nombre: 'Programa Archivado', codigo: 'PA-01', descripcion: '', duracion: '1 año', modalidad: 'virtual', costo: 0, requisitos: [], estado: 'inactivo', tieneEstudiantesActivos: false },
];

export default function DeleteProgramsPage() {
  const userRole = useUserRole();
  const session = useAuthStore((s: any) => s.session);
  const displayName = useDisplayName();

  const isDirector = useMemo(() => {
    // Simulación: se espera que session tenga una bandera `isDirector` para distinguir Director de Facultad.
    return (session as any)?.isDirector === true;
  }, [session]);

  const [programas, setProgramas] = useState<LocalPrograma[]>(mockData);
  const [selected, setSelected] = useState<LocalPrograma | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const openConfirm = (p: LocalPrograma) => {
    const exists = programas.find((x) => x.id === p.id);
    if (!exists) {
      setMessage('El programa seleccionado no existe.');
      return;
    }

    setSelected(p);
    setModalOpen(true);
  };

  const cancel = () => {
    setSelected(null);
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!selected) return;

    // Validaciones
    if (selected.tieneEstudiantesActivos) {
      setMessage('No se puede eliminar el programa porque tiene estudiantes activos');
      setModalOpen(false);
      return;
    }

    if (!(selected.estado === 'activo' || selected.estado === 'en_proceso')) {
      setMessage('Solo se pueden eliminar programas en estado activo o en proceso');
      setModalOpen(false);
      return;
    }

    // Simular eliminación local
    setProgramas((prev) => prev.filter((p) => p.id !== selected.id));

    // Registrar trazabilidad en localStorage (simulado)
    try {
      const history = JSON.parse(localStorage.getItem('deletion_history') || '[]');
      history.push({ id: selected.id, nombre: selected.nombre, deletedBy: displayName, date: new Date().toISOString() });
      localStorage.setItem('deletion_history', JSON.stringify(history));
      console.info('Registro de eliminación:', history[history.length - 1]);
    } catch (e) {
      console.warn('No se pudo registrar la trazabilidad en localStorage', e);
    }

    setModalOpen(false);
    setSelected(null);
    setMessage('Programa eliminado correctamente');
  };

  if (!isDirector) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-3">Eliminación de programas de posgrado</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">Acceso denegado. No tiene permisos para realizar esta acción</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-3">Eliminación de programas de posgrado</h2>

      {message && <div className="mb-4 text-sm text-green-700">{message}</div>}

      <div className="space-y-3">
        {programas.length === 0 && <div>No hay programas disponibles.</div>}
        {programas.map((p) => (
          <div key={p.id} className="flex items-center justify-between border p-3 rounded">
            <div>
              <div className="font-medium">{p.nombre}</div>
              <div className="text-sm text-gray-600">Código: {p.codigo} — Estado: {p.estado}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => openConfirm(p)}>Eliminar</Button>
            </div>
          </div>
        ))}
      </div>

      <DeleteProgramModal
        open={modalOpen}
        programa={selected ? { id: selected.id, nombre: selected.nombre } : null}
        onCancel={cancel}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
