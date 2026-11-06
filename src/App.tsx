/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EmergenxProvider } from './context/EmergenxContext';
import { SplashScreen } from './components/layout/SplashScreen';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { EmergencyActivationModal } from './components/modals/EmergencyActivationModal';
import { AuthRoleModal } from './components/modals/AuthRoleModal';

// Views
import { OverviewDashboard } from './components/views/OverviewDashboard';
import { LiveEmergencyMapView } from './components/views/LiveEmergencyMapView';
import { EmergencyRequestsView } from './components/views/EmergencyRequestsView';
import { VehicleManagementView } from './components/views/VehicleManagementView';
import { AiDecisionEngineView } from './components/views/AiDecisionEngineView';
import { ConflictResolverView } from './components/views/ConflictResolverView';
import { RouteOptimizationView } from './components/views/RouteOptimizationView';
import { TrafficIntelligenceView } from './components/views/TrafficIntelligenceView';
import { GreenCorridorView } from './components/views/GreenCorridorView';
import { HospitalCoordinationView } from './components/views/HospitalCoordinationView';
import { NetworkResilienceView } from './components/views/NetworkResilienceView';
import { AnalyticsReportsView } from './components/views/AnalyticsReportsView';
import { SimulationLabView } from './components/views/SimulationLabView';
import { NotificationCenterView } from './components/views/NotificationCenterView';
import { SecurityVerificationView } from './components/views/SecurityVerificationView';
import { Menu } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState('overview');
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  React.useEffect(() => {
    const handleQuota = () => setIsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  return (
    <EmergenxProvider>
      {/* Google Maps Quota Warning Banner */}
      {isQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Professional Brand Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <div className="flex flex-col min-h-screen bg-[#F5F7F9] text-[#292D32] font-sans selection:bg-[#32B8BF] selection:text-white">
        {/* Top Navigation Bar adhering strictly to 3-zone contract */}
        <Header
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenActivationModal={() => setIsActivationModalOpen(true)}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
        />

        {/* Mobile secondary bar for opening sidebar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#E6EAEE] text-xs">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center gap-2 text-[#292D32] hover:text-[#0A699F] cursor-pointer font-medium"
          >
            <Menu className="w-4 h-4 text-[#16A4E8]" />
            <span>Modules Menu</span>
          </button>
          <span className="text-[10px] font-mono text-[#858F99] uppercase">
            View: {currentView.replace('_', ' ')}
          </span>
        </div>

        {/* Main Content Workspace Layout: Sidebar + Viewport */}
        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-[1560px] mx-auto w-full">
            {currentView === 'overview' && (
              <OverviewDashboard
                onNavigate={setCurrentView}
                onOpenActivationModal={() => setIsActivationModalOpen(true)}
              />
            )}

            {currentView === 'map' && (
              <LiveEmergencyMapView onOpenActivation={() => setIsActivationModalOpen(true)} />
            )}

            {currentView === 'requests' && (
              <EmergencyRequestsView
                onOpenActivation={() => setIsActivationModalOpen(true)}
                onNavigate={setCurrentView}
              />
            )}

            {currentView === 'vehicles' && <VehicleManagementView />}

            {currentView === 'ai_engine' && (
              <AiDecisionEngineView onNavigate={setCurrentView} />
            )}

            {currentView === 'conflicts' && <ConflictResolverView />}

            {currentView === 'routes' && <RouteOptimizationView />}

            {currentView === 'traffic' && <TrafficIntelligenceView />}

            {currentView === 'green_corridor' && <GreenCorridorView />}

            {currentView === 'hospitals' && <HospitalCoordinationView />}

            {currentView === 'network' && <NetworkResilienceView />}

            {currentView === 'analytics' && <AnalyticsReportsView />}

            {currentView === 'simulation_lab' && (
              <SimulationLabView onNavigate={setCurrentView} />
            )}

            {currentView === 'notifications' && <NotificationCenterView />}

            {currentView === 'security' && <SecurityVerificationView />}
          </main>
        </div>

        {/* Global Modals */}
        <EmergencyActivationModal
          isOpen={isActivationModalOpen}
          onClose={() => setIsActivationModalOpen(false)}
        />

        <AuthRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
        />
      </div>
    </EmergenxProvider>
  );
}
