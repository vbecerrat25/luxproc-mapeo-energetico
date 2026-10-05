import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
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
  CheckCircle2, 
  Layers, 
  Zap, 
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
    addPanel
  } = useDiagnostic();
  const { language } = useLanguage();

  const tr = (es: string, en: string, pt: string) =>
    language === 'en' ? en : language === 'pt' ? pt : es;

  const [selectedPanelId, setSelectedPanelId] = useState<string>('ALL');
  const [showAddCircuitModal, setShowAddCircuitModal] = useState(false);
  const [editingCircuitId, setEditingCircuitId] = useState<string | null>(null);

  const [showAddPanelModal, setShowAddPanelModal] = useState(false);
  const [, setEditingPanelId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  const handleAutoFixAllCircuits = () => {
    diagnostic.circuits.forEach(c => {
      let updatedWire = c.wireSectionMm2;
      const updatedBreaker = c.breakerRecommendedA;
      const updatedRcd = c.rcdRecommendedA;

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
    setToastMsg(
      tr(
        '¡Optimizaciones normativas del CNE aplicadas exitosamente a todos los circuitos!',
        'CNE regulatory optimizations successfully applied to all circuits!',
        'Otimizações normativas aplicadas com sucesso a todos os circuitos!'
      )
    );
    setTimeout(() => setToastMsg(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {toastMsg && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            {tr(
              'Tableros de Distribución y Circuitos Derivados (CNE)',
              'Distribution Switchboards & Branch Circuits (CNE)',
              'Quadros de Distribuição e Circuitos Derivados (CNE)'
            )}
          </h2>
          <p className="text-xs text-slate-500">
            {tr(
              'Verificación de ampacidad (Iz), caída de tensión (ΔV%), termomagnéticos (In) y protección diferencial de 30mA',
              'Verification of ampacity (Iz), voltage drop (ΔV%), circuit breakers (In), and 30mA RCD protection',
              'Verificação de ampacidade (Iz), queda de tensão (ΔV%), disjuntores (In) e proteção diferencial de 30mA'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {nonCompliantCount > 0 && (
            <button
              onClick={handleAutoFixAllCircuits}
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-sm transition-colors cursor-pointer"
              title={tr(
                'Ajustar calibres y protecciones a valores normativos del CNE',
                'Adjust wire gauges and breakers to CNE regulatory standards',
                'Ajustar bitolas e proteções aos valores normativos do CNE'
              )}
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>{tr('Auto-Corregir Normativa CNE', 'Auto-Fix CNE Compliance', 'Auto-Corrigir Norma CNE')} ({nonCompliantCount})</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingPanelId(null);
              setShowAddPanelModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Layers size={14} />
            <span>{tr('+ Tablero', '+ Switchboard', '+ Quadro')}</span>
          </button>

          <button
            onClick={handleOpenAddCircuit}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>{tr('+ Circuito', '+ Circuit', '+ Circuito')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title={tr('Circuitos Registrados', 'Recorded Circuits', 'Circuitos Registrados')}
          value={(diagnostic.circuits || []).length}
          subtitle={`${(diagnostic.panels || []).length} ${tr('tableros en planta', 'switchboards in facility', 'quadros na planta')}`}
          highlightColor="indigo"
          icon={<SlidersHorizontal size={18} />}
        />
        <MetricCard
          title={tr('Demanda Máxima Tablero', 'Switchboard Peak Demand', 'Demanda Máxima do Quadro')}
          value={(demandBalance?.maximumDemandKw ?? demandBalance?.estimatedMaxDemandKw ?? 0).toFixed(1)}
          unit="kW"
          subtitle={`${tr('Factor Simultaneidad:', 'Simultaneity Factor:', 'Fator de Simultaneidade:')} ${(((demandBalance?.coincidenceFactor ?? 0.8)) * 100).toFixed(0)}%`}
          highlightColor="blue"
          icon={<Zap size={18} />}
        />
        <MetricCard
          title={tr('Reserva de Capacidad', 'Capacity Reserve', 'Reserva de Capacidade')}
          value={(demandBalance?.capacityReserveKw ?? demandBalance?.reserveCapacityKw ?? 0).toFixed(1)}
          unit="kW"
          subtitle={`${(demandBalance?.capacityReservePercent ?? demandBalance?.reserveCapacityPercent ?? 0).toFixed(1)}% ${tr('margen disponible', 'available margin', 'margem disponível')}`}
          highlightColor="emerald"
          icon={<CheckCircle2 size={18} />}
        />
        <MetricCard
          title={tr('Estado Normativo CNE', 'CNE Regulatory Status', 'Estado Normativo CNE')}
          value={nonCompliantCount === 0 ? '100% OK' : `${nonCompliantCount} ${tr('Hallazgos', 'Findings', 'Achados')}`}
          subtitle={nonCompliantCount === 0 ? tr('Cumple CNE Utilización', 'Complies with CNE Code', 'Cumpre Norma CNE') : tr('Requiere intervención', 'Requires intervention', 'Requer intervenção')}
          highlightColor={nonCompliantCount === 0 ? 'emerald' : 'rose'}
          icon={<ShieldCheck size={18} />}
        />
      </div>

      {/* Engineering Calculator for Protections (ITM, ID) and Enclosures/Panels */}
      <ElectricalProtectionAndPanelCalculator />

      {/* Panels Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mr-2">
          {tr('Filtrar Tablero:', 'Filter Switchboard:', 'Filtrar Quadro:')}
        </span>
        <button
          onClick={() => setSelectedPanelId('ALL')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            selectedPanelId === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          {tr('Todos los Tableros', 'All Switchboards', 'Todos os Quadros')} ({(diagnostic.circuits || []).length})
        </button>

        {(diagnostic.panels || []).map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPanelId(p.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
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
                <th className="px-3 py-3">{tr('Circuito', 'Circuit', 'Circuito')}</th>
                <th className="px-3 py-3">{tr('Descripción de Carga', 'Load Description', 'Descrição da Carga')}</th>
                <th className="px-3 py-3">{tr('Potencia', 'Power', 'Potência')}</th>
                <th className="px-3 py-3">{tr('Corriente Ib', 'Current Ib', 'Corrente Ib')}</th>
                <th className="px-3 py-3">{tr('Conductor (mm²)', 'Conductor (mm²)', 'Condutor (mm²)')}</th>
                <th className="px-3 py-3">{tr('Ampacidad Iz', 'Ampacity Iz', 'Ampacidade Iz')}</th>
                <th className="px-3 py-3">{tr('Caída Tensión', 'Voltage Drop', 'Queda de Tensão')}</th>
                <th className="px-3 py-3">{tr('Termomagnético', 'Breaker (MCB)', 'Disjuntor (DTM)')}</th>
                <th className="px-3 py-3">{tr('Diferencial (RCD)', 'RCD Protection', 'Diferencial (DR)')}</th>
                <th className="px-3 py-3">{tr('Evaluación CNE', 'CNE Evaluation', 'Avaliação CNE')}</th>
                <th className="px-3 py-3 text-right">{tr('Acciones', 'Actions', 'Ações')}</th>
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
                    <td className="px-3 py-3">
                      <span className="font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-800">
                        {c.circuitCode}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="font-bold text-slate-900">{c.description}</div>
                      <div className="text-[10px] text-slate-500">
                        {c.loadType} • {c.lengthM}m • {c.voltage}V {c.phases === 'TRIFASICO' ? '3Ø' : '1Ø'}
                      </div>
                    </td>

                    <td className="px-3 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {(c.connectedPowerW ?? 0) >= 1000 ? `${((c.connectedPowerW ?? 0) / 1000).toFixed(2)} kW` : `${c.connectedPowerW ?? 0} W`}
                    </td>

                    <td className="px-3 py-3 font-mono font-bold text-slate-900">
                      {(c.calculatedCurrentA ?? 0).toFixed(1)} A
                    </td>

                    <td className="px-3 py-3">
                      <div className="font-mono font-bold text-slate-900">
                        {c.wireSectionMm2} mm²
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.wireMaterial} • {c.wireInsulation}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="font-mono font-bold text-slate-800">
                        {c.wireAdmissibleAmpacityA ?? 0} A
                      </div>
                      <TrafficBadge status={c.wireStatus} size="sm" showIcon={false} />
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">
                        {(c.voltageDropPercent ?? 0).toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-slate-500">
                        ({(c.voltageDropV ?? 0).toFixed(1)}V / {tr('máx', 'max', 'máx')} {c.maxAllowedVoltageDropPercent ?? 2.5}%)
                      </div>
                      <TrafficBadge status={c.voltageDropStatus} size="sm" showIcon={false} />
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">
                        {c.breakerExistingA ? `${c.breakerExistingA}A` : `${c.breakerRecommendedA}A`}
                        <span className="ml-1 text-[10px] text-slate-500">{tr('Curva', 'Curve', 'Curva')} {c.breakerCurve}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.breakerPoles}P • Icu {c.breakerBreakingKa || 10}kA
                      </div>
                      <TrafficBadge status={c.breakerStatus} size="sm" showIcon={false} />
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      {c.rcdExistingA ? (
                        <div>
                          <div className="font-mono font-bold text-slate-900">
                            {c.rcdExistingA}A / {c.rcdSensitivityMa}mA
                          </div>
                          <div className="text-[10px] text-slate-500">{tr('Tipo', 'Type', 'Tipo')} {c.rcdType}</div>
                          <TrafficBadge status={c.rcdStatus} size="sm" showIcon={false} />
                        </div>
                      ) : (
                        <div>
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            {tr('Sin RCD 30mA', 'No 30mA RCD', 'Sem DR 30mA')}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">Rec: {c.rcdRecommendedA}A 30mA</span>
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      {(!isOverloaded && !isVdropBad && !isBreakerBad && !isRcdBad) ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          <span>{tr('Conforme CNE', 'CNE Compliant', 'Conforme CNE')}</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200"
                          title={tr('Verificar capacidad o protecciones', 'Check capacity or protections', 'Verificar capacidade ou proteções')}
                        >
                          <AlertTriangle size={12} />
                          <span>{tr('No Conforme', 'Non-Compliant', 'Não Conforme')}</span>
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditCircuit(c)}
                        className="p-1 text-slate-500 hover:text-amber-600 mr-1 cursor-pointer"
                        title={tr('Editar circuito', 'Edit circuit', 'Editar circuito')}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteCircuit(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title={tr('Eliminar circuito', 'Delete circuit', 'Excluir circuito')}
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
                    {tr(
                      'No hay circuitos registrados en este tablero. Haga clic en "+ Circuito" para agregar.',
                      'No circuits recorded in this switchboard. Click "+ Circuit" to add one.',
                      'Nenhum circuito registrado neste quadro. Clique em "+ Circuito" para adicionar.'
                    )}
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
                {editingCircuitId
                  ? tr('Editar Circuito Derivado', 'Edit Branch Circuit', 'Editar Circuito Derivado')
                  : tr('Registrar Nuevo Circuito Derivado', 'Record New Branch Circuit', 'Registrar Novo Circuito Derivado')}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCircuitModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                title={tr('Cerrar', 'Close', 'Fechar')}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCircuit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Tablero de Alimentación', 'Supply Switchboard', 'Quadro de Alimentação')}
                  </label>
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
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Código del Circuito', 'Circuit Code', 'Código do Circuito')}
                  </label>
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
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Tipo de Carga', 'Load Type', 'Tipo de Carga')}
                  </label>
                  <select
                    value={circuitForm.loadType}
                    onChange={e => setCircuitForm({ ...circuitForm, loadType: e.target.value as CircuitLoadType })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="ILUMINACION">{tr('Iluminación', 'Lighting', 'Iluminação')}</option>
                    <option value="TOMACORRIENTES">{tr('Tomacorrientes Generales', 'General Outlets', 'Tomadas Gerais')}</option>
                    <option value="MOTOR">{tr('Motor / Fuerza Motriz', 'Motor / Motive Power', 'Motor / Força Motriz')}</option>
                    <option value="MAQUINA_ESPECIAL">{tr('Máquina Especial / Proceso', 'Special Machine / Process', 'Máquina Especial / Processo')}</option>
                    <option value="CLIMATIZACION">{tr('Climatización / Aire Acond.', 'HVAC / Air Conditioning', 'Climatização / Ar Cond.')}</option>
                    <option value="OTRO">{tr('Otro', 'Other', 'Outro')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {tr('Descripción de la Carga Conectada *', 'Connected Load Description *', 'Descrição da Carga Conectada *')}
                </label>
                <input
                  type="text"
                  value={circuitForm.description}
                  onChange={e => setCircuitForm({ ...circuitForm, description: e.target.value })}
                  placeholder={tr(
                    'Ej. Compresor de tornillo 10 HP / Electrobomba / Centro CNC / Horno / Línea de Envasado',
                    'E.g. 10 HP Screw Compressor / Water Pump / CNC Center / Industrial Oven',
                    'Ex. Compressor de parafuso 10 HP / Eletrobomba / Centro CNC / Forno Industrial'
                  )}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Potencia (W)', 'Power (W)', 'Potência (W)')}</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Tensión / Fases', 'Voltage / Phases', 'Tensão / Fases')}</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Corriente Ib (A)', 'Current Ib (A)', 'Corrente Ib (A)')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={circuitForm.calculatedCurrentA}
                    onChange={e => setCircuitForm({ ...circuitForm, calculatedCurrentA: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Longitud Cable (m)', 'Cable Length (m)', 'Comprimento Cabo (m)')}</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Calibre Conductor', 'Wire Section', 'Seção do Condutor')}</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Aislamiento Cable', 'Cable Insulation', 'Isolação do Cabo')}</label>
                  <select
                    value={circuitForm.wireInsulation}
                    onChange={e => setCircuitForm({ ...circuitForm, wireInsulation: e.target.value as WireInsulation })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="NH-80">{tr('NH-80 (Libre Halógenos)', 'NH-80 (Halogen-Free)', 'NH-80 (Livre de Halogênios)')}</option>
                    <option value="N2XH">{tr('N2XH (Libre Halógenos 90°C)', 'N2XH (Halogen-Free 90°C)', 'N2XH (Livre de Halogênios 90°C)')}</option>
                    <option value="THW-90">THW-90</option>
                    <option value="TW">TW (70°C)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Material', 'Material', 'Material')}</label>
                  <select
                    value={circuitForm.wireMaterial}
                    onChange={e => setCircuitForm({ ...circuitForm, wireMaterial: e.target.value as WireMaterial })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="COBRE">{tr('Cobre Electrolítico', 'Electrolytic Copper', 'Cobre Eletrolítico')}</option>
                    <option value="ALUMINIO">{tr('Aluminio', 'Aluminum', 'Alumínio')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Tierra PE (mm²)', 'PE Ground (mm²)', 'Terra PE (mm²)')}</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Termomagnético In (A)', 'Breaker Rating In (A)', 'Disjuntor In (A)')}</label>
                  <input
                    type="number"
                    value={circuitForm.breakerExistingA}
                    onChange={e => setCircuitForm({ ...circuitForm, breakerExistingA: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Curva Disparo', 'Trip Curve', 'Curva de Disparo')}</label>
                  <select
                    value={circuitForm.breakerCurve}
                    onChange={e => setCircuitForm({ ...circuitForm, breakerCurve: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value="B">{tr('Curva B (Resistivo)', 'Curve B (Resistive)', 'Curva B (Resistivo)')}</option>
                    <option value="C">{tr('Curva C (General)', 'Curve C (General)', 'Curva C (Geral)')}</option>
                    <option value="D">{tr('Curva D (Motores)', 'Curve D (Motors)', 'Curva D (Motores)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Diferencial In (A)', 'RCD Rating In (A)', 'Diferencial DR In (A)')}</label>
                  <input
                    type="number"
                    value={circuitForm.rcdExistingA || 25}
                    onChange={e => setCircuitForm({ ...circuitForm, rcdExistingA: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Sensibilidad RCD', 'RCD Sensitivity', 'Sensibilidade DR')}</label>
                  <select
                    value={circuitForm.rcdSensitivityMa}
                    onChange={e => setCircuitForm({ ...circuitForm, rcdSensitivityMa: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value={30}>{tr('30 mA (Personas)', '30 mA (Personnel)', '30 mA (Pessoas)')}</option>
                    <option value={300}>{tr('300 mA (Incendio)', '300 mA (Fire)', '300 mA (Incêndio)')}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCircuitModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {tr('Cancelar', 'Cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
                >
                  {editingCircuitId ? tr('Guardar Circuito', 'Save Circuit', 'Salvar Circuito') : tr('Registrar Circuito', 'Add Circuit', 'Registrar Circuito')}
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
                {tr('Registrar Nuevo Tablero Eléctrico', 'Register New Electrical Switchboard', 'Registrar Novo Quadro Elétrico')}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPanelModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                title={tr('Cerrar', 'Close', 'Fechar')}
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
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Código del Tablero', 'Switchboard Code', 'Código do Quadro')}</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Tipo de Tablero', 'Switchboard Type', 'Tipo de Quadro')}</label>
                  <select
                    value={panelForm.panelType}
                    onChange={e => setPanelForm({ ...panelForm, panelType: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="TABLERO_GENERAL">{tr('Tablero General (TG)', 'Main Switchboard (TG)', 'Quadro Geral (QGBT)')}</option>
                    <option value="SUBTABLERO_DISTRIBUCION">{tr('Subtablero Distribución', 'Distribution Sub-Panel', 'Subquadro de Distribuição')}</option>
                    <option value="TABLERO_MAQUINAS">{tr('Tablero de Fuerza / Máquinas', 'Power / Machinery Panel', 'Quadro de Força / Máquinas')}</option>
                    <option value="TABLERO_ALUMBRADO">{tr('Tablero de Alumbrado', 'Lighting Panel', 'Quadro de Iluminação')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{tr('Nombre Completo del Tablero', 'Full Switchboard Name', 'Nome Completo do Quadro')}</label>
                <input
                  type="text"
                  value={panelForm.name}
                  onChange={e => setPanelForm({ ...panelForm, name: e.target.value })}
                  placeholder={tr('Ej. Tablero General Industrial', 'E.g. Main Industrial Switchboard', 'Ex. Quadro Geral Industrial')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Interruptor General (A)', 'Main Breaker (A)', 'Disjuntor Geral (A)')}</label>
                  <input
                    type="number"
                    value={panelForm.mainBreakerRatingA}
                    onChange={e => setPanelForm({ ...panelForm, mainBreakerRatingA: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Gabinete / Enclosure', 'Enclosure Type', 'Gabinete / Invólucro')}</label>
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
                <label className="block font-semibold text-slate-700 mb-1">{tr('Ubicación Física', 'Physical Location', 'Localização Física')}</label>
                <input
                  type="text"
                  value={panelForm.location}
                  onChange={e => setPanelForm({ ...panelForm, location: e.target.value })}
                  placeholder={tr('Ej. Caseta de subestación / Nave de costura', 'E.g. Substation room / Production bay', 'Ex. Cabine da subestação / Galpão de produção')}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPanelModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {tr('Cancelar', 'Cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
                >
                  {tr('Crear Tablero', 'Create Switchboard', 'Criar Quadro')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
