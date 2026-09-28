// Deterministic Residual Current Device (RCD / Interruptor Diferencial) Verification Engine
import { PhaseSystem, TrafficLight } from '../types';

export interface RcdInput {
  circuitCurrentIbA: number;
  circuitBreakerRatingInA: number;
  phases: PhaseSystem;
  existingRcdRatingA?: number;
  existingSensitivityMa?: number;
  loadType: string;
  hasElectronicVfd?: boolean;
}

export interface RcdResult {
  recommendedRatingA: number;
  recommendedSensitivityMa: number;
  recommendedType: 'AC' | 'A' | 'F' | 'B';
  poles: number;
  status: TrafficLight;
  isCoordinatedWithBreaker: boolean;
  isHumanProtectionGuaranteed: boolean;
  technicalObservations: string;
  safetyWarning: string;
}

export function evaluateRcd(input: RcdInput): RcdResult {
  const breakerIn = Math.max(10, input.circuitBreakerRatingInA || 16);
  const poles = input.phases === 'TRIFASICO' ? 4 : 2;

  // Differential nominal current must be >= upstream breaker nominal current: In_diff >= In_breaker
  let recommendedRatingA = 25;
  if (breakerIn > 63) {
    recommendedRatingA = 100;
  } else if (breakerIn > 40) {
    recommendedRatingA = 63;
  } else if (breakerIn > 25) {
    recommendedRatingA = 40;
  } else {
    recommendedRatingA = 25;
  }

  // Sensitivity determination: 30mA for direct human protection in residential, offices, workshops
  // 300mA for industrial main panel or fire protection
  let recommendedSensitivityMa = 30;
  let isHumanProtectionGuaranteed = true;

  if (input.loadType === 'MAQUINA_ESPECIAL' && input.circuitCurrentIbA > 60) {
    recommendedSensitivityMa = 300;
    isHumanProtectionGuaranteed = false;
  }

  // Differential type selection
  let recommendedType: 'AC' | 'A' | 'F' | 'B' = 'A';
  if (input.hasElectronicVfd || input.loadType === 'MOTOR' && input.phases === 'TRIFASICO') {
    recommendedType = 'B'; // For three phase frequency drives
  } else if (input.loadType === 'MAQUINA_ESPECIAL' || input.hasElectronicVfd) {
    recommendedType = 'F'; // Single-phase inverter / converters
  } else if (input.loadType === 'ILUMINACION' || input.loadType === 'TOMACORRIENTES' || input.loadType === 'OTRO') {
    recommendedType = 'A'; // Type A immunised against DC pulsating leakage
  }

  const existingIn = input.existingRcdRatingA;
  const existingSensitivity = input.existingSensitivityMa;

  let status: TrafficLight = 'ADECUADO';
  let isCoordinatedWithBreaker = true;
  let technicalObservations = '';

  if (existingIn && existingIn > 0) {
    if (existingIn < breakerIn) {
      status = 'NO_ADECUADO';
      isCoordinatedWithBreaker = false;
      technicalObservations = `RIESGO DE DESTRUCCIÓN DEL DIFERENCIAL: Capacidad del diferencial (${existingIn}A) es menor que el termomagnético aguas arriba (${breakerIn}A). Puede sobrecalentarse y destruirse ante sobrecargas continuas.`;
    } else if (existingSensitivity && existingSensitivity > 30 && input.loadType !== 'MAQUINA_ESPECIAL') {
      status = 'REVISAR';
      technicalObservations = `Sensibilidad de ${existingSensitivity}mA es apta para protección contra incendios, pero NO garantiza protección directa a personas contra contacto accidental (requiere ≤30mA).`;
    } else {
      status = 'ADECUADO';
      technicalObservations = `Diferencial coordinado correctamente con termomagnético (${existingIn}A ≥ ${breakerIn}A), sensibilidad ${existingSensitivity || 30}mA, Tipo ${recommendedType}.`;
    }
  } else {
    // If no RCD installed
    status = 'REVISAR';
    technicalObservations = `Se recomienda instalar interruptor diferencial ${recommendedRatingA}A / ${recommendedSensitivityMa}mA Tipo ${recommendedType} (${poles}P) para garantizar la seguridad de operarios y cumplimiento de la regla CNE 050.`;
  }

  const safetyWarning = 
    "Nunca asumir que un interruptor diferencial garantiza por sí solo la seguridad total si la instalación de puesta a tierra, la continuidad del conductor de protección PE o los termomagnéticos no han sido verificados.";

  return {
    recommendedRatingA,
    recommendedSensitivityMa,
    recommendedType,
    poles,
    status,
    isCoordinatedWithBreaker,
    isHumanProtectionGuaranteed,
    technicalObservations,
    safetyWarning
  };
}
