import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  AlertOctagon,
  FileText,
  Key,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';

export const SecurityVerificationView: React.FC = () => {
  const { auditLogs, vehicles, currentUser } = useEmergenx();

  // Simulated suspicious request
  const suspiciousRequest = {
    id: 'req_unauth_809',
    vehicleId: 'veh_unknown_priv',
    callSign: 'UNVERIFIED-VAN-88',
    regNumber: 'KA-51-Z-9999',
    timestamp: '10:02 AM',
    claimedType: 'VIP Corridor Request',
    flagReason: 'Missing verified cryptographic transponder key; unauthorized siren beacon pattern.',
    status: 'BLOCKED_PENDING_REVIEW',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EBFBF7] flex items-center justify-center text-[#28A66A]">
              <ShieldCheck className="w-4 h-4 text-[#28A66A]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              Emergency Verification & Security Governance
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30 font-bold uppercase">
              Zero-Trust Corridor Defense
            </span>
          </div>
          <p className="text-xs text-[#858F99] max-w-2xl">
            Enforces strict transponder cryptographic attestation, operator identity verification, and prevents spoofed or unverified vehicles from commanding urban signal preemption.
          </p>
        </div>

        <div className="text-xs font-mono text-[#858F99] bg-[#F5F7F9] p-2.5 rounded-lg border border-[#E6EAEE]">
          <span>Active Supervisor: </span>
          <strong className="text-[#292D32]">{currentUser.name}</strong>
        </div>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#292D32]">
            <span>Verified Transponders</span>
            <CheckCircle2 className="w-4 h-4 text-[#28A66A]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#28A66A]">16 / 16</div>
          <p className="text-[11px] text-[#858F99]">
            All fleet transponders verified with Department Public Key Infrastructure (PKI).
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#292D32]">
            <span>Suspicious Requests</span>
            <AlertOctagon className="w-4 h-4 text-[#FE595B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FE595B]">1 Flagged</div>
          <p className="text-[11px] text-[#858F99]">
            Signal preemption automatically inhibited pending manual supervisor audit.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#292D32]">
            <span>Role-Based Access Control</span>
            <Lock className="w-4 h-4 text-[#16A4E8]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#0A699F]">Strict RBAC</div>
          <p className="text-[11px] text-[#858F99]">
            Signal priority commands restricted strictly to Traffic Police Control credentials.
          </p>
        </div>
      </div>

      {/* Flagged Suspicious Vehicle Banner */}
      <div className="p-4 rounded-xl bg-[#FEECEC] border border-[#FE595B]/40 text-[#292D32] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs text-[#FE595B]">
            <AlertOctagon className="w-4 h-4" />
            <span>UNVERIFIED PRIORITY REQUEST INHIBITED</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#FE595B] border border-[#FE595B]/30 font-bold">
            {suspiciousRequest.status}
          </span>
        </div>
        <p className="text-xs text-[#292D32]">
          Vehicle <strong>{suspiciousRequest.callSign}</strong> ({suspiciousRequest.regNumber}): {suspiciousRequest.flagReason}
        </p>
      </div>

      {/* Immutable Audit Trail Log */}
      <div className="p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-[#292D32]">Supervisory Actions & Audit Trail</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E6EAEE] text-[#858F99] font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EAEE]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F5F7F9] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[#858F99] text-[11px]">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#292D32]">{log.userName}</td>
                  <td className="py-2.5 px-3 uppercase font-mono text-[10px] text-[#0A699F]">{log.userRole}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#292D32]">{log.action}</td>
                  <td className="py-2.5 px-3 text-[#858F99] max-w-sm truncate">{log.details}</td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-[#858F99]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
