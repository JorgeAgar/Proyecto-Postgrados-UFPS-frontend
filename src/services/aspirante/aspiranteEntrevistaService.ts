// TODO: reemplazar los datos de ejemplo con llamadas reales al backend

export interface EntrevistaConfirmada {
  id: string;
  fecha: string;
  hora: string;
  lugar: string;
  modalidad: "Presencial" | "Virtual";
  tiempoRestante: string;
}

export interface EntrevistaPendiente {
  id: string;
  fecha: string;
  hora: string;
  lugar: string;
  modalidad: "Presencial" | "Virtual";
  estado: "pendiente" | "cambio_solicitado";
}

export async function getEntrevistasConfirmadas(): Promise<EntrevistaConfirmada[]> {
  return [
    {
      id: "3",
      fecha: "8 de Mayo, 2026",
      hora: "2:00 PM",
      lugar: "Edificio Central, Sala de Juntas A",
      modalidad: "Presencial",
      tiempoRestante: "En 7 días",
    },
  ];
}

export async function getEntrevistasPendientes(): Promise<EntrevistaPendiente[]> {
  return [
    {
      id: "1",
      fecha: "15 de Mayo, 2026",
      hora: "10:00 AM",
      lugar: "Edificio de Posgrados, Oficina 301",
      modalidad: "Presencial",
      estado: "cambio_solicitado",
    },
    {
      id: "2",
      fecha: "18 de Mayo, 2026",
      hora: "3:00 PM",
      lugar: "Enlace virtual: meet.google.com/xyz-abc-def",
      modalidad: "Virtual",
      estado: "pendiente",
    },
  ];
}

export async function aceptarEntrevista(id: string): Promise<void> {
  console.log("Aceptar entrevista:", id);
}

export async function solicitarCambioEntrevista(id: string, motivo: string): Promise<void> {
  console.log("Solicitar cambio:", { id, motivo });
}

export async function cancelarEntrevista(id: string, motivo: string): Promise<void> {
  console.log("Cancelar entrevista:", { id, motivo });
}
