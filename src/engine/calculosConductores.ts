// Deterministic Wire Sizing & Ampacity Engine (CNE Utilización / IEC)
import { TrafficLight } from '../types';

export interface ConductorInput {
  calculatedCurrentA: number;
  wireMaterial: 'COBRE' | 'ALUMINIO';
  wireInsulation: 'THW' | 'THHN' | 'N2XH' | 'NH-80' | 'TW';
  wireSectionMm2: number;
  ambientTempC: number;
  groupingCount: number;
  isContinuousDuty?: boolean;
}

export interface ConductorResult {
  nominalSectionMm2: number;
  baseAmpacityA: number;
  temperatureDeratingFactor: number;
  groupingDeratingFactor: number;
  admissibleAmpacityIzA: number;
  requiredAmpacityIbA: number;
  loadRatioPercent: number;
  status: TrafficLight;
  recommendedMinimumSectionMm2: number;
  technicalObservations: string;
}

// Base ampacities for 3 conductors in conduit at 30°C (CNE Utilización Tabla 2 / IEC 60364-5-52)
const COPPER_AMPACITY_TABLE: Record<string, Record<number, number>> = {
  'TW': {
    1.5: 14, 2.5: 18, 4: 25, 6: 35, 10: 46, 16: 62, 25: 80, 35: 100, 50: 120, 70: 155, 95: 185, 120: 215, 150: 245, 185: 275, 240: 320
  },
  'THW': {
    1.5: 18, 2.5: 24, 4: 32, 6: 42, 10: 55, 16: 75, 25: 98, 35: 120, 50: 145, 70: 185, 95: 220, 120: 255, 150: 290, 185: 330, 240: 385
  },
  'THHN': {
    1.5: 20, 2.5: 28, 4: 37, 6: 48, 10: 65, 16: 90, 25: 115, 35: 140, 50: 175, 70: 220, 95: 260, 120: 300, 150: 345, 185: 395, 240: 460
  },
  'NH-80': {
    1.5: 20, 2.5: 28, 4: 37, 6: 48, 10: 65, 16: 90, 25: 115, 35: 140, 50: 175, 70: 220, 95: 260, 120: 300, 150: 345, 185: 395, 240: 460
  },
  'N2XH': {
    1.5: 22, 2.5: 30, 4: 40, 6: 52, 10: 71, 16: 96, 25: 125, 35: 155, 50: 190, 70: 240, 95: 290, 120: 335, 150: 385, 185: 440, 240: 515
  }
};

export const STANDARD_SECTIONS_MM2 = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];

/**
 * Temperature correction factor based on 30°C base
 */
export function getTemperatureDeratingFactor(tempC: number, insulation: string): number {
  if (tempC <= 30) return 1.0;
  const is90C = insulation === 'N2XH' || insulation === 'NH-80' || insulation === 'THHN';
  
  if (tempC <= 35) return is90C ? 0.96 : 0.94;
  if (tempC <= 40) return is90C ? 0.91 : 0.87;
  if (tempC <= 45) return is90C ? 0.87 : 0.79;
  if (tempC <= 50) return is90C ? 0.82 : 0.71;
  return is90C ? 0.76 : 0.58;
}

/**
 * Grouping correction factor for conductors in same raceway
 */
export function getGroupingDeratingFactor(circuitsCount: number): number {
  if (circuitsCount <= 3) return 1.0;
  if (circuitsCount <= 6) return 0.80;
  if (circuitsCount <= 9) return 0.70;
  if (circuitsCount <= 24) return 0.70;
  return 0.50;
}

export function evaluateConductor(input: ConductorInput): ConductorResult {
  const insulation = input.wireInsulation || 'NH-80';
  const table = COPPER_AMPACITY_TABLE[insulation] || COPPER_AMPACITY_TABLE['NH-80'];
  
  const rawBaseAmp = table[input.wireSectionMm2] || 20;
  // Aluminum factor is ~0.78 relative to copper
  const materialFactor = input.wireMaterial === 'ALUMINIO' ? 0.78 : 1.0;
  const baseAmpacityA = Number((rawBaseAmp * materialFactor).toFixed(1));

  const fT = getTemperatureDeratingFactor(input.ambientTempC, insulation);
  const fN = getGroupingDeratingFactor(input.groupingCount || 1);

  const admissibleAmpacityIzA = Number((baseAmpacityA * fT * fN).toFixed(1));
  
  // Continuous duty requires 125% safety factor for design load
  const requiredAmpacityIbA = input.isContinuousDuty 
    ? Number((input.calculatedCurrentA * 1.25).toFixed(2))
    : Number(input.calculatedCurrentA.toFixed(2));

  const loadRatioPercent = admissibleAmpacityIzA > 0
    ? Number(((requiredAmpacityIbA / admissibleAmpacityIzA) * 100).toFixed(1))
    : 100;

  let status: TrafficLight = 'ADECUADO';
  let technicalObservations = '';

  if (loadRatioPercent > 100) {
    status = 'NO_ADECUADO';
    technicalObservations = `PELIGRO DE SOBRECALENTAMIENTO: La corriente de carga (${requiredAmpacityIbA}A) supera la capacidad admisible del conductor (${admissibleAmpacityIzA}A) bajo las condiciones de temperatura (${input.ambientTempC}°C) y agrupamiento (${input.groupingCount} cond.).`;
  } else if (loadRatioPercent >= 85) {
    status = 'REVISAR';
    technicalObservations = `ALERTA DE ALTA CARGA: Conductor trabajando al ${loadRatioPercent}% de su capacidad térmica admisible (${admissibleAmpacityIzA}A). Se recomienda evaluar incremento de calibre para reducir pérdidas joule y calentamiento.`;
  } else {
    status = 'ADECUADO';
    technicalObservations = `Conductor térmicamente adecuado. Capacidad admisible: ${admissibleAmpacityIzA}A vs Corriente de diseño: ${requiredAmpacityIbA}A (Margen: ${(100 - loadRatioPercent).toFixed(1)}%).`;
  }

  // Find minimum recommended section
  let recommendedMinimumSectionMm2 = input.wireSectionMm2;
  for (const s of STANDARD_SECTIONS_MM2) {
    const sBase = (table[s] || 20) * materialFactor;
    const sIz = sBase * fT * fN;
    if (sIz >= requiredAmpacityIbA) {
      recommendedMinimumSectionMm2 = s;
      break;
    }
  }

  return {
    nominalSectionMm2: input.wireSectionMm2,
    baseAmpacityA,
    temperatureDeratingFactor: fT,
    groupingDeratingFactor: fN,
    admissibleAmpacityIzA,
    requiredAmpacityIbA,
    loadRatioPercent,
    status,
    recommendedMinimumSectionMm2,
    technicalObservations
  };
}

export const calculateConductorAmpacity = evaluateConductor;
export const calculateWireAmpacity = evaluateConductor;
