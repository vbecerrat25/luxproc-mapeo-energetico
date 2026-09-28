import React from 'react';
import { DiagnosticProvider, useDiagnostic } from './context/DiagnosticContext';
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
import { LoginScreen } from './components/auth/LoginScreen';

const MainContent: React.FC = () => {
  const { activeTab } = useDiagnostic();

  const normalizedTab = (activeTab || 'dashboard').toLowerCase().replace(/_/g, '');

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
    </div>
  );
};

export default function App() {
  return (
    <DiagnosticProvider>
      <AppContainer />
    </DiagnosticProvider>
  );
}
