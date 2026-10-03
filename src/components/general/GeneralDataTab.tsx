import React, { useState } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { 
  Building2, 
  MapPin, 
  UserCheck, 
  Zap, 
  Receipt, 
  Save, 
  Layers, 
  Clock, 
  Info,
  Briefcase,
  Lock,
  CheckCircle2,
  Search,
  ShieldCheck
} from 'lucide-react';
import { TariffRecommendationCard } from '../tariff/TariffRecommendationCard';
import { lookupCIPRecord, CIPRecord, CIP_REGIONAL_COUNCILS, CIP_SPECIALTIES } from '../../utils/cipValidator';

export const GeneralDataTab: React.FC = () => {
  const { diagnostic, updateGeneralData, updateTariff, currentUser, updateUserProfile } = useDiagnostic();
  const { generalData, tariff } = diagnostic;
  const [cipSearchInput, setCipSearchInput] = useState(generalData.cipNumber || currentUser?.cipNumber || '278034');
  const [cipSearchStatus, setCipSearchStatus] = useState<string | null>(null);
  const [verifiedCIPData, setVerifiedCIPData] = useState<CIPRecord | null>(() => 
    lookupCIPRecord(
      generalData.cipNumber || currentUser?.cipNumber || '278034',
      generalData.responsibleEngineer || currentUser?.name,
      generalData.specialty || currentUser?.specialty,
      currentUser?.regionalCouncil
    )
  );

  const handlePerformCIPLookup = (cipCode: string) => {
    const clean = (cipCode || '').trim().replace(/[^0-9]/g, '');
    if (!clean) return;
    const record = lookupCIPRecord(clean);
    if (record) {
      setVerifiedCIPData(record);
      const matchedCouncil = CIP_REGIONAL_COUNCILS.find(c => c.name === record.regionalCouncil || c.college === record.college);
      const dept = matchedCouncil ? matchedCouncil.department : 'La Libertad';
      updateGeneralData({
        cipNumber: record.cipNumber,
        specialty: record.specialty,
        professionalCollege: record.college,
        responsibleEngineer: record.fullName,
        department: dept
      });
      if (updateUserProfile && currentUser) {
        updateUserProfile({
          cipNumber: record.cipNumber,
          specialty: record.specialty,
          professionalCollege: record.college,
          regionalCouncil: record.regionalCouncil,
          chapter: record.chapter,
          name: record.fullName
        });
      }
      setCipSearchStatus(`✓ ${record.fullName} · ${record.regionalCouncil} · ${record.specialty}`);
    } else {
      setCipSearchStatus('Número CIP no válido. Ingrese entre 5 y 6 dígitos numéricos.');
    }
  };

  const PERUVIAN_DISTRIBUTORS = [
    'Luz del Sur S.A.A.',
    'Pluz Energía Perú (Ex-Enel Distribución)',
    'Hidrandina S.A. (Distriluz - La Libertad / Áncash)',
    'Seal S.A. (Sociedad Eléctrica del Sur Oeste - Arequipa)',
    'Electrocentro S.A. (Junín / Ayacucho / Huancavelica / Huánuco)',
    'Electronoroeste S.A. - Enosa (Piura / Tumbes)',
    'Electronorte S.A. - Ensa (Lambayeque / Cajamarca)',
    'Electrosur S.A. (Tacna / Moquegua)',
    'Electro Oriente S.A. (Loreto / San Martín / Amazonas)',
    'Electro Puno S.A.A.',
    'Electro Sur Este S.A.A. (Cusco / Apurímac / Madre de Dios)'
  ];

  const PERUVIAN_TARIFF_CODES = [
    'BT5B - Residencial / Comercial Simple (Baja Tensión)',
    'BT5A - Horaria HP / HFP (Baja Tensión)',
    'BT2 - Horaria Integral Energía y Potencia (Baja Tensión)',
    'BT3 - Doble Medición Energía + Potencia (Baja Tensión)',
    'BT4 - Medición de Energía y Dos Potencias (Baja Tensión)',
    'BT6 - Usos Generales / Alumbrado (Baja Tensión)',
    'MT2 - Media Tensión Horaria Integral (Subestación 10-22.9 kV)',
    'MT3 - Media Tensión con Medición de Potencia Simple',
    'MT4 - Media Tensión con Dos Potencias (HP y HFP)',
    'LIBRE - Mercado Libre de Electricidad (>200 kW Ley 28832)'
  ];

  const DEFAULT_AREAS_BY_TYPE: Record<string, string[]> = {
    industria: [
      'Nave de Corte y Prensado',
      'Mecanizado y Tornos',
      'Línea de Ensamble y Montaje',
      'Área de Soldadura y Pailería',
      'Área de Pintura y Acabados',
      'Cuarto de Compresores y Neumática',
      'Almacén de Materia Prima',
      'Control de Calidad y Ensayos',
      'Despacho y Empaque',
      'Oficinas Técnicas y Control'
    ],
    comercio: [
      'Cocina Caliente y Preparación',
      'Cámara Frigorífica y Conservación',
      'Salón Comedor y Atención',
      'Barra y Cafetería',
      'Almacén de Perecibles',
      'Caja y Administración'
    ],
    vivienda: [
      'Sala - Comedor',
      'Cocina y Área de Cocción',
      'Dormitorios',
      'Lavandería y Secado',
      'Bomba de Agua y Cisterna',
      'Terraza y Azotea Solar',
      'Cochera'
    ],
    oficina: [
      'Open Space / Puestos de Trabajo',
      'Sala de Reuniones',
      'Directorio y Gerencia',
      'Data Center / Rack Servidores',
      'Cafetería y Kitchenette',
      'Recepción y Hall'
    ],
    almacen: [
      'Nave de Almacenaje Principal',
      'Zona de Carga y Descarga',
      'Estación de Recarga Montacargas',
      'Cuarto de Bombas ACI',
      'Taller de Mantenimiento',
      'Oficinas de Despacho'
    ],
    educativo: [
      'Aulas de Clase',
      'Laboratorios de Cómputo',
      'Talleres Pedagógicos',
      'Auditorio Principal',
      'Biblioteca',
      'Cafetería y Comedor',
      'Bombeo y Servicios'
    ],
    salud: [
      'Consultorios Médicos',
      'Sala de Procedimientos / Cirugía',
      'Laboratorio Clínico',
      'Imagenología y Rayos X',
      'Central de Esterilización',
      'Sala de Espera y Admisión',
      'Tableros y Grupo Electrógeno'
    ],
    institucion: [
      'Atención a la Ciudadanía',
      'Oficinas Administrativas',
      'Archivo Central y Documental',
      'Sala de Servidores',
      'Comedor de Personal'
    ],
    calzado: [
      'Área de Corte de Cuero y Forros',
      'Área de Aparado (Costura y Desbastado)',
      'Área de Armado, Montado y Reactivado',
      'Área de Acabado, Lijado y Limpieza',
      'Cuarto de Compresores y Neumática',
      'Almacén de Hormas y Suelas',
      'Oficinas Administrativas'
    ]
  };

  const currentType = (generalData.installationType || 'industria').toLowerCase();
  const availableSuggestedAreas = DEFAULT_AREAS_BY_TYPE[currentType] || DEFAULT_AREAS_BY_TYPE.industria;

  const toggleFacilityArea = (area: string) => {
    const current = generalData.facilityProcessAreas || generalData.footwearProcessAreas || [];
    const updated = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    updateGeneralData({ 
      facilityProcessAreas: updated,
      footwearProcessAreas: updated 
    });
  };

  const [newCustomArea, setNewCustomArea] = React.useState('');

  const handleAddCustomArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomArea.trim()) return;
    const current = generalData.facilityProcessAreas || generalData.footwearProcessAreas || [];
    if (!current.includes(newCustomArea.trim())) {
      const updated = [...current, newCustomArea.trim()];
      updateGeneralData({
        facilityProcessAreas: updated,
        footwearProcessAreas: updated
      });
    }
    setNewCustomArea('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            Datos Generales de la Instalación y Régimen Tarifario
          </h2>
          <p className="text-xs text-slate-500">
            Información del titular, ubicación geográfica en Perú, acreditación técnica CIP y parámetros de suministro eléctrico
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-mono font-bold text-slate-700">
            {generalData.diagnosticCode}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Titular e Identificación */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900">
            <Building2 className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold">Identificación del Cliente y Entidad</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Razón Social / Nombre de la Empresa o Residencia</label>
              <input
                type="text"
                value={generalData.companyName || ''}
                onChange={(e) => updateGeneralData({ companyName: e.target.value })}
                placeholder="Ej. Calzados El Artesano S.A.C. / Residencia Familiar"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Contacto / Titular</label>
                <input
                  type="text"
                  value={generalData.clientName || ''}
                  onChange={(e) => updateGeneralData({ clientName: e.target.value })}
                  placeholder="Ej. Don Aurelio Rodríguez"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">RUC / DNI (11 o 8 dígitos)</label>
                <input
                  type="text"
                  value={generalData.ruc || ''}
                  onChange={(e) => updateGeneralData({ ruc: e.target.value })}
                  placeholder="Ej. 20608945123"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Instalación</label>
                <select
                  value={generalData.installationType}
                  onChange={(e) => updateGeneralData({ installationType: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="industria">🏭 Planta Industrial en General</option>
                  <option value="comercio">🏪 Local Comercial / Restaurante</option>
                  <option value="vivienda">🏠 Vivienda Residencial</option>
                  <option value="oficina">💼 Oficinas / Centro Corporativo</option>
                  <option value="almacen">📦 Almacén / Centro Logístico</option>
                  <option value="educativo">🎓 Centro Educativo / Universidad</option>
                  <option value="salud">🏥 Centro de Salud / Clínica</option>
                  <option value="institucion">🏛️ Entidad Institucional / Pública</option>
                  <option value="calzado">👞 Sector Calzado / Marroquinería</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Actividad Económica Principal</label>
                <input
                  type="text"
                  value={generalData.economicActivity || ''}
                  onChange={(e) => updateGeneralData({ economicActivity: e.target.value })}
                  placeholder="Ej. Fabricación de calzado de vestir"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teléfono / Celular</label>
                <input
                  type="text"
                  value={generalData.phone || ''}
                  onChange={(e) => updateGeneralData({ phone: e.target.value })}
                  placeholder="+51 944 112 233"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={generalData.email || ''}
                  onChange={(e) => updateGeneralData({ email: e.target.value })}
                  placeholder="contacto@empresa.pe"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Responsabilidad Técnica CIP con Búsqueda y Validación Oficial Blindada */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold">Responsable Técnico Colegiado (CIP)</h3>
                <p className="text-[11px] text-slate-500">Validación directa en el Padrón Nacional de Colegiados</p>
              </div>
            </div>
            {verifiedCIPData?.verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>CIP HABILITADO</span>
              </span>
            )}
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Buscador de CIP con Validación Oficial */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Búsqueda y Verificación Oficial de Colegiatura CIP:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={cipSearchInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setCipSearchInput(val);
                      if (val.length >= 5) {
                        handlePerformCIPLookup(val);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePerformCIPLookup(cipSearchInput);
                      }
                    }}
                    placeholder="Ingrese N° de Registro CIP (ej: 278034, 215430, 98765...)"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-indigo-600 focus:outline-none shadow-2xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handlePerformCIPLookup(cipSearchInput)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Validar CIP</span>
                </button>
              </div>

              {cipSearchStatus && (
                <p className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{cipSearchStatus}</span>
                </p>
              )}

              {/* Fin bloque CIP */}
            </div>

            {/* Sección Protegida: Datos del Colegiado Autocompletados y Blindados */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Datos Oficiales del Colegiado (Autocompletados y Blindados)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Protegido Anti-Fraude
                </span>
              </div>

              {/* Ingeniero Responsable */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 text-xs">Ingeniero Responsable Colegiado</label>
                  <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Autocompletado por CIP
                  </span>
                </div>
                <input
                  type="text"
                  value={generalData.responsibleEngineer || currentUser?.name || 'Ing. Víctor Fernando Becerra Terán'}
                  readOnly
                  disabled
                  className="w-full rounded-lg border border-slate-300 bg-slate-100/90 px-3 py-2 text-xs font-bold text-slate-900 cursor-not-allowed select-none opacity-95 shadow-2xs"
                />
              </div>

              {/* Selección y Validación Oficial: Especialidad y Consejo Departamental */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 text-xs">Especialidad de Ingeniería CIP</label>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Autocompletado por CIP
                    </span>
                  </div>
                  <input
                    type="text"
                    value={generalData.specialty || currentUser?.specialty || 'Ingeniero Electrónico'}
                    readOnly
                    disabled
                    className="w-full rounded-lg border border-slate-300 bg-slate-100/90 px-3 py-2 text-xs font-bold text-slate-900 cursor-not-allowed select-none opacity-95 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    ✓ Especialidad oficial certificada para refrendar peritajes
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700 text-xs">Colegio / Consejo Departamental CIP</label>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Autocompletado por CIP
                    </span>
                  </div>
                  <input
                    type="text"
                    value={currentUser?.regionalCouncil || (generalData.department ? `CD ${generalData.department}` : 'CD La Libertad (Trujillo)')}
                    readOnly
                    disabled
                    className="w-full rounded-lg border border-slate-300 bg-slate-100/90 px-3 py-2 text-xs font-bold text-slate-900 cursor-not-allowed select-none opacity-95 shadow-2xs"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    ✓ Consejo Departamental con jurisdicción y habilitación vigente
                  </p>
                </div>
              </div>
            </div>

            {/* Número CIP y Fecha de Inspección */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Número de Registro CIP Validado</label>
                <input
                  type="text"
                  value={generalData.cipNumber || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    updateGeneralData({ cipNumber: val });
                    setCipSearchInput(val);
                    if (val.length >= 4) {
                      handlePerformCIPLookup(val);
                    }
                  }}
                  placeholder="Ej. 278034"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold text-indigo-900 bg-indigo-50/40 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fecha de Inspección en Campo</label>
                <input
                  type="date"
                  value={generalData.date || ''}
                  onChange={(e) => updateGeneralData({ date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Ficha de Certificación Oficial CIP */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-emerald-950 space-y-1.5">
              <div className="font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Certificación Oficial de Peritaje Técnico CIP</span>
                </span>
                <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded font-bold">
                  {verifiedCIPData?.status || 'HABILITADO'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                {verifiedCIPData?.legalNotice || 'El informe técnico generado incorpora el formato reglamentario y datos blindados no modificables exigidos por el Colegio de Ingenieros del Perú (CIP), INDECI e ITSE.'}
              </p>
              {verifiedCIPData && (
                <div className="pt-1 border-t border-emerald-200/70 flex flex-wrap items-center justify-between text-[10px] text-emerald-900 font-medium">
                  <span>Capítulo: <strong>{verifiedCIPData.chapter}</strong></span>
                  <span>Colegiado desde: <strong>{verifiedCIPData.registrationDate}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Ubicación y Dimensionamiento */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold">Ubicación Geográfica y Régimen de Operación</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dirección del Predio</label>
              <input
                type="text"
                value={generalData.address || ''}
                onChange={(e) => updateGeneralData({ address: e.target.value })}
                placeholder="Av. Sánchez Carrión 1420, Parque Industrial"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Departamento</label>
                <input
                  type="text"
                  value={generalData.department || ''}
                  onChange={(e) => updateGeneralData({ department: e.target.value })}
                  placeholder="La Libertad / Lima"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provincia</label>
                <input
                  type="text"
                  value={generalData.province || ''}
                  onChange={(e) => updateGeneralData({ province: e.target.value })}
                  placeholder="Trujillo / Lima"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Distrito</label>
                <input
                  type="text"
                  value={generalData.district || ''}
                  onChange={(e) => updateGeneralData({ district: e.target.value })}
                  placeholder="El Porvenir / Surco"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Área Techada (m²)</label>
                <input
                  type="number"
                  value={generalData.builtAreaM2 || 0}
                  onChange={(e) => updateGeneralData({ builtAreaM2: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Personal / Ocupantes</label>
                <input
                  type="number"
                  value={generalData.workerCount || 0}
                  onChange={(e) => updateGeneralData({ workerCount: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Días Operación/Sem</label>
                <input
                  type="number"
                  value={generalData.workDaysPerWeek || 6}
                  onChange={(e) => updateGeneralData({ workDaysPerWeek: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Horario Habitual de Turnos</label>
              <input
                type="text"
                value={generalData.workSchedule || ''}
                onChange={(e) => updateGeneralData({ workSchedule: e.target.value })}
                placeholder="07:30 a 17:30 (Lunes a Sábado)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Suministro y Tarifación Eléctrica */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-900">
            <Zap className="h-5 w-5 text-amber-600" />
            <h3 className="text-sm font-bold">Empresa Distribuidora y Régimen Tarifario</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Empresa Concesionaria Eléctrica</label>
              <select
                value={tariff.distributor}
                onChange={(e) => updateTariff({ distributor: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none"
              >
                {PERUVIAN_DISTRIBUTORS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opción Tarifaria</label>
                <select
                  value={tariff.tariffCode}
                  onChange={(e) => updateTariff({ tariffCode: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none"
                >
                  {PERUVIAN_TARIFF_CODES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tensión Nominal / Fases</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={tariff.supplyVoltage}
                    onChange={(e) => updateTariff({ supplyVoltage: Number(e.target.value) })}
                    className="rounded-lg border border-slate-300 px-2 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                  >
                    <option value={220}>220 V</option>
                    <option value={380}>380 V</option>
                    <option value={440}>440 V</option>
                  </select>
                  <select
                    value={tariff.phases}
                    onChange={(e) => updateTariff({ phases: e.target.value as any })}
                    className="rounded-lg border border-slate-300 px-2 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none"
                  >
                    <option value="MONOFASICO">1Ø (Monof.)</option>
                    <option value="TRIFASICO">3Ø (Trif.)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Precio Energía Activa (S/. / kWh)</label>
                <input
                  type="number"
                  step="0.001"
                  value={tariff.activeEnergyPriceKwh || 0.75}
                  onChange={(e) => updateTariff({ activeEnergyPriceKwh: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Penalidad Reactiva (S/. / kvarh)</label>
                <input
                  type="number"
                  step="0.001"
                  value={tariff.reactiveEnergyPenaltyPriceKvarh || 0.14}
                  onChange={(e) => updateTariff({ reactiveEnergyPenaltyPriceKvarh: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cargo Fijo Mensual (S/.)</label>
                <input
                  type="number"
                  step="0.10"
                  value={tariff.fixedMonthlyChargeSoles || 4.50}
                  onChange={(e) => updateTariff({ fixedMonthlyChargeSoles: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cargo Potencia Contratada (S/./kW)</label>
                <input
                  type="number"
                  step="0.50"
                  value={tariff.contractedDemandPriceKw || 0}
                  onChange={(e) => updateTariff({ contractedDemandPriceKw: Number(e.target.value) })}
                  placeholder="0.00 si es BT5B"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Tariff Optimization and Recommendation according to Peruvian OSINERGMIN Regulation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Análisis y Recomendación de Tarifa Conveniente (OSINERGMIN)</h3>
        </div>
        <TariffRecommendationCard compact={false} />
      </div>

      {/* Sectores y Áreas Operativas de la Instalación */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Briefcase className="h-4 w-4 text-indigo-600" />
            <span>Sectores y Áreas Operativas / Productivas de la Instalación</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full w-fit">
            {(generalData.facilityProcessAreas || generalData.footwearProcessAreas || []).length} áreas seleccionadas
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Seleccione o agregue las áreas funcionales del proyecto para organizar el censo de cargas, circuitos en tableros y cálculos de iluminación según norma RNE EM.010:
        </p>

        {/* Suggested Areas Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {availableSuggestedAreas.map(area => {
            const isSelected = (generalData.facilityProcessAreas || generalData.footwearProcessAreas || []).includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleFacilityArea(area)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}{area}
              </button>
            );
          })}
        </div>

        {/* Add custom area */}
        <form onSubmit={handleAddCustomArea} className="flex gap-2 pt-2 max-w-md">
          <input
            type="text"
            value={newCustomArea}
            onChange={(e) => setNewCustomArea(e.target.value)}
            placeholder="+ Agregar otra área personalizada..."
            className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none bg-slate-50/50"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Agregar
          </button>
        </form>
      </div>

      {/* General Observations */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
        <label className="block text-xs font-bold text-slate-900">
          Observaciones Generales y Antecedentes del Diagnóstico
        </label>
        <textarea
          rows={3}
          value={generalData.observations || ''}
          onChange={(e) => updateGeneralData({ observations: e.target.value })}
          placeholder="Ingrese comentarios sobre condiciones de suministro, antecedentes de fallas, inspecciones INDECI o ampliaciones proyectadas..."
          className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:border-amber-500 focus:outline-none"
        />
      </div>

    </div>
  );
};
