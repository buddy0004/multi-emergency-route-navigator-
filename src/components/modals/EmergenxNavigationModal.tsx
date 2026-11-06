import React, { useState, useEffect } from 'react';
import {
  Navigation,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  ArrowUp,
  CornerUpRight,
  CornerUpLeft,
  Hospital,
  ShieldAlert,
  RotateCcw,
  Volume2,
  X,
  Radio,
  Zap,
  MapPin,
  Check,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';
import { EmergencyRequest, RouteOption, HospitalFacility, NavigationGuidanceStep } from '../../types';

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: EmergencyRequest | null;
}

export const EmergenxNavigationModal: React.FC<NavigationModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  const {
    vehicles,
    routes,
    hospitals,
    intersections,
    networkStatus,
    gpsStaleSeconds,
  } = useEmergenx();

  // Active vehicle and destination
  const assignedVehicle = vehicles.find((v) => v.id === request?.vehicleId) || vehicles[0];
  const destCoords = request?.destinationLocation || { lat: 12.9592, lng: 77.6486 };
  const destAddress = request?.destinationAddress || 'Manipal Hospital Trauma Wing, HAL Old Airport Rd';

  // Navigation simulation state
  const [navStepIndex, setNavStepIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(52);
  const [remainingDistanceMeters, setRemainingDistanceMeters] = useState(4800);
  const [remainingMinutes, setRemainingMinutes] = useState(6.4);
  const [isDeviated, setIsDeviated] = useState(false);
  const [showReroutePrompt, setShowReroutePrompt] = useState(false);
  const [navigationStage, setNavigationStage] = useState<'incident_transit' | 'at_scene' | 'hospital_transit'>('incident_transit');
  const [selectedHospital, setSelectedHospital] = useState<HospitalFacility | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Turn-by-turn guidance steps
  const guidanceSteps: NavigationGuidanceStep[] = [
    {
      id: 'step_1',
      instruction: 'Proceed straight along High Court Corridor onto Ambedkar Veedhi',
      streetName: 'Ambedkar Veedhi',
      distanceMeters: 450,
      maneuver: 'straight',
      intersectionId: 'int_02',
      intersectionSignal: 'PRIORITY_GREEN',
      clearanceWindowSeconds: 45,
    },
    {
      id: 'step_2',
      instruction: 'Turn right onto Cubbon Road toward Old Madras Road bypass',
      streetName: 'Cubbon Road',
      distanceMeters: 1200,
      maneuver: 'turn-right',
      intersectionId: 'int_01',
      intersectionSignal: 'PRIORITY_GREEN',
      clearanceWindowSeconds: 30,
    },
    {
      id: 'step_3',
      instruction: 'Continue straight through Halasuru corridor past Metro station',
      streetName: 'Old Madras Road',
      distanceMeters: 1800,
      maneuver: 'straight',
      intersectionId: 'int_04',
      intersectionSignal: 'GREEN',
      clearanceWindowSeconds: 60,
    },
    {
      id: 'step_4',
      instruction: 'Turn left onto 100ft Road avoiding Domlur Underpass bottleneck',
      streetName: '100ft Road / Wind Tunnel Link',
      distanceMeters: 900,
      maneuver: 'turn-left',
      intersectionId: 'int_03',
      intersectionSignal: 'PRIORITY_GREEN',
      clearanceWindowSeconds: 40,
    },
    {
      id: 'step_5',
      instruction: 'Arrive at destination emergency triage bay',
      streetName: destAddress,
      distanceMeters: 450,
      maneuver: 'arrive',
    },
  ];

  const currentStep = guidanceSteps[Math.min(navStepIndex, guidanceSteps.length - 1)];

  // Google Maps Deep-link format with actual dynamic coordinates
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destCoords.lat},${destCoords.lng}&travelmode=driving&dir_action=navigate`;

  // Advance step simulation
  const advanceGuidance = () => {
    if (navStepIndex < guidanceSteps.length - 1) {
      setNavStepIndex((prev) => prev + 1);
      setRemainingDistanceMeters((prev) => Math.max(300, prev - 950));
      setRemainingMinutes((prev) => Math.max(1.0, parseFloat((prev - 1.2).toFixed(1))));
    } else {
      if (navigationStage === 'incident_transit') {
        setNavigationStage('at_scene');
      } else if (navigationStage === 'hospital_transit') {
        setIsCompleted(true);
      }
    }
  };

  // Simulate Route Deviation
  const triggerSimulatedDeviation = () => {
    setIsDeviated(true);
    setShowReroutePrompt(true);
  };

  const acceptReroute = () => {
    setIsDeviated(false);
    setShowReroutePrompt(false);
    setRemainingMinutes(5.2);
    setRemainingDistanceMeters(4100);
  };

  const declineReroute = () => {
    setShowReroutePrompt(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl border border-[#E6EAEE] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-4 bg-white border-b border-[#E6EAEE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF5FB] border border-[#91C4FC] flex items-center justify-center text-[#16A4E8]">
              <Navigation className="w-5 h-5 text-[#16A4E8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#292D32]">
                  EMERGENX Hybrid Navigation
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBFBF7] text-[#32B8BF] border border-[#32B8BF]/40 font-bold uppercase">
                  {navigationStage === 'incident_transit' ? 'To Incident Scene' : navigationStage === 'at_scene' ? 'On-Scene / Patient Secured' : 'Hospital Transfer'}
                </span>
              </div>
              <p className="text-xs text-[#858F99] mt-0.5">
                Unit: <strong className="text-[#292D32]">{assignedVehicle.callSign}</strong> ({assignedVehicle.registrationNumber}) · Driver: {assignedVehicle.driverName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Maps External Navigation Button */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#16A4E8] border border-[#16A4E8]/40 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              title="Open Google Maps in external tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Navigate with Google Maps</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-[#858F99] hover:text-[#292D32] hover:bg-[#F5F7F9] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Google Maps Route Recalculation Notice Banner */}
        <div className="bg-[#FEF8EB] border-b border-[#F5B942]/40 px-4 py-2 flex items-center justify-between text-xs text-[#292D32]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#F5B942] shrink-0" />
            <span>
              <strong>Navigation Notice:</strong> Google Maps operates as external navigation and may independently recalculate the route based on public traffic models. EMERGENX coordinates green corridor priority signals along the optimized route below.
            </span>
          </div>
        </div>

        {/* Modal Body: Active Navigation Turn-by-Turn Guidance */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 bg-[#F5F7F9]">
          {isCompleted ? (
            <div className="p-8 rounded-2xl bg-white border border-[#E6EAEE] shadow-sm text-center space-y-4 my-8">
              <div className="w-16 h-16 rounded-full bg-[#EBFBF7] text-[#28A66A] mx-auto flex items-center justify-center border-2 border-[#28A66A]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#292D32]">Emergency Transit Completed</h3>
              <p className="text-xs text-[#858F99] max-w-md mx-auto">
                Patient safely transferred to {selectedHospital?.name || 'Manipal Hospital Trauma Wing'}. Smart corridor signal preemption deactivated.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-[#32B8BF] hover:bg-[#28A66A] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Close Navigation
              </button>
            </div>
          ) : (
            <>
              {/* Main Turn Guidance Box */}
              <div className="p-5 rounded-2xl bg-white border border-[#E6EAEE] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0A699F] text-white flex items-center justify-center shrink-0 shadow-md">
                {currentStep.maneuver === 'turn-right' ? (
                  <CornerUpRight className="w-8 h-8" />
                ) : currentStep.maneuver === 'turn-left' ? (
                  <CornerUpLeft className="w-8 h-8" />
                ) : currentStep.maneuver === 'arrive' ? (
                  <MapPin className="w-8 h-8" />
                ) : (
                  <ArrowUp className="w-8 h-8" />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#16A4E8] uppercase tracking-wide">
                  Step {navStepIndex + 1} of {guidanceSteps.length} · In {currentStep.distanceMeters}m
                </span>
                <h3 className="text-lg font-bold text-[#292D32]">
                  {currentStep.instruction}
                </h3>
                <p className="text-xs text-[#858F99]">
                  Target Segment: <strong className="text-[#292D32]">{currentStep.streetName}</strong>
                </p>
              </div>
            </div>

            {/* Next Intersection Signal Status */}
            {currentStep.intersectionSignal && (
              <div className="bg-[#EBFBF7] border border-[#32B8BF]/30 p-3 rounded-xl flex items-center gap-3 shrink-0">
                <div className="w-3.5 h-3.5 rounded-full bg-[#28A66A] animate-ping" />
                <div>
                  <span className="text-[10px] font-mono text-[#32B8BF] uppercase block font-bold">
                    Signal Coordination
                  </span>
                  <span className="text-xs font-bold text-[#0A699F]">
                    {currentStep.intersectionSignal.replace('_', ' ')} (+{currentStep.clearanceWindowSeconds}s hold)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Telemetry Dashboard Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
              <span className="text-[11px] text-[#858F99] font-medium block">Current Speed</span>
              <div className="text-xl font-bold font-mono text-[#292D32] mt-0.5">
                {currentSpeed} <span className="text-xs font-normal text-[#858F99]">km/h</span>
              </div>
              <span className="text-[10px] text-[#28A66A] font-medium">Clear road flow</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
              <span className="text-[11px] text-[#858F99] font-medium block">Estimated Arrival</span>
              <div className="text-xl font-bold font-mono text-[#0A699F] mt-0.5">
                {remainingMinutes} <span className="text-xs font-normal text-[#858F99]">mins</span>
              </div>
              <span className="text-[10px] text-[#858F99] font-mono">Synchronized wave</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
              <span className="text-[11px] text-[#858F99] font-medium block">Distance Remaining</span>
              <div className="text-xl font-bold font-mono text-[#292D32] mt-0.5">
                {(remainingDistanceMeters / 1000).toFixed(1)} <span className="text-xs font-normal text-[#858F99]">km</span>
              </div>
              <span className="text-[10px] text-[#32B8BF] font-medium">Optimized path</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
              <span className="text-[11px] text-[#858F99] font-medium block">Telemetry Integrity</span>
              <div className="text-xl font-bold font-mono text-[#28A66A] mt-0.5 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#28A66A]" />
                <span className="text-sm">99.8% Sync</span>
              </div>
              <span className="text-[10px] text-[#858F99] font-mono">
                {networkStatus === 'normal' ? 'GPS Live (0.2s latency)' : `Stale (${gpsStaleSeconds}s)`}
              </span>
            </div>
          </div>

          {/* Reroute Alert Prompt if deviation detected */}
          {showReroutePrompt && (
            <div className="p-4 rounded-xl bg-[#FEECEC] border border-[#FE595B]/40 shadow-sm space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FE595B]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Route Deviation Detected (Vehicle 55m from designated arterial)</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#FE595B] border border-[#FE595B]/30 font-bold">
                  SAVES 4.8 MIN
                </span>
              </div>
              <p className="text-xs text-[#292D32]">
                Significant delay detected ahead on original route: Domlur Underpass congestion index rose by +28%. Recommended alternative bypass: <strong>Cubbon Green Wave Corridor via Halasuru</strong>.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={acceptReroute}
                  className="px-4 py-2 bg-[#28A66A] hover:bg-[#23925c] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Accept Recommended Bypass
                </button>
                <button
                  onClick={declineReroute}
                  className="px-3 py-2 bg-white text-[#858F99] hover:text-[#292D32] border border-[#E6EAEE] text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  Continue Current Route
                </button>
              </div>
            </div>
          )}

          {/* Stage 2: Patient Pickup Complete & Hospital Selection Stage */}
          {navigationStage === 'at_scene' && (
            <div className="p-5 rounded-2xl bg-white border border-[#E6EAEE] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#292D32] flex items-center gap-2">
                    <Hospital className="w-4 h-4 text-[#32B8BF]" />
                    <span>Emergency Patient Pickup Complete — Select Receiving Trauma Facility</span>
                  </h3>
                  <p className="text-xs text-[#858F99] mt-0.5">
                    Hospitals ranked by verified trauma capacity, distance, and specialized emergency bays.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#858F99]">Availability verified via HL7 FHIR link</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {hospitals.map((hosp) => {
                  const isSelected = selectedHospital?.id === hosp.id;
                  return (
                    <div
                      key={hosp.id}
                      onClick={() => setSelectedHospital(hosp)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#EBFBF7] border-[#32B8BF] shadow-xs ring-1 ring-[#32B8BF]'
                          : 'bg-[#F5F7F9] border-[#E6EAEE] hover:border-[#32B8BF]/50'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#292D32]">{hosp.name}</span>
                          <span className="text-[10px] font-mono text-[#0A699F] font-bold">
                            {hosp.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#858F99]">{hosp.address}</p>

                        <div className="grid grid-cols-2 gap-1.5 bg-white p-2 rounded-lg border border-[#E6EAEE] text-[11px] font-mono">
                          <div>
                            <span className="text-[#858F99] text-[10px] block">Trauma Bays</span>
                            <span className="font-bold text-[#28A66A]">{hosp.availableTraumaBeds} Free</span>
                          </div>
                          <div>
                            <span className="text-[#858F99] text-[10px] block">ICU Beds</span>
                            <span className="font-bold text-[#16A4E8]">{hosp.availableIcuBeds} Free</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#E6EAEE] flex items-center justify-between text-xs font-semibold">
                        <span className="text-[10px] text-[#858F99]">Verified Live</span>
                        <span className={isSelected ? 'text-[#32B8BF]' : 'text-[#858F99]'}>
                          {isSelected ? '✓ Selected Hospital' : 'Select Facility →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-[#858F99]">
                  {selectedHospital ? `Navigating to ${selectedHospital.name}` : 'Please select a receiving facility to proceed'}
                </span>
                <button
                  disabled={!selectedHospital}
                  onClick={() => {
                    setNavigationStage('hospital_transit');
                    setNavStepIndex(0);
                    setRemainingMinutes(7.2);
                    setRemainingDistanceMeters(5600);
                  }}
                  className="px-5 py-2.5 bg-[#32B8BF] hover:bg-[#28A66A] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Start Hospital Transit with Priority Signals →
                </button>
              </div>
            </div>
          )}

          {/* Simulation & Testing Action Strip */}
          <div className="p-3.5 rounded-xl bg-white border border-[#E6EAEE] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#858F99]">
              <Zap className="w-4 h-4 text-[#F5B942]" />
              <span>Simulation Testing Controls:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerSimulatedDeviation}
                className="px-3 py-1.5 bg-[#F5F7F9] hover:bg-[#EBF5FB] text-[#0A699F] border border-[#E6EAEE] rounded-lg font-medium transition-colors cursor-pointer"
              >
                Simulate Route Deviation (50m off)
              </button>

              <button
                onClick={advanceGuidance}
                className="px-4 py-1.5 bg-[#16A4E8] hover:bg-[#0A699F] text-white rounded-lg font-bold transition-colors cursor-pointer shadow-2xs"
              >
                Advance to Next Maneuver ({navStepIndex + 1}/{guidanceSteps.length}) →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
      </div>
    </div>
  );
};
