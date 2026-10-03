import React, { useState, useMemo } from 'react';
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
  Layers,
  Search,
  Filter,
  Download,
  Users,
  Eye,
  FileSpreadsheet,
  Globe,
  Lock,
  ArrowRight,
  TrendingDown,
  Activity,
  X
} from 'lucide-react';
import { GlobalCompanyEvaluation, exportMasterRegistryToCSV } from '../../utils/masterRegistryService';

export const SavedProjectsTab: React.FC = () => {
  const { 
    savedProjects, 
    saveCurrentProject, 
    loadSavedProject, 
    deleteSavedProject,
    diagnostic,
    setActiveTab,
    currentUser,
    isMasterUser,
    globalEvaluations,
    updateGeneralData
  } = useDiagnostic();
  const { t, language } = useLanguage();

  const [projectNameToSave, setProjectNameToSave] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados exclusivos para el Usuario Maestro
  const [masterViewMode, setMasterViewMode] = useState<'global_registry' | 'my_projects'>('global_registry');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  const [masterSearchTerm, setMasterSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [inspectionDetailModal, setInspectionDetailModal] = useState<GlobalCompanyEvaluation | null>(null);

  const MAX_SLOTS = isMasterUser ? 999 : 2;
  const usedSlots = (savedProjects || []).length;
  const isFull = !isMasterUser && usedSlots >= 2;

  // Cuentas de usuario únicas que han realizado evaluaciones en el padrón maestro
  const uniqueCreatorAccounts = useMemo(() => {
    const map = new Map<string, { email: string; name: string; count: number }>();
    (globalEvaluations || []).forEach(item => {
      const email = item.createdByAccountEmail.toLowerCase();
      if (!map.has(email)) {
        map.set(email, {
          email: item.createdByAccountEmail,
          name: item.createdByAccountName || item.createdByAccountEmail.split('@')[0],
          count: 1
        });
      } else {
        const cur = map.get(email)!;
        cur.count += 1;
      }
    });
    return Array.from(map.values());
  }, [globalEvaluations]);

  // Evaluaciones filtradas en la vista maestra
  const filteredGlobalEvaluations = useMemo(() => {
    return (globalEvaluations || []).filter(item => {
      // Filtro por cuenta creadora
      if (selectedAccountFilter !== 'all' && item.createdByAccountEmail.toLowerCase() !== selectedAccountFilter.toLowerCase()) {
        return false;
      }
      // Filtro por departamento
      if (selectedDeptFilter !== 'all' && item.department !== selectedDeptFilter) {
        return false;
      }
      // Filtro por estado
      if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) {
        return false;
      }
      // Búsqueda por texto (empresa, ruc, ingeniero, cip)
      if (masterSearchTerm.trim()) {
        const term = masterSearchTerm.toLowerCase().trim();
        const matchName = item.companyName.toLowerCase().includes(term);
        const matchRuc = item.ruc.includes(term);
        const matchIng = item.responsibleEngineer.toLowerCase().includes(term);
        const matchCip = (item.cipNumber || '').includes(term);
        const matchEmail = item.createdByAccountEmail.toLowerCase().includes(term);
        return matchName || matchRuc || matchIng || matchCip || matchEmail;
      }
      return true;
    });
  }, [globalEvaluations, selectedAccountFilter, selectedDeptFilter, selectedStatusFilter, masterSearchTerm]);

  // Estadísticas globales consolidadas del Maestro
  const masterStats = useMemo(() => {
    const totalCompanies = filteredGlobalEvaluations.length;
    const totalKwhAnnual = filteredGlobalEvaluations.reduce((acc, curr) => acc + (curr.annualKwh || 0), 0);
    const totalSavingsPen = filteredGlobalEvaluations.reduce((acc, curr) => acc + (curr.annualSavingsPen || 0), 0);
    const totalPowerKw = filteredGlobalEvaluations.reduce((acc, curr) => acc + (curr.powerKw || 0), 0);
    return { totalCompanies, totalKwhAnnual, totalSavingsPen, totalPowerKw };
  }, [filteredGlobalEvaluations]);

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

  const handleLoadGlobalEvalToWorkspace = (item: GlobalCompanyEvaluation) => {
    // Carga directa del diagnóstico completo
    saveCurrentProject(`Copia Respaldo Previa - ${new Date().toLocaleDateString()}`);
    // Cargar en el diagnóstico activo mediante importación o reemplazo
    if (item.fullDiagnostic) {
      // Reemplazar diagnóstico activo
      try {
        const worksKey = `e_diagnosis_project_${currentUser?.email ? currentUser.email.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'guest'}`;
        localStorage.setItem(worksKey, JSON.stringify(item.fullDiagnostic));
        window.location.reload();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleExportCsv = () => {
    exportMasterRegistryToCSV(filteredGlobalEvaluations);
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* BANNER MAESTRO: Si es el usuario maestro luxproc.11@gmail.com             */}
      {/* ========================================================================= */}
      {isMasterUser && (
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black shrink-0 shadow-lg shadow-amber-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                    USUARIO MAESTRO CIP · AUTENTICADO POR GOOGLE
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>luxproc.11@gmail.com</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Registro Nacional Centralizado de Empresas Evaluadas
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Acceso irrestricto y pericial al registro de todas las empresas evaluadas por cada cuenta creada en el sistema. 
                  <strong className="text-amber-400 ml-1">
                    Los informes y peritajes se conservan inmutables en este padrón maestro sin ser borrados, independientemente de que los usuarios regulares tengan un límite de 2 proyectos.
                  </strong>
                </p>
              </div>
            </div>

            {/* Selector de Vistas Maestras */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <div className="flex rounded-xl p-1 bg-white/10 border border-white/10 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setMasterViewMode('global_registry')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    masterViewMode === 'global_registry'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Padrón Central ({globalEvaluations.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMasterViewMode('my_projects')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    masterViewMode === 'my_projects'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <FolderCheck className="w-3.5 h-3.5" />
                  <span>Mis Proyectos Activos</span>
                </button>
              </div>

              {masterViewMode === 'global_registry' && (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  title="Descargar padrón maestro de todas las empresas en CSV / Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Padrón (.CSV)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 1: PADRÓN MAESTRO DE TODAS LAS EMPRESAS (Solo para Usuario Maestro)  */}
      {/* ========================================================================= */}
      {isMasterUser && masterViewMode === 'global_registry' ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Tarjetas Bento de Métricas Consolidadas del Padrón Nacional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Empresas Evaluadas</span>
                <div className="text-xl font-black text-slate-900">{masterStats.totalCompanies}</div>
                <span className="text-[10px] text-slate-500">Registradas en el sistema</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cuentas Creadas Activas</span>
                <div className="text-xl font-black text-slate-900">{uniqueCreatorAccounts.length}</div>
                <span className="text-[10px] text-slate-500">Auditores & Colegiados CIP</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consumo Auditado Total</span>
                <div className="text-xl font-black text-slate-900">{Math.round(masterStats.totalKwhAnnual).toLocaleString()} <span className="text-xs font-normal text-slate-500">kWh/a</span></div>
                <span className="text-[10px] text-slate-500">Demanda consolidada</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ahorro Anual Proyectado</span>
                <div className="text-xl font-black text-emerald-600">S/ {Math.round(masterStats.totalSavingsPen).toLocaleString()}</div>
                <span className="text-[10px] text-slate-500">Beneficio económico pericial</span>
              </div>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda por Cuenta Creada y Empresa */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={masterSearchTerm}
                  onChange={(e) => setMasterSearchTerm(e.target.value)}
                  placeholder="Buscar por Empresa, RUC, Dirección, Ingeniero o Colegiatura CIP..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Filtro por Cuenta Creada */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Cuenta:</span>
                </span>
                <select
                  value={selectedAccountFilter}
                  onChange={(e) => setSelectedAccountFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 max-w-[260px]"
                >
                  <option value="all">Todas las cuentas creadas ({globalEvaluations.length} auditorías)</option>
                  {uniqueCreatorAccounts.map(acc => (
                    <option key={acc.email} value={acc.email}>
                      {acc.email} ({acc.count} emp.)
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Departamento */}
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
              >
                <option value="all">Todos los Consejos CIP</option>
                <option value="Lima">Lima</option>
                <option value="Arequipa">Arequipa</option>
                <option value="La Libertad">La Libertad</option>
                <option value="Piura">Piura</option>
                <option value="Junín">Junín</option>
                <option value="Cusco">Cusco</option>
                <option value="Callao">Callao</option>
              </select>

              {/* Filtro por Estado */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
              >
                <option value="all">Todos los estados</option>
                <option value="APROBADO_CIP">Aprobado CIP</option>
                <option value="CULMINADO">Culminado</option>
                <option value="EN_EVALUACION">En Evaluación</option>
              </select>
            </div>
          </div>

          {/* Listado de Empresas Evaluadas en el Padrón */}
          <div className="space-y-3">
            {filteredGlobalEvaluations.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
                <Building className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No se encontraron empresas con los filtros seleccionados</h4>
                <p className="text-xs text-slate-500">Pruebe limpiando el campo de búsqueda o seleccionando "Todas las cuentas creadas".</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAccountFilter('all');
                    setMasterSearchTerm('');
                    setSelectedDeptFilter('all');
                    setSelectedStatusFilter('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              filteredGlobalEvaluations.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {item.reportCode}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.installationType}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{item.status}</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        RUC: {item.ruc}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {item.companyName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.commercialActivity} · <span className="text-slate-700 font-medium">{item.address} ({item.department})</span>
                      </p>
                    </div>

                    {/* Cuenta Creadora e Ingeniero Responsable CIP */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Cuenta creadora: <strong className="text-slate-800">{item.createdByAccountEmail}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Perito CIP: <strong className="text-slate-800">{item.responsibleEngineer} (CIP {item.cipNumber})</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Inspección: {item.date}
                      </div>
                    </div>
                  </div>

                  {/* Métricas y Acciones del Maestro */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Potencia</span>
                        <span className="text-xs font-black text-slate-900">{item.powerKw.toFixed(1)} kW</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Consumo Anual</span>
                        <span className="text-xs font-black text-slate-900">{Math.round(item.annualKwh).toLocaleString()} kWh</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Ahorro Proyectado</span>
                        <span className="text-xs font-black text-emerald-600">S/ {Math.round(item.annualSavingsPen).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">CNE</span>
                        <span className="text-xs font-black text-indigo-600">{item.safetyScoreCne}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setInspectionDetailModal(item)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        title="Ver ficha técnica completa del peritaje"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ficha</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          // Cargar y ver reporte
                          handleLoadGlobalEvalToWorkspace(item);
                        }}
                        className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        title="Cargar en el espacio de trabajo para editar o emitir reporte CIP"
                      >
                        <FileBadge className="w-3.5 h-3.5 text-amber-300" />
                        <span>Cargar Proyecto</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {/* ========================================================================= */}
      {/* VISTA 2: MIS TRABAJOS DIRECTOS (Para todos los usuarios y modo personal)  */}
      {/* ========================================================================= */}
      {(!isMasterUser || masterViewMode === 'my_projects') && (
        <div className="space-y-6">
          {/* Header Banner Normal */}
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
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    isMasterUser 
                      ? 'bg-amber-100 text-amber-900 border-amber-300' 
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  }`}>
                    {isMasterUser ? `${usedSlots} Proyectos (Ilimitado Maestro)` : `${usedSlots} / 2 Disponibles`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  {isMasterUser 
                    ? 'Almacenamiento profesional ilimitado para el Auditor Maestro Ing. Víctor Fernando Becerra Terán (luxproc.11@gmail.com).'
                    : t('saved.subtitle', 'Almacene hasta 2 proyectos completos con sus respectivos informes técnicos e indicadores normativos CNE.')}
                </p>
              </div>
            </div>

            {/* Slot Progress Bar Indicator */}
            {!isMasterUser && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 min-w-[200px] text-right">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{language === 'es' ? 'Capacidad de Almacenamiento' : 'Storage Capacity'}</span>
                  <span className="font-mono text-indigo-600">{usedSlots} de 2</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${isFull ? 'bg-amber-500' : 'bg-indigo-600'}`} 
                    style={{ width: `${(usedSlots / 2) * 100}%` }}
                  />
                </div>
              </div>
            )}
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

          {/* Grid of Projects (2 slots for regular, full list for master) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(isMasterUser ? savedProjects : [0, 1]).map((itemOrIndex, idx) => {
              const project = isMasterUser 
                ? (itemOrIndex as SavedProjectItem)
                : ((savedProjects || [])[itemOrIndex as number] as SavedProjectItem | undefined);

              const slotIndex = isMasterUser ? idx : (itemOrIndex as number);

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
      )}

      {/* ========================================================================= */}
      {/* MODAL DE DETALLE TÉCNICO DE LA EMPRESA (Para el Usuario Maestro)         */}
      {/* ========================================================================= */}
      {inspectionDetailModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setInspectionDetailModal(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {inspectionDetailModal.reportCode}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {inspectionDetailModal.companyName}
                </h3>
                <p className="text-xs text-slate-500">
                  RUC: <strong className="text-slate-800">{inspectionDetailModal.ruc}</strong> · {inspectionDetailModal.commercialActivity}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectionDetailModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Potencia</span>
                <span className="text-sm font-black text-slate-900">{inspectionDetailModal.powerKw.toFixed(1)} kW</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Consumo Anual</span>
                <span className="text-sm font-black text-slate-900">{Math.round(inspectionDetailModal.annualKwh).toLocaleString()} kWh</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Ahorro Est.</span>
                <span className="text-sm font-black text-emerald-600">S/ {Math.round(inspectionDetailModal.annualSavingsPen).toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Seguridad CNE</span>
                <span className="text-sm font-black text-indigo-600">{inspectionDetailModal.safetyScoreCne}%</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-semibold text-slate-500">Cuenta que realizó el diagnóstico:</span>
                <span className="font-bold text-slate-900">{inspectionDetailModal.createdByAccountEmail} ({inspectionDetailModal.createdByAccountName})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-semibold text-slate-500">Ingeniero Perito CIP:</span>
                <span className="font-bold text-slate-900">{inspectionDetailModal.responsibleEngineer} (CIP N° {inspectionDetailModal.cipNumber})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-semibold text-slate-500">Consejo Departamental CIP:</span>
                <span className="font-bold text-slate-900">{inspectionDetailModal.cipCouncil}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-semibold text-slate-500">Especialidad Verdadera:</span>
                <span className="font-bold text-slate-900">{inspectionDetailModal.cipSpecialty}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="font-semibold text-slate-500">Tarifa & Distribuidora:</span>
                <span className="font-bold text-slate-900">{inspectionDetailModal.tariffSupply}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-slate-500">Censo de Instalación:</span>
                <span className="font-bold text-slate-900">{inspectionDetailModal.equipmentCount} máquinas censadas · {inspectionDetailModal.circuitsCount} circuitos CNE</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setInspectionDetailModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleLoadGlobalEvalToWorkspace(inspectionDetailModal);
                  setInspectionDetailModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Cargar en Espacio de Trabajo</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
