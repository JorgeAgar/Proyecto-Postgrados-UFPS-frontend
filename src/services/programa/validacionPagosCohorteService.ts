export interface AspirantePagosApi {
  id: number;
  nombre: string;
  cedula: string;
  correo: string;
  comprobantesEnviados: number;
  comprobantesVerificados: number;
}

const MOCK_ASPIRANTES: AspirantePagosApi[] = [
  { id: 1,  nombre: "Carlos Andrés Rodríguez Martínez", cedula: "1094562345", correo: "c.rodriguez@ufps.edu.co",  comprobantesEnviados: 1, comprobantesVerificados: 1 },
  { id: 2,  nombre: "María Fernanda López Torres",       cedula: "1090876543", correo: "mf.lopez@gmail.com",       comprobantesEnviados: 1, comprobantesVerificados: 0 },
  { id: 3,  nombre: "Andrés Felipe Morales Cárdenas",   cedula: "1085432109", correo: "af.morales@hotmail.com",   comprobantesEnviados: 0, comprobantesVerificados: 0 },
  { id: 4,  nombre: "Luisa Valentina Ramírez Parra",    cedula: "1091234567", correo: "lv.ramirez@ufps.edu.co",  comprobantesEnviados: 1, comprobantesVerificados: 1 },
  { id: 5,  nombre: "Sebastián David Herrera Vargas",   cedula: "1087654321", correo: "sd.herrera@gmail.com",    comprobantesEnviados: 1, comprobantesVerificados: 0 },
  { id: 6,  nombre: "Natalia Alejandra Gómez Rincón",   cedula: "1093215678", correo: "na.gomez@yahoo.com",      comprobantesEnviados: 0, comprobantesVerificados: 0 },
  { id: 7,  nombre: "Jorge Iván Díaz Medina",           cedula: "1096789012", correo: "ji.diaz@ufps.edu.co",     comprobantesEnviados: 1, comprobantesVerificados: 1 },
  { id: 8,  nombre: "Sara Paola Ruiz Bautista",         cedula: "1088901234", correo: "sp.ruiz@gmail.com",       comprobantesEnviados: 1, comprobantesVerificados: 0 },
  { id: 9,  nombre: "Daniel Mauricio Castro Suárez",    cedula: "1095432167", correo: "dm.castro@hotmail.com",   comprobantesEnviados: 0, comprobantesVerificados: 0 },
  { id: 10, nombre: "Camila Andrea Torres Espejo",      cedula: "1092345678", correo: "ca.torres@ufps.edu.co",   comprobantesEnviados: 1, comprobantesVerificados: 1 },
];

export async function obtenerAspirantesPorCohortePagos(idCohorte: number): Promise<AspirantePagosApi[]> {
  void idCohorte;
  await new Promise<void>((r) => setTimeout(r, 600));
  return MOCK_ASPIRANTES;
}
