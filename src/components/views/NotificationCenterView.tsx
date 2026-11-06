import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Flame,
  Hospital,
  Wifi,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';
import { NotificationItem } from '../../types';

export const NotificationCenterView: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useEmergenx();
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = notifications.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] flex items-center justify-center text-[#16A4E8]">
              <Bell className="w-4 h-4 text-[#16A4E8]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              Central Notification & Alert Hub
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEECEC] text-[#FE595B] border border-[#FE595B]/30 font-bold uppercase">
              {notifications.filter((n) => !n.read).length} Unread
            </span>
          </div>
          <p className="text-xs text-[#858F99]">
            Real-time feed of emergency activations, route recommendations, congestion bottlenecks, and hospital triage acknowledgments.
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#F5F7F9] hover:bg-[#E6EAEE] text-[#292D32] border border-[#E6EAEE] transition-colors cursor-pointer shadow-2xs"
        >
          <CheckCheck className="w-4 h-4 text-[#28A66A]" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-3 bg-white rounded-xl border border-[#E6EAEE] shadow-2xs text-xs">
        {(
          [
            { id: 'all', label: 'All Alerts' },
            { id: 'activation', label: 'Activations' },
            { id: 'priority', label: 'Signal Preemptions' },
            { id: 'congestion', label: 'Congestion' },
            { id: 'hospital', label: 'Hospital Triage' },
            { id: 'network', label: 'Network & GPS' },
            { id: 'completion', label: 'Completions' },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterType === f.id
                ? 'bg-[#32B8BF] text-white font-semibold shadow-2xs'
                : 'bg-[#F5F7F9] text-[#858F99] hover:text-[#292D32] border border-[#E6EAEE]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#858F99] text-xs bg-white rounded-xl border border-[#E6EAEE]">
            No notifications in this category.
          </div>
        ) : (
          filtered.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => markNotificationAsRead(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  item.read
                    ? 'bg-white border-[#E6EAEE] opacity-75'
                    : 'bg-white border-[#91C4FC] shadow-2xs ring-1 ring-[#91C4FC]/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                      item.severity === 'critical'
                        ? 'bg-[#FEECEC] text-[#FE595B]'
                        : item.severity === 'warning'
                        ? 'bg-[#FEF8EB] text-[#F5B942]'
                        : item.severity === 'success'
                        ? 'bg-[#EBFBF7] text-[#28A66A]'
                        : 'bg-[#EBF5FB] text-[#16A4E8]'
                    }`}
                  >
                    {item.type === 'activation' ? (
                      <Flame className="w-4 h-4" />
                    ) : item.type === 'hospital' ? (
                      <Hospital className="w-4 h-4" />
                    ) : item.type === 'network' ? (
                      <Wifi className="w-4 h-4" />
                    ) : item.severity === 'critical' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-[#292D32]">{item.title}</h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#16A4E8]" />
                      )}
                    </div>
                    <p className="text-xs text-[#858F99] leading-relaxed">{item.message}</p>
                    <span className="text-[10px] font-mono text-[#858F99] block mt-1">
                      {item.timestamp}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F7F9] text-[#858F99] uppercase">
                  {item.type}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
