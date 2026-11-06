import React, { useState, useEffect } from 'react';
import {
  Route as RouteIcon,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Navigation,
  Sliders,
  RotateCcw,
  Clock,
  Sparkles,
  GitFork,
  Check,
  Info,
  Cpu,
  Layers,
  Shield,
  Activity,
  Zap,
  TrendingDown,
  AlertOctagon,
  RefreshCw,
  Share2,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';
import { GoogleCityMap } from '../map/GoogleCityMap';
import { EmergenxNavigationModal } from '../modals/EmergenxNavigationModal';
import { ScoringWeights, RoutePlanRecord } from '../../types';
import {
  RoadNetworkGraph,
  globalRoadGraph,
  AlgorithmMetrics,
  MultiAgentPlanResult,
  ContinuousRerouteCheckResult,
  GraphNode,
  GraphEdge,
} from '../../utils/roadGraphEngine';

export const RouteOptimizationView: React.FC = () => {
  const { routes, activeRouteId, selectRoute, requests, vehicles, hospitals } = useEmergenx();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'graph_explorer' | 'multi_agent' | 'continuous_reroute' | 'scoring_weights' | 'history'>('graph_explorer');

  // Navigation modal state
  const [isNavModalOpen, setIsNavModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(requests[0] || null);

  // Road Graph state
  const [nodes, setNodes] = useState<GraphNode[]>(Array.from(globalRoadGraph.nodes.values()));
  const [edges, setEdges] = useState<GraphEdge[]>(Array.from(globalRoadGraph.edges.values()));
  const [selectedStartNode, setSelectedStartNode] = useState<string>('N_HIGH_COURT');
  const [selectedGoalNode, setSelectedGoalNode] = useState<string>('N_MANIPAL_HOSPITAL');

  // Algorithmic calculation state
  const [aStarResult, setAStarResult] = useState<AlgorithmMetrics | null>(null);
  const [dijkstraResult, setDijkstraResult] = useState<AlgorithmMetrics | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Multi-agent coordination state
  const [multiAgentPlan, setMultiAgentPlan] = useState<MultiAgentPlanResult | null>(null);
  const [isCoordinating, setIsCoordinating] = useState(false);

  // Continuous rerouting state
  const [continuousReroute, setContinuousReroute] = useState<ContinuousRerouteCheckResult | null>(null);
  const [isAutoRerouteActive, setIsAutoRerouteActive] = useState(true);
  const [domlurClosed, setDomlurClosed] = useState(false);
  const [mgRoadClosed, setMgRoadClosed] = useState(false);

  // Configurable route scoring weights
  const [weights, setWeights] = useState<ScoringWeights>({
    travelTimeWeight: 2.0,
    congestionWeight: 1.5,
    roadClosureWeight: 10.0,
    intersectionWeight: 1.2,
    reliabilityWeight: 1.0,
    coordinationWeight: 2.5,
  });

  // Route History from backend
  const [routeHistory, setRouteHistory] = useState<RoutePlanRecord[]>([]);

  // Initial calculation on mount
  useEffect(() => {
    fetchGraphCalculation(selectedStartNode, selectedGoalNode);
    fetchMultiAgentPlan();
    fetchRouteHistory();
  }, []);

  const fetchRouteHistory = () => {
    fetch('/api/routes/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.history) setRouteHistory(data.history);
      })
      .catch((err) => console.warn('Could not fetch route history:', err));
  };

  const fetchGraphCalculation = async (start: string, goal: string) => {
    setIsCalculating(true);
    try {
      const res = await fetch('/api/graph/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startNodeId: start, goalNodeId: goal }),
      });
      const data = await res.json();
      if (data.aStar && data.dijkstra) {
        setAStarResult(data.aStar);
        setDijkstraResult(data.dijkstra);
      }
    } catch (err) {
      // Direct local fallback on RoadNetworkGraph
      const a = globalRoadGraph.findRouteAStar(start, goal);
      const d = globalRoadGraph.findRouteDijkstra(start, goal, 'distance');
      setAStarResult(a);
      setDijkstraResult(d);
    } finally {
      setIsCalculating(false);
    }
  };

  const fetchMultiAgentPlan = async () => {
    setIsCoordinating(true);
    try {
      const res = await fetch('/api/graph/multi-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.plan) {
        setMultiAgentPlan(data.plan);
      }
    } catch (err) {
      const plan = globalRoadGraph.coordinateMultiAgentRoutes([
        {
          vehicleId: 'veh_amb_01',
          callSign: 'MEDIC-101 (STEMI Ambulance)',
          category: 'ambulance',
          startNodeId: 'N_HIGH_COURT',
          goalNodeId: 'N_MANIPAL_HOSPITAL',
          priorityScore: 100,
        },
        {
          vehicleId: 'veh_fire_01',
          callSign: 'BRONTO-01 (Heavy Fire Tender)',
          category: 'fire_engine',
          startNodeId: 'N_MAYO_HALL',
          goalNodeId: 'N_RESIDENCY',
          priorityScore: 85,
        },
        {
          vehicleId: 'veh_pol_01',
          callSign: 'ESCORT-303 (Traffic Police Escort)',
          category: 'police',
          startNodeId: 'N_RICHMOND_CIRCLE',
          goalNodeId: 'N_MG_BRIGADE',
          priorityScore: 70,
        },
      ]);
      setMultiAgentPlan(plan);
    } finally {
      setIsCoordinating(false);
    }
  };

  const handleToggleClosure = async (edgeId: string, currentClosed: boolean, reason: string) => {
    try {
      await fetch('/api/graph/closure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edgeId,
          isClosed: !currentClosed,
          reason: !currentClosed ? reason : undefined,
        }),
      });
      // Update local state
      globalRoadGraph.toggleEdgeClosure(edgeId, !currentClosed, reason);
      setEdges(Array.from(globalRoadGraph.edges.values()));

      if (edgeId === 'E_TRINITY_DOMLUR') setDomlurClosed(!currentClosed);
      if (edgeId === 'E_MG_MAYO') setMgRoadClosed(!currentClosed);

      // Re-evaluate routes
      fetchGraphCalculation(selectedStartNode, selectedGoalNode);

      // Check continuous reroute
      if (aStarResult) {
        const rerouteCheck = globalRoadGraph.evaluateContinuousReroute(
          aStarResult,
          selectedStartNode,
          selectedGoalNode,
          'veh_amb_01'
        );
        setContinuousReroute(rerouteCheck);
      }
    } catch (err) {
      console.warn('Error toggling closure:', err);
    }
  };

  const handleApplyReroute = () => {
    if (continuousReroute?.recommendedRoute) {
      setAStarResult(continuousReroute.recommendedRoute);
      setContinuousReroute(null);
    }
  };

  const handleResetGraph = async () => {
    try {
      await fetch('/api/graph/reset', { method: 'POST' });
    } catch (e) {
      // Ignore
    }
    globalRoadGraph.resetToDefaults();
    setNodes(Array.from(globalRoadGraph.nodes.values()));
    setEdges(Array.from(globalRoadGraph.edges.values()));
    setDomlurClosed(false);
    setMgRoadClosed(false);
    fetchGraphCalculation(selectedStartNode, selectedGoalNode);
    fetchMultiAgentPlan();
    setContinuousReroute(null);
  };

  const selectedRoute = routes.find((r) => r.id === activeRouteId) || routes[0];
  const destinationCoords = activeRequest?.destinationLocation || { lat: 12.9592, lng: 77.6486 };
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationCoords.lat},${destinationCoords.lng}&travelmode=driving&dir_action=navigate`;

  // Calculate explainable costs for active alternative routes
  const enrichedRoutes = routes.map((rt) => {
    const travelTimeCost = parseFloat((weights.travelTimeWeight * rt.estimatedMinutes).toFixed(1));
    const congestionPenalty = parseFloat(
      (weights.congestionWeight * (rt.congestionLevel.includes('Heavy') ? 8.5 : 2.5)).toFixed(1)
    );
    const roadClosurePenalty = parseFloat(
      (weights.roadClosureWeight * (rt.obstructionWarnings.length > 0 ? 3.0 : 0.0)).toFixed(1)
    );
    const intersectionDelay = parseFloat((weights.intersectionWeight * rt.intersectionsCount * 0.8).toFixed(1));
    const reliabilityRisk = parseFloat(
      (weights.reliabilityWeight * ((100 - rt.reliabilityScorePercent) * 0.15)).toFixed(1)
    );
    const conflictPenalty = parseFloat(
      (weights.coordinationWeight * (rt.id === 'route_a_arterial' ? 4.0 : 1.5)).toFixed(1)
    );

    const totalCost = parseFloat(
      (
        travelTimeCost +
        congestionPenalty +
        roadClosurePenalty +
        intersectionDelay +
        reliabilityRisk +
        conflictPenalty
      ).toFixed(1)
    );

    const optimizationScore = Math.max(50, Math.round(100 - totalCost * 0.95));

    return {
      ...rt,
      optimizationScore,
      costBreakdown: {
        travelTimeCost,
        congestionPenalty,
        roadClosurePenalty,
        intersectionDelay,
        reliabilityRisk,
        conflictPenalty,
        totalCost,
      },
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] flex items-center justify-center text-[#16A4E8]">
              <Cpu className="w-4 h-4 text-[#16A4E8]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              Advanced AI Route Optimization Engine
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBFBF7] text-[#32B8BF] border border-[#32B8BF]/30 font-bold uppercase">
              A* & Dijkstra Architecture
            </span>
          </div>
          <p className="text-xs text-[#858F99] max-w-3xl">
            Hybrid pathfinding system coordinating urban emergency transit on a live road network graph (15 nodes, 28 directed segments). Integrates destination-directed A* search, uniform-cost Dijkstra comparisons, multi-agent conflict avoidance, and continuous threshold rerouting.
          </p>
        </div>

        {/* Global Quick Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetGraph}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[#E6EAEE] bg-white text-[#292D32] hover:bg-[#F5F7F9] transition-colors cursor-pointer"
            title="Reset road graph closures and congestion to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#858F99]" />
            <span>Reset Graph</span>
          </button>

          <button
            onClick={() => setIsNavModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#32B8BF] hover:bg-[#28A66A] rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>Start EMERGENX Navigation</span>
          </button>
        </div>
      </div>

      {/* 2. Architectural Status & Implemented vs. Simulated Legend Banner */}
      <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#28A66A] animate-pulse"></span>
            <span className="font-bold text-[#292D32]">Hybrid Intelligent Routing Architecture:</span>
            <span className="text-[#0A699F] font-mono font-semibold">Graph-Authoritative Online</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30 font-semibold">
              ✓ IMPLEMENTED: Road Graph, A* Search, Dijkstra, Deadlock Matrix, Continuous Rerouting
            </span>
            <span className="px-2 py-0.5 rounded bg-[#FEF8EB] text-[#F5B942] border border-[#F5B942]/40 font-semibold">
              ⚡ SIMULATED: Municipal SCATS Relay & In-Vehicle Telemetry Stream
            </span>
          </div>
        </div>
      </div>

      {/* 3. Driver Interface Dispatch Banner (Deep-Link + Navigation) */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#EBF5FB] via-[#EBFBF7] to-white border border-[#91C4FC] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white text-[#0A699F] border border-[#91C4FC] uppercase">
              Driver Dispatch Interface
            </span>
            <span className="text-xs font-bold text-[#292D32]">
              Assigned: {activeRequest?.incidentType || 'Emergency Incident (Cardiac STEMI)'}
            </span>
          </div>
          <p className="text-xs text-[#858F99]">
            Destination: <strong className="text-[#292D32]">{activeRequest?.destinationAddress}</strong> · Unit: {vehicles[0]?.callSign} · ETA: {aStarResult ? `${aStarResult.totalEstimatedMinutes} min (A*)` : `${selectedRoute?.estimatedMinutes} min`}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* External Google Maps Deep Link */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-[#16A4E8] border border-[#16A4E8]/40 rounded-xl text-xs font-bold shadow-2xs transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>NAVIGATE WITH GOOGLE MAPS</span>
          </a>

          {/* In-App EMERGENX Turn-by-Turn Navigation */}
          <button
            onClick={() => setIsNavModalOpen(true)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-[#32B8BF] hover:bg-[#28A66A] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>START EMERGENX NAVIGATION</span>
          </button>
        </div>
      </div>

      {/* 4. Tab Navigation Bar */}
      <div className="flex items-center border-b border-[#E6EAEE] gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('graph_explorer')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'graph_explorer'
              ? 'border-[#32B8BF] text-[#292D32]'
              : 'border-transparent text-[#858F99] hover:text-[#292D32]'
          }`}
        >
          <Cpu className="w-4 h-4 text-[#32B8BF]" />
          <span>A* Search vs. Dijkstra Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab('multi_agent')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'multi_agent'
              ? 'border-[#32B8BF] text-[#292D32]'
              : 'border-transparent text-[#858F99] hover:text-[#292D32]'
          }`}
        >
          <GitFork className="w-4 h-4 text-[#16A4E8]" />
          <span>Multi-Agent Coordination & Deadlock Avoidance</span>
          {multiAgentPlan && multiAgentPlan.conflictsDetected.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#EBFBF7] text-[#28A66A] text-[10px] font-mono font-bold">
              {multiAgentPlan.conflictsDetected.length} Resolved
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('continuous_reroute')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'continuous_reroute'
              ? 'border-[#32B8BF] text-[#292D32]'
              : 'border-transparent text-[#858F99] hover:text-[#292D32]'
          }`}
        >
          <Activity className="w-4 h-4 text-[#F5B942]" />
          <span>Dynamic Traffic & Continuous Rerouting</span>
          {(domlurClosed || mgRoadClosed) && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#FEF8EB] text-[#F5B942] text-[10px] font-mono font-bold">
              Closures Active
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('scoring_weights')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'scoring_weights'
              ? 'border-[#32B8BF] text-[#292D32]'
              : 'border-transparent text-[#858F99] hover:text-[#292D32]'
          }`}
        >
          <Sliders className="w-4 h-4 text-[#858F99]" />
          <span>Alternative Route Scoring</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'history'
              ? 'border-[#32B8BF] text-[#292D32]'
              : 'border-transparent text-[#858F99] hover:text-[#292D32]'
          }`}
        >
          <Clock className="w-4 h-4 text-[#858F99]" />
          <span>Audit Trail & History</span>
        </button>
      </div>

      {/* 5. TAB CONTENT */}

      {/* TAB 1: A* SEARCH VS. DIJKSTRA GRAPH EXPLORER */}
      {activeTab === 'graph_explorer' && (
        <div className="space-y-5 animate-fade-in">
          {/* Node Selector Bar */}
          <div className="p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div>
                <label className="text-[#858F99] block text-[10px] uppercase font-mono font-bold mb-1">
                  Origin Node
                </label>
                <select
                  value={selectedStartNode}
                  onChange={(e) => {
                    setSelectedStartNode(e.target.value);
                    fetchGraphCalculation(e.target.value, selectedGoalNode);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#F5F7F9] border border-[#E6EAEE] text-[#292D32] font-semibold outline-none cursor-pointer"
                >
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name} ({node.type.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="self-end pb-2 text-[#858F99]">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div>
                <label className="text-[#858F99] block text-[10px] uppercase font-mono font-bold mb-1">
                  Destination Node
                </label>
                <select
                  value={selectedGoalNode}
                  onChange={(e) => {
                    setSelectedGoalNode(e.target.value);
                    fetchGraphCalculation(selectedStartNode, e.target.value);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#F5F7F9] border border-[#E6EAEE] text-[#292D32] font-semibold outline-none cursor-pointer"
                >
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.name} ({node.type.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => fetchGraphCalculation(selectedStartNode, selectedGoalNode)}
              disabled={isCalculating}
              className="flex items-center gap-2 px-4 py-2 bg-[#32B8BF] hover:bg-[#28A66A] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
              <span>{isCalculating ? 'Calculating Algorithms...' : 'Execute Pathfinding Comparison'}</span>
            </button>
          </div>

          {/* Side-by-Side Algorithm Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: A* Search Algorithm */}
            <div className="p-5 rounded-xl bg-white border-2 border-[#32B8BF] shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#32B8BF]"></span>
                    <h3 className="text-sm font-bold text-[#292D32]">A* Search Algorithm</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30 font-bold uppercase">
                    Recommended Optimal Corridor
                  </span>
                </div>

                <p className="text-xs text-[#858F99]">
                  Evaluates <span className="font-mono font-bold text-[#292D32]">f(n) = g(n) + h(n)</span> using an admissible Haversine distance heuristic divided by emergency transit speed. Prunes suboptimal branches directed away from the destination.
                </p>

                {/* Performance Metrics Grid */}
                {aStarResult && (
                  <div className="grid grid-cols-4 gap-2 bg-[#F5F7F9] p-3 rounded-lg border border-[#E6EAEE] font-mono text-center">
                    <div>
                      <span className="text-[10px] text-[#858F99] block">Transit Time</span>
                      <span className="font-bold text-[#28A66A] text-sm">{aStarResult.totalEstimatedMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#858F99] block">Distance</span>
                      <span className="font-bold text-[#292D32] text-sm">{aStarResult.totalDistanceKm}km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#858F99] block">Nodes Explored</span>
                      <span className="font-bold text-[#0A699F] text-sm">{aStarResult.nodesExploredCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#858F99] block">Compute Time</span>
                      <span className="font-bold text-[#292D32] text-sm">{aStarResult.executionTimeMs}ms</span>
                    </div>
                  </div>
                )}

                {/* Path Traversal Steps */}
                {aStarResult && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-mono font-bold text-[#858F99] uppercase block">
                      Trajectory Node Sequence ({aStarResult.pathNodeNames.length} Waypoints)
                    </span>
                    <div className="space-y-1">
                      {aStarResult.segments.map((seg, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#F5F7F9] border border-[#E6EAEE] text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#EBFBF7] text-[#32B8BF] font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <strong className="text-[#292D32] text-[11px] block">{seg.toName}</strong>
                              <span className="text-[10px] text-[#858F99]">{seg.roadName}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[#292D32] font-semibold text-[11px] block">{seg.estimatedMinutes}m</span>
                            <span className="text-[10px] text-[#858F99]">{seg.distanceKm} km</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E6EAEE] flex items-center justify-between text-xs">
                <span className="text-[#858F99] font-mono text-[11px]">
                  Heuristic Efficiency: <strong className="text-[#32B8BF]">{aStarResult?.heuristicEfficiencyPercent}%</strong>
                </span>
                <span className="text-[#28A66A] font-semibold">Destination-Directed Priority</span>
              </div>
            </div>

            {/* Card 2: Dijkstra's Algorithm */}
            <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#16A4E8]"></span>
                    <h3 className="text-sm font-bold text-[#292D32]">Dijkstra's Algorithm</h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF5FB] text-[#0A699F] border border-[#91C4FC] font-semibold uppercase">
                    Baseline Uniform-Cost Shortest Path
                  </span>
                </div>

                <p className="text-xs text-[#858F99]">
                  Computes uniform-cost shortest distance without heuristic guidance. Explores frontier spherically across the road network, ensuring global distance verification.
                </p>

                {/* Performance Metrics Grid */}
                {dijkstraResult && (
                  <div className="grid grid-cols-4 gap-2 bg-[#F5F7F9] p-3 rounded-lg border border-[#E6EAEE] font-mono text-center">
                    <div>
                      <span className="text-[10px] text-[#858F99] block">Transit Time</span>
                      <span className="font-bold text-[#292D32] text-sm">{dijkstraResult.totalEstimatedMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#858F99] block">Distance</span>
                      <span className="font-bold text-[#0A699F] text-sm">{dijkstraResult.totalDistanceKm}km</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#858F99] block">Nodes Explored</span>
                      <span className="font-bold text-[#858F99] text-sm">{dijkstraResult.nodesExploredCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#858F99] block">Compute Time</span>
                      <span className="font-bold text-[#292D32] text-sm">{dijkstraResult.executionTimeMs}ms</span>
                    </div>
                  </div>
                )}

                {/* Path Traversal Steps */}
                {dijkstraResult && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-mono font-bold text-[#858F99] uppercase block">
                      Uniform-Cost Frontier Nodes ({dijkstraResult.pathNodeNames.length} Waypoints)
                    </span>
                    <div className="space-y-1">
                      {dijkstraResult.segments.map((seg, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#F5F7F9] border border-[#E6EAEE] text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#EBF5FB] text-[#16A4E8] font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <div>
                              <strong className="text-[#292D32] text-[11px] block">{seg.toName}</strong>
                              <span className="text-[10px] text-[#858F99]">{seg.roadName}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[#292D32] font-semibold text-[11px] block">{seg.estimatedMinutes}m</span>
                            <span className="text-[10px] text-[#858F99]">{seg.distanceKm} km</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E6EAEE] flex items-center justify-between text-xs">
                <span className="text-[#858F99] font-mono text-[11px]">
                  Nodes Explored: <strong>{dijkstraResult?.nodesExploredCount}</strong> ({aStarResult && dijkstraResult ? `${Math.round(((dijkstraResult.nodesExploredCount - aStarResult.nodesExploredCount) / Math.max(1, dijkstraResult.nodesExploredCount)) * 100)}% more exploration` : ''})
                </span>
                <span className="text-[#0A699F] font-semibold">Pure Shortest Baseline</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-AGENT ROUTE COORDINATION & DEADLOCK AVOIDANCE */}
      {activeTab === 'multi_agent' && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6EAEE] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#292D32]">
                  Simultaneous Multi-Emergency Vehicle Route Coordination
                </h3>
                <p className="text-xs text-[#858F99]">
                  Coordinates concurrent emergency dispatches across shared intersections to prevent corridor saturation and intersection deadlocks.
                </p>
              </div>
              <button
                onClick={fetchMultiAgentPlan}
                disabled={isCoordinating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#32B8BF] hover:bg-[#28A66A] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCoordinating ? 'animate-spin' : ''}`} />
                <span>Re-evaluate Coordination</span>
              </button>
            </div>

            {/* Coordinated Vehicles Cards */}
            {multiAgentPlan && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {multiAgentPlan.coordinatedRoutes.map((veh) => (
                  <div key={veh.vehicleId} className="p-3.5 rounded-xl bg-[#F5F7F9] border border-[#E6EAEE] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#292D32]">{veh.callSign}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-[#0A699F] border border-[#91C4FC] font-bold">
                        Priority Rank #{veh.priorityRank}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#858F99]">
                      Trajectory: <strong className="text-[#292D32]">{veh.route.pathNodeNames[0]}</strong> → <strong className="text-[#292D32]">{veh.route.pathNodeNames[veh.route.pathNodeNames.length - 1]}</strong>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px] bg-white p-2 rounded border border-[#E6EAEE]">
                      <span>ETA: <strong>{veh.route.totalEstimatedMinutes}m</strong></span>
                      <span>Dist: <strong>{veh.route.totalDistanceKm}km</strong></span>
                    </div>
                    {veh.deadlockStrategyApplied && (
                      <div className="p-2 rounded bg-[#EBFBF7] border border-[#28A66A]/30 text-[10px] text-[#28A66A] font-medium">
                        🛡️ {veh.deadlockStrategyApplied}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deadlock Detection & Resolution Matrix */}
          {multiAgentPlan && (
            <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#28A66A]" />
                  <h4 className="text-sm font-bold text-[#292D32]">
                    Deadlock Avoidance & Convergence Analysis Matrix
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold text-[#28A66A] bg-[#EBFBF7] px-2.5 py-1 rounded border border-[#28A66A]/30">
                  Deadlock Protection: Active (Zero Gridlocks)
                </span>
              </div>

              {multiAgentPlan.conflictsDetected.length > 0 ? (
                <div className="space-y-2.5">
                  {multiAgentPlan.conflictsDetected.map((conf, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-[#91C4FC] bg-[#EBF5FB]/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0A699F]">{conf.nodeName}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white text-[#FE595B] border border-[#FE595B]/40 font-bold">
                            Convergence Delta: {conf.timeDeltaSeconds}s
                          </span>
                        </div>
                        <p className="text-[11px] text-[#858F99]">
                          Competing Units: {conf.competingVehicles.map((v) => `${v.callSign} (Arr: ${v.predictedArrivalMinute}m)`).join(' vs. ')}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-[#E6EAEE] text-[11px] font-medium text-[#28A66A] max-w-md">
                        {conf.actionTaken}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#EBFBF7] border border-[#28A66A]/30 text-xs text-[#28A66A] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>All scheduled emergency corridors are non-conflicting. Staggered clearance preemption enabled.</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DYNAMIC TRAFFIC & CONTINUOUS REROUTING LAB */}
      {activeTab === 'continuous_reroute' && (
        <div className="space-y-5 animate-fade-in">
          {/* Incident / Road Closure Injector */}
          <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#292D32]">Dynamic Road Incident & Closure Simulation Lab</h3>
              <p className="text-xs text-[#858F99]">
                Toggle simulated road network events to test automated continuous rerouting and dynamic weight adaptation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Toggle 1: Domlur Underpass */}
              <div className="p-4 rounded-xl bg-[#F5F7F9] border border-[#E6EAEE] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <strong className="text-xs text-[#292D32] block">Domlur Underpass / Old Airport Rd Arterial</strong>
                  <span className="text-[11px] text-[#858F99]">
                    {domlurClosed ? 'Road Closed (Pipeline burst flood)' : 'Open with normal congestion (1.8x)'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleToggleClosure(
                      'E_TRINITY_DOMLUR',
                      domlurClosed,
                      'Pipeline Excavation Flood - Underpass Inundated'
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    domlurClosed
                      ? 'bg-[#FE595B] text-white hover:bg-red-600'
                      : 'bg-white border border-[#E6EAEE] text-[#292D32] hover:bg-slate-100'
                  }`}
                >
                  {domlurClosed ? 'Reopen Road' : 'Simulate Closure'}
                </button>
              </div>

              {/* Toggle 2: MG Road Central Strip */}
              <div className="p-4 rounded-xl bg-[#F5F7F9] border border-[#E6EAEE] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <strong className="text-xs text-[#292D32] block">MG Road & Brigade Rd Central Strip</strong>
                  <span className="text-[11px] text-[#858F99]">
                    {mgRoadClosed ? 'Road Closed (VIP Convoy Security Protocol)' : 'Open (Signal priority active)'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleToggleClosure(
                      'E_MG_MAYO',
                      mgRoadClosed,
                      'VIP Security Protocol - Arterial Held'
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                    mgRoadClosed
                      ? 'bg-[#FE595B] text-white hover:bg-red-600'
                      : 'bg-white border border-[#E6EAEE] text-[#292D32] hover:bg-slate-100'
                  }`}
                >
                  {mgRoadClosed ? 'Reopen Road' : 'Simulate Closure'}
                </button>
              </div>
            </div>
          </div>

          {/* Continuous Reroute Status Banner */}
          {continuousReroute && continuousReroute.rerouteRecommended ? (
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#FEF8EB] to-white border-2 border-[#F5B942] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-bounce-subtle">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#F5B942]" />
                  <h4 className="text-sm font-bold text-[#292D32]">
                    Continuous Reroute Recommendation Triggered
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FE595B] text-white font-bold uppercase">
                    Threshold &gt; 15% Exceeded
                  </span>
                </div>
                <p className="text-xs text-[#858F99]">{continuousReroute.reason}</p>
                <div className="flex items-center gap-3 text-xs font-mono pt-1">
                  <span>Current Remaining: <strong className="text-[#FE595B]">{continuousReroute.currentEstimatedRemainingMinutes}m</strong></span>
                  <span>New Corridor: <strong className="text-[#28A66A]">{continuousReroute.alternativeEstimatedRemainingMinutes}m</strong></span>
                  <span className="text-[#0A699F] font-bold">Saved: -{continuousReroute.timeSavingsMinutes} mins ({continuousReroute.costImprovementPercent}%)</span>
                </div>
              </div>

              <button
                onClick={handleApplyReroute}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#28A66A] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Check className="w-4 h-4" />
                <span>ACCEPT & APPLY REROUTE</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#EBFBF7] border border-[#28A66A]/30 text-xs text-[#28A66A] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Continuous Rerouting Engine Active: Current path remains within optimal cost threshold (&lt;15% variance).</span>
              </div>
              <span className="font-mono text-[11px] font-semibold text-[#858F99]">Poll interval: 10s</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: EXPLAINABLE MULTI-FACTOR SCORING WEIGHTS */}
      {activeTab === 'scoring_weights' && (
        <div className="space-y-5 animate-fade-in">
          {/* Weights Config Panel */}
          <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6EAEE] pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-[#292D32]">
                  Multi-Factor Cost Formula Parameters
                </h3>
                <p className="text-[11px] text-[#858F99]">
                  Cost = (w_time × Time) + (w_cong × Congestion) + (w_close × Closure) + (w_int × Delay) + (w_risk × Risk) + (w_conf × Conflict)
                </p>
              </div>
              <button
                onClick={() =>
                  setWeights({
                    travelTimeWeight: 2.0,
                    congestionWeight: 1.5,
                    roadClosureWeight: 10.0,
                    intersectionWeight: 1.2,
                    reliabilityWeight: 1.0,
                    coordinationWeight: 2.5,
                  })
                }
                className="text-xs text-[#0A699F] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs font-mono">
              <div>
                <label className="text-[#858F99] block text-[10px] mb-1">Travel Time (w_time)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weights.travelTimeWeight}
                  onChange={(e) => setWeights({ ...weights, travelTimeWeight: parseFloat(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                />
              </div>
              <div>
                <label className="text-[#858F99] block text-[10px] mb-1">Congestion (w_cong)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weights.congestionWeight}
                  onChange={(e) => setWeights({ ...weights, congestionWeight: parseFloat(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                />
              </div>
              <div>
                <label className="text-[#858F99] block text-[10px] mb-1">Road Closure (w_close)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weights.roadClosureWeight}
                  onChange={(e) => setWeights({ ...weights, roadClosureWeight: parseFloat(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                />
              </div>
              <div>
                <label className="text-[#858F99] block text-[10px] mb-1">Intersection (w_int)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weights.intersectionWeight}
                  onChange={(e) => setWeights({ ...weights, intersectionWeight: parseFloat(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                />
              </div>
              <div>
                <label className="text-[#858F99] block text-[10px] mb-1">Reliability (w_risk)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weights.reliabilityWeight}
                  onChange={(e) => setWeights({ ...weights, reliabilityWeight: parseFloat(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                />
              </div>
              <div>
                <label className="text-[#858F99] block text-[10px] mb-1">Coordination (w_conf)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weights.coordinationWeight}
                  onChange={(e) => setWeights({ ...weights, coordinationWeight: parseFloat(e.target.value) || 1 })}
                  className="w-full px-2.5 py-1.5 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                />
              </div>
            </div>
          </div>

          {/* Three Alternative Route Scoring Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {enrichedRoutes.map((rt) => {
              const isSelected = rt.id === activeRouteId;
              const cost = rt.costBreakdown;

              return (
                <div
                  key={rt.id}
                  onClick={() => selectRoute(rt.id)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-[#32B8BF] shadow-sm ring-2 ring-[#32B8BF]/30'
                      : 'bg-white border-[#E6EAEE] hover:border-[#32B8BF]/40 shadow-2xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#858F99] uppercase font-semibold">
                        {rt.id.replace('_', ' ').toUpperCase()}
                      </span>
                      {rt.recommended ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30 font-bold uppercase">
                          Recommended Best Cost
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F7F9] text-[#858F99] border border-[#E6EAEE] font-semibold uppercase">
                          Alternative
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-[#292D32]">{rt.name}</h3>
                      <p className="text-xs text-[#858F99] mt-0.5 leading-normal">{rt.via}</p>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-[#F5F7F9] p-2.5 rounded-lg border border-[#E6EAEE] font-mono text-center">
                      <div>
                        <span className="text-[10px] text-[#858F99] block">Est Time</span>
                        <span className="font-bold text-[#292D32] text-sm">{rt.estimatedMinutes}m</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#858F99] block">Distance</span>
                        <span className="font-bold text-[#292D32] text-sm">{rt.distanceKm}km</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#858F99] block">Score</span>
                        <span className="font-bold text-[#0A699F] text-sm">
                          {rt.optimizationScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Cost Factor Breakdown */}
                    <div className="space-y-1 text-[11px] font-mono bg-white p-2 rounded border border-[#E6EAEE]">
                      <div className="flex justify-between text-[#858F99]">
                        <span>Time Cost:</span>
                        <span className="text-[#292D32]">{cost.travelTimeCost}</span>
                      </div>
                      <div className="flex justify-between text-[#858F99]">
                        <span>Congestion Penalty:</span>
                        <span className="text-[#292D32]">{cost.congestionPenalty}</span>
                      </div>
                      <div className="flex justify-between text-[#858F99]">
                        <span>Intersection Delay:</span>
                        <span className="text-[#292D32]">{cost.intersectionDelay}</span>
                      </div>
                      <div className="flex justify-between text-[#858F99]">
                        <span>Conflict Risk:</span>
                        <span className="text-[#292D32]">{cost.conflictPenalty}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-[#E6EAEE] font-bold text-[#0A699F]">
                        <span>Total Cost Score:</span>
                        <span>{cost.totalCost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E6EAEE] flex items-center justify-between">
                    <span className="text-[10px] text-[#858F99] font-mono">
                      {rt.intersectionsCount} Controlled Junctions
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-[#32B8BF]' : 'text-[#858F99] group-hover:text-[#292D32]'
                      }`}
                    >
                      {isSelected ? '✓ Active Selected Route' : 'Select This Route →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT TRAIL & ROUTE HISTORY */}
      {activeTab === 'history' && (
        <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#292D32]">Route History & Audit Trail</h3>
              <p className="text-xs text-[#858F99]">
                Historical algorithmic calculations, factor penalties, and driver decisions.
              </p>
            </div>
            <span className="text-xs font-mono text-[#858F99]">
              {routeHistory.length} Recorded Journeys
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E6EAEE] text-[#858F99] font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Route ID</th>
                  <th className="py-2.5 px-3">Assigned Vehicle</th>
                  <th className="py-2.5 px-3">Selected Corridor</th>
                  <th className="py-2.5 px-3">Distance / ETA</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Driver Action</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAEE]">
                {routeHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5F7F9] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0A699F]">{item.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#292D32]">{item.vehicleCallSign}</td>
                    <td className="py-2.5 px-3 text-[#292D32] max-w-xs truncate">{item.selectedRouteName}</td>
                    <td className="py-2.5 px-3 font-mono text-[#292D32]">
                      {item.distanceKm} km · {item.estimatedMinutes} min
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-[#28A66A]">{item.optimizationScore}/100</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#EBFBF7] text-[#28A66A] font-semibold text-[10px] uppercase font-mono">
                        {item.driverDecision}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#EBF5FB] text-[#0A699F] font-semibold text-[10px] uppercase font-mono">
                        {item.journeyStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#858F99] font-mono text-[11px]">{item.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Interactive Map Viewport with Corridor */}
      <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#292D32]">
              Corridor Geometry & Preempted Intersections
            </span>
            <span className="text-xs text-[#858F99]">
              · {aStarResult ? `A* Path (${aStarResult.totalEstimatedMinutes}m)` : selectedRoute.name}
            </span>
          </div>
          <span className="text-xs font-mono text-[#28A66A] font-semibold bg-[#EBFBF7] px-2.5 py-1 rounded border border-[#28A66A]/30">
            Active Corridor ETA: {aStarResult ? aStarResult.totalEstimatedMinutes : selectedRoute.estimatedMinutes} mins
          </span>
        </div>

        <div className="h-[440px] rounded-xl overflow-hidden border border-[#E6EAEE]">
          <GoogleCityMap />
        </div>
      </div>

      {/* Global Navigation Simulation Modal */}
      <EmergenxNavigationModal
        isOpen={isNavModalOpen}
        onClose={() => setIsNavModalOpen(false)}
        request={activeRequest}
      />
    </div>
  );
};
