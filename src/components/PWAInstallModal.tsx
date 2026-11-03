import React, { useState, useEffect } from 'react';
import {
  Download,
  Laptop,
  CheckCircle2,
  Share,
  PlusSquare,
  X,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  QrCode,
  Smartphone,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MoreVertical,
  Flame,
  ArrowRight,
  Wrench,
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDiagnostics?: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose, onOpenDiagnostics }) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    directAppUrl,
    downloadAppLauncher,
    launchDedicatedTab,
    triggerInstall,
    install,
  } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>(
    isIOS ? 'ios' : isAndroid ? 'android' : 'android'
  );
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(true);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [installStatusMessage, setInstallStatusMessage] = useState<string | null>(null);

  // Generate QR Code for Mobile Phone Installation
  useEffect(() => {
    if (!isOpen) return;

    setQrLoading(true);
    const targetUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?action=install&autoinstall=1`
      : 'https://chuksstore.ng/';

    QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8,
      color: {
        dark: '#ea580c', // Warm vibrant brand orange
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrCodeDataUrl(url);
        setQrLoading(false);
      })
      .catch((err) => {
        console.error('Failed to generate PWA install QR code:', err);
        setQrLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerInstall = async () => {
    setInstallStatusMessage('Triggering installation dialog...');

    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setInstallStatusMessage('App installed! Added to home screen.');
        setTimeout(() => onClose(), 2500);
        return;
      } else {
        setInstallStatusMessage('Install prompt was dismissed.');
      }
    }

    const res = await triggerInstall();
    if (res.outcome === 'accepted') {
      setInstallSuccess(true);
      setInstallStatusMessage('App successfully installed!');
      setTimeout(() => onClose(), 2500);
    } else if (res.outcome === 'launched_tab') {
      setInstallStatusMessage('Opened in standalone tab for direct installation.');
    } else if (res.outcome === 'ios_manual') {
      setActiveTab('ios');
      setInstallStatusMessage('Tap the Share button in Safari, then Add to Home Screen.');
    } else {
      setInstallStatusMessage('Use your browser menu or address bar install icon.');
    }
  };

  const handleCopyInstallLink = async () => {
    const installUrl = `${directAppUrl}?action=install&autoinstall=1`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(installUrl);
      } else {
        const input = document.createElement('input');
        input.value = installUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div
      id="pwa-install-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="pwa-install-modal-card"
        className="relative w-full max-w-lg max-h-[92dvh] rounded-3xl border border-stone-800 bg-stone-900 p-4 sm:p-6 text-stone-100 shadow-2xl transition-all my-auto overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="pwa-modal-close-btn"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 rounded-xl p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Brand Logo */}
        <div className="flex items-center gap-3.5 border-b border-stone-800 pb-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 border border-orange-500/40 p-1.5 shadow-md shrink-0">
            <img src="/icon.svg" alt="Chuks Communication Logo" className="h-full w-full object-contain" />
            <span
              className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white border-2 border-stone-900"
              title="Verified Store App"
            >
              ✓
            </span>
          </div>
          <div className="min-w-0 pr-6">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
                Install Chuks Communication App
              </h2>
              <span className="rounded-full bg-orange-500/15 border border-orange-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-400 shrink-0">
                1-Tap Install
              </span>
            </div>
            <p className="text-xs text-stone-400 truncate mt-0.5">
              Park Road, Gwagwalada, Abuja • Screens, Calibrators & Down Boards
            </p>
          </div>
        </div>

        {installSuccess ? (
          <div className="my-8 flex flex-col items-center justify-center text-center p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <p className="mt-4 text-xl font-bold text-white">App Installed Successfully!</p>
            <p className="text-xs sm:text-sm text-stone-300 mt-1.5 max-w-sm">
              Chuks Store is now added to your device. Open anytime for parts prices, testing warranty, and quick technician orders.
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-orange-500 transition"
            >
              Continue to Store
            </button>
          </div>
        ) : (
          <div className="pt-4 space-y-4">
            {/* HERO INSTALL TRIGGER SECTION */}
            <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Flame className="h-4 w-4 text-orange-400" />
                  Quick Installation
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                  {isInstalled ? 'Installed' : isInstallable ? 'Ready' : 'PWA Ready'}
                </span>
              </div>

              {/* Notice when viewed inside iframe or embedded preview */}
              {isInIframe && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                    How to install on phone or computer:
                  </p>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    Browsers (Chrome &amp; Safari) do not allow apps to be installed from inside preview windows. Tap <strong className="text-white">Open in Browser to Install</strong> below or scan the QR code with your phone.
                  </p>
                </div>
              )}

              {/* Primary Trigger / Open Action */}
              {isInIframe ? (
                <a
                  id="pwa-primary-open-link"
                  href={`${directAppUrl}?action=install&autoinstall=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3.5 text-sm sm:text-base font-bold text-stone-950 shadow-lg shadow-orange-500/20 transition hover:brightness-110 active:scale-[0.98] text-center"
                >
                  <ExternalLink className="h-5 w-5 shrink-0" />
                  <span>Open in Browser to Install</span>
                </a>
              ) : (
                <button
                  id="pwa-primary-trigger-btn"
                  onClick={handleTriggerInstall}
                  className="group relative flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3.5 text-sm sm:text-base font-bold text-stone-950 shadow-lg shadow-orange-500/20 transition hover:brightness-110 active:scale-[0.98]"
                >
                  <Download className="h-5 w-5 shrink-0" />
                  <span>
                    {isInstalled
                      ? 'App Already Installed'
                      : isInstallable
                      ? 'Install App Now (1-Tap)'
                      : isIOS
                      ? 'View iPhone Instructions'
                      : 'Install Store App'}
                  </span>
                </button>
              )}

              {/* Status Message */}
              {installStatusMessage && (
                <p className="text-[11px] text-center font-medium text-amber-300 bg-stone-900 rounded-lg py-1.5 px-2 border border-stone-800">
                  {installStatusMessage}
                </p>
              )}

              {/* Secondary Actions Row */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <a
                  href={`${directAppUrl}?action=install&autoinstall=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-800 hover:text-white transition"
                  title="Open app in a full browser tab"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-orange-400" />
                  <span>Open Full Tab</span>
                </a>

                <button
                  onClick={handleCopyInstallLink}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-800 hover:text-white transition"
                  title="Copy direct installation link to clipboard"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-orange-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instant Offline Shortcut Launcher Fallback */}
              <div className="pt-1 border-t border-stone-800/80">
                <button
                  onClick={downloadAppLauncher}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-stone-800/80 bg-stone-900/60 hover:bg-stone-800/80 py-2 text-xs font-medium text-stone-300 hover:text-white transition"
                  title="Download instant offline HTML shortcut file to your device"
                >
                  <Download className="h-3.5 w-3.5 text-amber-400" />
                  <span>Download 1-Tap Home Screen Launcher File</span>
                </button>
              </div>
            </div>

            {/* SCAN QR CODE WITH PHONE CAMERA SECTION */}
            <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                    <QrCode className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      Scan QR Code to Install on Phone
                    </h4>
                    <p className="text-[10px] text-stone-400">
                      Scan with camera on Android or iPhone to install
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Presentation Box */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-stone-900 rounded-xl p-3.5 border border-stone-800">
                <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-md">
                  {qrLoading ? (
                    <div className="animate-pulse text-xs font-mono text-stone-500">Generating...</div>
                  ) : qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Chuks Store PWA Install QR Code"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <QrCode className="h-12 w-12 text-stone-400" />
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-stone-300 text-center sm:text-left">
                  <p className="font-bold text-white flex items-center justify-center sm:justify-start gap-1">
                    <Smartphone className="h-3.5 w-3.5 text-orange-400" />
                    How to install:
                  </p>
                  <ol className="text-[11px] text-stone-400 space-y-1 list-decimal list-inside leading-relaxed">
                    <li>Open your phone <strong>Camera</strong>.</li>
                    <li>Point at the QR code.</li>
                    <li>Tap the popup banner to add Chuks Store to your home screen!</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* PLATFORM-SPECIFIC TABS */}
            <div>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                <button
                  onClick={() => setActiveTab('android')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'android'
                      ? 'bg-orange-500 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Android / Chrome
                </button>
                <button
                  onClick={() => setActiveTab('ios')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'ios'
                      ? 'bg-orange-500 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <Share className="h-3.5 w-3.5" />
                  iPhone / Safari
                </button>
                <button
                  onClick={() => setActiveTab('desktop')}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'desktop'
                      ? 'bg-orange-500 text-stone-950 font-bold'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  <Laptop className="h-3.5 w-3.5" />
                  PC / Chrome
                </button>
              </div>

              <div className="rounded-2xl bg-stone-950 p-3.5 text-xs leading-relaxed text-stone-300 border border-stone-800">
                {activeTab === 'android' ? (
                  <div className="space-y-1">
                    <p className="font-bold text-amber-300">Android Chrome:</p>
                    <p>1. Open in Google Chrome.</p>
                    <p>2. Tap the 3 dots menu (<MoreVertical className="inline h-3 w-3 text-orange-400 -mt-0.5" />) at the top right.</p>
                    <p>3. Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>
                  </div>
                ) : activeTab === 'ios' ? (
                  <div className="space-y-1">
                    <p className="font-bold text-amber-300">iPhone Safari:</p>
                    <p>1. Open this website in Safari.</p>
                    <p>2. Tap the <strong>Share</strong> button (<Share className="inline h-3 w-3 text-orange-400 mx-0.5" />) at the bottom.</p>
                    <p>3. Scroll down and tap <strong>Add to Home Screen</strong> (<PlusSquare className="inline h-3 w-3 text-orange-400 mx-0.5" />).</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="font-bold text-amber-300">PC / Mac:</p>
                    <p>1. Open in Google Chrome or Edge.</p>
                    <p>2. Click the install icon in the address bar or the 3-dot menu → Install Chuks Store.</p>
                  </div>
                )}
              </div>
            </div>

            {/* PWA Diagnostics Link for Admin & Troubleshooting */}
            {onOpenDiagnostics && (
              <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-[11px] text-stone-400">
                <span>Need to check standalone mode or service worker?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDiagnostics();
                  }}
                  className="flex items-center gap-1 font-bold text-orange-400 hover:text-orange-300 underline underline-offset-2 transition cursor-pointer"
                >
                  <Wrench className="h-3 w-3" />
                  <span>Run PWA Diagnostics</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
