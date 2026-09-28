import React, { useState, useRef } from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { PhotoEvidenceRecord } from '../../types';
import { 
  Camera, 
  Plus, 
  Trash2, 
  Edit3, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Image as ImageIcon 
} from 'lucide-react';

export const PhotosTab: React.FC = () => {
  const {
    diagnostic,
    addPhoto,
    deletePhoto
  } = useDiagnostic();

  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<{
    title: string;
    areaTag: string;
    category: string;
    severity: 'CRITICO' | 'ALTO' | 'MEDIO' | 'LEVE' | 'BUENA_PRACTICA';
    observation: string;
    correctiveAction: string;
    imageUrl: string;
  }>({
    title: 'Cableado expuesto en tablero de fuerza',
    areaTag: 'Planta de Producción',
    category: 'Tableros y Protecciones',
    severity: 'CRITICO',
    observation: 'Conductores sin peinador y borne termomagnético recalentado por falso contacto',
    correctiveAction: 'Reemplazo de barra colectora, ajuste con llave dinamométrica y peinado reglamentario',
    imageUrl: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setFormState(prev => ({
          ...prev,
          imageUrl: evt.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addPhoto({
      title: formState.title,
      areaTag: formState.areaTag,
      category: formState.category as any,
      severity: formState.severity,
      observation: formState.observation,
      correctiveAction: formState.correctiveAction,
      imageUrl: formState.imageUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(false);
  };

  const severityColors = {
    CRITICO: 'bg-rose-100 text-rose-800 border-rose-200',
    ALTO: 'bg-amber-100 text-amber-800 border-amber-200',
    MEDIO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LEVE: 'bg-blue-100 text-blue-800 border-blue-200',
    BUENA_PRACTICA: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-display">
            Panel Fotográfico de Campo y Hallazgos Técnicos
          </h2>
          <p className="text-xs text-slate-500">
            Registro visual de no conformidades, estados de tableros, pozos a tierra, maquinaria y medidas correctivas
          </p>
        </div>

        <button
          onClick={() => {
            setFormState({
              title: '',
              areaTag: 'Planta Principal',
              category: 'Tableros y Protecciones',
              severity: 'CRITICO',
              observation: '',
              correctiveAction: '',
              imageUrl: ''
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm transition-colors"
        >
          <Camera size={14} />
          <span>+ Agregar Foto / Hallazgo</span>
        </button>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(diagnostic.photos || []).map((photo) => (
          <div
            key={photo.id}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Image Preview Container */}
            <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
              <img
                src={photo.imageUrl || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'}
                alt={photo.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className={`absolute top-3 left-3 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border shadow-xs ${severityColors[photo.severity || 'MEDIO']}`}>
                {photo.severity || 'OBSERVACIÓN'}
              </span>
              <span className="absolute top-3 right-3 rounded-md bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-mono text-white font-bold">
                {photo.date || 'Inspección'}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-800 text-[11px]">
                    {photo.areaTag} • {photo.category}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{photo.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  <strong className="text-slate-800">Hallazgo: </strong>{photo.observation}
                </p>
                {photo.correctiveAction && (
                  <p className="text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-[11px] leading-relaxed">
                    <strong>Acción Correctiva: </strong>{photo.correctiveAction}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">ID: {photo.id.substring(0, 8)}</span>
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Eliminar foto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {diagnostic.photos.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
            No hay evidencia fotográfica registrada. Haga clic en "+ Agregar Foto / Hallazgo" para registrar observaciones periciales en campo.
          </div>
        )}
      </div>

      {/* Add Photo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 my-8">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Registrar Nueva Evidencia Fotográfica
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título de la Foto / Hallazgo *</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={e => setFormState({ ...formState, title: e.target.value })}
                  placeholder="Ej. Conexión floja en contactor de compresor"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Área o Ubicación</label>
                  <input
                    type="text"
                    value={formState.areaTag}
                    onChange={e => setFormState({ ...formState, areaTag: e.target.value })}
                    placeholder="Área de Armado / TG"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nivel de Criticidad</label>
                  <select
                    value={formState.severity}
                    onChange={e => setFormState({ ...formState, severity: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="CRITICO">🚨 Crítico (Riesgo inminente)</option>
                    <option value="ALTO">⚠️ Alto (Incumple CNE)</option>
                    <option value="MEDIO">⚡ Medio (Desgaste / Regular)</option>
                    <option value="LEVE">ℹ️ Leve (Mejora estética/rotulado)</option>
                    <option value="BUENA_PRACTICA">✓ Buena Práctica Instalada</option>
                  </select>
                </div>
              </div>

              {/* Upload image / URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cargar Imagen o Ingresar URL</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <UploadCloud size={14} />
                    <span>Seleccionar Archivo</span>
                  </button>
                  <input
                    type="text"
                    value={formState.imageUrl}
                    onChange={e => setFormState({ ...formState, imageUrl: e.target.value })}
                    placeholder="https://... o deje vacío para imagen predeterminada"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
                {formState.imageUrl && (
                  <div className="mt-2 h-28 w-full rounded-lg bg-slate-100 overflow-hidden">
                    <img src={formState.imageUrl} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observación Técnica de Campo *</label>
                <textarea
                  rows={2}
                  value={formState.observation}
                  onChange={e => setFormState({ ...formState, observation: e.target.value })}
                  placeholder="Detalles sobre temperatura anormal, falta de rotulado, sulfatación, etc."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Acción Correctiva Recomendada</label>
                <input
                  type="text"
                  value={formState.correctiveAction}
                  onChange={e => setFormState({ ...formState, correctiveAction: e.target.value })}
                  placeholder="Ej. Reemplazar interruptor por curva D de 3x25A y ordenar peinado"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  Guardar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
