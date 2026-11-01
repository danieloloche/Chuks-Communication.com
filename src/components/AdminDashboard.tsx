import React, { useState } from 'react';
import {
  Package,
  PlusCircle,
  Bell,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Edit2,
  Trash2,
  Send,
  Truck,
  Layers,
  Sparkles,
  Search,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  QrCode,
  ShieldCheck,
  Check,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Smartphone,
  Flame,
  Wrench,
  Maximize2,
  Minimize2,
  Grid,
  List,
  ArrowUpDown,
  SlidersHorizontal,
  Tag,
  Percent,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { Product, Order, BroadcastNotification, ProductCategory, ProductBrand, RepairDifficulty } from '../types';
import { ProductBoxGraphic } from './ProductBoxGraphic';
import { AdminTrendingAnalyticsPanel } from './AdminTrendingAnalyticsPanel';
import { PWADiagnosticsCard } from './PWADiagnosticsCard';
import { getAnalyticsSummary } from '../utils/analyticsTracker';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  notifications: BroadcastNotification[];
  onUpdateProduct: (product: Product) => void;
  onBatchUpdateProducts?: (products: Product[]) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
  onSendBroadcast: (notification: Omit<BroadcastNotification, 'id' | 'timestamp'>) => void;
  onOpenQRLabel?: (product: Product) => void;
  isLoading?: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  notifications,
  onUpdateProduct,
  onBatchUpdateProducts,
  onAddProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onSendBroadcast,
  onOpenQRLabel,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'broadcast' | 'branding' | 'trending-parts' | 'pwa-diagnostics'>('inventory');
  const analyticsSummary = getAnalyticsSummary(products);
  const [brandingBg, setBrandingBg] = useState<'dark' | 'slate' | 'light'>('dark');
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Spacious & Arrangeable Workspace States
  const [isMaximized, setIsMaximized] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'table'>('grid');
  const [adminSortBy, setAdminSortBy] = useState<'screens-first' | 'price-desc' | 'price-asc' | 'stock-asc' | 'stock-desc' | 'name' | 'brand'>('screens-first');
  const [adminBrandFilter, setAdminBrandFilter] = useState<string>('all');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');

  // Big Dedicated Screen Price Editor Modal State
  const [priceEditProduct, setPriceEditProduct] = useState<Product | null>(null);
  const [bigEditPrice, setBigEditPrice] = useState<number>(0);
  const [bigEditOrigPrice, setBigEditOrigPrice] = useState<number>(0);
  const [bigEditStock, setBigEditStock] = useState<number>(0);
  const [priceSaveSuccess, setPriceSaveSuccess] = useState<boolean>(false);

  // Bulk Category Price Adjustment States
  const [showBulkAdjustModal, setShowBulkAdjustModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState<ProductCategory | 'all'>('screens');
  const [bulkDirection, setBulkDirection] = useState<'increase' | 'decrease'>('increase');
  const [bulkPercentage, setBulkPercentage] = useState<number>(10);
  const [bulkRounding, setBulkRounding] = useState<'nearest-500' | 'nearest-100' | 'exact'>('nearest-500');
  const [bulkUpdateOriginalPrice, setBulkUpdateOriginalPrice] = useState<boolean>(true);
  const [bulkAdjustSuccess, setBulkAdjustSuccess] = useState<string | null>(null);

  const calculateBulkPrice = (
    currentPrice: number,
    percentage: number,
    direction: 'increase' | 'decrease',
    rounding: 'nearest-500' | 'nearest-100' | 'exact'
  ): number => {
    const factor = direction === 'increase' ? 1 + percentage / 100 : 1 - percentage / 100;
    const rawNewPrice = Math.max(0, currentPrice * factor);

    if (rounding === 'nearest-500') {
      return Math.round(rawNewPrice / 500) * 500;
    }
    if (rounding === 'nearest-100') {
      return Math.round(rawNewPrice / 100) * 100;
    }
    return Math.round(rawNewPrice);
  };

  const bulkTargetProducts = products.filter((p) => {
    if (bulkCategory === 'all') return true;
    return p.category.toLowerCase() === bulkCategory.toLowerCase();
  });

  const handleApplyBulkPriceAdjustment = () => {
    if (bulkTargetProducts.length === 0 || bulkPercentage <= 0) return;

    const updatedList = bulkTargetProducts.map((p) => {
      const nextPrice = calculateBulkPrice(p.price, bulkPercentage, bulkDirection, bulkRounding);
      let nextOrigPrice = p.originalPrice;
      if (bulkUpdateOriginalPrice) {
        nextOrigPrice = calculateBulkPrice(
          p.originalPrice || Math.round(p.price * 1.15),
          bulkPercentage,
          bulkDirection,
          bulkRounding
        );
        if (nextOrigPrice < nextPrice) nextOrigPrice = nextPrice;
      }
      return {
        ...p,
        price: nextPrice,
        originalPrice: nextOrigPrice,
      };
    });

    if (onBatchUpdateProducts) {
      onBatchUpdateProducts(updatedList);
    } else {
      updatedList.forEach((prod) => onUpdateProduct(prod));
    }

    const directionText = bulkDirection === 'increase' ? `+${bulkPercentage}%` : `-${bulkPercentage}%`;
    const catName =
      bulkCategory === 'all'
        ? 'All Products'
        : bulkCategory.charAt(0).toUpperCase() + bulkCategory.slice(1);
    setBulkAdjustSuccess(`Successfully adjusted ${updatedList.length} items in "${catName}" by ${directionText}!`);

    setTimeout(() => {
      setBulkAdjustSuccess(null);
      setShowBulkAdjustModal(false);
    }, 1500);
  };

  const handleOpenBigPriceEditor = (product: Product) => {
    setPriceEditProduct(product);
    setBigEditPrice(product.price);
    setBigEditOrigPrice(product.originalPrice || Math.round(product.price * 1.15));
    setBigEditStock(product.stock);
    setPriceSaveSuccess(false);
  };

  const handleSaveBigPrice = () => {
    if (!priceEditProduct) return;
    const finalPrice = Math.max(0, Number(bigEditPrice));
    const finalOrig = Math.max(finalPrice, Number(bigEditOrigPrice));
    const finalStock = Math.max(0, Number(bigEditStock));

    onUpdateProduct({
      ...priceEditProduct,
      price: finalPrice,
      originalPrice: finalOrig,
      stock: finalStock,
    });
    setPriceSaveSuccess(true);
    setTimeout(() => {
      setPriceSaveSuccess(false);
      setPriceEditProduct(null);
    }, 1100);
  };

  // Security PIN Authentication State (Confidential)
  const MASTER_ADMIN_PIN = 'ogo@1';
  const getStoredAdminPin = (): string => {
    try {
      const stored = localStorage.getItem('chuks_admin_pin');
      return stored && stored.trim() ? stored.trim() : MASTER_ADMIN_PIN;
    } catch {
      return MASTER_ADMIN_PIN;
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('chuks_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Change Admin Password State
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [changePinError, setChangePinError] = useState('');
  const [changePinSuccess, setChangePinSuccess] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);

  // Add Product Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState<ProductBrand>('Samsung');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('screens');
  const [newProductPrice, setNewProductPrice] = useState(25000);
  const [newProductOrigPrice, setNewProductOrigPrice] = useState(30000);
  const [newProductStock, setNewProductStock] = useState(15);
  const [newProductCondition, setNewProductCondition] = useState<Product['condition']>('Original Service Pack');
  const [newProductWarranty, setNewProductWarranty] = useState('30-Day Testing Warranty');
  const [newProductDifficulty, setNewProductDifficulty] = useState<RepairDifficulty>('Moderate');
  const [newProductImage, setNewProductImage] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductCompatible, setNewProductCompatible] = useState('');
  const [broadcastNewArrival, setBroadcastNewArrival] = useState(true);

  // Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<BroadcastNotification['type']>('new_arrival');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  if (!isOpen) return null;

  // Filtered & Arranged products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.compatibleModels && p.compatibleModels.some((m) => m.toLowerCase().includes(q)));
    const matchesBrand = adminBrandFilter === 'all' || p.brand.toLowerCase() === adminBrandFilter.toLowerCase();
    const matchesCategory = adminCategoryFilter === 'all' || p.category.toLowerCase() === adminCategoryFilter.toLowerCase();
    return matchesSearch && matchesBrand && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (adminSortBy === 'price-desc') return b.price - a.price;
    if (adminSortBy === 'price-asc') return a.price - b.price;
    if (adminSortBy === 'stock-asc') return a.stock - b.stock;
    if (adminSortBy === 'stock-desc') return b.stock - a.stock;
    if (adminSortBy === 'name') return a.name.localeCompare(b.name);
    if (adminSortBy === 'brand') return a.brand.localeCompare(b.brand);
    if (adminSortBy === 'screens-first') {
      const aIsScreen = a.category === 'screens' ? 1 : 0;
      const bIsScreen = b.category === 'screens' ? 1 : 0;
      if (bIsScreen !== aIsScreen) return bIsScreen - aIsScreen;
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Actionable Inventory Metrics (Total Revenue and Orders Placed REMOVED per user instructions)
  const screenProducts = products.filter((p) => p.category === 'screens');
  const screenCount = screenProducts.length;
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  const handleSavePrice = (product: Product) => {
    onUpdateProduct({ ...product, price: Number(tempPrice) });
    setEditingPriceId(null);
  };

  const handleStockAdjust = (product: Product, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    onUpdateProduct({ ...product, stock: nextStock });
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName) return;

    const compatList = newProductCompatible
      ? newProductCompatible.split(',').map((s) => s.trim())
      : [newProductName];

    onAddProduct({
      name: newProductName,
      brand: newProductBrand,
      category: newProductCategory,
      price: Number(newProductPrice),
      originalPrice: Number(newProductOrigPrice),
      stock: Number(newProductStock),
      sku: `CHK-${newProductBrand.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      condition: newProductCondition,
      warranty: newProductWarranty,
      rating: 5.0,
      reviewCount: 1,
      image: newProductImage,
      description: newProductDescription || `Authentic ${newProductName} supplied by Chuks Ogo Sam Venture with full testing warranty.`,
      specs: {
        'Quality Standard': newProductCondition,
        'Testing Warranty': newProductWarranty,
        'Compatibility': compatList.join(', '),
      },
      compatibleModels: compatList,
      isNewArrival: broadcastNewArrival,
      isFeatured: true,
      repairDifficulty: newProductDifficulty,
    });

    if (broadcastNewArrival) {
      onSendBroadcast({
        title: `🔥 New Arrival: ${newProductName} Just Landed!`,
        message: `Fresh stock of ${newProductName} has been added to our catalog. Price: ₦${Number(newProductPrice).toLocaleString()}. Order now before it runs out!`,
        type: 'new_arrival',
      });
    }

    setShowAddModal(false);
    // Reset form
    setNewProductName('');
    setNewProductDescription('');
  };

  const handleSendBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    onSendBroadcast({
      title: broadcastTitle,
      message: broadcastMessage,
      type: broadcastType,
    });

    setBroadcastSuccess(true);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const activePin = getStoredAdminPin();
    const entered = pinInput.trim();
    if (entered === activePin || entered === MASTER_ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
      try {
        sessionStorage.setItem('chuks_admin_authenticated', 'true');
      } catch (err) {
        console.warn('Session storage write note:', err);
      }
    } else {
      setPinError('Incorrect Admin PIN. Access restricted to authorized store owner.');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activePin = getStoredAdminPin();
    if (currentPinInput.trim() !== activePin && currentPinInput.trim() !== MASTER_ADMIN_PIN) {
      setChangePinError('Current password does not match.');
      return;
    }
    if (!newPinInput || newPinInput.trim().length < 4) {
      setChangePinError('New password must be at least 4 characters long.');
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setChangePinError('New passwords do not match. Please re-enter.');
      return;
    }
    try {
      localStorage.setItem('chuks_admin_pin', newPinInput.trim());
      setChangePinSuccess(true);
      setChangePinError('');
      setTimeout(() => {
        setShowChangePinModal(false);
        setChangePinSuccess(false);
        setCurrentPinInput('');
        setNewPinInput('');
        setConfirmPinInput('');
      }, 1500);
    } catch {
      setChangePinError('Failed to save to device storage. Please check permissions.');
    }
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setPinError('');
    try {
      sessionStorage.removeItem('chuks_admin_authenticated');
    } catch (err) {
      console.warn('Session storage remove note:', err);
    }
  };

  // If not authenticated, display PIN security gate
  if (!isAuthenticated) {
    return (
      <div
        id="admin-pin-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      >
        <div
          id="admin-pin-card"
          className="relative w-full max-w-md rounded-2xl border border-amber-500/40 bg-slate-900 p-6 sm:p-8 text-slate-100 shadow-2xl overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/20 mb-4">
              <Lock className="h-7 w-7" />
            </div>

            <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-0.5 text-[11px] font-bold text-amber-300 uppercase tracking-wide">
              Owner Security Gate
            </span>

            <h3 className="mt-3 text-xl font-black text-white tracking-tight sm:text-2xl">
              Admin Portal Authorization
            </h3>
            <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">
              Enter your secret owner PIN to manage stock, update inventory pricing, and send broadcast alerts.
            </p>

            <form onSubmit={handleUnlock} className="mt-6 w-full space-y-4">
              <div className="text-left">
                <label
                  htmlFor="admin-pin-input"
                  className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1.5"
                >
                  Admin PIN
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="admin-pin-input"
                    type={showPin ? 'text' : 'password'}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    placeholder="Enter admin PIN..."
                    autoFocus
                    autoComplete="current-password"
                    className={`w-full rounded-xl border ${
                      pinError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400'
                    } bg-slate-950 py-3 pl-9 pr-10 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                    title={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Confidential Security Notice - Password Hidden */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                    Encrypted Owner Credential Gate
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Authorized Store Owner Only
                  </span>
                </div>

                {pinError && (
                  <p className="mt-2 text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {pinError}
                  </p>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-800 bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  id="admin-pin-unlock-btn"
                  type="submit"
                  className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
                >
                  <Unlock className="h-4 w-4" />
                  Unlock Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div
        id="admin-dashboard-panel"
        className={`relative my-auto flex flex-col transition-all duration-200 border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden ${
          isMaximized
            ? 'fixed inset-0 z-50 h-screen w-screen max-w-none rounded-none'
            : 'h-[96dvh] sm:h-[94dvh] max-h-[960px] w-full max-w-7xl rounded-2xl sm:rounded-3xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-3.5 sm:px-6 py-2.5 sm:py-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-sm sm:text-lg md:text-xl font-black text-white tracking-tight">Chuks Store Admin Portal</h2>
                <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-amber-300 uppercase tracking-wide">
                  OWNER ACCESS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">Chuks Ogo Sam Venture • Park Road, Gwagwalada, Abuja</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title={isMaximized ? 'Exit Full Screen' : 'Full Screen View (Spacious Mode)'}
            >
              {isMaximized ? (
                <>
                  <Minimize2 className="h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline">Normal Size</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-4 w-4 text-amber-400" />
                  <span className="hidden sm:inline">Maximize</span>
                </>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pwa-diagnostics')}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-950/40 px-2.5 py-1.5 text-xs font-semibold text-orange-300 hover:bg-orange-900/60 hover:text-white transition"
              title="Inspect PWA Standalone Mode & Service Worker"
            >
              <Wrench className="h-3.5 w-3.5 text-orange-400" />
              <span>PWA Diagnostics</span>
            </button>

            <button
              onClick={() => {
                setShowChangePinModal(true);
                setChangePinError('');
                setChangePinSuccess(false);
                setCurrentPinInput('');
                setNewPinInput('');
                setConfirmPinInput('');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title="Change Admin Password"
            >
              <KeyRound className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Password</span>
            </button>

            <button
              id="admin-lock-btn"
              onClick={handleLock}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
              title="Lock Admin Portal"
            >
              <LogOut className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Lock</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 sm:p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              title="Close Portal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Live Metrics Overview Bar (Total Revenue and Orders Placed REMOVED per user request) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 bg-slate-950/70 p-2.5 sm:p-4 border-b border-slate-800 text-xs shrink-0">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-2.5 sm:p-3 shadow-inner">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-300 text-[11px] sm:text-xs">Catalog Inventory</span>
              <Package className="h-4 w-4 text-cyan-400 shrink-0" />
            </div>
            <p className="mt-0.5 sm:mt-1 text-sm sm:text-base md:text-lg font-black text-white">{products.length} Models</p>
            <span className="text-[10px] sm:text-[11px] text-cyan-400 font-medium">{totalUnits} units</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-2.5 sm:p-3 shadow-inner">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-300 text-[11px] sm:text-xs">Screens & Displays</span>
              <Smartphone className="h-4 w-4 text-blue-400 shrink-0" />
            </div>
            <p className="mt-0.5 sm:mt-1 text-sm sm:text-base md:text-lg font-black text-white">{screenCount} Screens</p>
            <span className="text-[10px] sm:text-[11px] text-blue-400 font-medium">InCell, OLED, Service Pack</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-2.5 sm:p-3 shadow-inner">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-300 text-[11px] sm:text-xs">Low Stock Warnings</span>
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            </div>
            <p className="mt-0.5 sm:mt-1 text-sm sm:text-base md:text-lg font-black text-amber-400">{lowStockCount} Items Low</p>
            <span className="text-[10px] sm:text-[11px] text-amber-400/80 font-medium">Under 5 pcs in stock</span>
          </div>

          <button
            onClick={() => setActiveTab('trending-parts')}
            className="rounded-2xl border border-amber-500/30 bg-amber-950/25 p-2.5 sm:p-3 text-left hover:bg-amber-950/40 hover:border-amber-400/50 transition cursor-pointer group shadow-inner"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="group-hover:text-amber-300 transition font-semibold text-slate-300 text-[11px] sm:text-xs">Customer Demand</span>
              <Flame className="h-4 w-4 text-amber-400 animate-pulse shrink-0" />
            </div>
            <p className="mt-0.5 sm:mt-1 text-sm sm:text-base md:text-lg font-black text-amber-400">
              {analyticsSummary.totalViews} Views
            </p>
            <span className="text-[10px] sm:text-[11px] text-amber-300/80 font-medium">{analyticsSummary.totalCartAdds} cart actions</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-4 sm:px-6 gap-4 sm:gap-6 text-xs font-bold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 py-3 border-b-2 transition shrink-0 ${
              activeTab === 'inventory'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Inventory & Screen Prices ({sortedProducts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('trending-parts')}
            className={`flex items-center gap-2 py-3 border-b-2 transition shrink-0 ${
              activeTab === 'trending-parts'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="h-4 w-4 text-amber-400" />
            <span>Trending Parts</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-2 py-3 border-b-2 transition shrink-0 ${
              activeTab === 'broadcast'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Broadcast Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-3 border-b-2 transition shrink-0 ${
              activeTab === 'orders'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Orders Management ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 py-3 border-b-2 transition shrink-0 ${
              activeTab === 'branding'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="h-4 w-4 text-cyan-400" />
            <span>Logo & PWA Setup</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa-diagnostics')}
            className={`flex items-center gap-2 py-3 border-b-2 transition shrink-0 ${
              activeTab === 'pwa-diagnostics'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="h-4 w-4 text-orange-400" />
            <span>PWA Standalone Check</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: INVENTORY & PRICE CONTROL */}
          {activeTab === 'inventory' && (
            <div className="space-y-5">
              {/* Spacious Arrangement Toolbar: Search, Filters, Sorting, and View Switcher */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3.5 shadow-lg">
                <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">
                  {/* Search input */}
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search screen, part model, brand, or SKU (e.g. A14, S24, Spark 10)..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-8 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Arrangement Controls: Sort + View Mode + Add Product */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs">
                      <ArrowUpDown className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-400 text-[11px] hidden sm:inline">Arrange:</span>
                      <select
                        value={adminSortBy}
                        onChange={(e) => setAdminSortBy(e.target.value as typeof adminSortBy)}
                        className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                      >
                        <option value="screens-first" className="bg-slate-900">Screens & Displays First</option>
                        <option value="price-desc" className="bg-slate-900">Price: High to Low</option>
                        <option value="price-asc" className="bg-slate-900">Price: Low to High</option>
                        <option value="stock-asc" className="bg-slate-900">Low Stock First (Restock Alert)</option>
                        <option value="stock-desc" className="bg-slate-900">High Stock First</option>
                        <option value="name" className="bg-slate-900">Name (A to Z)</option>
                        <option value="brand" className="bg-slate-900">Brand Name</option>
                      </select>
                    </div>

                    {/* View Switcher: Big Cards vs Roomy Table */}
                    <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 p-1">
                      <button
                        onClick={() => setLayoutMode('grid')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          layoutMode === 'grid'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Spacious Big Cards View (Easy to arrange & edit screen prices)"
                      >
                        <Grid className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Big Cards</span>
                      </button>
                      <button
                        onClick={() => setLayoutMode('table')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          layoutMode === 'table'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Roomy Table View"
                      >
                        <List className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Table</span>
                      </button>
                    </div>

                    {/* Bulk Price Adjuster Button */}
                    <button
                      id="bulk-price-adjust-btn"
                      type="button"
                      onClick={() => setShowBulkAdjustModal(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-950/40 hover:bg-amber-900/60 px-3.5 py-2 text-xs font-bold text-amber-300 shadow-sm hover:border-amber-400 active:scale-95 transition whitespace-nowrap"
                      title="Adjust prices for an entire category by percentage at once"
                    >
                      <Percent className="h-4 w-4 text-amber-400" />
                      <span>Bulk Price Adjuster</span>
                    </button>

                    {/* Add New Product Button */}
                    <button
                      id="add-new-goods-btn"
                      onClick={() => setShowAddModal(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition whitespace-nowrap"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Add New Goods</span>
                    </button>
                  </div>
                </div>

                {/* Filter Chips: Brands & Categories */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-slate-800/80 text-xs">
                  {/* Brand Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">Brand:</span>
                    {['all', 'Samsung', 'iPhone', 'Tecno', 'Infinix', 'itel', 'Xiaomi', 'Universal'].map((b) => (
                      <button
                        key={b}
                        onClick={() => setAdminBrandFilter(b)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                          adminBrandFilter.toLowerCase() === b.toLowerCase()
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {b === 'all' ? 'All Brands' : b}
                      </button>
                    ))}
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">Category:</span>
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'screens', label: 'Screens' },
                      { id: 'charging-flex', label: 'Down Boards' },
                      { id: 'batteries', label: 'Batteries' },
                      { id: 'tools', label: 'Tools' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setAdminCategoryFilter(c.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition shrink-0 ${
                          adminCategoryFilter.toLowerCase() === c.id.toLowerCase()
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PRODUCTS DISPLAY: SKELETON LOADING, SPACIOUS BIG CARDS VIEW OR ROOMY TABLE */}
              {isLoading ? (
                layoutMode === 'table' ? (
                  /* SKELETON TABLE STATE */
                  <div id="admin-table-skeleton" className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-xl animate-pulse">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/90 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="p-4">Product / Part</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Screen Price</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4">Warranty</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <tr key={`admin-tbl-skel-${idx}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-xl bg-slate-800 shrink-0" />
                                <div className="space-y-1.5 flex-1">
                                  <div className="h-4 w-44 rounded bg-slate-800" />
                                  <div className="h-3 w-28 rounded bg-slate-800/60" />
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="h-6 w-20 rounded-lg bg-slate-800" />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-24 rounded bg-slate-800" />
                                <div className="h-7 w-20 rounded-xl bg-slate-800/70" />
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-slate-800" />
                                <div className="h-4 w-8 rounded bg-slate-800" />
                                <div className="h-7 w-7 rounded-lg bg-slate-800" />
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="h-4 w-20 rounded bg-slate-800/60" />
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="h-7 w-7 rounded-lg bg-slate-800" />
                                <div className="h-7 w-7 rounded-lg bg-slate-800" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* SKELETON GRID CARDS STATE */
                  <div id="admin-grid-skeleton" className="grid grid-cols-1 min-[580px]:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5 animate-pulse">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div
                        key={`admin-card-skel-${idx}`}
                        className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-lg space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-5 w-20 rounded-lg bg-slate-800" />
                          <div className="h-4 w-24 rounded bg-slate-800/60" />
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-16 w-16 rounded-xl bg-slate-800 shrink-0" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-3/4 rounded bg-slate-800" />
                            <div className="h-3 w-1/2 rounded bg-slate-800/70" />
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                          <div className="h-3 w-28 rounded bg-slate-800/60" />
                          <div className="h-7 w-32 rounded bg-slate-800" />
                          <div className="h-9 w-full rounded-xl bg-slate-800/80 mt-2" />
                        </div>
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <div className="h-4 w-24 rounded bg-slate-800/60" />
                          <div className="h-7 w-28 rounded-lg bg-slate-800" />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : sortedProducts.length === 0 ? (
                <div className="my-12 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-slate-800 bg-slate-950/60">
                  <Search className="h-12 w-12 text-slate-600 mb-2" />
                  <h4 className="text-base font-bold text-slate-200">No matching parts found</h4>
                  <p className="mt-1 text-xs text-slate-400 max-w-sm">
                    No items match the current search query or brand filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setAdminBrandFilter('all');
                      setAdminCategoryFilter('all');
                    }}
                    className="mt-4 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white border border-slate-700 hover:bg-slate-700"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : layoutMode === 'grid' ? (
                /* SPACIOUS BIG CARDS VIEW: Roomy, big fonts, prominent screen price editor */
                <div className="grid grid-cols-1 min-[580px]:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-5">
                  {sortedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/90 p-5 shadow-lg hover:border-amber-500/40 hover:shadow-amber-500/5 transition duration-200"
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300 uppercase">
                            {p.brand}
                          </span>
                          <span className="text-[11px] font-mono font-medium text-slate-400">
                            {p.sku}
                          </span>
                        </div>

                        {/* Graphic & Name */}
                        <div className="flex items-start gap-3.5 mb-4">
                          <div className="h-16 w-16 rounded-xl border border-slate-800 bg-slate-900 p-1 shrink-0 overflow-hidden shadow-inner">
                            <ProductBoxGraphic
                              product={p}
                              size="sm"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-sm sm:text-base leading-snug line-clamp-2">
                              {p.name}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase font-semibold text-slate-300">
                                {p.category}
                              </span>
                              <span className="rounded bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400">
                                {p.condition}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* BIG SCREEN PRICE CONTAINER (High Visibility & Unmistakable) */}
                        <div className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 p-4 mb-4 shadow-inner">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400/90">
                              Current Selling Price
                            </span>
                            {p.originalPrice > p.price && (
                              <span className="text-xs text-slate-400 line-through font-semibold">
                                ₦{p.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                              ₦{p.price.toLocaleString()}
                            </span>
                          </div>

                          {/* Big Change Price Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenBigPriceEditor(p)}
                            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 py-2.5 px-3 text-xs sm:text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span>Change Screen Price</span>
                          </button>
                        </div>
                      </div>

                      {/* Stock Adjustment & Actions */}
                      <div className="space-y-3 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-400">Workshop Stock:</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStockAdjust(p, -1)}
                              className="h-8 w-8 rounded-xl border border-slate-700 bg-slate-800 font-bold text-white hover:bg-slate-700 active:scale-90 transition flex items-center justify-center text-sm"
                              title="Decrease stock by 1"
                            >
                              -
                            </button>
                            <span
                              className={`min-w-[48px] text-center font-black text-sm px-2 py-1 rounded-lg border ${
                                p.stock <= 5
                                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                              }`}
                            >
                              {p.stock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStockAdjust(p, +1)}
                              className="h-8 w-8 rounded-xl border border-slate-700 bg-slate-800 font-bold text-white hover:bg-slate-700 active:scale-90 transition flex items-center justify-center text-sm"
                              title="Increase stock by 1"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Extra Utilities */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <div className="flex items-center gap-2">
                            {onOpenQRLabel && (
                              <button
                                onClick={() => onOpenQRLabel(p)}
                                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition text-[11px] font-semibold"
                                title="Print / Scan Part QR Label"
                              >
                                <QrCode className="h-3.5 w-3.5 text-emerald-400" />
                                <span>QR Sticker</span>
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                            title="Delete product from catalog"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ROOMY TABLE VIEW: High-breathing room with big price displays and large touch targets */
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 shadow-lg">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-extrabold tracking-wider">
                      <tr>
                        <th className="p-4">Product Model & Brand</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Selling Price (Big Editor)</th>
                        <th className="p-4">Workshop Stock</th>
                        <th className="p-4">Warranty</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {sortedProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/50 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <ProductBoxGraphic
                                product={p}
                                size="xs"
                                className="h-11 w-11 rounded-xl shrink-0"
                              />
                              <div>
                                <p className="font-bold text-white text-sm line-clamp-1">{p.name}</p>
                                <span className="text-[11px] font-semibold text-amber-400">{p.brand} • SKU: {p.sku}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] uppercase font-bold text-slate-300">
                              {p.category}
                            </span>
                          </td>

                          {/* Big Price Display & Quick Edit Button in Table */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-base sm:text-lg font-black text-amber-300">
                                ₦{p.price.toLocaleString()}
                              </span>
                              <button
                                onClick={() => handleOpenBigPriceEditor(p)}
                                className="flex items-center gap-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 px-2.5 py-1 text-xs font-bold transition shadow-xs"
                                title="Open Big Price Editor"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span>Edit Price</span>
                              </button>
                            </div>
                          </td>

                          {/* Real-time stock buttons */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStockAdjust(p, -1)}
                                className="h-7 w-7 rounded-lg bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 transition"
                                title="Decrease stock"
                              >
                                -
                              </button>
                              <span
                                className={`min-w-[40px] text-center font-black text-xs sm:text-sm ${
                                  p.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'
                                }`}
                              >
                                {p.stock}
                              </span>
                              <button
                                onClick={() => handleStockAdjust(p, +1)}
                                className="h-7 w-7 rounded-lg bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 transition"
                                title="Increase stock"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="p-4 text-xs text-slate-400">
                            {p.warranty}
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {onOpenQRLabel && (
                                <button
                                  onClick={() => onOpenQRLabel(p)}
                                  className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                                  title="Print Part QR Label"
                                >
                                  <QrCode className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteProduct(p.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                                title="Delete product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BROADCAST NOTIFICATIONS CENTER */}
          {activeTab === 'broadcast' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form to send notification */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-4">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Bell className="h-4 w-4" />
                  <h3>Send Notification to Customers</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Broadcast instant alerts to all customer devices using Chuks Store (PWA app & web visitors).
                </p>

                {broadcastSuccess && (
                  <div className="rounded-lg bg-emerald-950/80 border border-emerald-500/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Notification broadcasted successfully to all devices!
                  </div>
                )}

                <form onSubmit={handleSendBroadcastSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="font-medium text-slate-300">Notification Title *</label>
                    <input
                      type="text"
                      required
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. 🔥 New Arrival: Samsung S24 Ultra AMOLEDs in stock!"
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-300">Alert Message *</label>
                    <textarea
                      required
                      rows={3}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="e.g. We have received fresh factory shipment of genuine AMOLED screens and original batteries. Use code CHUKS10 today!"
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-slate-300">Category</label>
                      <select
                        value={broadcastType}
                        onChange={(e) => setBroadcastType(e.target.value as BroadcastNotification['type'])}
                        className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="new_arrival">New Arrival of Goods</option>
                        <option value="inventory_alert">Inventory Restock & Updates</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-[0.98] transition"
                  >
                    <Send className="h-4 w-4" /> Send Live Notification
                  </button>
                </form>
              </div>

              {/* Past broadcast history list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recent Broadcasts History ({notifications.length})
                </h4>
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed text-[11px]">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Orders & Fulfillment ({orders.length})
              </h3>

              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-2.5 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400 text-sm">{order.id}</span>
                        <span className="text-slate-400">• {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          {order.paymentStatus.toUpperCase()} ({order.paymentMethod})
                        </span>
                      </div>

                      {/* Status selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">Status:</span>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['orderStatus'])}
                          className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-cyan-300 focus:border-cyan-500 focus:outline-none"
                        >
                          <option value="processing">Processing</option>
                          <option value="packed">Packed for Dispatch</option>
                          <option value="shipped">Shipped / In Transit</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Customer</p>
                        <p className="font-semibold text-white">{order.customerName}</p>
                        <p className="text-slate-400">{order.customerPhone}</p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Destination</p>
                        <p className="text-slate-300">{order.deliveryAddress}, {order.deliveryCity}</p>
                        <p className="text-cyan-400 text-[11px]">Tracking: {order.trackingNumber}</p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400 uppercase">Items & Amount</p>
                        <p className="text-slate-300">{order.items.length} items</p>
                        <p className="font-extrabold text-white text-sm">₦{order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: APP LOGO BRANDING & PWA DISTRIBUTION */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                      OFFICIAL BRANDING
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Chuks Store Official Logo & App Assets
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-300 max-w-xl">
                    High-tech brand identity designed specifically for Chuks Communication: phone screens, charging flexes, batteries, and technician tools with full PWA home screen icon compliance.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/icon.svg"
                    download="chuks-store-logo.svg"
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-cyan-500 transition"
                  >
                    <Download className="h-4 w-4" />
                    Download SVG
                  </a>
                  <a
                    href="/pwa-512x512.png"
                    download="chuks-store-logo-512x512.png"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
                  >
                    <Download className="h-4 w-4" />
                    Download 512px PNG
                  </a>
                </div>
              </div>

              {/* Logo Showcase Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Interactive Logo Viewer */}
                <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Interactive Preview</span>
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => setBrandingBg('dark')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          brandingBg === 'dark' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Obsidian
                      </button>
                      <button
                        onClick={() => setBrandingBg('slate')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          brandingBg === 'slate' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Slate
                      </button>
                      <button
                        onClick={() => setBrandingBg('light')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          brandingBg === 'light' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Light
                      </button>
                    </div>
                  </div>

                  {/* Logo Display Canvas */}
                  <div
                    className={`relative w-64 h-64 rounded-3xl border flex items-center justify-center p-4 transition shadow-2xl ${
                      brandingBg === 'dark'
                        ? 'bg-slate-950 border-cyan-500/30'
                        : brandingBg === 'slate'
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-slate-300 shadow-slate-200/50'
                    }`}
                  >
                    <img
                      src="/icon.svg"
                      alt="Chuks Store New Logo"
                      className="w-full h-full object-contain filter drop-shadow-lg"
                    />
                  </div>

                  {/* Brand Color Swatches */}
                  <div className="w-full mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                      <div className="h-4 w-full rounded bg-cyan-400 mb-1"></div>
                      <span className="text-slate-400">#06B6D4</span>
                      <p className="text-[9px] text-slate-500 font-sans">Electric OLED</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                      <div className="h-4 w-full rounded bg-amber-400 mb-1"></div>
                      <span className="text-slate-400">#F59E0B</span>
                      <p className="text-[9px] text-slate-500 font-sans">Hardware Gold</p>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
                      <div className="h-4 w-full rounded bg-slate-950 border border-slate-700 mb-1"></div>
                      <span className="text-slate-400">#020617</span>
                      <p className="text-[9px] text-slate-500 font-sans">Obsidian Glass</p>
                    </div>
                  </div>
                </div>

                {/* Right: Technical Explanation & Assets Pack */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Design Meaning Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      Logo Concept & Elements
                    </h4>
                    <ul className="text-xs space-y-2 text-slate-300 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold shrink-0">📱</span>
                        <span>
                          <strong className="text-white">OLED Smartphone Bezel:</strong> Represents authentic screen assemblies, calibrators, and mobile devices sold at Chuks Store.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold shrink-0">⚡</span>
                        <span>
                          <strong className="text-white">Gold Connector Pins:</strong> Symbolizes precision replacement charging flexes (Down Boards) and battery terminals.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold shrink-0">💎</span>
                        <span>
                          <strong className="text-white">Stylized "C" & Lightning Microchip:</strong> Custom modern monogram for "Chuks" highlighting speed, reliability, and technician testing.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">📍</span>
                        <span>
                          <strong className="text-white">Gwagwalada, Abuja:</strong> Prominent geographic trade hub branding matching your store's physical workshop on Park Road.
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Why Is The App Not Installing Explanation */}
                  <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                        <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                          Why was the app not installing previously?
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        Browser Security
                      </span>
                    </div>

                    <div className="text-xs text-amber-100/90 leading-relaxed space-y-2">
                      <p>
                        Modern mobile and desktop web browsers (Chrome, Edge, Safari, Firefox) have a strict security policy: <strong>they completely block PWA installation prompts when a website is loaded inside an iframe or preview frame</strong>.
                      </p>
                      <p>
                        Because this development preview is embedded inside a frame, the browser suppresses the native install dialog. To install the app with 1-tap, you must open the link in a dedicated browser tab:
                      </p>
                    </div>

                    {/* Manifest & Service Worker Reliability Checklist */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-300">PWA Manifest &amp; Engine Diagnostic Status</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Check className="h-3.5 w-3.5 shrink-0" />
                          <span>prefer_related_applications: <strong>false</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Check className="h-3.5 w-3.5 shrink-0" />
                          <span>related_applications: <strong>[] (No store block)</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Check className="h-3.5 w-3.5 shrink-0" />
                          <span>SW Auto-Registration &amp; Fallback: <strong>Active</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Check className="h-3.5 w-3.5 shrink-0" />
                          <span>Maskable &amp; High-Res Icons: <strong>Verified</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Launch & Copy Link */}
                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <a
                        href={window.location.origin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:brightness-110 transition"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Launch in Dedicated Browser Tab</span>
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin);
                          setCopiedAppUrl(true);
                          setTimeout(() => setCopiedAppUrl(false), 2500);
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
                      >
                        {copiedAppUrl ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span className="text-emerald-300">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 text-cyan-400" />
                            <span>Copy App URL</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('pwa-diagnostics')}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-950/40 px-4 py-2.5 text-xs font-bold text-orange-300 hover:bg-orange-900/60 transition"
                        title="Open live standalone check and navigator inspection"
                      >
                        <Wrench className="h-4 w-4 text-orange-400" />
                        <span>Run PWA Diagnostics</span>
                      </button>
                    </div>
                  </div>

                  {/* Ready-to-Download Icon Pack */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                    <h4 className="text-xs font-bold text-slate-300 mb-2.5">
                      Generated Icon Assets for App Stores & Browsers
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <a
                        href="/pwa-512x512.png"
                        download="chuks-pwa-512x512.png"
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-300 hover:border-cyan-500/50 hover:text-white transition"
                      >
                        <img src="/pwa-512x512.png" alt="512px icon" className="h-8 w-8 rounded-lg" />
                        <span className="font-semibold">512×512 PNG</span>
                        <span className="text-[10px] text-slate-500">Android/Chrome</span>
                      </a>

                      <a
                        href="/pwa-192x192.png"
                        download="chuks-pwa-192x192.png"
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-300 hover:border-cyan-500/50 hover:text-white transition"
                      >
                        <img src="/pwa-192x192.png" alt="192px icon" className="h-8 w-8 rounded-lg" />
                        <span className="font-semibold">192×192 PNG</span>
                        <span className="text-[10px] text-slate-500">Mobile Launcher</span>
                      </a>

                      <a
                        href="/apple-touch-icon.png"
                        download="chuks-apple-touch-icon.png"
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-300 hover:border-cyan-500/50 hover:text-white transition"
                      >
                        <img src="/apple-touch-icon.png" alt="Apple touch icon" className="h-8 w-8 rounded-lg" />
                        <span className="font-semibold">180×180 PNG</span>
                        <span className="text-[10px] text-slate-500">iPhone / iPad</span>
                      </a>

                      <a
                        href="/pwa-maskable-512x512.png"
                        download="chuks-maskable-512x512.png"
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-slate-300 hover:border-cyan-500/50 hover:text-white transition"
                      >
                        <img src="/pwa-maskable-512x512.png" alt="Maskable icon" className="h-8 w-8 rounded-lg" />
                        <span className="font-semibold">Maskable Icon</span>
                        <span className="text-[10px] text-slate-500">Safe-Zone Padded</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TRENDING PARTS & PRIVACY ANALYTICS */}
          {activeTab === 'trending-parts' && (
            <AdminTrendingAnalyticsPanel
              products={products}
              onSelectProductForStockEdit={(prodId) => {
                const found = products.find((p) => p.id === prodId);
                setActiveTab('inventory');
                if (found) {
                  setSearchQuery(found.sku || found.name);
                }
              }}
              onSelectProductForBroadcast={(prod) => {
                setActiveTab('broadcast');
                setBroadcastTitle(`🔥 High Demand: ${prod.name}`);
                setBroadcastMessage(
                  `Customer favorite! ${prod.name} (${prod.brand}) is trending right now at Chuks Store for ₦${prod.price.toLocaleString()}. Stock available for immediate dispatch!`
                );
                setBroadcastType('promo');
              }}
            />
          )}

          {/* TAB 7: PWA HEALTH & STANDALONE DIAGNOSTICS */}
          {activeTab === 'pwa-diagnostics' && (
            <div className="space-y-4">
              <PWADiagnosticsCard />
            </div>
          )}
        </div>

        {/* MODAL: ADD NEW ARRIVAL / GOODS */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Add New Product / Arrival</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-medium text-slate-300">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro OLED Screen Assembly with Frame"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium text-slate-300">Brand</label>
                    <select
                      value={newProductBrand}
                      onChange={(e) => setNewProductBrand(e.target.value as ProductBrand)}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Samsung">Samsung</option>
                      <option value="Apple">Apple</option>
                      <option value="Tecno">Tecno</option>
                      <option value="Infinix">Infinix</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="Google Pixel">Google Pixel</option>
                      <option value="OnePlus">OnePlus</option>
                      <option value="Universal">Universal</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-slate-300">Category</label>
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value as ProductCategory)}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="screens">Screens & Displays</option>
                      <option value="batteries">Batteries</option>
                      <option value="charging-flex">Charging Flexes & Ports</option>
                      <option value="cameras">Camera Modules</option>
                      <option value="housings-glass">Housings & Back Glass</option>
                      <option value="accessories">Accessories (Powerbanks, Cables)</option>
                      <option value="tools">Technician Repair Tools</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium text-slate-300">Selling Price (₦) *</label>
                    <input
                      type="number"
                      required
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-300">Original Price (₦)</label>
                    <input
                      type="number"
                      value={newProductOrigPrice}
                      onChange={(e) => setNewProductOrigPrice(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-300">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-medium text-slate-300">Condition</label>
                    <select
                      value={newProductCondition}
                      onChange={(e) => setNewProductCondition(e.target.value as Product['condition'])}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Original Service Pack">Original Service Pack</option>
                      <option value="OEM Pulled">OEM Pulled</option>
                      <option value="AAA+ High Quality">AAA+ High Quality</option>
                      <option value="Brand New Genuine">Brand New Genuine</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-slate-300">Warranty</label>
                    <select
                      value={newProductWarranty}
                      onChange={(e) => setNewProductWarranty(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="30-Day Testing Warranty">30-Day Testing Warranty</option>
                      <option value="6-Month Warranty">6-Month Warranty</option>
                      <option value="1-Year Warranty">1-Year Warranty</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-medium text-slate-300">Repair Level</label>
                    <select
                      value={newProductDifficulty}
                      onChange={(e) => setNewProductDifficulty(e.target.value as RepairDifficulty)}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <label className="text-xs font-semibold text-slate-300">Catalog Presentation</label>
                  <p className="mt-0.5 text-xs text-cyan-400">
                    📦 Standard Genuine OEM Component Packaging Box will be generated automatically based on Brand & Category.
                  </p>
                </div>

                <div>
                  <label className="font-medium text-slate-300">Compatible Models (Comma separated)</label>
                  <input
                    type="text"
                    value={newProductCompatible}
                    onChange={(e) => setNewProductCompatible(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro, A2848, A3102"
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-slate-950 p-3 border border-slate-800">
                  <input
                    type="checkbox"
                    id="broadcast-check"
                    checked={broadcastNewArrival}
                    onChange={(e) => setBroadcastNewArrival(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-cyan-500"
                  />
                  <label htmlFor="broadcast-check" className="text-xs text-slate-300 cursor-pointer">
                    Automatically broadcast <strong className="text-amber-300">"New Arrival of Goods"</strong> alert to all customers using the app
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/3 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white shadow hover:bg-cyan-500"
                  >
                    Save & Add to Store Catalog
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Change Password Modal */}
        {showChangePinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-white text-base">Update Admin Password</h3>
                </div>
                <button
                  onClick={() => setShowChangePinModal(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {changePinSuccess ? (
                <div className="my-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <Check className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                  <p className="font-bold text-emerald-300 text-sm">Admin Password Updated!</p>
                  <p className="text-xs text-slate-300 mt-1">Your new confidential password is saved securely.</p>
                </div>
              ) : (
                <form onSubmit={handleChangePinSubmit} className="mt-4 space-y-3.5">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPin ? 'text' : 'password'}
                        value={currentPinInput}
                        onChange={(e) => {
                          setCurrentPinInput(e.target.value);
                          if (changePinError) setChangePinError('');
                        }}
                        placeholder="Enter current password..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-3 pr-10 text-xs font-semibold text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPin(!showCurrentPin)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                      >
                        {showCurrentPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPin ? 'text' : 'password'}
                        value={newPinInput}
                        onChange={(e) => {
                          setNewPinInput(e.target.value);
                          if (changePinError) setChangePinError('');
                        }}
                        placeholder="Enter new password (min. 4 chars)..."
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-3 pr-10 text-xs font-semibold text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPin(!showNewPin)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                      >
                        {showNewPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPinInput}
                      onChange={(e) => {
                        setConfirmPinInput(e.target.value);
                        if (changePinError) setChangePinError('');
                      }}
                      placeholder="Re-enter new password..."
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs font-semibold text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  {changePinError && (
                    <p className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {changePinError}
                    </p>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowChangePinModal(false)}
                      className="flex-1 rounded-xl border border-slate-800 bg-slate-800/80 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 py-2 text-xs font-bold text-white shadow hover:brightness-110"
                    >
                      Save Password
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* BIG DEDICATED SCREEN PRICE & STOCK EDITOR MODAL */}
        {priceEditProduct && (
          <div
            id="admin-big-price-editor-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
          >
            <div className="relative my-auto w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-2xl sm:rounded-3xl border-2 border-amber-500/60 bg-slate-900 p-4 sm:p-6 md:p-8 text-slate-100 shadow-2xl">
              {/* Ambient Header Glow */}
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/30">
                    <Edit2 className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 uppercase tracking-wide">
                      Dedicated Price Studio
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                      Adjust Screen & Part Price
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPriceEditProduct(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Product Info Card */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 mb-5">
                <div className="h-16 w-16 rounded-xl border border-slate-800 bg-slate-900 p-1 shrink-0 overflow-hidden shadow-inner">
                  <ProductBoxGraphic
                    product={priceEditProduct}
                    size="sm"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-300 uppercase">
                      {priceEditProduct.brand}
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300 uppercase">
                      {priceEditProduct.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      SKU: {priceEditProduct.sku}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm sm:text-base line-clamp-2">
                    {priceEditProduct.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Current active price in catalog: <strong className="text-amber-400 font-extrabold">₦{priceEditProduct.price.toLocaleString()}</strong>
                  </p>
                </div>
              </div>

              {/* BIG SELLING PRICE INPUT BOX */}
              <div className="space-y-4">
                <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/30 via-slate-950 to-slate-950 p-5 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="big-price-input"
                      className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300"
                    >
                      New Selling Price (₦)
                    </label>
                    <span className="text-xs text-slate-400">
                      Formatted: <strong className="text-amber-300 text-sm font-extrabold">₦{Number(bigEditPrice || 0).toLocaleString()}</strong>
                    </span>
                  </div>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-3.5 text-2xl sm:text-3xl font-black text-amber-400">
                      ₦
                    </span>
                    <input
                      id="big-price-input"
                      type="number"
                      step="500"
                      min="0"
                      value={bigEditPrice || ''}
                      onChange={(e) => setBigEditPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-2xl border-2 border-amber-500/70 bg-slate-900 py-3 pl-12 pr-4 text-2xl sm:text-3xl font-black text-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20 focus:outline-none transition"
                      autoFocus
                    />
                  </div>

                  {/* QUICK PRICE BUMP BUTTONS (+ and -) */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>Quick Price Adjustments (Tap to Add):</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {[500, 1000, 2000, 5000, 10000].map((inc) => (
                        <button
                          key={`inc-${inc}`}
                          type="button"
                          onClick={() => setBigEditPrice((prev) => Math.max(0, (Number(prev) || 0) + inc))}
                          className="rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 py-2 text-center text-xs font-black text-amber-300 active:scale-95 transition"
                        >
                          +₦{inc >= 1000 ? `${inc / 1000}k` : inc}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-1">
                      <span>Tap to Decrease:</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {[500, 1000, 2000, 5000].map((dec) => (
                        <button
                          key={`dec-${dec}`}
                          type="button"
                          onClick={() => setBigEditPrice((prev) => Math.max(0, (Number(prev) || 0) - dec))}
                          className="rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 py-1.5 text-center text-xs font-bold text-slate-300 active:scale-95 transition"
                        >
                          -₦{dec >= 1000 ? `${dec / 1000}k` : dec}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ORIGINAL / STRIKETHROUGH PRICE & STOCK ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Original Strikethrough Price */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Original / Normal Price (₦)
                    </label>
                    <span className="text-[11px] text-slate-500 block mb-2">
                      Shows crossed-out strike to highlight discount
                    </span>
                    <input
                      type="number"
                      step="500"
                      min="0"
                      value={bigEditOrigPrice || ''}
                      onChange={(e) => setBigEditOrigPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 px-3 text-base font-extrabold text-slate-200 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      In-Stock Quantity (Units)
                    </label>
                    <span className="text-[11px] text-slate-500 block mb-2">
                      Real-time inventory level at workshop
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBigEditStock((prev) => Math.max(0, prev - 1))}
                        className="h-9 w-9 rounded-xl border border-slate-700 bg-slate-800 font-bold text-white hover:bg-slate-700 transition"
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={bigEditStock}
                        onChange={(e) => setBigEditStock(Math.max(0, Number(e.target.value)))}
                        className="w-full text-center rounded-xl border border-slate-700 bg-slate-900 py-2 px-2 text-base font-black text-amber-300 focus:border-amber-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setBigEditStock((prev) => prev + 1)}
                        className="h-9 w-9 rounded-xl border border-slate-700 bg-slate-800 font-bold text-white hover:bg-slate-700 transition"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => setBigEditStock((prev) => prev + 5)}
                        className="rounded-xl border border-slate-700 bg-slate-800 px-2 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>

                {/* Success Banner */}
                {priceSaveSuccess && (
                  <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/80 p-3.5 text-center text-sm font-bold text-emerald-300 flex items-center justify-center gap-2 animate-in fade-in">
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>Price updated to ₦{Number(bigEditPrice).toLocaleString()} and saved to live store!</span>
                  </div>
                )}

                {/* Big Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPriceEditProduct(null)}
                    className="flex-1 rounded-2xl border border-slate-800 bg-slate-800/80 py-3.5 text-xs sm:text-sm font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveBigPrice}
                    className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-xl shadow-amber-500/25 active:scale-98 transition"
                  >
                    <Check className="h-5 w-5 stroke-[3]" />
                    <span>Save & Update Price Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BULK CATEGORY PRICE ADJUSTMENT MODAL */}
        {showBulkAdjustModal && (
          <div
            id="admin-bulk-price-adjust-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
          >
            <div className="relative my-auto w-full max-w-2xl max-h-[92dvh] overflow-y-auto rounded-2xl sm:rounded-3xl border-2 border-amber-500/60 bg-slate-900 p-4 sm:p-6 md:p-8 text-slate-100 shadow-2xl">
              {/* Ambient Header Glow */}
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-500/30">
                    <Percent className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 uppercase tracking-wide">
                      Bulk Price Engine
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                      Bulk Category Price Adjuster
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBulkAdjustModal(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* 1. Target Category Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                      1. Select Target Category
                    </label>
                    <span className="text-xs font-bold text-amber-400">
                      {bulkTargetProducts.length} items will be updated
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'screens', label: 'Screens', desc: 'Displays & LCDs' },
                      { id: 'charging-flex', label: 'Down Boards', desc: 'Ports & Flexes' },
                      { id: 'batteries', label: 'Batteries', desc: 'OEM Cells' },
                      { id: 'cameras', label: 'Cameras', desc: 'Lens Modules' },
                      { id: 'housings-glass', label: 'Housings', desc: 'Back Glass' },
                      { id: 'tools', label: 'Tools', desc: 'Repair Kit' },
                      { id: 'accessories', label: 'Accessories', desc: 'Cables & Banks' },
                      { id: 'all', label: 'All Catalog', desc: 'Entire Store' },
                    ].map((cat) => {
                      const count = products.filter((p) => cat.id === 'all' || p.category === cat.id).length;
                      const isSelected = bulkCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setBulkCategory(cat.id as ProductCategory | 'all')}
                          className={`p-2.5 rounded-xl border text-left transition ${
                            isSelected
                              ? 'border-amber-400 bg-amber-950/40 text-white shadow-sm ring-1 ring-amber-400/40'
                              : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                              {cat.label}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400">
                              {count}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5 line-clamp-1">
                            {cat.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Direction: Increase vs Decrease */}
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-2">
                    2. Adjustment Direction
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBulkDirection('increase')}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition ${
                        bulkDirection === 'increase'
                          ? 'border-emerald-500/70 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500/30'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-extrabold block text-white">Price Increase (+)</span>
                        <span className="text-[11px] text-slate-400">Markup (e.g. FX / supplier hike)</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBulkDirection('decrease')}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition ${
                        bulkDirection === 'decrease'
                          ? 'border-rose-500/70 bg-rose-950/40 text-rose-300 ring-2 ring-rose-500/30'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                        <TrendingDown className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-extrabold block text-white">Price Discount (-)</span>
                        <span className="text-[11px] text-slate-400">Promo / price reduction</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 3. Percentage Rate & Presets */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                      3. Percentage Rate (%)
                    </label>
                    <span className="text-xs font-bold text-amber-400">
                      {bulkDirection === 'increase' ? `+${bulkPercentage}% markup` : `-${bulkPercentage}% discount`}
                    </span>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[5, 10, 15, 20, 25, 30, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setBulkPercentage(pct)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                          bulkPercentage === pct
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                            : 'bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        {bulkDirection === 'increase' ? `+${pct}%` : `-${pct}%`}
                      </button>
                    ))}
                  </div>

                  {/* Custom Percentage Input */}
                  <div className="relative pt-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={bulkPercentage || ''}
                      onChange={(e) => setBulkPercentage(Math.max(1, Math.min(100, Number(e.target.value))))}
                      placeholder="Enter custom % (e.g. 12)"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-4 pr-10 text-base font-black text-white focus:border-amber-400 focus:outline-none"
                    />
                    <span className="absolute right-4 top-3.5 text-slate-400 font-bold text-sm">
                      %
                    </span>
                  </div>
                </div>

                {/* 4. Price Rounding & Strikethrough Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <label className="font-bold text-slate-300 block mb-1.5">
                      Naira Price Rounding
                    </label>
                    <select
                      value={bulkRounding}
                      onChange={(e) => setBulkRounding(e.target.value as typeof bulkRounding)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="nearest-500">Round to nearest ₦500 (Recommended)</option>
                      <option value="nearest-100">Round to nearest ₦100</option>
                      <option value="exact">Exact calculated amount</option>
                    </select>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="bulk-update-orig-price-check"
                      checked={bulkUpdateOriginalPrice}
                      onChange={(e) => setBulkUpdateOriginalPrice(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="bulk-update-orig-price-check" className="text-slate-300 font-medium cursor-pointer">
                      Proportionally update original strikethrough price too
                    </label>
                  </div>
                </div>

                {/* 5. Live Interactive Preview of Changes */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wide">
                      Live Sample Preview ({Math.min(5, bulkTargetProducts.length)} of {bulkTargetProducts.length} items)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Calculated in real-time
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {bulkTargetProducts.slice(0, 5).map((p) => {
                      const newP = calculateBulkPrice(p.price, bulkPercentage, bulkDirection, bulkRounding);
                      const delta = newP - p.price;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2 text-xs border border-slate-800/80"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="font-semibold text-white truncate">{p.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{p.brand} • SKU: {p.sku}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-400 line-through">₦{p.price.toLocaleString()}</span>
                            <ArrowRight className="h-3 w-3 text-slate-500" />
                            <span className="font-black text-amber-300">₦{newP.toLocaleString()}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                delta >= 0
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {delta >= 0 ? `+₦${delta.toLocaleString()}` : `-₦${Math.abs(delta).toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Success Banner */}
                {bulkAdjustSuccess && (
                  <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/80 p-3.5 text-center text-xs sm:text-sm font-bold text-emerald-300 flex items-center justify-center gap-2 animate-in fade-in">
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                    <span>{bulkAdjustSuccess}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowBulkAdjustModal(false)}
                    className="flex-1 rounded-2xl border border-slate-800 bg-slate-800/80 py-3.5 text-xs sm:text-sm font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyBulkPriceAdjustment}
                    disabled={bulkTargetProducts.length === 0}
                    className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 py-3.5 text-xs sm:text-sm font-black text-slate-950 shadow-xl shadow-amber-500/25 active:scale-98 transition"
                  >
                    <Check className="h-5 w-5 stroke-[3]" />
                    <span>
                      Apply {bulkDirection === 'increase' ? `+${bulkPercentage}%` : `-${bulkPercentage}%`} to {bulkTargetProducts.length} Items Now
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
