// Engine de Evaluación y Recomendación Tarifaria según OSINERGMIN / Ley de Concesiones Eléctricas del Perú
import { CompleteDiagnostic, TariffConfig } from '../types';

export interface TariffComparisonItem {
  code: string;
  name: string;
  category: 'Residencial / Comercial' | 'Horario' | 'Demanda / Potencia' | 'Media Tensión';
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
  feasibility: 'ALTA' | 'MEDIA' | 'REQUIERE_SUBESTACION';
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
      totalMonthlyKwh = 1200; // default baseline
    }
  }

  // 2. Determinar Demanda Máxima estimada (kW)
  let maxDemandKw = customMaxDemandKw || 0;
  if (!maxDemandKw) {
    if (receipts && receipts.length > 0) {
      const maxInReceipts = Math.max(...receipts.map(r => r.maxDemandKw || r.billedPowerKw || 0));
      maxDemandKw = maxInReceipts > 0 ? maxInReceipts : 15;
    } else if (equipment && equipment.length > 0) {
      const totalInstalledKw = equipment.reduce((acc, eq) => {
        const w = eq.powerUnit === 'HP' ? eq.power * 746 : (eq.powerUnit === 'kW' ? eq.power * 1000 : eq.power);
        return acc + (w / 1000) * eq.quantity;
      }, 0);
      maxDemandKw = totalInstalledKw * 0.65; // Factor de simultaneidad estimado
    } else {
      maxDemandKw = 10;
    }
  }

  // 3. Estimar distribución horaria (Horas Punta 18:00 a 23:00 vs Horas Fuera de Punta)
  // En talleres de calzado / manufactura diurna, ~85% es HFP y 15% HP. En vivienda es ~35% HP y 65% HFP.
  const isVivienda = diagnostic.generalData.installationType === 'vivienda';
  const isCalzadoOIndustria = diagnostic.generalData.installationType === 'calzado' || diagnostic.generalData.installationType === 'industria';
  
  let peakShare = isVivienda ? 0.32 : (isCalzadoOIndustria ? 0.16 : 0.22);
  const offPeakShare = 1 - peakShare;

  const hpKwh = totalMonthlyKwh * peakShare;
  const hfpKwh = totalMonthlyKwh * offPeakShare;

  // 4. Parámetros tarifarios referenciales de Distribuidoras en Perú (Luz del Sur / Enel / Distriluz / Seal)
  // Actualizados según pliegos tarifarios OSINERGMIN
  const baseActiveRate = tariff?.activeEnergyPriceKwh || 0.745;
  const fixedChargeBT5B = tariff?.fixedMonthlyChargeSoles || 4.80;
  const reactivePenaltyUnit = tariff?.reactiveEnergyPenaltyPriceKvarh || 0.14;

  // Penalidad reactiva estimada mensual
  const pf = powerFactor?.currentPowerFactor || 0.85;
  let reactivePenaltySoles = 0;
  if (pf < 0.96) {
    const tangentPhi = Math.tan(Math.acos(Math.min(0.99, Math.max(0.1, pf))));
    const tangentTarget = Math.tan(Math.acos(0.96)); // 0.2916
    const excessKvarh = Math.max(0, totalMonthlyKwh * (tangentPhi - tangentTarget));
    reactivePenaltySoles = excessKvarh * reactivePenaltyUnit;
  }

  // Costo TARIFA BT5B (Simple)
  const costEnergyBT5B = totalMonthlyKwh * baseActiveRate;
  const costPowerBT5B = 0; // Incluido en cargo por energía
  const totalMonthlyBT5B = costEnergyBT5B + fixedChargeBT5B + reactivePenaltySoles;

  // Costo TARIFA BT5A (Horario HP / HFP)
  // HP tiene cargo aprox 1.40x del promedio, HFP tiene aprox 0.78x
  const rateHpBT5A = baseActiveRate * 1.38; // Ej: S/. 1.03 / kWh en punta
  const rateHfpBT5A = baseActiveRate * 0.76; // Ej: S/. 0.57 / kWh fuera de punta
  const costEnergyBT5A = (hpKwh * rateHpBT5A) + (hfpKwh * rateHfpBT5A);
  const fixedChargeBT5A = 5.60;
  const totalMonthlyBT5A = costEnergyBT5A + fixedChargeBT5A + reactivePenaltySoles;

  // Costo TARIFA BT3 (Doble Medición: Energía Baja + Potencia)
  // BT3 energía barata (~0.58x de tarifa simple) + cargo por kW de potencia mensual (~S/. 48 / kW)
  const rateEnergyBT3 = baseActiveRate * 0.57; // Ej: S/. 0.42 / kWh
  const ratePowerKwBT3 = 47.50; // S/. / kW-mes
  const costEnergyBT3 = totalMonthlyKwh * rateEnergyBT3;
  const costPowerBT3 = maxDemandKw * ratePowerKwBT3;
  const fixedChargeBT3 = 8.90;
  const totalMonthlyBT3 = costEnergyBT3 + costPowerBT3 + fixedChargeBT3 + reactivePenaltySoles;

  // Costo TARIFA MT3 (Media Tensión con Transformador)
  // Solo aplicable si la demanda justifica subestación (> 40 - 50 kW)
  const rateEnergyMT3 = baseActiveRate * 0.48; // S/. 0.36 / kWh
  const ratePowerKwMT3 = 41.20; // S/. / kW-mes en MT
  const costEnergyMT3 = totalMonthlyKwh * rateEnergyMT3;
  const costPowerMT3 = maxDemandKw * ratePowerKwMT3;
  const fixedChargeMT3 = 14.50;
  const totalMonthlyMT3 = costEnergyMT3 + costPowerMT3 + fixedChargeMT3 + (reactivePenaltySoles * 0.85);

  // Mapear la tarifa actual del usuario
  const currentCode = (tariff?.tariffCode || 'BT5B').toUpperCase();
  let currentCost = totalMonthlyBT5B;
  if (currentCode.includes('BT5A')) currentCost = totalMonthlyBT5A;
  else if (currentCode.includes('BT3')) currentCost = totalMonthlyBT3;
  else if (currentCode.includes('MT') || currentCode.includes('BT2')) currentCost = totalMonthlyMT3;

  // Construir comparativo de las 4 opciones principales
  const items: TariffComparisonItem[] = [
    {
      code: 'BT5B',
      name: 'Tarifa BT5B (Simple Baja Tensión)',
      category: 'Residencial / Comercial',
      monthlyCostSoles: totalMonthlyBT5B,
      annualCostSoles: totalMonthlyBT5B * 12,
      energyCostSoles: costEnergyBT5B,
      powerCostSoles: costPowerBT5B,
      fixedCostSoles: fixedChargeBT5B,
      reactivePenaltySoles,
      effectiveKwhRate: totalMonthlyBT5B / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyBT5B - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyBT5B) * 12,
      isCurrent: currentCode.includes('BT5B'),
      isRecommended: false,
      feasibility: 'ALTA',
      summaryBadge: 'Medición Monómica Simple',
      description: 'Facturación directa por kWh total consumido a precio uniforme las 24 horas del día. No discrimina horario ni cobra cargo fijo por potencia contratada.',
      requirements: ['Medidor electrónico convencional o electromecánico', 'Suministro en 220V o 380V estándar']
    },
    {
      code: 'BT5A',
      name: 'Tarifa BT5A (Horaria HP / HFP)',
      category: 'Horario',
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
      requirements: ['Medidor electrónico multifunción con registro horario (instalado por la concesionaria)', 'Concentrar producción pesada antes de las 18:00 hrs']
    },
    {
      code: 'BT3',
      name: 'Tarifa BT3 (Doble Medición Energía + Potencia)',
      category: 'Demanda / Potencia',
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
      code: 'MT3',
      name: 'Tarifa MT3 (Media Tensión con Subestación Propia)',
      category: 'Media Tensión',
      monthlyCostSoles: totalMonthlyMT3,
      annualCostSoles: totalMonthlyMT3 * 12,
      energyCostSoles: costEnergyMT3,
      powerCostSoles: costPowerMT3,
      fixedCostSoles: fixedChargeMT3,
      reactivePenaltySoles: reactivePenaltySoles * 0.85,
      effectiveKwhRate: totalMonthlyMT3 / Math.max(1, totalMonthlyKwh),
      differencePercentVsCurrent: ((totalMonthlyMT3 - currentCost) / currentCost) * 100,
      annualSavingsVsCurrentSoles: (currentCost - totalMonthlyMT3) * 12,
      isCurrent: currentCode.includes('MT'),
      isRecommended: false,
      feasibility: maxDemandKw >= 45 ? 'ALTA' : 'REQUIERE_SUBESTACION',
      summaryBadge: maxDemandKw >= 50 ? 'Opción Recomendada a Mediano Plazo' : 'Requiere Subestación Particular',
      description: `Suministro primario en Media Tensión (10 kV / 22.9 kV). Costo de energía más bajo del mercado peruano (S/. ${rateEnergyMT3.toFixed(2)}/kWh), requiere transformador particular.`,
      requirements: ['Subestación de transformación particular (Aérea o Caseta)', 'Demanda mayor a 50 kW sostenida', 'Proyecto de media tensión aprobado por concesionaria']
    }
  ];

  // Identificar la tarifa óptima más económica y factible
  let bestItem = items[0];
  let minCost = items[0].monthlyCostSoles;

  for (const item of items) {
    // Si es MT3 pero la demanda es menor a 40kW, no recomendarla directamente por el Capex de subestación
    if (item.code === 'MT3' && maxDemandKw < 40) continue;
    
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
  } else if (bestItem.code === 'MT3') {
    primaryExplanation = `Le conviene proyectar la migración a Media Tensión (Tarifa MT3). Con una demanda de ${maxDemandKw.toFixed(1)} kW, el menor costo por kWh generaría un ahorro anual superior a S/. ${annualSavings.toLocaleString('es-PE', { maximumFractionDigits: 0 })}.`;
  } else {
    primaryExplanation = `Le conviene cambiar a la opción tarifaria ${bestItem.code} para optimizar el gasto de facturación mensual.`;
  }

  const technicalProcedure = [
    `1. Presentar solicitud formal de cambio de opción tarifaria ante ${tariff?.distributor || 'la Concesionaria Eléctrica'}. (Ley de Concesiones Eléctricas Art. 50).`,
    `2. La concesionaria programará la inspección técnica y el reemplazo del equipo de medición por un medidor electrónico con registro horario/potencia en el murete de acometida.`,
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
