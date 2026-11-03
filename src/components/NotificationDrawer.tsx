import React from 'react';
import { X, Bell, Sparkles, AlertTriangle } from 'lucide-react';
import { BroadcastNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: BroadcastNotification[];
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  return (
    <div id="notifications-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm">
      <div
        id="notifications-drawer-panel"
        className="relative flex h-full w-full max-w-md flex-col bg-stone-900 text-stone-100 shadow-2xl border-l border-stone-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-400" />
            <h2 className="text-base font-bold text-white">Store Notifications & Alerts</h2>
            <span className="rounded-full bg-orange-950/60 border border-orange-500/30 px-2 py-0.5 text-xs font-semibold text-amber-300">
              {notifications.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {notifications.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-stone-400">
              <Bell className="h-12 w-12 text-stone-700 mb-2" />
              <p className="text-sm font-medium text-stone-300">No new notifications</p>
              <p className="text-xs text-stone-400 mt-1">You will receive live alerts when new goods arrive!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-stone-800 bg-stone-950/80 p-4 space-y-2 text-xs transition hover:border-stone-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {n.type === 'new_arrival' ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
                        <Sparkles className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <h4 className="font-bold text-white text-xs">{n.title}</h4>
                  </div>
                  <span className="text-[10px] text-stone-400 shrink-0">{n.timestamp}</span>
                </div>

                <p className="text-stone-300 leading-relaxed text-[11px]">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
