import React, { useState } from 'react';
import {
  GitFork,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';
import { GoogleCityMap } from '../map/GoogleCityMap';

export const ConflictResolverView: React.FC = () => {
  const { conflictScenario, resolveConflict, currentUser, intersections } = useEmergenx();
  const [currentStep, setCurrentStep] = useState<number>(4);
  const [isRunningSim, setIsRunningSim] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const steps = [
    { num: 1, title: 'Route Overlap Detection', desc: 'Identified converging GPS trajectories toward MG Road & Brigade Rd (INT-01).' },
    { num: 2, title: 'Conflicting ETA Calculation', desc: '3 authorized units arriving within a tight 35-second collision/blockage window.' },
    { num: 3, title: 'Priority Policy Evaluation', desc: 'Applied Section 42-A Motor Vehicles Act (Life Threat > Structural Blaze > Escort).' },
    { num: 4, title: 'Road Congestion Check', desc: 'Civilian queue on cross-street assessed at 145m (28 queued vehicles).' },
    { num: 5, title: 'Intersection Phase Schedule', desc: 'Phase 1: Amb-01 (Green 30s) -> Phase 2: Fire-21 (Green 45s) -> Phase 3: Civilian Recovery.' },
    { num: 6, title: 'Traffic Controller Sign-off', desc: 'Authorized supervisory action required to execute signal override schedule.' },
  ];

  const runStepByStepSim = () => {
    setIsRunningSim(true);
    setCurrentStep(1);
    setActionFeedback(null);

    let step = 1;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= 6) {
        clearInterval(interval);
        setIsRunningSim(false);
      }
    }, 700);
  };

  const handleApprove = () => {
    resolveConflict('controller_approved');
    setActionFeedback('Resolution APPROVED: Signal phase schedule deployed to INT-01.');
  };

  const handleReject = () => {
    resolveConflict('rejected');
    setActionFeedback('Resolution REJECTED: Manual junction control engaged.');
  };

  const targetIntersection = intersections.find((i) => i.id === conflictScenario.intersectionId);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#FEF8EB] flex items-center justify-center text-[#F5B942]">
              <GitFork className="w-4 h-4 text-[#F5B942]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              Multiple Emergency Conflict Resolver
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF8EB] text-[#F5B942] border border-[#F5B942]/30 font-bold uppercase">
              Convergence Scenario Alpha
            </span>
          </div>
          <p className="text-xs text-[#858F99] max-w-2xl leading-relaxed">
            Deconflicts simultaneous emergency vehicle approaches at complex urban junctions through dynamic time-slot scheduling and statutory policy arbitration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runStepByStepSim}
            disabled={isRunningSim}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#16A4E8] hover:bg-[#0A699F] rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Play className={`w-4 h-4 ${isRunningSim ? 'animate-spin' : ''}`} />
            <span>{isRunningSim ? 'Evaluating Steps...' : 'Run Conflict Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Action feedback */}
      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-[#EBFBF7] border border-[#28A66A]/40 text-[#28A66A] text-xs font-mono flex items-center justify-between">
          <span className="font-semibold">{actionFeedback}</span>
          <span className="text-[10px] text-[#28A66A]">Logged to Security Audit Trail</span>
        </div>
      )}

      {/* 6-Step Decision Pipeline Visualizer */}
      <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-[#292D32] uppercase font-mono tracking-wider">
          Six-Stage Arbitration Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-xs">
          {steps.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;

            return (
              <div
                key={st.num}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-[#EBF5FB] border-[#91C4FC] shadow-2xs'
                    : isCompleted
                    ? 'bg-[#EBFBF7] border-[#28A66A]/30 text-[#292D32]'
                    : 'bg-[#F5F7F9] border-[#E6EAEE] text-[#858F99]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-[#28A66A] text-white'
                          : isCurrent
                          ? 'bg-[#16A4E8] text-white'
                          : 'bg-[#E6EAEE] text-[#858F99]'
                      }`}
                    >
                      {st.num}
                    </span>
                    {isCompleted && <Check className="w-3.5 h-3.5 text-[#28A66A]" />}
                  </div>
                  <h4 className="font-bold text-[11px] text-[#292D32]">{st.title}</h4>
                </div>
                <p className="text-[10px] text-[#858F99] mt-2 leading-tight">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Convergence Details & Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Map View with Conflict Halo */}
        <div className="lg:col-span-2 h-[480px] rounded-xl overflow-hidden border border-[#E6EAEE] shadow-2xs bg-white">
          <GoogleCityMap conflictMode={true} />
        </div>

        {/* Right 1 Col: Controller Authorization Panel */}
        <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF8EB] text-[#F5B942] border border-[#F5B942]/30 font-bold uppercase">
              Junction Arbitrator
            </span>
            <h3 className="font-bold text-base text-[#292D32]">
              {conflictScenario.intersectionName}
            </h3>

            <div className="p-3 rounded-lg bg-[#F5F7F9] border border-[#E6EAEE] text-xs space-y-1.5">
              <span className="text-[#858F99] block font-mono text-[10px]">AI Staggered Sequence:</span>
              <div className="font-semibold text-[#292D32] space-y-1 text-xs">
                <div>1. <strong>MEDIC-101 (Ambulance)</strong> — Green Phase 1 (0s delay)</div>
                <div>2. <strong>BRONTO-01 (Fire Tender)</strong> — Green Phase 2 (+35s stagger)</div>
                <div>3. <strong>PATROL-04 (Police Patrol)</strong> — Staggered corridor hold</div>
              </div>
            </div>

            <p className="text-xs text-[#858F99]">
              Policy Rule: <strong className="text-[#292D32]">{conflictScenario.recommendation.statutoryPolicyRule}</strong>
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#E6EAEE]">
            <button
              onClick={handleApprove}
              className="w-full py-2.5 px-4 bg-[#28A66A] hover:bg-[#23925c] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize Staggered Phase Override</span>
            </button>
            <button
              onClick={handleReject}
              className="w-full py-2 px-4 bg-white hover:bg-[#F5F7F9] text-[#FE595B] border border-[#FE595B]/40 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Reject (Manual Police Control)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
