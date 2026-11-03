import { CartItem, Order } from '../types';

/**
 * Helper to escape CSV cell content according to RFC 4180
 */
function escapeCSVCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Triggers browser file download of CSV content with UTF-8 BOM
 */
export function downloadCSVFile(filename: string, csvContent: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export current cart contents as a professional billing/invoicing CSV
 */
export function exportCartToCSV(
  cartItems: CartItem[],
  customTitle = 'Chuks Communication - Parts Invoice & Billing Quotation'
): void {
  if (!cartItems.length) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const rows: string[][] = [
    ['BUSINESS', 'Chuks Communication (Chuks Store)'],
    ['LOCATION', 'After First Bank, Park Road, Gwagwalada, Abuja, Nigeria'],
    ['CONTACT', '07039564380 / +2347039564380'],
    ['DOCUMENT', customTitle],
    ['GENERATED ON', `${dateStr} ${timeStr}`],
    [], // Blank separator row
    [
      'Item #',
      'Part Description',
      'Brand',
      'Category',
      'Quality / Grade',
      'Unit Price (NGN)',
      'Quantity',
      'Line Total (NGN)',
      'Warranty',
      'SKU',
    ],
  ];

  let subtotal = 0;
  let totalQty = 0;

  cartItems.forEach((item, index) => {
    const lineTotal = item.product.price * item.quantity;
    subtotal += lineTotal;
    totalQty += item.quantity;

    rows.push([
      String(index + 1),
      item.product.name,
      item.product.brand,
      item.product.category,
      item.product.condition || 'AAA+ High Quality',
      item.product.price.toLocaleString(),
      String(item.quantity),
      lineTotal.toLocaleString(),
      item.product.warranty || '30-Day Testing Warranty',
      item.product.sku || 'N/A',
    ]);
  });

  // Summary rows
  rows.push([]);
  rows.push(['', '', '', '', 'TOTAL QUANTITY:', '', String(totalQty), '', '', '']);
  rows.push(['', '', '', '', 'SUBTOTAL (NGN):', '', '', `NGN ${subtotal.toLocaleString()}`, '', '']);
  rows.push(['', '', '', '', 'STATUS:', '', '', 'Proforma Quotation / Verified Parts List', '', '']);
  rows.push([]);
  rows.push(['NOTE', 'Testing required before frame installation and adhesive application. 30-Day testing warranty.']);

  const csvString = rows.map((r) => r.map(escapeCSVCell).join(',')).join('\r\n');
  const filename = `Chuks_Cart_Invoice_${now.toISOString().slice(0, 10)}.csv`;
  downloadCSVFile(filename, csvString);
}

export interface LedgerExportItem {
  modelOrName: string;
  brandOrCategory: string;
  gradesOrCodes: string;
  wholesalePrice?: string | number;
  retailPrice?: string | number;
  warranty?: string;
  notes?: string;
}

/**
 * Export selected or filtered technician ledger items to CSV
 */
export function exportLedgerToCSV(
  items: LedgerExportItem[],
  ledgerType: string = 'Technician Price & Compatibility Ledger'
): void {
  if (!items.length) return;

  const now = new Date();
  const dateStr = now.toLocaleDateString();

  const rows: string[][] = [
    ['STORE', 'Chuks Communication - Wholesale Phone Parts & Accessories'],
    ['ADDRESS', 'After First Bank, Park Road, Gwagwalada, Abuja (Phone: 07039564380)'],
    ['LEDGER SECTION', ledgerType],
    ['EXPORT DATE', dateStr],
    [],
    [
      '#',
      'Phone Model / Part Name',
      'Brand / Category',
      'Quality Grades / Cross-Compatibility Codes',
      'Wholesale Price (NGN)',
      'Retail Guide Price (NGN)',
      'Warranty',
      'Technician Technical Notes',
    ],
  ];

  items.forEach((item, index) => {
    rows.push([
      String(index + 1),
      item.modelOrName,
      item.brandOrCategory,
      item.gradesOrCodes,
      typeof item.wholesalePrice === 'number'
        ? `NGN ${item.wholesalePrice.toLocaleString()}`
        : String(item.wholesalePrice || 'Market Rate'),
      typeof item.retailPrice === 'number'
        ? `NGN ${item.retailPrice.toLocaleString()}`
        : String(item.retailPrice || 'N/A'),
      item.warranty || '30-Day Testing Warranty',
      item.notes || 'Original Testing Required',
    ]);
  });

  rows.push([]);
  rows.push(['DISCLAIMER', 'Prices are subject to daily market exchange rates. Contact 07039564380 for bulk technician discounts.']);

  const csvString = rows.map((r) => r.map(escapeCSVCell).join(',')).join('\r\n');
  const filename = `Chuks_Ledger_${ledgerType.replace(/[^a-zA-Z0-9]/g, '_')}_${now.toISOString().slice(0, 10)}.csv`;
  downloadCSVFile(filename, csvString);
}

/**
 * Export customer orders and technician billing history to CSV
 */
export function exportOrdersToCSV(orders: Order[]): void {
  if (!orders.length) return;

  const now = new Date();
  const rows: string[][] = [
    ['STORE', 'Chuks Communication - Official Technician Order & Invoicing Export'],
    ['EXPORT DATE', now.toLocaleDateString()],
    [],
    [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone Number',
      'Delivery Destination',
      'Items Purchased',
      'Total Quantity',
      'Subtotal (NGN)',
      'Discount (NGN)',
      'Shipping (NGN)',
      'Total Paid (NGN)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Tracking Number',
      'Technician Order Notes',
    ],
  ];

  orders.forEach((order) => {
    const itemsDescription = order.items
      .map((i) => `${i.quantity}x ${i.productName} (₦${i.price.toLocaleString()})`)
      .join(' | ');
    const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

    rows.push([
      order.id,
      new Date(order.createdAt).toLocaleDateString(),
      order.customerName,
      order.customerPhone,
      `${order.deliveryAddress}, ${order.deliveryCity}`,
      itemsDescription,
      String(totalQty),
      order.subtotal.toLocaleString(),
      order.discountAmount.toLocaleString(),
      order.shippingFee.toLocaleString(),
      order.totalAmount.toLocaleString(),
      order.paymentMethod.toUpperCase(),
      order.paymentStatus.toUpperCase(),
      order.orderStatus.toUpperCase(),
      order.trackingNumber,
      order.technicianNote || order.deliveryNotes || 'Standard order',
    ]);
  });

  const csvString = rows.map((r) => r.map(escapeCSVCell).join(',')).join('\r\n');
  const filename = `Chuks_Orders_Export_${now.toISOString().slice(0, 10)}.csv`;
  downloadCSVFile(filename, csvString);
}
