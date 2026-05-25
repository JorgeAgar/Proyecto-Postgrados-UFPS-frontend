import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDaysIcon,
  DocumentCheckIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { fetchProgramaInicioData, type ProgramaInicioData } from '../../services/programa/programaInicioService';

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-semibold text-red-700 whitespace-nowrap">{value}%</span>
      <div className="flex-1 bg-neutral-200 rounded-full h-3">
        <div className="bg-red-700 h-3 rounded-full transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ProgramaInicio() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProgramaInicioData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchProgramaInicioData();
        setData(result);
      } catch (err) {
        console.error(err);
        setError('No fue posible cargar la información del inicio.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const porcentajeValidados = useMemo(() => {
    if (!data) return 0;
    const { totalInscritos, aspirantesValidados } = data.validacion;
    return totalInscritos > 0 ? Math.round((aspirantesValidados / totalInscritos) * 100) : 0;
  }, [data]);

  const porcentajeCalificados = useMemo(() => {
    if (!data) return 0;
    const { totalValidados, aspirantesCalificados } = data.calificacion;
    return totalValidados > 0 ? Math.round((aspirantesCalificados / totalValidados) * 100) : 0;
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-full bg-gray-100 p-8" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-neutral-500">Cargando información del programa...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-full bg-gray-100 p-8" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-200 rounded-lg p-6 text-red-700 flex items-start gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 mt-0.5" />
            <div>{error ?? 'No hay información disponible.'}</div>
          </div>
        </div>
      </div>
    );
  }

  const { cohorteActual, validacion, calificacion } = data;

  return (
    <div className="p-8 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <h1 className="text-xl font-bold text-gray-900">{cohorteActual.nombre}</h1>
          {cohorteActual.activa && (
            <span className="bg-red-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-lg">Activa</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-all animate-fade-in-up delay-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <CalendarDaysIcon className="text-red-700 w-5 h-5" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Fecha límite cargue de documentos</h2>
            </div>
            <div className="text-2xl font-bold text-red-700">{cohorteActual.fechaLimiteDocumentos}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-all animate-fade-in-up delay-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg border border-green-200">
                <CalendarDaysIcon className="text-green-700 w-5 h-5" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Fecha límite pago de inscripción</h2>
            </div>
            <div className="text-2xl font-bold text-red-700">{cohorteActual.fechaLimitePago}</div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 hover:border-gray-300 transition-all animate-fade-in-up delay-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 border border-amber-200 rounded-lg">
              <DocumentCheckIcon className="text-amber-400 w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Validación de documentos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-neutral-400 mb-1">Total inscritos</div>
              <div className="text-xl font-semibold text-gray-900">{validacion.totalInscritos}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Documentos validados</div>
              <div className="text-xl font-semibold text-green-700">{validacion.aspirantesValidados}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Por validar</div>
              <div className="text-xl font-semibold text-yellow-400">
                {Math.max(validacion.totalInscritos - validacion.aspirantesValidados, 0)}
              </div>
            </div>
          </div>

          <ProgressBar value={porcentajeValidados} />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-all animate-fade-in-up delay-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 border border-red-200 rounded-lg">
              <ClipboardDocumentListIcon className="text-red-700 w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Calificación de aspirantes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-neutral-400 mb-1">Aspirantes validados</div>
              <div className="text-xl font-semibold text-gray-900">{calificacion.totalValidados}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Aspirantes calificados</div>
              <div className="text-xl font-semibold text-green-700">{calificacion.aspirantesCalificados}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 mb-1">Por calificar</div>
              <div className="text-xl font-semibold text-yellow-400">
                {Math.max(calificacion.totalValidados - calificacion.aspirantesCalificados, 0)}
              </div>
            </div>
          </div>

          <ProgressBar value={porcentajeCalificados} />
        </div>
      </div>
    </div>
  );
}
