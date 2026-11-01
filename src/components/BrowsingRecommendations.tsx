import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface BrowsingRecommendationsProps {
  products: Product[];
  viewedProductIds: string[];
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onNotifyBackInStock?: (product: Product) => void;
  wishlist: string[];
  cartProductIds: string[];
  isLoading?: boolean;
}

export const BrowsingRecommendations: React.FC<BrowsingRecommendationsProps> = ({
  products,
  viewedProductIds,
  onAddToCart,
  onViewDetails,
  onToggleWishlist,
  onNotifyBackInStock,
  wishlist,
  cartProductIds,
  isLoading = false,
}) => {
  // If explicitly loading, render layout-stable skeleton shelf
  if (isLoading) {
    return (
      <section id="browsing-recommendations-skeleton" className="my-10 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-slate-800" />
          <div className="space-y-1.5">
            <div className="h-4 w-52 rounded bg-slate-800" />
            <div className="h-3 w-80 rounded bg-slate-800/60" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <ProductCardSkeleton key={`rec-skeleton-${idx}`} />
          ))}
        </div>
      </section>
    );
  }

  // Find categories and brands of viewed products
  const viewedProducts = products.filter((p) => viewedProductIds.includes(p.id));
  const viewedBrands = Array.from(new Set(viewedProducts.map((p) => p.brand)));
  const viewedCategories = Array.from(new Set(viewedProducts.map((p) => p.category)));

  // Score other products based on browsing behavior
  const recommended = products
    .filter((p) => !viewedProductIds.includes(p.id))
    .map((p) => {
      let score = 0;
      if (viewedBrands.includes(p.brand)) score += 3;
      if (viewedCategories.includes(p.category)) score += 2;
      if (p.isFeatured) score += 1;
      if (p.category === 'tools' || p.category === 'accessories') score += 1; // Repair essentials
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.product);

  if (recommended.length === 0) return null;

  return (
    <section id="browsing-recommendations-section" className="my-10 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {viewedProducts.length > 0
                ? 'Tailored For You (Based on Your Browsing)'
                : 'Recommended Parts & Repair Essentials'}
            </h3>
            <p className="text-xs text-slate-400">
              {viewedBrands.length > 0
                ? `Matched to your interest in ${viewedBrands.join(', ')} devices & parts`
                : 'Top-rated original components and professional technician toolkits'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommended.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
            onToggleWishlist={onToggleWishlist}
            onNotifyBackInStock={onNotifyBackInStock}
            isWishlisted={wishlist.includes(product.id)}
            isInCart={cartProductIds.includes(product.id)}
          />
        ))}
      </div>
    </section>
  );
};
