import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { 
  Zap, 
  TrendingDown, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Building2, 
  Layers,
  ChevronRight,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { evaluatePeruvianTariffs, TariffComparisonItem } from '../../engine/calculosTarifas';

interface TariffRecommendationCardProps {
  compact?: boolean;
}

export const TariffRecommendationCard: React.FC<TariffRecommendationCardProps> = ({ compact = false }) => {
  const { diagnostic, updateTariff, equipmentSummary, demandBalance } = useDiagnostic();
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [selectedTariffForDetails, setSelectedTariffForDetails] = useState<TariffComparisonItem | null>(null);
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'BT' | 'MT' | 'LIBRE'>('ALL');

  const evaluation = evaluatePeruvianTariffs(
    diagnostic,
    equipmentSummary.totalMonthlyKwh,
    demandBalance.estimatedMaxDemandKw
  );

  const handleApplyTariff = (tariffCode: string) => {
    const tariffMap: Record<string, { price: number; fixed: number }> = {
      'BT5B': { price: 0.745, fixed: 4.80 },
      'BT5A': { price: 0.650, fixed: 5.60 },
      'BT2':  { price: 0.520, fixed: 9.20 },
      'BT3':  { price: 0.420, fixed: 8.90 },
      'BT4':  { price: 0.440, fixed: 9.50 },
      'BT6':  { price: 0.710, fixed: 3.90 },
      'MT2':  { price: 0.340, fixed: 16.50 },
      'MT3':  { price: 0.360, fixed: 14.50 },
      'MT4':  { price: 0.350, fixed: 15.80 },
      'LIBRE': { price: 0.327, fixed: 25.00 }
    };

    const tConfig = tariffMap[tariffCode] || { price: 0.75, fixed: 5.0 };

    updateTariff({
      tariffCode,
      activeEnergyPriceKwh: tConfig.price,
      fixedMonthlyChargeSoles: tConfig.fixed
    });

    setAppliedFeedback(`¡Tarifa ${tariffCode} aplicada al proyecto con éxito! Los costos y proyecciones se han recalculado.`);
    setTimeout(() => {
      setAppliedFeedback(null);
    }, 4000);
  };

  if (compact) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-white to-indigo-50/30 p-4 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Optimización Tarifaria OSINERGMIN</div>
              <div className="text-[11px] text-slate-500">Tarifa actual: <span className="font-semibold font-mono text-slate-700">{diagnostic.tariff.tariffCode}</span></div>
            </div>
          </div>
          {evaluation.isMigrationRecommended ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 animate-pulse">
              <TrendingDown className="h-3 w-3" /> Ahorro {evaluation.percentageSavings}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Tarifa Óptima
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 mb-3">
          {evaluation.primaryExplanation}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ahorro Anual Estimado</div>
            <div className="text-sm font-black text-emerald-600 font-mono">
              S/. {evaluation.annualSavingsSoles.toLocaleString('es-PE', { maximumFractionDigits: 0 })}/año
            </div>
          </div>
          <button
            onClick={() => setShowDetailedModal(true)}
            className="flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            <span>Ver Análisis Completo</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Modal when triggered from compact */}
        {showDetailedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Estudio Comparativo y Recomendación Tarifaria</h3>
                    <p className="text-xs text-slate-500">Regulación tarifaria OSINERGMIN / Ley de Concesiones Eléctricas del Perú</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailedModal(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              {appliedFeedback && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{appliedFeedback}</span>
                </div>
              )}

              <TariffRecommendationCard compact={false} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert banner if migration is recommended */}
      {evaluation.isMigrationRecommended ? (
        <div className="rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50 via-teal-50 to-indigo-50 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                    Recomendación de Alto Impacto
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    Cambio de {evaluation.currentTariffCode} ➔ <strong className="text-indigo-700 font-mono font-bold">{evaluation.recommendedTariffCode}</strong>
                  </span>
                </div>
                <h4 className="text-base font-black text-slate-900 mt-1 font-display">
                  Ahorro Proyectado: S/. {evaluation.annualSavingsSoles.toLocaleString('es-PE', { maximumFractionDigits: 0 })} al año ({evaluation.percentageSavings}% de reducción en facturación)
                </h4>
                <p className="text-xs text-slate-700 mt-1 max-w-2xl leading-relaxed">
                  {evaluation.primaryExplanation}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => handleApplyTariff(evaluation.recommendedTariffCode)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                title={`Cambiar la tarifa del proyecto a ${evaluation.recommendedTariffCode}`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Aplicar {evaluation.recommendedTariffCode} al Proyecto</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Tarifa Eléctrica Adecuada</h4>
              <p className="text-xs text-slate-600 mt-0.5">{evaluation.primaryExplanation}</p>
            </div>
          </div>
        </div>
      )}

      {appliedFeedback && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{appliedFeedback}</span>
        </div>
      )}

      {/* Category Filter Tabs for All 10 OSINERGMIN Tariffs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterCategory === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({evaluation.breakdown.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('BT')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterCategory === 'BT'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Baja Tensión BT ({evaluation.breakdown.filter(i => i.voltageLevel === 'Baja Tensión (BT)').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('MT')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterCategory === 'MT'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Media Tensión MT ({evaluation.breakdown.filter(i => i.voltageLevel === 'Media Tensión (MT)').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('LIBRE')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterCategory === 'LIBRE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mercado Libre (1)
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Pliego Tarifario Oficial OSINERGMIN / Ley N° 25844 y Ley N° 28832
        </div>
      </div>

      {/* Grid of Tariff Comparisons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {evaluation.breakdown
          .filter(item => {
            if (filterCategory === 'BT') return item.voltageLevel === 'Baja Tensión (BT)';
            if (filterCategory === 'MT') return item.voltageLevel === 'Media Tensión (MT)';
            if (filterCategory === 'LIBRE') return item.voltageLevel === 'Mercado Libre';
            return true;
          })
          .map((item) => {
          const isSelected = item.isCurrent;
          const isBest = item.isRecommended;

          return (
            <div
              key={item.code}
              className={`relative rounded-2xl border p-4.5 transition-all flex flex-col justify-between ${
                isBest
                  ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20'
                  : isSelected
                  ? 'border-indigo-400 bg-indigo-50/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Header Badges */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-sm font-black text-slate-900">
                    {item.code}
                  </span>
                  <div className="flex items-center gap-1">
                    {isSelected && (
                      <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                        Actual
                      </span>
                    )}
                    {isBest && (
                      <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase animate-pulse">
                        Óptima
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-800 mb-1">{item.name}</div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {item.description}
                </p>
              </div>

              {/* Numbers Section */}
              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Costo Mensual:</span>
                  <span className="font-mono font-bold text-slate-900">
                    S/. {item.monthlyCostSoles.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Costo Anual:</span>
                  <span className="font-mono font-semibold text-slate-700">
                    S/. {item.annualCostSoles.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Costo Efectivo/kWh:</span>
                  <span className="font-mono font-bold text-indigo-600">
                    S/. {item.effectiveKwhRate.toFixed(3)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[11px] font-medium text-slate-500">Diferencia vs Actual:</span>
                  <span className={`font-mono text-xs font-bold ${
                    item.annualSavingsVsCurrentSoles > 0 
                      ? 'text-emerald-600' 
                      : (item.annualSavingsVsCurrentSoles < 0 ? 'text-rose-600' : 'text-slate-600')
                  }`}>
                    {item.annualSavingsVsCurrentSoles > 0 ? '-' : (item.annualSavingsVsCurrentSoles < 0 ? '+' : '')}
                    S/. {Math.abs(item.annualSavingsVsCurrentSoles).toLocaleString('es-PE', { maximumFractionDigits: 0 })}/año
                  </span>
                </div>
              </div>

              {/* Action button inside card */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedTariffForDetails(item)}
                  className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Detalles
                </button>

                {!isSelected && (
                  <button
                    onClick={() => handleApplyTariff(item.code)}
                    className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-indigo-600 transition-colors cursor-pointer"
                  >
                    Seleccionar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Peak Shifting Advice */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
        <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h5 className="font-bold text-amber-900">Estrategia Operativa de Desplazamiento de Cargas (Horas Punta OSINERGMIN)</h5>
          <p className="text-slate-700 mt-1 leading-relaxed">
            {evaluation.suggestedPeakShiftAdvice}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-amber-800 font-medium">
            <span className="bg-amber-100/80 px-2 py-0.5 rounded-md">🕐 Horas Fuera de Punta (HFP): 23:00 a 18:00 hrs (Tarifa Económica)</span>
            <span className="bg-amber-200/80 px-2 py-0.5 rounded-md">⚠️ Horas Punta (HP): 18:00 a 23:00 hrs (Mayor Costo por Potencia)</span>
          </div>
        </div>
      </div>

      {/* Technical Migration Steps */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600" />
          <span>Procedimiento Técnico y Trámite Regulatorio ante la Concesionaria (Ley de Concesiones Eléctricas Art. 50)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evaluation.technicalProcedure.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px]">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{step ? step.replace(/^\d+\.\s*/, '') : ''}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal for a specific tariff */}
      {selectedTariffForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-indigo-600 p-2 text-white font-mono font-bold text-xs">
                  {selectedTariffForDetails.code}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedTariffForDetails.name}</h4>
                  <span className="text-[11px] text-slate-500">{selectedTariffForDetails.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTariffForDetails(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                {selectedTariffForDetails.description}
              </p>

              <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 border border-slate-100 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Costo Energía Activa:</span>
                  <span className="font-bold text-slate-800">S/. {selectedTariffForDetails.energyCostSoles.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cargo Potencia/Demanda:</span>
                  <span className="font-bold text-slate-800">S/. {selectedTariffForDetails.powerCostSoles.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cargo Fijo Mensual:</span>
                  <span className="font-bold text-slate-800">S/. {selectedTariffForDetails.fixedCostSoles.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Recargo Reactiva Inductiva:</span>
                  <span className="font-bold text-slate-800">S/. {selectedTariffForDetails.reactivePenaltySoles.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-indigo-700 font-bold pt-1.5 border-t border-slate-200 text-sm">
                  <span>Total Mensual:</span>
                  <span>S/. {selectedTariffForDetails.monthlyCostSoles.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <h6 className="font-bold text-slate-800 mb-1.5">Requisitos Técnicos:</h6>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  {selectedTariffForDetails.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTariffForDetails(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  handleApplyTariff(selectedTariffForDetails.code);
                  setSelectedTariffForDetails(null);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-md transition-colors"
              >
                Aplicar al Proyecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
