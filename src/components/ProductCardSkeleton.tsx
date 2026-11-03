import React from 'react';

interface ProductCardSkeletonProps {
  count?: number;
}

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-3 min-[400px]:p-3.5 sm:p-4 animate-pulse">
      {/* Top badges bar skeleton */}
      <div className="flex items-center justify-between gap-1 z-10">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-14 rounded-md bg-slate-800" />
          <div className="h-4 w-10 rounded-md bg-slate-800/80" />
        </div>
        <div className="h-6 w-6 rounded-full bg-slate-800" />
      </div>

      {/* Image skeleton */}
      <div className="relative my-2 sm:my-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-slate-950/80">
        <div className="h-10 w-10 rounded-lg bg-slate-800/60" />
        <div className="absolute bottom-1.5 left-1.5 h-3.5 w-20 rounded bg-slate-800/90" />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col justify-between space-y-2 sm:space-y-3">
        <div className="space-y-2">
          {/* Title 2 lines */}
          <div className="h-3.5 sm:h-4 w-5/6 rounded bg-slate-800" />
          <div className="h-3.5 sm:h-4 w-3/5 rounded bg-slate-800/70" />

          {/* Condition & Repair difficulty */}
          <div className="flex items-center justify-between pt-1">
            <div className="h-3 w-20 rounded bg-slate-800/60" />
            <div className="h-3 w-14 rounded bg-slate-800/60" />
          </div>

          {/* Warranty */}
          <div className="h-3 w-24 rounded bg-slate-800/50" />
        </div>

        {/* Pricing & Add to cart button */}
        <div className="border-t border-slate-800/80 pt-2.5 sm:pt-3">
          <div className="flex items-baseline justify-between mb-2 sm:mb-3">
            <div className="h-5 sm:h-6 w-20 rounded bg-slate-800" />
            <div className="h-3 w-12 rounded bg-slate-800/60" />
          </div>

          <div className="h-9 sm:h-10 w-full rounded-xl bg-slate-800/90" />
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<ProductCardSkeletonProps> = ({ count = 8 }) => {
  return (
    <div
      id="product-grid-skeleton"
      aria-label="Loading products"
      className="product-cards-grid grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 min-[400px]:gap-3.5 sm:gap-6"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={`skeleton-${idx}`} />
      ))}
    </div>
  );
};
