import React from 'react';
import { TrafficLight } from '../../types';
import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface TrafficBadgeProps {
  status: TrafficLight;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const TrafficBadge: React.FC<TrafficBadgeProps> = ({ 
  status, 
  label, 
  size = 'md',
  showIcon = true 
}) => {
  const { language } = useLanguage();
  const tr = (es: string, en: string, pt: string) =>
    language === 'en' ? en : language === 'pt' ? pt : es;

  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = CheckCircle2;
  let text = label || tr('Adecuado', 'Compliant', 'Adequado');

  if (status === 'REVISAR') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
    text = label || tr('Revisar', 'Review', 'Revisar');
  } else if (status === 'NO_ADECUADO') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = AlertOctagon;
    text = label || tr('No Adecuado', 'Non-Compliant', 'Não Adequado');
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses[size]} whitespace-nowrap transition-colors`}>
      {showIcon && <Icon size={iconSizes[size]} className="shrink-0" />}
      <span>{text}</span>
    </span>
  );
};
