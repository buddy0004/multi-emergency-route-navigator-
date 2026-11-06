import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useEmergenx } from '../../context/EmergenxContext';
import { EmergencyVehicle, TrafficIntersection, HospitalFacility, VehicleCategory } from '../../types';

// Category color mappings
const CATEGORY_COLORS: Record<VehicleCategory, { bg: string; text: string; border: string }> = {
  ambulance: { bg: '#ef4444', text: '#ffffff', border: '#b91c1c' },
  fire_engine: { bg: '#f97316', text: '#ffffff', border: '#c2410c' },
  police: { bg: '#3b82f6', text: '#ffffff', border: '#1d4ed8' },
  disaster_rescue: { bg: '#eab308', text: '#000000', border: '#ca8a04' },
  blood_transport: { bg: '#dc2626', text: '#ffffff', border: '#991b1b' },
  other: { bg: '#8b5cf6', text: '#ffffff', border: '#6d28d9' },
};

export const LeafletCityMap: React.FC<{
  className?: string;
  showCongestionOverlay?: boolean;
  showIntersections?: boolean;
  showHospitals?: boolean;
  focusVehicleId?: string | null;
  conflictMode?: boolean;
}> = ({
  className = 'h-full w-full',
  showCongestionOverlay = true,
  showIntersections = true,
  showHospitals = true,
  focusVehicleId,
  conflictMode = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const {
    vehicles,
    intersections,
    hospitals,
    routes,
    activeRouteId,
    networkStatus,
    gpsStaleSeconds,
    setSelectedVehicleId,
    setSelectedIntersectionId,
    categoryFilter,
    severityFilter,
    searchQuery,
  } = useEmergenx();

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered on Central Bangalore (MG Road - Indiranagar corridor)
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.6150],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // Dark Command Center Map Tiles from CartoDB Dark Matter
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Attribution
    L.control.attribution({ position: 'bottomright', prefix: 'EMERGENX Mobility Engine · OpenStreetMap' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Pan to focused vehicle if provided
  useEffect(() => {
    if (!mapInstanceRef.current || !focusVehicleId) return;
    const vehicle = vehicles.find((v) => v.id === focusVehicleId);
    if (vehicle) {
      mapInstanceRef.current.panTo([vehicle.currentLocation.lat, vehicle.currentLocation.lng], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [focusVehicleId, vehicles]);

  // Update Markers and Overlays on state change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !routeLayerRef.current) return;

    // Clear previous dynamic layers
    markersLayerRef.current.clearLayers();
    routeLayerRef.current.clearLayers();

    // 1. Render Active Route Polyline
    if (conflictMode) {
      // 1. Ambulance Route (Green)
      const ambPath: L.LatLngExpression[] = [
        [12.9752, 77.6012],
        [12.9738, 77.6074],
        [12.9723, 77.6206],
        [12.9610, 77.6387],
        [12.9592, 77.6486],
      ];
      const ambLine = L.polyline(ambPath, {
        color: '#10b981',
        weight: 5,
        opacity: 0.9,
      });
      ambLine.bindPopup('<strong class="text-emerald-500">Ambulance MEDIC-101 Route</strong><br/><span class="text-xs">Priority Corridor Alpha</span>');
      ambLine.addTo(routeLayerRef.current);

      // 2. Fire Engine Route (Orange)
      const firePath: L.LatLngExpression[] = [
        [12.9720, 77.6150],
        [12.9728, 77.6111],
        [12.9738, 77.6074],
        [12.9745, 77.6095],
      ];
      const fireLine = L.polyline(firePath, {
        color: '#f97316',
        weight: 5,
        opacity: 0.9,
      });
      fireLine.bindPopup('<strong class="text-orange-500">Fire Engine BRONTO-01 Route</strong><br/><span class="text-xs">Corridor Hold - Phase Shift</span>');
      fireLine.addTo(routeLayerRef.current);

      // 3. Police Route (Blue)
      const polPath: L.LatLngExpression[] = [
        [12.9650, 77.6074],
        [12.9700, 77.6074],
        [12.9738, 77.6074],
      ];
      const polLine = L.polyline(polPath, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.9,
      });
      polLine.bindPopup('<strong class="text-blue-500">Police Escort ESCORT-303 Route</strong><br/><span class="text-xs">Staggered Clearance Entry</span>');
      polLine.addTo(routeLayerRef.current);
    } else {
      const activeRoute = routes.find((r) => r.id === activeRouteId);
      if (activeRoute && activeRoute.waypoints.length > 1) {
        const latlngs: L.LatLngExpression[] = activeRoute.waypoints.map((w) => [w.lat, w.lng]);
        
        // Outer glow for green corridor
        const glowLine = L.polyline(latlngs, {
          color: '#10b981',
          weight: 8,
          opacity: 0.35,
          lineCap: 'round',
        });
        glowLine.addTo(routeLayerRef.current);

        // Inner crisp corridor line
        const mainLine = L.polyline(latlngs, {
          color: '#059669',
          weight: 4,
          opacity: 0.9,
          dashArray: '8, 8',
        });
        mainLine.bindPopup(`
          <div class="text-xs">
            <strong class="text-emerald-400 font-bold block mb-1">Simulated Green Corridor</strong>
            <p class="text-slate-200">${activeRoute.name}</p>
            <div class="mt-1 flex gap-2 text-slate-400 font-mono">
              <span>Distance: ${activeRoute.distanceKm} km</span>
              <span>·</span>
              <span>ETA: ${activeRoute.estimatedMinutes}m</span>
            </div>
          </div>
        `);
        mainLine.addTo(routeLayerRef.current);
      }
    }

    // 2. Render Traffic Congestion zones if enabled
    if (showCongestionOverlay) {
      // Domlur Flyover bottleneck
      const domlurCongestion = L.circle([12.9610, 77.6387], {
        radius: 350,
        color: '#ea580c',
        fillColor: '#ea580c',
        fillOpacity: 0.22,
        weight: 1.5,
      });
      domlurCongestion.bindPopup(`
        <div class="text-xs">
          <strong class="text-orange-400 font-bold block mb-1">Traffic Congestion Bottleneck</strong>
          <p class="text-slate-200">Domlur Underpass / Inner Ring Road</p>
          <p class="text-slate-400 text-xs mt-1">Average queue: 195 meters. Green corridor hold advisory active.</p>
        </div>
      `);
      domlurCongestion.addTo(routeLayerRef.current);

      // Brigade road obstruction
      const brigadeCongestion = L.circle([12.9738, 77.6074], {
        radius: 240,
        color: '#dc2626',
        fillColor: '#dc2626',
        fillOpacity: 0.25,
        weight: 1.5,
      });
      brigadeCongestion.bindPopup(`
        <div class="text-xs">
          <strong class="text-red-400 font-bold block mb-1">Intersection Convergence Zone</strong>
          <p class="text-slate-200">MG Road & Brigade Road Junction</p>
          <p class="text-slate-400 text-xs mt-1">Simultaneous multi-emergency convergence point.</p>
        </div>
      `);
      brigadeCongestion.addTo(routeLayerRef.current);
    }

    // 3. Render Hospitals
    if (showHospitals) {
      hospitals.forEach((hosp) => {
        const hospitalIcon = L.divIcon({
          className: 'custom-hosp-marker',
          html: `
            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-xs shadow-md border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              H
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const hospMarker = L.marker([hosp.location.lat, hosp.location.lng], { icon: hospitalIcon });
        hospMarker.bindPopup(`
          <div class="text-xs min-w-[200px]">
            <span class="inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-teal-900/50 text-teal-300 rounded border border-teal-700/50 mb-1">
              Designated Receiving Hospital
            </span>
            <h4 class="font-bold text-slate-100 text-sm mb-1">${hosp.name}</h4>
            <p class="text-slate-300 text-xs mb-2">${hosp.address}</p>
            <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-800 p-2 rounded border border-slate-700">
              <div>
                <span class="text-slate-400 block">Trauma Bays</span>
                <span class="font-bold text-emerald-400 text-sm font-mono">${hosp.availableTraumaBeds} Available</span>
              </div>
              <div>
                <span class="text-slate-400 block">ICU Beds</span>
                <span class="font-bold text-blue-400 text-sm font-mono">${hosp.availableIcuBeds} Available</span>
              </div>
            </div>
            <div class="mt-2 text-slate-400">
              <span>Incoming units: </span>
              <strong class="text-slate-200">${hosp.incomingAmbulances.length} en-route</strong>
            </div>
          </div>
        `);
        hospMarker.addTo(markersLayerRef.current!);
      });
    }

    // 4. Render Intersections
    if (showIntersections) {
      intersections.forEach((inter) => {
        let signalColor = '#22c55e'; // Green
        let pulseClass = '';
        if (inter.currentSignal === 'RED' || inter.currentSignal === 'ALL_RED_HOLD') {
          signalColor = '#ef4444';
        } else if (inter.currentSignal === 'AMBER') {
          signalColor = '#f59e0b';
        } else if (inter.currentSignal === 'PRIORITY_GREEN') {
          signalColor = '#10b981';
          pulseClass = 'beacon-active';
        }

        const intersectionIcon = L.divIcon({
          className: 'custom-intersection-marker',
          html: `
            <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 shadow-md ${pulseClass}" style="border-color: ${signalColor};">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${signalColor};"></span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const interMarker = L.marker([inter.location.lat, inter.location.lng], { icon: intersectionIcon });
        interMarker.on('click', () => {
          setSelectedIntersectionId(inter.id);
        });
        interMarker.bindPopup(`
          <div class="text-xs min-w-[210px]">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[10px] font-mono text-slate-400">${inter.id.toUpperCase()}</span>
              <span class="px-1.5 py-0.5 text-[10px] font-bold rounded ${
                inter.currentSignal === 'PRIORITY_GREEN'
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600'
                  : inter.currentSignal === 'RED'
                  ? 'bg-red-900/60 text-red-300 border border-red-600'
                  : 'bg-green-900/60 text-green-300 border border-green-600'
              }">
                ${inter.currentSignal.replace('_', ' ')}
              </span>
            </div>
            <h4 class="font-bold text-slate-100 text-sm mb-1">${inter.name}</h4>
            <p class="text-slate-300 text-xs mb-2">Cross: ${inter.crossStreetName}</p>
            <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-800 p-2 rounded border border-slate-700 font-mono">
              <div>
                <span class="text-slate-400 block">Queue Length</span>
                <span class="font-bold text-orange-400">${inter.queueLengthMeters}m</span>
              </div>
              <div>
                <span class="text-slate-400 block">Civilian Queue</span>
                <span class="font-bold text-slate-200">${inter.queueVehicles} vehicles</span>
              </div>
            </div>
            <p class="text-[10px] text-slate-400 mt-2">Transition status: <span class="text-slate-300 uppercase">${inter.signalTransitionStatus}</span></p>
          </div>
        `);
        interMarker.addTo(markersLayerRef.current!);
      });
    }

    // 5. Render Filtered Emergency Vehicles
    const filteredVehicles = vehicles.filter((v) => {
      if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesCallSign = v.callSign.toLowerCase().includes(query);
        const matchesReg = v.registrationNumber.toLowerCase().includes(query);
        const matchesService = v.assignedService.toLowerCase().includes(query);
        if (!matchesCallSign && !matchesReg && !matchesService) return false;
      }
      return true;
    });

    filteredVehicles.forEach((veh) => {
      const color = CATEGORY_COLORS[veh.category] || CATEGORY_COLORS.other;
      const isEnRoute = veh.status === 'en_route' || veh.status === 'transporting';
      const isStale = networkStatus === 'offline' || veh.gpsStatus === 'stale';

      // Visual indicator for vehicle type
      let typeInitial = 'AMB';
      if (veh.category === 'fire_engine') typeInitial = 'FIR';
      else if (veh.category === 'police') typeInitial = 'POL';
      else if (veh.category === 'disaster_rescue') typeInitial = 'RES';
      else if (veh.category === 'blood_transport') typeInitial = 'BLD';
      else if (veh.category === 'other') typeInitial = 'EMV';

      const pulseEffect = isEnRoute ? 'beacon-active' : '';
      const borderStyle = isStale ? 'border-dashed border-amber-400' : 'border-solid border-white';

      const vehicleIcon = L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
          <div class="relative flex flex-col items-center cursor-pointer group">
            <div class="flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 ${borderStyle} ${pulseEffect} text-white font-bold text-[10px] tracking-wider transition-transform group-hover:scale-125" style="background-color: ${color.bg};">
              ${typeInitial}
            </div>
            <div class="absolute -bottom-4 bg-slate-900/90 text-slate-200 text-[9px] font-mono px-1.5 py-0.2 rounded border border-slate-700 whitespace-nowrap shadow-sm pointer-events-none">
              ${veh.callSign.split(' ')[0]}
            </div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 20],
      });

      const vehMarker = L.marker([veh.currentLocation.lat, veh.currentLocation.lng], {
        icon: vehicleIcon,
      });

      vehMarker.on('click', () => {
        setSelectedVehicleId(veh.id);
      });

      vehMarker.bindPopup(`
        <div class="text-xs min-w-[230px]">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase">${veh.category.replace('_', ' ')}</span>
            <span class="px-1.5 py-0.5 text-[10px] font-bold rounded ${
              veh.status === 'en_route'
                ? 'bg-red-900/60 text-red-300 border border-red-600'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }">
              ${veh.status.toUpperCase()}
            </span>
          </div>

          <h4 class="font-bold text-slate-100 text-sm mb-0.5">${veh.callSign}</h4>
          <p class="text-slate-400 text-[11px] font-mono mb-2">${veh.registrationNumber} · ${veh.assignedService}</p>

          ${
            isStale
              ? `<div class="bg-amber-950/70 border border-amber-600/60 text-amber-300 p-1.5 rounded mb-2 text-[11px] flex items-center gap-1.5 font-mono">
                   <span>⚠️ GPS Stale: Last verified ${gpsStaleSeconds}s ago</span>
                 </div>`
              : ''
          }

          <div class="grid grid-cols-2 gap-2 text-[11px] bg-slate-800 p-2 rounded border border-slate-700 font-mono mb-2">
            <div>
              <span class="text-slate-400 block">Current Speed</span>
              <span class="font-bold text-slate-100">${veh.currentSpeedKmh} km/h</span>
            </div>
            <div>
              <span class="text-slate-400 block">Battery / Fuel</span>
              <span class="font-bold text-slate-100">${veh.batteryOrFuelPercent}%</span>
            </div>
          </div>

          <div class="text-slate-300 text-[11px] mb-2 space-y-0.5">
            <div><span class="text-slate-400">Driver:</span> ${veh.driverName} (${veh.driverPhone})</div>
            <div><span class="text-slate-400">Location:</span> ${veh.locationName}</div>
            ${veh.destinationName ? `<div><span class="text-slate-400">Destination:</span> <strong class="text-emerald-400">${veh.destinationName}</strong></div>` : ''}
          </div>

          <div class="pt-2 border-t border-slate-700 flex justify-between items-center text-[10px] text-slate-400">
            <span>Verified Transponder: ${veh.verificationStatus}</span>
            <span class="font-mono">${veh.lastUpdated}</span>
          </div>
        </div>
      `);

      vehMarker.addTo(markersLayerRef.current!);
    });
  }, [
    vehicles,
    intersections,
    hospitals,
    routes,
    activeRouteId,
    networkStatus,
    gpsStaleSeconds,
    showCongestionOverlay,
    showIntersections,
    showHospitals,
    categoryFilter,
    severityFilter,
    searchQuery,
    setSelectedVehicleId,
    setSelectedIntersectionId,
  ]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full rounded-lg overflow-hidden border border-slate-800" />
      
      {/* Network Offline / Stale GPS Floating Banner */}
      {networkStatus !== 'normal' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-amber-950/90 text-amber-200 border border-amber-600/80 px-4 py-1.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-mono backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>
            {networkStatus === 'offline'
              ? `GPS DATA STALE (${gpsStaleSeconds}s): Preserving last verified transponder coordinates`
              : 'WEAK CELLULAR SIGNAL: Retrying telemetric packet synchronization...'}
          </span>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-md p-2.5 shadow-xl text-[11px] text-slate-300 hidden md:block">
        <div className="font-semibold text-slate-200 mb-1.5 text-xs">Simulated Road Legend</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span>Ambulance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
            <span>Fire Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Police Interceptor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Green Wave Signal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-teal-600 inline-block text-[9px] text-white text-center font-bold">H</span>
            <span>Hospital Trauma</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
            <span>Disaster / Blood</span>
          </div>
        </div>
      </div>
    </div>
  );
};
