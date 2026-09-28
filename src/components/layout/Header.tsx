import React, { useState, useRef } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { 
  Zap, 
  ShieldCheck, 
  Gauge, 
  FileSpreadsheet, 
  FileUp, 
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
  Check
} from 'lucide-react';
import { NewProjectModal } from '../common/NewProjectModal';
import { MobileNavDrawer } from './MobileNav';
import { exportDiagnosticToExcel } from '../../utils/excelExporter';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    diagnostic,
    activeScenario,
    setActiveScenario,
    safetyEvaluation,
    efficiencyEvaluation,
    importJson,
    setActiveTab,
    updateUserProfile,
    showNewProjectModal,
    setShowNewProjectModal
  } = useDiagnostic();

  const [showUserModal, setShowUserModal] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editCip, setEditCip] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editName, setEditName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setEditCip(currentUser?.cipNumber || diagnostic.generalData.cipNumber || '178452');
    setEditSpecialty(currentUser?.specialty || diagnostic.generalData.specialty || 'Ingeniero Mecánico Electricista');
    setEditCollege(currentUser?.professionalCollege || diagnostic.generalData.professionalCollege || 'Colegio de Ingenieros del Perú (CIP)');
    setEditName(currentUser?.name || diagnostic.generalData.responsibleEngineer || 'Ing. Fernando Benites Torres');
    setIsEditingProfile(true);
    setSavedSuccess(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      cipNumber: editCip.trim() || '178452',
      specialty: editSpecialty.trim() || 'Ingeniero Mecánico Electricista',
      professionalCollege: editCollege.trim() || 'Colegio de Ingenieros del Perú (CIP)',
      name: editName.trim() || currentUser?.name || 'Ing. Fernando Benites Torres'
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditingProfile(false);
    }, 900);
  };

  const getAvatarUrl = (user: typeof currentUser) => {
    if (user?.avatarUrl && !user.avatarUrl.includes('unsplash.com')) {
      return user.avatarUrl;
    }
    const nameOrEmail = user?.name || user?.email || 'Ingeniero';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameOrEmail)}&background=0284c7&color=fff&size=128&bold=true`;
  };

  const handleExportExcel = () => {
    exportDiagnosticToExcel(diagnostic);
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
        } else {
          alert('Error: el archivo no contiene un formato de diagnóstico válido.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="w-full flex h-14 sm:h-16 items-center justify-between px-3 sm:px-5 lg:px-6">
        
        {/* Logo & Mobile Hamburger - Positioned at Extreme Left (Always Visible & Never Clipped) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Hamburger button for mobile screens */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs shrink-0"
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

        {/* Central Scenario Switcher (Actual / Propuesto) - Shown on Wide Desktops (XL+) to avoid crushing Tablet layout */}
        <div className="hidden xl:flex items-center">
          <div className="flex items-center rounded-2xl border border-slate-200/80 bg-slate-100/90 p-1 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setActiveScenario('ACTUAL')}
              className={`rounded-xl px-3 py-1 transition-all ${
                activeScenario === 'ACTUAL'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Actual
            </button>
            <button
              onClick={() => setActiveScenario('PROPUESTO')}
              className={`flex items-center gap-1 rounded-xl px-3 py-1 transition-all ${
                activeScenario === 'PROPUESTO'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Propuesto</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Export to Excel (.xlsx) */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 p-1.5 sm:p-2 lg:px-3 lg:py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs cursor-pointer shrink-0"
            title="Descargar datos en formato Excel (.xlsx)"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            <span className="hidden lg:inline text-xs font-bold text-emerald-900">Excel</span>
          </button>

          {/* Import JSON file for backup restoration */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            accept=".json" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs hidden xl:flex shrink-0"
            title="Importar proyecto de respaldo"
          >
            <FileUp className="h-4 w-4" />
          </button>

          {/* Print / CIP Report (Shown on Tablet & Desktop) */}
          <button
            onClick={() => setActiveTab('report')}
            className="hidden md:flex items-center gap-1.5 rounded-xl bg-slate-900 p-2 lg:px-3 lg:py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-md transition-colors cursor-pointer shrink-0"
            title="Generar e imprimir Reporte Técnico Certificado CIP"
          >
            <Printer className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden lg:inline">Informe CIP</span>
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
                  {currentUser?.name || 'Ing. Fernando Benites Torres'}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                  <span className="font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                    {currentUser?.cipNumber ? `CIP ${currentUser.cipNumber}` : 'CIP 178452'}
                  </span>
                </div>
              </div>

              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors hidden lg:inline" />
            </button>

            {/* Logout button: hidden on mobile (< sm), shown on tablet/desktop */}
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 p-2 lg:px-2.5 lg:py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-900 transition-colors shadow-xs text-xs font-bold cursor-pointer shrink-0"
              title="Cerrar sesión activa"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-600" />
              <span className="hidden xl:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

      </div>
      </header>

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
                  <h3 className="font-bold text-sm text-white leading-tight">Credenciales del Auditor</h3>
                  <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Colegiatura y Habilitación CIP</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                title="Cerrar ventana"
                aria-label="Cerrar ventana"
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
                    {currentUser?.name || 'Ing. Fernando Benites Torres'}
                  </h4>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      <Award className="w-3 h-3 text-amber-700" />
                      <span>CIP N° {currentUser?.cipNumber || '178452'}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Colegiatura Habilitada
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
                      <span>Modificar Perfil y Credenciales CIP</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="text-slate-500 hover:text-slate-800 text-xs px-2 py-0.5 rounded cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">
                        Número de Registro CIP:
                      </label>
                      <input
                        type="text"
                        value={editCip}
                        onChange={(e) => setEditCip(e.target.value)}
                        placeholder="Ej. 178452"
                        className="w-full font-mono font-bold text-amber-950 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">
                        Especialidad de la Ingeniería:
                      </label>
                      <input
                        list="specialty-options"
                        type="text"
                        value={editSpecialty}
                        onChange={(e) => setEditSpecialty(e.target.value)}
                        placeholder="Ej. Ingeniero Mecánico Electricista"
                        className="w-full font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        required
                      />
                      <datalist id="specialty-options">
                        <option value="Ingeniero Mecánico Electricista" />
                        <option value="Ingeniero Electricista" />
                        <option value="Ingeniero de Energía" />
                        <option value="Ingeniero Electrónico" />
                        <option value="Ingeniero Industrial" />
                        <option value="Auditor Energético CIP" />
                      </datalist>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">
                        Colegio Profesional / Consejo Departamental:
                      </label>
                      <input
                        list="college-options"
                        type="text"
                        value={editCollege}
                        onChange={(e) => setEditCollege(e.target.value)}
                        placeholder="Ej. Colegio de Ingenieros del Perú (CIP)"
                        className="w-full text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        required
                      />
                      <datalist id="college-options">
                        <option value="Colegio de Ingenieros del Perú (CIP)" />
                        <option value="CIP - Consejo Departamental de Lima" />
                        <option value="CIP - Consejo Departamental de La Libertad" />
                        <option value="CIP - Consejo Departamental de Arequipa" />
                        <option value="CIP - Consejo Departamental de Lambayeque" />
                        <option value="CIP - Consejo Departamental de Piura" />
                      </datalist>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-0.5 text-[11px]">
                        Nombre Titular Colegiado:
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Ej. Ing. Fernando Benites Torres"
                        className="w-full font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Credenciales</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Credenciales Profesionales</span>
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] border border-amber-300/80 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-amber-700" />
                      <span>Modificar Perfil / CIP</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 pb-1.5">
                    <span className="text-slate-500 font-medium">Especialidad:</span>
                    <span className="font-bold text-slate-900 text-right">
                      {currentUser?.specialty || diagnostic.generalData.specialty || 'Ingeniero Mecánico Electricista'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 pb-1.5">
                    <span className="text-slate-500 font-medium">Colegio Profesional:</span>
                    <span className="font-bold text-slate-900 text-right">
                      {currentUser?.professionalCollege || diagnostic.generalData.professionalCollege || 'Colegio de Ingenieros del Perú (CIP)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 pb-1.5">
                    <span className="text-slate-500 font-medium">Registro CIP Oficial:</span>
                    <span className="font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      CIP N° {currentUser?.cipNumber || diagnostic.generalData.cipNumber || '178452'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2 pb-1.5">
                    <span className="text-slate-500 font-medium">Normativa Aplicada:</span>
                    <span className="font-mono font-semibold text-indigo-700">CNE Utilización 2006 • RNE EM.010</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-500 font-medium">Habilitación CIP:</span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Colegiatura Habilitada Oficial</span>
                    </span>
                  </div>
                </div>
              )}

              {savedSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-1.5 animate-in fade-in duration-150">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Credenciales CIP actualizadas y sincronizadas en el informe oficial.</span>
                </div>
              )}

              {/* Security & Audit Scopes */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                  Permisos de Auditoría & Certificación Concedidos:
                </p>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Firma Digital Oficial en Informes Periciales y Declaración Jurada CIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Validación de Cálculos Eléctricos según Osinergmin e INDECI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verificación de Cumplimiento de Código Nacional de Electricidad (CNE)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setActiveTab('report');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Ver Informe Oficial CIP</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cerrar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserModal(false);
                      logout();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
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
