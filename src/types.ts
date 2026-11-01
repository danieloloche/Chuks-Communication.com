export type ProductCategory =
  | 'all'
  | 'screens'
  | 'batteries'
  | 'charging-flex'
  | 'calibrators'
  | 'cameras'
  | 'housings-glass'
  | 'accessories'
  | 'tools';

export type ProductBrand =
  | 'Apple'
  | 'Samsung'
  | 'Tecno'
  | 'Infinix'
  | 'Xiaomi'
  | 'Oppo'
  | 'Vivo'
  | 'Google Pixel'
  | 'OnePlus'
  | 'Universal';

export type RepairDifficulty = 'Beginner' | 'Moderate' | 'Advanced';

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number; // 1 to 5 stars
  comment: string;
  date: string;
  technicianRole?: string;
  verifiedPurchase?: boolean;
  helpfulCount?: number;
}

export interface Product {
  id: string;
  name: string;
  brand: ProductBrand;
  category: ProductCategory;
  price: number;
  originalPrice: number;
  stock: number;
  sku: string;
  condition: 'Original Service Pack' | 'OEM Pulled' | 'AAA+ High Quality' | 'Brand New Genuine';
  warranty: string;
  rating: number;
  reviewCount: number;
  image?: string;
  description: string;
  specs: Record<string, string>;
  compatibleModels: string[];
  isNewArrival?: boolean;
  isFeatured?: boolean;
  repairDifficulty: RepairDifficulty;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type PaymentMethod = 'card' | 'transfer' | 'ussd' | 'cash_on_delivery';

export type OrderStatus = 'processing' | 'packed' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    image?: string;
    brand: string;
  }[];
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  promoCode?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryNotes?: string;
  technicianNote?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending';
  orderStatus: OrderStatus;
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: 'new_arrival' | 'promo' | 'inventory_alert' | 'order_update';
  timestamp: string;
  read?: boolean;
  actionUrl?: string;
  promoCode?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedProductIds?: string[];
  suggestedProducts?: Product[];
  trackedOrderId?: string;
}

export interface StorePolicy {
  title: string;
  icon: string;
  summary: string;
  details: string;
}

export interface PriceDropAlert {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  productBrand: string;
  initialPrice: number;
  currentPrice: number;
  targetPrice?: number;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  notes?: string;
  alertType?: 'price_drop' | 'back_in_stock';
  isBackInStockAlert?: boolean;
  requestedQuantity?: number;
}

export interface ShopInvoiceItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
  productId?: string;
  sku?: string;
}

export interface ShopInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  date: string;
  items: ShopInvoiceItem[];
  subtotal: number;
  discount: number;
  transportFee: number;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  paymentMethod?: 'cash' | 'transfer' | 'pos' | 'credit';
  notes?: string;
  createdAt: string;
}

