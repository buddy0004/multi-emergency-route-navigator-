import React, { useState } from 'react';
import { EmergenxLogo } from '../brand/EmergenxLogo';
import { useEmergenx } from '../../context/EmergenxContext';
import { Search, Bell, ShieldAlert, ChevronRight, User, CheckCircle2, Shield } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  onOpenActivationModal: () => void;
  onOpenRoleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenActivationModal,
  onOpenRoleModal,
}) => {
  const { currentUser, notifications, searchQuery, setSearchQuery } = useEmergenx();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const viewLabels: Record<string, string> = {
    overview: 'Command Overview',
    map: 'Live Emergency Map',
    requests: 'Emergency Requests',
    vehicles: 'Vehicle Fleet Management',
    ai_engine: 'AI Decision Engine',
    conflicts: 'Conflict Resolver',
    routes: 'Route Control & Optimization',
    traffic: 'Predictive Traffic Intelligence',
    green_corridor: 'Green Corridor Simulation',
    hospitals: 'Hospital Coordination',
    network: 'Network & GPS Resilience',
    analytics: 'Analytics & Fleet Reports',
    simulation_lab: 'Simulation Lab',
    notifications: 'Notification Center',
    security: 'Verification & Audit Logs',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3 bg-white border-b border-[#E6EAEE] text-[#292D32] select-none shadow-xs">
      {/* Zone 1: Brand title wordmark & Breadcrumbs */}
      <div className="flex items-center gap-6 shrink-0">
        <div
          onClick={() => onNavigate('overview')}
          className="cursor-pointer whitespace-nowrap shrink-0 flex items-center"
          role="button"
          tabIndex={0}
        >
          <EmergenxLogo size="md" />
        </div>

        {/* Breadcrumb Navigation */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-[#858F99] border-l border-[#E6EAEE] pl-6 font-medium">
          <span className="hover:text-[#292D32] cursor-pointer" onClick={() => onNavigate('overview')}>
            Fleet Admin
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#858F99]" />
          <span className="text-[#292D32] font-semibold">{viewLabels[currentView] || 'Overview'}</span>
        </div>
      </div>

      {/* Zone 2: Enterprise Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-[#858F99] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle call sign, route, hospital, or incident ID..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] placeholder-[#858F99] focus:outline-none focus:border-[#32B8BF] focus:bg-white transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Zone 3: Actions + Notification + User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Dispatch Emergency Button */}
        <button
          onClick={onOpenActivationModal}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#FE595B] hover:bg-[#e44e50] active:bg-[#d84648] rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Dispatch Emergency</span>
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={() => onNavigate('notifications')}
          className="relative p-2 text-[#858F99] hover:text-[#292D32] hover:bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg transition-colors cursor-pointer"
          title="Open Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FE595B] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Pill & Role Switcher */}
        <button
          onClick={onOpenRoleModal}
          title="Click to view credentials or switch role"
          className="flex items-center gap-2.5 p-1.5 pr-3 text-xs bg-white hover:bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg transition-colors cursor-pointer select-none"
        >
          <div className="w-7 h-7 rounded-full bg-[#EBF5FB] border border-[#91C4FC] flex items-center justify-center text-[#0A699F] font-bold text-xs shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="text-left hidden sm:block">
            <div className="font-semibold text-xs text-[#292D32] leading-tight flex items-center gap-1.5">
              <span>{currentUser.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#28A66A]"></span>
            </div>
            <div className="text-[10px] text-[#858F99] font-mono capitalize">
              {currentUser.role.replace('_', ' ')}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
