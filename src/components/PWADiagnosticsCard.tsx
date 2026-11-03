import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Smartphone,
  Cpu,
  Layers,
  HardDrive,
  Download,
  Info,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';

interface ManifestCheckResult {
  ok: boolean;
  status?: number;
  contentType?: string;
  data?: any;
  error?: string;
}

interface ServiceWorkerInfo {
  supported: boolean;
  hasController: boolean;
  scope?: string;
  state?: string;
  caches: string[];
  error?: string;
}

interface StorageEstimate {
  quotaMB?: number;
  usageMB?: number;
}

export const PWADiagnosticsCard: React.FC<{
  onClose?: () => void;
  showInModal?: boolean;
}> = ({ onClose, showInModal = false }) => {
  const [isRunningStandalone, setIsRunningStandalone] = useState<boolean>(false);
  const [standaloneChecks, setStandaloneChecks] = useState<{
    displayModeStandalone: boolean;
    displayModeMinimalUi: boolean;
    displayModeFullscreen: boolean;
    iosStandalone: boolean;
    androidTwa: boolean;
    iframeDetected: boolean;
  }>({
    displayModeStandalone: false,
    displayModeMinimalUi: false,
    displayModeFullscreen: false,
    iosStandalone: false,
    androidTwa: false,
    iframeDetected: false,
  });

  const [navigatorProps, setNavigatorProps] = useState<{
    userAgent: string;
    isOnline: boolean;
    isSecureContext: boolean;
    platform: string;
    language: string;
    cookiesEnabled: boolean;
    vendor: string;
  }>({
    userAgent: '',
    isOnline: true,
    isSecureContext: true,
    platform: '',
    language: '',
    cookiesEnabled: true,
    vendor: '',
  });

  const [manifestInfo, setManifestInfo] = useState<ManifestCheckResult | null>(null);
  const [swInfo, setSwInfo] = useState<ServiceWorkerInfo | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<StorageEstimate | null>(null);
  const [promptAvailable, setPromptAvailable] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedRawJson, setCopiedRawJson] = useState(false);
  const [swActionMessage, setSwActionMessage] = useState<string | null>(null);

  const runAllDiagnostics = async () => {
    setIsRefreshing(true);
    setSwActionMessage(null);

    // 1. Standalone Checks
    if (typeof window !== 'undefined') {
      const matchStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const matchMinimalUi = window.matchMedia('(display-mode: minimal-ui)').matches;
      const matchFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
      const iosStandalone = Boolean((window.navigator as any).standalone);
      const androidTwa = typeof document !== 'undefined' && document.referrer.includes('android-app://');
      let iframe = false;
      try {
        iframe = window.self !== window.top;
      } catch {
        iframe = true;
      }

      const isStandalone = matchStandalone || matchMinimalUi || matchFullscreen || iosStandalone || androidTwa;

      setIsRunningStandalone(isStandalone);
      setStandaloneChecks({
        displayModeStandalone: matchStandalone,
        displayModeMinimalUi: matchMinimalUi,
        displayModeFullscreen: matchFullscreen,
        iosStandalone,
        androidTwa,
        iframeDetected: iframe,
      });

      // 2. Navigator Properties
      setNavigatorProps({
        userAgent: navigator.userAgent || 'Unknown',
        isOnline: navigator.onLine,
        isSecureContext: window.isSecureContext,
        platform: navigator.platform || 'Unknown',
        language: navigator.language || 'en',
        cookiesEnabled: navigator.cookieEnabled,
        vendor: navigator.vendor || '',
      });

      // 3. Deferred Prompt Check
      const hasPrompt = Boolean(
        (window as any).__deferredPWAInstallPrompt ||
        (window as any).__pwaPromptCaptured
      );
      setPromptAvailable(hasPrompt);

      // 4. Storage Estimate Check
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const est = await navigator.storage.estimate();
          setStorageEstimate({
            quotaMB: est.quota ? Math.round(est.quota / (1024 * 1024)) : undefined,
            usageMB: est.usage ? Math.round((est.usage / (1024 * 1024)) * 10) / 10 : undefined,
          });
        } catch {
          // ignore
        }
      }
    }

    // 5. Live Manifest Fetch & Inspection
    try {
      const res = await fetch('/manifest.json', { cache: 'no-cache' });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok) {
        const data = await res.json();
        setManifestInfo({
          ok: true,
          status: res.status,
          contentType,
          data,
        });
      } else {
        setManifestInfo({
          ok: false,
          status: res.status,
          contentType,
          error: `HTTP error ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err: any) {
      setManifestInfo({
        ok: false,
        error: err.message || 'Failed to fetch /manifest.json',
      });
    }

    // 6. Service Worker Live Inspection
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration('/');
        let cacheKeys: string[] = [];
        if ('caches' in window) {
          try {
            cacheKeys = await caches.keys();
          } catch {
            cacheKeys = [];
          }
        }

        setSwInfo({
          supported: true,
          hasController: Boolean(navigator.serviceWorker.controller),
          scope: reg ? reg.scope : 'Not registered on /',
          state: reg ? (reg.active ? 'active' : reg.installing ? 'installing' : reg.waiting ? 'waiting' : 'registered') : 'none',
          caches: cacheKeys,
        });
      } catch (err: any) {
        setSwInfo({
          supported: true,
          hasController: Boolean(navigator.serviceWorker.controller),
          caches: [],
          error: err.message,
        });
      }
    } else {
      setSwInfo({
        supported: false,
        hasController: false,
        caches: [],
        error: 'navigator.serviceWorker is unsupported in this browser.',
      });
    }

    setIsRefreshing(false);
  };

  useEffect(() => {
    runAllDiagnostics();

    // Listen to changes in standalone media query dynamically
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      const listener = () => runAllDiagnostics();
      try {
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
      } catch {
        // Safari fallback
        try {
          mediaQuery.addListener(listener);
          return () => mediaQuery.removeListener(listener);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handleTriggerInstall = async () => {
    const promptEvent = (window as any).__deferredPWAInstallPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        setSwActionMessage(`Install prompt outcome: ${choice.outcome}`);
        runAllDiagnostics();
      } catch (err: any) {
        setSwActionMessage(`Error triggering prompt: ${err.message}`);
      }
    } else {
      setSwActionMessage('No deferred install prompt available in this session.');
    }
  };

  const handleReRegisterSW = async () => {
    if (!('serviceWorker' in navigator)) return;
    setSwActionMessage('Re-registering /sw.js...');
    try {
      const reg = await navigator.serviceWorker.getRegistration('/');
      if (reg) {
        await reg.update();
      }
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      setSwActionMessage('Service Worker refreshed & active on scope /');
      runAllDiagnostics();
    } catch (err: any) {
      setSwActionMessage(`Failed to re-register: ${err.message}`);
    }
  };

  const handleClearCache = async () => {
    if (!('caches' in window)) return;
    setSwActionMessage('Clearing offline caches...');
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      setSwActionMessage(`Cleared ${keys.length} caches. Reloading app...`);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      setSwActionMessage(`Clear cache error: ${err.message}`);
    }
  };

  const handleCopyReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      isRunningStandalone,
      standaloneChecks,
      navigatorProps,
      manifestInfo: manifestInfo?.data ? 'Valid Manifest Loaded' : manifestInfo?.error,
      swInfo,
      storageEstimate,
      promptAvailable,
    };
    try {
      navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopiedRawJson(true);
      setTimeout(() => setCopiedRawJson(false), 2500);
    } catch {
      // ignore
    }
  };

  const directLaunchUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '/';

  return (
    <div className="space-y-4 text-slate-100">
      {/* Top Banner: Standalone Verdict */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 shadow-lg transition-all ${
          isRunningStandalone
            ? 'border-emerald-500/50 bg-emerald-950/30'
            : standaloneChecks.iframeDetected
            ? 'border-amber-500/50 bg-amber-950/30'
            : 'border-slate-700 bg-slate-900/90'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                isRunningStandalone
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : standaloneChecks.iframeDetected
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {isRunningStandalone ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : standaloneChecks.iframeDetected ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <Smartphone className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  PWA Standalone Status:{' '}
                  <span
                    className={
                      isRunningStandalone
                        ? 'text-emerald-400'
                        : standaloneChecks.iframeDetected
                        ? 'text-amber-400'
                        : 'text-stone-300'
                    }
                  >
                    {isRunningStandalone ? 'STANDALONE MODE (ACTIVE)' : 'BROWSER TAB MODE'}
                  </span>
                </h3>
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                {isRunningStandalone ? (
                  'The application is running inside an OS-level standalone PWA window without browser address bars.'
                ) : standaloneChecks.iframeDetected ? (
                  <span>
                    <strong>Why not standalone?</strong> You are currently previewing inside an{' '}
                    <strong className="text-amber-300">iframe / development preview</strong>. Browsers (Chrome &amp; Safari) strictly
                    block PWA installation and suppress <code>beforeinstallprompt</code> inside embedded iframes.
                  </span>
                ) : (
                  <span>
                    <strong>Why not standalone?</strong> The application is currently open inside a standard browser tab.
                    To experience standalone mode, tap <strong>Install App</strong> or add to your home screen.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={runAllDiagnostics}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              title="Re-run all live checks"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{isRefreshing ? 'Checking...' : 'Re-check'}</span>
            </button>
            <a
              href={`${directLaunchUrl}?action=install`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 px-3 py-2 text-xs font-bold text-white shadow-md transition"
              title="Open direct URL outside iframe"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open in Full Tab</span>
            </a>
          </div>
        </div>

        {/* Action Message Feedback */}
        {swActionMessage && (
          <div className="mt-3 rounded-xl border border-cyan-500/40 bg-cyan-950/40 p-2.5 text-xs text-cyan-200 font-medium flex items-center justify-between">
            <span>{swActionMessage}</span>
            <button
              onClick={() => setSwActionMessage(null)}
              className="text-cyan-400 hover:text-white text-xs ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Grid: 4 Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* CARD 1: Standalone Detection Details */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                1. Display Mode Checks
              </h4>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isRunningStandalone
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isRunningStandalone ? 'PASS' : 'TAB'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 font-mono text-[11px]">
                matchMedia('(display-mode: standalone)')
              </span>
              <span className="font-bold flex items-center gap-1">
                {standaloneChecks.displayModeStandalone ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> matches
                  </span>
                ) : (
                  <span className="text-slate-400">false</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 font-mono text-[11px]">
                matchMedia('(display-mode: minimal-ui)')
              </span>
              <span className="font-bold">
                {standaloneChecks.displayModeMinimalUi ? (
                  <span className="text-emerald-400">matches</span>
                ) : (
                  <span className="text-slate-400">false</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 font-mono text-[11px]">
                navigator.standalone (iOS Safari)
              </span>
              <span className="font-bold">
                {standaloneChecks.iosStandalone ? (
                  <span className="text-emerald-400">true</span>
                ) : (
                  <span className="text-slate-400">false</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 font-mono text-[11px]">
                window.self !== window.top (Iframe)
              </span>
              <span className="font-bold">
                {standaloneChecks.iframeDetected ? (
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="h-3 w-3" /> Yes (Inside Iframe)
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> No (Direct Window)
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400 font-mono text-[11px]">
                beforeinstallprompt Event
              </span>
              <span className="font-bold">
                {promptAvailable ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Captured (Ready)
                  </span>
                ) : (
                  <span className="text-slate-400">Not Captured</span>
                )}
              </span>
            </div>
          </div>

          {promptAvailable && (
            <button
              onClick={handleTriggerInstall}
              className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 py-2 text-xs font-bold text-white transition shadow"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Trigger Captured Install Prompt Now</span>
            </button>
          )}
        </div>

        {/* CARD 2: Web App Manifest Health */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                2. Web App Manifest (/manifest.json)
              </h4>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                manifestInfo?.ok
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {manifestInfo?.ok ? 'VALID 200 OK' : 'ERROR'}
            </span>
          </div>

          {manifestInfo?.ok ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">App Name / Short:</span>
                <span className="font-semibold text-white truncate max-w-[200px]" title={manifestInfo.data?.name}>
                  {manifestInfo.data?.short_name || manifestInfo.data?.name}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Display Setting:</span>
                <span
                  className={`font-mono font-bold ${
                    manifestInfo.data?.display === 'standalone' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  "{manifestInfo.data?.display}"
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Start URL &amp; Scope:</span>
                <span className="font-mono text-cyan-300">
                  {manifestInfo.data?.start_url} (scope: {manifestInfo.data?.scope})
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Declared Icons:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {manifestInfo.data?.icons?.length || 0} icon definitions (192, 512, maskable)
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Theme &amp; Background:</span>
                <span className="font-mono text-stone-300 flex items-center gap-1.5">
                  <span
                    className="h-3 w-3 rounded-full border border-stone-600 inline-block"
                    style={{ backgroundColor: manifestInfo.data?.theme_color || '#0c0a09' }}
                  />
                  {manifestInfo.data?.theme_color}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3 text-xs text-rose-200">
              <p className="font-bold flex items-center gap-1">
                <XCircle className="h-4 w-4 text-rose-400" /> Failed to load manifest:
              </p>
              <p className="mt-1 font-mono text-[11px]">{manifestInfo?.error || 'Unknown error'}</p>
            </div>
          )}
        </div>

        {/* CARD 3: Service Worker Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                3. Service Worker &amp; Offline Cache
              </h4>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                swInfo?.hasController
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {swInfo?.hasController ? 'CONTROLLING' : 'REGISTERING'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">navigator.serviceWorker:</span>
              <span className="font-bold">
                {swInfo?.supported ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Supported
                  </span>
                ) : (
                  <span className="text-rose-400">Unsupported</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">SW Controller:</span>
              <span className="font-bold">
                {swInfo?.hasController ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Active &amp; Controlling Page
                  </span>
                ) : (
                  <span className="text-amber-400">No Controller (Reloading will activate)</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">SW Scope:</span>
              <span className="font-mono text-[11px] text-cyan-300 truncate max-w-[200px]" title={swInfo?.scope}>
                {swInfo?.scope || '/'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Active Cache Stores:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {swInfo?.caches?.length ? swInfo.caches.join(', ') : 'Initializing (chuks-pwa-v2)'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Storage Usage / Quota:</span>
              <span className="font-mono text-slate-300">
                {storageEstimate?.usageMB !== undefined ? `${storageEstimate.usageMB} MB` : 'N/A'}{' '}
                {storageEstimate?.quotaMB ? ` / ${storageEstimate.quotaMB} MB` : ''}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleReRegisterSW}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 py-2 text-xs font-semibold text-slate-200 transition"
              title="Force re-registration of /sw.js"
            >
              Update SW
            </button>
            <button
              onClick={handleClearCache}
              className="flex-1 rounded-xl border border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/40 py-2 text-xs font-semibold text-rose-300 transition"
              title="Purge cached assets and reload"
            >
              Clear Cache &amp; Reload
            </button>
          </div>
        </div>

        {/* CARD 4: Navigator & Host Security Properties */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                4. Navigator &amp; Security
              </h4>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                navigatorProps.isSecureContext
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {navigatorProps.isSecureContext ? 'HTTPS SECURE' : 'INSECURE'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Secure Context (HTTPS):</span>
              <span className="font-bold">
                {navigatorProps.isSecureContext ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Yes (window.isSecureContext)
                  </span>
                ) : (
                  <span className="text-rose-400">No (HTTPS is required for PWA)</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Network State:</span>
              <span className="font-bold">
                {navigatorProps.isOnline ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Online (navigator.onLine)
                  </span>
                ) : (
                  <span className="text-amber-400">Offline</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Platform / OS:</span>
              <span className="font-mono text-white">{navigatorProps.platform}</span>
            </div>

            <div className="py-1">
              <span className="text-slate-400 block mb-1">User Agent:</span>
              <p
                className="font-mono text-[10px] text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800/80 break-all leading-normal max-h-16 overflow-y-auto"
                title={navigatorProps.userAgent}
              >
                {navigatorProps.userAgent}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-3 py-2 font-medium text-slate-300 hover:text-white transition"
          >
            {copiedRawJson ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-300">Report Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-cyan-400" />
                <span>Copy Diagnostics JSON</span>
              </>
            )}
          </button>
        </div>

        {showInModal && onClose && (
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 font-semibold text-slate-200 transition"
          >
            Close Diagnostics
          </button>
        )}
      </div>
    </div>
  );
};
