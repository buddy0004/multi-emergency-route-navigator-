import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Filter,
  PlusCircle,
  AlertTriangle,
  ArrowRight,
  GitFork,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';
import { EmergencySeverity, EmergencyRequest } from '../../types';
import { EmergenxNavigationModal } from '../modals/EmergenxNavigationModal';

export const EmergencyRequestsView: React.FC<{
  onOpenActivation: () => void;
  onNavigate: (view: string) => void;
}> = ({ onOpenActivation, onNavigate }) => {
  const { requests, vehicles, approveRequestPriority } = useEmergenx();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending_approval' | 'completed'>('all');
  const [severityFilter, setSeverityFilter] = useState<EmergencySeverity | 'all'>('all');
  
  // Navigation modal state
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [navRequest, setNavRequest] = useState<EmergencyRequest | null>(null);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (severityFilter !== 'all' && r.severity !== severityFilter) return false;
    return true;
  });

  const handleStartNav = (req: EmergencyRequest) => {
    setNavRequest(req);
    setNavModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FEECEC] flex items-center justify-center text-[#FE595B]">
              <Flame className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              Emergency Coordination Requests
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF5FB] text-[#0A699F] border border-[#91C4FC] font-bold uppercase">
              {requests.length} Total Incidents
            </span>
          </div>
          <p className="text-xs text-[#858F99]">
            Real-time emergency priority authorizations, hospital triage notifications, and green corridor approvals.
          </p>
        </div>

        <button
          onClick={onOpenActivation}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#FE595B] hover:bg-[#e44e50] rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Emergency Request</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#858F99]">Status:</span>
          {(['all', 'active', 'pending_approval', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#32B8BF] text-white font-semibold shadow-2xs'
                  : 'bg-[#F5F7F9] text-[#858F99] hover:text-[#292D32] border border-[#E6EAEE]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#858F99]">Severity:</span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                severityFilter === sev
                  ? 'bg-[#FEECEC] text-[#FE595B] border border-[#FE595B]/40 font-bold'
                  : 'bg-[#F5F7F9] text-[#858F99] hover:text-[#292D32] border border-[#E6EAEE]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map((req) => {
          const vehicle = vehicles.find((v) => v.id === req.vehicleId);
          const isCritical = req.severity === 'critical';
          const isHigh = req.severity === 'high';

          const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${req.destinationLocation.lat},${req.destinationLocation.lng}&travelmode=driving&dir_action=navigate`;

          return (
            <div
              key={req.id}
              className="p-5 rounded-xl bg-white border border-[#E6EAEE] hover:border-[#32B8BF]/50 shadow-2xs transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#0A699F]">{req.id.toUpperCase()}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isCritical
                          ? 'bg-[#FEECEC] text-[#FE595B] border border-[#FE595B]/30'
                          : isHigh
                          ? 'bg-[#FEF8EB] text-[#F5B942] border border-[#F5B942]/30'
                          : 'bg-[#EBF5FB] text-[#16A4E8] border border-[#16A4E8]/30'
                      }`}
                    >
                      {req.severity}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      req.status === 'active'
                        ? 'bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30'
                        : req.status === 'pending_approval'
                        ? 'bg-[#FEF8EB] text-[#F5B942] border border-[#F5B942]/30'
                        : 'bg-[#F5F7F9] text-[#858F99] border border-[#E6EAEE]'
                    }`}
                  >
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[#292D32]">{req.incidentType}</h3>
                  <p className="text-xs text-[#858F99] line-clamp-2 mt-1 leading-normal">{req.description}</p>
                </div>

                {/* Vehicle & Corridor summary */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#F5F7F9] p-2.5 rounded-lg border border-[#E6EAEE]">
                  <div>
                    <span className="text-[#858F99] block text-[10px]">Assigned Unit</span>
                    <span className="font-bold text-[#292D32]">{vehicle?.callSign || req.vehicleId}</span>
                  </div>
                  <div>
                    <span className="text-[#858F99] block text-[10px]">Estimated Arrival</span>
                    <span className="font-bold text-[#28A66A]">{req.currentEtaMinutes} mins</span>
                  </div>
                </div>

                <div className="text-xs text-[#858F99] space-y-1">
                  <div>
                    <span className="text-[#858F99]">Origin:</span> <span className="text-[#292D32]">{req.pickupAddress}</span>
                  </div>
                  <div>
                    <span className="text-[#858F99]">Destination:</span>{' '}
                    <strong className="text-[#292D32]">{req.destinationAddress}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Dual Navigation Buttons + Corridor Inspection */}
              <div className="pt-3 border-t border-[#E6EAEE] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {req.status === 'pending_approval' ? (
                    <button
                      onClick={() => approveRequestPriority(req.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#28A66A] hover:bg-[#23925c] text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      Authorize Wave
                    </button>
                  ) : (
                    <>
                      {/* Navigate with Google Maps */}
                      <a
                        href={googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#16A4E8] border border-[#16A4E8]/40 text-xs font-semibold shadow-2xs transition-colors"
                        title="Open destination in Google Maps"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Google Maps</span>
                      </a>

                      {/* Start EMERGENX Navigation */}
                      <button
                        onClick={() => handleStartNav(req)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#32B8BF] hover:bg-[#28A66A] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('routes')}
                  className="px-2.5 py-1 text-xs text-[#0A699F] hover:underline font-semibold cursor-pointer"
                >
                  Corridor View →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Navigation Modal */}
      <EmergenxNavigationModal
        isOpen={navModalOpen}
        onClose={() => setNavModalOpen(false)}
        request={navRequest}
      />
    </div>
  );
};
