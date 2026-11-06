import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useEmergenx } from '../../context/EmergenxContext';

export const AnalyticsReportsView: React.FC = () => {
  const { journeys } = useEmergenx();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredJourneys = journeys.filter((j) => {
    if (selectedCategory !== 'all' && j.category !== selectedCategory) return false;
    return true;
  });

  // Chart data: Without Priority vs Simulated Journey Time
  const comparisonData = filteredJourneys.map((j) => ({
    name: j.vehicleCallSign.split(' ')[0],
    withoutPriority: j.timeWithoutPriorityMinutes,
    simulatedActual: j.actualSimulatedMinutes,
    simulatedSaved: j.simulatedTimeSavedMinutes,
  }));

  const handleDownloadCsv = () => {
    const headers = [
      'Journey ID',
      'Vehicle Call Sign',
      'Category',
      'Start Time',
      'End Time',
      'Distance (km)',
      'Without Priority (min)',
      'Simulated Actual (min)',
      'Simulated Saved (min)',
      'Intersections Cleared',
      'Hospital Destination',
    ];

    const rows = filteredJourneys.map((j) => [
      j.id,
      j.vehicleCallSign,
      j.category,
      j.startTime,
      j.endTime,
      j.totalDistanceKm,
      j.timeWithoutPriorityMinutes,
      j.actualSimulatedMinutes,
      j.simulatedTimeSavedMinutes,
      j.intersectionsCleared,
      `"${j.hospitalDelivered}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `emergenx_journey_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] flex items-center justify-center text-[#16A4E8]">
              <BarChart3 className="w-4 h-4 text-[#16A4E8]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              Analytics, Metrics & Audit Reports
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30 font-bold uppercase">
              Operational Intelligence
            </span>
          </div>
          <p className="text-xs text-[#858F99] max-w-2xl">
            Simulated time-saved evaluations, intersection delay reduction metrics, and exportable compliance records.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#32B8BF] hover:bg-[#28A66A] rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Log</span>
        </button>
      </div>

      {/* Aggregate KPI Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
          <span className="text-xs text-[#858F99] font-medium block">Total Simulated Runs</span>
          <div className="text-2xl font-bold font-mono text-[#292D32] mt-1">{journeys.length} Completed</div>
          <span className="text-[11px] text-[#28A66A] font-medium">100% on-time transit</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
          <span className="text-xs text-[#858F99] font-medium block">Avg Simulated Time Saved</span>
          <div className="text-2xl font-bold font-mono text-[#28A66A] mt-1">5.2 mins</div>
          <span className="text-[11px] text-[#858F99]">Across 7.1 km avg trip</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
          <span className="text-xs text-[#858F99] font-medium block">Signals Cleared</span>
          <div className="text-2xl font-bold font-mono text-[#16A4E8] mt-1">26 Junctions</div>
          <span className="text-[11px] text-[#858F99]">Zero corridor gridlocks</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
          <span className="text-xs text-[#858F99] font-medium block">Delay Avoidance Index</span>
          <div className="text-2xl font-bold font-mono text-[#0A699F] mt-1">84.3%</div>
          <span className="text-[11px] text-[#28A66A] font-medium">Civilian spillover absorbed</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#292D32]">
          Journey Travel Time Comparison (Without Priority vs EMERGENX Wave)
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#858F99" fontSize={11} tickLine={false} />
              <YAxis stroke="#858F99" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E6EAEE',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#292D32',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(val) => <span className="text-[#292D32]">{val}</span>}
              />
              <Bar dataKey="withoutPriority" name="Without Signal Wave (min)" fill="#858F99" radius={[4, 4, 0, 0]} />
              <Bar dataKey="simulatedActual" name="EMERGENX Actual (min)" fill="#32B8BF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#292D32]">Completed Emergency Missions Log</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E6EAEE] text-[#858F99] font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Journey ID</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Without Wave</th>
                <th className="py-2.5 px-3">Actual Time</th>
                <th className="py-2.5 px-3">Time Saved</th>
                <th className="py-2.5 px-3">Hospital Delivered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EAEE]">
              {filteredJourneys.map((j) => (
                <tr key={j.id} className="hover:bg-[#F5F7F9] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0A699F]">{j.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#292D32]">{j.vehicleCallSign}</td>
                  <td className="py-2.5 px-3 uppercase font-mono text-[10px] text-[#858F99]">{j.category}</td>
                  <td className="py-2.5 px-3 font-mono">{j.totalDistanceKm} km</td>
                  <td className="py-2.5 px-3 font-mono text-[#FE595B]">{j.timeWithoutPriorityMinutes}m</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#292D32]">{j.actualSimulatedMinutes}m</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#28A66A]">-{j.simulatedTimeSavedMinutes}m</td>
                  <td className="py-2.5 px-3 text-[#292D32] max-w-xs truncate">{j.hospitalDelivered}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
