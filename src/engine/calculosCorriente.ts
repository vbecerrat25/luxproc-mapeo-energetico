// Deterministic Calculation Engine for Current & Power
import { PhaseSystem, PowerUnit } from '../types';

export interface CurrentCalculationInput {
  power: number;
  powerUnit: PowerUnit;
  voltage: number;
  phases: PhaseSystem;
  powerFactor: number;
  isMotor?: boolean;
  efficiencyPercent?: number;
  measuredCurrentA?: number;
}

export interface CurrentCalculationResult {
  powerWatts: number;
  powerKw: number;
  powerHp: number;
  calculatedCurrentA: number;
  measuredCurrentA?: number;
  differenceA?: number;
  differencePercent?: number;
  formulaDescription: string;
}

/**
 * Converts power to standard Watts
 */
export function convertPowerToWatts(power: number, unit: PowerUnit): number {
  switch (unit) {
    case 'HP':
      return power * 746; // 1 HP = 746 W (Norma técnica)
    case 'kW':
      return power * 1000;
    case 'W':
    default:
      return power;
  }
}

/**
 * Calculates deterministic electric current based on system configuration
 */
export function calculateCurrent(input: CurrentCalculationInput): CurrentCalculationResult {
  const powerW = convertPowerToWatts(input.power, input.powerUnit);
  const powerKw = powerW / 1000;
  const powerHp = powerW / 746;
  const fp = Math.max(0.2, Math.min(1.0, input.powerFactor || 0.85));
  const efficiency = input.isMotor 
    ? Math.max(0.5, Math.min(1.0, (input.efficiencyPercent || 85) / 100))
    : 1.0;
  
  const voltage = input.voltage > 0 ? input.voltage : 220;
  let calculatedCurrentA = 0;
  let formulaDesc = '';

  if (input.phases === 'TRIFASICO') {
    // Trifásico: I = P / (√3 * V * cosφ * η)
    calculatedCurrentA = powerW / (Math.sqrt(3) * voltage * fp * efficiency);
    formulaDesc = input.isMotor
      ? `Trifásico con motor: I = P / (√3 × ${voltage}V × ${fp} × ${efficiency.toFixed(2)})`
      : `Trifásico: I = P / (√3 × ${voltage}V × ${fp})`;
  } else {
    // Monofásico / Bifásico: I = P / (V * cosφ * η)
    calculatedCurrentA = powerW / (voltage * fp * efficiency);
    formulaDesc = input.isMotor
      ? `Monofásico con motor: I = P / (${voltage}V × ${fp} × ${efficiency.toFixed(2)})`
      : `Monofásico: I = P / (${voltage}V × ${fp})`;
  }

  calculatedCurrentA = Number(calculatedCurrentA.toFixed(2));

  let differenceA: number | undefined = undefined;
  let differencePercent: number | undefined = undefined;

  if (input.measuredCurrentA !== undefined && input.measuredCurrentA > 0) {
    differenceA = Number((input.measuredCurrentA - calculatedCurrentA).toFixed(2));
    differencePercent = Number(((differenceA / calculatedCurrentA) * 100).toFixed(1));
  }

  return {
    powerWatts: Number(powerW.toFixed(2)),
    powerKw: Number(powerKw.toFixed(3)),
    powerHp: Number(powerHp.toFixed(2)),
    calculatedCurrentA,
    measuredCurrentA: input.measuredCurrentA,
    differenceA,
    differencePercent,
    formulaDescription: formulaDesc
  };
}
