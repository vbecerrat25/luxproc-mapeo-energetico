import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  Award, 
  CreditCard,
  CheckCircle2,
  Layers,
  Calendar,
  Percent,
  Plus,
  Minus,
  Clock,
  ShieldCheck,
  QrCode
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
  
  // Selector de meses interactivo: de 1 a 12 meses
  const [selectedMonths, setSelectedMonths] = useState<number>(1);

  if (!isSubscriptionModalOpen) return null;

  // Escala de descuentos solicitada:
  // A partir de 3 meses (3 a 5 meses): 3% de descuento
  // A partir de 6 meses (6 a 11 meses): 6% de descuento
  // Por 12 meses: 9% de descuento
  const getDiscountPercent = (months: number): number => {
    if (months >= 12) return 9;
    if (months >= 6) return 6;
    if (months >= 3) return 3;
    return 0;
  };

  const calculatePricing = (plan: 'ESTANDAR' | 'PREMIUM', months: number) => {
    const basePrice = plan === 'PREMIUM' ? 50 : 20;
    const subtotal = basePrice * months;
    const discountPct = getDiscountPercent(months);
    const discountAmount = subtotal * (discountPct / 100);
    const total = subtotal - discountAmount;
    return {
      basePrice,
      months,
      subtotal,
      discountPct,
      discountAmount,
      total
    };
  };

  const handleStartUpgrade = (targetPlan: 'ESTANDAR' | 'PREMIUM') => {
    setSelectedPlanToPay(targetPlan);
    setPaymentStep('paying');
  };

  const handleConfirmPayment = () => {
    setSubscriptionPlan(selectedPlanToPay);
    setPaymentStep('success');
    setTimeout(() => {
      setPaymentStep('compare');
      setIsSubscriptionModalOpen(false);
    }, 1600);
  };

  const standardPricing = calculatePricing('ESTANDAR', selectedMonths);
  const premiumPricing = calculatePricing('PREMIUM', selectedMonths);
  const payingPricing = calculatePricing(selectedPlanToPay, selectedMonths);

  // Calcular fecha de vigencia estimada según meses
  const getExpirationDate = (months: number): string => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString(language === 'en' ? 'en-US' : language === 'pt' ? 'pt-BR' : 'es-PE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const tr = (es: string, en: string, pt: string) =>
    language === 'en' ? en : language === 'pt' ? pt : es;

  const standardFeatures = [
    tr('Datos Generales & Tarifas Eléctricas', 'General Data & Electrical Tariffs', 'Dados Gerais & Tarifas Elétricas'),
    tr('Recibos de Consumo vs Censo de Equipos', 'Utility Bills vs Equipment Survey', 'Faturas de Consumo vs Censo de Cargas'),
    tr('Censo de Cargas e Instalación Eléctrica', 'Equipment Survey & Electrical Loads', 'Censo de Equipamentos e Cargas'),
    tr('Tableros y Circuitos bajo Código CNE', 'Electrical Panels & Circuits (CNE / NEC)', 'Quadros e Circuitos conforme Código CNE'),
    tr('Verificación de Cableado, Colores & Llaves (ITM / ID)', 'Wiring Verification, Colors & Breakers (MCB / RCD)', 'Verificação de Cabeamento, Cores & Disjuntores (DR)'),
    tr('Puesta a Tierra (PAT) y Medición Telúrica', 'Grounding System (PAT) & Soil Resistance', 'Aterramento (PAT) e Medição Telúrica'),
    tr('Evidencias Fotográficas de la Inspección', 'Inspection Photo Evidence', 'Evidências Fotográficas da Inspeção'),
    tr('Hasta 2 Trabajos Guardados en Plataforma', 'Up to 2 Saved Projects in Platform', 'Até 2 Projetos Salvos na Plataforma'),
    tr('Informe Oficial Certificado CIP con Firma Pericial', 'Official Certified CIP Report with Stamp & Signature', 'Relatório Oficial Certificado CIP com Assinatura Pericial')
  ];

  const premiumFeatures = [
    tr('Todo lo incluido en el Plan Estándar', 'Everything in Standard Plan', 'Tudo incluído no Plano Padrão'),
    tr('Compensación Factor de Potencia (cos φ) & Banco Condensadores', 'Power Factor Compensation & Capacitor Banks', 'Compensação Fator de Potência (cos φ) & Banco Capacitores'),
    tr('Dimensionamiento & Simulación Solar Fotovoltaica (PV)', 'Solar PV Simulation & Financial Payback', 'Dimensionamento & Simulação Solar Fotovoltaica (PV)'),
    tr('Estudio de Iluminación & Luxometría (RNE EM.010)', 'Lighting & Lux Measurement Study (RNE EM.010)', 'Estudo de Iluminação & Luxometria (RNE EM.010)'),
    tr('Matriz Inteligente de Oportunidades de Ahorro (VAN / TIR)', 'Smart Energy Savings Matrix (NPV / IRR)', 'Matriz Inteligente de Economia Energética (VPL / TIR)'),
    tr('Lista de Materiales (BOM) & Presupuesto Comercial', 'Bill of Materials (BOM) & Costing', 'Lista de Materiais (BOM) & Orçamento Comercial')
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
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-4 sm:py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{t('plan.modal_title', 'Planes de Suscripción E-DIAGNOSIS OS')}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono border border-amber-400/30 uppercase">
                  {tr('1 - 12 Meses', '1 - 12 Months', '1 - 12 Meses')}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                {t('plan.modal_subtitle', 'Elija el plan y la cantidad de meses (1 a 12 meses) con escala oficial de descuentos')}
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

        {/* Contenido Principal */}
        <div className="p-5 sm:p-6 space-y-5">

          {/* ========================================================================= */}
          {/* SELECTOR INTERACTIVO Y PROMINENTE DE MESES (1 A 12 MESES)                 */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-r from-indigo-50/90 via-slate-50 to-amber-50/80 p-4 sm:p-5 rounded-2xl border border-indigo-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>{t('plan.duration_label', 'Periodo de Suscripción (1 a 12 meses):')}</span>
                    <span className="text-indigo-600 font-mono text-sm font-black">
                      {selectedMonths} {selectedMonths === 1 ? t('plan.month_single', 'mes') : t('plan.months_count', 'meses')}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {tr(
                      'Ajuste la duración con los botones o la barra deslizable. Descuentos: 3% (3+ m) · 6% (6+ m) · 9% (12 m)',
                      'Adjust duration with stepper or slider. Discounts: 3% (3+ m) · 6% (6+ m) · 9% (12 m)',
                      'Ajuste a duração com os botões ou barra. Descontos: 3% (3+ m) · 6% (6+ m) · 9% (12 m)'
                    )}
                  </p>
                </div>
              </div>

              {/* Stepper (+ / -) con visualización de meses */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center bg-white border-2 border-indigo-300 rounded-2xl p-1 shadow-xs">
                  <button
                    type="button"
                    disabled={selectedMonths <= 1}
                    onClick={() => setSelectedMonths(prev => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-xl text-slate-700 hover:text-indigo-900 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    title={tr('Disminuir un mes', 'Decrease 1 month', 'Diminuir um mês')}
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <div className="px-3 min-w-[90px] text-center">
                    <span className="block text-sm font-black font-mono text-indigo-950 leading-none">
                      {selectedMonths}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">
                      {selectedMonths === 1 ? t('plan.month_single', 'mes') : t('plan.months_count', 'meses')}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={selectedMonths >= 12}
                    onClick={() => setSelectedMonths(prev => Math.min(12, prev + 1))}
                    className="p-1.5 rounded-xl text-slate-700 hover:text-indigo-900 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    title={tr('Aumentar un mes', 'Increase 1 month', 'Aumentar um mês')}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Slider de 1 a 12 meses */}
            <div className="pt-1">
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={selectedMonths}
                onChange={(e) => setSelectedMonths(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1 px-1 font-mono">
                <span>1 {t('plan.month_single', 'mes')}</span>
                <span>3m (-3%)</span>
                <span>6m (-6%)</span>
                <span>9m (-6%)</span>
                <span>12m (-9%)</span>
              </div>
            </div>

            {/* Acceso Rápido en Botones / Pastillas */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-slate-500 mr-1">
                {tr('Accesos rápidos:', 'Quick shortcuts:', 'Atalhos rápidos:')}
              </span>
              {[
                { m: 1, label: tr('1 mes (S/ base)', '1 month (Base)', '1 mês (Base)') },
                { m: 2, label: tr('2 meses', '2 months', '2 meses') },
                { m: 3, label: tr('3 meses (-3% OFF)', '3 months (-3% OFF)', '3 meses (-3% OFF)') },
                { m: 6, label: tr('6 meses (-6% OFF)', '6 months (-6% OFF)', '6 meses (-6% OFF)') },
                { m: 12, label: tr('12 meses (-9% OFF)', '12 months (-9% OFF)', '12 meses (-9% OFF)') }
              ].map(btn => (
                <button
                  key={btn.m}
                  type="button"
                  onClick={() => setSelectedMonths(btn.m)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    selectedMonths === btn.m
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Notificación de Descuento Activo */}
            {getDiscountPercent(selectedMonths) > 0 && (
              <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  <span>
                    {tr(
                      `¡Descuento oficial del ${getDiscountPercent(selectedMonths)}% aplicado para ${selectedMonths} meses!`,
                      `Official ${getDiscountPercent(selectedMonths)}% loyalty discount applied for ${selectedMonths} months!`,
                      `Desconto oficial de ${getDiscountPercent(selectedMonths)}% aplicado para ${selectedMonths} meses!`
                    )}
                  </span>
                </span>
                <span className="font-mono text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold">
                  {selectedMonths} {selectedMonths === 1 ? t('plan.month_single', 'mes') : t('plan.months_count', 'meses')}
                </span>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* PASO 1: COMPARATIVA DE PLANES (ESTÁNDAR S/ 20 VS PREMIUM S/ 50)            */}
          {/* ========================================================================= */}
          {paymentStep === 'compare' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              {/* PLAN ESTÁNDAR (S/ 20/mes) */}
              <div className={`relative rounded-3xl p-5 sm:p-6 border-2 transition-all flex flex-col justify-between ${
                subscriptionPlan === 'ESTANDAR'
                  ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
              }`}>
                {subscriptionPlan === 'ESTANDAR' && (
                  <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
                    {t('plan.current_active', 'Plan Activo Actual')}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                      {t('plan.standard_title', 'Plan Estándar')}
                    </span>
                    <span className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                      <Layers className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">S/ 20</span>
                    <span className="text-xs font-bold text-slate-500">/ {t('plan.month_single', 'mes')}</span>
                  </div>

                  {/* Resumen de Tiempo y Costo para Estándar */}
                  <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{t('plan.months_to_contract', 'Meses contratados:')}</span>
                      <span className="font-mono text-indigo-700">{selectedMonths} {selectedMonths === 1 ? t('plan.month_single', 'mes') : t('plan.months_count', 'meses')}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px] mt-1">
                      <span>Subtotal ({selectedMonths} x S/ 20):</span>
                      <span className="font-mono">S/ {standardPricing.subtotal.toFixed(2)}</span>
                    </div>
                    {standardPricing.discountPct > 0 && (
                      <div className="flex items-center justify-between text-emerald-700 font-bold text-[11px] mt-0.5">
                        <span>{tr('Descuento', 'Discount', 'Desconto')} (-{standardPricing.discountPct}%):</span>
                        <span className="font-mono">- S/ {standardPricing.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-black text-slate-900 border-t border-slate-200 pt-1.5 mt-1.5">
                      <span>{tr('Total Estándar:', 'Standard Total:', 'Total Padrão:')}</span>
                      <span className="font-mono text-indigo-950 text-sm">S/ {standardPricing.total.toFixed(2)} PEN</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {tr(
                      'Censo de cargas, tableros CNE, verificación de cableado y llaves, puesta a tierra e informe pericial CIP.',
                      'Load survey, CNE panels, wiring & breaker verification, grounding, and official certified CIP report.',
                      'Censo de cargas, quadros CNE, verificação de cabeamento e disjuntores, aterramento e laudo CIP.'
                    )}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      {tr('Incluido en Plan Estándar:', 'Included in Standard Plan:', 'Incluído no Plano Padrão:')}
                    </span>
                    {standardFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleStartUpgrade('ESTANDAR')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      subscriptionPlan === 'ESTANDAR' && selectedMonths === 1
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                    }`}
                  >
                    <span>
                      {subscriptionPlan === 'ESTANDAR' && selectedMonths === 1
                        ? tr('Extender Plan Estándar', 'Extend Standard Plan', 'Estender Plano Padrão')
                        : `${t('plan.activate_standard', 'Activar Plan Estándar')} (${selectedMonths}m · S/ ${standardPricing.total.toFixed(2)})`}
                    </span>
                  </button>
                </div>
              </div>

              {/* PLAN PREMIUM (S/ 50/mes) */}
              <div className={`relative rounded-3xl p-5 sm:p-6 border-2 transition-all flex flex-col justify-between ${
                subscriptionPlan === 'PREMIUM'
                  ? 'border-amber-500 bg-amber-50/20 shadow-md ring-2 ring-amber-500/20'
                  : 'border-amber-400 bg-gradient-to-b from-amber-500/5 to-transparent hover:border-amber-500 shadow-sm'
              }`}>
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{subscriptionPlan === 'PREMIUM' ? t('plan.current_active', 'Plan Activo Actual') : tr('Recomendado CIP', 'CIP Recommended', 'Recomendado CIP')}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                      {t('plan.premium_title', 'Plan Premium')}
                    </span>
                    <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-700">
                      <Zap className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">S/ 50</span>
                    <span className="text-xs font-bold text-slate-500">/ {t('plan.month_single', 'mes')}</span>
                  </div>

                  {/* Resumen de Tiempo y Costo para Premium */}
                  <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-300/80 text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-950">
                      <span>{t('plan.months_to_contract', 'Meses contratados:')}</span>
                      <span className="font-mono text-amber-900">{selectedMonths} {selectedMonths === 1 ? t('plan.month_single', 'mes') : t('plan.months_count', 'meses')}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px] mt-1">
                      <span>Subtotal ({selectedMonths} x S/ 50):</span>
                      <span className="font-mono">S/ {premiumPricing.subtotal.toFixed(2)}</span>
                    </div>
                    {premiumPricing.discountPct > 0 && (
                      <div className="flex items-center justify-between text-emerald-800 font-bold text-[11px] mt-0.5">
                        <span>{tr('Descuento', 'Discount', 'Desconto')} (-{premiumPricing.discountPct}%):</span>
                        <span className="font-mono">- S/ {premiumPricing.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-black text-amber-950 border-t border-amber-300 pt-1.5 mt-1.5">
                      <span>{tr('Total Premium:', 'Premium Total:', 'Total Premium:')}</span>
                      <span className="font-mono text-amber-950 text-sm">S/ {premiumPricing.total.toFixed(2)} PEN</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {tr(
                      'Simulación solar fotovoltaica, banco de condensadores (cos φ), luxometría RNE, BOM y dictamen CIP.',
                      'Solar PV simulation, capacitor bank sizing, lighting study, BOM, and certified CIP audit report.',
                      'Simulação solar fotovoltaica, banco de capacitores (cos φ), estudo luminotécnico, BOM e parecer CIP.'
                    )}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-amber-200">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{tr('Módulos Avanzados Desbloqueados:', 'Advanced Modules Unlocked:', 'Módulos Avançados Desbloqueados:')}</span>
                    </span>
                    {premiumFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className={idx > 0 ? 'font-semibold text-slate-900' : ''}>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => handleStartUpgrade('PREMIUM')}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 shadow-md shadow-amber-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {subscriptionPlan === 'PREMIUM' && selectedMonths === 1
                        ? tr('Extender Plan Premium', 'Extend Premium Plan', 'Estender Plano Premium')
                        : `${t('plan.activate_premium', 'Activar Plan Premium')} (${selectedMonths}m · S/ ${premiumPricing.total.toFixed(2)})`}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 2: PANTALLA DE PAGO & CONFIRMACIÓN CON VISUALIZACIÓN CLARA DE MESES   */}
          {/* ========================================================================= */}
          {paymentStep === 'paying' && (
            <div className="max-w-lg mx-auto py-1 space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  {t('plan.checkout_title', 'Confirmación & Activación de Suscripción')}
                </span>
                <h4 className="text-xl font-black text-slate-900">
                  {selectedPlanToPay === 'PREMIUM' 
                    ? `${t('plan.premium_title', 'Plan Premium')} (S/ 50 / ${t('plan.month_single', 'mes')})`
                    : `${t('plan.standard_title', 'Plan Estándar')} (S/ 20 / ${t('plan.month_single', 'mes')})`}
                </h4>
                <p className="text-xs text-slate-500">
                  {t('plan.checkout_subtitle', 'Verifique la cantidad de meses elegidos, el descuento y el monto final en soles:')}
                </p>
              </div>

              {/* TARJETA DESTACADA: TIEMPO REQUERIDO DE LA PLATAFORMA WEB */}
              <div className="bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-700" />
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        {t('plan.time_required', 'Tiempo de uso de la plataforma web:')}
                      </span>
                      <span className="text-[11px] text-slate-600">
                        {tr('Válido hasta:', 'Valid until:', 'Válido até:')} <strong className="text-indigo-950 font-bold">{getExpirationDate(selectedMonths)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Stepper para cambiar/aumentar meses en el mismo checkout */}
                  <div className="flex items-center bg-white border border-indigo-300 rounded-xl p-0.5 shadow-2xs">
                    <button
                      type="button"
                      disabled={selectedMonths <= 1}
                      onClick={() => setSelectedMonths(prev => Math.max(1, prev - 1))}
                      className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      title={tr('Menos meses', 'Fewer months', 'Menos meses')}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-black text-xs px-2.5 text-indigo-950 font-mono">
                      {selectedMonths} {selectedMonths === 1 ? t('plan.month_single', 'mes') : t('plan.months_count', 'meses')}
                    </span>
                    <button
                      type="button"
                      disabled={selectedMonths >= 12}
                      onClick={() => setSelectedMonths(prev => Math.min(12, prev + 1))}
                      className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      title={tr('Más meses', 'More months', 'Mais meses')}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pastillas de meses rápidos en el checkout */}
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  {[1, 2, 3, 6, 12].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMonths(m)}
                      className={`flex-1 py-1 rounded-lg border text-center transition-all cursor-pointer ${
                        selectedMonths === m
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {m}m {m >= 12 ? '(-9%)' : m >= 6 ? '(-6%)' : m >= 3 ? '(-3%)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Métodos de Pago */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('yape')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'yape'
                      ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-1 ring-purple-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-black text-purple-900">YAPE</span>
                  <span className="text-[10px] text-slate-500">{tr('Billetera Móvil BCP', 'BCP Mobile Wallet', 'Carteira Móvel BCP')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('plin')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'plin'
                      ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-black text-blue-900">PLIN</span>
                  <span className="text-[10px] text-slate-500">Interbank / BBVA / Scotiabank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'tarjeta'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-black text-emerald-900">{tr('Tarjeta Débito / Crédito', 'Debit / Credit Card', 'Cartão Débito / Crédito')}</span>
                  <span className="text-[10px] text-slate-500">Visa / Mastercard / Amex</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transferencia')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'transferencia'
                      ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-black text-amber-900">{tr('Transferencia CIP', 'CIP Bank Transfer', 'Transferência Bancária CIP')}</span>
                  <span className="text-[10px] text-slate-500">{tr('Cuenta Institucional CIP', 'Institutional CIP Account', 'Conta Institucional CIP')}</span>
                </button>
              </div>

              {/* Desglose Completo y Preciso de Pago */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{tr('Plan contratado:', 'Selected plan:', 'Plano selecionado:')}</span>
                  <span className="font-bold text-slate-900">
                    {selectedPlanToPay === 'PREMIUM' ? `${t('plan.premium_title', 'Plan Premium')} (S/ 50)` : `${t('plan.standard_title', 'Plan Estándar')} (S/ 20)`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">{tr('Duración contratada:', 'Contracted duration:', 'Duração contratada:')}</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {selectedMonths} {selectedMonths === 1 ? t('plan.month_single', 'mes') : t('plan.months_count', 'meses')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Subtotal ({selectedMonths}m x S/ {payingPricing.basePrice}):</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    S/ {payingPricing.subtotal.toFixed(2)} PEN
                  </span>
                </div>

                {payingPricing.discountPct > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-bold">
                    <span>{tr('Descuento fidelidad', 'Loyalty discount', 'Desconto fidelidade')} ({payingPricing.discountPct}%):</span>
                    <span className="font-mono">- S/ {payingPricing.discountAmount.toFixed(2)} PEN</span>
                  </div>
                )}

                <div className="flex justify-between items-center font-medium pt-2 border-t border-slate-200 text-sm">
                  <span className="font-black text-slate-900">{t('plan.total_to_pay', 'Monto Total a Activar:')}</span>
                  <span className="font-black text-emerald-700 text-base font-mono">
                    S/ {payingPricing.total.toFixed(2)} PEN
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                  <span>{tr('Equivalente internacional aprox:', 'Approx. international equivalent:', 'Equivalente internacional aprox:')}</span>
                  <span className="font-mono font-medium">${(payingPricing.total / 3.75).toFixed(2)} USD</span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentStep('compare')}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  {t('plan.btn_back', 'Volver a Comparar Planes')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t('plan.btn_confirm', 'Confirmar & Activar Ahora')} ({selectedMonths}m)</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PASO 3: PANTALLA DE ÉXITO                                                 */}
          {/* ========================================================================= */}
          {paymentStep === 'success' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                {t('plan.success_title', '¡Suscripción Activada Exitosamente!')}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {tr(
                  `Su cuenta ha sido actualizada con el ${selectedPlanToPay === 'PREMIUM' ? 'Plan Premium' : 'Plan Estándar'} por ${selectedMonths} mes(es). Todos los módulos están disponibles inmediatamente.`,
                  `Your account has been updated with ${selectedMonths} month(s) of access. All modules are available immediately.`,
                  `Sua conta foi atualizada com ${selectedMonths} mês(es) de acesso. Todos os módulos estão disponíveis imediatamente.`
                )}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
