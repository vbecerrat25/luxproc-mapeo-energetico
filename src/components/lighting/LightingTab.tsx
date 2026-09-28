import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { LightingRecord, LightingTechnology } from '../../types';
import { MetricCard } from '../shared/MetricCard';
import { TrafficBadge } from '../shared/TrafficBadge';
import { 
  Lightbulb, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Sun, 
  Zap,
  TrendingDown,
  X
} from 'lucide-react';
import { LumenLightingCalculator } from './LumenLightingCalculator';

export const LightingTab: React.FC = () => {
  const {
    diagnostic,
    addLightingRoom,
    updateLightingRoom,
    deleteLightingRoom
  } = useDiagnostic();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<Omit<LightingRecord, 'id'>>({
    roomName: 'Área de Aparado y Costura',
    visualTask: 'Costura fina en cuero y pespunte',
    areaM2: 45,
    lengthM: 9.0,
    widthM: 5.0,
    heightM: 3.2,
    workplaneHeightM: 0.85,
    requiredLuxRne: 750,
    measuredLux: 320,
    currentTech: 'FLUORESCENTE_T8',
    currentLampCount: 16,
    currentLampPowerW: 36,
    currentTotalPowerW: 576,
    dailyHours: 8,
    recommendedTech: 'LED_HIGH_BAY',
    recommendedLampCount: 8,
    recommendedLampPowerW: 40,
    recommendedTotalPowerW: 320,
    calculatedRoomIndexK: 1.6,
    maintenanceFactor: 0.8,
    utilizationFactor: 0.65,
    powerDensityWPerM2: 12.8,
    maxAllowedPowerDensityWPerM2: 10.0,
    complianceStatus: 'NO_ADECUADO',
    monthlySavingsKwh: 66.5,
    monthlySavingsSoles: 50.0,
    observations: 'Nivel lumínico muy bajo para costura fina; riesgo de fatiga visual y defectos de confección'
  });

  const RNE_PRESETS: { name: string; task: string; lux: number }[] = [
    { name: 'Área de Corte y Desbaste', task: 'Corte de cuero y marcado manual', lux: 500 },
    { name: 'Área de Aparado / Costura', task: 'Costura fina, pespunte y remallado', lux: 750 },
    { name: 'Área de Armado y Montado', task: 'Montado de capellada y pegado suela', lux: 400 },
    { name: 'Área de Acabado e Inspección', task: 'Control de calidad fino y empaque', lux: 600 },
    { name: 'Almacén de Materiales / Químicos', task: 'Almacenamiento y tránsito de carga', lux: 150 },
    { name: 'Oficinas / Diseño y Patronaje CAD', task: 'Trabajo continuo en pantalla y patronaje', lux: 500 },
    { name: 'Sala / Comedor Residencial', task: 'Uso general y descanso', lux: 150 },
    { name: 'Cocina / Preparación Alimentos', task: 'Manipulación y cocina', lux: 300 },
    { name: 'Dormitorio / Habitaciones', task: 'Descanso e iluminación tenue', lux: 100 }
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormState({
      roomName: 'Área de Armado y Montado',
      visualTask: 'Pegado y reactivado de suelas',
      areaM2: 50,
      lengthM: 10.0,
      widthM: 5.0,
      heightM: 3.5,
      workplaneHeightM: 0.85,
      requiredLuxRne: 400,
      measuredLux: 220,
      currentTech: 'FLUORESCENTE_T8',
      currentLampCount: 12,
      currentLampPowerW: 36,
      currentTotalPowerW: 432,
      dailyHours: 8,
      recommendedTech: 'LED_PANEL',
      recommendedLampCount: 6,
      recommendedLampPowerW: 45,
      recommendedTotalPowerW: 270,
      calculatedRoomIndexK: 1.5,
      maintenanceFactor: 0.8,
      utilizationFactor: 0.65,
      powerDensityWPerM2: 8.64,
      maxAllowedPowerDensityWPerM2: 10.0,
      complianceStatus: 'NO_ADECUADO',
      monthlySavingsKwh: 42.0,
      monthlySavingsSoles: 31.5,
      observations: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (l: LightingRecord) => {
    setEditingId(l.id);
    setFormState({
      roomName: l.roomName,
      visualTask: l.visualTask,
      areaM2: l.areaM2,
      lengthM: l.lengthM || 10,
      widthM: l.widthM || 5,
      heightM: l.heightM || 3.0,
      workplaneHeightM: l.workplaneHeightM || 0.85,
      requiredLuxRne: l.requiredLuxRne,
      measuredLux: l.measuredLux || 0,
      currentTech: l.currentTech,
      currentLampCount: l.currentLampCount,
      currentLampPowerW: l.currentLampPowerW,
      currentTotalPowerW: l.currentTotalPowerW,
      dailyHours: l.dailyHours,
      recommendedTech: l.recommendedTech,
      recommendedLampCount: l.recommendedLampCount,
      recommendedLampPowerW: l.recommendedLampPowerW,
      recommendedTotalPowerW: l.recommendedTotalPowerW,
      calculatedRoomIndexK: l.calculatedRoomIndexK || 1.5,
      maintenanceFactor: l.maintenanceFactor || 0.8,
      utilizationFactor: l.utilizationFactor || 0.65,
      powerDensityWPerM2: l.powerDensityWPerM2,
      maxAllowedPowerDensityWPerM2: l.maxAllowedPowerDensityWPerM2 || 10,
      complianceStatus: l.complianceStatus,
      monthlySavingsKwh: l.monthlySavingsKwh,
      monthlySavingsSoles: l.monthlySavingsSoles,
      observations: l.observations || ''
    });
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateLightingRoom(editingId, formState);
    } else {
      addLightingRoom(formState);
    }
    setShowAddModal(false);
  };

  const totalCurrentLightingPowerW = diagnostic.lighting.reduce((acc, l) => acc + (l.currentTotalPowerW || 0), 0);
  const totalRecommendedLightingPowerW = diagnostic.lighting.reduce((acc, l) => acc + (l.recommendedTotalPowerW || 0), 0);
  const totalMonthlyLightingSavingsSoles = diagnostic.lighting.reduce((acc, l) => acc + (l.monthlySavingsSoles || 0), 0);
  const nonCompliantCount = diagnostic.lighting.filter(l => l.complianceStatus === 'NO_ADECUADO').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            Diagnóstico de Iluminación y Cumplimiento RNE EM.010
          </h2>
          <p className="text-xs text-slate-500">
            Cálculo fotométrico por método de lúmenes (cavidad zonal), luximetría de campo y modernización a tecnología LED de alta eficiencia
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm transition-colors"
        >
          <Plus size={14} />
          <span>+ Ambiente / Área</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Potencia Iluminación Actual"
          value={((totalCurrentLightingPowerW || 0) / 1000).toFixed(2)}
          unit="kW"
          subtitle={`${diagnostic.lighting?.length || 0} áreas evaluadas`}
          highlightColor="amber"
          icon={<Lightbulb size={18} />}
        />
        <MetricCard
          title="Potencia Proyectada LED"
          value={((totalRecommendedLightingPowerW || 0) / 1000).toFixed(2)}
          unit="kW"
          subtitle={`Reducción del ${totalCurrentLightingPowerW > 0 ? (((totalCurrentLightingPowerW - totalRecommendedLightingPowerW) / totalCurrentLightingPowerW) * 100).toFixed(0) : 0}%`}
          highlightColor="emerald"
          icon={<TrendingDown size={18} />}
        />
        <MetricCard
          title="Ahorro Mensual LED"
          value={`S/. ${(totalMonthlyLightingSavingsSoles || 0).toFixed(0)}`}
          unit="/mes"
          subtitle={`S/. ${((totalMonthlyLightingSavingsSoles || 0) * 12).toFixed(0)} al año`}
          highlightColor="blue"
          icon={<Zap size={18} />}
        />
        <MetricCard
          title="Cumplimiento Lux RNE"
          value={nonCompliantCount === 0 ? '100% Conforme' : `${nonCompliantCount} Deficientes`}
          subtitle={nonCompliantCount === 0 ? 'Niveles óptimos' : 'Riesgo de fatiga visual'}
          highlightColor={nonCompliantCount === 0 ? 'emerald' : 'rose'}
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      {/* Photometric Lumen/Cavity Ratio Calculator: Focos according to Area and Height */}
      <LumenLightingCalculator />

      {/* Lighting Rooms Table & Mobile Cards */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Evaluación Fotométrica por Ambientes de Trabajo ({diagnostic.lighting.length} áreas)
            </h3>
          </div>
          <button
            onClick={handleOpenAdd}
            className="sm:hidden flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1.5 text-[11px] font-bold text-slate-950"
          >
            <Plus size={13} />
            <span>Agregar</span>
          </button>
        </div>

        {/* Mobile Cards View (< md) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {diagnostic.lighting.map(l => {
            const isCompliant = (l.measuredLux || 0) >= (l.requiredLuxRne || 0);
            return (
              <div key={l.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{l.roomName}</h4>
                    <p className="text-xs text-slate-500 truncate">{l.visualTask || 'Sin tarea especificada'}</p>
                  </div>
                  <TrafficBadge 
                    status={l.complianceStatus} 
                    label={l.complianceStatus === 'ADECUADO' ? 'Conforme' : 'Deficiente'} 
                    size="sm" 
                  />
                </div>

                {/* Lux metrics strip */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-medium">Área</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{l.areaM2} m²</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-medium">Lux RNE</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{l.requiredLuxRne} lux</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-medium">Lux Medido</span>
                    <span className={`font-mono text-xs font-bold ${isCompliant ? 'text-emerald-700' : 'text-rose-600 font-black'}`}>
                      {l.measuredLux || '-'} lux
                    </span>
                  </div>
                </div>

                {/* Luminaires comparison */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-100/70 p-2 border border-slate-200/50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Actual</span>
                    <div className="font-medium text-slate-800 text-[11px]">
                      {l.currentLampCount}x {l.currentTech ? l.currentTech.replace('_', ' ') : 'FLUORESCENTE'}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{l.currentTotalPowerW} W</span>
                  </div>
                  <div className="rounded-lg bg-emerald-50/80 p-2 border border-emerald-200/60">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">Propuesta LED</span>
                    <div className="font-bold text-emerald-900 text-[11px]">
                      {l.recommendedLampCount}x {l.recommendedTech ? l.recommendedTech.replace('_', ' ') : 'LED'}
                    </div>
                    <span className="font-mono text-[10px] text-emerald-600 font-bold">{l.recommendedTotalPowerW} W</span>
                  </div>
                </div>

                {/* Footer with savings and actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-500">Ahorro:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      S/. {(l.monthlySavingsSoles || 0).toFixed(2)}/mes
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(l)}
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Editar ambiente"
                      aria-label="Editar"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => deleteLightingRoom(l.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar ambiente"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {(diagnostic.lighting || []).length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay ambientes registrados. Haga clic en "+ Ambiente / Área".
            </div>
          )}
        </div>

        {/* Desktop Table View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Ambiente / Tarea Visual</th>
                <th className="px-4 py-3">Área (m²)</th>
                <th className="px-4 py-3">Lux RNE (Requerido)</th>
                <th className="px-4 py-3">Lux Medido (Real)</th>
                <th className="px-4 py-3">Tecnología Actual</th>
                <th className="px-4 py-3">Propuesta LED</th>
                <th className="px-4 py-3">Densidad (W/m²)</th>
                <th className="px-4 py-3">Ahorro Mensual</th>
                <th className="px-4 py-3">Estado RNE</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {diagnostic.lighting.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{l.roomName}</div>
                    <div className="text-[11px] text-slate-500">{l.visualTask}</div>
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-800">
                    {l.areaM2} m²
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    {l.requiredLuxRne} lux
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-base">
                    <span className={l.measuredLux && l.measuredLux < l.requiredLuxRne ? 'text-rose-600' : 'text-emerald-700'}>
                      {l.measuredLux || '-'} lux
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    <div>{l.currentLampCount}x {l.currentTech ? l.currentTech.replace('_', ' ') : 'FLUORESCENTE'} ({l.currentLampPowerW}W)</div>
                    <div className="font-mono text-[10px] text-slate-400 font-bold">{l.currentTotalPowerW} W total</div>
                  </td>

                  <td className="px-4 py-3 text-slate-800">
                    <div className="font-bold text-emerald-800">{l.recommendedLampCount}x {l.recommendedTech ? l.recommendedTech.replace('_', ' ') : 'LED'} ({l.recommendedLampPowerW}W)</div>
                    <div className="font-mono text-[10px] text-emerald-600 font-bold">{l.recommendedTotalPowerW} W total</div>
                  </td>

                  <td className="px-4 py-3 font-mono">
                    <span className={(l.powerDensityWPerM2 || 0) > (l.maxAllowedPowerDensityWPerM2 || 10) ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                      {(l.powerDensityWPerM2 || 0).toFixed(1)} W/m²
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-amber-900">
                    S/. {(l.monthlySavingsSoles || 0).toFixed(2)}/mes
                  </td>

                  <td className="px-4 py-3">
                    <TrafficBadge 
                      status={l.complianceStatus} 
                      label={l.complianceStatus === 'ADECUADO' ? 'Conforme' : 'Deficiente'} 
                      size="sm" 
                    />
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleOpenEdit(l)}
                      className="p-1 text-slate-500 hover:text-amber-600 mr-1"
                      title="Editar ambiente"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteLightingRoom(l.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Eliminar ambiente"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {(diagnostic.lighting || []).length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    No hay ambientes registrados. Haga clic en "+ Ambiente / Área".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-hidden">
          <div className="w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 py-3.5 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                    {editingId ? 'Editar Evaluación de Iluminación' : 'Registrar Ambiente de Trabajo / Área'}
                  </h3>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Parámetros fotométricos según Norma Técnica Peruana RNE EM.010</p>
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

            {/* Scrollable Form Body */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
                {/* Presets picker */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3">
                  <label className="block font-semibold text-amber-950 mb-1 text-xs">
                    Cargar Estándar RNE EM.010 Rápido:
                  </label>
                  <select
                    onChange={e => {
                      const preset = RNE_PRESETS.find(p => p.name === e.target.value);
                      if (preset) {
                        setFormState({
                          ...formState,
                          roomName: preset.name,
                          visualTask: preset.task,
                          requiredLuxRne: preset.lux
                        });
                      }
                    }}
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Seleccionar Tarea / Proceso Normativo...</option>
                    {RNE_PRESETS.map((p, i) => (
                      <option key={i} value={p.name}>{p.name} ({p.lux} lux)</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre del Ambiente / Área *</label>
                    <input
                      type="text"
                      value={formState.roomName}
                      onChange={e => setFormState({ ...formState, roomName: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tarea Visual Desarrollada</label>
                    <input
                      type="text"
                      value={formState.visualTask}
                      onChange={e => setFormState({ ...formState, visualTask: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Geometry */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/70">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Largo (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formState.lengthM}
                      onChange={e => {
                        const L = Number(e.target.value);
                        const W = formState.widthM || 5;
                        const area = L * W;
                        setFormState({ ...formState, lengthM: L, areaM2: Number(area.toFixed(1)) });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ancho (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formState.widthM}
                      onChange={e => {
                        const W = Number(e.target.value);
                        const L = formState.lengthM || 10;
                        const area = L * W;
                        setFormState({ ...formState, widthM: W, areaM2: Number(area.toFixed(1)) });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Altura (m)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formState.heightM}
                      onChange={e => setFormState({ ...formState, heightM: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Área Total (m²)</label>
                    <input
                      type="number"
                      value={formState.areaM2}
                      onChange={e => setFormState({ ...formState, areaM2: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Lux comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lux Exigido por RNE EM.010 *</label>
                    <input
                      type="number"
                      value={formState.requiredLuxRne}
                      onChange={e => setFormState({ ...formState, requiredLuxRne: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Lux Medido con Luxómetro</label>
                    <input
                      type="number"
                      value={formState.measuredLux}
                      onChange={e => {
                        const measured = Number(e.target.value);
                        const req = formState.requiredLuxRne || 500;
                        setFormState({
                          ...formState,
                          measuredLux: measured,
                          complianceStatus: measured >= req ? 'ADECUADO' : 'NO_ADECUADO'
                        });
                      }}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Current vs Recommended */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Existing */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2.5">
                    <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span>Luminarias Actuales:</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formState.currentTotalPowerW || 0} W total
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">Tecnología</label>
                        <select
                          value={formState.currentTech}
                          onChange={e => setFormState({ ...formState, currentTech: e.target.value as LightingTechnology })}
                          className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs bg-white"
                        >
                          <option value="FLUORESCENTE_T8">Fluorescente T8</option>
                          <option value="FLUORESCENTE_T5">Fluorescente T5</option>
                          <option value="HALOGENO">Halógeno</option>
                          <option value="INCANDESCENTE">Incandescente</option>
                          <option value="HALOGENURO_METALICO">Halogenuro Metálico</option>
                          <option value="LED_TUBULAR">LED Tubular</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">Cantidad</label>
                        <input
                          type="number"
                          value={formState.currentLampCount}
                          onChange={e => {
                            const count = Number(e.target.value);
                            const pwr = formState.currentLampPowerW || 36;
                            const total = count * pwr;
                            const area = formState.areaM2 || 1;
                            setFormState({
                              ...formState,
                              currentLampCount: count,
                              currentTotalPowerW: total,
                              powerDensityWPerM2: Number((total / area).toFixed(2))
                            });
                          }}
                          className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Potencia Unit. (W)</label>
                      <input
                        type="number"
                        value={formState.currentLampPowerW}
                        onChange={e => {
                          const pwr = Number(e.target.value);
                          const count = formState.currentLampCount || 1;
                          const total = count * pwr;
                          const area = formState.areaM2 || 1;
                          setFormState({
                            ...formState,
                            currentLampPowerW: pwr,
                            currentTotalPowerW: total,
                            powerDensityWPerM2: Number((total / area).toFixed(2))
                          });
                        }}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>

                  {/* Proposed LED */}
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2.5">
                    <div className="font-bold text-emerald-900 text-xs flex items-center justify-between">
                      <span>Propuesta Eficiente LED:</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-bold">
                        {formState.recommendedTotalPowerW || 0} W total
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">Tecnología LED</label>
                        <select
                          value={formState.recommendedTech}
                          onChange={e => setFormState({ ...formState, recommendedTech: e.target.value as LightingTechnology })}
                          className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold text-emerald-900 bg-white"
                        >
                          <option value="LED_PANEL">Panel LED 60x60</option>
                          <option value="LED_HIGH_BAY">Campana UFO LED</option>
                          <option value="LED_TUBULAR">Tubo LED T8</option>
                          <option value="LED_REFLECTOR">Reflector LED</option>
                          <option value="LED_BULB">Foco LED</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">Cantidad</label>
                        <input
                          type="number"
                          value={formState.recommendedLampCount}
                          onChange={e => {
                            const count = Number(e.target.value);
                            const pwr = formState.recommendedLampPowerW || 40;
                            const recTotal = count * pwr;
                            const currTotal = formState.currentTotalPowerW || 0;
                            const hours = formState.dailyHours || 8;
                            const savingsKwh = ((currTotal - recTotal) * hours * 26) / 1000;
                            const savingsSoles = savingsKwh * (diagnostic.tariff.activeEnergyPriceKwh || 0.75);
                            setFormState({
                              ...formState,
                              recommendedLampCount: count,
                              recommendedTotalPowerW: recTotal,
                              monthlySavingsKwh: Number(savingsKwh.toFixed(1)),
                              monthlySavingsSoles: Number(savingsSoles.toFixed(2))
                            });
                          }}
                          className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold text-emerald-900 bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Potencia Unit. (W)</label>
                      <input
                        type="number"
                        value={formState.recommendedLampPowerW}
                        onChange={e => {
                          const pwr = Number(e.target.value);
                          const count = formState.recommendedLampCount || 1;
                          const recTotal = count * pwr;
                          const currTotal = formState.currentTotalPowerW || 0;
                          const hours = formState.dailyHours || 8;
                          const savingsKwh = ((currTotal - recTotal) * hours * 26) / 1000;
                          const savingsSoles = savingsKwh * (diagnostic.tariff.activeEnergyPriceKwh || 0.75);
                          setFormState({
                            ...formState,
                            recommendedLampPowerW: pwr,
                            recommendedTotalPowerW: recTotal,
                            monthlySavingsKwh: Number(savingsKwh.toFixed(1)),
                            monthlySavingsSoles: Number(savingsSoles.toFixed(2))
                          });
                        }}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono text-emerald-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Observaciones</label>
                  <input
                    type="text"
                    value={formState.observations}
                    onChange={e => setFormState({ ...formState, observations: e.target.value })}
                    placeholder="Detalles sobre deslumbramiento, parpadeo o altura de montaje..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sticky Modal Footer */}
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
                  {editingId ? 'Guardar Cambios' : 'Registrar Ambiente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
