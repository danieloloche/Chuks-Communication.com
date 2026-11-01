import React, { useState } from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, MessageCircle, PhoneCall, ExternalLink, Wrench, Download } from 'lucide-react';
import { Order } from '../types';
import { ProductBoxGraphic } from './ProductBoxGraphic';
import { printDirectHtml, generateOrderReceiptPrintHtml, downloadReceiptHtml } from '../utils/printHelpers';

interface OrderReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const html = generateOrderReceiptPrintHtml(order);
    printDirectHtml(html, `Receipt-${order.id}`);
  };

  const handleDownload = () => {
    const html = generateOrderReceiptPrintHtml(order);
    downloadReceiptHtml(html, `Chuks-Receipt-${order.id}.html`);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div id="receipt-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto print:overflow-visible">
      <div
        id="receipt-modal-card"
        className="relative my-auto w-full max-w-xl max-h-[95dvh] rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden flex flex-col print:my-0 print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none print:w-full print:overflow-visible print:max-h-none"
      >
        {/* Top Notification Banner - Hidden on print */}
        <div className="bg-emerald-600/90 px-6 py-3 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-bold">Order Placed & Stock Reserved Successfully!</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="header-print-order-btn"
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-lg bg-emerald-700/80 hover:bg-emerald-800 px-2.5 py-1 text-xs font-semibold text-white transition"
              title="Print physical copy directly"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button onClick={onClose} className="rounded-lg p-1 hover:bg-emerald-700 text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto print:p-0 print:max-h-none print:overflow-visible">
          {/* Printable Invoice Paper Area */}
          <div
            id="printable-order-receipt"
            className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4 print:border print:border-slate-300 print:bg-white print:text-black print:p-6 print:rounded-none"
          >
            {/* Business Header */}
            <div className="flex flex-col sm:flex-row justify-between border-b border-slate-800 pb-4 print:border-b-2 print:border-slate-300">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight print:text-black print:text-xl">CHUKS COMMUNICATION</h3>
                <p className="text-xs font-semibold text-cyan-400 print:text-slate-700">Screens, Calibrators & Down Boards</p>
                <p className="text-[11px] text-slate-400 mt-1 print:text-slate-600">
                  Park Road, Gwagwalada, Abuja<br />
                  Call: <span className="font-semibold print:text-black">07039564380</span> • WhatsApp: <span className="font-semibold print:text-black">07039564380</span>
                </p>
              </div>
              <div className="mt-3 sm:mt-0 text-left sm:text-right">
                <span className="rounded-md bg-cyan-950 border border-cyan-500/30 px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 print:border print:border-slate-400 print:bg-slate-100 print:text-black">
                  {order.id}
                </span>
                <p className="text-[11px] text-slate-400 mt-1 print:text-slate-600">
                  Date: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <span className="inline-block mt-1 rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 uppercase border border-emerald-500/30 print:bg-slate-100 print:border-slate-300 print:text-black">
                  {order.paymentStatus} via {order.paymentMethod.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Customer & Tracking Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print:grid-cols-2">
              <div className="rounded-lg bg-slate-900/70 p-3 border border-slate-800 print:bg-slate-50 print:border-slate-300">
                <p className="text-[10px] font-bold uppercase text-slate-400 print:text-slate-600">Customer Details</p>
                <p className="font-semibold text-white mt-1 print:text-black">{order.customerName}</p>
                <p className="text-slate-300 print:text-slate-800">{order.customerPhone}</p>
                <p className="text-slate-400 truncate print:text-slate-700">{order.customerEmail}</p>
              </div>

              <div className="rounded-lg bg-slate-900/70 p-3 border border-slate-800 print:bg-slate-50 print:border-slate-300">
                <p className="text-[10px] font-bold uppercase text-slate-400 print:text-slate-600">Shipping Destination</p>
                <p className="text-slate-300 mt-1 print:text-slate-800">{order.deliveryAddress}</p>
                <p className="font-semibold text-cyan-300 print:text-black">{order.deliveryCity}, Nigeria</p>
                <p className="text-[11px] text-slate-400 mt-1 print:text-slate-700">
                  Tracking: <strong className="font-mono text-slate-200 print:text-black">{order.trackingNumber}</strong>
                </p>
              </div>
            </div>

            {/* Technician Workshop Note if present */}
            {order.technicianNote && (
              <div className="rounded-lg bg-cyan-950/40 p-3 border border-cyan-500/40 text-xs print:bg-slate-50 print:border print:border-slate-400">
                <p className="text-[10px] font-bold uppercase text-cyan-300 print:text-slate-800 flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-cyan-400 print:text-black" />
                  Technician Workshop Note & Special Instructions:
                </p>
                <p className="text-white font-medium mt-1 print:text-black italic">
                  "{order.technicianNote}"
                </p>
              </div>
            )}

            {/* Order Items Table */}
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 mb-2 print:text-slate-700">Purchased Phone Parts & Accessories</p>
              <div className="space-y-2 print:space-y-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2 print:border-slate-200">
                    <div className="flex items-center gap-2">
                      <ProductBoxGraphic
                        name={item.productName}
                        brand={item.brand}
                        size="xs"
                        className="h-9 w-9 rounded shrink-0 print:border print:border-slate-300 print:h-8 print:w-8"
                      />
                      <div>
                        <p className="font-medium text-white line-clamp-1 print:text-black print:font-semibold">{item.productName}</p>
                        <span className="text-[10px] text-cyan-400 print:text-slate-600">{item.brand} • Quantity: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-200 print:text-black">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials Breakdown */}
            <div className="space-y-1 text-xs border-t border-slate-800 pt-3 print:border-t-2 print:border-slate-300">
              <div className="flex justify-between text-slate-400 print:text-slate-700">
                <span>Subtotal</span>
                <span className="print:text-black">₦{order.subtotal.toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 print:text-emerald-700">
                  <span>Wholesale Bulk Discount</span>
                  <span>-₦{order.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 print:text-slate-700">
                <span>Shipping Fee</span>
                <span className="print:text-black">{order.shippingFee === 0 ? 'FREE' : `₦${order.shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800 print:border-slate-300 print:text-black">
                <span>Total Amount Paid</span>
                <span className="text-cyan-400 text-base print:text-black">₦{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Warranty Certificate Notice */}
            <div className="rounded-lg bg-slate-900/90 p-3 border border-emerald-500/20 text-[11px] text-slate-300 print:bg-slate-50 print:border-slate-300 print:text-black">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400 print:text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-500 print:text-slate-800" /> Official 30-Day Testing Warranty Certificate
              </div>
              <p className="mt-1 text-slate-400 leading-relaxed print:text-slate-700">
                This physical receipt certifies the 30-day testing warranty for screens and 6-month warranty on batteries purchased from Chuks Communication, Gwagwalada, Abuja. Present this receipt or Order ID for all technical support inquiries.
              </p>
            </div>
          </div>

          {/* Action buttons - Hidden when printing */}
          <div className="flex flex-col sm:flex-row gap-2.5 print:hidden">
            <button
              id="print-order-receipt-btn"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 transition active:scale-95"
              title="Print physical copy of this receipt directly"
            >
              <Printer className="h-4 w-4" />
              <span>Print Live</span>
            </button>

            <button
              id="download-order-receipt-btn"
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              title="Download offline receipt file"
            >
              <Download className="h-4 w-4 text-cyan-400" />
              <span>{downloadSuccess ? 'Downloaded!' : 'Save Receipt'}</span>
            </button>

            <a
              id="receipt-whatsapp-admin-btn"
              href={`https://wa.me/2347039564380?text=${encodeURIComponent(
                `Hello Chuks Communication Admin, I have placed an order:\n\n🧾 Order ID: ${order.id}\n👤 Customer: ${order.customerName}\n📞 Phone: ${order.customerPhone}\n📦 Items: ${order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}\n💰 Total: ₦${order.totalAmount.toLocaleString()}\n📍 Destination: ${order.deliveryAddress}, ${order.deliveryCity}\n💳 Payment: ${order.paymentStatus.toUpperCase()} via ${order.paymentMethod.toUpperCase()}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition"
              title="Send order receipt to Admin on WhatsApp for instant confirmation"
            >
              <MessageCircle className="h-4 w-4" /> Send to Admin WhatsApp
            </a>

            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
