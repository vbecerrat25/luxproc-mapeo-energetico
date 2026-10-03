import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { MetricCard } from '../shared/MetricCard';
import { TrafficBadge } from '../shared/TrafficBadge';
import { 
  Zap, 
  ShieldCheck, 
  Gauge, 
  AlertTriangle, 
  PiggyBank, 
  Activity, 
  Cpu, 
  SlidersHorizontal, 
  CheckCircle2, 
  TrendingUp, 
  ArrowRight,
  SunMedium,
  Flame,
  FileBadge,
  RotateCcw,
  FolderCheck,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { TariffRecommendationCard } from '../tariff/TariffRecommendationCard';

export const ExecutiveDashboard: React.FC = () => {
  const {
    diagnostic,
    equipmentSummary,
    demandBalance,
    receiptsStats,
    receiptComparison,
    safetyEvaluation,
    efficiencyEvaluation,
    computedEquipment,
    computedSavingsOpportunities,
    setActiveTab,
    clearActiveWorkspace,
    savedProjects
  } = useDiagnostic();
  const { t, language } = useLanguage();

  const rt = (esText: string, enText: string, ptText?: string): string => {
    if (language === 'en') return enText;
    if (language === 'pt') return ptText || enText;
    return esText;
  };

  const [showCleanModal, setShowCleanModal] = useState(false);

  // Top 5 equipment consumers
  const topConsumers = [...(computedEquipment || [])]
    .sort((a, b) => (b.monthlyKwh || 0) - (a.monthlyKwh || 0))
    .slice(0, 5);

  // Category Pie Chart Data
  const pieColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#64748b'];
  const categoriesList = equipmentSummary?.categoryBreakdown || equipmentSummary?.byCategory || [];
  const categoryData = categoriesList.map((cat, idx) => ({
    name: cat.category,
    value: Math.round(cat.monthlyKwh),
    cost: Math.round(cat.monthlyCostSoles),
    color: pieColors[idx % pieColors.length]
  }));

  // Receipts vs Model Bar Chart Data
  const receiptsList = diagnostic?.receipts || [];
  const receiptsChartData = receiptsList.slice(-6).map(r => ({
    name: `${(r.month || '').substring(0, 3)} ${String(r.year || '').slice(2)}`,
    FacturadoKwh: r.kwhConsumed || 0,
    CensoCalculadoKwh: Math.round(equipmentSummary?.totalMonthlyKwh || 0),
    CostoSoles: r.costSoles || 0
  }));

  // Total annual potential savings
  const totalAnnualSavingsSoles = (computedSavingsOpportunities || []).reduce(
    (acc, o) => acc + (o.annualSavingsSoles || 0), 0
  );

  // Calculations for progress & completion
  const totalAuditPoints = 6;
  const circuitsList = diagnostic?.circuits || [];
  const groundingList = diagnostic?.grounding || [];
  const passedAuditPoints = [
    groundingList[0]?.complianceStatus === 'ADECUADO',
    !circuitsList.some(c => c.wireStatus === 'NO_ADECUADO'),
    !circuitsList.some(c => c.breakerStatus === 'NO_ADECUADO'),
    !circuitsList.some(c => !c.rcdExistingA || c.rcdStatus === 'NO_ADECUADO'),
    !circuitsList.some(c => c.voltageDropStatus === 'NO_ADECUADO'),
    (receiptsStats?.averagePowerFactor || 0) >= 0.96
  ].filter(Boolean).length;
  const auditProgressPct = Math.round((passedAuditPoints / totalAuditPoints) * 100);

  const criticalObservationsCount = [
    groundingList[0]?.complianceStatus === 'NO_ADECUADO',
    circuitsList.some(c => c.wireStatus === 'NO_ADECUADO'),
    circuitsList.some(c => c.breakerStatus === 'NO_ADECUADO'),
    circuitsList.some(c => !c.rcdExistingA),
    (receiptsStats?.averagePowerFactor || 1) < 0.96
  ].filter(Boolean).length;

  const getInstallationLabel = (type?: string) => {
    switch ((type || '').toLowerCase()) {
      case 'industria':
      case 'industrial':
        return rt('Planta Industrial / Manufactura General', 'Industrial Plant / Manufacturing', 'Planta Industrial / Manufatura');
      case 'comercio':
      case 'comercial':
        return rt('Local Comercial / Restaurante', 'Commercial Facility / Retail', 'Estabelecimento Comercial / Restaurante');
      case 'vivienda':
        return rt('Vivienda Residencial', 'Residential Facility', 'Residencial');
      case 'oficina':
        return rt('Oficinas / Centro Corporativo', 'Offices / Corporate Facility', 'Escritórios / Corporativo');
      case 'almacen':
        return rt('Almacén / Centro Logístico', 'Warehouse / Logistics Center', 'Armazém / Centro Logístico');
      case 'educativo':
        return rt('Centro Educativo', 'Educational Facility', 'Centro Educacional');
      case 'salud':
        return rt('Centro de Salud / Clínica', 'Healthcare / Clinic', 'Centro de Saúde / Clínica');
      case 'institucion':
        return rt('Entidad Institucional', 'Institutional Facility', 'Entidade Institucional');
      case 'calzado':
        return rt('Sector Manufactura / Calzado', 'Footwear Manufacturing', 'Manufatura / Calçados');
      default:
        return rt('Instalación Activa', 'Active Facility', 'Instalação Ativa');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      
      {/* Workspace Management & Clean Platform Banner */}
      <div className="bg-white rounded-2xl sm:rounded-[28px] p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900">
                {t('dash.clean_banner_title', 'Espacio de Trabajo & Gestión de Proyectos')}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {savedProjects.length}/2 {language === 'es' ? 'trabajos guardados' : 'saved projects'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              {t('dash.clean_banner_desc', 'Inicie un peritaje desde cero o limpie los datos previamente guardados en la plataforma con un solo clic.')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <FolderCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t('nav.saved_projects', 'Trabajos Realizados')} ({savedProjects.length}/2)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCleanModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 text-xs font-black transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('dash.clean_banner_action', 'Limpiar Plataforma Ahora')}</span>
          </button>
        </div>
      </div>

      {/* 1. Bento Grid Primary Level */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
        
        {/* Main Hero Bento Card (Col 8) */}
        <div className="md:col-span-8 bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-7 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {getInstallationLabel(diagnostic.generalData.installationType)}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Cód: {diagnostic.generalData.diagnosticCode || 'E-2026'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              {diagnostic.generalData.companyName || diagnostic.generalData.clientName || 'Auditoría Energética & Eléctrica'}
            </h2>
            <p className="text-slate-500 font-medium text-xs mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
              <span>📍 {diagnostic.generalData.district || diagnostic.generalData.city}, {diagnostic.generalData.department}</span>
              <span>⚡ {diagnostic.tariff.supplyVoltage}V ({diagnostic.tariff.phases === 'TRIFASICO' ? 'Trifásico 3Ø' : 'Monofásico 1Ø'})</span>
              <span>🏢 Tarifa {diagnostic.tariff.tariffCode}</span>
            </p>
          </div>

          <div className="relative z-10 mt-5 pt-4 sm:pt-5 border-t border-slate-100/80 flex flex-wrap items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-8">
              <div>
                <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{rt('Cumplimiento CNE', 'Code Compliance', 'Conformidade CNE')}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800 font-sans">{auditProgressPct}%</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{rt('Demanda Máx', 'Max Demand', 'Demanda Máx')}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-800 font-sans">{(demandBalance?.maximumDemandKw ?? 0).toFixed(1)} <span className="text-sm font-normal text-slate-400">kW</span></p>
              </div>
              <div className="block">
                <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{rt('Factor Potencia', 'Power Factor', 'Fator Potência')}</p>
                <p className={`text-xl sm:text-2xl font-bold font-sans ${(receiptsStats?.averagePowerFactor ?? 0.85) < 0.96 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {(receiptsStats?.averagePowerFactor ?? 0.85).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto sm:flex-grow sm:max-w-xs bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(auditProgressPct, 15)}%` }}
              ></div>
            </div>

            <button
              onClick={() => setActiveTab('report')}
              className="w-full sm:w-auto bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileBadge className="h-3.5 w-3.5 text-amber-400" />
              <span>{rt('Ver Dictamen CIP', 'View CIP Report', 'Ver Parecer CIP')}</span>
            </button>
          </div>

          {/* Decorative ambient bubble */}
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-50/70 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Slate-900 Dark Bento Card (Col 4) */}
        <div className="md:col-span-4 bg-slate-900 rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl flex flex-col justify-between text-white relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/10 rounded-2xl text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              S/. {((totalAnnualSavingsSoles || 0) / 12).toFixed(0)}/{rt('mes ahorro', 'mo. savings', 'mês economia')}
            </span>
          </div>

          <div className="my-4">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{rt('Ahorro Anual Identificado', 'Identified Annual Savings', 'Economia Anual Identificada')}</p>
            <p className="text-3xl font-bold tracking-tight mt-1 text-white font-sans">
              S/. {totalAnnualSavingsSoles.toLocaleString(language === 'en' ? 'en-US' : language === 'pt' ? 'pt-BR' : 'es-PE', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {rt(`En ${computedSavingsOpportunities.length} medidas de optimización CNE/RNE`, `Across ${computedSavingsOpportunities.length} efficiency measures`, `Em ${computedSavingsOpportunities.length} medidas de eficiência`)}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('opportunities')}
            className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-2 px-3 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>{rt('Explorar Plan de Ahorro', 'Explore Savings Plan', 'Explorar Plano de Economia')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* 2. Bento Grid Secondary Level */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Amber Alert Bento Card (Col 4) */}
        <div className="md:col-span-4 bg-amber-50 rounded-[32px] p-6 flex flex-col justify-between border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></div>
              <p className="font-bold text-amber-900 text-sm">
                {criticalObservationsCount === 0 ? 'Sin Riesgos Críticos' : `${criticalObservationsCount} Observaciones Críticas`}
              </p>
            </div>
            <span 
              onClick={() => setActiveTab('circuits')}
              className="text-amber-700 text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:underline"
            >
              Auditar
            </span>
          </div>

          <div className="space-y-1.5 my-3 text-xs text-amber-900/80">
            {diagnostic.grounding[0]?.complianceStatus === 'NO_ADECUADO' && (
              <p className="truncate">• Puesta a tierra supera 25Ω ({diagnostic.grounding[0].measuredResistanceOhm || 0}Ω)</p>
            )}
            {(receiptsStats?.averagePowerFactor ?? 0.85) < 0.96 && (
              <p className="truncate">• Factor de Potencia con penalidad (cosφ {(receiptsStats?.averagePowerFactor ?? 0.85).toFixed(2)})</p>
            )}
            {diagnostic.circuits.some(c => !c.rcdExistingA) && (
              <p className="truncate">• Circuitos sin protección diferencial 30mA humana</p>
            )}
            {criticalObservationsCount === 0 && (
              <p className="text-slate-600">Instalación con protecciones y puesta a tierra conformes al CNE.</p>
            )}
          </div>

          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-amber-800">
            <span>Prioridad Alta</span>
            <span>Norma CNE 060-010</span>
          </div>
        </div>

        {/* Indigo Cloud / PV Capacity Bento Card (Col 5) */}
        <div className="md:col-span-5 bg-indigo-600 rounded-[32px] p-6 text-white relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="bg-white/20 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Generación & Solar
              </span>
              <SunMedium className="h-5 w-5 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold mt-2">Potencial Fotovoltaico</h3>
            <p className="text-indigo-100 text-xs mt-0.5">
              {diagnostic.solar ? `Sistema propuesto de ${diagnostic.solar.scenarioKwp} kWp con inversor ${diagnostic.solar.inverterPowerKw || Math.round(diagnostic.solar.scenarioKwp * 0.95) || 15} kW trifásico` : 'Evaluación solar para autogeneración limpia'}
            </p>
          </div>

          <div className="mt-4 relative z-10">
            <div className="flex justify-between mb-1.5 text-xs font-bold uppercase">
              <span>{diagnostic.solar ? `${diagnostic.solar.scenarioKwp} kWp instalado` : '3.3 kWp sugerido'}</span>
              <span onClick={() => setActiveTab('solar')} className="cursor-pointer underline">Ver Retorno</span>
            </div>
            <div className="h-2 bg-indigo-950/40 rounded-full overflow-hidden">
              <div className="bg-amber-300 h-full w-[70%]"></div>
            </div>
          </div>

          <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        {/* Emerald Team / Status Bento Card (Col 3) */}
        <div className="md:col-span-3 bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 flex flex-col justify-between shadow-xs">
          <p className="text-emerald-900 font-bold text-sm">Estado de Índices</p>
          <div className="space-y-2.5 my-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-900 font-medium">Seguridad Eléctrica</span>
              <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-lg">
                {safetyEvaluation.score}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-900 font-medium">Eficiencia Energética</span>
              <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-lg">
                {efficiencyEvaluation.score}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-900/70 font-medium">Pozo a Tierra</span>
              <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-lg border border-slate-100">
                {diagnostic.grounding[0]?.measuredResistanceOhm || diagnostic.grounding[0]?.calculatedTheoreticalResistanceOhm || 15} Ω
              </span>
            </div>
          </div>
          <div className="pt-3 border-t border-emerald-200/70">
            <button 
              onClick={() => setActiveTab('circuits')}
              className="w-full text-center text-xs font-bold text-emerald-800 hover:text-emerald-900"
            >
              Auditar Tableros →
            </button>
          </div>
        </div>

      </div>

      {/* OSINERGMIN Tariff Recommendation & Savings Banner */}
      <TariffRecommendationCard compact={false} />

      {/* 3. Detailed Analysis Bento Tiles: Charts & Top Consumers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Recibos vs Consumo Modelado Bento Card (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Curva de Facturación
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">Historial de Recibos vs Censo</h3>
              <p className="text-xs text-slate-500">Energía facturada mensual vs censo físico modelado</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              receiptComparison.accuracyLevel === 'ALTA_COINCIDENCIA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}>
              Desviación: {receiptComparison.differencePercent}%
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receiptsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val: number) => [`${val.toLocaleString()} kWh`, '']}
                  contentStyle={{ fontSize: '12px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="FacturadoKwh" name="Facturado en Recibo" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="CensoCalculadoKwh" name="Calculado en Censo" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-600 bg-[#f8f9fb] p-3.5 rounded-2xl border border-slate-100">
            💡 {receiptComparison.diagnosticExplanation}
          </p>
        </div>

        {/* Top Consumers Table Bento Card (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Cargas Críticas
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Top 5 Mayor Consumo</h3>
              </div>
              <button
                onClick={() => setActiveTab('equipment')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Ver todos ({computedEquipment.length}) →
              </button>
            </div>

            <div className="space-y-2.5 mt-4">
              {topConsumers.map((item, idx) => {
                const pct = equipmentSummary.totalMonthlyKwh > 0 
                  ? ((item.monthlyKwh || 0) / equipmentSummary.totalMonthlyKwh) * 100 
                  : 0;

                return (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-[#f8f9fb] p-3 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white shadow-xs text-xs font-bold text-slate-800 border border-slate-100">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs truncate max-w-[170px]" title={item.name}>
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.category} • {item.hoursPerDay}h/día
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900 font-sans">
                        {Math.round(item.monthlyKwh || 0).toLocaleString()} kWh
                      </div>
                      <div className="text-[10px] font-bold text-indigo-600">
                        {pct.toFixed(1)}% • S/. {Math.round(item.monthlyCostSoles || 0)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Suma de 5 principales:</span>
            <span className="font-bold text-slate-900">
              {Math.round(topConsumers.reduce((acc, c) => acc + (c.monthlyKwh || 0), 0)).toLocaleString()} kWh/mes
            </span>
          </div>
        </div>

      </div>

      {/* Confirmation Modal to Clean Platform */}
      {showCleanModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowCleanModal(false)}
        >
          <div 
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {t('header.clean_confirm_title', '¿Limpiar toda la plataforma web?')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('header.clean_confirm_desc', 'Se restablecerán todos los datos cargados para iniciar un nuevo proyecto en blanco. Recuerde que puede guardar el proyecto actual en "Trabajos Realizados" antes de limpiar.')}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCleanModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                {t('header.cancel', 'Cancelar')}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearActiveWorkspace();
                  setShowCleanModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-all"
              >
                {t('header.confirm', 'Sí, Limpiar Todo')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
