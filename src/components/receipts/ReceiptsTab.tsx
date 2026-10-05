import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { ReceiptRecord } from '../../types';
import { MetricCard } from '../shared/MetricCard';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Sparkles,
  Zap,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend
} from 'recharts';
import { TariffRecommendationCard } from '../tariff/TariffRecommendationCard';

export const ReceiptsTab: React.FC = () => {
  const {
    diagnostic,
    receiptsStats,
    receiptComparison,
    addReceipt,
    updateReceipt,
    deleteReceipt
  } = useDiagnostic();
  const { language } = useLanguage();

  const tr = (es: string, en: string, pt: string) =>
    language === 'en' ? en : language === 'pt' ? pt : es;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<{
    year: number;
    month: string;
    kwhConsumed: number;
    costSoles: number;
    billedPowerKw: number;
    maxDemandKw: number;
    reactiveEnergyKvarh: number;
    powerFactor: number;
    observations: string;
  }>({
    year: new Date().getFullYear(),
    month: 'Enero',
    kwhConsumed: 500,
    costSoles: 380,
    billedPowerKw: 5,
    maxDemandKw: 4.5,
    reactiveEnergyKvarh: 100,
    powerFactor: 0.85,
    observations: ''
  });

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const translateMonth = (m: string) => {
    const map: Record<string, { en: string; pt: string }> = {
      Enero: { en: 'January', pt: 'Janeiro' },
      Febrero: { en: 'February', pt: 'Fevereiro' },
      Marzo: { en: 'March', pt: 'Março' },
      Abril: { en: 'April', pt: 'Abril' },
      Mayo: { en: 'May', pt: 'Maio' },
      Junio: { en: 'June', pt: 'Junho' },
      Julio: { en: 'July', pt: 'Julho' },
      Agosto: { en: 'August', pt: 'Agosto' },
      Setiembre: { en: 'September', pt: 'Setembro' },
      Septiembre: { en: 'September', pt: 'Setembro' },
      Octubre: { en: 'October', pt: 'Outubro' },
      Noviembre: { en: 'November', pt: 'Novembro' },
      Diciembre: { en: 'December', pt: 'Dezembro' }
    };
    if (language === 'en') return map[m]?.en || m;
    if (language === 'pt') return map[m]?.pt || m;
    return m;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormState({
      year: new Date().getFullYear(),
      month: 'Enero',
      kwhConsumed: 500,
      costSoles: 380,
      billedPowerKw: 5,
      maxDemandKw: 4.5,
      reactiveEnergyKvarh: 100,
      powerFactor: 0.85,
      observations: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (r: ReceiptRecord) => {
    setEditingId(r.id);
    setFormState({
      year: r.year,
      month: r.month,
      kwhConsumed: r.kwhConsumed,
      costSoles: r.costSoles,
      billedPowerKw: r.billedPowerKw || 0,
      maxDemandKw: r.maxDemandKw || 0,
      reactiveEnergyKvarh: r.reactiveEnergyKvarh || 0,
      powerFactor: r.powerFactor || 0.85,
      observations: r.observations || ''
    });
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateReceipt(editingId, formState);
    } else {
      addReceipt(formState);
    }
    setShowAddModal(false);
  };

  const chartData = (diagnostic.receipts || []).map(r => ({
    mes: `${translateMonth(r.month || '').substring(0, 3)} ${String(r.year || '').slice(2)}`,
    EnergiaKwh: r.kwhConsumed || 0,
    CostoSoles: r.costSoles || 0,
    FactorPotencia: (r.powerFactor || 0.85) * 1000
  }));

  const translatedDiagnosticExplanation = () => {
    const diffPct = Math.abs(receiptComparison?.differencePercent || 0);
    if (diffPct <= 10) {
      return tr(
        receiptComparison.diagnosticExplanation,
        `High correlation (${receiptComparison?.differencePercent || 0}%): The equipment load census matches utility billing within engineering tolerance (±10%).`,
        `Alta correlação (${receiptComparison?.differencePercent || 0}%): O censo de cargas coincide com a fatura de energia dentro da tolerância de engenharia (±10%).`
      );
    }
    if (diffPct <= 25) {
      return tr(
        receiptComparison.diagnosticExplanation,
        `Moderate deviation (${receiptComparison?.differencePercent || 0}%): Verify operating hours per day, load simultaneity factors, or unrecorded auxiliary loads.`,
        `Desvio moderado (${receiptComparison?.differencePercent || 0}%): Verifique as horas de operação por dia, fatores de simultaneidade ou cargas auxiliares não registradas.`
      );
    }
    return tr(
      receiptComparison.diagnosticExplanation,
      `Significant discrepancy (${receiptComparison?.differencePercent || 0}%): Check for earth leakage currents, meter calibration issues, or uninventoried thermal/motor equipment.`,
      `Discrepância severa (${receiptComparison?.differencePercent || 0}%): Verifique correntes de fuga à terra, calibração do medidor ou equipamentos térmicos/motores não inventariados.`
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            {tr('Historial de Facturación y Correlación con Censo', 'Billing History & Load Census Correlation', 'Histórico de Faturamento e Correlação com Censo')}
          </h2>
          <p className="text-xs text-slate-500">
            {tr(
              'Registro de los últimos 12 meses de recibos de luz emitidos por la distribuidora y análisis de discrepancia',
              'Record of the last 12 months of utility electricity bills and discrepancy analysis',
              'Registro dos últimos 12 meses de faturas de energia emitidas pela concessionária e análise de discrepância'
            )}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>{tr('Agregar Recibo', 'Add Utility Bill', 'Adicionar Fatura')}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title={tr('Promedio Mensual', 'Monthly Average', 'Média Mensal')}
          value={(receiptsStats?.averageMonthlyKwh || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit="kWh"
          subtitle={`S/. ${(receiptsStats?.averageMonthlyCostSoles || 0).toFixed(0)}/${tr('mes', 'mo', 'mês')}`}
          highlightColor="blue"
        />
        <MetricCard
          title={tr('Máximo Facturado', 'Peak Billed', 'Máximo Faturado')}
          value={(receiptsStats?.maxMonthlyKwh || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit="kWh"
          subtitle={`S/. ${(receiptsStats?.maxMonthlyCostSoles || 0).toFixed(0)}`}
          highlightColor="amber"
        />
        <MetricCard
          title={tr('Mínimo Facturado', 'Minimum Billed', 'Mínimo Faturado')}
          value={(receiptsStats?.minMonthlyKwh || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit="kWh"
          subtitle={`S/. ${(receiptsStats?.minMonthlyCostSoles || 0).toFixed(0)}`}
          highlightColor="slate"
        />
        <MetricCard
          title={tr('Consumo Anual', 'Annual Consumption', 'Consumo Anual')}
          value={(receiptsStats?.annualTotalKwh || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit={tr('kWh/año', 'kWh/yr', 'kWh/ano')}
          subtitle={`S/. ${(receiptsStats?.annualTotalCostSoles || 0).toFixed(0)}/${tr('año', 'yr', 'ano')}`}
          highlightColor="indigo"
        />
        <MetricCard
          title={tr('Tarifa Efectiva', 'Effective Tariff', 'Tarifa Efetiva')}
          value={(receiptsStats?.averageEffectiveTariffPerKwh || 0).toFixed(3)}
          unit="S/./kWh"
          subtitle={tr('Precio ponderado real', 'Weighted real price', 'Preço médio ponderado')}
          highlightColor="emerald"
        />
        <MetricCard
          title={tr('Factor Potencia', 'Power Factor', 'Fator de Potência')}
          value={(receiptsStats?.averagePowerFactor ?? 0.85).toFixed(2)}
          subtitle={(receiptsStats?.averagePowerFactor ?? 0.85) < 0.96 ? tr('Aplica penalidad', 'Penalty applies', 'Aplica multa') : tr('Sin penalidad', 'No penalty', 'Sem multa')}
          highlightColor={(receiptsStats?.averagePowerFactor ?? 0.85) < 0.96 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Comparison Engine Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {tr('Auditoría Energética: Recibo Facturado vs Censo de Equipos', 'Energy Audit: Billed Utility vs Equipment Census', 'Auditoria Energética: Fatura vs Censo de Equipamentos')}
              </h3>
              <p className="text-xs text-slate-500">
                {tr(
                  'Compara la energía real cobrada con el modelo matemático del censo de máquinas',
                  'Compares actual billed energy against the mathematical equipment census model',
                  'Compara a energia real cobrada com o modelo matemático do censo de máquinas'
                )}
              </p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            receiptComparison.accuracyLevel === 'ALTA_COINCIDENCIA'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : (receiptComparison.accuracyLevel === 'DESVIACION_MODERADA'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200')
          }`}>
            {receiptComparison.accuracyLevel === 'ALTA_COINCIDENCIA'
              ? tr('✓ Alta Coincidencia (±10%)', '✓ High Match (±10%)', '✓ Alta Coincidência (±10%)')
              : (receiptComparison.accuracyLevel === 'DESVIACION_MODERADA'
                ? tr('⚠️ Desviación Moderada', '⚠️ Moderate Deviation', '⚠️ Desvio Moderado')
                : tr('🚨 Desviación Severa', '🚨 Severe Deviation', '🚨 Desvio Severo'))}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">{tr('Facturación en Recibo', 'Utility Bill Average', 'Faturamento na Conta')}</div>
            <div className="font-mono text-xl font-black text-slate-900 mt-1">
              {(receiptComparison?.receiptMonthlyKwh || 0).toLocaleString()} {tr('kWh/mes', 'kWh/mo', 'kWh/mês')}
            </div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              S/. {(receiptComparison?.receiptMonthlyCostSoles || 0).toFixed(2)}/{tr('mes', 'mo', 'mês')}
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-100">
            <div className="text-[11px] font-semibold text-amber-800 uppercase">{tr('Censo de Cargas Calculado', 'Calculated Load Census', 'Censo de Cargas Calculado')}</div>
            <div className="font-mono text-xl font-black text-amber-950 mt-1">
              {(receiptComparison?.calculatedMonthlyKwh || 0).toLocaleString()} {tr('kWh/mes', 'kWh/mo', 'kWh/mês')}
            </div>
            <div className="text-xs text-amber-800 font-medium mt-0.5">
              S/. {(receiptComparison?.calculatedMonthlyCostSoles || 0).toFixed(2)}/{tr('mes', 'mo', 'mês')}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">{tr('Diferencia Neta', 'Net Difference', 'Diferença Líquida')}</div>
            <div className={`font-mono text-xl font-black mt-1 ${Math.abs(receiptComparison?.differencePercent || 0) <= 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {(receiptComparison?.differenceKwh || 0) > 0 ? '+' : ''}{receiptComparison?.differenceKwh || 0} kWh ({receiptComparison?.differencePercent || 0}%)
            </div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              {(receiptComparison?.economicDifferenceSoles || 0) > 0 ? '+' : ''}S/. {(receiptComparison?.economicDifferenceSoles || 0).toFixed(2)}/{tr('mes', 'mo', 'mês')}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 text-xs text-blue-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle size={14} className="text-blue-700 shrink-0" />
            <span>{tr('Diagnóstico Técnico de la Discrepancia:', 'Technical Discrepancy Diagnosis:', 'Diagnóstico Técnico da Discrepância:')}</span>
          </div>
          <p className="text-blue-800 leading-relaxed">
            {translatedDiagnosticExplanation()}
          </p>
        </div>
      </div>

      {/* Tariff Optimization and Recommendation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {tr('Optimización de Tarifa Eléctrica (OSINERGMIN)', 'Electrical Tariff Optimization (OSINERGMIN)', 'Otimização de Tarifa Elétrica (OSINERGMIN)')}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {tr('Evaluación automática según tu curva de consumo', 'Automatic evaluation based on your load curve', 'Avaliação automática segundo sua curva de consumo')}
          </span>
        </div>
        <TariffRecommendationCard compact={false} />
      </div>

      {/* Chart: Historical Billing */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          {tr('Evolución Mensual de Consumo (kWh) y Gasto (S/.)', 'Monthly Consumption (kWh) & Cost (S/.) Evolution', 'Evolução Mensal de Consumo (kWh) e Gasto (S/.)')}
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip 
                formatter={(val: number, name: string) => [
                  name === 'EnergiaKwh' ? `${val.toLocaleString()} kWh` : `S/. ${val.toLocaleString()}`,
                  name === 'EnergiaKwh'
                    ? tr('Energía Consumida', 'Energy Consumed', 'Energia Consumida')
                    : tr('Importe Facturado', 'Billed Amount', 'Valor Faturado')
                ]}
                contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="EnergiaKwh" name={tr('Energía (kWh)', 'Energy (kWh)', 'Energia (kWh)')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="CostoSoles" name={tr('Gasto Total (S/.)', 'Total Cost (S/.)', 'Gasto Total (S/.)')} fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {tr('Detalle Histórico de Recibos', 'Historical Utility Bills Detail', 'Detalhe Histórico de Faturas')} ({diagnostic.receipts.length} {tr('registros', 'records', 'registros')})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">{tr('Periodo', 'Period', 'Período')}</th>
                <th className="px-4 py-3">{tr('Consumo (kWh)', 'Consumption (kWh)', 'Consumo (kWh)')}</th>
                <th className="px-4 py-3">{tr('Importe (S/.)', 'Amount (S/.)', 'Valor (S/.)')}</th>
                <th className="px-4 py-3">{tr('Demanda Máx (kW)', 'Peak Demand (kW)', 'Demanda Máx (kW)')}</th>
                <th className="px-4 py-3">{tr('Reactiva (kvarh)', 'Reactive (kvarh)', 'Reativa (kvarh)')}</th>
                <th className="px-4 py-3">cos φ</th>
                <th className="px-4 py-3">{tr('Observaciones', 'Observations', 'Observações')}</th>
                <th className="px-4 py-3 text-right">{tr('Acciones', 'Actions', 'Ações')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {diagnostic.receipts.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                    {translateMonth(r.month)} {r.year}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {r.kwhConsumed.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-900">
                    S/. {r.costSoles.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">
                    {r.maxDemandKw ? `${r.maxDemandKw} kW` : '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">
                    {r.reactiveEnergyKvarh ? `${r.reactiveEnergyKvarh.toLocaleString()} kvarh` : '-'}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                      (r.powerFactor || 0.85) >= 0.96 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {(r.powerFactor || 0.85).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate" title={r.observations}>
                    {r.observations || '-'}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className="p-1 text-slate-500 hover:text-amber-600 mr-1 cursor-pointer"
                      title={tr('Editar registro', 'Edit record', 'Editar registro')}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteReceipt(r.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title={tr('Eliminar registro', 'Delete record', 'Excluir registro')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {diagnostic.receipts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    {tr(
                      'No hay recibos registrados. Haga clic en "Agregar Recibo" para comenzar el registro mensual.',
                      'No utility bills recorded. Click "Add Utility Bill" to start logging monthly data.',
                      'Nenhuma fatura registrada. Clique em "Adicionar Fatura" para iniciar o registro mensal.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Receipt */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-hidden">
          <div className="w-full max-w-md max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Sticky Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 py-3.5 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                  <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                    {editingId
                      ? tr('Editar Recibo de Electricidad', 'Edit Electricity Bill', 'Editar Fatura de Eletricidade')
                      : tr('Registrar Nuevo Recibo', 'Record New Utility Bill', 'Registrar Nova Fatura')}
                  </h3>
                  <p className="text-[11px] text-slate-500 hidden sm:block">
                    {tr('Datos de facturación eléctrica mensual', 'Monthly electrical billing data', 'Dados de faturamento elétrico mensal')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                title={tr('Cerrar ventana', 'Close window', 'Fechar janela')}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-6 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Año', 'Year', 'Ano')}</label>
                    <input
                      type="number"
                      value={formState.year}
                      onChange={e => setFormState({ ...formState, year: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Mes', 'Month', 'Mês')}</label>
                    <select
                      value={formState.month}
                      onChange={e => setFormState({ ...formState, month: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      {MONTH_NAMES.map(m => (
                        <option key={m} value={m}>{translateMonth(m)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Consumo Energía (kWh)', 'Energy Consumed (kWh)', 'Consumo de Energia (kWh)')}</label>
                    <input
                      type="number"
                      value={formState.kwhConsumed}
                      onChange={e => setFormState({ ...formState, kwhConsumed: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Total Facturado (S/.)', 'Total Billed (S/.)', 'Total Faturado (S/.)')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formState.costSoles}
                      onChange={e => setFormState({ ...formState, costSoles: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Demanda Máx (kW)', 'Max Demand (kW)', 'Demanda Máx (kW)')}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formState.maxDemandKw}
                      onChange={e => setFormState({ ...formState, maxDemandKw: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Reactiva (kvarh)', 'Reactive (kvarh)', 'Reativa (kvarh)')}</label>
                    <input
                      type="number"
                      value={formState.reactiveEnergyKvarh}
                      onChange={e => setFormState({ ...formState, reactiveEnergyKvarh: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">cos φ</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formState.powerFactor}
                      onChange={e => setFormState({ ...formState, powerFactor: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Observaciones', 'Observations', 'Observações')}</label>
                  <input
                    type="text"
                    value={formState.observations}
                    onChange={e => setFormState({ ...formState, observations: e.target.value })}
                    placeholder={tr('Ej. Campaña escolar, penalidad reactiva, etc.', 'E.g. Peak season, reactive penalty, etc.', 'Ex. Alta temporada, multa reativa, etc.')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2.5 border-t border-slate-200/80 bg-slate-50/95 backdrop-blur-xs px-4 sm:px-6 py-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  {tr('Cancelar', 'Cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
                >
                  {editingId ? tr('Guardar Cambios', 'Save Changes', 'Salvar Alterações') : tr('Registrar', 'Save Record', 'Registrar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
