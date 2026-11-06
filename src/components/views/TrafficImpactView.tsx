import React from 'react';
import { Scale, Activity, ArrowRight, ShieldCheck, Clock, Layers } from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';

export const TrafficImpactView: React.FC = () => {
  const { intersections, routes, activeRouteId } = useEmergenx();
  const activeRoute = routes.find((r) => r.id === activeRouteId) || routes[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-blue-950/80 border border-blue-700 text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Ordinary Traffic Impact Balancing</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-semibold uppercase">
              Civilian Spillover Analysis
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Quantifies cross-traffic queue accumulation during emergency green waves and calculates accelerated phase cycles to restore equilibrium without urban gridlock.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span>Evaluated Corridor: </span>
          <strong className="text-slate-200">{activeRoute.name.split(':')[1] || activeRoute.name}</strong>
        </div>
      </div>

      {/* 4 Core Balance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <span className="text-xs font-medium text-slate-400">Avg Cross Queue</span>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">114m</div>
          <span className="text-[11px] text-slate-500 font-mono">~22 civilian vehicles</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <span className="text-xs font-medium text-slate-400">Expected Waiting Time</span>
          <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">+42s</div>
          <span className="text-[11px] text-slate-500 font-mono">Normal cycle + Phase shift</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <span className="text-xs font-medium text-slate-400">Affected Intersections</span>
          <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">5 Nodes</div>
          <span className="text-[11px] text-slate-500 font-mono">Mayo Hall to Domlur</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
          <span className="text-xs font-medium text-slate-400">Signal Recovery Time</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">1.8 Cycles</div>
          <span className="text-[11px] text-slate-500 font-mono">~160s until baseline</span>
        </div>
      </div>

      {/* Cross-Street Queue Degradation Breakdown */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-xs text-white uppercase font-mono">
          Cross-Street Intersection Balance Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Junction</th>
                <th className="px-4 py-3">Cross-Street Vector</th>
                <th className="px-4 py-3">Emergency Green Hold</th>
                <th className="px-4 py-3">Civilian Queue Growth</th>
                <th className="px-4 py-3">Post-Transit Recovery Offset</th>
                <th className="px-4 py-3">Impact Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {intersections.slice(0, 5).map((inter, i) => (
                <tr key={inter.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-bold text-slate-200">{inter.name}</td>
                  <td className="px-4 py-3 text-slate-400">{inter.crossStreetName}</td>
                  <td className="px-4 py-3 text-emerald-400">30 seconds</td>
                  <td className="px-4 py-3 text-amber-400">+{35 + i * 15}m ({8 + i * 3} cars)</td>
                  <td className="px-4 py-3 text-blue-400">+18s extended green next cycle</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      MINIMAL IMPACT
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
