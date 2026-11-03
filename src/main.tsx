import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Chuks Communication App:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear any potentially corrupted cached state in localStorage
      localStorage.removeItem('chuks_cart');
      localStorage.removeItem('chuks_viewed_history');
      sessionStorage.clear();
      // Unregister any active service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
        });
      }
    } catch (e) {
      console.warn('Storage cleanup note:', e);
    }
    // Hard refresh cleanly to root
    window.location.href = window.location.origin + window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 selection:bg-orange-500 selection:text-black">
          <div className="w-full max-w-lg rounded-2xl border border-stone-800 bg-stone-900/90 p-6 sm:p-8 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-xl font-black text-white">Chuks Communication Store</h1>
            <p className="text-xs text-stone-400 leading-relaxed">
              We encountered a display issue while loading your store session. Tap below to reload fresh stock and parts catalog data.
            </p>

            {this.state.error && (
              <div className="rounded-xl bg-stone-950 p-3 text-left font-mono text-[11px] text-stone-400 overflow-x-auto border border-stone-800">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-lg shadow-orange-500/20 transition cursor-pointer"
              >
                Reload Chuks Store Catalog
              </button>
              <a
                href="https://wa.me/2347039564380"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 px-5 py-2.5 text-xs font-semibold text-stone-200 transition text-center"
              >
                WhatsApp Technician (07039564380)
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Smoothly dismiss the initial HTML splash screen once React mounts
if (typeof document !== 'undefined') {
  requestAnimationFrame(() => {
    const splash = document.getElementById('chuks-splash');
    if (splash && !splash.classList.contains('fade-out')) {
      splash.classList.add('fade-out');
      setTimeout(() => {
        if (splash.parentNode) splash.parentNode.removeChild(splash);
      }, 400);
    }
  });
}

// PWA Service Worker Registration:
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('Chuks Communication Service Worker active, scope:', registration.scope);
      })
      .catch((err) => {
        console.warn('PWA SW registration note:', err);
      });
  });
}

