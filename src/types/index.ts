// E-DIAGNOSIS Core Type Definitions
// Compliance with Peruvian Electrical Code (CNE Utilización 2006) and RNE EM.010

export type InstallationType = 
  | 'industria'
  | 'comercio'
  | 'vivienda'
  | 'oficina'
  | 'almacen'
  | 'educativo'
  | 'salud'
  | 'institucion'
  | 'calzado';

export type UserRole = 'ADMINISTRADOR' | 'TECNICO' | 'CLIENTE';

export type ViewMode = 'BASICO' | 'PROFESIONAL';

export type TrafficLight = 'ADECUADO' | 'REVISAR' | 'NO_ADECUADO';

export type ConfidenceLevel = 'MEDIDO' | 'CALCULADO' | 'ESTIMADO' | 'REQUIERE_VERIFICACION';

export type PowerUnit = 'W' | 'kW' | 'HP';

export type VoltageSystem = '110' | '120' | '220' | '230' | '380' | '400' | 'OTRA';

export type PhaseSystem = 'MONOFASICO' | 'BIFASICO' | 'TRIFASICO';

export type WireInsulation = 'THW' | 'THHN' | 'N2XH' | 'NH-80' | 'TW';

export type CircuitLoadType = 'ILUMINACION' | 'TOMACORRIENTES' | 'MOTOR' | 'MAQUINA_ESPECIAL' | 'CLIMATIZACION' | 'OTRO';

export type WireMaterial = 'COBRE' | 'ALUMINIO';

export type EquipmentCategory = string;

export type OperatingMode = 'CONTINUO' | 'INTERMITENTE' | 'STANDBY' | 'PICO';

export type SoilType = string;

export type GroundingTreatment = string;

export interface GeneralData {
  diagnosticCode: string;
  date: string;
  clientName: string;
  companyName: string;
  ruc: string;
  responsibleEngineer: string;
  cipNumber?: string;
  specialty?: string;
  professionalCollege?: string;
  address: string;
  city: string;
  department: string;
  province: string;
  district: string;
  phone: string;
  email: string;
  installationType: InstallationType;
  economicActivity: string;
  workerCount: number;
  workSchedule: string;
  shiftsCount: number;
  workDaysPerWeek: number;
  totalAreaM2: number;
  builtAreaM2: number;
  observations: string;
  occupantsCount?: number;
  roomsCount?: number;
  floorsCount?: number;
  housingAreaM2?: number;
  avgOccupancySchedule?: string;
  facilityProcessAreas?: string[];
  footwearProcessAreas?: string[];
}

export interface ReceiptRecord {
  id: string;
  year: number;
  month: string;
  kwhConsumed: number;
  costSoles: number;
  billedPowerKw: number;
  maxDemandKw: number;
  activeEnergyKwh: number;
  reactiveEnergyKvarh: number;
  powerFactor: number;
  billedDays: number;
  tariffCode: string;
  observations?: string;
}

export interface EquipmentRecord {
  id: string;
  code: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  areaTag: string;
  quantity: number;
  power: number;
  powerUnit: PowerUnit;
  voltage: number;
  phases: PhaseSystem;
  frequencyHz: number;
  ratedCurrentA: number;
  measuredCurrentA?: number;
  powerFactor: number;
  efficiencyPercent: number;
  hoursPerDay: number;
  daysPerWeek: number;
  weeksPerMonth: number;
  state: 'OPERATIVO_OPTIMO' | 'OPERATIVO_REGULAR' | 'DEFICIENTE' | 'OBSOLETO';
  manufactureYear?: number;
  operatingMode: OperatingMode;
  loadFactor: number;
  monthlyKwh?: number;
  monthlyCostSoles?: number;
  observations?: string;
  confidence: ConfidenceLevel;
}

export type LightingTechnology = 
  | 'FLUORESCENTE_T8'
  | 'FLUORESCENTE_T5'
  | 'HALOGENO'
  | 'INCANDESCENTE'
  | 'HALOGENURO_METALICO'
  | 'LED_TUBULAR'
  | 'LED_PANEL'
  | 'LED_HIGH_BAY'
  | 'LED_REFLECTOR'
  | 'LED_BULB';

export interface LightingRecord {
  id: string;
  roomName: string;
  visualTask?: string;
  activityType?: string;
  areaM2: number;
  lengthM?: number;
  widthM?: number;
  heightM?: number;
  roomHeightM?: number;
  mountingHeightM?: number;
  workplaneHeightM?: number;
  workPlaneHeightM?: number;
  requiredLuxRne?: number;
  requiredLux?: number;
  measuredLux?: number;
  calculatedLux?: number;
  currentTech?: LightingTechnology | string;
  currentLampCount?: number;
  currentLampPowerW?: number;
  currentTotalPowerW?: number;
  dailyHours?: number;
  recommendedTech?: LightingTechnology | string;
  recommendedLampCount?: number;
  recommendedLampPowerW?: number;
  recommendedTotalPowerW?: number;
  existingQuantity?: number;
  proposedQuantity?: number;
  unitPowerW?: number;
  unitLumens?: number;
  colorTempK?: number;
  beamAngleDeg?: number;
  luminaireType?: string;
  calculatedRoomIndexK?: number;
  maintenanceFactor?: number;
  utilizationFactor?: number;
  cuCoefficient?: number;
  gridNx?: number;
  gridNy?: number;
  spacingXM?: number;
  spacingYM?: number;
  wallDistanceXM?: number;
  wallDistanceYM?: number;
  ceilingReflectance?: number;
  wallReflectance?: number;
  floorReflectance?: number;
  powerDensityWPerM2?: number;
  powerDensityWm2?: number;
  maxAllowedPowerDensityWPerM2?: number;
  complianceStatus?: TrafficLight;
  monthlySavingsKwh?: number;
  monthlySavingsSoles?: number;
  monthlyKwh?: number;
  monthlyCostSoles?: number;
  observations?: string;
}

export type RoomLighting = LightingRecord;

export interface ElectricalPanel {
  id: string;
  code: string;
  name: string;
  panelType: 'TABLERO_GENERAL' | 'TABLERO_SECUNDARIO' | 'TABLERO_MAQUINAS' | 'TABLERO_ILUMINACION' | 'TABLERO_TOMACORRIENTES';
  location: string;
  voltage: number;
  phases: PhaseSystem;
  capacityA: number;
  mainBreakerRatingA: number;
  mainBreakerPoles: number;
  shortCircuitKa: number;
  circuitCount: number;
  enclosureType: string;
  hasGroundBar: boolean;
  hasSurgeProtector: boolean;
  observations?: string;
  photoUrl?: string;
}

export type PanelRecord = ElectricalPanel;

export interface CircuitRecord {
  id: string;
  panelId: string;
  circuitCode: string;
  description: string;
  loadType: CircuitLoadType;
  connectedPowerW: number;
  voltage: number;
  phases: PhaseSystem;
  calculatedCurrentA: number;
  measuredCurrentA?: number;
  isMotor: boolean;
  startingCurrentA?: number;
  powerFactor: number;
  lengthM: number;
  wireMaterial: WireMaterial;
  wireInsulation: WireInsulation;
  wireSectionMm2: number;
  groundWireMm2: number;
  conduitType: 'PVC-P' | 'PVC-L' | 'EMT' | 'FLEXIBLE' | 'BANDEJA';
  ambientTempC: number;
  groupingFactor: number;
  wireAdmissibleAmpacityA: number;
  voltageDropV: number;
  voltageDropPercent: number;
  maxAllowedVoltageDropPercent: number;
  breakerExistingA?: number;
  breakerRecommendedA: number;
  breakerCurve: 'B' | 'C' | 'D';
  breakerPoles: number;
  breakerBreakingKa: number;
  rcdExistingA?: number;
  rcdRecommendedA: number;
  rcdSensitivityMa: number;
  rcdType: 'AC' | 'A' | 'F' | 'B';
  wireStatus: TrafficLight;
  voltageDropStatus: TrafficLight;
  breakerStatus: TrafficLight;
  rcdStatus: TrafficLight;
  technicalJustification: string;
  confidence: ConfidenceLevel;
}

export interface GroundingSystem {
  id: string;
  code?: string;
  location: string;
  soilType: SoilType;
  soilMoisture: 'SECO' | 'MEDIO' | 'HUMEDO';
  measuredSoilResistivityOhmM?: number;
  measurementMethod?: string;
  measuredResistanceOhm: number;
  measurementDate?: string;
  electrodeType: 'VARILLA_VERTICAL' | 'ELECTRODOS_MULTIPLES' | 'HORIZONTAL_MALLA' | 'OTRA';
  electrodeMaterial: 'COBRE_ELECTROLITICO' | 'COPPERWELD' | 'ACERO_GALVANIZADO';
  electrodeLengthM: number;
  electrodeDiameterMm: number;
  burialDepthM: number;
  electrodeCount: number;
  electrodeSpacingM: number;
  groundConductorGaugeMm2: number;
  groundConductorMaterial: 'COBRE_DESNUDO' | 'COBRE_AISLADO';
  hasInspectionBox: boolean;
  hasEquipotentialBonding: boolean;
  soilTreatmentType: 'NINGUNO' | 'BENTONITA' | 'GEL_ELECTROLITICO' | 'CEMENTO_CONDUCTIVO' | 'SAL_CARBON_NO_RECOMENDADO' | string;
  treatmentChemical?: string;
  treatmentJustification?: string;
  calculatedTheoreticalResistanceOhm?: number;
  maxTargetResistanceOhm: number;
  requiredMaxResistanceOhm?: number;
  systemType?: string;
  soilResistivityOhmM?: number;
  treatmentDate?: string;
  conductorSectionMm2?: number;
  boxCondition?: 'BUENO' | 'REGULAR' | 'MALO' | string;
  electrodeCondition?: 'BUENO' | 'CORROIDIDO' | 'REGULAR' | string;
  observations?: string;
  complianceStatus: TrafficLight;
  maintenanceNotes?: string;
  confidence: ConfidenceLevel;
}

export type GroundingWellRecord = GroundingSystem;

export interface TariffConfig {
  distributor: string;
  tariffCode: string;
  supplyVoltage: number;
  phases: PhaseSystem;
  activeEnergyPriceKwh: number;
  peakEnergyPriceKwh?: number;
  offPeakEnergyPriceKwh?: number;
  contractedDemandPriceKw?: number;
  excessDemandPriceKw?: number;
  reactiveEnergyPenaltyPriceKvarh?: number;
  fixedMonthlyChargeSoles: number;
  igvRatePercent: number;
}

export interface PowerFactorAnalysis {
  activePowerKw?: number;
  reactivePowerKvar?: number;
  apparentPowerKva?: number;
  currentPowerFactor: number;
  targetPowerFactor: number;
  requiredCapacitorKvar: number;
  recommendedBankType?: string;
  stepsKvar?: number[];
  suggestedStepsCount?: number;
  stepSizeKvar?: number;
  monthlyPenaltyEstimatedSoles?: number;
  monthlyPenaltyAvoidedSoles?: number;
  annualSavingsSoles?: number;
  estimatedInvestmentSoles?: number;
  paybackMonths?: number;
  tariffReactivePenaltyRate?: number;
}

export interface SolarPVConfig {
  scenarioKwp: number;
  dailyHsp?: number;
  panelCount: number;
  panelPowerW?: number;
  panelWattageW?: number;
  inverterPowerKw?: number;
  peakSunHoursHsp?: number;
  systemPerformanceRatio?: number;
  dailyGenerationKwh?: number;
  monthlyGenerationKwh: number;
  annualGenerationKwh: number;
  systemType?: 'ON_GRID' | 'ZERO_INJECTION' | 'HYBRID' | 'OFF_GRID';
  roofAreaRequiredM2?: number;
  estimatedInvestmentSoles?: number;
  estimatedTurnkeyCostSoles?: number;
  annualSavingsSoles?: number;
  annualCostSavingsSoles?: number;
  paybackYears: number;
  co2AvoidedTonsPerYear: number;
  batteryCapacityKwh?: number;
  coveragePercentage?: number;
}

export interface SavingsOpportunityRecord {
  id: string;
  code?: string;
  title?: string;
  problem?: string;
  recommendedAction?: string;
  category: 'FACTOR_POTENCIA' | 'ILUMINACION_LED' | 'MOTORES_VFD' | 'SOLAR_FOTOVOLTAICA' | 'CONDUCTORES_TERMICOS' | 'BUENAS_PRACTICAS' | 'CAMBIO_TARIFA' | 'ILUMINACION' | 'MOTORES' | 'FUGAS_COMPRESOR' | 'GESTION_TARIFARIA' | 'SOLAR' | 'HABITOS';
  description?: string;
  monthlySavingsKwh?: number;
  monthlySavingsSoles?: number;
  annualSavingsKwh?: number;
  annualSavingsSoles: number;
  estimatedInvestmentSoles: number;
  simplePaybackMonths?: number;
  paybackMonths?: number;
  paybackYears?: number;
  npv10YearsSoles?: number;
  irrPercent?: number;
  co2AvoidedTonsPerYear?: number;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  implementationEase?: 'ALTA' | 'MEDIA' | 'BAJA';
  equipmentImpacted?: string;
  implemented?: boolean;
}

export type SavingsOpportunity = SavingsOpportunityRecord;

export interface BillOfMaterialsItem {
  id?: string;
  category: string;
  description: string;
  specification?: string;
  quantity: number;
  unit: string;
  unitCostSoles: number;
  totalCostSoles: number;
  observation?: string;
}

export type MaterialItem = BillOfMaterialsItem;

export interface PhotoEvidenceRecord {
  id: string;
  title: string;
  areaTag?: string;
  category: 'Tableros y Protecciones' | 'Puesta a Tierra' | 'Conductores y Canalizaciones' | 'Maquinaria y Motores' | 'Iluminación' | 'Medidor y Acometida' | 'Riesgo Crítico' | 'TABLERO' | 'MEDIDOR' | 'TERMOMAGNETICO' | 'DIFERENCIAL' | 'CONDUCTORES' | 'MAQUINAS' | 'ILUMINACION' | 'PUESTA_TIERRA' | 'RECIBO' | 'OTRO';
  severity?: 'CRITICO' | 'ALTO' | 'MEDIO' | 'LEVE' | 'BUENA_PRACTICA';
  observation: string;
  correctiveAction?: string;
  imageUrl: string;
  date?: string;
  location?: string;
  aiObservation?: string;
}

export type PhotoRecord = PhotoEvidenceRecord;
export type PhotoEvidence = PhotoEvidenceRecord;

export interface NormativeParameter {
  id: string;
  standard: string;
  code: string;
  parameterName: string;
  value: string | number;
  unit: string;
  description: string;
  source: string;
  updatedDate: string;
}

export interface ScenarioComparison {
  name: string;
  monthlyKwh: number;
  monthlyCostSoles: number;
  installedPowerKw: number;
  maxDemandKw: number;
  powerFactor: number;
  safetyScore: number;
  efficiencyScore: number;
  annualSavingsSoles: number;
}

export interface CompleteDiagnostic {
  id: string;
  generalData: GeneralData;
  receipts: ReceiptRecord[];
  equipment: EquipmentRecord[];
  lighting: LightingRecord[];
  panels: ElectricalPanel[];
  circuits: CircuitRecord[];
  grounding: GroundingSystem[];
  tariff: TariffConfig;
  powerFactor: PowerFactorAnalysis;
  solar: SolarPVConfig;
  opportunities: SavingsOpportunityRecord[];
  photos: PhotoEvidenceRecord[];
  normativeParameters: NormativeParameter[];
  activeScenario: 'ACTUAL' | 'MEJORA';
  scenarios: {
    actual: ScenarioComparison;
    proposed: ScenarioComparison;
  };
  aiDiagnosis?: {
    executiveSummary: string;
    keyProblems: string[];
    topConsumersExplanation: string;
    risksToInspect: string[];
    savingRoadmap: string[];
    recommendations: string[];
    priorities: string[];
    conclusion: string;
    insufficientDataNotes?: string;
    generatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}
