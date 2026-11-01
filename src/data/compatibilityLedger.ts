export interface IPhoneScreenEntry {
  model: string;
  inCell: number | null;
  jk: number | null;
  gx: number | null;
  oled: number | null;
}

export interface CompatibilityGroup {
  id: number;
  label: string;
  compatibleCodes: string[];
  popularPhones: string;
  averagePrice: string;
}

export interface LedgerItem {
  name: string;
  brand: string;
  price: string;
  notes?: string;
  category: string;
}

// iPhone Screen Replacement Ledger (Directly from Chuks Communication shop ledger dated 18/11/2025)
export const IPHONE_SCREEN_LEDGER: IPhoneScreenEntry[] = [
  { model: 'iPhone X / XS', inCell: 14000, jk: 20000, gx: 30000, oled: 35000 },
  { model: 'iPhone XS Max', inCell: 18000, jk: 25000, gx: 40000, oled: 48000 },
  { model: 'iPhone XR', inCell: 14000, jk: 22000, gx: 25000, oled: null },
  { model: 'iPhone 11', inCell: 14000, jk: 22000, gx: 25000, oled: null },
  { model: 'iPhone 11 Pro', inCell: 20000, jk: 25000, gx: 50000, oled: 55000 },
  { model: 'iPhone 11 Pro Max', inCell: 25000, jk: 30000, gx: 50000, oled: 60000 },
  { model: 'iPhone 12 / 12 Pro', inCell: 20000, jk: 27000, gx: 50000, oled: 65000 },
  { model: 'iPhone 12 Pro Max', inCell: 25000, jk: 40000, gx: 80000, oled: 95000 },
  { model: 'iPhone 13', inCell: 25000, jk: 45000, gx: 70000, oled: 85000 },
  { model: 'iPhone 13 Pro', inCell: 30000, jk: 50000, gx: 100000, oled: 120000 },
  { model: 'iPhone 13 Pro Max', inCell: 30000, jk: 50000, gx: 100000, oled: 130000 },
  { model: 'iPhone 14', inCell: 35000, jk: 50000, gx: 90000, oled: 110000 },
  { model: 'iPhone 14 Pro', inCell: 35000, jk: 50000, gx: 150000, oled: 200000 },
  { model: 'iPhone 14 Pro Max', inCell: 50000, jk: 80000, gx: 150000, oled: 200000 },
  { model: 'iPhone 15', inCell: 45000, jk: 65000, gx: 150000, oled: 180000 },
  { model: 'iPhone 15 Pro Max', inCell: 50000, jk: 90000, gx: 190000, oled: 230000 },
  { model: 'iPhone 16 / 16 Plus', inCell: 100000, jk: null, gx: 220000, oled: 300000 },
];

// Tecno, Infinix, Itel LCD Cross-Compatibility Ledger Codes (Images 4, 5, 6)
export const SCREEN_COMPATIBILITY_GROUPS: CompatibilityGroup[] = [
  {
    id: 1,
    label: '6525 / BG6 Series',
    compatibleCodes: ['6525', 'BG6', '6528', '6526', 'K30', 'K55', 'BG7'],
    popularPhones: 'Tecno Spark 4 / Spark Go / Infinix Smart 5 / Hot 9 Play',
    averagePrice: '₦10,000 - ₦11,000',
  },
  {
    id: 2,
    label: 'KM4 / KM5 Series',
    compatibleCodes: ['KM4', 'KM5'],
    popularPhones: 'Tecno Pop 5 / Pop 5 Go',
    averagePrice: '₦9,000 - ₦12,000',
  },
  {
    id: 3,
    label: 'BF7 / P40 / A60 Series',
    compatibleCodes: ['BF7', 'BF6', 'X6516', 'X6515', 'P40', 'A60', 'K15k', '689', 'A70'],
    popularPhones: 'Itel P40 / Itel A60 / Itel A70 / Infinix Smart 7 / Tecno Pop 7',
    averagePrice: '₦9,000 - ₦12,000',
  },
  {
    id: 4,
    label: 'X657 / P36 / P37 Series',
    compatibleCodes: ['X657', 'KE5', 'P36', 'P37', 'S16'],
    popularPhones: 'Infinix Hot 10 Play / Tecno Spark 6 Go / Itel P36 / Itel P37 / Itel S16',
    averagePrice: '₦10,000 - ₦12,000',
  },
  {
    id: 5,
    label: 'KF6 / BD3 / KG6 Series',
    compatibleCodes: ['KF6', 'X659', 'X658', 'BD3', 'KG6'],
    popularPhones: 'Tecno Spark 7 / Infinix Smart 5 Pro / Tecno Pop 4',
    averagePrice: '₦8,500 - ₦11,000',
  },
  {
    id: 6,
    label: '6725 / X6728 Series',
    compatibleCodes: ['6725', 'X6728'],
    popularPhones: 'Infinix Note 12 / Hot 20 series',
    averagePrice: '₦15,000 - ₦25,000',
  },
  {
    id: 7,
    label: 'KL4 / KL5 / X6532 Series',
    compatibleCodes: ['KL4', 'KL5', 'X6532', 'X6531'],
    popularPhones: 'Tecno Spark 8 / 8C / Infinix Smart 6 Plus',
    averagePrice: '₦11,000 - ₦13,000',
  },
  {
    id: 8,
    label: 'KI7 / X6831 / X6836 Series',
    compatibleCodes: ['KI7', 'X6831', 'X6833', 'X6836', 'LB6'],
    popularPhones: 'Tecno Spark 10 / 10C / Infinix Hot 30 / Hot 30i',
    averagePrice: '₦10,000 - ₦14,000',
  },
  {
    id: 9,
    label: 'X693 / LF7 Series',
    compatibleCodes: ['X693', 'X697', 'LF7', 'LE7'],
    popularPhones: 'Infinix Note 11 / Note 11 Pro / Tecno Camon 18 Premier',
    averagePrice: '₦15,000 - ₦25,000',
  },
  {
    id: 10,
    label: 'BD4J / X6511C / KG5 Series',
    compatibleCodes: ['BD4J', 'X6511C', 'KG5'],
    popularPhones: 'Tecno Pop 5P / Infinix Smart 6 HD / Spark 8',
    averagePrice: '₦9,000 - ₦11,000',
  },
  {
    id: 11,
    label: 'KD7 / X655 / CD7 Series',
    compatibleCodes: ['KD7', 'X655', 'CD7', 'X656'],
    popularPhones: 'Tecno Spark 5 / 5 Air / Infinix Hot 9 / Camon 15',
    averagePrice: '₦10,000 - ₦12,000',
  },
  {
    id: 12,
    label: 'KH6 / KG5K / S18 / BF8 Series',
    compatibleCodes: ['KH6', 'KG5K', 'S18', 'BF8', 'P38'],
    popularPhones: 'Tecno Spark 8P / 9 / Itel S18 / P38 / Pop 7 Pro',
    averagePrice: '₦8,500 - ₦12,000',
  },
  {
    id: 13,
    label: 'X688 / LE6 / P37 Pro Series',
    compatibleCodes: ['X688', 'LE6', 'P37 pro'],
    popularPhones: 'Infinix Hot 10 / Tecno Camon 16 / Itel P37 Pro',
    averagePrice: '₦11,000 - ₦13,000',
  },
  {
    id: 14,
    label: 'X690 / CG7 / KC8 Series',
    compatibleCodes: ['X690', 'CG7', 'KC8'],
    popularPhones: 'Infinix Zero 8 / Tecno Camon 17 / Spark 4 Air',
    averagePrice: '₦12,000 - ₦15,000',
  },
  {
    id: 15,
    label: 'X6816 / 6817 / X6819 / P40+ Series',
    compatibleCodes: ['X6816', '6817', 'X6819', '6835', 'P40+'],
    popularPhones: 'Infinix Hot 12 Play / Hot 12i / Hot 20i / Itel P40 Plus',
    averagePrice: '₦10,000 - ₦12,000',
  },
  {
    id: 20,
    label: 'X626 / 627 / CB7 / 663 / 671 Series',
    compatibleCodes: ['X626', '627', 'CB7', '663', '671'],
    popularPhones: 'Infinix Hot 7 / Hot 7 Pro / Tecno Camon 11 / 11 Pro',
    averagePrice: '₦10,000 - ₦12,000',
  },
];

// Android Phone LCD Ledger (Directly from handwritten sheets)
export const ANDROID_LEDGER_ITEMS: LedgerItem[] = [
  // Samsung
  { name: 'Samsung Galaxy S21 Ultra', brand: 'Samsung', price: '₦170,000', notes: 'Original AMOLED Service Pack', category: 'screens' },
  { name: 'Samsung Galaxy S20 5G', brand: 'Samsung', price: '₦100,000', notes: 'Dynamic AMOLED 120Hz', category: 'screens' },
  { name: 'Samsung Galaxy S10 / S10e', brand: 'Samsung', price: '₦90,000 - ₦170,000', notes: 'InCell ₦90k / Original ₦130k-₦170k', category: 'screens' },
  { name: 'Samsung Galaxy S9 / S9+', brand: 'Samsung', price: '₦40,000', notes: 'Curved Super AMOLED Normal', category: 'screens' },
  { name: 'Samsung Galaxy Note 8', brand: 'Samsung', price: '₦50,000 - ₦250,000', notes: 'Normal ₦50k / Original Service Pack ₦250k', category: 'screens' },
  { name: 'Samsung Galaxy A71', brand: 'Samsung', price: '₦13,500 - ₦60,000', notes: 'Incell ₦13.5k-₦15k / OLED Original ₦50k-₦60k', category: 'screens' },
  { name: 'Samsung Galaxy A53 5G', brand: 'Samsung', price: '₦20,000 - ₦60,000', notes: 'Incell ₦20k / Original AMOLED ₦60k', category: 'screens' },
  { name: 'Samsung Galaxy A51', brand: 'Samsung', price: '₦12,000 - ₦35,000', notes: 'Incell ₦12k / OLED ₦35k', category: 'screens' },
  { name: 'Samsung Galaxy A42', brand: 'Samsung', price: '₦20,000 - ₦60,000', notes: 'Incell ₦20k / OLED ₦60k', category: 'screens' },
  { name: 'Samsung Galaxy A35', brand: 'Samsung', price: '₦15,000 - ₦35,000', notes: 'FHD+ High Quality', category: 'screens' },
  { name: 'Samsung Galaxy A25 5G', brand: 'Samsung', price: '₦17,000 - ₦50,000', notes: 'Incell ₦17k / OLED ₦50k', category: 'screens' },
  { name: 'Samsung Galaxy A22', brand: 'Samsung', price: '₦13,000 - ₦20,000', notes: '90Hz HD+ Super AMOLED', category: 'screens' },
  { name: 'Samsung Galaxy A21s', brand: 'Samsung', price: '₦12,000', notes: 'PLS TFT Display Assembly', category: 'screens' },
  { name: 'Samsung Galaxy A06', brand: 'Samsung', price: '₦13,000', notes: 'HD+ Display Assembly', category: 'screens' },
  { name: 'Samsung Galaxy A05 / A05 + Frame', brand: 'Samsung', price: '₦18,000 - ₦20,000', notes: 'Includes middle frame pre-assembled', category: 'screens' },
  { name: 'Samsung Galaxy A04e / A02s / A03s', brand: 'Samsung', price: '₦12,000', notes: 'High touch responsiveness', category: 'screens' },
  { name: 'Samsung Galaxy M04', brand: 'Samsung', price: '₦12,000', notes: 'PLS LCD', category: 'screens' },
  { name: 'Samsung Galaxy J7 / J330', brand: 'Samsung', price: '₦12,000', notes: 'Super AMOLED replacement', category: 'screens' },

  // Tecno & Infinix
  { name: 'Tecno Phantom X', brand: 'Tecno', price: '₦75,000', notes: 'Curved AMOLED Display', category: 'screens' },
  { name: 'Infinix Zero Ultra (X6821 / X6853)', brand: 'Infinix', price: '₦60,000 - ₦90,000', notes: 'Original 120Hz Curved AMOLED (6821 ori ₦90k / 6853 ₦60k)', category: 'screens' },
  { name: 'Tecno Spark 10 / 10C (KI7 / LB6)', brand: 'Tecno', price: '₦10,000 - ₦14,000', notes: '90Hz Display assembly', category: 'screens' },
  { name: 'Tecno Camon 17 / 18 / CG8 / CG7', brand: 'Tecno', price: '₦12,000', notes: 'Crisp color gamut', category: 'screens' },
  { name: 'Tecno Spark 8 / 8P (KG5K / KG7 / KL4)', brand: 'Tecno', price: '₦8,500 - ₦11,000', notes: 'Spark series best-seller', category: 'screens' },
  { name: 'Tecno KL7 OLED', brand: 'Tecno', price: '₦20,000 - ₦60,000', notes: 'Incell ₦20k / OLED ₦60k', category: 'screens' },
  { name: 'Infinix Note 30 (X678 ori / X6716)', brand: 'Infinix', price: '₦45,000 - ₦60,000', notes: 'Original 120Hz panel', category: 'screens' },
  { name: 'Infinix Hot 10 / Hot 11 / Hot 12 (X682 / X688 / X6816)', brand: 'Infinix', price: '₦10,000 - ₦12,000', notes: 'Popular technician stock', category: 'screens' },
  { name: 'Infinix Smart 5 / Smart 6 / Smart 7 (X650 / X6511 / X6525)', brand: 'Infinix', price: '₦8,500 - ₦11,000', notes: '650 ₦8,500 / 6511 ₦9,000 / 6525 ₦10,000', category: 'screens' },
  { name: 'Itel A70 / P40 / P37 / P36', brand: 'Tecno', price: '₦9,000 - ₦12,000', notes: 'Hel A70 ₦9k / P40 ₦10k / P37 ₦12k', category: 'screens' },

  // Oppo
  { name: 'Oppo R9', brand: 'Oppo', price: '₦35,000', notes: 'Super AMOLED panel', category: 'screens' },
  { name: 'Oppo Reno 7', brand: 'Oppo', price: '₦15,000', notes: 'AMOLED 90Hz Display', category: 'screens' },
  { name: 'Oppo A83 / A3S / A57 Old', brand: 'Oppo', price: '₦11,000 - ₦12,000', notes: 'A57 old ₦11k / A83 ₦12k / A3S ₦12k', category: 'screens' },
  { name: 'Oppo A75 / A76', brand: 'Oppo', price: '₦12,000 - ₦13,000', notes: 'A75 ₦12k / A76 ₦13k', category: 'screens' },
  { name: 'Oppo F9', brand: 'Oppo', price: '₦12,000', notes: 'Waterdrop FHD+ panel', category: 'screens' },

  // Vivo
  { name: 'Vivo Y21e', brand: 'Vivo', price: '₦45,000', notes: 'High grade assembly', category: 'screens' },
  { name: 'Vivo Y20', brand: 'Vivo', price: '₦12,000', notes: 'Halo FullView Display', category: 'screens' },
  { name: 'Vivo Y19', brand: 'Vivo', price: '₦20,000', notes: 'FHD+ display with touch glass', category: 'screens' },
  { name: 'Vivo Y02 / Y04 / Y1x', brand: 'Vivo', price: '₦11,000 - ₦15,000', notes: 'Y1x ₦11k / Y02 ₦13k / Y04 ₦15k', category: 'screens' },

  // Xiaomi & Others
  { name: 'Redmi 10C / Redmi A53', brand: 'Xiaomi', price: '₦12,000 - ₦20,000', notes: 'Redmi 10C ₦12k / Redmi A53 ₦15k-₦60k', category: 'screens' },
  { name: 'Nokia C30 / Nokia 3.1 Plus', brand: 'Universal', price: '₦12,000', notes: 'HD+ IPS LCD', category: 'screens' },
  { name: 'Huawei P20 Lite / Honor 7A / 8C / Y7 Prime', brand: 'Universal', price: '₦12,000', notes: 'Honor 7A ₦12k / Honor 8C ₦12k / Y7 ₦12k', category: 'screens' },
  { name: 'Gionee S10L / S11 Lite', brand: 'Universal', price: '₦12,000 - ₦13,000', notes: 'S10L ₦12k / S11 Lite ₦13k', category: 'screens' },
];
