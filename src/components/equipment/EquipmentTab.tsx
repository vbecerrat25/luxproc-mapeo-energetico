import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { EquipmentRecord, EquipmentCategory, PowerUnit, ConfidenceLevel, OperatingMode } from '../../types';
import { MetricCard } from '../shared/MetricCard';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Zap, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  X 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const EquipmentTab: React.FC = () => {
  const {
    diagnostic,
    computedEquipment,
    equipmentSummary,
    addEquipment,
    updateEquipment,
    deleteEquipment
  } = useDiagnostic();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [selectedArea, setSelectedArea] = useState<string>('TODOS');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formState, setFormState] = useState<Omit<EquipmentRecord, 'id' | 'code'>>({
    name: '',
    brand: '',
    model: '',
    category: 'Motor',
    areaTag: 'Planta Principal',
    quantity: 1,
    power: 1.5,
    powerUnit: 'HP',
    voltage: diagnostic.tariff.supplyVoltage,
    phases: diagnostic.tariff.phases,
    frequencyHz: 60,
    ratedCurrentA: 3.5,
    measuredCurrentA: 3.2,
    powerFactor: 0.82,
    efficiencyPercent: 85,
    hoursPerDay: 8,
    daysPerWeek: 6,
    weeksPerMonth: 4.33,
    state: 'OPERATIVO_OPTIMO',
    operatingMode: 'CONTINUO',
    loadFactor: 0.75,
    confidence: 'MEDIDO',
    observations: ''
  });

  const CATEGORIES: EquipmentCategory[] = [
    'Motor', 'Compresor', 'Bomba', 'Extractor', 'Máquina de corte',
    'Máquina de aparado', 'Máquina de prensado', 'Máquina de lijado',
    'Horno', 'Iluminación', 'Refrigeración', 'Climatización',
    'Computadora', 'Terma', 'Cocina eléctrica', 'Otro'
  ];

  // Distinct areas from equipment
  const distinctAreas = Array.from(new Set((diagnostic?.equipment || []).map(e => e.areaTag || 'General'))).filter(Boolean);

  const filteredEquipment = computedEquipment.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (e.brand && e.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (e.model && e.model.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'TODOS' || e.category === selectedCategory;
    const matchesArea = selectedArea === 'TODOS' || (e.areaTag || 'General') === selectedArea;
    return matchesSearch && matchesCategory && matchesArea;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormState({
      name: '',
      brand: '',
      model: '',
      category: diagnostic.generalData.installationType === 'calzado' ? 'Máquina de aparado' : 'Otro',
      areaTag: 'Planta Principal',
      quantity: 1,
      power: 1.0,
      powerUnit: diagnostic.generalData.installationType === 'vivienda' ? 'W' : 'HP',
      voltage: diagnostic.tariff.supplyVoltage,
      phases: diagnostic.tariff.phases,
      frequencyHz: 60,
      ratedCurrentA: 2.5,
      measuredCurrentA: 2.3,
      powerFactor: 0.85,
      efficiencyPercent: 85,
      hoursPerDay: 6,
      daysPerWeek: 6,
      weeksPerMonth: 4.33,
      state: 'OPERATIVO_OPTIMO',
      operatingMode: 'CONTINUO',
      loadFactor: 0.75,
      confidence: 'MEDIDO',
      observations: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (eq: EquipmentRecord) => {
    setEditingId(eq.id);
    setFormState({
      name: eq.name,
      brand: eq.brand || '',
      model: eq.model || '',
      category: eq.category,
      areaTag: eq.areaTag || '',
      quantity: eq.quantity || 1,
      power: eq.power,
      powerUnit: eq.powerUnit,
      voltage: eq.voltage,
      phases: eq.phases,
      frequencyHz: eq.frequencyHz || 60,
      ratedCurrentA: eq.ratedCurrentA || 0,
      measuredCurrentA: eq.measuredCurrentA || 0,
      powerFactor: eq.powerFactor || 0.85,
      efficiencyPercent: eq.efficiencyPercent || 85,
      hoursPerDay: eq.hoursPerDay,
      daysPerWeek: eq.daysPerWeek,
      weeksPerMonth: eq.weeksPerMonth || 4.33,
      state: eq.state,
      operatingMode: eq.operatingMode || 'CONTINUO',
      loadFactor: eq.loadFactor || 0.8,
      confidence: eq.confidence,
      observations: eq.observations || ''
    });
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateEquipment(editingId, formState);
    } else {
      addEquipment(formState);
    }
    setShowAddModal(false);
  };

  const pieColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#64748b', '#14b8a6', '#e11d48'];
  const categoriesList = equipmentSummary?.categoryBreakdown || equipmentSummary?.byCategory || [];
  const pieData = categoriesList.map((cat, idx) => ({
    name: cat.category,
    value: Math.round(cat.monthlyKwh),
    color: pieColors[idx % pieColors.length]
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            Censo Exhaustivo de Cargas y Equipos
          </h2>
          <p className="text-xs text-slate-500">
            Inventario técnico, potencias, regímenes de operación, factores de carga y cálculo de consumo eléctrico
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm transition-colors"
        >
          <Plus size={14} />
          <span>Agregar Equipo</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Potencia Total Instalada"
          value={equipmentSummary.totalInstalledPowerKw.toFixed(1)}
          unit="kW"
          subtitle={`${computedEquipment.length} equipos censados`}
          highlightColor="indigo"
          icon={<Cpu size={18} />}
        />
        <MetricCard
          title="Consumo Mensual Censo"
          value={equipmentSummary.totalMonthlyKwh.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit="kWh/mes"
          subtitle={`S/. ${equipmentSummary.totalMonthlyCostSoles.toLocaleString('es-PE', { maximumFractionDigits: 0 })}/mes`}
          highlightColor="amber"
          icon={<Zap size={18} />}
        />
        <MetricCard
          title="Consumo Anual Censo"
          value={(equipmentSummary.totalMonthlyKwh * 12).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit="kWh/año"
          subtitle={`S/. ${(equipmentSummary.totalMonthlyCostSoles * 12).toLocaleString('es-PE', { maximumFractionDigits: 0 })}/año`}
          highlightColor="blue"
          icon={<Activity size={18} />}
        />
        <MetricCard
          title="Factor de Carga Promedio"
          value={
            computedEquipment.length > 0
              ? (computedEquipment.reduce((acc, e) => acc + (e.loadFactor || 0.8), 0) / computedEquipment.length).toFixed(2)
              : '0.80'
          }
          subtitle="Ponderación de simultaneidad"
          highlightColor="emerald"
          icon={<Clock size={18} />}
        />
      </div>

      {/* Distribution Chart & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Donut Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Distribución de Consumo por Categoría</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number) => [`${val.toLocaleString()} kWh/mes`, 'Consumo']}
                  contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center text-[10px]">
            {pieData.map((cat, i) => (
              <span key={i} className="inline-flex items-center gap-1 font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name} ({cat.value} kWh)
              </span>
            ))}
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Filtros y Búsqueda de Inventario</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Buscar por nombre o marca</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Compresor, Motor, Horno..."
                    className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="TODOS">Todas las Categorías</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Área / Proceso</label>
                <select
                  value={selectedArea}
                  onChange={e => setSelectedArea(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="TODOS">Todas las Áreas</option>
                  {distinctAreas.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 gap-1.5">
            <span>Mostrando {filteredEquipment.length} de {computedEquipment.length} equipos</span>
            <span className="font-semibold text-slate-700">
              Consumo filtrado: {filteredEquipment.reduce((acc, e) => acc + (e.monthlyKwh || 0), 0).toFixed(0)} kWh/mes
            </span>
          </div>
        </div>

      </div>

      {/* Equipment View: Mobile Card List (sm:hidden) & Desktop Table (hidden sm:block) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        
        {/* Mobile Cards View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {filteredEquipment.map(eq => {
            const sharePct = equipmentSummary.totalMonthlyKwh > 0
              ? ((eq.monthlyKwh || 0) / equipmentSummary.totalMonthlyKwh) * 100
              : 0;

            return (
              <div key={eq.id} className="p-3.5 space-y-2.5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      {eq.code}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{eq.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {eq.brand || 'Genérico'} {eq.model ? `• ${eq.model}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-medium shrink-0 ${
                    eq.state === 'OPERATIVO_OPTIMO'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : (eq.state === 'OPERATIVO_REGULAR'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200')
                  }`}>
                    {eq.state === 'OPERATIVO_OPTIMO' ? 'Óptimo' : (eq.state === 'OPERATIVO_REGULAR' ? 'Regular' : 'Crítico')}
                  </span>
                </div>

                {/* Technical specifications grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/70 p-2 rounded-xl text-[11px]">
                  <div>
                    <div className="text-[9px] text-slate-400 font-medium uppercase">Potencia</div>
                    <div className="font-bold text-slate-900">{eq.power} {eq.powerUnit}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 font-medium uppercase">Tensión / I</div>
                    <div className="font-semibold text-slate-800">
                      {eq.voltage}V • {eq.measuredCurrentA || eq.ratedCurrentA || 0}A
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 font-medium uppercase">Régimen</div>
                    <div className="font-semibold text-slate-800">{eq.hoursPerDay}h/d • {eq.daysPerWeek}d/s</div>
                  </div>
                </div>

                {/* Energy & Cost footer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-mono font-bold text-slate-900">
                      {Math.round(eq.monthlyKwh || 0).toLocaleString()} kWh/mes
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({sharePct.toFixed(1)}%)
                    </span>
                    <div className="text-[11px] font-bold text-amber-900">
                      S/. {Math.round(eq.monthlyCostSoles || 0).toLocaleString()}/mes
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(eq)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Edit3 size={12} />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => deleteEquipment(eq.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEquipment.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No se encontraron equipos que coincidan con los filtros.
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Código / Equipo</th>
                <th className="px-4 py-3">Área / Proceso</th>
                <th className="px-4 py-3">Cant.</th>
                <th className="px-4 py-3">Potencia</th>
                <th className="px-4 py-3">Tensión</th>
                <th className="px-4 py-3">Corriente (A)</th>
                <th className="px-4 py-3">Régimen Uso</th>
                <th className="px-4 py-3">Factor Carga</th>
                <th className="px-4 py-3">Consumo Mes</th>
                <th className="px-4 py-3">Gasto Mes</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEquipment.map(eq => {
                const sharePct = equipmentSummary.totalMonthlyKwh > 0
                  ? ((eq.monthlyKwh || 0) / equipmentSummary.totalMonthlyKwh) * 100
                  : 0;

                return (
                  <tr key={eq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {eq.code}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{eq.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {eq.brand} {eq.model ? `• ${eq.model}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900 border border-amber-200/50">
                        {eq.areaTag || 'General'}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {eq.quantity || 1}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {eq.power} {eq.powerUnit}
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-700">
                      {eq.voltage}V {eq.phases === 'TRIFASICO' ? '3Ø' : '1Ø'}
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-800">
                      {eq.measuredCurrentA ? `${eq.measuredCurrentA}A` : `${eq.ratedCurrentA || 0}A`}
                    </td>

                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {eq.hoursPerDay}h/d • {eq.daysPerWeek}d/s
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-700">
                      {eq.loadFactor || 0.8}
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {Math.round(eq.monthlyKwh || 0).toLocaleString()} kWh
                      <span className="block text-[10px] font-normal text-slate-400">
                        ({sharePct.toFixed(1)}% total)
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-amber-900 whitespace-nowrap">
                      S/. {Math.round(eq.monthlyCostSoles || 0).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        eq.state === 'OPERATIVO_OPTIMO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : (eq.state === 'OPERATIVO_REGULAR'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200')
                      }`}>
                        {eq.state === 'OPERATIVO_OPTIMO' ? 'Óptimo' : (eq.state === 'OPERATIVO_REGULAR' ? 'Regular' : 'Crítico')}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(eq)}
                        className="p-1 text-slate-500 hover:text-amber-600 mr-1"
                        title="Editar equipo"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteEquipment(eq.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                        title="Eliminar equipo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredEquipment.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                    No se encontraron equipos que coincidan con los filtros.
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
            {/* Sticky Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-6 py-3.5 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                  <Cpu className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                    {editingId ? 'Editar Equipo / Máquina Censada' : 'Registrar Nuevo Equipo en el Censo'}
                  </h3>
                  <p className="text-[11px] text-slate-500 hidden sm:block">Parámetros de placa y medición para cálculo de consumo</p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nombre o Denominación del Equipo *</label>
                    <input
                      type="text"
                      value={formState.name}
                      onChange={e => setFormState({ ...formState, name: e.target.value })}
                      placeholder="Ej. Balancín Hidráulico de Corte"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Categoría de Carga *</label>
                    <select
                      value={formState.category}
                      onChange={e => setFormState({ ...formState, category: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Marca</label>
                    <input
                      type="text"
                      value={formState.brand}
                      onChange={e => setFormState({ ...formState, brand: e.target.value })}
                      placeholder="Ej. Atom / Schulz / Pfaff"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Modelo / Serie</label>
                    <input
                      type="text"
                      value={formState.model}
                      onChange={e => setFormState({ ...formState, model: e.target.value })}
                      placeholder="Ej. SE-24 / MSV 40"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Área o Sector del Proceso</label>
                    <input
                      type="text"
                      value={formState.areaTag}
                      onChange={e => setFormState({ ...formState, areaTag: e.target.value })}
                      placeholder="Ej. Planta Principal / Costura"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Electrical specs box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/70">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={formState.quantity}
                      onChange={e => setFormState({ ...formState, quantity: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Potencia Nominal</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={formState.power}
                        onChange={e => setFormState({ ...formState, power: Number(e.target.value) })}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none min-w-0"
                        required
                      />
                      <select
                        value={formState.powerUnit}
                        onChange={e => setFormState({ ...formState, powerUnit: e.target.value as PowerUnit })}
                        className="rounded-lg border border-slate-300 px-1 py-1.5 text-xs font-bold focus:border-amber-500 focus:outline-none shrink-0"
                      >
                        <option value="HP">HP</option>
                        <option value="kW">kW</option>
                        <option value="W">W</option>
                        <option value="kVA">kVA</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tensión / Fases</label>
                    <div className="flex gap-1">
                      <select
                        value={formState.voltage}
                        onChange={e => setFormState({ ...formState, voltage: Number(e.target.value) })}
                        className="w-full rounded-lg border border-slate-300 px-1 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none min-w-0"
                      >
                        <option value={220}>220V</option>
                        <option value={380}>380V</option>
                        <option value={440}>440V</option>
                      </select>
                      <select
                        value={formState.phases}
                        onChange={e => setFormState({ ...formState, phases: e.target.value as any })}
                        className="rounded-lg border border-slate-300 px-1 py-1.5 text-xs focus:border-amber-500 focus:outline-none shrink-0"
                      >
                        <option value="MONOFASICO">1Ø</option>
                        <option value="TRIFASICO">3Ø</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Corriente Medida (A)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formState.measuredCurrentA}
                      onChange={e => setFormState({ ...formState, measuredCurrentA: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Operating hours & load factor */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Horas / Día</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formState.hoursPerDay}
                      onChange={e => setFormState({ ...formState, hoursPerDay: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Días / Semana</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={formState.daysPerWeek}
                      onChange={e => setFormState({ ...formState, daysPerWeek: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Factor de Carga (0-1)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="1.0"
                      value={formState.loadFactor}
                      onChange={e => setFormState({ ...formState, loadFactor: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">cos φ (FP)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.4"
                      max="1.0"
                      value={formState.powerFactor}
                      onChange={e => setFormState({ ...formState, powerFactor: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status & Operating Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Estado Operativo</label>
                    <select
                      value={formState.state}
                      onChange={e => setFormState({ ...formState, state: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="OPERATIVO_OPTIMO">Óptimo / Buen Estado</option>
                      <option value="OPERATIVO_REGULAR">Regular / Desgaste Menor</option>
                      <option value="CRITICO_REEMPLAZAR">Crítico / Sobrecarga / Reemplazo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Modo de Operación</label>
                    <select
                      value={formState.operatingMode}
                      onChange={e => setFormState({ ...formState, operatingMode: e.target.value as OperatingMode })}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="CONTINUO">Continuo</option>
                      <option value="INTERMITENTE">Intermitente / Ciclos</option>
                      <option value="STANDBY">En espera / Standby</option>
                      <option value="EMERGENCIA">Reserva / Emergencia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Origen del Dato</label>
                    <select
                      value={formState.confidence}
                      onChange={e => setFormState({ ...formState, confidence: e.target.value as ConfidenceLevel })}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="MEDIDO">Medición en Campo (Pinza)</option>
                      <option value="PLACA_FABRICANTE">Placa de Características</option>
                      <option value="CALCULADO">Cálculo Estimado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Observaciones Técnicas</label>
                  <input
                    type="text"
                    value={formState.observations}
                    onChange={e => setFormState({ ...formState, observations: e.target.value })}
                    placeholder="Detalles sobre vibración, arrancador estrella-triángulo, variador, etc."
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
                  {editingId ? 'Guardar Cambios' : 'Registrar Equipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
