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

export interface DocumentoCohorte {
  id: number;
  nombre: string;
  obligatorio: boolean;
  idCohorte: number;
}

export interface CohorteCalificacion {
  id: number;
  nombre: string;
  activa: boolean;
  semestre: string;
  cupos: number;
  fechaLimitePago: string;
  fechaLimiteDocs: string;
  fechaLimiteInscripcion: string;
  totalInscritos: number;
  totalPazysalvo: number;
  totalValidados: number;
  totalCalificados: number;
  totalAdmitidos: number;
  documentos: DocumentoCohorte[];
}

export async function getCohortesByPrograma(): Promise<CohorteCalificacion[]> {
  const idPrograma = await getIdPrograma();
  return programaApiFetch<CohorteCalificacion[]>(
    `/api/application/case/director-programa/programa/${idPrograma}/cohortes`
  );
}
