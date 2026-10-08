import React, { useState, useEffect, useMemo } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Cable,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Flame,
  Gauge,
  Home,
  Building2,
  SlidersHorizontal,
  Thermometer,
  Info,
  RotateCcw,
  FileBadge,
  Activity,
  Wrench
} from 'lucide-react';

export interface WiringCircuitItem {
  id: string;
  code: string;
  zoneName: string;
  usageType: 'ALUMBRADO' | 'TOMACORRIENTES' | 'COCINA_CALor' | 'DUCHA_TERMA' | 'AIRE_ACONDICIONADO' | 'MOTORES_BOMBAS' | 'COMPUTO_TI' | 'ALIMENTADOR';
  cableType: 'NH-80_LSOH' | 'THW-90' | 'TW-80' | 'N2XOH' | 'NLT_VULCANIZADO' | 'GPT_AUTO' | 'MELLIZO' | 'ALAMBRE_ANTIGUO';
  cableGauge: '16_AWG' | '14_AWG' | '2.5_MM2' | '12_AWG' | '4_MM2' | '10_AWG' | '6_MM2' | '8_AWG' | '10_MM2' | '6_AWG' | '4_AWG' | '2_AWG';
  phaseColor: 'ROJO' | 'NEGRO' | 'AZUL' | 'MARRON' | 'BLANCO' | 'AMARILLO' | 'VERDE';
  neutralColor: 'BLANCO' | 'GRIS' | 'CELESTE' | 'NEGRO' | 'ROJO' | 'SIN_NEUTRO';
  groundColor: 'VERDE_AMARILLO' | 'VERDE' | 'DESNUDO' | 'OTRO_COLOR' | 'SIN_TIERRA';
  measuredCurrentA: number;
  lengthMeters: number;
  breakerAmps: number; // 0 = Sin llave, -1 = Llave cuchilla/plomo
  breakerPoles: '1P' | '2P' | '3P';
  breakerCurve: 'B' | 'C' | 'D';
  rcdProtection: 'PROPIO_30MA' | 'GENERAL_30MA' | 'SELECTIVO_300MA' | 'SIN_DIFERENCIAL';
  otherSwitch: 'NINGUNA' | 'GUARDAMOTOR_CONTACTOR' | 'RELE_TERMICO' | 'TEMPORIZADOR' | 'UPS_ESTABILIZADOR' | 'SECCIONADOR';
  conduitType: 'PVC_P_EMPOTRADO' | 'EMT_METALICO' | 'CANALETA_PVC' | 'BANDEJA' | 'CABLE_EXPUESTO';
  spliceCondition: 'OPTIMO_BORNERA' | 'REGULAR_CINTA' | 'CRITICO_RECALENTADO';
  temperatureC: number;
}

export interface MainBoardConfig {
  propertyCategory: 'CASA_VIVIENDA' | 'EMPRESA_OFICINA' | 'LOCAL_COMERCIAL' | 'PLANTA_TALLER';
  supplySystem: 'MONOFASICO_220V' | 'TRIFASICO_220V' | 'TRIFASICO_380V';
  feederCableType: string;
  feederGauge: string;
  mainBreakerAmps: number; // -1 = Llave cuchilla
  mainBreakerPoles: '2P' | '3P' | '4P';
  mainBreakerCurve: 'B' | 'C' | 'D';
  mainBreakerKa: number;
  mainRcdStatus: 'OPERATIVO' | 'SIN_DIFERENCIAL' | 'AVERIADO_TEST_FALLA' | 'PUENTEADO';
  mainRcdSensitivityMa: 10 | 30 | 100 | 300;
  mainRcdAmps: number;
  mainRcdClass: 'AC' | 'A' | 'F_SUPERINMUNIZADO';
  hasSurgeProtectorSpd: boolean;
  hasVoltageRelay: boolean;
  hasIndependentGroundBar: boolean;
  hasDeadFrontCover: boolean;
  hasCircuitDirectory: boolean;
  hasTimerOrContactor: boolean;
}

const GAUGE_INFO: Record<WiringCircuitItem['cableGauge'], { label: string; sectionMm2: number; baseAmpacity90C: number; baseAmpacity80C: number }> = {
  '16_AWG': { label: '16 AWG (1.31 mm²)', sectionMm2: 1.31, baseAmpacity90C: 12, baseAmpacity80C: 10 },
  '14_AWG': { label: '14 AWG (2.08 mm²)', sectionMm2: 2.08, baseAmpacity90C: 18, baseAmpacity80C: 15 },
  '2.5_MM2': { label: '2.5 mm² (~13 AWG)', sectionMm2: 2.5, baseAmpacity90C: 21, baseAmpacity80C: 18 },
  '12_AWG': { label: '12 AWG (3.31 mm²)', sectionMm2: 3.31, baseAmpacity90C: 25, baseAmpacity80C: 20 },
  '4_MM2': { label: '4.0 mm² (~11 AWG)', sectionMm2: 4.0, baseAmpacity90C: 28, baseAmpacity80C: 25 },
  '10_AWG': { label: '10 AWG (5.26 mm²)', sectionMm2: 5.26, baseAmpacity90C: 35, baseAmpacity80C: 30 },
  '6_MM2': { label: '6.0 mm² (~9 AWG)', sectionMm2: 6.0, baseAmpacity90C: 38, baseAmpacity80C: 32 },
  '8_AWG': { label: '8 AWG (8.37 mm²)', sectionMm2: 8.37, baseAmpacity90C: 50, baseAmpacity80C: 40 },
  '10_MM2': { label: '10.0 mm² (~7 AWG)', sectionMm2: 10.0, baseAmpacity90C: 58, baseAmpacity80C: 50 },
  '6_AWG': { label: '6 AWG (13.3 mm²)', sectionMm2: 13.3, baseAmpacity90C: 65, baseAmpacity80C: 55 },
  '4_AWG': { label: '4 AWG (21.2 mm²)', sectionMm2: 21.2, baseAmpacity90C: 85, baseAmpacity80C: 70 },
  '2_AWG': { label: '2 AWG (33.6 mm²)', sectionMm2: 33.6, baseAmpacity90C: 115, baseAmpacity80C: 95 }
};

const COLOR_SWATCHES: Record<string, { bg: string; border: string; text: string; nameEs: string; nameEn: string; namePt: string }> = {
  ROJO: { bg: '#ef4444', border: '#b91c1c', text: '#ffffff', nameEs: 'Rojo (Fase L1 CNE)', nameEn: 'Red (Phase L1 NEC)', namePt: 'Vermelho (Fase L1)' },
  NEGRO: { bg: '#1e293b', border: '#0f172a', text: '#ffffff', nameEs: 'Negro (Fase L2 CNE)', nameEn: 'Black (Phase L2 NEC)', namePt: 'Preto (Fase L2)' },
  AZUL: { bg: '#2563eb', border: '#1d4ed8', text: '#ffffff', nameEs: 'Azul (Fase L3 CNE)', nameEn: 'Blue (Phase L3 NEC)', namePt: 'Azul (Fase L3)' },
  MARRON: { bg: '#78350f', border: '#451a03', text: '#ffffff', nameEs: 'Marrón (IEC)', nameEn: 'Brown (IEC)', namePt: 'Marrom (IEC)' },
  BLANCO: { bg: '#f8fafc', border: '#94a3b8', text: '#0f172a', nameEs: 'Blanco (Neutro CNE)', nameEn: 'White (Neutral NEC)', namePt: 'Branco (Neutro)' },
  GRIS: { bg: '#94a3b8', border: '#475569', text: '#0f172a', nameEs: 'Gris Natural (Neutro CNE)', nameEn: 'Natural Gray (Neutral)', namePt: 'Cinza Natural (Neutro)' },
  CELESTE: { bg: '#38bdf8', border: '#0284c7', text: '#0f172a', nameEs: 'Celeste (Neutro IEC)', nameEn: 'Light Blue (Neutral IEC)', namePt: 'Azul Claro (Neutro NBR)' },
  AMARILLO: { bg: '#eab308', border: '#a16207', text: '#0f172a', nameEs: 'Amarillo', nameEn: 'Yellow', namePt: 'Amarelo' },
  VERDE: { bg: '#16a34a', border: '#15803d', text: '#ffffff', nameEs: 'Verde (Tierra PE CNE)', nameEn: 'Green (Ground PE)', namePt: 'Verde (Terra PE)' },
  VERDE_AMARILLO: { bg: 'linear-gradient(135deg, #16a34a 50%, #eab308 50%)', border: '#15803d', text: '#ffffff', nameEs: 'Verde/Amarillo (Tierra CNE)', nameEn: 'Green/Yellow (Ground PE)', namePt: 'Verde/Amarelo (Terra PE)' },
  DESNUDO: { bg: '#d97706', border: '#92400e', text: '#ffffff', nameEs: 'Cobre Desnudo (Tierra)', nameEn: 'Bare Copper (Ground)', namePt: 'Cobre Nu (Terra)' },
  OTRO_COLOR: { bg: '#a855f7', border: '#7e22ce', text: '#ffffff', nameEs: 'Otro Color (Fuera de Norma)', nameEn: 'Other Color (Non-compliant)', namePt: 'Outra Cor (Fora da Norma)' },
  SIN_NEUTRO: { bg: '#e2e8f0', border: '#cbd5e1', text: '#475569', nameEs: 'Sin Neutro (Bifásico/Delta)', nameEn: 'No Neutral (2-Phase/Delta)', namePt: 'Sem Neutro (Bifásico/Delta)' },
  SIN_TIERRA: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', nameEs: 'SIN CABLE DE TIERRA (Riesgo)', nameEn: 'NO GROUND WIRE (Hazard)', namePt: 'SEM CABO DE TERRA (Risco)' }
};

const DEFAULT_HOUSE_PRESET: { board: MainBoardConfig; circuits: WiringCircuitItem[] } = {
  board: {
    propertyCategory: 'CASA_VIVIENDA',
    supplySystem: 'MONOFASICO_220V',
    feederCableType: 'THW-90',
    feederGauge: '10_AWG',
    mainBreakerAmps: 40,
    mainBreakerPoles: '2P',
    mainBreakerCurve: 'C',
    mainBreakerKa: 6,
    mainRcdStatus: 'OPERATIVO',
    mainRcdSensitivityMa: 30,
    mainRcdAmps: 40,
    mainRcdClass: 'AC',
    hasSurgeProtectorSpd: false,
    hasVoltageRelay: false,
    hasIndependentGroundBar: true,
    hasDeadFrontCover: true,
    hasCircuitDirectory: false,
    hasTimerOrContactor: false
  },
  circuits: [
    {
      id: 'w-1',
      code: 'C-1',
      zoneName: 'Alumbrado Interior y Exterior (Sala, Comedor, Dormitorios)',
      usageType: 'ALUMBRADO',
      cableType: 'THW-90',
      cableGauge: '14_AWG',
      phaseColor: 'ROJO',
      neutralColor: 'BLANCO',
      groundColor: 'VERDE_AMARILLO',
      measuredCurrentA: 6.4,
      lengthMeters: 22,
      breakerAmps: 15,
      breakerPoles: '2P',
      breakerCurve: 'C',
      rcdProtection: 'GENERAL_30MA',
      otherSwitch: 'NINGUNA',
      conduitType: 'PVC_P_EMPOTRADO',
      spliceCondition: 'OPTIMO_BORNERA',
      temperatureC: 31
    },
    {
      id: 'w-2',
      code: 'C-2',
      zoneName: 'Tomacorrientes Generales (Sala, Dormitorios, TV, Estudio)',
      usageType: 'TOMACORRIENTES',
      cableType: 'THW-90',
      cableGauge: '12_AWG',
      phaseColor: 'NEGRO',
      neutralColor: 'BLANCO',
      groundColor: 'VERDE',
      measuredCurrentA: 13.8,
      lengthMeters: 28,
      breakerAmps: 20,
      breakerPoles: '2P',
      breakerCurve: 'C',
      rcdProtection: 'GENERAL_30MA',
      otherSwitch: 'NINGUNA',
      conduitType: 'PVC_P_EMPOTRADO',
      spliceCondition: 'OPTIMO_BORNERA',
      temperatureC: 36
    },
    {
      id: 'w-3',
      code: 'C-3',
      zoneName: 'Cocina, Horno Microondas, Licuadora y Refrigeradora',
      usageType: 'COCINA_CALor',
      cableType: 'TW-80',
      cableGauge: '14_AWG',
      phaseColor: 'ROJO',
      neutralColor: 'ROJO',
      groundColor: 'SIN_TIERRA',
      measuredCurrentA: 19.5,
      lengthMeters: 18,
      breakerAmps: 32,
      breakerPoles: '2P',
      breakerCurve: 'C',
      rcdProtection: 'GENERAL_30MA',
      otherSwitch: 'NINGUNA',
      conduitType: 'PVC_P_EMPOTRADO',
      spliceCondition: 'CRITICO_RECALENTADO',
      temperatureC: 58
    },
    {
      id: 'w-4',
      code: 'C-4',
      zoneName: 'Terma Eléctrica / Ducha Rápida Baño Principal',
      usageType: 'DUCHA_TERMA',
      cableType: 'MELLIZO',
      cableGauge: '14_AWG',
      phaseColor: 'BLANCO',
      neutralColor: 'BLANCO',
      groundColor: 'SIN_TIERRA',
      measuredCurrentA: 18.2,
      lengthMeters: 15,
      breakerAmps: 25,
      breakerPoles: '2P',
      breakerCurve: 'C',
      rcdProtection: 'SIN_DIFERENCIAL',
      otherSwitch: 'NINGUNA',
      conduitType: 'CABLE_EXPUESTO',
      spliceCondition: 'CRITICO_RECALENTADO',
      temperatureC: 64
    }
  ]
};

const DEFAULT_COMPANY_PRESET: { board: MainBoardConfig; circuits: WiringCircuitItem[] } = {
  board: {
    propertyCategory: 'EMPRESA_OFICINA',
    supplySystem: 'TRIFASICO_220V',
    feederCableType: 'NH-80_LSOH',
    feederGauge: '6_AWG',
    mainBreakerAmps: 63,
    mainBreakerPoles: '3P',
    mainBreakerCurve: 'C',
    mainBreakerKa: 10,
    mainRcdStatus: 'OPERATIVO',
    mainRcdSensitivityMa: 30,
    mainRcdAmps: 63,
    mainRcdClass: 'F_SUPERINMUNIZADO',
    hasSurgeProtectorSpd: true,
    hasVoltageRelay: true,
    hasIndependentGroundBar: true,
    hasDeadFrontCover: true,
    hasCircuitDirectory: true,
    hasTimerOrContactor: true
  },
  circuits: [
    {
      id: 'wc-1',
      code: 'C-1',
      zoneName: 'Iluminación Comercial LED & Letrero Luminoso',
      usageType: 'ALUMBRADO',
      cableType: 'NH-80_LSOH',
      cableGauge: '14_AWG',
      phaseColor: 'ROJO',
      neutralColor: 'BLANCO',
      groundColor: 'VERDE_AMARILLO',
      measuredCurrentA: 8.5,
      lengthMeters: 30,
      breakerAmps: 16,
      breakerPoles: '2P',
      breakerCurve: 'C',
      rcdProtection: 'PROPIO_30MA',
      otherSwitch: 'TEMPORIZADOR',
      conduitType: 'EMT_METALICO',
      spliceCondition: 'OPTIMO_BORNERA',
      temperatureC: 32
    },
    {
      id: 'wc-2',
      code: 'C-2',
      zoneName: 'Estaciones de Cómputo, Servidores y Red Administrativa',
      usageType: 'COMPUTO_TI',
      cableType: 'NH-80_LSOH',
      cableGauge: '12_AWG',
      phaseColor: 'NEGRO',
      neutralColor: 'BLANCO',
      groundColor: 'VERDE_AMARILLO',
      measuredCurrentA: 14.2,
      lengthMeters: 25,
      breakerAmps: 20,
      breakerPoles: '2P',
      breakerCurve: 'B',
      rcdProtection: 'PROPIO_30MA',
      otherSwitch: 'UPS_ESTABILIZADOR',
      conduitType: 'CANALETA_PVC',
      spliceCondition: 'OPTIMO_BORNERA',
      temperatureC: 34
    },
    {
      id: 'wc-3',
      code: 'C-3',
      zoneName: 'Sistema de Aire Acondicionado Split 36,000 BTU',
      usageType: 'AIRE_ACONDICIONADO',
      cableType: 'THW-90',
      cableGauge: '10_AWG',
      phaseColor: 'AZUL',
      neutralColor: 'SIN_NEUTRO',
      groundColor: 'VERDE',
      measuredCurrentA: 21.0,
      lengthMeters: 35,
      breakerAmps: 32,
      breakerPoles: '3P',
      breakerCurve: 'C',
      rcdProtection: 'PROPIO_30MA',
      otherSwitch: 'GUARDAMOTOR_CONTACTOR',
      conduitType: 'EMT_METALICO',
      spliceCondition: 'OPTIMO_BORNERA',
      temperatureC: 39
    },
    {
      id: 'wc-4',
      code: 'C-4',
      zoneName: 'Electro-bomba Hidroneumática y Compresora de Taller',
      usageType: 'MOTORES_BOMBAS',
      cableType: 'THW-90',
      cableGauge: '12_AWG',
      phaseColor: 'ROJO',
      neutralColor: 'SIN_NEUTRO',
      groundColor: 'SIN_TIERRA',
      measuredCurrentA: 22.4,
      lengthMeters: 40,
      breakerAmps: 32,
      breakerPoles: '3P',
      breakerCurve: 'D',
      rcdProtection: 'SIN_DIFERENCIAL',
      otherSwitch: 'GUARDAMOTOR_CONTACTOR',
      conduitType: 'PVC_P_EMPOTRADO',
      spliceCondition: 'REGULAR_CINTA',
      temperatureC: 54
    }
  ]
};

const STORAGE_KEY_WIRING = 'e_diagnosis_wiring_verification_v1';

export const WiringVerificationTab: React.FC = () => {
  const { diagnostic, setActiveTab } = useDiagnostic();
  const { language } = useLanguage();

  const tr = (es: string, en: string, pt?: string) => {
    if (language === 'en') return en;
    if (language === 'pt') return pt || en;
    return es;
  };

  const [board, setBoard] = useState<MainBoardConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WIRING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.board) return parsed.board;
      }
    } catch {}
    return DEFAULT_HOUSE_PRESET.board;
  });

  const [circuits, setCircuits] = useState<WiringCircuitItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WIRING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.circuits)) {
          return parsed.circuits;
        }
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WIRING, JSON.stringify({ board, circuits }));
    } catch {}
  }, [board, circuits]);

  useEffect(() => {
    const handleWorkspaceCleaned = () => {
      setBoard(DEFAULT_HOUSE_PRESET.board);
      setCircuits([]);
    };
    window.addEventListener('e_diagnosis_workspace_cleaned', handleWorkspaceCleaned);
    return () => window.removeEventListener('e_diagnosis_workspace_cleaned', handleWorkspaceCleaned);
  }, []);

  const handleLoadHousePreset = () => {
    setBoard(DEFAULT_HOUSE_PRESET.board);
    setCircuits(DEFAULT_HOUSE_PRESET.circuits);
  };

  const handleLoadCompanyPreset = () => {
    setBoard(DEFAULT_COMPANY_PRESET.board);
    setCircuits(DEFAULT_COMPANY_PRESET.circuits);
  };

  const handleAddCircuit = () => {
    const nextIdx = circuits.length + 1;
    const newCircuit: WiringCircuitItem = {
      id: `w-${Date.now()}`,
      code: `C-${nextIdx}`,
      zoneName: `Circuito N° ${nextIdx} - Nueva Zona / Ambiente`,
      usageType: 'TOMACORRIENTES',
      cableType: 'NH-80_LSOH',
      cableGauge: '12_AWG',
      phaseColor: 'ROJO',
      neutralColor: 'BLANCO',
      groundColor: 'VERDE_AMARILLO',
      measuredCurrentA: 8.0,
      lengthMeters: 20,
      breakerAmps: 20,
      breakerPoles: '2P',
      breakerCurve: 'C',
      rcdProtection: 'GENERAL_30MA',
      otherSwitch: 'NINGUNA',
      conduitType: 'PVC_P_EMPOTRADO',
      spliceCondition: 'OPTIMO_BORNERA',
      temperatureC: 32
    };
    setCircuits(prev => [...prev, newCircuit]);
  };

  const handleUpdateCircuit = (id: string, patch: Partial<WiringCircuitItem>) => {
    setCircuits(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };

  const handleDeleteCircuit = (id: string) => {
    setCircuits(prev => prev.filter(c => c.id !== id));
  };

  // Engineering Evaluation Engine per Circuit
  const evaluatedCircuits = useMemo(() => {
    return circuits.map(c => {
      const gaugeMeta = GAUGE_INFO[c.cableGauge] || GAUGE_INFO['14_AWG'];
      const is90C = c.cableType === 'NH-80_LSOH' || c.cableType === 'THW-90' || c.cableType === 'N2XOH';
      let maxCableAmps = is90C ? gaugeMeta.baseAmpacity90C : gaugeMeta.baseAmpacity80C;
      if (c.cableType === 'MELLIZO' || c.cableType === 'GPT_AUTO') {
        maxCableAmps = Math.min(maxCableAmps, 10);
      }

      const issues: { severity: 'CRITICAL' | 'WARNING'; text: string }[] = [];
      const recommendations: string[] = [];

      // 1. Forbidden Cable Type
      if (c.cableType === 'MELLIZO') {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            'Cable Mellizo prohibido por el CNE 030-002 (altísimo riesgo de cortocircuito e incendio).',
            'Twin flat cord (Mellizo) strictly prohibited by Electrical Code (extreme fire hazard).',
            'Cabo paralelo (Mellizo) proibido pela norma elétrica (alto risco de incêndio).'
          )
        });
        recommendations.push(
          tr(
            'Reemplazar inmediatamente el cable mellizo por conductor unipolar NH-80 (Libre de Halógenos) o THW-90 entubado.',
            'Immediately replace twin cord with NH-80 (LS0H) or THW-90 single-core conductors in conduit.',
            'Substituir imediatamente o cabo paralelo por condutor unipolar NH-80 ou THW-90 em eletroduto.'
          )
        );
      } else if (c.cableType === 'GPT_AUTO' || c.cableType === 'ALAMBRE_ANTIGUO') {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            'Conductor no apto o aislamiento envejecido para instalaciones permanentes en edificaciones.',
            'Unsuitable or aged conductor insulation for permanent building installations.',
            'Condutor inadequado ou isolamento envelhecido para instalações prediais.'
          )
        });
        recommendations.push(
          tr(
            'Sustituir conductores antiguos/GPT por cables certificados NH-80 o THW-90.',
            'Replace aged/automotive wires with certified NH-80 or THW-90 building cables.',
            'Substituir condutores antigos por cabos certificados NH-80 ou THW-90.'
          )
        );
      }

      // 2. Minimum Section Check (14 AWG / 2.5 mm²)
      if (c.cableGauge === '16_AWG') {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            'Calibre 16 AWG (1.31 mm²) inferior al mínimo normativo CNE (mínimo 14 AWG / 2.5 mm²).',
            '16 AWG (1.31 mm²) gauge is below minimum code requirement (min 14 AWG / 2.5 mm²).',
            'Bitola 16 AWG (1.31 mm²) inferior ao mínimo normativo (mínimo 14 AWG / 2.5 mm²).'
          )
        });
      }

      // 3. Breaker vs Cable Ampacity Coordination (In <= Iz)
      if (c.breakerAmps === 0) {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            'Circuito en conexión directa SIN llave termomagnética de protección contra cortocircuitos.',
            'Direct connection WITHOUT thermomagnetic circuit breaker protection.',
            'Circuito em conexão direta SEM disjuntor termomagnético de proteção.'
          )
        });
        recommendations.push(
          tr(
            `Instalar llave termomagnética bipolar Curva C de ${Math.min(20, maxCableAmps)}A.`,
            `Install a ${Math.min(20, maxCableAmps)}A Curve C 2P thermomagnetic breaker.`,
            `Instalar disjuntor termomagnético Curva C de ${Math.min(20, maxCableAmps)}A.`
          )
        );
      } else if (c.breakerAmps === -1) {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            'Llave de cuchilla con fusible/plomo obsoleta y prohibida (riesgo de electrocución y arco eléctrico).',
            'Obsolete knife switch with lead fuse (prohibited due to arc flash and electrocution hazard).',
            'Chave faca com fusível de chumbo obsoleta e proibida (risco de choque e arco elétrico).'
          )
        });
        recommendations.push(
          tr(
            `Sustituir llave de cuchilla por interruptor termomagnético riel DIN de ${Math.min(20, maxCableAmps)}A.`,
            `Replace knife switch with a DIN-rail thermomagnetic breaker rated at ${Math.min(20, maxCableAmps)}A.`,
            `Substituir chave faca por disjuntor termomagnético DIN de ${Math.min(20, maxCableAmps)}A.`
          )
        );
      } else if (c.breakerAmps > maxCableAmps) {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            `¡PELIGRO DE INCENDIO! Llave termomagnética (${c.breakerAmps}A) mayor que la capacidad del cable (${maxCableAmps}A). El cable se derretirá antes de que salte la llave.`,
            `FIRE HAZARD! Breaker (${c.breakerAmps}A) exceeds cable ampacity (${maxCableAmps}A). The wire will melt before the breaker trips.`,
            `PERIGO DE INCÊNDIO! Disjuntor (${c.breakerAmps}A) maior que a capacidade do cabo (${maxCableAmps}A). O cabo derreterá antes do desarme.`
          )
        });
        recommendations.push(
          tr(
            `Reducir la llave termomagnética a ${maxCableAmps <= 15 ? 15 : maxCableAmps <= 20 ? 20 : 25}A o engrosar el cable para soportar ${c.breakerAmps}A.`,
            `Downsize the breaker to ${maxCableAmps <= 15 ? 15 : maxCableAmps <= 20 ? 20 : 25}A or upgrade wire gauge to match ${c.breakerAmps}A.`,
            `Reduzir o disjuntor para ${maxCableAmps <= 15 ? 15 : maxCableAmps <= 20 ? 20 : 25}A ou aumentar a bitola do cabo.`
          )
        );
      }

      // 4. Measured Current vs Cable & Breaker
      if (c.measuredCurrentA > maxCableAmps) {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            `¡SOBRECARGA DE CABLE! Corriente medida (${c.measuredCurrentA}A) supera el límite del conductor (${maxCableAmps}A).`,
            `CABLE OVERLOAD! Measured current (${c.measuredCurrentA}A) exceeds conductor ampacity (${maxCableAmps}A).`,
            `SOBRECARGA NO CABO! Corrente medida (${c.measuredCurrentA}A) supera o limite do condutor (${maxCableAmps}A).`
          )
        });
      } else if (c.breakerAmps > 0 && c.measuredCurrentA > c.breakerAmps) {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            `Corriente medida (${c.measuredCurrentA}A) supera el valor nominal de la llave termomagnética (${c.breakerAmps}A). Disparo inminente.`,
            `Measured current (${c.measuredCurrentA}A) exceeds breaker rating (${c.breakerAmps}A). Imminent tripping.`,
            `Corrente medida (${c.measuredCurrentA}A) supera o disjuntor (${c.breakerAmps}A). Desarme iminente.`
          )
        });
      } else if (c.measuredCurrentA > maxCableAmps * 0.8) {
        issues.push({
          severity: 'WARNING',
          text: tr(
            `Corriente medida (${c.measuredCurrentA}A) supera el 80% de carga continua recomendada (${(maxCableAmps * 0.8).toFixed(1)}A).`,
            `Measured current (${c.measuredCurrentA}A) exceeds 80% continuous load threshold (${(maxCableAmps * 0.8).toFixed(1)}A).`,
            `Corrente medida (${c.measuredCurrentA}A) supera 80% da capacidade recomendada (${(maxCableAmps * 0.8).toFixed(1)}A).`
          )
        });
      }

      // 5. Color Code Compliance (CNE 030-036)
      const validPhaseColors = ['ROJO', 'NEGRO', 'AZUL', 'MARRON'];
      const validNeutralColors = ['BLANCO', 'GRIS', 'CELESTE', 'SIN_NEUTRO'];
      const validGroundColors = ['VERDE_AMARILLO', 'VERDE', 'DESNUDO'];

      if (!validPhaseColors.includes(c.phaseColor)) {
        issues.push({
          severity: c.phaseColor === 'VERDE' ? 'CRITICAL' : 'WARNING',
          text: tr(
            `Color de cable de Fase (${c.phaseColor}) incumple CNE 030-036 (debe ser Rojo, Negro o Azul).`,
            `Phase wire color (${c.phaseColor}) violates color code (must be Red, Black, or Blue).`,
            `Cor do cabo de Fase (${c.phaseColor}) fora da norma (deve ser Vermelho, Preto ou Azul).`
          )
        });
        recommendations.push(
          tr(
            'Identificar o recablear el conductor de Fase con color Rojo, Negro o Azul según CNE.',
            'Identify or rewire Phase conductor using Red, Black, or Blue insulation.',
            'Identificar ou substituir o condutor de Fase com cor Vermelha, Preta ou Azul.'
          )
        );
      }

      if (!validNeutralColors.includes(c.neutralColor)) {
        issues.push({
          severity: 'WARNING',
          text: tr(
            `Color de cable Neutro (${c.neutralColor}) fuera de norma CNE (debe ser Blanco o Gris natural). Riesgo de confusión con Fase.`,
            `Neutral wire color (${c.neutralColor}) non-compliant (must be White or Gray). Risk of phase confusion.`,
            `Cor do cabo Neutro (${c.neutralColor}) fora da norma (deve ser Branco ou Azul Claro).`
          )
        });
      }

      if (c.groundColor === 'SIN_TIERRA') {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            'Circuito SIN CABLE DE TIERRA (PE). Carcasas metálicas y enchufes sin descarga a tierra ante fugas.',
            'Circuit WITHOUT GROUND WIRE (PE). Equipment enclosures lack fault current path.',
            'Circuito SEM CABO DE TERRA (PE). Risco de choque elétrico em carcaças metálicas.'
          )
        });
        recommendations.push(
          tr(
            'Tender conductor de protección a tierra (PE) color Verde o Verde/Amarillo conectado a la barra de tierra.',
            'Run a Green or Green/Yellow protective earth (PE) wire connected to the main ground busbar.',
            'Instalar condutor de proteção a terra (PE) Verde ou Verde/Amarelo conectado ao barramento de terra.'
          )
        );
      } else if (!validGroundColors.includes(c.groundColor)) {
        issues.push({
          severity: 'WARNING',
          text: tr(
            'Cable de tierra con color no reglamentario (CNE exige Verde o Verde/Amarillo).',
            'Ground wire has non-standard color (Code requires Green or Green/Yellow).',
            'Cabo de terra com cor fora do padrão (exige-se Verde ou Verde/Amarelo).'
          )
        });
      }

      // 6. Differential Switch (RCD) Check
      if (c.rcdProtection === 'SIN_DIFERENCIAL') {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            'Sin protección de Llave Diferencial (30mA). Riesgo directo de electrocución para las personas.',
            'No 30mA Residual Current Device (RCD) protection. Direct risk of fatal electrocution.',
            'Sem proteção de Disjuntor Diferencial (DR 30mA). Risco direto de choque elétrico fatal.'
          )
        });
        recommendations.push(
          tr(
            'Instalar llave diferencial de 30mA aguas arriba del circuito (CNE 020-132).',
            'Install a 30mA RCD differential switch protecting this circuit.',
            'Instalar disjuntor diferencial residual (DR) de 30mA protegendo este circuito.'
          )
        );
      }

      // 7. Splices, Conduit & Temperature
      if (c.conduitType === 'CABLE_EXPUESTO') {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            'Cableado expuesto sin tubería ni canaleta protectora (vulnerable a cortes, humedad y roedores).',
            'Exposed wiring without protective conduit or raceway (mechanical and moisture hazard).',
            'Fiação exposta sem eletroduto ou canaleta de proteção.'
          )
        });
      }
      if (c.spliceCondition === 'CRITICO_RECALENTADO') {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            'Empalmes artesanales sueltos, sulfatados o con signos de recalentamiento térmico.',
            'Loose, oxidized, or overheated wire splices detected.',
            'Emendas frouxas, oxidadas ou com sinais de sobreaquecimento térmico.'
          )
        });
        recommendations.push(
          tr(
            'Eliminar empalmes encintados deficientes y usar conectores de resorte certificadas o borneras.',
            'Eliminate taped splices and use UL/IEC certified spring connectors or terminal blocks.',
            'Substituir emendas mal isoladas por conectores de torção/mola ou bornes certificados.'
          )
        );
      }
      if (c.temperatureC >= 55) {
        issues.push({
          severity: 'CRITICAL',
          text: tr(
            `Temperatura anormalmente alta en conductor/bornera (${c.temperatureC}°C). Punto caliente activo.`,
            `Abnormally high temperature at conductor/terminal (${c.temperatureC}°C). Active hotspot.`,
            `Temperatura anormalmente alta no condutor/borne (${c.temperatureC}°C). Ponto quente ativo.`
          )
        });
      }

      // Voltage Drop Calculation
      const supplyV = board.supplySystem === 'TRIFASICO_380V' ? 380 : 220;
      const kFactor = board.supplySystem === 'MONOFASICO_220V' ? 2 : 1.732;
      const resistivity = 0.0175; // Copper Ohm*mm2/m
      const voltageDropV = (kFactor * resistivity * c.lengthMeters * c.measuredCurrentA) / gaugeMeta.sectionMm2;
      const voltageDropPct = (voltageDropV / supplyV) * 100;

      if (voltageDropPct > 2.5) {
        issues.push({
          severity: voltageDropPct > 4.0 ? 'CRITICAL' : 'WARNING',
          text: tr(
            `Caída de tensión elevada (${voltageDropPct.toFixed(2)}% > 2.5% máx CNE en circuitos derivados).`,
            `Excessive voltage drop (${voltageDropPct.toFixed(2)}% > 2.5% max branch limit).`,
            `Queda de tensão elevada (${voltageDropPct.toFixed(2)}% > 2.5% máx recomendado).`
          )
        });
      }

      const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
      const warningCount = issues.filter(i => i.severity === 'WARNING').length;

      const status: 'OPTIMO' | 'OBSERVADO' | 'CRITICO' =
        criticalCount > 0 ? 'CRITICO' : warningCount > 0 ? 'OBSERVADO' : 'OPTIMO';

      return {
        ...c,
        gaugeMeta,
        maxCableAmps,
        utilizationPct: Math.round((c.measuredCurrentA / maxCableAmps) * 100),
        voltageDropPct,
        issues,
        recommendations,
        status
      };
    });
  }, [circuits, board, language]);

  // Overall Property Diagnostic Summary
  const overallSummary = useMemo(() => {
    const totalCurrentA = circuits.reduce((acc, c) => acc + (Number(c.measuredCurrentA) || 0), 0);
    const simultaneousCurrentA = totalCurrentA * 0.75; // Diversity factor 0.75
    const criticalCircuits = evaluatedCircuits.filter(c => c.status === 'CRITICO').length;
    const warningCircuits = evaluatedCircuits.filter(c => c.status === 'OBSERVADO').length;
    const optimalCircuits = evaluatedCircuits.filter(c => c.status === 'OPTIMO').length;

    const boardIssues: string[] = [];
    if (board.mainBreakerAmps === -1) {
      boardIssues.push(
        tr(
          'Tablero general opera con llave de cuchilla/fusible de plomo prohibida por el CNE.',
          'Main panel uses prohibited knife switch / lead fuse.',
          'Quadro geral opera com chave faca proibido por norma.'
        )
      );
    }
    if (board.mainRcdStatus !== 'OPERATIVO') {
      boardIssues.push(
        tr(
          'El interruptor diferencial general no está operativo o no existe (alta vulnerabilidad a choques eléctricos).',
          'Main RCD differential switch is missing or inoperative (high electrocution risk).',
          'O disjuntor diferencial geral não está operacional ou não existe.'
        )
      );
    }
    if (board.mainRcdAmps < board.mainBreakerAmps && board.mainBreakerAmps > 0) {
      boardIssues.push(
        tr(
          `La llave diferencial general (${board.mainRcdAmps}A) tiene menor amperaje que la llave termomagnética principal (${board.mainBreakerAmps}A), riesgo de quemar el diferencial.`,
          `Main RCD (${board.mainRcdAmps}A) is rated lower than the main breaker (${board.mainBreakerAmps}A), risking RCD burnout.`,
          `O disjuntor diferencial geral (${board.mainRcdAmps}A) é menor que o disjuntor geral (${board.mainBreakerAmps}A).`
        )
      );
    }
    if (!board.hasIndependentGroundBar) {
      boardIssues.push(
        tr(
          'Carece de barra de tierra (PE) independiente en el tablero eléctrico.',
          'Missing independent protective earth (PE) busbar in electrical panel.',
          'Ausência de barramento de terra (PE) independente no quadro elétrico.'
        )
      );
    }
    if (!board.hasDeadFrontCover) {
      boardIssues.push(
        tr(
          'Tablero sin mandil o frente muerto (partes vivas energizadas expuestas al tacto directo).',
          'Panel lacks dead-front cover (live energized parts exposed to direct touch).',
          'Quadro sem espelho protetor interno (partes vivas expostas ao contato direto).'
        )
      );
    }

    let score = 100;
    score -= criticalCircuits * 18;
    score -= warningCircuits * 7;
    score -= boardIssues.length * 10;
    score = Math.max(12, Math.min(100, score));

    return {
      totalCurrentA,
      simultaneousCurrentA,
      criticalCircuits,
      warningCircuits,
      optimalCircuits,
      boardIssues,
      score
    };
  }, [evaluatedCircuits, circuits, board, language]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Property Mode Selector */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Cable className="w-3.5 h-3.5" />
              <span>{tr('Módulo Especializado CNE • IEC 60364', 'Specialized Wiring & Breaker Diagnostic Module', 'Módulo Especializado de Fiação e Disjuntores')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {tr(
                'Verificación de Cableado Eléctrico, Colores y Llaves de Protección',
                'Electrical Wiring, Wire Color Code & Breaker Verification',
                'Verificação de Fiação Elétrica, Cores de Cabos e Disjuntores'
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {tr(
                'Diagnóstico integral para Casas y Empresas: seleccione o apunte el tipo y calibre de cable, el color real de cada hilo (Fase, Neutro, Tierra), la corriente medida en amperios, la llave termomagnética, la llave diferencial y protecciones adicionales.',
                'Complete diagnostic for Homes and Businesses: record cable type and gauge, wire colors (Phase, Neutral, Ground), measured current (Amps), thermomagnetic breaker rating, RCD differential switch, and additional protections.',
                'Diagnóstico completo para Casas e Empresas: selecione o tipo e bitola do cabo, a cor de cada fio (Fase, Neutro, Terra), a corrente medida em ampères, o disjuntor termomagnético, o diferencial DR e outras chaves.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleLoadHousePreset}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                board.propertyCategory === 'CASA_VIVIENDA'
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{tr('Diagnóstico Casa / Vivienda', 'Home / Residential Preset', 'Diagnóstico Casa / Residência')}</span>
            </button>

            <button
              type="button"
              onClick={handleLoadCompanyPreset}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                board.propertyCategory !== 'CASA_VIVIENDA'
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow-md font-black'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{tr('Diagnóstico Empresa / Local', 'Company / Commercial Preset', 'Diagnóstico Empresa / Comercial')}</span>
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              {tr('Salud del Cableado y Llaves', 'Wiring & Breakers Health', 'Saúde da Fiação e Chaves')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black ${
                overallSummary.score >= 80 ? 'text-emerald-400' : overallSummary.score >= 55 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {overallSummary.score}/100
              </span>
              <span className="text-[11px] text-slate-300 font-medium">
                {overallSummary.score >= 80
                  ? tr('Seguro / Conforme', 'Safe / Compliant', 'Seguro / Conforme')
                  : overallSummary.score >= 55
                    ? tr('Con Observaciones', 'With Observations', 'Com Observações')
                    : tr('Riesgo Crítico', 'Critical Hazard', 'Risco Crítico')}
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              {tr('Corriente Total / Simultánea', 'Total / Simultaneous Current', 'Corrente Total / Simultânea')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">
                {overallSummary.totalCurrentA.toFixed(1)} A
              </span>
              <span className="text-[11px] text-amber-300 font-mono">
                ({overallSummary.simultaneousCurrentA.toFixed(1)} A sim.)
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              {tr('Llave General vs Diferencial', 'Main Breaker vs RCD', 'Disjuntor Geral vs DR')}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-black text-white">
                {board.mainBreakerAmps > 0 ? `${board.mainBreakerAmps}A (${board.mainBreakerPoles})` : tr('Cuchilla', 'Knife Sw.', 'Chave Faca')}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                board.mainRcdStatus === 'OPERATIVO' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/30 text-rose-300'
              }`}>
                {board.mainRcdStatus === 'OPERATIVO' ? `ID ${board.mainRcdSensitivityMa}mA` : tr('Sin Diferencial', 'No RCD', 'Sem DR')}
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">
              {tr('Estado de Circuitos Auditados', 'Audited Circuits Status', 'Status dos Circuitos')}
            </span>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-bold">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {overallSummary.optimalCircuits} OK
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {overallSummary.warningCircuits} Obs
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/30 text-rose-300">
                {overallSummary.criticalCircuits} {tr('Críticos', 'Critical', 'Críticos')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: MAIN BREAKER, DIFFERENTIAL SWITCH & OTHER BOARD PROTECTIONS */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {tr(
                  '1. Llave Termomagnética General, Llave Diferencial y Otras Llaves de Cabecera',
                  '1. Main Thermomagnetic Breaker, Differential Switch (RCD) & Panel Protections',
                  '1. Disjuntor Termomagnético Geral, Interruptor Diferencial (DR) e Outras Chaves'
                )}
              </h2>
              <p className="text-xs text-slate-500">
                {tr(
                  'Configure las llaves principales que gobiernan la conexión eléctrica de la casa o empresa',
                  'Configure the main switches and protective devices governing the property supply',
                  'Configure as chaves principais que protegem a conexão elétrica da casa ou empresa'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sub-card 1: Suministro y Acometida */}
          <div className="min-w-0 rounded-2xl bg-slate-50/80 border border-slate-200/80 p-4 space-y-3 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 min-w-0 truncate">
                <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">{tr('Conexión y Acometida', 'Supply & Feeder Connection', 'Conexão e Entrada')}</span>
              </span>
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                {tr('Tipo de Instalación Auditada:', 'Audited Property Type:', 'Tipo de Imóvel Auditado:')}
              </label>
              <select
                value={board.propertyCategory}
                onChange={e => setBoard({ ...board, propertyCategory: e.target.value as MainBoardConfig['propertyCategory'] })}
                className="w-full min-w-0 truncate rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                <option value="CASA_VIVIENDA">{tr('Casa / Vivienda Residencial', 'House / Residential Home', 'Casa / Residência Familiar')}</option>
                <option value="EMPRESA_OFICINA">{tr('Empresa / Oficinas Corporativas', 'Company / Corporate Offices', 'Empresa / Escritórios')}</option>
                <option value="LOCAL_COMERCIAL">{tr('Local Comercial / Tienda / Restaurante', 'Commercial Store / Restaurant', 'Estabelecimento Comercial')}</option>
                <option value="PLANTA_TALLER">{tr('Planta Industrial / Taller Productivo', 'Industrial Plant / Workshop', 'Planta Industrial / Oficina')}</option>
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                {tr('Sistema de Tensión y Fases:', 'Voltage & Phase System:', 'Sistema de Tensão e Fases:')}
              </label>
              <select
                value={board.supplySystem}
                onChange={e => setBoard({ ...board, supplySystem: e.target.value as MainBoardConfig['supplySystem'] })}
                className="w-full min-w-0 truncate rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                <option value="MONOFASICO_220V">{tr('Monofásico 220V (2 Hilos + Tierra)', 'Single-Phase 220V (2W + Ground)', 'Monofásico 220V (Fase + Neutro + Terra)')}</option>
                <option value="TRIFASICO_220V">{tr('Trifásico 220V Delta (3 Fases + Tierra)', 'Three-Phase 220V Delta (3W + Ground)', 'Trifásico 220V Delta (3 Fases + Terra)')}</option>
                <option value="TRIFASICO_380V">{tr('Trifásico 380/220V Estrella (4 Hilos + Tierra)', 'Three-Phase 380/220V Star (4W + Ground)', 'Trifásico 380/220V Estrela (3F + N + Terra)')}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                  {tr('Cable Acometida:', 'Feeder Cable:', 'Cabo de Entrada:')}
                </label>
                <select
                  value={board.feederCableType}
                  onChange={e => setBoard({ ...board, feederCableType: e.target.value })}
                  className="w-full min-w-0 truncate rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-900"
                >
                  <option value="NH-80_LSOH">NH-80 (Libre Halógenos)</option>
                  <option value="THW-90">THW-90 (90°C)</option>
                  <option value="N2XOH">N2XOH (Subterráneo)</option>
                  <option value="TW-80">TW-80 (Estándar)</option>
                </select>
              </div>
              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                  {tr('Calibre Acometida:', 'Feeder Gauge:', 'Bitola Entrada:')}
                </label>
                <select
                  value={board.feederGauge}
                  onChange={e => setBoard({ ...board, feederGauge: e.target.value })}
                  className="w-full min-w-0 truncate rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-900"
                >
                  <option value="12_AWG">12 AWG (3.3 mm²)</option>
                  <option value="10_AWG">10 AWG (5.3 mm²)</option>
                  <option value="8_AWG">8 AWG (8.4 mm²)</option>
                  <option value="6_AWG">6 AWG (13.3 mm²)</option>
                  <option value="4_AWG">4 AWG (21.2 mm²)</option>
                  <option value="2_AWG">2 AWG (33.6 mm²)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sub-card 2: Llave Termomagnética Principal */}
          <div className="min-w-0 rounded-2xl bg-amber-50/60 border border-amber-200/80 p-4 space-y-3 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5 min-w-0 truncate">
                <Gauge className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">{tr('Llave Termomagnética General', 'Main Thermomagnetic Breaker', 'Disjuntor Termomagnético Geral')}</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded shrink-0 whitespace-nowrap">
                ITM Principal
              </span>
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                {tr('Valor de la Llave Principal (Amperios):', 'Main Breaker Rating (Amps):', 'Valor do Disjuntor Geral (Ampères):')}
              </label>
              <select
                value={board.mainBreakerAmps}
                onChange={e => setBoard({ ...board, mainBreakerAmps: Number(e.target.value) })}
                className="w-full min-w-0 truncate rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-black text-slate-900 focus:border-amber-600 focus:outline-none"
              >
                <option value={16}>16 A (Baja carga)</option>
                <option value={20}>20 A (Vivienda pequeña)</option>
                <option value={25}>25 A (Vivienda estándar)</option>
                <option value={32}>32 A (Vivienda mediana)</option>
                <option value={40}>40 A (Casa completa / Local)</option>
                <option value={50}>50 A (Comercio / Residencia grande)</option>
                <option value={63}>63 A (Empresa / Trifásico)</option>
                <option value={80}>80 A (Subestación / Comercio)</option>
                <option value={100}>100 A (Caja Moldeada MCCB)</option>
                <option value={125}>125 A (Industrial MCCB)</option>
                <option value={160}>160 A (Industrial MCCB)</option>
                <option value={250}>250 A (Planta Industrial)</option>
                <option value={-1}>{tr('⚠️ Llave de Cuchilla / Fusible Plomo (Prohibido)', '⚠️ Knife Switch / Lead Fuse (Prohibited)', '⚠️ Chave Faca / Fusível Chumbo (Proibido)')}</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="min-w-0">
                <label className="block text-[10px] font-bold text-slate-700 mb-1 truncate">
                  {tr('N° Polos:', 'Poles:', 'Polos:')}
                </label>
                <select
                  value={board.mainBreakerPoles}
                  onChange={e => setBoard({ ...board, mainBreakerPoles: e.target.value as MainBoardConfig['mainBreakerPoles'] })}
                  className="w-full min-w-0 truncate rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="2P">2P (Bipolar)</option>
                  <option value="3P">3P (Tripolar)</option>
                  <option value="4P">4P (Tetrapolar)</option>
                </select>
              </div>
              <div className="min-w-0">
                <label className="block text-[10px] font-bold text-slate-700 mb-1 truncate">
                  {tr('Curva Disparo:', 'Trip Curve:', 'Curva:')}
                </label>
                <select
                  value={board.mainBreakerCurve}
                  onChange={e => setBoard({ ...board, mainBreakerCurve: e.target.value as MainBoardConfig['mainBreakerCurve'] })}
                  className="w-full min-w-0 truncate rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="B">Curva B</option>
                  <option value="C">Curva C</option>
                  <option value="D">Curva D</option>
                </select>
              </div>
              <div className="min-w-0">
                <label className="block text-[10px] font-bold text-slate-700 mb-1 truncate">
                  {tr('Ruptura (Icu):', 'Breaking kA:', 'Ruptura kA:')}
                </label>
                <select
                  value={board.mainBreakerKa}
                  onChange={e => setBoard({ ...board, mainBreakerKa: Number(e.target.value) })}
                  className="w-full min-w-0 truncate rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-900"
                >
                  <option value={6}>6 kA</option>
                  <option value={10}>10 kA</option>
                  <option value={15}>15 kA</option>
                  <option value={25}>25 kA</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sub-card 3: Llave Diferencial General (ID / RCD) */}
          <div className="min-w-0 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 p-4 space-y-3 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5 min-w-0 truncate">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{tr('Llave Diferencial (ID / RCD)', 'Differential Switch (RCD)', 'Interruptor Diferencial (DR)')}</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-950 px-2 py-0.5 rounded shrink-0 whitespace-nowrap">
                CNE 020-132
              </span>
            </div>

            <div className="min-w-0">
              <label className="block text-[11px] font-bold text-slate-700 mb-1 truncate">
                {tr('Estado de la Llave Diferencial:', 'Differential Switch Status:', 'Estado do Disjuntor Diferencial:')}
              </label>
              <select
                value={board.mainRcdStatus}
                onChange={e => setBoard({ ...board, mainRcdStatus: e.target.value as MainBoardConfig['mainRcdStatus'] })}
                className="w-full min-w-0 truncate rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-black text-slate-900 focus:border-emerald-600 focus:outline-none"
              >
                <option value="OPERATIVO">{tr('✓ Instalada y Operativa (Botón Test OK)', '✓ Installed & Operational (Test Button OK)', '✓ Instalado e Operacional (Botão Teste OK)')}</option>
                <option value="SIN_DIFERENCIAL">{tr('❌ NO TIENE LLAVE DIFERENCIAL (Peligro Electrocución)', '❌ NO DIFFERENTIAL SWITCH (Electrocution Hazard)', '❌ NÃO TEM DISJUNTOR DIFERENCIAL (Risco de Choque)')}</option>
                <option value="AVERIADO_TEST_FALLA">{tr('⚠️ Instalada pero Botón Test NO Dispara (Averiada)', '⚠️ Installed but Test Button Fails (Defective)', '⚠️ Instalado mas Botão Teste Não Dispara')}</option>
                <option value="PUENTEADO">{tr('⚠️ Diferencial Puenteada / Desconectada', '⚠️ Differential Bypassed / Disconnected', '⚠️ Diferencial Ponteado / Desconectado')}</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="min-w-0">
                <label className="block text-[10px] font-bold text-slate-700 mb-1 truncate">
                  {tr('Sensibilidad:', 'Sensitivity:', 'Sensibilidade:')}
                </label>
                <select
                  value={board.mainRcdSensitivityMa}
                  onChange={e => setBoard({ ...board, mainRcdSensitivityMa: Number(e.target.value) as MainBoardConfig['mainRcdSensitivityMa'] })}
                  className="w-full min-w-0 truncate rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-900"
                >
                  <option value={10}>10 mA</option>
                  <option value={30}>30 mA (CNE)</option>
                  <option value={100}>100 mA</option>
                  <option value={300}>300 mA</option>
                </select>
              </div>
              <div className="min-w-0">
                <label className="block text-[10px] font-bold text-slate-700 mb-1 truncate">
                  {tr('Amperaje ID:', 'RCD Amps:', 'Corrente DR:')}
                </label>
                <select
                  value={board.mainRcdAmps}
                  onChange={e => setBoard({ ...board, mainRcdAmps: Number(e.target.value) })}
                  className="w-full min-w-0 truncate rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-900"
                >
                  <option value={25}>25 A</option>
                  <option value={40}>40 A</option>
                  <option value={63}>63 A</option>
                  <option value={80}>80 A</option>
                  <option value={100}>100 A</option>
                </select>
              </div>
              <div className="min-w-0">
                <label className="block text-[10px] font-bold text-slate-700 mb-1 truncate">
                  {tr('Clase Tipo:', 'RCD Type:', 'Classe DR:')}
                </label>
                <select
                  value={board.mainRcdClass}
                  onChange={e => setBoard({ ...board, mainRcdClass: e.target.value as MainBoardConfig['mainRcdClass'] })}
                  className="w-full min-w-0 truncate rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-900"
                >
                  <option value="AC">Clase AC</option>
                  <option value="A">Clase A</option>
                  <option value="F_SUPERINMUNIZADO">Superinmun.</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Otras llaves y elementos de seguridad del tablero */}
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-700 mb-2.5">
            {tr(
              'Otras Llaves, Dispositivos y Condiciones de Seguridad en el Tablero Eléctrico:',
              'Other Switches, Protective Devices & Safety Conditions in the Main Panel:',
              'Outras Chaves, Dispositivos de Proteção e Condições do Quadro Elétrico:'
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              {
                key: 'hasIndependentGroundBar' as const,
                label: tr('Barra de Tierra (PE) de cobre independiente', 'Independent Copper Ground Busbar (PE)', 'Barramento de Terra (PE) independente')
              },
              {
                key: 'hasDeadFrontCover' as const,
                label: tr('Mandil / Frente muerto protector contra toques', 'Dead-front protective cover installed', 'Espelho protetor interno contra toque direto')
              },
              {
                key: 'hasCircuitDirectory' as const,
                label: tr('Directorio de llaves y circuitos rotulado', 'Labeled circuit directory chart', 'Diretório de disjuntores e circuitos identificado')
              },
              {
                key: 'hasSurgeProtectorSpd' as const,
                label: tr('Llave Protectora de Sobretensiones (SPD / DPS)', 'Surge Protection Device (SPD / TVSS)', 'Dispositivo de Proteção contra Surtos (DPS)')
              },
              {
                key: 'hasVoltageRelay' as const,
                label: tr('Llave Guardatensión (Mínima/Máxima Tensión)', 'Under/Over-Voltage Protection Relay', 'Relé Protetor de Sub/Sobretensão')
              },
              {
                key: 'hasTimerOrContactor' as const,
                label: tr('Contactor / Llave Horaria Automática', 'Automatic Contactor / Timer Switch', 'Contator / Interruptor Horário Automático')
              }
            ].map(item => (
              <label
                key={item.key}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all min-w-0 ${
                  board[item.key]
                    ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={board[item.key]}
                  onChange={e => setBoard({ ...board, [item.key]: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 shrink-0"
                />
                <span className="min-w-0 leading-snug">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: CIRCUIT-BY-CIRCUIT WIRING, WIRE COLORS, CURRENT & BREAKERS INSPECTOR */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
              <Cable className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {tr(
                  '2. Inspección Detallada de Cableado, Colores de Cable, Corriente y Llaves por Circuito',
                  '2. Detailed Circuit Wiring, Wire Colors, Measured Current & Breakers Inspection',
                  '2. Inspeção Detalhada da Fiação, Cores de Cabos, Corrente e Disjuntores por Circuito'
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {tr(
                  'Seleccione para cada circuito el tipo de cable, calibre, color de Fase/Neutro/Tierra, corriente medida en Amperios y valores de sus llaves',
                  'Select for each circuit the cable type, gauge, Phase/Neutral/Ground wire colors, measured current (Amps), and breaker ratings',
                  'Selecione para cada circuito o tipo de cabo, bitola, cor de Fase/Neutro/Terra, corrente medida em Ampères e valores dos disjuntores'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCircuit}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>{tr('+ Agregar Línea / Circuito', '+ Add Circuit / Line', '+ Adicionar Circuito / Linha')}</span>
          </button>
        </div>

        <div className="space-y-5">
          {evaluatedCircuits.map((c) => {
            const phaseSwatch = COLOR_SWATCHES[c.phaseColor] || COLOR_SWATCHES.ROJO;
            const neutralSwatch = COLOR_SWATCHES[c.neutralColor] || COLOR_SWATCHES.BLANCO;
            const groundSwatch = COLOR_SWATCHES[c.groundColor] || COLOR_SWATCHES.VERDE_AMARILLO;

            return (
              <div
                key={c.id}
                className={`rounded-2xl border-2 p-3.5 sm:p-5 transition-all space-y-4 overflow-hidden ${
                  c.status === 'CRITICO'
                    ? 'border-rose-300 bg-rose-50/30'
                    : c.status === 'OBSERVADO'
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-emerald-200 bg-slate-50/50'
                }`}
              >
                {/* Circuit Top Header Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                    <input
                      type="text"
                      value={c.code}
                      onChange={e => handleUpdateCircuit(c.id, { code: e.target.value })}
                      className="w-16 shrink-0 font-mono font-black text-xs text-center bg-slate-900 text-amber-400 rounded-lg px-2 py-1.5 border border-slate-700"
                    />
                    <input
                      type="text"
                      value={c.zoneName}
                      onChange={e => handleUpdateCircuit(c.id, { zoneName: e.target.value })}
                      placeholder={tr('Nombre de la Zona / Ambiente o Circuito', 'Zone / Room or Circuit Name', 'Nome da Zona / Ambiente ou Circuito')}
                      className="flex-1 min-w-[160px] sm:min-w-[220px] font-bold text-sm text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:border-indigo-600 focus:outline-none"
                    />
                    <select
                      value={c.usageType}
                      onChange={e => handleUpdateCircuit(c.id, { usageType: e.target.value as WiringCircuitItem['usageType'] })}
                      className="w-full sm:w-auto min-w-0 truncate rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700"
                    >
                      <option value="ALUMBRADO">{tr('💡 Alumbrado / Iluminación', '💡 Lighting Circuit', '💡 Iluminação')}</option>
                      <option value="TOMACORRIENTES">{tr('🔌 Tomacorrientes Generales', '🔌 General Outlets', '🔌 Tomadas Gerais')}</option>
                      <option value="COCINA_CALor">{tr('🍳 Cocina / Horno / Carga Térmica', '🍳 Kitchen / Electric Oven', '🍳 Cozinha / Forno Elétrico')}</option>
                      <option value="DUCHA_TERMA">{tr('🚿 Terma / Ducha Eléctrica', '🚿 Water Heater / Electric Shower', '🚿 Chuveiro Elétrico / Aquecedor')}</option>
                      <option value="AIRE_ACONDICIONADO">{tr('❄️ Aire Acondicionado / Clima', '❄️ Air Conditioning / HVAC', '❄️ Ar Condicionado / Climatização')}</option>
                      <option value="MOTORES_BOMBAS">{tr('⚙️ Motores / Bombas / Fuerza', '⚙️ Motors / Pumps / Power', '⚙️ Motores / Bombas / Força')}</option>
                      <option value="COMPUTO_TI">{tr('💻 Cómputo / Servidores / TI', '💻 IT / Computers / Servers', '💻 Informática / Servidores')}</option>
                      <option value="ALIMENTADOR">{tr('⚡ Sub-Alimentador de Tablero', '⚡ Sub-panel Feeder', '⚡ Sub-alimentador de Quadro')}</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap ${
                        c.status === 'CRITICO'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : c.status === 'OBSERVADO'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {c.status === 'CRITICO' ? (
                        <>
                          <Flame className="w-3.5 h-3.5 shrink-0" />
                          <span>{tr('Riesgo Crítico', 'Critical Hazard', 'Risco Crítico')}</span>
                        </>
                      ) : c.status === 'OBSERVADO' ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{tr('Con Observación', 'Warning', 'Com Observação')}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{tr('Conforme CNE', 'Code Compliant', 'Conforme Norma')}</span>
                        </>
                      )}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteCircuit(c.id)}
                      className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer shrink-0"
                      title={tr('Eliminar circuito', 'Delete circuit', 'Excluir circuito')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid of Selectors: 1) Cable & Gauge, 2) Wire Colors, 3) Current & Length, 4) Breakers & RCD */}
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-3.5 sm:gap-4">
                  {/* Column 1: Tipo de Cable, Calibre y Canalización */}
                  <div className="min-w-0 bg-white rounded-xl p-3.5 border border-slate-200/90 space-y-2.5 overflow-hidden">
                    <div className="text-[11px] font-black uppercase tracking-wider text-indigo-900 flex items-center justify-between gap-2">
                      <span className="truncate">{tr('A. Tipo y Calibre de Cable', 'A. Cable Type & Gauge', 'A. Tipo e Bitola do Cabo')}</span>
                      <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap">
                        Máx {c.maxCableAmps}A
                      </span>
                    </div>

                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                        {tr('Tipo de Aislamiento del Cable:', 'Cable Insulation Type:', 'Tipo de Isolamento do Cabo:')}
                      </label>
                      <select
                        value={c.cableType}
                        onChange={e => handleUpdateCircuit(c.id, { cableType: e.target.value as WiringCircuitItem['cableType'] })}
                        className={`w-full min-w-0 truncate rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
                          c.cableType === 'MELLIZO' || c.cableType === 'GPT_AUTO'
                            ? 'border-rose-400 bg-rose-50 text-rose-900'
                            : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      >
                        <option value="NH-80_LSOH">NH-80 / LSOH (Libre Halógenos 90°C)</option>
                        <option value="THW-90">THW-90 (PVC Calor/Humedad 90°C)</option>
                        <option value="TW-80">TW-80 (PVC Estándar 80°C)</option>
                        <option value="N2XOH">N2XOH (Subterráneo / Alimentador)</option>
                        <option value="NLT_VULCANIZADO">NLT / Vulcanizado Flexible</option>
                        <option value="GPT_AUTO">⚠️ GPT Automotriz (No apto casa)</option>
                        <option value="MELLIZO">❌ Cable Mellizo (PROHIBIDO CNE)</option>
                        <option value="ALAMBRE_ANTIGUO">⚠️ Alambre Rígido Antiguo</option>
                      </select>
                    </div>

                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                        {tr('Calibre / Sección del Conductor:', 'Conductor Gauge / Section:', 'Bitola / Seção do Condutor:')}
                      </label>
                      <select
                        value={c.cableGauge}
                        onChange={e => handleUpdateCircuit(c.id, { cableGauge: e.target.value as WiringCircuitItem['cableGauge'] })}
                        className="w-full min-w-0 truncate rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900"
                      >
                        {Object.entries(GAUGE_INFO).map(([k, info]) => (
                          <option key={k} value={k}>
                            {info.label} (Soporta {info.baseAmpacity90C}A)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                        {tr('Canalización / Protección Mecánica:', 'Conduit / Raceway:', 'Eletroduto / Canalização:')}
                      </label>
                      <select
                        value={c.conduitType}
                        onChange={e => handleUpdateCircuit(c.id, { conduitType: e.target.value as WiringCircuitItem['conduitType'] })}
                        className="w-full min-w-0 truncate rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                      >
                        <option value="PVC_P_EMPOTRADO">{tr('Tubería PVC-P Empotrada', 'Embedded PVC-P Conduit', 'Eletroduto PVC Embutido')}</option>
                        <option value="EMT_METALICO">{tr('Tubería Metálica EMT', 'Metallic EMT Conduit', 'Eletroduto Metálico EMT')}</option>
                        <option value="CANALETA_PVC">{tr('Canaleta Superficial PVC', 'Surface PVC Raceway', 'Canaleta Superficial PVC')}</option>
                        <option value="BANDEJA">{tr('Bandeja Portacables', 'Cable Tray', 'Eletrocalha / Bandeja')}</option>
                        <option value="CABLE_EXPUESTO">{tr('❌ Cable Suelto / Expuesto (Peligro)', '❌ Exposed Unprotected Wire', '❌ Cabo Solto / Exposto (Perigo)')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Column 2: Colores de Cada Cable (Fase, Neutro, Tierra) */}
                  <div className="min-w-0 bg-white rounded-xl p-3.5 border border-slate-200/90 space-y-2.5 overflow-hidden">
                    <div className="text-[11px] font-black uppercase tracking-wider text-indigo-900 flex items-center justify-between gap-2">
                      <span className="truncate">{tr('B. Color de Cada Cable', 'B. Wire Colors (L / N / PE)', 'B. Cor de Cada Cabo')}</span>
                      <span className="text-[10px] text-slate-500 font-semibold shrink-0 whitespace-nowrap">CNE 030-036</span>
                    </div>

                    {/* Fase Color */}
                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                        {tr('Color Cable de FASE (L):', 'PHASE Wire Color (L):', 'Cor do Cabo de FASE (L):')}
                      </label>
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded-full shrink-0 border shadow-2xs"
                          style={{ background: phaseSwatch.bg, borderColor: phaseSwatch.border }}
                        />
                        <select
                          value={c.phaseColor}
                          onChange={e => handleUpdateCircuit(c.id, { phaseColor: e.target.value as WiringCircuitItem['phaseColor'] })}
                          className="flex-1 w-full min-w-0 truncate rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-900"
                        >
                          <option value="ROJO">{tr('🔴 Rojo (Fase L1 CNE)', '🔴 Red (Phase L1)', '🔴 Vermelho (Fase L1)')}</option>
                          <option value="NEGRO">{tr('⚫ Negro (Fase L2 CNE)', '⚫ Black (Phase L2)', '⚫ Preto (Fase L2)')}</option>
                          <option value="AZUL">{tr('🔵 Azul (Fase L3 CNE)', '🔵 Blue (Phase L3)', '🔵 Azul (Fase L3)')}</option>
                          <option value="MARRON">{tr('🟤 Marrón (Fase IEC)', '🟤 Brown (Phase IEC)', '🟤 Marrom (Fase IEC)')}</option>
                          <option value="BLANCO">{tr('⚪ Blanco (Error: es Neutro)', '⚪ White (Error: Neutral color)', '⚪ Branco (Erro: cor de Neutro)')}</option>
                          <option value="AMARILLO">{tr('🟡 Amarillo (No estándar)', '🟡 Yellow (Non-standard)', '🟡 Amarelo (Fora do padrão)')}</option>
                          <option value="VERDE">{tr('🟢 Verde (Peligro: es Tierra)', '🟢 Green (Hazard: Ground color)', '🟢 Verde (Perigo: cor de Terra)')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Neutro Color */}
                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                        {tr('Color Cable NEUTRO (N):', 'NEUTRAL Wire Color (N):', 'Cor do Cabo NEUTRO (N):')}
                      </label>
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded-full shrink-0 border shadow-2xs"
                          style={{ background: neutralSwatch.bg, borderColor: neutralSwatch.border }}
                        />
                        <select
                          value={c.neutralColor}
                          onChange={e => handleUpdateCircuit(c.id, { neutralColor: e.target.value as WiringCircuitItem['neutralColor'] })}
                          className="flex-1 w-full min-w-0 truncate rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-900"
                        >
                          <option value="BLANCO">{tr('⚪ Blanco (Neutro Oficial CNE)', '⚪ White (Official Neutral)', '⚪ Branco (Neutro CNE)')}</option>
                          <option value="GRIS">{tr('🔘 Gris Natural (Neutro CNE)', '🔘 Natural Gray (Neutral)', '🔘 Cinza Natural (Neutro)')}</option>
                          <option value="CELESTE">{tr('🩵 Celeste / Azul Claro (IEC)', '🩵 Light Blue (IEC Neutral)', '🩵 Azul Claro (Neutro NBR/IEC)')}</option>
                          <option value="SIN_NEUTRO">{tr('⚡ Sin Neutro (220V Bifásico/Delta)', '⚡ No Neutral (220V Delta)', '⚡ Sem Neutro (220V Bifásico)')}</option>
                          <option value="NEGRO">{tr('⚫ Negro (Error: color de Fase)', '⚫ Black (Error: Phase color)', '⚫ Preto (Erro: cor de Fase)')}</option>
                          <option value="ROJO">{tr('🔴 Rojo (Peligro: color de Fase)', '🔴 Red (Hazard: Phase color)', '🔴 Vermelho (Perigo: cor de Fase)')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Tierra Color */}
                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                        {tr('Color Cable de TIERRA (PE):', 'GROUND Wire Color (PE):', 'Cor do Cabo de TERRA (PE):')}
                      </label>
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded-full shrink-0 border shadow-2xs"
                          style={{ background: groundSwatch.bg, borderColor: groundSwatch.border }}
                        />
                        <select
                          value={c.groundColor}
                          onChange={e => handleUpdateCircuit(c.id, { groundColor: e.target.value as WiringCircuitItem['groundColor'] })}
                          className={`flex-1 w-full min-w-0 truncate rounded-lg border px-2 py-1.5 text-xs font-bold ${
                            c.groundColor === 'SIN_TIERRA'
                              ? 'border-rose-400 bg-rose-50 text-rose-900'
                              : 'border-slate-300 bg-white text-slate-900'
                          }`}
                        >
                          <option value="VERDE_AMARILLO">{tr('🟢🟡 Verde/Amarillo (Norma CNE)', '🟢🟡 Green/Yellow (Standard PE)', '🟢🟡 Verde/Amarelo (Norma PE)')}</option>
                          <option value="VERDE">{tr('🟢 Verde (Norma CNE)', '🟢 Green (Standard PE)', '🟢 Verde (Norma PE)')}</option>
                          <option value="DESNUDO">{tr('🟠 Cobre Desnudo', '🟠 Bare Copper', '🟠 Cobre Nu')}</option>
                          <option value="OTRO_COLOR">{tr('🟣 Otro Color (Fuera de norma)', '🟣 Other Color (Non-compliant)', '🟣 Outra Cor (Fora da norma)')}</option>
                          <option value="SIN_TIERRA">{tr('❌ SIN CABLE DE TIERRA (Peligro)', '❌ NO GROUND WIRE (Hazard)', '❌ SEM CABO DE TERRA (Perigo)')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Corriente Medida, Temperatura y Estado de Empalmes */}
                  <div className="min-w-0 bg-white rounded-xl p-3.5 border border-slate-200/90 space-y-2.5 overflow-hidden">
                    <div className="text-[11px] font-black uppercase tracking-wider text-indigo-900 flex items-center justify-between gap-2">
                      <span className="truncate">{tr('C. Corriente Real y Estado', 'C. Measured Current & State', 'C. Corrente Medida e Estado')}</span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap ${
                        c.utilizationPct > 100 ? 'bg-rose-100 text-rose-800' : c.utilizationPct > 80 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        Uso: {c.utilizationPct}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="min-w-0">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                          {tr('Corriente Medida (A):', 'Measured Current (A):', 'Corrente Medida (A):')}
                        </label>
                        <div className="relative min-w-0">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={c.measuredCurrentA}
                            onChange={e => handleUpdateCircuit(c.id, { measuredCurrentA: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full min-w-0 rounded-lg border border-indigo-300 bg-indigo-50/40 pl-2.5 pr-6 py-1.5 text-xs font-mono font-black text-slate-900 focus:border-indigo-600 focus:outline-none"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] font-bold text-indigo-700 pointer-events-none">A</span>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                          {tr('Distancia (metros):', 'Length (meters):', 'Distância (metros):')}
                        </label>
                        <div className="relative min-w-0">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={c.lengthMeters}
                            onChange={e => handleUpdateCircuit(c.id, { lengthMeters: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                            className="w-full min-w-0 rounded-lg border border-slate-300 bg-white pl-2.5 pr-6 py-1.5 text-xs font-mono font-bold text-slate-900"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] font-bold text-slate-400 pointer-events-none">m</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="min-w-0">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                          {tr('Temp. Cable/Bornera:', 'Wire Temp (°C):', 'Temp. Cabo (°C):')}
                        </label>
                        <div className="relative min-w-0">
                          <input
                            type="number"
                            min="15"
                            max="120"
                            value={c.temperatureC}
                            onChange={e => handleUpdateCircuit(c.id, { temperatureC: parseInt(e.target.value, 10) || 30 })}
                            className={`w-full min-w-0 rounded-lg border pl-2.5 pr-7 py-1.5 text-xs font-mono font-bold ${
                              c.temperatureC >= 55 ? 'border-rose-400 bg-rose-50 text-rose-900' : 'border-slate-300 bg-white text-slate-900'
                            }`}
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] font-bold text-slate-500 pointer-events-none">°C</span>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                          {tr('Caída Tensión:', 'Voltage Drop:', 'Queda Tensão:')}
                        </label>
                        <div className={`rounded-lg border px-2.5 py-1.5 text-xs font-mono font-bold truncate ${
                          c.voltageDropPct > 2.5 ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-100 text-slate-800'
                        }`}>
                          {c.voltageDropPct.toFixed(2)} %
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                        {tr('Estado de Empalmes y Conexiones:', 'Splices & Connections Condition:', 'Estado das Emendas e Conexões:')}
                      </label>
                      <select
                        value={c.spliceCondition}
                        onChange={e => handleUpdateCircuit(c.id, { spliceCondition: e.target.value as WiringCircuitItem['spliceCondition'] })}
                        className={`w-full min-w-0 truncate rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
                          c.spliceCondition === 'CRITICO_RECALENTADO'
                            ? 'border-rose-400 bg-rose-50 text-rose-900'
                            : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      >
                        <option value="OPTIMO_BORNERA">{tr('✓ Borneras / Conectores Certificados', '✓ Certified Terminal Blocks / Connectors', '✓ Bornes / Conectores Certificados')}</option>
                        <option value="REGULAR_CINTA">{tr('⚠️ Empalme con Cinta Aislante Simple', '⚠️ Simple Electrical Tape Splice', '⚠️ Emenda com Fita Isolante Simples')}</option>
                        <option value="CRITICO_RECALENTADO">{tr('❌ Empalmes Sueltos / Recalentados', '❌ Loose / Overheated Splices', '❌ Emendas Frouxas / Sobreaquecidas')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Column 4: Llave Termomagnética, Llave Diferencial y Otras Llaves del Circuito */}
                  <div className="min-w-0 bg-white rounded-xl p-3.5 border border-slate-200/90 space-y-2.5 overflow-hidden">
                    <div className="text-[11px] font-black uppercase tracking-wider text-indigo-900 flex items-center justify-between gap-2">
                      <span className="truncate">{tr('D. Llaves del Circuito', 'D. Circuit Breakers & RCD', 'D. Disjuntores do Circuito')}</span>
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold shrink-0 whitespace-nowrap">
                        {c.breakerAmps > 0 ? `ITM ${c.breakerAmps}A` : 'Riesgo'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="col-span-2 min-w-0">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                          {tr('Llave Termomagnética:', 'Circuit Breaker (ITM):', 'Disjuntor Termomagnético:')}
                        </label>
                        <select
                          value={c.breakerAmps}
                          onChange={e => handleUpdateCircuit(c.id, { breakerAmps: Number(e.target.value) })}
                          className={`w-full min-w-0 truncate rounded-lg border px-2 py-1.5 text-xs font-black ${
                            c.breakerAmps > c.maxCableAmps || c.breakerAmps <= 0
                              ? 'border-rose-400 bg-rose-50 text-rose-900'
                              : 'border-slate-300 bg-white text-slate-900'
                          }`}
                        >
                          <option value={10}>10 A</option>
                          <option value={15}>15 A</option>
                          <option value={16}>16 A</option>
                          <option value={20}>20 A</option>
                          <option value={25}>25 A</option>
                          <option value={32}>32 A</option>
                          <option value={40}>40 A</option>
                          <option value={50}>50 A</option>
                          <option value={63}>63 A</option>
                          <option value={80}>80 A</option>
                          <option value={100}>100 A</option>
                          <option value={0}>{tr('❌ Sin Llave (Directo)', '❌ No Breaker (Direct)', '❌ Sem Disjuntor (Direto)')}</option>
                          <option value={-1}>{tr('❌ Llave Cuchilla/Plomo', '❌ Knife Switch/Fuse', '❌ Chave Faca/Fusível')}</option>
                        </select>
                      </div>

                      <div className="min-w-0">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                          {tr('Polos/Curva:', 'Poles/Curve:', 'Polos/Curva:')}
                        </label>
                        <select
                          value={`${c.breakerPoles}_${c.breakerCurve}`}
                          onChange={e => {
                            const [poles, curve] = e.target.value.split('_');
                            handleUpdateCircuit(c.id, {
                              breakerPoles: poles as WiringCircuitItem['breakerPoles'],
                              breakerCurve: curve as WiringCircuitItem['breakerCurve']
                            });
                          }}
                          className="w-full min-w-0 truncate rounded-lg border border-slate-300 bg-white px-1.5 py-1.5 text-xs font-bold text-slate-900"
                        >
                          <option value="1P_C">1P - C</option>
                          <option value="2P_B">2P - B</option>
                          <option value="2P_C">2P - C</option>
                          <option value="2P_D">2P - D</option>
                          <option value="3P_C">3P - C</option>
                          <option value="3P_D">3P - D</option>
                        </select>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                        {tr('Llave Diferencial Asociada (ID / RCD):', 'Associated Differential Switch (RCD):', 'Disjuntor Diferencial Associado (DR):')}
                      </label>
                      <select
                        value={c.rcdProtection}
                        onChange={e => handleUpdateCircuit(c.id, { rcdProtection: e.target.value as WiringCircuitItem['rcdProtection'] })}
                        className={`w-full min-w-0 truncate rounded-lg border px-2 py-1.5 text-xs font-bold ${
                          c.rcdProtection === 'SIN_DIFERENCIAL'
                            ? 'border-rose-400 bg-rose-50 text-rose-900'
                            : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      >
                        <option value="PROPIO_30MA">{tr('✓ Llave Diferencial 30mA Propia', '✓ Dedicated 30mA RCD Switch', '✓ Disjuntor DR 30mA Próprio')}</option>
                        <option value="GENERAL_30MA">{tr('✓ Protegido por Diferencial General 30mA', '✓ Protected by Main 30mA RCD', '✓ Protegido pelo DR Geral 30mA')}</option>
                        <option value="SELECTIVO_300MA">{tr('⚡ Diferencial 300mA (Solo Incendios)', '⚡ 300mA RCD (Fire Protection Only)', '⚡ DR 300mA (Apenas Incêndio)')}</option>
                        <option value="SIN_DIFERENCIAL">{tr('❌ SIN LLAVE DIFERENCIAL (Desprotegido)', '❌ NO DIFFERENTIAL SWITCH (Unprotected)', '❌ SEM DIFERENCIAL DR (Desprotegido)')}</option>
                      </select>
                    </div>

                    <div className="min-w-0">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5 truncate">
                        {tr('Otras Llaves / Equipos en la Línea:', 'Other Switches / Controls on Line:', 'Outras Chaves / Proteções na Linha:')}
                      </label>
                      <select
                        value={c.otherSwitch}
                        onChange={e => handleUpdateCircuit(c.id, { otherSwitch: e.target.value as WiringCircuitItem['otherSwitch'] })}
                        className="w-full min-w-0 truncate rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800"
                      >
                        <option value="NINGUNA">{tr('Ninguna llave adicional', 'No additional switch', 'Nenhuma chave adicional')}</option>
                        <option value="GUARDAMOTOR_CONTACTOR">{tr('Guardamotor + Contactor Magnético', 'Motor Starter + Magnetic Contactor', 'Disjuntor Motor + Contator')}</option>
                        <option value="RELE_TERMICO">{tr('Relé Térmico de Sobrecarga', 'Thermal Overload Relay', 'Relé Térmico de Sobrecarga')}</option>
                        <option value="TEMPORIZADOR">{tr('Llave Horaria / Temporizador / Sensor', 'Timer Switch / Photocell Sensor', 'Timer / Interruptor Horário')}</option>
                        <option value="UPS_ESTABILIZADOR">{tr('UPS / Estabilizador de Tensión', 'UPS / Voltage Stabilizer', 'UPS / Estabilizador de Tensão')}</option>
                        <option value="SECCIONADOR">{tr('Seccionador Bajo Carga', 'Load Break Switch', 'Chave Seccionadora sob Carga')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Visual Wire Color & Coordination Bar + Real-Time Diagnostic Findings */}
                <div className="bg-white rounded-xl p-3.5 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Visual representation of the 3 wires */}
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span className="font-black text-slate-700 uppercase text-[10px] tracking-wider">
                      {tr('Esquema Físico de Hilos:', 'Physical Wire Layout:', 'Esquema Físico dos Fios:')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-2.5 rounded-full border" style={{ background: phaseSwatch.bg, borderColor: phaseSwatch.border }} />
                      <span className="font-bold text-slate-800">Fase: {c.phaseColor}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-2.5 rounded-full border" style={{ background: neutralSwatch.bg, borderColor: neutralSwatch.border }} />
                      <span className="font-bold text-slate-800">Neutro: {c.neutralColor}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-2.5 rounded-full border" style={{ background: groundSwatch.bg, borderColor: groundSwatch.border }} />
                      <span className="font-bold text-slate-800">Tierra: {c.groundColor}</span>
                    </div>

                    <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                    <div className="font-mono text-[11px] font-bold text-slate-700">
                      <span>{tr('Regla CNE:', 'Coordination Rule:', 'Regra de Coordenação:')} </span>
                      <span className={c.measuredCurrentA <= c.breakerAmps && c.breakerAmps <= c.maxCableAmps && c.breakerAmps > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        I_med ({c.measuredCurrentA}A) ≤ ITM ({c.breakerAmps > 0 ? `${c.breakerAmps}A` : '—'}) ≤ I_cable ({c.maxCableAmps}A)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Issues & Corrective Actions Box */}
                {c.issues.length > 0 ? (
                  <div className="rounded-xl bg-white border border-rose-200 p-3.5 space-y-2">
                    <div className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        {tr(
                          `Diagnóstico del Circuito ${c.code} (${c.issues.length} hallazgos detectados):`,
                          `Circuit ${c.code} Diagnostic (${c.issues.length} findings detected):`,
                          `Diagnóstico do Circuito ${c.code} (${c.issues.length} problemas detectados):`
                        )}
                      </span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-800 pl-5 list-disc">
                      {c.issues.map((iss, i) => (
                        <li key={i} className={iss.severity === 'CRITICAL' ? 'text-rose-800 font-bold' : 'text-amber-900 font-medium'}>
                          {iss.text}
                        </li>
                      ))}
                    </ul>
                    {c.recommendations.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 text-xs text-indigo-950">
                        <strong className="font-bold text-indigo-700">
                          {tr('Acción Correctiva Recomendada: ', 'Recommended Corrective Action: ', 'Ação Corretiva Recomendada: ')}
                        </strong>
                        <span>{c.recommendations.join(' • ')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 px-3.5 py-2.5 text-xs text-emerald-900 flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {tr(
                        `✓ Circuito ${c.code} en óptimo estado: Calibre de cable (${c.gaugeMeta.label}), código de colores, corriente (${c.measuredCurrentA}A), llave termomagnética (${c.breakerAmps}A) y diferencial cumplen el CNE.`,
                        `✓ Circuit ${c.code} in optimal condition: Cable gauge (${c.gaugeMeta.label}), wire color code, current (${c.measuredCurrentA}A), breaker (${c.breakerAmps}A), and RCD comply with Code.`,
                        `✓ Circuito ${c.code} em ótimo estado: Bitola (${c.gaugeMeta.label}), código de cores, corrente (${c.measuredCurrentA}A), disjuntor (${c.breakerAmps}A) e DR cumprem a norma.`
                      )}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: EXECUTIVE WIRING & PROTECTION DIAGNOSTIC SUMMARY */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black">
                {tr(
                  '3. Conclusión del Diagnóstico de Conexión Eléctrica (Casa / Empresa)',
                  '3. Electrical Connection & Wiring Diagnostic Conclusion (Home / Business)',
                  '3. Conclusão do Diagnóstico da Instalação Elétrica (Casa / Empresa)'
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {tr(
                  'Resumen consolidado de seguridad de conductores, llaves termomagnéticas, diferenciales y código de colores CNE',
                  'Consolidated safety summary of conductors, thermomagnetic breakers, RCDs, and wire color compliance',
                  'Resumo consolidado de segurança de condutores, disjuntores termomagnéticos, diferenciais DR e código de cores'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shrink-0"
          >
            <FileBadge className="w-4 h-4" />
            <span>{tr('Ver en Informe Oficial CIP', 'View in Official CIP Report', 'Ver no Relatório Oficial CIP')}</span>
          </button>
        </div>

        {overallSummary.boardIssues.length > 0 && (
          <div className="rounded-2xl bg-rose-500/15 border border-rose-500/30 p-4 space-y-1.5">
            <p className="text-xs font-black text-rose-300 uppercase tracking-wider">
              {tr('Observaciones en Llave General y Tablero Principal:', 'Main Breaker & Distribution Board Findings:', 'Observações no Disjuntor Geral e Quadro Principal:')}
            </p>
            <ul className="list-disc pl-5 text-xs text-rose-100 space-y-1">
              {overallSummary.boardIssues.map((bIss, idx) => (
                <li key={idx}>{bIss}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-1.5">
            <span className="text-amber-400 font-black uppercase tracking-wider">
              {tr('Coordinación Cable vs Llave', 'Wire vs Breaker Coordination', 'Coordenação Cabo vs Disjuntor')}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {tr(
                'La llave termomagnética protege al cable contra incendios. Su amperaje nunca debe superar la capacidad máxima en Amperios del calibre del cable instalado.',
                'The thermomagnetic breaker protects the cable against fire. Its amp rating must never exceed the maximum ampacity of the installed wire gauge.',
                'O disjuntor termomagnético protege o cabo contra incêndios. Sua corrente nominal nunca deve superar a capacidade máxima do cabo instalado.'
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-1.5">
            <span className="text-emerald-400 font-black uppercase tracking-wider">
              {tr('Protección Humana (Diferencial + Tierra)', 'Human Protection (RCD + Ground)', 'Proteção Humana (DR + Terra)')}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {tr(
                'La llave diferencial de 30mA actúa en milisegundos junto con el cable de Tierra (Verde/Amarillo) para evitar descargas eléctricas mortales en personas.',
                'The 30mA RCD differential switch acts in milliseconds together with the Ground wire (Green/Yellow) to prevent fatal electric shocks.',
                'O disjuntor diferencial DR de 30mA atua em milissegundos junto com o fio Terra (Verde/Amarelo) para evitar choques elétricos fatais.'
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-1.5">
            <span className="text-indigo-300 font-black uppercase tracking-wider">
              {tr('Código de Colores Normativo CNE', 'Standard Wire Color Code', 'Código de Cores Normativo')}
            </span>
            <p className="text-slate-300 leading-relaxed">
              {tr(
                'Según CNE Utilización 030-036: Fases en Rojo, Negro o Azul; Neutro en Blanco o Gris Natural; y Tierra de Protección exclusivamente en Verde o Verde/Amarillo.',
                'Per Electrical Code 030-036: Phases in Red, Black, or Blue; Neutral in White or Gray; Protective Earth strictly in Green or Green/Yellow.',
                'Conforme a norma: Fases em Vermelho, Preto ou Azul; Neutro em Branco ou Azul Claro; Terra de Proteção exclusivamente em Verde ou Verde/Amarelo.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
