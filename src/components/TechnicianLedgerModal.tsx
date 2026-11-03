import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Layers,
  Cpu,
  PhoneCall,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Palette,
  FileSpreadsheet,
  Download,
  CheckSquare,
  Square,
  ShoppingCart,
  Check,
} from 'lucide-react';
import {
  IPHONE_SCREEN_LEDGER,
  SCREEN_COMPATIBILITY_GROUPS,
  ANDROID_LEDGER_ITEMS,
} from '../data/compatibilityLedger';
import { CartItem } from '../types';
import { exportCartToCSV, exportLedgerToCSV, LedgerExportItem } from '../utils/csvExport';

interface TechnicianLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSearch?: (term: string) => void;
  cartItems?: CartItem[];
}

export const TechnicianLedgerModal: React.FC<TechnicianLedgerModalProps> = ({
  isOpen,
  onClose,
  onSelectSearch,
  cartItems = [],
}) => {
  const [activeTab, setActiveTab] = useState<'iphone' | 'cross' | 'android' | 'services'>('iphone');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const filteredIPhones = useMemo(() => {
    if (!searchQuery.trim()) return IPHONE_SCREEN_LEDGER;
    const q = searchQuery.toLowerCase();
    return IPHONE_SCREEN_LEDGER.filter((item) => item.model.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredCrossGroups = useMemo(() => {
    if (!searchQuery.trim()) return SCREEN_COMPATIBILITY_GROUPS;
    const q = searchQuery.toLowerCase();
    return SCREEN_COMPATIBILITY_GROUPS.filter(
      (g) =>
        g.label.toLowerCase().includes(q) ||
        g.popularPhones.toLowerCase().includes(q) ||
        g.compatibleCodes.some((code) => code.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const filteredAndroidItems = useMemo(() => {
    if (!searchQuery.trim()) return ANDROID_LEDGER_ITEMS;
    const q = searchQuery.toLowerCase();
    return ANDROID_LEDGER_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    const next = new Set(selectedKeys);
    if (activeTab === 'iphone') {
      filteredIPhones.forEach((i) => next.add(`iphone-${i.model}`));
    } else if (activeTab === 'cross') {
      filteredCrossGroups.forEach((g) => next.add(`cross-${g.id}`));
    } else if (activeTab === 'android') {
      filteredAndroidItems.forEach((a, idx) => next.add(`android-${a.name}-${idx}`));
    }
    setSelectedKeys(next);
  };

  const handleClearSelection = () => {
    setSelectedKeys(new Set());
  };

  const handleExportSelected = () => {
    const exportItems: LedgerExportItem[] = [];

    filteredIPhones.forEach((item) => {
      if (selectedKeys.has(`iphone-${item.model}`)) {
        const grades = [
          item.inCell ? `InCell: ₦${item.inCell.toLocaleString()}` : null,
          item.jk ? `JK: ₦${item.jk.toLocaleString()}` : null,
          item.gx ? `GX: ₦${item.gx.toLocaleString()}` : null,
          item.oled ? `OLED: ₦${item.oled.toLocaleString()}` : null,
        ].filter(Boolean).join(' | ');

        exportItems.push({
          modelOrName: item.model,
          brandOrCategory: 'Apple iPhone Screen',
          gradesOrCodes: grades,
          wholesalePrice: item.inCell || item.jk || item.oled || 'Inquire',
          retailPrice: item.oled ? item.oled * 1.15 : 'Call Admin',
          warranty: '30-Day Testing Warranty',
          notes: 'TrueTone Transferable / 30-Day Testing Guarantee',
        });
      }
    });

    filteredCrossGroups.forEach((group) => {
      if (selectedKeys.has(`cross-${group.id}`)) {
        exportItems.push({
          modelOrName: group.label,
          brandOrCategory: 'Tecno / Infinix / Itel Cross Compatibility',
          gradesOrCodes: group.compatibleCodes.join(', '),
          wholesalePrice: group.averagePrice,
          retailPrice: group.averagePrice,
          warranty: '30-Day Testing Warranty',
          notes: `Supported phone models: ${group.popularPhones}`,
        });
      }
    });

    filteredAndroidItems.forEach((item, idx) => {
      if (selectedKeys.has(`android-${item.name}-${idx}`)) {
        exportItems.push({
          modelOrName: item.name,
          brandOrCategory: item.brand,
          gradesOrCodes: 'Shop Ledger Standard',
          wholesalePrice: item.price,
          retailPrice: item.price,
          warranty: '30-Day Testing Warranty',
          notes: item.notes || 'Shop Verified Stock Item',
        });
      }
    });

    if (exportItems.length === 0) return;
    exportLedgerToCSV(exportItems, `Selected Parts Ledger (${exportItems.length} items)`);
    setExportFeedback(`Exported ${exportItems.length} selected items to CSV!`);
    setTimeout(() => setExportFeedback(null), 3000);
  };

  const handleExportCurrentView = () => {
    const exportItems: LedgerExportItem[] = [];

    if (activeTab === 'iphone') {
      filteredIPhones.forEach((item) => {
        const grades = [
          item.inCell ? `InCell: ₦${item.inCell.toLocaleString()}` : null,
          item.jk ? `JK: ₦${item.jk.toLocaleString()}` : null,
          item.gx ? `GX: ₦${item.gx.toLocaleString()}` : null,
          item.oled ? `OLED: ₦${item.oled.toLocaleString()}` : null,
        ].filter(Boolean).join(' | ');

        exportItems.push({
          modelOrName: item.model,
          brandOrCategory: 'Apple iPhone Screen',
          gradesOrCodes: grades,
          wholesalePrice: item.inCell || item.jk || item.oled || 'Inquire',
          retailPrice: item.oled ? item.oled * 1.15 : 'Call Admin',
          warranty: '30-Day Testing Warranty',
          notes: 'TrueTone Transferable / 30-Day Testing Guarantee',
        });
      });
    } else if (activeTab === 'cross') {
      filteredCrossGroups.forEach((group) => {
        exportItems.push({
          modelOrName: group.label,
          brandOrCategory: 'Tecno / Infinix / Itel Cross Compatibility',
          gradesOrCodes: group.compatibleCodes.join(', '),
          wholesalePrice: group.averagePrice,
          retailPrice: group.averagePrice,
          warranty: '30-Day Testing Warranty',
          notes: `Supported phone models: ${group.popularPhones}`,
        });
      });
    } else if (activeTab === 'android') {
      filteredAndroidItems.forEach((item) => {
        exportItems.push({
          modelOrName: item.name,
          brandOrCategory: item.brand,
          gradesOrCodes: 'Shop Ledger Standard',
          wholesalePrice: item.price,
          retailPrice: item.price,
          warranty: '30-Day Testing Warranty',
          notes: item.notes || 'Shop Verified Stock Item',
        });
      });
    }

    if (exportItems.length === 0) return;
    exportLedgerToCSV(exportItems, `${activeTab.toUpperCase()} Ledger Catalog`);
    setExportFeedback(`Exported ${exportItems.length} items from ${activeTab.toUpperCase()} to CSV!`);
    setTimeout(() => setExportFeedback(null), 3000);
  };

  const handleExportCart = () => {
    if (!cartItems || cartItems.length === 0) return;
    exportCartToCSV(cartItems, 'Technician Active Parts Cart Quotation');
    setExportFeedback(`Exported ${cartItems.length} cart items to CSV quotation!`);
    setTimeout(() => setExportFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl overflow-hidden my-auto max-h-[95dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-950 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-stone-950 font-bold shadow-md shadow-orange-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Technician Price & Compatibility Ledger</h2>
                <span className="rounded-full bg-orange-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400 border border-orange-500/30">
                  Store Ledger
                </span>
              </div>
              <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-orange-400" />
                <span>Park Road, Gwagwalada, Abuja • Screens, Calibrators & Down Boards • 07039564380</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="border-b border-slate-800 bg-slate-900/90 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, code (e.g. 6525, KI7, BF7, iPhone 13, S21 Ultra, Reno 7)..."
              className="w-full rounded-xl border border-stone-800 bg-stone-950 pl-10 pr-4 py-2 text-sm text-stone-100 placeholder-stone-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('iphone')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'iphone'
                  ? 'bg-orange-500 text-stone-950 font-bold shadow-md shadow-orange-500/25'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              iPhone Grade Pricing (InCell / JK / GX / OLED)
            </button>
            <button
              onClick={() => setActiveTab('cross')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'cross'
                  ? 'bg-orange-500 text-stone-950 font-bold shadow-md shadow-orange-500/25'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Tecno / Infinix / Itel Cross-Compatibility
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'android'
                  ? 'bg-orange-500 text-stone-950 font-bold shadow-md shadow-orange-500/25'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              Android LCD Master Ledger ({filteredAndroidItems.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'services'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              Chuks Store Profile & Hardware Services
            </button>
          </div>
        </div>

        {/* CSV Invoicing & Export Toolbar */}
        <div className="border-b border-slate-800 bg-slate-950 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllVisible}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <CheckSquare className="h-3.5 w-3.5 text-cyan-400" />
              <span>Select All Visible</span>
            </button>
            {selectedKeys.size > 0 && (
              <button
                onClick={handleClearSelection}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-800 px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear ({selectedKeys.size})
              </button>
            )}
            {exportFeedback && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="h-3.5 w-3.5" />
                {exportFeedback}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Export Selected Button */}
            {selectedKeys.size > 0 && (
              <button
                id="export-ledger-selected-csv-btn"
                onClick={handleExportSelected}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Selected ({selectedKeys.size}) to CSV</span>
              </button>
            )}

            {/* Export Current View Button */}
            <button
              id="export-ledger-view-csv-btn"
              onClick={handleExportCurrentView}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 transition"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export View to CSV</span>
            </button>

            {/* Export Current Cart to CSV (Quotation / Invoicing) */}
            {cartItems.length > 0 && (
              <button
                id="export-cart-csv-btn"
                onClick={handleExportCart}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600/30 border border-cyan-500/50 px-3 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-600/50 transition"
              >
                <ShoppingCart className="h-3.5 w-3.5 text-cyan-400" />
                <span>Export Cart ({cartItems.length}) to CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: iPhone Screen Grades */}
          {activeTab === 'iphone' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Chuks Quality Guide:</strong> <strong>InCell</strong> (Ultra value standard brightness),{' '}
                  <strong>JK</strong> (Premium color fidelity), <strong>GX</strong> (Hard OLED / TrueTone IC swap supported),{' '}
                  <strong>OLED</strong> (100% Original Service Pack). All screens covered by our 30-Day Testing Warranty!
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="w-10 px-3 py-3 text-center">Select</th>
                      <th className="px-4 py-3">iPhone Model</th>
                      <th className="px-3 py-3">InCell</th>
                      <th className="px-3 py-3">JK Grade</th>
                      <th className="px-3 py-3">GX Grade</th>
                      <th className="px-3 py-3">Original OLED</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredIPhones.map((item) => {
                      const isSelected = selectedKeys.has(`iphone-${item.model}`);
                      return (
                        <tr
                          key={item.model}
                          className={`hover:bg-slate-900/50 transition ${
                            isSelected ? 'bg-cyan-950/20' : ''
                          }`}
                        >
                          <td className="w-10 px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(`iphone-${item.model}`)}
                              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                              aria-label={`Select ${item.model}`}
                            />
                          </td>
                          <td className="px-4 py-3 font-sans font-bold text-white">{item.model}</td>
                          <td className="px-3 py-3 text-cyan-300">
                            {item.inCell ? `₦${item.inCell.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-3 py-3 text-emerald-300">
                            {item.jk ? `₦${item.jk.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-3 py-3 text-amber-300">
                            {item.gx ? `₦${item.gx.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-3 py-3 text-purple-300 font-bold">
                            {item.oled ? `₦${item.oled.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-sans">
                            <a
                              href={`https://wa.me/2347039564380?text=${encodeURIComponent(
                                `Hello Chuks Communication Admin, I want to order/inquire screen for ${item.model}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-emerald-600/30 border border-emerald-500/40 px-2 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-600/50 transition"
                            >
                              <MessageCircle className="h-3 w-3" /> Inquire
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Tecno / Infinix / Itel Cross Compatibility */}
          {activeTab === 'cross' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300">
                <p className="font-semibold text-cyan-400 mb-1">
                  🔧 Technician Cross-Compatibility Reference (Transsion Matrix)
                </p>
                <p className="text-slate-400">
                  Transsion phones (Tecno, Infinix, Itel) share identical display flex cables and LCD pinouts across multiple chassis models. Use this quick reference from our shop ledger to service customer phones faster.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredCrossGroups.map((group) => {
                  const isSelected = selectedKeys.has(`cross-${group.id}`);
                  return (
                    <div
                      key={group.id}
                      className={`rounded-xl border bg-slate-950 p-4 transition space-y-2.5 ${
                        isSelected
                          ? 'border-cyan-500 shadow-md shadow-cyan-500/10'
                          : 'border-slate-800 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(`cross-${group.id}`)}
                            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                            aria-label={`Select ${group.label}`}
                          />
                          <span className="font-bold text-white text-sm">#{group.id} {group.label}</span>
                        </div>
                        <span className="rounded bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 text-xs font-mono font-bold">
                          {group.averagePrice}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pl-6">
                        {group.compatibleCodes.map((code) => (
                          <span
                            key={code}
                            className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono font-medium text-slate-200 border border-slate-700"
                          >
                            {code}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-slate-400 pl-6">
                        <strong className="text-slate-300">Models:</strong> {group.popularPhones}
                      </p>

                      <div className="pt-1 flex items-center justify-between border-t border-slate-800/80 text-xs pl-6">
                        <button
                          onClick={() => {
                            if (onSelectSearch) {
                              onSelectSearch(group.compatibleCodes[0]);
                              onClose();
                            }
                          }}
                          className="text-cyan-400 hover:underline"
                        >
                          Search items in store →
                        </button>
                        <a
                          href={`https://wa.me/2347039564380?text=${encodeURIComponent(
                            `Hello Chuks Communication Admin, I need LCD for compatibility group: ${group.label} (${group.popularPhones}).`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <MessageCircle className="h-3 w-3" /> WhatsApp Order
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Android Master Ledger */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-300 flex items-center justify-between">
                <span>Handwritten shop ledger entries for Samsung, Tecno, Infinix, Oppo, Vivo, Redmi, Nokia, Huawei</span>
                <span className="text-cyan-400 font-bold">{filteredAndroidItems.length} Models Recorded</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="w-10 px-3 py-3 text-center">Select</th>
                      <th className="px-4 py-3">Phone Model</th>
                      <th className="px-3 py-3">Brand</th>
                      <th className="px-3 py-3">Ledger Price</th>
                      <th className="px-3 py-3">Specifications / Notes</th>
                      <th className="px-4 py-3 text-right">Order Inquiry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredAndroidItems.map((item, idx) => {
                      const isSelected = selectedKeys.has(`android-${item.name}-${idx}`);
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-900/50 transition ${
                            isSelected ? 'bg-cyan-950/20' : ''
                          }`}
                        >
                          <td className="w-10 px-3 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(`android-${item.name}-${idx}`)}
                              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                              aria-label={`Select ${item.name}`}
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-white">{item.name}</td>
                          <td className="px-3 py-3 text-slate-400">{item.brand}</td>
                          <td className="px-3 py-3 font-mono font-bold text-cyan-300">{item.price}</td>
                          <td className="px-3 py-3 text-slate-400">{item.notes || 'Original Testing Warranty'}</td>
                          <td className="px-4 py-3 text-right">
                            <a
                              href={`https://wa.me/2347039564380?text=${encodeURIComponent(
                                `Hello Chuks Communication Admin, do you currently have ${item.name} (${item.price}) in stock in Gwagwalada, Abuja?`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-emerald-600/30 border border-emerald-500/40 px-2 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-600/50 transition"
                            >
                              <MessageCircle className="h-3 w-3" /> Check Stock
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Chuks Services & Flyer Info */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-blue-950/40 p-6">
                <div className="max-w-2xl space-y-3">
                  <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/30">
                    Official Flyer Profile
                  </span>
                  <h3 className="text-2xl font-black text-white tracking-tight">Chuks Communication</h3>
                  <p className="text-sm font-medium text-cyan-200">
                    Home of phone accessories & phone repair parts.
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your trusted place for quality phone parts, LCD screen replacements, zero-cycle batteries,
                    charging down boards, calibrators, and precision technician repair supplies in Abuja!
                  </p>

                  <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      <span>LCD Screens (All Brands)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      <span>Fingerprint & Display Calibrators</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      <span>Down Boards & Sub-Boards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      <span>Original Batteries & Cells</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      <span>Phone Accessories & Hardware</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      <span>Precision Toolkits & Charging Flexes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    Physical Store Location
                  </h4>
                  <p className="text-xs text-slate-300 font-medium">
                    After First Bank, Park Road, Gwagwalada, Abuja, FCT, Nigeria.
                  </p>
                  <p className="text-xs text-slate-400">
                    Walk in anytime Monday to Saturday from 8:00 AM to 6:30 PM for on-the-spot screen testing, battery replacement, and wholesale collections.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 text-emerald-400" />
                    Direct Contact Lines
                  </h4>
                  <p className="text-xs text-slate-300">
                    Phone Calling: <a href="tel:+2347039564380" className="text-cyan-400 font-mono font-bold hover:underline">+234 703 956 4380</a>
                  </p>
                  <p className="text-xs text-slate-300">
                    WhatsApp Hotline: <a href="https://wa.me/2347039564380" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-mono font-bold hover:underline">07039564380</a>
                  </p>
                  <p className="text-xs text-slate-400">
                    Express dispatch across Gwagwalada, Abuja municipal area, and nationwide courier services.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Handwritten ledger records updated directly for store technicians</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/2347039564380?text=Hello%20Chuks%20Communication%2C%20I%20have%20an%20inquiry%20regarding%20wholesale%20phone%20parts%20and%20accessories."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Direct WhatsApp Admin</span>
            </a>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              Close Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
