import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  Truck,
  Check,
  Share2,
  Calculator,
  Percent,
  TrendingDown,
  Boxes,
  Sparkles,
  Copy,
  ChevronRight,
  Zap,
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  PenLine,
  Send,
  Award,
  Filter,
  User,
  ChevronDown,
  MessageCircle,
  PhoneCall,
  BellRing,
  Cpu,
  QrCode,
  BookOpen,
  FileText,
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { ProductBoxGraphic } from './ProductBoxGraphic';
import { BulkPricingTable } from './BulkPricingTable';
import { getStoredReviews, saveReview } from '../data/initialReviews';
import {
  isProductAlerted,
  saveAlert,
  removeAlert,
  getProductAlert,
} from '../utils/alertsStorage';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onProductUpdated?: (product: Product) => void;
  onOpenAlerts?: () => void;
  onOpenScreenGuide?: () => void;
  onOpenQRLabel?: (product: Product) => void;
  onOpenLedger?: () => void;
  onNotifyBackInStock?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onProductUpdated,
  onOpenAlerts,
  onOpenScreenGuide,
  onOpenQRLabel,
  onOpenLedger,
  onNotifyBackInStock,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  // Price Drop Alert State
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [showAlertConfig, setShowAlertConfig] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState<number>(0);
  const [alertContact, setAlertContact] = useState('');
  const [alertSavedSuccess, setAlertSavedSuccess] = useState(false);

  // Reviews & Ratings State
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState('');
  const [technicianRole, setTechnicianRole] = useState('Phone Repair Technician');
  const [commentText, setCommentText] = useState('');
  const [formError, setFormError] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [starFilter, setStarFilter] = useState<'all' | number>('all');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!product) return;
    const all = getStoredReviews();
    const productReviews = all.filter((r) => r.productId === product.id);
    setReviews(productReviews);
    setShowReviewForm(false);
    setReviewSubmitted(false);
    setFormError('');
    setStarFilter('all');

    // Sync Price Drop Alert state
    const alerted = isProductAlerted(product.id);
    setIsAlertActive(alerted);
    const existingAlert = getProductAlert(product.id);
    if (existingAlert) {
      setAlertTargetPrice(existingAlert.targetPrice || Math.round(product.price * 0.9));
      setAlertContact(existingAlert.contactPhone || existingAlert.contactEmail || '');
    } else {
      setAlertTargetPrice(Math.round(product.price * 0.9));
      setAlertContact('');
    }
    setShowAlertConfig(false);
    setAlertSavedSuccess(false);
  }, [product?.id, product?.price]);

  if (!isOpen || !product) return null;

  const handleTogglePriceDropAlert = () => {
    if (isAlertActive) {
      removeAlert(product.id);
      setIsAlertActive(false);
      setShowAlertConfig(false);
    } else {
      saveAlert({
        product,
        targetPrice: alertTargetPrice > 0 ? alertTargetPrice : Math.round(product.price * 0.9),
        contactPhone: alertContact && !alertContact.includes('@') ? alertContact : undefined,
        contactEmail: alertContact && alertContact.includes('@') ? alertContact : undefined,
      });
      setIsAlertActive(true);
      setAlertSavedSuccess(true);
      setTimeout(() => setAlertSavedSuccess(false), 3500);
    }
  };

  const handleSaveCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    saveAlert({
      product,
      targetPrice: alertTargetPrice,
      contactPhone: alertContact && !alertContact.includes('@') ? alertContact : undefined,
      contactEmail: alertContact && alertContact.includes('@') ? alertContact : undefined,
    });
    setIsAlertActive(true);
    setShowAlertConfig(false);
    setAlertSavedSuccess(true);
    setTimeout(() => setAlertSavedSuccess(false), 3500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Current order quantity tier
  const activeOrderDiscount = useMemo(() => {
    if (quantity >= 50) return { percent: 20, name: 'Master Wholesale' };
    if (quantity >= 25) return { percent: 15, name: 'Bulk Reseller' };
    if (quantity >= 10) return { percent: 10, name: 'Technician Pack' };
    if (quantity >= 5) return { percent: 5, name: 'Shop Starter' };
    return null;
  }, [quantity]);

  // Reviews Calculations
  const reviewsStats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        avgRating: product.rating,
        totalCount: product.reviewCount,
        distribution: { 5: 90, 4: 8, 3: 2, 2: 0, 1: 0 },
        counts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Number((sum / total).toFixed(1));
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rounded] = (counts[rounded] || 0) + 1;
    });
    const distribution: Record<number, number> = {
      5: Math.round(((counts[5] || 0) / total) * 100),
      4: Math.round(((counts[4] || 0) / total) * 100),
      3: Math.round(((counts[3] || 0) / total) * 100),
      2: Math.round(((counts[2] || 0) / total) * 100),
      1: Math.round(((counts[1] || 0) / total) * 100),
    };
    return {
      avgRating: avg,
      totalCount: total,
      distribution,
      counts,
    };
  }, [reviews, product.rating, product.reviewCount]);

  const filteredReviews = useMemo(() => {
    if (starFilter === 'all') return reviews;
    return reviews.filter((r) => Math.round(r.rating) === starFilter);
  }, [reviews, starFilter]);

  const ratingDescriptions: Record<number, string> = {
    5: '⭐ 5 Stars: Excellent / OEM Genuine Grade (Flawless fitment & performance)',
    4: '⭐ 4 Stars: Very Good (High quality, minimal difference from original)',
    3: '⭐ 3 Stars: Average / Standard (Acceptable replacement quality)',
    2: '⭐ 2 Stars: Fair / Minor Issues (Requires extra technician adjustment)',
    1: '⭐ 1 Star: Poor / Defective or Incompatible',
  };

  const handleHelpfulVote = (reviewId: string) => {
    if (helpfulVotes[reviewId]) return;
    setHelpfulVotes((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      setFormError('Please enter your name or workshop title.');
      return;
    }
    if (!commentText.trim() || commentText.trim().length < 5) {
      setFormError('Please provide a comment sharing your repair or testing experience (minimum 5 characters).');
      return;
    }

    const newRev: ProductReview = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      customerName: reviewerName.trim(),
      rating: newRating,
      comment: commentText.trim(),
      date: new Date().toISOString().split('T')[0],
      technicianRole: technicianRole || 'Verified Customer',
      verifiedPurchase: true,
      helpfulCount: 0,
    };

    saveReview(newRev);
    const updatedReviews = [newRev, ...reviews];
    setReviews(updatedReviews);

    // Update parent product rating & reviewCount if callback provided
    const newSum = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAvg = Number((newSum / updatedReviews.length).toFixed(1));
    const newCount = (product.reviewCount || 0) + 1;

    if (onProductUpdated) {
      onProductUpdated({
        ...product,
        rating: newAvg,
        reviewCount: newCount,
      });
    }

    setReviewerName('');
    setCommentText('');
    setFormError('');
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setShowReviewForm(false);
    }, 2800);
  };

  const scrollToReviews = () => {
    const el = document.getElementById('customer-reviews-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="product-detail-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div
        id="product-detail-modal-card"
        className="relative my-auto w-full max-w-4xl max-h-[95dvh] rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Close Button */}
        <button
          id="product-modal-close-btn"
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20 rounded-full bg-slate-800/80 p-2 text-slate-300 backdrop-blur-sm hover:bg-slate-700 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
          {/* Product Box Column */}
          <div className="relative flex flex-col items-center justify-center bg-slate-950 p-4 sm:p-6 lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-800">
            <ProductBoxGraphic
              product={product}
              size="lg"
              className="w-full"
            />

            {/* Quick stock indicators */}
            <div className="mt-4 w-full rounded-xl bg-stone-900/80 p-3 border border-stone-800 text-xs text-stone-300">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Immediate Store Stock:</span>
                <span className="font-semibold text-orange-400">{product.stock} units ready</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-stone-400">
                <span>Warehouse Reserve:</span>
                <span className="text-emerald-400">100+ units for bulk wholesale</span>
              </div>
            </div>
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col justify-between p-4 sm:p-6 lg:col-span-7 overflow-y-auto">
            <div className="space-y-4">
              {/* Brand and SKU */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400">
                <span className="font-semibold text-amber-400 uppercase tracking-wider">{product.brand}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">SKU: {product.sku}</span>
                  {onOpenQRLabel && (
                    <button
                      onClick={() => onOpenQRLabel(product)}
                      className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/50 px-2 py-0.5 text-[11px] font-bold text-emerald-300 hover:bg-emerald-900/50 transition"
                      title="Print or view QR sticker label"
                    >
                      <QrCode className="h-3 w-3" />
                      QR Label
                    </button>
                  )}
                  {onOpenLedger && (product.category === 'screens' || product.category === 'charging-flex') && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenLedger();
                      }}
                      className="flex items-center gap-1 rounded-lg border border-orange-500/40 bg-orange-950/50 px-2 py-0.5 text-[11px] font-bold text-amber-300 hover:bg-orange-900/50 transition"
                      title="Check pinout compatibility in Ledger"
                    >
                      <BookOpen className="h-3 w-3" />
                      Ledger Pinouts
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onClose();
                      window.dispatchEvent(new CustomEvent('chuks_open_shop_invoice', { detail: { product } }));
                    }}
                    className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-950/40 px-2 py-0.5 text-[11px] font-bold text-amber-300 hover:bg-amber-900/50 transition"
                    title="Calculate in Chuks-Ogo Sam Ventures Shop Invoice"
                  >
                    <FileText className="h-3 w-3" />
                    Invoice Calc
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {product.name}
                </h2>

                {/* Price & Rating */}
                <div className="mt-2 flex flex-wrap items-baseline gap-3">
                  <span className="text-2xl font-extrabold text-white">
                    ₦{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-sm text-slate-400 line-through">
                      ₦{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <button
                    onClick={scrollToReviews}
                    className="flex items-center gap-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-xs text-emerald-400 hover:bg-emerald-900/50 hover:border-emerald-400/50 transition cursor-pointer"
                    title="Jump to Customer & Technician Reviews"
                  >
                    <Star className="h-3 w-3 fill-emerald-400 text-emerald-400" />
                    <span className="font-bold">{reviewsStats.avgRating}</span>
                    <span>({reviewsStats.totalCount} technician reviews)</span>
                    <span className="text-[10px] underline text-emerald-300 ml-0.5">Rate / Review</span>
                  </button>
                </div>

                {/* Price Drop Alert Section */}
                <div id="price-drop-alert-container" className="mt-3 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      id="notify-price-drops-btn"
                      type="button"
                      onClick={handleTogglePriceDropAlert}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                        isAlertActive
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                          : 'bg-slate-800/90 text-slate-300 border border-slate-700 hover:bg-slate-750 hover:text-white hover:border-amber-500/40'
                      }`}
                      title={isAlertActive ? 'Cancel price drop alert' : 'Notify me when price drops for this part'}
                    >
                      <BellRing className={`h-3.5 w-3.5 ${isAlertActive ? 'text-amber-400 fill-amber-400' : 'text-amber-400'}`} />
                      <span>{isAlertActive ? 'Price Drop Alert Active' : 'Notify me of price drops'}</span>
                      {isAlertActive && <Check className="h-3 w-3 text-emerald-400 ml-0.5" />}
                    </button>

                    {isAlertActive ? (
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setShowAlertConfig(!showAlertConfig)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                        >
                          {showAlertConfig ? 'Hide Target' : 'Edit Target Price'}
                        </button>
                        {onOpenAlerts && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenAlerts();
                            }}
                            className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                          >
                            View in My Alerts →
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAlertConfig(!showAlertConfig)}
                        className="text-[11px] text-stone-400 hover:text-stone-300"
                      >
                        Set target price
                      </button>
                    )}

                    {product.category === 'screens' && onOpenScreenGuide && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenScreenGuide();
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-orange-500/35 bg-orange-950/40 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-orange-900/40 transition"
                      >
                        <Cpu className="h-3 w-3 text-orange-400" />
                        <span>Compare Screen Grades Guide →</span>
                      </button>
                    )}
                  </div>

                  {/* Immediate Feedback Confirmation Banner */}
                  {alertSavedSuccess && (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-950/80 border border-emerald-500/40 px-3 py-2 text-xs text-emerald-300 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Price drop alert active! We'll track discounts in your <strong>My Alerts</strong> section.</span>
                      </div>
                      {onOpenAlerts && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAlerts();
                          }}
                          className="ml-2 font-bold underline hover:text-white whitespace-nowrap text-[11px]"
                        >
                          Open My Alerts
                        </button>
                      )}
                    </div>
                  )}

                  {/* Target price configuration form */}
                  {showAlertConfig && (
                    <form
                      onSubmit={handleSaveCustomAlert}
                      className="rounded-xl border border-amber-500/30 bg-slate-950/90 p-3.5 text-xs space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-bold text-slate-200 flex items-center gap-1.5">
                          <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
                          Target Price Notification Preferences
                        </span>
                        <span className="text-[11px] text-slate-400">Current: ₦{product.price.toLocaleString()}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1 font-medium">
                            Alert me when price drops to:
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-slate-500 text-xs font-bold">₦</span>
                            <input
                              type="number"
                              min="100"
                              max={product.price}
                              value={alertTargetPrice || ''}
                              onChange={(e) => setAlertTargetPrice(Number(e.target.value))}
                              placeholder={`e.g. ${Math.round(product.price * 0.9)}`}
                              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1.5 pl-7 pr-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {[5, 10, 15, 20].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setAlertTargetPrice(Math.round(product.price * (1 - pct / 100)))}
                                className="text-[10px] rounded bg-slate-800 px-1.5 py-0.5 text-slate-300 hover:text-white"
                              >
                                -{pct}% (₦{Math.round(product.price * (1 - pct / 100)).toLocaleString()})
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1 font-medium">
                            Optional WhatsApp / Phone / Email:
                          </label>
                          <input
                            type="text"
                            value={alertContact}
                            onChange={(e) => setAlertContact(e.target.value)}
                            placeholder="e.g. 07039564380 or email"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1.5 px-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                          />
                          <p className="mt-1 text-[10px] text-slate-500">
                            Saved locally to your browser and ready in <strong>My Alerts</strong>.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAlertConfig(false)}
                          className="rounded-lg px-3 py-1 text-slate-400 hover:text-white text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-amber-500 hover:bg-amber-400 px-3.5 py-1 text-xs font-bold text-slate-950 transition"
                        >
                          Save Alert Preferences
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {product.description}
              </p>

              {/* ================= DYNAMIC BULK PRICING TABLE ================= */}
              <BulkPricingTable
                product={product}
                currentQuantity={quantity}
                onSelectQuantity={(q) => setQuantity(q)}
              />

              {/* Compatible Models Tags */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Compatible Phone Models:
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {product.compatibleModels.map((model) => (
                    <span
                      key={model}
                      className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300 border border-slate-700"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Technical Specifications:
                </p>
                <div className="mt-2 grid grid-cols-1 gap-1.5 text-xs text-slate-300">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-slate-800/60 pb-1">
                      <span className="text-slate-400">{key}:</span>
                      <span className="font-medium text-slate-200 text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repair & Warranty Warning Notice */}
              <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-3 text-xs text-amber-200">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Chuks Store Testing Warranty Policy
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-200/90">
                  Please test all screen displays, batteries, or flex cables by connecting to the logic board before removing factory seals, adhesive backing, or gluing with B-7000. Once glued, testing warranty is void.
                </p>
              </div>

              {/* Badges Bar */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>{product.warranty}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-amber-400" />
                  <span>Repair Difficulty: {product.repairDifficulty}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-blue-400" />
                  <span>Nationwide Courier Dispatch</span>
                </div>
              </div>

              {/* ================= STAR RATING & CUSTOMER FEEDBACK SECTION ================= */}
              <div
                id="customer-reviews-section"
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5 shadow-lg space-y-4"
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        Customer & Technician Feedback
                        <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                          {reviewsStats.totalCount} {reviewsStats.totalCount === 1 ? 'Review' : 'Reviews'}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Real field reports from repair engineers, technicians & workshop owners
                      </p>
                    </div>
                  </div>

                  <button
                    id="toggle-write-review-btn"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 active:scale-95 transition"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    {showReviewForm ? 'Cancel Feedback' : 'Write a Review'}
                  </button>
                </div>

                {/* Rating Breakdown & Summary Card */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
                  {/* Left Column: Overall Rating */}
                  <div className="flex flex-col items-center justify-center sm:border-r border-slate-800 sm:pr-4 sm:col-span-5 text-center">
                    <span className="text-4xl font-black text-white tracking-tight">
                      {reviewsStats.avgRating}
                    </span>
                    <div className="mt-1 flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(reviewsStats.avgRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="mt-1 text-xs text-slate-400">
                      Based on {reviewsStats.totalCount} verified feedback
                    </span>
                    <div className="mt-2.5 flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      98% Fitment & Test Pass Rate
                    </div>
                  </div>

                  {/* Right Column: Star Breakdown Bars */}
                  <div className="sm:col-span-7 space-y-1.5 flex flex-col justify-center">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviewsStats.counts[stars] || 0;
                      const percent = reviewsStats.distribution[stars] || 0;
                      return (
                        <button
                          key={stars}
                          onClick={() => setStarFilter(starFilter === stars ? 'all' : stars)}
                          className={`group flex items-center gap-2 text-xs w-full text-left rounded-md px-1.5 py-0.5 transition ${
                            starFilter === stars
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="w-10 font-semibold flex items-center gap-0.5 shrink-0">
                            {stars} <Star className="h-3 w-3 fill-amber-400 text-amber-400 inline" />
                          </span>
                          <div className="h-2 flex-1 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400 group-hover:bg-amber-300 transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-12 text-right text-[11px] text-slate-400 shrink-0">
                            {count} ({percent}%)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Write Review Form */}
                {showReviewForm && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="rounded-xl border border-amber-500/40 bg-slate-900/90 p-4 sm:p-5 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <PenLine className="h-3.5 w-3.5" />
                        Leave Rating & Field Feedback
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Help fellow repairers make the right pick
                      </span>
                    </div>

                    {/* Interactive Star Selection */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
                        Your Rating <span className="text-amber-400">*</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = star <= (hoverRating || newRating);
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="p-1 text-slate-600 hover:scale-110 transition active:scale-95 focus:outline-none"
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    isFilled
                                      ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                                      : 'text-slate-700 hover:text-slate-500'
                                  } transition`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-lg">
                          {ratingDescriptions[hoverRating || newRating]}
                        </span>
                      </div>
                    </div>

                    {/* Reviewer Name and Role inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="reviewer-name-input"
                          className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1"
                        >
                          Technician / Customer Name <span className="text-amber-400">*</span>
                        </label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <input
                            id="reviewer-name-input"
                            type="text"
                            value={reviewerName}
                            onChange={(e) => {
                              setReviewerName(e.target.value);
                              if (formError) setFormError('');
                            }}
                            placeholder="e.g., Engr. Kenneth, Ikeja Repair Lab"
                            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="reviewer-role-select"
                          className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1"
                        >
                          Your Role / Experience
                        </label>
                        <select
                          id="reviewer-role-select"
                          value={technicianRole}
                          onChange={(e) => setTechnicianRole(e.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 px-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                        >
                          <option value="Phone Repair Technician">Phone Repair Technician</option>
                          <option value="Master Phone Engineer, Computer Village">Master Phone Engineer (Computer Village)</option>
                          <option value="Shop Owner / Bulk Reseller">Shop Owner / Bulk Reseller</option>
                          <option value="Certified Smartphone Tech">Certified Smartphone Tech</option>
                          <option value="Verified Buyer">Verified Buyer</option>
                          <option value="DIY Repairer">DIY Repairer</option>
                        </select>
                      </div>
                    </div>

                    {/* Feedback Comment Textarea */}
                    <div>
                      <label
                        htmlFor="reviewer-comment-input"
                        className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wide mb-1"
                      >
                        Your Feedback & Repair Experience <span className="text-amber-400">*</span>
                      </label>
                      <textarea
                        id="reviewer-comment-input"
                        rows={3}
                        value={commentText}
                        onChange={(e) => {
                          setCommentText(e.target.value);
                          if (formError) setFormError('');
                        }}
                        placeholder="Detail your experience: did the display pass pre-glue testing? Was the flex cable flexible? Battery health status? Housing fitment?"
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none resize-none"
                      />
                      <p className="mt-1 text-[10px] text-slate-500">
                        Helpful tip: Comments mentioning pre-installation testing and model compatibility are marked as Top Helpful Reviews.
                      </p>
                    </div>

                    {formError && (
                      <p className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {formError}
                      </p>
                    )}

                    {reviewSubmitted && (
                      <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>Thank you! Your feedback and rating have been verified and published.</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                      >
                        Cancel
                      </button>
                      <button
                        id="submit-product-review-btn"
                        type="submit"
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Publish Review
                      </button>
                    </div>
                  </form>
                )}

                {/* Filter and Review Cards Section */}
                <div className="space-y-3 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1 mr-1">
                        <Filter className="h-3 w-3 text-orange-400" /> Filter:
                      </span>
                      <button
                        onClick={() => setStarFilter('all')}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                          starFilter === 'all'
                            ? 'bg-orange-500 text-stone-950 font-bold'
                            : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'
                        }`}
                      >
                        All ({reviews.length})
                      </button>
                      {[5, 4, 3, 2, 1].map((s) => (
                        <button
                          key={s}
                          onClick={() => setStarFilter(s)}
                          className={`flex items-center gap-0.5 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                            starFilter === s
                              ? 'bg-amber-400 text-stone-950 font-bold'
                              : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'
                          }`}
                        >
                          {s} <Star className="h-2.5 w-2.5 fill-current" />
                          <span className="text-[10px] ml-0.5">({reviewsStats.counts[s] || 0})</span>
                        </button>
                      ))}
                    </div>

                    <span className="text-[11px] text-stone-500">
                      Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>

                  {/* Reviews List */}
                  {filteredReviews.length > 0 ? (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {filteredReviews.map((rev) => {
                        const hasVoted = !!helpfulVotes[rev.id];
                        const initials = rev.customerName
                          .split(' ')
                          .map((n) => n[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join('')
                          .toUpperCase() || 'CU';

                        return (
                          <div
                            key={rev.id}
                            className="rounded-xl border border-stone-800/80 bg-stone-900/50 p-3 sm:p-3.5 space-y-2 hover:border-stone-700 transition"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-[11px] font-bold text-stone-950 shadow-sm shrink-0">
                                  {initials}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-white">
                                      {rev.customerName}
                                    </span>
                                    {rev.verifiedPurchase && (
                                      <span className="flex items-center gap-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400">
                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                        Verified Purchase
                                      </span>
                                    )}
                                  </div>
                                  {rev.technicianRole && (
                                    <span className="text-[10px] text-amber-400 font-medium block">
                                      {rev.technicianRole}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="flex items-center gap-0.5 text-amber-400 justify-end">
                                  {[1, 2, 3, 4, 5].map((st) => (
                                    <Star
                                      key={st}
                                      className={`h-3 w-3 ${
                                        st <= Math.round(rev.rating)
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-stone-700'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] text-stone-500 mt-0.5 block">
                                  {rev.date}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-stone-300 leading-relaxed pl-9">
                              {rev.comment}
                            </p>

                            <div className="flex items-center justify-between pl-9 pt-1 text-[11px] text-stone-500 border-t border-stone-800/40">
                              <span className="text-[10px] text-stone-500">
                                Tested & evaluated in field
                              </span>
                              <button
                                onClick={() => handleHelpfulVote(rev.id)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition ${
                                  hasVoted
                                    ? 'text-amber-300 bg-orange-500/20 font-bold'
                                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                                }`}
                              >
                                <ThumbsUp className="h-3 w-3" />
                                <span>Helpful ({rev.helpfulCount || 0})</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
                      <MessageSquare className="mx-auto h-6 w-6 text-slate-600 mb-1.5" />
                      <p className="font-semibold text-slate-300">No {starFilter}★ reviews found for this part yet</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Have you tested or installed this part? Share your feedback with other technicians!
                      </p>
                      <button
                        onClick={() => {
                          setStarFilter('all');
                          setShowReviewForm(true);
                        }}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline"
                      >
                        <PenLine className="h-3 w-3" /> Write First {starFilter !== 'all' ? `${starFilter}★ ` : ''}Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="mt-6 border-t border-slate-800 pt-4">
              {/* Active Wholesale Tier Callout if quantity >= 5 */}
              {activeOrderDiscount && (
                <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    Bulk Discount Applied: {activeOrderDiscount.name} ({activeOrderDiscount.percent}% OFF)
                  </span>
                  <span className="font-extrabold text-white">
                    ₦{Math.round(product.price * quantity * (1 - activeOrderDiscount.percent / 100)).toLocaleString()} total
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
                {/* Main purchase actions row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 p-1 shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white font-bold text-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-10 bg-transparent text-center font-bold text-white text-xs sm:text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white font-bold text-sm"
                    >
                      +
                    </button>
                  </div>

                  {product.stock === 0 ? (
                    <button
                      id="modal-notify-stock-btn"
                      onClick={() => {
                        if (onNotifyBackInStock) {
                          onNotifyBackInStock(product);
                        }
                      }}
                      className="flex flex-1 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 py-2.5 px-3 text-xs sm:text-sm font-bold text-stone-950 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition cursor-pointer"
                    >
                      <BellRing className="h-4 w-4" />
                      <span>Notify When Back in Stock</span>
                    </button>
                  ) : (
                    <>
                      <button
                        id="modal-add-to-cart-btn"
                        onClick={() => {
                          onAddToCart(product, quantity);
                          onClose();
                        }}
                        className="flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-xl bg-stone-800 py-2.5 px-3 text-xs sm:text-sm font-semibold text-white border border-stone-700 hover:bg-stone-700 active:scale-[0.98] transition cursor-pointer"
                      >
                        <ShoppingCart className="h-4 w-4 text-amber-400" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        id="modal-buy-now-btn"
                        onClick={() => {
                          onBuyNow(product, quantity);
                          onClose();
                        }}
                        className="flex flex-1 min-w-[120px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 py-2.5 px-3 text-xs sm:text-sm font-bold text-stone-950 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition cursor-pointer"
                      >
                        <span>Buy Now</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Secondary Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 py-2 px-3 text-xs font-semibold text-stone-300 hover:bg-stone-700 hover:text-white transition"
                    title="Copy link"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
                    <span>{copied ? 'Copied' : 'Share'}</span>
                  </button>

                  {onOpenQRLabel && (
                    <button
                      onClick={() => onOpenQRLabel(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-orange-500/35 bg-orange-950/40 py-2 px-3 text-xs font-semibold text-amber-300 hover:bg-orange-900/50 transition"
                      title="Generate and print part QR code label"
                    >
                      <QrCode className="h-4 w-4 text-orange-400" />
                      <span>QR Label</span>
                    </button>
                  )}

                  <a
                    href={`https://wa.me/2347039564380?text=${encodeURIComponent(
                      `Hello Chuks Communication Admin, I have an inquiry about ${product.name} (₦${product.price.toLocaleString()}). Is it available for delivery?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 py-2 px-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-900/50 hover:text-emerald-300 transition"
                    title="Inquire Admin on WhatsApp (07039564380)"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

