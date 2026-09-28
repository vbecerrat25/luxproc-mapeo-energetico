// Deterministic Voltage Drop Calculation Engine (CNE Utilización 050-102)
import { PhaseSystem, TrafficLight } from '../types';

export interface VoltageDropInput {
  voltage: number;
  phases: PhaseSystem;
  lengthM: number;
  currentA: number;
  powerFactor: number;
  wireSectionMm2: number;
  wireMaterial: 'COBRE' | 'ALUMINIO';
  maxAllowedPercent?: number; // default 2.5% feeder or 4% total
}

export interface VoltageDropResult {
  initialVoltageV: number;
  voltageDropV: number;
  finalVoltageV: number;
  voltageDropPercent: number;
  maxAllowedPercent: number;
  resistanceOhm: number;
  reactanceOhm: number;
  status: TrafficLight;
  formulaUsed: string;
  recommendation: string;
}

export function calculateVoltageDrop(input: VoltageDropInput): VoltageDropResult {
  const vNom = input.voltage > 0 ? input.voltage : 220;
  const lengthM = Math.max(0.5, input.lengthM || 10);
  const currentA = Math.max(0, input.currentA || 0);
  const sectionMm2 = Math.max(1.0, input.wireSectionMm2 || 2.5);
  const fp = Math.max(0.2, Math.min(1.0, input.powerFactor || 0.85));
  const sinPhi = Math.sqrt(Math.max(0, 1 - fp * fp));
  const maxAllowedPercent = input.maxAllowedPercent || 4.0;

  // Resistivity at operating temperature (~75°C) in Ω·mm²/m
  // Copper: 0.0210 Ω·mm²/m; Aluminum: 0.0345 Ω·mm²/m
  const rho = input.wireMaterial === 'ALUMINIO' ? 0.0345 : 0.0210;
  
  // Resistance of one conductor: R = (rho * L) / S (Ω)
  const rPerPhase = (rho * lengthM) / sectionMm2;
  // Reactance of conduit run: X ≈ 0.00008 Ω/m
  const xPerPhase = 0.00008 * lengthM;

  let voltageDropV = 0;
  let formulaUsed = '';

  if (input.phases === 'TRIFASICO') {
    // Trifásico: ΔV = √3 × I × (R cosφ + X sinφ)
    voltageDropV = Math.sqrt(3) * currentA * (rPerPhase * fp + xPerPhase * sinPhi);
    formulaUsed = `ΔV = √3 × I × L × (R·cosφ + X·sinφ) = √3 × ${currentA}A × ${rPerPhase.toFixed(4)}Ω`;
  } else {
    // Monofásico / Bifásico: ΔV = 2 × I × (R cosφ + X sinφ)
    voltageDropV = 2 * currentA * (rPerPhase * fp + xPerPhase * sinPhi);
    formulaUsed = `ΔV = 2 × I × L × (R·cosφ + X·sinφ) = 2 × ${currentA}A × ${rPerPhase.toFixed(4)}Ω`;
  }

  voltageDropV = Number(voltageDropV.toFixed(2));
  const voltageDropPercent = Number(((voltageDropV / vNom) * 100).toFixed(2));
  const finalVoltageV = Number((vNom - voltageDropV).toFixed(2));

  let status: TrafficLight = 'ADECUADO';
  let recommendation = '';

  if (voltageDropPercent > maxAllowedPercent) {
    status = 'NO_ADECUADO';
    recommendation = `CAÍDA EXCESIVA: La caída de tensión (${voltageDropPercent}%) supera el límite reglamentario (${maxAllowedPercent}%). Se requiere aumentar la sección del conductor a fin de evitar mal funcionamiento de equipos y calentamiento del circuito.`;
  } else if (voltageDropPercent >= maxAllowedPercent * 0.8) {
    status = 'REVISAR';
    recommendation = `ALERTA DE CAÍDA ELEVADA: Caída del ${voltageDropPercent}% cercana al límite normativo (${maxAllowedPercent}%). Tensión final estimada: ${finalVoltageV}V.`;
  } else {
    status = 'ADECUADO';
    recommendation = `Caída de tensión dentro de norma (${voltageDropPercent}% ≤ ${maxAllowedPercent}%). Tensión terminal estimada en carga: ${finalVoltageV}V.`;
  }

  return {
    initialVoltageV: vNom,
    voltageDropV,
    finalVoltageV,
    voltageDropPercent,
    maxAllowedPercent,
    resistanceOhm: Number(rPerPhase.toFixed(4)),
    reactanceOhm: Number(xPerPhase.toFixed(4)),
    status,
    formulaUsed,
    recommendation
  };
}
