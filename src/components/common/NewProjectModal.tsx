import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { 
  Building2, 
  Home, 
  Factory, 
  Store, 
  FilePlus, 
  Zap, 
  Sparkles, 
  Check, 
  ArrowRight,
  ShieldCheck,
  MapPin,
  FileCheck,
  X
} from 'lucide-react';
import { InstallationType } from '../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { createNewDiagnostic, setActiveTab, updateTariff, updateGeneralData } = useDiagnostic();

  const [selectedType, setSelectedType] = useState<InstallationType>('industria');
  const [companyName, setCompanyName] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [city, setCity] = useState<string>('Lima');
  const [department, setDepartment] = useState<string>('Lima');
  const [distributor, setDistributor] = useState<string>('Luz del Sur S.A.A.');
  const [supplyVoltage, setSupplyVoltage] = useState<number>(380);
  const [phases, setPhases] = useState<'MONOFASICO' | 'TRIFASICO'>('TRIFASICO');
  const [tariffCode, setTariffCode] = useState<string>('BT3');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const PROJECT_TYPES = [
    {
      id: 'industria' as InstallationType,
      title: 'Planta Industrial / Manufactura General',
      icon: '🏭',
      desc: 'Motores de inducción, maquinaria pesada, tornos, compresor de tornillo, subestación y banco FP.',
      defaultVoltage: 380,
      defaultPhases: 'TRIFASICO' as const,
      defaultTariff: 'BT3',
      defaultDistributor: 'Luz del Sur S.A.A.',
      defaultCity: 'Lima',
      defaultDept: 'Lima'
    },
    {
      id: 'comercio' as InstallationType,
      title: 'Local Comercial / Restaurante / Retail',
      icon: '🏪',
      desc: 'Vitrinas refrigeradas, cámaras de frío, hornos eléctricos, climatización HVAC e iluminación comercial.',
      defaultVoltage: 220,
      defaultPhases: 'TRIFASICO' as const,
      defaultTariff: 'BT5A',
      defaultDistributor: 'Pluz Energía Perú (Ex-Enel)',
      defaultCity: 'Lima',
      defaultDept: 'Lima'
    },
    {
      id: 'vivienda' as InstallationType,
      title: 'Vivienda Residencial / Multifamiliar',
      icon: '🏠',
      desc: 'Terma eléctrica, electrodomésticos, cocina eléctrica / inducción, iluminación y solar on-grid.',
      defaultVoltage: 220,
      defaultPhases: 'MONOFASICO' as const,
      defaultTariff: 'BT5B',
      defaultDistributor: 'Luz del Sur S.A.A.',
      defaultCity: 'Lima',
      defaultDept: 'Lima'
    },
    {
      id: 'oficina' as InstallationType,
      title: 'Oficinas / Centro Corporativo',
      icon: '💼',
      desc: 'Climatización central VRF, servidores / racks UPS, iluminación ergonómica RNE y fuerza comercial.',
      defaultVoltage: 220,
      defaultPhases: 'TRIFASICO' as const,
      defaultTariff: 'BT5A',
      defaultDistributor: 'Luz del Sur S.A.A.',
      defaultCity: 'Lima',
      defaultDept: 'Lima'
    },
    {
      id: 'almacen' as InstallationType,
      title: 'Almacén / Logística / Depósito',
      icon: '📦',
      desc: 'Luminarias High-Bay campana, recarga de montacargas eléctricos, sistemas de bombeo y naves de almacenaje.',
      defaultVoltage: 380,
      defaultPhases: 'TRIFASICO' as const,
      defaultTariff: 'BT5A',
      defaultDistributor: 'Luz del Sur S.A.A.',
      defaultCity: 'Lima',
      defaultDept: 'Lima'
    },
    {
      id: 'educativo' as InstallationType,
      title: 'Centro Educativo / Universidad',
      icon: '🎓',
      desc: 'Aulas, laboratorios de cómputo, talleres pedagógicos, bombeo de agua e iluminación de alta eficiencia.',
      defaultVoltage: 220,
      defaultPhases: 'TRIFASICO' as const,
      defaultTariff: 'BT5A',
      defaultDistributor: 'Hidrandina S.A.',
      defaultCity: 'Trujillo',
      defaultDept: 'La Libertad'
    },
    {
      id: 'salud' as InstallationType,
      title: 'Centro de Salud / Clínica',
      icon: '🏥',
      desc: 'Consultorios, esterilización, equipamiento médico, climatización de áreas limpias y red de respaldo.',
      defaultVoltage: 220,
      defaultPhases: 'TRIFASICO' as const,
      defaultTariff: 'BT3',
      defaultDistributor: 'Seal S.A.',
      defaultCity: 'Arequipa',
      defaultDept: 'Arequipa'
    }
  ];

  const handleSelectType = (typeObj: typeof PROJECT_TYPES[0]) => {
    setSelectedType(typeObj.id);
    setSupplyVoltage(typeObj.defaultVoltage);
    setPhases(typeObj.defaultPhases);
    setTariffCode(typeObj.defaultTariff);
    setDistributor(typeObj.defaultDistributor);
    setCity(typeObj.defaultCity);
    setDepartment(typeObj.defaultDept);
  };

  const handleCreate = () => {
    // 1. Create diagnostic with base schema
    createNewDiagnostic(selectedType);

    // 2. Apply user-selected parameters
    updateTariff({
      supplyVoltage,
      phases,
      tariffCode,
      distributor
    });

    const defaultNames: Record<string, string> = {
      industria: 'Planta Industrial Manufacturera S.A.C.',
      comercio: 'Restaurante & Local Comercial S.A.C.',
      vivienda: 'Residencia Familiar Unifamiliar',
      oficina: 'Oficinas y Centro Corporativo',
      almacen: 'Centro Logístico & Almacenes S.A.C.',
      educativo: 'Campus Educativo',
      salud: 'Policlínico & Centro Médico',
      institucion: 'Sede Institucional',
      calzado: 'Planta Manufacturera'
    };

    if (companyName || clientName || city || department) {
      updateGeneralData({
        companyName: companyName || defaultNames[selectedType] || 'Instalación General',
        clientName: clientName || 'Titular / Propietario',
        city,
        department
      });
    }

    // 3. Switch directly to Equipment tab for instant consumption census
    setActiveTab('equipment');
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 p-3 sm:p-4 backdrop-blur-xs flex min-h-screen items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl my-auto max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header with prominent close button */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Crear Nuevo Proyecto de Diagnóstico Eléctrico</h3>
              <p className="text-xs text-slate-500">Censo de carga, auditoría de potencia, seguridad CNE y optimización tarifaria</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Cerrar ventana (Esc)"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1 min-h-0">
          
          {/* Step 1: Select Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              1. Seleccione el Tipo de Instalación / Sector
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROJECT_TYPES.map((pt) => {
                const isSelected = selectedType === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => handleSelectType(pt)}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="text-2xl mt-0.5">{pt.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{pt.title}</span>
                        {isSelected && <Check className="h-4 w-4 text-indigo-600 stroke-[3]" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{pt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Company / Project Identity */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Identificación del Proyecto (Opcional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Nombre de la Empresa o Proyecto</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej. Planta Industrial S.A.C. / Mi Negocio"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Titular / Cliente</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ej. Ing. Juan Pérez / Propietario"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Key Parameters */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Parámetros Eléctricos y Tarifarios
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tensión de Suministro</label>
                <select
                  value={supplyVoltage}
                  onChange={(e) => setSupplyVoltage(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value={220}>220 V</option>
                  <option value={380}>380 V (Trifásico + N)</option>
                  <option value={440}>440 V (Industrial)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Sistema de Fases</label>
                <select
                  value={phases}
                  onChange={(e) => setPhases(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="MONOFASICO">Monofásico (1Ø)</option>
                  <option value="TRIFASICO">Trifásico (3Ø)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Opción Tarifaria</label>
                <select
                  value={tariffCode}
                  onChange={(e) => setTariffCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="BT5B">BT5B - Simple</option>
                  <option value="BT5A">BT5A - Horaria (HP/HFP)</option>
                  <option value="BT3">BT3 - Doble Medición</option>
                  <option value="MT3">MT3 - Media Tensión</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Empresa Concesionaria Eléctrica</label>
                <input
                  type="text"
                  value={distributor}
                  onChange={(e) => setDistributor(e.target.value)}
                  placeholder="Ej. Hidrandina S.A. / Luz del Sur"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Ciudad / Región</label>
                <input
                  type="text"
                  value={`${city}, ${department}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setCity(parts[0]?.trim() || '');
                    if (parts[1]) setDepartment(parts[1]?.trim());
                  }}
                  placeholder="Ej. Trujillo, La Libertad"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick info note */}
          <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3 text-xs text-indigo-900 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Identificación instantánea de consumo:</strong> Al crear el proyecto, el sistema calculará automáticamente el consumo mensual por equipo (kWh), potencia instalada, factor de potencia y le recomendará qué tarifa le conviene económicamente.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 rounded-b-3xl shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <span>Crear Proyecto e Identificar Consumo</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
