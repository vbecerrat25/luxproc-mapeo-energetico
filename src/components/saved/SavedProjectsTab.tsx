import React, { useState } from 'react';
import { useDiagnostic, SavedProjectItem } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  FolderCheck, 
  Save, 
  FileBadge, 
  Trash2, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Building, 
  Cpu, 
  SlidersHorizontal, 
  AlertCircle, 
  Zap,
  Sparkles,
  ShieldCheck,
  Award,
  Layers
} from 'lucide-react';

export const SavedProjectsTab: React.FC = () => {
  const { 
    savedProjects, 
    saveCurrentProject, 
    loadSavedProject, 
    deleteSavedProject,
    diagnostic,
    setActiveTab
  } = useDiagnostic();
  const { t, language } = useLanguage();

  const [projectNameToSave, setProjectNameToSave] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const MAX_SLOTS = 2;
  const usedSlots = (savedProjects || []).length;
  const isFull = usedSlots >= MAX_SLOTS;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const result = saveCurrentProject(projectNameToSave.trim() || undefined);
    if (result.success) {
      setFeedbackMessage({ type: 'success', text: t('saved.saved_success', '¡Proyecto guardado con éxito en Trabajos Realizados!') });
      setProjectNameToSave('');
    } else {
      setFeedbackMessage({ type: 'error', text: result.message });
    }

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 3500);
  };

  const handleLoad = (id: string) => {
    const ok = loadSavedProject(id);
    if (ok) {
      setFeedbackMessage({ type: 'success', text: t('saved.loaded_success', '¡Proyecto cargado exitosamente en el área de trabajo activa!') });
      setTimeout(() => {
        setFeedbackMessage(null);
        setActiveTab('dashboard');
      }, 700);
    }
  };

  const handleViewReport = (id: string) => {
    loadSavedProject(id);
    setActiveTab('report');
  };

  const handleDelete = (id: string) => {
    if (confirm(language === 'es' ? '¿Está seguro de eliminar este trabajo guardado? Se liberará un espacio.' : 'Are you sure you want to delete this saved project? A slot will be freed.')) {
      deleteSavedProject(id);
      setFeedbackMessage({ type: 'success', text: t('saved.deleted_success', 'Trabajo eliminado. Espacio liberado.') });
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 shrink-0">
            <FolderCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">
                {t('saved.title', 'Trabajos Realizados & Historial de Peritajes')}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {usedSlots} / {MAX_SLOTS} {language === 'es' ? 'Disponibles' : 'Slots'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {t('saved.subtitle', 'Almacene hasta 2 proyectos completos con sus respectivos informes técnicos e indicadores normativos CNE.')}
            </p>
          </div>
        </div>

        {/* Slot Progress Bar Indicator */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 min-w-[200px] text-right">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
            <span>{language === 'es' ? 'Capacidad de Almacenamiento' : 'Storage Capacity'}</span>
            <span className="font-mono text-indigo-600">{usedSlots} de {MAX_SLOTS}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isFull ? 'bg-amber-500' : 'bg-indigo-600'}`} 
              style={{ width: `${(usedSlots / MAX_SLOTS) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border flex items-center gap-2.5 text-xs font-bold animate-in fade-in duration-200 ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Save Current Project Card (If slot available) */}
      {!isFull ? (
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-md border border-indigo-800/60">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{language === 'es' ? 'Proyecto en Edición Activa' : 'Active Editing Project'}</span>
              </div>
              <h3 className="text-lg font-black text-white">
                {diagnostic.generalData.companyName || diagnostic.generalData.clientName || diagnostic.generalData.diagnosticCode || 'Proyecto Actual sin Título'}
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                {diagnostic.generalData.installationType.toUpperCase()} · {(diagnostic.equipment || []).length} {language === 'es' ? 'equipos censados' : 'equipment surveyed'} · {(diagnostic.circuits || []).length} {language === 'es' ? 'circuitos' : 'circuits'}
              </p>
            </div>

            <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <input
                type="text"
                value={projectNameToSave}
                onChange={(e) => setProjectNameToSave(e.target.value)}
                placeholder={language === 'es' ? 'Nombre o etiqueta del trabajo...' : 'Project custom label...'}
                className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 min-w-[240px]"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <Save className="w-4 h-4" />
                <span>{t('saved.save_current', 'Guardar Proyecto Actual')}</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-4 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t('saved.limit_reached', 'Límite de 2 proyectos alcanzado. Elimine uno para guardar uno nuevo.')}</span>
          </div>
        </div>
      )}

      {/* Grid of the 2 Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((slotIndex) => {
          const project = (savedProjects || [])[slotIndex] as SavedProjectItem | undefined;

          if (!project) {
            return (
              <div 
                key={slotIndex}
                className="rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 p-8 flex flex-col items-center justify-center text-center space-y-3 min-h-[280px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <FolderCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">
                    {language === 'es' ? `Espacio Disponible #${slotIndex + 1}` : `Available Slot #${slotIndex + 1}`}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    {t('saved.empty_desc', 'Puede guardar el proyecto que se encuentra actualmente en edición en la plataforma.')}
                  </p>
                </div>
                {!isFull && (
                  <button
                    type="button"
                    onClick={() => saveCurrentProject(`Trabajo Guardado #${slotIndex + 1}`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer mt-2"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'es' ? 'Guardar en este Espacio' : 'Save in this Slot'}</span>
                  </button>
                )}
              </div>
            );
          }

          return (
            <div 
              key={project.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div>
                {/* Header card info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        {project.diagnostic.generalData.diagnosticCode || `EDIAG-${slotIndex + 1}`}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {project.installationType}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{language === 'es' ? 'Culminado / Listo' : 'Completed'}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 mt-2 line-clamp-1" title={project.name}>
                      {project.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.clientName || 'Cliente Particular'}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(project.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title={t('saved.delete', 'Eliminar Trabajo')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">{language === 'es' ? 'Potencia' : 'Power'}</span>
                    <span className="text-xs font-black text-slate-900">{project.summary.totalPowerKw.toFixed(1)} kW</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">{language === 'es' ? 'Consumo' : 'Consumption'}</span>
                    <span className="text-xs font-black text-slate-900">{Math.round(project.summary.monthlyKwh).toLocaleString()} kWh</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">{language === 'es' ? 'Seguridad CNE' : 'Safety CNE'}</span>
                    <span className="text-xs font-black text-indigo-600">{project.summary.safetyScore}%</span>
                  </div>
                </div>

                {/* Auditor Info */}
                <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(project.savedAt).toLocaleDateString()}</span>
                  </span>
                  <span className="font-mono text-slate-700 font-semibold">
                    {project.responsibleEngineer} {project.cipNumber ? `(CIP ${project.cipNumber})` : ''}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleLoad(project.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('saved.load', 'Cargar en Plataforma')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleViewReport(project.id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileBadge className="w-3.5 h-3.5 text-indigo-700" />
                  <span>{t('saved.view_report', 'Ver Informe Técnico')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
