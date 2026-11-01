import React, { useState, useEffect } from 'react';
import {
  X,
  BellRing,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  MessageCircle,
  Truck,
  PackageX,
  Trash2,
} from 'lucide-react';
import { Product } from '../types';
import { ProductBoxGraphic } from './ProductBoxGraphic';
import {
  saveBackInStockAlert,
  isProductBackInStockAlerted,
  removeAlert,
  getProductAlert,
} from '../utils/alertsStorage';

interface BackInStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAlertSaved?: () => void;
}

export const BackInStockModal: React.FC<BackInStockModalProps> = ({
  isOpen,
  onClose,
  product,
  onAlertSaved,
}) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [qty, setQty] = useState(1);
  const [technicianNote, setTechnicianNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);

  useEffect(() => {
    if (!isOpen || !product) {
      setIsSuccess(false);
      return;
    }

    // Check if user already subscribed
    const subscribed = isProductBackInStockAlerted(product.id);
    setIsAlreadySubscribed(subscribed);

    const existingAlert = getProductAlert(product.id);
    if (existingAlert) {
      if (existingAlert.contactPhone) setPhone(existingAlert.contactPhone);
      if (existingAlert.contactEmail) setEmail(existingAlert.contactEmail);
      if (existingAlert.requestedQuantity) setQty(existingAlert.requestedQuantity);
      if (existingAlert.notes) setTechnicianNote(existingAlert.notes);
    } else {
      // Prefill phone from past order / localStorage if available
      try {
        const storedOrders = localStorage.getItem('chuks_my_orders');
        if (storedOrders) {
          const parsed = JSON.parse(storedOrders);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].customerPhone) {
            setPhone(parsed[0].customerPhone);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() && !email.trim()) {
      alert('Please provide a Phone number or Email so we can notify you.');
      return;
    }

    saveBackInStockAlert({
      product,
      contactPhone: phone.trim(),
      contactEmail: email.trim(),
      requestedQuantity: qty,
      notes: technicianNote.trim() || undefined,
    });

    setIsSuccess(true);
    setIsAlreadySubscribed(true);
    if (onAlertSaved) {
      onAlertSaved();
    }
  };

  const handleUnsubscribe = () => {
    removeAlert(product.id);
    setIsAlreadySubscribed(false);
    setIsSuccess(false);
    if (onAlertSaved) {
      onAlertSaved();
    }
    onClose();
  };

  const whatsappInquiryUrl = `https://wa.me/2347039564380?text=${encodeURIComponent(
    `Hello Chuks Communication! I am inquiring about restock arrival ETA for: ${product.name} (SKU: ${product.sku}, Wholesale Price: ₦${product.price.toLocaleString()}). How soon will new batch arrive at Park Road, Gwagwalada?`
  )}`;

  return (
    <div
      id="back-in-stock-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="back-in-stock-card"
        className="relative my-auto w-full max-w-lg max-h-[92dvh] rounded-2xl border border-stone-800 bg-stone-900 text-stone-100 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 px-5 py-4 bg-stone-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <BellRing className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Restock Alert Request
              </h2>
              <p className="text-xs text-stone-400">
                Receive instant WhatsApp / SMS notice once new stock arrives
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Product Mini Spec Card */}
          <div className="flex items-start gap-3 rounded-xl border border-stone-800 bg-stone-950 p-3.5">
            <ProductBoxGraphic
              name={product.name}
              brand={product.brand}
              size="sm"
              className="h-16 w-16 rounded-xl shrink-0 border border-stone-800"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-mono">
                <span className="font-semibold text-amber-400">{product.brand}</span>
                <span className="text-stone-700">·</span>
                <span className="truncate">{product.sku}</span>
              </div>
              <h3 className="text-xs font-bold text-stone-100 line-clamp-2 mt-0.5" title={product.name}>
                {product.name}
              </h3>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="font-mono font-bold text-orange-400">
                  ₦{product.price.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900/50">
                  <PackageX className="h-3 w-3" /> Out of stock
                </span>
              </div>
            </div>
          </div>

          {isSuccess ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Stock Alert Activated!</h3>
              <p className="text-xs text-stone-300 leading-relaxed max-w-sm mx-auto">
                We have registered your request for{' '}
                <strong className="text-white">{product.name}</strong>. The moment our dispatch truck
                lands with fresh testing batches at Park Road, Gwagwalada, you'll be among the first contacted!
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950/40 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Ask Chuks ETA on WhatsApp</span>
                </a>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 px-4 py-2.5 text-xs font-semibold text-stone-200 transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isAlreadySubscribed && (
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3 text-xs text-cyan-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    You are already subscribed to restock alerts for this part.
                  </span>
                  <button
                    type="button"
                    onClick={handleUnsubscribe}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 underline ml-2 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" /> Cancel
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  WhatsApp / Phone Number <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 07039564380 or 080..."
                    className="w-full rounded-xl border border-stone-800 bg-stone-950 pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-stone-400">
                  Technicians receive fast WhatsApp notification when delivery lands.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@gmail.com"
                      className="w-full rounded-xl border border-stone-800 bg-stone-950 pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Quantity Needed
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-xs text-white focus:border-orange-500 focus:outline-none"
                    />
                    <span className="text-xs text-stone-400 shrink-0">units</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Workshop Note or Repair Urgency (Optional)
                </label>
                <input
                  type="text"
                  value={technicianNote}
                  onChange={(e) => setTechnicianNote(e.target.value)}
                  placeholder="e.g. Customer phone in shop, need frame version"
                  className="w-full rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Chuks Warranty & Dispatch Note */}
              <div className="rounded-xl border border-stone-800 bg-stone-950/60 p-3 text-[11px] text-stone-400 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>30-Day Testing Warranty Guaranteed on Arrival</span>
                </div>
                <p>
                  All new stock batches are pre-tested on motherboard before release. Walk-in technicians can collect at Park Road, Gwagwalada or request same-day courier dispatch across Abuja & nationwide.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="submit"
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 py-2.5 text-xs font-bold text-stone-950 shadow-lg shadow-orange-500/20 transition cursor-pointer"
                >
                  <BellRing className="h-4 w-4" />
                  <span>{isAlreadySubscribed ? 'Update Restock Subscription' : 'Subscribe to Restock Alert'}</span>
                </button>
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 px-3.5 py-2.5 text-xs font-semibold text-emerald-300 transition"
                  title="Direct WhatsApp inquiry"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-400" />
                  <span>WhatsApp ETA</span>
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
