// Deterministic Lighting & Photometric Engine (Lumen Method / RNE EM.010 / ISO 8995)
import { LightingRecord, TariffConfig } from '../types';

export interface LightingCalculationResult {
  roomAreaM2: number;
  mountingHeightM: number;
  roomIndexK: number;
  coefficientOfUtilizationCu: number;
  totalRequiredFluxLumens: number;
  recommendedLuminaireCount: number;
  gridNx: number;
  gridNy: number;
  actualTotalLuminaireCount: number;
  spacingXM: number;
  spacingYM: number;
  wallDistanceXM: number;
  wallDistanceYM: number;
  calculatedAverageLux: number;
  targetLux: number;
  luxComplianceRatioPercent: number;
  powerDensityWm2: number;
  totalInstalledLightingPowerW: number;
  monthlyKwh: number;
  monthlyCostSoles: number;
  isUniformityAcceptable: boolean;
  technicalRecommendation: string;
}

export const LIGHTING_STANDARDS_LUX: Record<string, { lux: number; description: string }> = {
  'Vivienda - Sala / Estar': { lux: 150, description: 'Descanso, recreación familiar y confort visual' },
  'Vivienda - Cocina / Comedor': { lux: 250, description: 'Preparación de alimentos y áreas de servicio' },
  'Vivienda - Dormitorio': { lux: 100, description: 'Descanso nocturno y vestidor' },
  'Vivienda - Baño / Aseo': { lux: 150, description: 'Aseo personal y espejo' },
  'Oficina - Trabajo general / Computadoras': { lux: 350, description: 'Trabajo con pantallas y lectura de documentos' },
  'Oficina - Sala de reuniones': { lux: 400, description: 'Conferencias, presentaciones y proyección' },
  'Comercio - Tienda / Mostrador': { lux: 450, description: 'Exhibición comercial y atención al cliente' },
  'Sector Calzado - Área de Corte': { lux: 500, description: 'Corte de cuero y selección de patrones de piel' },
  'Sector Calzado - Área de Aparado (Costura)': { lux: 600, description: 'Costura de precisión, pespunte y unión de piezas' },
  'Sector Calzado - Área de Armado / Montado': { lux: 400, description: 'Conformado, pegado de suela y hormado' },
  'Sector Calzado - Área de Acabado e Inspección': { lux: 750, description: 'Control de calidad fino, retoque y empaque' },
  'Taller / Industria - Trabajo mecánico medio': { lux: 300, description: 'Maquinado, ensamblaje general y bancos de trabajo' },
  'Almacén / Depósito': { lux: 150, description: 'Almacenamiento y tránsito seguro de montacargas' }
};

export function calculateLighting(
  room: LightingRecord,
  tariff: TariffConfig,
  operatingHoursPerDay = 8,
  operatingDaysPerWeek = 6
): LightingCalculationResult {
  const L = Math.max(1.0, room.lengthM || 8.0);
  const W = Math.max(1.0, room.widthM || 5.0);
  const areaM2 = room.areaM2 || Number((L * W).toFixed(2));

  const roomHeightM = Math.max(2.0, room.heightM || 3.0);
  const workPlaneM = Math.max(0, Math.min(1.2, room.workplaneHeightM || 0.85)); // Table level ~0.85m
  const mountingHeightM = roomHeightM;
  const hm = Math.max(0.8, mountingHeightM - workPlaneM);

  // Room Index: K = (L * W) / [ hm * (L + W) ]
  const roomIndexK = Number(((L * W) / (hm * (L + W))).toFixed(2));

  // Estimate Coefficient of Utilization (Cu) based on K and reflectances
  let cu = room.utilizationFactor || (0.65 * (roomIndexK / (roomIndexK + 0.8)));
  cu = Math.max(0.25, Math.min(0.85, Number(cu.toFixed(2))));

  const fm = Math.max(0.60, Math.min(0.95, room.maintenanceFactor || 0.80));
  const targetLux = Math.max(50, room.requiredLuxRne || 500);
  const unitPowerW = Math.max(1, room.recommendedLampPowerW || room.currentLampPowerW || 36);
  const unitLumens = unitPowerW * 95; // ~95 lm/W for LED

  // Total required luminous flux: Φ = (E * A) / (Cu * FM)
  const totalRequiredFluxLumens = Math.round((targetLux * areaM2) / (cu * fm));

  // Raw luminaire count
  const rawCount = totalRequiredFluxLumens / unitLumens;
  const recommendedLuminaireCount = Math.max(1, Math.ceil(rawCount));

  // Determine rectangular grid Nx (along L) and Ny (along W)
  const aspectRatio = L / W;
  let gridNy = Math.max(1, Math.round(Math.sqrt(recommendedLuminaireCount / aspectRatio)));
  let gridNx = Math.max(1, Math.ceil(recommendedLuminaireCount / gridNy));
  
  // Ensure Nx * Ny >= recommended count
  while (gridNx * gridNy < recommendedLuminaireCount) {
    if (gridNx / gridNy < aspectRatio) {
      gridNx++;
    } else {
      gridNy++;
    }
  }

  const actualTotalCount = room.recommendedLampCount || gridNx * gridNy;
  const spacingXM = Number((L / gridNx).toFixed(2));
  const spacingYM = Number((W / gridNy).toFixed(2));
  const wallDistanceXM = Number((spacingXM / 2).toFixed(2));
  const wallDistanceYM = Number((spacingYM / 2).toFixed(2));

  // Calculated average illuminance: E = (N * Φ * Cu * FM) / A
  const calculatedAverageLux = Math.round((actualTotalCount * unitLumens * cu * fm) / areaM2);
  const luxComplianceRatioPercent = Number(((calculatedAverageLux / targetLux) * 100).toFixed(1));
  const isUniformityAcceptable = (spacingXM <= 1.5 * hm) && (spacingYM <= 1.5 * hm);

  const totalInstalledLightingPowerW = room.recommendedTotalPowerW || (actualTotalCount * unitPowerW);
  const powerDensityWm2 = Number((totalInstalledLightingPowerW / areaM2).toFixed(2));

  // Energy & Cost
  const dailyHours = room.dailyHours || operatingHoursPerDay;
  const dailyKwh = (totalInstalledLightingPowerW / 1000) * dailyHours;
  const monthlyKwh = Number((dailyKwh * operatingDaysPerWeek * 4.33).toFixed(2));
  const monthlyCostSoles = Number((monthlyKwh * (tariff.activeEnergyPriceKwh || 0.75)).toFixed(2));

  let technicalRecommendation = '';
  if (luxComplianceRatioPercent < 90) {
    technicalRecommendation = `DÉFICIT LUMÍNICO: Nivel alcanzado (${calculatedAverageLux} lux) es inferior al requerido por norma (${targetLux} lux para ${room.visualTask || room.roomName}). Se recomienda aumentar el número o flujo luminoso de las luminarias.`;
  } else if (luxComplianceRatioPercent > 130) {
    technicalRecommendation = `SOBRE-ILUMINACIÓN: Nivel de ${calculatedAverageLux} lux supera ampliamente la exigencia (${targetLux} lux). Posible oportunidad de ahorro reduciendo potencia o zonificando encendido.`;
  } else {
    technicalRecommendation = `Nivel lumínico idóneo (${calculatedAverageLux} lux vs ${targetLux} lux requeridos). Distribución uniforme con densidad de potencia eficiente de ${powerDensityWm2} W/m².`;
  }

  return {
    roomAreaM2: areaM2,
    mountingHeightM,
    roomIndexK,
    coefficientOfUtilizationCu: cu,
    totalRequiredFluxLumens,
    recommendedLuminaireCount,
    gridNx,
    gridNy,
    actualTotalLuminaireCount: actualTotalCount,
    spacingXM,
    spacingYM,
    wallDistanceXM,
    wallDistanceYM,
    calculatedAverageLux,
    targetLux,
    luxComplianceRatioPercent,
    powerDensityWm2,
    totalInstalledLightingPowerW,
    monthlyKwh,
    monthlyCostSoles,
    isUniformityAcceptable,
    technicalRecommendation
  };
}
