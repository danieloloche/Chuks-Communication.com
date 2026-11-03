import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Printer,
  Share2,
  Copy,
  Check,
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  History,
  FileText,
  RotateCcw,
  Sparkles,
  Phone,
  Calendar,
  User,
  CheckCircle2,
  FileCheck,
  MessageCircle,
  Eye,
  SlidersHorizontal,
  Download,
  Receipt,
  CreditCard,
  Banknote,
  ChevronDown,
} from 'lucide-react';
import { Product, ShopInvoice, ShopInvoiceItem } from '../types';
import { formatNairaInWords } from '../utils/numberToWords';
import {
  printDirectHtml,
  generateShopInvoicePadHtml,
  generateThermalPosReceiptHtml,
  downloadReceiptHtml,
  ShopInvoicePrintData,
} from '../utils/printHelpers';

interface ShopInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProduct?: Product | null;
  onAddToCartBatch?: (items: { product: Product; quantity: number }[]) => void;
}

const STORAGE_KEY = 'chuks_saved_shop_invoices';

export const ShopInvoiceModal: React.FC<ShopInvoiceModalProps> = ({
  isOpen,
  onClose,
  products,
  initialProduct,
  onAddToCartBatch,
}) => {
  // Theme toggle: 'paper' (authentic blue-ink paper pad like photo) or 'dark' (modern stone/amber)
  const [themeMode, setThemeMode] = useState<'paper' | 'dark'>('paper');

  // Customer & Invoice Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  });
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    const d = new Date();
    const num = Math.floor(100 + Math.random() * 900);
    return `INV-${d.getFullYear().toString().slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${num}`;
  });

  // Line items
  const [items, setItems] = useState<ShopInvoiceItem[]>([
    {
      id: 'row-1',
      description: 'Tecno Spark 7 Charging Down Board (Original IC)',
      qty: 2,
      unitPrice: 3500,
      amount: 7000,
    },
    {
      id: 'row-2',
      description: 'Samsung Galaxy A12 Screen Assembly (JK Grade)',
      qty: 1,
      unitPrice: 19500,
      amount: 19500,
    },
    {
      id: 'row-3',
      description: 'iPhone 11 Display Panel (InCell AAA+)',
      qty: 1,
      unitPrice: 18500,
      amount: 18500,
    },
  ]);

  // Adjustments & Live Payment
  const [discount, setDiscount] = useState<number>(0);
  const [transportFee, setTransportFee] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'pos' | 'credit'>('cash');
  const [notes, setNotes] = useState('Tested and verified. 30-day screen testing warranty applies before installation.');

  // Quick Model Search Bar State
  const [modelSearchQuery, setModelSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Quick Customer Text Paste Parser State
  const [isParserOpen, setIsParserOpen] = useState(false);
  const [rawTextToParse, setRawTextToParse] = useState('');

  // UI States
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);
  const [printSuccessFeedback, setPrintSuccessFeedback] = useState<string | null>(null);
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<ShopInvoice[]>([]);

  // Print ref
  const invoicePaperRef = useRef<HTMLDivElement>(null);

  // Load saved invoices from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedInvoices(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load saved invoices:', e);
    }
  }, []);

  // Pre-fill initial product if passed via Quick Actions / Catalog
  useEffect(() => {
    if (isOpen && initialProduct) {
      setItems((prev) => {
        // If there's an empty row, replace it
        if (prev.length === 1 && !prev[0].description.trim()) {
          return [
            {
              id: `row-${Date.now()}`,
              description: `${initialProduct.brand} ${initialProduct.name}`,
              qty: 1,
              unitPrice: initialProduct.price,
              amount: initialProduct.price,
              productId: initialProduct.id,
              sku: initialProduct.sku,
            },
          ];
        }
        // Otherwise append if not already in items
        const exists = prev.some(
          (item) => item.productId === initialProduct.id || (item.sku && item.sku === initialProduct.sku)
        );
        if (!exists) {
          return [
            ...prev,
            {
              id: `row-${Date.now()}`,
              description: `${initialProduct.brand} ${initialProduct.name}`,
              qty: 1,
              unitPrice: initialProduct.price,
              amount: initialProduct.price,
              productId: initialProduct.id,
              sku: initialProduct.sku,
            },
          ];
        }
        return prev;
      });
    }
  }, [isOpen, initialProduct]);

  // Filter products for quick model search
  const filteredProducts = useMemo(() => {
    if (!modelSearchQuery.trim()) return [];
    const query = modelSearchQuery.toLowerCase().trim();
    return products
      .filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(query);
        const skuMatch = p.sku.toLowerCase().includes(query);
        const modelMatch = p.compatibleModels.some((m) => m.toLowerCase().includes(query));
        const brandMatch = p.brand.toLowerCase().includes(query);
        return nameMatch || skuMatch || modelMatch || brandMatch;
      })
      .slice(0, 6);
  }, [products, modelSearchQuery]);

  // Line calculations
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const total = Math.max(0, subtotal - (discount || 0) + (transportFee || 0));
  const totalInWords = formatNairaInWords(total);
  const balanceDue = Math.max(0, total - (amountPaid || 0));

  // Update a single row field
  const handleUpdateItem = (id: string, field: keyof ShopInvoiceItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        if (field === 'qty' || field === 'unitPrice') {
          const qty = field === 'qty' ? Math.max(1, Number(value) || 1) : item.qty;
          const unitPrice = field === 'unitPrice' ? Math.max(0, Number(value) || 0) : item.unitPrice;
          updated.qty = qty;
          updated.unitPrice = unitPrice;
          updated.amount = qty * unitPrice;
        }
        return updated;
      })
    );
  };

  // Add a product from catalog search
  const handleAddProductFromCatalog = (product: Product) => {
    const newItem: ShopInvoiceItem = {
      id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: `${product.brand} ${product.name}`,
      qty: 1,
      unitPrice: product.price,
      amount: product.price,
      productId: product.id,
      sku: product.sku,
    };
    setItems((prev) => [...prev, newItem]);
    setModelSearchQuery('');
    setShowSearchDropdown(false);
  };

  // Add a blank row
  const handleAddBlankRow = () => {
    const newItem: ShopInvoiceItem = {
      id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      description: '',
      qty: 1,
      unitPrice: 0,
      amount: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    if (items.length <= 1) {
      setItems([{ id: 'row-1', description: '', qty: 1, unitPrice: 0, amount: 0 }]);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Smart Parser for customer WhatsApp messages / model list
  const handleParseCustomerMessage = () => {
    if (!rawTextToParse.trim()) return;

    const lines = rawTextToParse
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsedItems: ShopInvoiceItem[] = [];

    lines.forEach((line) => {
      // Remove leading bullets or numbering: e.g. "1.", "-", "*", "•"
      let cleanLine = line.replace(/^[\d+.)\-*•]+\s*/, '').trim();

      // Look for quantity pattern at end or beginning: e.g. "x 2", "2 pcs", "2pcs", "- 2"
      let qty = 1;
      const qtyMatchEnd = cleanLine.match(/[-xX:]?\s*(\d+)\s*(pcs|pieces|units|qty|pk)?\s*$/i);
      const qtyMatchStart = cleanLine.match(/^(\d+)\s*(pcs|pieces|units|qty|x|X)?\s*[-:]?\s*(.+)$/i);

      if (qtyMatchStart && Number(qtyMatchStart[1]) > 0) {
        qty = Number(qtyMatchStart[1]);
        cleanLine = qtyMatchStart[3].trim();
      } else if (qtyMatchEnd && Number(qtyMatchEnd[1]) > 0) {
        qty = Number(qtyMatchEnd[1]);
        cleanLine = cleanLine.replace(/[-xX:]?\s*\d+\s*(pcs|pieces|units|qty|pk)?\s*$/i, '').trim();
      }

      // Try to find matching product in catalog
      const lower = cleanLine.toLowerCase();
      const matched = products.find((p) => {
        const nameLower = p.name.toLowerCase();
        const skuLower = p.sku.toLowerCase();
        const modelMatch = p.compatibleModels.some((m) => lower.includes(m.toLowerCase()));
        return (
          nameLower.includes(lower) ||
          lower.includes(nameLower) ||
          skuLower === lower ||
          modelMatch
        );
      });

      const unitPrice = matched ? matched.price : 0;
      parsedItems.push({
        id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        description: cleanLine || (matched ? matched.name : 'Phone Part'),
        qty,
        unitPrice,
        amount: qty * unitPrice,
        productId: matched?.id,
        sku: matched?.sku,
      });
    });

    if (parsedItems.length > 0) {
      setItems(parsedItems);
      setIsParserOpen(false);
      setRawTextToParse('');
    }
  };

  // Generate clean WhatsApp message
  const generateWhatsAppMessage = () => {
    let msg = `🧾 *CHUKS-OGO SAM VENTURES*\n`;
    msg += `📞 08084643919, 07039564380\n`;
    msg += `📍 Park Road, Gwagwalada, Abuja\n`;
    msg += `--------------------------------\n`;
    msg += `*INVOICE / BILL: ${invoiceNumber}*\n`;
    if (customerName) msg += `Customer: *${customerName}*\n`;
    msg += `Date: ${invoiceDate}\n`;
    msg += `--------------------------------\n`;
    msg += `*ITEMS & PRICES:*\n`;

    items.forEach((item, idx) => {
      if (!item.description.trim()) return;
      msg += `${idx + 1}. ${item.description}\n`;
      msg += `   ${item.qty} pcs @ ₦${item.unitPrice.toLocaleString()} = *₦${item.amount.toLocaleString()}*\n`;
    });

    msg += `--------------------------------\n`;
    msg += `Subtotal: ₦${subtotal.toLocaleString()}\n`;
    if (discount > 0) msg += `Discount: -₦${discount.toLocaleString()}\n`;
    if (transportFee > 0) msg += `Waybill / Transport: +₦${transportFee.toLocaleString()}\n`;
    msg += `*TOTAL AMOUNT: ₦${total.toLocaleString()}*\n`;
    msg += `*(${totalInWords})*\n`;
    if (amountPaid > 0) {
      msg += `Amount Paid: ₦${amountPaid.toLocaleString()} (${paymentMethod.toUpperCase()})\n`;
      msg += `*BALANCE DUE: ₦${balanceDue.toLocaleString()}*\n`;
    }
    msg += `--------------------------------\n`;
    msg += `💳 *BANK TRANSFER DETAILS:*\n`;
    msg += `• Bank Name: *Moniepoint MFB*\n`;
    msg += `• Account Name: *Chuks Ogo Sam Venture*\n`;
    msg += `• Account Number: *8163301810*\n`;
    msg += `• Accepted From: All Banks, USSD & OPay\n`;
    msg += `--------------------------------\n`;
    if (notes) msg += `_Note: ${notes}_\n\n`;
    msg += `Thank you for your business! 🙏`;

    return msg;
  };

  // Send to WhatsApp
  const handleSendWhatsApp = () => {
    const text = generateWhatsAppMessage();
    const encoded = encodeURIComponent(text);
    const cleanPhone = customerPhone.replace(/\D/g, '');
    let targetUrl = `https://wa.me/?text=${encoded}`;
    if (cleanPhone) {
      const international = cleanPhone.startsWith('0')
        ? `234${cleanPhone.slice(1)}`
        : cleanPhone.startsWith('234')
        ? cleanPhone
        : `234${cleanPhone}`;
      targetUrl = `https://wa.me/${international}?text=${encoded}`;
    }
    window.open(targetUrl, '_blank');
  };

  // Copy invoice text
  const handleCopyText = async () => {
    const text = generateWhatsAppMessage();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  // Compile full invoice print payload
  const getInvoicePrintData = (): ShopInvoicePrintData => ({
    invoiceNumber,
    date: invoiceDate,
    customerName: customerName || 'Walk-in Customer',
    customerPhone: customerPhone || undefined,
    items,
    subtotal,
    discount,
    transportFee,
    total,
    amountPaid: amountPaid > 0 ? amountPaid : undefined,
    balanceDue: amountPaid > 0 ? balanceDue : undefined,
    paymentMethod,
    notes,
  });

  // Print Full Authentic Invoice Pad (A4 / Half Sheet)
  const handlePrintPad = () => {
    const data = getInvoicePrintData();
    const html = generateShopInvoicePadHtml(data);
    printDirectHtml(html, `Invoice-${invoiceNumber}`);
    setPrintSuccessFeedback('🖨️ Sent invoice pad to print dialog!');
    setIsPrintMenuOpen(false);
    setTimeout(() => setPrintSuccessFeedback(null), 3500);
  };

  // Print 80mm / 58mm POS Thermal Slip
  const handlePrintThermal = () => {
    const data = getInvoicePrintData();
    const html = generateThermalPosReceiptHtml(data);
    printDirectHtml(html, `Thermal-Receipt-${invoiceNumber}`);
    setPrintSuccessFeedback('🧾 Sent thermal receipt to print dialog!');
    setIsPrintMenuOpen(false);
    setTimeout(() => setPrintSuccessFeedback(null), 3500);
  };

  // Download Standalone Offline HTML Bill
  const handleDownloadInvoice = () => {
    const data = getInvoicePrintData();
    const html = generateShopInvoicePadHtml(data);
    downloadReceiptHtml(html, `Chuks-Invoice-${invoiceNumber}.html`);
    setPrintSuccessFeedback('💾 Saved receipt HTML to your downloads!');
    setIsPrintMenuOpen(false);
    setTimeout(() => setPrintSuccessFeedback(null), 3500);
  };

  // Default print triggers full paper pad
  const handlePrint = () => {
    handlePrintPad();
  };

  // Save invoice to localStorage
  const handleSaveInvoice = () => {
    const invoiceToSave: ShopInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      customerName: customerName || 'Walk-in Customer',
      customerPhone,
      date: invoiceDate,
      items,
      subtotal,
      discount,
      transportFee,
      total,
      amountPaid,
      balanceDue,
      paymentMethod,
      notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [invoiceToSave, ...savedInvoices.filter((i) => i.invoiceNumber !== invoiceNumber)].slice(0, 30);
    setSavedInvoices(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedSuccessMessage(`Invoice ${invoiceNumber} saved successfully!`);
      setTimeout(() => setSavedSuccessMessage(null), 3000);
    } catch (e) {
      console.warn('Failed to save invoice:', e);
    }
  };

  // Delete a saved invoice
  const handleDeleteSavedInvoice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedInvoices.filter((i) => i.id !== id);
    setSavedInvoices(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedSuccessMessage('Invoice removed from history');
      setTimeout(() => setSavedSuccessMessage(null), 2500);
    } catch (err) {
      console.warn('Failed to delete saved invoice:', err);
    }
  };

  // Load a saved invoice
  const handleLoadInvoice = (inv: ShopInvoice) => {
    setInvoiceNumber(inv.invoiceNumber);
    setCustomerName(inv.customerName);
    setCustomerPhone(inv.customerPhone || '');
    setInvoiceDate(inv.date);
    setItems(inv.items);
    setDiscount(inv.discount || 0);
    setTransportFee(inv.transportFee || 0);
    setAmountPaid(inv.amountPaid || 0);
    setPaymentMethod(inv.paymentMethod || 'cash');
    setNotes(inv.notes || '');
    setShowHistoryDrawer(false);
  };

  // Reset / New Invoice
  const handleNewInvoice = () => {
    const d = new Date();
    const num = Math.floor(100 + Math.random() * 900);
    setInvoiceNumber(`INV-${d.getFullYear().toString().slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${num}`);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setTransportFee(0);
    setAmountPaid(0);
    setPaymentMethod('cash');
    setItems([{ id: 'row-1', description: '', qty: 1, unitPrice: 0, amount: 0 }]);
  };

  // Add invoice items directly to cart
  const handleBatchAddToCart = () => {
    if (!onAddToCartBatch) return;

    const cartBatch: { product: Product; quantity: number }[] = [];
    items.forEach((item) => {
      let matchedProd = products.find((p) => p.id === item.productId || p.sku === item.sku);
      if (!matchedProd && item.description) {
        matchedProd = products.find((p) =>
          p.name.toLowerCase().includes(item.description.toLowerCase())
        );
      }
      if (matchedProd) {
        cartBatch.push({ product: matchedProd, quantity: item.qty });
      }
    });

    if (cartBatch.length > 0) {
      onAddToCartBatch(cartBatch);
      setCartSuccessMessage(`Added ${cartBatch.length} matching products to store cart!`);
      setTimeout(() => setCartSuccessMessage(null), 3000);
    } else {
      setCartSuccessMessage('Items saved in invoice. You can also print or send to customer via WhatsApp.');
      setTimeout(() => setCartSuccessMessage(null), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="shop-invoice-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0"
    >
      <div
        id="shop-invoice-modal-container"
        className="relative my-auto flex max-h-[96dvh] w-full max-w-5xl flex-col rounded-3xl border border-stone-800 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden print:max-h-none print:w-full print:border-none print:shadow-none print:bg-white print:text-black"
      >
        {/* Top Control Bar (Hidden when Printing) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 bg-stone-900/90 px-4 py-3 sm:px-6 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-stone-950 font-black shadow-md shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-white truncate">
                  Chuks-Ogo Sam Ventures Invoice
                </h3>
                <span className="rounded-full bg-orange-500/15 border border-orange-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  Shop Bill & Calculator
                </span>
              </div>
              <p className="text-[11px] text-stone-400 truncate">
                Calculate customer model requests, screens, calibrators & down boards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Mode Toggle: Paper Pad vs Modern Dark */}
            <div className="flex items-center rounded-xl border border-stone-800 bg-stone-950 p-0.5 text-xs">
              <button
                onClick={() => setThemeMode('paper')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
                  themeMode === 'paper'
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="View as authentic blue-ink paper invoice booklet"
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span>Paper Pad Mode</span>
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold transition ${
                  themeMode === 'dark'
                    ? 'bg-stone-800 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="View in dark workshop theme"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Dark Theme</span>
              </button>
            </div>

            {/* Saved Invoices History */}
            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="flex items-center gap-1 rounded-xl border border-stone-800 bg-stone-900 px-2.5 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-800 hover:text-white transition"
              title="View past saved invoices"
            >
              <History className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Saved ({savedInvoices.length})</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition"
              aria-label="Close invoice"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Model Search & WhatsApp Parser Bar (Hidden when printing) */}
        <div className="border-b border-stone-800 bg-stone-900/50 p-3 sm:px-6 space-y-2.5 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            {/* Model Search & Add */}
            <div className="relative md:col-span-8">
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={modelSearchQuery}
                  onChange={(e) => {
                    setModelSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder="Type model number (e.g. A12, Spark 7, iPhone 11, Camon 18, JK, Down Board, Calibrator)..."
                  className="w-full rounded-xl border border-stone-800 bg-stone-950 py-2 pl-10 pr-4 text-xs text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {showSearchDropdown && filteredProducts.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-stone-800 bg-stone-900 p-1.5 shadow-2xl">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Click to add to invoice with wholesale price:
                  </div>
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAddProductFromCatalog(p)}
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-stone-800 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-stone-400 truncate">
                          {p.brand} • SKU: {p.sku} • Stock: {p.stock} units
                        </p>
                      </div>
                      <span className="shrink-0 font-mono font-black text-amber-300">
                        ₦{p.price.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions: Paste Text & Add Blank Row */}
            <div className="md:col-span-4 flex items-center gap-2">
              <button
                onClick={() => setIsParserOpen(!isParserOpen)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-orange-500/35 bg-orange-950/30 px-3 py-2 text-xs font-bold text-amber-300 hover:bg-orange-900/40 transition"
                title="Paste customer message or list of models"
              >
                <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                <span>Paste Customer List</span>
              </button>

              <button
                onClick={handleAddBlankRow}
                className="flex items-center gap-1 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-xs font-bold text-stone-300 hover:bg-stone-800 hover:text-white transition shrink-0"
                title="Add a custom blank row"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Row</span>
              </button>

              <button
                onClick={handleNewInvoice}
                className="rounded-xl border border-stone-800 bg-stone-950 p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition shrink-0"
                title="Clear and start new invoice"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Parser Drawer if opened */}
          {isParserOpen && (
            <div className="rounded-2xl border border-orange-500/30 bg-stone-950 p-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-orange-400" />
                  Paste Customer Request (WhatsApp / SMS / Note):
                </span>
                <span className="text-[10px] text-stone-400">
                  Auto-extracts quantities and auto-matches prices
                </span>
              </div>
              <textarea
                rows={3}
                value={rawTextToParse}
                onChange={(e) => setRawTextToParse(e.target.value)}
                placeholder={"Example:\n- 2 pcs Spark 7 down board\n- 1 pc iPhone 11 JK screen\n- 3 pcs Samsung A12 screen"}
                className="w-full rounded-xl border border-stone-800 bg-stone-900 p-2 text-xs text-white placeholder-stone-500 focus:border-orange-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsParserOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleParseCustomerMessage}
                  className="rounded-lg bg-orange-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-orange-500 transition"
                >
                  Parse & Insert Into Invoice
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Messages */}
        {printSuccessFeedback && (
          <div className="bg-cyan-500/20 border-b border-cyan-500/30 px-4 py-1.5 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 justify-center print:hidden">
            <CheckCircle2 className="h-4 w-4" />
            {printSuccessFeedback}
          </div>
        )}
        {savedSuccessMessage && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-4 py-1.5 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 justify-center print:hidden">
            <CheckCircle2 className="h-4 w-4" />
            {savedSuccessMessage}
          </div>
        )}
        {cartSuccessMessage && (
          <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-1.5 text-xs font-semibold text-amber-300 flex items-center gap-1.5 justify-center print:hidden">
            <CheckCircle2 className="h-4 w-4" />
            {cartSuccessMessage}
          </div>
        )}

        {/* MAIN INVOICE PAPER SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-stone-950/80">
          <div
            ref={invoicePaperRef}
            id="printable-invoice-paper"
            className={`mx-auto max-w-3xl rounded-2xl p-4 sm:p-8 transition-all ${
              themeMode === 'paper'
                ? 'bg-[#fcfbf7] text-[#003366] border-2 border-[#005599] shadow-xl'
                : 'bg-stone-900 text-stone-100 border border-stone-800 shadow-2xl'
            }`}
          >
            {/* PAPER PAD HEADER (MATCHING THE USER PHOTO) */}
            <div
              className={`pb-4 border-b-2 text-center ${
                themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-800'
              }`}
            >
              <h1
                className={`text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight ${
                  themeMode === 'paper' ? 'text-[#004080]' : 'text-white'
                }`}
              >
                CHUKS-OGO SAM VENTURES
              </h1>
              <div
                className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold mt-1 ${
                  themeMode === 'paper' ? 'text-[#005599]' : 'text-amber-400'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  08084643919, 07039564380
                </span>
                <span>•</span>
                <span>Park Road, Gwagwalada, Abuja</span>
              </div>
              <p
                className={`text-[11px] font-semibold mt-0.5 ${
                  themeMode === 'paper' ? 'text-[#0066aa]' : 'text-stone-400'
                }`}
              >
                Specialized in Screens, Calibrators & Down Boards • Phone Accessories & Parts
              </p>
            </div>

            {/* CUSTOMER & DATE FIELDS (MATCHING THE USER PHOTO) */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-12 gap-3 py-3 border-b-2 text-xs sm:text-sm font-semibold ${
                themeMode === 'paper'
                  ? 'border-[#005599] text-[#003366]'
                  : 'border-stone-800 text-stone-200'
              }`}
            >
              {/* Customer Name */}
              <div className="sm:col-span-6 flex items-center gap-2">
                <span className="font-bold whitespace-nowrap">Name:</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer / Technician Name..."
                  className={`w-full bg-transparent px-2 py-1 font-bold outline-none border-b border-dotted ${
                    themeMode === 'paper'
                      ? 'border-[#005599] text-[#002244] placeholder-[#005599]/50'
                      : 'border-stone-700 text-white placeholder-stone-500'
                  }`}
                />
              </div>

              {/* Customer Phone (Optional for quick WhatsApp delivery) */}
              <div className="sm:col-span-3 flex items-center gap-1.5">
                <span className="font-bold whitespace-nowrap">Phone:</span>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="080... (for WhatsApp)"
                  className={`w-full bg-transparent px-2 py-1 font-mono outline-none border-b border-dotted ${
                    themeMode === 'paper'
                      ? 'border-[#005599] text-[#002244] placeholder-[#005599]/50'
                      : 'border-stone-700 text-white placeholder-stone-500'
                  }`}
                />
              </div>

              {/* Date */}
              <div className="sm:col-span-3 flex items-center gap-1.5 justify-end">
                <span className="font-bold whitespace-nowrap">Date:</span>
                <input
                  type="text"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className={`w-28 text-right bg-transparent px-1 py-1 font-mono font-bold outline-none border-b border-dotted ${
                    themeMode === 'paper'
                      ? 'border-[#005599] text-[#002244]'
                      : 'border-stone-700 text-amber-300'
                  }`}
                />
              </div>
            </div>

            {/* RULED TABLE: Description | Qty | Unit Price | Amount */}
            <div className="overflow-x-auto mt-2">
              <table
                className={`w-full border-collapse text-xs sm:text-sm ${
                  themeMode === 'paper'
                    ? 'border-2 border-[#005599]'
                    : 'border border-stone-800'
                }`}
              >
                <thead>
                  <tr
                    className={`font-black uppercase tracking-wider text-center ${
                      themeMode === 'paper'
                        ? 'bg-[#eaf3fa] text-[#004080] border-b-2 border-[#005599]'
                        : 'bg-stone-950 text-stone-200 border-b border-stone-800'
                    }`}
                  >
                    <th
                      className={`p-2.5 text-left border-r-2 ${
                        themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-800'
                      }`}
                    >
                      Description
                    </th>
                    <th
                      className={`w-16 sm:w-20 p-2.5 text-center border-r-2 ${
                        themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-800'
                      }`}
                    >
                      Qty
                    </th>
                    <th
                      className={`w-24 sm:w-32 p-2.5 text-right border-r-2 ${
                        themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-800'
                      }`}
                    >
                      Unit Price
                    </th>
                    <th className="w-24 sm:w-32 p-2.5 text-right">
                      Amount
                    </th>
                    <th className="w-8 p-1 text-center print:hidden"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`group transition border-b ${
                        themeMode === 'paper'
                          ? 'border-[#005599]/40 hover:bg-[#f2f7fc]'
                          : 'border-stone-800/60 hover:bg-stone-800/30'
                      }`}
                    >
                      {/* Description column */}
                      <td
                        className={`p-1.5 sm:p-2 border-r-2 ${
                          themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-800'
                        }`}
                      >
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                          placeholder="e.g. Tecno Spark 7 Charging Down Board"
                          className={`w-full bg-transparent px-1.5 py-1 text-xs sm:text-sm font-semibold outline-none ${
                            themeMode === 'paper'
                              ? 'text-[#002244] placeholder-[#005599]/40'
                              : 'text-stone-100 placeholder-stone-600'
                          }`}
                        />
                      </td>

                      {/* Qty column */}
                      <td
                        className={`p-1.5 sm:p-2 text-center border-r-2 ${
                          themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-800'
                        }`}
                      >
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleUpdateItem(item.id, 'qty', parseInt(e.target.value, 10) || 1)}
                          className={`w-full text-center bg-transparent px-1 py-1 font-mono font-bold outline-none ${
                            themeMode === 'paper' ? 'text-[#002244]' : 'text-stone-100'
                          }`}
                        />
                      </td>

                      {/* Unit Price column */}
                      <td
                        className={`p-1.5 sm:p-2 text-right border-r-2 ${
                          themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-800'
                        }`}
                      >
                        <div className="flex items-center justify-end">
                          <span
                            className={`mr-0.5 text-xs font-mono font-bold ${
                              themeMode === 'paper' ? 'text-[#005599]' : 'text-stone-400'
                            }`}
                          >
                            ₦
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={item.unitPrice || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className={`w-20 sm:w-24 text-right bg-transparent px-1 py-1 font-mono font-bold outline-none ${
                              themeMode === 'paper' ? 'text-[#002244]' : 'text-stone-100'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Amount column (Qty * Unit Price) */}
                      <td className="p-1.5 sm:p-2 text-right font-mono font-black">
                        <span className={themeMode === 'paper' ? 'text-[#004080]' : 'text-amber-400'}>
                          ₦{item.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Row Delete Action (Hidden in print) */}
                      <td className="p-1 text-center print:hidden">
                        <button
                          onClick={() => handleDeleteRow(item.id)}
                          className="opacity-40 group-hover:opacity-100 p-1 text-rose-500 hover:text-rose-700 transition"
                          title="Delete row"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Empty Ruled Lines placeholder when row count is small, to look identical to physical paper booklet */}
                  {items.length < 8 &&
                    Array.from({ length: 8 - items.length }).map((_, i) => (
                      <tr
                        key={`empty-${i}`}
                        className={`border-b h-8 ${
                          themeMode === 'paper'
                            ? 'border-[#005599]/30 bg-[#fbfdfa]'
                            : 'border-stone-800/40 bg-stone-950/20'
                        }`}
                      >
                        <td
                          className={`border-r-2 ${
                            themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-800'
                          }`}
                        ></td>
                        <td
                          className={`border-r-2 ${
                            themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-800'
                          }`}
                        ></td>
                        <td
                          className={`border-r-2 ${
                            themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-800'
                          }`}
                        ></td>
                        <td></td>
                        <td className="print:hidden"></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* TOTAL CALCULATION & ADJUSTMENTS */}
            <div
              className={`mt-3 pt-3 border-t-2 space-y-2 text-xs sm:text-sm font-semibold ${
                themeMode === 'paper'
                  ? 'border-[#005599] text-[#003366]'
                  : 'border-stone-800 text-stone-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Optional Waybill / Transport or Discount notes */}
                <div className="flex flex-wrap items-center gap-3 print:hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">Waybill / Dispatch:</span>
                    <span className="font-mono font-bold text-xs">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={transportFee || ''}
                      onChange={(e) => setTransportFee(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={`w-20 rounded border px-2 py-0.5 text-xs font-mono font-bold outline-none ${
                        themeMode === 'paper'
                          ? 'border-[#005599]/50 bg-white text-[#003366]'
                          : 'border-stone-700 bg-stone-950 text-white'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">Discount:</span>
                    <span className="font-mono font-bold text-xs">-₦</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={discount || ''}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={`w-20 rounded border px-2 py-0.5 text-xs font-mono font-bold outline-none ${
                        themeMode === 'paper'
                          ? 'border-[#005599]/50 bg-white text-[#003366]'
                          : 'border-stone-700 bg-stone-950 text-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Subtotal & Breakdown in print */}
                <div className="hidden print:flex flex-col text-xs text-right space-y-0.5">
                  <div>Subtotal: ₦{subtotal.toLocaleString()}</div>
                  {transportFee > 0 && <div>Waybill Fee: +₦{transportFee.toLocaleString()}</div>}
                  {discount > 0 && <div>Discount: -₦{discount.toLocaleString()}</div>}
                </div>

                {/* TOTAL AMOUNT (MATCHING THE PAPER BOOKLET) */}
                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
                  <span
                    className={`text-base sm:text-xl font-black uppercase tracking-tight ${
                      themeMode === 'paper' ? 'text-[#004080]' : 'text-white'
                    }`}
                  >
                    TOTAL:
                  </span>
                  <span
                    className={`font-mono text-lg sm:text-2xl font-black border-b-2 border-dotted px-2 py-0.5 min-w-[140px] text-right ${
                      themeMode === 'paper'
                        ? 'border-[#005599] text-[#003366]'
                        : 'border-amber-400 text-amber-400'
                    }`}
                  >
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Amount in Words */}
              <div
                className={`text-xs italic pt-1 ${
                  themeMode === 'paper' ? 'text-[#005599]' : 'text-stone-400'
                }`}
              >
                <span className="font-bold not-italic">Amount in Words: </span>
                <span>{totalInWords}</span>
              </div>

              {/* Live Payment Method & Deposit Tracking */}
              <div
                className={`mt-3 pt-3 border-t-2 border-dotted text-xs sm:text-sm font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  themeMode === 'paper'
                    ? 'border-[#005599] text-[#003366]'
                    : 'border-stone-800 text-stone-200'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold flex items-center gap-1">
                    <CreditCard className="h-3.5 w-3.5" /> Method:
                  </span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold outline-none border transition ${
                      themeMode === 'paper'
                        ? 'bg-white border-[#005599] text-[#003366]'
                        : 'bg-stone-900 border-stone-700 text-stone-100'
                    }`}
                  >
                    <option value="cash">Cash (Direct Counter)</option>
                    <option value="transfer">Bank Transfer (OPay/Moniepoint/FirstBank)</option>
                    <option value="pos">POS Terminal (Debit Card)</option>
                    <option value="credit">Partial Deposit / Credit</option>
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold flex items-center gap-1">
                      <Banknote className="h-3.5 w-3.5 text-emerald-500" />
                      Paid Deposit:
                    </span>
                    <span className="font-mono font-bold text-xs">₦</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={amountPaid || ''}
                      onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={`w-24 rounded-lg border px-2 py-1 text-xs font-mono font-bold outline-none ${
                        themeMode === 'paper'
                          ? 'border-[#005599]/60 bg-white text-[#003366]'
                          : 'border-stone-700 bg-stone-950 text-white'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold">Balance:</span>
                    <span
                      className={`font-mono text-xs font-black px-2 py-0.5 rounded-lg border ${
                        balanceDue === 0 && amountPaid > 0
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600'
                          : balanceDue > 0
                          ? 'bg-red-500/15 border-red-500/40 text-red-600'
                          : 'bg-stone-200 border-stone-300 text-stone-700'
                      }`}
                    >
                      {balanceDue === 0 && amountPaid > 0 ? 'PAID IN FULL' : `₦${balanceDue.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Bank Account for Direct Transfer */}
            <div
              className={`mt-4 rounded-xl border p-2.5 sm:p-3 text-xs flex flex-wrap items-center justify-between gap-2 ${
                themeMode === 'paper'
                  ? 'border-[#005599]/40 bg-[#005599]/5 text-[#003366]'
                  : 'border-stone-800 bg-stone-900/60 text-stone-300'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">Bank Transfer:</span>
                <span className="font-bold text-amber-500">Moniepoint MFB</span>
                <span>•</span>
                <span className="font-mono font-black text-sm tracking-wider">8163301810</span>
                <span>•</span>
                <span className="font-bold">Chuks Ogo Sam Venture</span>
              </div>
              <span className="text-[11px] opacity-80">Instant Transfer • WhatsApp Receipt: 07039564380</span>
            </div>

            {/* DOTTED SIGNATURE LINES (MATCHING THE PAPER BOOKLET PHOTO EXACTLY) */}
            <div
              className={`mt-8 sm:mt-12 pt-4 flex items-end justify-between gap-6 text-xs sm:text-sm font-bold ${
                themeMode === 'paper' ? 'text-[#003366]' : 'text-stone-300'
              }`}
            >
              {/* Customer's Sign */}
              <div className="w-40 sm:w-56 text-center">
                <div
                  className={`border-b border-dotted mb-1 ${
                    themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-700'
                  }`}
                />
                <span>Customer&apos;s Sign</span>
              </div>

              {/* Store Official Verification / Stamp */}
              <div className="hidden sm:flex flex-col items-center justify-center opacity-70 text-[10px]">
                <div className="rounded-full border border-dashed p-1.5 text-center">
                  <span className="font-mono font-bold">CHUKS-OGO SAM</span>
                </div>
              </div>

              {/* Authorized's Sign */}
              <div className="w-40 sm:w-56 text-center">
                <div
                  className={`border-b border-dotted mb-1 ${
                    themeMode === 'paper' ? 'border-[#005599]' : 'border-stone-700'
                  }`}
                />
                <span>Authorized&apos;s Sign</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION TOOLBAR (Hidden in Print) */}
        <div className="border-t border-stone-800 bg-stone-900/90 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
            <span>Invoice:</span>
            <code className="rounded bg-stone-950 px-2 py-0.5 text-amber-300 font-mono text-xs">
              {invoiceNumber}
            </code>
            <span>•</span>
            <span className="font-bold text-white">
              {items.filter((i) => i.description.trim()).length} Items
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Copy WhatsApp text */}
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-800 transition"
              title="Copy invoice breakdown text"
            >
              {copiedMessage ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-orange-400" />
                  <span>Copy Bill</span>
                </>
              )}
            </button>

            {/* Live Print Menu with Multi-format options */}
            <div className="relative">
              <div className="flex items-center rounded-xl border border-stone-800 bg-stone-950 p-0.5 shadow-sm">
                <button
                  onClick={handlePrintPad}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-stone-800 transition active:scale-95"
                  title="Print official invoice paper pad directly"
                >
                  <Printer className="h-4 w-4 text-amber-400" />
                  <span>Print Live</span>
                </button>
                <div className="h-4 w-px bg-stone-800 mx-0.5" />
                <button
                  onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
                  className="rounded-lg p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 transition"
                  title="More print formats (Thermal 80mm POS slip, Download HTML)"
                  aria-label="Print formats"
                >
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isPrintMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Print Dropdown Menu */}
              {isPrintMenuOpen && (
                <div className="absolute right-0 bottom-full mb-2 z-50 w-64 rounded-2xl border border-stone-800 bg-stone-900 p-2 shadow-2xl space-y-1 animate-in fade-in zoom-in-95">
                  <button
                    onClick={handlePrintPad}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-stone-200 hover:bg-stone-800 hover:text-white transition"
                  >
                    <FileText className="h-4 w-4 text-orange-400 shrink-0" />
                    <div>
                      <p className="font-bold">Standard Invoice Pad (A4)</p>
                      <p className="text-[10px] text-stone-400">Official blue-ink paper booklet layout</p>
                    </div>
                  </button>

                  <button
                    onClick={handlePrintThermal}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-stone-200 hover:bg-stone-800 hover:text-white transition"
                  >
                    <Receipt className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold">Thermal POS Slip (80mm)</p>
                      <p className="text-[10px] text-stone-400">For bluetooth mini-printers & rolls</p>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadInvoice}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-stone-200 hover:bg-stone-800 hover:text-white transition border-t border-stone-800/80 pt-1.5"
                  >
                    <Download className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div>
                      <p className="font-bold">Download Offline HTML</p>
                      <p className="text-[10px] text-stone-400">Save to phone/laptop records</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Save to History */}
            <button
              onClick={handleSaveInvoice}
              className="flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-xs font-semibold text-stone-200 hover:bg-stone-800 transition"
              title="Save invoice locally"
            >
              <History className="h-4 w-4 text-orange-400" />
              <span>Save</span>
            </button>

            {/* Batch load to Cart */}
            {onAddToCartBatch && (
              <button
                onClick={handleBatchAddToCart}
                className="flex items-center gap-1.5 rounded-xl border border-orange-500/35 bg-orange-950/40 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-orange-900/50 transition"
                title="Add matching items to shop cart"
              >
                <ShoppingCart className="h-4 w-4 text-orange-400" />
                <span className="hidden sm:inline">Add to Cart</span>
              </button>
            )}

            {/* Primary WhatsApp Direct Dispatch */}
            <button
              onClick={handleSendWhatsApp}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950 transition active:scale-95"
              title="Send invoice breakdown to customer via WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Send on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* SAVED INVOICES SIDE DRAWER */}
        {showHistoryDrawer && (
          <div className="absolute inset-y-0 right-0 z-40 w-full max-w-sm border-l border-stone-800 bg-stone-950 p-4 shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col print:hidden">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-orange-400" />
                <h4 className="text-sm font-bold text-white">Saved Past Invoices</h4>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="rounded-lg p-1 text-stone-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {savedInvoices.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-500">
                  <FileText className="mx-auto h-8 w-8 text-stone-700 mb-2" />
                  <p>No saved invoices yet.</p>
                  <p className="text-[11px] mt-1 text-stone-600">Click &ldquo;Save&rdquo; on any invoice to store it here.</p>
                </div>
              ) : (
                savedInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => handleLoadInvoice(inv)}
                    className="group relative cursor-pointer rounded-xl border border-stone-800 bg-stone-900 p-3 hover:border-orange-500/40 transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {inv.invoiceNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-400">{inv.date}</span>
                        <button
                          onClick={(e) => handleDeleteSavedInvoice(inv.id, e)}
                          className="rounded p-1 text-stone-500 hover:text-red-400 hover:bg-stone-800 transition"
                          title="Delete saved invoice"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-white truncate">
                      {inv.customerName || 'Walk-in Customer'}
                    </p>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-800/80">
                      <span className="text-[11px] text-stone-400">
                        {inv.items?.length || 0} items
                      </span>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400">
                          ₦{inv.total.toLocaleString()}
                        </span>
                        {inv.amountPaid ? (
                          <span className="block text-[10px] text-stone-400">
                            Paid: ₦{inv.amountPaid.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
