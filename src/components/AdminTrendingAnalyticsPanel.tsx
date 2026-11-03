import React, { useState, useEffect } from 'react';
import {
  Flame,
  ShoppingCart,
  Eye,
  TrendingUp,
  ShieldCheck,
  Search,
  Download,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Radio,
  Layers,
  ArrowRight,
  Check,
  Filter,
} from 'lucide-react';
import { Product } from '../types';
import {
  getAnalyticsSummary,
  clearAnalyticsData,
  logProductView,
  logCartAddition,
  AnalyticsSummary,
} from '../utils/analyticsTracker';

interface AdminTrendingAnalyticsPanelProps {
  products: Product[];
  onSelectProductForStockEdit?: (productId: string) => void;
  onSelectProductForBroadcast?: (product: Product) => void;
}

export const AdminTrendingAnalyticsPanel: React.FC<AdminTrendingAnalyticsPanelProps> = ({
  products,
  onSelectProductForStockEdit,
  onSelectProductForBroadcast,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(() => getAnalyticsSummary(products));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with live event dispatch from main App component
  useEffect(() => {
    const handleUpdate = () => {
      setAnalytics(getAnalyticsSummary(products));
    };
    handleUpdate();
    window.addEventListener('chuks_analytics_updated', handleUpdate);
    return () => window.removeEventListener('chuks_analytics_updated', handleUpdate);
  }, [products]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Build combined list of products with their analytics metrics
  const combinedList = products.map((product) => {
    const metric = analytics.metrics.find((m) => m.productId === product.id);
    const views = metric ? metric.views : 0;
    const cartAdds = metric ? metric.cartAdds : 0;
    const trendingScore = cartAdds * 2.5 + views;
    const conversionRate = views > 0 ? Math.round((cartAdds / views) * 100 * 10) / 10 : 0;

    return {
      product,
      views,
      cartAdds,
      trendingScore,
      conversionRate,
      lastViewedAt: metric?.lastViewedAt,
      lastCartedAt: metric?.lastCartedAt,
    };
  });

  // Sort by trending score descending
  combinedList.sort((a, b) => b.trendingScore - a.trendingScore);

  // Filter products based on search and selected brand/category
  const filteredList = combinedList.filter(({ product }) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  // Top trending product
  const topProduct = combinedList.length > 0 ? combinedList[0] : null;

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Product Name',
      'SKU',
      'Brand',
      'Category',
      'Stock',
      'Views',
      'Cart Additions',
      'Conversion Rate (%)',
      'Trending Score',
      'Demand Level',
    ];

    const rows = combinedList.map((item, index) => {
      let demandLevel = 'Moderate';
      if (item.trendingScore >= 20) demandLevel = 'Viral High Demand';
      else if (item.trendingScore >= 10) demandLevel = 'Strong Demand';
      else if (item.trendingScore >= 4) demandLevel = 'Active Buying Intent';

      return [
        index + 1,
        `"${item.product.name.replace(/"/g, '""')}"`,
        item.product.sku,
        item.product.brand,
        item.product.category,
        item.product.stock,
        item.views,
        item.cartAdds,
        item.conversionRate,
        item.trendingScore.toFixed(1),
        demandLevel,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `chuks_trending_parts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Trending parts report exported to CSV!');
  };

  // Handle Reset Analytics
  const handleReset = () => {
    clearAnalyticsData();
    setShowResetConfirm(false);
    showToast('Analytics counters reset successfully.');
  };

  // Simulate customer interaction for testing
  const handleSimulate = (product: Product, type: 'view' | 'cart') => {
    if (type === 'view') {
      logProductView(product);
      showToast(`Simulated anonymous view for "${product.name.slice(0, 24)}..."`);
    } else {
      logCartAddition(product, 1);
      showToast(`Simulated cart addition for "${product.name.slice(0, 24)}..."`);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-slate-900/95 px-4 py-2.5 text-xs font-semibold text-emerald-300 shadow-xl backdrop-blur animate-in fade-in slide-in-from-top-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Flame className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-white">Trending Parts & Customer Demand Tracker</h3>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              100% PRIVACY-FIRST
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Logs anonymous part views and cart additions in real time. Pinpoints exactly which LCD displays, replacement batteries, and technician tools are driving the highest demand so you never run out of critical stock.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition shadow-sm"
            title="Download CSV spreadsheet"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-400 hover:border-rose-500/40 hover:text-rose-400 transition"
            title="Reset telemetry"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-rose-500/40 bg-slate-900 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="h-6 w-6" />
              <h4 className="font-bold text-base text-white">Reset Analytics Telemetry?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will reset all anonymous part view counters and cart additions back to clean baseline state.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-500 transition"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span>Total Product Views</span>
            <Eye className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{analytics.totalViews}</p>
          <span className="mt-1 inline-block text-[11px] text-slate-400">Anonymous customer catalog impressions</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span>Total Cart Additions</span>
            <ShoppingCart className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-400">{analytics.totalCartAdds}</p>
          <span className="mt-1 inline-block text-[11px] text-slate-400">High-intent purchase actions</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span>View-to-Cart Conversion</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-400">{analytics.averageConversionRate}%</p>
          <span className="mt-1 inline-block text-[11px] text-slate-400">Ratio of views converting to cart adds</span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span>Top In-Demand Brand</span>
            <Flame className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-400">{analytics.topTrendingBrand}</p>
          <span className="mt-1 inline-block text-[11px] text-slate-400">Highest combined views + orders</span>
        </div>
      </div>

      {/* Privacy Guarantee Box */}
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-xs text-emerald-200/90 leading-relaxed">
        <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-emerald-300">Privacy-First Architecture Guarantee</h4>
          <p className="mt-0.5 text-slate-300">
            This analytics tracker collects <strong>zero cookies</strong>, <strong>zero IP addresses</strong>, and <strong>no user identities</strong>. Only raw, anonymous product counters (views & cart additions) are tracked to preserve customer confidentiality while keeping inventory procurement data accurate.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search trending parts or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Brands</option>
              <option value="Samsung" className="bg-slate-900">Samsung</option>
              <option value="Apple" className="bg-slate-900">Apple</option>
              <option value="Tecno" className="bg-slate-900">Tecno</option>
              <option value="Infinix" className="bg-slate-900">Infinix</option>
              <option value="Xiaomi" className="bg-slate-900">Xiaomi</option>
              <option value="Google Pixel" className="bg-slate-900">Google Pixel</option>
              <option value="Universal" className="bg-slate-900">Universal</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-2.5 py-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Categories</option>
              <option value="screens" className="bg-slate-900">Screens</option>
              <option value="batteries" className="bg-slate-900">Batteries</option>
              <option value="charging-flex" className="bg-slate-900">Charging Flex</option>
              <option value="accessories" className="bg-slate-900">Accessories</option>
              <option value="tools" className="bg-slate-900">Repair Tools</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trending Parts Leaderboard Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Trending Parts Leaderboard ({filteredList.length} items)
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">
            Sorted by Demand Velocity (Cart Adds × 2.5 + Views)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Part Title & Details</th>
                <th className="py-3 px-3">Inventory Stock</th>
                <th className="py-3 px-3">Views</th>
                <th className="py-3 px-3">Cart Adds</th>
                <th className="py-3 px-3">Conversion</th>
                <th className="py-3 px-3">Demand Velocity</th>
                <th className="py-3 px-4 text-right">Quick Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.map(({ product, views, cartAdds, conversionRate, trendingScore }, index) => {
                const isTop3 = index < 3;
                const isLowStockWithHighDemand = product.stock <= 3 && trendingScore > 5;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-800/40 transition ${
                      isTop3 ? 'bg-amber-500/[0.02]' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 font-extrabold whitespace-nowrap">
                      {index === 0 ? (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Flame className="h-4 w-4 fill-amber-400" /> #1
                        </span>
                      ) : index === 1 ? (
                        <span className="text-slate-300 font-bold">#2</span>
                      ) : index === 2 ? (
                        <span className="text-amber-600 font-bold">#3</span>
                      ) : (
                        <span className="text-slate-500">#{index + 1}</span>
                      )}
                    </td>

                    {/* Part Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] text-slate-600 font-bold">PARTS</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white leading-snug line-clamp-1">{product.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                            <span className="text-cyan-400 font-medium">{product.brand}</span>
                            <span>•</span>
                            <span className="uppercase">{product.sku}</span>
                            <span>•</span>
                            <span>₦{product.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span
                          className={`font-bold ${
                            product.stock === 0
                              ? 'text-rose-400'
                              : product.stock <= 5
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {product.stock} pcs
                        </span>
                        {isLowStockWithHighDemand && (
                          <div className="flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span>Reorder!</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-3 font-semibold text-slate-200 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-cyan-400" />
                        {views}
                      </span>
                    </td>

                    {/* Cart Adds */}
                    <td className="py-3.5 px-3 font-bold text-emerald-400 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3 text-emerald-400" />
                        {cartAdds}
                      </span>
                    </td>

                    {/* Conversion Rate */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                          conversionRate >= 20
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : conversionRate >= 10
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {conversionRate}%
                      </span>
                    </td>

                    {/* Demand Velocity Badge */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {trendingScore >= 20 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                          <Flame className="h-3 w-3 text-rose-400 animate-pulse" />
                          Viral Demand
                        </span>
                      ) : trendingScore >= 10 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          <TrendingUp className="h-3 w-3 text-amber-400" />
                          High Demand
                        </span>
                      ) : trendingScore >= 4 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                          <ShoppingCart className="h-3 w-3 text-cyan-400" />
                          Cart Trend
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-400">
                          Steady Traffic
                        </span>
                      )}
                    </td>

                    {/* Quick Admin Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Simulation buttons for immediate testing */}
                        <button
                          onClick={() => handleSimulate(product, 'view')}
                          className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-medium text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition"
                          title="Simulate 1 customer view"
                        >
                          +View
                        </button>
                        <button
                          onClick={() => handleSimulate(product, 'cart')}
                          className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] font-medium text-slate-400 hover:text-emerald-300 hover:border-emerald-500/40 transition"
                          title="Simulate 1 cart add"
                        >
                          +Cart
                        </button>

                        {onSelectProductForStockEdit && (
                          <button
                            onClick={() => onSelectProductForStockEdit(product.id)}
                            className="rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-200 hover:bg-cyan-600 hover:text-white transition"
                            title="Edit stock or price in Inventory tab"
                          >
                            Edit Stock
                          </button>
                        )}

                        {onSelectProductForBroadcast && (
                          <button
                            onClick={() => onSelectProductForBroadcast(product)}
                            className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-500/30 transition"
                            title="Create a broadcast promo notification for this trending part"
                          >
                            Broadcast
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
