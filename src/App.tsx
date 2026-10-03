import React from 'react';
import { DiagnosticProvider, useDiagnostic } from './context/DiagnosticContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNavBar } from './components/layout/MobileNav';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { GeneralDataTab } from './components/general/GeneralDataTab';
import { ReceiptsTab } from './components/receipts/ReceiptsTab';
import { EquipmentTab } from './components/equipment/EquipmentTab';
import { CircuitsTab } from './components/circuits/CircuitsTab';
import { GroundingTab } from './components/grounding/GroundingTab';
import { PowerFactorTab } from './components/powerfactor/PowerFactorTab';
import { LightingTab } from './components/lighting/LightingTab';
import { SolarTab } from './components/solar/SolarTab';
import { OpportunitiesTab } from './components/opportunities/OpportunitiesTab';
import { BomTab } from './components/bom/BomTab';
import { PhotosTab } from './components/photos/PhotosTab';
import { ReportTab } from './components/report/ReportTab';
import { SavedProjectsTab } from './components/saved/SavedProjectsTab';
import { MasterAuditModule } from './components/master/MasterAuditModule';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';
import { PremiumModuleGuard } from './components/subscription/PremiumModuleGuard';
import { LoginScreen } from './components/auth/LoginScreen';

const MainContent: React.FC = () => {
  const { activeTab, subscriptionPlan, isModulePremium } = useDiagnostic();
  const { language } = useLanguage();

  const normalizedTab = (activeTab || 'dashboard').toLowerCase().replace(/_/g, '');

  // Guard for premium modules when user is on Standard plan (S/ 30)
  if (subscriptionPlan === 'ESTANDAR' && isModulePremium(normalizedTab)) {
    const getGuardDetails = () => {
      switch (normalizedTab) {
        case 'powerfactor':
        case 'fp':
        case 'factorpotencia':
          return {
            name: language === 'es' ? 'Compensación de Factor de Potencia (cos φ)' : 'Power Factor Compensation (cos φ)',
            desc: language === 'es' 
              ? 'Cálculo de banco de condensadores automáticos para eliminar penalidades por energía reactiva inductiva según Osinergmin.'
              : 'Automatic capacitor bank dimensioning to eliminate reactive power penalties.',
            features: [
              language === 'es' ? 'Cálculo de kVAR necesarios para elevar cos φ a 0.98' : 'Required kVAR calculation to reach cos φ 0.98',
              language === 'es' ? 'Eliminación total de multas en facturación eléctrica' : 'Full elimination of reactive power utility penalties',
              language === 'es' ? 'Retorno de inversión (Payback) y presupuesto estimado' : 'Investment payback analysis and estimated budget'
            ]
          };
        case 'lighting':
        case 'iluminacion':
        case 'focos':
          return {
            name: language === 'es' ? 'Estudio de Iluminación & Luxometría (RNE EM.010)' : 'Lighting Study & Lux Measurement (RNE EM.010)',
            desc: language === 'es'
              ? 'Evaluación de niveles de iluminancia (Lux) y cálculo de VEEI (W/m²-100 Lux) para cumplimiento del Reglamento Nacional de Edificaciones.'
              : 'Evaluation of illuminance levels (Lux) and VEEI energy efficiency calculation.',
            features: [
              language === 'es' ? 'Verificación de Lux mínimos exigidos por área de trabajo' : 'Minimum required Lux verification by workspace',
              language === 'es' ? 'Cálculo de Eficiencia Energética de la Instalación (VEEI)' : 'Energy Efficiency Index of the Installation (VEEI)',
              language === 'es' ? 'Propuesta de retrofit tecnológico a luminarias LED' : 'Technology retrofit proposal to LED fixtures'
            ]
          };
        case 'solar':
        case 'fotovoltaica':
          return {
            name: language === 'es' ? 'Simulador Solar Fotovoltaico para Autoconsumo' : 'Solar Photovoltaic Self-Consumption Simulator',
            desc: language === 'es'
              ? 'Dimensionamiento técnico y financiero de sistemas solares fotovoltaicos conectados a la red con cálculo de radiación HSP del Perú.'
              : 'Technical and financial dimensioning of grid-tied solar PV systems using Peru solar radiation data.',
            features: [
              language === 'es' ? 'Dimensionamiento de paneles Wp e inversor trifásico' : 'Panel wattage and three-phase inverter sizing',
              language === 'es' ? 'Simulación de generación mensual kWh y fracción solar' : 'Monthly generation simulation and solar fraction',
              language === 'es' ? 'Cálculo de ahorro económico, Payback y reducción de CO2' : 'Financial savings, Payback and CO2 reduction calculations'
            ]
          };
        case 'opportunities':
        case 'ahorro':
        case 'plandeahorro':
          return {
            name: language === 'es' ? 'Matriz Inteligente de Medidas de Ahorro Energético' : 'Smart Energy Savings Opportunities Matrix',
            desc: language === 'es'
              ? 'Priorización de medidas técnico-económicas con evaluación de CAPEX, OPEX, VAN y TIR para el cliente.'
              : 'Prioritization of energy-saving measures with CAPEX, OPEX, NPV and IRR evaluation.',
            features: [
              language === 'es' ? 'Cálculo automático de ahorros anuales en soles (S/)' : 'Automated annual savings calculation in Soles (S/)',
              language === 'es' ? 'Periodo de recuperación de inversión simple y descontado' : 'Simple and discounted payback periods',
              language === 'es' ? 'Plan de acción priorizado para presentación ejecutiva' : 'Prioritized action plan for executive presentation'
            ]
          };
        case 'bom':
        case 'materiales':
          return {
            name: language === 'es' ? 'Lista de Materiales (BOM) & Presupuesto Comercial' : 'Bill of Materials (BOM) & Commercial Budget',
            desc: language === 'es'
              ? 'Cálculo automatizado de conductores, interruptores termomagnéticos, diferenciales y puestas a tierra con precios referenciales en soles.'
              : 'Automated list of conductors, circuit breakers, RCDs and grounding materials with reference prices.',
            features: [
              language === 'es' ? 'Cómputo métrico de conductores y canalizaciones CNE' : 'Metric calculation of conductors and CNE conduits',
              language === 'es' ? 'Consolidación de tableros eléctricos y protecciones' : 'Consolidation of electrical panels and protections',
              language === 'es' ? 'Presupuesto preliminar de obra con IGV desglosado' : 'Preliminary budget breakdown with taxes'
            ]
          };
        default:
          return {
            name: language === 'es' ? 'Módulo Avanzado' : 'Advanced Module',
            desc: language === 'es' ? 'Disponible exclusivamente con la suscripción Premium.' : 'Available exclusively on Premium subscription.',
            features: [
              language === 'es' ? 'Cálculos de ingeniería de precisión' : 'Precision engineering calculations',
              language === 'es' ? 'Cumplimiento normativo estricto CNE' : 'Strict regulatory compliance',
              language === 'es' ? 'Informes ejecutivos completos' : 'Complete executive reports'
            ]
          };
      }
    };

    const details = getGuardDetails();
    return (
      <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto bg-[#f8f9fb] min-h-screen">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <PremiumModuleGuard 
            moduleName={details.name}
            moduleDescription={details.desc}
            features={details.features}
          />
        </div>
      </main>
    );
  }

  const renderTabContent = () => {
    switch (normalizedTab) {
      case 'dashboard':
        return <ExecutiveDashboard />;
      case 'general':
      case 'datos':
      case 'datostarifa':
        return <GeneralDataTab />;
      case 'receipts':
      case 'recibos':
        return <ReceiptsTab />;
      case 'equipment':
      case 'censo':
      case 'cargas':
        return <EquipmentTab />;
      case 'circuits':
      case 'tableros':
      case 'cne':
        return <CircuitsTab />;
      case 'grounding':
      case 'puestaatierra':
      case 'pat':
        return <GroundingTab />;
      case 'powerfactor':
      case 'fp':
      case 'factorpotencia':
        return <PowerFactorTab />;
      case 'lighting':
      case 'iluminacion':
      case 'focos':
        return <LightingTab />;
      case 'solar':
      case 'fotovoltaica':
        return <SolarTab />;
      case 'opportunities':
      case 'ahorro':
      case 'plandeahorro':
        return <OpportunitiesTab />;
      case 'bom':
      case 'materiales':
        return <BomTab />;
      case 'photos':
      case 'evidencia':
        return <PhotosTab />;
      case 'report':
      case 'informe':
      case 'pdf':
        return <ReportTab />;
      case 'saved':
      case 'savedprojects':
      case 'trabajos':
      case 'trabajosrealizados':
        return <SavedProjectsTab />;
      case 'master':
      case 'masterregistry':
      case 'padron':
        return <MasterAuditModule />;
      default:
        return <ExecutiveDashboard />;
    }
  };

  return (
    <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto bg-[#f8f9fb] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {renderTabContent()}
      </div>
    </main>
  );
};

const AppContainer: React.FC = () => {
  const { currentUser, setCurrentUser } = useDiagnostic();

  if (!currentUser) {
    return (
      <LoginScreen 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }} 
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fb] text-slate-800 selection:bg-indigo-500 selection:text-white font-sans">
      <Header />
      <MobileNavBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
      <SubscriptionModal />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <DiagnosticProvider>
        <AppContainer />
      </DiagnosticProvider>
    </LanguageProvider>
  );
}
