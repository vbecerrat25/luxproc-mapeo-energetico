// Deterministic Photovoltaic Solar Sizing Engine for Peru
import { SolarPVConfig, TariffConfig } from '../types';

export interface SolarCalculationInput {
  scenarioKwp: number; // 5, 15, 30 or custom
  panelWattageW?: number; // default 550W Tier-1 Monocrystalline PERC/TopCon
  peakSunHoursHsp?: number; // default 5.0 HSP (representative for coastal/central Peru)
  systemPerformanceRatio?: number; // default 0.80
  currentAnnualConsumptionKwh: number;
  tariff: TariffConfig;
}

export function calculateSolarPV(input: SolarCalculationInput): SolarPVConfig {
  const kwp = Math.max(1.0, input.scenarioKwp || 5.0);
  const panelW = input.panelWattageW || 550;
  const hsp = input.peakSunHoursHsp || 5.0;
  const pr = input.systemPerformanceRatio || 0.80;

  // Panel count
  const panelCount = Math.ceil((kwp * 1000) / panelW);
  const actualKwp = (panelCount * panelW) / 1000;

  // Daily generation: E_dia = kWp * HSP * PR
  const dailyGenerationKwh = Number((actualKwp * hsp * pr).toFixed(2));
  const monthlyGenerationKwh = Number((dailyGenerationKwh * 30.4).toFixed(2));
  const annualGenerationKwh = Number((dailyGenerationKwh * 365).toFixed(2));

  // Annual cost savings
  const energyRate = input.tariff.activeEnergyPriceKwh || 0.75;
  const annualCostSavingsSoles = Number((annualGenerationKwh * energyRate).toFixed(2));

  // Turnkey investment in Soles (~ S/. 3,800 / kWp including hybrid inverter, mounting racks, DC/AC protections & installation)
  const estimatedTurnkeyCostSoles = Number((actualKwp * 3800).toFixed(2));

  const paybackYears = annualCostSavingsSoles > 0
    ? Number((estimatedTurnkeyCostSoles / annualCostSavingsSoles).toFixed(1))
    : 0;

  // Environmental impact: Peru emission factor ~ 0.385 kg CO2 / kWh
  const co2AvoidedTonsPerYear = Number(((annualGenerationKwh * 0.385) / 1000).toFixed(2));

  // Coverage percentage of the facility's demand
  const coveragePercentage = input.currentAnnualConsumptionKwh > 0
    ? Number(Math.min(100, (annualGenerationKwh / input.currentAnnualConsumptionKwh) * 100).toFixed(1))
    : 100;

  return {
    scenarioKwp: Number(actualKwp.toFixed(2)),
    panelWattageW: panelW,
    panelCount,
    peakSunHoursHsp: hsp,
    systemPerformanceRatio: pr,
    dailyGenerationKwh,
    monthlyGenerationKwh,
    annualGenerationKwh,
    annualCostSavingsSoles,
    estimatedTurnkeyCostSoles,
    paybackYears,
    co2AvoidedTonsPerYear,
    coveragePercentage
  };
}
