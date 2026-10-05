import React from 'react';
import { createPortal } from 'react-dom';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Cpu, 
  SlidersHorizontal, 
  Cable,
  ShieldAlert, 
  Activity, 
  SunMedium, 
  Lightbulb, 
  PiggyBank, 
  ListChecks, 
  Camera, 
  FileBadge,
  X,
  Plus,
  LogOut,
  ShieldCheck,
  Gauge,
  FolderCheck,
  Lock,
  Crown
} from 'lucide-react';

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
    safetyEvaluation,
    efficiencyEvaluation,
    computedEquipment,
    savedProjects,
    subscriptionPlan,
    setIsSubscriptionModalOpen,
    isMasterUser
  } = useDiagnostic();
  const { t, language, setLanguage } = useLanguage();

  const tr = (es: string, en: string, pt: string) =>
    language === 'en' ? en : language === 'pt' ? pt : es;

  const getAvatarUrl = (user: typeof currentUser) => {
    if (user?.avatarUrl && !user.avatarUrl.includes('unsplash.com')) {
      return user.avatarUrl;
    }
    const nameOrEmail = user?.name || user?.email || 'Ingeniero';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameOrEmail)}&background=0284c7&color=fff&size=128&bold=true`;
  };

  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard', 'Panel Ejecutivo'), icon: LayoutDashboard, badge: null, isPremium: false },
    { id: 'general', label: t('nav.general', 'Datos & Tarifas'), icon: FileText, badge: diagnostic.generalData.installationType, isPremium: false },
    { id: 'receipts', label: t('nav.receipts', 'Recibos vs Censo'), icon: Receipt, badge: `${(diagnostic.receipts || []).length}m`, isPremium: false },
    { id: 'equipment', label: t('nav.equipment', 'Censo de Cargas'), icon: Cpu, badge: `${(computedEquipment || []).length}`, isPremium: false },
    { id: 'circuits', label: t('nav.circuits', 'Tableros & CNE'), icon: SlidersHorizontal, badge: `${(diagnostic.circuits || []).length} cir`, isPremium: false },
    { id: 'wiring', label: t('nav.wiring', 'Cableado & Llaves'), icon: Cable, badge: `${(diagnostic.wiringCircuits || []).length} cto`, isPremium: false },
    { id: 'grounding', label: t('nav.grounding', 'Puesta a Tierra'), icon: ShieldAlert, badge: diagnostic.grounding?.[0] ? `${diagnostic.grounding[0].measuredResistanceOhm || diagnostic.grounding[0].calculatedTheoreticalResistanceOhm || 0}Ω` : null, isPremium: false },
    { id: 'photos', label: t('nav.photos', 'Evidencia Fotos'), icon: Camera, badge: `${(diagnostic.photos || []).length}`, isPremium: false },
    { id: 'report', label: t('nav.report', 'Informe Oficial CIP'), icon: FileBadge, badge: 'PDF', isPremium: false },
    { id: 'saved', label: t('nav.saved_projects', 'Trabajos Realizados'), icon: FolderCheck, badge: `${(savedProjects || []).length}/2`, isPremium: false },

    // Módulo Maestro CIP
    ...(isMasterUser ? [
      { id: 'master', label: t('nav.master_registry', 'Módulo Maestro CIP'), icon: Crown, badge: 'CIP', isPremium: false }
    ] : []),

    // Premium Modules
    { id: 'powerfactor', label: t('nav.powerfactor', 'Factor Potencia'), icon: Activity, badge: 'PRO', isPremium: true },
    { id: 'lighting', label: t('nav.lighting', 'Iluminación RNE'), icon: Lightbulb, badge: 'PRO', isPremium: true },
    { id: 'solar', label: t('nav.solar', 'Solar Fotovoltaica'), icon: SunMedium, badge: 'PRO', isPremium: true },
    { id: 'opportunities', label: t('nav.opportunities', 'Plan de Ahorro'), icon: PiggyBank, badge: 'PRO', isPremium: true },
    { id: 'bom', label: t('nav.bom', 'Lista Materiales'), icon: ListChecks, badge: 'BOM', isPremium: true }
  ];

  const drawerContent = (
    <div 
      className="fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-xs md:hidden"
      onClick={onClose}
    >
      <div 
        className="w-4/5 max-w-xs h-full bg-white shadow-2xl flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header del Drawer */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <img
                src="https://i.imgur.com/WWChkA9.png"
                alt="LUXPROC"
                className="h-7 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="text-xs font-black tracking-tight text-white leading-none">
                  E-DIAGNOSIS <span className="bg-amber-500 text-slate-950 px-1 py-0.2 rounded text-[9px] font-black lowercase">os</span>
                </div>
                <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                  luxproc.com
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User profile row & Language selector */}
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-[#f8f9fb]">
            <div className="flex items-center gap-2">
              <img
                src={getAvatarUrl(currentUser)}
                alt={currentUser?.name || 'Ingeniero'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                  {currentUser?.name || 'Ing. Víctor Fernando Becerra Terán'}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {currentUser?.cipNumber ? `CIP ${currentUser.cipNumber}` : 'CIP 278034'}
                </span>
              </div>
            </div>

            {/* Multi-Language Switcher (ES, EN, PT) */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
              {[
                { code: 'es' as const, label: 'ES', flag: '🇪🇸' },
                { code: 'en' as const, label: 'EN', flag: '🇺🇸' },
                { code: 'pt' as const, label: 'PT', flag: '🇧🇷' }
              ].map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    language === l.code
                      ? 'bg-indigo-600 text-white font-black shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subscription Plan Badge Bar */}
          <div className="p-2.5 border-b border-slate-100 bg-amber-50/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                subscriptionPlan === 'PREMIUM'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'bg-indigo-100 text-indigo-900'
              }`}>
                {subscriptionPlan === 'PREMIUM' ? t('header.plan_premium', 'Plan Premium (S/ 50)') : t('header.plan_standard', 'Plan Estándar (S/ 20)')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsSubscriptionModalOpen(true);
              }}
              className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
            >
              {tr('Ver Planes', 'View Plans', 'Ver Planos')}
            </button>
          </div>

          {/* Current Project Info */}
          <div className="p-3 border-b border-slate-100 bg-indigo-50/30">
            <div className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center justify-between">
              <span>{tr('Proyecto Activo', 'Active Project', 'Projeto Ativo')}</span>
              <span className="capitalize text-indigo-700 font-semibold">{diagnostic.generalData.installationType || 'industria'}</span>
            </div>
            <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
              {diagnostic.generalData.companyName || diagnostic.generalData.clientName || tr('Proyecto en Blanco', 'Blank Project', 'Projeto em Branco')}
            </div>
            <div className="text-[11px] text-slate-600 mt-1 flex justify-between">
              <span>{diagnostic.tariff?.supplyVoltage || 220}V {diagnostic.tariff?.phases === 'TRIFASICO' ? '3Ø' : '1Ø'}</span>
              <span className="font-mono font-bold text-indigo-700">{diagnostic.tariff?.tariffCode || 'BT5A'}</span>
            </div>
          </div>

          {/* Global Scores */}
          <div className="p-3 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => { setActiveTab('circuits'); onClose(); }}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-2 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{tr('Seguridad CNE', 'NEC Safety', 'Segurança CNE')}</span>
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
                  <span>{tr('Eficiencia', 'Efficiency', 'Eficiência')}</span>
                </div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  {efficiencyEvaluation.score}<span className="text-[10px] text-slate-400 font-normal">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation list */}
          <div className="flex-1 px-3 py-2 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {tr('Módulos de Diagnóstico', 'Diagnostic Modules', 'Módulos de Diagnóstico')}
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'saved' && (activeTab === 'saved_projects' || activeTab === 'trabajos'));
              const isLocked = item.isPremium && subscriptionPlan === 'ESTANDAR';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : isLocked ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
                    {item.badge && (
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        isActive ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Drawer Actions (Without Excel / Import) */}
        <div className="p-3 border-t border-slate-100 bg-[#f8f9fb] space-y-2">
          <button
            onClick={() => {
              onOpenNewProject();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            <span>{t('header.new_project', 'Nuevo Proyecto')}</span>
          </button>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600" />
            <span>{t('header.logout', 'Cerrar Sesión')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
};

export const MobileNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useDiagnostic();
  const { language } = useLanguage();
  const tr = (es: string, en: string, pt: string) =>
    language === 'en' ? en : language === 'pt' ? pt : es;

  const quickTabs = [
    { id: 'dashboard', label: tr('Panel', 'Dashboard', 'Painel'), icon: LayoutDashboard },
    { id: 'saved', label: tr('Trabajos', 'Projects', 'Projetos'), icon: FolderCheck },
    { id: 'general', label: tr('Datos', 'General', 'Dados'), icon: FileText },
    { id: 'equipment', label: tr('Censo', 'Loads', 'Cargas'), icon: Cpu },
    { id: 'circuits', label: tr('Tableros', 'Panels', 'Quadros'), icon: SlidersHorizontal },
    { id: 'wiring', label: tr('Cableado', 'Wiring', 'Fiação'), icon: Cable },
    { id: 'receipts', label: tr('Recibos', 'Bills', 'Faturas'), icon: Receipt },
    { id: 'powerfactor', label: 'FP', icon: Activity },
    { id: 'grounding', label: tr('Tierra', 'Ground', 'Terra'), icon: ShieldAlert },
    { id: 'lighting', label: tr('Luz', 'Light', 'Luz'), icon: Lightbulb },
    { id: 'solar', label: 'Solar', icon: SunMedium },
    { id: 'opportunities', label: tr('Ahorro', 'Savings', 'Economia'), icon: PiggyBank },
    { id: 'bom', label: 'BOM', icon: ListChecks },
    { id: 'photos', label: tr('Fotos', 'Photos', 'Fotos'), icon: Camera },
    { id: 'report', label: tr('Informe', 'Report', 'Laudo'), icon: FileBadge }
  ];

  return (
    <div className="md:hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-14 sm:top-16 z-30 shadow-2xs">
      <div className="flex items-center gap-1 overflow-x-auto px-2.5 py-1.5 no-scrollbar scroll-smooth">
        {quickTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = (activeTab || 'dashboard').toLowerCase() === tab.id || (tab.id === 'saved' && (activeTab === 'saved_projects' || activeTab === 'trabajos'));
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

