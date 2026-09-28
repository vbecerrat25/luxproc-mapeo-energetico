import React from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Cpu, 
  SlidersHorizontal, 
  ShieldAlert, 
  Activity, 
  SunMedium, 
  Lightbulb, 
  PiggyBank, 
  ListChecks, 
  Camera, 
  FileBadge,
  Plus,
  Sparkles
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, diagnostic, computedEquipment, setShowNewProjectModal, activeScenario, setActiveScenario } = useDiagnostic();

  const navItems = [
    { id: 'dashboard', label: 'Panel Ejecutivo', icon: LayoutDashboard, badge: null },
    { id: 'general', label: 'Datos & Tarifas', icon: FileText, badge: diagnostic.generalData.installationType },
    { id: 'receipts', label: 'Recibos vs Censo', icon: Receipt, badge: `${(diagnostic.receipts || []).length}m` },
    { id: 'equipment', label: 'Censo de Cargas', icon: Cpu, badge: `${(computedEquipment || []).length}` },
    { id: 'circuits', label: 'Tableros & CNE', icon: SlidersHorizontal, badge: `${(diagnostic.circuits || []).length} cir` },
    { id: 'grounding', label: 'Puesta a Tierra', icon: ShieldAlert, badge: diagnostic.grounding?.[0] ? `${diagnostic.grounding[0].measuredResistanceOhm || diagnostic.grounding[0].calculatedTheoreticalResistanceOhm || 0}Ω` : null },
    { id: 'powerfactor', label: 'Factor Potencia', icon: Activity, badge: diagnostic.powerFactor?.currentPowerFactor != null ? `cosφ ${diagnostic.powerFactor.currentPowerFactor.toFixed(2)}` : null },
    { id: 'lighting', label: 'Iluminación RNE', icon: Lightbulb, badge: `${(diagnostic.lighting || []).length}` },
    { id: 'solar', label: 'Solar Fotovoltaica', icon: SunMedium, badge: diagnostic.solar?.scenarioKwp != null ? `${diagnostic.solar.scenarioKwp}kWp` : null },
    { id: 'opportunities', label: 'Plan de Ahorro', icon: PiggyBank, badge: `${(diagnostic.opportunities || []).length}` },
    { id: 'bom', label: 'Lista de Materiales', icon: ListChecks, badge: 'BOM' },
    { id: 'photos', label: 'Evidencia Fotos', icon: Camera, badge: `${(diagnostic.photos || []).length}` },
    { id: 'report', label: 'Informe Oficial CIP', icon: FileBadge, badge: 'PDF' }
  ];

  return (
    <aside className="w-68 lg:w-72 shrink-0 p-4 hidden md:block">
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-4 min-h-[calc(100vh-6rem)] flex flex-col justify-between">
        <div>
          {/* Installation metadata summary bento pill */}
          <div className="mb-4 rounded-2xl border border-slate-100 bg-[#f8f9fb] p-3.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Instalación Activa</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="font-bold text-slate-900 text-xs truncate mt-1" title={diagnostic.generalData.companyName || diagnostic.generalData.clientName}>
              {diagnostic.generalData.companyName || diagnostic.generalData.clientName || 'Sin Titular'}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>{diagnostic.tariff?.supplyVoltage || 220}V {diagnostic.tariff?.phases === 'TRIFASICO' ? '3Ø' : '1Ø'}</span>
              <span className="font-mono text-indigo-600 font-bold">{(diagnostic.tariff?.distributor || 'Luz del Sur').split(' ')[0]}</span>
            </div>

            <button
              onClick={() => setShowNewProjectModal(true)}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 hover:text-indigo-800 border border-slate-200/90 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
              title="Crear un nuevo proyecto de diagnóstico"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Nuevo Proyecto</span>
            </button>

            {/* Scenario toggle for Tablet / Desktop */}
            <div className="mt-2 flex items-center rounded-xl border border-slate-200/80 bg-slate-100/90 p-1 text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setActiveScenario('ACTUAL')}
                className={`flex-1 rounded-lg py-1 text-center transition-all ${
                  activeScenario === 'ACTUAL'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Actual
              </button>
              <button
                type="button"
                onClick={() => setActiveScenario('PROPUESTO')}
                className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1 transition-all ${
                  activeScenario === 'PROPUESTO'
                    ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-2.5 w-2.5" />
                <span>Propuesto</span>
              </button>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white stroke-[2.5]' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`ml-2 shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                      isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="mt-6 border-t border-slate-100 pt-3 px-1 text-[10px] text-slate-400">
          <div className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Normas Técnicas</div>
          <div className="font-medium text-slate-600">CNE 2006 • RNE EM.010 • IEC 60364</div>
        </div>
      </div>
    </aside>
  );
};
