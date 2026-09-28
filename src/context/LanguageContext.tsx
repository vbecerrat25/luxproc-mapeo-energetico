import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Navigation / Tabs
    'nav.dashboard': 'Panel Ejecutivo',
    'nav.general': 'Datos & Tarifas',
    'nav.receipts': 'Recibos vs Censo',
    'nav.equipment': 'Censo de Cargas',
    'nav.circuits': 'Tableros & CNE',
    'nav.grounding': 'Puesta a Tierra',
    'nav.powerfactor': 'Factor Potencia',
    'nav.lighting': 'Iluminación RNE',
    'nav.solar': 'Solar Fotovoltaica',
    'nav.opportunities': 'Plan de Ahorro',
    'nav.bom': 'Lista Materiales',
    'nav.photos': 'Evidencia Fotos',
    'nav.report': 'Informe Oficial CIP',
    'nav.saved_projects': 'Trabajos Realizados',

    // Header actions
    'header.clean_workspace': 'Limpiar Plataforma',
    'header.clean_confirm_title': '¿Limpiar toda la plataforma web?',
    'header.clean_confirm_desc': 'Se restablecerán todos los datos cargados para iniciar un nuevo proyecto en blanco. Recuerde que puede guardar el proyecto actual en "Trabajos Realizados" antes de limpiar.',
    'header.confirm': 'Sí, Limpiar Todo',
    'header.cancel': 'Cancelar',
    'header.new_project': 'Nuevo Proyecto',
    'header.excel': 'Excel',
    'header.report_btn': 'Informe CIP',
    'header.logout': 'Cerrar Sesión',
    'header.plan_standard': 'Plan Estándar (S/ 30)',
    'header.plan_premium': 'Plan Premium (S/ 60)',
    'header.upgrade': 'Mejorar Plan',

    // Dashboard
    'dash.title': 'Panel de Control Ejecutivo & Peritaje Eléctrico',
    'dash.subtitle': 'Monitoreo normativo CNE, balance de potencia, eficiencia energética y seguridad eléctrica',
    'dash.installed_power': 'Potencia Instalada',
    'dash.max_demand': 'Máxima Demanda',
    'dash.monthly_kwh': 'Consumo Mensual',
    'dash.monthly_cost': 'Costo Mensual Estimado',
    'dash.safety_index': 'Índice de Seguridad CNE',
    'dash.efficiency_index': 'Índice de Eficiencia',
    'dash.annual_savings': 'Ahorro Potencial Anual',
    'dash.clean_btn': 'Limpiar Plataforma para Nuevo Proyecto',
    'dash.clean_banner_title': 'Espacio de Trabajo & Gestión de Proyectos',
    'dash.clean_banner_desc': 'Inicie un peritaje desde cero o limpie los datos previamente guardados en la plataforma con un solo clic.',
    'dash.clean_banner_action': 'Limpiar Plataforma Ahora',
    'dash.saved_badge': 'Máx. 2 trabajos guardados',

    // Saved projects
    'saved.title': 'Trabajos Realizados & Historial de Peritajes',
    'saved.subtitle': 'Almacene hasta 2 proyectos completos con sus respectivos informes técnicos e indicadores normativos CNE.',
    'saved.slots_used': 'Proyectos guardados',
    'saved.save_current': 'Guardar Proyecto Actual',
    'saved.empty_slot': 'Espacio disponible para guardar trabajo',
    'saved.empty_desc': 'Puede guardar el proyecto que se encuentra actualmente en edición en la plataforma.',
    'saved.load': 'Cargar en Plataforma',
    'saved.view_report': 'Ver Informe Técnico',
    'saved.delete': 'Eliminar Trabajo',
    'saved.limit_reached': 'Límite de 2 proyectos alcanzado. Elimine uno para guardar uno nuevo.',
    'saved.saved_success': '¡Proyecto guardado con éxito en Trabajos Realizados!',
    'saved.loaded_success': '¡Proyecto cargado exitosamente en el área de trabajo activa!',
    'saved.deleted_success': 'Trabajo eliminado. Espacio liberado.',

    // Plans / Subscriptions
    'plan.modal_title': 'Planes de Suscripción E-DIAGNOSIS OS',
    'plan.modal_subtitle': 'Elija el plan adecuado para su ejercicio profesional según el Colegio de Ingenieros del Perú (CIP)',
    'plan.standard_title': 'Plan Estándar',
    'plan.standard_price': 'S/ 30',
    'plan.standard_period': 'al mes',
    'plan.premium_title': 'Plan Premium',
    'plan.premium_price': 'S/ 60',
    'plan.premium_period': 'al mes',
    'plan.current_active': 'Plan Activo Actual',
    'plan.select_plan': 'Seleccionar Plan',
    'plan.activate_premium': 'Activar Plan Premium (S/ 60)',
    'plan.activate_standard': 'Cambiar a Plan Estándar (S/ 30)',
    'plan.premium_locked_title': 'Módulo Exclusivo del Plan Premium (S/ 60)',
    'plan.premium_locked_desc': 'Este módulo avanzado requiere la suscripción Premium para cálculos normativos avanzados, simulación de ahorro y peritaje certificado.',

    // General
    'common.active': 'Activo',
    'common.completed': 'Culminado',
    'common.in_progress': 'En Progreso',
    'common.client': 'Cliente / Razón Social',
    'common.engineer': 'Ingeniero Responsable',
    'common.date': 'Fecha',
    'common.status': 'Estado'
  },
  en: {
    // Navigation / Tabs
    'nav.dashboard': 'Executive Dashboard',
    'nav.general': 'Data & Tariffs',
    'nav.receipts': 'Bills vs Census',
    'nav.equipment': 'Equipment Survey',
    'nav.circuits': 'Panels & NEC Code',
    'nav.grounding': 'Grounding System',
    'nav.powerfactor': 'Power Factor',
    'nav.lighting': 'Lighting Study',
    'nav.solar': 'Solar Photovoltaic',
    'nav.opportunities': 'Savings Plan',
    'nav.bom': 'Bill of Materials',
    'nav.photos': 'Photo Evidence',
    'nav.report': 'Official CIP Report',
    'nav.saved_projects': 'Saved Projects',

    // Header actions
    'header.clean_workspace': 'Clean Workspace',
    'header.clean_confirm_title': 'Clear the entire web platform?',
    'header.clean_confirm_desc': 'All current data will be reset to start a fresh blank project. Remember you can save your current project in "Saved Projects" before cleaning.',
    'header.confirm': 'Yes, Reset All',
    'header.cancel': 'Cancel',
    'header.new_project': 'New Project',
    'header.excel': 'Excel',
    'header.report_btn': 'CIP Report',
    'header.logout': 'Log Out',
    'header.plan_standard': 'Standard Plan (S/ 30)',
    'header.plan_premium': 'Premium Plan (S/ 60)',
    'header.upgrade': 'Upgrade Plan',

    // Dashboard
    'dash.title': 'Executive Dashboard & Electrical Audit',
    'dash.subtitle': 'Electrical safety, power balance, energy efficiency and regulatory compliance monitoring',
    'dash.installed_power': 'Installed Power',
    'dash.max_demand': 'Max Demand',
    'dash.monthly_kwh': 'Monthly Consumption',
    'dash.monthly_cost': 'Estimated Monthly Cost',
    'dash.safety_index': 'Safety Index',
    'dash.efficiency_index': 'Efficiency Score',
    'dash.annual_savings': 'Potential Annual Savings',
    'dash.clean_btn': 'Clean Platform for New Project',
    'dash.clean_banner_title': 'Workspace & Project Management',
    'dash.clean_banner_desc': 'Start an electrical audit from scratch or reset previously saved data on the platform with a single click.',
    'dash.clean_banner_action': 'Clean Platform Now',
    'dash.saved_badge': 'Max 2 saved projects',

    // Saved projects
    'saved.title': 'Completed Works & Saved Projects',
    'saved.subtitle': 'Store up to 2 complete projects with their technical reports and regulatory indicators.',
    'saved.slots_used': 'Saved projects',
    'saved.save_current': 'Save Current Project',
    'saved.empty_slot': 'Available slot to save work',
    'saved.empty_desc': 'You can save the project currently being edited into this slot.',
    'saved.load': 'Load into Workspace',
    'saved.view_report': 'View Technical Report',
    'saved.delete': 'Delete Project',
    'saved.limit_reached': '2-project limit reached. Delete one to save a new one.',
    'saved.saved_success': 'Project successfully saved into Saved Projects!',
    'saved.loaded_success': 'Project successfully loaded into active workspace!',
    'saved.deleted_success': 'Project deleted. Slot freed up.',

    // Plans / Subscriptions
    'plan.modal_title': 'E-DIAGNOSIS OS Subscription Plans',
    'plan.modal_subtitle': 'Choose the plan tailored to your engineering and energy audit practice',
    'plan.standard_title': 'Standard Plan',
    'plan.standard_price': 'S/ 30',
    'plan.standard_period': 'per month',
    'plan.premium_title': 'Premium Plan',
    'plan.premium_price': 'S/ 60',
    'plan.premium_period': 'per month',
    'plan.current_active': 'Current Active Plan',
    'plan.select_plan': 'Select Plan',
    'plan.activate_premium': 'Activate Premium Plan (S/ 60)',
    'plan.activate_standard': 'Switch to Standard Plan (S/ 30)',
    'plan.premium_locked_title': 'Premium Exclusive Module (S/ 60)',
    'plan.premium_locked_desc': 'This advanced module requires the Premium subscription for advanced engineering calculations, solar simulation and certified audit reports.',

    // General
    'common.active': 'Active',
    'common.completed': 'Completed',
    'common.in_progress': 'In Progress',
    'common.client': 'Client / Company Name',
    'common.engineer': 'Responsible Engineer',
    'common.date': 'Date',
    'common.status': 'Status'
  }
};

const LANGUAGE_STORAGE_KEY = 'e_diagnosis_language_preference';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'es' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const dict = translations[language] || translations.es;
    return dict[key] || defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
