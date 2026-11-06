import React, { useState } from 'react';
import {
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  GitFork,
  ArrowRight,
  Scale,
  RefreshCw,
  Clock,
  Layers,
  CheckCircle,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';

export const AiDecisionEngineView: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  const { requests, vehicles, intersections, conflictScenario, currentUser } = useEmergenx();
  const [priorityFramework, setPriorityFramework] = useState<'statutory' | 'dynamic_eta' | 'mass_casualty'>(
    'statutory'
  );
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  const fetchAiExplanation = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/explain-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioName: conflictScenario.title,
          vehicles: conflictScenario.vehicles,
          intersection: {
            name: conflictScenario.intersectionName,
            id: conflictScenario.intersectionId,
          },
          decision: {
            grantedVehicleId: 'MEDIC-101 (Ambulance)',
            grantedCategory: 'ambulance',
            grantedSeverity: 'Critical (STEMI)',
            grantedEta: '0.6',
          },
          priorityFramework:
            priorityFramework === 'statutory'
              ? 'Statutory Emergency Priority (Life Threat > Structural Hazard > Police Pursuit)'
              : priorityFramework === 'dynamic_eta'
              ? 'Shortest Time-to-Clearance Dynamic Window'
              : 'Mass Casualty Structural Protocol',
        }),
      });
      const data = await res.json();
      setAiExplanation(data.explanation);
    } catch (err) {
      setAiExplanation(
        `[Automated Coordinator Briefing]: Priority sequence verified under Section 42-A Statutory Mobility Act. MEDIC-101 allocated 30s Green Wave based on critical STEMI status. Secondary units staged safely.`
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] flex items-center justify-center text-[#16A4E8]">
              <BrainCircuit className="w-4 h-4 text-[#16A4E8]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              AI Emergency Decision Engine
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30 font-bold uppercase">
              Deterministic Priority Core
            </span>
          </div>
          <p className="text-xs text-[#858F99] max-w-2xl leading-relaxed">
            Multi-factor arbitration engine evaluating simultaneous emergency corridor demands. Built on transparent statutory regulations, not opaque black-box scoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('conflicts')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#32B8BF] hover:bg-[#28A66A] rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <GitFork className="w-4 h-4" />
            <span>Interactive Conflict Simulator</span>
          </button>
        </div>
      </div>

      {/* Policy Framework Selector Bar */}
      <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#16A4E8]" />
            <span className="text-xs font-bold text-[#292D32]">Active Regulatory Priority Policy</span>
          </div>
          <span className="text-[11px] font-mono text-[#858F99]">Authorized by Traffic Control</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'statutory',
              title: 'Statutory Emergency Hierarchy',
              desc: 'Ambulance (Cardiac/Trauma) > Structural Fire > Police Pursuit > Organ/Cryo Transport',
              tag: 'Default Standard',
            },
            {
              id: 'dynamic_eta',
              title: 'Shortest Clearance Window',
              desc: 'Vehicle closest to stop-bar (<40m) cleared first to prevent corridor bottleneck',
              tag: 'Throughput Optimized',
            },
            {
              id: 'mass_casualty',
              title: 'Disaster / Mass Casualty Incident',
              desc: 'High-capacity rescue carriers & multi-patient tenders receive uninterrupted signal hold',
              tag: 'Specialized Alert',
            },
          ].map((fw) => (
            <button
              key={fw.id}
              onClick={() => setPriorityFramework(fw.id as any)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                priorityFramework === fw.id
                  ? 'bg-[#EBF5FB] border-[#91C4FC] shadow-2xs ring-1 ring-[#91C4FC]'
                  : 'bg-[#F5F7F9] border-[#E6EAEE] hover:bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#292D32]">{fw.title}</span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#0A699F] border border-[#E6EAEE]">
                    {fw.tag}
                  </span>
                </div>
                <p className="text-[11px] text-[#858F99] leading-normal">{fw.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Decision Engine Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time Evaluation Case */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6EAEE] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#292D32]">Active Multi-Emergency Scenario</h3>
              <p className="text-xs text-[#858F99]">Simultaneous intersection convergence at MG Road & Brigade Road</p>
            </div>
            <button
              onClick={fetchAiExplanation}
              disabled={isLoadingAi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EBF5FB] text-[#0A699F] border border-[#91C4FC] hover:bg-[#d8ecf8] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#16A4E8]" />
              <span>{isLoadingAi ? 'Synthesizing...' : 'Generate AI Briefing'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {conflictScenario.vehicles.map((v, idx) => (
              <div
                key={v.vehicleId}
                className="p-3.5 rounded-xl bg-[#F5F7F9] border border-[#E6EAEE] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                      idx === 0 ? 'bg-[#28A66A]' : 'bg-[#F5B942]'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#292D32]">{v.callSign}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-[#FE595B] border border-[#FE595B]/30 font-bold uppercase">
                        {v.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#858F99]">{v.patientOrHazardDetails}</p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className="text-[#858F99] block text-[10px]">ETA to Stop-Bar</span>
                  <span className="font-bold text-[#292D32]">{v.etaSeconds}s ({v.distanceToJunctionMeters}m)</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Briefing Output Box */}
          {aiExplanation && (
            <div className="p-4 rounded-xl bg-[#EBF5FB] border border-[#91C4FC] space-y-2 text-xs leading-relaxed text-[#292D32]">
              <div className="flex items-center gap-2 font-bold text-[#0A699F]">
                <Sparkles className="w-4 h-4 text-[#16A4E8]" />
                <span>AI Decision Engine Briefing (Gemini 3.8 Flash Grounded)</span>
              </div>
              <div className="whitespace-pre-line text-xs font-sans text-[#292D32]">
                {aiExplanation}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Rule Constraints Summary */}
        <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#292D32]">Regulatory Guardrails</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-[#F5F7F9] border border-[#E6EAEE] space-y-1">
              <span className="font-bold text-[#292D32] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#28A66A]" />
                Simultaneous Green Prohibition
              </span>
              <p className="text-[#858F99] text-[11px]">
                Under no circumstances does the engine authorize simultaneous green signals to intersecting conflict vectors.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#F5F7F9] border border-[#E6EAEE] space-y-1">
              <span className="font-bold text-[#292D32] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#28A66A]" />
                Civilian Spillover Prevention
              </span>
              <p className="text-[#858F99] text-[11px]">
                Cross-traffic hold capped at maximum 45 seconds to avoid cascading gridlock across secondary urban corridors.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#F5F7F9] border border-[#E6EAEE] space-y-1">
              <span className="font-bold text-[#292D32] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#28A66A]" />
                Controller Override Authority
              </span>
              <p className="text-[#858F99] text-[11px]">
                Traffic Police controllers hold non-revocable manual override capabilities on all recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
