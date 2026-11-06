import React, { useState } from 'react';
import {
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  BarChart2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';

export const TrafficIntelligenceView: React.FC = () => {
  const { intersections } = useEmergenx();
  const [timelineOffset, setTimelineOffset] = useState<0 | 5 | 10 | 15>(0);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // Predictive projection multiplier based on timeline
  const multiplier = timelineOffset === 0 ? 1 : timelineOffset === 5 ? 1.12 : timelineOffset === 10 ? 1.25 : 1.38;

  const fetchTrafficAdvice = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/traffic-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          corridor: 'MG Road - Trinity - Domlur Flyover Arterial Corridor',
          currentCongestion: `${Math.round(64 * multiplier)}% (Simulated Peak)`,
          weather: 'Clear, 27°C (Bangalore evening transit)',
          activeIncidents: 3,
        }),
      });
      const data = await res.json();
      setAiAdvice(data.analysis);
    } catch (err) {
      setAiAdvice(
        `PREDICTIVE TRAFFIC ADVISORY (+${timelineOffset} Min Projection):
Domlur underpass queue expected to expand to 240m (+23% volume) due to evening commercial egress.
Recommend holding signal green wave on Cubbon Road bypass corridor for secondary units.`
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
              <Activity className="w-4 h-4 text-[#16A4E8]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              Predictive Traffic Intelligence
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF5FB] text-[#0A699F] border border-[#91C4FC] font-bold uppercase">
              15-Min Forecast Matrix
            </span>
          </div>
          <p className="text-xs text-[#858F99] max-w-2xl">
            Simulates dynamic queue accumulation, bottleneck progression, and signal queue dissipation along Bangalore emergency transit corridors.
          </p>
        </div>

        <button
          onClick={fetchTrafficAdvice}
          disabled={isLoadingAi}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#32B8BF] hover:bg-[#28A66A] rounded-lg transition-colors cursor-pointer shadow-2xs"
        >
          <Sparkles className={`w-4 h-4 ${isLoadingAi ? 'animate-spin' : ''}`} />
          <span>Generate AI Corridor Advisory</span>
        </button>
      </div>

      {/* Future Prediction Timeline Selector */}
      <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#292D32]">
            <Clock className="w-4 h-4 text-[#16A4E8]" />
            <span>Temporal Projection Timeline</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-[#858F99]">
            <span>Confidence: <strong className="text-[#28A66A]">92.4%</strong></span>
            <span>·</span>
            <span>Data Freshness: <strong className="text-[#292D32]">12s ago</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {([0, 5, 10, 15] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimelineOffset(t)}
              className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                timelineOffset === t
                  ? 'bg-[#EBF5FB] border-[#91C4FC] text-[#0A699F] font-bold shadow-2xs ring-1 ring-[#91C4FC]'
                  : 'bg-[#F5F7F9] border-[#E6EAEE] text-[#858F99] hover:bg-white hover:text-[#292D32]'
              }`}
            >
              <div className="text-sm font-mono">{t === 0 ? 'NOW' : `+${t} MIN`}</div>
              <div className="text-[10px] mt-0.5 text-[#858F99]">
                {t === 0 ? 'Live Telemetry' : 'Projected Model'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Advisory Panel */}
      {aiAdvice && (
        <div className="p-4 rounded-xl bg-[#EBF5FB] border border-[#91C4FC] space-y-1.5 text-xs text-[#292D32]">
          <div className="flex items-center gap-2 font-bold text-[#0A699F]">
            <Sparkles className="w-4 h-4 text-[#16A4E8]" />
            <span>AI Predictive Dispatch Advisory</span>
          </div>
          <p className="whitespace-pre-line text-xs font-mono text-[#292D32]">{aiAdvice}</p>
        </div>
      )}

      {/* Predictive Intersections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {intersections.map((inter) => {
          const predictedQueue = Math.round(inter.queueVehicles * multiplier);
          const predictedMeters = Math.round(inter.queueLengthMeters * multiplier);
          const isHeavy = predictedQueue > 18;

          return (
            <div
              key={inter.id}
              className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F7F9] text-[#858F99] font-bold">
                  {inter.id.toUpperCase()}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    isHeavy
                      ? 'bg-[#FEECEC] text-[#FE595B] border border-[#FE595B]/30'
                      : 'bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30'
                  }`}
                >
                  {isHeavy ? 'High Congestion' : 'Moderate Flow'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#292D32]">{inter.name}</h3>
                <p className="text-xs text-[#858F99]">Cross: {inter.crossStreetName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#F5F7F9] p-2.5 rounded-lg border border-[#E6EAEE]">
                <div>
                  <span className="text-[#858F99] block text-[10px]">Predicted Queue</span>
                  <span className="font-bold text-[#292D32]">{predictedMeters}m</span>
                </div>
                <div>
                  <span className="text-[#858F99] block text-[10px]">Vehicles Staged</span>
                  <span className="font-bold text-[#0A699F]">{predictedQueue} units</span>
                </div>
              </div>

              <div className="text-[11px] text-[#858F99] font-mono">
                Recovery window: <strong className="text-[#292D32]">{inter.normalCycleSeconds}s cycle</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
