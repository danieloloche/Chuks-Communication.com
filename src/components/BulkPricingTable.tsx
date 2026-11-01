import React, { useMemo } from 'react';
import {
  TrendingDown,
  Sparkles,
  Zap,
  Check,
  Percent,
  Copy,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Product } from '../types';

interface BulkTier {
  minQty: number;
  maxQty: number | null;
  label: string;
  name: string;
  discountPercent: number;
  badgeColor: string;
}

export const BULK_PRICING_TIERS: BulkTier[] = [
  {
    minQty: 1,
    maxQty: 4,
    label: '1 – 4 pcs',
    name: 'Standard Unit',
    discountPercent: 0,
    badgeColor: 'border-slate-700 bg-slate-800 text-slate-300',
  },
  {
    minQty: 5,
    maxQty: 9,
    label: '5 – 9 pcs',
    name: 'Shop Starter',
    discountPercent: 5,
    badgeColor: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-300',
  },
  {
    minQty: 10,
    maxQty: 24,
    label: '10 – 24 pcs',
    name: 'Technician Pack',
    discountPercent: 10,
    badgeColor: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
  },
  {
    minQty: 25,
    maxQty: 49,
    label: '25 – 49 pcs',
    name: 'Bulk Reseller',
    discountPercent: 15,
    badgeColor: 'border-purple-500/30 bg-purple-950/40 text-purple-300',
  },
  {
    minQty: 50,
    maxQty: null,
    label: '50+ pcs',
    name: 'Master Wholesale',
    discountPercent: 20,
    badgeColor: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
  },
];

interface BulkPricingTableProps {
  product: Product;
  currentQuantity: number;
  onSelectQuantity: (qty: number) => void;
  className?: string;
}

export const BulkPricingTable: React.FC<BulkPricingTableProps> = ({
  product,
  currentQuantity,
  onSelectQuantity,
  className = '',
}) => {
  const [copiedQuote, setCopiedQuote] = React.useState(false);

  // Determine active tier for current quantity
  const activeTier = useMemo(() => {
    for (let i = BULK_PRICING_TIERS.length - 1; i >= 0; i--) {
      if (currentQuantity >= BULK_PRICING_TIERS[i].minQty) {
        return BULK_PRICING_TIERS[i];
      }
    }
    return BULK_PRICING_TIERS[0];
  }, [currentQuantity]);

  // Next tier calculation for incentive
  const nextTier = useMemo(() => {
    const currentIndex = BULK_PRICING_TIERS.findIndex((t) => t.name === activeTier.name);
    if (currentIndex >= 0 && currentIndex < BULK_PRICING_TIERS.length - 1) {
      return BULK_PRICING_TIERS[currentIndex + 1];
    }
    return null;
  }, [activeTier]);

  const unitsToNextTier = nextTier ? nextTier.minQty - currentQuantity : 0;

  // Calculation for current quantity
  const currentCalculations = useMemo(() => {
    const regularTotal = product.price * currentQuantity;
    const discountedTotal = Math.round(
      regularTotal * (1 - activeTier.discountPercent / 100)
    );
    const savings = regularTotal - discountedTotal;
    const unitPrice = Math.round(
      product.price * (1 - activeTier.discountPercent / 100)
    );
    return {
      regularTotal,
      discountedTotal,
      savings,
      unitPrice,
    };
  }, [product.price, currentQuantity, activeTier]);

  const handleCopyQuote = () => {
    const quote = `*CHUKS COMMUNICATION - WHOLESALE ESTIMATE*\n📍 Park Road, Gwagwalada, Abuja\n------------------------------------\n📦 Product: ${product.name}\n🔖 SKU: ${product.sku}\n🔢 Quantity: ${currentQuantity} pcs\n🏆 Tier: ${activeTier.name} (${activeTier.discountPercent}% OFF)\n🏷️ Unit Price: ₦${currentCalculations.unitPrice.toLocaleString()} (Regular: ₦${product.price.toLocaleString()})\n💰 Total: ₦${currentCalculations.discountedTotal.toLocaleString()}\n🎉 Total Savings: ₦${currentCalculations.savings.toLocaleString()}\n🛡️ Warranty: ${product.warranty}\n------------------------------------\nDirect WhatsApp Contact: +234 703 956 4380`;
    navigator.clipboard.writeText(quote);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2000);
  };

  return (
    <div
      id="bulk-pricing-table-container"
      className={`rounded-xl border border-cyan-500/30 bg-slate-950/80 p-3 sm:p-4 shadow-xl space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Percent className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Bulk Wholesale Pricing Table
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold text-emerald-300 normal-case">
                Up to 20% OFF
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Direct workshop trade rates for repair technicians & volume parts resellers
            </p>
          </div>
        </div>

        {/* Current Tier Indicator */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400">Current Order:</span>
          <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${activeTier.badgeColor}`}>
            {currentQuantity} pcs ({activeTier.discountPercent}% OFF)
          </span>
        </div>
      </div>

      {/* Structured Bulk Pricing Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-inner">
        <table className="w-full text-left text-xs text-slate-200 min-w-[500px]">
          <thead className="bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Quantity Tier</th>
              <th className="py-2.5 px-3">Discount</th>
              <th className="py-2.5 px-3">Unit Price</th>
              <th className="py-2.5 px-3">Tier Total</th>
              <th className="py-2.5 px-3 text-emerald-400">You Save</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {BULK_PRICING_TIERS.map((tier) => {
              const isSelected = activeTier.name === tier.name;
              const discountedUnit = Math.round(
                product.price * (1 - tier.discountPercent / 100)
              );
              const tierThresholdTotal = discountedUnit * tier.minQty;
              const regularThresholdTotal = product.price * tier.minQty;
              const tierSavings = regularThresholdTotal - tierThresholdTotal;

              return (
                <tr
                  key={tier.name}
                  onClick={() => onSelectQuantity(tier.minQty)}
                  className={`cursor-pointer transition ${
                    isSelected
                      ? 'bg-cyan-950/50 font-medium'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Tier Range & Name */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black">
                          ✓
                        </span>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-700" />
                      )}
                      <div>
                        <span className="font-bold text-white">{tier.label}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {tier.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Discount Badge */}
                  <td className="py-2.5 px-3">
                    {tier.discountPercent > 0 ? (
                      <span className="rounded-md border border-emerald-500/30 bg-emerald-950/40 px-1.5 py-0.5 text-[11px] font-bold text-emerald-300">
                        {tier.discountPercent}% OFF
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Base Price</span>
                    )}
                  </td>

                  {/* Unit Price */}
                  <td className="py-2.5 px-3">
                    <div>
                      <span className="font-bold text-cyan-300">
                        ₦{discountedUnit.toLocaleString()}
                      </span>
                      {tier.discountPercent > 0 && (
                        <span className="block text-[10px] text-slate-500 line-through">
                          ₦{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Tier Total Cost */}
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-200">
                      ₦{tierThresholdTotal.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      for {tier.minQty} pcs
                    </span>
                  </td>

                  {/* Savings Column */}
                  <td className="py-2.5 px-3">
                    {tierSavings > 0 ? (
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Save ₦{tierSavings.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">—</span>
                    )}
                  </td>

                  {/* Action Button */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectQuantity(tier.minQty);
                      }}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      {isSelected ? 'Applied' : `Select ${tier.minQty} pcs`}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Live Selected Calculation Breakdown Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Live Order Estimate ({currentQuantity} units)
            </span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
              Tier: {activeTier.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Adjust Qty:</span>
            <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950 px-1.5 py-0.5">
              <button
                type="button"
                onClick={() => onSelectQuantity(Math.max(1, currentQuantity - 1))}
                className="h-5 w-5 text-slate-400 hover:text-white font-bold"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-bold text-white">
                {currentQuantity}
              </span>
              <button
                type="button"
                onClick={() => onSelectQuantity(currentQuantity + 1)}
                className="h-5 w-5 text-slate-400 hover:text-white font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 4-Stat Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
            <p className="text-[10px] uppercase font-semibold text-slate-400">Regular Total</p>
            <p className="text-xs font-semibold text-slate-400 line-through mt-0.5">
              ₦{currentCalculations.regularTotal.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500">at ₦{product.price.toLocaleString()} / pc</p>
          </div>

          <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
            <p className="text-[10px] uppercase font-semibold text-cyan-400">Wholesale Unit</p>
            <p className="text-sm font-black text-cyan-300 mt-0.5">
              ₦{currentCalculations.unitPrice.toLocaleString()}
            </p>
            <p className="text-[10px] text-cyan-400/80">
              {activeTier.discountPercent > 0 ? `${activeTier.discountPercent}% OFF / unit` : 'Regular Rate'}
            </p>
          </div>

          <div className="rounded-lg bg-slate-950 p-2 border border-slate-800">
            <p className="text-[10px] uppercase font-semibold text-white">Total Payable</p>
            <p className="text-sm font-black text-white mt-0.5">
              ₦{currentCalculations.discountedTotal.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">for {currentQuantity} pcs</p>
          </div>

          <div className="rounded-lg bg-slate-950 p-2 border border-emerald-500/30">
            <p className="text-[10px] uppercase font-semibold text-emerald-400">Your Savings</p>
            <p className="text-sm font-black text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
              <TrendingDown className="h-3 w-3" />
              ₦{currentCalculations.savings.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-400/80 font-bold">
              {activeTier.discountPercent > 0 ? `${activeTier.discountPercent}% Discount` : 'Order 5+ to save'}
            </p>
          </div>
        </div>

        {/* Next Tier Upgrade Banner */}
        {nextTier && unitsToNextTier > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-3 py-2 text-xs text-cyan-300">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>
                Add <strong>{unitsToNextTier} more unit{unitsToNextTier > 1 ? 's' : ''}</strong> to unlock{' '}
                <strong className="text-white">{nextTier.discountPercent}% OFF</strong> ({nextTier.name})!
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectQuantity(nextTier.minQty)}
              className="ml-2 shrink-0 rounded-md bg-cyan-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-cyan-500 transition shadow"
            >
              Upgrade to {nextTier.minQty} pcs
            </button>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleCopyQuote}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            title="Copy formatted wholesale quote"
          >
            {copiedQuote ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Quote Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy Wholesale Quote</span>
              </>
            )}
          </button>

          <a
            href={`https://wa.me/2347039564380?text=${encodeURIComponent(
              `Hello Chuks Communication Admin, I want to confirm bulk wholesale availability for:\n• Part: ${product.name} (${product.sku})\n• Quantity: ${currentQuantity} units\n• Bulk Tier: ${activeTier.name} (${activeTier.discountPercent}% OFF)\n• Estimated Total: ₦${currentCalculations.discountedTotal.toLocaleString()}\nIs this ready for immediate dispatch from Park Road, Gwagwalada, Abuja?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-900/40 transition"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp Wholesale Desk</span>
          </a>

          <div className="ml-auto hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>30-Day Testing Warranty Included</span>
          </div>
        </div>
      </div>
    </div>
  );
};
