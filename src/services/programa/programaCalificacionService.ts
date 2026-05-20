import { programaApiFetch } from "./programaService";

const SESSION_KEY = "ufps_programa_session";

let cachedIdPrograma: number | null = null;

async function getIdPrograma(): Promise<number> {
  if (cachedIdPrograma !== null) return cachedIdPrograma;

  const sessionRaw = localStorage.getItem(SESSION_KEY);
  const session = sessionRaw ? (JSON.parse(sessionRaw) as Record<string, unknown>) : null;
  const idUsuario = session?.userId;
  if (!idUsuario) throw new Error("No se encontró el idUsuario en la sesión. Inicia sesión de nuevo.");

  const resp = await programaApiFetch<unknown>(
    `/api/application/case/director-programa/programa/director/${idUsuario}`,
    { method: "GET" }
  );

  let id: number | undefined;
  if (typeof resp === "number") {
    id = resp;
  } else {
    const obj = resp as Record<string, unknown>;
    id = (obj["programaId"] ?? obj["idPrograma"] ?? obj["id"]) as number | undefined;
  }

  if (!id) throw new Error("No se pudo obtener el id del programa desde el servidor.");
  cachedIdPrograma = id;
  return cachedIdPrograma;
}

export interface AspiranteCalificacion {
  id: number;
  nombreCompleto: string;
  idEstado: number;
  correo: string;
  puntajeTotal: number;
}

export async function getAspirantes(): Promise<AspiranteCalificacion[]> {
  const idPrograma = await getIdPrograma();
  return programaApiFetch<AspiranteCalificacion[]>(
    `/api/application/case/director-programa/calificacion/listado?programaId=${idPrograma}`
  );
}

export async function getCountValidados(): Promise<number> {
  const idPrograma = await getIdPrograma();
  return programaApiFetch<number>(
    `/api/application/case/director-programa/calificacion/count/validados?programaId=${idPrograma}`
  );
}

export async function getCountPorCalificar(): Promise<number> {
  const idPrograma = await getIdPrograma();
  return programaApiFetch<number>(
    `/api/application/case/director-programa/calificacion/count/por-calificar?programaId=${idPrograma}`
  );
}

export async function getCountCalificados(): Promise<number> {
  const idPrograma = await getIdPrograma();
  return programaApiFetch<number>(
    `/api/application/case/director-programa/calificacion/count/calificados?programaId=${idPrograma}`
  );
}
