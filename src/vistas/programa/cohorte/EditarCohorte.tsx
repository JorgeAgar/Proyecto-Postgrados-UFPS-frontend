import { useEffect, useState } from "react";
import { useParams } from "react-router";
import CohorteForm from "./CohorteForm";
import { fetchCohorteDetalle, type CohorteDetalle } from "../../../services/programa/programaChortesService";

export default function EditarCohorte() {
  const { id } = useParams();
  const [initial, setInitial] = useState<{
    cohorteId: string;
    cupos?: number;
    fechaInicio?: string;
    fechaLimiteDocumentos?: string;
    fechaLimitePago?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!id) {
          setInitial(null);
          return;
        }

        const detail: CohorteDetalle = await fetchCohorteDetalle(String(id));
        const map = {
          cohorteId: String(detail.id),
          nombre: detail.nombre,
          cupos: detail.cupos,
          fechaInicio: detail.fechaInicio ?? '',
          fechaLimiteDocumentos: detail.fechaLimiteDocs || detail.fechaLimiteDocumentos || '',
          fechaLimitePago: detail.fechaLimiteInscripcion || detail.fechaLimitePago || '',
        };

        if (mounted) setInitial(map);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-6">Cargando cohorte...</div>;
  if (!initial) return <div className="p-6">Cohorte no encontrada.</div>;

  return <CohorteForm key={initial?.cohorteId ?? id} mode="edit" initial={initial} />;
}
