// Deterministic Consumption Calculation Engine
import { EquipmentRecord, TariffConfig } from '../types';
import { convertPowerToWatts } from './calculosCorriente';

export interface EquipmentConsumptionResult {
  equipmentId: string;
  equipmentCode: string;
  equipmentName: string;
  category: string;
  areaTag: string;
  powerKwTotal: number;
  dailyKwh: number;
  weeklyKwh: number;
  monthlyKwh: number;
  annualKwh: number;
  monthlyCostSoles: number;
  annualCostSoles: number;
  percentageOfTotal: number;
}

export interface TotalConsumptionResult {
  totalEquipmentCount: number;
  totalInstalledPowerKw: number;
  totalDailyKwh: number;
  totalWeeklyKwh: number;
  totalMonthlyKwh: number;
  totalAnnualKwh: number;
  totalMonthlyCostSoles: number;
  totalAnnualCostSoles: number;
  equipmentBreakdown: EquipmentConsumptionResult[];
  categoryBreakdown: { category: string; monthlyKwh: number; monthlyCostSoles: number; percentage: number }[];
  byCategory?: { category: string; monthlyKwh: number; monthlyCostSoles: number; percentage: number }[];
  areaBreakdown: { area: string; monthlyKwh: number; monthlyCostSoles: number; percentage: number }[];
  rankingTopConsumers: EquipmentConsumptionResult[];
}

export function calculateEquipmentConsumption(
  eq: EquipmentRecord,
  tariff: TariffConfig,
  totalSystemMonthlyKwh = 0
): EquipmentConsumptionResult {
  const powerW = convertPowerToWatts(eq.power, eq.powerUnit);
  const powerKw = (powerW / 1000) * Math.max(1, eq.quantity);
  const loadFactor = Math.max(0.1, Math.min(1.0, eq.loadFactor || 0.8));
  
  // Operating hours calculation
  const hoursPerDay = Math.min(24, Math.max(0, eq.hoursPerDay || 0));
  const daysPerWeek = Math.min(7, Math.max(0, eq.daysPerWeek || 0));
  const weeksPerMonth = Math.min(4.33, Math.max(0, eq.weeksPerMonth || 4.33));

  const effectivePowerKw = powerKw * loadFactor;
  const dailyKwh = effectivePowerKw * hoursPerDay;
  const weeklyKwh = dailyKwh * daysPerWeek;
  const monthlyKwh = weeklyKwh * weeksPerMonth;
  const annualKwh = monthlyKwh * 12;

  const energyRate = tariff.activeEnergyPriceKwh || 0.75;
  const monthlyCostSoles = monthlyKwh * energyRate;
  const annualCostSoles = annualKwh * energyRate;

  const percentageOfTotal = totalSystemMonthlyKwh > 0 
    ? Number(((monthlyKwh / totalSystemMonthlyKwh) * 100).toFixed(1))
    : 0;

  return {
    equipmentId: eq.id,
    equipmentCode: eq.code,
    equipmentName: eq.name,
    category: eq.category,
    areaTag: eq.areaTag || 'General',
    powerKwTotal: Number(powerKw.toFixed(2)),
    dailyKwh: Number(dailyKwh.toFixed(2)),
    weeklyKwh: Number(weeklyKwh.toFixed(2)),
    monthlyKwh: Number(monthlyKwh.toFixed(2)),
    annualKwh: Number(annualKwh.toFixed(2)),
    monthlyCostSoles: Number(monthlyCostSoles.toFixed(2)),
    annualCostSoles: Number(annualCostSoles.toFixed(2)),
    percentageOfTotal
  };
}

export function calculateTotalConsumption(
  equipmentList: EquipmentRecord[],
  tariff: TariffConfig
): TotalConsumptionResult {
  if (!equipmentList || equipmentList.length === 0) {
    return {
      totalEquipmentCount: 0,
      totalInstalledPowerKw: 0,
      totalDailyKwh: 0,
      totalWeeklyKwh: 0,
      totalMonthlyKwh: 0,
      totalAnnualKwh: 0,
      totalMonthlyCostSoles: 0,
      totalAnnualCostSoles: 0,
      equipmentBreakdown: [],
      categoryBreakdown: [],
      byCategory: [],
      areaBreakdown: [],
      rankingTopConsumers: []
    };
  }

  // 1st pass: calculate raw sums
  let totalInstalledPowerKw = 0;
  let totalDailyKwh = 0;
  let totalWeeklyKwh = 0;
  let totalMonthlyKwh = 0;
  let totalAnnualKwh = 0;

  const preliminaryResults = equipmentList.map(eq => {
    const res = calculateEquipmentConsumption(eq, tariff, 0);
    totalInstalledPowerKw += res.powerKwTotal;
    totalDailyKwh += res.dailyKwh;
    totalWeeklyKwh += res.weeklyKwh;
    totalMonthlyKwh += res.monthlyKwh;
    totalAnnualKwh += res.annualKwh;
    return res;
  });

  // 2nd pass: assign exact percentage of total
  const equipmentBreakdown = preliminaryResults.map(item => ({
    ...item,
    percentageOfTotal: totalMonthlyKwh > 0 ? Number(((item.monthlyKwh / totalMonthlyKwh) * 100).toFixed(1)) : 0
  }));

  const energyRate = tariff.activeEnergyPriceKwh || 0.75;
  const totalMonthlyCostSoles = Number((totalMonthlyKwh * energyRate).toFixed(2));
  const totalAnnualCostSoles = Number((totalAnnualKwh * energyRate).toFixed(2));

  // Category aggregation
  const catMap: Record<string, { monthlyKwh: number; monthlyCostSoles: number }> = {};
  const areaMap: Record<string, { monthlyKwh: number; monthlyCostSoles: number }> = {};

  equipmentBreakdown.forEach(item => {
    if (!catMap[item.category]) {
      catMap[item.category] = { monthlyKwh: 0, monthlyCostSoles: 0 };
    }
    catMap[item.category].monthlyKwh += item.monthlyKwh;
    catMap[item.category].monthlyCostSoles += item.monthlyCostSoles;

    const area = item.areaTag || 'General';
    if (!areaMap[area]) {
      areaMap[area] = { monthlyKwh: 0, monthlyCostSoles: 0 };
    }
    areaMap[area].monthlyKwh += item.monthlyKwh;
    areaMap[area].monthlyCostSoles += item.monthlyCostSoles;
  });

  const categoryBreakdown = Object.entries(catMap).map(([category, val]) => ({
    category,
    monthlyKwh: Number(val.monthlyKwh.toFixed(2)),
    monthlyCostSoles: Number(val.monthlyCostSoles.toFixed(2)),
    percentage: totalMonthlyKwh > 0 ? Number(((val.monthlyKwh / totalMonthlyKwh) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.monthlyKwh - a.monthlyKwh);

  const areaBreakdown = Object.entries(areaMap).map(([area, val]) => ({
    area,
    monthlyKwh: Number(val.monthlyKwh.toFixed(2)),
    monthlyCostSoles: Number(val.monthlyCostSoles.toFixed(2)),
    percentage: totalMonthlyKwh > 0 ? Number(((val.monthlyKwh / totalMonthlyKwh) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.monthlyKwh - a.monthlyKwh);

  const rankingTopConsumers = [...equipmentBreakdown].sort((a, b) => b.monthlyKwh - a.monthlyKwh);

  return {
    totalEquipmentCount: equipmentList.length,
    totalInstalledPowerKw: Number(totalInstalledPowerKw.toFixed(2)),
    totalDailyKwh: Number(totalDailyKwh.toFixed(2)),
    totalWeeklyKwh: Number(totalWeeklyKwh.toFixed(2)),
    totalMonthlyKwh: Number(totalMonthlyKwh.toFixed(2)),
    totalAnnualKwh: Number(totalAnnualKwh.toFixed(2)),
    totalMonthlyCostSoles,
    totalAnnualCostSoles,
    equipmentBreakdown,
    categoryBreakdown,
    byCategory: categoryBreakdown,
    areaBreakdown,
    rankingTopConsumers
  };
}
