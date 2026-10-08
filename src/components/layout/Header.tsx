import React, { useState, useRef, useEffect } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Zap, 
  ShieldCheck, 
  Gauge, 
  Printer, 
  Plus, 
  Sparkles, 
  Menu,
  LogOut,
  UserCheck,
  CheckCircle2,
  ChevronDown,
  Award,
  Mail,
  FileText,
  X,
  KeyRound,
  ExternalLink,
  Edit3,
  Save,
  Check,
  Languages,
  RotateCcw,
  FolderCheck,
  CreditCard,
  Lock,
  AlertTriangle,
  Info,
  Globe
} from 'lucide-react';
import { NewProjectModal } from '../common/NewProjectModal';
import { MobileNavDrawer } from './MobileNav';
import { lookupCIPRecord, CIPRecord, CIP_REGIONAL_COUNCILS, CIP_SPECIALTIES } from '../../utils/cipValidator';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    diagnostic,
    safetyEvaluation,
    efficiencyEvaluation,
    importJson,
    setActiveTab,
    activeTab,
    updateUserProfile,
    updateGeneralData,
    showNewProjectModal,
    setShowNewProjectModal,
    clearActiveWorkspace,
    savedProjects,
    subscriptionPlan,
    setIsSubscriptionModalOpen
  } = useDiagnostic();
  const { t, language, setLanguage } = useLanguage();

  const [showUserModal, setShowUserModal] = useState(false);
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editCip, setEditCip] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editCouncil, setEditCouncil] = useState('');
  const [editChapter, setEditChapter] = useState('');
  const [editName, setEditName] = useState('');
  const [verifiedCipRecord, setVerifiedCipRecord] = useState<CIPRecord | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú desplegable de idioma al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validación y autocompletado automático blindado al ingresar el CIP
  const handleCipInputChange = (val: string) => {
    setEditCip(val);
    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length >= 5) {
      const record = lookupCIPRecord(clean);
      if (record) {
        setVerifiedCipRecord(record);
        setEditName(record.fullName);
        setEditCouncil(record.regionalCouncil);
        setEditCollege(record.college);
        setEditSpecialty(record.specialty);
        setEditChapter(record.chapter);
      }
    } else {
      setVerifiedCipRecord(null);
      setEditName('');
      setEditCouncil('');
      setEditCollege('');
      setEditSpecialty('');
      setEditChapter('');
    }
  };

  const handlePerformCIPVerification = (targetCip?: string) => {
    const raw = typeof targetCip === 'string' ? targetCip : editCip;
    const clean = raw.replace(/[^0-9]/g, '');
    if (clean.length >= 5) {
      setEditCip(clean);
      const record = lookupCIPRecord(clean);
      if (record) {
        setVerifiedCipRecord(record);
        setEditName(record.fullName);
        setEditCouncil(record.regionalCouncil);
        setEditCollege(record.college);
        setEditSpecialty(record.specialty);
        setEditChapter(record.chapter);
      }
    }
  };

  const handleStartEdit = () => {
    const initialCip = currentUser?.cipNumber || diagnostic.generalData.cipNumber || '278034';
    setEditCip(initialCip);
    const record = lookupCIPRecord(initialCip);
    if (record) {
      setVerifiedCipRecord(record);
      setEditName(record.fullName);
      setEditSpecialty(record.specialty);
      setEditCouncil(record.regionalCouncil);
      setEditCollege(record.college);
      setEditChapter(record.chapter);
    } else {
      setEditName(currentUser?.name || diagnostic.generalData.responsibleEngineer || 'Ing. Víctor Fernando Becerra Terán');
      setEditSpecialty(currentUser?.specialty || diagnostic.generalData.specialty || 'Ingeniero Electrónico');
      setEditCouncil(currentUser?.regionalCouncil || 'CD La Libertad (Trujillo)');
      setEditCollege(currentUser?.professionalCollege || diagnostic.generalData.professionalCollege || 'Colegio de Ingenieros del Perú - Consejo Departamental de La Libertad (CD La Libertad)');
      setEditChapter(currentUser?.chapter || 'Capítulo de Ingeniería Electrónica y Telecomunicaciones');
    }

    setIsEditingProfile(true);
    setSavedSuccess(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = editCip.replace(/[^0-9]/g, '');
    if (clean.length < 5) return;
    const record = lookupCIPRecord(clean) || verifiedCipRecord;
    if (!record) return;

    const matchedCouncil = CIP_REGIONAL_COUNCILS.find(c => c.name === record.regionalCouncil || c.college === record.college);
    const departmentName = matchedCouncil ? matchedCouncil.department : 'La Libertad';

    updateUserProfile({
      name: record.fullName,
      cipNumber: record.cipNumber,
      specialty: record.specialty,
      professionalCollege: record.college,
      regionalCouncil: record.regionalCouncil,
      chapter: record.chapter
    });

    updateGeneralData({
      responsibleEngineer: record.fullName,
      cipNumber: record.cipNumber,
      specialty: record.specialty,
      professionalCollege: record.college,
      department: departmentName
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditingProfile(false);
    }, 600);
  };

  const getAvatarUrl = (user: typeof currentUser) => {
    if (user?.avatarUrl && !user.avatarUrl.includes('unsplash.com')) {
      return user.avatarUrl;
    }
    const nameOrEmail = user?.name || user?.email || 'Ingeniero';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameOrEmail)}&background=0284c7&color=fff&size=128&bold=true`;
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="w-full flex h-14 sm:h-16 items-center justify-between px-3 sm:px-5 lg:px-6">
        
        {/* Logo & Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
            title="Abrir menú de navegación y módulos"
            aria-label="Abrir menú"
          >
            <Menu className="h-4 w-4" />
          </button>

          <img
            src="https://i.imgur.com/WWChkA9.png"
            alt="LUXPROC"
            className="h-6 sm:h-7 md:h-8 lg:h-9 w-auto object-contain shrink-0"
            referrerPolicy="no-referrer"
          />

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <span className="text-xs sm:text-sm md:text-base lg:text-lg font-black tracking-tight text-slate-950 leading-none whitespace-nowrap">
              E-DIAGNOSIS
            </span>
            <span className="bg-amber-500 text-slate-950 px-1 sm:px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] md:text-xs font-black lowercase leading-none shadow-2xs">
              os
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Multi-Language Dropdown Selector (Desplegable Elegante) */}
          <div className="relative shrink-0" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 transition-all shadow-2xs text-xs font-semibold cursor-pointer"
              title={t('header.change_language', 'Seleccionar idioma')}
              aria-expanded={isLangMenuOpen}
            >
              <Globe className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span className="text-sm">
                {language === 'es' ? '🇪🇸' : language === 'en' ? '🇺🇸' : '🇧🇷'}
              </span>
              <span className="font-mono font-bold text-xs uppercase hidden sm:inline">{language}</span>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-0.5">
                  {t('header.select_language', 'Idioma / Language')}
                </div>
                {[
                  { code: 'es' as const, label: 'Español', short: 'ES', flag: '🇪🇸' },
                  { code: 'en' as const, label: 'English', short: 'EN', flag: '🇺🇸' },
                  { code: 'pt' as const, label: 'Português', short: 'PT', flag: '🇧🇷' }
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setLanguage(item.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      language === item.code
                        ? 'bg-indigo-50 text-indigo-950 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.flag}</span>
                      <span>{item.label}</span>
                    </div>
                    {language === item.code && (
                      <Check className="h-3.5 w-3.5 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subscription Plan Button (Plan Estándar / Plan Premium) */}
          <button
            type="button"
            onClick={() => setIsSubscriptionModalOpen(true)}
            className={`flex items-center gap-1.5 p-1.5 sm:p-2 lg:px-3 lg:py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 ${
              subscriptionPlan === 'PREMIUM'
                ? 'border-indigo-600 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-xs'
                : 'border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900'
            }`}
            title={
              language === 'en'
                ? 'Manage Subscription Plan (Standard / Premium)'
                : language === 'pt'
                ? 'Gerenciar Plano de Assinatura (Padrão / Premium)'
                : 'Gestionar Plan de Suscripción (Estándar / Premium)'
            }
          >
            {subscriptionPlan === 'PREMIUM' ? (
              <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            ) : (
              <CreditCard className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            )}
            <span className="hidden md:inline">
              {subscriptionPlan === 'PREMIUM'
                ? language === 'en' ? 'Premium Plan' : language === 'pt' ? 'Plano Premium' : 'Plan Premium'
                : language === 'en' ? 'Standard Plan' : language === 'pt' ? 'Plano Padrão' : 'Plan Estándar'}
            </span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black uppercase ${
              subscriptionPlan === 'PREMIUM'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-indigo-600 text-white'
            }`}>
              {subscriptionPlan === 'PREMIUM' ? 'PRO' : 'S/ 20'}
            </span>
          </button>

          {/* Limpiar Plataforma para Nuevo Proyecto */}
          <button
            type="button"
            onClick={() => setShowCleanModal(true)}
            className="flex items-center gap-1.5 p-1.5 sm:p-2 lg:px-3 lg:py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 transition-colors shadow-2xs text-xs font-bold cursor-pointer shrink-0"
            title={t('header.clean_workspace', 'Limpiar plataforma para nuevo proyecto')}
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-700 shrink-0" />
            <span className="hidden xl:inline">{t('header.clean_workspace', 'Limpiar Plataforma')}</span>
          </button>

          {/* Quick Access: Trabajos Realizados (Máx 2 guardados) */}
          <button
            onClick={() => setActiveTab('saved')}
            className={`hidden sm:flex items-center gap-1.5 p-1.5 sm:p-2 lg:px-3 lg:py-2 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 ${
              activeTab === 'saved' || activeTab === 'saved_projects' || activeTab === 'trabajos'
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
            }`}
            title={t('saved.title', 'Trabajos Realizados & Historial')}
          >
            <FolderCheck className={`h-4 w-4 shrink-0 ${
              activeTab === 'saved' || activeTab === 'saved_projects' || activeTab === 'trabajos' ? 'text-white' : 'text-indigo-600'
            }`} />
            <span className="hidden xl:inline">{t('nav.saved_projects', 'Trabajos')}</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
              activeTab === 'saved' || activeTab === 'saved_projects' || activeTab === 'trabajos'
                ? 'bg-white/20 text-white'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {(savedProjects || []).length}/2
            </span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200">
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all text-left shadow-2xs group cursor-pointer shrink-0"
              title="Ver Credencial y Colegiatura CIP"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={getAvatarUrl(currentUser)}
                  alt={currentUser?.name || 'Ingeniero'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-200 ring-2 ring-indigo-500/20"
                />
              </div>

              {/* Full Name & Credentials (hidden on mobile, visible on sm and up) */}
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
                  {currentUser?.name || diagnostic.generalData.responsibleEngineer || 'Ing. Víctor Fernando Becerra Terán'}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                  <span className="font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                    CIP N° {currentUser?.cipNumber || diagnostic.generalData.cipNumber || '278034'}
                  </span>
                </div>
              </div>

              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors hidden lg:inline" />
            </button>
          </div>
        </div>

      </div>
      </header>

      {/* Confirmation Modal to Clean Platform */}
      {showCleanModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowCleanModal(false)}
        >
          <div 
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {t('header.clean_confirm_title', '¿Limpiar toda la plataforma web?')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t('header.clean_confirm_desc', 'Se restablecerán todos los datos cargados para iniciar un nuevo proyecto en blanco. Recuerde que puede guardar el proyecto actual en "Trabajos Realizados" antes de limpiar.')}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCleanModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                {t('header.cancel', 'Cancelar')}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearActiveWorkspace();
                  setShowCleanModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-all"
              >
                {t('header.confirm', 'Sí, Limpiar Todo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CIP Credential & User Profile Popover Modal */}
      {showUserModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs p-2.5 sm:p-4 flex flex-col justify-start sm:justify-center items-center py-3 sm:py-6 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUserModal(false);
            }
          }}
        >
          <div 
            className="relative w-full max-w-md my-auto max-h-[86vh] sm:max-h-[88vh] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header banner - STICKY TOP so X close button is ALWAYS visible */}
            <div className="sticky top-0 z-30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 sm:px-6 py-3 sm:py-3.5 text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center p-1.5 text-amber-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white leading-tight">
                    {language === 'en' ? 'Auditor Credentials' : language === 'pt' ? 'Credenciais do Auditor' : 'Credenciales del Auditor'}
                  </h3>
                  <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>
                      {language === 'en' ? 'CIP Registration & License' : language === 'pt' ? 'Registro e Habilitação CIP' : 'Colegiatura y Habilitación CIP'}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                title={language === 'en' ? 'Close window' : language === 'pt' ? 'Fechar janela' : 'Cerrar ventana'}
                aria-label={language === 'en' ? 'Close window' : language === 'pt' ? 'Fechar janela' : 'Cerrar ventana'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info - SCROLLABLE BODY */}
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={getAvatarUrl(currentUser)}
                    alt={currentUser?.name || 'Ingeniero'}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-white rounded-full p-1 shadow-sm border border-slate-200 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-bold text-base text-slate-900">
                    {currentUser?.name || diagnostic.generalData.responsibleEngineer || 'Ing. Víctor Fernando Becerra Terán'}
                  </h4>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      <Award className="w-3 h-3 text-amber-700" />
                      <span>CIP N° {currentUser?.cipNumber || diagnostic.generalData.cipNumber || '278034'}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {language === 'en' ? 'Active License' : language === 'pt' ? 'Habilitação Ativa' : 'Colegiatura Habilitada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Credential Card */}
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="bg-amber-50/70 border border-amber-300/80 rounded-2xl p-4 space-y-3 text-xs text-slate-800 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t('header.edit_cip', 'Modificar Perfil & Validación CIP')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="text-slate-500 hover:text-slate-800 text-xs px-2 py-0.5 rounded cursor-pointer"
                    >
                      {t('header.cancel', 'Cancelar')}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Banner Informativo Anti-Falsificación y Protección */}
                    <div className="p-3 rounded-xl bg-indigo-50/90 border border-indigo-200 text-indigo-950 flex items-start gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <strong className="block font-bold text-indigo-900">
                          {language === 'en'
                            ? 'Official CIP Validation & Anti-Forgery Protection (Law N° 28858)'
                            : language === 'pt'
                            ? 'Validação Oficial CIP e Proteção Antifalsificação (Lei N° 28858)'
                            : 'Validación Oficial y Protección Anti-Falsificación CIP (Ley N° 28858)'}
                        </strong>
                        <span>
                          {language === 'en'
                            ? 'To guarantee authenticity and prevent impersonation, only enter your CIP number. The system queries the official registry and automatically populates name, regional council, and specialty, keeping them locked against manual tampering.'
                            : language === 'pt'
                            ? 'Para garantir a autenticidade e impedir falsificações, insira apenas seu número CIP. O sistema consulta o registro oficial e preenche automaticamente nome, conselho departamental e especialidade, mantendo-os bloqueados.'
                            : 'Para garantizar la autenticidad e impedir estafas o suplantación, solo debe ingresar su número de CIP. El sistema consulta el padrón oficial y completa automáticamente los nombres, consejo departamental y especialidad, manteniéndolos bloqueados contra modificaciones manuales.'}
                        </span>
                      </div>
                    </div>

                    {/* Número de Registro CIP - ÚNICO CAMPO MODIFICABLE */}
                    <div className="bg-white p-3 rounded-xl border-2 border-amber-400 shadow-xs">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-black text-slate-800 text-[11px] uppercase tracking-wider">
                          {language === 'en'
                            ? 'CIP Registration Number (Only editable field):'
                            : language === 'pt'
                            ? 'Número de Registro CIP (Único campo editável):'
                            : 'Número de Colegiatura CIP (Único campo modificable):'}
                        </label>
                        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded">
                          {language === 'en' ? '5 or 6 digits' : language === 'pt' ? '5 ou 6 dígitos' : '5 o 6 dígitos'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editCip}
                          onChange={(e) => handleCipInputChange(e.target.value)}
                          placeholder="278034"
                          maxLength={6}
                          className="flex-1 font-mono font-black text-base text-slate-900 bg-amber-50/50 border border-amber-300 focus:border-amber-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                          required
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handlePerformCIPVerification()}
                          className="px-3 py-2 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Validate CIP' : language === 'pt' ? 'Validar CIP' : 'Validar CIP'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Alerta de Estado Oficial del CIP */}
                    {verifiedCipRecord ? (
                      verifiedCipRecord.status === 'HABILITADO' ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-snug">
                            <strong className="block font-bold">
                              {language === 'en'
                                ? '✓ Verified & ACTIVE CIP License'
                                : language === 'pt'
                                ? '✓ Registro Verificado e HABILITADO no CIP'
                                : '✓ Colegiatura Verificada y HABILITADA ante el CIP'}
                            </strong>
                            <span>
                              {language === 'en'
                                ? `Status: ACTIVE in ${verifiedCipRecord.regionalCouncil}. Official audit validity guaranteed.`
                                : language === 'pt'
                                ? `Condição: ATIVO em ${verifiedCipRecord.regionalCouncil}. Validade pericial oficial garantida.`
                                : `Condición: ACTIVO Y HABIDO en ${verifiedCipRecord.regionalCouncil}. Validez pericial oficial garantizada.`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-400 text-amber-950 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-snug">
                            <strong className="block font-bold">
                              {language === 'en'
                                ? '⚠️ Registered Engineer — Inactive Status'
                                : language === 'pt'
                                ? '⚠️ Engenheiro Registrado mas NÃO HABILITADO'
                                : '⚠️ Colegiado Registrado pero NO HABILITADO'}
                            </strong>
                            <span>
                              {language === 'en'
                                ? 'The engineer is registered but must regularize dues with their Regional Council.'
                                : language === 'pt'
                                ? 'O profissional consta registrado, mas deve regularizar suas cotas no Conselho Departamental.'
                                : 'El colegiado figura registrado pero debe regularizar cuotas ante su Consejo Departamental.'}
                            </span>
                          </div>
                        </div>
                      )
                    ) : editCip.trim().length >= 1 ? (
                      <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 flex items-start gap-2">
                        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-snug">
                          <span>
                            {language === 'en'
                              ? 'Enter the CIP number (minimum 5 digits) to automatically query protected credentials.'
                              : language === 'pt'
                              ? 'Insira o número do CIP (mínimo 5 dígitos) para consultar automaticamente os dados protegidos.'
                              : 'Ingrese el número de CIP (mínimo 5 dígitos) para consultar automáticamente los datos protegidos.'}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* Campos Automáticos y Blindados (No Editables contra Estafas y Falsificaciones) */}
                    <div className="space-y-2.5 pt-2 border-t border-amber-200/80 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-700" />
                          <span>
                            {language === 'en'
                              ? 'Auto-Populated & Locked Fields (Read-Only)'
                              : language === 'pt'
                              ? 'Campos Preenchidos e Bloqueados (Não Editáveis)'
                              : 'Campos Autocompletados y Blindados (No Editables)'}
                          </span>
                        </span>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                          {language === 'en' ? 'Anti-Fraud Protected' : language === 'pt' ? 'Protegido Antifraude' : 'Protegido Anti-Fraude'}
                        </span>
                      </div>

                      {/* Nombre Titular Colegiado */}
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block font-bold text-slate-700 text-[11px]">
                            {language === 'en' ? 'Licensed Engineer Name:' : language === 'pt' ? 'Nome do Engenheiro Titular:' : 'Nombre del Titular Colegiado:'}
                          </label>
                          <span className="text-[9px] text-slate-500 font-medium flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> {language === 'en' ? 'Locked by CIP' : language === 'pt' ? 'Bloqueado por CIP' : 'Autocompletado por CIP'}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editName || (verifiedCipRecord ? verifiedCipRecord.fullName : (language === 'en' ? 'Enter CIP to auto-fill' : language === 'pt' ? 'Insira o CIP para preencher' : 'Ingrese CIP para autocompletar'))}
                          readOnly
                          disabled
                          className="w-full font-bold text-slate-900 bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs cursor-not-allowed select-none opacity-90"
                        />
                      </div>

                      {/* Consejo Departamental */}
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block font-bold text-slate-700 text-[11px]">
                            {language === 'en' ? 'Regional Council:' : language === 'pt' ? 'Conselho Departamental (Região):' : 'Consejo Departamental (Región):'}
                          </label>
                          <span className="text-[9px] text-slate-500 font-medium flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> {language === 'en' ? 'Locked by CIP' : language === 'pt' ? 'Bloqueado por CIP' : 'Autocompletado por CIP'}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editCouncil || (verifiedCipRecord ? verifiedCipRecord.regionalCouncil : (language === 'en' ? 'Enter CIP to auto-fill' : language === 'pt' ? 'Insira o CIP para preencher' : 'Ingrese CIP para autocompletar'))}
                          readOnly
                          disabled
                          className="w-full font-medium text-slate-900 bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs cursor-not-allowed select-none opacity-90"
                        />
                      </div>

                      {/* Especialidad de Ingeniería */}
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block font-bold text-slate-700 text-[11px]">
                            {language === 'en' ? 'Engineering Specialty:' : language === 'pt' ? 'Especialidade de Engenharia:' : 'Especialidad de Ingeniería Verdadera:'}
                          </label>
                          <span className="text-[9px] text-slate-500 font-medium flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> {language === 'en' ? 'Locked by CIP' : language === 'pt' ? 'Bloqueado por CIP' : 'Autocompletado por CIP'}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editSpecialty || (verifiedCipRecord ? verifiedCipRecord.specialty : (language === 'en' ? 'Enter CIP to auto-fill' : language === 'pt' ? 'Insira o CIP para preencher' : 'Ingrese CIP para autocompletar'))}
                          readOnly
                          disabled
                          className="w-full font-bold text-slate-900 bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs cursor-not-allowed select-none opacity-90"
                        />
                      </div>

                      {/* Capítulo Profesional */}
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block font-semibold text-slate-600 text-[10px]">
                            {language === 'en' ? 'Professional Chapter:' : language === 'pt' ? 'Capítulo Profissional CIP:' : 'Capítulo Profesional CIP:'}
                          </label>
                          <span className="text-[9px] text-slate-500 font-medium flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> {language === 'en' ? 'Locked by CIP' : language === 'pt' ? 'Bloqueado por CIP' : 'Autocompletado por CIP'}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={editChapter || (verifiedCipRecord ? verifiedCipRecord.chapter : (language === 'en' ? 'Enter CIP to auto-fill' : language === 'pt' ? 'Insira o CIP para preencher' : 'Ingrese CIP para autocompletar'))}
                          readOnly
                          disabled
                          className="w-full text-slate-800 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs cursor-not-allowed select-none opacity-85"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                    <button
                      type="submit"
                      disabled={!verifiedCipRecord || editCip.trim().length < 5}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t('header.save_credentials', 'Guardar Credenciales')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      {t('header.cancel', 'Cancelar')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                      {t('header.profile_credentials', 'Credenciales Oficiales CIP')}
                    </span>
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] border border-amber-300/80 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-amber-700" />
                      <span>{t('header.edit_cip', 'Editar CIP')}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 pb-1.5">
                    <span className="text-slate-500 font-medium">
                      {language === 'en' ? 'Licensed Engineer:' : language === 'pt' ? 'Engenheiro Titular:' : 'Titular Colegiado:'}
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {currentUser?.name || diagnostic.generalData.responsibleEngineer || 'Ing. Víctor Fernando Becerra Terán'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 pb-1.5">
                    <span className="text-slate-500 font-medium">
                      {language === 'en' ? 'Specialty:' : language === 'pt' ? 'Especialidade:' : 'Especialidad:'}
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {currentUser?.specialty || diagnostic.generalData.specialty || 'Ingeniero Electrónico'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 pb-1.5">
                    <span className="text-slate-500 font-medium">
                      {language === 'en' ? 'Regional Council:' : language === 'pt' ? 'Conselho Departamental:' : 'Consejo Departamental:'}
                    </span>
                    <span className="font-bold text-slate-900 text-right">
                      {currentUser?.regionalCouncil || 'CD La Libertad (Trujillo)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 pb-1.5">
                    <span className="text-slate-500 font-medium">
                      {language === 'en' ? 'Professional Association:' : language === 'pt' ? 'Conselho Profissional:' : 'Colegio Profesional:'}
                    </span>
                    <span className="font-medium text-slate-800 text-right text-[11px]">
                      {currentUser?.professionalCollege || diagnostic.generalData.professionalCollege || 'Colegio de Ingenieros del Perú - Consejo Departamental de La Libertad (CD La Libertad)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 pb-1.5">
                    <span className="text-slate-500 font-medium">
                      {language === 'en' ? 'Official CIP Registration:' : language === 'pt' ? 'Registro CIP Oficial:' : 'Registro CIP Oficial:'}
                    </span>
                    <span className="font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      CIP N° {currentUser?.cipNumber || diagnostic.generalData.cipNumber || '278034'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 pb-1.5">
                    <span className="text-slate-500 font-medium">
                      {language === 'en' ? 'Applicable Standards:' : language === 'pt' ? 'Normas Aplicadas:' : 'Normativa Aplicada:'}
                    </span>
                    <span className="font-mono font-semibold text-indigo-700">CNE Utilización 2006 • RNE EM.010</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-500 font-medium">
                      {language === 'en' ? 'License Status:' : language === 'pt' ? 'Condição de Habilitação:' : 'Condición de Habilitación:'}
                    </span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {language === 'en'
                          ? 'Official Active License (Verified)'
                          : language === 'pt'
                          ? 'Habilitação Oficial Ativa (Verificado)'
                          : 'Colegiatura Habilitada Oficial (Activo y Habido)'}
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {savedSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-1.5 animate-in fade-in duration-150">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    {language === 'en'
                      ? 'CIP credentials updated and synced to the official report.'
                      : language === 'pt'
                      ? 'Credenciais CIP atualizadas e sincronizadas no relatório oficial.'
                      : 'Credenciales CIP actualizadas y sincronizadas en el informe oficial.'}
                  </span>
                </div>
              )}

              {/* Security & Audit Scopes */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  {language === 'en'
                    ? 'Granted Audit & Certification Scopes:'
                    : language === 'pt'
                    ? 'Permissões de Auditoria e Certificação Concedidas:'
                    : 'Permisos de Auditoría & Certificación Concedidos:'}
                </p>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {language === 'en'
                        ? 'Official Digital Signature on Expert Reports & CIP Sworn Declaration'
                        : language === 'pt'
                        ? 'Assinatura Digital Oficial em Laudos Periciais e Declaração Juramentada CIP'
                        : 'Firma Digital Oficial en Informes Periciales y Declaración Jurada CIP'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {language === 'en'
                        ? 'Electrical Calculation Validation under Osinergmin & INDECI Standards'
                        : language === 'pt'
                        ? 'Validação de Cálculos Elétricos segundo Osinergmin e INDECI'
                        : 'Validación de Cálculos Eléctricos según Osinergmin e INDECI'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {language === 'en'
                        ? 'National Electrical Code (CNE) Compliance Verification'
                        : language === 'pt'
                        ? 'Verificação de Conformidade do Código Nacional de Eletricidade (CNE)'
                        : 'Verificación de Cumplimiento de Código Nacional de Electricidad (CNE)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Footer with Action Buttons (Official Report, Logout & Close) */}
            <div className="sticky bottom-0 z-30 bg-white border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col gap-2 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
              <button
                type="button"
                onClick={() => {
                  setShowUserModal(false);
                  setActiveTab('report');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {language === 'en'
                    ? 'View Official CIP Report'
                    : language === 'pt'
                    ? 'Ver Relatório Oficial CIP'
                    : 'Ver Informe Oficial CIP'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-white shrink-0" />
                  <span>
                    {language === 'en'
                      ? 'Sign Out'
                      : language === 'pt'
                      ? 'Sair da Conta'
                      : 'Cerrar Sesión'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{language === 'en' ? 'Close' : language === 'pt' ? 'Fechar' : 'Cerrar Ventana'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      <MobileNavDrawer 
        isOpen={isMobileDrawerOpen} 
        onClose={() => setIsMobileDrawerOpen(false)} 
        onOpenNewProject={() => setShowNewProjectModal(true)} 
      />

      {/* New Project Interactive Modal */}
      <NewProjectModal 
        isOpen={showNewProjectModal} 
        onClose={() => setShowNewProjectModal(false)} 
      />
    </>
  );
};
