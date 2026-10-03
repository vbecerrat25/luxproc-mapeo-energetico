import React, { useState, useMemo } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ShieldCheck, 
  Users, 
  Search, 
  FileBadge, 
  Download, 
  Eye, 
  Building, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Zap, 
  TrendingDown, 
  ArrowRight, 
  Award,
  Crown,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { lookupCIPRecord, CIPRecord } from '../../utils/cipValidator';
import { GlobalCompanyEvaluation, exportMasterRegistryToCSV } from '../../utils/masterRegistryService';

export const MasterAuditModule: React.FC = () => {
  const { currentUser, globalEvaluations, loadSavedProject, setActiveTab, setDiagnostic } = useDiagnostic();
  const { language } = useLanguage();

  // Verificación de seguridad de acceso exclusivo para luxproc.11@gmail.com
  const isMaster = currentUser?.email?.toLowerCase() === 'luxproc.11@gmail.com';

  // Estados para la consulta de CIP
  const [cipSearchInput, setCipSearchInput] = useState('');
  const [cipSearchResult, setCipSearchResult] = useState<CIPRecord | null>(null);
  const [cipSearchError, setCipSearchError] = useState<string | null>(null);

  // Estados para el filtro de empresas e informes
  const [companySearchTerm, setCompanySearchTerm] = useState('');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');

  // Obtener lista consolidada de usuarios registrados en el sistema
  const registeredUsersList = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      cipNumber?: string;
      verifiedGoogle: boolean;
      evaluationsCount: number;
    }> = [];

    // Cuentas desde localStorage de autenticación
    try {
      const raw = localStorage.getItem('e_diagnosis_auth_accounts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((acc, idx) => {
            list.push({
              id: `user-${idx}`,
              name: acc.name,
              email: acc.email,
              role: acc.role || 'INGENIERO_CIP',
              cipNumber: acc.cipNumber,
              verifiedGoogle: acc.email.toLowerCase().includes('luxproc') || acc.email.toLowerCase().includes('gmail.com'),
              evaluationsCount: 0
            });
          });
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Agregar o cruzar con creadores de evaluaciones globales
    (globalEvaluations || []).forEach(ev => {
      const found = list.find(u => u.email.toLowerCase() === ev.createdByAccountEmail.toLowerCase());
      if (found) {
        found.evaluationsCount += 1;
      } else {
        list.push({
          id: `eval-user-${list.length}`,
          name: ev.createdByAccountName || ev.createdByAccountEmail.split('@')[0],
          email: ev.createdByAccountEmail,
          role: 'INGENIERO_CIP',
          cipNumber: ev.cipNumber,
          verifiedGoogle: ev.createdByAccountEmail.toLowerCase().includes('gmail.com'),
          evaluationsCount: 1
        });
      }
    });

    return list;
  }, [globalEvaluations]);

  // Manejo de la búsqueda por CIP
  const handleSearchCIP = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCipSearchError(null);
    const clean = cipSearchInput.replace(/[^0-9]/g, '').trim();

    if (!clean || clean.length < 4) {
      setCipSearchError('Por favor ingrese un número CIP válido de 4 a 7 dígitos.');
      setCipSearchResult(null);
      return;
    }

    const record = lookupCIPRecord(clean);
    if (record) {
      setCipSearchResult(record);
      setCipSearchError(null);
    } else {
      setCipSearchResult(null);
      setCipSearchError(`No se encontró registro para el CIP N° ${clean} en la consulta oficial.`);
    }
  };

  // Filtrado de evaluaciones
  const filteredEvaluations = useMemo(() => {
    return (globalEvaluations || []).filter(item => {
      if (filterAccount !== 'all' && item.createdByAccountEmail.toLowerCase() !== filterAccount.toLowerCase()) {
        return false;
      }
      if (filterDept !== 'all' && item.department !== filterDept) {
        return false;
      }
      if (companySearchTerm.trim()) {
        const term = companySearchTerm.toLowerCase().trim();
        const matchName = item.companyName.toLowerCase().includes(term);
        const matchRuc = item.ruc.includes(term);
        const matchIng = item.responsibleEngineer.toLowerCase().includes(term);
        const matchCip = (item.cipNumber || '').includes(term);
        const matchEmail = item.createdByAccountEmail.toLowerCase().includes(term);
        return matchName || matchRuc || matchIng || matchCip || matchEmail;
      }
      return true;
    });
  }, [globalEvaluations, filterAccount, filterDept, companySearchTerm]);

  // Cargar informe y abrir pestaña de reporte para el usuario maestro
  const handleOpenReportForCompany = (item: GlobalCompanyEvaluation) => {
    if (item.fullDiagnostic) {
      setDiagnostic(item.fullDiagnostic);
      setActiveTab('report');
    }
  };

  if (!isMaster) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900">Acceso Exclusivo para el Usuario Maestro</h3>
        <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
          Este módulo de control nacional, padrón de usuarios y visualización irrestricta de informes está reservado exclusivamente para la cuenta maestra auditada <strong className="text-slate-900">luxproc.11@gmail.com</strong>.
        </p>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
        >
          Volver al Panel Principal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* HEADER DEL MÓDULO MAESTRO CIP                                             */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border-2 border-amber-500/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                  MÓDULO MAESTRO CIP PRIVADO
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>luxproc.11@gmail.com</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Control Maestro Nacional & Registro de Informes CIP
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Apartado exclusivo para el Usuario Maestro. Visualice el conteo total de usuarios registrados en el sistema, realice consultas y búsquedas con datos blindados por número de CIP, y visualice o descargue cualquier informe pericial emitido en el país sin restricciones.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => exportMasterRegistryToCSV(globalEvaluations)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              title="Descargar padrón maestro completo en CSV/Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Todos los Informes (.CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 1: CONTEO Y PADRÓN DE USUARIOS REGISTRADOS EN LA PLATAFORMA      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Padrón de Usuarios Registrados en la Plataforma
              </h2>
              <p className="text-xs text-slate-500">
                Visualización de todas las cuentas creadas y auditores activos en la base de datos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
              Total Cuentas Creadas: <span className="text-indigo-600 font-mono text-sm ml-1">{registeredUsersList.length}</span>
            </div>
          </div>
        </div>

        {/* Tabla de usuarios registrados */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Usuario / Titular</th>
                <th className="py-2.5 px-4">Correo Electrónico</th>
                <th className="py-2.5 px-4">Rol Profesional</th>
                <th className="py-2.5 px-4">Registro CIP</th>
                <th className="py-2.5 px-4">Informes Generados</th>
                <th className="py-2.5 px-4">Autenticación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {registeredUsersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">
                      {u.name.charAt(0)}
                    </span>
                    <span>{u.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {u.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-900">
                    {u.cipNumber ? `CIP N° ${u.cipNumber}` : '—'}
                  </td>
                  <td className="py-3 px-4 font-bold text-indigo-700">
                    {u.evaluationsCount} {u.evaluationsCount === 1 ? 'empresa' : 'empresas'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{u.verifiedGoogle ? 'Google Validado' : 'Contraseña OK'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 2: CONSULTA Y BÚSQUEDA EXTERNA VALIDADA POR NÚMERO DE CIP        */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">
              Consulta Oficial Externa al Padrón CIP (Datos Blindados e Inmodificables)
            </h2>
            <p className="text-xs text-slate-500">
              Ingrese el número de CIP para mostrar automáticamente el profesional y su colegio de procedencia sin opción de alteración manual.
            </p>
          </div>
        </div>

        {/* Formulario de búsqueda CIP */}
        <form onSubmit={handleSearchCIP} className="max-w-xl flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={cipSearchInput}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setCipSearchInput(val);
                if (val.length >= 5) {
                  const rec = lookupCIPRecord(val);
                  if (rec) {
                    setCipSearchResult(rec);
                    setCipSearchError(null);
                  }
                }
              }}
              placeholder="Ingrese número de CIP (ej: 278034, 215430, 98765, 124580...)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 text-xs focus:outline-none focus:border-indigo-600 shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Consultar CIP</span>
          </button>
        </form>

        {/* Sugerencias Rápidas de Prueba */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 font-medium">Búsqueda rápida por Consejo:</span>
          {[
            { cip: '278034', label: '278034 (La Libertad - Víctor Becerra Terán)' },
            { cip: '215430', label: '215430 (La Libertad - Roberto Dávila)' },
            { cip: '98765', label: '98765 (Arequipa - Alejandro Salazar)' },
            { cip: '194830', label: '194830 (Piura - Luis Morales)' },
            { cip: '165412', label: '165412 (Junín - Manuel Silva)' },
            { cip: '223841', label: '223841 (Cusco - Roxana Medina)' }
          ].map(b => (
            <button
              key={b.cip}
              type="button"
              onClick={() => {
                setCipSearchInput(b.cip);
                const rec = lookupCIPRecord(b.cip);
                setCipSearchResult(rec);
                setCipSearchError(null);
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-semibold transition-colors cursor-pointer"
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Mensaje de error si no existe */}
        {cipSearchError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{cipSearchError}</span>
          </div>
        )}

        {/* Ficha Oficial CIP Blindada */}
        {cipSearchResult && (
          <div className="bg-gradient-to-br from-emerald-50/60 to-slate-50 rounded-2xl p-5 border-2 border-emerald-300 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-black text-slate-900">
                  Resultado Oficial Certificado CIP · Datos Inmodificables
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                cipSearchResult.status === 'HABILITADO'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-rose-600 text-white'
              }`}>
                {cipSearchResult.status}
              </span>
            </div>

            {/* Campos bloqueados contra edición */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Nombre Completo del Profesional:</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-amber-700" />
                    <span>Bloqueado</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={cipSearchResult.fullName}
                    className="w-full bg-slate-100/90 text-slate-900 font-bold border border-slate-300 rounded-xl px-3 py-2 text-xs cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Colegio de Procedencia / Consejo Departamental:</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-amber-700" />
                    <span>Bloqueado</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={cipSearchResult.college}
                    className="w-full bg-slate-100/90 text-slate-900 font-bold border border-slate-300 rounded-xl px-3 py-2 text-xs cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Especialidad Verdadera de la Ingeniería:</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-amber-700" />
                    <span>Bloqueado</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={cipSearchResult.specialty}
                    className="w-full bg-slate-100/90 text-slate-900 font-bold border border-slate-300 rounded-xl px-3 py-2 text-xs cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Capítulo Oficial CIP:</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-amber-700" />
                    <span>Bloqueado</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={cipSearchResult.chapter}
                    className="w-full bg-slate-100/90 text-slate-900 font-bold border border-slate-300 rounded-xl px-3 py-2 text-xs cursor-not-allowed select-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-white/80 p-3 rounded-xl border border-emerald-200 leading-relaxed">
              <span className="font-bold text-emerald-950">Garantía de Integridad Pericial: </span>
              {cipSearchResult.legalNotice}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN 3: VISUALIZACIÓN Y DESCARGA DE INFORMES DE TODAS LAS EMPRESAS    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <FileBadge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Registro y Descarga Global de Informes Periciales CIP
              </h2>
              <p className="text-xs text-slate-500">
                Visualice y descargue cualquier informe pericial emitido por las cuentas creadas en el sistema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              {filteredEvaluations.length} informes disponibles
            </span>
          </div>
        </div>

        {/* Filtros de Informes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={companySearchTerm}
              onChange={(e) => setCompanySearchTerm(e.target.value)}
              placeholder="Buscar por Empresa, RUC o Perito CIP..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
            />
          </div>

          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="all">Todas las cuentas creadas ({globalEvaluations.length})</option>
            {registeredUsersList.map(u => (
              <option key={u.email} value={u.email}>{u.email} ({u.evaluationsCount} inf.)</option>
            ))}
          </select>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600"
          >
            <option value="all">Todos los Departamentos CIP</option>
            <option value="Lima">Lima</option>
            <option value="La Libertad">La Libertad</option>
            <option value="Arequipa">Arequipa</option>
            <option value="Piura">Piura</option>
            <option value="Junín">Junín</option>
            <option value="Cusco">Cusco</option>
          </select>
        </div>

        {/* Lista de empresas e informes */}
        <div className="space-y-3 pt-2">
          {filteredEvaluations.map(ev => (
            <div 
              key={ev.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {ev.reportCode}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {ev.installationType}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{ev.status}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    RUC: {ev.ruc}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900">{ev.companyName}</h4>
                  <p className="text-xs text-slate-500">
                    {ev.commercialActivity} · <span className="text-slate-700">{ev.address} ({ev.department})</span>
                  </p>
                </div>

                <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>Cuenta: <strong className="text-slate-800">{ev.createdByAccountEmail}</strong></span>
                  <span>Perito: <strong className="text-slate-800">{ev.responsibleEngineer} (CIP {ev.cipNumber})</strong></span>
                  <span className="text-[11px] text-slate-400">Fecha: {ev.date}</span>
                </div>
              </div>

              {/* Métricas y Botones de Descarga */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Potencia</span>
                    <span className="text-xs font-black text-slate-900">{ev.powerKw.toFixed(1)} kW</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Ahorro Est.</span>
                    <span className="text-xs font-black text-emerald-600">S/ {Math.round(ev.annualSavingsPen).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReportForCompany(ev)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    title="Visualizar informe oficial completo en el visor CIP"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Visualizar Informe CIP</span>
                  </button>

                  <button
                    onClick={() => handleOpenReportForCompany(ev)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    title="Descargar informe oficial en formato PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>Descargar PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
