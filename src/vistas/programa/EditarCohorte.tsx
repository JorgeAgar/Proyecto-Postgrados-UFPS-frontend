import { useEffect, useState } from "react";
import { useParams } from "react-router";
import CohorteForm from "./CohorteForm";
import { programaApiFetch } from "../../services/programaService";

export default function EditarCohorte() {
  const { id } = useParams();
  const [initial, setInitial] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Prefer GET-by-id endpoint if available. Fallback to list and find.
        const list = await programaApiFetch('/api/dev/endpoint/ofertaacademica/list').catch(() => programaApiFetch('/api/dev/endpoint/ofertaacademica/listall'));
        const arr = Array.isArray(list) ? list : (list && (list as any).data ? (list as any).data : []);
        const oferta = arr.find((o: any) => String(o.id ?? o._id) === String(id));
        if (!oferta) {
          setInitial(null);
          return;
        }

        const map = {
          encuentros: oferta.encuentros ?? oferta.encuentro ?? '',
          cupos: oferta.cupos ?? oferta.capacity ?? 0,
          idPrograma: oferta.idPrograma ?? oferta.programaId ?? oferta.programa?.id ?? oferta.programa?._id,
          idModalidad: oferta.idModalidad ?? oferta.modalidad?.id ?? oferta.modalidad?._id,
          idJornada: oferta.idJornada ?? oferta.jornada?.id ?? oferta.jornada?._id,
          idCohorte: oferta.idCohorte ?? oferta.cohorte?.id ?? oferta.cohorte?._id,
          idPlazo: oferta.plazo?.id ?? oferta.plazo?.idTipoplazo ?? oferta.plazo?.idTipo ?? null,
          fechainicio: oferta.plazo?.fechainicio ?? oferta.fechaInicio ?? oferta.fechainicio ?? '',
          fechafin: oferta.plazo?.fechafin ?? oferta.fechaFin ?? oferta.fechafin ?? '',
          ofertaId: oferta.id ?? oferta._id,
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

  return <CohorteForm key={initial?.ofertaId ?? initial?.id ?? id} mode="edit" initial={initial} />;
}
