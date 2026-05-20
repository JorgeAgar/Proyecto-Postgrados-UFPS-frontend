export interface Cohorte {
	id: string;
	nombre: string;
	activa: boolean;
	inscritos: number;
	validados?: number;
	admitidos?: number;
	fechaLimiteDocumentos: string;
}

export interface AspiranteValidacion {
	id: string;
	nombre: string;
	cedula: string;
	documentosValidados: number;
	totalDocumentos: number;
	correo: string;
	ultimaActualizacion: string;
	estado: "por validar" | "en progreso" | "validados";
}

export const cohortes: Cohorte[] = [
	{
		id: "1",
		nombre: "Cohorte-3 2025-1",
		activa: true,
		inscritos: 45,
		validados: 32,
		fechaLimiteDocumentos: "15/05/2026",
	},
	{
		id: "2",
		nombre: "Cohorte-2 2024-2",
		activa: false,
		inscritos: 38,
		validados: 38,
		admitidos: 32,
		fechaLimiteDocumentos: "10/07/2024",
	},
	{
		id: "3",
		nombre: "Cohorte-1 2024-1",
		activa: false,
		inscritos: 42,
		validados: 42,
		admitidos: 35,
		fechaLimiteDocumentos: "10/01/2024",
	},
];

export const aspirantesPorCohorte: Record<string, AspiranteValidacion[]> = {
	"1": [
		{
			id: "1",
			nombre: "María Fernanda Pérez González",
			cedula: "1098765432",
			documentosValidados: 7,
			totalDocumentos: 7,
			correo: "maria.perez@email.com",
			ultimaActualizacion: "27 de abril de 2026",
			estado: "validados",
		},
		{
			id: "2",
			nombre: "Jorge Luis Gómez Ramírez",
			cedula: "1065432109",
			documentosValidados: 7,
			totalDocumentos: 7,
			correo: "jorge.gomez@email.com",
			ultimaActualizacion: "29 de abril de 2026",
			estado: "validados",
		},
		{
			id: "3",
			nombre: "Carlos Andrés Rodríguez Martínez",
			cedula: "1087654321",
			documentosValidados: 5,
			totalDocumentos: 7,
			correo: "carlos.rodriguez@email.com",
			ultimaActualizacion: "28 de abril de 2026",
			estado: "en progreso",
		},
		{
			id: "4",
			nombre: "Ana Lucía Torres Sánchez",
			cedula: "1076543210",
			documentosValidados: 4,
			totalDocumentos: 7,
			correo: "ana.torres@email.com",
			ultimaActualizacion: "26 de abril de 2026",
			estado: "en progreso",
		},
		{
			id: "5",
			nombre: "Luis Fernando Martínez Castro",
			cedula: "1098234567",
			documentosValidados: 0,
			totalDocumentos: 7,
			correo: "luis.martinez@email.com",
			ultimaActualizacion: "30 de abril de 2026",
			estado: "por validar",
		},
		{
			id: "6",
			nombre: "Patricia Isabel Hernández López",
			cedula: "1087234561",
			documentosValidados: 0,
			totalDocumentos: 7,
			correo: "patricia.hernandez@email.com",
			ultimaActualizacion: "25 de abril de 2026",
			estado: "por validar",
		},
	],
	"2": [
		{
			id: "1",
			nombre: "Natalia Gómez Silva",
			cedula: "1001122334",
			documentosValidados: 7,
			totalDocumentos: 7,
			correo: "natalia.gomez@email.com",
			ultimaActualizacion: "20 de junio de 2024",
			estado: "validados",
		},
		{
			id: "2",
			nombre: "Felipe Álvarez Torres",
			cedula: "1002233445",
			documentosValidados: 7,
			totalDocumentos: 7,
			correo: "felipe.alvarez@email.com",
			ultimaActualizacion: "21 de junio de 2024",
			estado: "validados",
		},
		{
			id: "3",
			nombre: "Laura Castellanos Pérez",
			cedula: "1003344556",
			documentosValidados: 3,
			totalDocumentos: 7,
			correo: "laura.castellanos@email.com",
			ultimaActualizacion: "19 de junio de 2024",
			estado: "en progreso",
		},
	],
	"3": [
		{
			id: "1",
			nombre: "Ricardo Luna Herrera",
			cedula: "1004455667",
			documentosValidados: 7,
			totalDocumentos: 7,
			correo: "ricardo.luna@email.com",
			ultimaActualizacion: "8 de enero de 2024",
			estado: "validados",
		},
	],
};

export function calcularPorcentaje(validados: number, total: number) {
	return Math.round((validados / total) * 100);
}

export function obtenerCohorte(cohorteId?: string) {
	return cohortes.find((cohorte) => cohorte.id === cohorteId) ?? cohortes[0];
}

export function obtenerAspirantes(cohorteId?: string) {
	return aspirantesPorCohorte[cohorteId ?? ""] ?? aspirantesPorCohorte["1"];
}

export function obtenerAspirante(cohorteId: string | undefined, aspiranteId: string | undefined) {
	return obtenerAspirantes(cohorteId).find((aspirante) => aspirante.id === aspiranteId) ?? obtenerAspirantes(cohorteId)[0];
}

/**
 * Saca el token de acceso de la cookie de sesión para usarlo en las solicitudes al backend.
 * @returns el token de acceso
 */
function getAccessToken() {
  const cookies = document.cookie
    .split("; ")
    .reduce((acc: Record<string, string>, cookie) => {
      const [name, value] = cookie.split("=");
      acc[name] = decodeURIComponent(value);
      return acc;
    }, {});
  const authData = JSON.parse(cookies.auth);
  return authData?.accessToken;
}

let idPrograma: number = -1;

/**
 * Devuelve la id del programa del que es director el usuario en base a la id del usuario
 * @returns la id del programa del que es director el usuario
 */
export async function getIdPrograma() {
	if (idPrograma != -1) return idPrograma;

	const idUsuario = JSON.parse(document.cookie.split("; ").find(row => row.startsWith("auth="))?.split("=")[1] ?? "").userId;

	const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/application/case/director-programa/programa/director/${idUsuario}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      }
    },
  ).catch((err) => {
    console.error("Error en la solicitud de id de programa:", err);
    throw err;
  });

  if (!response.ok) {
	const errorText = await response.text();
	console.error("Error en la respuesta del servidor:", errorText);
	throw new Error(`Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  idPrograma = data.idPrograma;
  return idPrograma;

}