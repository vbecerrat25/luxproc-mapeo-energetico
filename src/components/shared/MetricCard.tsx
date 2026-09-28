import React, { ReactNode } from 'react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  highlightColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  highlightColor = 'slate',
  className = ''
}) => {
  const colorMap = {
    blue: 'border-slate-100 bg-white text-slate-800',
    emerald: 'border-slate-100 bg-white text-slate-800',
    amber: 'border-slate-100 bg-white text-slate-800',
    rose: 'border-slate-100 bg-white text-slate-800',
    indigo: 'border-slate-100 bg-white text-slate-800',
    slate: 'border-slate-100 bg-white text-slate-900'
  };

  const iconBgMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    slate: 'bg-slate-100 text-slate-700'
  };

  return (
    <div 
      id={id}
      className={`relative rounded-2xl border p-3.5 sm:p-5 lg:p-6 shadow-xs transition-all hover:shadow-sm bg-white ${colorMap[highlightColor]} ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {icon && (
          <div className={`flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ${iconBgMap[highlightColor]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 sm:mt-3 flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
        <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-sans">
          {value}
        </span>
        {unit && (
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 text-[11px] sm:text-xs">
          {subtitle && <span className="text-slate-500 font-medium truncate">{subtitle}</span>}
          {trend && (
            <span className={`font-bold px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] shrink-0 ${
              trend.isNeutral ? 'bg-slate-100 text-slate-600' : (trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')
            }`}>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
