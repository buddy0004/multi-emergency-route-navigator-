import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Radio,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldAlert,
  Server,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';

export const NetworkResilienceView: React.FC = () => {
  const { networkStatus, setNetworkStatus, gpsStaleSeconds, vehicles, addNotification } = useEmergenx();
  const [queuedPackets, setQueuedPackets] = useState<number>(networkStatus === 'offline' ? 14 : 0);

  const handleSimulateStatus = (status: 'normal' | 'weak' | 'offline') => {
    setNetworkStatus(status);
    if (status === 'offline') {
      setQueuedPackets(18);
      addNotification({
        type: 'network',
        severity: 'critical',
        title: 'Cellular Network Interruption',
        message: 'Primary transponder uplink dropped. Displaying last verified telemetry with stale timer.',
      });
    } else if (status === 'weak') {
      setQueuedPackets(6);
      addNotification({
        type: 'network',
        severity: 'warning',
        title: 'Weak Cellular Telemetry',
        message: 'Packet latency exceeding 1200ms. Compression protocol engaged.',
      });
    } else {
      setQueuedPackets(0);
      addNotification({
        type: 'network',
        severity: 'success',
        title: 'Network Telemetry Restored',
        message: 'All queued transponder packets successfully synchronized with Command Center.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] flex items-center justify-center text-[#16A4E8]">
              <Wifi className="w-4 h-4 text-[#16A4E8]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              Network Resilience & GPS Continuity
            </h1>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                networkStatus === 'normal'
                  ? 'bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30'
                  : networkStatus === 'weak'
                  ? 'bg-[#FEF8EB] text-[#F5B942] border border-[#F5B942]/30'
                  : 'bg-[#FEECEC] text-[#FE595B] border border-[#FE595B]/30'
              }`}
            >
              Status: {networkStatus}
            </span>
          </div>
          <p className="text-xs text-[#858F99] max-w-2xl">
            Simulates cellular telemetry interruptions, packet retransmission buffers, and stale GPS safeguards to prevent misleading coordinate display during outages.
          </p>
        </div>

        {/* Simulation Control Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulateStatus('normal')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs ${
              networkStatus === 'normal'
                ? 'bg-[#28A66A] text-white'
                : 'bg-[#F5F7F9] text-[#292D32] hover:bg-[#E6EAEE] border border-[#E6EAEE]'
            }`}
          >
            Normal (Live)
          </button>
          <button
            onClick={() => handleSimulateStatus('weak')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs ${
              networkStatus === 'weak'
                ? 'bg-[#F5B942] text-white'
                : 'bg-[#F5F7F9] text-[#292D32] hover:bg-[#E6EAEE] border border-[#E6EAEE]'
            }`}
          >
            Weak (High Latency)
          </button>
          <button
            onClick={() => handleSimulateStatus('offline')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs ${
              networkStatus === 'offline'
                ? 'bg-[#FE595B] text-white'
                : 'bg-[#F5F7F9] text-[#292D32] hover:bg-[#E6EAEE] border border-[#E6EAEE]'
            }`}
          >
            Offline (Blackout)
          </button>
        </div>
      </div>

      {/* Real-time Safeguard Alerts */}
      {networkStatus === 'offline' && (
        <div className="p-4 rounded-xl bg-[#FEECEC] border border-[#FE595B]/40 text-[#292D32] text-xs space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#FE595B]">
            <AlertTriangle className="w-4 h-4" />
            <span>CRITICAL FAILSAFE ACTIVE: Stale Telemetry Caching Engaged</span>
          </div>
          <p className="text-xs">
            Coordinates displayed represent last verified transponder packet ({gpsStaleSeconds}s ago). Inbound signal preemption holds previous approved clearance phases until telemetry reconnects.
          </p>
        </div>
      )}

      {/* Grid of Network Resilience Architecture Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#292D32]">Local Packet Buffer</span>
            <Server className="w-4 h-4 text-[#16A4E8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0A699F]">{queuedPackets} Packets</div>
          <p className="text-[11px] text-[#858F99]">
            In-vehicle transponder queue. Flushed automatically upon cellular link reacquisition.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#292D32]">GPS Staleness Counter</span>
            <Clock className="w-4 h-4 text-[#F5B942]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#292D32]">{gpsStaleSeconds} Seconds</div>
          <p className="text-[11px] text-[#858F99]">
            Flagged as STALE when exceeding 15 seconds. Prevents phantom ghost tracking.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#292D32]">Cryptographic Verification</span>
            <ShieldAlert className="w-4 h-4 text-[#28A66A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#28A66A]">HMAC-SHA256</div>
          <p className="text-[11px] text-[#858F99]">
            Every telemetric ping signed by vehicle onboard hardware crypto enclave.
          </p>
        </div>
      </div>
    </div>
  );
};
