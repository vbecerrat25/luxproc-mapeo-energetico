// Base Normativa y Criterios Técnicos Parametrizados (CNE / RNE / IEC / IEEE)
import { NormativeParameter } from '../types';

export const DEFAULT_NORMATIVE_PARAMETERS: NormativeParameter[] = [
  {
    id: 'norm-1',
    standard: 'Código Nacional de Electricidad (CNE Utilización 050-102)',
    code: 'CNE-U-050-102',
    parameterName: 'Caída de Tensión Máxima en Alimentadores',
    value: 2.5,
    unit: '%',
    description: 'La caída de tensión en el alimentador principal desde el medidor hasta el tablero general no debe superar el 2.5% de la tensión nominal.',
    source: 'Regla 050-102 (1) (a) CNE Utilización',
    updatedDate: '2026-01-15'
  },
  {
    id: 'norm-2',
    standard: 'Código Nacional de Electricidad (CNE Utilización 050-102)',
    code: 'CNE-U-050-102-2',
    parameterName: 'Caída de Tensión Máxima Total (Alimentador + Circuito Derivado)',
    value: 4.0,
    unit: '%',
    description: 'La caída de tensión combinada desde el punto de entrega hasta el punto de utilización más alejado no debe exceder el 4.0%.',
    source: 'Regla 050-102 (1) (b) CNE Utilización',
    updatedDate: '2026-01-15'
  },
  {
    id: 'norm-3',
    standard: 'CNE Utilización / CNE Suministro (Regla 060-712)',
    code: 'CNE-U-060-712',
    parameterName: 'Resistencia Máxima de Puesta a Tierra en Baja Tensión',
    value: 25.0,
    unit: 'Ω',
    description: 'El valor máximo admisible para electrodos de puesta a tierra en baja tensión es de 25 ohmios. Para subestaciones y centros de cómputo se recomienda ≤15Ω o ≤5Ω.',
    source: 'CNE Utilización Regla 060-712 / IEEE Std 142',
    updatedDate: '2026-01-15'
  },
  {
    id: 'norm-4',
    standard: 'CNE Utilización (Regla 020-132)',
    code: 'CNE-U-020-132',
    parameterName: 'Sensibilidad Máxima de Interruptor Diferencial para Personas',
    value: 30,
    unit: 'mA',
    description: 'Los interruptores diferenciales para protección contra choque eléctrico de personas en circuitos de iluminación y tomacorrientes deben tener una sensibilidad máxima no mayor a 30 mA.',
    source: 'Regla 020-132 CNE Utilización / IEC 61008',
    updatedDate: '2026-01-15'
  },
  {
    id: 'norm-5',
    standard: 'OSINERGMIN / Procedimiento de Tarifación Eléctrica',
    code: 'OSINERGMIN-FP',
    parameterName: 'Factor de Potencia Límite de Calificación sin Penalidad',
    value: 0.96,
    unit: 'cos φ',
    description: 'Las empresas distribuidoras en Perú facturan penalidad por energía reactiva cuando el factor de potencia mensual es inferior a 0.96.',
    source: 'Resolución OSINERGMIN N° 206-2013-OS/CD',
    updatedDate: '2026-01-15'
  },
  {
    id: 'norm-6',
    standard: 'Reglamento Nacional de Edificaciones (RNE EM.010)',
    code: 'RNE-EM010-LUX-APARADO',
    parameterName: 'Iluminancia Mínima en Costura de Precisión / Aparado de Calzado',
    value: 600,
    unit: 'lux',
    description: 'Nivel mínimo de iluminancia en el plano de trabajo para tareas visuales de contraste medio-bajo y costura de calzado.',
    source: 'RNE Norma EM.010 Instalaciones Interiores / ISO 8995',
    updatedDate: '2026-01-15'
  },
  {
    id: 'norm-7',
    standard: 'Reglamento Nacional de Edificaciones (RNE EM.010)',
    code: 'RNE-EM010-LUX-CORTE',
    parameterName: 'Iluminancia Mínima en Corte de Pieles e Inspección',
    value: 750,
    unit: 'lux',
    description: 'Nivel de iluminación en áreas de corte y control de calidad final de calzado y marroquinería.',
    source: 'RNE Norma EM.010 Tabla de Iluminancia',
    updatedDate: '2026-01-15'
  }
];
