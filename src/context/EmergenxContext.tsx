import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  EmergencyVehicle,
  EmergencyRequest,
  TrafficIntersection,
  HospitalFacility,
  ConflictScenario,
  RouteOption,
  JourneyAnalytics,
  AuditLogItem,
  NotificationItem,
  UserProfile,
  UserRole,
  VehicleCategory,
  EmergencySeverity,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_VEHICLES,
  INITIAL_INTERSECTIONS,
  INITIAL_HOSPITALS,
  INITIAL_REQUESTS,
  INITIAL_CONFLICT_SCENARIO,
  ROUTE_ALTERNATIVES,
  INITIAL_NOTIFICATIONS,
  INITIAL_JOURNEYS,
  INITIAL_AUDIT_LOGS,
} from '../data/seedData';

interface EmergenxContextType {
  currentUser: UserProfile;
  switchUserRole: (role: UserRole) => void;
  vehicles: EmergencyVehicle[];
  requests: EmergencyRequest[];
  intersections: TrafficIntersection[];
  hospitals: HospitalFacility[];
  conflictScenario: ConflictScenario;
  notifications: NotificationItem[];
  journeys: JourneyAnalytics[];
  auditLogs: AuditLogItem[];
  routes: RouteOption[];
  activeRouteId: string;
  selectRoute: (routeId: string) => void;
  
  // Navigation & Selection
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  selectedIntersectionId: string | null;
  setSelectedIntersectionId: (id: string | null) => void;

  // Filters
  categoryFilter: VehicleCategory | 'all';
  setCategoryFilter: (cat: VehicleCategory | 'all') => void;
  severityFilter: EmergencySeverity | 'all';
  setSeverityFilter: (sev: EmergencySeverity | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Simulation Controls
  isSimulating: boolean;
  toggleSimulation: (forced?: boolean) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  activeScenarioPreset: string;
  loadScenarioPreset: (presetKey: string) => void;
  resetSimulation: () => void;

  // Network Resilience
  networkStatus: 'normal' | 'weak' | 'offline';
  setNetworkStatus: (status: 'normal' | 'weak' | 'offline') => void;
  gpsStaleSeconds: number;

  // Actions
  registerVehicle: (vehicle: Omit<EmergencyVehicle, 'id' | 'lastUpdated'>) => void;
  updateVehicle: (id: string, updates: Partial<EmergencyVehicle>) => void;
  activateEmergency: (data: {
    vehicleId: string;
    incidentType: string;
    description: string;
    severity: EmergencySeverity;
    destinationHospitalId?: string;
    destinationAddress: string;
    routeId?: string;
  }) => string;
  approveRequestPriority: (requestId: string) => void;
  resolveConflict: (status: 'controller_approved' | 'rejected') => void;
  acknowledgeHospitalTriage: (hospitalId: string, requestId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
}

const EmergenxContext = createContext<EmergenxContextType | undefined>(undefined);

export const EmergenxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]); // Traffic Police
  const [vehicles, setVehicles] = useState<EmergencyVehicle[]>(INITIAL_VEHICLES);
  const [requests, setRequests] = useState<EmergencyRequest[]>(INITIAL_REQUESTS);
  const [intersections, setIntersections] = useState<TrafficIntersection[]>(INITIAL_INTERSECTIONS);
  const [hospitals, setHospitals] = useState<HospitalFacility[]>(INITIAL_HOSPITALS);
  const [conflictScenario, setConflictScenario] = useState<ConflictScenario>(INITIAL_CONFLICT_SCENARIO);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [journeys, setJourneys] = useState<JourneyAnalytics[]>(INITIAL_JOURNEYS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [routes, setRoutes] = useState<RouteOption[]>(ROUTE_ALTERNATIVES);
  const [activeRouteId, setActiveRouteId] = useState<string>('route_b_bypass');

  // Filters & selection
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('veh_amb_01');
  const [selectedIntersectionId, setSelectedIntersectionId] = useState<string | null>('int_01');
  const [categoryFilter, setCategoryFilter] = useState<VehicleCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<EmergencySeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Simulation
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [activeScenarioPreset, setActiveScenarioPreset] = useState<string>('preset_c_multiple');

  // Network State
  const [networkStatus, setNetworkStatus] = useState<'normal' | 'weak' | 'offline'>('normal');
  const [gpsStaleSeconds, setGpsStaleSeconds] = useState<number>(0);

  // Role Switcher
  const switchUserRole = useCallback((role: UserRole) => {
    const found = DEMO_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      // Log switch
      const newLog: AuditLogItem = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        userId: found.id,
        userName: found.name,
        userRole: found.role,
        action: 'ROLE_SWITCH_DEMO',
        details: `Switched active command dashboard role to ${found.role}`,
        severity: 'info',
        ipAddress: '127.0.0.1',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  }, []);

  // Notifications
  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Vehicle Management
  const registerVehicle = useCallback(
    (newVehicleData: Omit<EmergencyVehicle, 'id' | 'lastUpdated'>) => {
      const newId = `veh_${Date.now()}`;
      const newVehicle: EmergencyVehicle = {
        ...newVehicleData,
        id: newId,
        lastUpdated: 'Just now',
      };
      setVehicles((prev) => [newVehicle, ...prev]);
      addNotification({
        type: 'activation',
        severity: 'info',
        title: 'New Emergency Vehicle Registered',
        message: `${newVehicle.callSign} (${newVehicle.registrationNumber}) added to active fleet.`,
        relatedVehicleId: newId,
      });

      const newLog: AuditLogItem = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'VEHICLE_REGISTRATION',
        details: `Registered ${newVehicle.callSign} (${newVehicle.category}) to ${newVehicle.assignedService}`,
        severity: 'info',
        ipAddress: '10.24.1.88',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [addNotification, currentUser]
  );

  const updateVehicle = useCallback((id: string, updates: Partial<EmergencyVehicle>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, lastUpdated: 'Just now' } : v))
    );
  }, []);

  // Emergency Request Activation
  const activateEmergency = useCallback(
    (data: {
      vehicleId: string;
      incidentType: string;
      description: string;
      severity: EmergencySeverity;
      destinationHospitalId?: string;
      destinationAddress: string;
      routeId?: string;
    }) => {
      const targetVehicle = vehicles.find((v) => v.id === data.vehicleId);
      const reqId = `req_${Date.now()}`;
      const destHospital = hospitals.find((h) => h.id === data.destinationHospitalId);

      const newReq: EmergencyRequest = {
        id: reqId,
        vehicleId: data.vehicleId,
        category: targetVehicle ? targetVehicle.category : 'ambulance',
        severity: data.severity,
        incidentType: data.incidentType,
        description: data.description,
        pickupLocation: targetVehicle ? targetVehicle.currentLocation : { lat: 12.9716, lng: 77.5946 },
        pickupAddress: targetVehicle ? targetVehicle.locationName : 'Command Center Dispatch',
        destinationLocation: destHospital ? destHospital.location : { lat: 12.9592, lng: 77.6486 },
        destinationAddress: data.destinationAddress || (destHospital ? destHospital.name : 'Emergency Facility'),
        destinationHospitalId: data.destinationHospitalId,
        status: 'active',
        requestedAt: new Date().toLocaleTimeString(),
        approvedAt: new Date().toLocaleTimeString(),
        approvedBy: currentUser.name,
        currentEtaMinutes: 7.5,
        selectedRouteId: data.routeId || activeRouteId,
        priorityScore: data.severity === 'critical' ? 98 : data.severity === 'high' ? 88 : 74,
        signalPriorityGranted: true,
      };

      setRequests((prev) => [newReq, ...prev]);

      // Update vehicle status
      if (targetVehicle) {
        updateVehicle(targetVehicle.id, {
          status: 'en_route',
          activeRequestId: reqId,
          destination: newReq.destinationLocation,
          destinationName: newReq.destinationAddress,
        });
      }

      // If assigned to a hospital, notify ER triage
      if (data.destinationHospitalId) {
        setHospitals((prev) =>
          prev.map((h) => {
            if (h.id === data.destinationHospitalId) {
              return {
                ...h,
                incomingAmbulances: [
                  {
                    requestId: reqId,
                    vehicleCallSign: targetVehicle ? targetVehicle.callSign : 'MEDIC UNIT',
                    etaMinutes: 7.5,
                    patientCondition: `${data.incidentType}: ${data.description.substring(0, 60)}...`,
                    triageCategory: data.severity === 'critical' ? 'Red' : 'Yellow',
                    acknowledged: false,
                  },
                  ...h.incomingAmbulances,
                ],
              };
            }
            return h;
          })
        );
      }

      addNotification({
        type: 'activation',
        severity: data.severity === 'critical' ? 'critical' : 'warning',
        title: 'Emergency Dispatched with Green Wave Corridor',
        message: `${targetVehicle?.callSign || 'Emergency Unit'} activated for ${data.incidentType}. Route optimized.`,
        relatedRequestId: reqId,
        relatedVehicleId: data.vehicleId,
      });

      return reqId;
    },
    [vehicles, hospitals, activeRouteId, currentUser, updateVehicle, addNotification]
  );

  const approveRequestPriority = useCallback(
    (requestId: string) => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: 'active',
                signalPriorityGranted: true,
                approvedAt: new Date().toLocaleTimeString(),
                approvedBy: currentUser.name,
              }
            : r
        )
      );
      addNotification({
        type: 'priority',
        severity: 'success',
        title: 'Signal Priority Wave Authorized',
        message: `Traffic Police Control authorized emergency signal priority for Request ${requestId}.`,
        relatedRequestId: requestId,
      });
    },
    [currentUser, addNotification]
  );

  // Conflict Resolution
  const resolveConflict = useCallback(
    (status: 'controller_approved' | 'rejected') => {
      setConflictScenario((prev) => ({
        ...prev,
        resolutionStatus: status,
      }));

      if (status === 'controller_approved') {
        // Update the intersection to show active staggered wave
        setIntersections((prev) =>
          prev.map((inter) => {
            if (inter.id === conflictScenario.intersectionId) {
              return {
                ...inter,
                currentSignal: 'PRIORITY_GREEN',
                signalTransitionStatus: 'priority_hold',
                activePriorityRequestId: 'req_001',
              };
            }
            return inter;
          })
        );

        addNotification({
          type: 'priority',
          severity: 'success',
          title: 'Conflict Decision Deployed to Junction',
          message: `Staggered phase priority implemented at ${conflictScenario.intersectionName}. MEDIC-101 passing first, FIRE-21 held +45s.`,
        });

        const newLog: AuditLogItem = {
          id: `log_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'CONFLICT_RESOLUTION_APPROVED',
          details: `Authorized AI recommendation for intersection ${conflictScenario.intersectionId}: ${conflictScenario.recommendation.statutoryPolicyRule}`,
          severity: 'security',
          ipAddress: '10.24.1.88',
        };
        setAuditLogs((prev) => [newLog, ...prev]);
      } else {
        addNotification({
          type: 'priority',
          severity: 'warning',
          title: 'AI Recommendation Overridden',
          message: `Controller rejected automated conflict resolution. Manual junction override mode engaged.`,
        });
      }
    },
    [conflictScenario, currentUser, addNotification]
  );

  // Hospital Acknowledgment
  const acknowledgeHospitalTriage = useCallback((hospitalId: string, requestId: string) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          return {
            ...h,
            incomingAmbulances: h.incomingAmbulances.map((amb) =>
              amb.requestId === requestId
                ? {
                    ...amb,
                    acknowledged: true,
                    acknowledgedBy: 'Dr. Ananya Sharma (ER Triage Lead)',
                  }
                : amb
            ),
          };
        }
        return h;
      })
    );
  }, []);

  // Route selection
  const selectRoute = useCallback((routeId: string) => {
    setActiveRouteId(routeId);
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        recommended: r.id === routeId,
      }))
    );
  }, []);

  // Simulation Controls & Presets
  const toggleSimulation = useCallback((forced?: boolean) => {
    setIsSimulating((prev) => (forced !== undefined ? forced : !prev));
  }, []);

  const resetSimulation = useCallback(() => {
    setVehicles(INITIAL_VEHICLES);
    setIntersections(INITIAL_INTERSECTIONS);
    setRequests(INITIAL_REQUESTS);
    setConflictScenario(INITIAL_CONFLICT_SCENARIO);
    setGpsStaleSeconds(0);
    setNetworkStatus('normal');
  }, []);

  const loadScenarioPreset = useCallback(
    (presetKey: string) => {
      setActiveScenarioPreset(presetKey);
      resetSimulation();

      if (presetKey === 'preset_a_single') {
        // Single ambulance emergency
        setVehicles((prev) =>
          prev.map((v, i) =>
            i === 0
              ? { ...v, status: 'en_route', currentSpeedKmh: 55 }
              : { ...v, status: 'idle', currentSpeedKmh: 0 }
          )
        );
        addNotification({
          type: 'activation',
          severity: 'info',
          title: 'Loaded Preset: Single Ambulance Emergency',
          message: 'Scenario A: MEDIC-101 in isolated transit on empty green corridor.',
        });
      } else if (presetKey === 'preset_b_fire') {
        // Fire engine responding
        setVehicles((prev) =>
          prev.map((v) =>
            v.category === 'fire_engine'
              ? { ...v, status: 'en_route', currentSpeedKmh: 50 }
              : { ...v, status: 'idle', currentSpeedKmh: 0 }
          )
        );
        addNotification({
          type: 'activation',
          severity: 'warning',
          title: 'Loaded Preset: High-Rise Fire Response',
          message: 'Scenario B: 3 Fire tenders dispatched to Brigade Rd commercial complex.',
        });
      } else if (presetKey === 'preset_c_multiple') {
        // Multiple emergency priority conflict
        setVehicles(INITIAL_VEHICLES);
        addNotification({
          type: 'priority',
          severity: 'critical',
          title: 'Loaded Preset: Multi-Emergency Convergence',
          message: 'Scenario C: Triple-vehicle conflict at MG Road & Brigade Road Junction.',
        });
      } else if (presetKey === 'preset_d_obstruction') {
        // Road obstruction during travel
        addNotification({
          type: 'obstruction',
          severity: 'warning',
          title: 'Loaded Preset: Road Obstruction Detected',
          message: 'Scenario D: Metro water line burst on Domlur Flyover forces dynamic rerouting to Route B.',
        });
      } else if (presetKey === 'preset_e_network') {
        // Network interruption
        setNetworkStatus('offline');
        addNotification({
          type: 'network',
          severity: 'critical',
          title: 'Loaded Preset: Network Loss & GPS Blackout',
          message: 'Scenario E: Cellular telemetry offline. Displaying last verified GPS coordinates with stale timer.',
        });
      } else if (presetKey === 'preset_f_deadlock') {
        // Complex overlapping routes
        addNotification({
          type: 'priority',
          severity: 'critical',
          title: 'Loaded Preset: Quad Corridor Overlap',
          message: 'Scenario F: 4 vehicles crossing Central Bangalore simultaneously.',
        });
      }
    },
    [resetSimulation, addNotification]
  );

  // Background Tick Loop for Real-time Simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // 1. If network is offline or weak, increment stale counter
      if (networkStatus !== 'normal') {
        setGpsStaleSeconds((s) => s + 1);
      } else {
        setGpsStaleSeconds(0);
      }

      // 2. Animate vehicles along slight trajectory if en_route
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status !== 'en_route' && v.status !== 'transporting') {
            return v;
          }

          // Move slightly toward destination or small jitter along path
          const latDelta = (Math.random() - 0.48) * 0.0003 * simulationSpeed;
          const lngDelta = (Math.random() - 0.46) * 0.0003 * simulationSpeed;
          const newSpeed = Math.min(65, Math.max(30, v.currentSpeedKmh + (Math.random() * 4 - 2)));

          return {
            ...v,
            currentLocation: {
              lat: v.currentLocation.lat + latDelta,
              lng: v.currentLocation.lng + lngDelta,
            },
            currentSpeedKmh: Math.round(newSpeed),
            lastUpdated: networkStatus === 'offline' ? `${gpsStaleSeconds}s ago (STALE)` : 'Just now',
          };
        })
      );

      // 3. Cycle non-priority intersections standard timing
      setIntersections((prev) =>
        prev.map((inter) => {
          if (inter.signalTransitionStatus === 'priority_hold') {
            return inter;
          }
          // Slight queue variance
          const queueChange = Math.floor(Math.random() * 3) - 1;
          const newQueue = Math.max(4, inter.queueVehicles + queueChange);
          return {
            ...inter,
            queueVehicles: newQueue,
            queueLengthMeters: Math.round(newQueue * 5.2),
          };
        })
      );
    }, 1200 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, networkStatus, gpsStaleSeconds]);

  return (
    <EmergenxContext.Provider
      value={{
        currentUser,
        switchUserRole,
        vehicles,
        requests,
        intersections,
        hospitals,
        conflictScenario,
        notifications,
        journeys,
        auditLogs,
        routes,
        activeRouteId,
        selectRoute,
        selectedVehicleId,
        setSelectedVehicleId,
        selectedIntersectionId,
        setSelectedIntersectionId,
        categoryFilter,
        setCategoryFilter,
        severityFilter,
        setSeverityFilter,
        searchQuery,
        setSearchQuery,
        isSimulating,
        toggleSimulation,
        simulationSpeed,
        setSimulationSpeed,
        activeScenarioPreset,
        loadScenarioPreset,
        resetSimulation,
        networkStatus,
        setNetworkStatus,
        gpsStaleSeconds,
        registerVehicle,
        updateVehicle,
        activateEmergency,
        approveRequestPriority,
        resolveConflict,
        acknowledgeHospitalTriage,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
      }}
    >
      {children}
    </EmergenxContext.Provider>
  );
};

export const useEmergenx = () => {
  const context = useContext(EmergenxContext);
  if (!context) {
    throw new Error('useEmergenx must be used within an EmergenxProvider');
  }
  return context;
};
