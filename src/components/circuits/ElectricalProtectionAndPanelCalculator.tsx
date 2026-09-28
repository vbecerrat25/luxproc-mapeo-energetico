import React, { useState, useMemo } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { 
  Zap, 
  ShieldCheck, 
  Sliders, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Info, 
  SlidersHorizontal,
  Box,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { CircuitRecord, PanelRecord } from '../../types';

// Comprehensive industrial and commercial load types catalog
interface LoadOption {
  value: string;
  label: string;
  category: string;
  typicalPowerW: number;
  typicalPf: number;
  typicalPhases?: 'MONOFASICO' | 'TRIFASICO';
  defaultDescription: string;
}

const LOAD_CATEGORIES: { categoryName: string; options: LoadOption[] }[] = [
  {
    categoryName: 'Fuerza Motriz / Motores y Maquinaria',
    options: [
      { value: 'MOTOR', label: 'Motor Eléctrico / Maquinaria General', category: 'Fuerza Motriz', typicalPowerW: 3700, typicalPf: 0.85, defaultDescription: 'Alimentador de Motor / Maquinaria' },
      { value: 'COMPRESOR', label: 'Compresor de Aire / Sistema Neumático', category: 'Fuerza Motriz', typicalPowerW: 7500, typicalPf: 0.85, typicalPhases: 'TRIFASICO', defaultDescription: 'Compresor de Aire Industrial' },
      { value: 'BOMBA', label: 'Electrobomba de Agua / Sistema Presurizado', category: 'Fuerza Motriz', typicalPowerW: 2200, typicalPf: 0.84, defaultDescription: 'Electrobomba Centrífuga de Impulsión' },
      { value: 'VENTILADOR', label: 'Extractor / Ventilador / Ventilación Forzada', category: 'Fuerza Motriz', typicalPowerW: 1500, typicalPf: 0.82, defaultDescription: 'Sistema de Extracción de Aire' },
      { value: 'TRANSPORTE', label: 'Faja Transportadora / Elevador / Reductor', category: 'Fuerza Motriz', typicalPowerW: 3000, typicalPf: 0.85, defaultDescription: 'Faja Transportadora Continua' },
      { value: 'MECANIZADO', label: 'Torno / Fresa / Centro CNC / Corte', category: 'Fuerza Motriz', typicalPowerW: 7500, typicalPf: 0.86, typicalPhases: 'TRIFASICO', defaultDescription: 'Centro de Mecanizado CNC / Torno' },
      { value: 'MOLINO', label: 'Molino / Trituradora / Mezcladora Industrial', category: 'Fuerza Motriz', typicalPowerW: 11000, typicalPf: 0.85, typicalPhases: 'TRIFASICO', defaultDescription: 'Molino / Mezclador Industrial' },
      { value: 'PRENSA', label: 'Prensa Hidráulica / Plegadora / Balancín', category: 'Fuerza Motriz', typicalPowerW: 5500, typicalPf: 0.85, typicalPhases: 'TRIFASICO', defaultDescription: 'Prensa Hidráulica de Conformado' },
      { value: 'GRUA', label: 'Puente Grúa / Polipasto / Malacate', category: 'Fuerza Motriz', typicalPowerW: 5500, typicalPf: 0.82, typicalPhases: 'TRIFASICO', defaultDescription: 'Puente Grúa / Polipasto Eléctrico' },
    ]
  },
  {
    categoryName: 'Climatización, Refrigeración y Frío',
    options: [
      { value: 'CLIMATIZACION', label: 'Aire Acondicionado / Chiller (HVAC)', category: 'Climatización', typicalPowerW: 4500, typicalPf: 0.88, defaultDescription: 'Sistema de Climatización HVAC' },
      { value: 'REFRIGERACION', label: 'Cámara Frigorífica / Unidad Condensadora', category: 'Climatización', typicalPowerW: 6000, typicalPf: 0.85, typicalPhases: 'TRIFASICO', defaultDescription: 'Cámara Frigorífica de Conservación' },
      { value: 'EXTRACCION', label: 'Torre de Enfriamiento / Chiller de Proceso', category: 'Climatización', typicalPowerW: 4000, typicalPf: 0.85, defaultDescription: 'Torre de Enfriamiento de Proceso' },
    ]
  },
  {
    categoryName: 'Cargas Térmicas, Calor y Soldadura',
    options: [
      { value: 'RESISTENCIA', label: 'Horno Eléctrico / Mufla / Secador', category: 'Térmico', typicalPowerW: 6000, typicalPf: 0.98, defaultDescription: 'Horno Eléctrico Industrial' },
      { value: 'CALDERIN', label: 'Calderín / Generador de Vapor Eléctrico', category: 'Térmico', typicalPowerW: 9000, typicalPf: 0.99, typicalPhases: 'TRIFASICO', defaultDescription: 'Calderín Eléctrico de Vapor' },
      { value: 'SOLDADURA', label: 'Máquina de Soldar (MIG / TIG / Arco Eléctrico)', category: 'Soldadura', typicalPowerW: 6500, typicalPf: 0.72, defaultDescription: 'Máquina Soldadora Multiproceso' },
      { value: 'PLASTICO', label: 'Inyectora / Extrusora / Termoformadora', category: 'Térmico', typicalPowerW: 15000, typicalPf: 0.87, typicalPhases: 'TRIFASICO', defaultDescription: 'Inyectora / Extrusora de Plásticos' },
    ]
  },
  {
    categoryName: 'Procesos de Producción, Envasado y Empaque',
    options: [
      { value: 'ENVASADO', label: 'Línea de Envasado / Embotelladora / Selladora', category: 'Procesos', typicalPowerW: 4000, typicalPf: 0.86, defaultDescription: 'Línea de Envasado y Sellado' },
      { value: 'PRODUCCION', label: 'Línea de Producción Automatizada / PLC', category: 'Procesos', typicalPowerW: 8000, typicalPf: 0.88, typicalPhases: 'TRIFASICO', defaultDescription: 'Línea de Producción Automatizada' },
      { value: 'TEXTIL', label: 'Maquinaria de Confección / Manufactura', category: 'Procesos', typicalPowerW: 2200, typicalPf: 0.85, defaultDescription: 'Línea de Confección / Manufactura' },
    ]
  },
  {
    categoryName: 'Alumbrado y Servicios Eléctricos',
    options: [
      { value: 'ILUMINACION', label: 'Iluminación General LED / Paneles de Techo', category: 'Alumbrado', typicalPowerW: 1200, typicalPf: 0.95, typicalPhases: 'MONOFASICO', defaultDescription: 'Circuito de Iluminación LED General' },
      { value: 'ILUMINACION_POTENCIA', label: 'Alumbrado Alta Potencia / Proyectores / High-Bay', category: 'Alumbrado', typicalPowerW: 2800, typicalPf: 0.94, defaultDescription: 'Alumbrado de Alta Potencia / Reflectores' },
      { value: 'TOMACORRIENTES', label: 'Tomacorrientes de Uso General (2P+T 16A)', category: 'Servicios', typicalPowerW: 2200, typicalPf: 0.90, typicalPhases: 'MONOFASICO', defaultDescription: 'Circuito de Tomacorrientes Generales' },
      { value: 'TOMAS_INDUSTRIALES', label: 'Tomas Industriales de Fuerza (Schuko / Mennekes 32A)', category: 'Servicios', typicalPowerW: 6000, typicalPf: 0.85, defaultDescription: 'Tomas Industriales de Fuerza' },
    ]
  },
  {
    categoryName: 'Cómputo, IT y Electrónica de Potencia',
    options: [
      { value: 'ELECTRONICA', label: 'Servidores / Centro de Cómputo / Racks IT', category: 'IT', typicalPowerW: 3000, typicalPf: 0.92, typicalPhases: 'MONOFASICO', defaultDescription: 'Circuito Estabilizado Sala IT / Servidores' },
      { value: 'UPS', label: 'Sistema UPS / SAI / Respaldo Eléctrico', category: 'IT', typicalPowerW: 6000, typicalPf: 0.90, defaultDescription: 'Alimentador Sistema UPS' },
      { value: 'CARGADOR', label: 'Cargador de Baterías / Montacargas Eléctrico', category: 'IT', typicalPowerW: 8000, typicalPf: 0.88, typicalPhases: 'TRIFASICO', defaultDescription: 'Estación de Carga de Montacargas' },
    ]
  }
];

export const ElectricalProtectionAndPanelCalculator: React.FC = () => {
  const { diagnostic, addCircuit, addPanel } = useDiagnostic();

  // Mode: Manual load calculation vs Installation-wide summary
  const [calcMode, setCalcMode] = useState<'CIRCUIT' | 'INSTALLATION'>('CIRCUIT');

  // Input states for single circuit calculator
  const [loadPowerW, setLoadPowerW] = useState<number>(3500);
  const [voltage, setVoltage] = useState<number>(diagnostic.tariff.supplyVoltage || 220);
  const [phases, setPhases] = useState<'MONOFASICO' | 'TRIFASICO'>(diagnostic.tariff.phases || 'MONOFASICO');
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [lengthM, setLengthM] = useState<number>(20);
  const [loadType, setLoadType] = useState<string>('MOTOR');
  const [hasVFD, setHasVFD] = useState<boolean>(false);
  const [installationMethod, setInstallationMethod] = useState<'EMT' | 'PVC' | 'BANDEJA'>('EMT');
  const [insulation, setInsulation] = useState<'N2XH' | 'NH-80' | 'THW'>('N2XH');
  const [ambientTempC, setAmbientTempC] = useState<number>(30);
  const [description, setDescription] = useState<string>('Alimentador de Maquinaria');

  // States for panel / box sizing
  const [panelName, setPanelName] = useState<string>('Tablero de Distribución TD-1');
  const [panelLocation, setPanelLocation] = useState<string>('Zona de Producción');
  const [environmentType, setEnvironmentType] = useState<'SECO' | 'POLVO' | 'HUMEDO'>('POLVO');

  // Helper when selecting a load type to update sensible defaults
  const handleLoadTypeChange = (selectedVal: string) => {
    setLoadType(selectedVal);
    for (const group of LOAD_CATEGORIES) {
      const match = group.options.find(o => o.value === selectedVal);
      if (match) {
        // Update description if it's default or another preset's default
        const isPresetDesc = !description || 
          description === 'Alimentador de Maquinaria' || 
          LOAD_CATEGORIES.some(g => g.options.some(o => o.defaultDescription === description));
        if (isPresetDesc) {
          setDescription(match.defaultDescription);
        }
        setPowerFactor(match.typicalPf);
        if (match.typicalPhases) {
          setPhases(match.typicalPhases);
        }
        break;
      }
    }
  };

  // Calculations for Single Circuit:
  const circuitCalc = useMemo(() => {
    const P = Math.max(10, loadPowerW);
    const V = Math.max(110, voltage);
    const fp = Math.max(0.5, Math.min(1.0, powerFactor));
    const is3ph = phases === 'TRIFASICO';

    // 1. Nominal operating current (Ib)
    const Ib = is3ph 
      ? P / (Math.sqrt(3) * V * fp)
      : P / (V * fp);

    // 2. Continuous load / Motor starting factor
    const motorLoads = [
      'MOTOR', 'COMPRESOR', 'BOMBA', 'VENTILADOR', 'TRANSPORTE', 
      'MECANIZADO', 'MOLINO', 'PRENSA', 'GRUA', 'CLIMATIZACION', 
      'REFRIGERACION', 'EXTRACCION', 'PLASTICO', 'ENVASADO', 
      'PRODUCCION', 'TEXTIL'
    ];
    const isMotor = motorLoads.includes(loadType);
    let designFactor = 1.0;
    if (isMotor) {
      designFactor = 1.25; // CNE 050.106 / CNE 160.100 para motores y cargas continuas
    } else if (loadType === 'SOLDADURA' || loadType === 'CARGADOR' || loadType === 'UPS') {
      designFactor = 1.25;
    } else if (loadType === 'ILUMINACION' || loadType === 'ILUMINACION_POTENCIA') {
      designFactor = 1.15;
    }
    const I_design = Ib * designFactor;

    // 3. Recommended ITM standard rating (In)
    // Commercial ratings: 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250
    const STANDARD_BREAKERS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400];
    const breakerA = STANDARD_BREAKERS.find(r => r >= I_design) || 400;

    // 4. ITM Curve: B (electronics), C (general/lighting), D (motors/transformers)
    let breakerCurve = 'C';
    const highInrushLoads = [
      'MOTOR', 'COMPRESOR', 'BOMBA', 'VENTILADOR', 'TRANSPORTE', 
      'MECANIZADO', 'MOLINO', 'PRENSA', 'GRUA', 'SOLDADURA', 
      'REFRIGERACION', 'PLASTICO'
    ];
    if (highInrushLoads.includes(loadType) && !hasVFD) {
      breakerCurve = 'D'; // High inrush current (10 - 14 In)
    } else if (loadType === 'ELECTRONICA') {
      breakerCurve = 'C';
    }

    // 5. Conductor selection (Iz >= In)
    // Approximate copper ampacity in conduit at 30°C
    const WIRE_TABLE = [
      { section: 2.5, ampacity: 24 },
      { section: 4.0, ampacity: 32 },
      { section: 6.0, ampacity: 41 },
      { section: 10.0, ampacity: 57 },
      { section: 16.0, ampacity: 76 },
      { section: 25.0, ampacity: 101 },
      { section: 35.0, ampacity: 125 },
      { section: 50.0, ampacity: 151 },
      { section: 70.0, ampacity: 192 },
      { section: 95.0, ampacity: 232 },
      { section: 120.0, ampacity: 269 }
    ];

    // Temperature derating factor
    let tempFactor = 1.0;
    if (ambientTempC > 30) {
      tempFactor = Math.sqrt((70 - ambientTempC) / 40);
    }

    const selectedWire = WIRE_TABLE.find(w => (w.ampacity * tempFactor) >= breakerA) || WIRE_TABLE[WIRE_TABLE.length - 1];
    const Iz = Number((selectedWire.ampacity * tempFactor).toFixed(1));

    // Ground conductor (CNE Regla 060.504)
    let groundSection = selectedWire.section;
    if (breakerA <= 20) groundSection = 2.5;
    else if (breakerA <= 30) groundSection = 4.0;
    else if (breakerA <= 60) groundSection = 6.0;
    else if (breakerA <= 100) groundSection = 10.0;
    else if (breakerA <= 200) groundSection = 16.0;
    else groundSection = 25.0;

    // 6. Voltage Drop calculation
    // Resistivity of copper at 70°C ~ 0.021 ohm*mm2/m
    const rho = 0.021;
    const L = Math.max(1, lengthM);
    let deltaV = 0;
    if (is3ph) {
      deltaV = (Math.sqrt(3) * Ib * L * rho * fp) / selectedWire.section;
    } else {
      deltaV = (2 * Ib * L * rho * fp) / selectedWire.section;
    }
    const deltaVPercent = (deltaV / V) * 100;
    const isVoltageDropOk = deltaVPercent <= 2.5; // CNE rule max 2.5% for feeder / 4.0% total

    // 7. Residual Current Device (Diferencial ID / RCD)
    // Rule: In_RCD >= In_ITM to prevent thermal overload of RCD
    const STANDARD_RCDS = [25, 40, 63, 80, 100];
    const rcdA = STANDARD_RCDS.find(r => r >= breakerA) || 100;
    const rcdSensitivity = 30; // 30 mA per CNE 020.132

    let rcdType = 'AC';
    let rcdReason = 'Cargas resistivas e iluminación estándar';
    const superimmuneLoads = ['ELECTRONICA', 'UPS', 'CARGADOR', 'PRODUCCION'];
    if (hasVFD || superimmuneLoads.includes(loadType)) {
      rcdType = 'SUPERINMUNIZADO (Tipo F / B / SI)';
      rcdReason = 'Protección contra disparos intempestivos por armónicos y corrientes DC pulsantes de variadores VFD / fuentes conmutadas';
    } else if (isMotor || loadType === 'TOMACORRIENTES' || loadType === 'TOMAS_INDUSTRIALES' || loadType === 'SOLDADURA') {
      rcdType = 'Tipo A';
      rcdReason = 'Cargas monofásicas/trifásicas con componentes rectificadas, arrancadores y corrientes pulsantes';
    }

    // Number of DIN poles
    const itmPoles = is3ph ? 3 : 2;
    const rcdPoles = is3ph ? 4 : 2;

    return {
      Ib: Number(Ib.toFixed(2)),
      I_design: Number(I_design.toFixed(2)),
      breakerA,
      breakerCurve,
      breakingCapacityKa: 10,
      itmPoles,
      wireSection: selectedWire.section,
      groundSection,
      Iz,
      deltaV: Number(deltaV.toFixed(2)),
      deltaVPercent: Number(deltaVPercent.toFixed(2)),
      isVoltageDropOk,
      rcdA,
      rcdSensitivity,
      rcdType,
      rcdReason,
      rcdPoles
    };
  }, [loadPowerW, voltage, phases, powerFactor, lengthM, loadType, hasVFD, ambientTempC]);

  // Calculations for Installation-Wide Panel & Box Sizing:
  const installationSizing = useMemo(() => {
    const circuits = diagnostic.circuits;
    const totalCircuitsCount = Math.max(circuits.length, 1);
    const totalPowerW = circuits.reduce((sum, c) => sum + (c.connectedPowerW || 0), 0);
    const is3ph = diagnostic.tariff.phases === 'TRIFASICO';
    const V = diagnostic.tariff.supplyVoltage || 220;

    // Estimate Main Switch (ITM General)
    const totalIb = is3ph 
      ? totalPowerW / (Math.sqrt(3) * V * 0.85)
      : totalPowerW / (V * 0.85);

    // Coincidence factor for multiple circuits (0.75 - 0.85)
    const coincidenceFactor = 0.80;
    const demandCurrentA = totalIb * coincidenceFactor;

    const STANDARD_BREAKERS = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400];
    const mainBreakerA = STANDARD_BREAKERS.find(r => r >= demandCurrentA) || 100;

    // Poles Calculation for Enclosure Box:
    // Main Breaker (2P or 3P/4P) + Surge Protector DPS (2P or 4P) + Sub-breakers + RCDs
    const mainBreakerPoles = is3ph ? 3 : 2;
    const dpsPoles = is3ph ? 4 : 2;
    
    // Each circuit has its ITM
    let circuitPolesTotal = 0;
    circuits.forEach(c => {
      circuitPolesTotal += (c.phases === 'TRIFASICO' ? 3 : 2);
    });
    if (circuitPolesTotal === 0) circuitPolesTotal = totalCircuitsCount * (is3ph ? 3 : 2);

    // Estimated RCDs (1 RCD per 3 circuits or 1 per circuit)
    const rcdCount = Math.ceil(totalCircuitsCount / 2.5);
    const rcdPolesTotal = rcdCount * (is3ph ? 4 : 2);

    // Subtotal Active Poles
    const activePoles = mainBreakerPoles + dpsPoles + circuitPolesTotal + rcdPolesTotal;

    // CNE Rule 080.010 Reserve Requirement (+30% reserve space)
    const reservePoles = Math.max(4, Math.ceil(activePoles * 0.30));
    const totalRequiredPoles = activePoles + reservePoles;

    // Standard Commercial DIN Enclosure Sizes: 8, 12, 18, 24, 36, 48, 54, 72, 96
    const COMMERCIAL_BOX_SIZES = [8, 12, 18, 24, 36, 48, 54, 72, 96];
    const recommendedBoxSize = COMMERCIAL_BOX_SIZES.find(size => size >= totalRequiredPoles) || 96;

    // How many panels / distribution boards are recommended?
    // Rule of thumb:
    // - Under 15kW and single zone -> 1 Tablero General de Distribución (TGD)
    // - Over 15kW or multiple zones -> 1 Tablero General (TG) + N Subtableros (TD-1, TD-2, TD-Fuerza, etc.)
    let recommendedPanelCount = 1;
    let panelHierarchyRationale = '';
    
    if (totalPowerW > 25000 || totalCircuitsCount > 12) {
      recommendedPanelCount = 3;
      panelHierarchyRationale = 'Instalación de alta demanda (>25kW). Se recomienda 1 Tablero General (TG) en acometida + 1 Subtablero de Fuerza/Maquinaria (TD-Fuerza) + 1 Subtablero de Alumbrado/Tomacorrientes (TD-Servicios).';
    } else if (totalPowerW > 12000 || totalCircuitsCount > 6) {
      recommendedPanelCount = 2;
      panelHierarchyRationale = 'Instalación de mediana demanda (>12kW). Se recomienda 1 Tablero General (TG) + 1 Subtablero de Distribución Seccional (TD-1) en el área de trabajo para evitar caídas de tensión.';
    } else {
      recommendedPanelCount = 1;
      panelHierarchyRationale = 'Instalación compacta (≤12kW). Un solo Tablero General de Distribución (TGD) integrado es suficiente para albergar todas las protecciones con 30% de reserva.';
    }

    // IP Enclosure Rating recommendation
    let enclosureRating = 'Metálico IP40 (Adosable / Empotrable)';
    if (environmentType === 'POLVO') {
      enclosureRating = 'Gabinete Metálico Estanco IP55 / IP65 con empaquetadura (Protegido contra polvo, virutas y partículas industriales en suspensión)';
    } else if (environmentType === 'HUMEDO') {
      enclosureRating = 'Gabinete Termoplástico / Policarbonato Estanco IP66 (Resistente a humedad y químicos)';
    }

    return {
      totalPowerW,
      totalCircuitsCount,
      mainBreakerA,
      mainBreakerPoles,
      dpsPoles,
      circuitPolesTotal,
      rcdCount,
      rcdPolesTotal,
      activePoles,
      reservePoles,
      totalRequiredPoles,
      recommendedBoxSize,
      recommendedPanelCount,
      panelHierarchyRationale,
      enclosureRating
    };
  }, [diagnostic.circuits, diagnostic.tariff, environmentType]);

  // Handle adding calculated circuit to project
  const [addedSuccess, setAddedSuccess] = useState<string | null>(null);

  const handleAddCalculatedCircuit = () => {
    const nextCode = `C-${(diagnostic.circuits.length + 1).toString().padStart(2, '0')}`;
    
    // Determine mapping to CircuitLoadType
    const motorLoadsList = [
      'MOTOR', 'COMPRESOR', 'BOMBA', 'VENTILADOR', 'TRANSPORTE', 
      'MECANIZADO', 'MOLINO', 'PRENSA', 'GRUA', 'CLIMATIZACION', 
      'REFRIGERACION', 'EXTRACCION', 'PLASTICO', 'ENVASADO', 
      'PRODUCCION', 'TEXTIL'
    ];
    const isMotorCalculated = motorLoadsList.includes(loadType);

    let mappedLoadType: any = 'MAQUINA_ESPECIAL';
    if (loadType.startsWith('ILUMINACION')) {
      mappedLoadType = 'ILUMINACION';
    } else if (loadType.includes('TOMACORRIENTES') || loadType.includes('TOMAS')) {
      mappedLoadType = 'TOMACORRIENTES';
    } else if (loadType === 'CLIMATIZACION' || loadType === 'REFRIGERACION' || loadType === 'EXTRACCION') {
      mappedLoadType = 'CLIMATIZACION';
    } else if (isMotorCalculated) {
      mappedLoadType = 'MOTOR';
    } else {
      mappedLoadType = 'MAQUINA_ESPECIAL';
    }

    const newCircuit: Omit<CircuitRecord, 'id'> = {
      panelId: diagnostic.panels[0]?.id || 'TG-01',
      circuitCode: nextCode,
      description: `${description} (${(loadType || 'CARGA').replace(/_/g, ' ')})`,
      loadType: mappedLoadType,
      connectedPowerW: loadPowerW,
      voltage,
      phases,
      calculatedCurrentA: circuitCalc.Ib,
      measuredCurrentA: circuitCalc.Ib * 0.95,
      isMotor: isMotorCalculated,
      powerFactor,
      lengthM,
      wireMaterial: 'COBRE',
      wireInsulation: insulation,
      wireSectionMm2: circuitCalc.wireSection,
      groundWireMm2: circuitCalc.groundSection,
      conduitType: installationMethod,
      ambientTempC,
      groupingFactor: 1.0,
      wireAdmissibleAmpacityA: circuitCalc.Iz,
      voltageDropV: circuitCalc.deltaV,
      voltageDropPercent: circuitCalc.deltaVPercent,
      maxAllowedVoltageDropPercent: 2.5,
      breakerExistingA: circuitCalc.breakerA,
      breakerRecommendedA: circuitCalc.breakerA,
      breakerCurve: circuitCalc.breakerCurve,
      breakerPoles: circuitCalc.itmPoles,
      breakerBreakingKa: circuitCalc.breakingCapacityKa,
      rcdExistingA: circuitCalc.rcdA,
      rcdRecommendedA: circuitCalc.rcdA,
      rcdSensitivityMa: circuitCalc.rcdSensitivity,
      rcdType: circuitCalc.rcdType.includes('A') ? 'A' : 'AC',
      wireStatus: 'ADECUADO',
      voltageDropStatus: circuitCalc.isVoltageDropOk ? 'ADECUADO' : 'NO_ADECUADO',
      breakerStatus: 'ADECUADO',
      rcdStatus: 'ADECUADO',
      technicalJustification: `Calculado según CNE Utilización: Ib=${circuitCalc.Ib}A, ITM=${circuitCalc.breakerA}A Curva ${circuitCalc.breakerCurve}, Cable=${circuitCalc.wireSection}mm², ID=${circuitCalc.rcdA}A/30mA`,
      confidence: 'CALCULADO'
    };

    addCircuit(newCircuit);
    setAddedSuccess(`¡Circuito ${nextCode} agregado con éxito a la lista de circuitos!`);
    setTimeout(() => setAddedSuccess(null), 4000);
  };

  const handleAddCalculatedPanel = () => {
    const nextPanelCode = `TD-0${diagnostic.panels.length + 1}`;
    const newPanel: Omit<PanelRecord, 'id'> = {
      code: nextPanelCode,
      name: panelName || `Tablero de Distribución ${nextPanelCode}`,
      panelType: 'TABLERO_SECUNDARIO',
      location: panelLocation || 'Área de Trabajo',
      voltage: diagnostic.tariff.supplyVoltage || 220,
      phases: diagnostic.tariff.phases || 'TRIFASICO',
      capacityA: installationSizing.mainBreakerA,
      mainBreakerRatingA: installationSizing.mainBreakerA,
      mainBreakerPoles: installationSizing.mainBreakerPoles,
      shortCircuitKa: 10,
      circuitCount: installationSizing.recommendedBoxSize,
      enclosureType: installationSizing.enclosureRating,
      hasGroundBar: true,
      hasSurgeProtector: true,
      observations: `Gabinete dimensionado para ${installationSizing.recommendedBoxSize} polos DIN (+30% reserva CNE 080.010)`
    };

    addPanel(newPanel);
    setAddedSuccess(`¡Tablero ${nextPanelCode} creado exitosamente con capacidad de ${installationSizing.recommendedBoxSize} polos!`);
    setTimeout(() => setAddedSuccess(null), 4000);
  };

  return (
    <div className="rounded-3xl border border-indigo-200 bg-linear-to-b from-indigo-50/60 via-white to-white p-6 shadow-sm space-y-6">
      
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
              Calculadora y Dimensionador de Protecciones (ITM, ID) y Cajas/Tableros
              <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                CNE 2006
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Dimensionamiento normativo de interruptores termomagnéticos, diferenciales 30mA, conductores y capacidad de gabinetes DIN
            </p>
          </div>
        </div>

        <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setCalcMode('CIRCUIT')}
            className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              calcMode === 'CIRCUIT'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dimensionar por Circuito / Carga
          </button>
          <button
            type="button"
            onClick={() => setCalcMode('INSTALLATION')}
            className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              calcMode === 'INSTALLATION'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dimensionar Tableros Globales ({diagnostic.circuits.length} cir)
          </button>
        </div>
      </div>

      {addedSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{addedSuccess}</span>
        </div>
      )}

      {calcMode === 'CIRCUIT' ? (
        /* MODE 1: Single Circuit Sizing */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Input Parameters (5 columns) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4.5 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span>1. Parámetros de la Carga</span>
              <span className="text-[10px] text-indigo-600 font-mono">Entrada de Datos</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción de la Carga / Máquina</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. Compresor de tornillo / Electrobomba / Centro CNC / Envasadora / Horno / Climatización"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Potencia de Carga (W)</label>
                  <input
                    type="number"
                    value={loadPowerW}
                    onChange={(e) => setLoadPowerW(Number(e.target.value))}
                    min={50}
                    step={100}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-indigo-700 focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">{(loadPowerW / 1000).toFixed(2)} kW ({ (loadPowerW / 746).toFixed(1) } HP)</div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Carga</label>
                  <select
                    value={loadType}
                    onChange={(e) => handleLoadTypeChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs focus:border-indigo-500 focus:outline-none font-medium"
                  >
                    {LOAD_CATEGORIES.map(group => (
                      <optgroup key={group.categoryName} label={group.categoryName}>
                        {group.options.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tensión (V)</label>
                  <select
                    value={voltage}
                    onChange={(e) => setVoltage(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={220}>220 V</option>
                    <option value={380}>380 V (Trifásico + N)</option>
                    <option value={440}>440 V (Industrial)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sistema de Fases</label>
                  <select
                    value={phases}
                    onChange={(e) => setPhases(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="MONOFASICO">Monofásico (1Ø)</option>
                    <option value="TRIFASICO">Trifásico (3Ø)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Factor de Potencia (cos φ)</label>
                  <input
                    type="number"
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(Number(e.target.value))}
                    min={0.5}
                    max={1.0}
                    step={0.05}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitud Alimentador (m)</label>
                  <input
                    type="number"
                    value={lengthM}
                    onChange={(e) => setLengthM(Number(e.target.value))}
                    min={1}
                    max={200}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hasVfd"
                  checked={hasVFD}
                  onChange={(e) => setHasVFD(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="hasVfd" className="text-xs text-slate-700 font-medium">
                  ¿Usa Variador de Frecuencia (VFD) o Arrancador Electrónico?
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Aislamiento Conductor</label>
                  <select
                    value={insulation}
                    onChange={(e) => setInsulation(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="N2XH">N2XH (Cero Halógenos 90°C)</option>
                    <option value="NH-80">NH-80 (Libre Halógenos 80°C)</option>
                    <option value="THW">THW-90 (PVC 90°C)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Canalización</label>
                  <select
                    value={installationMethod}
                    onChange={(e) => setInstallationMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="EMT">Tubería Metálica EMT</option>
                    <option value="PVC">Tubo PVC Pesado (SAP)</option>
                    <option value="BANDEJA">Bandeja Portacables</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results: Sized Protections & Wire (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
              <span>2. Resultados del Dimensionamiento Normativo</span>
              <span className="text-[10px] text-emerald-600 font-bold">Criterio CNE: Ib ≤ In ≤ Iz</span>
            </div>

            {/* Grid of 3 key results */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* ITM Breaker Card */}
              <div className="rounded-2xl border border-indigo-300 bg-indigo-50/40 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Termomagnético (ITM)</span>
                    <span className="rounded-md bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white font-mono">
                      {circuitCalc.itmPoles}P
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                    {circuitCalc.breakerA} A
                  </div>
                  <div className="text-xs font-bold text-indigo-800 mt-0.5">
                    Curva {circuitCalc.breakerCurve} • {circuitCalc.breakingCapacityKa} kA
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-600 border-t border-indigo-100 pt-2 leading-tight">
                  Ib = {circuitCalc.Ib} A <br />
                  Diseño (x1.25) = {circuitCalc.I_design} A
                </div>
              </div>

              {/* RCD Differential Card */}
              <div className="rounded-2xl border border-teal-300 bg-teal-50/40 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Diferencial (ID)</span>
                    <span className="rounded-md bg-teal-600 px-1.5 py-0.5 text-[9px] font-bold text-white font-mono">
                      {circuitCalc.rcdPoles}P
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                    {circuitCalc.rcdA} A
                  </div>
                  <div className="text-xs font-bold text-teal-800 mt-0.5">
                    Δn = {circuitCalc.rcdSensitivity} mA
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-600 border-t border-teal-100 pt-2 leading-tight">
                  Tipo: <strong className="text-slate-800">{circuitCalc.rcdType}</strong>
                </div>
              </div>

              {/* Cable Conductor Card */}
              <div className="rounded-2xl border border-amber-300 bg-amber-50/40 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Conductor Cobre</span>
                    <span className="rounded-md bg-amber-600 px-1.5 py-0.5 text-[9px] font-bold text-white font-mono">
                      {insulation}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                    {circuitCalc.wireSection} mm²
                  </div>
                  <div className="text-xs font-bold text-amber-900 mt-0.5">
                    Tierra: {circuitCalc.groundSection} mm²
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-600 border-t border-amber-100 pt-2 leading-tight">
                  Iz = {circuitCalc.Iz} A <br />
                  ΔV = {circuitCalc.deltaVPercent}% ({circuitCalc.isVoltageDropOk ? 'Conforme <2.5%' : 'Excesivo'})
                </div>
              </div>

            </div>

            {/* Detailed Justification Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
              <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Cumplimiento Normativo CNE Utilización:</span>
              </h5>
              
              <ul className="space-y-1 text-slate-600 text-[11px] list-disc pl-4 leading-relaxed">
                <li>
                  <strong>Protección contra sobrecargas:</strong> Corriente nominal de carga <span className="font-mono font-bold text-slate-800">{circuitCalc.Ib}A</span> &le; ITM <span className="font-mono font-bold text-indigo-700">{circuitCalc.breakerA}A</span> &le; Capacidad del cable Iz <span className="font-mono font-bold text-amber-800">{circuitCalc.Iz}A</span>.
                </li>
                <li>
                  <strong>Protección diferencial de personas:</strong> Interruptor diferencial de <span className="font-mono font-bold text-teal-800">{circuitCalc.rcdA}A / 30mA</span> ({circuitCalc.rcdReason}).
                </li>
                <li>
                  <strong>Caída de tensión:</strong> Conductor de <span className="font-mono font-bold text-slate-800">{circuitCalc.wireSection} mm²</span> a <span className="font-mono font-bold text-slate-800">{lengthM} metros</span> produce una caída de <span className="font-mono font-bold text-slate-800">{circuitCalc.deltaV} V ({circuitCalc.deltaVPercent}%)</span>, dentro del límite de 2.5% para alimentadores derivados.
                </li>
              </ul>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleAddCalculatedCircuit}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar como Circuito al Proyecto</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* MODE 2: Global Installation Panel & Box Sizing */
        <div className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Potencia Total Conectada</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">
                {(installationSizing.totalPowerW / 1000).toFixed(2)} kW
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{installationSizing.totalCircuitsCount} circuitos registrados</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interruptor Principal Sugerido</div>
              <div className="text-xl font-black text-indigo-600 font-mono mt-1">
                {installationSizing.mainBreakerA} A
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{installationSizing.mainBreakerPoles} Polos (Capacidad acometida)</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Polos Activos + Reserva 30%</div>
              <div className="text-xl font-black text-amber-600 font-mono mt-1">
                {installationSizing.activePoles} + {installationSizing.reservePoles} = {installationSizing.totalRequiredPoles} Polos
              </div>
              <div className="text-xs text-slate-500 mt-0.5">CNE Regla 080.010</div>
            </div>

            <div className="rounded-2xl border border-indigo-300 bg-indigo-50/50 p-4">
              <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Caja / Gabinete Comercial</div>
              <div className="text-xl font-black text-indigo-700 font-mono mt-1">
                {installationSizing.recommendedBoxSize} Polos DIN
              </div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Capacidad estándar comercial</div>
            </div>
          </div>

          {/* Architecture & Recommendation Banner */}
          <div className="rounded-2xl border border-indigo-200 bg-linear-to-r from-indigo-50 via-white to-teal-50 p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
                <Box className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Estructura y Número de Tableros Recomendados para esta Instalación:
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {installationSizing.panelHierarchyRationale}
                </p>
                <div className="mt-2 text-xs font-medium text-slate-600 flex flex-wrap gap-2">
                  <span className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg">
                    📦 <strong>Envolvente Sugerida:</strong> {installationSizing.enclosureRating}
                  </span>
                  <span className="bg-white/80 border border-slate-200 px-2.5 py-1 rounded-lg">
                    ⚡ <strong>Mínimo de Interruptores Diferenciales:</strong> {installationSizing.rcdCount} unidades (30mA)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Create New Sized Panel Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Crear Nuevo Tablero con Dimensionamiento Automático
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Tablero</label>
                <input
                  type="text"
                  value={panelName}
                  onChange={(e) => setPanelName(e.target.value)}
                  placeholder="Ej. Tablero General TG / TD-Fuerza"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubicación Física</label>
                <input
                  type="text"
                  value={panelLocation}
                  onChange={(e) => setPanelLocation(e.target.value)}
                  placeholder="Ej. Ingreso Principal / Nave de Corte"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condición Ambiental (Protección IP)</label>
                <select
                  value={environmentType}
                  onChange={(e) => setEnvironmentType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="POLVO">Taller con Polvo / Aserrín (IP55/IP65)</option>
                  <option value="SECO">Ambiente Interior Seco / Oficina (IP40)</option>
                  <option value="HUMEDO">Ambiente Húmedo / Químicos (IP66)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={handleAddCalculatedPanel}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Crear Tablero de {installationSizing.recommendedBoxSize} Polos en el Proyecto</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
