import * as XLSX from 'xlsx';
import { CompleteDiagnostic } from '../types';

export function exportDiagnosticToExcel(diag: CompleteDiagnostic) {
  const wb = XLSX.utils.book_new();

  // 1. Hoja: Datos Generales
  const generalRows = [
    { Campo: 'Nombre de la Instalación', Valor: diag.generalData.clientName || '' },
    { Campo: 'Razón Social / Propietario', Valor: diag.generalData.companyName || '' },
    { Campo: 'RUC', Valor: diag.generalData.ruc || '' },
    { Campo: 'Código de Diagnóstico', Valor: diag.generalData.diagnosticCode || '' },
    { Campo: 'Ubicación / Dirección', Valor: diag.generalData.address || '' },
    { Campo: 'Ciudad / Departamento', Valor: `${diag.generalData.city || ''} / ${diag.generalData.department || ''}` },
    { Campo: 'Tipo de Instalación', Valor: diag.generalData.installationType || '' },
    { Campo: 'Nivel de Tensión Nominal (V)', Valor: diag.tariff?.supplyVoltage || 220 },
    { Campo: 'Sistema de Fases', Valor: diag.tariff?.phases || 'TRIFASICO' },
    { Campo: 'Suministrador Eléctrico', Valor: diag.tariff?.distributor || 'Luz del Sur / Enel' },
    { Campo: 'Opción Tarifaria Actual', Valor: diag.tariff?.tariffCode || 'BT5A' },
    { Campo: 'Precio Energía Activa (S/./kWh)', Valor: diag.tariff?.activeEnergyPriceKwh || 0.74 },
    { Campo: 'Ingeniero Responsable CIP', Valor: diag.generalData.responsibleEngineer || '' },
    { Campo: 'Número de Colegiatura CIP', Valor: diag.generalData.cipNumber || '' },
    { Campo: 'Fecha de Inspección', Valor: diag.generalData.date || '' }
  ];
  const wsGeneral = XLSX.utils.json_to_sheet(generalRows);
  XLSX.utils.book_append_sheet(wb, wsGeneral, 'Datos Generales');

  // 2. Hoja: Censo de Cargas
  if (diag.equipment && diag.equipment.length > 0) {
    const equipRows = diag.equipment.map((eq, i) => {
      const powerKw = eq.powerUnit === 'HP' ? (eq.power * 0.746) : (eq.powerUnit === 'W' ? eq.power / 1000 : eq.power);
      const totalKw = powerKw * (eq.quantity || 1);
      const monthlyHours = (eq.hoursPerDay || 0) * (eq.daysPerWeek || 6) * (eq.weeksPerMonth || 4.33);
      const kwhMonth = eq.monthlyKwh ?? (totalKw * monthlyHours * (eq.loadFactor || 0.8));
      const costMonth = eq.monthlyCostSoles ?? (kwhMonth * (diag.tariff?.activeEnergyPriceKwh || 0.74));

      return {
        'N°': i + 1,
        'Nombre del Equipo / Máquina': eq.name,
        'Categoría': eq.category,
        'Área / Ubicación': eq.areaTag || '',
        'Cantidad': eq.quantity,
        'Potencia Nominal': eq.power,
        'Unidad': eq.powerUnit,
        'Potencia Total (kW)': Number(totalKw.toFixed(2)),
        'Horas/Día': eq.hoursPerDay,
        'Días/Semana': eq.daysPerWeek,
        'Factor Carga': eq.loadFactor || 0.8,
        'Consumo (kWh/mes)': Number(kwhMonth.toFixed(1)),
        'Gasto Mensual (S/.)': Number(costMonth.toFixed(2)),
        'Estado Operativo': eq.state || 'OPERATIVO_OPTIMO'
      };
    });
    const wsEquip = XLSX.utils.json_to_sheet(equipRows);
    XLSX.utils.book_append_sheet(wb, wsEquip, 'Censo de Cargas');
  }

  // 3. Hoja: Histórico de Recibos
  if (diag.receipts && diag.receipts.length > 0) {
    const receiptsRows = diag.receipts.map(r => ({
      'Año': r.year,
      'Mes': r.month,
      'Consumo Eléctrico (kWh)': r.kwhConsumed,
      'Importe Facturado (S/.)': r.costSoles,
      'Costo Medio (S/./kWh)': r.kwhConsumed > 0 ? Number((r.costSoles / r.kwhConsumed).toFixed(4)) : 0,
      'Demanda Máx (kW)': r.maxDemandKw || 0,
      'Energía Reactiva (kvarh)': r.reactiveEnergyKvarh || 0,
      'Factor de Potencia (cos φ)': r.powerFactor || 0,
      'Observaciones': r.observations || ''
    }));
    const wsReceipts = XLSX.utils.json_to_sheet(receiptsRows);
    XLSX.utils.book_append_sheet(wb, wsReceipts, 'Recibos Facturación');
  }

  // 4. Hoja: Tableros y Circuitos (CNE)
  if (diag.circuits && diag.circuits.length > 0) {
    const circuitRows = diag.circuits.map(c => ({
      'Código Circuito': c.circuitCode,
      'Descripción / Destino': c.description,
      'Tablero': c.panelId || 'TG-01',
      'Carga Conectada (W)': c.connectedPowerW,
      'Fases': c.phases,
      'Tensión (V)': c.voltage,
      'Longitud (m)': c.lengthM || 10,
      'Sección Conductor (mm²)': c.wireSectionMm2,
      'Termomagnético ITM (A)': c.breakerExistingA || c.breakerRecommendedA,
      'Diferencial ID (mA)': c.rcdSensitivityMa || 30,
      'Caída Tensión (%)': c.voltageDropPercent ? Number(c.voltageDropPercent.toFixed(2)) : 0,
      'Cumplimiento Conductor': c.wireStatus
    }));
    const wsCircuits = XLSX.utils.json_to_sheet(circuitRows);
    XLSX.utils.book_append_sheet(wb, wsCircuits, 'Tableros y Circuitos');
  }

  // 5. Hoja: Luminarias (RNE EM.010)
  if (diag.lighting && diag.lighting.length > 0) {
    const lightRows = diag.lighting.map(l => ({
      'Ambiente / Local': l.roomName,
      'Área (m²)': l.areaM2 || 0,
      'Tecnología Actual': l.currentTech || 'FLUORESCENTE_T8',
      'Lámparas / Equipos': l.currentLampCount || 0,
      'Potencia Total (W)': l.currentTotalPowerW || 0,
      'Lux Medido': l.measuredLux || 0,
      'Lux Mínimo Norma RNE': l.requiredLuxRne || 300,
      'Cumplimiento Lux': (l.measuredLux || 0) >= (l.requiredLuxRne || 300) ? 'CONFORME' : 'DEFICIENTE',
      'Tecnología Recomendada': l.recommendedTech || 'LED_TUBULAR'
    }));
    const wsLight = XLSX.utils.json_to_sheet(lightRows);
    XLSX.utils.book_append_sheet(wb, wsLight, 'Iluminación RNE');
  }

  // 6. Hoja: Pozo a Tierra (PAT / INDECI)
  if (diag.grounding && diag.grounding.length > 0) {
    const groundRows = diag.grounding.map(g => ({
      'Código Pozo': g.code || 'PAT-01',
      'Ubicación': g.location,
      'Resistencia Medida (Ω)': g.measuredResistanceOhm,
      'Límite CNE (Ω)': g.maxTargetResistanceOhm || 25,
      'Estado CNE / INDECI': g.measuredResistanceOhm <= (g.maxTargetResistanceOhm || 25) ? 'APROBADO' : 'OBSERVADO',
      'Tipo Electrodo': g.electrodeType || 'VARILLA_VERTICAL',
      'Tratamiento Químico': g.soilTreatmentType || 'GEL_ELECTROLITICO'
    }));
    const wsGround = XLSX.utils.json_to_sheet(groundRows);
    XLSX.utils.book_append_sheet(wb, wsGround, 'Puesta a Tierra');
  }

  // 7. Hoja: Oportunidades y Plan de Ahorro
  if (diag.opportunities && diag.opportunities.length > 0) {
    const oppRows = diag.opportunities.map(op => ({
      'Medida de Eficiencia': op.title,
      'Categoría': op.category,
      'Descripción Técnica': op.description,
      'Inversión Estimada (S/.)': op.estimatedInvestmentSoles,
      'Ahorro Anual Estimado (S/.)': op.annualSavingsSoles,
      'Payback Retorno (Años)': op.paybackYears,
      'Prioridad': op.priority
    }));
    const wsOpp = XLSX.utils.json_to_sheet(oppRows);
    XLSX.utils.book_append_sheet(wb, wsOpp, 'Plan de Ahorro');
  }

  // Descargar archivo Excel
  const code = diag.generalData.diagnosticCode || 'E-DIAGNOSIS';
  const fileName = `${code}_Auditoria_Energetica_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportBomToExcel(items: any[], projectCode: string) {
  const wb = XLSX.utils.book_new();
  const rows: Record<string, any>[] = items.map((item, idx) => ({
    'N°': idx + 1,
    'Código': item.itemCode || `MAT-${String(idx + 1).padStart(3, '0')}`,
    'Categoría': item.category,
    'Descripción Técnica y Normativa CNE': item.description,
    'Unidad': item.unit,
    'Cantidad': item.quantity,
    'Precio Unitario (S/.)': item.unitCostSoles || item.unitPriceSoles || 0,
    'Subtotal (S/.)': item.totalCostSoles || item.totalPriceSoles || 0,
    'Norma de Referencia': item.specification || 'CNE / IEC / NTP'
  }));

  const total = items.reduce((sum, item) => sum + (item.totalCostSoles || item.totalPriceSoles || 0), 0);
  rows.push({
    'N°': '',
    'Código': '',
    'Categoría': '',
    'Descripción Técnica y Normativa CNE': 'COSTO TOTAL ESTIMADO (S/.):',
    'Unidad': '',
    'Cantidad': 0,
    'Precio Unitario (S/.)': 0,
    'Subtotal (S/.)': total,
    'Norma de Referencia': ''
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Lista de Materiales BOM');
  XLSX.writeFile(wb, `BOM_Materiales_${projectCode || 'E-DIAGNOSIS'}.xlsx`);
}
