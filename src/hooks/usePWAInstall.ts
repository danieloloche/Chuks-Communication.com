import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && (window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt) {
      return (window as unknown as { __deferredPWAInstallPrompt: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window !== 'undefined' && (window as unknown as { __isPWAInstalled?: boolean }).__isPWAInstalled) {
      return true;
    }
    return false;
  });
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasInstallQuery, setHasInstallQuery] = useState(false);
  const [visitCount, setVisitCount] = useState(1);
  const [isNudgeDismissed, setIsNudgeDismissed] = useState(false);

  useEffect(() => {
    // Detect iframe environment (AI Studio preview, embedded tabs)
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    // Detect standalone mode (already installed and running as an app)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://') ||
      (window as unknown as { __isPWAInstalled?: boolean }).__isPWAInstalled === true;
    setIsInstalled(isStandalone);

    // Track user site visits across sessions
    try {
      const storedVisits = parseInt(localStorage.getItem('chuks_site_visit_count') || '0', 10);
      const isNewSession = !sessionStorage.getItem('chuks_active_session_visited');

      let currentVisits = storedVisits;
      if (isNewSession) {
        currentVisits = storedVisits + 1;
        localStorage.setItem('chuks_site_visit_count', currentVisits.toString());
        sessionStorage.setItem('chuks_active_session_visited', 'true');
      }
      setVisitCount(currentVisits);

      // Check if nudge was snoozed or dismissed
      const dismissedUntil = localStorage.getItem('chuks_pwa_nudge_dismissed_until');
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        setIsNudgeDismissed(true);
      }
    } catch (e) {
      console.debug('Visit tracking storage note:', e);
    }

    // Detect browser & OS environments
    const userAgent = (window.navigator.userAgent || '').toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    const isChromeBrowser = /chrome|crios/i.test(userAgent) && !/edge|edg|opr/i.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsChrome(isChromeBrowser);

    // Detect mobile screen or user-agent
    const isMobileDevice =
      isIOSDevice ||
      isAndroidDevice ||
      /webos|blackberry|iemobile|opera mini/i.test(userAgent) ||
      window.innerWidth < 768;
    setIsMobile(isMobileDevice);

    // Detect install query parameter (?install=true or ?action=install)
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('install') === 'true' || params.get('install') === '1' || params.get('action') === 'install') {
        setHasInstallQuery(true);
      }
    } catch {
      // ignore URL parsing errors
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as unknown as { __deferredPWAInstallPrompt: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);

      // Auto-trigger prompt if opened with install intent or direct button
      try {
        const params = new URLSearchParams(window.location.search);
        const shouldAutoPrompt =
          params.get('install') === 'true' ||
          params.get('install') === '1' ||
          params.get('action') === 'install' ||
          params.get('autoinstall') === '1' ||
          sessionStorage.getItem('chuks_auto_install_prompt') === 'true';

        if (shouldAutoPrompt) {
          sessionStorage.removeItem('chuks_auto_install_prompt');
          setTimeout(async () => {
            try {
              await promptEvent.prompt();
              const choice = await promptEvent.userChoice;
              if (choice.outcome === 'accepted') {
                setIsInstalled(true);
                setDeferredPrompt(null);
              }
            } catch (err) {
              console.log('Auto install prompt note:', err);
            }
          }, 600);
        }
      } catch {
        // ignore
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      (window as unknown as { __isPWAInstalled?: boolean }).__isPWAInstalled = true;
      setDeferredPrompt(null);
    };

    const handlePromptReadyCustom = (e: Event) => {
      const customEvt = e as CustomEvent<BeforeInstallPromptEvent>;
      if (customEvt.detail) {
        setDeferredPrompt(customEvt.detail);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('chuks_pwa_prompt_ready', handlePromptReadyCustom);
    window.addEventListener('chuks_pwa_installed', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('chuks_pwa_prompt_ready', handlePromptReadyCustom);
      window.removeEventListener('chuks_pwa_installed', handleAppInstalled);
    };
  }, []);

  const getDirectAppUrl = () => {
    try {
      return `${window.location.origin}/`;
    } catch {
      return '/';
    }
  };

  const openInFullTab = (_triggerAutoPrompt = true) => {
    try {
      const url = getDirectAppUrl();
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win) {
        console.warn('Popup blocked, prompting user to click direct link.');
      }
    } catch (e) {
      console.warn('Could not open full window:', e);
    }
  };

  const downloadAppLauncher = () => {
    try {
      const origin = window.location.origin;
      const launcherHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Chuks Communication Store</title>
  <link rel="icon" type="image/svg+xml" href="${origin}/icon.svg">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Chuks Store">
  <meta name="theme-color" content="#ea580c">
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #0c0a09;
      color: #fafaf9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 90vh;
      text-align: center;
    }
    .card {
      background: #1c1917;
      border: 1px solid #292524;
      padding: 32px 24px;
      border-radius: 20px;
      max-width: 420px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
    }
    .btn {
      background: linear-gradient(135deg, #f97316, #d97706);
      color: #0c0a09;
      text-decoration: none;
      padding: 14px 24px;
      border-radius: 12px;
      font-weight: 700;
      display: inline-block;
      margin-top: 20px;
      font-size: 15px;
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="${origin}/icon.svg" width="72" height="72" alt="Chuks Store Logo" style="border-radius: 16px; margin-bottom: 12px;">
    <h2 style="margin: 0 0 8px 0; font-size: 20px;">Chuks Communication</h2>
    <p style="color: #94a3b8; font-size: 13px; margin: 0 0 16px 0;">Official Phone Parts, Screen Compatibility Ledger & Accessories</p>
    <a id="launch-link" class="btn" href="${origin}/?action=install&autoinstall=1">Open Chuks Store App</a>
  </div>
  <script>
    setTimeout(function() {
      window.location.replace("${origin}/?action=install&autoinstall=1");
    }, 500);
  </script>
</body>
</html>`;

      const blob = new Blob([launcherHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Chuks-Store-App-Launcher.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download app launcher error:', e);
    }
  };

  const launchDedicatedTab = () => {
    try {
      const url = `${window.location.origin}/?action=install&autoinstall=1`;
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      try {
        window.location.href = `${window.location.origin}/?action=install&autoinstall=1`;
      } catch (err) {
        console.warn('Navigation error:', err);
      }
    }
  };

  const triggerInstall = async (): Promise<{ outcome: 'accepted' | 'dismissed' | 'launched_tab' | 'ios_manual' | 'not_ready' }> => {
    const promptEvent =
      deferredPrompt ||
      (typeof window !== 'undefined'
        ? (window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt
        : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          if (typeof window !== 'undefined') {
            (window as unknown as { __deferredPWAInstallPrompt?: null }).__deferredPWAInstallPrompt = null;
            (window as unknown as { __isPWAInstalled?: boolean }).__isPWAInstalled = true;
          }
          return { outcome: 'accepted' };
        }
        return { outcome: 'dismissed' };
      } catch (e) {
        console.warn('Install prompt trigger error:', e);
      }
    }

    if (isInIframe) {
      launchDedicatedTab();
      return { outcome: 'launched_tab' };
    }

    if (isIOS) {
      return { outcome: 'ios_manual' };
    }

    return { outcome: 'not_ready' };
  };

  const install = async (): Promise<boolean> => {
    const promptEvent =
      deferredPrompt ||
      (typeof window !== 'undefined'
        ? (window as unknown as { __deferredPWAInstallPrompt?: BeforeInstallPromptEvent }).__deferredPWAInstallPrompt
        : null);

    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          (window as unknown as { __deferredPWAInstallPrompt?: null }).__deferredPWAInstallPrompt = null;
          (window as unknown as { __isPWAInstalled?: boolean }).__isPWAInstalled = true;
        }
        return true;
      }
    } catch (err) {
      console.warn('Installation prompt error:', err);
    }
    return false;
  };

  const dismissNudge = (hours = 48) => {
    setIsNudgeDismissed(true);
    try {
      const dismissUntil = Date.now() + hours * 60 * 60 * 1000;
      localStorage.setItem('chuks_pwa_nudge_dismissed_until', dismissUntil.toString());
    } catch {
      // ignore storage error
    }
  };

  return {
    isInstallable:
      !!deferredPrompt ||
      (typeof window !== 'undefined' &&
        !!(window as unknown as { __deferredPWAInstallPrompt?: unknown }).__deferredPWAInstallPrompt),
    isInstalled,
    isIOS,
    isAndroid,
    isChrome,
    isInIframe,
    isMobile,
    hasInstallQuery,
    visitCount,
    isNudgeDismissed,
    dismissNudge,
    directAppUrl: getDirectAppUrl(),
    openInFullTab,
    downloadAppLauncher,
    launchDedicatedTab,
    triggerInstall,
    install,
  };
}
