// Central Diagnostic State & Real-Time Engineering Calculation Context
import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { 
  CompleteDiagnostic, 
  GeneralData, 
  TariffConfig, 
  ReceiptRecord, 
  EquipmentRecord, 
  CircuitRecord, 
  ElectricalPanel, 
  GroundingSystem, 
  LightingRecord, 
  SavingsOpportunityRecord, 
  PhotoEvidenceRecord,
  BillOfMaterialsItem,
  PowerFactorAnalysis,
  SolarPVConfig,
  InstallationType
} from '../types';
import { 
  DEMO_PLANTA_INDUSTRIAL,
  DEMO_EMPRESA_CALZADO, 
  DEMO_VIVIENDA,
  DEMO_LOCAL_COMERCIAL 
} from '../data/demoDatasets';
import { calculateEquipmentConsumption, calculateTotalConsumption, TotalConsumptionResult } from '../engine/calculosConsumo';
import { calculateDemandBalance, DemandBalanceResult } from '../engine/calculosDemanda';
import { calculateConductorAmpacity } from '../engine/calculosConductores';
import { calculateVoltageDrop } from '../engine/calculosCaidaTension';
import { evaluateBreaker } from '../engine/calculosProtecciones';
import { evaluateRcd } from '../engine/calculosDiferenciales';
import { calculateGroundingResistance } from '../engine/calculosPuestaTierra';
import { calculateLighting } from '../engine/calculosIluminacion';
import { calculatePowerFactor } from '../engine/calculosFactorPotencia';
import { calculateSolarPV } from '../engine/calculosSolar';
import { analyzeReceiptsHistory, compareReceiptVsCalculated, ReceiptsStatistics, ReceiptVsCalculatedComparison } from '../engine/calculosReciboVsCalculado';
import { calculateSafetyIndex, calculateEfficiencyIndex, IndexEvaluationResult } from '../engine/indicesGlobales';
import { generateSavingsOpportunities } from '../engine/calculosAhorro';
import { generateBillOfMaterials } from '../engine/calculosBOM';
import { logOut as firebaseLogOut } from '../components/auth/firebase';

export interface UserSession {
  name: string;
  email: string;
  role: 'INGENIERO_CIP' | 'AUDITOR_ENERGETICO' | 'CLIENTE';
  cipNumber?: string;
  specialty?: string;
  professionalCollege?: string;
  avatarUrl?: string;
  verifiedByGoogle: boolean;
  loginAt: string;
  grantedPermissions?: string[];
}

interface DiagnosticContextType {
  currentUser: UserSession | null;
  setCurrentUser: (user: UserSession | null) => void;
  updateUserProfile: (data: Partial<UserSession>) => void;
  logout: () => void;
  diagnostic: CompleteDiagnostic;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeScenario: 'ACTUAL' | 'PROPUESTO';
  setActiveScenario: (scenario: 'ACTUAL' | 'PROPUESTO') => void;
  
  // Computed Engine Results
  computedEquipment: EquipmentRecord[];
  equipmentSummary: TotalConsumptionResult;
  demandBalance: DemandBalanceResult;
  receiptsStats: ReceiptsStatistics;
  receiptComparison: ReceiptVsCalculatedComparison;
  safetyEvaluation: IndexEvaluationResult;
  efficiencyEvaluation: IndexEvaluationResult;
  computedSavingsOpportunities: SavingsOpportunityRecord[];
  computedBom: BillOfMaterialsItem[];

  // Mutations
  updateGeneralData: (data: Partial<GeneralData>) => void;
  updateTariff: (tariff: Partial<TariffConfig>) => void;
  
  addEquipment: (item: Omit<EquipmentRecord, 'id' | 'code'>) => void;
  updateEquipment: (id: string, item: Partial<EquipmentRecord>) => void;
  deleteEquipment: (id: string) => void;

  addCircuit: (circuit: Omit<CircuitRecord, 'id'>) => void;
  updateCircuit: (id: string, circuit: Partial<CircuitRecord>) => void;
  deleteCircuit: (id: string) => void;

  addPanel: (panel: Omit<ElectricalPanel, 'id'>) => void;
  updatePanel: (id: string, panel: Partial<ElectricalPanel>) => void;
  deletePanel: (id: string) => void;

  addLightingRoom: (light: Omit<LightingRecord, 'id'>) => void;
  updateLightingRoom: (id: string, light: Partial<LightingRecord>) => void;
  deleteLightingRoom: (id: string) => void;

  addGrounding: (gnd: Omit<GroundingSystem, 'id'>) => void;
  updateGrounding: (id: string, gnd: Partial<GroundingSystem>) => void;
  deleteGrounding: (id: string) => void;

  addReceipt: (receipt: Omit<ReceiptRecord, 'id'>) => void;
  updateReceipt: (id: string, receipt: Partial<ReceiptRecord>) => void;
  deleteReceipt: (id: string) => void;

  addPhoto: (photo: Omit<PhotoEvidenceRecord, 'id'>) => void;
  deletePhoto: (id: string) => void;

  updatePowerFactor: (pf: Partial<PowerFactorAnalysis>) => void;
  updateSolar: (solar: Partial<SolarPVConfig>) => void;

  addOpportunity: (opp: Omit<SavingsOpportunityRecord, 'id'>) => void;
  updateOpportunity: (id: string, opp: Partial<SavingsOpportunityRecord>) => void;
  deleteOpportunity: (id: string) => void;
  toggleOpportunityStatus: (id: string) => void;

  // Presets & Demos
  loadDemoVivienda: () => void;
  loadDemoPlantaIndustrial: () => void;
  loadDemoComercio: () => void;
  loadDemoCalzado: () => void;
  createNewDiagnostic: (type: InstallationType) => void;
  clearActiveWorkspace: () => void;
  importJson: (jsonString: string) => boolean;
  exportJson: () => string;
  showNewProjectModal: boolean;
  setShowNewProjectModal: (show: boolean) => void;

  // Trabajos Realizados (Máx 2 proyectos guardados)
  savedProjects: SavedProjectItem[];
  saveCurrentProject: (customName?: string) => { success: boolean; message: string };
  loadSavedProject: (projectId: string) => boolean;
  deleteSavedProject: (projectId: string) => boolean;

  // Planes de Suscripción (Estándar S/ 30 vs Premium S/ 60)
  subscriptionPlan: 'ESTANDAR' | 'PREMIUM';
  setSubscriptionPlan: (plan: 'ESTANDAR' | 'PREMIUM') => void;
  isSubscriptionModalOpen: boolean;
  setIsSubscriptionModalOpen: (open: boolean) => void;
  isModulePremium: (tabId: string) => boolean;
}

export interface SavedProjectItem {
  id: string;
  name: string;
  installationType: InstallationType;
  savedAt: string;
  clientName: string;
  responsibleEngineer: string;
  cipNumber?: string;
  diagnostic: CompleteDiagnostic;
  summary: {
    totalPowerKw: number;
    monthlyKwh: number;
    monthlyCostSoles: number;
    safetyScore: number;
    efficiencyScore: number;
    equipmentCount: number;
    circuitsCount: number;
  };
}

export function createBlankDiagnostic(engineerName: string = 'Ing. Fernando Benites Torres', cipNumber: string = '178452'): CompleteDiagnostic {
  const currentYear = new Date().getFullYear();
  const dateStr = new Date().toISOString().split('T')[0];

  return {
    id: `diag-blank-${Date.now()}`,
    generalData: {
      diagnosticCode: `EDIAG-${currentYear}-001`,
      date: dateStr,
      clientName: '',
      companyName: '',
      ruc: '',
      responsibleEngineer: engineerName,
      cipNumber: cipNumber,
      specialty: 'Ingeniero Mecánico Electricista',
      professionalCollege: 'Colegio de Ingenieros del Perú (CIP)',
      address: '',
      city: 'Lima',
      department: 'Lima',
      province: 'Lima',
      district: 'Lima',
      phone: '',
      email: '',
      installationType: 'comercio',
      economicActivity: 'Comercial / Servicios',
      workerCount: 5,
      workSchedule: 'Lunes a Viernes 08:00 - 18:00',
      shiftsCount: 1,
      workDaysPerWeek: 5,
      totalAreaM2: 120,
      builtAreaM2: 100,
      observations: ''
    },
    tariff: {
      distributor: 'Luz del Sur',
      tariffCode: 'BT5B',
      supplyVoltage: '220',
      phases: 'MONOFASICO',
      activeEnergyPriceKwh: 0.75,
      reactiveEnergyPenaltyPriceKvarh: 0.145,
      fixedMonthlyChargeSoles: 5.50,
      igvRatePercent: 18
    },
    receipts: [],
    equipment: [],
    lighting: [],
    panels: [],
    circuits: [],
    grounding: [],
    powerFactor: {
      currentPowerFactor: 0.90,
      targetPowerFactor: 0.98,
      requiredCapacitorKvar: 0,
      monthlyPenaltyAvoidedSoles: 0,
      estimatedInvestmentSoles: 0,
      paybackMonths: 0
    },
    solar: {
      scenarioKwp: 3.0,
      dailyHsp: 5.0,
      panelCount: 6,
      panelPowerW: 550,
      monthlyGenerationKwh: 380,
      annualGenerationKwh: 4560,
      paybackYears: 3.8,
      co2AvoidedTonsPerYear: 1.8
    },
    opportunities: [],
    photos: [],
    normativeParameters: [],
    activeScenario: 'ACTUAL',
    scenarios: {
      actual: {
        name: 'Situación Actual',
        monthlyKwh: 0,
        monthlyCostSoles: 0,
        installedPowerKw: 0,
        maxDemandKw: 0,
        powerFactor: 0.90,
        safetyScore: 60,
        efficiencyScore: 60,
        annualSavingsSoles: 0
      },
      proposed: {
        name: 'Propuesta de Mejora',
        monthlyKwh: 0,
        monthlyCostSoles: 0,
        installedPowerKw: 0,
        maxDemandKw: 0,
        powerFactor: 0.98,
        safetyScore: 95,
        efficiencyScore: 92,
        annualSavingsSoles: 0
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

const DiagnosticContext = createContext<DiagnosticContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'e_diagnosis_current_project_v1';

function normalizeDiagnostic(raw: any): CompleteDiagnostic {
  if (!raw || typeof raw !== 'object') return DEMO_PLANTA_INDUSTRIAL;
  return {
    ...DEMO_PLANTA_INDUSTRIAL,
    ...raw,
    generalData: { ...DEMO_PLANTA_INDUSTRIAL.generalData, ...(raw.generalData || {}) },
    tariff: { ...DEMO_PLANTA_INDUSTRIAL.tariff, ...(raw.tariff || {}) },
    equipment: Array.isArray(raw.equipment) ? raw.equipment : [],
    circuits: Array.isArray(raw.circuits) ? raw.circuits : [],
    panels: Array.isArray(raw.panels) ? raw.panels : [],
    lighting: Array.isArray(raw.lighting) ? raw.lighting : [],
    grounding: Array.isArray(raw.grounding) ? raw.grounding : [],
    receipts: Array.isArray(raw.receipts) ? raw.receipts : [],
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    opportunities: Array.isArray(raw.opportunities) ? raw.opportunities : [],
    powerFactor: { ...DEMO_PLANTA_INDUSTRIAL.powerFactor, ...(raw.powerFactor || {}) },
    solar: raw.solar ? { ...DEMO_PLANTA_INDUSTRIAL.solar, ...raw.solar } : undefined
  };
}

export const DiagnosticProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('e_diagnosis_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.email) {
          return parsed as UserSession;
        }
      }
    } catch {
      return null;
    }
    return null;
  });

  const logout = () => {
    try {
      localStorage.removeItem('e_diagnosis_user_session');
      firebaseLogOut().catch(() => {});
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
  };

  const updateUserProfile = (data: Partial<UserSession>) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem('e_diagnosis_user_session', JSON.stringify(updated));
      } catch (e) {
        console.error('Error al persistir perfil actualizado:', e);
      }
      return updated;
    });

    // Sincronizar simultáneamente con los datos generales del proyecto pericial
    setDiagnostic(prev => ({
      ...prev,
      generalData: {
        ...prev.generalData,
        ...(data.cipNumber !== undefined ? { cipNumber: data.cipNumber } : {}),
        ...(data.name !== undefined ? { responsibleEngineer: data.name } : {}),
        ...(data.specialty !== undefined ? { specialty: data.specialty } : {}),
        ...(data.professionalCollege !== undefined ? { professionalCollege: data.professionalCollege } : {})
      }
    }));
  };

  // Persistir sesión de usuario automáticamente
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('e_diagnosis_user_session', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('e_diagnosis_user_session');
      }
    } catch (e) {
      console.error('Error al guardar sesión de usuario:', e);
    }
  }, [currentUser]);

  const [diagnostic, setDiagnostic] = useState<CompleteDiagnostic>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return normalizeDiagnostic(JSON.parse(saved));
      }
    } catch {
      // Fallback
    }
    return DEMO_PLANTA_INDUSTRIAL;
  });

  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');
  const [activeScenario, setActiveScenario] = useState<'ACTUAL' | 'PROPUESTO'>('ACTUAL');
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(diagnostic));
    } catch (e) {
      console.error('Failed to save diagnostic in localStorage', e);
    }
  }, [diagnostic]);

  // 1. Compute Equipment with Individual Consumptions
  const computedEquipment = useMemo(() => {
    return (diagnostic.equipment || []).map(eq => {
      const single = calculateEquipmentConsumption(eq, diagnostic.tariff);
      return {
        ...eq,
        monthlyKwh: single.monthlyKwh,
        monthlyCostSoles: single.monthlyCostSoles
      };
    });
  }, [diagnostic.equipment, diagnostic.tariff]);

  // 2. Aggregate Total Consumption
  const equipmentSummary = useMemo(() => {
    return calculateTotalConsumption(diagnostic.equipment || [], diagnostic.tariff);
  }, [diagnostic.equipment, diagnostic.tariff]);

  // 3. Demand Balance
  const demandBalance = useMemo(() => {
    const panels = diagnostic.panels || [];
    const lighting = diagnostic.lighting || [];
    const contractedKw = diagnostic.tariff?.contractedDemandPriceKw;
    return calculateDemandBalance(diagnostic.equipment || [], lighting, panels, contractedKw);
  }, [diagnostic.equipment, diagnostic.lighting, diagnostic.panels, diagnostic.tariff]);

  // 4. Receipts Statistics & Comparison
  const receiptsStats = useMemo(() => {
    return analyzeReceiptsHistory(diagnostic.receipts || []);
  }, [diagnostic.receipts]);

  const receiptComparison = useMemo(() => {
    return compareReceiptVsCalculated(
      receiptsStats,
      equipmentSummary.totalMonthlyKwh,
      equipmentSummary.totalMonthlyCostSoles
    );
  }, [receiptsStats, equipmentSummary]);

  // 5. Safety Index Evaluation
  const safetyEvaluation = useMemo(() => {
    return calculateSafetyIndex(diagnostic.circuits || [], diagnostic.grounding || []);
  }, [diagnostic.circuits, diagnostic.grounding]);

  // 6. Efficiency Index Evaluation
  const efficiencyEvaluation = useMemo(() => {
    const hasSolarOrVfd = (diagnostic.solar?.scenarioKwp || 0) > 0 || (diagnostic.equipment || []).some(e => (e.name || '').toLowerCase().includes('variador') || (e.category || '').toLowerCase().includes('vfd'));
    return calculateEfficiencyIndex(
      diagnostic.powerFactor,
      diagnostic.lighting || [],
      equipmentSummary.totalMonthlyKwh,
      receiptsStats.averageMonthlyKwh,
      hasSolarOrVfd
    );
  }, [diagnostic.powerFactor, diagnostic.lighting, diagnostic.solar, diagnostic.equipment, equipmentSummary, receiptsStats]);

  // 7. Computed Savings Opportunities
  const computedSavingsOpportunities = useMemo(() => {
    if (diagnostic.opportunities && diagnostic.opportunities.length > 0) {
      return diagnostic.opportunities;
    }
    return generateSavingsOpportunities(diagnostic);
  }, [diagnostic]);

  // 8. Consolidated Bill of Materials
  const computedBom = useMemo(() => {
    return generateBillOfMaterials(diagnostic);
  }, [diagnostic]);

  // Mutation Handlers
  const updateGeneralData = (data: Partial<GeneralData>) => {
    setDiagnostic(prev => ({
      ...prev,
      generalData: { ...prev.generalData, ...data },
      updatedAt: new Date().toISOString()
    }));
  };

  const updateTariff = (tariff: Partial<TariffConfig>) => {
    setDiagnostic(prev => ({
      ...prev,
      tariff: { ...prev.tariff, ...tariff },
      updatedAt: new Date().toISOString()
    }));
  };

  const addEquipment = (item: Omit<EquipmentRecord, 'id' | 'code'>) => {
    const newId = `eq-${Date.now()}`;
    const code = `EQ-${String((diagnostic.equipment || []).length + 1).padStart(2, '0')}`;
    const newRecord: EquipmentRecord = {
      id: newId,
      code,
      ...item
    };
    setDiagnostic(prev => ({
      ...prev,
      equipment: [...(prev.equipment || []), newRecord],
      updatedAt: new Date().toISOString()
    }));
  };

  const updateEquipment = (id: string, item: Partial<EquipmentRecord>) => {
    setDiagnostic(prev => ({
      ...prev,
      equipment: (prev.equipment || []).map(e => e.id === id ? { ...e, ...item } : e),
      updatedAt: new Date().toISOString()
    }));
  };

  const deleteEquipment = (id: string) => {
    setDiagnostic(prev => ({
      ...prev,
      equipment: (prev.equipment || []).filter(e => e.id !== id),
      updatedAt: new Date().toISOString()
    }));
  };

  const addCircuit = (circuit: Omit<CircuitRecord, 'id'>) => {
    const newId = `cct-${Date.now()}`;
    const newRecord: CircuitRecord = {
      id: newId,
      ...circuit
    };
    setDiagnostic(prev => ({
      ...prev,
      circuits: [...(prev.circuits || []), newRecord],
      updatedAt: new Date().toISOString()
    }));
  };

  const updateCircuit = (id: string, circuit: Partial<CircuitRecord>) => {
    setDiagnostic(prev => ({
      ...prev,
      circuits: (prev.circuits || []).map(c => c.id === id ? { ...c, ...circuit } : c),
      updatedAt: new Date().toISOString()
    }));
  };

  const deleteCircuit = (id: string) => {
    setDiagnostic(prev => ({
      ...prev,
      circuits: (prev.circuits || []).filter(c => c.id !== id),
      updatedAt: new Date().toISOString()
    }));
  };

  const addPanel = (panel: Omit<ElectricalPanel, 'id'>) => {
    const newId = `pnl-${Date.now()}`;
    const newRecord: ElectricalPanel = {
      id: newId,
      ...panel
    };
    setDiagnostic(prev => ({
      ...prev,
      panels: [...(prev.panels || []), newRecord],
      updatedAt: new Date().toISOString()
    }));
  };

  const updatePanel = (id: string, panel: Partial<ElectricalPanel>) => {
    setDiagnostic(prev => ({
      ...prev,
      panels: (prev.panels || []).map(p => p.id === id ? { ...p, ...panel } : p),
      updatedAt: new Date().toISOString()
    }));
  };

  const deletePanel = (id: string) => {
    setDiagnostic(prev => ({
      ...prev,
      panels: (prev.panels || []).filter(p => p.id !== id),
      updatedAt: new Date().toISOString()
    }));
  };

  const addLightingRoom = (light: Omit<LightingRecord, 'id'>) => {
    const newId = `lt-${Date.now()}`;
    const newRecord: LightingRecord = {
      id: newId,
      ...light
    };
    setDiagnostic(prev => ({
      ...prev,
      lighting: [...(prev.lighting || []), newRecord],
      updatedAt: new Date().toISOString()
    }));
  };

  const updateLightingRoom = (id: string, light: Partial<LightingRecord>) => {
    setDiagnostic(prev => ({
      ...prev,
      lighting: (prev.lighting || []).map(l => l.id === id ? { ...l, ...light } : l),
      updatedAt: new Date().toISOString()
    }));
  };

  const deleteLightingRoom = (id: string) => {
    setDiagnostic(prev => ({
      ...prev,
      lighting: (prev.lighting || []).filter(l => l.id !== id),
      updatedAt: new Date().toISOString()
    }));
  };

  const addGrounding = (gnd: Omit<GroundingSystem, 'id'>) => {
    const newId = `gnd-${Date.now()}`;
    const newRecord: GroundingSystem = {
      id: newId,
      ...gnd
    };
    setDiagnostic(prev => ({
      ...prev,
      grounding: [...(prev.grounding || []), newRecord],
      updatedAt: new Date().toISOString()
    }));
  };

  const updateGrounding = (id: string, gnd: Partial<GroundingSystem>) => {
    setDiagnostic(prev => ({
      ...prev,
      grounding: (prev.grounding || []).map(g => g.id === id ? { ...g, ...gnd } : g),
      updatedAt: new Date().toISOString()
    }));
  };

  const deleteGrounding = (id: string) => {
    setDiagnostic(prev => ({
      ...prev,
      grounding: (prev.grounding || []).filter(g => g.id !== id),
      updatedAt: new Date().toISOString()
    }));
  };

  const addReceipt = (receipt: Omit<ReceiptRecord, 'id'>) => {
    const newId = `rec-${Date.now()}`;
    const newRecord: ReceiptRecord = {
      id: newId,
      ...receipt
    };
    setDiagnostic(prev => ({
      ...prev,
      receipts: [...(prev.receipts || []), newRecord],
      updatedAt: new Date().toISOString()
    }));
  };

  const updateReceipt = (id: string, receipt: Partial<ReceiptRecord>) => {
    setDiagnostic(prev => ({
      ...prev,
      receipts: (prev.receipts || []).map(r => r.id === id ? { ...r, ...receipt } : r),
      updatedAt: new Date().toISOString()
    }));
  };

  const deleteReceipt = (id: string) => {
    setDiagnostic(prev => ({
      ...prev,
      receipts: (prev.receipts || []).filter(r => r.id !== id),
      updatedAt: new Date().toISOString()
    }));
  };

  const addPhoto = (photo: Omit<PhotoEvidenceRecord, 'id'>) => {
    const newId = `ph-${Date.now()}`;
    const newRecord: PhotoEvidenceRecord = {
      id: newId,
      ...photo
    };
    setDiagnostic(prev => ({
      ...prev,
      photos: [...(prev.photos || []), newRecord],
      updatedAt: new Date().toISOString()
    }));
  };

  const deletePhoto = (id: string) => {
    setDiagnostic(prev => ({
      ...prev,
      photos: (prev.photos || []).filter(p => p.id !== id),
      updatedAt: new Date().toISOString()
    }));
  };

  const updatePowerFactor = (pf: Partial<PowerFactorAnalysis>) => {
    setDiagnostic(prev => ({
      ...prev,
      powerFactor: { ...prev.powerFactor, ...pf },
      updatedAt: new Date().toISOString()
    }));
  };

  const updateSolar = (solar: Partial<SolarPVConfig>) => {
    setDiagnostic(prev => ({
      ...prev,
      solar: { ...prev.solar, ...solar },
      updatedAt: new Date().toISOString()
    }));
  };

  const addOpportunity = (opp: Omit<SavingsOpportunityRecord, 'id'>) => {
    const newId = `op-${Date.now()}`;
    const newRecord: SavingsOpportunityRecord = {
      id: newId,
      ...opp
    };
    setDiagnostic(prev => ({
      ...prev,
      opportunities: [...(prev.opportunities || []), newRecord],
      updatedAt: new Date().toISOString()
    }));
  };

  const updateOpportunity = (id: string, opp: Partial<SavingsOpportunityRecord>) => {
    setDiagnostic(prev => ({
      ...prev,
      opportunities: (prev.opportunities || []).map(o => o.id === id ? { ...o, ...opp } : o),
      updatedAt: new Date().toISOString()
    }));
  };

  const deleteOpportunity = (id: string) => {
    setDiagnostic(prev => ({
      ...prev,
      opportunities: (prev.opportunities || []).filter(o => o.id !== id),
      updatedAt: new Date().toISOString()
    }));
  };

  const toggleOpportunityStatus = (id: string) => {
    setDiagnostic(prev => ({
      ...prev,
      opportunities: (prev.opportunities || []).map(o => o.id === id ? { ...o, implemented: !o.implemented } : o),
      updatedAt: new Date().toISOString()
    }));
  };

  const loadDemoVivienda = () => {
    setDiagnostic(DEMO_VIVIENDA);
    setActiveTab('DASHBOARD');
  };

  const loadDemoPlantaIndustrial = () => {
    setDiagnostic(DEMO_PLANTA_INDUSTRIAL);
    setActiveTab('DASHBOARD');
  };

  const loadDemoComercio = () => {
    setDiagnostic(DEMO_LOCAL_COMERCIAL);
    setActiveTab('DASHBOARD');
  };

  const loadDemoCalzado = () => {
    setDiagnostic(DEMO_PLANTA_INDUSTRIAL);
    setActiveTab('DASHBOARD');
  };

  const createNewDiagnostic = (type: InstallationType) => {
    const configMap: Record<string, { 
      codePrefix: string; 
      activity: string; 
      workers: number; 
      schedule: string; 
      days: number;
      tariffCode: string; 
      voltage: number; 
      phases: 'MONOFASICO' | 'TRIFASICO'; 
      distributor: string;
      city: string;
      department: string;
      province: string;
      district: string;
    }> = {
      industria: {
        codePrefix: 'IND',
        activity: 'Planta Industrial y Manufactura General',
        workers: 18,
        schedule: '07:30 a 17:30 (Lunes a Sábado)',
        days: 6,
        tariffCode: 'BT3',
        voltage: 380,
        phases: 'TRIFASICO',
        distributor: 'Luz del Sur S.A.A.',
        city: 'Lima',
        department: 'Lima',
        province: 'Lima',
        district: 'Ate'
      },
      comercio: {
        codePrefix: 'COM',
        activity: 'Local Comercial / Restaurante / Retail',
        workers: 10,
        schedule: '08:30 a 22:30 (Lunes a Domingo)',
        days: 7,
        tariffCode: 'BT5A',
        voltage: 220,
        phases: 'TRIFASICO',
        distributor: 'Pluz Energía Perú',
        city: 'Lima',
        department: 'Lima',
        province: 'Lima',
        district: 'Miraflores'
      },
      vivienda: {
        codePrefix: 'VIV',
        activity: 'Vivienda Residencial Multifamiliar',
        workers: 4,
        schedule: 'Uso continuo residencial',
        days: 7,
        tariffCode: 'BT5B',
        voltage: 220,
        phases: 'MONOFASICO',
        distributor: 'Luz del Sur S.A.A.',
        city: 'Lima',
        department: 'Lima',
        province: 'Lima',
        district: 'Santiago de Surco'
      },
      oficina: {
        codePrefix: 'OFI',
        activity: 'Oficinas Administrativas y Centro Corporativo',
        workers: 14,
        schedule: '08:00 a 19:00 (Lunes a Viernes)',
        days: 5,
        tariffCode: 'BT5A',
        voltage: 220,
        phases: 'TRIFASICO',
        distributor: 'Luz del Sur S.A.A.',
        city: 'Lima',
        department: 'Lima',
        province: 'Lima',
        district: 'San Isidro'
      },
      almacen: {
        codePrefix: 'ALM',
        activity: 'Almacén y Centro Logístico de Distribución',
        workers: 12,
        schedule: '07:00 a 20:00 (Lunes a Sábado)',
        days: 6,
        tariffCode: 'BT5A',
        voltage: 380,
        phases: 'TRIFASICO',
        distributor: 'Luz del Sur S.A.A.',
        city: 'Lima',
        department: 'Lima',
        province: 'Lima',
        district: 'Lurín'
      },
      educativo: {
        codePrefix: 'EDU',
        activity: 'Centro Educativo / Universidad / Instituto',
        workers: 24,
        schedule: '07:00 a 22:00 (Lunes a Sábado)',
        days: 6,
        tariffCode: 'BT5A',
        voltage: 220,
        phases: 'TRIFASICO',
        distributor: 'Hidrandina S.A.',
        city: 'Trujillo',
        department: 'La Libertad',
        province: 'Trujillo',
        district: 'Víctor Larco'
      },
      salud: {
        codePrefix: 'SAL',
        activity: 'Centro de Salud / Clínica Especializada',
        workers: 20,
        schedule: 'Atención continua 24 horas',
        days: 7,
        tariffCode: 'BT3',
        voltage: 220,
        phases: 'TRIFASICO',
        distributor: 'Seal S.A.',
        city: 'Arequipa',
        department: 'Arequipa',
        province: 'Arequipa',
        district: 'Yanahuara'
      },
      institucion: {
        codePrefix: 'INS',
        activity: 'Entidad Pública o Institucional',
        workers: 28,
        schedule: '08:00 a 17:00 (Lunes a Viernes)',
        days: 5,
        tariffCode: 'BT5A',
        voltage: 220,
        phases: 'TRIFASICO',
        distributor: 'Luz del Sur S.A.A.',
        city: 'Lima',
        department: 'Lima',
        province: 'Lima',
        district: 'Cercado de Lima'
      },
      calzado: {
        codePrefix: 'IND',
        activity: 'Manufactura y Producción Industrial',
        workers: 15,
        schedule: '07:30 a 17:30 (Lunes a Sábado)',
        days: 6,
        tariffCode: 'BT5A',
        voltage: 380,
        phases: 'TRIFASICO',
        distributor: 'Hidrandina S.A.',
        city: 'Trujillo',
        department: 'La Libertad',
        province: 'Trujillo',
        district: 'El Porvenir'
      }
    };

    const cfg = configMap[type] || configMap.industria;

    const newDiag: CompleteDiagnostic = {
      id: `diag-${Date.now()}`,
      generalData: {
        diagnosticCode: `EDIAG-${cfg.codePrefix}-${new Date().getFullYear()}-001`,
        date: new Date().toISOString().split('T')[0],
        clientName: '',
        companyName: '',
        ruc: '',
        responsibleEngineer: 'Ing. Colegiado CIP',
        address: '',
        city: cfg.city,
        department: cfg.department,
        province: cfg.province,
        district: cfg.district,
        phone: '',
        email: '',
        installationType: type,
        economicActivity: cfg.activity,
        workerCount: cfg.workers,
        workSchedule: cfg.schedule,
        shiftsCount: 1,
        workDaysPerWeek: cfg.days,
        totalAreaM2: 250,
        builtAreaM2: 220,
        observations: ''
      },
      tariff: {
        distributor: cfg.distributor,
        tariffCode: cfg.tariffCode,
        supplyVoltage: cfg.voltage,
        phases: cfg.phases,
        activeEnergyPriceKwh: 0.72,
        reactiveEnergyPenaltyPriceKvarh: 0.145,
        fixedMonthlyChargeSoles: 12.50,
        igvRatePercent: 18
      },
      receipts: [],
      equipment: [],
      lighting: [],
      panels: [],
      circuits: [],
      grounding: [],
      powerFactor: {
        currentPowerFactor: 0.86,
        targetPowerFactor: 0.98,
        requiredCapacitorKvar: 5.0,
        monthlyPenaltyAvoidedSoles: 120,
        estimatedInvestmentSoles: 2200,
        paybackMonths: 14.5
      },
      solar: {
        scenarioKwp: 5.0,
        dailyHsp: 5.2,
        panelCount: 9,
        panelPowerW: 550,
        monthlyGenerationKwh: 620,
        annualGenerationKwh: 7440,
        paybackYears: 3.5,
        co2AvoidedTonsPerYear: 3.1
      },
      opportunities: [],
      photos: [],
      normativeParameters: [],
      activeScenario: 'ACTUAL',
      scenarios: {
        actual: {
          name: 'Situación Actual',
          monthlyKwh: 0,
          monthlyCostSoles: 0,
          installedPowerKw: 0,
          maxDemandKw: 0,
          powerFactor: 0.86,
          safetyScore: 50,
          efficiencyScore: 50,
          annualSavingsSoles: 0
        },
        proposed: {
          name: 'Propuesta con Mejoras',
          monthlyKwh: 0,
          monthlyCostSoles: 0,
          installedPowerKw: 0,
          maxDemandKw: 0,
          powerFactor: 0.98,
          safetyScore: 95,
          efficiencyScore: 90,
          annualSavingsSoles: 0
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDiagnostic(newDiag);
    setActiveTab('EQUIPMENT');
  };

  const importJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.generalData && parsed.tariff) {
        setDiagnostic(normalizeDiagnostic(parsed));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const exportJson = (): string => {
    return JSON.stringify(diagnostic, null, 2);
  };

  return (
    <DiagnosticContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        updateUserProfile,
        logout,
        diagnostic,
        activeTab,
        setActiveTab,
        activeScenario,
        setActiveScenario,
        computedEquipment,
        equipmentSummary,
        demandBalance,
        receiptsStats,
        receiptComparison,
        safetyEvaluation,
        efficiencyEvaluation,
        computedSavingsOpportunities,
        computedBom,
        updateGeneralData,
        updateTariff,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        addCircuit,
        updateCircuit,
        deleteCircuit,
        addPanel,
        updatePanel,
        deletePanel,
        addLightingRoom,
        updateLightingRoom,
        deleteLightingRoom,
        addGrounding,
        updateGrounding,
        deleteGrounding,
        addReceipt,
        updateReceipt,
        deleteReceipt,
        addPhoto,
        deletePhoto,
        updatePowerFactor,
        updateSolar,
        addOpportunity,
        updateOpportunity,
        deleteOpportunity,
        toggleOpportunityStatus,
        loadDemoVivienda,
        loadDemoPlantaIndustrial,
        loadDemoComercio,
        loadDemoCalzado,
        createNewDiagnostic,
        importJson,
        exportJson,
        showNewProjectModal,
        setShowNewProjectModal
      }}
    >
      {children}
    </DiagnosticContext.Provider>
  );
};

export const useDiagnostic = () => {
  const context = useContext(DiagnosticContext);
  if (!context) {
    throw new Error('useDiagnostic must be used within a DiagnosticProvider');
  }
  return context;
};
