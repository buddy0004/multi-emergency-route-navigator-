import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Navigation,
  Compass,
  AlertCircle,
  Truck,
  Flame,
  Shield,
  Activity,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';
import { GoogleCityMap } from '../map/GoogleCityMap';
import { VehicleCategory } from '../../types';
import { EmergenxNavigationModal } from '../modals/EmergenxNavigationModal';

export const LiveEmergencyMapView: React.FC<{ onOpenActivation: () => void }> = ({ onOpenActivation }) => {
  const {
    vehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    networkStatus,
    gpsStaleSeconds,
    requests,
  } = useEmergenx();

  const [showCongestion, setShowCongestion] = useState(true);
  const [showIntersections, setShowIntersections] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [navModalOpen, setNavModalOpen] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const activeRequest = requests.find((r) => r.vehicleId === selectedVehicleId) || requests[0];

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-[#858F99] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search call sign, registration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] placeholder-[#858F99] focus:outline-none focus:border-[#32B8BF]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All Fleet' },
                { id: 'ambulance', label: 'Ambulance' },
                { id: 'fire_engine', label: 'Fire Tender' },
                { id: 'police', label: 'Police Patrol' },
                { id: 'blood_transport', label: 'Blood Cryo' },
                { id: 'disaster_rescue', label: 'Disaster Rescue' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as VehicleCategory | 'all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? 'bg-[#32B8BF] text-white shadow-2xs'
                    : 'bg-[#F5F7F9] text-[#858F99] hover:text-[#292D32] border border-[#E6EAEE]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map Layer Toggles */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#E6EAEE] text-[#292D32] cursor-pointer hover:bg-[#F5F7F9] transition-colors shadow-2xs">
            <input
              type="checkbox"
              checked={showCongestion}
              onChange={(e) => setShowCongestion(e.target.checked)}
              className="accent-[#32B8BF]"
            />
            <span>Traffic</span>
          </label>
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#E6EAEE] text-[#292D32] cursor-pointer hover:bg-[#F5F7F9] transition-colors shadow-2xs">
            <input
              type="checkbox"
              checked={showIntersections}
              onChange={(e) => setShowIntersections(e.target.checked)}
              className="accent-[#32B8BF]"
            />
            <span>Signals</span>
          </label>
          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#E6EAEE] text-[#292D32] cursor-pointer hover:bg-[#F5F7F9] transition-colors shadow-2xs">
            <input
              type="checkbox"
              checked={showHospitals}
              onChange={(e) => setShowHospitals(e.target.checked)}
              className="accent-[#32B8BF]"
            />
            <span>Hospitals</span>
          </label>
        </div>
      </div>

      {/* Map + Unit Inspector Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map Viewport (3 cols) */}
        <div className="lg:col-span-3 h-[580px] rounded-xl overflow-hidden border border-[#E6EAEE] relative shadow-2xs bg-white">
          <GoogleCityMap
            showCongestionOverlay={showCongestion}
            showIntersections={showIntersections}
            showHospitals={showHospitals}
            focusVehicleId={selectedVehicleId}
          />
        </div>

        {/* Tactical Fleet Tracker Panel (1 col) */}
        <div className="space-y-4 max-h-[580px] flex flex-col">
          {/* Focused Unit Card */}
          {selectedVehicle ? (
            <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF5FB] text-[#0A699F] border border-[#91C4FC] font-bold uppercase">
                  Focused Unit
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    selectedVehicle.status === 'en_route'
                      ? 'bg-[#FEECEC] text-[#FE595B] border border-[#FE595B]/30 animate-pulse'
                      : 'bg-[#F5F7F9] text-[#858F99]'
                  }`}
                >
                  {selectedVehicle.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#292D32]">{selectedVehicle.callSign}</h3>
                <p className="text-xs text-[#858F99] font-mono">
                  {selectedVehicle.registrationNumber} · {selectedVehicle.assignedService}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#F5F7F9] p-2.5 rounded-lg border border-[#E6EAEE]">
                <div>
                  <span className="text-[10px] text-[#858F99] block">Speed</span>
                  <span className="font-bold text-[#292D32]">{selectedVehicle.currentSpeedKmh} km/h</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#858F99] block">Fuel / Battery</span>
                  <span className="font-bold text-[#28A66A]">{selectedVehicle.batteryOrFuelPercent}%</span>
                </div>
              </div>

              <div className="text-xs text-[#858F99] space-y-1">
                <div>
                  <span className="text-[#858F99]">Driver:</span> <strong className="text-[#292D32]">{selectedVehicle.driverName}</strong>
                </div>
                <div>
                  <span className="text-[#858F99]">Location:</span> <span className="text-[#292D32]">{selectedVehicle.locationName}</span>
                </div>
                {selectedVehicle.destinationName && (
                  <div>
                    <span className="text-[#858F99]">Destination:</span>{' '}
                    <strong className="text-[#0A699F]">{selectedVehicle.destinationName}</strong>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#E6EAEE] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#858F99]">
                  {selectedVehicle.lastUpdated}
                </span>
                <button
                  onClick={() => setNavModalOpen(true)}
                  className="px-3 py-1.5 bg-[#32B8BF] hover:bg-[#28A66A] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  Start Navigation →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] text-center text-xs text-[#858F99]">
              Click any vehicle marker on the map to inspect live telemetric data.
            </div>
          )}

          {/* Quick List of Active Units */}
          <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs flex-1 overflow-y-auto space-y-2">
            <span className="text-xs font-bold text-[#292D32] block mb-1">
              Active Transponders ({vehicles.length})
            </span>
            {vehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedVehicleId === v.id
                    ? 'bg-[#EBF5FB] border-[#91C4FC] text-[#0A699F] font-semibold'
                    : 'bg-[#F5F7F9] border-[#E6EAEE] text-[#292D32] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{v.callSign}</span>
                  <span className="font-mono text-[10px] text-[#858F99]">{v.currentSpeedKmh} km/h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Modal */}
      <EmergenxNavigationModal
        isOpen={navModalOpen}
        onClose={() => setNavModalOpen(false)}
        request={activeRequest}
      />
    </div>
  );
};
