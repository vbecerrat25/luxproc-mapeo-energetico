// Deterministic Bill of Materials (BOM) Generation Engine
import { CompleteDiagnostic, MaterialItem } from '../types';

export function generateBillOfMaterials(diag: CompleteDiagnostic): MaterialItem[] {
  const materials: MaterialItem[] = [];
  let itemCounter = 1;

  // 1. Tableros Eléctricos
  (diag.panels || []).forEach(p => {
    const unitCost = 280;
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Tableros Eléctricos',
      description: `Gabinete para ${p.name} (${p.enclosureType || 'Metálico IP54'})`,
      quantity: 1,
      unit: 'und',
      unitCostSoles: unitCost,
      totalCostSoles: unitCost,
      specification: `${p.circuitCount || 8} polos/espacios, barras de cobre electrolítico, barra de tierra PE`,
      observation: `Ubicación: ${p.location || 'Zona de distribución'}`
    });

    if (p.mainBreakerRatingA > 0) {
      const mainBreakerCost = p.mainBreakerRatingA > 100 ? 320 : (p.mainBreakerRatingA > 40 ? 140 : 85);
      materials.push({
        id: `mat-${itemCounter++}`,
        category: 'Protecciones Principales',
        description: `Interruptor Termomagnético Principal`,
        quantity: 1,
        unit: 'und',
        unitCostSoles: mainBreakerCost,
        totalCostSoles: mainBreakerCost,
        specification: `${p.mainBreakerRatingA}A, ${p.mainBreakerPoles || (p.phases === 'TRIFASICO' ? 3 : 2)}P, Icu ${p.shortCircuitKa || 10}kA, Curva C`,
        observation: `Interruptor General para ${p.name}`
      });
    }
  });

  // 2. Termomagnéticos y Diferenciales por Circuito
  const breakerMap: Record<string, { count: number; spec: string; unitCost: number }> = {};
  const rcdMap: Record<string, { count: number; spec: string; unitCost: number }> = {};
  const wireMap: Record<string, { lengthM: number; spec: string; unitCost: number }> = {};
  const conduitMap: Record<string, { lengthM: number; spec: string; unitCost: number }> = {};

  (diag.circuits || []).forEach(c => {
    // Breaker aggregation
    const bKey = `${c.breakerRecommendedA}A_${c.breakerPoles}P_${c.breakerCurve}`;
    if (!breakerMap[bKey]) {
      const uCost = c.breakerPoles > 2 ? 85 : 45;
      breakerMap[bKey] = {
        count: 0,
        spec: `${c.breakerRecommendedA}A, ${c.breakerPoles} Polos, Curva ${c.breakerCurve}, Icu ${c.breakerBreakingKa || 6}kA`,
        unitCost: uCost
      };
    }
    breakerMap[bKey].count += 1;

    // RCD aggregation
    const rKey = `${c.rcdRecommendedA}A_${c.rcdSensitivityMa}mA_${c.rcdType}_${c.phases === 'TRIFASICO' ? '4P' : '2P'}`;
    if (!rcdMap[rKey]) {
      const uCost = c.phases === 'TRIFASICO' ? 180 : 110;
      rcdMap[rKey] = {
        count: 0,
        spec: `${c.rcdRecommendedA}A, Sensibilidad ${c.rcdSensitivityMa}mA, Tipo ${c.rcdType}, ${c.phases === 'TRIFASICO' ? '4 Polos' : '2 Polos'}`,
        unitCost: uCost
      };
    }
    rcdMap[rKey].count += 1;

    // Wire length calculation (Length * conductors count + ground + 10% safety margin)
    const conductorsPerCircuit = c.phases === 'TRIFASICO' ? 4 : 2; // + PE
    const totalWireForCircM = Math.ceil(c.lengthM * conductorsPerCircuit * 1.10);
    const wKey = `${c.wireSectionMm2}mm2_${c.wireMaterial}_${c.wireInsulation}`;
    if (!wireMap[wKey]) {
      let wirePricePerMeter = 3.50;
      if (c.wireSectionMm2 >= 25) wirePricePerMeter = 35.00;
      else if (c.wireSectionMm2 >= 16) wirePricePerMeter = 22.00;
      else if (c.wireSectionMm2 >= 10) wirePricePerMeter = 14.00;
      else if (c.wireSectionMm2 >= 6) wirePricePerMeter = 8.50;
      else if (c.wireSectionMm2 >= 4) wirePricePerMeter = 5.50;

      wireMap[wKey] = {
        lengthM: 0,
        spec: `Cable ${c.wireMaterial === 'COBRE' ? 'Cobre' : 'Aluminio'} ${c.wireInsulation} ${c.wireSectionMm2} mm² (750V/1000V Libre de Halógenos)`,
        unitCost: wirePricePerMeter
      };
    }
    wireMap[wKey].lengthM += totalWireForCircM;

    // Conduit aggregation
    const condKey = `${c.conduitType}_circ`;
    if (!conduitMap[condKey]) {
      conduitMap[condKey] = {
        lengthM: 0,
        spec: `Tubería y accesorios de canalización tipo ${c.conduitType}`,
        unitCost: 6.50
      };
    }
    conduitMap[condKey].lengthM += Math.ceil(c.lengthM * 1.10);
  });

  // Push Breakers
  Object.values(breakerMap).forEach(b => {
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Protecciones Termomagnéticas',
      description: `Interruptor Termomagnético Riel DIN`,
      quantity: b.count,
      unit: 'und',
      unitCostSoles: b.unitCost,
      totalCostSoles: b.count * b.unitCost,
      specification: b.spec,
      observation: 'Norma IEC 60898-1 / CNE Utilización'
    });
  });

  // Push RCDs
  Object.values(rcdMap).forEach(r => {
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Protecciones Diferenciales (RCD)',
      description: `Interruptor Diferencial para Protección Humana`,
      quantity: r.count,
      unit: 'und',
      unitCostSoles: r.unitCost,
      totalCostSoles: r.count * r.unitCost,
      specification: r.spec,
      observation: 'Protección contra contactos directos e indirectos (30mA)'
    });
  });

  // Push Wires
  Object.values(wireMap).forEach(w => {
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Conductores Eléctricos',
      description: `Conductor de Energía y Puesta a Tierra`,
      quantity: w.lengthM,
      unit: 'm',
      unitCostSoles: w.unitCost,
      totalCostSoles: w.lengthM * w.unitCost,
      specification: w.spec,
      observation: 'Cálculo por capacidad de corriente y caída de tensión'
    });
  });

  // Push Conduits
  Object.values(conduitMap).forEach(c => {
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Canalizaciones y Ductos',
      description: `Tubería de Protección y Enrutamiento`,
      quantity: c.lengthM,
      unit: 'm',
      unitCostSoles: c.unitCost,
      totalCostSoles: c.lengthM * c.unitCost,
      specification: c.spec,
      observation: 'Incluye curvas, uniones y abrazaderas'
    });
  });

  // 3. Puesta a Tierra
  (diag.grounding || []).forEach(g => {
    const rodCost = 180;
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Sistema de Puesta a Tierra (PAT)',
      description: `Electrodo de Puesta a Tierra (Varilla Cobre)`,
      quantity: g.electrodeCount || 1,
      unit: 'und',
      unitCostSoles: rodCost,
      totalCostSoles: (g.electrodeCount || 1) * rodCost,
      specification: `Varilla de ${g.electrodeMaterial === 'COBRE_ELECTROLITICO' ? 'Cobre Electrolítico 99.9%' : 'Copperweld'} 5/8" x ${g.electrodeLengthM || 2.4}m`,
      observation: `Pozo ubicado en ${g.location}`
    });

    const doseCost = 120;
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Sistema de Puesta a Tierra (PAT)',
      description: `Dosis de Tratamiento Químico Reductor de Resistividad`,
      quantity: (g.electrodeCount || 1) * 2,
      unit: 'dosis',
      unitCostSoles: doseCost,
      totalCostSoles: (g.electrodeCount || 1) * 2 * doseCost,
      specification: `Tratamiento ${g.treatmentChemical || g.soilTreatmentType || 'Gel Electrolítico Thor-Gel / San-Earth'}`,
      observation: 'Para estabilizar resistencia por debajo de 25 Ω'
    });

    const boxCost = 75;
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Sistema de Puesta a Tierra (PAT)',
      description: `Caja de Registro y Tapa para Pozo de Tierra`,
      quantity: g.electrodeCount || 1,
      unit: 'und',
      unitCostSoles: boxCost,
      totalCostSoles: (g.electrodeCount || 1) * boxCost,
      specification: 'Caja de concreto o PVC de alta resistencia con tapa rotulada',
      observation: 'Para inspección y medición periódica de protocolo'
    });
  });

  // 4. Iluminación Propuesta
  (diag.lighting || []).forEach(l => {
    const qty = l.recommendedLampCount || l.proposedQuantity || l.existingQuantity || 4;
    const isHighBay = (l.recommendedTech || '').includes('HIGH_BAY');
    const uCost = isHighBay ? 190 : (l.recommendedTech === 'LED_PANEL' ? 65 : 28);
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Iluminación Eficiente LED',
      description: `Luminaria LED para ${l.roomName}`,
      quantity: qty,
      unit: 'und',
      unitCostSoles: uCost,
      totalCostSoles: qty * uCost,
      specification: `${qty}x ${l.recommendedTech || 'LED'} (${l.recommendedLampPowerW || 40}W), CRI > 80, 50,000h vida útil`,
      observation: `Reemplazo de luminarias deficientes para cumplir RNE EM.010 (${l.requiredLuxRne || 500} lux)`
    });
  });

  // 5. Compensación Reactiva (Banco de Condensadores)
  if (diag.powerFactor && diag.powerFactor.requiredCapacitorKvar > 0) {
    const kvar = diag.powerFactor.requiredCapacitorKvar;
    const bankCost = diag.powerFactor.estimatedInvestmentSoles || kvar * 380 + 800;
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Compensación de Energía Reactiva',
      description: `Banco Automático de Condensadores por Pasos`,
      quantity: 1,
      unit: 'equipo',
      unitCostSoles: bankCost,
      totalCostSoles: bankCost,
      specification: `Potencia: ${kvar.toFixed(1)} kVAR, ${diag.tariff.supplyVoltage}V / 60Hz con regulador varimétrico y contactores de preinserción`,
      observation: 'Elimina penalidad por energía reactiva OSINERGMIN'
    });
  }

  // 6. Sistema Solar Fotovoltaico
  if (diag.solar && diag.solar.scenarioKwp > 0) {
    const panelCount = diag.solar.panelCount || 18;
    const panelCost = 620;
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Energía Solar Fotovoltaica',
      description: `Módulos Solares Fotovoltaicos Monocristalinos PERC`,
      quantity: panelCount,
      unit: 'und',
      unitCostSoles: panelCost,
      totalCostSoles: panelCount * panelCost,
      specification: `Panel Tier-1 de ${diag.solar.panelPowerW || 550}Wp con celda partida half-cell`,
      observation: 'Garantía de potencia de 25 años'
    });

    const inverterCost = Math.round((diag.solar.scenarioKwp || 10) * 850 + 1500);
    materials.push({
      id: `mat-${itemCounter++}`,
      category: 'Energía Solar Fotovoltaica',
      description: `Inversor Solar On-Grid / Autoconsumo`,
      quantity: 1,
      unit: 'und',
      unitCostSoles: inverterCost,
      totalCostSoles: inverterCost,
      specification: `Inversor de ${diag.solar.inverterPowerKw || diag.solar.scenarioKwp || 10} kW con doble seguidor MPPT`,
      observation: 'Monitoreo WiFi integrado'
    });
  }

  return materials;
}
