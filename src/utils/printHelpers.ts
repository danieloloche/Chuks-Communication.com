/**
 * Direct Live Print & Receipt Export Engine for Chuks Communication
 * Supports:
 * 1. Hidden iframe printing (bypasses browser dark-mode overlay and modal clipping)
 * 2. Authentic Paper Invoice Pad (Full A4 / Half-Sheet)
 * 3. 80mm / 58mm POS Thermal Slip Print
 * 4. Offline HTML File Download for phone & desktop records
 */

import { formatNairaInWords } from './numberToWords';
import { ShopInvoiceItem } from '../types';

export interface ShopInvoicePrintData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  items: ShopInvoiceItem[];
  subtotal: number;
  discount: number;
  transportFee: number;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  paymentMethod?: string;
  notes?: string;
}

/**
 * Triggers native print preview cleanly through an isolated hidden iframe.
 * Ensures zero clipping, zero dark modal backdrops, and authentic paper rendering.
 */
export function printDirectHtml(htmlContent: string, title = 'Chuks-Communication-Receipt'): boolean {
  try {
    // Remove any previous print iframes
    const existing = document.getElementById('chuks-print-iframe');
    if (existing) {
      existing.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'chuks-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-9999';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      // Fallback to standard window print
      window.print();
      return false;
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Allow browser to parse DOM & images, then invoke print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print error, falling back to window.print:', err);
        window.print();
      } finally {
        // Clean up iframe after print dialog completes
        setTimeout(() => {
          iframe.remove();
        }, 3000);
      }
    }, 250);

    return true;
  } catch (error) {
    console.error('Failed to print via iframe:', error);
    window.print();
    return false;
  }
}

/**
 * Downloads a standalone printable HTML receipt file for offline records.
 */
export function downloadReceiptHtml(htmlContent: string, filename: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates an Authentic Ruled Paper Invoice Booklet layout
 * (Matches standard Nigerian phone accessories store blue-pad invoices).
 */
export function generateShopInvoicePadHtml(data: ShopInvoicePrintData): string {
  const words = formatNairaInWords(data.total);
  const paid = Number(data.amountPaid || 0);
  const balance = Math.max(0, data.total - paid);

  const rows = data.items
    .filter((i) => i.description && i.description.trim())
    .map(
      (item, idx) => `
        <tr>
          <td style="padding: 6px 8px; border: 1px solid #005599; text-align: center; font-size: 11px;">${idx + 1}</td>
          <td style="padding: 6px 10px; border: 1px solid #005599; font-size: 12px; font-weight: 600;">
            ${item.description}
            ${item.sku ? `<div style="font-size: 9px; color: #555;">SKU: ${item.sku}</div>` : ''}
          </td>
          <td style="padding: 6px 8px; border: 1px solid #005599; text-align: center; font-size: 12px; font-weight: 700;">${item.qty}</td>
          <td style="padding: 6px 10px; border: 1px solid #005599; text-align: right; font-size: 12px; font-family: monospace;">₦${item.unitPrice.toLocaleString()}</td>
          <td style="padding: 6px 10px; border: 1px solid #005599; text-align: right; font-size: 12px; font-weight: 700; font-family: monospace;">₦${item.amount.toLocaleString()}</td>
        </tr>
      `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${data.invoiceNumber} - Chuks-Ogo Sam Ventures</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 16px;
      background: #ffffff;
      color: #003366;
    }
    .invoice-card {
      max-width: 780px;
      margin: 0 auto;
      border: 2px solid #005599;
      background: #fdfdf9;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #005599;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .title {
      font-size: 24px;
      font-weight: 900;
      color: #004080;
      letter-spacing: 0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .sub {
      font-size: 12px;
      font-weight: 700;
      color: #005599;
      margin-top: 4px;
    }
    .tagline {
      font-size: 10.5px;
      color: #0066aa;
      margin-top: 2px;
      font-weight: 600;
    }
    .info-grid {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #005599;
      padding-bottom: 10px;
      margin-bottom: 14px;
      font-size: 12px;
      font-weight: 600;
    }
    .info-grid div {
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    th {
      background: #eaf3fa;
      color: #004080;
      border: 1.5px solid #005599;
      padding: 8px 10px;
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .totals-wrap {
      display: flex;
      justify-content: space-between;
      margin-top: 14px;
      gap: 20px;
    }
    .notes-box {
      flex: 1;
      border: 1px dashed #005599;
      padding: 10px;
      background: #f4f8fc;
      font-size: 11px;
      border-radius: 4px;
    }
    .summary-box {
      width: 280px;
      border: 1.5px solid #005599;
      font-size: 12px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 10px;
      border-bottom: 1px solid #005599;
    }
    .summary-row.bold {
      font-weight: 800;
      background: #eaf3fa;
      font-size: 13px;
    }
    .words-box {
      margin-top: 12px;
      padding: 8px 12px;
      background: #eaf3fa;
      border: 1px solid #005599;
      font-size: 11.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #003366;
    }
    .warranty-banner {
      margin-top: 14px;
      border: 1px solid #16a34a;
      background: #f0fdf4;
      color: #166534;
      padding: 8px 12px;
      font-size: 10.5px;
      line-height: 1.4;
      border-radius: 4px;
    }
    .footer-signs {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 8px;
      font-size: 11px;
      font-weight: 700;
    }
    .sign-line {
      width: 180px;
      border-top: 1px dotted #005599;
      text-align: center;
      padding-top: 4px;
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <h1 class="title">CHUKS-OGO SAM VENTURES</h1>
      <div class="sub">
        📞 08084643919, 07039564380 &nbsp;•&nbsp; 📍 After First Bank, Park Road, Gwagwalada, Abuja
      </div>
      <div class="tagline">
        Dealers in Screens, Calibrators & Down Boards • Accessories & Tested Phone Parts
      </div>
    </div>

    <div class="info-grid">
      <div>
        <div><strong>Customer Name:</strong> ${data.customerName || 'Walk-in Customer'}</div>
        <div><strong>Phone:</strong> ${data.customerPhone || 'N/A'}</div>
      </div>
      <div style="text-align: right;">
        <div><strong>Invoice No:</strong> <span style="font-family: monospace;">${data.invoiceNumber}</span></div>
        <div><strong>Date:</strong> ${data.date}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 36px;">S/N</th>
          <th>Description of Goods / Part</th>
          <th style="width: 50px;">Qty</th>
          <th style="width: 110px; text-align: right;">Unit Price (₦)</th>
          <th style="width: 120px; text-align: right;">Amount (₦)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="totals-wrap">
      <div class="notes-box">
        <strong>Terms & Technician Notes:</strong><br>
        ${data.notes || 'All parts tested before dispatch. 30-day screen testing warranty valid before peeling protective film or applying adhesive.'}
        ${data.paymentMethod ? `<div style="margin-top: 8px;"><strong>Payment Method:</strong> ${data.paymentMethod.toUpperCase()}</div>` : ''}
      </div>

      <div class="summary-box">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span style="font-family: monospace;">₦${data.subtotal.toLocaleString()}</span>
        </div>
        ${
          data.discount > 0
            ? `<div class="summary-row" style="color: #047857;">
                <span>Discount:</span>
                <span style="font-family: monospace;">-₦${data.discount.toLocaleString()}</span>
              </div>`
            : ''
        }
        ${
          data.transportFee > 0
            ? `<div class="summary-row">
                <span>Waybill / Transport:</span>
                <span style="font-family: monospace;">+₦${data.transportFee.toLocaleString()}</span>
              </div>`
            : ''
        }
        <div class="summary-row bold">
          <span>TOTAL:</span>
          <span style="font-family: monospace;">₦${data.total.toLocaleString()}</span>
        </div>
        ${
          paid > 0
            ? `<div class="summary-row" style="color: #047857;">
                <span>Amount Paid:</span>
                <span style="font-family: monospace;">₦${paid.toLocaleString()}</span>
              </div>
              <div class="summary-row" style="color: #b91c1c; font-weight: 700;">
                <span>Balance Due:</span>
                <span style="font-family: monospace;">₦${balance.toLocaleString()}</span>
              </div>`
            : ''
        }
      </div>
    </div>

    <div class="words-box">
      <strong>Amount in Words:</strong> ${words}
    </div>

    <div class="warranty-banner">
      <strong>🛡️ CHUKS TESTING WARRANTY:</strong> 30-Day Testing Warranty applies on replacement screens (test on motherboard before gluing or peeling warranty seals). Zero-cycle battery guarantee. Contact lead technician at 07039564380 for verification.
    </div>

    <div class="footer-signs">
      <div class="sign-line">Customer's Signature</div>
      <div class="sign-line">For: Chuks-Ogo Sam Ventures</div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates an 80mm / 58mm POS Thermal Receipt Slip layout
 * for rapid printing on bluetooth receipt printers or mini thermal rolls.
 */
export function generateThermalPosReceiptHtml(data: ShopInvoicePrintData): string {
  const paid = Number(data.amountPaid || 0);
  const balance = Math.max(0, data.total - paid);

  const itemsHtml = data.items
    .filter((i) => i.description && i.description.trim())
    .map(
      (item) => `
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
          <span style="font-weight: 600; max-width: 65%; word-break: break-word;">${item.qty}x ${item.description}</span>
          <span style="font-family: monospace; font-weight: 700;">₦${item.amount.toLocaleString()}</span>
        </div>
      `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt ${data.invoiceNumber}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 3mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: "Courier New", Courier, monospace, monospace;
      width: 74mm;
      margin: 0 auto;
      padding: 4px;
      color: #000000;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.3;
    }
    .center {
      text-align: center;
    }
    .bold {
      font-weight: bold;
    }
    .dashed {
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    .double {
      border-top: 2px solid #000;
      margin: 6px 0;
    }
    .flex-between {
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="center">
    <div style="font-size: 14px; font-weight: 900; letter-spacing: 0.5px;">CHUKS COMMUNICATION</div>
    <div style="font-size: 10px; font-weight: bold;">SCREENS, CALIBRATORS & DOWN BOARDS</div>
    <div style="font-size: 9.5px;">Park Road, Gwagwalada, Abuja</div>
    <div style="font-size: 10px; font-weight: bold;">Tel: 07039564380, 08084643919</div>
  </div>

  <div class="dashed"></div>

  <div class="flex-between" style="font-size: 10px;">
    <span>RC: ${data.invoiceNumber}</span>
    <span>${data.date}</span>
  </div>
  <div style="font-size: 10px;">Cust: <strong>${data.customerName || 'Walk-in'}</strong></div>
  ${data.customerPhone ? `<div style="font-size: 10px;">Phone: ${data.customerPhone}</div>` : ''}

  <div class="dashed"></div>
  <div style="font-size: 9px; font-weight: bold; margin-bottom: 4px;">QTY & DESCRIPTION &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; AMT(₦)</div>

  ${itemsHtml}

  <div class="dashed"></div>

  <div class="flex-between">
    <span>Subtotal:</span>
    <span style="font-weight: bold;">₦${data.subtotal.toLocaleString()}</span>
  </div>
  ${
    data.discount > 0
      ? `<div class="flex-between">
          <span>Discount:</span>
          <span>-₦${data.discount.toLocaleString()}</span>
        </div>`
      : ''
  }
  ${
    data.transportFee > 0
      ? `<div class="flex-between">
          <span>Waybill:</span>
          <span>+₦${data.transportFee.toLocaleString()}</span>
        </div>`
      : ''
  }

  <div class="double"></div>

  <div class="flex-between" style="font-size: 13px; font-weight: 900;">
    <span>TOTAL:</span>
    <span>₦${data.total.toLocaleString()}</span>
  </div>

  ${
    paid > 0
      ? `<div class="flex-between" style="font-size: 11px; margin-top: 3px;">
          <span>PAID:</span>
          <span>₦${paid.toLocaleString()}</span>
        </div>
        <div class="flex-between" style="font-size: 11px; font-weight: bold;">
          <span>BALANCE DUE:</span>
          <span>₦${balance.toLocaleString()}</span>
        </div>`
      : ''
  }

  <div class="dashed"></div>

  <div class="center" style="font-size: 9px; line-height: 1.3;">
    *** 30-DAY TESTING WARRANTY ***<br>
    Please test screens before removing seals or applying glue.<br>
    Thank you for your patronage! 🙏
  </div>
</body>
</html>
  `;
}

/**
 * Generates printable physical order receipt HTML for customer orders.
 */
export function generateOrderReceiptPrintHtml(order: any): string {
  const itemsHtml = (order.items || [])
    .map(
      (item: any, idx: number) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600;">
          ${item.productName}
          <div style="font-size: 10px; color: #64748b;">${item.brand || ''}</div>
        </td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: center; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-family: monospace;">₦${item.price.toLocaleString()}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-family: monospace; font-weight: bold;">₦${(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt ${order.id} - Chuks Communication</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #0f172a; margin: 0; padding: 16px; }
    .card { max-width: 760px; margin: 0 auto; border: 1.5px solid #0f172a; padding: 24px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
    .title { font-size: 20px; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
    .sub { font-size: 12px; font-weight: bold; color: #0284c7; }
    .contact { font-size: 11px; color: #475569; margin-top: 4px; }
    .badge { font-family: monospace; font-size: 12px; font-weight: bold; background: #f1f5f9; padding: 4px 8px; border: 1px solid #cbd5e1; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; font-size: 11.5px; }
    .box-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #f1f5f9; border-bottom: 2px solid #0f172a; font-size: 11px; text-transform: uppercase; padding: 8px 10px; }
    .totals { margin-left: auto; width: 280px; font-size: 12px; border: 1px solid #cbd5e1; margin-bottom: 16px; }
    .t-row { display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
    .t-bold { font-weight: bold; background: #f1f5f9; font-size: 13px; }
    .warranty { border: 1px solid #16a34a; background: #f0fdf4; color: #166534; padding: 10px; font-size: 11px; line-height: 1.4; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <h1 class="title">CHUKS COMMUNICATION</h1>
        <div class="sub">Screens, Calibrators & Down Boards</div>
        <div class="contact">
          Park Road, Gwagwalada, Abuja<br>
          📞 07039564380, 08084643919 • WhatsApp: 07039564380
        </div>
      </div>
      <div style="text-align: right;">
        <div class="badge">${order.id}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
          Date: ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #047857; margin-top: 2px;">
          ${order.paymentStatus} via ${order.paymentMethod.toUpperCase()}
        </div>
      </div>
    </div>

    <div class="grid">
      <div class="info-box">
        <div class="box-title">Customer Information</div>
        <strong>${order.customerName}</strong><br>
        Phone: ${order.customerPhone}<br>
        Email: ${order.customerEmail}
      </div>
      <div class="info-box">
        <div class="box-title">Shipping & Waybill Destination</div>
        Address: ${order.deliveryAddress}<br>
        <strong>${order.deliveryCity}, Nigeria</strong><br>
        Tracking: <span style="font-family: monospace;">${order.trackingNumber}</span>
      </div>
    </div>

    ${
      order.technicianNote
        ? `<div class="info-box" style="margin-bottom: 16px; border-left: 3px solid #0284c7;">
            <div class="box-title">Technician Note & Special Instructions</div>
            <em>"${order.technicianNote}"</em>
          </div>`
        : ''
    }

    <table>
      <thead>
        <tr>
          <th style="width: 32px; text-align: center;">#</th>
          <th style="text-align: left;">Product Name & Specifications</th>
          <th style="width: 50px; text-align: center;">Qty</th>
          <th style="width: 100px; text-align: right;">Price (₦)</th>
          <th style="width: 110px; text-align: right;">Total (₦)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="t-row"><span>Subtotal:</span><span style="font-family: monospace;">₦${order.subtotal.toLocaleString()}</span></div>
      ${order.discountAmount > 0 ? `<div class="t-row" style="color: #047857;"><span>Bulk Discount:</span><span style="font-family: monospace;">-₦${order.discountAmount.toLocaleString()}</span></div>` : ''}
      <div class="t-row"><span>Shipping Fee:</span><span style="font-family: monospace;">${order.shippingFee === 0 ? 'FREE' : `₦${order.shippingFee.toLocaleString()}`}</span></div>
      <div class="t-row t-bold"><span>Total Paid:</span><span style="font-family: monospace; font-size: 14px;">₦${order.totalAmount.toLocaleString()}</span></div>
    </div>

    <div class="warranty">
      <strong>🛡️ OFFICIAL 30-DAY TESTING WARRANTY CERTIFICATE:</strong><br>
      This physical receipt certifies the 30-day testing warranty on replacement screens (test flex before gluing or peeling warranty stamps) and 6-month battery replacement guarantee purchased from Chuks Communication, Park Road, Gwagwalada, Abuja.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generates printable technician repair estimate / job card HTML.
 */
export function generateTechnicianQuotePrintHtml(quote: {
  workshopName: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  items: Array<{ name: string; partCost: number; laborFee: number; warranty: string }>;
  partsTotal: number;
  laborTotal: number;
  grandTotal: number;
  note?: string;
}): string {
  const itemsHtml = quote.items
    .map(
      (item, idx) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 11px;">${idx + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 600;">
          ${item.name}
          <div style="font-size: 10px; color: #047857;">Warranty: ${item.warranty}</div>
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-family: monospace;">₦${item.partCost.toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-family: monospace;">₦${item.laborFee.toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 12px; text-align: right; font-family: monospace; font-weight: bold;">₦${(item.partCost + item.laborFee).toLocaleString()}</td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Repair Estimate - ${quote.customerName || 'Client'}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #fff; color: #0f172a; margin: 0; padding: 16px; }
    .card { max-width: 760px; margin: 0 auto; border: 1.5px solid #0f172a; padding: 24px; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; }
    .title { font-size: 20px; font-weight: 900; margin: 0; }
    .sub { font-size: 12px; font-weight: bold; color: #7c3aed; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; font-size: 12px; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background: #f1f5f9; border-bottom: 2px solid #0f172a; font-size: 11px; text-transform: uppercase; padding: 8px 10px; }
    .totals { margin-left: auto; width: 280px; font-size: 12px; border: 1px solid #cbd5e1; }
    .t-row { display: flex; justify-content: space-between; padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
    .t-bold { font-weight: bold; background: #f1f5f9; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">${quote.workshopName}</h1>
      <div class="sub">PROFESSIONAL PHONE REPAIR JOB ESTIMATE & PROFORMA INVOICE</div>
      <div style="font-size: 11px; color: #64748b; margin-top: 3px;">
        Parts Sourced Authentic from Chuks Communication, Park Road, Gwagwalada, Abuja (07039564380)
      </div>
    </div>

    <div class="grid">
      <div class="info-box">
        <strong>Customer:</strong> ${quote.customerName || 'Valued Client'}<br>
        <strong>Phone:</strong> ${quote.customerPhone || 'N/A'}<br>
        <strong>Device Model:</strong> ${quote.deviceModel || 'Smartphone'}
      </div>
      <div class="info-box" style="text-align: right;">
        <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
        <strong>Status:</strong> Pending Approval<br>
        <strong>Warranty:</strong> 30-Day Screen Testing Included
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 32px; text-align: center;">#</th>
          <th style="text-align: left;">Required Parts & Service</th>
          <th style="width: 100px; text-align: right;">Part (₦)</th>
          <th style="width: 100px; text-align: right;">Labor (₦)</th>
          <th style="width: 110px; text-align: right;">Subtotal (₦)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="display: flex; justify-content: space-between; gap: 20px;">
      <div style="flex: 1; border: 1px dashed #cbd5e1; padding: 10px; font-size: 11px; background: #f8fafc;">
        <strong>Technician Notes & Customer Advice:</strong><br>
        ${quote.note || 'Please backup all customer data prior to motherboard/screen repair. Test on board before adhesive application.'}
      </div>

      <div class="totals">
        <div class="t-row"><span>Parts Total:</span><span style="font-family: monospace;">₦${quote.partsTotal.toLocaleString()}</span></div>
        <div class="t-row"><span>Labor Services:</span><span style="font-family: monospace;">₦${quote.laborTotal.toLocaleString()}</span></div>
        <div class="t-row t-bold"><span>Grand Total:</span><span style="font-family: monospace;">₦${quote.grandTotal.toLocaleString()}</span></div>
      </div>
    </div>

    <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold;">
      <div style="width: 180px; border-top: 1px dotted #000; text-align: center; padding-top: 4px;">Customer Approval</div>
      <div style="width: 180px; border-top: 1px dotted #000; text-align: center; padding-top: 4px;">Lead Technician Sign</div>
    </div>
  </div>
</body>
</html>
  `;
}

