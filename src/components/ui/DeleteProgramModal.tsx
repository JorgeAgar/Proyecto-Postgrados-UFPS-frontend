import React from 'react';
import { Button } from './Button';

interface ProgramaShort {
  id: string;
  nombre: string;
}

interface Props {
  open: boolean;
  programa?: ProgramaShort | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteProgramModal({ open, programa, onConfirm, onCancel }: Props) {
  if (!open || !programa) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-3">Confirmar eliminación</h3>
        <p className="mb-4">¿Está seguro de que desea eliminar el programa <strong>{programa.nombre}</strong>?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm}>Aceptar</Button>
        </div>
      </div>
    </div>
  );
}
