import React from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { MetricCard } from '../shared/MetricCard';
import { 
  SunMedium, 
  Zap, 
  PiggyBank, 
  TrendingUp, 
  Leaf, 
  Sliders, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const SolarTab: React.FC = () => {
  const {
    diagnostic,
    equipmentSummary,
    updateSolar
  } = useDiagnostic();

  const defaultSolar = {
    scenarioKwp: 10.0,
    dailyHsp: 5.2,
    panelCount: 18,
    panelPowerW: 550,
    inverterPowerKw: 10.0,
    monthlyGenerationKwh: 1250,
    annualGenerationKwh: 15000,
    systemType: 'ON_GRID' as const,
    roofAreaRequiredM2: 50,
    estimatedInvestmentSoles: 36000,
    annualSavingsSoles: 11250,
    paybackYears: 3.2,
    co2AvoidedTonsPerYear: 6.2,
    batteryCapacityKwh: 0
  };

  const solarData = {
    ...defaultSolar,
    ...(diagnostic.solar || {})
  };

  const DEPARTMENT_HSP: Record<string, number> = {
    'La Libertad': 5.2,
    'Lima': 4.8,
    'Arequipa': 6.0,
    'Piura': 5.5,
    'Lambayeque': 5.3,
    'Ica': 5.7,
    'Tacna': 5.9,
    'Moquegua': 6.1,
    'Cusco': 5.4,
    'Puno': 5.6,
    'Junín': 5.0,
    'Áncash': 5.1
  };

  const handleKwpChange = (kwp: number) => {
    const hsp = solarData.dailyHsp || 5.2;
    const pr = 0.80; // Performance ratio
    const panelPower = 550;
    const panelCount = Math.ceil((kwp * 1000) / panelPower);
    const actualKwp = (panelCount * panelPower) / 1000;
    const annualKwh = actualKwp * hsp * 365 * pr;
    const monthlyKwh = annualKwh / 12;
    const tariffPrice = diagnostic.tariff.activeEnergyPriceKwh || 0.75;
    const annualSavings = annualKwh * tariffPrice;
    const investment = actualKwp * 3600; // ~ 3600 S/. per kWp installed
    const payback = annualSavings > 0 ? investment / annualSavings : 0;
    const co2Tons = (annualKwh * 0.41) / 1000; // 0.41 kg CO2 / kWh grid factor Peru
    const roofArea = panelCount * 2.6; // ~2.6 m2 per 550W panel

    updateSolar({
      scenarioKwp: Number(actualKwp.toFixed(1)),
      panelCount,
      panelPowerW: panelPower,
      inverterPowerKw: Number(actualKwp.toFixed(1)),
      monthlyGenerationKwh: Number(monthlyKwh.toFixed(0)),
      annualGenerationKwh: Number(annualKwh.toFixed(0)),
      roofAreaRequiredM2: Number(roofArea.toFixed(0)),
      estimatedInvestmentSoles: Number(investment.toFixed(0)),
      annualSavingsSoles: Number(annualSavings.toFixed(0)),
      paybackYears: Number(payback.toFixed(1)),
      co2AvoidedTonsPerYear: Number(co2Tons.toFixed(2))
    });
  };

  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
  const chartData = months.map(m => ({
    mes: m,
    GeneracionSolarKwh: Math.round(solarData.monthlyGenerationKwh),
    ConsumoCensoKwh: Math.round(equipmentSummary.totalMonthlyKwh)
  }));

  const solarFraction = equipmentSummary.totalMonthlyKwh > 0
    ? (solarData.monthlyGenerationKwh / equipmentSummary.totalMonthlyKwh) * 100
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            Dimensionamiento Solar Fotovoltaico para Autoconsumo
          </h2>
          <p className="text-xs text-slate-500">
            Estimación de recurso solar en Perú (Atlas de Radiación Solar MEM/SENAMHI), rendimiento PR 80%, ahorro y reducción de huella de carbono
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200">
            ☀️ {diagnostic.generalData.department || 'La Libertad'}: {solarData.dailyHsp} HSP
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Potencia Solar Pico"
          value={(solarData.scenarioKwp ?? 10).toFixed(1)}
          unit="kWp"
          subtitle={`${solarData.panelCount ?? 18} módulos Tier-1 (${solarData.panelPowerW ?? 550}W)`}
          highlightColor="amber"
          icon={<SunMedium size={18} />}
        />
        <MetricCard
          title="Generación Estimada"
          value={(solarData.monthlyGenerationKwh ?? 1250).toLocaleString()}
          unit="kWh/mes"
          subtitle={`${(solarData.annualGenerationKwh ?? 15000).toLocaleString()} kWh/año`}
          highlightColor="indigo"
          icon={<Zap size={18} />}
        />
        <MetricCard
          title="Ahorro Anual Estimado"
          value={`S/. ${(solarData.annualSavingsSoles ?? 11250).toLocaleString()}`}
          unit="/año"
          subtitle={`Payback: ${solarData.paybackYears ?? 3.2} años (Retorno)`}
          highlightColor="emerald"
          icon={<PiggyBank size={18} />}
        />
        <MetricCard
          title="CO₂ Evitado al Año"
          value={(solarData.co2AvoidedTonsPerYear ?? 6.2).toFixed(1)}
          unit="ton CO₂"
          subtitle="Equivale a 280 árboles"
          highlightColor="emerald"
          icon={<Leaf size={18} />}
        />
      </div>

      {/* Interactive Sizing Engine & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders size={18} className="text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Simulador de Capacidad Solar</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Potencia del Sistema Fotovoltaico:</span>
                <span className="font-mono font-bold text-amber-900 text-sm">{solarData.scenarioKwp} kWp</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="50.0"
                step="0.5"
                value={solarData.scenarioKwp}
                onChange={e => handleKwpChange(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 kWp (Residencial)</span>
                <span>15 kWp (Taller Calzado)</span>
                <span>50 kWp (Industrial)</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">Tipo de Sistema Solar:</label>
              <select
                value={solarData.systemType}
                onChange={e => updateSolar({ systemType: e.target.value as any })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold focus:border-amber-500 focus:outline-none"
              >
                <option value="ON_GRID">On-Grid (Conectado a Red / Autoconsumo)</option>
                <option value="ZERO_INJECTION">Con Inyección Cero (Anti-vertido)</option>
                <option value="HYBRID">Híbrido (Solar + Baterías Litio LFP)</option>
                <option value="OFF_GRID">Off-Grid (Aislado / Baterías)</option>
              </select>
            </div>

            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800">Especificaciones de Ingeniería:</div>
              <div className="flex justify-between">
                <span className="text-slate-500">Módulos Solares:</span>
                <span className="font-mono font-bold text-slate-900">{solarData.panelCount} paneles de {solarData.panelPowerW}W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inversor Central / String:</span>
                <span className="font-mono font-bold text-slate-900">{solarData.inverterPowerKw} kW ({diagnostic.tariff.phases === 'TRIFASICO' ? '380V Trifásico' : '220V Monofásico'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Área de Techo Requerida:</span>
                <span className="font-mono font-bold text-slate-900">{solarData.roofAreaRequiredM2} m²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Inversión Estimada (Llave en mano):</span>
                <span className="font-mono font-bold text-amber-900">S/. {(solarData.estimatedInvestmentSoles ?? 36000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cobertura de Consumo:</span>
                <span className="font-mono font-bold text-emerald-700">{(solarFraction || 0).toFixed(1)}% de la demanda</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart: Solar Generation vs Monthly Consumption */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Perfil de Autoconsumo: Generación Solar vs Demanda Actual
              </h3>
              <p className="text-xs text-slate-500">
                Comparación mensual de energía fotovoltaica generada vs consumo de la instalación
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(val: number) => [`${(val || 0).toLocaleString()} kWh`, '']}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="ConsumoCensoKwh" name="Consumo Total de Planta (kWh)" fill="#64748b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="GeneracionSolarKwh" name="Generación Solar Estimada (kWh)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-950">
            <span className="font-bold">Análisis de Viabilidad: </span>
            El sistema propuesto de {solarData.scenarioKwp} kWp abastece el {(solarFraction || 0).toFixed(0)}% del consumo mensual. La inversión de S/. {(solarData.estimatedInvestmentSoles ?? 36000).toLocaleString()} se recupera en un periodo estimado de {solarData.paybackYears ?? 3.2} años, dejando más de 20 años de energía gratuita y limpia.
          </div>
        </div>

      </div>

    </div>
  );
};
