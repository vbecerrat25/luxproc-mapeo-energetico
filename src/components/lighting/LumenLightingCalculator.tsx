import React, { useState, useMemo } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { 
  Lightbulb, 
  Sparkles, 
  Grid3X3, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Sun, 
  Zap, 
  Maximize2, 
  Layers, 
  Ruler,
  TrendingDown
} from 'lucide-react';
import { LightingRecord } from '../../types';

export const LumenLightingCalculator: React.FC = () => {
  const { addLightingRoom, diagnostic } = useDiagnostic();

  // Environment inputs
  const [roomName, setRoomName] = useState<string>('Nave de Aparado y Costura');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [requiredLux, setRequiredLux] = useState<number>(750);
  const [visualTask, setVisualTask] = useState<string>('Costura fina en cuero y pespunte');

  // Geometry dimensions
  const [lengthM, setLengthM] = useState<number>(10.0);
  const [widthM, setWidthM] = useState<number>(6.0);
  const [heightM, setHeightM] = useState<number>(3.5);
  const [workplaneHeightM, setWorkplaneHeightM] = useState<number>(0.85); // standard workbench height

  // Maintenance & Environment
  const [environmentCleanliness, setEnvironmentCleanliness] = useState<'LIMPIO' | 'NORMAL' | 'POLVO'>('NORMAL');

  // Lamp / Luminaire selection
  const [luminaireType, setLuminaireType] = useState<string>('PANEL_LED_40W');
  const [customLumens, setCustomLumens] = useState<number>(4000);
  const [customPowerW, setCustomPowerW] = useState<number>(40);

  const RNE_PRESETS = [
    { name: 'Área de Costura y Aparado de Calzado', task: 'Costura fina, pespunte y remallado en cuero', lux: 750, defaultLuminaire: 'PANEL_LED_40W' },
    { name: 'Área de Corte y Desbaste', task: 'Corte manual y desbastado con cuchillas', lux: 500, defaultLuminaire: 'PANEL_LED_40W' },
    { name: 'Área de Armado y Pegado de Suelas', task: 'Montado de capellada y pegado con prensas', lux: 400, defaultLuminaire: 'PANEL_LED_40W' },
    { name: 'Control de Calidad e Inspección Final', task: 'Inspección minuciosa de defectos y acabado', lux: 600, defaultLuminaire: 'PANEL_LED_40W' },
    { name: 'Almacén de Materiales y Cajas', task: 'Tránsito de montacargas y almacenamiento', lux: 150, defaultLuminaire: 'CAMPANA_LED_100W' },
    { name: 'Oficinas / Diseño y Patronaje CAD', task: 'Uso de pantallas y trazo de patrones', lux: 500, defaultLuminaire: 'PANEL_LED_40W' },
    { name: 'Vivienda: Cocina / Preparación', task: 'Preparación de alimentos y manipulación', lux: 300, defaultLuminaire: 'DOWNLIGHT_LED_18W' },
    { name: 'Vivienda: Sala / Comedor', task: 'Estar, descanso y lectura general', lux: 150, defaultLuminaire: 'FOCO_LED_12W' },
    { name: 'Vivienda: Dormitorio', task: 'Descanso e iluminación suave', lux: 100, defaultLuminaire: 'FOCO_LED_9W' }
  ];

  const LUMINAIRE_OPTIONS = [
    { id: 'PANEL_LED_40W', name: 'Panel LED 60x60 cm (40W - 4,000 lm)', powerW: 40, lumens: 4000, desc: 'Luz difusa de alto confort para oficinas y talleres de confección' },
    { id: 'CAMPANA_LED_100W', name: 'Campana Industrial LED High Bay (100W - 13,000 lm)', powerW: 100, lumens: 13000, desc: 'Para naves de gran altura (H ≥ 4.0m) y almacenes' },
    { id: 'CAMPANA_LED_150W', name: 'Campana Industrial LED High Bay (150W - 20,000 lm)', powerW: 150, lumens: 20000, desc: 'Para plantas de manufactura pesada con techos altos' },
    { id: 'TUBO_LED_18W', name: 'Luminaria Hermética 2x18W LED (36W - 3,600 lm)', powerW: 36, lumens: 3600, desc: 'Luminaria estanca IP65 resistente a polvo y vapores' },
    { id: 'DOWNLIGHT_LED_18W', name: 'Downlight LED Empotrable (18W - 1,800 lm)', powerW: 18, lumens: 1800, desc: 'Iluminación puntual para cielos rasos y comercios' },
    { id: 'FOCO_LED_12W', name: 'Foco / Bulbo LED E27 (12W - 1,200 lm)', powerW: 12, lumens: 1200, desc: 'Foco de rosca estándar de alta eficiencia' },
    { id: 'FOCO_LED_9W', name: 'Foco / Bulbo LED E27 (9W - 900 lm)', powerW: 9, lumens: 900, desc: 'Foco doméstico para áreas de descanso' },
    { id: 'CUSTOM', name: 'Luminaria / Foco Personalizado', powerW: customPowerW, lumens: customLumens, desc: 'Definir potencia y flujo luminoso a medida' }
  ];

  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    const preset = RNE_PRESETS[index];
    if (preset) {
      setRoomName(preset.name);
      setVisualTask(preset.task);
      setRequiredLux(preset.lux);
      setLuminaireType(preset.defaultLuminaire);
    }
  };

  // Lumen Method (Cavity Ratio) Calculations
  const calcResults = useMemo(() => {
    const L = Math.max(1, lengthM);
    const W = Math.max(1, widthM);
    const H = Math.max(1.5, heightM);
    const h_pt = Math.max(0, Math.min(H - 0.5, workplaneHeightM));
    
    // 1. Useful mounting height hm = H - h_pt
    const hm = Math.max(0.5, H - h_pt);
    
    // 2. Area
    const area = L * W;

    // 3. Room Index K = (L * W) / (hm * (L + W))
    const roomIndexK = Number(((L * W) / (hm * (L + W))).toFixed(2));

    // 4. Maintenance Factor (Fm)
    let Fm = 0.80; // clean
    if (environmentCleanliness === 'NORMAL') Fm = 0.70;
    if (environmentCleanliness === 'POLVO') Fm = 0.60;

    // 5. Coefficient of Utilization (Cu)
    // Formula approximation for direct LED luminaires with 70/50/20 reflectances
    let Cu = Number((Math.min(0.85, (roomIndexK / (roomIndexK + 0.55)) * 0.74)).toFixed(2));
    if (Cu < 0.30) Cu = 0.30;

    // 6. Selected luminaire properties
    const selectedLum = LUMINAIRE_OPTIONS.find(l => l.id === luminaireType) || LUMINAIRE_OPTIONS[0];
    const lampLumens = luminaireType === 'CUSTOM' ? customLumens : selectedLum.lumens;
    const lampPowerW = luminaireType === 'CUSTOM' ? customPowerW : selectedLum.powerW;

    // 7. Total Lumens Required: Phi_Total = (E * A) / (Cu * Fm)
    const totalLumensRequired = Math.round((requiredLux * area) / (Cu * Fm));

    // 8. Exact Number of Luminaires N = ceil(Phi_Total / Phi_Luminaria)
    const numLuminairesExact = Math.max(1, Math.ceil(totalLumensRequired / lampLumens));

    // 9. Optimal Grid Distribution: Nx (along length) and Ny (along width)
    // Nx / Ny ~ L / W  and  Nx * Ny >= N
    const ratio = L / W;
    let Nx = Math.max(1, Math.round(Math.sqrt(numLuminairesExact * ratio)));
    let Ny = Math.max(1, Math.ceil(numLuminairesExact / Nx));

    const totalFocosCalculated = Nx * Ny;

    // 10. Spacing
    const spacingX = Number((L / Nx).toFixed(2));
    const spacingY = Number((W / Ny).toFixed(2));
    const wallDistanceX = Number((spacingX / 2).toFixed(2));
    const wallDistanceY = Number((spacingY / 2).toFixed(2));

    // Uniformity check: spacing / hm <= 1.5
    const maxSpacing = Math.max(spacingX, spacingY);
    const spacingRatio = Number((maxSpacing / hm).toFixed(2));
    const isUniformityGood = spacingRatio <= 1.5;

    // 11. Achieved Lux
    const achievedLux = Math.round((totalFocosCalculated * lampLumens * Cu * Fm) / area);

    // 12. Power & Power Density
    const totalPowerW = totalFocosCalculated * lampPowerW;
    const powerDensity = Number((totalPowerW / area).toFixed(2));
    const maxAllowedPowerDensity = 10.0; // RNE standard 10 W/m2 for LED
    const isPowerDensityOk = powerDensity <= maxAllowedPowerDensity;

    return {
      area: Number(area.toFixed(1)),
      hm: Number(hm.toFixed(2)),
      roomIndexK,
      Fm,
      Cu,
      totalLumensRequired,
      numLuminairesExact,
      totalFocosCalculated,
      Nx,
      Ny,
      spacingX,
      spacingY,
      wallDistanceX,
      wallDistanceY,
      spacingRatio,
      isUniformityGood,
      achievedLux,
      lampPowerW,
      lampLumens,
      totalPowerW,
      powerDensity,
      isPowerDensityOk
    };
  }, [lengthM, widthM, heightM, workplaneHeightM, environmentCleanliness, requiredLux, luminaireType, customLumens, customPowerW]);

  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const handleAddToDiagnostic = () => {
    const newRoom: Omit<LightingRecord, 'id'> = {
      roomName,
      visualTask,
      areaM2: calcResults.area,
      lengthM,
      widthM,
      heightM,
      workplaneHeightM,
      requiredLuxRne: requiredLux,
      measuredLux: calcResults.achievedLux,
      currentTech: 'FLUORESCENTE_T8',
      currentLampCount: Math.round(calcResults.totalFocosCalculated * 1.5),
      currentLampPowerW: 36,
      currentTotalPowerW: Math.round(calcResults.totalFocosCalculated * 1.5 * 36),
      dailyHours: 8,
      recommendedTech: luminaireType.includes('CAMPANA') ? 'LED_HIGH_BAY' : 'LED_PANEL',
      recommendedLampCount: calcResults.totalFocosCalculated,
      recommendedLampPowerW: calcResults.lampPowerW,
      recommendedTotalPowerW: calcResults.totalPowerW,
      calculatedRoomIndexK: calcResults.roomIndexK,
      maintenanceFactor: calcResults.Fm,
      utilizationFactor: calcResults.Cu,
      powerDensityWPerM2: calcResults.powerDensity,
      maxAllowedPowerDensityWPerM2: 10.0,
      complianceStatus: calcResults.achievedLux >= requiredLux ? 'ADECUADO' : 'REVISAR',
      monthlySavingsKwh: Number((((calcResults.totalFocosCalculated * 1.5 * 36 - calcResults.totalPowerW) * 8 * 26) / 1000).toFixed(1)),
      monthlySavingsSoles: Number(((((calcResults.totalFocosCalculated * 1.5 * 36 - calcResults.totalPowerW) * 8 * 26) / 1000) * 0.75).toFixed(1)),
      observations: `Dimensionado por método de lúmenes RNE EM.010: ${calcResults.totalFocosCalculated} focos en cuadrícula ${calcResults.Nx}x${calcResults.Ny} (${calcResults.achievedLux} Lux proyectados)`
    };

    addLightingRoom(newRoom);
    setAddedMessage(`¡Ambiente "${roomName}" con ${calcResults.totalFocosCalculated} luminarias registrado con éxito en el diagnóstico!`);
    setTimeout(() => setAddedMessage(null), 4000);
  };

  return (
    <div className="rounded-3xl border border-amber-200 bg-linear-to-b from-amber-50/50 via-white to-white p-6 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-2">
              Calculadora Fotométrica: ¿Cuántos focos necesito según Área y Altura?
              <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-slate-950 uppercase tracking-wider">
                RNE EM.010
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Método de Cavidad Zonal / Lúmenes: cálculo de luminarias LED, espaciamiento $N_x \times N_y$ y uniformidad visual
            </p>
          </div>
        </div>
      </div>

      {addedMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{addedMessage}</span>
        </div>
      )}

      {/* Main Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Inputs (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4.5 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
            <span>1. Datos del Ambiente y Tarea Visual</span>
            <span className="text-[10px] text-amber-700 font-mono">Norma RNE</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Presets dropdown */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preset de Ambiente / Tarea RNE</label>
              <select
                value={selectedPresetIndex}
                onChange={(e) => handleSelectPreset(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none"
              >
                {RNE_PRESETS.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p.name} ({p.lux} Lux)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre del Ambiente</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs focus:border-amber-500 focus:outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Iluminancia RNE (Lux)</label>
                <input
                  type="number"
                  value={requiredLux}
                  onChange={(e) => setRequiredLux(Number(e.target.value))}
                  min={50}
                  step={50}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-amber-800 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ambiente / Polvo</label>
                <select
                  value={environmentCleanliness}
                  onChange={(e) => setEnvironmentCleanliness(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value="LIMPIO">Limpio (Fm = 0.80)</option>
                  <option value="NORMAL">Normal / Taller (Fm = 0.70)</option>
                  <option value="POLVO">Polvoriento (Fm = 0.60)</option>
                </select>
              </div>
            </div>

            {/* Geometry Dimensions */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-amber-600" />
                <span>Dimensiones Físicas del Local</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-0.5">Largo L (m)</label>
                  <input
                    type="number"
                    value={lengthM}
                    onChange={(e) => setLengthM(Number(e.target.value))}
                    min={1}
                    step={0.5}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-0.5">Ancho W (m)</label>
                  <input
                    type="number"
                    value={widthM}
                    onChange={(e) => setWidthM(Number(e.target.value))}
                    min={1}
                    step={0.5}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-0.5">Altura Techo H (m)</label>
                  <input
                    type="number"
                    value={heightM}
                    onChange={(e) => setHeightM(Number(e.target.value))}
                    min={1.8}
                    step={0.1}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-medium mb-0.5">Plano Trabajo h_pt (m)</label>
                  <input
                    type="number"
                    value={workplaneHeightM}
                    onChange={(e) => setWorkplaneHeightM(Number(e.target.value))}
                    min={0}
                    max={1.5}
                    step={0.05}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="text-[10px] text-slate-500 flex justify-between pt-1 font-mono">
                <span>Área: <strong>{calcResults.area} m²</strong></span>
                <span>Altura útil hm: <strong>{calcResults.hm} m</strong></span>
                <span>Índice K: <strong>{calcResults.roomIndexK}</strong></span>
              </div>
            </div>

            {/* Luminaire Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Foco / Luminaria LED a Instalar</label>
              <select
                value={luminaireType}
                onChange={(e) => setLuminaireType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-none"
              >
                {LUMINAIRE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            {luminaireType === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50/40">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Flujo Luminoso (lm)</label>
                  <input
                    type="number"
                    value={customLumens}
                    onChange={(e) => setCustomLumens(Number(e.target.value))}
                    min={100}
                    step={100}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Potencia (W)</label>
                  <input
                    type="number"
                    value={customPowerW}
                    onChange={(e) => setCustomPowerW(Number(e.target.value))}
                    min={1}
                    step={1}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Sizing Output & 2D Grid Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
            <span>2. Resultado: Número de Focos y Distribución</span>
            <span className="text-[10px] text-amber-700 font-bold">Fórmula: N = (E × A) / (Φ × Cu × Fm)</span>
          </div>

          {/* Primary Result Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Total Focos Card */}
            <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/60 p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Total Focos / Luminarias</div>
                <div className="text-3xl font-black text-slate-900 font-mono mt-1">
                  {calcResults.totalFocosCalculated} <span className="text-base font-normal text-slate-600">uds.</span>
                </div>
                <div className="text-xs font-bold text-amber-800 mt-0.5">
                  Cuadrícula: {calcResults.Nx} de largo &times; {calcResults.Ny} de ancho
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-600 border-t border-amber-200/80 pt-2">
                Flujo total: {calcResults.totalLumensRequired.toLocaleString()} lm
              </div>
            </div>

            {/* Achieved Lux Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Iluminancia Alcanzada</div>
                <div className="text-3xl font-black text-emerald-700 font-mono mt-1">
                  {calcResults.achievedLux} <span className="text-base font-normal text-slate-600">Lux</span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  Requerido RNE: {requiredLux} Lux ({calcResults.achievedLux >= requiredLux ? '✓ Cumple' : '⚠️ Bajo'})
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                Uniformidad d/hm: {calcResults.spacingRatio} ({calcResults.isUniformityGood ? 'Óptima' : 'Revisar'})
              </div>
            </div>

            {/* Power & Density Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Potencia & Densidad</div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {calcResults.totalPowerW} W <span className="text-xs font-normal text-slate-500">({(calcResults.totalPowerW / 1000).toFixed(2)} kW)</span>
                </div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">
                  {calcResults.powerDensity} W/m² (Máx 10.0)
                </div>
              </div>
              <div className="mt-2 text-[11px] text-emerald-600 font-semibold border-t border-slate-100 pt-2">
                ✓ Alta eficiencia energética
              </div>
            </div>

          </div>

          {/* 2D Interactive Layout Visualizer */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Grid3X3 className="h-4 w-4 text-amber-400" />
                <span>Plano de Distribución Espacial ({lengthM}m × {widthM}m)</span>
              </span>
              <span className="font-mono text-[11px] text-amber-400">
                Separación: dx = {calcResults.spacingX}m | dy = {calcResults.spacingY}m | Pared = {calcResults.wallDistanceX}m / {calcResults.wallDistanceY}m
              </span>
            </div>

            {/* Grid Box */}
            <div className="relative w-full h-44 rounded-xl border border-slate-700 bg-slate-950/80 p-4 flex flex-col justify-between overflow-hidden">
              {/* Render luminaires as glowing points */}
              <div 
                className="w-full h-full grid gap-2 items-center justify-items-center"
                style={{
                  gridTemplateColumns: `repeat(${calcResults.Nx}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${calcResults.Ny}, minmax(0, 1fr))`
                }}
              >
                {Array.from({ length: calcResults.totalFocosCalculated }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center justify-center animate-pulse">
                    <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-950">
                      💡
                    </div>
                  </div>
                ))}
              </div>

              {/* Dimension markers */}
              <div className="absolute bottom-1 left-3 text-[9px] font-mono text-slate-400">
                Largo: {lengthM} m (dx={calcResults.spacingX}m)
              </div>
              <div className="absolute top-1 right-3 text-[9px] font-mono text-slate-400">
                Ancho: {widthM} m (dy={calcResults.spacingY}m)
              </div>
            </div>
          </div>

          {/* Action to add to diagnostic */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              Cálculo conforme a la norma técnica <strong>RNE EM.010</strong> y CIE.
            </span>
            <button
              type="button"
              onClick={handleAddToDiagnostic}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Ambiente en el Diagnóstico</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
