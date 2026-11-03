import React from 'react';
import { ShoppingCart, Eye, Heart, ShieldCheck, Wrench, Check, Plus, BellRing } from 'lucide-react';
import { Product } from '../types';
import { ProductBoxGraphic } from './ProductBoxGraphic';
import { isProductBackInStockAlerted } from '../utils/alertsStorage';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onNotifyBackInStock?: (product: Product) => void;
  isWishlisted: boolean;
  isInCart: boolean;
  isDarkMode?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  onToggleWishlist,
  onNotifyBackInStock,
  isWishlisted,
  isInCart,
  isDarkMode = false,
}) => {
  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 min-[400px]:p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 ${
        isDarkMode
          ? 'border-stone-800/90 bg-stone-900/80 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-950/20 text-stone-100'
          : 'border-slate-200/90 bg-white hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10 text-slate-900'
      }`}
    >
      {/* Top Metadata Header - Clean Unboxed Typography (Zero-Pill Discipline) */}
      <div className="flex items-center justify-between gap-1 z-10 text-xs">
        <div className={`flex items-center gap-1 min-w-0 flex-1 text-[10px] min-[400px]:text-[11px] font-mono ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
          <span className={`font-semibold shrink-0 ${isDarkMode ? 'text-amber-400' : 'text-orange-600'}`}>{product.brand}</span>
          <span aria-hidden="true" className={isDarkMode ? 'text-stone-700' : 'text-slate-300'}>·</span>
          <span className={`truncate max-w-[55px] min-[400px]:max-w-[70px] sm:max-w-[90px] ${isDarkMode ? 'text-stone-300' : 'text-slate-600'}`}>{product.sku}</span>
          {discountPercent > 0 && (
            <>
              <span aria-hidden="true" className={isDarkMode ? 'text-stone-700' : 'text-slate-300'}>·</span>
              <span className={`font-bold shrink-0 ${isDarkMode ? 'text-orange-400' : 'text-rose-600'}`}>-{discountPercent}%</span>
            </>
          )}
        </div>

        {/* Wishlist toggle */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`shrink-0 rounded-lg p-1 min-[400px]:p-1.5 transition ${
            isWishlisted
              ? 'bg-rose-500/20 text-rose-500'
              : isDarkMode
              ? 'text-stone-400 hover:bg-stone-800 hover:text-white'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
          }`}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Component Box Graphic */}
      <div
        onClick={() => onViewDetails(product)}
        className={`relative my-2 sm:my-3 flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border transition ${
          isDarkMode ? 'bg-stone-950/90 border-stone-800/60' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
        }`}
      >
        <ProductBoxGraphic
          product={product}
          size="md"
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
        />

        {/* Quick View overlay hover button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg border border-slate-700">
            <Eye className="h-3.5 w-3.5 text-amber-400" />
            Quick Inspect
          </span>
        </div>

        {/* Real-time Inventory Status Indicator */}
        <div className={`absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[9px] min-[400px]:text-[10px] px-1.5 min-[400px]:px-2 py-0.5 rounded backdrop-blur-sm border ${
          isDarkMode
            ? 'text-stone-300 bg-stone-950/85 border-stone-800/80'
            : 'text-slate-700 bg-white/90 border-slate-200/80 shadow-2xs'
        }`}>
          <div className="flex items-center gap-1 truncate">
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                product.stock > 10
                  ? 'bg-emerald-500 animate-pulse'
                  : product.stock > 0
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <span className={`font-medium truncate ${isDarkMode ? 'text-stone-300' : 'text-slate-700'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          <span className={`font-mono text-[8.5px] uppercase tracking-wider shrink-0 ml-1 ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
            {product.condition.includes('Service Pack') ? 'Service Pack' : 'Grade A+'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3
            onClick={() => onViewDetails(product)}
            className={`cursor-pointer text-xs sm:text-sm font-semibold line-clamp-2 leading-snug transition ${
              isDarkMode ? 'text-stone-100 hover:text-amber-400' : 'text-slate-900 hover:text-orange-600'
            }`}
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Clean Unboxed Technical Specs Line */}
          <div className={`mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] min-[400px]:text-[11px] ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
            <span className={`flex items-center gap-1 shrink-0 ${isDarkMode ? 'text-stone-300' : 'text-slate-700'}`}>
              <Wrench className="h-3 w-3 text-orange-500" />
              {product.repairDifficulty}
            </span>
            <span aria-hidden="true" className={isDarkMode ? 'text-stone-700' : 'text-slate-300'}>·</span>
            <span className="truncate flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {product.warranty}
            </span>
          </div>

          {/* Model Fit Snippet */}
          {product.compatibleModels.length > 0 && (
            <p className={`mt-1 text-[9.5px] min-[400px]:text-[10px] truncate font-mono ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
              Fits: {product.compatibleModels.slice(0, 2).join(', ')}
              {product.compatibleModels.length > 2 ? ` +${product.compatibleModels.length - 2} more` : ''}
            </p>
          )}
        </div>

        {/* Pricing & Add to cart button */}
        <div className={`mt-2.5 sm:mt-3.5 border-t pt-2.5 sm:pt-3 ${isDarkMode ? 'border-stone-800/80' : 'border-slate-100'}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-1 mb-2 sm:mb-3">
            <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
              <span className={`text-sm min-[400px]:text-base sm:text-lg font-bold tracking-tight font-mono ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                ₦{product.price.toLocaleString()}
              </span>
              {product.originalPrice > product.price && (
                <span className={`text-[10px] sm:text-xs line-through font-mono ${isDarkMode ? 'text-stone-400' : 'text-slate-400'}`}>
                  ₦{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className={`text-[10px] min-[400px]:text-[11px] font-medium shrink-0 ${isDarkMode ? 'text-stone-400' : 'text-slate-500'}`}>
              ★ {product.rating} <span className={isDarkMode ? 'text-stone-500' : 'text-slate-400'}>({product.reviewCount})</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {product.stock === 0 ? (
              <button
                id={`notify-stock-${product.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNotifyBackInStock) {
                    onNotifyBackInStock(product);
                  } else {
                    onViewDetails(product);
                  }
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 sm:py-2.5 px-2 text-[10px] sm:text-xs font-bold transition active:scale-[0.98] cursor-pointer min-w-0 ${
                  isProductBackInStockAlerted(product.id)
                    ? 'border border-emerald-500/50 bg-emerald-950/50 text-emerald-300 hover:bg-emerald-900/60 shadow-md shadow-emerald-950/20'
                    : 'border border-amber-500/40 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold shadow-md shadow-amber-600/20'
                }`}
                title={
                  isProductBackInStockAlerted(product.id)
                    ? 'Restock alert is active. Click to update or manage.'
                    : 'Get notified via SMS/WhatsApp when this part is restocked'
                }
              >
                {isProductBackInStockAlerted(product.id) ? (
                  <>
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
                    <span className="truncate">Alert Set</span>
                  </>
                ) : (
                  <>
                    <BellRing className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">Restock Alert</span>
                  </>
                )}
              </button>
            ) : (
              <button
                id={`add-to-cart-${product.id}`}
                onClick={() => onAddToCart(product)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 sm:py-2.5 px-2 text-[11px] sm:text-xs font-bold transition active:scale-[0.98] cursor-pointer min-w-0 ${
                  isInCart
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 shadow-md shadow-orange-500/20'
                }`}
              >
                {isInCart ? (
                  <>
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> <span className="truncate">Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> <span className="truncate">Add to Cart</span>
                  </>
                )}
              </button>
            )}

            {isInCart && product.stock > 0 && (
              <button
                onClick={() => onAddToCart(product)}
                className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl transition ${
                  isDarkMode
                    ? 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                }`}
                title="Add one more to cart"
              >
                <Plus className="h-4 w-4 text-orange-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

