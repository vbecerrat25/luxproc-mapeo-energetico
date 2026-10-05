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
import { WiringVerificationTab } from './components/wiring/WiringVerificationTab';
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

  const tr = (es: string, en: string, pt: string) => {
    if (language === 'en') return en;
    if (language === 'pt') return pt;
    return es;
  };

  const normalizedTab = (activeTab || 'dashboard').toLowerCase().replace(/_/g, '');

  // Guard for premium modules when user is on Standard plan (S/ 20)
  if (subscriptionPlan === 'ESTANDAR' && isModulePremium(normalizedTab)) {
    const getGuardDetails = () => {
      switch (normalizedTab) {
        case 'powerfactor':
        case 'fp':
        case 'factorpotencia':
          return {
            name: tr('Compensación de Factor de Potencia (cos φ)', 'Power Factor Compensation (cos φ)', 'Compensação de Fator de Potência (cos φ)'),
            desc: tr(
              'Cálculo de banco de condensadores automáticos para eliminar penalidades por energía reactiva inductiva según Osinergmin.',
              'Automatic capacitor bank dimensioning to eliminate reactive power penalties.',
              'Dimensionamento de banco de capacitores automáticos para eliminar multas por energia reativa indutiva.'
            ),
            features: [
              tr('Cálculo de kVAR necesarios para elevar cos φ a 0.98', 'Required kVAR calculation to reach cos φ 0.98', 'Cálculo de kVAR necessários para elevar cos φ a 0.98'),
              tr('Eliminación total de multas en facturación eléctrica', 'Full elimination of reactive power utility penalties', 'Eliminação total de multas na fatura de energia'),
              tr('Retorno de inversión (Payback) y presupuesto estimado', 'Investment payback analysis and estimated budget', 'Retorno sobre o investimento (Payback) e orçamento estimado')
            ]
          };
        case 'lighting':
        case 'iluminacion':
        case 'focos':
          return {
            name: tr('Estudio de Iluminación & Luxometría (RNE EM.010)', 'Lighting Study & Lux Measurement (RNE EM.010)', 'Estudo de Iluminação e Luximetria (RNE EM.010)'),
            desc: tr(
              'Evaluación de niveles de iluminancia (Lux) y cálculo de VEEI (W/m²-100 Lux) para cumplimiento del Reglamento Nacional de Edificaciones.',
              'Evaluation of illuminance levels (Lux) and VEEI energy efficiency calculation.',
              'Avaliação dos níveis de iluminância (Lux) e cálculo de eficiência energética da iluminação.'
            ),
            features: [
              tr('Verificación de Lux mínimos exigidos por área de trabajo', 'Minimum required Lux verification by workspace', 'Verificação de Lux mínimos exigidos por área de trabalho'),
              tr('Cálculo de Eficiencia Energética de la Instalación (VEEI)', 'Energy Efficiency Index of the Installation (VEEI)', 'Cálculo de Eficiência Energética da Instalação (VEEI)'),
              tr('Propuesta de retrofit tecnológico a luminarias LED', 'Technology retrofit proposal to LED fixtures', 'Proposta de retrofit tecnológico para luminárias LED')
            ]
          };
        case 'solar':
        case 'fotovoltaica':
          return {
            name: tr('Simulador Solar Fotovoltaico para Autoconsumo', 'Solar Photovoltaic Self-Consumption Simulator', 'Simulador Solar Fotovoltaico para Autoconsumo'),
            desc: tr(
              'Dimensionamiento técnico y financiero de sistemas solares fotovoltaicos conectados a la red con cálculo de radiación HSP del Perú.',
              'Technical and financial dimensioning of grid-tied solar PV systems using Peru solar radiation data.',
              'Dimensionamento técnico e financeiro de sistemas solares fotovoltaicos conectados à rede com dados de radiação solar.'
            ),
            features: [
              tr('Dimensionamiento de paneles Wp e inversor trifásico', 'Panel wattage and three-phase inverter sizing', 'Dimensionamento de painéis Wp e inversor trifásico'),
              tr('Simulación de generación mensual kWh y fracción solar', 'Monthly generation simulation and solar fraction', 'Simulação de geração mensal kWh e fração solar'),
              tr('Cálculo de ahorro económico, Payback y reducción de CO2', 'Financial savings, Payback and CO2 reduction calculations', 'Cálculo de economia financeira, Payback e redução de CO2')
            ]
          };
        case 'opportunities':
        case 'ahorro':
        case 'plandeahorro':
          return {
            name: tr('Matriz Inteligente de Medidas de Ahorro Energético', 'Smart Energy Savings Opportunities Matrix', 'Matriz Inteligente de Oportunidades de Economia de Energia'),
            desc: tr(
              'Priorización de medidas técnico-económicas con evaluación de CAPEX, OPEX, VAN y TIR para el cliente.',
              'Prioritization of energy-saving measures with CAPEX, OPEX, NPV and IRR evaluation.',
              'Priorização de medidas técnico-econômicas com avaliação de CAPEX, OPEX, VPL e TIR.'
            ),
            features: [
              tr('Cálculo automático de ahorros anuales en soles (S/)', 'Automated annual savings calculation in Soles (S/)', 'Cálculo automático de economia anual em Soles (S/)'),
              tr('Periodo de recuperación de inversión simple y descontado', 'Simple and discounted payback periods', 'Período de retorno do investimento simples e descontado'),
              tr('Plan de acción priorizado para presentación ejecutiva', 'Prioritized action plan for executive presentation', 'Plano de ação priorizado para apresentação executiva')
            ]
          };
        case 'bom':
        case 'materiales':
          return {
            name: tr('Lista de Materiales (BOM) & Presupuesto Comercial', 'Bill of Materials (BOM) & Commercial Budget', 'Lista de Materiais (BOM) e Orçamento Comercial'),
            desc: tr(
              'Cálculo automatizado de conductores, interruptores termomagnéticos, diferenciales y puestas a tierra con precios referenciales en soles.',
              'Automated list of conductors, circuit breakers, RCDs and grounding materials with reference prices.',
              'Cálculo automatizado de condutores, disjuntores termomagnéticos, diferenciais DR e aterramento com preços de referência.'
            ),
            features: [
              tr('Cómputo métrico de conductores y canalizaciones CNE', 'Metric calculation of conductors and CNE conduits', 'Cômputo métrico de condutores e eletrodutos'),
              tr('Consolidación de tableros eléctricos y protecciones', 'Consolidation of electrical panels and protections', 'Consolidação de quadros elétricos e proteções'),
              tr('Presupuesto preliminar de obra con IGV desglosado', 'Preliminary budget breakdown with taxes', 'Orçamento preliminar de obra com impostos detalhados')
            ]
          };
        default:
          return {
            name: tr('Módulo Avanzado', 'Advanced Module', 'Módulo Avançado'),
            desc: tr('Disponible exclusivamente con la suscripción Premium.', 'Available exclusively on Premium subscription.', 'Disponível exclusivamente na assinatura Premium.'),
            features: [
              tr('Cálculos de ingeniería de precisión', 'Precision engineering calculations', 'Cálculos de engenharia de precisão'),
              tr('Cumplimiento normativo estricto CNE', 'Strict regulatory compliance', 'Conformidade normativa rigorosa'),
              tr('Informes ejecutivos completos', 'Complete executive reports', 'Relatórios executivos completos')
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
      case 'wiring':
      case 'cableado':
      case 'llaves':
      case 'conexion':
        return <WiringVerificationTab />;
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
