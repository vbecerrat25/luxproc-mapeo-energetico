import React from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
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
  FolderCheck,
  Lock,
  Sparkles,
  Crown
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    diagnostic, 
    computedEquipment, 
    setShowNewProjectModal,
    savedProjects,
    subscriptionPlan,
    isModulePremium,
    isMasterUser
  } = useDiagnostic();
  const { t, language } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard', 'Panel Ejecutivo'), icon: LayoutDashboard, badge: null, isPremium: false },
    { id: 'general', label: t('nav.general', 'Datos & Tarifas'), icon: FileText, badge: diagnostic.generalData.installationType, isPremium: false },
    { id: 'receipts', label: t('nav.receipts', 'Recibos vs Censo'), icon: Receipt, badge: `${(diagnostic.receipts || []).length}m`, isPremium: false },
    { id: 'equipment', label: t('nav.equipment', 'Censo de Cargas'), icon: Cpu, badge: `${(computedEquipment || []).length}`, isPremium: false },
    { id: 'circuits', label: t('nav.circuits', 'Tableros & CNE'), icon: SlidersHorizontal, badge: `${(diagnostic.circuits || []).length} cir`, isPremium: false },
    { id: 'grounding', label: t('nav.grounding', 'Puesta a Tierra'), icon: ShieldAlert, badge: diagnostic.grounding?.[0] ? `${diagnostic.grounding[0].measuredResistanceOhm || diagnostic.grounding[0].calculatedTheoreticalResistanceOhm || 0}Ω` : null, isPremium: false },
    { id: 'photos', label: t('nav.photos', 'Evidencia Fotos'), icon: Camera, badge: `${(diagnostic.photos || []).length}`, isPremium: false },
    { id: 'report', label: t('nav.report', 'Informe Oficial CIP'), icon: FileBadge, badge: 'CIP', isPremium: false },
    { id: 'saved', label: t('nav.saved_projects', 'Trabajos Realizados'), icon: FolderCheck, badge: `${(savedProjects || []).length}/2`, isPremium: false },
    
    // Módulo Maestro CIP exclusivo para luxproc.11@gmail.com
    ...(isMasterUser ? [
      { id: 'master', label: t('nav.master_registry', 'Módulo Maestro CIP'), icon: Crown, badge: 'CIP', isPremium: false }
    ] : []),

    // Módulos del Plan Premium (S/ 50)
    { id: 'powerfactor', label: t('nav.powerfactor', 'Factor Potencia'), icon: Activity, badge: 'PRO', isPremium: true },
    { id: 'lighting', label: t('nav.lighting', 'Iluminación RNE'), icon: Lightbulb, badge: 'PRO', isPremium: true },
    { id: 'solar', label: t('nav.solar', 'Solar Fotovoltaica'), icon: SunMedium, badge: 'PRO', isPremium: true },
    { id: 'opportunities', label: t('nav.opportunities', 'Plan de Ahorro'), icon: PiggyBank, badge: 'PRO', isPremium: true },
    { id: 'bom', label: t('nav.bom', 'Lista de Materiales'), icon: ListChecks, badge: 'PRO', isPremium: true }
  ];

  return (
    <aside className="w-68 lg:w-72 shrink-0 p-4 hidden md:block">
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-4 min-h-[calc(100vh-6rem)] flex flex-col justify-between">
        <div>
          {/* Installation metadata summary bento pill */}
          <div className="mb-4 rounded-2xl border border-slate-100 bg-[#f8f9fb] p-3.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{language === 'es' ? 'Instalación Activa' : 'Active Facility'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="font-bold text-slate-900 text-xs truncate mt-1" title={diagnostic.generalData.companyName || diagnostic.generalData.clientName}>
              {diagnostic.generalData.companyName || diagnostic.generalData.clientName || (language === 'es' ? 'Proyecto en Blanco' : 'Blank Project')}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>{diagnostic.tariff?.supplyVoltage || 220}V {diagnostic.tariff?.phases === 'TRIFASICO' ? '3Ø' : '1Ø'}</span>
              <span className="font-mono text-indigo-600 font-bold">{(diagnostic.tariff?.distributor || 'Luz del Sur').split(' ')[0]}</span>
            </div>

            <button
              onClick={() => setShowNewProjectModal(true)}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-700 hover:text-indigo-800 border border-slate-200/90 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
              title={t('header.new_project', 'Crear un nuevo proyecto de diagnóstico')}
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{t('header.new_project', 'Nuevo Proyecto')}</span>
            </button>
          </div>

          {/* Navigation List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'saved' && (activeTab === 'saved_projects' || activeTab === 'trabajos'));
              const isLocked = item.isPremium && subscriptionPlan === 'ESTANDAR';

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white stroke-[2.5]' : isLocked ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    {isLocked && (
                      <Lock className="w-3 h-3 text-amber-500" />
                    )}
                    {item.badge && (
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        isActive 
                          ? 'bg-indigo-700/80 text-white' 
                          : item.badge === 'PRO'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info & Active Subscription Badge */}
        <div className="mt-4 border-t border-slate-100 pt-3 px-1 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-semibold">{language === 'es' ? 'Plan:' : 'Plan:'}</span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              subscriptionPlan === 'PREMIUM'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {subscriptionPlan === 'PREMIUM' ? 'Premium (S/ 50)' : 'Estándar (S/ 20)'}
            </span>
          </div>

          <div className="text-[10px] text-slate-400">
            <div className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-0.5">Normas Técnicas</div>
            <div className="font-medium text-slate-600">CNE 2006 • RNE EM.010 • IEC 60364</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
