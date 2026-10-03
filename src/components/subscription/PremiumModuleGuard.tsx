import React from 'react';
import { useDiagnostic } from '../../context/DiagnosticContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Lock, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Layers
} from 'lucide-react';

interface PremiumModuleGuardProps {
  moduleName: string;
  moduleDescription: string;
  features: string[];
}

export const PremiumModuleGuard: React.FC<PremiumModuleGuardProps> = ({
  moduleName,
  moduleDescription,
  features
}) => {
  const { setIsSubscriptionModalOpen } = useDiagnostic();
  const { t, language } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Locked Module Banner Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-indigo-800/40 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-5">
          {/* Badge & Lock Icon */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider shadow-sm">
            <Lock className="w-3.5 h-3.5" />
            <span>{t('plan.premium_locked_title', 'Módulo Exclusivo del Plan Premium (S/ 60)')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {moduleName}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {moduleDescription}
          </p>

          {/* Pricing Highlight Pill */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
            <span className="text-xs font-medium text-slate-200">
              {language === 'es' ? 'Acceso ilimitado por solo:' : 'Full access for only:'}
            </span>
            <span className="text-xl font-black text-amber-400">S/ 60</span>
            <span className="text-xs font-semibold text-slate-300">/ {language === 'es' ? 'mes' : 'month'}</span>
          </div>

          {/* Feature List */}
          <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 text-left space-y-2.5 max-w-lg mx-auto">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              {language === 'es' ? 'Capacidades avanzadas incluidas:' : 'Included advanced capabilities:'}
            </span>
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Upgrade CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>{t('plan.activate_premium', 'Activar Plan Premium (S/ 60)')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer"
            >
              {language === 'es' ? 'Ver Comparativa de Planes' : 'Compare All Plans'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
