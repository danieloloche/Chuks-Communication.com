import { INITIAL_PRODUCTS } from '../data/initialProducts';

/**
 * Proactively precaches essential product images and fonts into CacheStorage
 * so they load instantly even when the user is completely offline.
 */
export async function precacheProductAssets(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const cache = await caches.open('product-images-cache');
    
    // Extract unique product image URLs (if any exist)
    const imageUrls = Array.from(
      new Set(INITIAL_PRODUCTS.map((p) => p.image).filter((img): img is string => Boolean(img && img.trim().length > 0)))
    );

    if (imageUrls.length === 0) {
      return;
    }

    // Fetch and cache product images in batches to prevent network congestion
    const batchSize = 4;
    for (let i = 0; i < imageUrls.length; i += batchSize) {
      const batch = imageUrls.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(async (url) => {
          try {
            const match = await cache.match(url);
            if (!match) {
              const response = await fetch(url, { mode: 'cors' });
              if (response.ok) {
                await cache.put(url, response);
              }
            }
          } catch {
            // Silently handle if offline or blocked
          }
        })
      );
    }
  } catch (err) {
    console.debug('Asset precache note:', err);
  }
}
