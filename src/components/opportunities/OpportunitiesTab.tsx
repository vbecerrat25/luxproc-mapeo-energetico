import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { SavingsOpportunityRecord } from '../../types';
import { MetricCard } from '../shared/MetricCard';
import { 
  PiggyBank, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Sliders, 
  DollarSign,
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';

export const OpportunitiesTab: React.FC = () => {
  const {
    diagnostic,
    computedSavingsOpportunities,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    activeScenario,
    setActiveScenario
  } = useDiagnostic();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<Omit<SavingsOpportunityRecord, 'id'>>({
    code: 'AH-01',
    title: 'Modernización de Motores a Eficiencia Premium IE3',
    category: 'MOTORES_VFD',
    description: 'Reemplazo de motores rebobinados de baja eficiencia por unidades normalizadas IE3 con variador de frecuencia',
    monthlySavingsKwh: 350,
    monthlySavingsSoles: 262.5,
    annualSavingsSoles: 3150,
    estimatedInvestmentSoles: 4800,
    simplePaybackMonths: 18.3,
    paybackYears: 1.5,
    npv10YearsSoles: 14200,
    irrPercent: 42,
    co2AvoidedTonsPerYear: 1.7,
    priority: 'ALTA',
    implementationEase: 'MEDIA',
    equipmentImpacted: 'Motores de desbaste y bombas'
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormState({
      code: `AH-${String(diagnostic.opportunities.length + 1).padStart(2, '0')}`,
      title: 'Instalación de Variadores de Frecuencia (VFD)',
      category: 'MOTORES_VFD',
      description: 'Control de velocidad variable en compresores de aire y extractores de polvo',
      monthlySavingsKwh: 280,
      monthlySavingsSoles: 210,
      annualSavingsSoles: 2520,
      estimatedInvestmentSoles: 3600,
      simplePaybackMonths: 17.1,
      paybackYears: 1.4,
      npv10YearsSoles: 12000,
      irrPercent: 45,
      co2AvoidedTonsPerYear: 1.4,
      priority: 'ALTA',
      implementationEase: 'MEDIA',
      equipmentImpacted: 'Compresor principal'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (op: SavingsOpportunityRecord) => {
    setEditingId(op.id);
    setFormState({
      code: op.code,
      title: op.title,
      category: op.category,
      description: op.description,
      monthlySavingsKwh: op.monthlySavingsKwh,
      monthlySavingsSoles: op.monthlySavingsSoles,
      annualSavingsSoles: op.annualSavingsSoles,
      estimatedInvestmentSoles: op.estimatedInvestmentSoles,
      simplePaybackMonths: op.simplePaybackMonths,
      paybackYears: op.paybackYears,
      npv10YearsSoles: op.npv10YearsSoles || 0,
      irrPercent: op.irrPercent || 0,
      co2AvoidedTonsPerYear: op.co2AvoidedTonsPerYear || 0,
      priority: op.priority,
      implementationEase: op.implementationEase,
      equipmentImpacted: op.equipmentImpacted || ''
    });
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateOpportunity(editingId, formState);
    } else {
      addOpportunity(formState);
    }
    setShowAddModal(false);
  };

  const totalInvestmentSoles = computedSavingsOpportunities.reduce((acc, o) => acc + (o.estimatedInvestmentSoles || 0), 0);
  const totalAnnualSavingsSoles = computedSavingsOpportunities.reduce((acc, o) => acc + (o.annualSavingsSoles || 0), 0);
  const totalMonthlySavingsSoles = computedSavingsOpportunities.reduce((acc, o) => acc + (o.monthlySavingsSoles || 0), 0);
  const totalCo2Tons = computedSavingsOpportunities.reduce((acc, o) => acc + (o.co2AvoidedTonsPerYear || 0), 0);
  const blendedPaybackYears = totalAnnualSavingsSoles > 0 ? totalInvestmentSoles / totalAnnualSavingsSoles : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            Plan de Eficiencia Energética y Oportunidades de Ahorro
          </h2>
          <p className="text-xs text-slate-500">
            Medidas cuantificadas con análisis económico: Inversión (CAPEX), Ahorro anual (OPEX), Retorno simple (Payback), VAN y TIR
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>+ Medida de Ahorro</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Financial Synthesis */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Inversión Total Requerida"
          value={`S/. ${(totalInvestmentSoles || 0).toLocaleString()}`}
          subtitle={`${computedSavingsOpportunities?.length || 0} medidas priorizadas`}
          highlightColor="indigo"
          icon={<DollarSign size={18} />}
        />
        <MetricCard
          title="Ahorro Económico Anual"
          value={`S/. ${(totalAnnualSavingsSoles || 0).toLocaleString()}`}
          unit="/año"
          subtitle={`S/. ${(totalMonthlySavingsSoles || 0).toLocaleString()} al mes`}
          highlightColor="emerald"
          icon={<PiggyBank size={18} />}
        />
        <MetricCard
          title="Retorno Global de Inversión"
          value={(blendedPaybackYears || 0).toFixed(1)}
          unit="años"
          subtitle={`${((blendedPaybackYears || 0) * 12).toFixed(0)} meses (Retorno rápido)`}
          highlightColor="amber"
          icon={<TrendingUp size={18} />}
        />
        <MetricCard
          title="Mitigación Ambiental"
          value={(totalCo2Tons || 0).toFixed(1)}
          unit="t CO₂/año"
          subtitle="Reducción de huella de carbono"
          highlightColor="blue"
          icon={<Sparkles size={18} />}
        />
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {computedSavingsOpportunities.map((op, idx) => (
          <div
            key={op.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-xs font-mono font-black text-amber-950 border border-amber-500/30">
                  #{idx + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{op.title}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-semibold text-amber-800">{(op.category || 'GESTION_ENERGETICA').replace(/_/g, ' ')}</span>
                    <span>• Prioridad {op.priority || 'MEDIA'}</span>
                    <span>• Facilidad {op.implementationEase || 'MEDIA'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(op)}
                  className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                  title="Editar medida"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => deleteOpportunity(op.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  title="Eliminar medida"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {op.description}
            </p>

            {/* Financial Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Inversión (CAPEX)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  S/. {op.estimatedInvestmentSoles?.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ahorro Anual</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  S/. {op.annualSavingsSoles?.toLocaleString()} /año
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Retorno Simple</span>
                <span className="font-mono font-bold text-amber-900 text-sm">
                  {op.paybackYears ? `${op.paybackYears} años` : `${op.simplePaybackMonths} m`}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Rentabilidad TIR / VAN</span>
                <span className="font-mono font-bold text-blue-700 text-sm">
                  TIR {op.irrPercent || 35}% • S/. {op.npv10YearsSoles?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {computedSavingsOpportunities.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400">
            No hay medidas de ahorro registradas. Haga clic en "+ Medida de Ahorro" para incorporar propuestas de optimización técnica.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-hidden">
          <div className="w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 py-3.5 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                  <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                    {editingId ? 'Editar Medida de Eficiencia' : 'Registrar Nueva Medida de Ahorro'}
                  </h3>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Oportunidad de ahorro energético y económico</p>
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
              <div className="overflow-y-auto p-4 sm:p-6 space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Título de la Oportunidad *</label>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={e => setFormState({ ...formState, title: e.target.value })}
                    placeholder="Ej. Compensación con Banco de Condensadores Automático"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
                    <select
                      value={formState.category}
                      onChange={e => setFormState({ ...formState, category: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="FACTOR_POTENCIA">Factor de Potencia / Reactiva</option>
                      <option value="ILUMINACION_LED">Iluminación Eficiente LED</option>
                      <option value="MOTORES_VFD">Motores Eficientes / Variadores VFD</option>
                      <option value="SOLAR_FOTOVOLTAICA">Solar Fotovoltaica</option>
                      <option value="CONDUCTORES_TERMICOS">Conductores / Reducción Pérdidas</option>
                      <option value="BUENAS_PRACTICAS">Buenas Prácticas Operativas</option>
                      <option value="CAMBIO_TARIFA">Cambio de Opción Tarifaria</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Prioridad de Ejecución</label>
                    <select
                      value={formState.priority}
                      onChange={e => setFormState({ ...formState, priority: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="ALTA">Alta (Inmediata / Retorno &lt; 1 año)</option>
                      <option value="MEDIA">Media (Mediano Plazo / 1-3 años)</option>
                      <option value="BAJA">Baja (Largo Plazo / &gt; 3 años)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Descripción Técnica Detallada</label>
                  <textarea
                    rows={2}
                    value={formState.description}
                    onChange={e => setFormState({ ...formState, description: e.target.value })}
                    placeholder="Explique en qué consiste la intervención técnica y los equipos afectados..."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Inversión (S/.) *</label>
                    <input
                      type="number"
                      value={formState.estimatedInvestmentSoles}
                      onChange={e => {
                        const inv = Number(e.target.value);
                        const savAnnual = formState.annualSavingsSoles || 1;
                        setFormState({
                          ...formState,
                          estimatedInvestmentSoles: inv,
                          paybackYears: Number((inv / savAnnual).toFixed(1)),
                          simplePaybackMonths: Number(((inv / savAnnual) * 12).toFixed(1))
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ahorro Mensual (S/.) *</label>
                    <input
                      type="number"
                      value={formState.monthlySavingsSoles}
                      onChange={e => {
                        const mSav = Number(e.target.value);
                        const savAnnual = mSav * 12;
                        const inv = formState.estimatedInvestmentSoles || 1;
                        setFormState({
                          ...formState,
                          monthlySavingsSoles: mSav,
                          annualSavingsSoles: savAnnual,
                          paybackYears: Number((inv / savAnnual).toFixed(1)),
                          simplePaybackMonths: Number(((inv / savAnnual) * 12).toFixed(1))
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold text-emerald-800 focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ahorro Anual (S/.)</label>
                    <input
                      type="number"
                      value={formState.annualSavingsSoles}
                      onChange={e => setFormState({ ...formState, annualSavingsSoles: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold text-emerald-800 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
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
                  {editingId ? 'Guardar Medida' : 'Registrar Medida'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
