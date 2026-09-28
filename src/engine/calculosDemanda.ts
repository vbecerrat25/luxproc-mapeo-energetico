// Deterministic Demand & Capacity Balance Engine
import { EquipmentRecord, LightingRecord, ElectricalPanel } from '../types';
import { convertPowerToWatts } from './calculosCorriente';

export interface DemandBalanceResult {
  installedPowerKw: number;       // Carga Instalada (CI)
  connectedLoadKw: number;        // Carga Conectada
  coincidenceFactor: number;      // Factor de Simultaneidad (Fs)
  demandFactor: number;           // Factor de Demanda (Fd)
  estimatedMaxDemandKw: number;   // Demanda Máxima Estimada (MD)
  contractedPowerKw?: number;     // Potencia Contratada / Capacidad Suministro
  capacityReserveKw: number;      // Reserva de Capacidad disponible
  capacityReservePercent: number; // % Reserva
  reserveCapacityKw: number;      // Alias for component backwards compatibility
  reserveCapacityPercent: number; // Alias for component backwards compatibility
  loadLevelStatus: 'OPTIMO' | 'MODERADO' | 'CRITICO' | 'SOBRECARGA';
  recommendation: string;
  maximumDemandKw: number;
}

export function calculateDemandBalance(
  equipment: EquipmentRecord[],
  lighting: LightingRecord[],
  panels: ElectricalPanel[],
  contractedPowerKw?: number
): DemandBalanceResult {
  // Sum equipment power in kW
  let totalEqKw = 0;
  equipment.forEach(eq => {
    const w = convertPowerToWatts(eq.power, eq.powerUnit) * Math.max(1, eq.quantity);
    totalEqKw += w / 1000;
  });

  // Sum lighting power in kW
  let totalLightingKw = 0;
  lighting.forEach(l => {
    const pW = l.currentTotalPowerW || (l.currentLampCount * l.currentLampPowerW) || 100;
    totalLightingKw += pW / 1000;
  });

  const installedPowerKw = Number((totalEqKw + totalLightingKw).toFixed(2));
  const connectedLoadKw = installedPowerKw;

  // Realistic Demand Factor estimation per system size & diversity
  let demandFactor = 0.70;
  if (installedPowerKw < 10) {
    demandFactor = 0.75;
  } else if (installedPowerKw < 50) {
    demandFactor = 0.65;
  } else if (installedPowerKw < 150) {
    demandFactor = 0.60;
  } else {
    demandFactor = 0.55;
  }

  // Coincidence factor (simultaneity)
  const coincidenceFactor = Number((demandFactor * 0.95).toFixed(2));
  const estimatedMaxDemandKw = Number((installedPowerKw * demandFactor).toFixed(2));

  // If contracted power is not specified, derive from main panel capacity
  let availableSupplyKw = contractedPowerKw;
  if (!availableSupplyKw || availableSupplyKw <= 0) {
    const mainPanel = panels.find(p => p.panelType === 'TABLERO_GENERAL') || panels[0];
    if (mainPanel && mainPanel.mainBreakerRatingA > 0) {
      const v = mainPanel.voltage || 220;
      const phases = mainPanel.phases || 'TRIFASICO';
      const factor = phases === 'TRIFASICO' ? Math.sqrt(3) : 1;
      availableSupplyKw = Number(((factor * v * mainPanel.mainBreakerRatingA * 0.90) / 1000).toFixed(2));
    } else {
      availableSupplyKw = Number((estimatedMaxDemandKw * 1.35).toFixed(2));
    }
  }

  const capacityReserveKw = Number(Math.max(0, availableSupplyKw - estimatedMaxDemandKw).toFixed(2));
  const capacityReservePercent = Number(((capacityReserveKw / availableSupplyKw) * 100).toFixed(1));

  let loadLevelStatus: 'OPTIMO' | 'MODERADO' | 'CRITICO' | 'SOBRECARGA' = 'OPTIMO';
  let recommendation = '';

  const loadPercent = (estimatedMaxDemandKw / availableSupplyKw) * 100;
  if (loadPercent > 100) {
    loadLevelStatus = 'SOBRECARGA';
    recommendation = `ALERTA CRÍTICA: Demanda máxima estimada (${estimatedMaxDemandKw} kW) supera la capacidad del suministro (${availableSupplyKw} kW). Urge ampliación de potencia o rebalanceo de turnos.`;
  } else if (loadPercent >= 85) {
    loadLevelStatus = 'CRITICO';
    recommendation = `CAPACIDAD LÍMITE: La instalación opera al ${loadPercent.toFixed(1)}% de su capacidad. Margen de reserva reducido (${capacityReserveKw} kW).`;
  } else if (loadPercent >= 65) {
    loadLevelStatus = 'MODERADO';
    recommendation = `Operación dentro de rangos normales (${loadPercent.toFixed(1)}% de carga). Permite incorporar nuevas cargas moderadas.`;
  } else {
    loadLevelStatus = 'OPTIMO';
    recommendation = `Excelente reserva de potencia (${capacityReservePercent}% disponible). Capacidad suficiente para expansión futura.`;
  }

  return {
    installedPowerKw,
    connectedLoadKw,
    coincidenceFactor,
    demandFactor,
    estimatedMaxDemandKw,
    maximumDemandKw: estimatedMaxDemandKw,
    contractedPowerKw: availableSupplyKw,
    capacityReserveKw,
    capacityReservePercent,
    reserveCapacityKw: capacityReserveKw,
    reserveCapacityPercent: capacityReservePercent,
    loadLevelStatus,
    recommendation
  };
}
