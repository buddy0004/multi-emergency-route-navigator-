import React, { useState } from 'react';
import {
  Truck,
  Activity,
  Flame,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  GitFork,
  Calendar,
  ChevronDown,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';
import { GoogleCityMap } from '../map/GoogleCityMap';
import { VehicleCategory, EmergencySeverity } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const OverviewDashboard: React.FC<{
  onNavigate: (viewId: string) => void;
  onOpenActivationModal: () => void;
}> = ({ onNavigate, onOpenActivationModal }) => {
  const {
    vehicles,
    requests,
    intersections,
    journeys,
    categoryFilter,
    setCategoryFilter,
    routes,
    activeRouteId,
  } = useEmergenx();

  const [dateRange, setDateRange] = useState('Today • Live Stream');

  // Exact 5 KPIs requested
  const totalEmergencyRequests = requests.length;
  const activeEmergencyVehicles = vehicles.filter(
    (v) => v.status === 'en_route' || v.status === 'transporting'
  ).length;
  const availableVehicles = vehicles.filter((v) => v.status === 'idle').length;
  const pendingAssignments = requests.filter(
    (r) => r.status === 'pending_approval'
  ).length;
  const completedEmergencies = journeys.length;

  // Chart data: Hourly emergency response volume & time saved
  const hourlyActivityData = [
    { hour: '08:00', requests: 4, clearedWaves: 4, avgMinutes: 9.2 },
    { hour: '10:00', requests: 7, clearedWaves: 6, avgMinutes: 8.5 },
    { hour: '12:00', requests: 9, clearedWaves: 8, avgMinutes: 7.9 },
    { hour: '14:00', requests: 6, clearedWaves: 6, avgMinutes: 8.1 },
    { hour: '16:00', requests: 12, clearedWaves: 11, avgMinutes: 7.4 },
    { hour: '18:00', requests: 15, clearedWaves: 14, avgMinutes: 7.1 },
    { hour: '20:00', requests: 8, clearedWaves: 8, avgMinutes: 8.0 },
  ];

  // Donut chart data: Emergency categories distribution
  const categoryDistributionData = [
    { name: 'Ambulance (ALS/BLS)', value: 8, color: '#32B8BF' },
    { name: 'Fire & Rescue', value: 4, color: '#FE595B' },
    { name: 'Police Interceptors', value: 3, color: '#16A4E8' },
    { name: 'Blood Transport', value: 2, color: '#91C4FC' },
  ];

  // Donut chart data: Severity levels
  const severityDistributionData = [
    { name: 'Critical Priority', value: 4, color: '#FE595B' },
    { name: 'High Priority', value: 5, color: '#F5B942' },
    { name: 'Normal / Escort', value: 3, color: '#16A4E8' },
    { name: 'Completed Today', value: 6, color: '#28A66A' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header + Date-Range Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#292D32]">
            EMERGENX Command Center
          </h1>
          <p className="text-xs text-[#858F99] mt-0.5">
            Real-time urban fleet coordination, intelligent green corridors, and AI intersection prioritization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E6EAEE] rounded-lg text-xs font-medium text-[#292D32] shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#32B8BF]" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#858F99]" />
          </div>

          <button
            onClick={() => onNavigate('routes')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#0A699F] bg-[#EBF5FB] hover:bg-[#d8ecf8] border border-[#91C4FC] rounded-lg transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#16A4E8]" />
            <span>Route Intelligence</span>
          </button>
        </div>
      </div>

      {/* 2. Exactly Five White KPI Cards in One Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Emergency Requests */}
        <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#858F99]">Total Emergency Requests</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] flex items-center justify-center text-[#16A4E8]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#292D32] tabular-nums">
              {totalEmergencyRequests}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#28A66A] font-medium">
              <span>↑ 12% vs yesterday</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active Emergency Vehicles */}
        <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#858F99]">Active Emergency Vehicles</span>
            <div className="w-8 h-8 rounded-lg bg-[#FEECEC] flex items-center justify-center text-[#FE595B]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#292D32] tabular-nums">
              {activeEmergencyVehicles}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#FE595B] font-medium">
              <span>In active high-priority transit</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Available Vehicles */}
        <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#858F99]">Available Vehicles</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBFBF5] flex items-center justify-center text-[#28A66A]">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#292D32] tabular-nums">
              {availableVehicles}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#28A66A] font-medium">
              <span>Ready for immediate dispatch</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Assignments */}
        <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#858F99]">Pending Assignments</span>
            <div className="w-8 h-8 rounded-lg bg-[#FEF8EB] flex items-center justify-center text-[#F5B942]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#292D32] tabular-nums">
              {pendingAssignments}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#F5B942] font-medium">
              <span>Awaiting controller sign-off</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Completed Emergencies */}
        <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#858F99]">Completed Emergencies</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBFBF7] flex items-center justify-center text-[#32B8BF]">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-[#292D32] tabular-nums">
              {completedEmergencies}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#32B8BF] font-medium">
              <span>Zero corridor bottlenecks</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Emergency Map Card (Large White Card) */}
      <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#292D32]">Live Emergency Map</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBFBF7] text-[#32B8BF] border border-[#32B8BF]/30 font-bold uppercase">
                Active Fleet Coordinates
              </span>
            </div>
            <p className="text-xs text-[#858F99] mt-0.5">
              Live transponders, prioritized traffic signals, and receiving hospital trauma facilities.
            </p>
          </div>

          {/* Map Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {(
              [
                { id: 'all', label: 'All Units' },
                { id: 'ambulance', label: 'Ambulance' },
                { id: 'fire_engine', label: 'Fire & Rescue' },
                { id: 'police', label: 'Police' },
                { id: 'blood_transport', label: 'Blood' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id as VehicleCategory | 'all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  categoryFilter === f.id
                    ? 'bg-[#32B8BF] text-white font-semibold shadow-2xs'
                    : 'bg-[#F5F7F9] text-[#858F99] hover:text-[#292D32] border border-[#E6EAEE]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="h-[440px] w-full rounded-xl overflow-hidden border border-[#E6EAEE]">
          <GoogleCityMap />
        </div>
      </div>

      {/* 4. Analytics Section: Blue & Teal Charts + Active Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Bar Chart & Donut Distribution Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* White Card: Hourly Response & Signal Synchronization */}
          <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#292D32]">
                  Emergency Transit & Wave Synchronization Volume
                </h3>
                <p className="text-xs text-[#858F99]">
                  Hourly comparison of activated dispatches vs successfully cleared green corridors.
                </p>
              </div>
              <span className="text-[11px] font-mono text-[#32B8BF] font-semibold bg-[#EBFBF7] px-2 py-0.5 rounded border border-[#32B8BF]/30">
                Avg Response: 7.8 min
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="hour" stroke="#858F99" fontSize={11} tickLine={false} />
                  <YAxis stroke="#858F99" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E6EAEE',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#292D32',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  />
                  <Bar dataKey="requests" name="Dispatched Incidents" fill="#16A4E8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clearedWaves" name="Green Wave Clearances" fill="#32B8BF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two White Donut Chart Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Donut 1: Emergency Category Share */}
            <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-2">
              <h4 className="text-xs font-bold text-[#292D32]">Fleet Category Allocation</h4>
              <p className="text-[11px] text-[#858F99]">Active vehicle division across urban sectors</p>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E6EAEE',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#292D32',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      formatter={(val) => <span className="text-[11px] text-[#292D32]">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut 2: Incident Severity Status */}
            <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-2">
              <h4 className="text-xs font-bold text-[#292D32]">Incident Priority Breakdown</h4>
              <p className="text-[11px] text-[#858F99]">Severity classifications currently managed</p>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {severityDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E6EAEE',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#292D32',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={32}
                      formatter={(val) => <span className="text-[11px] text-[#292D32]">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Emergency Missions & Green Corridors */}
        <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#292D32]">Active Missions</h3>
              <p className="text-[11px] text-[#858F99]">Live green wave corridors</p>
            </div>
            <button
              onClick={() => onNavigate('requests')}
              className="text-xs text-[#16A4E8] hover:text-[#0A699F] flex items-center gap-1 font-semibold cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1">
            {requests
              .filter((r) => r.status === 'active' || r.status === 'pending_approval')
              .map((req) => {
                const assignedVehicle = vehicles.find((v) => v.id === req.vehicleId);
                const isCritical = req.severity === 'critical';
                const isHigh = req.severity === 'high';

                return (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-[#F5F7F9] border border-[#E6EAEE] hover:border-[#32B8BF]/50 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isCritical ? 'bg-[#FE595B] animate-ping' : isHigh ? 'bg-[#F5B942]' : 'bg-[#16A4E8]'
                          }`}
                        />
                        <span className="font-bold text-xs text-[#292D32]">
                          {assignedVehicle?.callSign || 'Emergency Unit'}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          isCritical
                            ? 'bg-[#FEECEC] text-[#FE595B] border border-[#FE595B]/30'
                            : isHigh
                            ? 'bg-[#FEF8EB] text-[#F5B942] border border-[#F5B942]/30'
                            : 'bg-[#EBF5FB] text-[#16A4E8] border border-[#16A4E8]/30'
                        }`}
                      >
                        {req.severity}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-[#292D32] line-clamp-1">{req.incidentType}</p>
                      <p className="text-[11px] text-[#858F99] line-clamp-2 mt-0.5">{req.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2 rounded-lg border border-[#E6EAEE]">
                      <div>
                        <span className="text-[#858F99] block text-[10px]">Estimated Arrival</span>
                        <span className="font-bold text-[#28A66A]">{req.currentEtaMinutes} mins</span>
                      </div>
                      <div>
                        <span className="text-[#858F99] block text-[10px]">Route Score</span>
                        <span className="font-bold text-[#0A699F]">{req.priorityScore}/100</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#858F99] truncate max-w-[170px]">
                        To: {req.destinationAddress.split(',')[0]}
                      </span>
                      <button
                        onClick={() => onNavigate('routes')}
                        className="text-xs text-[#32B8BF] hover:text-[#28A66A] font-semibold cursor-pointer"
                      >
                        Inspect Route →
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* AI Conflict Decision Callout Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#EBF5FB] to-[#EBFBF7] border border-[#91C4FC] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0A699F]">
                <GitFork className="w-4 h-4 text-[#16A4E8]" />
                <span>AI Multi-Emergency Conflict Engine</span>
              </div>
              <p className="text-xs text-[#292D32] leading-relaxed">
                Convergence detected at MG Road & Brigade Road. Dynamic signal staging active.
              </p>
              <button
                onClick={() => onNavigate('conflicts')}
                className="w-full py-1.5 text-xs font-semibold bg-[#16A4E8] hover:bg-[#0A699F] text-white rounded-lg transition-colors cursor-pointer text-center shadow-2xs"
              >
                Inspect Conflict Engine Resolution
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
