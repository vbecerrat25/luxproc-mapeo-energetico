import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Award, 
  ArrowRight, 
  CreditCard,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';

export const SubscriptionModal: React.FC = () => {
  const { 
    isSubscriptionModalOpen, 
    setIsSubscriptionModalOpen, 
    subscriptionPlan, 
    setSubscriptionPlan 
  } = useDiagnostic();
  const { t, language } = useLanguage();

  const [paymentStep, setPaymentStep] = useState<'compare' | 'paying' | 'success'>('compare');
  const [selectedPlanToPay, setSelectedPlanToPay] = useState<'ESTANDAR' | 'PREMIUM'>('PREMIUM');
  const [paymentMethod, setPaymentMethod] = useState<'yape' | 'plin' | 'tarjeta' | 'transferencia'>('yape');

  if (!isSubscriptionModalOpen) return null;

  const handleStartUpgrade = (targetPlan: 'ESTANDAR' | 'PREMIUM') => {
    if (targetPlan === subscriptionPlan) return;
    setSelectedPlanToPay(targetPlan);
    setPaymentStep('paying');
  };

  const handleConfirmPayment = () => {
    setSubscriptionPlan(selectedPlanToPay);
    setPaymentStep('success');
    setTimeout(() => {
      setPaymentStep('compare');
      setIsSubscriptionModalOpen(false);
    }, 1500);
  };

  const standardFeatures = [
    language === 'es' ? 'Datos Generales & Tarifas Eléctricas' : 'General Data & Electrical Tariffs',
    language === 'es' ? 'Recibos de Consumo vs Censo de Equipos' : 'Utility Bills vs Equipment Survey',
    language === 'es' ? 'Censo de Cargas e Instalación Eléctrica' : 'Equipment Survey & Electrical Loads',
    language === 'es' ? 'Tableros y Circuitos bajo Código CNE' : 'Electrical Panels & Circuits (CNE / NEC)',
    language === 'es' ? 'Puesta a Tierra (PAT) y Medición Telúrica' : 'Grounding System (PAT) & Soil Resistance',
    language === 'es' ? 'Evidencias Fotográficas de la Auditoría' : 'Photo Evidence Records',
    language === 'es' ? 'Hasta 2 Proyectos Guardados en Trabajos Realizados' : 'Up to 2 Saved Projects in Completed Works',
    language === 'es' ? 'Informe Técnico Preliminar CNE' : 'Preliminary CNE Technical Report'
  ];

  const premiumFeatures = [
    language === 'es' ? 'Todo lo incluido en el Plan Estándar' : 'Everything in Standard Plan',
    language === 'es' ? 'Compensación de Factor de Potencia (cos φ) & Condensadores' : 'Power Factor Compensation & Capacitor Banks',
    language === 'es' ? 'Dimensionamiento y Simulación Solar Fotovoltaica (PV)' : 'Solar PV Dimensioning & Financial Payback Simulation',
    language === 'es' ? 'Estudio de Iluminación y Luxometría según RNE EM.010' : 'Lighting & Lux Measurement Study (RNE EM.010)',
    language === 'es' ? 'Matriz Inteligente de Oportunidades de Ahorro' : 'Energy Savings Opportunities Matrix',
    language === 'es' ? 'Lista de Materiales (BOM) & Presupuesto Comercial' : 'Bill of Materials (BOM) & Commercial Costing',
    language === 'es' ? 'Informe Pericial Certificado CIP Completo con Firma Digital' : 'Full CIP Certified Pericial Report with Digital Signatures',
    language === 'es' ? 'Exportación Avanzada Excel (.xlsx) y Descarga PDF Directa' : 'Advanced Excel (.xlsx) & PDF Document Export'
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setIsSubscriptionModalOpen(false)}
    >
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white">
                {t('plan.modal_title', 'Planes de Suscripción E-DIAGNOSIS OS')}
              </h3>
              <p className="text-xs text-slate-300">
                {t('plan.modal_subtitle', 'Elija el plan adecuado para su ejercicio profesional según el Colegio de Ingenieros del Perú (CIP)')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSubscriptionModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {paymentStep === 'compare' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* PLAN ESTÁNDAR (S/ 30) */}
              <div className={`relative rounded-3xl p-6 border-2 transition-all flex flex-col justify-between ${
                subscriptionPlan === 'ESTANDAR'
                  ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                {subscriptionPlan === 'ESTANDAR' && (
                  <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
                    {t('plan.current_active', 'Plan Activo')}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      {t('plan.standard_title', 'Plan Estándar')}
                    </span>
                    <span className="p-1 rounded-lg bg-slate-100 text-slate-700">
                      <Layers className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-black text-slate-900">S/ 30</span>
                    <span className="text-xs font-semibold text-slate-500">/ {language === 'es' ? 'mes' : 'month'}</span>
                  </div>

                  <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                    {language === 'es'
                      ? 'Ideal para diagnósticos periciales básicos, censo de cargas de baja tensión y tableros bajo normativa CNE.'
                      : 'Ideal for basic electrical audits, low voltage load census and panels under CNE / NEC regulations.'}
                  </p>

                  <div className="space-y-2.5 pt-2 border-t border-slate-200/80">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      {language === 'es' ? 'Módulos Habilitados:' : 'Included Modules:'}
                    </span>
                    {standardFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    disabled={subscriptionPlan === 'ESTANDAR'}
                    onClick={() => handleStartUpgrade('ESTANDAR')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      subscriptionPlan === 'ESTANDAR'
                        ? 'bg-slate-200 text-slate-500 cursor-default'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    {subscriptionPlan === 'ESTANDAR' ? '✓ Plan en Uso' : t('plan.activate_standard', 'Cambiar a Plan Estándar (S/ 30)')}
                  </button>
                </div>
              </div>

              {/* PLAN PREMIUM (S/ 60) */}
              <div className={`relative rounded-3xl p-6 border-2 transition-all flex flex-col justify-between ${
                subscriptionPlan === 'PREMIUM'
                  ? 'border-amber-500 bg-amber-50/20 shadow-md ring-2 ring-amber-500/20'
                  : 'border-amber-400 bg-gradient-to-b from-amber-500/5 to-transparent hover:border-amber-500 shadow-sm'
              }`}>
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{subscriptionPlan === 'PREMIUM' ? t('plan.current_active', 'Plan Activo') : 'Recomendado CIP'}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                      {t('plan.premium_title', 'Plan Premium')}
                    </span>
                    <span className="p-1 rounded-lg bg-amber-500/20 text-amber-700">
                      <Zap className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-black text-slate-900">S/ 60</span>
                    <span className="text-xs font-semibold text-slate-500">/ {language === 'es' ? 'mes' : 'month'}</span>
                  </div>

                  <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                    {language === 'es'
                      ? 'Solución pericial completa con simulación solar fotovoltaica, banco de condensadores, luxometría, BOM e informe oficial certificado.'
                      : 'Full engineering solution with solar PV simulation, capacitor bank sizing, lighting lux study, BOM and certified CIP report.'}
                  </p>

                  <div className="space-y-2.5 pt-2 border-t border-amber-200/80">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{language === 'es' ? 'Módulos Avanzados 100% Desbloqueados:' : 'Advanced Modules 100% Unlocked:'}</span>
                    </span>
                    {premiumFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className={idx > 0 ? 'font-semibold text-slate-900' : ''}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-amber-200">
                  <button
                    type="button"
                    disabled={subscriptionPlan === 'PREMIUM'}
                    onClick={() => handleStartUpgrade('PREMIUM')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      subscriptionPlan === 'PREMIUM'
                        ? 'bg-amber-100 text-amber-800 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 shadow-md shadow-amber-500/20'
                    }`}
                  >
                    {subscriptionPlan === 'PREMIUM' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>✓ Plan Premium Activo</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{t('plan.activate_premium', 'Activar Plan Premium (S/ 60)')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

          {paymentStep === 'paying' && (
            <div className="max-w-md mx-auto py-4 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  {language === 'es' ? 'Confirmación de Suscripción' : 'Subscription Confirmation'}
                </span>
                <h4 className="text-lg font-black text-slate-900">
                  {selectedPlanToPay === 'PREMIUM' ? 'Plan Premium (S/ 60 / mes)' : 'Plan Estándar (S/ 30 / mes)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'es'
                    ? 'Seleccione su método de activación inmediata para habilitar los módulos en su cuenta'
                    : 'Select your immediate activation method to enable modules on your account'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('yape')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'yape'
                      ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-black">YAPE</span>
                  <span className="text-[10px] text-slate-500">Billetera móvil</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('plin')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'plin'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-black">PLIN</span>
                  <span className="text-[10px] text-slate-500">Billetera digital</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'tarjeta'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-black">Tarjeta Débito / Crédito</span>
                  <span className="text-[10px] text-slate-500">Visa / Mastercard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transferencia')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'transferencia'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-black">Transferencia CIP</span>
                  <span className="text-[10px] text-slate-500">BCP / BBVA / Interbank</span>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Monto Total a Activar:</span>
                  <span className="font-bold text-slate-900">
                    {selectedPlanToPay === 'PREMIUM' ? 'S/ 60.00 PEN' : 'S/ 30.00 PEN'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Facturación:</span>
                  <span>Mensual recurrente · Sin permanencia</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentStep('compare')}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Volver a Planes
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Confirmar & Activar Ahora</span>
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                {language === 'es' ? '¡Plan Activado con Éxito!' : 'Plan Successfully Activated!'}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {language === 'es'
                  ? 'Su cuenta ha sido actualizada. Todos los módulos y funciones seleccionadas están disponibles inmediatamente.'
                  : 'Your account has been updated. All selected modules and functions are now available immediately.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
