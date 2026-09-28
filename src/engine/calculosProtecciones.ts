// Deterministic Thermomagnetic Circuit Breaker Sizing & Verification Engine
import { PhaseSystem, TrafficLight } from '../types';

export interface BreakerInput {
  calculatedCurrentIbA: number;
  conductorAmpacityIzA: number;
  existingBreakerRatingA?: number;
  isMotor: boolean;
  startingCurrentA?: number;
  phases: PhaseSystem;
  loadType: string;
}

export interface BreakerResult {
  existingBreakerA?: number;
  recommendedBreakerA: number;
  breakerPoles: number;
  tripCurve: 'B' | 'C' | 'D';
  breakingCapacityKa: number;
  coordinationStatus: TrafficLight;
  isConditionIbMet: boolean; // Ib <= In
  isConditionIzMet: boolean; // In <= Iz
  safetyWarning: string;
  technicalJustification: string;
}

export const STANDARD_BREAKER_RATINGS_A = [
  6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630
];

export function evaluateBreaker(input: BreakerInput): BreakerResult {
  const ib = Math.max(0.1, input.calculatedCurrentIbA);
  const iz = Math.max(1.0, input.conductorAmpacityIzA);

  // Determine appropriate tripping curve
  let tripCurve: 'B' | 'C' | 'D' = 'C';
  if (input.isMotor || input.loadType === 'MOTOR' || input.loadType === 'MAQUINA_ESPECIAL' || (input.startingCurrentA && input.startingCurrentA > ib * 3)) {
    tripCurve = 'D'; // For motors and inductive loads with high starting inrush (10-14 x In)
  } else if (input.loadType === 'ILUMINACION' || input.loadType === 'TOMACORRIENTES') {
    tripCurve = 'C'; // Standard residential/commercial (5-10 x In)
  }

  // Determine poles
  let breakerPoles = 2;
  if (input.phases === 'TRIFASICO') {
    breakerPoles = 3;
  } else if (input.phases === 'MONOFASICO') {
    breakerPoles = 2; // In Peru CNE 2P is mandatory for 220V phase-phase or phase-neutral protection
  }

  // Determine standard breaking capacity (Icu)
  // Residential/Commercial: 6kA or 10kA, Industrial: 10kA, 15kA or 25kA
  const breakingCapacityKa = input.phases === 'TRIFASICO' || ib > 50 ? 10 : 6;

  // Find optimal recommended rating In such that Ib <= In <= Iz
  let recommendedBreakerA = STANDARD_BREAKER_RATINGS_A[STANDARD_BREAKER_RATINGS_A.length - 1];
  for (const rating of STANDARD_BREAKER_RATINGS_A) {
    if (rating >= ib) {
      recommendedBreakerA = rating;
      break;
    }
  }

  const existingIn = input.existingBreakerRatingA;
  const ratingToCheck = existingIn && existingIn > 0 ? existingIn : recommendedBreakerA;

  const isConditionIbMet = ib <= ratingToCheck;
  const isConditionIzMet = ratingToCheck <= iz;

  let coordinationStatus: TrafficLight = 'ADECUADO';
  let technicalJustification = '';

  if (!isConditionIbMet) {
    coordinationStatus = 'NO_ADECUADO';
    technicalJustification = `DISPARO POR CARGA: El termomagnético (${ratingToCheck}A) es menor que la corriente de operación calculada (${ib.toFixed(1)}A), provocando disparos intempestivos bajo carga nominal.`;
  } else if (!isConditionIzMet) {
    coordinationStatus = 'NO_ADECUADO';
    technicalJustification = `PELIGRO DE INCENDIO / SIN PROTECCIÓN TÉRMICA: El termomagnético (${ratingToCheck}A) es mayor que la capacidad admisible del conductor Iz (${iz.toFixed(1)}A). El cable se sobrecalentará antes de que la llave se dispare.`;
  } else if (ratingToCheck > iz * 0.9) {
    coordinationStatus = 'REVISAR';
    technicalJustification = `Margen ajustado: Termomagnético de ${ratingToCheck}A protege el conductor de ${iz.toFixed(1)}A, pero opera con escaso margen térmico de seguridad.`;
  } else {
    coordinationStatus = 'ADECUADO';
    technicalJustification = `Coordinación reglamentaria satisfecha: Ib (${ib.toFixed(1)}A) ≤ In (${ratingToCheck}A) ≤ Iz (${iz.toFixed(1)}A). Curva ${tripCurve}, ${breakerPoles} Polos, Icu ${breakingCapacityKa}kA.`;
  }

  const safetyWarning = 
    "Este resultado es preliminar y debe ser verificado por un profesional competente y contrastado con la capacidad del conductor, condiciones de instalación, corriente de cortocircuito disponible y normativa aplicable (CNE / IEC 60947-2 / IEC 60898).";

  return {
    existingBreakerA: existingIn,
    recommendedBreakerA,
    breakerPoles,
    tripCurve,
    breakingCapacityKa,
    coordinationStatus,
    isConditionIbMet,
    isConditionIzMet,
    safetyWarning,
    technicalJustification
  };
}
