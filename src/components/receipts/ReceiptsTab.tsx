import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { ReceiptRecord } from '../../types';
import { MetricCard } from '../shared/MetricCard';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
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
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import { TariffRecommendationCard } from '../tariff/TariffRecommendationCard';

export const ReceiptsTab: React.FC = () => {
  const {
    diagnostic,
    receiptsStats,
    receiptComparison,
    equipmentSummary,
    addReceipt,
    updateReceipt,
    deleteReceipt
  } = useDiagnostic();

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
    mes: `${(r.month || '').substring(0, 3)} ${String(r.year || '').slice(2)}`,
    EnergiaKwh: r.kwhConsumed || 0,
    CostoSoles: r.costSoles || 0,
    FactorPotencia: (r.powerFactor || 0.85) * 1000 // scaled for display
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            Historial de Facturación y Correlación con Censo
          </h2>
          <p className="text-xs text-slate-500">
            Registro de los últimos 12 meses de recibos de luz emitidos por la distribuidora y análisis de discrepancia
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm transition-colors"
        >
          <Plus size={14} />
          <span>Agregar Recibo</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          title="Promedio Mensual"
          value={(receiptsStats?.averageMonthlyKwh || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit="kWh"
          subtitle={`S/. ${(receiptsStats?.averageMonthlyCostSoles || 0).toFixed(0)}/mes`}
          highlightColor="blue"
        />
        <MetricCard
          title="Máximo Facturado"
          value={(receiptsStats?.maxMonthlyKwh || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit="kWh"
          subtitle={`S/. ${(receiptsStats?.maxMonthlyCostSoles || 0).toFixed(0)}`}
          highlightColor="amber"
        />
        <MetricCard
          title="Mínimo Facturado"
          value={(receiptsStats?.minMonthlyKwh || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit="kWh"
          subtitle={`S/. ${(receiptsStats?.minMonthlyCostSoles || 0).toFixed(0)}`}
          highlightColor="slate"
        />
        <MetricCard
          title="Consumo Anual"
          value={(receiptsStats?.annualTotalKwh || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit="kWh/año"
          subtitle={`S/. ${(receiptsStats?.annualTotalCostSoles || 0).toFixed(0)}/año`}
          highlightColor="indigo"
        />
        <MetricCard
          title="Tarifa Efectiva"
          value={(receiptsStats?.averageEffectiveTariffPerKwh || 0).toFixed(3)}
          unit="S/./kWh"
          subtitle="Precio ponderado real"
          highlightColor="emerald"
        />
        <MetricCard
          title="Factor Potencia"
          value={(receiptsStats?.averagePowerFactor ?? 0.85).toFixed(2)}
          subtitle={(receiptsStats?.averagePowerFactor ?? 0.85) < 0.96 ? 'Aplica penalidad' : 'Sin penalidad'}
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
                Auditoría Energética: Recibo Facturado vs Censo de Equipos
              </h3>
              <p className="text-xs text-slate-500">
                Compara la energía real cobrada con el modelo matemático del censo de máquinas
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
            {receiptComparison.accuracyLevel === 'ALTA_COINCIDENCIA' ? '✓ Alta Coincidencia (±10%)' : (receiptComparison.accuracyLevel === 'DESVIACION_MODERADA' ? '⚠️ Desviación Moderada' : '🚨 Desviación Severa')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Facturación en Recibo</div>
            <div className="font-mono text-xl font-black text-slate-900 mt-1">
              {(receiptComparison?.receiptMonthlyKwh || 0).toLocaleString()} kWh/mes
            </div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              S/. {(receiptComparison?.receiptMonthlyCostSoles || 0).toFixed(2)}/mes
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-100">
            <div className="text-[11px] font-semibold text-amber-800 uppercase">Censo de Cargas Calculado</div>
            <div className="font-mono text-xl font-black text-amber-950 mt-1">
              {(receiptComparison?.calculatedMonthlyKwh || 0).toLocaleString()} kWh/mes
            </div>
            <div className="text-xs text-amber-800 font-medium mt-0.5">
              S/. {(receiptComparison?.calculatedMonthlyCostSoles || 0).toFixed(2)}/mes
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Diferencia Neta</div>
            <div className={`font-mono text-xl font-black mt-1 ${Math.abs(receiptComparison?.differencePercent || 0) <= 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {(receiptComparison?.differenceKwh || 0) > 0 ? '+' : ''}{receiptComparison?.differenceKwh || 0} kWh ({receiptComparison?.differencePercent || 0}%)
            </div>
            <div className="text-xs text-slate-600 font-medium mt-0.5">
              {(receiptComparison?.economicDifferenceSoles || 0) > 0 ? '+' : ''}S/. {(receiptComparison?.economicDifferenceSoles || 0).toFixed(2)}/mes
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 text-xs text-blue-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle size={14} className="text-blue-700 shrink-0" />
            <span>Diagnóstico Técnico de la Discrepancia:</span>
          </div>
          <p className="text-blue-800 leading-relaxed">
            {receiptComparison.diagnosticExplanation}
          </p>
        </div>
      </div>

      {/* Tariff Optimization and Recommendation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Optimización de Tarifa Eléctrica (OSINERGMIN)</h3>
          </div>
          <span className="text-xs text-slate-500">Evaluación automática según tu curva de consumo</span>
        </div>
        <TariffRecommendationCard compact={false} />
      </div>

      {/* Chart: Historical Billing */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          Evolución Mensual de Consumo (kWh) y Gasto (S/.)
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
                  name === 'EnergiaKwh' ? 'Energía Consumida' : 'Importe Facturado'
                ]}
                contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar yAxisId="left" dataKey="EnergiaKwh" name="Energía (kWh)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="CostoSoles" name="Gasto Total (S/.)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Detalle Histórico de Recibos ({diagnostic.receipts.length} registros)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Periodo</th>
                <th className="px-4 py-3">Consumo (kWh)</th>
                <th className="px-4 py-3">Importe (S/.)</th>
                <th className="px-4 py-3">Demanda Máx (kW)</th>
                <th className="px-4 py-3">Reactiva (kvarh)</th>
                <th className="px-4 py-3">cos φ</th>
                <th className="px-4 py-3">Observaciones</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {diagnostic.receipts.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                    {r.month} {r.year}
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
                      className="p-1 text-slate-500 hover:text-amber-600 mr-1"
                      title="Editar registro"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteReceipt(r.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Eliminar registro"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {diagnostic.receipts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No hay recibos registrados. Haga clic en "Agregar Recibo" para comenzar el registro mensual.
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
                    {editingId ? 'Editar Recibo de Electricidad' : 'Registrar Nuevo Recibo'}
                  </h3>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Datos de facturación eléctrica mensual</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
                title="Cerrar ventana"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-6 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Año</label>
                    <input
                      type="number"
                      value={formState.year}
                      onChange={e => setFormState({ ...formState, year: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mes</label>
                    <select
                      value={formState.month}
                      onChange={e => setFormState({ ...formState, month: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      {MONTH_NAMES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Consumo Energía (kWh)</label>
                    <input
                      type="number"
                      value={formState.kwhConsumed}
                      onChange={e => setFormState({ ...formState, kwhConsumed: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Total Facturado (S/.)</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">Demanda Máx (kW)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formState.maxDemandKw}
                      onChange={e => setFormState({ ...formState, maxDemandKw: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Reactiva (kvarh)</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Observaciones</label>
                  <input
                    type="text"
                    value={formState.observations}
                    onChange={e => setFormState({ ...formState, observations: e.target.value })}
                    placeholder="Ej. Campaña escolar, penalidad reactiva, etc."
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
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
