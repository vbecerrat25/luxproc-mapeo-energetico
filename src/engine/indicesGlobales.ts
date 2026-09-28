// Deterministic Electrical Safety & Energy Efficiency Indices Engine
import { CircuitRecord, GroundingSystem, PowerFactorAnalysis, RoomLighting, TrafficLight } from '../types';

export interface ScoreComponent {
  name: string;
  weightPercent: number;
  obtainedScore: number;
  maxScore: number;
  status: TrafficLight;
  description: string;
}

export interface IndexEvaluationResult {
  score: number; // 0 to 100
  grade: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFICIENTE' | 'CRITICO';
  overallStatus: TrafficLight;
  components: ScoreComponent[];
  calculationMethodology: string;
  primaryActionRequired: string;
}

/**
 * Calculates deterministic Electrical Safety Index (0-100)
 */
export function calculateSafetyIndex(
  circuits: CircuitRecord[],
  groundingSystems: GroundingSystem[]
): IndexEvaluationResult {
  const components: ScoreComponent[] = [];

  // 1. Grounding System Evaluation (Weight: 25%)
  let groundingScore = 100;
  let groundingStatus: TrafficLight = 'ADECUADO';
  let groundingDesc = 'Sistema de puesta a tierra operativo con baja resistencia.';

  if (!groundingSystems || groundingSystems.length === 0) {
    groundingScore = 0;
    groundingStatus = 'NO_ADECUADO';
    groundingDesc = '¡CRÍTICO! No se ha registrado pozo de puesta a tierra.';
  } else {
    const mainGround = groundingSystems[0];
    if (mainGround.complianceStatus === 'NO_ADECUADO') {
      groundingScore = 30;
      groundingStatus = 'NO_ADECUADO';
      groundingDesc = `Resistencia de tierra (${mainGround.measuredResistanceOhm || mainGround.calculatedTheoreticalResistanceOhm} Ω) excede el límite normativo de ${mainGround.maxTargetResistanceOhm} Ω.`;
    } else if (mainGround.complianceStatus === 'REVISAR') {
      groundingScore = 70;
      groundingStatus = 'REVISAR';
      groundingDesc = 'Resistencia de tierra en valor marginal o sin medición certificada.';
    }
  }
  components.push({
    name: 'Puesta a Tierra y Continuidad PE',
    weightPercent: 25,
    obtainedScore: Number(((groundingScore * 25) / 100).toFixed(1)),
    maxScore: 25,
    status: groundingStatus,
    description: groundingDesc
  });

  // 2. Conductor Ampacity & Thermal Protection (Weight: 25%)
  let conductorScore = 100;
  let conductorStatus: TrafficLight = 'ADECUADO';
  let conductorDesc = 'Todos los conductores operan dentro de su capacidad admisible Iz.';

  if (circuits.length > 0) {
    const nonAdequateCount = circuits.filter(c => c.wireStatus === 'NO_ADECUADO').length;
    const reviewCount = circuits.filter(c => c.wireStatus === 'REVISAR').length;

    if (nonAdequateCount > 0) {
      conductorScore = Math.max(0, 100 - nonAdequateCount * 35);
      conductorStatus = 'NO_ADECUADO';
      conductorDesc = `${nonAdequateCount} circuito(s) con cables sobrecargados por encima de su ampacidad admisible.`;
    } else if (reviewCount > 0) {
      conductorScore = Math.max(50, 100 - reviewCount * 15);
      conductorStatus = 'REVISAR';
      conductorDesc = `${reviewCount} circuito(s) operando al límite de capacidad térmica (>85%).`;
    }
  }
  components.push({
    name: 'Capacidad Térmica de Conductores',
    weightPercent: 25,
    obtainedScore: Number(((conductorScore * 25) / 100).toFixed(1)),
    maxScore: 25,
    status: conductorStatus,
    description: conductorDesc
  });

  // 3. Circuit Breaker Coordination Ib <= In <= Iz (Weight: 25%)
  let breakerScore = 100;
  let breakerStatus: TrafficLight = 'ADECUADO';
  let breakerDesc = 'Termomagnéticos correctamente dimensionados y coordinados.';

  if (circuits.length > 0) {
    const nonAdequateBreakers = circuits.filter(c => c.breakerStatus === 'NO_ADECUADO').length;
    const reviewBreakers = circuits.filter(c => c.breakerStatus === 'REVISAR').length;

    if (nonAdequateBreakers > 0) {
      breakerScore = Math.max(0, 100 - nonAdequateBreakers * 30);
      breakerStatus = 'NO_ADECUADO';
      breakerDesc = `${nonAdequateBreakers} circuito(s) con termomagnéticos descalibrados o que no protegen el cable.`;
    } else if (reviewBreakers > 0) {
      breakerScore = Math.max(60, 100 - reviewBreakers * 15);
      breakerStatus = 'REVISAR';
      breakerDesc = `${reviewBreakers} termomagnético(s) con margen ajustado de coordinación.`;
    }
  }
  components.push({
    name: 'Coordinación de Termomagnéticos',
    weightPercent: 25,
    obtainedScore: Number(((breakerScore * 25) / 100).toFixed(1)),
    maxScore: 25,
    status: breakerStatus,
    description: breakerDesc
  });

  // 4. RCD Differential Safety (Weight: 15%)
  let rcdScore = 100;
  let rcdStatus: TrafficLight = 'ADECUADO';
  let rcdDesc = 'Diferenciales de 30mA instalados para protección directa de personas.';

  if (circuits.length > 0) {
    const missingRcd = circuits.filter(c => !c.rcdExistingA || c.rcdStatus === 'NO_ADECUADO').length;
    if (missingRcd > 0) {
      rcdScore = Math.max(20, 100 - missingRcd * 25);
      rcdStatus = missingRcd > circuits.length / 2 ? 'NO_ADECUADO' : 'REVISAR';
      rcdDesc = `${missingRcd} circuito(s) sin protección diferencial de 30mA para personas.`;
    }
  }
  components.push({
    name: 'Protección Diferencial (Fugas a Tierra)',
    weightPercent: 15,
    obtainedScore: Number(((rcdScore * 15) / 100).toFixed(1)),
    maxScore: 15,
    status: rcdStatus,
    description: rcdDesc
  });

  // 5. Voltage Drop Regulation (Weight: 10%)
  let vDropScore = 100;
  let vDropStatus: TrafficLight = 'ADECUADO';
  let vDropDesc = 'Caídas de tensión dentro del margen reglamentario (≤4%).';

  if (circuits.length > 0) {
    const excessiveVdrop = circuits.filter(c => c.voltageDropStatus === 'NO_ADECUADO').length;
    if (excessiveVdrop > 0) {
      vDropScore = Math.max(30, 100 - excessiveVdrop * 30);
      vDropStatus = 'NO_ADECUADO';
      vDropDesc = `${excessiveVdrop} circuito(s) con caída de tensión excesiva que degrada equipos.`;
    }
  }
  components.push({
    name: 'Regulación de Caída de Tensión',
    weightPercent: 10,
    obtainedScore: Number(((vDropScore * 10) / 100).toFixed(1)),
    maxScore: 10,
    status: vDropStatus,
    description: vDropDesc
  });

  const totalScore = Math.round(components.reduce((acc, c) => acc + c.obtainedScore, 0));

  let grade: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFICIENTE' | 'CRITICO' = 'EXCELENTE';
  let overallStatus: TrafficLight = 'ADECUADO';
  let primaryAction = 'Mantener el plan de inspecciones periódicas anuales.';

  if (totalScore < 50) {
    grade = 'CRITICO';
    overallStatus = 'NO_ADECUADO';
    primaryAction = 'URGENTE: Intervenir conductores sobrecargados, termomagnéticos y verificar pozo a tierra.';
  } else if (totalScore < 70) {
    grade = 'DEFICIENTE';
    overallStatus = 'NO_ADECUADO';
    primaryAction = 'Priorizar instalación de diferenciales 30mA y corrección de calibres de cables.';
  } else if (totalScore < 85) {
    grade = 'REGULAR';
    overallStatus = 'REVISAR';
    primaryAction = 'Realizar mantenimiento al sistema de puesta a tierra y ajustar protecciones.';
  } else if (totalScore < 95) {
    grade = 'BUENO';
    overallStatus = 'ADECUADO';
    primaryAction = 'La instalación cumple la mayoría de criterios de seguridad del CNE.';
  }

  const methodology = 
    "El Índice de Seguridad Eléctrica (ISE) se calcula ponderando: Puesta a Tierra (25%), Capacidad Térmica de Cables (25%), Coordinación de Termomagnéticos (25%), Diferenciales (15%) y Caída de Tensión (10%). Cada componente penaliza desviaciones respecto al CNE Utilización y la norma IEC 60364.";

  return {
    score: totalScore,
    grade,
    overallStatus,
    components,
    calculationMethodology: methodology,
    primaryActionRequired: primaryAction
  };
}

/**
 * Calculates deterministic Energy Efficiency Index (0-100)
 */
export function calculateEfficiencyIndex(
  powerFactor: PowerFactorAnalysis,
  lighting: RoomLighting[],
  calculatedMonthlyKwh: number,
  receiptMonthlyKwh: number,
  hasSolarOrVfd: boolean
): IndexEvaluationResult {
  const components: ScoreComponent[] = [];

  // 1. Power Factor Performance (Weight: 30%)
  const currentFp = powerFactor?.currentPowerFactor ?? 0.85;
  let fpScore = 100;
  let fpStatus: TrafficLight = 'ADECUADO';
  let fpDesc = `Factor de potencia óptimo (${currentFp.toFixed(2)} ≥ 0.96).`;

  if (currentFp < 0.80) {
    fpScore = 20;
    fpStatus = 'NO_ADECUADO';
    fpDesc = `Factor de potencia muy deficiente (${currentFp.toFixed(2)}). Genera penalidades y sobrecarga reactiva.`;
  } else if (currentFp < 0.90) {
    fpScore = 55;
    fpStatus = 'NO_ADECUADO';
    fpDesc = `Factor de potencia bajo (${currentFp.toFixed(2)}). Aplica recargo tarifario en Perú.`;
  } else if (currentFp < 0.96) {
    fpScore = 80;
    fpStatus = 'REVISAR';
    fpDesc = `Factor de potencia ${currentFp.toFixed(2)} cercano a la meta de 0.96.`;
  }
  components.push({
    name: 'Factor de Potencia y Energía Reactiva',
    weightPercent: 30,
    obtainedScore: Number(((fpScore * 30) / 100).toFixed(1)),
    maxScore: 30,
    status: fpStatus,
    description: fpDesc
  });

  // 2. Lighting Energy Density W/m² (Weight: 25%)
  let lightScore = 100;
  let lightStatus: TrafficLight = 'ADECUADO';
  let lightDesc = 'Sistemas de iluminación LED de alta eficacia lumínica (W/m² eficiente).';

  if (lighting.length > 0) {
    const totalW = lighting.reduce((acc, l) => acc + (l.currentTotalPowerW || (l.currentLampCount * l.currentLampPowerW) || 100), 0);
    const totalArea = lighting.reduce((acc, l) => acc + l.areaM2, 0);
    const avgDensity = totalArea > 0 ? totalW / totalArea : 8;

    if (avgDensity > 14) {
      lightScore = 40;
      lightStatus = 'NO_ADECUADO';
      lightDesc = `Densidad de iluminación elevada (${avgDensity.toFixed(1)} W/m²). Se recomienda migración a LED de alta eficiencia.`;
    } else if (avgDensity > 9) {
      lightScore = 75;
      lightStatus = 'REVISAR';
      lightDesc = `Densidad de iluminación moderada (${avgDensity.toFixed(1)} W/m²).`;
    }
  }
  components.push({
    name: 'Eficacia de Iluminación y Densidad W/m²',
    weightPercent: 25,
    obtainedScore: Number(((lightScore * 25) / 100).toFixed(1)),
    maxScore: 25,
    status: lightStatus,
    description: lightDesc
  });

  // 3. Billing Discrepancy & Standby Management (Weight: 20%)
  let billScore = 90;
  let billStatus: TrafficLight = 'ADECUADO';
  let billDesc = 'Consumo censado se corresponde adecuadamente con la facturación real.';

  if (receiptMonthlyKwh > 0 && calculatedMonthlyKwh > 0) {
    const diffPct = Math.abs(((calculatedMonthlyKwh - receiptMonthlyKwh) / receiptMonthlyKwh) * 100);
    if (diffPct > 25) {
      billScore = 45;
      billStatus = 'REVISAR';
      billDesc = `Desviación del ${diffPct.toFixed(1)}% entre recibo y censo. Posibles consumos parásitos u horas no controladas.`;
    } else if (diffPct > 12) {
      billScore = 75;
      billStatus = 'REVISAR';
      billDesc = `Desviación leve del ${diffPct.toFixed(1)}% entre cálculo y facturación.`;
    }
  }
  components.push({
    name: 'Control de Consumos Ocultos y Facturación',
    weightPercent: 20,
    obtainedScore: Number(((billScore * 20) / 100).toFixed(1)),
    maxScore: 20,
    status: billStatus,
    description: billDesc
  });

  // 4. Modern Technology & Renewable Energy Integration (Weight: 25%)
  let techScore = hasSolarOrVfd ? 95 : 65;
  let techStatus: TrafficLight = hasSolarOrVfd ? 'ADECUADO' : 'REVISAR';
  let techDesc = hasSolarOrVfd 
    ? 'Implementación activa de variadores de frecuencia o energía solar fotovoltaica.'
    : 'Oportunidad de incorporar variadores de velocidad en motores o generación solar fotovoltaica.';

  components.push({
    name: 'Tecnología Eficiente y Energías Renovables',
    weightPercent: 25,
    obtainedScore: Number(((techScore * 25) / 100).toFixed(1)),
    maxScore: 25,
    status: techStatus,
    description: techDesc
  });

  const totalScore = Math.round(components.reduce((acc, c) => acc + c.obtainedScore, 0));

  let grade: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'DEFICIENTE' | 'CRITICO' = 'EXCELENTE';
  let overallStatus: TrafficLight = 'ADECUADO';
  let primaryAction = 'Mantener prácticas eficientes y monitoreo mensual de consumos.';

  if (totalScore < 50) {
    grade = 'CRITICO';
    overallStatus = 'NO_ADECUADO';
    primaryAction = 'Instalar banco de condensadores para eliminar penalidades y modernizar luminarias.';
  } else if (totalScore < 70) {
    grade = 'DEFICIENTE';
    overallStatus = 'REVISAR';
    primaryAction = 'Corregir factor de potencia e implementar mantenimiento en motores y compresores.';
  } else if (totalScore < 85) {
    grade = 'REGULAR';
    overallStatus = 'REVISAR';
    primaryAction = 'Evaluar proyectos de energía solar fotovoltaica y automatización de apagado.';
  } else if (totalScore < 95) {
    grade = 'BUENO';
    overallStatus = 'ADECUADO';
    primaryAction = 'Buen desempeño energético general con oportunidades de optimización fina.';
  }

  const methodology = 
    "El Índice de Eficiencia Energética (IEE) se calcula ponderando: Factor de Potencia y Reactiva (30%), Densidad de Iluminación W/m² (25%), Control de Consumos y Desviación de Facturación (20%) e Integración de Tecnologías Eficientes / Solar (25%).";

  return {
    score: totalScore,
    grade,
    overallStatus,
    components,
    calculationMethodology: methodology,
    primaryActionRequired: primaryAction
  };
}
