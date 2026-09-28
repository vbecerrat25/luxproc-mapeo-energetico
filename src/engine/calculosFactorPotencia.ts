// Deterministic Power Factor & Capacitive Compensation Engine
import { PowerFactorAnalysis } from '../types';

export interface PowerFactorInput {
  activePowerKw: number;
  currentPowerFactor: number;
  targetPowerFactor?: number; // default 0.96 (Peruvian regulatory threshold)
  monthlyActiveEnergyKwh?: number;
  reactivePenaltyRatePerKvarh?: number; // S/. / kvarh excess
}

export function calculatePowerFactor(input: PowerFactorInput): PowerFactorAnalysis {
  const pKw = Math.max(0.1, input.activePowerKw);
  const fp1 = Math.max(0.2, Math.min(0.99, input.currentPowerFactor || 0.80));
  const fp2 = Math.max(fp1, Math.min(1.0, input.targetPowerFactor || 0.96));

  // Angles in radians
  const phi1 = Math.acos(fp1);
  const phi2 = Math.acos(fp2);

  const tanPhi1 = Math.tan(phi1);
  const tanPhi2 = Math.tan(phi2);

  // Reactive power: Q1 = P * tan(phi1)
  const q1Kvar = Number((pKw * tanPhi1).toFixed(2));
  // Apparent power: S1 = P / fp1
  const s1Kva = Number((pKw / fp1).toFixed(2));

  // Required capacitor bank capacity: Qc = P * (tan(phi1) - tan(phi2))
  const qcRaw = pKw * (tanPhi1 - tanPhi2);
  const requiredCapacitorKvar = Number(Math.max(0, qcRaw).toFixed(1));

  // Standard automatic capacitor steps determination
  let stepSizeKvar = 5;
  if (requiredCapacitorKvar > 100) {
    stepSizeKvar = 25;
  } else if (requiredCapacitorKvar > 50) {
    stepSizeKvar = 15;
  } else if (requiredCapacitorKvar > 20) {
    stepSizeKvar = 10;
  } else if (requiredCapacitorKvar > 8) {
    stepSizeKvar = 5;
  } else {
    stepSizeKvar = 2.5;
  }

  const suggestedStepsCount = Math.max(1, Math.ceil(requiredCapacitorKvar / stepSizeKvar));

  // Peruvian reactive penalty estimation (OSINERGMIN tariff rule: penalty applies if Q > 0.30 * P, i.e., FP < 0.96)
  const monthlyKwh = input.monthlyActiveEnergyKwh || (pKw * 200); // approx 200 operating hours/month
  const reactivePenaltyRate = input.reactivePenaltyRatePerKvarh || 0.12; // S/. / kvarh

  let monthlyPenaltyEstimatedSoles = 0;
  if (fp1 < 0.96) {
    // Excessive reactive energy: Kvarh_excess ≈ Kwh * (tan(phi1) - 0.30)
    const excessKvarh = Math.max(0, monthlyKwh * (tanPhi1 - 0.30));
    monthlyPenaltyEstimatedSoles = Number((excessKvarh * reactivePenaltyRate).toFixed(2));
  }

  const annualSavingsSoles = Number((monthlyPenaltyEstimatedSoles * 12).toFixed(2));
  
  // Cost estimation of capacitor bank with automatic controller (~ S/. 280 / kvar installed)
  const estimatedInvestmentSoles = Number((requiredCapacitorKvar * 280 + 1200).toFixed(2));
  
  const paybackMonths = annualSavingsSoles > 0
    ? Number(((estimatedInvestmentSoles / (annualSavingsSoles / 12))).toFixed(1))
    : 0;

  return {
    activePowerKw: Number(pKw.toFixed(2)),
    reactivePowerKvar: q1Kvar,
    apparentPowerKva: s1Kva,
    currentPowerFactor: fp1,
    targetPowerFactor: fp2,
    requiredCapacitorKvar,
    suggestedStepsCount,
    stepSizeKvar,
    monthlyPenaltyEstimatedSoles,
    annualSavingsSoles,
    estimatedInvestmentSoles,
    paybackMonths
  };
}
