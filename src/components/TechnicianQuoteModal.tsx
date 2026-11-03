import React, { useState } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  Share2,
  Wrench,
  Smartphone,
  Plus,
  Trash2,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { Product } from '../types';
import { printDirectHtml, generateTechnicianQuotePrintHtml, downloadReceiptHtml } from '../utils/printHelpers';

interface TechnicianQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

interface QuoteLineItem {
  id: string;
  name: string;
  partCost: number;
  laborFee: number;
  warranty: string;
}

export const TechnicianQuoteModal: React.FC<TechnicianQuoteModalProps> = ({
  isOpen,
  onClose,
  products,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [technicianWorkshop, setTechnicianWorkshop] = useState('Chuks Certified Tech Services');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customLaborFee, setCustomLaborFee] = useState<number>(5000);
  const [quoteItems, setQuoteItems] = useState<QuoteLineItem[]>([
    {
      id: 'default-1',
      name: 'Samsung Galaxy A12 Replacement Display (JK Grade)',
      partCost: 19500,
      laborFee: 4000,
      warranty: '30-Day Testing Warranty',
    },
  ]);
  const [quoteNote, setQuoteNote] = useState('Please backup phone data before repair. Original screen seal tested.');

  if (!isOpen) return null;

  const handleAddProductToQuote = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setQuoteItems((prev) => [
      ...prev,
      {
        id: `quote-${Date.now()}`,
        name: prod.name,
        partCost: prod.price,
        laborFee: customLaborFee,
        warranty: prod.warranty,
      },
    ]);
    setSelectedProductId('');
  };

  const handleRemoveItem = (id: string) => {
    setQuoteItems((prev) => prev.filter((i) => i.id !== id));
  };

  const totalPartsCost = quoteItems.reduce((acc, i) => acc + i.partCost, 0);
  const totalLabor = quoteItems.reduce((acc, i) => acc + i.laborFee, 0);
  const grandTotal = totalPartsCost + totalLabor;

  const handlePrint = () => {
    const html = generateTechnicianQuotePrintHtml({
      workshopName: technicianWorkshop,
      customerName,
      customerPhone,
      deviceModel,
      items: quoteItems,
      partsTotal: totalPartsCost,
      laborTotal: totalLabor,
      grandTotal,
      note: quoteNote,
    });
    printDirectHtml(html, `Quote-${customerName || 'Repair'}`);
  };

  const handleDownload = () => {
    const html = generateTechnicianQuotePrintHtml({
      workshopName: technicianWorkshop,
      customerName,
      customerPhone,
      deviceModel,
      items: quoteItems,
      partsTotal: totalPartsCost,
      laborTotal: totalLabor,
      grandTotal,
      note: quoteNote,
    });
    downloadReceiptHtml(html, `Quote-${customerName || 'Repair'}.html`);
  };

  const handleShareWhatsApp = () => {
    const text = `🛠️ *PHONE REPAIR JOB QUOTE / ESTIMATE*\n*Workshop:* ${technicianWorkshop}\n*Customer:* ${customerName || 'Valued Client'}\n*Phone:* ${customerPhone || 'N/A'}\n*Device Model:* ${deviceModel || 'Smartphone'}\n\n*SERVICES & PARTS:*\n${quoteItems
      .map(
        (i, idx) =>
          `${idx + 1}. ${i.name}\n   - Part: ₦${i.partCost.toLocaleString()}\n   - Labor: ₦${i.laborFee.toLocaleString()}\n   - Warranty: ${i.warranty}`
      )
      .join('\n\n')}\n\n*TOTAL ESTIMATE: ₦${grandTotal.toLocaleString()}*\n\n📌 *Technician Note:* ${quoteNote}\nParts sourced authentic from Chuks Communication, Gwagwalada, Abuja.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div
      id="technician-quote-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto"
    >
      <div
        id="technician-quote-card"
        className="relative my-auto w-full max-w-4xl rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] print:max-h-none print:border-none print:bg-white print:text-black print:shadow-none"
      >
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 border border-purple-500/40 text-purple-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Technician Repair Quote & Job Card Generator
                <span className="text-[11px] font-mono text-purple-400">· Proforma Invoice</span>
              </h3>
              <p className="text-xs text-slate-400">
                Create transparent repair estimates for phone customers with parts cost + your custom repair labor fee.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Form Controls for Technician - Hidden on Print */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-4 print:hidden">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="h-4 w-4 text-cyan-400" />
              1. Job Details & Customer Info
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Your Workshop Name</label>
                <input
                  type="text"
                  value={technicianWorkshop}
                  onChange={(e) => setTechnicianWorkshop(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ibrahim Musa"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Phone Model to Repair</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13 Pro / Tecno Spark 10"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Add Part from Catalog row */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Add Replacement Part from Chuks Catalog
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">-- Select Phone Part from Chuks Store --</option>
                  {products.slice(0, 30).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₦{p.price.toLocaleString()} ({p.brand})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 whitespace-nowrap">Labor Fee (₦):</span>
                  <input
                    type="number"
                    value={customLaborFee}
                    onChange={(e) => setCustomLaborFee(Number(e.target.value) || 0)}
                    className="w-24 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddProductToQuote}
                  disabled={!selectedProductId}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50 transition shrink-0"
                >
                  <Plus className="h-4 w-4" /> Add to Bill
                </button>
              </div>
            </div>
          </div>

          {/* Printable Job Sheet & Quote Card */}
          <div
            id="printable-technician-quote"
            className="rounded-xl border border-slate-800 bg-slate-950 p-5 space-y-4 print:border-2 print:border-black print:bg-white print:text-black print:p-6"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between border-b border-slate-800 pb-4 print:border-b-2 print:border-black">
              <div>
                <h2 className="text-lg font-black text-white uppercase print:text-black print:text-xl">
                  {technicianWorkshop || 'OFFICIAL REPAIR ESTIMATE'}
                </h2>
                <p className="text-xs text-cyan-400 font-medium print:text-black">
                  Device Hardware Repair Job Estimate & Proforma Bill
                </p>
                <p className="text-[11px] text-slate-400 print:text-slate-700 mt-1">
                  Parts Provided by: <strong>Chuks Communication</strong>, Park Road, Gwagwalada, Abuja.
                </p>
              </div>
              <div className="mt-2 sm:mt-0 text-left sm:text-right text-xs">
                <span className="font-mono text-cyan-400 font-bold print:text-black">
                  ESTIMATE #{Math.floor(100000 + Math.random() * 900000)}
                </span>
                <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                  Date: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Customer & Device bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg print:bg-slate-100 print:border print:border-slate-300">
              <div>
                <span className="text-slate-500 print:text-slate-700">Client Name: </span>
                <strong className="text-white print:text-black">{customerName || 'Walk-in Client'}</strong>
              </div>
              <div>
                <span className="text-slate-500 print:text-slate-700">Device Model: </span>
                <strong className="text-white print:text-black">{deviceModel || 'General Smartphone Repair'}</strong>
              </div>
            </div>

            {/* Table of items */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 print:border-black print:text-black">
                    <th className="py-2 font-semibold">Repair Item / Replacement Part</th>
                    <th className="py-2 text-right font-semibold">Part Cost (₦)</th>
                    <th className="py-2 text-right font-semibold">Labor Fee (₦)</th>
                    <th className="py-2 text-right font-semibold">Subtotal (₦)</th>
                    <th className="py-2 text-center font-semibold print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 print:divide-slate-300">
                  {quoteItems.map((item) => (
                    <tr key={item.id} className="text-slate-300 print:text-black">
                      <td className="py-2.5 pr-2">
                        <p className="font-medium text-white print:text-black">{item.name}</p>
                        <p className="text-[11px] text-slate-500 print:text-slate-600">{item.warranty}</p>
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        ₦{item.partCost.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        ₦{item.laborFee.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-white print:text-black">
                        ₦{(item.partCost + item.laborFee).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-center print:hidden">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Totals */}
            <div className="border-t border-slate-800 pt-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs print:border-black">
              <div className="text-[11px] text-slate-400 print:text-slate-700 max-w-sm">
                <strong>Warranty & Terms:</strong> Replacement screens tested prior to installation. 30-Day Testing Warranty applies. Damaged or glued seals are non-refundable.
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-400 print:text-slate-700">
                  <span>Parts Total:</span>
                  <span className="font-mono">₦{totalPartsCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400 print:text-slate-700">
                  <span>Labor Services:</span>
                  <span className="font-mono">₦{totalLabor.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-cyan-400 border-t border-slate-800 pt-1.5 print:text-black print:border-black">
                  <span>Grand Total:</span>
                  <span className="font-mono">₦{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="border-t border-slate-800 bg-slate-950 px-5 py-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Printer className="h-4 w-4 text-cyan-400" /> Print Live
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Download className="h-4 w-4 text-purple-400" /> Save HTML
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow"
            >
              <MessageCircle className="h-4 w-4" /> Share on WhatsApp
            </button>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
