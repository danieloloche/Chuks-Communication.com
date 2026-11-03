import { PriceDropAlert, Product } from '../types';

const STORAGE_KEY = 'chuks_price_drop_alerts';
const EVENT_NAME = 'chuks_alerts_updated';

/**
 * Retrieve stored price drop alerts from localStorage.
 */
export function getStoredAlerts(): PriceDropAlert[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read price drop alerts:', err);
    return [];
  }
}

/**
 * Save or update a price drop alert for a product.
 */
export function saveAlert(data: {
  product: Product;
  targetPrice?: number;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}): PriceDropAlert {
  const currentAlerts = getStoredAlerts();
  const existingIndex = currentAlerts.findIndex((a) => a.productId === data.product.id);

  const alertItem: PriceDropAlert = {
    id: existingIndex >= 0 ? currentAlerts[existingIndex].id : `alert-${Date.now()}`,
    productId: data.product.id,
    productName: data.product.name,
    productImage: data.product.image || '',
    productBrand: data.product.brand,
    initialPrice: existingIndex >= 0 ? currentAlerts[existingIndex].initialPrice : data.product.price,
    currentPrice: data.product.price,
    targetPrice: data.targetPrice,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    createdAt: existingIndex >= 0 ? currentAlerts[existingIndex].createdAt : new Date().toISOString(),
    notes: data.notes,
  };

  let updatedList: PriceDropAlert[];
  if (existingIndex >= 0) {
    updatedList = [...currentAlerts];
    updatedList[existingIndex] = alertItem;
  } else {
    updatedList = [alertItem, ...currentAlerts];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updatedList }));
  } catch (err) {
    console.error('Failed to save price drop alert:', err);
  }

  return alertItem;
}

/**
 * Remove an alert by product ID.
 */
export function removeAlert(productId: string): void {
  const currentAlerts = getStoredAlerts();
  const updatedList = currentAlerts.filter((a) => a.productId !== productId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updatedList }));
  } catch (err) {
    console.error('Failed to remove price drop alert:', err);
  }
}

/**
 * Check if a product already has an active price drop alert.
 */
export function isProductAlerted(productId: string): boolean {
  const currentAlerts = getStoredAlerts();
  return currentAlerts.some((a) => a.productId === productId);
}

/**
 * Get alert details for a specific product if it exists.
 */
export function getProductAlert(productId: string): PriceDropAlert | undefined {
  const currentAlerts = getStoredAlerts();
  return currentAlerts.find((a) => a.productId === productId);
}

/**
 * Clear all price drop alerts.
 */
export function clearAllAlerts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: [] }));
  } catch (err) {
    console.error('Failed to clear price drop alerts:', err);
  }
}

/**
 * Save or update a Back-in-Stock alert subscription for an out-of-stock product.
 */
export function saveBackInStockAlert(data: {
  product: Product;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  requestedQuantity?: number;
}): PriceDropAlert {
  const currentAlerts = getStoredAlerts();
  const existingIndex = currentAlerts.findIndex((a) => a.productId === data.product.id);

  const alertItem: PriceDropAlert = {
    id: existingIndex >= 0 ? currentAlerts[existingIndex].id : `stock-alert-${Date.now()}`,
    productId: data.product.id,
    productName: data.product.name,
    productImage: data.product.image || '',
    productBrand: data.product.brand,
    initialPrice: data.product.price,
    currentPrice: data.product.price,
    targetPrice: data.product.price,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    createdAt: existingIndex >= 0 ? currentAlerts[existingIndex].createdAt : new Date().toISOString(),
    notes: data.notes,
    alertType: 'back_in_stock',
    isBackInStockAlert: true,
    requestedQuantity: data.requestedQuantity || 1,
  };

  let updatedList: PriceDropAlert[];
  if (existingIndex >= 0) {
    updatedList = [...currentAlerts];
    updatedList[existingIndex] = alertItem;
  } else {
    updatedList = [alertItem, ...currentAlerts];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updatedList }));
  } catch (err) {
    console.error('Failed to save back-in-stock alert:', err);
  }

  return alertItem;
}

/**
 * Check if a product has an active back-in-stock alert subscription.
 */
export function isProductBackInStockAlerted(productId: string): boolean {
  const currentAlerts = getStoredAlerts();
  return currentAlerts.some((a) => a.productId === productId && (a.isBackInStockAlert || a.alertType === 'back_in_stock'));
}

/**
 * Retrieve only back-in-stock alert subscriptions.
 */
export function getStoredBackInStockAlerts(): PriceDropAlert[] {
  return getStoredAlerts().filter((a) => a.isBackInStockAlert || a.alertType === 'back_in_stock');
}

/**
 * Retrieve only price drop alerts.
 */
export function getStoredPriceDropAlerts(): PriceDropAlert[] {
  return getStoredAlerts().filter((a) => !a.isBackInStockAlert && a.alertType !== 'back_in_stock');
}

/**
 * Subscribe to changes in alerts from anywhere in the app.
 */
export function subscribeToAlerts(callback: (alerts: PriceDropAlert[]) => void): () => void {
  const handler = () => {
    callback(getStoredAlerts());
  };

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}

