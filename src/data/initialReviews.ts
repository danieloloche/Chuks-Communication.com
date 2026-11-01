import { ProductReview } from '../types';

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-s24u-1',
    productId: 'prod-s24u-screen',
    customerName: 'Engr. Emeka Okoye',
    rating: 5,
    comment: 'Authentic Samsung Service Pack screen with titanium frame. Tested touch, S-Pen digitizer, and 120Hz LTPO refresh rate before snapping into frame. Flawless 2,600 nits brightness!',
    date: '2026-08-28',
    technicianRole: 'Master Phone Engineer, Computer Village',
    verifiedPurchase: true,
    helpfulCount: 14,
  },
  {
    id: 'rev-s24u-2',
    productId: 'prod-s24u-screen',
    customerName: 'Babajide Adeleke',
    rating: 5,
    comment: 'Ordered 2 units for customer repairs. Fast dispatch within Lagos, wrapped properly in anti-static ESD bubble packaging. Testing warranty gave me full peace of mind.',
    date: '2026-08-15',
    technicianRole: 'Mobile Repair Shop Owner',
    verifiedPurchase: true,
    helpfulCount: 8,
  },
  {
    id: 'rev-s24u-3',
    productId: 'prod-s24u-screen',
    customerName: 'Chimaobi Nnamdi',
    rating: 4,
    comment: 'Very good display. Frame buttons click crisply. Just be careful when transferring the proximity sensor flex from the old chassis.',
    date: '2026-08-02',
    technicianRole: 'Technician',
    verifiedPurchase: true,
    helpfulCount: 5,
  },
  {
    id: 'rev-ip15pm-1',
    productId: 'prod-ip15pm-screen',
    customerName: 'Samson Adeyemi',
    rating: 5,
    comment: 'Transferred original EEPROM IC chip and TrueTone migrated without any error message! 120Hz ProMotion is super fluid. Truly original OLED display.',
    date: '2026-08-24',
    technicianRole: 'Senior Apple Hardware Specialist',
    verifiedPurchase: true,
    helpfulCount: 19,
  },
  {
    id: 'rev-ip15pm-2',
    productId: 'prod-ip15pm-screen',
    customerName: 'Tunde Bakare',
    rating: 5,
    comment: 'Bezel thickness is 1:1 original, colors are vibrant and Ceramic Shield glass feels solid. Chuks Store is my go-to plug in Ikeja.',
    date: '2026-08-11',
    technicianRole: 'Verified Buyer',
    verifiedPurchase: true,
    helpfulCount: 6,
  },
  {
    id: 'rev-ip14pm-batt-1',
    productId: 'prod-ip14pm-batt',
    customerName: 'Uchechukwu Gabriel',
    rating: 5,
    comment: 'Zero cycles recorded on 3uTools. Maximum battery capacity shows 100% health in iOS settings. Tested under heavy gaming load with zero overheating.',
    date: '2026-08-29',
    technicianRole: 'Certified Smartphone Tech',
    verifiedPurchase: true,
    helpfulCount: 11,
  },
  {
    id: 'rev-ip14pm-batt-2',
    productId: 'prod-ip14pm-batt',
    customerName: 'Oluwaseun Daniels',
    rating: 5,
    comment: 'Pre-applied adhesive pull tabs made installation very neat. Excellent holding charge after 3 discharge cycles.',
    date: '2026-08-19',
    technicianRole: 'DIY Repairer',
    verifiedPurchase: true,
    helpfulCount: 4,
  },
  {
    id: 'rev-s23u-batt-1',
    productId: 'prod-s23u-batt',
    customerName: 'Ibrahim Musa',
    rating: 5,
    comment: 'Full 5000mAh capacity verified with USB-C power tester. Fast charging 2.0 (45W) triggers properly without throttling.',
    date: '2026-08-22',
    technicianRole: 'Samsung Repair Tech, Abuja',
    verifiedPurchase: true,
    helpfulCount: 7,
  },
  {
    id: 'rev-glue-1',
    productId: 'prod-sunshine-glue',
    customerName: 'Kingsley Onyeka',
    rating: 5,
    comment: 'Sunshine T-7000 black adhesive is the industry standard. High elasticity, pin-in-cap nozzle prevents clogging. Clean seal around phone chassis.',
    date: '2026-08-30',
    technicianRole: 'Workshop Foreman',
    verifiedPurchase: true,
    helpfulCount: 15,
  },
  {
    id: 'rev-station-1',
    productId: 'prod-200w-station',
    customerName: 'David Alabi',
    rating: 5,
    comment: 'Heats up to 350°C in just 2.5 seconds with C210 precision tips. Sleep sensor in holder saves tip lifespan. Remarkable value for microsoldering.',
    date: '2026-08-26',
    technicianRole: 'Micro-soldering Engineer',
    verifiedPurchase: true,
    helpfulCount: 12,
  },
];

const STORAGE_KEY = 'chuks_store_product_reviews';

export function getStoredReviews(): ProductReview[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return INITIAL_REVIEWS;
    const parsed = JSON.parse(data) as ProductReview[];
    // Merge initial reviews with any newly added ones if needed
    const existingIds = new Set(parsed.map((r) => r.id));
    const merged = [...parsed];
    for (const initRev of INITIAL_REVIEWS) {
      if (!existingIds.has(initRev.id)) {
        merged.push(initRev);
      }
    }
    return merged;
  } catch (err) {
    console.warn('Error reading stored reviews:', err);
    return INITIAL_REVIEWS;
  }
}

export function saveReview(newReview: ProductReview): ProductReview[] {
  try {
    const current = getStoredReviews();
    const updated = [newReview, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Error saving review to storage:', err);
    return [newReview, ...INITIAL_REVIEWS];
  }
}
