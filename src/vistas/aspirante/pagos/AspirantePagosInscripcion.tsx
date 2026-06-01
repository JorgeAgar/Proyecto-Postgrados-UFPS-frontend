import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router';
import {
  CreditCardIcon,
  DocumentCurrencyDollarIcon,
  InformationCircleIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { fetchInscripcionResumen, fetchInscripcionCheckout } from '../../../services/aspirante/aspirantePagosInscripcionService';
import type { ResumenPagoResponse, WompiCheckoutResponse, PaymentReceipt } from '../../../services/aspirante/aspirantePagosService';
import type { AspiranteOutletContext } from '../../../layouts/AspiranteLayout';

interface Props {
  aspiranteId: string;
  pagoEstado: 'pendiente' | 'pagado';
  onBack: () => void;
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin shrink-0 ${className ?? 'h-4 w-4 text-red-700'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function EstadoPagoBadge({ estado }: { estado: string }) {
  const norm = estado.trim().toUpperCase();
  const styles: Record<string, string> = {
    COMPLETADO: 'bg-green-100 text-green-700 border border-green-200',
    PAGADO:     'bg-green-100 text-green-700 border border-green-200',
    PENDIENTE:  'bg-yellow-100 text-yellow-700 border border-yellow-200',
  };
  const labels: Record<string, string> = {
    COMPLETADO: 'Completado',
    PAGADO:     'Pagado',
    PENDIENTE:  'Pendiente',
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${styles[norm] ?? 'bg-neutral-200 text-neutral-600 border border-gray-200'}`}>
      {labels[norm] ?? estado}
    </span>
  );
}

export default function AspirantePagosInscripcion({ aspiranteId, pagoEstado, onBack }: Props) {
  const { mostrarAlerta, mostrarConfirm } = useOutletContext<AspiranteOutletContext>();

  const [resumen, setResumen]                   = useState<ResumenPagoResponse | null>(null);
  const [loadingResumen, setLoadingResumen]     = useState(true);
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [loadingCheckout, setLoadingCheckout]   = useState(false);
  const [wompiCheckout, setWompiCheckout]       = useState<WompiCheckoutResponse | null>(null);
  const [miniReceipt, setMiniReceipt]           = useState<PaymentReceipt | null>(null);
  const [downloadingRecibo, setDownloadingRecibo]   = useState(false);
  const [downloadingFactura, setDownloadingFactura] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [cerrandoConfirmar, setCerrandoConfirmar] = useState(false);

  const wompiWidgetRef = useRef<HTMLDivElement | null>(null);

  const pagoCompletado = resumen?.estado?.toUpperCase() === 'COMPLETADO';

  useEffect(() => {
    setLoadingResumen(true);
    fetchInscripcionResumen(aspiranteId)
      .then(setResumen)
      .catch(e => mostrarAlerta(e instanceof Error ? e.message : 'No se pudo cargar el resumen de inscripción.'))
      .finally(() => setLoadingResumen(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspiranteId]);

  useEffect(() => {
    if (!receiptGenerated) return;
    const handle = (event: MessageEvent) => {
      const d = event.data;
      if (d && typeof d === 'object' && typeof d.type === 'string' &&
        (d.type === 'wompi.transaction' || d.type.startsWith('wompi'))) {
        window.location.reload();
      }
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, [receiptGenerated]);

  useEffect(() => {
    if (!receiptGenerated || !wompiWidgetRef.current || pagoCompletado || !wompiCheckout) return;
    const container = wompiWidgetRef.current;
    container.innerHTML = '';
    const script = document.createElement('script');
    script.src = wompiCheckout.widgetScriptUrl;
    script.setAttribute('data-render', 'button');
    script.setAttribute('data-public-key', wompiCheckout.publicKey);
    script.setAttribute('data-currency', wompiCheckout.currency);
    script.setAttribute('data-amount-in-cents', String(wompiCheckout.amountInCents));
    script.setAttribute('data-reference', wompiCheckout.reference);
    script.setAttribute('data-signature:integrity', wompiCheckout.signatureIntegrity);
    if (wompiCheckout.redirectUrl) script.setAttribute('data-redirect-url', wompiCheckout.redirectUrl);
    container.appendChild(script);
    return () => { container.innerHTML = ''; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptGenerated, wompiCheckout]);

  const cerrarConfirmar = () => {
    setCerrandoConfirmar(true);
    setTimeout(() => { setMostrarConfirmar(false); setCerrandoConfirmar(false); }, 170);
  };

  const handleGenerarRecibo = async () => {
    try {
      setLoadingCheckout(true);
      const checkout = await fetchInscripcionCheckout(aspiranteId);
      setWompiCheckout(checkout);
      setMiniReceipt({
        id:       String(checkout.paymentId ?? '0'),
        number:   String(checkout.reference ?? 'N/A'),
        date:     checkout.creationDate ?? new Date().toISOString(),
        dueDate:  checkout.pagoreciboinscripcion?.fechavencimiento ?? undefined,
        amount:   typeof checkout.amount === 'number' ? checkout.amount : Math.round((checkout.amountInCents ?? 0) / 100),
        currency: checkout.currency ?? 'COP',
        pdfUrl:   checkout.pagoreciboinscripcion?.urlrecibo ?? checkout.checkoutUrl ?? undefined,
      });
      setReceiptGenerated(true);
      mostrarConfirm('Recibo generado con éxito.');
    } catch (e) {
      mostrarAlerta(e instanceof Error ? e.message : 'No se pudo generar el recibo de pago.');
    } finally {
      setLoadingCheckout(false);
    }
  };

  const encabezado = (
    <div className="flex items-center gap-3 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-neutral-400 hover:text-red-700 transition-colors"
      >
        <ArrowLeftIcon className="h-[18px] w-[18px] shrink-0" />
      </button>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Pagos</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Gestiona tus pagos de inscripción y matrícula</p>
      </div>
    </div>
  );

  if (loadingResumen || loadingCheckout) {
    return (
      <div className="p-6 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
        <div className="">
          {encabezado}
          <div className="flex items-center justify-center py-20 animate-fade-in">
            <div className="flex items-center gap-3 text-neutral-400 text-sm">
              <Spinner className="h-6 w-6 text-red-700" />
              Cargando información del pago...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const now = new Date();
  const receiptDate = now.toLocaleDateString('es-CO');
  const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO');

  return (
    <div className="p-6 bg-gray-100 min-h-full" style={{ fontFamily: 'Segoe UI, sans-serif' }}>
      <div className="space-y-6">
        {encabezado}

        {/* Información */}
        {resumen && (
          <div className="space-y-2 animate-fade-in-up delay-200">
            <h3 className="flex text-sm font-semibold text-gray-900 gap-2 items-center">
              <DocumentTextIcon className="w-5 h-5" /> Información de la Inscripción
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-start gap-3">
                  <AcademicCapIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div><p className="text-xs text-neutral-400">Programa</p><p className="text-sm font-medium text-gray-900 mt-0.5">{resumen.programa}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div><p className="text-xs text-neutral-400">Facultad</p><p className="text-sm font-medium text-gray-900 mt-0.5">{resumen.facultad}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div><p className="text-xs text-neutral-400">Periodo</p><p className="text-sm font-medium text-gray-900 mt-0.5">{resumen.periodo}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <TagIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div><p className="text-xs text-neutral-400">Tipo</p><p className="text-sm font-medium text-gray-900 mt-0.5">{resumen.tipo}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div><p className="text-xs text-neutral-400">Aspirante</p><p className="text-sm font-medium text-gray-900 mt-0.5">{resumen.aspirante}</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div><p className="text-xs text-neutral-400">Valor</p><p className="text-lg font-bold text-red-700 mt-0.5">${resumen.valor.toLocaleString('es-CO')} COP</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <IdentificationIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                  <div><p className="text-xs text-neutral-400">Documento</p><p className="text-sm font-medium text-gray-900 mt-0.5">{resumen.documento}</p></div>
                </div>
                {resumen.estado && (
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-red-700 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-neutral-400">Estado</p><div className="mt-1"><EstadoPagoBadge estado={resumen.estado} /></div></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pago completado */}
        {pagoCompletado && resumen && (
          <div className="flex justify-center animate-fade-in-up delay-300">
            <div className="w-full max-w-md space-y-2">
              <h3 className="flex text-sm font-semibold text-gray-900 gap-2 items-center">
                <DocumentCurrencyDollarIcon className="w-5 h-5" /> Estado del Pago
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg shrink-0">
                    <CheckCircleIcon className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-700">Pago realizado</p>
                    <p className="text-sm text-green-600">El pago ha sido procesado exitosamente.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {resumen.urlrecibo && (
                    <button
                      onClick={() => { setDownloadingRecibo(true); window.open(resumen.urlrecibo!, '_blank'); setTimeout(() => setDownloadingRecibo(false), 800); }}
                      disabled={downloadingRecibo}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-700 text-white font-semibold text-sm rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingRecibo ? <><Spinner className="text-white" /> Descargando...</> : <><ArrowDownTrayIcon className="w-4 h-4 shrink-0" /> Descargar Recibo</>}
                    </button>
                  )}
                  {resumen.urlfactura && (
                    <button
                      onClick={() => { setDownloadingFactura(true); window.open(resumen.urlfactura!, '_blank'); setTimeout(() => setDownloadingFactura(false), 800); }}
                      disabled={downloadingFactura}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 border border-green-200 text-green-700 font-semibold text-sm rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingFactura ? <><Spinner className="text-green-700" /> Descargando...</> : <><DocumentTextIcon className="w-4 h-4 shrink-0" /> Descargar Factura</>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generar recibo */}
        {!pagoCompletado && (
          <div className="space-y-2 animate-fade-in-up delay-300">
            <h3 className="flex text-sm font-semibold text-gray-900 gap-2 items-center">
              <DocumentCurrencyDollarIcon className="w-5 h-5" /> Generar Recibo de Pago
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center space-y-3">
              <p className="text-sm text-neutral-400">Genera tu recibo de pago para continuar con la inscripción.</p>
              <button
                onClick={() => setMostrarConfirmar(true)}
                disabled={receiptGenerated || loadingCheckout}
                className={`font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 w-full transition ${receiptGenerated ? 'bg-green-700 text-white cursor-not-allowed' : 'bg-red-700 text-white hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed'}`}
              >
                {receiptGenerated ? <><CheckCircleIcon className="w-5 h-5" /> Recibo Generado</>
                  : loadingCheckout ? <><Spinner className="text-white" /> Generando recibo...</>
                  : <><DocumentCurrencyDollarIcon className="w-5 h-5" /> Generar Recibo de Pago</>}
              </button>
            </div>
          </div>
        )}

        {/* Recibo + Wompi */}
        {receiptGenerated && !pagoCompletado && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6 animate-fade-in-up">
            <div className="grid md:grid-cols-2 gap-6">
              <div className={`border-2 border-dashed rounded-lg p-5 space-y-4 ${pagoEstado === 'pagado' ? 'border-green-300' : 'border-gray-300'}`}>
                <div className="flex justify-between border-b-2 border-dashed border-gray-300 pb-3">
                  <div>
                    <h4 className="font-bold text-base text-gray-900">Inscripción</h4>
                    <p className={`font-semibold text-sm mt-0.5 ${pagoEstado === 'pagado' ? 'text-green-700' : 'text-red-700'}`}>N° {miniReceipt?.number ?? '—'}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1 text-neutral-400 shrink-0"><AcademicCapIcon className="w-4 h-4" /> Programa</span>
                    <span className="font-medium text-gray-900 text-right text-xs">{resumen?.programa ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1 text-neutral-400 shrink-0"><UserIcon className="w-4 h-4" /> Aspirante</span>
                    <span className="font-medium text-gray-900 text-right text-xs">{resumen?.aspirante ?? '—'}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1 text-neutral-400 shrink-0"><CalendarIcon className="w-4 h-4" /> Fecha generación</span>
                    <span className="font-medium text-gray-900 text-right text-xs">{miniReceipt ? new Date(miniReceipt.date).toLocaleDateString('es-CO') : receiptDate}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1 text-neutral-400 shrink-0"><CalendarIcon className="w-4 h-4" /> Vencimiento</span>
                    <span className="font-medium text-gray-900 text-right text-xs">{miniReceipt?.dueDate ? new Date(miniReceipt.dueDate).toLocaleDateString('es-CO') : dueDate}</span>
                  </div>
                </div>
                <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-3">
                  <p className="font-bold text-sm text-gray-900">VALOR A PAGAR:</p>
                  <p className={`font-bold flex items-center gap-1 ${pagoEstado === 'pagado' ? 'text-green-700' : 'text-red-700'}`}>
                    <CurrencyDollarIcon className="w-4 h-4 shrink-0" />
                    ${(miniReceipt?.amount ?? resumen?.valor ?? 0).toLocaleString('es-CO')} {miniReceipt?.currency ?? 'COP'}
                  </p>
                </div>
                <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-3">
                  <p className="font-bold text-sm text-gray-900">ESTADO:</p>
                  {pagoEstado === 'pagado'
                    ? <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200"><CheckCircleIcon className="w-3.5 h-3.5" /> Pagado</span>
                    : <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-yellow-200"><InformationCircleIcon className="w-3.5 h-3.5" /> Pendiente</span>}
                </div>
              </div>

              <div className="space-y-4">
                {resumen && (
                  <div className="bg-white rounded-lg border border-gray-200 p-5 text-center space-y-3">
                    <h4 className="font-semibold flex items-center justify-center gap-2 text-gray-900 text-sm"><PrinterIcon className="w-4 h-4 text-red-700" /> Descargar / Imprimir</h4>
                    <p className="text-xs text-neutral-400">Descarga tu recibo en formato PDF</p>
                    <button
                      onClick={() => { const url = resumen.urlrecibo ?? miniReceipt?.pdfUrl ?? wompiCheckout?.checkoutUrl; if (!url) return; setDownloadingRecibo(true); window.open(url, '_blank'); setTimeout(() => setDownloadingRecibo(false), 800); }}
                      disabled={downloadingRecibo || !(resumen.urlrecibo ?? miniReceipt?.pdfUrl ?? wompiCheckout?.checkoutUrl)}
                      className="font-semibold text-sm text-red-700 border border-red-200 bg-white flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingRecibo ? <><Spinner /> Preparando descarga...</> : <><ArrowDownTrayIcon className="w-4 h-4 shrink-0" /> Descargar Recibo</>}
                    </button>
                    {resumen.urlfactura && (
                      <button
                        onClick={() => { setDownloadingFactura(true); window.open(resumen.urlfactura!, '_blank'); setTimeout(() => setDownloadingFactura(false), 800); }}
                        disabled={downloadingFactura}
                        className="font-semibold text-sm text-red-700 border border-red-200 bg-white flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingFactura ? <><Spinner /> Preparando descarga...</> : <><DocumentTextIcon className="w-4 h-4 shrink-0" /> Descargar Factura</>}
                      </button>
                    )}
                  </div>
                )}
                <div className="bg-white rounded-lg border border-gray-200 p-5 text-center space-y-3">
                  <h4 className="font-semibold flex items-center justify-center gap-2 text-gray-900 text-sm"><CreditCardIcon className="w-4 h-4 text-red-700" /> Pagar en Línea</h4>
                  <p className="text-xs text-neutral-400">Realiza el pago de forma segura</p>
                  {pagoEstado === 'pagado'
                    ? <div className="font-semibold flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-green-700 text-white text-sm"><CheckCircleIcon className="w-4 h-4 shrink-0" /> Pagado</div>
                    : <form><div ref={wompiWidgetRef} /></form>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal confirmar recibo */}
      {mostrarConfirmar && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${cerrandoConfirmar ? 'animate-overlay-out' : 'animate-overlay-in'}`}>
          <div className={`bg-white rounded-lg border border-gray-200 shadow-xl max-w-md w-full mx-4 ${cerrandoConfirmar ? 'animate-modal-out' : 'animate-modal-in'}`}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Confirmar generación de recibo</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700">¿Deseas generar el recibo de pago para <strong>la inscripción</strong>?</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button onClick={cerrarConfirmar} disabled={loadingCheckout} className="px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium disabled:opacity-60">
                Cancelar
              </button>
              <button
                onClick={() => { cerrarConfirmar(); handleGenerarRecibo(); }}
                disabled={loadingCheckout}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingCheckout ? <><Spinner className="text-white" /> Generando...</> : 'Sí, generar recibo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
