import React from 'react';
import { X, PackageCheck, Clock, Eye, Printer, Download, FileSpreadsheet, Wrench } from 'lucide-react';
import { Order } from '../types';
import { exportOrdersToCSV } from '../utils/csvExport';
import { printDirectHtml, generateOrderReceiptPrintHtml } from '../utils/printHelpers';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onViewReceipt: (order: Order) => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  onViewReceipt,
}) => {
  if (!isOpen) return null;

  const handleExportAllOrdersCSV = () => {
    exportOrdersToCSV(orders);
  };

  const handleExportSingleOrderCSV = (order: Order) => {
    exportOrdersToCSV([order]);
  };

  return (
    <div id="my-orders-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div
        id="my-orders-modal-card"
        className="relative my-auto w-full max-w-2xl max-h-[95dvh] rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Your Purchase History</h2>
              <p className="text-xs text-slate-400">Track shipments, download invoices & billing records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {orders.length > 0 && (
              <button
                id="export-orders-csv-btn"
                onClick={handleExportAllOrdersCSV}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/50 hover:bg-emerald-900/60 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 transition"
                title="Export all purchase records to CSV for billing and accounting"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10 text-slate-400">
              <Clock className="h-12 w-12 text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No purchases found yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Your completed orders and printable warranty receipts will be saved here automatically.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 text-xs transition hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400 text-sm">{order.id}</span>
                    <span className="text-slate-400">• {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase">
                      {order.paymentStatus}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        order.orderStatus === 'delivered'
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                          : order.orderStatus === 'shipped'
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-300">
                      <span className="line-clamp-1">
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="font-semibold shrink-0 text-white ml-2">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Technician Workshop Note */}
                {order.technicianNote && (
                  <div className="rounded-lg bg-cyan-950/30 border border-cyan-500/20 p-2 text-[11px] text-cyan-300 flex items-start gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-cyan-200">Technician Note:</strong> {order.technicianNote}
                    </span>
                  </div>
                )}

                {/* Summary bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 border-t border-slate-800/80 gap-2">
                  <div className="text-[11px] text-slate-400">
                    Destination: <span className="text-slate-200">{order.deliveryCity}</span> • Tracking: <span className="font-mono text-cyan-400">{order.trackingNumber}</span>
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
                    <button
                      onClick={() => {
                        const html = generateOrderReceiptPrintHtml(order);
                        printDirectHtml(html, `Receipt-${order.id}`);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-900/50 transition"
                      title="Instant 1-click print receipt"
                    >
                      <Printer className="h-3 w-3" /> Quick Print
                    </button>
                    <button
                      onClick={() => handleExportSingleOrderCSV(order)}
                      className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 transition"
                      title="Download CSV for this order"
                    >
                      <Download className="h-3 w-3 text-emerald-400" /> CSV
                    </button>
                    <button
                      onClick={() => onViewReceipt(order)}
                      className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-cyan-500 transition shadow-sm"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Invoice
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
