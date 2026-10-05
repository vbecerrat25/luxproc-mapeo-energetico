import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { EquipmentRecord, EquipmentCategory, PowerUnit, ConfidenceLevel, OperatingMode } from '../../types';
import { MetricCard } from '../shared/MetricCard';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Zap, 
  Clock, 
  Activity,
  X 
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const EquipmentTab: React.FC = () => {
  const {
    diagnostic,
    computedEquipment,
    equipmentSummary,
    addEquipment,
    updateEquipment,
    deleteEquipment
  } = useDiagnostic();
  const { language } = useLanguage();

  const tr = (es: string, en: string, pt: string) =>
    language === 'en' ? en : language === 'pt' ? pt : es;

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

  const translateCategory = (cat: string) => {
    const map: Record<string, { en: string; pt: string }> = {
      'Motor': { en: 'Electric Motor', pt: 'Motor Elétrico' },
      'Compresor': { en: 'Air Compressor', pt: 'Compressor de Ar' },
      'Bomba': { en: 'Water / Fluid Pump', pt: 'Bomba Hidráulica' },
      'Extractor': { en: 'Exhaust Fan', pt: 'Exaustor / Ventilador' },
      'Máquina de corte': { en: 'Cutting Machine', pt: 'Máquina de Corte' },
      'Máquina de aparado': { en: 'Stitching Machine', pt: 'Máquina de Costura' },
      'Máquina de prensado': { en: 'Pressing Machine', pt: 'Máquina de Prensagem' },
      'Máquina de lijado': { en: 'Sanding / Finishing Machine', pt: 'Máquina de Lixamento' },
      'Horno': { en: 'Industrial Oven / Heater', pt: 'Forno / Estufa Industrial' },
      'Iluminación': { en: 'Lighting System', pt: 'Iluminação' },
      'Refrigeración': { en: 'Refrigeration Unit', pt: 'Refrigeração' },
      'Climatización': { en: 'HVAC / Air Conditioning', pt: 'Climatização / Ar Condicionado' },
      'Computadora': { en: 'IT / Computers', pt: 'Computadores / TI' },
      'Terma': { en: 'Water Heater', pt: 'Aquecedor de Água' },
      'Cocina eléctrica': { en: 'Electric Stove / Cooking', pt: 'Fogão / Cozinha Elétrica' },
      'Otro': { en: 'Other Load', pt: 'Outro Equipamento' }
    };
    if (language === 'en') return map[cat]?.en || cat;
    if (language === 'pt') return map[cat]?.pt || cat;
    return cat;
  };

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
    name: translateCategory(cat.category),
    value: Math.round(cat.monthlyKwh),
    color: pieColors[idx % pieColors.length]
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            {tr('Censo Exhaustivo de Cargas y Equipos', 'Comprehensive Load & Equipment Census', 'Censo Exaustivo de Cargas e Equipamentos')}
          </h2>
          <p className="text-xs text-slate-500">
            {tr(
              'Inventario técnico, potencias, regímenes de operación, factores de carga y cálculo de consumo eléctrico',
              'Technical inventory, power ratings, operating regimes, load factors, and electrical consumption calculations',
              'Inventário técnico, potências, regimes de operação, fatores de carga e cálculo de consumo elétrico'
            )}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>{tr('Agregar Equipo', 'Add Equipment', 'Adicionar Equipamento')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title={tr('Potencia Total Instalada', 'Total Installed Power', 'Potência Total Instalada')}
          value={equipmentSummary.totalInstalledPowerKw.toFixed(1)}
          unit="kW"
          subtitle={`${computedEquipment.length} ${tr('equipos censados', 'recorded units', 'equipamentos recenseados')}`}
          highlightColor="indigo"
          icon={<Cpu size={18} />}
        />
        <MetricCard
          title={tr('Consumo Mensual Censo', 'Monthly Census Consumption', 'Consumo Mensal Censo')}
          value={equipmentSummary.totalMonthlyKwh.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit={tr('kWh/mes', 'kWh/mo', 'kWh/mês')}
          subtitle={`S/. ${equipmentSummary.totalMonthlyCostSoles.toLocaleString('es-PE', { maximumFractionDigits: 0 })}/${tr('mes', 'mo', 'mês')}`}
          highlightColor="amber"
          icon={<Zap size={18} />}
        />
        <MetricCard
          title={tr('Consumo Anual Censo', 'Annual Census Consumption', 'Consumo Anual Censo')}
          value={(equipmentSummary.totalMonthlyKwh * 12).toLocaleString('es-PE', { maximumFractionDigits: 0 })}
          unit={tr('kWh/año', 'kWh/yr', 'kWh/ano')}
          subtitle={`S/. ${(equipmentSummary.totalMonthlyCostSoles * 12).toLocaleString('es-PE', { maximumFractionDigits: 0 })}/${tr('año', 'yr', 'ano')}`}
          highlightColor="blue"
          icon={<Activity size={18} />}
        />
        <MetricCard
          title={tr('Factor de Carga Promedio', 'Average Load Factor', 'Fator de Carga Médio')}
          value={
            computedEquipment.length > 0
              ? (computedEquipment.reduce((acc, e) => acc + (e.loadFactor || 0.8), 0) / computedEquipment.length).toFixed(2)
              : '0.80'
          }
          subtitle={tr('Ponderación de simultaneidad', 'Simultaneity weighting', 'Ponderação de simultaneidade')}
          highlightColor="emerald"
          icon={<Clock size={18} />}
        />
      </div>

      {/* Distribution Chart & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Donut Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
          <h3 className="text-sm font-bold text-slate-900">
            {tr('Distribución de Consumo por Categoría', 'Consumption Breakdown by Category', 'Distribuição de Consumo por Categoria')}
          </h3>
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
                  formatter={(val: number) => [
                    `${val.toLocaleString()} ${tr('kWh/mes', 'kWh/mo', 'kWh/mês')}`,
                    tr('Consumo', 'Consumption', 'Consumo')
                  ]}
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
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              {tr('Filtros y Búsqueda de Inventario', 'Inventory Filters & Search', 'Filtros e Busca de Inventário')}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {tr('Buscar por nombre o marca', 'Search by name or brand', 'Buscar por nome ou marca')}
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder={tr('Compresor, Motor, Horno...', 'Compressor, Motor, Oven...', 'Compressor, Motor, Forno...')}
                    className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {tr('Categoría', 'Category', 'Categoria')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="TODOS">{tr('Todas las Categorías', 'All Categories', 'Todas as Categorias')}</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{translateCategory(c)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {tr('Área / Proceso', 'Area / Process', 'Área / Processo')}
                </label>
                <select
                  value={selectedArea}
                  onChange={e => setSelectedArea(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="TODOS">{tr('Todas las Áreas', 'All Areas', 'Todas as Áreas')}</option>
                  {distinctAreas.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 gap-1.5">
            <span>
              {tr('Mostrando', 'Showing', 'Mostrando')} {filteredEquipment.length} {tr('de', 'of', 'de')} {computedEquipment.length} {tr('equipos', 'units', 'equipamentos')}
            </span>
            <span className="font-semibold text-slate-700">
              {tr('Consumo filtrado:', 'Filtered consumption:', 'Consumo filtrado:')} {filteredEquipment.reduce((acc, e) => acc + (e.monthlyKwh || 0), 0).toFixed(0)} {tr('kWh/mes', 'kWh/mo', 'kWh/mês')}
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
                        {eq.brand || tr('Genérico', 'Generic', 'Genérico')} {eq.model ? `• ${eq.model}` : ''}
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
                    {eq.state === 'OPERATIVO_OPTIMO'
                      ? tr('Óptimo', 'Optimal', 'Ótimo')
                      : (eq.state === 'OPERATIVO_REGULAR' ? tr('Regular', 'Fair', 'Regular') : tr('Crítico', 'Critical', 'Crítico'))}
                  </span>
                </div>

                {/* Technical specifications grid */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50/70 p-2 rounded-xl text-[11px]">
                  <div>
                    <div className="text-[9px] text-slate-400 font-medium uppercase">{tr('Potencia', 'Power', 'Potência')}</div>
                    <div className="font-bold text-slate-900">{eq.power} {eq.powerUnit}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 font-medium uppercase">{tr('Tensión / I', 'Voltage / I', 'Tensão / I')}</div>
                    <div className="font-semibold text-slate-800">
                      {eq.voltage}V • {eq.measuredCurrentA || eq.ratedCurrentA || 0}A
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400 font-medium uppercase">{tr('Régimen', 'Schedule', 'Regime')}</div>
                    <div className="font-semibold text-slate-800">{eq.hoursPerDay}h/d • {eq.daysPerWeek}d/w</div>
                  </div>
                </div>

                {/* Energy & Cost footer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <span className="font-mono font-bold text-slate-900">
                      {Math.round(eq.monthlyKwh || 0).toLocaleString()} {tr('kWh/mes', 'kWh/mo', 'kWh/mês')}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({sharePct.toFixed(1)}%)
                    </span>
                    <div className="text-[11px] font-bold text-amber-900">
                      S/. {Math.round(eq.monthlyCostSoles || 0).toLocaleString()}/{tr('mes', 'mo', 'mês')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(eq)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>{tr('Editar', 'Edit', 'Editar')}</span>
                    </button>
                    <button
                      onClick={() => deleteEquipment(eq.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title={tr('Eliminar', 'Delete', 'Excluir')}
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
              {tr('No se encontraron equipos que coincidan con los filtros.', 'No equipment found matching the filters.', 'Nenhum equipamento encontrado para os filtros.')}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">{tr('Código / Equipo', 'Code / Equipment', 'Código / Equipamento')}</th>
                <th className="px-4 py-3">{tr('Área / Proceso', 'Area / Process', 'Área / Processo')}</th>
                <th className="px-4 py-3">{tr('Cant.', 'Qty', 'Qtd.')}</th>
                <th className="px-4 py-3">{tr('Potencia', 'Power', 'Potência')}</th>
                <th className="px-4 py-3">{tr('Tensión', 'Voltage', 'Tensão')}</th>
                <th className="px-4 py-3">{tr('Corriente (A)', 'Current (A)', 'Corrente (A)')}</th>
                <th className="px-4 py-3">{tr('Régimen Uso', 'Usage Regime', 'Regime Uso')}</th>
                <th className="px-4 py-3">{tr('Factor Carga', 'Load Factor', 'Fator Carga')}</th>
                <th className="px-4 py-3">{tr('Consumo Mes', 'Monthly kWh', 'Consumo Mês')}</th>
                <th className="px-4 py-3">{tr('Gasto Mes', 'Monthly Cost', 'Custo Mês')}</th>
                <th className="px-4 py-3">{tr('Estado', 'Condition', 'Estado')}</th>
                <th className="px-4 py-3 text-right">{tr('Acciones', 'Actions', 'Ações')}</th>
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
                      {eq.hoursPerDay}h/d • {eq.daysPerWeek}d/w
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
                        {eq.state === 'OPERATIVO_OPTIMO'
                          ? tr('Óptimo', 'Optimal', 'Ótimo')
                          : (eq.state === 'OPERATIVO_REGULAR' ? tr('Regular', 'Fair', 'Regular') : tr('Crítico', 'Critical', 'Crítico'))}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(eq)}
                        className="p-1 text-slate-500 hover:text-amber-600 mr-1 cursor-pointer"
                        title={tr('Editar equipo', 'Edit equipment', 'Editar equipamento')}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteEquipment(eq.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title={tr('Eliminar equipo', 'Delete equipment', 'Excluir equipamento')}
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
                    {tr('No se encontraron equipos que coincidan con los filtros.', 'No equipment found matching the filters.', 'Nenhum equipamento encontrado para os filtros.')}
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
                    {editingId
                      ? tr('Editar Equipo / Máquina Censada', 'Edit Recorded Equipment / Machine', 'Editar Equipamento / Máquina')
                      : tr('Registrar Nuevo Equipo en el Censo', 'Add New Equipment to Census', 'Registrar Novo Equipamento no Censo')}
                  </h3>
                  <p className="text-[11px] text-slate-500 hidden sm:block">
                    {tr('Parámetros de placa y medición para cálculo de consumo', 'Nameplate and field measurement parameters for energy calculation', 'Parâmetros de placa e medição para cálculo de consumo')}
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

            {/* Scrollable Form Body */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {tr('Nombre o Denominación del Equipo *', 'Equipment Name / Description *', 'Nome ou Denominação do Equipamento *')}
                    </label>
                    <input
                      type="text"
                      value={formState.name}
                      onChange={e => setFormState({ ...formState, name: e.target.value })}
                      placeholder={tr('Ej. Balancín Hidráulico de Corte', 'E.g. Hydraulic Cutting Press', 'Ex. Balancim Hidráulico de Corte')}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {tr('Categoría de Carga *', 'Load Category *', 'Categoria da Carga *')}
                    </label>
                    <select
                      value={formState.category}
                      onChange={e => setFormState({ ...formState, category: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{translateCategory(c)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Marca', 'Brand', 'Marca')}</label>
                    <input
                      type="text"
                      value={formState.brand}
                      onChange={e => setFormState({ ...formState, brand: e.target.value })}
                      placeholder="Ej. Atom / Schulz / Pfaff"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Modelo / Serie', 'Model / Series', 'Modelo / Série')}</label>
                    <input
                      type="text"
                      value={formState.model}
                      onChange={e => setFormState({ ...formState, model: e.target.value })}
                      placeholder="Ej. SE-24 / MSV 40"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Área o Sector del Proceso', 'Process Area or Sector', 'Área ou Setor do Processo')}</label>
                    <input
                      type="text"
                      value={formState.areaTag}
                      onChange={e => setFormState({ ...formState, areaTag: e.target.value })}
                      placeholder={tr('Ej. Planta Principal / Costura', 'E.g. Main Floor / Assembly', 'Ex. Planta Principal / Costura')}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Electrical specs box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200/70">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Cantidad', 'Quantity', 'Quantidade')}</label>
                    <input
                      type="number"
                      min="1"
                      value={formState.quantity}
                      onChange={e => setFormState({ ...formState, quantity: Number(e.target.value) })}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Potencia Nominal', 'Rated Power', 'Potência Nominal')}</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Tensión / Fases', 'Voltage / Phases', 'Tensão / Fases')}</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Corriente Medida (A)', 'Measured Current (A)', 'Corrente Medida (A)')}</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Horas / Día', 'Hours / Day', 'Horas / Dia')}</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Días / Semana', 'Days / Week', 'Dias / Semana')}</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Factor de Carga (0-1)', 'Load Factor (0-1)', 'Fator de Carga (0-1)')}</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">{tr('cos φ (FP)', 'cos φ (PF)', 'cos φ (FP)')}</label>
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
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Estado Operativo', 'Operating Condition', 'Estado Operacional')}</label>
                    <select
                      value={formState.state}
                      onChange={e => setFormState({ ...formState, state: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="OPERATIVO_OPTIMO">{tr('Óptimo / Buen Estado', 'Optimal / Good Condition', 'Ótimo / Bom Estado')}</option>
                      <option value="OPERATIVO_REGULAR">{tr('Regular / Desgaste Menor', 'Fair / Minor Wear', 'Regular / Desgaste Leve')}</option>
                      <option value="CRITICO_REEMPLAZAR">{tr('Crítico / Sobrecarga / Reemplazo', 'Critical / Overload / Replace', 'Crítico / Sobrecarga / Substituir')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Modo de Operación', 'Operating Mode', 'Modo de Operação')}</label>
                    <select
                      value={formState.operatingMode}
                      onChange={e => setFormState({ ...formState, operatingMode: e.target.value as OperatingMode })}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="CONTINUO">{tr('Continuo', 'Continuous', 'Contínuo')}</option>
                      <option value="INTERMITENTE">{tr('Intermitente / Ciclos', 'Intermittent / Cyclic', 'Intermitente / Ciclos')}</option>
                      <option value="STANDBY">{tr('En espera / Standby', 'Standby', 'Em espera / Standby')}</option>
                      <option value="EMERGENCIA">{tr('Reserva / Emergencia', 'Backup / Emergency', 'Reserva / Emergência')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{tr('Origen del Dato', 'Data Source', 'Origem do Dado')}</label>
                    <select
                      value={formState.confidence}
                      onChange={e => setFormState({ ...formState, confidence: e.target.value as ConfidenceLevel })}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                    >
                      <option value="MEDIDO">{tr('Medición en Campo (Pinza)', 'Field Clamp Measurement', 'Medição em Campo (Alicate)')}</option>
                      <option value="PLACA_FABRICANTE">{tr('Placa de Características', 'Manufacturer Nameplate', 'Placa do Fabricante')}</option>
                      <option value="CALCULADO">{tr('Cálculo Estimado', 'Estimated Calculation', 'Cálculo Estimado')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{tr('Observaciones Técnicas', 'Technical Observations', 'Observações Técnicas')}</label>
                  <input
                    type="text"
                    value={formState.observations}
                    onChange={e => setFormState({ ...formState, observations: e.target.value })}
                    placeholder={tr('Detalles sobre vibración, arrancador estrella-triángulo, variador, etc.', 'Details on vibration, star-delta starter, VFD, etc.', 'Detalhes sobre vibração, partida estrela-triângulo, inversor, etc.')}
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
                  {tr('Cancelar', 'Cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-xs cursor-pointer"
                >
                  {editingId ? tr('Guardar Cambios', 'Save Changes', 'Salvar Alterações') : tr('Registrar Equipo', 'Save Equipment', 'Registrar Equipamento')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
