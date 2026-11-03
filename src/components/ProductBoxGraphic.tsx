import React from 'react';
import {
  Package,
  Box,
  Layers,
  Cpu,
  Smartphone,
  BatteryCharging,
  Sliders,
  ShieldCheck,
  Shield,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { AnimatedScreenGraphic } from './AnimatedScreenGraphic';

interface ProductBoxGraphicProps {
  product?: Partial<Product>;
  name?: string;
  brand?: string;
  category?: ProductCategory | string;
  sku?: string;
  condition?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProductBoxGraphic: React.FC<ProductBoxGraphicProps> = ({
  product,
  name: propName,
  brand: propBrand,
  category: propCategory,
  sku: propSku,
  condition: propCondition,
  size = 'md',
  className = '',
}) => {
  const name = propName || product?.name || 'Component Spare Part';
  const brand = propBrand || product?.brand || 'Universal';
  const category = (propCategory || product?.category || 'screens') as string;
  const sku = propSku || product?.sku || 'CHK-PART-GEN';
  const condition = propCondition || product?.condition || 'Original Service Pack';

  // If this is a screen/display component, use the high-tech AnimatedScreenGraphic!
  const isScreen =
    category === 'screens' ||
    name.toLowerCase().includes('screen') ||
    name.toLowerCase().includes('oled') ||
    name.toLowerCase().includes('display') ||
    name.toLowerCase().includes('amoled') ||
    name.toLowerCase().includes('incell') ||
    name.toLowerCase().includes('lcd');

  if (isScreen) {
    return (
      <AnimatedScreenGraphic
        product={product}
        name={name}
        brand={brand}
        sku={sku}
        condition={condition}
        size={size}
        className={className}
      />
    );
  }

  // Determine category color scheme and icon
  const getCategoryDetails = () => {
    switch (category) {
      case 'screens':
        return {
          icon: Smartphone,
          label: 'DISPLAY PANEL',
          accent: 'from-orange-500/20 to-amber-600/20 border-orange-500/40 text-orange-400',
          badgeBg: 'bg-orange-500/20 text-amber-300 border-orange-500/30',
          sealColor: 'border-orange-400 text-amber-300',
        };
      case 'batteries':
        return {
          icon: BatteryCharging,
          label: 'BATTERY CELL',
          accent: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/40 text-emerald-400',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          sealColor: 'border-emerald-400 text-emerald-300',
        };
      case 'charging-flex':
        return {
          icon: Cpu,
          label: 'CHARGING SUB-BOARD',
          accent: 'from-amber-500/20 to-orange-600/20 border-amber-500/40 text-amber-400',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          sealColor: 'border-amber-400 text-amber-300',
        };
      case 'calibrators':
        return {
          icon: Sliders,
          label: 'CALIBRATOR TOOL',
          accent: 'from-orange-600/20 to-amber-500/20 border-orange-500/40 text-amber-400',
          badgeBg: 'bg-orange-500/20 text-amber-300 border-orange-500/30',
          sealColor: 'border-amber-400 text-amber-300',
        };
      default:
        return {
          icon: Package,
          label: 'GENUINE COMPONENT',
          accent: 'from-stone-700/30 to-stone-800/30 border-stone-600/40 text-stone-300',
          badgeBg: 'bg-stone-700/30 text-stone-300 border-stone-600/30',
          sealColor: 'border-stone-400 text-stone-300',
        };
    }
  };

  const { icon: CategoryIcon, label, accent, badgeBg, sealColor } = getCategoryDetails();

  // Extra-Small: Used in tables, admin rows, AI chat, receipts (32px - 36px)
  if (size === 'xs') {
    return (
      <div
        className={`relative flex items-center justify-center rounded-lg border border-stone-700/80 bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 p-1 text-stone-300 shadow-sm print:bg-white print:border-slate-300 ${className}`}
        title={`${brand} Box: ${name}`}
      >
        <Box className="h-4 w-4 text-amber-400 print:text-slate-800" />
        <span className="sr-only">Box: {name}</span>
      </div>
    );
  }

  // Small: Used in Cart items & My Alerts list (56px - 64px)
  if (size === 'sm') {
    return (
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border border-stone-700/80 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 p-2 shadow-inner overflow-hidden print:bg-white print:border-slate-300 ${className}`}
        title={`${brand} Component Box`}
      >
        {/* Subtle top box flap highlight */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
        
        <Box className="h-6 w-6 text-orange-400 mb-0.5 print:text-slate-800" />
        <span className="text-[9px] font-bold tracking-wider text-stone-300 uppercase truncate max-w-full print:text-slate-700">
          {brand}
        </span>
        <span className="text-[7px] text-amber-400 font-mono tracking-tighter truncate max-w-full">
          BOX
        </span>
      </div>
    );
  }

  // Medium: Product Card Aspect (Standard 4/3 card view)
  if (size === 'md') {
    return (
      <div
        className={`relative flex flex-col items-center justify-between rounded-xl border border-stone-700/90 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 p-4 shadow-xl overflow-hidden select-none group-hover:border-orange-500/50 transition-colors ${className}`}
      >
        {/* Background circuit/grid box texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#44403c_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

        {/* Top Tamper-Evident Tape / Security Seal */}
        <div className="w-full relative z-10 flex items-center justify-between border-b border-stone-800/80 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-extrabold tracking-widest text-stone-300 uppercase">
              {brand} GENUINE BOX
            </span>
          </div>
          <span className="rounded bg-stone-800/90 border border-stone-700 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-stone-400">
            {sku}
          </span>
        </div>

        {/* 3D Component Box Centerpiece */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center py-2 text-center">
          {/* Isometric Package Box Visual Container */}
          <div className="relative flex items-center justify-center">
            {/* Outer Box Glow */}
            <div className="absolute -inset-2 rounded-2xl bg-orange-500/10 blur-xl pointer-events-none" />

            {/* Packaging Box Graphic Base */}
            <div className="relative flex h-24 w-28 flex-col items-center justify-center rounded-xl border-2 border-stone-600 bg-gradient-to-b from-stone-850 via-stone-900 to-stone-950 shadow-2xl">
              {/* Box Tape / Ribbon */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 bg-stone-800/90 border-y border-stone-700 flex items-center justify-center">
                <span className="text-[7px] font-mono tracking-widest text-amber-400 uppercase">
                  SEALED ★ CHUKS
                </span>
              </div>

              {/* Box Top Flap Crease */}
              <div className="absolute top-1 inset-x-2 h-0.5 bg-stone-700/60" />

              {/* Center Category Icon */}
              <div className="relative z-10 mb-2 mt-1 rounded-lg bg-stone-900/90 p-2 border border-stone-700 shadow-md">
                <CategoryIcon className="h-7 w-7 text-amber-400" />
              </div>

              {/* Box Label */}
              <span className="relative z-10 text-[9px] font-bold tracking-tight text-white line-clamp-1 px-1">
                {label}
              </span>
            </div>
          </div>

          {/* Condition Stamp */}
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-stone-700 bg-stone-900/90 px-2 py-0.5 text-[10px] font-medium text-stone-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              {condition}
            </span>
          </div>
        </div>

        {/* Bottom Barcode & Workshop Verification Strip */}
        <div className="w-full relative z-10 flex items-center justify-between border-t border-stone-800/80 pt-2 text-[9px] text-stone-400 font-mono">
          <div className="flex items-center gap-1">
            <span className="tracking-tighter font-serif text-[11px] text-stone-300 select-none">
              ||| | |||| | ||| ||
            </span>
            <span className="text-[8px] text-stone-400">QC PASSED</span>
          </div>
          <span className="text-[9px] text-amber-400 font-semibold tracking-wide">
            CHUKS SPARE PARTS
          </span>
        </div>
      </div>
    );
  }

  // Large: Product Detail Modal Showcase Box (High fidelity carton graphic)
  return (
    <div
      className={`relative flex flex-col items-center justify-between rounded-2xl border-2 border-stone-700 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 p-6 shadow-2xl overflow-hidden select-none ${className}`}
    >
      {/* Background blueprint grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#44403c_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-30 pointer-events-none" />

      {/* Security Tape Across Top */}
      <div className="w-full relative z-10 flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide uppercase">
              {brand} OEM FACTORY BOX
            </h4>
            <p className="text-[10px] text-stone-400">Park Road Gwagwalada Abuja Workshop Stock</p>
          </div>
        </div>
        <div className="text-right">
          <span className="rounded bg-stone-800 px-2.5 py-1 text-xs font-mono font-bold text-amber-400 border border-stone-700">
            {sku}
          </span>
        </div>
      </div>

      {/* Central 3D Box Illustration */}
      <div className="relative z-10 my-6 flex flex-col items-center justify-center">
        {/* Ambient Back Glow */}
        <div className="absolute -inset-4 rounded-3xl bg-orange-500/15 blur-2xl pointer-events-none" />

        {/* Master Packaging Box */}
        <div className="relative flex h-36 w-44 flex-col items-center justify-center rounded-2xl border-2 border-stone-600 bg-gradient-to-b from-stone-800 via-stone-900 to-black p-4 shadow-2xl">
          {/* Tamper Seal Banner */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-orange-950/90 border-y border-orange-500/50 py-1 flex items-center justify-center">
            <span className="text-[8px] font-mono tracking-widest text-amber-300 font-bold uppercase">
              ★ FACTORY SEALED COMPONENT ★
            </span>
          </div>

          {/* ESD / Static Warning Triangle */}
          <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[8px] font-bold text-amber-300">
            <Zap className="h-2.5 w-2.5" /> ESD SAFE
          </div>

          {/* Central Category Hardware Icon */}
          <div className="relative z-10 mt-1 mb-2 rounded-xl bg-stone-900/90 p-3 border border-stone-700 shadow-xl">
            <CategoryIcon className="h-10 w-10 text-orange-400" />
          </div>

          {/* Component Classification */}
          <span className="relative z-10 text-xs font-extrabold text-white tracking-wide uppercase mt-1">
            {label}
          </span>
          <span className="relative z-10 text-[9px] font-medium text-stone-400 mt-0.5">
            {brand} Genuine Hardware
          </span>
        </div>

        {/* Quality Seal Pill */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            {condition}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 text-xs font-semibold text-amber-400">
            <Shield className="h-3.5 w-3.5" />
            Tested & Verified
          </span>
        </div>
      </div>

      {/* Bottom Technical Spec Barcode Bar */}
      <div className="w-full relative z-10 flex flex-col sm:flex-row sm:items-center justify-between border-t border-stone-800 pt-3 text-[10px] text-stone-400 font-mono gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-serif tracking-tighter text-stone-200 select-none">
            ||||| || |||| ||||| ||| ||||
          </span>
          <span className="text-[9px] text-stone-400">BATCH: CHK-{new Date().getFullYear()}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-semibold text-amber-400">
            CHUKS COMMUNICATION • PARK ROAD GWAGWALADA
          </span>
        </div>
      </div>
    </div>
  );
};
