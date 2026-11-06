import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Flame,
  Truck,
  BrainCircuit,
  Route,
  Activity,
  GitFork,
  Hospital,
  Wifi,
  BarChart3,
  FlaskConical,
  Bell,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';
import { EmergenxLogo } from '../brand/EmergenxLogo';

interface SidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
}) => {
  const {
    isSimulating,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
    resetSimulation,
    requests,
    vehicles,
    notifications,
  } = useEmergenx();

  const activeVehiclesCount = vehicles.filter((v) => v.status === 'en_route').length;
  const activeRequestsCount = requests.filter((r) => r.status === 'active').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'overview', label: 'Command Overview', icon: LayoutDashboard, iconColor: 'text-[#16A4E8]' },
    { id: 'map', label: 'Live Emergency Map', icon: MapPin, count: activeVehiclesCount, iconColor: 'text-[#FE595B]' },
    { id: 'requests', label: 'Emergency Requests', icon: Flame, count: activeRequestsCount, iconColor: 'text-[#F5B942]' },
    { id: 'vehicles', label: 'Vehicle Management', icon: Truck, iconColor: 'text-[#32B8BF]' },
    { id: 'routes', label: 'Route Control & Scoring', icon: Route, iconColor: 'text-[#0A699F]', badge: 'NEW' },
    { id: 'ai_engine', label: 'AI Decision Engine', icon: BrainCircuit, badge: 'CORE', iconColor: 'text-[#C85AD7]' },
    { id: 'conflicts', label: 'Conflict Resolver', icon: GitFork, badge: 'KEY', iconColor: 'text-[#FE595B]' },
    { id: 'traffic', label: 'Traffic Intelligence', icon: Activity, iconColor: 'text-[#16A4E8]' },
    { id: 'green_corridor', label: 'Green Corridor Sim', icon: GitFork, iconColor: 'text-[#28A66A]' },
    { id: 'hospitals', label: 'Hospital Coordination', icon: Hospital, iconColor: 'text-[#32B8BF]' },
    { id: 'network', label: 'Network & GPS Resilience', icon: Wifi, iconColor: 'text-[#0A699F]' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, iconColor: 'text-[#16A4E8]' },
    { id: 'simulation_lab', label: 'Simulation Lab', icon: FlaskConical, badge: 'TEST', iconColor: 'text-[#C85AD7]' },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadNotifsCount, iconColor: 'text-[#F5B942]' },
    { id: 'security', label: 'Security & Verification', icon: ShieldCheck, iconColor: 'text-[#28A66A]' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-64 bg-white border-r border-[#E6EAEE] flex flex-col z-50 transition-transform duration-200 ease-in-out shadow-xs ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in Sidebar */}
        <div className="p-4 border-b border-[#E6EAEE] lg:hidden flex items-center justify-between">
          <EmergenxLogo size="sm" />
          <button
            onClick={onCloseMobile}
            className="text-xs text-[#858F99] hover:text-[#292D32] p-1 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-[#858F99] uppercase tracking-wider font-mono">
            Navigation Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer group text-left ${
                  isActive
                    ? 'bg-[#EBF5FB] text-[#0A699F] font-semibold border-l-3 border-[#16A4E8]'
                    : 'text-[#292D32] hover:bg-[#F5F7F9] border-l-3 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#16A4E8]' : item.iconColor
                    }`}
                  />
                  <span className={`truncate ${isActive ? 'text-[#0A699F] font-bold' : 'text-[#292D32]'}`}>
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#EBF5FB] text-[#0A699F] border border-[#91C4FC] font-bold">
                      {item.badge}
                    </span>
                  )}
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#FE595B] text-white font-bold">
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Real-time Simulation Control Bar at bottom of sidebar */}
        <div className="p-3 bg-[#F5F7F9] border-t border-[#E6EAEE] select-none m-2 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-[#858F99] flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSimulating ? 'bg-[#28A66A] animate-pulse' : 'bg-[#F5B942]'
                }`}
              />
              <span className="font-semibold text-[#292D32]">
                {isSimulating ? `RUNNING (${simulationSpeed}x)` : 'PAUSED'}
              </span>
            </span>
            <button
              onClick={resetSimulation}
              title="Reset Simulation State"
              className="text-[10px] font-mono text-[#858F99] hover:text-[#292D32] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => toggleSimulation()}
              className={`col-span-2 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs ${
                isSimulating
                  ? 'bg-white hover:bg-slate-50 text-[#F5B942] border border-[#E6EAEE]'
                  : 'bg-[#28A66A] hover:bg-[#23925c] text-white'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-3 h-3" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" /> Resume
                </>
              )}
            </button>

            <button
              onClick={() => setSimulationSpeed(simulationSpeed === 1 ? 2 : simulationSpeed === 2 ? 5 : 1)}
              className="col-span-2 py-1.5 px-2 text-xs font-mono font-medium rounded-lg bg-white hover:bg-slate-50 text-[#0A699F] border border-[#E6EAEE] transition-colors text-center cursor-pointer shadow-2xs"
            >
              {simulationSpeed}x Speed
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
