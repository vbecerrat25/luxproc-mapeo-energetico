import React, { useRef } from 'react';
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
  ShieldCheck,
  Gauge,
  Sparkles,
  Plus,
  FileSpreadsheet,
  FileUp,
  Printer,
  X,
  Building2,
  ChevronRight,
  Zap,
  LogOut,
  UserCheck
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { exportDiagnosticToExcel } from '../../utils/excelExporter';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewProject: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ isOpen, onClose, onOpenNewProject }) => {
  const {
    currentUser,
    logout,
    diagnostic,
    activeTab,
    setActiveTab,
    activeScenario,
    setActiveScenario,
    safetyEvaluation,
    efficiencyEvaluation,
    computedEquipment,
    importJson
  } = useDiagnostic();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAvatarUrl = (user: typeof currentUser) => {
    if (user?.avatarUrl && !user.avatarUrl.includes('unsplash.com')) {
      return user.avatarUrl;
    }
    const nameOrEmail = user?.name || user?.email || 'Ingeniero';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameOrEmail)}&background=0284c7&color=fff&size=128&bold=true`;
  };

  if (!isOpen) return null;

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
    { id: 'bom', label: 'Lista Materiales', icon: ListChecks, badge: 'BOM' },
    { id: 'photos', label: 'Evidencia Fotos', icon: Camera, badge: `${(diagnostic.photos || []).length}` },
    { id: 'report', label: 'Informe Oficial CIP', icon: FileBadge, badge: 'PDF' }
  ];

  const handleExportExcel = () => {
    exportDiagnosticToExcel(diagnostic);
    onClose();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const success = importJson(text);
        if (success) {
          alert('¡Diagnóstico importado exitosamente!');
          onClose();
        } else {
          alert('Error: formato de archivo inválido.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const drawerContent = (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="relative flex w-[85vw] max-w-xs flex-1 flex-col bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <img 
              src="https://i.imgur.com/WWChkA9.png" 
              alt="E-DIAGNOSIS OS" 
              className="h-8 w-auto object-contain shrink-0" 
              referrerPolicy="no-referrer" 
            />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-950 leading-none">
                E-DIAGNOSIS
              </span>
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-md text-[10px] font-black lowercase leading-none shadow-2xs">
                os
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Account Card */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={getAvatarUrl(currentUser)}
                alt={currentUser?.name || 'Ingeniero'}
                className="w-8 h-8 rounded-full object-cover border border-slate-700"
              />
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentUser?.name || 'Ing. Fernando Benites Torres'}</span>
              </div>
              <div className="text-[10px] text-amber-300 font-semibold font-mono mt-0.5">
                <span>{currentUser?.cipNumber ? `CIP ${currentUser.cipNumber}` : 'CIP 178452'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Salir</span>
          </button>
        </div>

        {/* Current Project Bento Pill */}
        <div className="p-3 border-b border-slate-100 bg-indigo-50/30">
          <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center justify-between">
            <span>Proyecto Activo</span>
            <span className="capitalize text-indigo-700 font-semibold">{diagnostic.generalData.installationType || 'industria'}</span>
          </div>
          <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
            {diagnostic.generalData.companyName || diagnostic.generalData.clientName || 'Sin Titular'}
          </div>
          <div className="text-[11px] text-slate-600 mt-1 flex justify-between">
            <span>{diagnostic.tariff?.supplyVoltage || 220}V {diagnostic.tariff?.phases === 'TRIFASICO' ? 'Trifásico' : 'Monofásico'}</span>
            <span className="font-mono font-bold text-indigo-700">{diagnostic.tariff?.tariffCode || 'BT5A'}</span>
          </div>
        </div>

        {/* Global Scores & Scenario */}
        <div className="p-3 border-b border-slate-100 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div 
              onClick={() => { setActiveTab('circuits'); onClose(); }}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-2 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Seguridad</span>
              </div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {safetyEvaluation.score}<span className="text-[10px] text-slate-400 font-normal">/100</span>
              </div>
            </div>

            <div 
              onClick={() => { setActiveTab('powerfactor'); onClose(); }}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-2 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <Gauge className="h-3.5 w-3.5 text-indigo-600" />
                <span>Eficiencia</span>
              </div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {efficiencyEvaluation.score}<span className="text-[10px] text-slate-400 font-normal">/100</span>
              </div>
            </div>
          </div>

          {/* Scenario toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveScenario('ACTUAL')}
              className={`flex-1 rounded-lg py-1 text-center transition-all ${
                activeScenario === 'ACTUAL'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600'
              }`}
            >
              Actual
            </button>
            <button
              onClick={() => setActiveScenario('PROPUESTO')}
              className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1 transition-all ${
                activeScenario === 'PROPUESTO'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Propuesto</span>
            </button>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-2 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Módulos de Diagnóstico
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick action buttons */}
        <div className="border-t border-slate-200 p-3 bg-slate-50/60 space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenNewProject();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ Crear Nuevo Proyecto</span>
          </button>

          <div className="flex gap-2 pt-1">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImportFile} 
              accept=".json" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <FileUp className="h-3.5 w-3.5" />
              <span>Importar</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
              <span>Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
};

export const MobileNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useDiagnostic();

  const quickTabs = [
    { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
    { id: 'general', label: 'Datos', icon: FileText },
    { id: 'equipment', label: 'Censo', icon: Cpu },
    { id: 'circuits', label: 'Tableros', icon: SlidersHorizontal },
    { id: 'receipts', label: 'Recibos', icon: Receipt },
    { id: 'powerfactor', label: 'FP', icon: Activity },
    { id: 'grounding', label: 'Tierra', icon: ShieldAlert },
    { id: 'lighting', label: 'Luz', icon: Lightbulb },
    { id: 'solar', label: 'Solar', icon: SunMedium },
    { id: 'opportunities', label: 'Ahorro', icon: PiggyBank },
    { id: 'bom', label: 'BOM', icon: ListChecks },
    { id: 'photos', label: 'Fotos', icon: Camera },
    { id: 'report', label: 'CIP', icon: FileBadge }
  ];

  return (
    <div className="md:hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-14 sm:top-16 z-30 shadow-2xs">
      <div className="flex items-center gap-1 overflow-x-auto px-2.5 py-1.5 no-scrollbar scroll-smooth">
        {quickTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = (activeTab || 'dashboard').toLowerCase() === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] font-semibold shrink-0 transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Icon className={`h-3 w-3 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
