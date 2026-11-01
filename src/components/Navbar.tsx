import React, { useState, useEffect } from 'react';
import {
  Download,
  ShoppingCart,
  Bell,
  Search,
  Package,
  Clock,
  Sun,
  Moon,
  PhoneCall,
  MessageCircle,
  BookOpen,
  Menu,
  X,
  MapPin,
  ExternalLink,
  BellRing,
  FileText,
  Smartphone,
  QrCode,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Layers,
} from 'lucide-react';
import { ProductCategory, ProductBrand } from '../types';

interface NavbarProps {
  onOpenPWA: () => void;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  onOpenLedger: () => void;
  onOpenAlerts: () => void;
  onOpenScreenGuide?: () => void;
  onOpenQuoteBuilder?: () => void;
  onOpenInvoice?: () => void;
  cartCount: number;
  wishlistCount: number;
  alertsCount: number;
  unreadNotificationsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: ProductCategory | 'all';
  onCategoryChange: (cat: ProductCategory | 'all') => void;
  selectedBrand: ProductBrand | 'all';
  onBrandChange: (brand: ProductBrand | 'all') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenPWA,
  onOpenCart,
  onOpenNotifications,
  onOpenAdmin,
  onOpenOrders,
  onOpenLedger,
  onOpenAlerts,
  onOpenScreenGuide,
  onOpenQuoteBuilder,
  onOpenInvoice,
  cartCount,
  wishlistCount: _wishlistCount,
  alertsCount,
  unreadNotificationsCount,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const categories: { label: string; value: ProductCategory | 'all' }[] = [
    { label: 'All Items', value: 'all' },
    { label: 'LCD Screens', value: 'screens' },
    { label: 'Calibrators', value: 'calibrators' },
    { label: 'Down Boards', value: 'charging-flex' },
    { label: 'Batteries', value: 'batteries' },
    { label: 'Accessories', value: 'accessories' },
    { label: 'Repair Tools', value: 'tools' },
  ];

  const brands: (ProductBrand | 'all')[] = [
    'all',
    'Samsung',
    'Apple',
    'Tecno',
    'Infinix',
    'Oppo',
    'Vivo',
    'Xiaomi',
    'Google Pixel',
  ];

  const totalBadgeCount = alertsCount + unreadNotificationsCount;

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full max-w-full border-b transition-colors duration-200 backdrop-blur-md ${
          isDarkMode
            ? 'border-stone-850 bg-stone-950/95 text-stone-100'
            : 'border-slate-200/90 bg-white/95 text-slate-800 shadow-xs'
        }`}
      >
        {/* Subtle Top Info Strip */}
        <div
          className={`border-b px-3 py-1 text-[11px] transition-colors ${
            isDarkMode
              ? 'bg-stone-900/60 border-stone-850 text-stone-300'
              : 'bg-slate-100/90 border-slate-200/80 text-slate-600'
          }`}
        >
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3 w-3 text-orange-500 shrink-0" />
              <span className={`font-medium truncate ${isDarkMode ? 'text-stone-200' : 'text-slate-800'}`}>
                Park Road, Gwagwalada, Abuja
              </span>
              <span className={isDarkMode ? 'text-stone-600' : 'text-slate-300'}>•</span>
              <span className={`hidden sm:inline truncate ${isDarkMode ? 'text-amber-400/90' : 'text-orange-600 font-semibold'}`}>
                Screens, Calibrators & Down Boards
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="tel:07039564380"
                className={`inline-flex items-center gap-1 font-semibold transition ${
                  isDarkMode ? 'text-stone-300 hover:text-amber-300' : 'text-slate-600 hover:text-orange-600'
                }`}
                title="Call 07039564380"
              >
                <PhoneCall className="h-3 w-3 text-orange-500" />
                <span>07039564380</span>
              </a>
              <span className={isDarkMode ? 'text-stone-700' : 'text-slate-300'}>•</span>
              <a
                href="https://wa.me/2347039564380?text=Hello%20Chuks%20Communication%2C%20I%20am%20inquiring%20about%20phone%20parts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-500 transition"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="h-3 w-3" />
                <span className="hidden xs:inline">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Streamlined Main Header Bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 sm:px-6">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
            onClick={() => {
              onCategoryChange('all');
              onSearchChange('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div
              className={`relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl p-1 transition shadow-xs ${
                isDarkMode
                  ? 'bg-stone-900 border border-orange-500/40 hover:border-orange-400'
                  : 'bg-white border border-orange-300/90 hover:border-orange-500 shadow-orange-500/10'
              }`}
            >
              <img src="/icon.svg" alt="Chuks Communication Logo" className="h-full w-full object-contain" />
              <span
                className={`absolute -bottom-0.5 -right-0.5 flex h-2 w-2 items-center justify-center rounded-full bg-emerald-500 border ${
                  isDarkMode ? 'border-stone-950' : 'border-white'
                }`}
              />
            </div>
            <div>
              <h1
                className={`text-sm sm:text-base font-black tracking-tight uppercase leading-none ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                CHUKS COMMUNICATION
              </h1>
              <p
                className={`text-[10px] sm:text-[11px] leading-tight mt-0.5 ${
                  isDarkMode ? 'text-amber-400/90 font-medium' : 'text-orange-600 font-semibold'
                }`}
              >
                Screens, Calibrators & Down Boards
              </p>
            </div>
          </div>

          {/* Desktop Search Bar with Smooth Expanding Transition Animation */}
          <div
            className={`group relative hidden md:flex items-center transition-all duration-300 ease-out mx-2 ${
              searchQuery
                ? 'flex-1 max-w-md lg:max-w-lg'
                : 'w-48 lg:w-64 focus-within:w-full focus-within:max-w-md lg:focus-within:max-w-lg focus-within:flex-1'
            }`}
          >
            <Search
              className={`pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 transition-colors duration-200 ${
                isDarkMode
                  ? 'text-stone-400 group-focus-within:text-orange-400'
                  : 'text-slate-400 group-focus-within:text-orange-500'
              }`}
            />
            <input
              id="desktop-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search screens, calibrators, down boards, repair tools..."
              className={`w-full rounded-xl border py-2 pl-10 pr-8 text-xs transition-all duration-300 ease-out focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/25 ${
                isDarkMode
                  ? 'border-stone-800 bg-stone-900/80 text-white placeholder-stone-400 focus:bg-stone-900 shadow-md shadow-orange-500/5'
                  : 'border-slate-200 bg-slate-100/90 text-slate-900 placeholder-slate-400 focus:bg-white shadow-2xs'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className={`absolute right-2.5 top-2 p-0.5 rounded-lg transition ${
                  isDarkMode
                    ? 'text-stone-400 hover:text-white hover:bg-stone-800'
                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Clear search query"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Clean Action Controls: Only Cart + The Menu Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Dark/Light Toggle */}
            <button
              onClick={onToggleDarkMode}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition active:scale-95 ${
                isDarkMode
                  ? 'border-stone-800 bg-stone-900 text-amber-400 hover:bg-stone-800'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-2xs'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Cart Button */}
            <button
              id="nav-cart-btn"
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 px-3 py-2 text-xs font-bold text-stone-950 shadow-md shadow-orange-500/20 active:scale-95 transition"
              title="View Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-stone-950 px-1 text-[11px] font-black text-amber-300">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Menu Button */}
            <button
              id="main-nav-menu-toggle-btn"
              onClick={() => setIsMenuOpen(true)}
              className={`relative flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold active:scale-95 transition ${
                isDarkMode
                  ? 'border-stone-750 bg-stone-900 text-stone-100 hover:border-orange-500/50 hover:bg-stone-850'
                  : 'border-slate-200 bg-slate-100 text-slate-800 hover:border-orange-300 hover:bg-slate-200 shadow-2xs'
              }`}
              title="Open Navigation Menu & Tools"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-semibold">Menu</span>
              {totalBadgeCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-black text-stone-950">
                  {totalBadgeCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Only shown on small screens) */}
        <div className={`px-3 pb-2 md:hidden ${isDarkMode ? 'bg-stone-950' : 'bg-white border-b border-slate-100'}`}>
          <div className="group relative w-full transition-all duration-300 ease-out">
            <Search
              className={`pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 transition-colors duration-200 ${
                isDarkMode ? 'text-stone-400 group-focus-within:text-orange-400' : 'text-slate-400 group-focus-within:text-orange-500'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search screens, calibrators, down boards, models..."
              className={`w-full rounded-xl border py-1.5 pl-8 pr-7 text-xs transition-all duration-300 ease-out focus:border-orange-500/80 focus:outline-none focus:ring-2 focus:ring-orange-500/25 ${
                isDarkMode
                  ? 'border-stone-800 bg-stone-900/80 text-white placeholder-stone-400 focus:bg-stone-900'
                  : 'border-slate-200 bg-slate-100 text-slate-900 placeholder-slate-400 focus:bg-white'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className={`absolute right-2.5 top-2 ${isDarkMode ? 'text-stone-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Filter Bar */}
        <div
          className={`border-t px-3 py-1.5 sm:px-6 transition-colors ${
            isDarkMode ? 'border-stone-900/80 bg-stone-950/80' : 'border-slate-100 bg-slate-50/90'
          }`}
        >
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => onCategoryChange(cat.value)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat.value
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 font-bold shadow-xs'
                      : isDarkMode
                      ? 'bg-stone-900/60 border border-stone-850 text-stone-300 hover:bg-stone-800 hover:text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Brand Filter Pills */}
            <div
              className={`hidden lg:flex items-center gap-1.5 border-l pl-3 shrink-0 ${
                isDarkMode ? 'border-stone-800' : 'border-slate-200'
              }`}
            >
              <span className={`text-[10px] font-semibold uppercase ${isDarkMode ? 'text-stone-500' : 'text-slate-400'}`}>
                Brands:
              </span>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => onBrandChange(b)}
                  className={`rounded-lg px-2 py-0.5 text-[11px] font-medium transition ${
                    selectedBrand === b
                      ? isDarkMode
                        ? 'bg-orange-500/20 text-amber-300 border border-orange-500/40 font-bold'
                        : 'bg-orange-100 text-orange-700 border border-orange-300 font-bold'
                      : isDarkMode
                      ? 'text-stone-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b === 'all' ? 'All' : b}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* FULL-FEATURED SLIDE-OVER MENU DRAWER */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop Click */}
          <div
            className="fixed inset-0"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div
            className={`relative z-10 flex h-full w-full max-w-md flex-col border-l shadow-2xl overflow-hidden animate-in slide-in-from-right duration-250 ${
              isDarkMode
                ? 'border-stone-800 bg-stone-950 text-stone-100'
                : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            {/* Drawer Header */}
            <div
              className={`flex items-center justify-between border-b px-5 py-4 ${
                isDarkMode ? 'border-stone-850 bg-stone-900/90' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl p-1 ${
                    isDarkMode
                      ? 'bg-stone-950 border border-orange-500/40 text-orange-400'
                      : 'bg-white border border-orange-300 text-orange-600 shadow-xs'
                  }`}
                >
                  <img src="/icon.svg" alt="Chuks Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <h2
                    className={`text-sm font-black uppercase tracking-tight ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Store & Workshop Menu
                  </h2>
                  <p
                    className={`text-[11px] font-medium ${
                      isDarkMode ? 'text-amber-400' : 'text-orange-600'
                    }`}
                  >
                    Chuks Communication • Gwagwalada, Abuja
                  </p>
                </div>
              </div>

              <button
                id="menu-close-btn"
                onClick={() => setIsMenuOpen(false)}
                className={`rounded-xl p-2 transition ${
                  isDarkMode
                    ? 'text-stone-400 hover:bg-stone-800 hover:text-white'
                    : 'text-slate-400 hover:bg-slate-200 hover:text-slate-800'
                }`}
                title="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
              {/* Section 1: Workshop & Technician Tools */}
              <div>
                <div
                  className={`flex items-center gap-1.5 mb-2.5 px-1 text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'text-amber-400' : 'text-orange-600'
                  }`}
                >
                  <Wrench className="h-3.5 w-3.5 text-orange-500" />
                  <span>Workshop & Technician Tools</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {onOpenInvoice && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenInvoice();
                      }}
                      className={`group flex items-center justify-between rounded-xl border p-3 text-left transition ${
                        isDarkMode
                          ? 'border-orange-500/35 bg-gradient-to-r from-orange-950/30 to-stone-900 hover:border-orange-500/60 hover:from-orange-950/40'
                          : 'border-orange-200 bg-orange-50/50 hover:bg-orange-100/60 hover:border-orange-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                            isDarkMode
                              ? 'bg-orange-500/20 border-orange-500/40 text-amber-400'
                              : 'bg-white border-orange-200 text-orange-600 shadow-2xs'
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isDarkMode
                                ? 'text-white group-hover:text-amber-300'
                                : 'text-slate-900 group-hover:text-orange-600'
                            }`}
                          >
                            Shop Invoice & Calculator
                          </p>
                          <p className={`text-[11px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
                            Chuks-Ogo Sam bill receipts, totals & printing
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 transition group-hover:translate-x-0.5 ${
                          isDarkMode
                            ? 'text-stone-400 group-hover:text-amber-400'
                            : 'text-slate-400 group-hover:text-orange-600'
                        }`}
                      />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenLedger();
                    }}
                    className={`group flex items-center justify-between rounded-xl border p-3 text-left transition ${
                      isDarkMode
                        ? 'border-stone-800 bg-stone-900/80 hover:border-orange-500/40 hover:bg-stone-850'
                        : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isDarkMode ? 'bg-stone-800 text-orange-400' : 'bg-slate-100 text-orange-600'
                        }`}
                      >
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            isDarkMode
                              ? 'text-white group-hover:text-amber-300'
                              : 'text-slate-900 group-hover:text-orange-600'
                          }`}
                        >
                          Price & Pinout Ledger
                        </p>
                        <p className={`text-[11px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
                          Transsion cross-codes, iPhone grades & wholesale lists
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transition group-hover:translate-x-0.5 ${
                        isDarkMode
                          ? 'text-stone-400 group-hover:text-amber-400'
                          : 'text-slate-400 group-hover:text-orange-600'
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('chuks_open_qr_scanner'));
                      document.getElementById('technician-quick-tool')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`group flex items-center justify-between rounded-xl border p-3 text-left transition ${
                      isDarkMode
                        ? 'border-stone-800 bg-stone-900/80 hover:border-orange-500/40 hover:bg-stone-850'
                        : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isDarkMode ? 'bg-stone-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        <QrCode className="h-4 w-4" />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold ${
                            isDarkMode
                              ? 'text-white group-hover:text-amber-300'
                              : 'text-slate-900 group-hover:text-orange-600'
                          }`}
                        >
                          Scan Part QR Code
                        </p>
                        <p className={`text-[11px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
                          Camera scanner & barcode stock lookup
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transition group-hover:translate-x-0.5 ${
                        isDarkMode
                          ? 'text-stone-400 group-hover:text-amber-400'
                          : 'text-slate-400 group-hover:text-orange-600'
                      }`}
                    />
                  </button>

                  {onOpenScreenGuide && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenScreenGuide();
                      }}
                      className={`group flex items-center justify-between rounded-xl border p-3 text-left transition ${
                        isDarkMode
                          ? 'border-stone-800 bg-stone-900/80 hover:border-orange-500/40 hover:bg-stone-850'
                          : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isDarkMode ? 'bg-stone-800 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
                          }`}
                        >
                          <Smartphone className="h-4 w-4" />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isDarkMode
                                ? 'text-white group-hover:text-amber-300'
                                : 'text-slate-900 group-hover:text-orange-600'
                            }`}
                          >
                            Screen Grade Guide
                          </p>
                          <p className={`text-[11px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
                            InCell vs JK vs GX vs OLED comparison
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 transition group-hover:translate-x-0.5 ${
                          isDarkMode
                            ? 'text-stone-400 group-hover:text-amber-400'
                            : 'text-slate-400 group-hover:text-orange-600'
                        }`}
                      />
                    </button>
                  )}

                  {onOpenQuoteBuilder && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenQuoteBuilder();
                      }}
                      className={`group flex items-center justify-between rounded-xl border p-3 text-left transition ${
                        isDarkMode
                          ? 'border-stone-800 bg-stone-900/80 hover:border-orange-500/40 hover:bg-stone-850'
                          : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isDarkMode ? 'bg-stone-800 text-purple-400' : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isDarkMode
                                ? 'text-white group-hover:text-amber-300'
                                : 'text-slate-900 group-hover:text-orange-600'
                            }`}
                          >
                            Repair Quote Builder
                          </p>
                          <p className={`text-[11px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
                            Create repair cost estimates for customers
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 transition group-hover:translate-x-0.5 ${
                          isDarkMode
                            ? 'text-stone-400 group-hover:text-amber-400'
                            : 'text-slate-400 group-hover:text-orange-600'
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Section 2: Customer & Orders */}
              <div>
                <div
                  className={`flex items-center gap-1.5 mb-2.5 px-1 text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'text-amber-400' : 'text-orange-600'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                  <span>Orders, Alerts & Downloads</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenOrders();
                    }}
                    className={`flex flex-col rounded-xl border p-3 text-left transition ${
                      isDarkMode
                        ? 'border-stone-800 bg-stone-900/70 hover:border-orange-500/40'
                        : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-white shadow-2xs'
                    }`}
                  >
                    <Clock className="h-5 w-5 text-orange-500 mb-1.5" />
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Orders</span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
                      Receipts & Tracking
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenAlerts();
                    }}
                    className={`flex flex-col rounded-xl border p-3 text-left transition relative ${
                      isDarkMode
                        ? 'border-stone-800 bg-stone-900/70 hover:border-orange-500/40'
                        : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-white shadow-2xs'
                    }`}
                  >
                    <BellRing className="h-5 w-5 text-amber-500 mb-1.5" />
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Price Alerts</span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
                      {alertsCount > 0 ? `${alertsCount} active tracked` : 'Track price drops'}
                    </span>
                    {alertsCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold text-slate-950">
                        {alertsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenNotifications();
                    }}
                    className={`flex flex-col rounded-xl border p-3 text-left transition relative ${
                      isDarkMode
                        ? 'border-stone-800 bg-stone-900/70 hover:border-orange-500/40'
                        : 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-white shadow-2xs'
                    }`}
                  >
                    <Bell className="h-5 w-5 text-amber-500 mb-1.5" />
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Store Updates</span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
                      New arrivals & promos
                    </span>
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenPWA();
                    }}
                    className={`flex flex-col rounded-xl border p-3 text-left transition ${
                      isDarkMode
                        ? 'border-stone-800 bg-gradient-to-br from-orange-950/40 to-stone-900 hover:border-orange-500/50'
                        : 'border-orange-200 bg-orange-50/70 hover:bg-orange-100 hover:border-orange-300 shadow-2xs'
                    }`}
                  >
                    <Download className="h-5 w-5 text-orange-500 mb-1.5" />
                    <span className={`font-bold ${isDarkMode ? 'text-amber-300' : 'text-orange-700'}`}>Install App</span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
                      Offline PWA on Home Screen
                    </span>
                  </button>
                </div>
              </div>

              {/* Section 3: Admin & Management */}
              <div>
                <div
                  className={`flex items-center gap-1.5 mb-2.5 px-1 text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'text-amber-400' : 'text-orange-600'
                  }`}
                >
                  <Package className="h-3.5 w-3.5 text-orange-500" />
                  <span>Store Administration</span>
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition ${
                    isDarkMode
                      ? 'border-stone-800 bg-stone-900/80 hover:border-orange-500/40'
                      : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        isDarkMode ? 'bg-stone-800 text-orange-400' : 'bg-orange-50 text-orange-600'
                      }`}
                    >
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Admin Management Portal
                      </p>
                      <p className={`text-[10px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
                        Owner authentication • Stock, pricing & broadcasts
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 ${isDarkMode ? 'text-stone-400' : 'text-slate-400'}`} />
                </button>
              </div>

              {/* Section 4: Store Information & Quick Support */}
              <div
                className={`rounded-2xl border p-3.5 space-y-2.5 transition ${
                  isDarkMode ? 'border-stone-800/80 bg-stone-900/60' : 'border-slate-200 bg-slate-50 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <p className={`font-bold text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Chuks Communication
                    </p>
                    <p className={`text-[11px] ${isDarkMode ? 'text-stone-300' : 'text-slate-600'}`}>
                      Park Road, Gwagwalada, Abuja
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-amber-400' : 'text-orange-600 font-medium'}`}>
                      Screens, Calibrators & Down Boards • Fast Nationwide Dispatch
                    </p>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-2 pt-1 border-t ${isDarkMode ? 'border-stone-800' : 'border-slate-200'}`}>
                  <a
                    href="tel:07039564380"
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      isDarkMode
                        ? 'bg-stone-800 hover:bg-stone-750 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-orange-500" />
                    <span>Call Store</span>
                  </a>

                  <a
                    href="https://wa.me/2347039564380?text=Hello%20Chuks%20Communication%20Admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 text-xs font-semibold shadow-xs transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div
              className={`border-t px-5 py-3 flex items-center justify-between text-xs transition ${
                isDarkMode ? 'border-stone-850 bg-stone-900/90 text-stone-300' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <button
                onClick={onToggleDarkMode}
                className={`flex items-center gap-2 font-medium transition ${
                  isDarkMode ? 'text-stone-300 hover:text-white' : 'text-slate-700 hover:text-orange-600'
                }`}
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-orange-500" />}
                <span>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>

              <span className={`text-[11px] ${isDarkMode ? 'text-stone-500' : 'text-slate-400'}`}>
                v2.4 • Chuks Store
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
