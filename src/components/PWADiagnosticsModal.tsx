import React from 'react';
import { X, Wrench, ShieldCheck } from 'lucide-react';
import { PWADiagnosticsCard } from './PWADiagnosticsCard';

interface PWADiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWADiagnosticsModal: React.FC<PWADiagnosticsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="pwa-diagnostics-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="pwa-diagnostics-modal-card"
        className="relative my-auto w-full max-w-4xl max-h-[92dvh] rounded-3xl border border-slate-700 bg-slate-900 p-4 sm:p-6 text-slate-100 shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  PWA Health &amp; Standalone Diagnostics
                </h3>
                <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                  ADMIN TOOL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live verification of matchMedia standalone, navigator properties, service worker &amp; manifest
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            aria-label="Close Diagnostics"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Diagnostics Body */}
        <PWADiagnosticsCard onClose={onClose} showInModal={true} />
      </div>
    </div>
  );
};
