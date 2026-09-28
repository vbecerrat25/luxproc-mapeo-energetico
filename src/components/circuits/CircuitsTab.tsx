import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { CircuitRecord, PanelRecord, WireInsulation, CircuitLoadType, WireMaterial } from '../../types';
import { MetricCard } from '../shared/MetricCard';
import { TrafficBadge } from '../shared/TrafficBadge';
import { 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  AlertTriangle, 
  Wrench, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Sliders,
  Sparkles,
  X
} from 'lucide-react';
import { ElectricalProtectionAndPanelCalculator } from './ElectricalProtectionAndPanelCalculator';

export const CircuitsTab: React.FC = () => {
  const {
    diagnostic,
    demandBalance,
    addCircuit,
    updateCircuit,
    deleteCircuit,
    addPanel,
    updatePanel,
    deletePanel
  } = useDiagnostic();

  const [selectedPanelId, setSelectedPanelId] = useState<string>('ALL');
  const [showAddCircuitModal, setShowAddCircuitModal] = useState(false);
  const [editingCircuitId, setEditingCircuitId] = useState<string | null>(null);

  const [showAddPanelModal, setShowAddPanelModal] = useState(false);
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);

  const [circuitForm, setCircuitForm] = useState<Omit<CircuitRecord, 'id'>>({
    panelId: diagnostic.panels[0]?.id || '',
    circuitCode: 'C-01',
    description: '',
    loadType: 'MAQUINA_ESPECIAL',
    connectedPowerW: 3000,
    voltage: diagnostic.tariff.supplyVoltage,
    phases: diagnostic.tariff.phases,
    calculatedCurrentA: 10,
    measuredCurrentA: 9.5,
    isMotor: false,
    powerFactor: 0.85,
    lengthM: 25,
    wireMaterial: 'COBRE',
    wireInsulation: 'N2XH',
    wireSectionMm2: 4.0,
    groundWireMm2: 4.0,
    conduitType: 'EMT',
    ambientTempC: 30,
    groupingFactor: 1.0,
    wireAdmissibleAmpacityA: 40,
    voltageDropV: 2.5,
    voltageDropPercent: 1.1,
    maxAllowedVoltageDropPercent: 2.5,
    breakerExistingA: 20,
    breakerRecommendedA: 20,
    breakerCurve: 'C',
    breakerPoles: diagnostic.tariff.phases === 'TRIFASICO' ? 3 : 2,
    breakerBreakingKa: 10,
    rcdExistingA: 25,
    rcdRecommendedA: 25,
    rcdSensitivityMa: 30,
    rcdType: 'A',
    wireStatus: 'ADECUADO',
    voltageDropStatus: 'ADECUADO',
    breakerStatus: 'ADECUADO',
    rcdStatus: 'ADECUADO',
    technicalJustification: 'Dimensionado conforme a regla 050-102 CNE Utilización',
    confidence: 'MEDIDO'
  });

  const [panelForm, setPanelForm] = useState<Omit<PanelRecord, 'id'>>({
    code: 'TG-01',
    name: 'Tablero General (TG)',
    panelType: 'TABLERO_GENERAL',
    location: 'Ingreso Principal',
    voltage: diagnostic.tariff.supplyVoltage,
    phases: diagnostic.tariff.phases,
    capacityA: 63,
    mainBreakerRatingA: 50,
    mainBreakerPoles: diagnostic.tariff.phases === 'TRIFASICO' ? 3 : 2,
    shortCircuitKa: 10,
    circuitCount: 8,
    enclosureType: 'Metálico IP54',
    hasGroundBar: true,
    hasSurgeProtector: true,
    observations: ''
  });

  const filteredCircuits = selectedPanelId === 'ALL'
    ? diagnostic.circuits
    : diagnostic.circuits.filter(c => c.panelId === selectedPanelId);

  const nonCompliantCount = diagnostic.circuits.filter(
    c => c.wireStatus === 'NO_ADECUADO' || c.breakerStatus === 'NO_ADECUADO' || c.rcdStatus === 'NO_ADECUADO' || c.voltageDropStatus === 'NO_ADECUADO'
  ).length;

  const handleOpenAddCircuit = () => {
    setEditingCircuitId(null);
    setCircuitForm({
      panelId: diagnostic.panels[0]?.id || '',
      circuitCode: `C-${String(diagnostic.circuits.length + 1).padStart(2, '0')}`,
      description: '',
      loadType: 'MAQUINA_ESPECIAL',
      connectedPowerW: 2200,
      voltage: diagnostic.tariff.supplyVoltage,
      phases: diagnostic.tariff.phases,
      calculatedCurrentA: 8.0,
      measuredCurrentA: 7.5,
      isMotor: false,
      powerFactor: 0.85,
      lengthM: 20,
      wireMaterial: 'COBRE',
      wireInsulation: 'N2XH',
      wireSectionMm2: 4.0,
      groundWireMm2: 4.0,
      conduitType: 'EMT',
      ambientTempC: 30,
      groupingFactor: 1.0,
      wireAdmissibleAmpacityA: 40,
      voltageDropV: 1.8,
      voltageDropPercent: 0.8,
      maxAllowedVoltageDropPercent: 2.5,
      breakerExistingA: 20,
      breakerRecommendedA: 20,
      breakerCurve: 'C',
      breakerPoles: diagnostic.tariff.phases === 'TRIFASICO' ? 3 : 2,
      breakerBreakingKa: 10,
      rcdExistingA: 25,
      rcdRecommendedA: 25,
      rcdSensitivityMa: 30,
      rcdType: 'A',
      wireStatus: 'ADECUADO',
      voltageDropStatus: 'ADECUADO',
      breakerStatus: 'ADECUADO',
      rcdStatus: 'ADECUADO',
      technicalJustification: 'Dimensionado conforme a regla 050-102 CNE Utilización',
      confidence: 'MEDIDO'
    });
    setShowAddCircuitModal(true);
  };

  const handleOpenEditCircuit = (c: CircuitRecord) => {
    setEditingCircuitId(c.id);
    setCircuitForm({
      panelId: c.panelId,
      circuitCode: c.circuitCode,
      description: c.description,
      loadType: c.loadType,
      connectedPowerW: c.connectedPowerW,
      voltage: c.voltage,
      phases: c.phases,
      calculatedCurrentA: c.calculatedCurrentA,
      measuredCurrentA: c.measuredCurrentA || 0,
      isMotor: c.isMotor || false,
      startingCurrentA: c.startingCurrentA,
      powerFactor: c.powerFactor || 0.85,
      lengthM: c.lengthM,
      wireMaterial: c.wireMaterial,
      wireInsulation: c.wireInsulation,
      wireSectionMm2: c.wireSectionMm2,
      groundWireMm2: c.groundWireMm2,
      conduitType: c.conduitType || 'PVC-P',
      ambientTempC: c.ambientTempC || 30,
      groupingFactor: c.groupingFactor || 1.0,
      wireAdmissibleAmpacityA: c.wireAdmissibleAmpacityA,
      voltageDropV: c.voltageDropV,
      voltageDropPercent: c.voltageDropPercent,
      maxAllowedVoltageDropPercent: c.maxAllowedVoltageDropPercent || 2.5,
      breakerExistingA: c.breakerExistingA,
      breakerRecommendedA: c.breakerRecommendedA,
      breakerCurve: c.breakerCurve,
      breakerPoles: c.breakerPoles,
      breakerBreakingKa: c.breakerBreakingKa || 10,
      rcdExistingA: c.rcdExistingA,
      rcdRecommendedA: c.rcdRecommendedA,
      rcdSensitivityMa: c.rcdSensitivityMa,
      rcdType: c.rcdType,
      wireStatus: c.wireStatus,
      voltageDropStatus: c.voltageDropStatus,
      breakerStatus: c.breakerStatus,
      rcdStatus: c.rcdStatus,
      technicalJustification: c.technicalJustification || '',
      confidence: c.confidence
    });
    setShowAddCircuitModal(true);
  };

  const handleSaveCircuit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCircuitId) {
      updateCircuit(editingCircuitId, circuitForm);
    } else {
      addCircuit(circuitForm);
    }
    setShowAddCircuitModal(false);
  };

  // One-click Auto-Fix for Non-compliant circuits
  const handleAutoFixAllCircuits = () => {
    diagnostic.circuits.forEach(c => {
      let updatedWire = c.wireSectionMm2;
      let updatedBreaker = c.breakerRecommendedA;
      let updatedRcd = c.rcdRecommendedA;

      // If voltage drop or ampacity failed, increase section
      if (c.wireStatus === 'NO_ADECUADO' || c.voltageDropStatus === 'NO_ADECUADO') {
        const sections = [2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0, 50.0];
        const currentIdx = sections.indexOf(c.wireSectionMm2);
        if (currentIdx !== -1 && currentIdx < sections.length - 1) {
          updatedWire = sections[currentIdx + 1];
        }
      }

      updateCircuit(c.id, {
        wireSectionMm2: updatedWire,
        breakerExistingA: updatedBreaker,
        rcdExistingA: updatedRcd,
        rcdSensitivityMa: 30
      });
    });
    alert('¡Optimizaciones normativas del CNE aplicadas exitosamente a todos los circuitos!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            Tableros de Distribución y Circuitos Derivados (CNE)
          </h2>
          <p className="text-xs text-slate-500">
            Verificación de ampacidad (Iz), caída de tensión (ΔV%), termomagnéticos (In) y protección diferencial de 30mA
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {nonCompliantCount > 0 && (
            <button
              onClick={handleAutoFixAllCircuits}
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-sm transition-colors"
              title="Ajustar calibres y protecciones a valores normativos del CNE"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>Auto-Corregir Normativa CNE ({nonCompliantCount})</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingPanelId(null);
              setShowAddPanelModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Layers size={14} />
            <span>+ Tablero</span>
          </button>

          <button
            onClick={handleOpenAddCircuit}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm transition-colors"
          >
            <Plus size={14} />
            <span>+ Circuito</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Circuitos Registrados"
          value={(diagnostic.circuits || []).length}
          subtitle={`${(diagnostic.panels || []).length} tableros en planta`}
          highlightColor="indigo"
          icon={<SlidersHorizontal size={18} />}
        />
        <MetricCard
          title="Demanda Máxima Tablero"
          value={(demandBalance?.maximumDemandKw ?? demandBalance?.estimatedMaxDemandKw ?? 0).toFixed(1)}
          unit="kW"
          subtitle={`Factor Simultaneidad: ${(((demandBalance?.coincidenceFactor ?? 0.8)) * 100).toFixed(0)}%`}
          highlightColor="blue"
          icon={<Zap size={18} />}
        />
        <MetricCard
          title="Reserva de Capacidad"
          value={(demandBalance?.capacityReserveKw ?? demandBalance?.reserveCapacityKw ?? 0).toFixed(1)}
          unit="kW"
          subtitle={`${(demandBalance?.capacityReservePercent ?? demandBalance?.reserveCapacityPercent ?? 0).toFixed(1)}% margen disponible`}
          highlightColor="emerald"
          icon={<CheckCircle2 size={18} />}
        />
        <MetricCard
          title="Estado Normativo CNE"
          value={nonCompliantCount === 0 ? '100% OK' : `${nonCompliantCount} Hallazgos`}
          subtitle={nonCompliantCount === 0 ? 'Cumple CNE Utilización' : 'Requiere intervención'}
          highlightColor={nonCompliantCount === 0 ? 'emerald' : 'rose'}
          icon={<ShieldCheck size={18} />}
        />
      </div>

      {/* Engineering Calculator for Protections (ITM, ID) and Enclosures/Panels */}
      <ElectricalProtectionAndPanelCalculator />

      {/* Panels Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mr-2">Filtrar Tablero:</span>
        <button
          onClick={() => setSelectedPanelId('ALL')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            selectedPanelId === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Todos los Tableros ({(diagnostic.circuits || []).length})
        </button>

        {(diagnostic.panels || []).map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPanelId(p.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedPanelId === p.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers size={12} />
            <span>{p.code} - {p.name}</span>
            <span className="ml-1 rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px]">
              {p.mainBreakerRatingA}A
            </span>
          </button>
        ))}
      </div>

      {/* Circuits Engineering Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-3 py-3">Circuito</th>
                <th className="px-3 py-3">Descripción de Carga</th>
                <th className="px-3 py-3">Potencia</th>
                <th className="px-3 py-3">Corriente Ib</th>
                <th className="px-3 py-3">Conductor (mm²)</th>
                <th className="px-3 py-3">Ampacidad Iz</th>
                <th className="px-3 py-3">Caída Tensión</th>
                <th className="px-3 py-3">Termomagnético</th>
                <th className="px-3 py-3">Diferencial (RCD)</th>
                <th className="px-3 py-3">Evaluación CNE</th>
                <th className="px-3 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCircuits.map(c => {
                const isOverloaded = c.wireStatus === 'NO_ADECUADO';
                const isVdropBad = c.voltageDropStatus === 'NO_ADECUADO';
                const isBreakerBad = c.breakerStatus === 'NO_ADECUADO';
                const isRcdBad = c.rcdStatus === 'NO_ADECUADO' || !c.rcdExistingA;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Circuit Code */}
                    <td className="px-3 py-3">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">
                        {c.circuitCode}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="px-3 py-3">
                      <div className="font-bold text-slate-900">{c.description}</div>
                      <div className="text-[10px] text-slate-500">
                        {c.loadType} • {c.lengthM}m • {c.voltage}V {c.phases === 'TRIFASICO' ? '3Ø' : '1Ø'}
                      </div>
                    </td>

                    {/* Power */}
                    <td className="px-3 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {(c.connectedPowerW ?? 0) >= 1000 ? `${((c.connectedPowerW ?? 0) / 1000).toFixed(2)} kW` : `${c.connectedPowerW ?? 0} W`}
                    </td>

                    {/* Operating Current */}
                    <td className="px-3 py-3 font-mono font-bold text-slate-900">
                      {(c.calculatedCurrentA ?? 0).toFixed(1)} A
                    </td>

                    {/* Conductor */}
                    <td className="px-3 py-3">
                      <div className="font-mono font-bold text-slate-900">
                        {c.wireSectionMm2} mm²
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.wireMaterial} • {c.wireInsulation}
                      </div>
                    </td>

                    {/* Admissible Ampacity */}
                    <td className="px-3 py-3">
                      <div className="font-mono font-bold text-slate-800">
                        {c.wireAdmissibleAmpacityA ?? 0} A
                      </div>
                      <TrafficBadge status={c.wireStatus} size="sm" showIcon={false} />
                    </td>

                    {/* Voltage Drop */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">
                        {(c.voltageDropPercent ?? 0).toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        ({(c.voltageDropV ?? 0).toFixed(1)}V / máx {c.maxAllowedVoltageDropPercent ?? 2.5}%)
                      </div>
                      <TrafficBadge status={c.voltageDropStatus} size="sm" showIcon={false} />
                    </td>

                    {/* Breaker */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">
                        {c.breakerExistingA ? `${c.breakerExistingA}A` : `${c.breakerRecommendedA}A`}
                        <span className="ml-1 text-[10px] text-slate-500">Curva {c.breakerCurve}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.breakerPoles}P • Icu {c.breakerBreakingKa || 10}kA
                      </div>
                      <TrafficBadge status={c.breakerStatus} size="sm" showIcon={false} />
                    </td>

                    {/* RCD */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      {c.rcdExistingA ? (
                        <div>
                          <div className="font-mono font-bold text-slate-900">
                            {c.rcdExistingA}A / {c.rcdSensitivityMa}mA
                          </div>
                          <div className="text-[10px] text-slate-500">Tipo {c.rcdType}</div>
                          <TrafficBadge status={c.rcdStatus} size="sm" showIcon={false} />
                        </div>
                      ) : (
                        <div>
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Sin RCD 30mA
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">Rec: {c.rcdRecommendedA}A 30mA</span>
                        </div>
                      )}
                    </td>

                    {/* CNE Overall Evaluation */}
                    <td className="px-3 py-3">
                      {(!isOverloaded && !isVdropBad && !isBreakerBad && !isRcdBad) ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          <span>Conforme CNE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200" title="Verificar capacidad o protecciones">
                          <AlertTriangle size={12} />
                          <span>No Conforme</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditCircuit(c)}
                        className="p-1 text-slate-500 hover:text-amber-600 mr-1"
                        title="Editar circuito"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteCircuit(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Eliminar circuito"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredCircuits.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                    No hay circuitos registrados en este tablero. Haga clic en "+ Circuito" para agregar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Circuit Modal */}
      {showAddCircuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingCircuitId ? 'Editar Circuito Derivado' : 'Registrar Nuevo Circuito Derivado'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCircuitModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCircuit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tablero de Alimentación</label>
                  <select
                    value={circuitForm.panelId}
                    onChange={e => setCircuitForm({ ...circuitForm, panelId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    {diagnostic.panels.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código del Circuito</label>
                  <input
                    type="text"
                    value={circuitForm.circuitCode}
                    onChange={e => setCircuitForm({ ...circuitForm, circuitCode: e.target.value })}
                    placeholder="Ej. C-01"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Carga</label>
                  <select
                    value={circuitForm.loadType}
                    onChange={e => setCircuitForm({ ...circuitForm, loadType: e.target.value as CircuitLoadType })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="ILUMINACION">Iluminación</option>
                    <option value="TOMACORRIENTES">Tomacorrientes Generales</option>
                    <option value="MOTOR">Motor / Fuerza Motriz</option>
                    <option value="MAQUINA_ESPECIAL">Máquina Especial / Proceso</option>
                    <option value="CLIMATIZACION">Climatización / Aire Acond.</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción de la Carga Conectada *</label>
                <input
                  type="text"
                  value={circuitForm.description}
                  onChange={e => setCircuitForm({ ...circuitForm, description: e.target.value })}
                  placeholder="Ej. Compresor de tornillo 10 HP / Electrobomba / Centro CNC / Horno / Línea de Envasado"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Potencia (W)</label>
                  <input
                    type="number"
                    value={circuitForm.connectedPowerW}
                    onChange={e => {
                      const w = Number(e.target.value);
                      const v = circuitForm.voltage;
                      const fp = circuitForm.powerFactor || 0.85;
                      const current = circuitForm.phases === 'TRIFASICO'
                        ? w / (Math.sqrt(3) * v * fp)
                        : w / (v * fp);
                      setCircuitForm({
                        ...circuitForm,
                        connectedPowerW: w,
                        calculatedCurrentA: Number(current.toFixed(2))
                      });
                    }}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tensión / Fases</label>
                  <div className="flex gap-1">
                    <select
                      value={circuitForm.voltage}
                      onChange={e => setCircuitForm({ ...circuitForm, voltage: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-1 py-1.5 text-xs font-mono font-bold"
                    >
                      <option value={220}>220V</option>
                      <option value={380}>380V</option>
                      <option value={440}>440V</option>
                    </select>
                    <select
                      value={circuitForm.phases}
                      onChange={e => setCircuitForm({ ...circuitForm, phases: e.target.value as any })}
                      className="rounded-lg border border-slate-300 px-1 py-1.5 text-xs"
                    >
                      <option value="MONOFASICO">1Ø</option>
                      <option value="TRIFASICO">3Ø</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corriente Ib (A)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={circuitForm.calculatedCurrentA}
                    onChange={e => setCircuitForm({ ...circuitForm, calculatedCurrentA: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitud Cable (m)</label>
                  <input
                    type="number"
                    value={circuitForm.lengthM}
                    onChange={e => setCircuitForm({ ...circuitForm, lengthM: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Wire & Conduit */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calibre Conductor</label>
                  <select
                    value={circuitForm.wireSectionMm2}
                    onChange={e => setCircuitForm({ ...circuitForm, wireSectionMm2: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  >
                    {[1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0, 50.0, 70.0, 95.0, 120.0].map(s => (
                      <option key={s} value={s}>{s} mm²</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Aislamiento Cable</label>
                  <select
                    value={circuitForm.wireInsulation}
                    onChange={e => setCircuitForm({ ...circuitForm, wireInsulation: e.target.value as WireInsulation })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="NH-80">NH-80 (Libre Halógenos)</option>
                    <option value="N2XH">N2XH (Libre Halógenos 90°C)</option>
                    <option value="THW-90">THW-90</option>
                    <option value="TW">TW (70°C)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Material</label>
                  <select
                    value={circuitForm.wireMaterial}
                    onChange={e => setCircuitForm({ ...circuitForm, wireMaterial: e.target.value as WireMaterial })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="COBRE">Cobre Electrolítico</option>
                    <option value="ALUMINIO">Aluminio</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tierra PE (mm²)</label>
                  <select
                    value={circuitForm.groundWireMm2}
                    onChange={e => setCircuitForm({ ...circuitForm, groundWireMm2: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                  >
                    {[2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0].map(s => (
                      <option key={s} value={s}>{s} mm² PE</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Protections */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Termomagnético In (A)</label>
                  <input
                    type="number"
                    value={circuitForm.breakerExistingA}
                    onChange={e => setCircuitForm({ ...circuitForm, breakerExistingA: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Curva Disparo</label>
                  <select
                    value={circuitForm.breakerCurve}
                    onChange={e => setCircuitForm({ ...circuitForm, breakerCurve: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="B">Curva B (Resistivo)</option>
                    <option value="C">Curva C (General)</option>
                    <option value="D">Curva D (Motores)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Diferencial In (A)</label>
                  <input
                    type="number"
                    value={circuitForm.rcdExistingA || 25}
                    onChange={e => setCircuitForm({ ...circuitForm, rcdExistingA: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sensibilidad RCD</label>
                  <select
                    value={circuitForm.rcdSensitivityMa}
                    onChange={e => setCircuitForm({ ...circuitForm, rcdSensitivityMa: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value={30}>30 mA (Personas)</option>
                    <option value={300}>300 mA (Incendio)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCircuitModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  {editingCircuitId ? 'Guardar Circuito' : 'Registrar Circuito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Panel Modal */}
      {showAddPanelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Registrar Nuevo Tablero Eléctrico
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPanelModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              addPanel(panelForm);
              setShowAddPanelModal(false);
            }} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código del Tablero</label>
                  <input
                    type="text"
                    value={panelForm.code}
                    onChange={e => setPanelForm({ ...panelForm, code: e.target.value })}
                    placeholder="TG / TS-01"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Tablero</label>
                  <select
                    value={panelForm.panelType}
                    onChange={e => setPanelForm({ ...panelForm, panelType: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="TABLERO_GENERAL">Tablero General (TG)</option>
                    <option value="SUBTABLERO_DISTRIBUCION">Subtablero Distribución</option>
                    <option value="TABLERO_MAQUINAS">Tablero de Fuerza / Máquinas</option>
                    <option value="TABLERO_ALUMBRADO">Tablero de Alumbrado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo del Tablero</label>
                <input
                  type="text"
                  value={panelForm.name}
                  onChange={e => setPanelForm({ ...panelForm, name: e.target.value })}
                  placeholder="Ej. Tablero General Industrial"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Interruptor General (A)</label>
                  <input
                    type="number"
                    value={panelForm.mainBreakerRatingA}
                    onChange={e => setPanelForm({ ...panelForm, mainBreakerRatingA: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gabinete / Enclosure</label>
                  <input
                    type="text"
                    value={panelForm.enclosureType}
                    onChange={e => setPanelForm({ ...panelForm, enclosureType: e.target.value })}
                    placeholder="Metálico IP54 / PVC"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubicación Física</label>
                <input
                  type="text"
                  value={panelForm.location}
                  onChange={e => setPanelForm({ ...panelForm, location: e.target.value })}
                  placeholder="Ej. Caseta de subestación / Nave de costura"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPanelModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  Crear Tablero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
