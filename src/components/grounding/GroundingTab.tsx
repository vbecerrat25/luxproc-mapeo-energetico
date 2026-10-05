import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { GroundingWellRecord, SoilType, GroundingTreatment } from '../../types';
import { MetricCard } from '../shared/MetricCard';
import { TrafficBadge } from '../shared/TrafficBadge';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  X
} from 'lucide-react';

export const GroundingTab: React.FC = () => {
  const {
    diagnostic,
    addGroundingWell,
    updateGroundingWell,
    deleteGroundingWell
  } = useDiagnostic();
  const { language } = useLanguage();

  const tr = (es: string, en: string, pt: string) =>
    language === 'en' ? en : language === 'pt' ? pt : es;

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const SOIL_RESISTIVITIES: { label: string; value: SoilType; rho: number }[] = [
    {
      label: tr('Terreno de cultivo / Humus húmedo (30 Ω·m)', 'Farmland / Wet humus (30 Ω·m)', 'Solo agrícola / Húmus úmido (30 Ω·m)'),
      value: 'ARCILLOSO_HUMEDO',
      rho: 30
    },
    {
      label: tr('Arcilla compacta / Limo (50 Ω·m)', 'Compact clay / Silt (50 Ω·m)', 'Argila compacta / Silte (50 Ω·m)'),
      value: 'ARCILLOSO_HUMEDO',
      rho: 50
    },
    {
      label: tr('Tierra negra de jardín (70 Ω·m)', 'Black garden soil (70 Ω·m)', 'Terra preta de jardim (70 Ω·m)'),
      value: 'TIERRA_CULTIVO',
      rho: 70
    },
    {
      label: tr('Suelo arenoso húmedo / Costa (100 Ω·m)', 'Wet sandy soil / Coast (100 Ω·m)', 'Solo arenoso úmido / Litoral (100 Ω·m)'),
      value: 'ARENOSO_HUMEDO',
      rho: 100
    },
    {
      label: tr('Suelo arenoso seco (250 Ω·m)', 'Dry sandy soil (250 Ω·m)', 'Solo arenoso seco (250 Ω·m)'),
      value: 'ARENOSO_SECO',
      rho: 250
    },
    {
      label: tr('Cascajo / Grava / Relleno pedregoso (500 Ω·m)', 'Gravel / Rocky fill (500 Ω·m)', 'Cascalho / Brita / Aterro pedregoso (500 Ω·m)'),
      value: 'PEDREGOSO_CASCAJO',
      rho: 500
    },
    {
      label: tr('Roca granítica / Desértica (1000 Ω·m)', 'Granite / Desert rock (1000 Ω·m)', 'Rocha granítica / Desértica (1000 Ω·m)'),
      value: 'ROCA_GRANITO',
      rho: 1000
    }
  ];

  const [formState, setFormState] = useState<Omit<GroundingWellRecord, 'id'>>({
    code: 'PAT-01',
    location: 'Patio Posterior / Ingreso',
    systemType: 'POZO_VERTICAL',
    soilType: 'ARENOSO_HUMEDO',
    soilResistivityOhmM: 100,
    electrodeMaterial: 'COBRE_ELECTROLITICO',
    electrodeLengthM: 2.4,
    electrodeDiameterMm: 16.0,
    treatmentChemical: 'THORGEL',
    treatmentDate: new Date().toISOString().split('T')[0],
    measuredResistanceOhm: 14.5,
    calculatedTheoreticalResistanceOhm: 12.8,
    requiredMaxResistanceOhm: 25.0,
    complianceStatus: 'ADECUADO',
    conductorSectionMm2: 25.0,
    boxCondition: 'BUENO',
    electrodeCondition: 'BUENO',
    observations: 'Conexión exotérmica cadweld en buen estado'
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormState({
      code: `PAT-${String(diagnostic.grounding.length + 1).padStart(2, '0')}`,
      location: tr('Patio Posterior', 'Rear Yard', 'Pátio Posterior'),
      systemType: 'POZO_VERTICAL',
      soilType: 'ARENOSO_HUMEDO',
      soilResistivityOhmM: 100,
      electrodeMaterial: 'COBRE_ELECTROLITICO',
      electrodeLengthM: 2.4,
      electrodeDiameterMm: 16.0,
      treatmentChemical: 'THORGEL',
      treatmentDate: new Date().toISOString().split('T')[0],
      measuredResistanceOhm: 12.0,
      calculatedTheoreticalResistanceOhm: 11.5,
      requiredMaxResistanceOhm: 25.0,
      complianceStatus: 'ADECUADO',
      conductorSectionMm2: 25.0,
      boxCondition: 'BUENO',
      electrodeCondition: 'BUENO',
      observations: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (gw: GroundingWellRecord) => {
    setEditingId(gw.id);
    setFormState({
      code: gw.code || gw.id || 'PAT-01',
      location: gw.location || '',
      systemType: (gw.systemType || gw.electrodeType || 'POZO_VERTICAL') as any,
      soilType: (gw.soilType as any) || 'ARENOSO_HUMEDO',
      soilResistivityOhmM: gw.soilResistivityOhmM || gw.measuredSoilResistivityOhmM || 50,
      electrodeMaterial: gw.electrodeMaterial || 'COBRE_ELECTROLITICO',
      electrodeLengthM: gw.electrodeLengthM || 2.4,
      electrodeDiameterMm: gw.electrodeDiameterMm || 16,
      treatmentChemical: (gw.treatmentChemical || (gw.soilTreatmentType as any) || 'NINGUNO') as any,
      treatmentDate: gw.treatmentDate || gw.measurementDate || '',
      measuredResistanceOhm: gw.measuredResistanceOhm ?? gw.calculatedTheoreticalResistanceOhm ?? 15,
      calculatedTheoreticalResistanceOhm: gw.calculatedTheoreticalResistanceOhm || 15,
      requiredMaxResistanceOhm: gw.requiredMaxResistanceOhm || gw.maxTargetResistanceOhm || 25,
      complianceStatus: gw.complianceStatus || 'ADECUADO',
      conductorSectionMm2: gw.conductorSectionMm2 || gw.groundConductorGaugeMm2 || 16,
      boxCondition: (gw.boxCondition as any) || 'BUENO',
      electrodeCondition: (gw.electrodeCondition as any) || 'BUENO',
      observations: gw.observations || gw.maintenanceNotes || ''
    });
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateGroundingWell(editingId, formState);
    } else {
      addGroundingWell(formState);
    }
    setShowAddModal(false);
  };

  const bestWell = (diagnostic.grounding || [])[0];
  const currentR = bestWell?.measuredResistanceOhm ?? bestWell?.calculatedTheoreticalResistanceOhm ?? 0;
  const isCneCompliant = currentR > 0 && currentR <= 25.0;

  const handleSimulateMaintenance = (wellId: string) => {
    const well = (diagnostic.grounding || []).find(w => w.id === wellId);
    if (!well) return;
    const origR = well.measuredResistanceOhm ?? well.calculatedTheoreticalResistanceOhm ?? 25;
    const improvedR = Number((origR * 0.45).toFixed(1));
    updateGroundingWell(wellId, {
      measuredResistanceOhm: improvedR,
      treatmentChemical: 'THORGEL',
      soilTreatmentType: 'THORGEL',
      complianceStatus: improvedR <= 25.0 ? 'ADECUADO' : 'REVISAR',
      observations: tr(
        `Tratamiento químico simulado: Dosis de Thor-Gel / Gel electrolítico. Resistencia reducida a ${improvedR} Ω`,
        `Simulated chemical treatment: Thor-Gel / Electrolytic gel dosage. Resistance reduced to ${improvedR} Ω`,
        `Tratamento químico simulado: Dose de Thor-Gel / Gel eletrolítico. Resistência reduzida para ${improvedR} Ω`
      )
    });
    setToastMessage(
      tr(
        `¡Simulación aplicada! La resistencia del pozo ${well.code || well.id} disminuyó de ${origR} Ω a ${improvedR} Ω.`,
        `Simulation applied! Grounding pit ${well.code || well.id} resistance decreased from ${origR} Ω to ${improvedR} Ω.`,
        `Simulação aplicada! A resistência do poço ${well.code || well.id} diminuiu de ${origR} Ω para ${improvedR} Ω.`
      )
    );
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {toastMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            {tr(
              'Sistema de Puesta a Tierra (PAT) y Protección Contra Contactos Indirectos',
              'Grounding System (PAT) & Indirect Contact Protection',
              'Sistema de Aterramento (SPDA/PAT) e Proteção Contra Contatos Indiretos'
            )}
          </h2>
          <p className="text-xs text-slate-500">
            {tr(
              'Cálculo por fórmula Dwight/IEEE 80, resistividad aparente del terreno, tratamiento con gel y protocolo de medición CNE',
              'Dwight/IEEE 80 formula calculation, apparent soil resistivity, chemical gel treatment, and CNE measurement protocol',
              'Cálculo pela fórmula Dwight/IEEE 80, resistividade aparente do solo, tratamento com gel e protocolo de medição'
            )}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>{tr('+ Pozo a Tierra', '+ Grounding Pit', '+ Poço de Aterramento')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title={tr('Resistencia Medida PAT', 'Measured PAT Resistance', 'Resistência Medida PAT')}
          value={currentR.toFixed(1)}
          unit="Ω"
          subtitle={`${tr('Límite CNE:', 'CNE Limit:', 'Limite CNE:')} ≤ ${bestWell?.requiredMaxResistanceOhm || bestWell?.maxTargetResistanceOhm || 25} Ω`}
          highlightColor={isCneCompliant ? 'emerald' : 'rose'}
          icon={<ShieldAlert size={18} />}
        />
        <MetricCard
          title={tr('Pozos en la Instalación', 'Facility Grounding Pits', 'Poços na Instalação')}
          value={(diagnostic.grounding || []).length}
          subtitle={tr('Red equipotencial enlazada', 'Bonded equipotential network', 'Malha equipotencial interligada')}
          highlightColor="indigo"
          icon={<Layers size={18} />}
        />
        <MetricCard
          title={tr('Resistividad de Terreno', 'Soil Resistivity', 'Resistividade do Solo')}
          value={bestWell?.soilResistivityOhmM || bestWell?.measuredSoilResistivityOhmM || 100}
          unit="Ω·m"
          subtitle={bestWell?.soilType || tr('Arenoso / Arcilloso', 'Sandy / Clay', 'Arenoso / Argiloso')}
          highlightColor="blue"
        />
        <MetricCard
          title={tr('Estado Normativo CNE', 'CNE Regulatory Status', 'Estado Normativo CNE')}
          value={isCneCompliant ? tr('CONFORME', 'COMPLIANT', 'CONFORME') : tr('NO CONFORME', 'NON-COMPLIANT', 'NÃO CONFORME')}
          subtitle={isCneCompliant ? tr('Apto para ITSE / INDECI', 'Ready for ITSE / Safety Audit', 'Apto para Inspeção Técnica') : tr('Requiere Mantenimiento', 'Requires Maintenance', 'Requer Manutenção')}
          highlightColor={isCneCompliant ? 'emerald' : 'rose'}
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      {/* Technical Standards Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {tr(
                'Límites Normativos de Resistencia de Puesta a Tierra (Perú)',
                'Regulatory Grounding Resistance Limits (Peru CNE)',
                'Limites Normativos de Resistência de Aterramento (CNE)'
              )}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500 font-mono">{tr('CNE Regla 060-712', 'CNE Rule 060-712', 'CNE Regra 060-712')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="font-bold text-slate-900">{tr('Baja Tensión General', 'General Low Voltage', 'Baixa Tensão Geral')}</div>
            <div className="font-mono text-base font-black text-amber-700 mt-1">R ≤ 25.0 Ω</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {tr(
                'Tableros generales, maquinarias convencionales y viviendas residenciales.',
                'Main switchboards, conventional machinery, and residential dwellings.',
                'Quadros gerais, máquinas convencionais e residências.'
              )}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="font-bold text-slate-900">{tr('Equipos Electrónicos / Cómputo', 'Electronic / IT Equipment', 'Equipamentos Eletrônicos / TI')}</div>
            <div className="font-mono text-base font-black text-blue-700 mt-1">R ≤ 10.0 Ω</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {tr(
                'Servidores, máquinas CNC de calzado, PLC, autómatas y UPS dedicados.',
                'Servers, CNC footwear machinery, PLCs, controllers, and dedicated UPS systems.',
                'Servidores, máquinas CNC, CLPs, controladores e sistemas UPS dedicados.'
              )}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="font-bold text-slate-900">{tr('Subestaciones / Descargas Atmosféricas', 'Substations / Lightning Protection', 'Subestações / Descargas Atmosféricas')}</div>
            <div className="font-mono text-base font-black text-emerald-700 mt-1">R ≤ 5.0 Ω</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {tr(
                'Transformadores de media tensión y pararrayos tipo Franklin/PDC.',
                'Medium-voltage transformers and Franklin/ESE lightning rods.',
                'Transformadores de média tensão e para-raios tipo Franklin/PDC.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Grounding Wells Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {tr(
              'Inventario de Pozos a Tierra y Protocolos de Medición',
              'Grounding Pits Inventory & Measurement Protocols',
              'Inventário de Poços de Aterramento e Protocolos de Medição'
            )} ({diagnostic.grounding.length} {tr('pozos', 'pits', 'poços')})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">{tr('Código / Ubicación', 'Code / Location', 'Código / Localização')}</th>
                <th className="px-4 py-3">{tr('Tipo / Configuración', 'Type / Configuration', 'Tipo / Configuração')}</th>
                <th className="px-4 py-3">{tr('Electrodo', 'Electrode', 'Eletrodo')}</th>
                <th className="px-4 py-3">{tr('Terreno (ρ)', 'Soil (ρ)', 'Solo (ρ)')}</th>
                <th className="px-4 py-3">{tr('Tratamiento Químico', 'Chemical Treatment', 'Tratamento Químico')}</th>
                <th className="px-4 py-3">{tr('R Medida (Ω)', 'Measured R (Ω)', 'R Medida (Ω)')}</th>
                <th className="px-4 py-3">{tr('R Teórica (Ω)', 'Theoretical R (Ω)', 'R Teórica (Ω)')}</th>
                <th className="px-4 py-3">{tr('Estado CNE', 'CNE Status', 'Estado CNE')}</th>
                <th className="px-4 py-3 text-right">{tr('Acciones', 'Actions', 'Ações')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(diagnostic.grounding || []).map(gw => (
                <tr key={gw.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-900">{gw.code || gw.id}</div>
                    <div className="text-[11px] text-slate-500">{gw.location}</div>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    <span className="font-semibold">{(gw.systemType || gw.electrodeType || 'POZO_VERTICAL').replace(/_/g, ' ')}</span>
                    <div className="text-[10px] text-slate-500">
                      {tr('Cable PE:', 'PE Cable:', 'Cabo PE:')} {gw.conductorSectionMm2 || gw.groundConductorGaugeMm2 || 16} mm²
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    <div className="font-mono font-bold text-slate-900">
                      Ø {gw.electrodeDiameterMm || 16}mm ({(gw.electrodeDiameterMm || 16) === 16 ? '5/8"' : '3/4"'})
                    </div>
                    <div className="text-[10px] text-slate-500">L = {gw.electrodeLengthM || 2.4}m Cu</div>
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-800">
                    {gw.soilResistivityOhmM || gw.measuredSoilResistivityOhmM || 50} Ω·m
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-200">
                      {(gw.treatmentChemical || gw.soilTreatmentType || 'NINGUNO').replace(/_/g, ' ')}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{gw.treatmentDate || gw.measurementDate || tr('Al día', 'Up to date', 'Em dia')}</div>
                  </td>

                  <td className="px-4 py-3 font-mono font-black text-base text-slate-900">
                    {gw.measuredResistanceOhm ?? gw.calculatedTheoreticalResistanceOhm ?? 0} Ω
                  </td>

                  <td className="px-4 py-3 font-mono text-slate-600">
                    {gw.calculatedTheoreticalResistanceOhm ?? '-'} Ω
                  </td>

                  <td className="px-4 py-3">
                    <TrafficBadge
                      status={gw.complianceStatus}
                      label={gw.complianceStatus === 'ADECUADO' ? tr('Cumple CNE', 'CNE Compliant', 'Cumpre CNE') : tr('No Cumple', 'Non-Compliant', 'Não Cumpre')}
                      size="sm"
                    />
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleSimulateMaintenance(gw.id)}
                      className="p-1 text-emerald-600 hover:text-emerald-700 mr-1 cursor-pointer"
                      title={tr(
                        'Simular tratamiento con Thor-Gel (mantenimiento preventivo)',
                        'Simulate Thor-Gel treatment (preventive maintenance)',
                        'Simular tratamento com Thor-Gel (manutenção preventiva)'
                      )}
                    >
                      <Sparkles size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(gw)}
                      className="p-1 text-slate-500 hover:text-amber-600 mr-1 cursor-pointer"
                      title={tr('Editar pozo', 'Edit pit', 'Editar poço')}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteGroundingWell(gw.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title={tr('Eliminar pozo', 'Delete pit', 'Excluir poço')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}

              {(diagnostic.grounding || []).length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    {tr(
                      'No hay pozos a tierra registrados. Haga clic en "+ Pozo a Tierra".',
                      'No grounding pits recorded. Click "+ Grounding Pit".',
                      'Nenhum poço de aterramento registrado. Clique em "+ Poço de Aterramento".'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Grounding Well */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingId
                  ? tr('Editar Pozo de Puesta a Tierra', 'Edit Grounding Pit', 'Editar Poço de Aterramento')
                  : tr('Registrar Pozo de Puesta a Tierra', 'Record New Grounding Pit', 'Registrar Poço de Aterramento')}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                title={tr('Cerrar', 'Close', 'Fechar')}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Código del Pozo', 'Pit Code', 'Código do Poço')}
                  </label>
                  <input
                    type="text"
                    value={formState.code}
                    onChange={e => setFormState({ ...formState, code: e.target.value })}
                    placeholder="PAT-01"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Ubicación Física', 'Physical Location', 'Localização Física')}
                  </label>
                  <input
                    type="text"
                    value={formState.location}
                    onChange={e => setFormState({ ...formState, location: e.target.value })}
                    placeholder={tr('Patio de maniobras / Caseta TG', 'Service yard / Main switchboard room', 'Pátio de manobras / Cabine QGBT')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Tipo de Terreno (Resistividad ρ)', 'Soil Type (Resistivity ρ)', 'Tipo de Solo (Resistividade ρ)')}
                  </label>
                  <select
                    value={formState.soilResistivityOhmM}
                    onChange={e => {
                      const rho = Number(e.target.value);
                      const selected = SOIL_RESISTIVITIES.find(s => s.rho === rho);
                      const L = formState.electrodeLengthM || 2.4;
                      const d = (formState.electrodeDiameterMm || 16) / 1000;
                      const rTheo = (rho / (2 * Math.PI * L)) * (Math.log((4 * L) / d) - 1) * 0.5;
                      setFormState({
                        ...formState,
                        soilResistivityOhmM: rho,
                        soilType: selected?.value || 'ARENOSO_HUMEDO',
                        calculatedTheoreticalResistanceOhm: Number(rTheo.toFixed(1))
                      });
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    {SOIL_RESISTIVITIES.map((s, i) => (
                      <option key={i} value={s.rho}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Tratamiento Químico', 'Chemical Treatment', 'Tratamento Químico')}
                  </label>
                  <select
                    value={formState.treatmentChemical}
                    onChange={e => setFormState({ ...formState, treatmentChemical: e.target.value as GroundingTreatment })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="THORGEL">{tr('Thor-Gel (Dosis química)', 'Thor-Gel (Chemical dose)', 'Thor-Gel (Dose química)')}</option>
                    <option value="GEL_ELECTROLITICO">{tr('Gel Electrolítico', 'Electrolytic Gel', 'Gel Eletrolítico')}</option>
                    <option value="CEMENTO_CONDUCTIVO">{tr('Cemento Conductivo', 'Conductive Cement', 'Cimento Condutivo')}</option>
                    <option value="BENTONITA">{tr('Bentonita Sódica', 'Sodium Bentonite', 'Bentonita Sódica')}</option>
                    <option value="NINGUNO">{tr('Ninguno (Tierra natural)', 'None (Natural soil)', 'Nenhum (Solo natural)')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Electrodo Longitud (m)', 'Electrode Length (m)', 'Comprimento Eletrodo (m)')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formState.electrodeLengthM}
                    onChange={e => setFormState({ ...formState, electrodeLengthM: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Diámetro Electrodo (mm)', 'Electrode Diameter (mm)', 'Diâmetro Eletrodo (mm)')}
                  </label>
                  <select
                    value={formState.electrodeDiameterMm}
                    onChange={e => setFormState({ ...formState, electrodeDiameterMm: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono font-bold"
                  >
                    <option value={16.0}>16.0 mm (5/8")</option>
                    <option value={19.0}>19.0 mm (3/4")</option>
                    <option value={25.0}>25.0 mm (1")</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Cable PE (mm²)', 'PE Cable (mm²)', 'Cabo PE (mm²)')}
                  </label>
                  <input
                    type="number"
                    value={formState.conductorSectionMm2}
                    onChange={e => setFormState({ ...formState, conductorSectionMm2: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Resistencia Medida con Telurómetro (Ω) *', 'Earth Tester Measured Resistance (Ω) *', 'Resistência Medida com Terrômetro (Ω) *')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formState.measuredResistanceOhm}
                    onChange={e => {
                      const r = Number(e.target.value);
                      const maxR = formState.requiredMaxResistanceOhm || 25;
                      setFormState({
                        ...formState,
                        measuredResistanceOhm: r,
                        complianceStatus: r <= maxR ? 'ADECUADO' : 'NO_ADECUADO'
                      });
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-black text-amber-900 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {tr('Límite Máximo Normativo CNE (Ω)', 'Max CNE Regulatory Limit (Ω)', 'Limite Máximo Normativo CNE (Ω)')}
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formState.requiredMaxResistanceOhm}
                    onChange={e => setFormState({ ...formState, requiredMaxResistanceOhm: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {tr('Observaciones Técnicas', 'Technical Observations', 'Observações Técnicas')}
                </label>
                <input
                  type="text"
                  value={formState.observations}
                  onChange={e => setFormState({ ...formState, observations: e.target.value })}
                  placeholder={tr(
                    'Ej. Caja de registro con tapa de concreto, conector split bolt / soldadura exotérmica...',
                    'E.g. Concrete inspection box, split-bolt connector / exothermic weld...',
                    'Ex. Caixa de inspeção com tampa de concreto, conector split-bolt / solda exotérmica...'
                  )}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {tr('Cancelar', 'Cancel', 'Cancelar')}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
                >
                  {editingId ? tr('Guardar Cambios', 'Save Changes', 'Salvar Alterações') : tr('Registrar Pozo', 'Save Pit', 'Registrar Poço')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
