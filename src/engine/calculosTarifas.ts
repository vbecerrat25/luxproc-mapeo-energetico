// Engine de Evaluación y Recomendación Tarifaria según OSINERGMIN / Ley de Concesiones Eléctricas del Perú (Decreto Ley N° 25844)
import { CompleteDiagnostic, TariffConfig } from '../types';

export interface TariffComparisonItem {
  code: string;
  name: string;
  category: 'Residencial / Comercial' | 'Horario' | 'Demanda / Potencia' | 'Media Tensión' | 'Mercado Libre';
  voltageLevel: 'Baja Tensión (BT)' | 'Media Tensión (MT)' | 'Mercado Libre';
  monthlyCostSoles: number;
  annualCostSoles: number;
  energyCostSoles: number;
  powerCostSoles: number;
  fixedCostSoles: number;
  reactivePenaltySoles: number;
  effectiveKwhRate: number; // S/. por kWh efectivo total
  differencePercentVsCurrent: number; // Negativo = ahorro, Positivo = más caro
  annualSavingsVsCurrentSoles: number;
  isCurrent: boolean;
  isRecommended: boolean;
  feasibility: 'ALTA' | 'MEDIA' | 'REQUIERE_SUBESTACION' | 'REQUIERE_CONTRATO_LIBRE';
  summaryBadge: string;
  description: string;
  requirements: string[];
}

export interface TariffRecommendationResult {
  currentTariffCode: string;
  recommendedTariffCode: string;
  isMigrationRecommended: boolean;
  monthlySavingsSoles: number;
  annualSavingsSoles: number;
  percentageSavings: number;
  breakdown: TariffComparisonItem[];
  currentMonthlyCost: number;
  recommendedMonthlyCost: number;
  primaryExplanation: string;
  technicalProcedure: string[];
  suggestedPeakShiftAdvice: string;
}

export function evaluatePeruvianTariffs(
  diagnostic: CompleteDiagnostic,
  customTotalKwh?: number,
  customMaxDemandKw?: number
): TariffRecommendationResult {
  const { tariff, equipment, receipts, powerFactor } = diagnostic;
  const hasRealData = (receipts && receipts.length > 0) || (equipment && equipment.length > 0);

  // 1. Determinar consumo mensual base (de censo o promedio de recibos)
  let totalMonthlyKwh = customTotalKwh || 0;
  if (!totalMonthlyKwh) {
    if (receipts && receipts.length > 0) {
      const sum = receipts.reduce((acc, r) => acc + (r.kwhConsumed || 0), 0);
      totalMonthlyKwh = sum / receipts.length;
    } else if (equipment && equipment.length > 0) {
      totalMonthlyKwh = equipment.reduce((acc, eq) => {
        const w = eq.powerUnit === 'HP' ? eq.power * 746 : (eq.powerUnit === 'kW' ? eq.power * 1000 : eq.power);
        const kw = w / 1000;
        const dailyKwh = kw * eq.quantity * (eq.loadFactor || 0.8) * eq.hoursPerDay;
        return acc + dailyKwh * (eq.daysPerWeek || 6) * 4.33;
      }, 0);
    } else {
      totalMonthlyKwh = 0; // En blanco cuando la plataforma está limpia
    }
  }

  // 2. Determinar Demanda Máxima estimada (kW)
  let maxDemandKw = customMaxDemandKw || 0;
  if (!maxDemandKw) {
    if (receipts && receipts.length > 0) {
      const maxInReceipts = Math.max(...receipts.map(r => r.maxDemandKw || r.billedPowerKw || 0));
      maxDemandKw = maxInReceipts > 0 ? maxInReceipts : 0;
    } else if (equipment && equipment.length > 0) {
      const totalInstalledKw = equipment.reduce((acc, eq) => {
        const w = eq.powerUnit === 'HP' ? eq.power * 746 : (eq.powerUnit === 'kW' ? eq.power * 1000 : eq.power);
        return acc + (w / 1000) * eq.quantity;
      }, 0);
      maxDemandKw = totalInstalledKw * 0.65; // Factor de simultaneidad estimado
    } else {
      maxDemandKw = 0;
    }
  }

  // 3. Estimar distribución horaria (Horas Punta 18:00 a 23:00 vs Horas Fuera de Punta)
  const isVivienda = diagnostic.generalData.installationType === 'vivienda';
  const isCalzadoOIndustria = diagnostic.generalData.installationType === 'calzado' || diagnostic.generalData.installationType === 'industria';
  
  const peakShare = isVivienda ? 0.32 : (isCalzadoOIndustria ? 0.16 : 0.22);
  const offPeakShare = 1 - peakShare;

  const hpKwh = totalMonthlyKwh * peakShare;
  const hfpKwh = totalMonthlyKwh * offPeakShare;

  // Demanda en horas punta vs fuera de punta (para tarifas con 2 potencias: BT2, BT4, MT2, MT4)
  const peakDemandKw = maxDemandKw * (isCalzadoOIndustria ? 0.55 : 0.88);
  const offPeakDemandKw = maxDemandKw;

  // 4. Parámetros tarifarios referenciales de Distribuidoras en Perú según OSINERGMIN
  const baseActiveRate = tariff?.activeEnergyPriceKwh || 0.745;
  const reactivePenaltyUnit = tariff?.reactiveEnergyPenaltyPriceKvarh || 0.145;

  // Penalidad reactiva estimada mensual
  const pf = powerFactor?.currentPowerFactor || 0;
  let reactivePenaltySoles = 0;
  if (hasRealData && pf > 0 && pf < 0.96) {
    const tangentPhi = Math.tan(Math.acos(Math.min(0.99, Math.max(0.1, pf))));
    const tangentTarget = Math.tan(Math.acos(0.96)); // 0.2916
    const excessKvarh = Math.max(0, totalMonthlyKwh * (tangentPhi - tangentTarget));
    reactivePenaltySoles = excessKvarh * reactivePenaltyUnit;
  }

  // CÁLCULO DE LAS 10 TARIFAS REGULADAS Y DE MERCADO LIBRE:

  // 1. BT5B (Simple Baja Tensión)
  const costEnergyBT5B = totalMonthlyKwh * baseActiveRate;
  const fixedChargeBT5B = 4.80;
  const totalMonthlyBT5B = costEnergyBT5B + fixedChargeBT5B + reactivePenaltySoles;

  // 2. BT5A (Horaria HP / HFP en Baja Tensión)
  const rateHpBT5A = baseActiveRate * 1.38; // S/. ~1.03/kWh
  const rateHfpBT5A = baseActiveRate * 0.76; // S/. ~0.57/kWh
  const costEnergyBT5A = (hpKwh * rateHpBT5A) + (hfpKwh * rateHfpBT5A);
  const fixedChargeBT5A = 5.60;
  const totalMonthlyBT5A = costEnergyBT5A + fixedChargeBT5A + reactivePenaltySoles;

  // 3. BT2 (Horaria Integral en BT: Energía y Potencia diferenciadas HP/HFP)
  const rateEnergyHpBT2 = baseActiveRate * 0.70;
  const rateEnergyHfpBT2 = baseActiveRate * 0.48;
  const ratePowerHpBT2 = 42.50; // S/ / kW HP
  const ratePowerHfpBT2 = 13.80; // S/ / kW HFP excedente
  const excessDemandHfpBT2 = Math.max(0, offPeakDemandKw - peakDemandKw);
  const costEnergyBT2 = (hpKwh * rateEnergyHpBT2) + (hfpKwh * rateEnergyHfpBT2);
  const costPowerBT2 = (peakDemandKw * ratePowerHpBT2) + (excessDemandHfpBT2 * ratePowerHfpBT2);
  const fixedChargeBT2 = 9.20;
  const totalMonthlyBT2 = costEnergyBT2 + costPowerBT2 + fixedChargeBT2 + reactivePenaltySoles;

  // 4. BT3 (Doble Medición en BT: Energía reducida + Cargo por Potencia única)
  const rateEnergyBT3 = baseActiveRate * 0.57; // S/. ~0.42/kWh
  const ratePowerKwBT3 = 47.50; // S/. / kW-mes
  const costEnergyBT3 = totalMonthlyKwh * rateEnergyBT3;
  const costPowerBT3 = maxDemandKw * ratePowerKwBT3;
  const fixedChargeBT3 = 8.90;
  const totalMonthlyBT3 = costEnergyBT3 + costPowerBT3 + fixedChargeBT3 + reactivePenaltySoles;

  // 5. BT4 (Doble Medición y Dos Potencias en BT: HP y HFP)
  const rateEnergyBT4 = baseActiveRate * 0.55;
  const costEnergyBT4 = totalMonthlyKwh * rateEnergyBT4;
  const costPowerBT4 = (peakDemandKw * 44.20) + (Math.max(0, offPeakDemandKw - peakDemandKw) * 14.50);
  const fixedChargeBT4 = 9.50;
  const totalMonthlyBT4 = costEnergyBT4 + costPowerBT4 + fixedChargeBT4 + reactivePenaltySoles;

  // 6. BT6 (Tarifa sin medición de potencia para servicios auxiliares / bombeo)
  const rateEnergyBT6 = baseActiveRate * 0.92;
  const costEnergyBT6 = totalMonthlyKwh * rateEnergyBT6;
  const fixedChargeBT6 = 3.90;
  const totalMonthlyBT6 = costEnergyBT6 + fixedChargeBT6 + reactivePenaltySoles;

  // 7. MT2 (Media Tensión Horaria Integral: 10 - 22.9 kV con diferenciación HP/HFP)
  const rateEnergyHpMT2 = baseActiveRate * 0.44;
  const rateEnergyHfpMT2 = baseActiveRate * 0.32;
  const costEnergyMT2 = (hpKwh * rateEnergyHpMT2) + (hfpKwh * rateEnergyHfpMT2);
  const costPowerMT2 = (peakDemandKw * 38.20) + (Math.max(0, offPeakDemandKw - peakDemandKw) * 11.80);
  const fixedChargeMT2 = 16.50;
  const totalMonthlyMT2 = costEnergyMT2 + costPowerMT2 + fixedChargeMT2 + (reactivePenaltySoles * 0.80);

  // 8. MT3 (Media Tensión con Medición de Potencia Simple)
  const rateEnergyMT3 = baseActiveRate * 0.48; // S/. ~0.36/kWh
  const ratePowerKwMT3 = 41.20; // S/. / kW-mes en MT
  const costEnergyMT3 = totalMonthlyKwh * rateEnergyMT3;
  const costPowerMT3 = maxDemandKw * ratePowerKwMT3;
  const fixedChargeMT3 = 14.50;
  const totalMonthlyMT3 = costEnergyMT3 + costPowerMT3 + fixedChargeMT3 + (reactivePenaltySoles * 0.85);

  // 9. MT4 (Media Tensión con Dos Potencias HP y HFP)
  const rateEnergyMT4 = baseActiveRate * 0.42;
  const costEnergyMT4 = totalMonthlyKwh * rateEnergyMT4;
  const costPowerMT4 = (peakDemandKw * 39.50) + (Math.max(0, offPeakDemandKw - peakDemandKw) * 12.20);
  const fixedChargeMT4 = 15.80;
  const totalMonthlyMT4 = costEnergyMT4 + costPowerMT4 + fixedChargeMT4 + (reactivePenaltySoles * 0.80);

  // 10. MERCADO LIBRE (>200 kW según Ley N° 28832)
  // Contratos libres directos con generador (Kallpa, Engie, Enel Generación)
  const rateEnergyLibre = 0.245; // S/. ~0.245 / kWh energía neta en mercado libre
  const ratePeajeTransmision = 0.082; // S/. ~0.082 / kWh peajes de transmisión y distribución
  const ratePowerLibre = 29.50; // S/. / kW-mes potencia libre
  const costEnergyLibre = totalMonthlyKwh * (rateEnergyLibre + ratePeajeTransmision);
  const costPowerLibre = maxDemandKw * ratePowerLibre;
  const fixedChargeLibre = 25.00;
  const totalMonthlyLibre = costEnergyLibre + costPowerLibre + fixedChargeLibre;

  // Mapear costo actual del usuario
  const currentCode = (tariff?.tariffCode || 'BT5B').toUpperCase();
  let currentCost = totalMonthlyBT5B;
  if (currentCode.includes('BT5A')) currentCost = totalMonthlyBT5A;
  else if (currentCode.includes('BT2')) currentCost = totalMonthlyBT2;
  else if (currentCode.includes('BT3')) currentCost = totalMonthlyBT3;
  else if (currentCode.includes('BT4')) currentCost = totalMonthlyBT4;
  else if (currentCode.includes('BT6')) currentCost = totalMonthlyBT6;
  else if (currentCode.includes('MT2')) currentCost = totalMonthlyMT2;
  else if (currentCode.includes('MT3')) currentCost = totalMonthlyMT3;
  else if (currentCode.includes('MT4')) currentCost = totalMonthlyMT4;
  else if (currentCode.includes('LIBRE')) currentCost = totalMonthlyLibre;

  // Catálogo completo de las 10 opciones tarifarias de OSINERGMIN
  const items: TariffComparisonItem[] = [
    {
      code: 'BT5B',
      name: 'Tarifa BT5B (Simple Baja Tensión)',
      category: 'Residencial / Comercial',
      voltageLevel: 'Baja Tensión (BT)',
      monthlyCostSoles: totalMonthlyBT5B,
      annualCostSoles: totalMonthlyBT5B * 12,
      energyCostSoles: costEnergyBT5B,
      powerCostSoles: 0,
      fixedCostSoles: fixedChargeBT5B,
      reactivePenaltySoles,
      effectiveKwhRate: totalMonthlyBT5B / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyBT5B - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyBT5B) * 12,
      isCurrent: currentCode.includes('BT5B'),
      isRecommended: false,
      feasibility: 'ALTA',
      summaryBadge: 'Medición Monómica Simple',
      description: 'Facturación directa por kWh total consumido a precio uniforme las 24 horas del día. Sin cargo por potencia ni discriminación horaria.',
      requirements: ['Medidor electrónico convencional', 'Suministro en 220V o 380V estándar']
    },
    {
      code: 'BT5A',
      name: 'Tarifa BT5A (Horaria HP / HFP)',
      category: 'Horario',
      voltageLevel: 'Baja Tensión (BT)',
      monthlyCostSoles: totalMonthlyBT5A,
      annualCostSoles: totalMonthlyBT5A * 12,
      energyCostSoles: costEnergyBT5A,
      powerCostSoles: 0,
      fixedCostSoles: fixedChargeBT5A,
      reactivePenaltySoles,
      effectiveKwhRate: totalMonthlyBT5A / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyBT5A - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyBT5A) * 12,
      isCurrent: currentCode.includes('BT5A'),
      isRecommended: false,
      feasibility: 'ALTA',
      summaryBadge: offPeakShare >= 0.75 ? 'Excelente para Operación Diurna' : 'Requiere Gestión de Horarios',
      description: `Separa el consumo en Horas Punta (18:00 a 23:00 hrs a S/. ${rateHpBT5A.toFixed(2)}/kWh) y Horas Fuera de Punta (23:00 a 18:00 hrs a S/. ${rateHfpBT5A.toFixed(2)}/kWh).`,
      requirements: ['Medidor electrónico multifunción con registro horario', 'Concentrar producción pesada antes de las 18:00 hrs']
    },
    {
      code: 'BT2',
      name: 'Tarifa BT2 (Horaria Integral en BT)',
      category: 'Horario',
      voltageLevel: 'Baja Tensión (BT)',
      monthlyCostSoles: totalMonthlyBT2,
      annualCostSoles: totalMonthlyBT2 * 12,
      energyCostSoles: costEnergyBT2,
      powerCostSoles: costPowerBT2,
      fixedCostSoles: fixedChargeBT2,
      reactivePenaltySoles,
      effectiveKwhRate: totalMonthlyBT2 / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyBT2 - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyBT2) * 12,
      isCurrent: currentCode.includes('BT2'),
      isRecommended: false,
      feasibility: maxDemandKw >= 15 ? 'ALTA' : 'MEDIA',
      summaryBadge: 'Doble Horario: Energía y Potencia',
      description: `Tarifa para industrias en BT con control de potencia. Separa energía en HP (S/. ${rateEnergyHpBT2.toFixed(2)}) y HFP (S/. ${rateEnergyHfpBT2.toFixed(2)}), y factura potencia en punta a S/. ${ratePowerHpBT2.toFixed(2)}/kW.`,
      requirements: ['Medidor multifunción con discriminación de potencia en HP', 'Evitar operar motores principales en bloque 18:00 - 23:00']
    },
    {
      code: 'BT3',
      name: 'Tarifa BT3 (Doble Medición Energía + Potencia)',
      category: 'Demanda / Potencia',
      voltageLevel: 'Baja Tensión (BT)',
      monthlyCostSoles: totalMonthlyBT3,
      annualCostSoles: totalMonthlyBT3 * 12,
      energyCostSoles: costEnergyBT3,
      powerCostSoles: costPowerBT3,
      fixedCostSoles: fixedChargeBT3,
      reactivePenaltySoles,
      effectiveKwhRate: totalMonthlyBT3 / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyBT3 - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyBT3) * 12,
      isCurrent: currentCode.includes('BT3'),
      isRecommended: false,
      feasibility: maxDemandKw >= 15 ? 'ALTA' : 'MEDIA',
      summaryBadge: maxDemandKw >= 20 && totalMonthlyKwh >= 3500 ? 'Máximo Ahorro Industrial' : 'Para Consumos Intensivos',
      description: `Energía activa con tarifa reducida a S/. ${rateEnergyBT3.toFixed(2)}/kWh combinada con cargo por Potencia/Demanda Máxima de S/. ${ratePowerKwBT3.toFixed(2)}/kW-mes.`,
      requirements: ['Demanda registrada o contratada ≥ 15-20 kW', 'Medidor totalizador con registro de máxima demanda en 15 min', 'Control estricto de picos de arranque simultáneos']
    },
    {
      code: 'BT4',
      name: 'Tarifa BT4 (Medición de Energía y Dos Potencias)',
      category: 'Demanda / Potencia',
      voltageLevel: 'Baja Tensión (BT)',
      monthlyCostSoles: totalMonthlyBT4,
      annualCostSoles: totalMonthlyBT4 * 12,
      energyCostSoles: costEnergyBT4,
      powerCostSoles: costPowerBT4,
      fixedCostSoles: fixedChargeBT4,
      reactivePenaltySoles,
      effectiveKwhRate: totalMonthlyBT4 / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyBT4 - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyBT4) * 12,
      isCurrent: currentCode.includes('BT4'),
      isRecommended: false,
      feasibility: maxDemandKw >= 20 ? 'ALTA' : 'MEDIA',
      summaryBadge: 'Dos Potencias Diferenciadas',
      description: `Energía a precio único reducido (S/. ${rateEnergyBT4.toFixed(2)}/kWh) con facturación separada para Potencia en Horas Punta y Potencia en Fuera de Punta.`,
      requirements: ['Demanda contratada ≥ 20 kW', 'Equipo de medición fiscal con memoria de masa']
    },
    {
      code: 'BT6',
      name: 'Tarifa BT6 (Usos Especiales / Servicios)',
      category: 'Residencial / Comercial',
      voltageLevel: 'Baja Tensión (BT)',
      monthlyCostSoles: totalMonthlyBT6,
      annualCostSoles: totalMonthlyBT6 * 12,
      energyCostSoles: costEnergyBT6,
      powerCostSoles: 0,
      fixedCostSoles: fixedChargeBT6,
      reactivePenaltySoles,
      effectiveKwhRate: totalMonthlyBT6 / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyBT6 - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyBT6) * 12,
      isCurrent: currentCode.includes('BT6'),
      isRecommended: false,
      feasibility: 'ALTA',
      summaryBadge: 'Servicios y Cargas Intermitentes',
      description: 'Tarifa simple para instalaciones sin facturación de potencia y uso continuo o estacional moderado.',
      requirements: ['Suministro monofásico o trifásico de baja tensión']
    },
    {
      code: 'MT2',
      name: 'Tarifa MT2 (Media Tensión Horaria Integral)',
      category: 'Media Tensión',
      voltageLevel: 'Media Tensión (MT)',
      monthlyCostSoles: totalMonthlyMT2,
      annualCostSoles: totalMonthlyMT2 * 12,
      energyCostSoles: costEnergyMT2,
      powerCostSoles: costPowerMT2,
      fixedCostSoles: fixedChargeMT2,
      reactivePenaltySoles: reactivePenaltySoles * 0.80,
      effectiveKwhRate: totalMonthlyMT2 / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyMT2 - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyMT2) * 12,
      isCurrent: currentCode.includes('MT2'),
      isRecommended: false,
      feasibility: maxDemandKw >= 40 ? 'ALTA' : 'REQUIERE_SUBESTACION',
      summaryBadge: 'Subestación + Doble Horario',
      description: `Suministro primario en 10 kV o 22.9 kV con diferenciación de energía en HP (S/. ${rateEnergyHpMT2.toFixed(2)}) y HFP (S/. ${rateEnergyHfpMT2.toFixed(2)}/kWh).`,
      requirements: ['Subestación de transformación particular', 'Demanda ≥ 40-50 kW', 'Aprobación de proyecto MT por distribuidora']
    },
    {
      code: 'MT3',
      name: 'Tarifa MT3 (Media Tensión con Potencia Simple)',
      category: 'Media Tensión',
      voltageLevel: 'Media Tensión (MT)',
      monthlyCostSoles: totalMonthlyMT3,
      annualCostSoles: totalMonthlyMT3 * 12,
      energyCostSoles: costEnergyMT3,
      powerCostSoles: costPowerMT3,
      fixedCostSoles: fixedChargeMT3,
      reactivePenaltySoles: reactivePenaltySoles * 0.85,
      effectiveKwhRate: totalMonthlyMT3 / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyMT3 - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyMT3) * 12,
      isCurrent: currentCode.includes('MT3'),
      isRecommended: false,
      feasibility: maxDemandKw >= 45 ? 'ALTA' : 'REQUIERE_SUBESTACION',
      summaryBadge: maxDemandKw >= 50 ? 'Opción Recomendada a Mediano Plazo' : 'Requiere Subestación Particular',
      description: `Suministro primario en Media Tensión (10 kV / 22.9 kV). Costo de energía de S/. ${rateEnergyMT3.toFixed(2)}/kWh con cargo de potencia simple de S/. ${ratePowerKwMT3.toFixed(2)}/kW.`,
      requirements: ['Subestación de transformación particular (Aérea o Caseta)', 'Demanda mayor a 45 kW sostenida']
    },
    {
      code: 'MT4',
      name: 'Tarifa MT4 (Media Tensión con Dos Potencias)',
      category: 'Media Tensión',
      voltageLevel: 'Media Tensión (MT)',
      monthlyCostSoles: totalMonthlyMT4,
      annualCostSoles: totalMonthlyMT4 * 12,
      energyCostSoles: costEnergyMT4,
      powerCostSoles: costPowerMT4,
      fixedCostSoles: fixedChargeMT4,
      reactivePenaltySoles: reactivePenaltySoles * 0.80,
      effectiveKwhRate: totalMonthlyMT4 / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyMT4 - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyMT4) * 12,
      isCurrent: currentCode.includes('MT4'),
      isRecommended: false,
      feasibility: maxDemandKw >= 50 ? 'ALTA' : 'REQUIERE_SUBESTACION',
      summaryBadge: 'Grandes Talleres y Plantas',
      description: `Tarifa para industrias de media tensión con turnos diurnos. Tarifa de energía reducida (S/. ${rateEnergyMT4.toFixed(2)}/kWh) y potencia controlada en horas punta.`,
      requirements: ['Subestación particular ≥ 75-100 kVA', 'Control de potencia en horas punta']
    },
    {
      code: 'LIBRE',
      name: 'Mercado Libre de Electricidad (>200 kW)',
      category: 'Mercado Libre',
      voltageLevel: 'Mercado Libre',
      monthlyCostSoles: totalMonthlyLibre,
      annualCostSoles: totalMonthlyLibre * 12,
      energyCostSoles: costEnergyLibre,
      powerCostSoles: costPowerLibre,
      fixedCostSoles: fixedChargeLibre,
      reactivePenaltySoles: 0,
      effectiveKwhRate: totalMonthlyLibre / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyLibre - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyLibre) * 12,
      isCurrent: currentCode.includes('LIBRE'),
      isRecommended: false,
      feasibility: maxDemandKw >= 200 ? 'ALTA' : 'REQUIERE_CONTRATO_LIBRE',
      summaryBadge: maxDemandKw >= 200 ? 'Ahorro Máximo Nacional (Ley 28832)' : 'Requiere Demanda ≥ 200 kW',
      description: `Régimen no regulado de Usuario Libre (D.S. 022-2009-EM). Compra de energía directa a empresas generadoras con precios competitivos de S/. ${(rateEnergyLibre + ratePeajeTransmision).toFixed(2)}/kWh.`,
      requirements: ['Máxima demanda contratada superior a 200 kW', 'Contrato bilateral de suministro con generador o comercializador', 'Sistema de medición comercial en tiempo real']
    }
  ];

  // Identificar la tarifa óptima más económica y factible
  let bestItem = items[0];
  let minCost = items[0].monthlyCostSoles;

  for (const item of items) {
    // Si requiere subestación o contrato libre pero la demanda no califica, no recomendarla directamente
    if ((item.voltageLevel === 'Media Tensión (MT)') && maxDemandKw < 40) continue;
    if (item.code === 'LIBRE' && maxDemandKw < 200) continue;
    
    if (item.monthlyCostSoles < minCost) {
      minCost = item.monthlyCostSoles;
      bestItem = item;
    }
  }

  // Marcar recomendada
  bestItem.isRecommended = true;

  const monthlySavings = Math.max(0, currentCost - bestItem.monthlyCostSoles);
  const annualSavings = monthlySavings * 12;
  const pctSavings = currentCost > 0 ? (monthlySavings / currentCost) * 100 : 0;
  const isMigrationRecommended = bestItem.code !== currentCode && monthlySavings > 25;

  let primaryExplanation = '';
  if (bestItem.code === currentCode || monthlySavings <= 25) {
    primaryExplanation = `Su tarifa actual (${currentCode}) es la más eficiente para su perfil de consumo actual de ${Math.round(totalMonthlyKwh)} kWh/mes y demanda de ${maxDemandKw.toFixed(1)} kW.`;
  } else if (bestItem.code === 'BT5A') {
    primaryExplanation = `Le conviene migrar a Tarifa BT5A (Horaria). Dado que el ${(offPeakShare * 100).toFixed(0)}% de sus operaciones ocurren en Horas Fuera de Punta (23:00 a 18:00 hrs), obtendrá una reducción directa del costo por kWh de S/. ${baseActiveRate.toFixed(2)} a S/. ${rateHfpBT5A.toFixed(2)}, generando un ahorro estimado de S/. ${annualSavings.toLocaleString('es-PE', { maximumFractionDigits: 0 })} al año.`;
  } else if (bestItem.code === 'BT3') {
    primaryExplanation = `Le conviene migrar a Tarifa BT3 (Doble Medición Energía y Potencia). Su volumen de consumo (${Math.round(totalMonthlyKwh)} kWh/mes) y demanda (${maxDemandKw.toFixed(1)} kW) permiten aprovechar la tarifa de energía reducida de S/. ${rateEnergyBT3.toFixed(2)}/kWh, amortizando holgadamente el cargo de potencia fija y logrando un ahorro neto de S/. ${annualSavings.toLocaleString('es-PE', { maximumFractionDigits: 0 })}/año.`;
  } else if (bestItem.code === 'BT2') {
    primaryExplanation = `Le conviene migrar a Tarifa BT2 (Horaria Integral). Podrá aprovechar tarifas de energía reducida fuera de punta y pagar potencia contratada diferenciada, ahorrando S/. ${annualSavings.toLocaleString('es-PE', { maximumFractionDigits: 0 })}/año.`;
  } else if (bestItem.voltageLevel === 'Media Tensión (MT)') {
    primaryExplanation = `Le conviene proyectar la migración a Media Tensión (${bestItem.code}). Con una demanda de ${maxDemandKw.toFixed(1)} kW, el menor costo por kWh generaría un ahorro anual superior a S/. ${annualSavings.toLocaleString('es-PE', { maximumFractionDigits: 0 })}.`;
  } else if (bestItem.code === 'LIBRE') {
    primaryExplanation = `Su demanda de ${maxDemandKw.toFixed(1)} kW califica para el régimen de Usuario Libre (Ley 28832). Podrá negociar tarifas directas con generadoras obteniendo un ahorro estimado de S/. ${annualSavings.toLocaleString('es-PE', { maximumFractionDigits: 0 })}/año.`;
  } else {
    primaryExplanation = `Le conviene cambiar a la opción tarifaria ${bestItem.code} para optimizar el gasto de facturación mensual.`;
  }

  const technicalProcedure = [
    `1. Presentar solicitud formal de cambio de opción tarifaria ante ${tariff?.distributor || 'la Concesionaria Eléctrica'} (Ley de Concesiones Eléctricas Art. 50 / OSINERGMIN).`,
    `2. La concesionaria programará la inspección técnica y el reemplazo del equipo de medición fiscal por un medidor electrónico multifunción con registro horario/potencia en el murete de acometida.`,
    `3. Coordinar con el Ingeniero Electricista CIP la instalación de un reloj horario o protocolo interno para evitar sobrecargas en Horas Punta (18:00 a 23:00 hrs).`,
    `4. Verificar que el factor de potencia se mantenga ≥ 0.96 con el banco de condensadores para no incurrir en cargos por energía reactiva.`
  ];

  const suggestedPeakShiftAdvice = isCalzadoOIndustria
    ? 'Recomendación operativa: Apagar compresores principales, reactivadores de pegamento y prensas pesadas a las 17:45 hrs. Dejar solo luminarias LED y computadoras en horas punta (18:00 a 23:00) para maximizar el beneficio de la tarifa horaria.'
    : 'Recomendación operativa: Programar termas eléctricas, lavadoras, planchas y hornos fuera del bloque de 18:00 a 23:00 hrs.';

  return {
    currentTariffCode: currentCode,
    recommendedTariffCode: bestItem.code,
    isMigrationRecommended,
    monthlySavingsSoles: Number(monthlySavings.toFixed(2)),
    annualSavingsSoles: Number(annualSavings.toFixed(2)),
    percentageSavings: Number(pctSavings.toFixed(1)),
    breakdown: items,
    currentMonthlyCost: Number(currentCost.toFixed(2)),
    recommendedMonthlyCost: Number(bestItem.monthlyCostSoles.toFixed(2)),
    primaryExplanation,
    technicalProcedure,
    suggestedPeakShiftAdvice
  };
}
