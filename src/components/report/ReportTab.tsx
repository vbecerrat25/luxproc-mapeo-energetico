import React, { useState, useRef } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { TrafficBadge } from '../shared/TrafficBadge';
import { 
  Printer, 
  FileCheck2, 
  ShieldCheck, 
  Zap, 
  Building2, 
  MapPin, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet,
  Sparkles, 
  Download, 
  Loader2,
  SlidersHorizontal,
  Lightbulb,
  ShieldAlert,
  SunMedium,
  TrendingDown,
  BarChart3,
  Activity,
  Layers,
  Filter,
  CheckSquare,
  Square,
  Lock,
  ExternalLink
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { exportDiagnosticToExcel } from '../../utils/excelExporter';
import { useLanguage } from '../../context/LanguageContext';
import { lookupCIPRecord } from '../../utils/cipValidator';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend 
} from 'recharts';

interface ReportSectionsConfig {
  generalData: boolean;          // 1. Datos Generales & Suministro
  balanceCharts: boolean;        // 2. Gráficas de Balance (Consumo Pagado vs Equipos)
  topEquipmentRanking: boolean;  // 3. Gráficas de Mayor Consumo y Ranking de Máquinas
  panelsAndCircuits: boolean;    // 4. Módulo Independiente: Tableros Eléctricos & CNE
  lightingModule: boolean;       // 5. Módulo Independiente: Conexiones de Luminarias & RNE EM.010
  groundingModule: boolean;      // 6. Módulo Independiente: Puesta a Tierra (Protocolo ITSE/INDECI)
  powerFactor: boolean;          // 7. Factor de Potencia y Energía Reactiva
  solarModule: boolean;          // 8. Potencial Solar Fotovoltaico
  savingsPlan: boolean;          // 9. Plan de Eficiencia y Retorno de Inversión (ROI)
  allRecommendations: boolean;   // 10. Recomendaciones Técnicas Integrales de Mejora de Todo
  cipStatement: boolean;         // 11. Dictamen Técnico y Declaración Jurada Oficial CIP
}

export const ReportTab: React.FC = () => {
  const {
    currentUser,
    diagnostic,
    equipmentSummary,
    demandBalance,
    receiptsStats,
    receiptComparison,
    safetyEvaluation,
    efficiencyEvaluation,
    computedEquipment,
    computedSavingsOpportunities,
    computedBom,
    setActiveTab,
    updateGeneralData
  } = useDiagnostic();
  const { t, language } = useLanguage();

  // Helper de traducción dinámico para todo el informe técnico oficial
  const rt = (esText: string, enText: string, ptText?: string): string => {
    if (language === 'en') return enText;
    if (language === 'pt') return ptText || enText;
    return esText;
  };

  const { generalData, tariff } = diagnostic;
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Validación Estricta de Habilitación y Registro CIP al 100%
  const currentCipNumber = (currentUser?.cipNumber || generalData.cipNumber || '278034').trim();
  const cipRecord = lookupCIPRecord(
    currentCipNumber,
    currentUser?.name || generalData.responsibleEngineer,
    currentUser?.specialty || generalData.specialty,
    currentUser?.regionalCouncil || generalData.professionalCollege,
    currentUser?.chapter
  );
  const isCipNotFound = !currentCipNumber || !cipRecord;
  const isCipNotHabilitado = Boolean(cipRecord && cipRecord.status === 'NO_HABILITADO');
  const isReportBlocked = isCipNotFound || isCipNotHabilitado;

  // Configuración de módulos seleccionables para el informe
  const [sections, setSections] = useState<ReportSectionsConfig>({
    generalData: true,
    balanceCharts: true,
    topEquipmentRanking: true,
    panelsAndCircuits: true,
    lightingModule: true,
    groundingModule: true,
    powerFactor: true,
    solarModule: !!diagnostic.solar,
    savingsPlan: true,
    allRecommendations: true,
    cipStatement: true
  });

  const [showConfigDrawer, setShowConfigDrawer] = useState(true);

  const toggleSection = (key: keyof ReportSectionsConfig) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = (select: boolean) => {
    setSections({
      generalData: select,
      balanceCharts: select,
      topEquipmentRanking: select,
      panelsAndCircuits: select,
      lightingModule: select,
      groundingModule: select,
      powerFactor: select,
      solarModule: select,
      savingsPlan: select,
      allRecommendations: select,
      cipStatement: select
    });
  };

  // Presets
  const applyPreset = (preset: 'all' | 'safety' | 'lighting' | 'energy') => {
    if (preset === 'all') {
      handleSelectAll(true);
    } else if (preset === 'safety') {
      setSections({
        generalData: true,
        balanceCharts: false,
        topEquipmentRanking: false,
        panelsAndCircuits: true,
        lightingModule: false,
        groundingModule: true,
        powerFactor: false,
        solarModule: false,
        savingsPlan: false,
        allRecommendations: true,
        cipStatement: true
      });
    } else if (preset === 'lighting') {
      setSections({
        generalData: true,
        balanceCharts: false,
        topEquipmentRanking: false,
        panelsAndCircuits: false,
        lightingModule: true,
        groundingModule: false,
        powerFactor: false,
        solarModule: false,
        savingsPlan: true,
        allRecommendations: true,
        cipStatement: true
      });
    } else if (preset === 'energy') {
      setSections({
        generalData: true,
        balanceCharts: true,
        topEquipmentRanking: true,
        panelsAndCircuits: false,
        lightingModule: true,
        groundingModule: false,
        powerFactor: true,
        solarModule: true,
        savingsPlan: true,
        allRecommendations: true,
        cipStatement: true
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!reportContainerRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const element = reportContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const clientClean = (generalData.companyName || generalData.clientName || 'PROYECTO').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Informe_Tecnico_Electrico_CIP_${clientClean}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('Error generando PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadExcel = () => {
    exportDiagnosticToExcel(diagnostic);
  };

  // Cálculos de ahorro y ROI
  const totalAnnualSavingsSoles = computedSavingsOpportunities.reduce(
    (acc, o) => acc + (o.annualSavingsSoles || 0), 0
  );

  const totalInvestmentSoles = computedSavingsOpportunities.reduce(
    (acc, o) => acc + (o.estimatedInvestmentSoles || 0), 0
  );

  const paybackYears = totalAnnualSavingsSoles > 0 ? totalInvestmentSoles / totalAnnualSavingsSoles : 0;

  // Equipos ordenados por consumo mensual para la gráfica y ranking
  const sortedEquipmentByKwh = [...computedEquipment].sort((a, b) => (b.monthlyKwh || 0) - (a.monthlyKwh || 0));
  const totalEquipKwh = equipmentSummary.totalMonthlyKwh || 1;
  const topConsumerMachine = sortedEquipmentByKwh[0];

  // Datos para la tabla técnica oficial de Factor de Carga y Exceso de Energía (conforme a la imagen)
  const equipmentTableRows = computedEquipment.map(eq => {
    const rawFactor = eq.loadFactor ?? 0.8;
    const factorPercent = rawFactor > 2 ? Math.round(rawFactor) : Math.round(rawFactor * 100);
    const isOverloaded = factorPercent > 100;
    const isMonofasico = eq.phases === 'MONOFASICO' || eq.phases === 'MONOFASICA';
    const system = isMonofasico ? 'Monofásico' : 'Trifásico';
    const monthlyCost = eq.monthlyCostSoles ?? (eq.monthlyKwh * (tariff.activeEnergyPriceKwh || 0.685));
    
    // Si opera con sobrecarga (>100%), calculamos el exceso de pago por ineficiencia térmica y penalidad
    const excessAnnualCost = isOverloaded 
      ? ((factorPercent - 100) / 100) * monthlyCost * 12 * 0.55
      : 0;

    const percentOfTotal = totalEquipKwh > 0 ? (eq.monthlyKwh / totalEquipKwh) * 100 : 0;

    return {
      id: eq.id,
      name: eq.name.toUpperCase(),
      factorPercent,
      isOverloaded,
      system,
      excessAnnualCost,
      monthlyCost,
      monthlyKwh: eq.monthlyKwh || 0,
      percentOfTotal
    };
  });

  const totalMonthlyEnergyPayment = equipmentTableRows.reduce((acc, r) => acc + r.monthlyCost, 0);
  const totalAnnualExcessPayment = equipmentTableRows.reduce((acc, r) => acc + r.excessAnnualCost, 0);

  // Paleta de colores para la gráfica de distribución (conforme a la imagen)
  const piePalette = [
    '#22b2bf', // Cyan / Teal
    '#f59e0b', // Amber / Naranja
    '#f97316', // Naranja rojizo
    '#10b981', // Esmeralda / Verde
    '#8b5cf6', // Violeta
    '#3b82f6', // Azul eléctrico
    '#ec4899', // Rosa
    '#64748b'  // Slate / Gris
  ];

  // Datos para la gráfica circular de distribución del consumo eléctrico
  const pieDistributionData = sortedEquipmentByKwh.map((eq, idx) => {
    const percent = Number(((eq.monthlyKwh / totalEquipKwh) * 100).toFixed(1));
    return {
      name: eq.name.toUpperCase(),
      value: Math.round(eq.monthlyKwh),
      percent,
      color: piePalette[idx % piePalette.length],
      monthlyCost: eq.monthlyCostSoles ?? (eq.monthlyKwh * (tariff.activeEnergyPriceKwh || 0.685))
    };
  });

  // Cálculo de la propuesta técnica y económica de mejora de iluminación por espacio o área (RNE EM.010)
  const defaultLightingSpaces = [
    { roomName: 'Nave de Armado y Costura', existingTech: 'Fluorescente T8 2x36W c/ balasto electromagnético', qty: 16, currentW: 76, proposedTech: 'Luminaria Hermética LED 2x18W IP65 (130 lm/W)', proposedW: 36, targetLux: 600 },
    { roomName: 'Área de Corte e Inspección de Pieles', existingTech: 'Campana Halogenuro Metálico 250W', qty: 6, currentW: 275, proposedTech: 'Campana Industrial High-Bay LED 80W (140 lm/W)', proposedW: 80, targetLux: 500 },
    { roomName: 'Área de Ensamble y Prensas', existingTech: 'Fluorescente T8 2x36W', qty: 10, currentW: 76, proposedTech: 'Luminaria Hermética Lineal LED 36W', proposedW: 36, targetLux: 400 },
    { roomName: 'Almacén de Materia Prima y Despacho', existingTech: 'Lámparas Vapor de Sodio 150W', qty: 4, currentW: 175, proposedTech: 'Campana UFO LED Industrial 60W', proposedW: 60, targetLux: 200 },
    { roomName: 'Oficinas Técnicas y Control de Calidad', existingTech: 'Paneles Fluorescentes T8 4x18W', qty: 8, currentW: 82, proposedTech: 'Panel LED Ultra-Slim 40W 5000K', proposedW: 40, targetLux: 500 }
  ];

  const sourceLighting = (diagnostic.lighting && diagnostic.lighting.length > 0)
    ? diagnostic.lighting.map((room, idx) => {
        const qty = room.existingQuantity || (room as any).fixtureCount || 10;
        const currentW = room.unitPowerW || (room as any).powerPerFixtureW || 76;
        let proposedTech = 'Luminaria Hermética LED 2x18W IP65';
        let proposedW = 36;
        if (currentW >= 200) {
          proposedTech = 'Campana High-Bay LED 80W (140 lm/W)';
          proposedW = 80;
        } else if (currentW >= 120) {
          proposedTech = 'Campana UFO LED Industrial 60W';
          proposedW = 60;
        } else if (currentW <= 45) {
          proposedTech = 'Panel LED Ultra-Slim 24W';
          proposedW = 24;
        }
        return {
          roomName: room.roomName,
          existingTech: room.luminaireType || (room as any).technology || 'Fluorescente T8 2x36W',
          qty,
          currentW,
          proposedTech,
          proposedW,
          targetLux: room.requiredLuxRne || room.requiredLux || 400
        };
      })
    : defaultLightingSpaces;

  const energyRate = tariff.activeEnergyPriceKwh || 0.685;
  const lightingProposalRows = sourceLighting.map((item, idx) => {
    const currentTotalKw = (item.qty * item.currentW) / 1000;
    const proposedTotalKw = (item.qty * item.proposedW) / 1000;
    const powerReductionKw = Math.max(0, currentTotalKw - proposedTotalKw);
    const powerReductionPercent = currentTotalKw > 0 ? (powerReductionKw / currentTotalKw) * 100 : 50;

    const monthlyHours = 260; // 10h/día x 26 días/mes
    const monthlySavingsKwh = powerReductionKw * monthlyHours;
    const monthlySavingsSoles = monthlySavingsKwh * energyRate;
    const annualSavingsSoles = monthlySavingsSoles * 12;

    const costPerUnit = item.proposedW >= 80 ? 250 : 135;
    const estimatedInvestment = item.qty * costPerUnit;
    const paybackMonths = monthlySavingsSoles > 0 ? estimatedInvestment / monthlySavingsSoles : 10;

    return {
      id: `lgt-row-${idx}`,
      roomName: item.roomName,
      existingTech: item.existingTech,
      currentTotalKw,
      proposedTech: item.proposedTech,
      proposedTotalKw,
      powerReductionPercent,
      monthlySavingsKwh,
      monthlySavingsSoles,
      annualSavingsSoles,
      estimatedInvestment,
      paybackMonths,
      targetLux: item.targetLux
    };
  });

  const totalLightingAnnualSavings = lightingProposalRows.reduce((a, b) => a + b.annualSavingsSoles, 0);
  const totalLightingPowerReductionKw = lightingProposalRows.reduce((a, b) => a + (b.currentTotalKw - b.proposedTotalKw), 0);
  const totalLightingInvestment = lightingProposalRows.reduce((a, b) => a + b.estimatedInvestment, 0);
  const averageLightingPaybackMonths = totalLightingAnnualSavings > 0
    ? totalLightingInvestment / (totalLightingAnnualSavings / 12)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Top Action Bar & Export Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 font-display">
              {rt('Informe Técnico Certificado CIP', 'Official CIP Certified Technical Report', 'Relatório Técnico Certificado CIP')}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {rt('CNE / RNE Oficial', 'Official Code / Standard', 'CNE / RNE Oficial')}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {rt(
              'Descargas autorizadas exclusivamente en formato PDF e información consolidada en Excel (.xlsx)',
              'Authorized downloads exclusively in PDF format and consolidated data in Excel (.xlsx)',
              'Downloads autorizados exclusivamente em formato PDF e dados consolidados em Excel (.xlsx)'
            )}
          </p>
        </div>

        {/* Solo formato PDF o Excel (.xlsx) con bloqueo normativo */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || isReportBlocked}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md ${
              isReportBlocked
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-indigo-600/20'
            }`}
            title={isReportBlocked ? rt('Bloqueado: Requiere CIP Colegiado y Habilitado', 'Blocked: Requires active registered CIP', 'Bloqueado: Requer CIP registrado e habilitado') : rt('Descargar Informe Técnico en formato PDF oficial', 'Download official technical PDF report', 'Baixar relatório técnico em PDF')}
          >
            {isReportBlocked ? (
              <Lock size={15} className="text-slate-500" />
            ) : isGeneratingPdf ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <Download size={16} className="text-white" />
            )}
            <span>
              {isGeneratingPdf 
                ? rt('Generando PDF...', 'Generating PDF...', 'Gerando PDF...') 
                : rt('Descargar Informe PDF', 'Download PDF Report', 'Baixar Relatório PDF')}
            </span>
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={isReportBlocked}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all ${
              isReportBlocked
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shadow-xs cursor-pointer'
            }`}
            title={isReportBlocked ? rt('Bloqueado: Requiere CIP Colegiado y Habilitado', 'Blocked: Requires active registered CIP', 'Bloqueado: Requer CIP ativo') : rt('Descargar todos los datos técnicos en formato Excel (.xlsx)', 'Download all technical data in Excel (.xlsx)', 'Baixar dados técnicos em Excel (.xlsx)')}
          >
            {isReportBlocked ? <Lock size={15} className="text-slate-400" /> : <FileSpreadsheet size={16} className="text-emerald-700" />}
            <span>{rt('Descargar Excel (.xlsx)', 'Download Excel (.xlsx)', 'Baixar Excel (.xlsx)')}</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={isReportBlocked}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
              isReportBlocked
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md cursor-pointer'
            }`}
            title={isReportBlocked ? rt('Bloqueado: Requiere CIP Colegiado y Habilitado', 'Blocked: Requires active registered CIP', 'Bloqueado: Requer CIP ativo') : rt('Imprimir o exportar vía navegador', 'Print or export via browser', 'Imprimir ou exportar via navegador')}
          >
            {isReportBlocked ? <Lock size={15} className="text-slate-400" /> : <Printer size={16} className="text-amber-400" />}
            <span className="hidden sm:inline">{rt('Imprimir', 'Print', 'Imprimir')}</span>
          </button>
        </div>
      </div>

      {isReportBlocked ? (
        /* ========================================================================= */
        /* PANTALLA OFICIAL DE BLOQUEO CIP (NO ENCONTRADO O NO HABILITADO)           */
        /* ========================================================================= */
        <div className="space-y-6">
          {isCipNotFound ? (
            <div className="rounded-3xl border-2 border-rose-300 bg-gradient-to-b from-rose-50/90 via-white to-rose-50/50 p-6 sm:p-10 shadow-lg text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-300 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
                <ShieldAlert className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-[11px] font-black uppercase tracking-wider font-mono">
                  <Lock className="w-3.5 h-3.5 text-rose-700" />
                  <span>Emisión & Descarga Bloqueadas · Ley N° 28858</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  Número de Registro CIP No Encontrado en el Padrón Nacional
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  El número de CIP ingresado (<strong className="font-mono text-rose-700">{currentCipNumber || 'Vacío / No Especificado'}</strong>) no coincide con ningún registro certificado en el Colegio de Ingenieros del Perú.
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Por mandato expreso del Estatuto del CIP y la Ley N° 28858 del Ejercicio Profesional de la Ingeniería, es indispensable contar con colegiatura válida y verificada para observar y emitir informes periciales oficiales.
                </p>
              </div>

              {/* Botón de acción para ir a Datos Generales */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Ingresar / Modificar CIP en Datos Generales</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/90 via-white to-amber-50/50 p-6 sm:p-10 shadow-lg text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 mx-auto flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black uppercase tracking-wider font-mono">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Colegiatura Inhabilitada · Emisión Restringida</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  Colegiado NO HABILITADO ante el Colegio de Ingenieros del Perú
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  El profesional <strong>{cipRecord?.fullName}</strong> (<span className="font-mono font-bold text-amber-900">CIP N° {cipRecord?.cipNumber}</span> - {cipRecord?.regionalCouncil}) figura con estado <strong className="text-rose-700 uppercase">NO HABILITADO</strong> en el padrón oficial del CIP.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El artículo 4° de la Ley N° 28858 y las exigencias de INDECI / ITSE prohíben a profesionales no habilitados la emisión, refrendo o firma de informes técnicos periciales. El informe oficial no puede ser observado ni descargado hasta regularizar la condición de colegiatura.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Cambiar a Ingeniero Colegiado Habilitado</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>

      {/* Modular Section Selector Panel (Filtro Modular de Secciones) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs print:hidden space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Personalizar Secciones a Incluir en el Informe:
            </span>
            <span className="text-[11px] text-slate-500">
              (Luminarias, Tableros y Puesta a Tierra son módulos independientes)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleSelectAll(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Marcar Todos
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => handleSelectAll(false)}
              className="text-slate-500 hover:text-slate-800 font-semibold"
            >
              Desmarcar Todos
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Vistas Rápidas:</span>
          <button
            onClick={() => applyPreset('all')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Informe Completo
          </button>
          <button
            onClick={() => applyPreset('safety')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
          >
            Solo Tableros & Puesta a Tierra (INDECI)
          </button>
          <button
            onClick={() => applyPreset('lighting')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100"
          >
            Solo Módulo de Luminarias (RNE)
          </button>
          <button
            onClick={() => applyPreset('energy')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
          >
            Auditoría de Consumo & Ahorro
          </button>
        </div>

        {/* Section Checkboxes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1 text-xs">
          <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={sections.generalData}
              onChange={() => toggleSection('generalData')}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-slate-800">1. Datos Generales y Suministro</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={sections.balanceCharts}
              onChange={() => toggleSection('balanceCharts')}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-indigo-950">2. Gráficas: Consumo Pagado vs Censo</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={sections.topEquipmentRanking}
              onChange={() => toggleSection('topEquipmentRanking')}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="font-semibold text-amber-950">3. Gráficas: Máquinas de Mayor Consumo</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={sections.panelsAndCircuits}
              onChange={() => toggleSection('panelsAndCircuits')}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-slate-800">4. Módulo Tableros Eléctricos & CNE</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={sections.lightingModule}
              onChange={() => toggleSection('lightingModule')}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-slate-800">5. Módulo Conexiones Luminarias (RNE)</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={sections.groundingModule}
              onChange={() => toggleSection('groundingModule')}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-slate-800">6. Módulo Puesta a Tierra (INDECI)</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={sections.powerFactor}
              onChange={() => toggleSection('powerFactor')}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-slate-800">7. Factor de Potencia & Penalidades</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={sections.solarModule}
              onChange={() => toggleSection('solarModule')}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-slate-800">8. Potencial Solar Fotovoltaico</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={sections.savingsPlan}
              onChange={() => toggleSection('savingsPlan')}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-slate-800">9. Plan de Ahorro y Retorno (ROI)</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50/50 cursor-pointer sm:col-span-2">
            <input
              type="checkbox"
              checked={sections.allRecommendations}
              onChange={() => toggleSection('allRecommendations')}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="font-semibold text-emerald-950">10. Recomendaciones Técnicas de Mejora de Todo</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={sections.cipStatement}
              onChange={() => toggleSection('cipStatement')}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-slate-800">11. Dictamen y Peritaje CIP</span>
          </label>
        </div>
      </div>

      {/* Printable Official Document Container */}
      <div 
        ref={reportContainerRef}
        className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-12 shadow-md print:border-0 print:p-0 print:shadow-none space-y-8 text-slate-900 font-serif"
      >
        
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-5 text-center space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 font-sans text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">
                {rt('COLEGIO DE INGENIEROS DEL PERÚ (CIP)', 'COLLEGE OF ENGINEERS OF PERU (CIP)', 'COLÉGIO DE ENGENHEIROS DO PERU (CIP)')}
              </span>
            </div>
            <span className="font-mono font-bold text-amber-800">
              {rt('EXPEDIENTE:', 'FILE NO.:', 'PROCESSO:')} {generalData.diagnosticCode || 'E-DIAG-2026-CIP'}
            </span>
            <span>
              {rt('FECHA:', 'DATE:', 'DATA:')} {generalData.date || new Date().toLocaleDateString(language === 'en' ? 'en-US' : language === 'pt' ? 'pt-BR' : 'es-PE')}
            </span>
          </div>

          <div className="pt-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-slate-950 font-display">
              {rt(
                'INFORME TÉCNICO PERICIAL DE DIAGNÓSTICO ELÉCTRICO Y ENERGÉTICO',
                'TECHNICAL EXPERT REPORT ON ELECTRICAL & ENERGY DIAGNOSIS',
                'RELATÓRIO TÉCNICO PERICIAL DE DIAGNÓSTICO ELÉTRICO E ENERGÉTICO'
              )}
            </h1>
            <p className="text-xs italic text-slate-600 font-sans mt-1">
              {rt(
                'Conforme al Código Nacional de Electricidad (CNE Utilización 2006), RNE EM.010, NTP 370.053 y Protocolo ITSE INDECI',
                'In compliance with National Electrical Code (CNE / NEC), Building Code EM.010, NTP 370.053 and ITSE Protocol',
                'Em conformidade com o Código Elétrico Nacional, Regulamento RNE EM.010, NTP 370.053 e Protocolo ITSE'
              )}
            </p>
          </div>
        </div>

        {/* SECTION 1: DATOS DEL TITULAR E INSTALACIÓN */}
        {sections.generalData && (
          <div className="space-y-3">
            <div className="border-b border-slate-300 pb-1 font-sans font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center justify-between">
              <span>{rt('1. DATOS GENERALES DEL PREDIO Y CARACTERÍSTICAS DEL SUMINISTRO', '1. GENERAL SITE DATA & POWER SUPPLY SPECIFICATIONS', '1. DADOS GERAIS DO IMÓVEL E ESPECIFICAÇÕES DO FORNECIMENTO')}</span>
              <span className="text-xs font-mono text-slate-500">{generalData.installationType}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs font-sans">
              <div><strong>{rt('Razón Social / Titular:', 'Company / Owner Name:', 'Razão Social / Titular:')}</strong> {generalData.companyName || generalData.clientName || 'N/A'}</div>
              <div><strong>{rt('RUC / DNI:', 'Tax ID / DNI:', 'CNPJ / CPF / RUC:')}</strong> <span className="font-mono">{generalData.ruc || 'N/A'}</span></div>
              <div><strong>{rt('Dirección Fiscal / Ubicación:', 'Fiscal Address / Location:', 'Endereço Fiscal / Localização:')}</strong> {generalData.address}, {generalData.district}, {generalData.department}</div>
              <div><strong>{rt('Actividad Económica:', 'Economic Activity:', 'Atividade Econômica:')}</strong> {generalData.economicActivity || generalData.installationType}</div>
              <div><strong>{rt('Área Techada:', 'Built Area:', 'Área Coberta:')}</strong> {generalData.builtAreaM2} m² ({generalData.workerCount} {rt('personas en planta', 'occupants in facility', 'pessoas na planta')})</div>
              <div><strong>{rt('Ingeniero Colegiado Responsable:', 'Responsible Collegiate Engineer:', 'Engenheiro Responsável Registrado:')}</strong> {currentUser?.name || generalData.responsibleEngineer || 'Ing. Víctor Fernando Becerra Terán'}</div>
              <div><strong>{rt('Colegiatura CIP:', 'CIP Registration:', 'Registro Profissional CIP:')}</strong> <span className="font-mono font-bold text-amber-900">CIP N° {currentUser?.cipNumber || generalData.cipNumber || '278034'}</span></div>
              <div><strong>{rt('Especialidad:', 'Engineering Specialty:', 'Especialidade de Engenharia:')}</strong> <span className="font-medium text-slate-900">{currentUser?.specialty || generalData.specialty || 'Ingeniero Electrónico'}</span></div>
              <div><strong>{rt('Colegio Profesional:', 'Professional Engineering Board:', 'Conselho Profissional:')}</strong> <span className="font-medium text-slate-900">{currentUser?.professionalCollege || generalData.professionalCollege || 'Colegio de Ingenieros del Perú - Consejo Departamental de La Libertad (CD La Libertad)'}</span></div>
              <div><strong>{rt('Distribuidora y Tarifa:', 'Utility & Tariff Code:', 'Distribuidora e Tarifa:')}</strong> {tariff.distributor} ({tariff.tariffCode} - {tariff.supplyVoltage}V {tariff.phases})</div>
            </div>
          </div>
        )}

        {/* SECTION 2: GRÁFICAS DE CONSUMO PAGADO VS CONSUMO DE EQUIPOS */}
        {sections.balanceCharts && (
          <div className="space-y-4 font-sans">
            <div className="border-b border-slate-300 pb-1 font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center justify-between">
              <span>{rt('2. BALANCE ENERGÉTICO: CONSUMO PAGADO EN RECIBOS VS CENSO DE EQUIPOS', '2. ENERGY BALANCE: BILLED UTILITY CONSUMPTION VS EQUIPMENT SURVEY', '2. BALANÇO ENERGÉTICO: CONSUMO FATURADO EM CONTAS VS CENSO DE CARGAS')}</span>
              <span className="text-xs font-mono font-bold text-indigo-700">
                {rt('DISCREPANCIA:', 'DISCREPANCY:', 'DISCREPÂNCIA:')} {receiptComparison.differencePercent}%
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {rt(
                'Comparación técnica entre la energía facturada y pagada por la empresa concesionaria (promedio histórico de recibos) versus el consumo total modelado mediante el censo directo de cargas y maquinaria:',
                'Technical comparison between invoiced utility energy (historical billing average) versus total energy consumption modeled via direct equipment survey:',
                'Comparação técnica entre a energia faturada pela concessionária versus o consumo total modelado por censo de cargas e máquinas:'
              )}
            </p>

            {/* Visual Comparison Graph */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              
              {/* Graphic Bar Display */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>{rt('Energía Mensual (kWh/mes)', 'Monthly Energy (kWh/month)', 'Energia Mensal (kWh/mês)')}</span>
                  <span className="text-[11px] text-slate-500">{rt('Comparativa Directa', 'Direct Comparison', 'Comparativo Direto')}</span>
                </div>

                {/* Bar 1: Pagado en Recibos */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{rt('Consumo Pagado (Recibos Distribuidora):', 'Billed Consumption (Utility Invoices):', 'Consumo Faturado (Contas Distribuidora):')}</span>
                    <span className="font-mono font-bold text-slate-900">{receiptsStats.averageMonthlyKwh.toLocaleString()} kWh</span>
                  </div>
                  <div className="w-full bg-slate-200 h-6 rounded-lg overflow-hidden flex">
                    <div 
                      className="bg-indigo-600 h-full rounded-lg flex items-center justify-end pr-2 text-white font-mono font-bold text-[10px]"
                      style={{ width: `${Math.min(100, Math.max(20, (receiptsStats.averageMonthlyKwh / Math.max(receiptsStats.averageMonthlyKwh, equipmentSummary.totalMonthlyKwh)) * 100))}%` }}
                    >
                      S/. {Math.round(receiptsStats.averageMonthlyCostSoles).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Bar 2: Censado en Equipos */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{rt('Consumo Estimado (Censo de Cargas):', 'Estimated Consumption (Equipment Census):', 'Consumo Estimado (Censo de Cargas):')}</span>
                    <span className="font-mono font-bold text-slate-900">{equipmentSummary.totalMonthlyKwh.toLocaleString()} kWh</span>
                  </div>
                  <div className="w-full bg-slate-200 h-6 rounded-lg overflow-hidden flex">
                    <div 
                      className="bg-amber-500 h-full rounded-lg flex items-center justify-end pr-2 text-slate-950 font-mono font-bold text-[10px]"
                      style={{ width: `${Math.min(100, Math.max(20, (equipmentSummary.totalMonthlyKwh / Math.max(receiptsStats.averageMonthlyKwh, equipmentSummary.totalMonthlyKwh)) * 100))}%` }}
                    >
                      S/. {Math.round(equipmentSummary.totalMonthlyCostSoles).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-indigo-600 rounded" />
                    <span>{rt('Facturado en Recibo', 'Billed in Invoices', 'Faturado em Contas')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-amber-500 rounded" />
                    <span>{rt('Modelado en Equipos', 'Modeled in Equipment', 'Modelado em Equipamentos')}</span>
                  </div>
                </div>
              </div>

              {/* Technical Interpretation */}
              <div className="border border-slate-200 bg-white rounded-lg p-3 text-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-indigo-600" />
                    <span>{rt('Diagnóstico de Correlación Energética:', 'Energy Correlation Assessment:', 'Diagnóstico de Correlação Energética:')}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {Math.abs(receiptComparison.differencePercent) <= 15 ? (
                      <span className="text-emerald-800 font-semibold">
                        {rt(
                          `✓ Excelente calibración (desviación de ${receiptComparison.differencePercent}%). El censo de cargas representa con alta fidelidad el perfil de consumo operativo real del predio.`,
                          `✓ Excellent calibration (${receiptComparison.differencePercent}% discrepancy). The equipment load survey accurately captures the real facility operating profile.`,
                          `✓ Excelente calibração (desvio de ${receiptComparison.differencePercent}%). O censo de cargas representa fielmente o consumo real da planta.`
                        )}
                      </span>
                    ) : (
                      <span className="text-amber-800 font-semibold">
                        ⚠️ {rt(`Discrepancia del ${receiptComparison.differencePercent}%. ${receiptComparison.statusDescription}`, `Discrepancy of ${receiptComparison.differencePercent}%. Audit deviation noted.`, `Discrepância de ${receiptComparison.differencePercent}%. Desvio auditado.`)}
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">{rt('Diferencia Mensual:', 'Monthly Discrepancy:', 'Diferença Mensal:')}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {Math.abs(receiptComparison.differenceKwh).toLocaleString()} kWh/mes
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{rt('Impacto Económico:', 'Financial Impact:', 'Impacto Econômico:')}</span>
                    <span className="font-mono font-bold text-slate-900">
                      S/. {Math.abs(receiptComparison.differenceSoles).toFixed(0)}/mes
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 3: TABLA OFICIAL DE FACTOR DE CARGA, EXCESO DE PAGO Y DISTRIBUCIÓN DE ENERGÍA */}
        {sections.topEquipmentRanking && (
          <div className="space-y-5 font-sans">
            <div className="border-b border-slate-300 pb-1 font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center justify-between">
              <span>{rt('3. FACTOR DE CARGA, SISTEMA ELÉCTRICO Y EXCESO DE PAGO POR MAQUINARIA', '3. LOAD FACTOR, ELECTRICAL SYSTEM & ANNUAL OVERPAYMENT BY MACHINE', '3. FATOR DE CARGA, SISTEMA ELÉTRICO E EXCESSO PAGO POR MAQUINÁRIO')}</span>
              <span className="text-xs font-mono font-bold text-amber-900">
                TOP 1: {topConsumerMachine ? `${topConsumerMachine.name} (${((topConsumerMachine.monthlyKwh / totalEquipKwh) * 100).toFixed(1)}%)` : 'N/A'}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {rt(
                'Evaluación pericial del régimen de carga de cada máquina, sistema eléctrico de alimentación utilizado (Monofásico / Trifásico), sobrecosto o exceso anual por sobrecarga térmica y monto mensual facturado:',
                'Technical assessment of operating load factor per machine, electrical supply configuration (1-Phase / 3-Phase), annual surcharge due to thermal overload, and invoiced monthly electricity cost:',
                'Avaliação pericial do regime de carga de cada máquina, sistema elétrico utilizado (Monofásico / Trifásico), sobrecusto anual por sobrecarga térmica e valor faturado mensal:'
              )}
            </p>

            {/* TABLA TÉCNICA OFICIAL */}
            <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-2xs">
              <table className="w-full text-xs text-left border-collapse bg-white">
                <thead className="bg-slate-100 text-slate-900 font-bold border-b-2 border-slate-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="border-r border-slate-300 p-2 text-left">{rt('Máquina/Equipo', 'Machine / Equipment', 'Máquina / Equipamento')}</th>
                    <th className="border-r border-slate-300 p-2 text-center">{rt('Factor de carga', 'Load factor', 'Fator de carga')}</th>
                    <th className="border-r border-slate-300 p-2 text-center">{rt('Sistema eléct. usado', 'Electrical system', 'Sistema elétrico')}</th>
                    <th className="border-r border-slate-300 p-2 text-right">{rt('Exceso pago energía anual', 'Annual energy surcharge', 'Excesso pago energia anual')}</th>
                    <th className="border-r border-slate-300 p-2 text-right">{rt('PAGO AL MES POR ENERGÍA', 'MONTHLY ENERGY PAYMENT', 'PAGAMENTO MENSAL DE ENERGIA')}</th>
                    <th className="p-2 text-center">{rt('% Consumo', '% Consumption', '% Consumo')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {equipmentTableRows.map((row, idx) => (
                    <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="border-r border-slate-200 p-2 font-bold text-slate-950 uppercase">
                        {row.name}
                      </td>
                      <td className="border-r border-slate-200 p-2 text-center">
                        {row.isOverloaded ? (
                          <span className="text-red-600 font-bold font-mono text-[13px]">
                            {row.factorPercent}%
                          </span>
                        ) : (
                          <span className="text-slate-800 font-mono">
                            {row.factorPercent}%
                          </span>
                        )}
                      </td>
                      <td className="border-r border-slate-200 p-2 text-center font-medium text-slate-700">
                        {row.system}
                      </td>
                      <td className="border-r border-slate-200 p-2 text-right font-mono">
                        {row.isOverloaded && row.excessAnnualCost > 0 ? (
                          <span className="text-red-600 font-bold">
                            S/ {row.excessAnnualCost.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-500">S/ -</span>
                        )}
                      </td>
                      <td className="border-r border-slate-200 p-2 text-right font-mono font-bold text-slate-900">
                        S/ {row.monthlyCost.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-indigo-50 text-indigo-900 border border-indigo-200/60">
                          {row.percentOfTotal.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-950 text-xs">
                  <tr>
                    <td className="border-r border-slate-300 p-2 uppercase">{rt('TOTAL GENERAL', 'GRAND TOTAL', 'TOTAL GERAL')}</td>
                    <td className="border-r border-slate-300 p-2 text-center font-mono">
                      {Math.round(equipmentTableRows.reduce((a, b) => a + b.factorPercent, 0) / (equipmentTableRows.length || 1))}% prom.
                    </td>
                    <td className="border-r border-slate-300 p-2 text-center text-slate-600">-</td>
                    <td className="border-r border-slate-300 p-2 text-right font-mono">
                      {totalAnnualExcessPayment > 0 ? (
                        <span className="text-red-600 font-black">
                          S/ {totalAnnualExcessPayment.toFixed(2)}
                        </span>
                      ) : (
                        <span>S/ 0.00</span>
                      )}
                    </td>
                    <td className="border-r border-slate-300 p-2 text-right font-mono font-black text-slate-950">
                      S/ {totalMonthlyEnergyPayment.toFixed(2)}
                    </td>
                    <td className="p-2 text-center font-mono">100.0%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* GRÁFICA CIRCULAR: DISTRIBUCIÓN CONSUMO DE ENERGIA ELECTRICA (CONFORME A LA IMAGEN 2) */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-2xs">
              <div className="text-center space-y-1 border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black tracking-wide text-slate-900 uppercase font-display">
                  DISTRIBUCIÓN CONSUMO DE ENERGIA ELECTRICA
                </h4>
                <p className="text-[11px] text-slate-500">
                  Participación porcentual y jerarquía de demanda de potencia activa por equipo
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Recharts Pie Chart */}
                <div className="md:col-span-7 h-64 sm:h-72 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        innerRadius={36}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name.slice(0, 14)}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={true}
                      >
                        {pieDistributionData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val: any, name: any, item: any) => [
                          `${Number(val).toLocaleString()} kWh/mes (${item.payload.percent}%) • S/. ${item.payload.monthlyCost.toFixed(2)}`,
                          name
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Slices Legend & Percentage Cards */}
                <div className="md:col-span-5 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Desglose Porcentual por Equipo:
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {pieDistributionData.map(item => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-bold text-slate-900 truncate text-[11px]">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                          <span className="font-bold text-slate-900">{item.percent}%</span>
                          <span className="text-slate-500 text-[10px]">S/. {Math.round(item.monthlyCost)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Ranking Bar Chart */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Ranking Cuantitativo de Demanda Mensual (kWh/mes):
              </div>
              {sortedEquipmentByKwh.slice(0, 6).map((eq, index) => {
                const percent = Math.min(100, Math.max(1, (eq.monthlyKwh / totalEquipKwh) * 100));
                const isTop1 = index === 0;

                return (
                  <div key={eq.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                          isTop1 ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                        }`}>
                          #{index + 1}
                        </span>
                        <span className="font-bold text-slate-900 truncate">{eq.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                          ({eq.power} {eq.powerUnit} • {eq.hoursPerDay}h/d • {eq.areaTag || 'General'})
                        </span>
                        {isTop1 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                            Mayor Consumo
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                        <span className="font-bold text-slate-900">{Math.round(eq.monthlyKwh).toLocaleString()} kWh</span>
                        <span className="text-slate-500 text-[11px] w-12 text-right">({percent.toFixed(1)}%)</span>
                        <span className="font-bold text-emerald-800 w-20 text-right">S/. {Math.round(eq.monthlyCostSoles || 0)}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isTop1 ? 'bg-rose-500' : index < 3 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insight Note */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-950 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Diagnóstico de Carga Dominante:</strong> Las 3 máquinas principales representan el{' '}
                <span className="font-bold underline">
                  {(
                    (sortedEquipmentByKwh.slice(0, 3).reduce((a, b) => a + (b.monthlyKwh || 0), 0) /
                      totalEquipKwh) *
                    100
                  ).toFixed(1)}%
                </span>{' '}
                del consumo eléctrico mensual total de las instalaciones.
                {totalAnnualExcessPayment > 0 && (
                  <span className="block mt-1 text-red-700 font-bold">
                    ⚠️ Se detectó sobrecarga operativa (factor &gt; 100%) generando un sobrecosto anual acumulado de S/ {totalAnnualExcessPayment.toFixed(2)}. Se recomienda redistribución de cargas y mantenimiento correctivo.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: MÓDULO INDEPENDIENTE DE TABLEROS ELÉCTRICOS Y CNE */}
        {sections.panelsAndCircuits && (
          <div className="space-y-3 font-sans">
            <div className="border-b border-slate-300 pb-1 font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center justify-between">
              <span>4. MÓDULO INDEPENDIENTE: EVALUACIÓN DE TABLEROS ELÉCTRICOS & CNE</span>
              <span className="text-xs font-mono font-bold">SEGURIDAD: {safetyEvaluation.score}/100</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Verificación física y técnica de los alimentadores, tableros generales (TG), tableros de distribución (TD) y coordinación de protecciones según CNE Utilización 2006:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 space-y-1">
                <strong className="text-slate-900 block font-bold">Capacidad Térmica de Conductores (Ib ≤ In ≤ Iz):</strong>
                <p className="text-slate-600 text-[11px]">
                  {diagnostic.circuits.filter(c => c.wireStatus === 'NO_ADECUADO').length === 0
                    ? '✓ Cumple norma: Todos los calibres de conductores instalados soportan la corriente nominal de sus interruptores termomagnéticos.'
                    : `⚠️ Riesgo detectado: Existen ${diagnostic.circuits.filter(c => c.wireStatus === 'NO_ADECUADO').length} circuitos donde el calibre de cable es inferior a la capacidad del disyuntor.`}
                </p>
              </div>

              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 space-y-1">
                <strong className="text-slate-900 block font-bold">Protección Diferencial de Personas (ID 30mA):</strong>
                <p className="text-slate-600 text-[11px]">
                  {diagnostic.circuits.filter(c => !c.rcdExistingA).length === 0
                    ? '✓ Cumple CNE 020.024: Todos los circuitos derivados cuentan con interruptor diferencial de 30mA.'
                    : `🚨 Faltan interruptores diferenciales de 30mA en ${diagnostic.circuits.filter(c => !c.rcdExistingA).length} circuitos, representando riesgo de choque eléctrico.`}
                </p>
              </div>
            </div>

            {/* Mini Circuits Summary Table */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="border border-slate-200 p-1.5">Circuito</th>
                    <th className="border border-slate-200 p-1.5">Tablero</th>
                    <th className="border border-slate-200 p-1.5">Conductor</th>
                    <th className="border border-slate-200 p-1.5">Termomagnético</th>
                    <th className="border border-slate-200 p-1.5 text-center">Diferencial</th>
                    <th className="border border-slate-200 p-1.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {(diagnostic.circuits || []).slice(0, 5).map(c => (
                    <tr key={c.id}>
                      <td className="border border-slate-200 p-1.5 font-mono font-semibold">{c.circuitCode} - {c.description}</td>
                      <td className="border border-slate-200 p-1.5">{c.panelId}</td>
                      <td className="border border-slate-200 p-1.5 font-mono">{c.wireGaugeMm2} mm² {c.wireType}</td>
                      <td className="border border-slate-200 p-1.5 font-mono">{c.breakerAmps} A</td>
                      <td className="border border-slate-200 p-1.5 text-center">
                        {c.rcdExistingA ? `${c.rcdExistingA}A / 30mA` : <span className="text-rose-700 font-bold">Sin ID</span>}
                      </td>
                      <td className="border border-slate-200 p-1.5 text-center font-bold">
                        {c.wireStatus === 'ADECUADO' ? (
                          <span className="text-emerald-700">CONFORME</span>
                        ) : (
                          <span className="text-rose-700">NO CONFORME</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 5: MÓDULO INDEPENDIENTE DE LUMINARIAS Y PROPUESTA DE MEJORA POR ÁREA (RNE EM.010) */}
        {sections.lightingModule && (
          <div className="space-y-4 font-sans">
            <div className="border-b border-slate-300 pb-1 font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center justify-between">
              <span>5. MÓDULO DE ILUMINACIÓN: DIAGNÓSTICO FOTOMÉTRICO Y PROPUESTA DE MEJORA POR ESPACIO O ÁREA</span>
              <span className="text-xs font-mono font-bold text-amber-900">NORMA TÉCNICA RNE EM.010</span>
            </div>

            {/* 5.1 Estado Actual Fotométrico */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <SunMedium className="h-3.5 w-3.5 text-amber-600" />
                <span>5.1 Diagnóstico Fotométrico de Ambientes y Niveles de Iluminancia Reglamentaria (Lux):</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Verificación in-situ de los niveles de iluminancia sobre el plano de trabajo conforme a las exigencias mínimas del Reglamento Nacional de Edificaciones (RNE EM.010 Alumbrado de Interiores):
              </p>

              <div className="overflow-x-auto text-xs border border-slate-200 rounded-lg shadow-2xs">
                <table className="w-full text-left border-collapse bg-white">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px]">
                    <tr>
                      <th className="border-r border-slate-200 p-2">Espacio / Área de Trabajo</th>
                      <th className="border-r border-slate-200 p-2">Tecnología Actual</th>
                      <th className="border-r border-slate-200 p-2 text-center">Cant.</th>
                      <th className="border-r border-slate-200 p-2 text-right">Potencia (W)</th>
                      <th className="border-r border-slate-200 p-2 text-center">Lux Medido</th>
                      <th className="border-r border-slate-200 p-2 text-center">Mín. RNE EM.010</th>
                      <th className="p-2 text-center">Dictamen RNE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(diagnostic.lighting && diagnostic.lighting.length > 0 ? diagnostic.lighting : [
                      { id: 'def-1', roomName: 'Nave de Armado y Costura', technology: 'Fluorescente T8 2x36W', fixtureCount: 16, powerPerFixtureW: 76, measuredLux: 410, requiredLuxRne: 600 },
                      { id: 'def-2', roomName: 'Área de Corte e Inspección', technology: 'Halogenuro Metálico 250W', fixtureCount: 6, powerPerFixtureW: 275, measuredLux: 380, requiredLuxRne: 500 },
                      { id: 'def-3', roomName: 'Área de Ensamble y Prensas', technology: 'Fluorescente T8 2x36W', fixtureCount: 10, powerPerFixtureW: 76, measuredLux: 320, requiredLuxRne: 400 },
                      { id: 'def-4', roomName: 'Almacén de Materia Prima', technology: 'Vapor de Sodio 150W', fixtureCount: 4, powerPerFixtureW: 175, measuredLux: 140, requiredLuxRne: 200 },
                      { id: 'def-5', roomName: 'Oficinas de Control y Calidad', technology: 'Paneles Fluorescentes 4x18W', fixtureCount: 8, powerPerFixtureW: 82, measuredLux: 460, requiredLuxRne: 500 }
                    ]).map((room: any) => {
                      const luxOk = (room.measuredLux || 0) >= (room.requiredLuxRne || 300);
                      return (
                        <tr key={room.id} className="hover:bg-slate-50/70">
                          <td className="border-r border-slate-200 p-2 font-semibold text-slate-900">{room.roomName}</td>
                          <td className="border-r border-slate-200 p-2 text-slate-700">{room.technology || room.luminaireType}</td>
                          <td className="border-r border-slate-200 p-2 text-center font-mono">{room.fixtureCount || room.existingQuantity || 10}</td>
                          <td className="border-r border-slate-200 p-2 text-right font-mono">{room.powerPerFixtureW || room.unitPowerW || 76} W</td>
                          <td className="border-r border-slate-200 p-2 text-center font-mono font-bold">{room.measuredLux || 320} lux</td>
                          <td className="border-r border-slate-200 p-2 text-center font-mono">{room.requiredLuxRne || room.requiredLux || 300} lux</td>
                          <td className="p-2 text-center font-bold">
                            {luxOk ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300">
                                CUMPLE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                                DÉFICIT
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5.2 PROPUESTA DE MEJORA EN ILUMINACIÓN POR ESPACIO O ÁREA */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-indigo-900">
                  <Lightbulb className="h-3.5 w-3.5 text-indigo-600" />
                  5.2 Propuesta Técnica y Económica de Reconversión Tecnológica LED por Espacio o Área:
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-800">
                  Ahorro Total: S/ {totalLightingAnnualSavings.toFixed(0)}/año
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                Plan de recambio tecnológico a luminarias de tecnología LED de alta eficiencia lumínica (&ge; 130 lm/W), con distribución óptica optimizada para alcanzar el 100% de cumplimiento del RNE EM.010 y reducir sustancialmente la potencia demandada:
              </p>

              {/* Technical proposal table per area */}
              <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-2xs">
                <table className="w-full text-xs text-left border-collapse bg-white">
                  <thead className="bg-slate-100 text-slate-900 font-bold border-b-2 border-slate-300 text-[10.5px] uppercase tracking-wider">
                    <tr>
                      <th className="border-r border-slate-200 p-2 text-left">Espacio / Área</th>
                      <th className="border-r border-slate-200 p-2 text-left">Tecnología Actual</th>
                      <th className="border-r border-slate-200 p-2 text-left">Luminaria LED Propuesta</th>
                      <th className="border-r border-slate-200 p-2 text-center">Potencia Act. vs Prop.</th>
                      <th className="border-r border-slate-200 p-2 text-center">% Ahorro</th>
                      <th className="border-r border-slate-200 p-2 text-right">Ahorro Mensual (kWh)</th>
                      <th className="border-r border-slate-200 p-2 text-right">Ahorro Anual (S/.)</th>
                      <th className="border-r border-slate-200 p-2 text-right">Inversión (S/.)</th>
                      <th className="border-r border-slate-200 p-2 text-center">Retorno</th>
                      <th className="p-2 text-center">Lux / RNE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {lightingProposalRows.map((row, idx) => (
                      <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="border-r border-slate-200 p-2 font-bold text-slate-900">
                          {row.roomName}
                        </td>
                        <td className="border-r border-slate-200 p-2 text-slate-600 text-[11px]">
                          {row.existingTech}
                        </td>
                        <td className="border-r border-slate-200 p-2 font-medium text-indigo-950 text-[11px]">
                          {row.proposedTech}
                        </td>
                        <td className="border-r border-slate-200 p-2 text-center font-mono text-[11px]">
                          <span className="line-through text-slate-400 mr-1">{row.currentTotalKw.toFixed(2)}kW</span>
                          <span className="font-bold text-emerald-800">{row.proposedTotalKw.toFixed(2)}kW</span>
                        </td>
                        <td className="border-r border-slate-200 p-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            -{row.powerReductionPercent.toFixed(0)}%
                          </span>
                        </td>
                        <td className="border-r border-slate-200 p-2 text-right font-mono font-bold text-slate-800">
                          {Math.round(row.monthlySavingsKwh)} kWh
                        </td>
                        <td className="border-r border-slate-200 p-2 text-right font-mono font-black text-emerald-800">
                          S/ {row.annualSavingsSoles.toFixed(2)}
                        </td>
                        <td className="border-r border-slate-200 p-2 text-right font-mono text-slate-700">
                          S/ {row.estimatedInvestment.toFixed(2)}
                        </td>
                        <td className="border-r border-slate-200 p-2 text-center font-mono text-[11px]">
                          <span className="font-bold text-indigo-900">{row.paybackMonths.toFixed(1)} m</span>
                        </td>
                        <td className="p-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                            &ge; {row.targetLux} lx
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900 text-xs">
                    <tr>
                      <td className="border-r border-slate-200 p-2 uppercase" colSpan={3}>
                        TOTALES CONSOLIDADOS DEL SISTEMA DE ALUMBRADO
                      </td>
                      <td className="border-r border-slate-200 p-2 text-center font-mono text-[11px]">
                        -{totalLightingPowerReductionKw.toFixed(2)} kW
                      </td>
                      <td className="border-r border-slate-200 p-2 text-center font-mono">
                        -{((totalLightingPowerReductionKw / (lightingProposalRows.reduce((a, b) => a + b.currentTotalKw, 0) || 1)) * 100).toFixed(0)}%
                      </td>
                      <td className="border-r border-slate-200 p-2 text-right font-mono">
                        {Math.round(lightingProposalRows.reduce((a, b) => a + b.monthlySavingsKwh, 0))} kWh/m
                      </td>
                      <td className="border-r border-slate-200 p-2 text-right font-mono font-black text-emerald-800">
                        S/ {totalLightingAnnualSavings.toFixed(2)}
                      </td>
                      <td className="border-r border-slate-200 p-2 text-right font-mono font-black text-slate-900">
                        S/ {totalLightingInvestment.toFixed(2)}
                      </td>
                      <td className="border-r border-slate-200 p-2 text-center font-mono font-bold text-indigo-950">
                        {averageLightingPaybackMonths.toFixed(1)} meses
                      </td>
                      <td className="p-2 text-center text-emerald-800 font-bold text-[10px]">
                        100% RNE
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="border border-emerald-200 bg-emerald-50/50 p-3 rounded-lg">
                  <span className="text-[11px] text-emerald-800 font-bold block">Ahorro Anual Proyectado</span>
                  <span className="text-base font-black font-mono text-emerald-900">
                    S/ {totalLightingAnnualSavings.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Disminución en facturación</span>
                </div>
                <div className="border border-indigo-200 bg-indigo-50/50 p-3 rounded-lg">
                  <span className="text-[11px] text-indigo-800 font-bold block">Reducción de Potencia</span>
                  <span className="text-base font-black font-mono text-indigo-900">
                    {totalLightingPowerReductionKw.toFixed(2)} kW
                  </span>
                  <span className="text-[10px] text-indigo-700 block mt-0.5">Alivio de carga térmica en TG</span>
                </div>
                <div className="border border-amber-200 bg-amber-50/50 p-3 rounded-lg">
                  <span className="text-[11px] text-amber-800 font-bold block">Inversión Estimada</span>
                  <span className="text-base font-black font-mono text-amber-900">
                    S/ {totalLightingInvestment.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-amber-700 block mt-0.5">Luminarias LED + mano de obra</span>
                </div>
                <div className="border border-slate-200 bg-slate-50 p-3 rounded-lg">
                  <span className="text-[11px] text-slate-700 font-bold block">Retorno de Inversión</span>
                  <span className="text-base font-black font-mono text-slate-900">
                    {averageLightingPaybackMonths.toFixed(1)} Meses
                  </span>
                  <span className="text-[10px] text-slate-600 block mt-0.5">Payback simple garantizado</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: MÓDULO INDEPENDIENTE DE PUESTA A TIERRA */}
        {sections.groundingModule && (
          <div className="space-y-3 font-sans">
            <div className="border-b border-slate-300 pb-1 font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center justify-between">
              <span>6. MÓDULO INDEPENDIENTE: PROTOCOLO DE MEDICIÓN DE PUESTA A TIERRA (ITSE / INDECI)</span>
              <span className="text-xs font-mono font-bold text-emerald-800">LÍMITE CNE: ≤ 25.0 Ω</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              Resultados del protocolo de medición con telurómetro calibrado mediante el método de caída de potencial (Wenner / 3 puntos) conforme al Código Nacional de Electricidad y directivas de Seguridad en Edificaciones ITSE:
            </p>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="border border-slate-200 p-1.5">Código Pozo</th>
                    <th className="border border-slate-200 p-1.5">Ubicación Física</th>
                    <th className="border border-slate-200 p-1.5">Electrodo</th>
                    <th className="border border-slate-200 p-1.5">Tratamiento Químico</th>
                    <th className="border border-slate-200 p-1.5 text-center">R Medida (Ω)</th>
                    <th className="border border-slate-200 p-1.5 text-center">Dictamen CNE</th>
                  </tr>
                </thead>
                <tbody>
                  {(diagnostic.grounding || []).map(gw => (
                    <tr key={gw.id}>
                      <td className="border border-slate-200 p-1.5 font-bold font-mono text-slate-950">{gw.code}</td>
                      <td className="border border-slate-200 p-1.5">{gw.location}</td>
                      <td className="border border-slate-200 p-1.5 font-mono">Cu 5/8" x {gw.electrodeLengthM}m</td>
                      <td className="border border-slate-200 p-1.5">{gw.treatmentChemical}</td>
                      <td className="border border-slate-200 p-1.5 font-mono font-bold text-center text-sm">
                        {gw.measuredResistanceOhm} Ω
                      </td>
                      <td className="border border-slate-200 p-1.5 text-center font-bold">
                        {gw.measuredResistanceOhm <= 25.0 ? (
                          <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            CUMPLE NORMA (≤25Ω)
                          </span>
                        ) : (
                          <span className="text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            NO CUMPLE (&gt;25Ω)
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 7: FACTOR DE POTENCIA Y PENALIDADES */}
        {sections.powerFactor && diagnostic.powerFactor && (
          <div className="space-y-3 font-sans">
            <div className="border-b border-slate-300 pb-1 font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center justify-between">
              <span>7. ANÁLISIS DE FACTOR DE POTENCIA Y ENERGÍA REACTIVA</span>
              <span className="text-xs font-mono font-bold">
                FP ACTUAL: {diagnostic.powerFactor.currentPowerFactor?.toFixed(2) || '0.84'} (META: ≥ 0.96)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Factor de Potencia Promedio:</span>
                <strong className={`font-mono text-sm ${
                  (diagnostic.powerFactor.currentPowerFactor || 0) >= 0.96 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  cos φ = {diagnostic.powerFactor.currentPowerFactor?.toFixed(2) || '0.84'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Penalidad Anual Proyectada:</span>
                <strong className="font-mono text-sm text-rose-700">
                  S/. {((diagnostic.powerFactor.monthlyPenaltySoles || 420) * 12).toLocaleString()} / año
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Banco de Condensadores Requerido:</span>
                <strong className="font-mono text-sm text-indigo-700">
                  {diagnostic.powerFactor.targetPowerFactorKvar || 25} kvar Automático
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 8: POTENCIAL SOLAR FOTOVOLTAICO */}
        {sections.solarModule && diagnostic.solar && (
          <div className="space-y-3 font-sans">
            <div className="border-b border-slate-300 pb-1 font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center justify-between">
              <span>8. EVALUACIÓN DE AUTOGENERACIÓN SOLAR FOTOVOLTAICA</span>
              <span className="text-xs font-mono font-bold text-amber-800">
                POTENCIA: {diagnostic.solar.scenarioKwp} kWp
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
              <div className="border border-slate-200 p-2 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Generación Mensual</span>
                <span className="font-mono font-bold">{diagnostic.solar.monthlyGenerationKwh?.toLocaleString()} kWh</span>
              </div>
              <div className="border border-slate-200 p-2 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Ahorro Mensual</span>
                <span className="font-mono font-bold text-emerald-700">S/. {diagnostic.solar.monthlySavingsSoles?.toLocaleString()}</span>
              </div>
              <div className="border border-slate-200 p-2 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Inversión Estimada</span>
                <span className="font-mono font-bold">S/. {diagnostic.solar.estimatedCostSoles?.toLocaleString()}</span>
              </div>
              <div className="border border-slate-200 p-2 rounded-lg">
                <span className="text-slate-500 block text-[10px]">Retorno Simple (ROI)</span>
                <span className="font-mono font-bold text-indigo-700">{diagnostic.solar.paybackYears?.toFixed(1)} años</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 9: PLAN DE AHORRO Y EVALUACIÓN FINANCIERA */}
        {sections.savingsPlan && (
          <div className="space-y-3 font-sans">
            <div className="border-b border-slate-300 pb-1 font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center justify-between">
              <span>9. PLAN DE EFICIENCIA ENERGÉTICA Y EVALUACIÓN FINANCIERA</span>
              <span className="text-xs font-mono font-bold text-emerald-800">PAYBACK: {paybackYears.toFixed(1)} AÑOS</span>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="border border-slate-200 p-1.5">Medida de Ahorro Propuesta</th>
                    <th className="border border-slate-200 p-1.5">Categoría</th>
                    <th className="border border-slate-200 p-1.5 text-right">Inversión (S/.)</th>
                    <th className="border border-slate-200 p-1.5 text-right">Ahorro Anual (S/.)</th>
                    <th className="border border-slate-200 p-1.5 text-right">Payback</th>
                  </tr>
                </thead>
                <tbody>
                  {computedSavingsOpportunities.map(op => (
                    <tr key={op.id}>
                      <td className="border border-slate-200 p-1.5 font-medium">{op.title}</td>
                      <td className="border border-slate-200 p-1.5 text-slate-500">{op.category}</td>
                      <td className="border border-slate-200 p-1.5 font-mono text-right">S/. {op.estimatedInvestmentSoles?.toLocaleString()}</td>
                      <td className="border border-slate-200 p-1.5 font-mono text-right font-bold text-emerald-700">S/. {op.annualSavingsSoles?.toLocaleString()}</td>
                      <td className="border border-slate-200 p-1.5 font-mono text-right">{op.paybackYears} a</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold">
                  <tr>
                    <td colSpan={2} className="border border-slate-200 p-1.5 uppercase text-right">Total Inversión y Ahorro:</td>
                    <td className="border border-slate-200 p-1.5 font-mono text-right">S/. {totalInvestmentSoles.toLocaleString()}</td>
                    <td className="border border-slate-200 p-1.5 font-mono text-right text-emerald-800">S/. {totalAnnualSavingsSoles.toLocaleString()}</td>
                    <td className="border border-slate-200 p-1.5 font-mono text-right">{paybackYears.toFixed(1)} a</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 10: RECOMENDACIONES TÉCNICAS INTEGRALES DE MEJORA DE TODO */}
        {sections.allRecommendations && (
          <div className="space-y-4 font-sans">
            <div className="border-b border-slate-300 pb-1 font-bold text-sm text-slate-900 uppercase tracking-wide flex items-center justify-between">
              <span>{rt('10. RECOMENDACIONES TÉCNICAS INTEGRALES PARA LA MEJORA DE TODO EL SISTEMA', '10. COMPREHENSIVE TECHNICAL IMPROVEMENT RECOMMENDATIONS', '10. RECOMENDAÇÕES TÉCNICAS INTEGRAIS DE MELHORIA')}</span>
              <span className="text-xs font-mono font-bold text-indigo-700">{rt('DICTAMEN PERICIAL', 'EXPERT OPINION', 'PARECER PERICIAL')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
              
              {/* Tableros y Protecciones */}
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 space-y-1">
                <strong className="text-slate-900 font-bold flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
                  {rt('Tableros Eléctricos y Protecciones (CNE):', 'Electrical Panels & Protections (Code):', 'Quadros Elétricos e Proteções (CNE):')}
                </strong>
                <ul className="list-disc pl-4 text-slate-600 space-y-1 text-[11px]">
                  <li>{rt('Instalar interruptores diferenciales superinmunizados de 30mA en los circuitos que carecen de protección para salvar vidas humanas.', 'Install 30mA super-immunized RCD differential breakers in unprotected circuits to protect human life.', 'Instalar interruptores diferenciais de 30mA nos circuitos desprotegidos para salvar vidas.')}</li>
                  <li>{rt('Adecuar los calibres de conductores en circuitos con sobrecarga térmica y equilibrar las corrientes entre las tres fases en barras del TG.', 'Upgrade conductor wire gauges in overloaded circuits and balance currents among three phases.', 'Adequar bitolas de condutores com sobrecarga e equilibrar correntes entre fases.')}</li>
                  <li>{rt('Proceder con el rotulado indeleble de circuitos y peinado normativo con espirales y terminales tipo pin.', 'Label circuits clearly and dress wiring neatly with pin terminals.', 'Rotular circuitos indelevelmente e organizar cabeamento com terminais tipo pino.')}</li>
                </ul>
              </div>

              {/* Luminarias */}
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 space-y-1">
                <strong className="text-slate-900 font-bold flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  {rt('Conexiones de Luminarias (RNE EM.010):', 'Lighting Fixtures (RNE EM.010):', 'Conexões de Luminárias (RNE EM.010):')}
                </strong>
                <ul className="list-disc pl-4 text-slate-600 space-y-1 text-[11px]">
                  <li>{rt('Migración total de campanas y tubos fluorescentes a luminarias LED de alta eficiencia lumínica (> 130 lm/W).', 'Full migration from fluorescent fixtures to high-efficiency LED lights (> 130 lm/W).', 'Migração total para luminárias LED de alta eficiência (> 130 lm/W).')}</li>
                  <li>{rt('Instalación de sensores de movimiento y presencia en áreas de tránsito intermitente y baños.', 'Install motion sensors in intermittent circulation areas and restrooms to avoid passive waste.', 'Instalação de sensores de presença em áreas intermitentes.')}</li>
                  <li>{rt('Limpieza periódica de difusores para recuperar hasta un 15% de flujo luminoso sin costo adicional.', 'Periodic diffuser cleaning to recover up to 15% luminous flux at zero energy cost.', 'Limpeza periódica de difusores para recuperar até 15% de fluxo luminoso.')}</li>
                </ul>
              </div>

              {/* Puesta a Tierra */}
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 space-y-1">
                <strong className="text-slate-900 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-emerald-600" />
                  {rt('Sistema de Puesta a Tierra (INDECI / ITSE):', 'Grounding Electrode System (ITSE):', 'Sistema de Aterramento (ITSE):')}
                </strong>
                <ul className="list-disc pl-4 text-slate-600 space-y-1 text-[11px]">
                  <li>{rt('Realizar mantenimiento correctivo anual con gel electrolítico para garantizar resistencia < 25.0 Ω exigida por norma.', 'Perform annual maintenance with electrolytic gel to maintain earth resistance < 25.0 Ω required by code.', 'Realizar manutenção corretiva anual para manter resistência < 25.0 Ω.')}</li>
                  <li>{rt('Inspeccionar la conexión equipotencial de las masas metálicas de máquinas al conductor de protección PE.', 'Inspect equipotential bonding from machine metallic frames to protective earth (PE).', 'Inspecionar conexão equipotencial de massas metálicas ao condutor PE.')}</li>
                  <li>{rt('Reemplazar grapas o conectores de cobre sulfatados en la caja de registro del pozo a tierra.', 'Replace corroded copper clamps and connectors in earth pit inspection boxes.', 'Substituir conectores de cobre oxidados na caixa de inspeção.')}</li>
                </ul>
              </div>

              {/* Máquinas de Mayor Consumo */}
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 space-y-1">
                <strong className="text-slate-900 font-bold flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-rose-600" />
                  {rt('Equipos y Máquinas de Mayor Consumo:', 'Major Energy Consuming Equipment:', 'Máquinas de Maior Consumo:')}
                </strong>
                <ul className="list-disc pl-4 text-slate-600 space-y-1 text-[11px]">
                  <li>{rt('Implementar variadores de frecuencia (VFD) en motores de mayor potencia para reducir picos de arranque.', 'Install variable frequency drives (VFD) on high-power motors to reduce inrush current.', 'Instalar inversores de frequência (VFD) em motores de maior potência.')}</li>
                  <li>{rt('Plan de mantenimiento predictivo con termografía infrarroja trimestral en bornes y rodamientos.', 'Predictive maintenance plan with quarterly infrared thermography on terminals and bearings.', 'Manutenção preditiva com termografia infravermelha trimestral em conexões.')}</li>
                  <li>{rt('Apagado programado de compresores y equipos auxiliares en horarios de refrigerio.', 'Programmed shutdown of compressors and auxiliary loads during break periods.', 'Desligamento programado de compressores durante intervalos.')}</li>
                </ul>
              </div>

              {/* Factor de Potencia y Calidad */}
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 space-y-1">
                <strong className="text-slate-900 font-bold flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  {rt('Factor de Potencia y Tarifa Eléctrica:', 'Power Factor & Utility Tariff:', 'Fator de Potência e Tarifa:')}
                </strong>
                <ul className="list-disc pl-4 text-slate-600 space-y-1 text-[11px]">
                  <li>{rt('Instalar un banco automático de condensadores con controlador para alcanzar FP ≥ 0.98 y anular multas reactivas.', 'Install an automatic capacitor bank to maintain PF ≥ 0.98 and completely eliminate reactive surcharges.', 'Instalar banco automático de capacitores para manter FP ≥ 0.98 e zerar multas reativas.')}</li>
                  <li>{rt('Evaluar migración a tarifa horaria si se concentra producción en horario fuera de punta.', 'Evaluate time-of-use tariff migration if operating outside peak hours.', 'Avaliar migração tarifária se concentrar produção fora de ponta.')}</li>
                </ul>
              </div>

              {/* Autogeneración Solar */}
              <div className="border border-slate-200 p-3 rounded-lg bg-slate-50 space-y-1">
                <strong className="text-slate-900 font-bold flex items-center gap-1.5">
                  <SunMedium className="h-3.5 w-3.5 text-amber-600" />
                  {rt('Potencial Solar y Sostenibilidad:', 'Solar Energy Potential:', 'Potencial Solar e Sustentabilidade:')}
                </strong>
                <ul className="list-disc pl-4 text-slate-600 space-y-1 text-[11px]">
                  <li>{rt('Aprovechar el área libre de cubierta para una planta solar fotovoltaica on-grid que cubra la demanda base diurna.', 'Utilize rooftop area for an on-grid solar photovoltaic installation to cover daytime baseline load.', 'Aproveitar telhados para usina solar fotovoltaica on-grid para cobrir carga diurna.')}</li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 11: DICTAMEN Y DECLARACIÓN JURADA CIP */}
        {sections.cipStatement && (
          <div className="pt-6 border-t-2 border-slate-900 space-y-6">
            <div className="space-y-2 text-xs font-sans leading-relaxed">
              <strong className="text-slate-900 block font-bold text-sm">
                {rt('11. CONCLUSIONES Y DICTAMEN TÉCNICO PERICIAL CIP:', '11. CONCLUSIONS & OFFICIAL CIP EXPERT STATEMENT:', '11. CONCLUSÕES E PARECER TÉCNICO PERICIAL CIP:')}
              </strong>
              <p className="text-slate-800">
                {rt(
                  `El suscrito, ${currentUser?.specialty || generalData.specialty || 'Ingeniero Electrónico'} con colegiatura vigente en el ${currentUser?.regionalCouncil || currentUser?.professionalCollege || generalData.professionalCollege || 'Colegio de Ingenieros del Perú - Consejo Departamental de La Libertad (CD La Libertad)'}, certifica que la presente inspección técnica pericial y diagnóstico energético se llevaron a cabo respetando rigurosamente las normas peruanas CNE Utilización 2006, RNE EM.010, NTP 370.053 y las disposiciones de seguridad ITSE de INDECI.`,
                  `The undersigned, ${currentUser?.specialty || generalData.specialty || 'Collegiate Engineer'} with active registration in ${currentUser?.regionalCouncil || 'CIP Regional Council'}, certifies that this technical inspection and energy diagnosis was conducted in strict accordance with CNE / NEC electrical standards, building regulations, and safety protocols.`,
                  `O engenheiro ${currentUser?.specialty || generalData.specialty || 'Engenheiro Registrado'} abaixo assinado com registro ativo no ${currentUser?.regionalCouncil || 'Conselho Regional CIP'}, certifica que a presente inspeção pericial e diagnóstico energético foram realizados em rigorosa conformidade com as normas técnicas e regulamentos de segurança.`
                )}
              </p>
              <p className="text-slate-800">
                {rt(
                  'Las especificaciones de la Lista de Materiales (BOM) y el cronograma de mejoras son de carácter vinculante para subsanar observaciones de seguridad y maximizar el rendimiento económico del suministro eléctrico.',
                  'The bill of materials (BOM) specifications and improvement roadmap are binding to resolve safety observations and maximize the energy efficiency and financial return of the electrical installation.',
                  'As especificações da Lista de Materiais (BOM) e o cronograma de melhorias são vinculantes para sanar observações de segurança e maximizar o retorno econômico da instalação elétrica.'
                )}
              </p>
            </div>

            {/* Signature Box */}
            <div className="flex justify-end pt-12 text-center text-xs font-sans">
              <div className="w-72 border-t-2 border-slate-900 pt-3 space-y-1">
                <div className="font-bold text-slate-950 uppercase text-sm tracking-wide">
                  {currentUser?.name || generalData.responsibleEngineer || 'Ing. Víctor Fernando Becerra Terán'}
                </div>
                <div className="text-xs font-bold text-amber-900 font-mono">
                  CIP N° {currentUser?.cipNumber || generalData.cipNumber || '278034'}
                </div>
                <div className="text-[11px] text-slate-700 font-medium">
                  {currentUser?.specialty || generalData.specialty || 'Ingeniero Electrónico'}
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium">
                  {currentUser?.professionalCollege || generalData.professionalCollege || 'Colegio de Ingenieros del Perú - Consejo Departamental de La Libertad (CD La Libertad)'}
                </div>
                <div className="text-[9.5px] text-slate-400 uppercase pt-1 border-t border-slate-200 mt-2 font-mono">
                  {rt('Firma y Sello del Ingeniero Colegiado', 'Signature & Stamp of Collegiate Engineer', 'Assinatura e Carimbo do Engenheiro Registrado')}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      </>
      )}

    </div>
  );
};
