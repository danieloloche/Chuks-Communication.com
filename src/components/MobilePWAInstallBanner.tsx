import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobilePWAInstallBannerProps {
  onOpenModal: () => void;
}

export const MobilePWAInstallBanner: React.FC<MobilePWAInstallBannerProps> = ({ onOpenModal }) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, openInFullTab, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const wasDismissed = sessionStorage.getItem('chuks_pwa_banner_dismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  // Hide if already running in standalone app mode or dismissed
  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem('chuks_pwa_banner_dismissed', 'true');
  };

  const handleInstallNow = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setDismissed(true);
        return;
      }
    }
    onOpenModal();
  };

  return (
    <div
      id="mobile-pwa-install-banner"
      className="fixed bottom-16 inset-x-0 z-40 p-2.5 sm:hidden animate-in slide-in-from-bottom duration-300 pointer-events-none"
    >
      <div className="mx-auto max-w-md pointer-events-auto rounded-2xl border border-stone-800 bg-stone-900/95 p-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          {/* Icon & Details */}
          <div
            className="flex items-center gap-2.5 min-w-0 cursor-pointer"
            onClick={onOpenModal}
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-950 border border-orange-500/40 p-1 shadow-md">
              <img src="/icon.svg" alt="Chuks Store" className="h-full w-full object-contain" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white tracking-tight truncate flex items-center gap-1">
                Install Chuks Store
                <span className="text-[9px] font-bold text-amber-300 bg-orange-500/20 px-1 py-0.5 rounded border border-orange-500/30">
                  App
                </span>
              </h4>
              <p className="text-[10px] text-stone-300 truncate">
                {isInIframe
                  ? 'Tap for phone home screen install'
                  : isIOS
                  ? 'Add to Home Screen for fast launch'
                  : 'Fast 1-tap install on your phone'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="banner-install-btn"
              onClick={handleInstallNow}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2 text-xs font-bold text-stone-950 shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install</span>
            </button>
            <button
              id="banner-dismiss-btn"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
