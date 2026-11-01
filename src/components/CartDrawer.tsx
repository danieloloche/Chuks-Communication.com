import React from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, ShoppingBag, FileSpreadsheet } from 'lucide-react';
import { CartItem } from '../types';
import { ProductBoxGraphic } from './ProductBoxGraphic';
import { exportCartToCSV } from '../utils/csvExport';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: (discountInfo?: { code: string; discount: number }) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const validItems = (items || []).filter((item): item is CartItem => Boolean(item && item.product && typeof item.product.price === 'number'));
  const subtotal = validItems.reduce((sum, item) => sum + (item.product.price || 0) * (item.quantity || 1), 0);

  // Calculate automatic wholesale bulk savings across items
  const wholesaleDiscount = validItems.reduce((sum, item) => {
    let rate = 0;
    const qty = item.quantity || 1;
    const price = item.product.price || 0;
    if (qty >= 50) rate = 0.20;
    else if (qty >= 25) rate = 0.15;
    else if (qty >= 10) rate = 0.10;
    else if (qty >= 5) rate = 0.05;
    return sum + Math.round(price * qty * rate);
  }, 0);

  const totalDiscount = wholesaleDiscount;
  const isFreeShip = subtotal >= 50000;
  const shippingFee = validItems.length === 0 ? 0 : isFreeShip ? 0 : 2500;
  const grandTotal = Math.max(0, subtotal - totalDiscount + shippingFee);

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div
        id="cart-drawer-panel"
        className="relative flex h-full w-full max-w-md flex-col bg-stone-900 text-stone-100 shadow-2xl border-l border-stone-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Your Shopping Cart</h2>
            <span className="rounded-full bg-orange-950/60 border border-orange-500/30 px-2 py-0.5 text-xs font-semibold text-amber-300">
              {items.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>
          <button
            id="cart-close-btn"
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-16 w-16 text-stone-700 mb-3" />
              <p className="text-base font-medium text-stone-300">Your cart is empty</p>
              <p className="mt-1 text-xs text-stone-400 max-w-xs">
                Browse our selection of screens, calibrators, down boards, and repair tools to get started.
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-md shadow-orange-500/20"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  id={`cart-item-${item.product.id}`}
                  className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                >
                  <ProductBoxGraphic
                    product={item.product}
                    size="sm"
                    className="h-16 w-16 shrink-0"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-semibold text-white line-clamp-2">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="ml-2 text-slate-400 hover:text-rose-400 transition"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-cyan-400 font-medium">
                        {item.product.brand} • {item.product.condition}
                      </p>
                      {item.quantity >= 5 && (
                        <span className="mt-1 inline-block rounded bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                          ⚡ Bulk Wholesale Applied ({item.quantity >= 50 ? '20%' : item.quantity >= 25 ? '15%' : item.quantity >= 10 ? '10%' : '5%'} OFF)
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-white">
                          ₦{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                        {item.quantity >= 5 && (
                          <span className="ml-1.5 text-[11px] text-emerald-400">
                            (₦{Math.round(item.product.price * (1 - (item.quantity >= 50 ? 0.2 : item.quantity >= 25 ? 0.15 : item.quantity >= 10 ? 0.1 : 0.05))).toLocaleString()}/ea)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center rounded-lg border border-slate-700 bg-slate-800">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="h-6 w-6 text-xs text-slate-300 hover:bg-slate-700"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="h-6 w-6 text-xs text-slate-300 hover:bg-slate-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2 text-right">
                <button
                  onClick={onClearCart}
                  className="text-xs text-slate-400 hover:text-rose-400 transition"
                >
                  Clear all items
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-slate-800 bg-slate-950 p-6">
            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-semibold text-white">₦{subtotal.toLocaleString()}</span>
              </div>
              {wholesaleDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <span>⚡ Wholesale Bulk Discount</span>
                  </span>
                  <span>-₦{wholesaleDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Fee</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="font-semibold text-emerald-400">FREE (Orders ₦50k+)</span>
                  ) : (
                    `₦${shippingFee.toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-800 pt-2 text-sm font-bold text-white">
                <span>Total</span>
                <span className="text-amber-400 text-base">₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                id="export-cart-csv-drawer-btn"
                onClick={() => exportCartToCSV(items, 'Chuks Communication - Cart Quotation')}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800/80 px-3.5 py-3 text-xs font-bold text-stone-200 hover:bg-stone-750 hover:text-emerald-300 transition"
                title="Export Cart to CSV for Billing / Invoicing"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                id="proceed-checkout-btn"
                onClick={() => onProceedToCheckout({ code: wholesaleDiscount > 0 ? 'WHOLESALE_BULK' : '', discount: totalDiscount })}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 py-3 text-sm font-bold text-stone-950 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition"
              >
                Proceed to Secure Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Chuks Communication 30-Day Testing Guarantee Included</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
