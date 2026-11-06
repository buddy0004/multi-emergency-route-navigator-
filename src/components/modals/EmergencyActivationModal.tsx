import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';
import { EmergencySeverity } from '../../types';

export const EmergencyActivationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { vehicles, hospitals, activateEmergency, currentUser } = useEmergenx();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    vehicles.find((v) => v.status === 'idle')?.id || vehicles[0]?.id || ''
  );
  const [incidentType, setIncidentType] = useState<string>('Acute Cardiac Arrest (STEMI)');
  const [description, setDescription] = useState<string>(
    'Patient in critical ventricular tachycardia; CPR in progress, immediate catheterization lab transit required.'
  );
  const [severity, setSeverity] = useState<EmergencySeverity>('critical');
  const [destinationHospitalId, setDestinationHospitalId] = useState<string>(hospitals[0]?.id || '');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    const targetHosp = hospitals.find((h) => h.id === destinationHospitalId);
    const newReqId = activateEmergency({
      vehicleId: selectedVehicleId,
      incidentType,
      description,
      severity,
      destinationHospitalId,
      destinationAddress: targetHosp ? targetHosp.name : 'Designated Emergency Facility',
    });

    setSuccessId(newReqId);
    setIsConfirming(false);
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-white border border-[#E6EAEE] rounded-2xl shadow-2xl overflow-hidden text-[#292D32] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E6EAEE]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEECEC] border border-[#FE595B]/30 text-[#FE595B] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#292D32]">Activate Emergency Priority</h3>
              <p className="text-xs text-[#858F99]">Authorized Urban Mobility Corridor Dispatch</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSuccessId(null);
              setIsConfirming(false);
              onClose();
            }}
            className="text-[#858F99] hover:text-[#292D32] p-1.5 rounded-lg hover:bg-[#F5F7F9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success confirmation view */}
        {successId ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EBFBF7] border border-[#28A66A]/40 text-[#28A66A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-[#292D32]">Emergency Transit Dispatched</h4>
            <p className="text-xs text-[#858F99] leading-relaxed font-mono">
              Request ID: <span className="text-[#0A699F] font-bold">{successId}</span>
              <br />
              Corridor signal priority wave initiated across Bangalore intersections.
              Hospital trauma bay notified.
            </p>
            <button
              onClick={() => {
                setSuccessId(null);
                onClose();
              }}
              className="px-6 py-2.5 bg-[#32B8BF] hover:bg-[#28A66A] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer w-full shadow-sm"
            >
              Return to Fleet Command
            </button>
          </div>
        ) : (
          <form onSubmit={handleActivate} className="p-6 space-y-4">
            {/* Safety Confirmation Banner */}
            {isConfirming && (
              <div className="p-3.5 rounded-xl bg-[#FEF8EB] border border-[#F5B942]/50 text-[#292D32] text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-[#F5B942]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Confirm Emergency Transit Activation</span>
                </div>
                <p className="text-[11px] text-[#858F99]">
                  Dispatches {selectedVehicle?.callSign} under statutory priority and requests green corridor preemption.
                </p>
              </div>
            )}

            {/* Vehicle Selection */}
            <div>
              <label className="text-xs font-semibold text-[#858F99] block mb-1">
                Assign Emergency Unit
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.callSign} ({v.registrationNumber}) — {v.category.toUpperCase()} [{v.status.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>

            {/* Incident Classification */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#858F99] block mb-1">
                  Incident Classification
                </label>
                <input
                  type="text"
                  required
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  placeholder="e.g. Acute STEMI Cardiac"
                  className="w-full px-3 py-2 text-xs bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#858F99] block mb-1">
                  Severity Protocol
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as EmergencySeverity)}
                  className="w-full px-3 py-2 text-xs bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]"
                >
                  <option value="critical">Critical (Red Code — Life Threat)</option>
                  <option value="high">High (Yellow Code — Structural / Trauma)</option>
                  <option value="medium">Medium (Urgent Medical Transit)</option>
                  <option value="low">Low (Standard Non-Preempted Escort)</option>
                </select>
              </div>
            </div>

            {/* Destination Facility */}
            <div>
              <label className="text-xs font-semibold text-[#858F99] block mb-1">
                Destination Receiving Facility
              </label>
              <select
                value={destinationHospitalId}
                onChange={(e) => setDestinationHospitalId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.availableTraumaBeds} Trauma Beds Free)
                  </option>
                ))}
              </select>
            </div>

            {/* Clinical Briefing / Description */}
            <div>
              <label className="text-xs font-semibold text-[#858F99] block mb-1">
                Dispatch Summary & Clinical Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E6EAEE]">
              <span className="text-[10px] text-[#858F99] font-mono">
                Operator: {currentUser.name}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-[#858F99] hover:text-[#292D32] hover:bg-[#F5F7F9] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer shadow-sm ${
                    isConfirming ? 'bg-[#FE595B] hover:bg-[#e44e50]' : 'bg-[#32B8BF] hover:bg-[#28A66A]'
                  }`}
                >
                  {isConfirming ? 'Confirm & Authorize Dispatch' : 'Dispatch Emergency'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
