import React from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { MetricCard } from '../shared/MetricCard';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  PiggyBank, 
  Sliders
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const PowerFactorTab: React.FC = () => {
  const {
    diagnostic,
    equipmentSummary,
    updatePowerFactor
  } = useDiagnostic();
  const { language } = useLanguage();

  const tr = (es: string, en: string, pt: string) =>
    language === 'en' ? en : language === 'pt' ? pt : es;

  const defaultPf = {
    currentPowerFactor: 0.82,
    targetPowerFactor: 0.98,
    requiredCapacitorKvar: 8.5,
    recommendedBankType: 'BANCO_AUTOMATICO_PASOS' as const,
    stepsKvar: [2.5, 2.5, 5.0],
    estimatedInvestmentSoles: 3200,
    monthlyPenaltyAvoidedSoles: 240,
    paybackMonths: 13.3,
    tariffReactivePenaltyRate: 0.14
  };

  const pfData = {
    ...defaultPf,
    ...(diagnostic.powerFactor || {})
  };

  const handleUpdateCurrentFp = (fp: number) => {
    const pKw = equipmentSummary.totalInstalledPowerKw > 0 ? equipmentSummary.totalInstalledPowerKw * 0.75 : 15;
    const targetFp = pfData.targetPowerFactor || 0.98;
    const phi1 = Math.acos(Math.max(0.1, Math.min(1.0, fp)));
    const phi2 = Math.acos(Math.max(0.1, Math.min(1.0, targetFp)));
    const requiredKvar = Math.max(0, pKw * (Math.tan(phi1) - Math.tan(phi2)));
    
    const monthlyExcessKvarh = Math.max(0, equipmentSummary.totalMonthlyKwh * (Math.tan(phi1) - 0.29));
    const penaltySoles = monthlyExcessKvarh * (diagnostic.tariff.reactiveEnergyPenaltyPriceKvarh || 0.14);
    const investment = requiredKvar * 380 + 800;
    const payback = penaltySoles > 0 ? investment / penaltySoles : 0;

    updatePowerFactor({
      currentPowerFactor: fp,
      requiredCapacitorKvar: Number(requiredKvar.toFixed(1)),
      monthlyPenaltyAvoidedSoles: Number(penaltySoles.toFixed(2)),
      estimatedInvestmentSoles: Number(investment.toFixed(0)),
      paybackMonths: Number(payback.toFixed(1))
    });
  };

  const isPenaltyActive = (pfData.currentPowerFactor ?? 0.85) < 0.96;
  const annualPenaltyLossSoles = (pfData.monthlyPenaltyAvoidedSoles || 0) * 12;

  const currentFpVal = pfData.currentPowerFactor ?? 0.85;
  const targetFpVal = pfData.targetPowerFactor ?? 0.98;
  const pKw = equipmentSummary.totalInstalledPowerKw > 0 ? equipmentSummary.totalInstalledPowerKw * 0.75 : 15;
  const qActualKvar = pKw * Math.tan(Math.acos(Math.min(1, Math.max(0.1, currentFpVal))));
  const sActualKva = pKw / Math.max(0.1, currentFpVal);
  
  const qTargetKvar = pKw * Math.tan(Math.acos(Math.min(1, Math.max(0.1, targetFpVal))));
  const sTargetKva = pKw / Math.max(0.1, targetFpVal);

  const comparisonChartData = [
    {
      name: tr('Situación Actual', 'Current Situation', 'Situação Atual'),
      PotenciaActivaKW: Math.round(pKw),
      PotenciaReactivaKVAR: Math.round(qActualKvar),
      PotenciaAparenteKVA: Math.round(sActualKva)
    },
    {
      name: tr('Con Banco Condensadores', 'With Capacitor Bank', 'Com Banco de Capacitores'),
      PotenciaActivaKW: Math.round(pKw),
      PotenciaReactivaKVAR: Math.round(qTargetKvar),
      PotenciaAparenteKVA: Math.round(sTargetKva)
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            {tr(
              'Factor de Potencia (cos φ) y Compensación Reactiva OSINERGMIN',
              'Power Factor (cos φ) & Reactive Compensation (OSINERGMIN)',
              'Fator de Potência (cos φ) e Compensação Reativa OSINERGMIN'
            )}
          </h2>
          <p className="text-xs text-slate-500">
            {tr(
              'Regulación peruana (NTCSE / Norma DGE): Límite normativo cos φ ≥ 0.96. Dimensionamiento de bancos de condensadores',
              'Peruvian regulation (NTCSE / DGE Standard): Mandatory limit cos φ ≥ 0.96. Capacitor bank dimensioning',
              'Regulamentação peruana (NTCSE / Norma DGE): Limite normativo cos φ ≥ 0.96. Dimensionamento de bancos de capacitores'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-lg px-3 py-1 text-xs font-bold ${
            isPenaltyActive ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            {isPenaltyActive
              ? tr('⚠️ Aplica Penalidad por Energía Reactiva', '⚠️ Reactive Energy Penalty Applies', '⚠️ Aplica Multa por Energia Reativa')
              : tr('✓ Libre de Penalidad OSINERGMIN', '✓ Penalty-Free (OSINERGMIN)', '✓ Livre de Multa OSINERGMIN')}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title={tr('Factor de Potencia Actual', 'Current Power Factor', 'Fator de Potência Atual')}
          value={(pfData.currentPowerFactor ?? 0.85).toFixed(2)}
          subtitle={isPenaltyActive ? tr('Bajo norma (< 0.96)', 'Below standard (< 0.96)', 'Abaixo da norma (< 0.96)') : tr('Normativo OK', 'Compliant OK', 'Normativo OK')}
          highlightColor={isPenaltyActive ? 'rose' : 'emerald'}
          icon={<Activity size={18} />}
        />
        <MetricCard
          title={tr('Banco Requerido', 'Required Capacitor Bank', 'Banco Necessário')}
          value={(pfData.requiredCapacitorKvar ?? 6.0).toFixed(1)}
          unit="kVAR"
          subtitle={`${tr('Meta:', 'Target:', 'Meta:')} cos φ = ${(pfData.targetPowerFactor ?? 0.98).toFixed(2)}`}
          highlightColor="indigo"
          icon={<Zap size={18} />}
        />
        <MetricCard
          title={tr('Penalidad Evitada', 'Avoided Penalty', 'Multa Evitada')}
          value={`S/. ${(pfData.monthlyPenaltyAvoidedSoles || 0).toFixed(0)}`}
          unit={`/${tr('mes', 'mo', 'mês')}`}
          subtitle={`S/. ${(annualPenaltyLossSoles || 0).toFixed(0)} ${tr('al año', 'per year', 'por ano')}`}
          highlightColor="emerald"
          icon={<PiggyBank size={18} />}
        />
        <MetricCard
          title={tr('Tiempo Retorno (Payback)', 'Payback Period', 'Tempo de Retorno (Payback)')}
          value={pfData.paybackMonths ? `${pfData.paybackMonths} ${tr('meses', 'months', 'meses')}` : tr('Inmediato', 'Immediate', 'Imediato')}
          subtitle={`${tr('Inversión estimada:', 'Estimated investment:', 'Investimento estimado:')} S/. ${pfData.estimatedInvestmentSoles ?? 0}`}
          highlightColor="amber"
          icon={<TrendingUp size={18} />}
        />
      </div>

      {/* Interactive Simulator & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Sliders Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders size={18} className="text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {tr('Simulador de Compensación', 'Compensation Simulator', 'Simulador de Compensação')}
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>{tr('Factor de Potencia Actual (cos φ₁):', 'Current Power Factor (cos φ₁):', 'Fator de Potência Atual (cos φ₁):')}</span>
                <span className="font-mono font-bold text-amber-900">{(pfData.currentPowerFactor ?? 0.85).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.99"
                step="0.01"
                value={pfData.currentPowerFactor ?? 0.85}
                onChange={e => handleUpdateCurrentFp(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.50 ({tr('Muy Crítico', 'Critical', 'Muito Crítico')})</span>
                <span className="text-rose-600 font-bold">0.96 ({tr('Límite Perú', 'Peru Limit', 'Limite Peru')})</span>
                <span>0.99 ({tr('Óptimo', 'Optimal', 'Ótimo')})</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>{tr('Factor de Potencia Objetivo (cos φ₂):', 'Target Power Factor (cos φ₂):', 'Fator de Potência Alvo (cos φ₂):')}</span>
                <span className="font-mono font-bold text-emerald-800">{(pfData.targetPowerFactor ?? 0.98).toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.95"
                max="1.00"
                step="0.01"
                value={pfData.targetPowerFactor}
                onChange={e => {
                  const target = Number(e.target.value);
                  updatePowerFactor({ targetPowerFactor: target });
                  handleUpdateCurrentFp(pfData.currentPowerFactor);
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800">
                {tr('Especificación del Banco Sugerido:', 'Suggested Bank Specification:', 'Especificação do Banco Sugerido:')}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{tr('Capacidad Total:', 'Total Capacity:', 'Capacidade Total:')}</span>
                <span className="font-mono font-bold text-slate-900">{pfData.requiredCapacitorKvar} kVAR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{tr('Tipo de Banco:', 'Bank Type:', 'Tipo de Banco:')}</span>
                <span className="font-semibold text-slate-800">
                  {tr('Automático por Pasos', 'Automatic Multi-Step', 'Automático por Estágios')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{tr('Escalones de condensador:', 'Capacitor steps:', 'Estágios de capacitor:')}</span>
                <span className="font-mono text-slate-700">
                  3 {tr('pasos', 'steps', 'estágios')} ({(((pfData.requiredCapacitorKvar || 6.0) / 3)).toFixed(1)} kVAR {tr('c/u', 'ea', 'cada')})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{tr('Tensión de celda:', 'Cell voltage:', 'Tensão da célula:')}</span>
                <span className="font-mono text-slate-700">{diagnostic.tariff?.supplyVoltage || 220}V / 60 Hz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Triangle Chart: P (kW), Q (kVAR), S (kVA) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {tr(
                  'Triángulo de Potencias: Reducción de Demanda Aparente (kVA)',
                  'Power Triangle: Apparent Demand Reduction (kVA)',
                  'Triângulo de Potências: Redução da Demanda Aparente (kVA)'
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {tr(
                  'La compensación reactiva libera capacidad en transformadores y conductores al reducir la corriente total',
                  'Reactive compensation frees up capacity in transformers and feeders by reducing total line current',
                  'A compensação reativa libera capacidade em transformadores e condutores ao reduzir a corrente total'
                )}
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="PotenciaActivaKW" name={tr('Potencia Activa P (kW)', 'Active Power P (kW)', 'Potência Ativa P (kW)')} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="PotenciaReactivaKVAR" name={tr('Potencia Reactiva Q (kVAR)', 'Reactive Power Q (kVAR)', 'Potência Reativa Q (kVAR)')} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="PotenciaAparenteKVA" name={tr('Potencia Aparente S (kVA)', 'Apparent Power S (kVA)', 'Potência Aparente S (kVA)')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-3 text-xs text-emerald-900">
            <span className="font-bold">{tr('Beneficio Técnico Integral: ', 'Comprehensive Technical Benefit: ', 'Benefício Técnico Integral: ')}</span>
            {tr(
              `La potencia aparente total demandada disminuye de ${Math.round(sActualKva)} kVA a ${Math.round(sTargetKva)} kVA, reduciendo las pérdidas por efecto Joule en un ${sActualKva > 0 ? (((sActualKva - sTargetKva) / sActualKva) * 100).toFixed(1) : '0'}% en cables y tableros.`,
              `Total demanded apparent power decreases from ${Math.round(sActualKva)} kVA to ${Math.round(sTargetKva)} kVA, reducing Joule heating losses by ${sActualKva > 0 ? (((sActualKva - sTargetKva) / sActualKva) * 100).toFixed(1) : '0'}% across cables and panels.`,
              `A potência aparente total demandada diminui de ${Math.round(sActualKva)} kVA para ${Math.round(sTargetKva)} kVA, reduzindo as perdas por efeito Joule em ${sActualKva > 0 ? (((sActualKva - sTargetKva) / sActualKva) * 100).toFixed(1) : '0'}% nos cabos e quadros.`
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
