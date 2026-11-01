import React, { useState, useEffect } from 'react';
import {
  X,
  BellRing,
  TrendingDown,
  Trash2,
  ShoppingCart,
  ExternalLink,
  Tag,
  Clock,
  Sparkles,
  ArrowRight,
  MessageCircle,
  PackageCheck,
  PackageX,
  Phone,
} from 'lucide-react';
import { PriceDropAlert, Product } from '../types';
import { ProductBoxGraphic } from './ProductBoxGraphic';
import {
  getStoredAlerts,
  removeAlert,
  clearAllAlerts,
  subscribeToAlerts,
} from '../utils/alertsStorage';

interface MyAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const MyAlertsModal: React.FC<MyAlertsModalProps> = ({
  isOpen,
  onClose,
  products = [],
  onViewProduct,
  onAddToCart,
}) => {
  const [alerts, setAlerts] = useState<PriceDropAlert[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'stock' | 'price'>('all');

  useEffect(() => {
    if (!isOpen) return;
    setAlerts(getStoredAlerts());
    const unsubscribe = subscribeToAlerts((updated) => {
      setAlerts(updated);
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRemove = (productId: string) => {
    removeAlert(productId);
    setAlerts(getStoredAlerts());
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all stored product and restock alerts?')) {
      clearAllAlerts();
      setAlerts([]);
    }
  };

  // Find up-to-date product from catalog
  const getLiveProduct = (productId: string): Product | undefined => {
    return products.find((p) => p.id === productId);
  };

  const stockAlertsCount = alerts.filter((a) => a.isBackInStockAlert || a.alertType === 'back_in_stock').length;
  const priceAlertsCount = alerts.filter((a) => !a.isBackInStockAlert && a.alertType !== 'back_in_stock').length;

  const displayedAlerts = alerts.filter((a) => {
    const isStock = a.isBackInStockAlert || a.alertType === 'back_in_stock';
    if (filterType === 'stock') return isStock;
    if (filterType === 'price') return !isStock;
    return true;
  });

  return (
    <div
      id="my-alerts-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="my-alerts-modal-card"
        className="relative my-auto w-full max-w-2xl max-h-[95dvh] rounded-2xl border border-stone-800 bg-stone-900 text-stone-100 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-4 sm:px-6 py-3.5 sm:py-4 bg-stone-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">My Parts & Stock Alerts</h2>
                {alerts.length > 0 && (
                  <span className="rounded-full bg-orange-500/20 border border-orange-500/30 px-2 py-0.5 text-xs font-bold text-orange-300">
                    {alerts.length} {alerts.length === 1 ? 'part' : 'parts'}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">
                Track back-in-stock notifications, restock arrivals, and market price reductions
              </p>
            </div>
          </div>
          <button
            id="close-my-alerts-btn"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        {alerts.length > 0 && (
          <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-stone-800 bg-stone-950/20 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterType('all')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  filterType === 'all'
                    ? 'bg-orange-500 text-stone-950'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`}
              >
                All ({alerts.length})
              </button>
              <button
                onClick={() => setFilterType('stock')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition flex items-center gap-1 ${
                  filterType === 'stock'
                    ? 'bg-orange-500 text-stone-950'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <span>Back-in-Stock</span>
                <span className="opacity-80">({stockAlertsCount})</span>
              </button>
              <button
                onClick={() => setFilterType('price')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition flex items-center gap-1 ${
                  filterType === 'price'
                    ? 'bg-orange-500 text-stone-950'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <span>Price Drops</span>
                <span className="opacity-80">({priceAlertsCount})</span>
              </button>
            </div>

            <button
              onClick={handleClearAll}
              className="text-stone-400 hover:text-rose-400 transition underline flex items-center gap-1 cursor-pointer text-[11px]"
            >
              <Trash2 className="h-3 w-3" /> Clear all
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5">
          {displayedAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 text-stone-400">
              <div className="h-14 w-14 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-center mb-3">
                <BellRing className="h-7 w-7 text-stone-500" />
              </div>
              <h3 className="text-base font-bold text-stone-200">
                {filterType === 'stock'
                  ? 'No back-in-stock alerts set'
                  : filterType === 'price'
                  ? 'No price drop alerts set'
                  : 'No active parts alerts'}
              </h3>
              <p className="mt-1 text-xs text-stone-400 max-w-sm leading-relaxed">
                When a screen, battery, or tool is out of stock, tap{' '}
                <strong className="text-orange-300">"Notify When Back in Stock"</strong> on any product card to subscribe.
              </p>
              <button
                id="browse-catalog-from-alerts-btn"
                onClick={onClose}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-600/20 hover:bg-orange-500 transition cursor-pointer"
              >
                <span>Browse Phone Parts Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedAlerts.map((alert) => {
                const liveProduct = getLiveProduct(alert.productId);
                const currentPrice = liveProduct ? liveProduct.price : alert.currentPrice;
                const currentStock = liveProduct ? liveProduct.stock : 0;
                const isStockAlert = alert.isBackInStockAlert || alert.alertType === 'back_in_stock';
                const isNowInStock = currentStock > 0;
                const priceDropped = currentPrice < alert.initialPrice;
                const savings = alert.initialPrice - currentPrice;

                return (
                  <div
                    key={alert.id}
                    id={`alert-card-${alert.productId}`}
                    className="rounded-xl border border-stone-800 bg-stone-950/70 p-4 space-y-3 transition hover:border-stone-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <ProductBoxGraphic
                          name={alert.productName}
                          brand={alert.productBrand}
                          size="sm"
                          className="h-14 w-14 rounded-xl shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-stone-800 border border-stone-700 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                              {alert.productBrand}
                            </span>
                            {isStockAlert ? (
                              <span className="rounded bg-orange-950/60 border border-orange-500/40 px-2 py-0.5 text-[10px] font-bold text-orange-300">
                                🔔 Back-in-Stock Subscription
                              </span>
                            ) : (
                              <span className="rounded bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                                📉 Price Drop Watch
                              </span>
                            )}
                          </div>
                          <h4
                            onClick={() => {
                              if (liveProduct) {
                                onViewProduct(liveProduct);
                                onClose();
                              }
                            }}
                            className="font-semibold text-sm text-white hover:text-orange-400 cursor-pointer line-clamp-1 mt-1.5 transition"
                            title={alert.productName}
                          >
                            {alert.productName}
                          </h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-stone-500" />
                              Requested on {new Date(alert.createdAt).toLocaleDateString()}
                            </span>
                            {alert.contactPhone && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-stone-300 font-mono">
                                  <Phone className="h-3 w-3 text-emerald-400" />
                                  {alert.contactPhone}
                                </span>
                              </>
                            )}
                            {alert.requestedQuantity && alert.requestedQuantity > 1 && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400 font-semibold">
                                  Qty: {alert.requestedQuantity} units
                                </span>
                              </>
                            )}
                          </div>
                          {alert.notes && (
                            <p className="mt-1 text-[11px] text-stone-400 italic">
                              Note: "{alert.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Delete alert button */}
                      <button
                        onClick={() => handleRemove(alert.productId)}
                        className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-800 hover:text-rose-400 transition cursor-pointer"
                        title="Remove alert"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Status Pill Box */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stone-900/80 p-3 border border-stone-800/80 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-stone-400 block font-medium">
                          Trade Wholesale Price
                        </span>
                        <span className="font-bold text-base text-white font-mono">
                          ₦{currentPrice.toLocaleString()}
                        </span>
                      </div>

                      <div>
                        {isStockAlert ? (
                          isNowInStock ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-300 animate-pulse">
                              <PackageCheck className="h-4 w-4 text-emerald-400" />
                              NOW IN STOCK! ({currentStock} units ready)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-medium text-amber-300">
                              <PackageX className="h-3.5 w-3.5 text-amber-400" />
                              Awaiting Dispatch / Incoming Shipment
                            </span>
                          )
                        ) : priceDropped ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 text-xs font-bold text-emerald-300 animate-pulse">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                            PRICE DROPPED! Save ₦{savings.toLocaleString()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-stone-800 px-2 py-1 text-[11px] font-medium text-stone-400">
                            <TrendingDown className="h-3 w-3 text-cyan-400" />
                            Watching for price cuts
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {liveProduct && (
                        <button
                          onClick={() => {
                            onViewProduct(liveProduct);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-200 hover:bg-stone-700 transition cursor-pointer"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
                          View Full Specs
                        </button>
                      )}

                      {liveProduct && isNowInStock && (
                        <button
                          onClick={() => {
                            onAddToCart(liveProduct);
                          }}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-950/30 transition cursor-pointer"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add to Cart (₦{currentPrice.toLocaleString()})
                        </button>
                      )}

                      <a
                        href={`https://wa.me/2347039564380?text=${encodeURIComponent(
                          `Hello Chuks Communication! I have an active alert for: ${alert.productName} (Wholesale Price: ₦${currentPrice.toLocaleString()}). Can you update me on current availability or shipment ETA at Park Road, Gwagwalada, Abuja?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Chat Chuks on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
