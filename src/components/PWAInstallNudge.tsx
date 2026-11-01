import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, ExternalLink, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallNudgeProps {
  onOpenModal: () => void;
}

export const PWAInstallNudge: React.FC<PWAInstallNudgeProps> = ({ onOpenModal }) => {
  const {
    isInstallable,
    isInstalled,
    isInIframe,
    visitCount,
    isNudgeDismissed,
    dismissNudge,
    install,
    openInFullTab,
  } = usePWAInstall();

  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Only show nudge if:
    // 1. User has visited the site at least twice (visitCount >= 2)
    // 2. App is not already installed / running in standalone mode
    // 3. User has not dismissed or snoozed the nudge
    if (visitCount >= 2 && !isInstalled && !isNudgeDismissed) {
      // Gentle delay after page mount to feel smooth and non-intrusive
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2600);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [visitCount, isInstalled, isNudgeDismissed]);

  if (!isVisible || isInstalled || isNudgeDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInIframe) {
      onOpenModal();
      return;
    }

    if (isInstallable) {
      setIsInstalling(true);
      const success = await install();
      setIsInstalling(false);
      if (success) {
        setInstalledSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 2200);
      }
    } else {
      onOpenModal();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    dismissNudge(48); // Snooze for 48 hours
  };

  return (
    <aside
      id="pwa-automated-install-nudge"
      aria-label="Add to Home Screen Suggestion"
      className="fixed z-40 bottom-16 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm pointer-events-none transition-all duration-500 ease-out"
    >
      <div className="pointer-events-auto relative overflow-hidden rounded-2xl border border-stone-800 bg-stone-900/95 p-4 text-stone-100 shadow-2xl backdrop-blur-xl">
        {/* Ambient Top Glow Line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-amber-600" />

        {/* Close Button */}
        <button
          id="pwa-nudge-dismiss-btn"
          onClick={handleDismiss}
          className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition"
          aria-label="Dismiss install suggestion"
        >
          <X className="h-4 w-4" />
        </button>

        {installedSuccess ? (
          <div className="flex items-center gap-3 py-1">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0 animate-bounce" />
            <div>
              <p className="text-sm font-bold text-white">Chuks Store Added!</p>
              <p className="text-xs text-stone-300">You can now launch it directly from your home screen.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header with Brand Badge */}
            <div className="flex items-center gap-3 pr-6">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-950 border border-orange-500/40 p-1 shadow-md">
                <img
                  src="/icon.svg"
                  alt="Chuks Store"
                  className="h-full w-full object-contain"
                />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-orange-500/20 border border-orange-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                    Welcome Back #{visitCount}
                  </span>
                </div>
                <h4 className="text-sm font-bold tracking-tight text-white mt-0.5 truncate">
                  Install Chuks Store App
                </h4>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-300 leading-relaxed">
              Install the app for 1-tap parts lookup, screen testing policy, and fast offline browsing.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                id="pwa-nudge-confirm-btn"
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3.5 py-2.5 text-xs font-bold text-stone-950 shadow-md shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isInIframe ? (
                  <>
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Install App</span>
                  </>
                ) : (
                  <>
                    <Download className="h-3.5 w-3.5" />
                    <span>{isInstalling ? 'Installing...' : 'Add to Home Screen'}</span>
                  </>
                )}
              </button>

              <button
                id="pwa-nudge-later-btn"
                onClick={handleDismiss}
                className="rounded-xl border border-stone-800 bg-stone-800/80 px-3 py-2.5 text-xs font-medium text-stone-300 hover:bg-stone-700 hover:text-white transition"
              >
                Maybe later
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
