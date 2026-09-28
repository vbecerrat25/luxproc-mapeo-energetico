// Deterministic Energy Savings Opportunities Engine
import { CompleteDiagnostic, SavingsOpportunity } from '../types';
import { evaluatePeruvianTariffs } from './calculosTarifas';

export function generateSavingsOpportunities(diag: CompleteDiagnostic): SavingsOpportunity[] {
  const opportunities: SavingsOpportunity[] = [];
  const tariffRate = diag.tariff?.activeEnergyPriceKwh || 0.75;

  // 0. Peruvian Tariff Migration Opportunity (OSINERGMIN)
  const tariffEval = evaluatePeruvianTariffs(diag);
  if (tariffEval.isMigrationRecommended && tariffEval.annualSavingsSoles > 100) {
    opportunities.push({
      id: 'opp-tariff-opt-1',
      problem: `Tarifa eléctrica actual (${tariffEval.currentTariffCode}) no aprovecha la estructura óptima de costos para el perfil de demanda y consumo de la instalación.`,
      recommendedAction: `Gestionar ante ${diag.tariff?.distributor || 'la Concesionaria Eléctrica'} el cambio a ${tariffEval.recommendedTariffCode}. ${tariffEval.primaryExplanation}`,
      estimatedInvestmentSoles: 180, // Administrative fee / meter change inspection
      annualSavingsKwh: 0, // Economic tariff restructuring
      annualSavingsSoles: tariffEval.annualSavingsSoles,
      paybackMonths: Number(((180 / (tariffEval.annualSavingsSoles / 12))).toFixed(1)),
      priority: 'ALTA',
      category: 'GESTION_TARIFARIA',
      implemented: false
    });
  }

  // 1. Power Factor Compensation Opportunity
  if (diag.powerFactor && (diag.powerFactor.currentPowerFactor ?? 0.85) < 0.96) {
    const currentFp = diag.powerFactor.currentPowerFactor ?? 0.85;
    const annualPenalty = diag.powerFactor.annualSavingsSoles || 0;
    const inv = diag.powerFactor.estimatedInvestmentSoles || 2800;
    const payback = annualPenalty > 0 ? Number(((inv / (annualPenalty / 12))).toFixed(1)) : 12;

    opportunities.push({
      id: 'opp-fp-1',
      problem: `Factor de potencia deficiente (${currentFp.toFixed(2)} < 0.96), generando recargos por energía reactiva inductiva en la facturación eléctrica.`,
      recommendedAction: `Instalar banco automático de condensadores de ${diag.powerFactor.requiredCapacitorKvar || 6.0} kVAR (${diag.powerFactor.suggestedStepsCount || 3} pasos) con controlador digital.`,
      estimatedInvestmentSoles: inv,
      annualSavingsKwh: 0, // Saves penalty and reduces line I²R losses
      annualSavingsSoles: annualPenalty > 0 ? annualPenalty : 1400,
      paybackMonths: payback,
      priority: 'ALTA',
      category: 'FACTOR_POTENCIA',
      implemented: false
    });
  }

  // 2. Lighting Efficiency Retrofit
  const totalLightingKwhYear = (diag.lighting || []).reduce((acc, l) => acc + ((l.monthlyKwh || ((l.currentTotalPowerW || l.currentLampCount * l.currentLampPowerW || 100) * (l.dailyHours || 8) * 26 / 1000)) * 12), 0);
  const totalLightingPowerW = (diag.lighting || []).reduce((acc, l) => acc + (l.currentTotalPowerW || (l.currentLampCount * l.currentLampPowerW) || 100), 0);
  const totalLightingArea = (diag.lighting || []).reduce((acc, l) => acc + (l.areaM2 || 20), 0);
  const avgDensity = totalLightingArea > 0 ? totalLightingPowerW / totalLightingArea : 0;

  if (avgDensity > 8 || totalLightingKwhYear > 1500) {
    const savingsKwh = totalLightingKwhYear * 0.40; // 40% reduction with high efficiency LEDs
    const annualSavings = savingsKwh * tariffRate;
    const fixtureCount = (diag.lighting || []).reduce((acc, l) => acc + (l.recommendedLampCount || l.currentLampCount || 6), 0);
    const estimatedInv = fixtureCount * 120 + 400; // S/. 120 per fixture + installation
    const payback = annualSavings > 0 ? Number(((estimatedInv / (annualSavings / 12))).toFixed(1)) : 10;

    opportunities.push({
      id: 'opp-light-1',
      problem: `Luminarias convencionales o de tecnología anterior generan alto consumo y densidad de potencia (${avgDensity.toFixed(1)} W/m²).`,
      recommendedAction: `Reemplazar por luminarias LED de alta eficacia (≥120 lm/W) con óptica dirigida y distribución fotométrica optimizada por retícula.`,
      estimatedInvestmentSoles: Number(estimatedInv.toFixed(2)),
      annualSavingsKwh: Number(savingsKwh.toFixed(2)),
      annualSavingsSoles: Number(annualSavings.toFixed(2)),
      paybackMonths: payback,
      priority: 'ALTA',
      category: 'ILUMINACION',
      implemented: false
    });
  }

  // 3. Footwear / Industry Compressed Air Leaks
  const compressors = (diag.equipment || []).filter(e => 
    (e.category || '').toLowerCase().includes('compresor') || 
    (e.name || '').toLowerCase().includes('compresor')
  );

  if (compressors.length > 0) {
    const compKwhYear = compressors.reduce((acc, c) => {
      const w = (c.powerUnit === 'HP' ? c.power * 746 : (c.powerUnit === 'kW' ? c.power * 1000 : c.power));
      return acc + ((w / 1000) * c.quantity * (c.loadFactor || 0.8) * c.hoursPerDay * c.daysPerWeek * 52);
    }, 0);

    const leakSavingsKwh = compKwhYear * 0.25; // 25% waste from leaks & unregulated pressure
    const annualSavingsSoles = leakSavingsKwh * tariffRate;
    const inv = 850; // ultrasonic inspection and pneumatic fittings repair

    opportunities.push({
      id: 'opp-comp-1',
      problem: `Pérdidas de aire comprimido en acoples neumáticos, válvulas desgastadas y presión de línea excesiva en línea de producción.`,
      recommendedAction: `Realizar detección ultrasónica de fugas, reemplazo de racores rápidos, mantenimiento de purgadores automáticos y ajuste de presostato a 6.5 bar.`,
      estimatedInvestmentSoles: inv,
      annualSavingsKwh: Number(leakSavingsKwh.toFixed(2)),
      annualSavingsSoles: Number(annualSavingsSoles.toFixed(2)),
      paybackMonths: Number(((inv / (annualSavingsSoles / 12))).toFixed(1)),
      priority: 'ALTA',
      category: 'FUGAS_COMPRESOR',
      implemented: false
    });
  }

  // 4. Solar Photovoltaic Self-Consumption
  if (diag.solar && (diag.solar.annualCostSavingsSoles || diag.solar.annualSavingsSoles || 0) > 0) {
    const annualSavings = diag.solar.annualCostSavingsSoles || diag.solar.annualSavingsSoles || 3600;
    const inv = diag.solar.estimatedTurnkeyCostSoles || diag.solar.estimatedInvestmentSoles || 18000;
    const paybackYears = diag.solar.paybackYears ?? (annualSavings > 0 ? inv / annualSavings : 3.5);
    opportunities.push({
      id: 'opp-solar-1',
      problem: `Dependencia 100% de la red eléctrica con costos crecientes por energía activa facturada.`,
      recommendedAction: `Instalar sistema solar fotovoltaico on-grid de ${diag.solar.scenarioKwp || 5} kWp (${diag.solar.panelCount || 10} módulos de ${diag.solar.panelWattageW || diag.solar.panelPowerW || 550}W) sobre techo.`,
      estimatedInvestmentSoles: inv,
      annualSavingsKwh: diag.solar.annualGenerationKwh || 7500,
      annualSavingsSoles: annualSavings,
      paybackMonths: Number(((paybackYears || 3.5) * 12).toFixed(1)),
      priority: 'MEDIA',
      category: 'SOLAR',
      implemented: false
    });
  }

  // 5. Electric Water Heater (Terma) Timer (Vivienda/Comercio)
  const termas = (diag.equipment || []).filter(e => 
    (e.category || '').toLowerCase().includes('terma') || 
    (e.name || '').toLowerCase().includes('terma')
  );

  if (termas.length > 0) {
    const termaKwhYear = termas.reduce((acc, t) => {
      const w = (t.powerUnit === 'HP' ? t.power * 746 : (t.powerUnit === 'kW' ? t.power * 1000 : t.power));
      return acc + ((w / 1000) * t.quantity * t.hoursPerDay * 365);
    }, 0);

    const savingsKwh = termaKwhYear * 0.35; // 35% savings with digital programmable timer / smart relay
    const annualSavingsSoles = savingsKwh * tariffRate;
    const inv = 180;

    opportunities.push({
      id: 'opp-terma-1',
      problem: `Terma eléctrica encendida 24 horas continuas con pérdidas térmicas por re-calentamiento en reposo.`,
      recommendedAction: `Instalar temporizador horario digital o interruptor inteligente programado exclusivamente 1.5 horas antes de los horarios habituales de ducha.`,
      estimatedInvestmentSoles: inv,
      annualSavingsKwh: Number(savingsKwh.toFixed(2)),
      annualSavingsSoles: Number(annualSavingsSoles.toFixed(2)),
      paybackMonths: Number(((inv / (annualSavingsSoles / 12))).toFixed(1)),
      priority: 'ALTA',
      category: 'HABITOS',
      implemented: false
    });
  }

  // 6. Motors VFD / Speed Control
  const heavyMotors = (diag.equipment || []).filter(e => 
    ((e.category || '').toLowerCase().includes('motor') || (e.category || '').toLowerCase().includes('extractor') || (e.category || '').toLowerCase().includes('bomba')) &&
    e.hoursPerDay >= 6
  );

  if (heavyMotors.length > 0) {
    const motorKwhYear = heavyMotors.reduce((acc, m) => {
      const w = (m.powerUnit === 'HP' ? m.power * 746 : (m.powerUnit === 'kW' ? m.power * 1000 : m.power));
      return acc + ((w / 1000) * m.quantity * (m.loadFactor || 0.8) * m.hoursPerDay * m.daysPerWeek * 52);
    }, 0);

    const savingsKwh = motorKwhYear * 0.18;
    const annualSavingsSoles = savingsKwh * tariffRate;
    const inv = 2400;

    opportunities.push({
      id: 'opp-motor-1',
      problem: `Motores y extractores operando a velocidad fija constante sin regulación según la demanda de proceso.`,
      recommendedAction: `Instalar variador de frecuencia (VFD) con control PID para modular caudal de aire y velocidad según carga de trabajo.`,
      estimatedInvestmentSoles: inv,
      annualSavingsKwh: Number(savingsKwh.toFixed(2)),
      annualSavingsSoles: Number(annualSavingsSoles.toFixed(2)),
      paybackMonths: Number(((inv / (annualSavingsSoles / 12))).toFixed(1)),
      priority: 'MEDIA',
      category: 'MOTORES',
      implemented: false
    });
  }

  return opportunities;
}
