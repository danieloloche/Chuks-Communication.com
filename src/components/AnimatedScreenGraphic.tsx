import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Zap,
  ShieldCheck,
  Check,
  Layers,
  Sparkles,
  RefreshCw,
  Cpu,
  Eye,
  Maximize2,
  Sliders,
} from 'lucide-react';
import { Product } from '../types';

interface AnimatedScreenGraphicProps {
  product?: Partial<Product>;
  name?: string;
  brand?: string;
  sku?: string;
  condition?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  interactive?: boolean;
  onInspectDetails?: () => void;
}

type ScreenTestMode = 'amoled' | 'refresh120' | 'touchGrid' | 'subpixel' | 'flexInspection';

export const AnimatedScreenGraphic: React.FC<AnimatedScreenGraphicProps> = ({
  product,
  name: propName,
  brand: propBrand,
  sku: propSku,
  condition: propCondition,
  size = 'md',
  className = '',
  interactive = true,
  onInspectDetails,
}) => {
  const name = propName || product?.name || 'AMOLED Dynamic Screen Assembly';
  const brand = propBrand || product?.brand || 'Universal';
  const sku = propSku || product?.sku || 'CHK-SCR-001';
  const condition = propCondition || product?.condition || 'Service Pack OEM';

  const [testMode, setTestMode] = useState<ScreenTestMode>('amoled');
  const [touchPoints, setTouchPoints] = useState<{ x: number; y: number; id: number }[]>([]);
  const [fps, setFps] = useState(120);
  const [isGluedWarningDismissed, setIsGluedWarningDismissed] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  // Determine phone style based on brand
  const isApple = brand.toLowerCase().includes('apple') || name.toLowerCase().includes('iphone');
  const isSamsung = brand.toLowerCase().includes('samsung') || name.toLowerCase().includes('galaxy');
  const isTranssion =
    brand.toLowerCase().includes('tecno') ||
    brand.toLowerCase().includes('infinix') ||
    brand.toLowerCase().includes('itel');

  // Interactive touch effect
  const handleTouchGridMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (testMode !== 'touchGrid' && testMode !== 'amoled') return;
    if (!screenRef.current) return;
    const rect = screenRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const newPt = { x, y, id: Date.now() };
    setTouchPoints((prev) => [...prev.slice(-6), newPt]);
  };

  // FPS simulation jitter for realism
  useEffect(() => {
    if (testMode !== 'refresh120') return;
    const interval = setInterval(() => {
      setFps(119 + Math.floor(Math.random() * 2));
    }, 400);
    return () => clearInterval(interval);
  }, [testMode]);

  // Size XS (32px - 36px) - Micro preview for lists and tables
  if (size === 'xs') {
    return (
      <div
        className={`relative flex h-9 w-7 items-center justify-center rounded-md border border-cyan-500/50 bg-stone-950 p-0.5 shadow-sm overflow-hidden group ${className}`}
        title={`Screen: ${name}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-orange-500/10 to-stone-950 animate-pulse" />
        <div className="h-full w-full rounded-[3px] border border-stone-800 bg-stone-900 flex flex-col items-center justify-between p-0.5">
          <div className="h-0.5 w-2 rounded-full bg-stone-700" />
          <Smartphone className="h-3 w-3 text-cyan-400" />
          <div className="h-0.5 w-1.5 rounded-xs bg-amber-500/80" />
        </div>
      </div>
    );
  }

  // Size SM (56px - 64px) - Compact preview for cart & drawer
  if (size === 'sm') {
    return (
      <div
        className={`relative flex h-16 w-12 flex-col items-center justify-between rounded-lg border border-cyan-500/50 bg-stone-950 p-1 shadow-md overflow-hidden select-none ${className}`}
        title={`Screen: ${name}`}
      >
        {/* Glass reflection beam */}
        <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-cyan-400/15 to-transparent rotate-45 pointer-events-none" />
        
        {/* Top notch */}
        <div className="relative z-10 h-1 w-3 rounded-full bg-stone-800 border border-stone-700/60" />

        {/* Center glowing display panel */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <Smartphone className="h-5 w-5 text-cyan-400 animate-pulse" />
          <span className="text-[7px] font-mono font-bold text-amber-300">120Hz</span>
        </div>

        {/* Bottom flex connector simulation */}
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="h-1 w-4 rounded-xs bg-amber-600/90 border border-amber-400/80 shadow-xs" />
        </div>
      </div>
    );
  }

  // Size MD - Card Aspect Preview (Used in Product Cards and Catalog Grids)
  if (size === 'md') {
    return (
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 p-3 shadow-xl overflow-hidden select-none border border-stone-800/90 group ${className}`}
      >
        {/* Ambient Back Glow Behind Phone Glass */}
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/15 via-cyan-500/15 to-amber-500/15 blur-xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Ambient Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] opacity-20 pointer-events-none" />

        {/* Top Floating QC Tag */}
        <div className="relative z-10 w-full flex items-center justify-between pb-1.5 px-1 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold tracking-wider text-stone-300 uppercase">
              {brand} AMOLED
            </span>
          </div>
          <span className="rounded bg-stone-900 border border-stone-700/80 px-1.5 py-0.5 text-[8px] font-semibold text-amber-300">
            TEST FIRST
          </span>
        </div>

        {/* Realistic Smartphone Display Bezel Body */}
        <div className="relative z-10 my-1 flex flex-col items-center">
          {/* Main Curved Glass Phone Screen */}
          <div
            className={`relative flex h-44 w-28 flex-col items-center justify-between rounded-[22px] border-2 border-stone-700 bg-black p-1.5 shadow-2xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.03] ${
              isApple
                ? 'rounded-[24px] border-stone-600'
                : isSamsung
                ? 'rounded-[18px] border-stone-700'
                : 'rounded-[20px] border-stone-700'
            }`}
          >
            {/* Protective Film Corner Peel Pull-Tab */}
            <div className="absolute -top-1 -right-1 z-30 flex items-center justify-center rounded-bl-lg bg-gradient-to-br from-emerald-500 to-teal-600 px-1.5 py-0.5 text-[7px] font-black text-stone-950 shadow-md border-b border-l border-emerald-300/60 uppercase tracking-tighter">
              PEEL TAB
            </div>

            {/* Dynamic Glass Shimmer Beam (Runs diagonally across the screen) */}
            <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 pointer-events-none animate-[pulse_4s_ease-in-out_infinite]" />

            {/* Top Camera Aperture / Dynamic Island */}
            <div className="relative z-20 w-full flex items-center justify-center pt-0.5">
              {isApple ? (
                <div className="h-2.5 w-7 rounded-full bg-black border border-stone-800 flex items-center justify-end px-1 shadow-sm">
                  <span className="h-1 w-1 rounded-full bg-cyan-900/80 border border-cyan-500/50" />
                </div>
              ) : (
                <div className="h-2 w-2 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center shadow-xs">
                  <span className="h-1 w-1 rounded-full bg-cyan-500/80" />
                </div>
              )}
            </div>

            {/* Vivid Dynamic AMOLED Screen Surface */}
            <div className="relative z-10 my-auto flex h-32 w-full flex-col items-center justify-between rounded-[16px] bg-gradient-to-br from-slate-950 via-cyan-950/70 to-orange-950/60 p-2 text-center border border-cyan-500/30 overflow-hidden">
              {/* Animated Live Wallpaper Waves */}
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/25 via-cyan-500/20 to-purple-600/30 opacity-80 mix-blend-screen animate-pulse pointer-events-none" />

              {/* Status Header */}
              <div className="relative z-10 w-full flex items-center justify-between text-[7px] font-mono text-cyan-300/80">
                <span>12:00</span>
                <span className="flex items-center gap-0.5">
                  <Sparkles className="h-2 w-2 text-amber-400" /> 120Hz
                </span>
              </div>

              {/* Display Core Emblem */}
              <div className="relative z-10 my-auto flex flex-col items-center">
                <div className="rounded-full bg-cyan-500/20 p-1.5 border border-cyan-400/40 shadow-lg shadow-cyan-500/20 animate-bounce">
                  <Smartphone className="h-5 w-5 text-cyan-300" />
                </div>
                <span className="text-[8px] font-black tracking-tight text-white mt-1 drop-shadow-md">
                  DYNAMIC AMOLED
                </span>
                <span className="text-[7px] text-amber-300 font-mono tracking-tighter">
                  TRUE TONE OK
                </span>
              </div>

              {/* Bottom Screen Bar */}
              <div className="relative z-10 w-full flex items-center justify-between text-[7px] font-mono text-stone-400 border-t border-cyan-500/20 pt-1">
                <span className="text-emerald-400 font-bold">QC PASS</span>
                <span className="text-[6px] text-stone-300">ORIGINAL IC</span>
              </div>
            </div>

            {/* Bottom Home Indicator */}
            <div className="relative z-20 h-0.5 w-8 rounded-full bg-stone-600/80 my-0.5" />
          </div>

          {/* Copper Flex Ribbon Cable & Gold Contact Pins Protruding from Bottom */}
          <div className="relative -mt-1 flex flex-col items-center z-10">
            {/* Flex Cable Neck */}
            <div className="h-2.5 w-10 bg-amber-700/80 border-x border-amber-500/50 flex items-center justify-center">
              {/* Copper Circuit Traces */}
              <div className="flex gap-0.5">
                <span className="h-1.5 w-0.5 bg-amber-400/90" />
                <span className="h-1.5 w-0.5 bg-amber-400/90" />
                <span className="h-1.5 w-0.5 bg-amber-400/90" />
                <span className="h-1.5 w-0.5 bg-amber-400/90" />
              </div>
            </div>
            {/* Gold Terminal Connector Head */}
            <div className="flex items-center gap-0.5 rounded-b-md bg-stone-900 border border-amber-400/90 px-1.5 py-0.5 shadow-md">
              <span className="text-[6px] font-mono font-bold text-amber-300 tracking-wider">
                IC PIN 30-DAY WARRANTY
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Technical Specifications Strip */}
        <div className="relative z-10 w-full flex items-center justify-between border-t border-stone-800/80 pt-1.5 px-1 text-[9px] font-mono text-stone-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span className="text-[8px] text-stone-300 truncate max-w-[110px]">{condition}</span>
          </div>
          <span className="text-[8px] text-amber-400 font-bold tracking-tight">
            ORIGINAL GRADE
          </span>
        </div>
      </div>
    );
  }

  // Size LG & HERO - Master Interactive Screen Demonstration Experience!
  // Used in Product Detail Modal and Hero Spotlight
  return (
    <div
      className={`relative flex flex-col items-center justify-between rounded-2xl border-2 border-stone-700/90 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 p-4 sm:p-6 shadow-2xl overflow-hidden select-none ${className}`}
    >
      {/* Background Interactive Lighting */}
      <div className="absolute -inset-6 bg-gradient-to-r from-orange-500/20 via-cyan-500/15 to-emerald-500/20 blur-3xl pointer-events-none opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

      {/* Top Header & Warranty Stamp */}
      <div className="relative z-20 w-full flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/40">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase flex items-center gap-1.5">
              {brand} AMOLED SCREEN ASSEMBLY
              <span className="rounded bg-orange-500/20 border border-orange-500/40 px-1.5 py-0.2 text-[9px] text-amber-300 font-mono">
                120Hz
              </span>
            </h4>
            <p className="text-[10px] text-stone-400">Chuks Store • Park Road Gwagwalada, Abuja</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-stone-900 border border-stone-700 px-2 py-0.5 text-xs font-mono font-bold text-amber-400 shadow-sm">
            {sku}
          </span>
        </div>
      </div>

      {/* Interactive Mode Selector Toolbar */}
      {interactive && (
        <div className="relative z-20 mt-3 w-full flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 rounded-xl border border-stone-800 bg-stone-950/80 p-1 text-[10px] sm:text-[11px] font-semibold text-stone-300 shadow-inner">
            <button
              onClick={() => setTestMode('amoled')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                testMode === 'amoled'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'hover:text-white hover:bg-stone-800'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>OLED Flow</span>
            </button>

            <button
              onClick={() => setTestMode('refresh120')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                testMode === 'refresh120'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-stone-950 font-bold shadow-sm'
                  : 'hover:text-white hover:bg-stone-800'
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>120Hz Test</span>
            </button>

            <button
              onClick={() => setTestMode('touchGrid')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                testMode === 'touchGrid'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 font-bold shadow-sm'
                  : 'hover:text-white hover:bg-stone-800'
              }`}
            >
              <Sliders className="h-3 w-3" />
              <span>Touch Grid</span>
            </button>

            <button
              onClick={() => setTestMode('subpixel')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                testMode === 'subpixel'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-stone-950 font-bold shadow-sm'
                  : 'hover:text-white hover:bg-stone-800'
              }`}
            >
              <Layers className="h-3 w-3" />
              <span>PenTile Matrix</span>
            </button>

            <button
              onClick={() => setTestMode('flexInspection')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                testMode === 'flexInspection'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-bold shadow-sm'
                  : 'hover:text-white hover:bg-stone-800'
              }`}
            >
              <Cpu className="h-3 w-3" />
              <span>Flex IC</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Screen Showcase Centerpiece */}
      <div className="relative z-10 my-4 sm:my-6 flex flex-col items-center justify-center">
        {/* Outer Glow Halo */}
        <div className="absolute -inset-6 rounded-3xl bg-cyan-500/15 blur-2xl pointer-events-none" />

        {/* Smartphone Hardware Frame */}
        <div
          ref={screenRef}
          onMouseMove={handleTouchGridMove}
          className={`relative flex h-64 sm:h-72 w-40 sm:w-44 flex-col items-center justify-between rounded-[32px] border-4 border-stone-700 bg-stone-950 p-2 shadow-2xl overflow-hidden transition-all duration-300 ${
            testMode === 'amoled'
              ? 'ring-2 ring-orange-500/40 shadow-orange-500/10'
              : testMode === 'refresh120'
              ? 'ring-2 ring-cyan-500/40 shadow-cyan-500/10'
              : testMode === 'touchGrid'
              ? 'ring-2 ring-emerald-500/40 cursor-crosshair'
              : 'ring-2 ring-amber-500/40'
          }`}
        >
          {/* Authentic Corner Peel Film Pull-Tab */}
          <div className="absolute -top-1 -right-1 z-30 flex items-center justify-center rounded-bl-xl bg-gradient-to-br from-emerald-500 to-teal-500 px-2.5 py-1 text-[8px] font-black text-stone-950 shadow-md border-b border-l border-emerald-300/80 uppercase tracking-tighter">
            PEEL FILM
          </div>

          {/* Diagonal Glass Sheen Reflection Animation */}
          <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 pointer-events-none animate-[pulse_5s_ease-in-out_infinite]" />

          {/* Top Speaker Ear-Mesh & Front Camera Notch */}
          <div className="relative z-20 w-full flex items-center justify-center pt-1">
            {isApple ? (
              <div className="flex items-center justify-center gap-1 h-3.5 w-12 rounded-full bg-black border border-stone-800 px-1.5 shadow-inner">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-900 border border-blue-500/60" />
                <span className="h-1 w-1 rounded-full bg-stone-700" />
              </div>
            ) : (
              <div className="h-3 w-3 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* DYNAMIC SCREEN DISPLAY AREA (Depends on Active Test Mode)      */}
          {/* ============================================================== */}

          {/* MODE 1: AMOLED VIVID FLOW (Glowing Fluid Gradient) */}
          {testMode === 'amoled' && (
            <div className="relative z-10 my-auto flex h-48 sm:h-54 w-full flex-col items-center justify-between rounded-[22px] bg-gradient-to-br from-slate-950 via-cyan-950 to-orange-950/80 p-2 text-center border border-cyan-500/40 overflow-hidden shadow-inner">
              {/* Fluid Swirling Ambient Lighting */}
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/35 via-cyan-500/25 to-purple-600/35 mix-blend-screen animate-pulse pointer-events-none" />

              {/* Status Header */}
              <div className="relative z-10 w-full flex items-center justify-between text-[8px] font-mono text-cyan-300">
                <span className="font-bold">100% AMOLED</span>
                <span className="flex items-center gap-0.5 text-amber-300">
                  <Sparkles className="h-2.5 w-2.5" /> 2,600 nits
                </span>
              </div>

              {/* Interactive Touch Ripples on Display */}
              {touchPoints.map((pt) => (
                <span
                  key={pt.id}
                  className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/40 border border-cyan-300 animate-ping pointer-events-none"
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                />
              ))}

              {/* Center Hologram Icon & Badge */}
              <div className="relative z-10 my-auto flex flex-col items-center">
                <div className="rounded-2xl bg-cyan-500/20 p-2.5 border border-cyan-400/50 shadow-xl shadow-cyan-500/25 animate-bounce">
                  <Smartphone className="h-7 w-7 text-cyan-300" />
                </div>
                <span className="text-[10px] sm:text-xs font-black tracking-tight text-white mt-2 drop-shadow-lg">
                  DYNAMIC AMOLED 2X
                </span>
                <span className="text-[8px] text-amber-300 font-mono font-bold tracking-tight">
                  TRUE TONE • 120Hz LTPO
                </span>
              </div>

              {/* Bottom Test Ready Bar */}
              <div className="relative z-10 w-full flex items-center justify-between text-[8px] font-mono border-t border-cyan-500/30 pt-1 text-stone-300">
                <span className="text-emerald-400 font-bold">100% RESPONSIVE</span>
                <span className="text-stone-400">TOUCH READY</span>
              </div>
            </div>
          )}

          {/* MODE 2: 120Hz PROMOTION REFRESH TEST (Buttery Smooth Motion) */}
          {testMode === 'refresh120' && (
            <div className="relative z-10 my-auto flex h-48 sm:h-54 w-full flex-col items-center justify-between rounded-[22px] bg-slate-950 p-2.5 text-center border border-cyan-400/50 overflow-hidden shadow-inner">
              <div className="w-full flex items-center justify-between text-[8px] font-mono text-cyan-300">
                <span>REFRESH RATE:</span>
                <span className="font-bold text-amber-300">{fps} FPS</span>
              </div>

              {/* Fast Moving Motion Bars */}
              <div className="w-full space-y-2 my-auto">
                <div className="relative h-4 w-full rounded bg-slate-900 border border-cyan-500/30 overflow-hidden">
                  <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-cyan-500 to-blue-400 animate-[bounce_1s_infinite] shadow-md shadow-cyan-400" />
                </div>
                <div className="relative h-4 w-full rounded bg-slate-900 border border-orange-500/30 overflow-hidden">
                  <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-orange-500 to-amber-400 animate-[bounce_0.8s_infinite] shadow-md shadow-orange-400" />
                </div>
                <div className="relative h-4 w-full rounded bg-slate-900 border border-emerald-500/30 overflow-hidden">
                  <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-emerald-500 to-teal-400 animate-[bounce_0.6s_infinite] shadow-md shadow-emerald-400" />
                </div>
                <span className="block text-[8px] font-mono text-cyan-300 font-bold mt-1">
                  120Hz ZERO-LAG RESPONSE
                </span>
              </div>

              <div className="w-full border-t border-slate-800 pt-1 text-[8px] font-mono text-emerald-400">
                ULTRA LOW LATENCY IC
              </div>
            </div>
          )}

          {/* MODE 3: TOUCH GRID TEST (Interactive Digitizer Grid) */}
          {testMode === 'touchGrid' && (
            <div className="relative z-10 my-auto flex h-48 sm:h-54 w-full flex-col items-center justify-between rounded-[22px] bg-slate-950 p-2 text-center border border-emerald-500/50 overflow-hidden shadow-inner">
              <div className="w-full flex items-center justify-between text-[8px] font-mono text-emerald-300">
                <span>DIGITIZER TOUCH TEST</span>
                <span className="text-amber-300">MOVE CURSOR</span>
              </div>

              {/* 5x5 Digitizer Grid Cells */}
              <div className="grid grid-cols-4 gap-1 w-full my-auto p-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex h-6 items-center justify-center rounded border border-emerald-500/40 bg-emerald-950/20 text-[7px] font-mono text-emerald-400 hover:bg-emerald-500 hover:text-stone-950 transition-colors"
                  >
                    ✓
                  </div>
                ))}
              </div>

              {/* Interactive ripples */}
              {touchPoints.map((pt) => (
                <span
                  key={pt.id}
                  className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/50 animate-ping pointer-events-none"
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                />
              ))}

              <div className="w-full border-t border-emerald-500/30 pt-1 text-[8px] font-mono text-emerald-300">
                10-POINT MULTI-TOUCH OK
              </div>
            </div>
          )}

          {/* MODE 4: SUBPIXEL PENTILE MATRIX (RGB Loupe) */}
          {testMode === 'subpixel' && (
            <div className="relative z-10 my-auto flex h-48 sm:h-54 w-full flex-col items-center justify-between rounded-[22px] bg-black p-2 text-center border border-purple-500/50 overflow-hidden shadow-inner">
              <div className="w-full flex items-center justify-between text-[8px] font-mono text-purple-300">
                <span>DIAMOND PENTILE</span>
                <span className="text-amber-300">460 PPI</span>
              </div>

              {/* High density subpixel preview */}
              <div className="my-auto flex flex-col items-center justify-center p-2 rounded-xl bg-stone-900/90 border border-purple-500/30">
                <div className="flex gap-1.5 items-center justify-center">
                  <span className="h-5 w-3 rounded-xs bg-red-500 shadow-sm shadow-red-500 animate-pulse" />
                  <span className="h-6 w-3 rounded-xs bg-green-500 shadow-sm shadow-green-500" />
                  <span className="h-5 w-3 rounded-xs bg-blue-500 shadow-sm shadow-blue-500 animate-pulse" />
                </div>
                <span className="text-[8px] font-mono text-stone-300 mt-2">
                  TRUE RGB SUBPIXEL MATRIX
                </span>
                <span className="text-[7px] font-mono text-purple-400">
                  INFINITE CONTRAST RATIO
                </span>
              </div>

              <div className="w-full border-t border-purple-500/30 pt-1 text-[8px] font-mono text-stone-400">
                ZERO BACKLIGHT BLEED
              </div>
            </div>
          )}

          {/* MODE 5: FLEX IC & RIBBON INSPECTION */}
          {testMode === 'flexInspection' && (
            <div className="relative z-10 my-auto flex h-48 sm:h-54 w-full flex-col items-center justify-between rounded-[22px] bg-stone-950 p-2 text-center border border-amber-500/50 overflow-hidden shadow-inner">
              <div className="w-full flex items-center justify-between text-[8px] font-mono text-amber-300">
                <span>COPPER FLEX CABLE</span>
                <span className="text-emerald-400">ESD SAFE</span>
              </div>

              <div className="my-auto flex flex-col items-center p-2 rounded-xl bg-amber-950/20 border border-amber-500/30 w-full">
                <Cpu className="h-6 w-6 text-amber-400 mb-1" />
                <span className="text-[8px] font-mono font-bold text-white">
                  DUAL-LAYER DISPLAY IC
                </span>
                <p className="text-[7px] text-stone-300 mt-0.5">
                  Pre-soldered digitizer flex with gold terminal pins & protective foam padding.
                </p>
                <div className="mt-1 flex gap-1">
                  <span className="h-2 w-1.5 rounded-xs bg-amber-400" />
                  <span className="h-2 w-1.5 rounded-xs bg-amber-400" />
                  <span className="h-2 w-1.5 rounded-xs bg-amber-400" />
                  <span className="h-2 w-1.5 rounded-xs bg-amber-400" />
                </div>
              </div>

              <div className="w-full border-t border-amber-500/30 pt-1 text-[8px] font-mono text-amber-300 font-bold">
                100% TESTED BEFORE DISPATCH
              </div>
            </div>
          )}

          {/* Bottom Home Indicator Bar */}
          <div className="relative z-20 h-1 w-12 rounded-full bg-stone-600/80 my-0.5" />
        </div>

        {/* Real Protruding Ribbon Flex Cable with Gold Contact Pins */}
        <div className="relative -mt-1.5 flex flex-col items-center z-20">
          {/* Main Flex Ribbon */}
          <div className="h-4 sm:h-5 w-16 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 border-x-2 border-amber-500/60 shadow-lg flex items-center justify-center">
            {/* Precision Circuit Traces */}
            <div className="flex gap-1">
              <span className="h-3 w-0.5 bg-amber-300/80" />
              <span className="h-3 w-0.5 bg-amber-300/80" />
              <span className="h-3 w-0.5 bg-amber-300/80" />
              <span className="h-3 w-0.5 bg-amber-300/80" />
              <span className="h-3 w-0.5 bg-amber-300/80" />
            </div>
          </div>
          {/* Gold Connector Terminal Bar */}
          <div className="flex items-center gap-1 rounded-b-md bg-stone-900 border border-amber-400 px-2 py-0.5 shadow-md">
            <span className="text-[7px] sm:text-[8px] font-mono font-extrabold text-amber-300 tracking-wider">
              ★ CHUKS QC VERIFIED PIN CONNECTOR ★
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Testing Warranty Banner */}
      <div className="relative z-20 w-full rounded-xl bg-orange-500/10 border border-orange-500/30 p-2 sm:p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-stone-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-amber-300">30-Day Testing Warranty:</strong> Connect flex and test touch/display on board before peeling film or gluing!
          </span>
        </div>
        {onInspectDetails && (
          <button
            onClick={onInspectDetails}
            className="flex items-center gap-1 rounded-lg bg-orange-500 text-stone-950 px-2.5 py-1 text-[11px] font-bold hover:bg-orange-400 transition"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Full Specs</span>
          </button>
        )}
      </div>
    </div>
  );
};
