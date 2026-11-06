import React, { useState } from 'react';
import {
  Hospital,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Bed,
  Phone,
  Shield,
  Flame,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';

export const HospitalCoordinationView: React.FC = () => {
  const { hospitals, acknowledgeHospitalTriage, currentUser } = useEmergenx();
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'hospitals' | 'fire_police'>('hospitals');

  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EBFBF7] flex items-center justify-center text-[#32B8BF]">
              <Hospital className="w-4 h-4 text-[#32B8BF]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              Emergency Facility & Resource Coordination
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBFBF7] text-[#32B8BF] border border-[#32B8BF]/30 font-bold uppercase">
              Triage Integration Hub
            </span>
          </div>
          <p className="text-xs text-[#858F99] max-w-2xl">
            Direct telemetry link alerting receiving Emergency Departments of inbound patient hemodynamics and ETA for trauma bay preparation.
          </p>
        </div>

        {/* Tab switch between Hospitals vs Fire/Police Response Center */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'hospitals' ? 'bg-[#32B8BF] text-white shadow-2xs' : 'text-[#858F99] hover:text-[#292D32]'
            }`}
          >
            Hospital ER Triage
          </button>
          <button
            onClick={() => setActiveTab('fire_police')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === 'fire_police' ? 'bg-[#32B8BF] text-white shadow-2xs' : 'text-[#858F99] hover:text-[#292D32]'
            }`}
          >
            Fire & Police Dispatch
          </button>
        </div>
      </div>

      {activeTab === 'hospitals' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 1 Col: Hospital Selector & Bed Capacity */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#292D32] uppercase font-mono">Receiving Facilities</span>

            {hospitals.map((hosp) => {
              const isSelected = hosp.id === selectedHospitalId;
              return (
                <button
                  key={hosp.id}
                  onClick={() => setSelectedHospitalId(hosp.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-[#EBFBF7] border-[#32B8BF] shadow-xs ring-1 ring-[#32B8BF]'
                      : 'bg-white border-[#E6EAEE] hover:border-[#32B8BF]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#292D32]">{hosp.name.split(',')[0]}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        hosp.status === 'Normal' ? 'bg-[#EBFBF7] text-[#28A66A]' : 'bg-[#FEECEC] text-[#FE595B]'
                      }`}
                    >
                      {hosp.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#858F99] line-clamp-1">{hosp.address}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#F5F7F9] p-2 rounded-lg border border-[#E6EAEE]">
                    <div>
                      <span className="text-[#858F99] block text-[10px]">Trauma Bays</span>
                      <span className="font-bold text-[#28A66A]">{hosp.availableTraumaBeds} Free</span>
                    </div>
                    <div>
                      <span className="text-[#858F99] block text-[10px]">ICU Beds</span>
                      <span className="font-bold text-[#16A4E8]">{hosp.availableIcuBeds} Free</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#858F99]">
                    <span>Inbound Ambulances:</span>
                    <strong className="text-[#292D32]">{hosp.incomingAmbulances.length} units</strong>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right 2 Cols: Selected Hospital Triage Reception Desk */}
          <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6EAEE] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#292D32]">{selectedHospital.name}</h3>
                <p className="text-xs text-[#858F99]">{selectedHospital.address} · Emergency Line: {selectedHospital.contactPhone}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#EBFBF7] text-[#28A66A] font-bold border border-[#28A66A]/30">
                VERIFIED ADMISSION READY
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#292D32] uppercase font-mono">
                Inbound Emergency Patients ({selectedHospital.incomingAmbulances.length})
              </h4>

              {selectedHospital.incomingAmbulances.map((amb) => (
                <div
                  key={amb.requestId}
                  className="p-4 rounded-xl bg-[#F5F7F9] border border-[#E6EAEE] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#292D32]">{amb.vehicleCallSign}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                          amb.triageCategory === 'Red'
                            ? 'bg-[#FEECEC] text-[#FE595B] border border-[#FE595B]/30'
                            : 'bg-[#FEF8EB] text-[#F5B942] border border-[#F5B942]/30'
                        }`}
                      >
                        Triage: {amb.triageCategory}
                      </span>
                    </div>
                    <p className="text-xs text-[#292D32]">{amb.patientCondition}</p>
                    <span className="text-[11px] font-mono text-[#0A699F]">ETA: {amb.etaMinutes} minutes</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {amb.acknowledged ? (
                      <span className="px-3 py-1.5 rounded-lg bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30 font-bold text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Trauma Bay Prepared</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => acknowledgeHospitalTriage(selectedHospital.id, amb.requestId)}
                        className="px-3 py-1.5 rounded-lg bg-[#32B8BF] hover:bg-[#28A66A] text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                      >
                        Acknowledge & Mobilize ER Team
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#292D32] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FE595B]" />
              <span>Fire & Emergency Command Post</span>
            </h3>
            <p className="text-xs text-[#858F99]">
              Mayo Hall Fire Base dispatch center. Simultaneous multi-tender alarm and water bowser deployment.
            </p>
            <div className="p-3 bg-[#F5F7F9] rounded-lg border border-[#E6EAEE] text-xs font-mono text-[#292D32]">
              3 tenders en route to Brigade Road complex fire.
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#292D32] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#16A4E8]" />
              <span>Ashok Nagar Traffic Police Control Base</span>
            </h3>
            <p className="text-xs text-[#858F99]">
              Inter-agency junction manual override liaison and escort deployment coordination.
            </p>
            <div className="p-3 bg-[#F5F7F9] rounded-lg border border-[#E6EAEE] text-xs font-mono text-[#292D32]">
              Field officers deployed at Domlur flyover for bottleneck manual staging.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
