// Deterministic Energy Bill Analysis & Receipts vs Calculated Comparison Engine
import { ReceiptRecord } from '../types';

export interface ReceiptsStatistics {
  recordCount: number;
  averageMonthlyKwh: number;
  maxMonthlyKwh: number;
  minMonthlyKwh: number;
  averageMonthlyCostSoles: number;
  maxMonthlyCostSoles: number;
  minMonthlyCostSoles: number;
  averageEffectiveTariffPerKwh: number;
  annualTotalKwh: number;
  annualTotalCostSoles: number;
  averagePowerFactor: number;
  monthlyVariationPercent: number; // std dev or range variation
}

export interface ReceiptVsCalculatedComparison {
  receiptMonthlyKwh: number;
  calculatedMonthlyKwh: number;
  differenceKwh: number;
  differencePercent: number;
  receiptMonthlyCostSoles: number;
  calculatedMonthlyCostSoles: number;
  economicDifferenceSoles: number;
  diagnosticExplanation: string;
  accuracyLevel: 'ALTA_COINCIDENCIA' | 'DESVIACION_MODERADA' | 'DESVIACION_SEVERA';
}

export function analyzeReceiptsHistory(receipts: ReceiptRecord[]): ReceiptsStatistics {
  if (!receipts || receipts.length === 0) {
    return {
      recordCount: 0,
      averageMonthlyKwh: 0,
      maxMonthlyKwh: 0,
      minMonthlyKwh: 0,
      averageMonthlyCostSoles: 0,
      maxMonthlyCostSoles: 0,
      minMonthlyCostSoles: 0,
      averageEffectiveTariffPerKwh: 0.75,
      annualTotalKwh: 0,
      annualTotalCostSoles: 0,
      averagePowerFactor: 0,
      monthlyVariationPercent: 0
    };
  }

  const count = receipts.length;
  let sumKwh = 0;
  let sumCost = 0;
  let sumFp = 0;
  let maxKwh = -Infinity;
  let minKwh = Infinity;
  let maxCost = -Infinity;
  let minCost = Infinity;

  receipts.forEach(r => {
    sumKwh += r.kwhConsumed;
    sumCost += r.costSoles;
    sumFp += r.powerFactor || 0.85;

    if (r.kwhConsumed > maxKwh) maxKwh = r.kwhConsumed;
    if (r.kwhConsumed < minKwh) minKwh = r.kwhConsumed;
    if (r.costSoles > maxCost) maxCost = r.costSoles;
    if (r.costSoles < minCost) minCost = r.costSoles;
  });

  const averageMonthlyKwh = Number((sumKwh / count).toFixed(2));
  const averageMonthlyCostSoles = Number((sumCost / count).toFixed(2));
  const averagePowerFactor = Number((sumFp / count).toFixed(2));
  const averageEffectiveTariffPerKwh = averageMonthlyKwh > 0
    ? Number((averageMonthlyCostSoles / averageMonthlyKwh).toFixed(3))
    : 0.75;

  const annualTotalKwh = Number(((sumKwh / count) * 12).toFixed(2));
  const annualTotalCostSoles = Number(((sumCost / count) * 12).toFixed(2));

  // Variation percentage: (max - min) / average * 100
  const monthlyVariationPercent = averageMonthlyKwh > 0
    ? Number((((maxKwh - minKwh) / averageMonthlyKwh) * 100).toFixed(1))
    : 0;

  return {
    recordCount: count,
    averageMonthlyKwh,
    maxMonthlyKwh: maxKwh === -Infinity ? 0 : maxKwh,
    minMonthlyKwh: minKwh === Infinity ? 0 : minKwh,
    averageMonthlyCostSoles,
    maxMonthlyCostSoles: maxCost === -Infinity ? 0 : maxCost,
    minMonthlyCostSoles: minCost === Infinity ? 0 : minCost,
    averageEffectiveTariffPerKwh,
    annualTotalKwh,
    annualTotalCostSoles,
    averagePowerFactor,
    monthlyVariationPercent
  };
}

export function compareReceiptVsCalculated(
  receiptStats: ReceiptsStatistics,
  calculatedMonthlyKwh: number,
  calculatedMonthlyCostSoles: number
): ReceiptVsCalculatedComparison {
  const receiptKwh = receiptStats.averageMonthlyKwh || 0;
  const receiptCost = receiptStats.averageMonthlyCostSoles || 0;

  const differenceKwh = Number((calculatedMonthlyKwh - receiptKwh).toFixed(2));
  const differencePercent = receiptKwh > 0
    ? Number(((differenceKwh / receiptKwh) * 100).toFixed(1))
    : 0;

  const economicDifferenceSoles = Number((calculatedMonthlyCostSoles - receiptCost).toFixed(2));

  let accuracyLevel: 'ALTA_COINCIDENCIA' | 'DESVIACION_MODERADA' | 'DESVIACION_SEVERA' = 'ALTA_COINCIDENCIA';
  let diagnosticExplanation = '';

  const absDiff = Math.abs(differencePercent);

  if (absDiff <= 10) {
    accuracyLevel = 'ALTA_COINCIDENCIA';
    diagnosticExplanation = 
      `Excelente correlación técnica (desviación de ${differencePercent}%). El censo de cargas y régimen de horas de operación modelado refleja con alta precisión la facturación real de la empresa distribuidora.`;
  } else if (absDiff <= 25) {
    accuracyLevel = 'DESVIACION_MODERADA';
    if (differencePercent < 0) {
      diagnosticExplanation = 
        `El consumo calculado es ${Math.abs(differencePercent)}% menor que el facturado. Posibles causas: cargas parásitas en espera (standby), pérdidas en conductores de alimentadores largos, o subestimación de horas de uso en climatización/compresores.`;
    } else {
      diagnosticExplanation = 
        `El consumo calculado es ${differencePercent}% mayor que el facturado. Posibles causas: el factor de carga real de los motores o máquinas es menor al declarado (operación en vacío/carga parcial), o hubo días de inactividad no contemplados.`;
    }
  } else {
    accuracyLevel = 'DESVIACION_SEVERA';
    if (differencePercent < 0) {
      diagnosticExplanation = 
        `DISCREPANCIA SEVERA: El recibo registra ${Math.abs(differencePercent)}% más energía que los equipos censados. Requiere auditoría de consumos ocultos, fugas a tierra no detectadas, termas/refrigeración con termostatos dañados o verificación del medidor de la empresa concesionaria.`;
    } else {
      diagnosticExplanation = 
        `DISCREPANCIA SEVERA: El cálculo excede en ${differencePercent}% la factura eléctrica. Se recomienda re-evaluar la simultaneidad de producción y las horas efectivas de turno de las máquinas.`;
    }
  }

  return {
    receiptMonthlyKwh: receiptKwh,
    calculatedMonthlyKwh: Number(calculatedMonthlyKwh.toFixed(2)),
    differenceKwh,
    differencePercent,
    receiptMonthlyCostSoles: receiptCost,
    calculatedMonthlyCostSoles: Number(calculatedMonthlyCostSoles.toFixed(2)),
    economicDifferenceSoles,
    diagnosticExplanation,
    accuracyLevel
  };
}
