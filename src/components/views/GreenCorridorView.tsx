import React, { useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  Radio,
  Zap,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';

export const GreenCorridorView: React.FC = () => {
  const { intersections, vehicles } = useEmergenx();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(1);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);

  // Focus on 5 key intersections along the primary corridor
  const corridorIntersections = intersections.slice(0, 5);
  const activeAmbulance = vehicles.find((v) => v.id === 'veh_amb_01') || vehicles[0];

  const handleSimulatePass = () => {
    setIsAdvancing(true);
    setTimeout(() => {
      setActiveStepIndex((prev) => (prev < 4 ? prev + 1 : 0));
      setIsAdvancing(false);
    }, 600);
  };

  const handleResetCorridor = () => {
    setActiveStepIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EBFBF7] flex items-center justify-center text-[#28A66A]">
              <Zap className="w-4 h-4 text-[#28A66A]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              Smart Green Corridor Simulation
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30 font-bold uppercase">
              Closed Dynamic Model (SUMO Compatible)
            </span>
          </div>
          <p className="text-xs text-[#858F99] max-w-2xl">
            Simulates dynamic traffic signal preemption, approach detection windows, and automated recovery cycles.
            Does not interface with physical municipal signals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetCorridor}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#292D32] bg-[#F5F7F9] hover:bg-[#E6EAEE] rounded-lg transition-colors cursor-pointer border border-[#E6EAEE]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#858F99]" />
            <span>Reset Wave</span>
          </button>
          <button
            onClick={handleSimulatePass}
            disabled={isAdvancing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#28A66A] hover:bg-[#23925c] rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Play className={`w-4 h-4 ${isAdvancing ? 'animate-spin' : ''}`} />
            <span>{isAdvancing ? 'Advancing Unit...' : 'Step Vehicle Forward'}</span>
          </button>
        </div>
      </div>

      {/* Transit Unit Status Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#28A66A] animate-ping"></div>
          <div>
            <div className="text-xs font-bold text-[#292D32] flex items-center gap-2">
              <span>Active Preempted Unit: {activeAmbulance?.callSign}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#EBF5FB] text-[#0A699F] rounded border border-[#91C4FC] uppercase">
                {activeAmbulance?.category}
              </span>
            </div>
            <span className="text-[11px] text-[#858F99] font-mono">
              Transit Route: Cubbon Road to Manipal Hospital (7.1 km)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-[#858F99] block text-[10px]">Corridor Preemption</span>
            <span className="text-[#28A66A] font-bold">AUTHORIZED</span>
          </div>
          <div>
            <span className="text-[#858F99] block text-[10px]">Estimated Arrival</span>
            <span className="text-[#292D32] font-bold">5.8 mins</span>
          </div>
        </div>
      </div>

      {/* Corridor Intersections Step Progression */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[#292D32] uppercase font-mono tracking-wider">
          Consecutive Synchronized Intersections
        </h3>

        <div className="space-y-3">
          {corridorIntersections.map((inter, idx) => {
            const isVehicleHere = activeStepIndex === idx;
            const isPassed = activeStepIndex > idx;
            const isUpcoming = activeStepIndex < idx;

            return (
              <div
                key={inter.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isVehicleHere
                    ? 'bg-[#EBFBF7] border-[#28A66A] shadow-xs ring-1 ring-[#28A66A]'
                    : isPassed
                    ? 'bg-white border-[#E6EAEE] opacity-80'
                    : 'bg-white border-[#E6EAEE]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-sm shadow-2xs ${
                      isVehicleHere
                        ? 'bg-[#28A66A] text-white'
                        : isPassed
                        ? 'bg-[#EBFBF7] text-[#28A66A]'
                        : 'bg-[#F5F7F9] text-[#858F99]'
                    }`}
                  >
                    0{idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#292D32]">{inter.name}</h4>
                      {isVehicleHere && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#28A66A] text-white font-bold animate-pulse">
                          VEHICLE IN CLEARANCE ZONE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#858F99]">Cross street: {inter.crossStreetName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[#858F99] block text-[10px]">Civilian Queue</span>
                    <span className="font-bold text-[#292D32]">{inter.queueVehicles} units ({inter.queueLengthMeters}m)</span>
                  </div>
                  <div>
                    <span className="text-[#858F99] block text-[10px]">Signal Phase</span>
                    <span
                      className={`font-bold ${
                        isVehicleHere
                          ? 'text-[#28A66A]'
                          : isPassed
                          ? 'text-[#858F99]'
                          : 'text-[#16A4E8]'
                      }`}
                    >
                      {isVehicleHere ? 'PREEMPTED GREEN (HOLD)' : isPassed ? 'RECOVERY CYCLE' : 'STAGE QUEUED'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
