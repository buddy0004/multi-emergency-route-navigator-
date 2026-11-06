export type VehicleCategory = 
  | 'ambulance' 
  | 'fire_engine' 
  | 'police' 
  | 'disaster_rescue' 
  | 'blood_transport' 
  | 'other';

export type EmergencySeverity = 'critical' | 'high' | 'medium' | 'low';

export type EmergencyStatus = 'idle' | 'dispatched' | 'en_route' | 'on_scene' | 'transporting' | 'completed';

export type GpsStatus = 'live' | 'stale' | 'offline';

export type ConnectivityStatus = 'normal' | 'weak' | 'offline';

export type VerificationStatus = 'verified' | 'pending' | 'flagged';

export type UserRole = 
  | 'operator' 
  | 'traffic_police' 
  | 'hospital_admin' 
  | 'system_admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  badgeNumber: string;
  department: string;
  email: string;
  avatar?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface EmergencyVehicle {
  id: string;
  registrationNumber: string;
  callSign: string;
  category: VehicleCategory;
  assignedService: string;
  driverName: string;
  driverPhone: string;
  currentLocation: LatLng;
  locationName: string;
  destination?: LatLng;
  destinationName?: string;
  status: EmergencyStatus;
  gpsStatus: GpsStatus;
  connectivity: ConnectivityStatus;
  verificationStatus: VerificationStatus;
  currentSpeedKmh: number;
  activeRequestId?: string;
  lastUpdated: string;
  batteryOrFuelPercent: number;
}

export interface EmergencyRequest {
  id: string;
  vehicleId: string;
  category: VehicleCategory;
  severity: EmergencySeverity;
  incidentType: string;
  description: string;
  pickupLocation: LatLng;
  pickupAddress: string;
  destinationLocation: LatLng;
  destinationAddress: string;
  destinationHospitalId?: string;
  status: 'pending_approval' | 'approved' | 'active' | 'completed' | 'cancelled';
  requestedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  currentEtaMinutes: number;
  selectedRouteId: string;
  priorityScore: number;
  signalPriorityGranted: boolean;
}

export interface TrafficIntersection {
  id: string;
  name: string;
  location: LatLng;
  currentSignal: 'RED' | 'AMBER' | 'GREEN' | 'PRIORITY_GREEN' | 'ALL_RED_HOLD';
  normalCycleSeconds: number;
  activePriorityRequestId?: string;
  queueLengthMeters: number;
  queueVehicles: number;
  approachingVehicleEta?: number; // seconds
  signalTransitionStatus: 'standard' | 'transitioning' | 'priority_hold' | 'recovery';
  crossStreetName: string;
}

export interface RouteCostBreakdown {
  travelTimeCost: number;
  congestionPenalty: number;
  roadClosurePenalty: number;
  intersectionDelay: number;
  reliabilityRisk: number;
  conflictPenalty: number;
  totalCost: number;
}

export interface ScoringWeights {
  travelTimeWeight: number;
  congestionWeight: number;
  roadClosureWeight: number;
  intersectionWeight: number;
  reliabilityWeight: number;
  coordinationWeight: number;
}

export interface NavigationGuidanceStep {
  id: string;
  instruction: string;
  distanceMeters: number;
  streetName: string;
  maneuver: 'straight' | 'turn-left' | 'turn-right' | 'merge' | 'arrive' | 'intersection-hold';
  intersectionId?: string;
  intersectionSignal?: 'GREEN' | 'PRIORITY_GREEN' | 'RED' | 'AMBER';
  clearanceWindowSeconds?: number;
}

export interface RouteOption {
  id: string;
  name: string;
  via: string;
  distanceKm: number;
  estimatedMinutes: number;
  congestionLevel: 'Low' | 'Moderate' | 'Heavy' | 'Severe' | string;
  reliabilityScorePercent: number; // e.g. 94%
  intersectionsCount: number;
  waypoints: LatLng[];
  obstructionWarnings: string[];
  trafficImpactScore: number; // 1-100
  recommended: boolean;
  reason: string;
  optimizationScore?: number;
  costBreakdown?: RouteCostBreakdown;
  guidanceSteps?: NavigationGuidanceStep[];
}

export interface RoutePlanRecord {
  id: string;
  requestId: string;
  vehicleId: string;
  vehicleCallSign: string;
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  selectedRouteId: string;
  selectedRouteName: string;
  distanceKm: number;
  estimatedMinutes: number;
  optimizationScore: number;
  costBreakdown: RouteCostBreakdown;
  explanation: string;
  dataSource: string;
  dataFreshness: string;
  timestamp: string;
  driverDecision: 'accepted' | 'declined' | 'pending';
  journeyStatus: 'in_transit' | 'reached_scene' | 'transporting_hospital' | 'completed';
  rerouteCount: number;
}

export interface ConflictScenario {
  id: string;
  title: string;
  intersectionId: string;
  intersectionName: string;
  vehicles: {
    vehicleId: string;
    callSign: string;
    category: VehicleCategory;
    severity: EmergencySeverity;
    approachingFrom: string;
    distanceToJunctionMeters: number;
    etaSeconds: number;
    patientOrHazardDetails: string;
  }[];
  conflictType: 'simultaneous_arrival' | 'cross_traffic_deadlock' | 'corridor_overlap';
  detectedAt: string;
  resolutionStatus: 'evaluating' | 'recommended' | 'controller_approved' | 'executed' | 'rejected';
  recommendation: {
    firstPriorityVehicleId: string;
    secondPriorityVehicleId: string;
    thirdPriorityVehicleId?: string;
    holdDurationSeconds: number;
    rationale: string;
    statutoryPolicyRule: string;
    mitigationStrategy: string;
  };
}

export interface HospitalFacility {
  id: string;
  name: string;
  location: LatLng;
  address: string;
  availableTraumaBeds: number;
  availableIcuBeds: number;
  totalBeds: number;
  status: 'Normal' | 'Surge' | 'Critical_Capacity';
  contactPhone: string;
  incomingAmbulances: {
    requestId: string;
    vehicleCallSign: string;
    etaMinutes: number;
    patientCondition: string;
    triageCategory: 'Red' | 'Yellow' | 'Green';
    acknowledged: boolean;
    acknowledgedBy?: string;
  }[];
}

export interface NotificationItem {
  id: string;
  type: 'activation' | 'route' | 'congestion' | 'obstruction' | 'priority' | 'hospital' | 'network' | 'completion';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedVehicleId?: string;
  relatedRequestId?: string;
}

export interface JourneyAnalytics {
  id: string;
  requestId: string;
  vehicleCallSign: string;
  category: VehicleCategory;
  startTime: string;
  endTime: string;
  totalDistanceKm: number;
  timeWithoutPriorityMinutes: number;
  actualSimulatedMinutes: number;
  simulatedTimeSavedMinutes: number;
  intersectionsCleared: number;
  averageIntersectionWaitSeconds: number;
  congestionDelayAvoidedMinutes: number;
  hospitalDelivered: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  severity: 'info' | 'security' | 'override';
  ipAddress: string;
}
