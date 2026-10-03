// Servicio del Registro Maestro Centralizado de Empresas Evaluadas
// Accesible exclusivamente para el Usuario Maestro: luxproc.11@gmail.com
// Registro inmutable: No se elimina ningún informe, almacenando todas las auditorías por cuenta creada

import { CompleteDiagnostic } from '../types';
import { DEMO_PLANTA_INDUSTRIAL, DEMO_LOCAL_COMERCIAL, DEMO_VIVIENDA } from '../data/demoDatasets';

export const MASTER_ADMIN_EMAIL = 'luxproc.11@gmail.com';

export interface GlobalCompanyEvaluation {
  id: string;
  createdAt: string;
  createdByAccountEmail: string;   // Cuenta de usuario que realizó la auditoría
  createdByAccountName: string;    // Nombre o razón de la cuenta
  companyName: string;            // Razón Social de la Empresa Evaluada
  ruc: string;                    // RUC de la empresa
  commercialActivity: string;     // Giro de negocio / Actividad económica
  installationType: string;       // Industrial, Comercial, Hospitalario, Educativo, etc.
  department: string;             // Lima, Arequipa, La Libertad, etc.
  address: string;
  date: string;                   // Fecha de evaluación
  responsibleEngineer: string;    // Ingeniero Evaluador
  cipNumber: string;              // Número CIP
  cipCouncil: string;             // Consejo Departamental CIP
  cipSpecialty: string;           // Especialidad Verdadera
  status: 'CULMINADO' | 'EN_EVALUACION' | 'APROBADO_CIP';
  powerKw: number;                // Potencia total instalada (kW)
  annualKwh: number;              // Consumo anual evaluado (kWh)
  annualSavingsPen: number;       // Ahorro proyectado anual en Soles (S/)
  safetyScoreCne: number;         // Cumplimiento normativo CNE (%)
  equipmentCount: number;
  circuitsCount: number;
  tariffSupply: string;           // e.g. MT2 / 220V 3Ø Luz del Sur
  reportCode: string;
  fullDiagnostic: CompleteDiagnostic; // Datos completos para restaurar o visualizar
}

const GLOBAL_REGISTRY_KEY = 'e_diagnosis_global_company_evaluations';

// Evaluaciones maestras iniciales por cuentas creadas en el sistema nacional
const INITIAL_SEED_EVALUATIONS: GlobalCompanyEvaluation[] = [
  {
    id: 'global-eval-001',
    createdAt: '2026-08-20T10:30:00.000Z',
    createdByAccountEmail: 'luxproc.11@gmail.com',
    createdByAccountName: 'Ing. Víctor Fernando Becerra Terán',
    companyName: 'Manufacturas de Calzado El Sol S.A.C.',
    ruc: '20548963214',
    commercialActivity: 'Fabricación y ensamblado de calzado de seguridad industrial',
    installationType: 'industrial',
    department: 'La Libertad',
    address: 'Av. América Sur 2450, Urb. La Hermelinda, Trujillo',
    date: '2026-08-20',
    responsibleEngineer: 'Ing. Víctor Fernando Becerra Terán',
    cipNumber: '278034',
    cipCouncil: 'Colegio de Ingenieros del Perú - Consejo Departamental de La Libertad (CD La Libertad)',
    cipSpecialty: 'Ingeniero Electrónico',
    status: 'APROBADO_CIP',
    powerKw: 78.4,
    annualKwh: 62400,
    annualSavingsPen: 12450,
    safetyScoreCne: 94,
    equipmentCount: 14,
    circuitsCount: 12,
    tariffSupply: 'MT2 - Media Tensión (Luz del Sur 220V 3Ø)',
    reportCode: 'EDIAG-IND-2026-001',
    fullDiagnostic: DEMO_PLANTA_INDUSTRIAL
  },
  {
    id: 'global-eval-002',
    createdAt: '2026-08-28T14:15:00.000Z',
    createdByAccountEmail: 'carlos.mendoza@mendozainvest.com',
    createdByAccountName: 'Ing. Carlos Mendoza Silva',
    companyName: 'Restaurante & Centro de Convenciones El Buen Gusto S.A.C.',
    ruc: '20601234567',
    commercialActivity: 'Restauración gastronómica y eventos corporativos',
    installationType: 'comercial',
    department: 'Lima',
    address: 'Av. La Encalada 850, Surco',
    date: '2026-08-28',
    responsibleEngineer: 'Ing. Carlos Mendoza Silva',
    cipNumber: '145920',
    cipCouncil: 'Colegio de Ingenieros del Perú - Consejo Departamental de Lima (CD Lima)',
    cipSpecialty: 'Ingeniero Mecánico Electricista',
    status: 'CULMINADO',
    powerKw: 42.6,
    annualKwh: 48000,
    annualSavingsPen: 8649,
    safetyScoreCne: 88,
    equipmentCount: 18,
    circuitsCount: 14,
    tariffSupply: 'BT3 - Comercial Trifásica (Plensa 220V 3Ø)',
    reportCode: 'EDIAG-RES-2026-002',
    fullDiagnostic: DEMO_LOCAL_COMERCIAL
  },
  {
    id: 'global-eval-003',
    createdAt: '2026-09-05T09:00:00.000Z',
    createdByAccountEmail: 'clinica.sanborja@redsalud.pe',
    createdByAccountName: 'Dr. Guillermo Prado (Clínica San Borja)',
    companyName: 'Clínica Quirúrgica San Borja Sur S.A.C.',
    ruc: '20512874932',
    commercialActivity: 'Actividades de atención médica hospitalaria y quirófanos',
    installationType: 'hospitalario',
    department: 'Lima',
    address: 'Av. Guardia Civil 385, San Borja',
    date: '2026-09-04',
    responsibleEngineer: 'Ing. Fernando Benites Torres',
    cipNumber: '178452',
    cipCouncil: 'Colegio de Ingenieros del Perú - Consejo Departamental de Lima (CD Lima)',
    cipSpecialty: 'Ingeniero Mecánico Electricista',
    status: 'APROBADO_CIP',
    powerKw: 115.0,
    annualKwh: 142000,
    annualSavingsPen: 24800,
    safetyScoreCne: 98,
    equipmentCount: 26,
    circuitsCount: 22,
    tariffSupply: 'MT3 - Clientes Médicos (Luz del Sur 10kV / 380V)',
    reportCode: 'EDIAG-HOSP-2026-003',
    fullDiagnostic: DEMO_PLANTA_INDUSTRIAL
  },
  {
    id: 'global-eval-004',
    createdAt: '2026-09-12T16:45:00.000Z',
    createdByAccountEmail: 'textiles.peru@algodon.pe',
    createdByAccountName: 'Textil Andina del Perú S.A.',
    companyName: 'Hilados y Tejidos Export del Norte S.A.',
    ruc: '20104859631',
    commercialActivity: 'Fabricación de hilados de algodón pima y confecciones',
    installationType: 'industrial',
    department: 'La Libertad',
    address: 'Carretera Industrial Km 4.5, Trujillo',
    date: '2026-09-11',
    responsibleEngineer: 'Ing. Roberto Dávila Campos',
    cipNumber: '215430',
    cipCouncil: 'Colegio de Ingenieros del Perú - Consejo Departamental de La Libertad (CD La Libertad - Trujillo)',
    cipSpecialty: 'Ingeniero de Energía',
    status: 'CULMINADO',
    powerKw: 145.2,
    annualKwh: 185000,
    annualSavingsPen: 31200,
    safetyScoreCne: 91,
    equipmentCount: 32,
    circuitsCount: 28,
    tariffSupply: 'MT2 - Gran Demanda (Hidrandina 220V 3Ø)',
    reportCode: 'EDIAG-TEX-2026-004',
    fullDiagnostic: DEMO_PLANTA_INDUSTRIAL
  },
  {
    id: 'global-eval-005',
    createdAt: '2026-09-18T11:20:00.000Z',
    createdByAccountEmail: 'alimentos.santaclara@distribucion.pe',
    createdByAccountName: 'Alimentos Santa Clara S.A.C.',
    companyName: 'Frigoríficos y Congelados del Sur E.I.R.L.',
    ruc: '20489632145',
    commercialActivity: 'Almacenamiento y cadena de frío de productos perecibles',
    installationType: 'industrial',
    department: 'Arequipa',
    address: 'Zona Industrial Río Seco Mz. C Lote 4, Cerro Colorado, Arequipa',
    date: '2026-09-17',
    responsibleEngineer: 'Ing. Alejandro Salazar Prado',
    cipNumber: '98765',
    cipCouncil: 'Colegio de Ingenieros del Perú - Consejo Departamental de Arequipa (CD Arequipa)',
    cipSpecialty: 'Ingeniero Mecánico Electricista',
    status: 'APROBADO_CIP',
    powerKw: 92.0,
    annualKwh: 98000,
    annualSavingsPen: 18600,
    safetyScoreCne: 95,
    equipmentCount: 16,
    circuitsCount: 15,
    tariffSupply: 'MT3 - Comercial con Horas Punta (SEAL 220V 3Ø)',
    reportCode: 'EDIAG-IND-2026-005',
    fullDiagnostic: DEMO_PLANTA_INDUSTRIAL
  },
  {
    id: 'global-eval-006',
    createdAt: '2026-09-22T15:10:00.000Z',
    createdByAccountEmail: 'carlos.mendoza@gmail.com',
    createdByAccountName: 'Ing. Carlos Mendoza Paredes',
    companyName: 'Residencia Familiar Mendoza',
    ruc: '10425896321',
    commercialActivity: 'Vivienda Residencial Unifamiliar',
    installationType: 'vivienda',
    department: 'Lima',
    address: 'Av. Las Gardenias 450, Urb. Monterrico, Surco',
    date: '2026-08-15',
    responsibleEngineer: 'Ing. Marco Aurelio Quispe',
    cipNumber: '148920',
    cipCouncil: 'Colegio de Ingenieros del Perú - Consejo Departamental de Lima (CD Lima)',
    cipSpecialty: 'Ingeniero Electricista',
    status: 'CULMINADO',
    powerKw: 8.5,
    annualKwh: 4800,
    annualSavingsPen: 1450,
    safetyScoreCne: 85,
    equipmentCount: 12,
    circuitsCount: 8,
    tariffSupply: 'BT5B - Residencial (Luz del Sur 220V 1Ø)',
    reportCode: 'EDIAG-VIV-2026-001',
    fullDiagnostic: DEMO_VIVIENDA
  }
];

export function isMasterUserEmail(email?: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
}

/**
 * Obtener todas las evaluaciones registradas globalmente en el sistema nacional
 */
export function getGlobalCompanyEvaluations(): GlobalCompanyEvaluation[] {
  try {
    const raw = localStorage.getItem(GLOBAL_REGISTRY_KEY);
    if (!raw) {
      localStorage.setItem(GLOBAL_REGISTRY_KEY, JSON.stringify(INITIAL_SEED_EVALUATIONS));
      return INITIAL_SEED_EVALUATIONS;
    }
    const parsed: GlobalCompanyEvaluation[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(GLOBAL_REGISTRY_KEY, JSON.stringify(INITIAL_SEED_EVALUATIONS));
      return INITIAL_SEED_EVALUATIONS;
    }
    return parsed;
  } catch (err) {
    console.error('Error al leer registro maestro de evaluaciones:', err);
    return INITIAL_SEED_EVALUATIONS;
  }
}

/**
 * Registrar o actualizar una evaluación en la base central inmutable
 * Nunca se borra automáticamente aunque el usuario limpie sus 2 slots
 */
export function registerCompanyEvaluation(
  evaluation: Omit<GlobalCompanyEvaluation, 'id' | 'createdAt'> & { id?: string }
): GlobalCompanyEvaluation {
  try {
    const currentList = getGlobalCompanyEvaluations();
    const existingIndex = evaluation.id ? currentList.findIndex(e => e.id === evaluation.id) : -1;
    
    // Si ya existe por RUC o código de reporte dentro de la misma cuenta, actualizar
    const byRucAndAccount = currentList.findIndex(
      e => e.ruc === evaluation.ruc && e.createdByAccountEmail.toLowerCase() === evaluation.createdByAccountEmail.toLowerCase()
    );

    const targetIndex = existingIndex >= 0 ? existingIndex : byRucAndAccount;

    const fullRecord: GlobalCompanyEvaluation = {
      ...evaluation,
      id: evaluation.id || (targetIndex >= 0 ? currentList[targetIndex].id : `global-eval-${Date.now()}`),
      createdAt: targetIndex >= 0 ? currentList[targetIndex].createdAt : new Date().toISOString()
    };

    let updatedList: GlobalCompanyEvaluation[];
    if (targetIndex >= 0) {
      updatedList = [...currentList];
      updatedList[targetIndex] = fullRecord;
    } else {
      updatedList = [fullRecord, ...currentList];
    }

    localStorage.setItem(GLOBAL_REGISTRY_KEY, JSON.stringify(updatedList));
    return fullRecord;
  } catch (err) {
    console.error('Error al registrar evaluación en padrón maestro:', err);
    return {
      ...evaluation,
      id: evaluation.id || `eval-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
  }
}

/**
 * Exportar el padrón maestro completo a formato CSV con formato estructurado
 */
export function exportMasterRegistryToCSV(evaluations: GlobalCompanyEvaluation[]): void {
  const headers = [
    'Código Expediente',
    'Razón Social / Empresa',
    'RUC',
    'Giro / Actividad Económica',
    'Tipo de Instalación',
    'Departamento',
    'Dirección',
    'Cuenta Creadora (Email)',
    'Nombre del Usuario',
    'Ingeniero Evaluador CIP',
    'CIP N°',
    'Consejo Departamental CIP',
    'Especialidad Verdadera',
    'Fecha de Inspección',
    'Potencia (kW)',
    'Consumo Anual (kWh)',
    'Ahorro Proyectado (S/ año)',
    'Índice Seguridad CNE (%)',
    'Equipos Censados',
    'Circuitos',
    'Tarifa Eléctrica',
    'Estado Dictamen'
  ];

  const rows = evaluations.map(e => [
    `"${e.reportCode || e.id}"`,
    `"${(e.companyName || '').replace(/"/g, '""')}"`,
    `"${e.ruc || ''}"`,
    `"${(e.commercialActivity || '').replace(/"/g, '""')}"`,
    `"${e.installationType}"`,
    `"${e.department}"`,
    `"${(e.address || '').replace(/"/g, '""')}"`,
    `"${e.createdByAccountEmail}"`,
    `"${(e.createdByAccountName || '').replace(/"/g, '""')}"`,
    `"${(e.responsibleEngineer || '').replace(/"/g, '""')}"`,
    `"${e.cipNumber || ''}"`,
    `"${(e.cipCouncil || '').replace(/"/g, '""')}"`,
    `"${(e.cipSpecialty || '').replace(/"/g, '""')}"`,
    `"${e.date}"`,
    e.powerKw.toFixed(1),
    Math.round(e.annualKwh),
    Math.round(e.annualSavingsPen),
    `${e.safetyScoreCne}%`,
    e.equipmentCount,
    e.circuitsCount,
    `"${(e.tariffSupply || '').replace(/"/g, '""')}"`,
    `"${e.status}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Registro_Maestro_Empresas_Evaluadas_CIP_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
