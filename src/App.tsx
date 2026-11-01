import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldCheck,
  Truck,
  Wrench,
  Search,
  Filter,
  Sparkles,
  ArrowUpDown,
  Download,
  Bot,
  Package,
  Clock,
  PhoneCall,
  MessageCircle,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BookOpen,
  QrCode,
  FileText,
  X,
} from 'lucide-react';
import { Product, Order, BroadcastNotification, CartItem, ProductCategory, ProductBrand, PriceDropAlert } from './types';
import { INITIAL_PRODUCTS, INITIAL_NOTIFICATIONS } from './data/initialProducts';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductBoxGraphic } from './components/ProductBoxGraphic';
import { ProductGridSkeleton } from './components/ProductCardSkeleton';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderReceiptModal } from './components/OrderReceiptModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AIAssistantChat } from './components/AIAssistantChat';
import { PWAInstallModal } from './components/PWAInstallModal';
import { PWADiagnosticsModal } from './components/PWADiagnosticsModal';
import { MobilePWAInstallBanner } from './components/MobilePWAInstallBanner';
import { PWAInstallNudge } from './components/PWAInstallNudge';
import { precacheProductAssets } from './utils/offlinePrecache';
import { NotificationDrawer } from './components/NotificationDrawer';
import { BrowsingRecommendations } from './components/BrowsingRecommendations';
import { MyOrdersModal } from './components/MyOrdersModal';
import { MyAlertsModal } from './components/MyAlertsModal';
import { TechnicianLedgerModal } from './components/TechnicianLedgerModal';
import { TechnicianQuickTool } from './components/TechnicianQuickTool';
import { ScreenGradeCompareModal } from './components/ScreenGradeCompareModal';
import { TechnicianQuoteModal } from './components/TechnicianQuoteModal';
import { ShopInvoiceModal } from './components/ShopInvoiceModal';
import { PartQRLabelModal } from './components/PartQRLabelModal';
import { BackInStockModal } from './components/BackInStockModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { usePWAInstall } from './hooks/usePWAInstall';
import { getStoredAlerts, subscribeToAlerts } from './utils/alertsStorage';
import { logProductView, logCartAddition, getAnalyticsSummary } from './utils/analyticsTracker';

export default function App() {
  const isOnline = useOnlineStatus();
  const { isInstallable, hasInstallQuery } = usePWAInstall();

  // Core Data States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<BroadcastNotification[]>(INITIAL_NOTIFICATIONS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Price Drop Alerts state
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [savedAlerts, setSavedAlerts] = useState<PriceDropAlert[]>(() => getStoredAlerts());

  // Cart & Wishlist with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('chuks_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item): item is CartItem =>
          Boolean(
            item &&
            item.product &&
            typeof item.product.id === 'string' &&
            typeof item.product.price === 'number' &&
            Number(item.quantity) > 0
          )
      );
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chuks_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Browsing History Tracking for tailored product recommendations
  const [viewedProductIds, setViewedProductIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chuks_viewed_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI & Modals State - Default to crisp, modern Light UI Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('chuks_theme');
      return stored === 'dark'; // Defaults to false (Light UI Mode)
    } catch {
      return false;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('chuks_theme', next ? 'dark' : 'light');
      } catch {
        // ignore
      }
      return next;
    });
  };
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isPWAOpen, setIsPWAOpen] = useState(false);
  const [isPWADiagnosticsOpen, setIsPWADiagnosticsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isScreenGuideOpen, setIsScreenGuideOpen] = useState(false);
  const [isQuoteBuilderOpen, setIsQuoteBuilderOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invoiceInitialProduct, setInvoiceInitialProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [backInStockProduct, setBackInStockProduct] = useState<Product | null>(null);
  const [qrLabelProduct, setQrLabelProduct] = useState<Product | null>(null);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discount: number } | null>(null);
  const [broadcastAlertToast, setBroadcastAlertToast] = useState<BroadcastNotification | null>(null);
  const [mainWorkspaceView, setMainWorkspaceView] = useState<'catalog' | 'workbench'>('catalog');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedBrand, setSelectedBrand] = useState<ProductBrand | 'all'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Auto-open PWA install modal if URL has ?install=true, ?action=install, or ?autoinstall=1
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const isInstallIntent =
        hasInstallQuery ||
        params.get('install') === 'true' ||
        params.get('install') === '1' ||
        params.get('action') === 'install' ||
        params.get('autoinstall') === '1';

      if (isInstallIntent) {
        setIsPWAOpen(true);
      }
    } catch {
      if (hasInstallQuery) {
        setIsPWAOpen(true);
      }
    }
  }, [hasInstallQuery]);

  // Handle PWA shortcuts, scanned SKU lookup, and offline asset precaching
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const view = params.get('view');
      const hash = window.location.hash;
      const skuParam = params.get('sku') || params.get('product');

      if (action === 'ledger' || hash === '#ledger') {
        setIsLedgerOpen(true);
      } else if (action === 'invoice' || hash === '#invoice') {
        setIsInvoiceOpen(true);
      } else if (action === 'diagnostics' || action === 'pwa-diag' || hash === '#diagnostics' || params.get('diagnostics') === '1') {
        setIsPWADiagnosticsOpen(true);
      } else if (action === 'track' || action === 'tracking' || hash === '#track') {
        setIsOrdersOpen(true);
      } else if (action === 'scan' || action === 'workbench' || hash === '#scanner' || hash === '#workbench') {
        setMainWorkspaceView('workbench');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('chuks_open_qr_scanner'));
        }, 300);
      } else if (view === 'shop' || hash === '#products-catalog') {
        setMainWorkspaceView('catalog');
        setTimeout(() => {
          const catalogEl = document.getElementById('products-catalog');
          if (catalogEl) {
            catalogEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 200);
      }

      // Proactively precache catalog product images and fonts for full offline functionality
      precacheProductAssets();

      // Ensure splash screen is smoothly dismissed once React has fully rendered App
      const splash = document.getElementById('chuks-splash');
      if (splash && !splash.classList.contains('fade-out')) {
        splash.classList.add('fade-out');
        setTimeout(() => {
          if (splash.parentNode) splash.parentNode.removeChild(splash);
        }, 400);
      }
    } catch (e) {
      console.debug('Shortcut navigation note:', e);
    }
  }, []);

  // When products are available, check if user scanned a part QR code (?sku=...)
  useEffect(() => {
    try {
      if (products.length === 0) return;
      const params = new URLSearchParams(window.location.search);
      const skuParam = params.get('sku') || params.get('product');
      if (skuParam) {
        const cleanSku = skuParam.trim().toUpperCase();
        const matched = products.find(
          (p) => p.sku.toUpperCase() === cleanSku || p.id.toLowerCase() === skuParam.toLowerCase()
        );
        if (matched) {
          setSelectedProduct(matched);
        }
      }
    } catch {
      // ignore
    }
  }, [products]);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chuks_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chuks_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  // Sync browsing history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chuks_viewed_history', JSON.stringify(viewedProductIds));
    } catch (e) {
      console.error(e);
    }
  }, [viewedProductIds]);

  // Subscribe to real-time Price Drop Alerts updates in localStorage
  useEffect(() => {
    const unsub = subscribeToAlerts((updatedAlerts) => {
      setSavedAlerts(updatedAlerts);
    });
    return unsub;
  }, []);

  // Listen for global custom events to open Shop Invoice Pad
  useEffect(() => {
    const handleOpenInvoice = (e: Event) => {
      const customEvent = e as CustomEvent<{ product?: Product }>;
      if (customEvent.detail?.product) {
        setInvoiceInitialProduct(customEvent.detail.product);
      }
      setIsInvoiceOpen(true);
    };
    window.addEventListener('chuks_open_shop_invoice', handleOpenInvoice as EventListener);
    return () => window.removeEventListener('chuks_open_shop_invoice', handleOpenInvoice as EventListener);
  }, []);

  // Listen for global custom events to open QR Scanner workbench
  useEffect(() => {
    const handleOpenScanner = () => {
      setMainWorkspaceView('workbench');
      setTimeout(() => {
        document.getElementById('technician-quick-tool')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
    window.addEventListener('chuks_open_qr_scanner', handleOpenScanner);
    return () => window.removeEventListener('chuks_open_qr_scanner', handleOpenScanner);
  }, []);

  // Skeleton loading effect for product grid when filters, search, or sorting change
  useEffect(() => {
    setIsLoadingProducts(true);
    const timer = setTimeout(() => {
      setIsLoadingProducts(false);
    }, 240);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, inStockOnly]);

  // Fetch live products, orders, notifications from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const prods = await prodRes.json();
          if (Array.isArray(prods) && prods.length > 0) setProducts(prods);
        }

        const ordersRes = await fetch('/api/orders');
        if (ordersRes.ok) {
          const fetchedOrders = await ordersRes.json();
          if (Array.isArray(fetchedOrders)) setOrders(fetchedOrders);
        }

        const notifRes = await fetch('/api/notifications');
        if (notifRes.ok) {
          const fetchedNotifs = await notifRes.json();
          if (Array.isArray(fetchedNotifs)) setNotifications(fetchedNotifs);
        }
      } catch (err) {
        console.warn('Server offline, relying on client-side state', err);
      }
    };
    fetchData();
  }, []);

  // Privacy-focused analytics initialization
  useEffect(() => {
    if (products.length > 0) {
      getAnalyticsSummary(products);
    }
  }, [products]);

  // Tracking viewed products (Logs privacy-friendly anonymous analytics & updates browsing history)
  const handleViewProduct = (product: Product) => {
    logProductView(product);
    setSelectedProduct(product);
    setViewedProductIds((prev) => {
      const updated = [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 10);
      return updated;
    });
  };

  // Cart Operations (Logs privacy-friendly anonymous cart additions)
  const handleAddToCart = (product: Product, quantity = 1) => {
    logCartAddition(product, quantity);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    // Log brand/category interest
    setViewedProductIds((prev) => [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 10));
  };

  const handleBuyNow = (product: Product, quantity = 1) => {
    handleAddToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleBatchAddToCart = (itemsToAdd: { product: Product; quantity: number }[]) => {
    itemsToAdd.forEach(({ product, quantity }) => {
      handleAddToCart(product, quantity);
    });
    setIsCartOpen(true);
  };

  // Checkout & Order Placement
  const handleProceedToCheckout = (discountInfo?: { code: string; discount: number }) => {
    setAppliedDiscount(discountInfo || null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    // Add to local orders
    setOrders((prev) => [newOrder, ...prev]);
    setLatestOrder(newOrder);
    // Deduct stock locally
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = newOrder.items.find((i) => i.productId === p.id);
        if (orderedItem) {
          return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
        }
        return p;
      })
    );
    // Clear cart
    setCart([]);
    // Open receipt
    setIsReceiptOpen(true);
  };

  // Admin Actions (Real-time Inventory & Broadcast Notification updates)
  const handleAdminUpdateProduct = async (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    try {
      await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminBatchUpdateProducts = async (updatedList: Product[]) => {
    const updatedMap = new Map(updatedList.map((p) => [p.id, p]));
    setProducts((prev) => prev.map((p) => updatedMap.get(p.id) || p));
    try {
      await Promise.all(
        updatedList.map((p) =>
          fetch(`/api/products/${p.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(p),
          }).catch((e) => console.warn(e))
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminAddProduct = async (newProdData: Omit<Product, 'id'>) => {
    const tempId = `prod-${Date.now()}`;
    const newProduct: Product = { ...newProdData, id: tempId };
    setProducts((prev) => [newProduct, ...prev]);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProdData),
      });
      if (res.ok) {
        const saved = await res.json();
        setProducts((prev) => prev.map((p) => (p.id === tempId ? saved : p)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminDeleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminUpdateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminSendBroadcast = async (notifData: Omit<BroadcastNotification, 'id' | 'timestamp'>) => {
    const newNotif: BroadcastNotification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);
    // Show toast
    setBroadcastAlertToast(newNotif);
    setTimeout(() => setBroadcastAlertToast(null), 6000);

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifData),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.compatibleModels.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
    const matchesStock = !inStockOnly || p.stock > 0;

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    // default featured
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  const cartCount = cart.reduce((s, i) => s + (Number(i?.quantity) || 0), 0);

  return (
    <div
      id="app-root-container"
      className={`min-h-screen w-full max-w-full overflow-x-hidden pb-24 sm:pb-28 md:pb-8 ${
        isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-slate-50 text-slate-900'
      } font-sans selection:bg-orange-500 selection:text-white transition-colors duration-300`}
    >
      {/* Offline Status Bar Warning if disconnected */}
      {!isOnline && (
        <div className="bg-amber-500 px-4 py-1.5 text-center text-xs font-bold text-stone-950 flex items-center justify-center gap-1.5">
          <AlertTriangle className="h-4 w-4" />
          You are currently offline. Chuks Store cached catalog is available, and orders will sync once reconnected.
        </div>
      )}

      {/* Real-time Broadcast Toast Alert */}
      {broadcastAlertToast && (
        <div
          onClick={() => {
            setIsNotificationsOpen(true);
            setBroadcastAlertToast(null);
          }}
          className={`fixed top-20 right-4 z-50 max-w-sm cursor-pointer rounded-2xl border p-4 shadow-2xl backdrop-blur-md animate-bounce ${
            isDarkMode ? 'border-orange-500/50 bg-stone-900/95 text-white' : 'border-orange-300 bg-white/95 text-slate-900 shadow-orange-500/10'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/20 text-orange-500">
              <Zap className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-orange-600">{broadcastAlertToast.title}</p>
              <p className={`text-[11px] line-clamp-2 mt-0.5 ${isDarkMode ? 'text-stone-300' : 'text-slate-600'}`}>{broadcastAlertToast.message}</p>
              <span className={`mt-1 block text-[10px] ${isDarkMode ? 'text-stone-400' : 'text-slate-400'}`}>Tap to view store notifications</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        onOpenPWA={() => setIsPWAOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenLedger={() => setIsLedgerOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenScreenGuide={() => setIsScreenGuideOpen(true)}
        onOpenQuoteBuilder={() => setIsQuoteBuilderOpen(true)}
        onOpenInvoice={() => setIsInvoiceOpen(true)}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        alertsCount={savedAlerts.length}
        unreadNotificationsCount={notifications.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleTheme}
      />

      {/* Hero Showcase Section - Spacious, Executive, and Uncluttered */}
      <section className={`relative overflow-hidden border-b px-3 py-8 sm:px-6 sm:py-12 transition-colors duration-200 ${
        isDarkMode
          ? 'border-stone-850 bg-stone-950 text-white'
          : 'border-slate-200/90 bg-gradient-to-b from-orange-50/50 via-white to-slate-50 text-slate-900'
      }`}>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Clear Value Proposition & Direct CTAs */}
            <div className="lg:col-span-7 space-y-4">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold ${
                isDarkMode
                  ? 'border-orange-500/35 bg-orange-950/30 text-amber-300'
                  : 'border-orange-300 bg-orange-100/70 text-orange-800'
              }`}>
                <Sparkles className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <span>Screens, Calibrators & Down Boards • Gwagwalada, Abuja</span>
              </div>

              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Chuks Communication
              </h2>
              <p className={`text-xs sm:text-sm font-semibold ${
                isDarkMode ? 'text-amber-400' : 'text-orange-600'
              }`}>
                Park Road, Gwagwalada, Abuja • 07039564380
              </p>
              <p className={`text-sm sm:text-base max-w-xl leading-relaxed ${
                isDarkMode ? 'text-stone-300' : 'text-slate-600'
              }`}>
                Wholesale and retail distributor of original smartphone screens, in-display optical calibrators, fast charging down boards, 0-cycle batteries, and precision repair tools with fast dispatch.
              </p>

              {/* Clean Trust Assurance Badges */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 transition ${
                  isDarkMode
                    ? 'border-stone-800 bg-stone-900/60 text-stone-300'
                    : 'border-slate-200 bg-white text-slate-700 shadow-2xs'
                }`}>
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>30-Day Screen Testing</span>
                </div>
                <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 transition ${
                  isDarkMode
                    ? 'border-stone-800 bg-stone-900/60 text-stone-300'
                    : 'border-slate-200 bg-white text-slate-700 shadow-2xs'
                }`}>
                  <Truck className="h-4 w-4 text-orange-500 shrink-0" />
                  <span>Abuja Same-Day Dispatch</span>
                </div>
                <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 transition ${
                  isDarkMode
                    ? 'border-stone-800 bg-stone-900/60 text-stone-300'
                    : 'border-slate-200 bg-white text-slate-700 shadow-2xs'
                }`}>
                  <Wrench className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Wholesale Technician Rates</span>
                </div>
              </div>

              {/* Primary Call-to-Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => {
                    setMainWorkspaceView('catalog');
                    document.getElementById('products-catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 px-5 py-3 text-xs sm:text-sm font-bold text-stone-950 shadow-md shadow-orange-500/20 active:scale-95 transition"
                >
                  <Package className="h-4 w-4" />
                  <span>Browse Parts Catalog</span>
                </button>

                <button
                  onClick={() => {
                    setMainWorkspaceView('workbench');
                    setTimeout(() => {
                      document.getElementById('technician-quick-tool')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs sm:text-sm font-bold active:scale-95 transition ${
                    isDarkMode
                      ? 'border-stone-750 bg-stone-900 text-stone-200 hover:border-orange-500/50 hover:bg-stone-850'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-orange-300 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <QrCode className="h-4 w-4 text-orange-500" />
                  <span>Technician Scanner & Tools</span>
                </button>
              </div>
            </div>

            {/* Right Column: Featured Product Spotlight Card */}
            <div className="lg:col-span-5">
              <div className={`relative rounded-2xl border p-4 sm:p-5 transition ${
                isDarkMode
                  ? 'border-orange-500/35 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950/20 shadow-2xl text-stone-100'
                  : 'border-orange-200 bg-white shadow-lg shadow-orange-500/5 text-slate-900'
              }`}>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className={`rounded-md px-2 py-0.5 font-bold ${
                    isDarkMode
                      ? 'bg-orange-500/20 border border-orange-500/40 text-amber-300'
                      : 'bg-orange-100 border border-orange-300 text-orange-700'
                  }`}>
                    🔥 BESTSELLER OF THE WEEK
                  </span>
                  <span className={isDarkMode ? 'text-stone-400' : 'text-slate-500'}>
                    Stock: {products[0]?.stock || 14} units
                  </span>
                </div>

                <div
                  onClick={() => handleViewProduct(products[0])}
                  className={`cursor-pointer group flex min-h-[230px] sm:min-h-[250px] w-full items-center justify-center overflow-hidden rounded-xl mb-3 border ${
                    isDarkMode ? 'bg-stone-950 border-stone-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {products[0] && (
                    <ProductBoxGraphic
                      product={products[0]}
                      size="md"
                      className="h-full w-full"
                    />
                  )}
                </div>

                <h3
                  onClick={() => handleViewProduct(products[0])}
                  className={`cursor-pointer text-base font-bold transition line-clamp-1 ${
                    isDarkMode ? 'text-white hover:text-amber-400' : 'text-slate-900 hover:text-orange-600'
                  }`}
                >
                  {products[0]?.name}
                </h3>
                <p className={`text-xs mt-1 line-clamp-2 ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
                  120Hz Dynamic AMOLED 2X display with frame. Includes 30-Day Testing Guarantee before installation.
                </p>

                <div className={`mt-3 flex items-center justify-between border-t pt-3 ${
                  isDarkMode ? 'border-stone-800' : 'border-slate-100'
                }`}>
                  <div>
                    <span className={`text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                      ₦{products[0]?.price.toLocaleString()}
                    </span>
                    {products[0]?.originalPrice > products[0]?.price && (
                      <span className={`ml-2 text-xs line-through ${isDarkMode ? 'text-stone-400' : 'text-slate-400'}`}>
                        ₦{products[0]?.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(products[0])}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 px-4 py-2 text-xs font-bold text-stone-950 shadow-md shadow-orange-500/20 active:scale-95 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workspace Hub & Segmented Mode Switcher */}
      {/* Placed prominently on the page: not in a hidden menu, but cleanly separated so the app isn't stuffy! */}
      <section className={`relative sm:sticky sm:top-[73px] z-30 border-b backdrop-blur-md px-3 py-2.5 sm:px-6 transition-colors ${
        isDarkMode
          ? 'border-stone-850 bg-stone-950/95'
          : 'border-slate-200/90 bg-white/95 shadow-xs'
      }`}>
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Mode Selector */}
          <div className={`flex items-center gap-1.5 rounded-2xl p-1 border shadow-inner ${
            isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              id="view-tab-catalog-btn"
              onClick={() => {
                setMainWorkspaceView('catalog');
                document.getElementById('products-catalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold transition ${
                mainWorkspaceView === 'catalog'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 shadow-sm'
                  : isDarkMode
                    ? 'text-stone-300 hover:text-white hover:bg-stone-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Parts Catalog ({filteredProducts.length})</span>
            </button>

            <button
              id="view-tab-workbench-btn"
              onClick={() => {
                setMainWorkspaceView('workbench');
                setTimeout(() => {
                  document.getElementById('technician-quick-tool')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold transition ${
                mainWorkspaceView === 'workbench'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 shadow-sm'
                  : isDarkMode
                    ? 'text-stone-300 hover:text-white hover:bg-stone-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Wrench className="h-4 w-4 text-orange-500" />
              <span>Technician Workbench</span>
            </button>
          </div>

          {/* Quick Access Tools: Invoice Pad & Compatibility Ledger (Direct on page, perfectly placed) */}
          <div className="flex items-center gap-2 text-xs overflow-x-auto no-scrollbar pb-0.5">
            <button
              onClick={() => setIsInvoiceOpen(true)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold transition whitespace-nowrap shadow-xs ${
                isDarkMode
                  ? 'border-stone-800 bg-stone-900/80 text-stone-200 hover:border-orange-500/40 hover:text-amber-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-orange-400 hover:text-orange-600'
              }`}
              title="Open Chuks-Ogo Sam Shop Invoice & Calculator"
            >
              <FileText className="h-3.5 w-3.5 text-orange-500" />
              <span>Shop Invoice Pad</span>
            </button>

            <button
              onClick={() => setIsLedgerOpen(true)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold transition whitespace-nowrap shadow-xs ${
                isDarkMode
                  ? 'border-stone-800 bg-stone-900/80 text-stone-200 hover:border-orange-500/40 hover:text-amber-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-orange-400 hover:text-orange-600'
              }`}
              title="Open Price & Pinout Ledger"
            >
              <BookOpen className="h-3.5 w-3.5 text-orange-500" />
              <span>Price Ledger</span>
            </button>

            <button
              onClick={() => setIsScreenGuideOpen(true)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-semibold transition whitespace-nowrap shadow-xs ${
                isDarkMode
                  ? 'border-stone-800 bg-stone-900/80 text-stone-200 hover:border-orange-500/40 hover:text-amber-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-orange-400 hover:text-orange-600'
              }`}
              title="Compare Screen Grades (InCell, JK, OLED)"
            >
              <Cpu className="h-3.5 w-3.5 text-orange-500" />
              <span>Screen Guide</span>
            </button>
          </div>
        </div>
      </section>

      {/* Technician Diagnostic & Pricing Suite Tool - Displayed in its dedicated, spacious workspace */}
      {mainWorkspaceView === 'workbench' && (
        <section id="technician-quick-tool" className="mx-auto max-w-7xl px-3 py-6 sm:px-6 animate-in fade-in duration-200">
          <div className={`mb-4 flex items-center justify-between rounded-2xl border px-4 py-3 ${
            isDarkMode
              ? 'border-orange-500/35 bg-orange-950/20'
              : 'border-orange-200 bg-orange-50/80'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-500/10 text-orange-600'
              }`}>
                <Wrench className="h-4 w-4" />
              </span>
              <div>
                <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Technician Diagnostics & Part Scanner</h3>
                <p className={`text-[11px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>Camera QR lookup, Transsion cross-codes, screen grade guide & repair quotes</p>
              </div>
            </div>

            <button
              onClick={() => {
                setMainWorkspaceView('catalog');
                document.getElementById('products-catalog')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                isDarkMode
                  ? 'border-stone-700 bg-stone-900 text-stone-200 hover:text-white hover:border-orange-500'
                  : 'border-slate-200 bg-white text-slate-700 hover:text-orange-600 hover:border-orange-400 shadow-xs'
              }`}
            >
              <Package className="h-3.5 w-3.5 text-orange-500" />
              <span>View Parts Catalog</span>
            </button>
          </div>

          <TechnicianQuickTool
            onOpenLedger={() => setIsLedgerOpen(true)}
            onFilterSearch={(term) => {
              setSearchQuery(term);
              setMainWorkspaceView('catalog');
            }}
            products={products}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
            onOpenQRLabel={(p) => setQrLabelProduct(p)}
          />
        </section>
      )}

      {/* Main Catalog View */}
      <main id="products-catalog" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Filters and sorting bar */}
        <div className={`mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
          isDarkMode ? 'border-stone-800' : 'border-slate-200'
        }`}>
          <div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {selectedCategory === 'all'
                ? 'All Phone Parts & Accessories'
                : selectedCategory.toUpperCase()}
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
              Showing {sortedProducts.length} items • Real-time stock status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Smoothly Expanding Search Input Field */}
            <div
              className={`group relative flex items-center transition-all duration-300 ease-out ${
                searchQuery
                  ? 'w-full sm:w-60 md:w-72 lg:w-80'
                  : 'w-36 sm:w-44 focus-within:w-full sm:focus-within:w-60 md:focus-within:w-72 lg:focus-within:w-80'
              }`}
            >
              <Search className={`pointer-events-none absolute left-3 top-2 h-3.5 w-3.5 transition-colors duration-200 ${
                isDarkMode
                  ? 'text-stone-400 group-focus-within:text-orange-400'
                  : 'text-slate-400 group-focus-within:text-orange-600'
              }`} />
              <input
                id="catalog-header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className={`w-full rounded-xl border py-1.5 pl-8 pr-7 text-xs transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-orange-500/25 ${
                  isDarkMode
                    ? 'border-stone-800 bg-stone-900/90 text-stone-100 placeholder-stone-400 focus:border-orange-500/80 focus:bg-stone-900'
                    : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-orange-500 shadow-xs'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute right-2 top-1.5 p-0.5 rounded-md transition ${
                    isDarkMode
                      ? 'text-stone-400 hover:text-white hover:bg-stone-800'
                      : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* In stock only toggle */}
            <label className={`flex items-center gap-2 text-xs cursor-pointer ${
              isDarkMode ? 'text-stone-300' : 'text-slate-700'
            }`}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <span>In Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs ${
              isDarkMode
                ? 'border-stone-800 bg-stone-900 text-stone-300'
                : 'border-slate-200 bg-white text-slate-700 shadow-xs'
            }`}>
              <ArrowUpDown className="h-3.5 w-3.5 text-orange-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className={`bg-transparent text-xs focus:outline-none cursor-pointer ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                <option value="featured" className={isDarkMode ? 'bg-stone-900' : 'bg-white'}>Featured</option>
                <option value="price-asc" className={isDarkMode ? 'bg-stone-900' : 'bg-white'}>Price: Low to High</option>
                <option value="price-desc" className={isDarkMode ? 'bg-stone-900' : 'bg-white'}>Price: High to Low</option>
                <option value="rating" className={isDarkMode ? 'bg-stone-900' : 'bg-white'}>Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {isLoadingProducts ? (
          <ProductGridSkeleton count={8} />
        ) : sortedProducts.length === 0 ? (
          <div className="my-16 flex flex-col items-center justify-center text-center">
            <Search className={`h-16 w-16 mb-3 ${isDarkMode ? 'text-stone-700' : 'text-slate-300'}`} />
            <h4 className={`text-base font-bold ${isDarkMode ? 'text-stone-200' : 'text-slate-800'}`}>No matching parts found</h4>
            <p className={`mt-1 text-xs max-w-sm ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
              We couldn't find any items matching your filters. Try resetting your search query or asking our AI Assistant.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedBrand('all');
                setInStockOnly(false);
              }}
              className={`mt-4 rounded-xl px-4 py-2 text-xs font-semibold border transition ${
                isDarkMode
                  ? 'bg-stone-800 text-white border-stone-700 hover:bg-stone-700'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100 shadow-xs'
              }`}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isDarkMode={isDarkMode}
                onAddToCart={(p) => handleAddToCart(p)}
                onViewDetails={handleViewProduct}
                onToggleWishlist={handleToggleWishlist}
                onNotifyBackInStock={(prod) => setBackInStockProduct(prod)}
                isWishlisted={wishlist.includes(product.id)}
                isInCart={cart.some((i) => i?.product?.id === product.id)}
              />
            ))}
          </div>
        )}

        {/* Dynamic Browsing Behavior Recommendations Shelf */}
        <BrowsingRecommendations
          products={products}
          viewedProductIds={viewedProductIds}
          onAddToCart={(p) => handleAddToCart(p)}
          onViewDetails={handleViewProduct}
          onToggleWishlist={handleToggleWishlist}
          onNotifyBackInStock={(prod) => setBackInStockProduct(prod)}
          wishlist={wishlist}
          cartProductIds={cart.filter((i) => i?.product?.id).map((i) => i.product.id)}
        />
      </main>

      {/* Footer */}
      <footer className={`border-t py-12 px-4 sm:px-6 transition-colors ${
        isDarkMode
          ? 'border-stone-900 bg-stone-950 text-stone-400'
          : 'border-slate-200 bg-white text-slate-600'
      }`}>
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border p-1 shadow-xs ${
                isDarkMode ? 'bg-stone-900 border-orange-500/40' : 'bg-orange-50 border-orange-200'
              }`}>
                <img src="/icon.svg" alt="Chuks Store Logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <h4 className={`text-sm font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Chuks Communication</h4>
                <span className={`text-[10px] font-medium ${isDarkMode ? 'text-amber-400' : 'text-orange-600'}`}>Screens, Calibrators & Down Boards</span>
              </div>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-slate-600'}`}>
              Wholesale and retail distributor of original smartphone screens, in-display fingerprint calibrators, charging down boards, and repair tools.
            </p>
            <div className={`flex items-start gap-1.5 text-[11px] ${isDarkMode ? 'text-stone-300' : 'text-slate-700'}`}>
              <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
              <span>Park Road, Gwagwalada, Abuja</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h5 className={`font-bold uppercase text-[11px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Specialties & Warranty</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li>✓ LCD Screens (InCell, JK, GX, OLED)</li>
              <li>✓ Fingerprint & Optical Calibrators</li>
              <li>✓ Fast Charging Down Boards & Flexes</li>
              <li>✓ 30-Day Testing Warranty on Screens</li>
              <li>✓ Precision Screwdrivers & Suction Tools</li>
              <li>✓ Gwagwalada Walk-in & Fast Waybill</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h5 className={`font-bold uppercase text-[11px] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Store Contact & Orders</h5>
            <p className="text-[11px]">
              Direct assistance for stock availability, screen grade pricing, or bulk technician orders:
            </p>
            <div className="space-y-1.5 pt-1">
              <a
                href="tel:07039564380"
                className={`font-semibold flex items-center gap-1.5 transition text-xs ${
                  isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-orange-600 hover:text-orange-700'
                }`}
                title="Call Store Admin"
              >
                <PhoneCall className="h-3.5 w-3.5 text-orange-500" /> Phone: 07039564380
              </a>
              <a
                href="https://wa.me/2347039564380?text=Hello%20Chuks%20Communication%2C%20I%20have%20an%20inquiry%20about%20phone%20parts"
                target="_blank"
                rel="noopener noreferrer"
                className={`font-semibold flex items-center gap-1.5 transition text-xs ${
                  isDarkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                }`}
                title="Chat Admin on WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp: 07039564380
              </a>
            </div>
            <p className={`text-[10px] pt-0.5 ${isDarkMode ? 'text-stone-500' : 'text-slate-400'}`}>Mon - Sat: 8:00 AM - 6:30 PM (Abuja Time)</p>
          </div>
        </div>

        <div className={`mx-auto max-w-7xl mt-8 border-t pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] gap-2 ${
          isDarkMode ? 'border-stone-900 text-stone-500' : 'border-slate-200 text-slate-500'
        }`}>
          <p>© {new Date().getFullYear()} Chuks Communication (Chuks Store). All rights reserved.</p>
          <p>Park Road, Gwagwalada, Abuja • Screens, Calibrators & Down Boards • 07039564380</p>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onProductUpdated={handleAdminUpdateProduct}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenScreenGuide={() => setIsScreenGuideOpen(true)}
        onOpenQRLabel={(prod) => setQrLabelProduct(prod)}
        onOpenLedger={() => setIsLedgerOpen(true)}
        onNotifyBackInStock={(prod) => setBackInStockProduct(prod)}
      />

      <BackInStockModal
        isOpen={!!backInStockProduct}
        onClose={() => setBackInStockProduct(null)}
        product={backInStockProduct}
        onAlertSaved={() => {
          setSavedAlerts(getStoredAlerts());
        }}
      />

      <MyAlertsModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        products={products}
        onViewProduct={(product) => {
          setIsAlertsOpen(false);
          handleViewProduct(product);
        }}
        onAddToCart={(product) => {
          handleAddToCart(product);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        appliedDiscount={appliedDiscount}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderReceiptModal
        order={latestOrder}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />

      <PWAInstallModal
        isOpen={isPWAOpen}
        onClose={() => setIsPWAOpen(false)}
        onOpenDiagnostics={() => setIsPWADiagnosticsOpen(true)}
      />

      <PWADiagnosticsModal
        isOpen={isPWADiagnosticsOpen}
        onClose={() => setIsPWADiagnosticsOpen(false)}
      />

      <MobilePWAInstallBanner
        onOpenModal={() => setIsPWAOpen(true)}
      />

      <PWAInstallNudge
        onOpenModal={() => setIsPWAOpen(true)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        notifications={notifications}
        onUpdateProduct={handleAdminUpdateProduct}
        onBatchUpdateProducts={handleAdminBatchUpdateProducts}
        onAddProduct={handleAdminAddProduct}
        onDeleteProduct={handleAdminDeleteProduct}
        onUpdateOrderStatus={handleAdminUpdateOrderStatus}
        onSendBroadcast={handleAdminSendBroadcast}
        onOpenQRLabel={(prod) => setQrLabelProduct(prod)}
      />

      <MyOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        onViewReceipt={(order) => {
          setLatestOrder(order);
          setIsReceiptOpen(true);
        }}
      />

      <TechnicianLedgerModal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        onSelectSearch={(term) => setSearchQuery(term)}
        cartItems={cart}
      />

      {/* Screen Grade Comparison Modal */}
      <ScreenGradeCompareModal
        isOpen={isScreenGuideOpen}
        onClose={() => setIsScreenGuideOpen(false)}
        onFilterGrade={(keyword) => {
          setSelectedCategory('screens');
          setSearchQuery(keyword);
          setTimeout(() => {
            document.getElementById('products-catalog')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
      />

      {/* Technician Repair Job Quote & Bill Builder */}
      <TechnicianQuoteModal
        isOpen={isQuoteBuilderOpen}
        onClose={() => setIsQuoteBuilderOpen(false)}
        products={products}
      />

      {/* Chuks-Ogo Sam Ventures Shop Invoice Pad & Calculator */}
      <ShopInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setInvoiceInitialProduct(null);
        }}
        products={products}
        initialProduct={invoiceInitialProduct}
        onAddToCartBatch={handleBatchAddToCart}
      />

      {/* Part QR Label Generator & Sticker Print Modal */}
      <PartQRLabelModal
        product={qrLabelProduct}
        isOpen={Boolean(qrLabelProduct)}
        onClose={() => setQrLabelProduct(null)}
        onTestScanInScanner={() => {
          setQrLabelProduct(null);
          setSelectedProduct(null);
          document.getElementById('technician-quick-tool')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* AI Assistant Chat Widget */}
      <AIAssistantChat
        isOpen={isAIChatOpen}
        onToggle={() => setIsAIChatOpen(!isAIChatOpen)}
        products={products}
        onViewProduct={handleViewProduct}
        onAddToCart={handleAddToCart}
      />

      {/* Fixed Thumb-Friendly Mobile Navigation */}
      <MobileBottomNav
        isDarkMode={isDarkMode}
        onOpenHome={() => {
          setSelectedCategory('all');
          setSelectedBrand('all');
          setSearchQuery('');
          setMainWorkspaceView('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLedger={() => setIsLedgerOpen(true)}
        onOpenInvoice={() => setIsInvoiceOpen(true)}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartCount}
      />
    </div>
  );
}
