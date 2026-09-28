// Deterministic Grounding & Soil Resistivity Engine (IEEE Std 142 / CNE Suministro & Utilización)
import { TrafficLight, ConfidenceLevel } from '../types';

export interface GroundingInput {
  soilType: string;
  soilMoisture: 'SECO' | 'MEDIO' | 'HUMEDO';
  measuredSoilResistivityOhmM?: number;
  measuredResistanceOhm?: number;
  electrodeLengthM: number;
  electrodeDiameterMm: number;
  electrodeCount: number;
  electrodeSpacingM: number;
  soilTreatmentType: 'NINGUNO' | 'BENTONITA' | 'GEL_ELECTROLITICO' | 'CEMENTO_CONDUCTIVO' | 'SAL_CARBON_NO_RECOMENDADO';
  maxTargetResistanceOhm?: number; // 25 for normal, 15 for commercial/IT, 5 for industrial/telecom
}

export interface GroundingResult {
  effectiveResistivityOhmM: number;
  isResistivityMeasured: boolean;
  theoreticalResistanceSingleRodOhm: number;
  theoreticalResistanceTotalOhm: number;
  measuredResistanceOhm?: number;
  differenceOhm?: number;
  targetResistanceOhm: number;
  complianceStatus: TrafficLight;
  confidence: ConfidenceLevel;
  treatmentAnalysis: {
    recommendedTreatment: string;
    impactDescription: string;
    advantages: string;
    disadvantages: string;
    environmentalImpact: string;
  };
  technicalObservations: string;
  safetyWarning: string;
}

export const SOIL_CATALOG: Record<string, { minRho: number; maxRho: number; avgRho: number; description: string }> = {
  'Arcilla plástica / húmeda': { minRho: 10, maxRho: 50, avgRho: 30, description: 'Excelente conductividad natural, retención alta de humedad.' },
  'Tierra de cultivo / vegetal': { minRho: 20, maxRho: 100, avgRho: 50, description: 'Buena conductividad con materia orgánica y humedad media.' },
  'Suelo mixto (arcilla y arena)': { minRho: 80, maxRho: 250, avgRho: 150, description: 'Conductividad moderada, común en valles y zonas urbanas de Perú.' },
  'Arena silícea / playa': { minRho: 200, maxRho: 1000, avgRho: 450, description: 'Baja retención de humedad, alta resistividad en seco.' },
  'Grava / Canto rodado / Pedregoso': { minRho: 300, maxRho: 3000, avgRho: 1200, description: 'Suelo muy resistivo, requiere tratamiento conductivo o múltiples pozos.' },
  'Roca compacta / Granito': { minRho: 1000, maxRho: 10000, avgRho: 3500, description: 'Altísima resistividad, requiere zanja profunda con cemento conductivo.' }
};

export function calculateGrounding(input: GroundingInput): GroundingResult {
  // Determine base soil resistivity
  let baseRho = 150; // default average
  let isResistivityMeasured = false;

  if (input.measuredSoilResistivityOhmM && input.measuredSoilResistivityOhmM > 0) {
    baseRho = input.measuredSoilResistivityOhmM;
    isResistivityMeasured = true;
  } else if (SOIL_CATALOG[input.soilType]) {
    baseRho = SOIL_CATALOG[input.soilType].avgRho;
    // Adjust by moisture factor
    if (input.soilMoisture === 'SECO') baseRho *= 1.35;
    if (input.soilMoisture === 'HUMEDO') baseRho *= 0.75;
  }

  // Treatment factor
  let treatmentFactor = 1.0;
  let treatmentAnalysis = {
    recommendedTreatment: 'Sin tratamiento químico adicional necesario.',
    impactDescription: 'El terreno conserva su resistividad natural de estrato.',
    advantages: 'Bajo costo y nulo mantenimiento químico.',
    disadvantages: 'Dependencia total de la humedad estacional.',
    environmentalImpact: 'Nulo impacto ecológico.'
  };

  switch (input.soilTreatmentType) {
    case 'BENTONITA':
      treatmentFactor = 0.65;
      treatmentAnalysis = {
        recommendedTreatment: 'Bentonita sódica no corrosiva (25-30 kg por pozo)',
        impactDescription: 'Reduce la resistividad del bulbo circundante en un 35% con excelente retención hidroscópica.',
        advantages: 'Ecológico, no degrada el cobre, estable a largo plazo.',
        disadvantages: 'Efectividad moderada en suelos hiper-rocosos.',
        environmentalImpact: 'Mineral natural inocuo para acuíferos.'
      };
      break;
    case 'GEL_ELECTROLITICO':
      treatmentFactor = 0.45;
      treatmentAnalysis = {
        recommendedTreatment: 'Dosis química electrolítica / Gel de baja resistividad (2 dosis)',
        impactDescription: 'Reduce la resistividad de contacto en un 55% mediante iones lixiviables.',
        advantages: 'Rápida reducción de resistencia en terrenos difíciles.',
        disadvantages: 'Requiere mantenimiento y reaplicación periódica cada 2 a 3 años.',
        environmentalImpact: 'Debe utilizarse formulación certificada biodegradable sin metales pesados.'
      };
      break;
    case 'CEMENTO_CONDUCTIVO':
      treatmentFactor = 0.35;
      treatmentAnalysis = {
        recommendedTreatment: 'Cemento conductivo de base grafito/carbón (San-Earth / Erico o similar)',
        impactDescription: 'Reduce la resistividad en un 65% aumentando el diámetro aparente del electrodo de forma permanente.',
        advantages: 'Permanente, no se lava con lluvia, protege la varilla contra corrosión y hurto.',
        disadvantages: 'Mayor costo inicial de instalación.',
        environmentalImpact: 'Totalmente inerte y seguro para el medio ambiente.'
      };
      break;
    case 'SAL_CARBON_NO_RECOMENDADO':
      treatmentFactor = 0.70;
      treatmentAnalysis = {
        recommendedTreatment: 'DESACONSEJADO: Sal común y carbón vegetal tradicional',
        impactDescription: 'Reducción temporal con severo efecto galvánico corrosivo acelerado.',
        advantages: 'Costo inicial muy bajo.',
        disadvantages: '¡CORROSIÓN RÁPIDA! Destruye la varilla de cobre en 1-2 años y contamina el suelo.',
        environmentalImpact: 'Salinización perjudicial de napas freáticas.'
      };
      break;
  }

  const effectiveRho = baseRho * treatmentFactor;
  const L = Math.max(1.0, input.electrodeLengthM || 2.40);
  const d = Math.max(0.008, (input.electrodeDiameterMm || 16) / 1000); // 16mm standard

  // Dwight formula for single vertical rod: R = (rho / 2πL) * [ ln(4L/d) - 1 ]
  const lnTerm = Math.log((4 * L) / d) - 1;
  const theoreticalSingleRod = (effectiveRho / (2 * Math.PI * L)) * lnTerm;

  // Multiple rods parallel calculation with distance coupling
  const n = Math.max(1, input.electrodeCount || 1);
  const spacingM = Math.max(L, input.electrodeSpacingM || 3.0);
  
  let theoreticalTotalOhm = theoreticalSingleRod;
  if (n > 1) {
    // Grouping efficiency factor (IEEE Std 142)
    // S >= 2L gives ~0.85 to 0.90 efficiency
    const groupingEfficiency = Math.min(0.95, 0.65 + (spacingM / (3 * L)) * 0.3);
    theoreticalTotalOhm = theoreticalSingleRod / (n * groupingEfficiency);
  }

  theoreticalTotalOhm = Number(theoreticalTotalOhm.toFixed(2));
  const targetMaxOhm = input.maxTargetResistanceOhm || 25;

  const valueToEvaluate = input.measuredResistanceOhm && input.measuredResistanceOhm > 0
    ? input.measuredResistanceOhm
    : theoreticalTotalOhm;

  let complianceStatus: TrafficLight = 'ADECUADO';
  let technicalObservations = '';

  if (valueToEvaluate > targetMaxOhm) {
    complianceStatus = 'NO_ADECUADO';
    technicalObservations = `NO CUMPLE NORMA CNE: Resistencia de puesta a tierra (${valueToEvaluate.toFixed(1)} Ω) supera el valor máximo permisible (${targetMaxOhm} Ω). Se requiere pozo adicional interconectado o tratamiento con cemento conductivo.`;
  } else if (valueToEvaluate >= targetMaxOhm * 0.8) {
    complianceStatus = 'REVISAR';
    technicalObservations = `VALOR ALTO / PRÓXIMO AL LÍMITE: Resistencia de puesta a tierra (${valueToEvaluate.toFixed(1)} Ω) cercana al umbral reglamentario (${targetMaxOhm} Ω). Se recomienda mantenimiento preventivo.`;
  } else {
    complianceStatus = 'ADECUADO';
    technicalObservations = `VALOR ÓPTIMO: Resistencia de puesta a tierra (${valueToEvaluate.toFixed(1)} Ω) cumple satisfactoriamente la exigencia normativa (≤ ${targetMaxOhm} Ω).`;
  }

  let differenceOhm: number | undefined = undefined;
  if (input.measuredResistanceOhm !== undefined && input.measuredResistanceOhm > 0) {
    differenceOhm = Number((input.measuredResistanceOhm - theoreticalTotalOhm).toFixed(2));
  }

  const confidence: ConfidenceLevel = input.measuredResistanceOhm && input.measuredResistanceOhm > 0
    ? 'MEDIDO'
    : (isResistivityMeasured ? 'CALCULADO' : 'ESTIMADO');

  const safetyWarning = 
    "El cálculo teórico de puesta a tierra es referencial y NUNCA sustituye la medición física in situ con telurómetro de 3 o 4 picas debidamente calibrado.";

  return {
    effectiveResistivityOhmM: Number(effectiveRho.toFixed(1)),
    isResistivityMeasured,
    theoreticalResistanceSingleRodOhm: Number(theoreticalSingleRod.toFixed(2)),
    theoreticalResistanceTotalOhm: theoreticalTotalOhm,
    measuredResistanceOhm: input.measuredResistanceOhm,
    differenceOhm,
    targetResistanceOhm: targetMaxOhm,
    complianceStatus,
    confidence,
    treatmentAnalysis,
    technicalObservations,
    safetyWarning
  };
}

export const calculateGroundingResistance = calculateGrounding;
