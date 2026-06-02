import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import {
  DocumentCurrencyDollarIcon,
  CheckCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { fetchPayments } from '../../../services/aspirante/aspirantePagosService';
import { getAspiranteRealId } from '../../../services/aspirante/aspiranteService';
import type { PaymentSummary } from '../../../services/aspirante/aspirantePagosService';
import type { AspiranteOutletContext } from '../../../layouts/AspiranteLayout';
import AspirantePagosInscripcion from './AspirantePagosInscripcion';
import AspirantePagosMatricula from './AspirantePagosMatricula';

interface PaymentItem extends PaymentSummary {
  icon: 'document' | 'lock';
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin shrink-0 ${className ?? 'h-4 w-4 text-red-700'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function AspirantePagos() {
  const { mostrarAlerta, admitido } = useOutletContext<AspiranteOutletContext>();

  const [aspiranteId, setAspiranteId]         = useState<string>('');
  const [payments, setPayments]               = useState<PaymentItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedId, setSelectedId]           = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const id = await getAspiranteRealId();
        setAspiranteId(String(id));
      } catch (e) {
        mostrarAlerta(e instanceof Error ? e.message : 'No se pudo obtener los datos del aspirante.');
        setLoadingPayments(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!aspiranteId) return;
    setLoadingPayments(true);
    (async () => {
      try {
        const pagos = await fetchPayments(aspiranteId);
        setPayments(pagos.map(p => ({ ...p, icon: 'document' as const })));
      } catch (e) {
        mostrarAlerta(e instanceof Error ? e.message : 'No se pudieron cargar los pagos.');
        setPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspiranteId]);

  // Matrícula bloqueada hasta que el aspirante tenga estado ADMITIDO (Resultado completado)
  const paymentsConBloqueo = payments.map(p =>
    p.title === 'Matrícula' ? { ...p, enabled: admitido === true } : p
  );

  const selectedPayment = paymentsConBloqueo.find(p => p.id === selectedId) ?? null;

  // ── Renderizar sub-vista según el pago seleccionado ────────────────────────

  if (selectedPayment?.title === 'Inscripción') {
    return (
      <AspirantePagosInscripcion
        aspiranteId={aspiranteId}
        pagoEstado={selectedPayment.estado}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  if (selectedPayment?.title === 'Matrícula') {
    return (
      <AspirantePagosMatricula
        aspiranteId={aspiranteId}
        pagoEstado={selectedPayment.estado}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  // ── Lista de pagos ─────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="">

        <div className="mb-6 animate-fade-in">
          <h1 className="text-xl font-bold text-gray-900">Pagos</h1>
          <p className="text-sm text-neutral-400 mt-1">Gestiona tus pagos de inscripción y matrícula</p>
        </div>

        {loadingPayments ? (
          <div className="flex items-center justify-center py-20 animate-fade-in">
            <div className="flex items-center gap-3 text-neutral-400 text-sm">
              <Spinner className="h-6 w-6 text-red-700" />
              Cargando pagos...
            </div>
          </div>
        ) : paymentsConBloqueo.length === 0 ? (
          <div className="flex items-center justify-center py-20 animate-fade-in">
            <p className="text-sm text-neutral-400">No hay pagos disponibles para mostrar.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {paymentsConBloqueo.map((payment, i) => (
            <button
              key={payment.id}
              onClick={() => payment.enabled && setSelectedId(payment.id)}
              disabled={!payment.enabled}
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
              className={`text-left rounded-lg animate-fade-in-up ${payment.enabled ? 'hover:shadow-sm transition-shadow' : 'cursor-not-allowed opacity-60'}`}
            >
              <div className={`rounded-lg border p-6 h-full transition-colors ${payment.estado === 'pagado' ? 'bg-green-50 border-green-200' : payment.enabled ? 'bg-white border-gray-200 hover:border-gray-300' : 'bg-white border-gray-200'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${payment.estado === 'pagado' ? 'bg-green-100' : payment.enabled ? 'bg-yellow-100' : 'bg-neutral-200'}`}>
                      {payment.icon === 'document' ? (
                        <DocumentCurrencyDollarIcon className={`w-6 h-6 ${payment.estado === 'pagado' ? 'text-green-700' : payment.enabled ? 'text-yellow-500' : 'text-neutral-400'}`} />
                      ) : (
                        <LockClosedIcon className={`w-6 h-6 ${payment.estado === 'pagado' ? 'text-green-700' : 'text-neutral-400'}`} />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${payment.estado === 'pagado' ? 'text-green-700' : payment.enabled ? 'text-gray-900' : 'text-neutral-400'}`}>
                        {payment.title}
                      </h3>
                      {payment.description && <p className="text-sm text-neutral-400">{payment.description}</p>}
                    </div>
                  </div>
                  {payment.estado === 'pagado' && (
                    <div className="shrink-0 bg-green-100 rounded-full p-1.5">
                      <CheckCircleIcon className="w-5 h-5 text-green-700" />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-neutral-400 mb-0.5">Valor</p>
                    <p className={`text-xl font-bold ${payment.estado === 'pagado' ? 'text-green-700' : payment.enabled ? 'text-red-700' : 'text-neutral-400'}`}>
                      ${payment.valor.toLocaleString('es-CO')} COP
                    </p>
                  </div>
                  <div className="shrink-0">
                    {payment.estado === 'pagado'
                      ? <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">Pagado</span>
                      : !payment.enabled
                        ? <span className="inline-block bg-neutral-200 text-neutral-600 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200">Bloqueado</span>
                        : <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-200">Pendiente</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        )}

      </div>
    </div>
  );
}
