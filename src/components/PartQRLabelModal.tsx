import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  ScanLine,
  Tag,
  Share2,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Product } from '../types';
import { printDirectHtml } from '../utils/printHelpers';

interface PartQRLabelModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onTestScanInScanner?: (sku: string) => void;
}

export const PartQRLabelModal: React.FC<PartQRLabelModalProps> = ({
  product,
  isOpen,
  onClose,
  onTestScanInScanner,
}) => {
  const [qrType, setQrType] = useState<'url' | 'sku'>('url');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedSku, setCopiedSku] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!product || !isOpen) return;

    setIsGenerating(true);
    // Encode either direct mobile web link (instant camera scan) or pure SKU
    const targetContent =
      qrType === 'url' && typeof window !== 'undefined'
        ? `${window.location.origin}/?sku=${encodeURIComponent(product.sku)}&action=scan`
        : product.sku;

    QRCode.toDataURL(targetContent, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 8,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        setIsGenerating(false);
      });
  }, [product, isOpen, qrType]);

  if (!isOpen || !product) return null;

  const handleCopySku = () => {
    navigator.clipboard.writeText(product.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-LABEL-${product.sku}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    if (!qrDataUrl) return;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>QR Label - ${product.sku}</title>
  <style>
    @page { size: 60mm 40mm; margin: 2mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 4px; background: #fff; color: #000; width: 56mm; }
    .label { border: 1.5px solid #000; padding: 4px; border-radius: 4px; }
    .header { display: flex; justify-content: space-between; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px; }
    .title { font-size: 8px; font-weight: 900; }
    .brand { font-size: 8px; font-weight: bold; background: #000; color: #fff; padding: 1px 3px; border-radius: 2px; }
    .body { display: flex; gap: 4px; align-items: center; }
    .qr { width: 68px; height: 68px; }
    .info { flex: 1; font-size: 8px; line-height: 1.2; }
    .sku { font-family: monospace; font-weight: bold; font-size: 9px; }
    .name { font-weight: bold; font-size: 8.5px; margin: 2px 0; }
    .price { font-size: 10px; font-weight: 900; margin-top: 2px; }
    .footer { border-top: 1px dashed #000; margin-top: 3px; padding-top: 2px; font-size: 7px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="label">
    <div class="header">
      <div>
        <div class="title">CHUKS COMMUNICATION</div>
        <div style="font-size: 7px; color: #444;">Park Road, Gwagwalada, Abuja</div>
      </div>
      <div class="brand">${product.brand}</div>
    </div>
    <div class="body">
      <img class="qr" src="${qrDataUrl}" alt="${product.sku}" />
      <div class="info">
        <div class="sku">SKU: ${product.sku}</div>
        <div class="name">${product.name}</div>
        <div>Grade: ${product.specs?.['Screen Grade'] || product.condition}</div>
        <div class="price">₦${product.price.toLocaleString()}</div>
      </div>
    </div>
    <div class="footer">
      <span>🛡️ ${product.warranty}</span>
      <span>07039564380</span>
    </div>
  </div>
</body>
</html>
    `;
    printDirectHtml(html, `Label-${product.sku}`);
  };

  return (
    <div
      id="part-qr-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="part-qr-modal-card"
        className="relative my-auto w-full max-w-lg max-h-[92dvh] rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 sm:px-6 py-3.5 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <QrCode className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Part QR Barcode & Inventory Label
              </h3>
              <p className="text-[11px] text-slate-400">
                Print sticker label for screen boxes, flex wraps, and parts trays
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* QR Format Switcher */}
          <div className="flex items-center justify-between rounded-xl bg-slate-950 p-2 border border-slate-800 text-xs">
            <span className="text-[11px] font-medium text-slate-400">QR Content Type:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQrType('url')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  qrType === 'url' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Web Link (Phone Camera)
              </button>
              <button
                onClick={() => setQrType('sku')}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  qrType === 'sku' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Raw SKU (Scanner)
              </button>
            </div>
          </div>

          {/* Printable Label Preview Box */}
          <div
            ref={printAreaRef}
            className="relative mx-auto w-full max-w-md rounded-2xl border-2 border-slate-700 bg-white p-4 text-slate-900 shadow-xl overflow-hidden"
          >
            {/* Top Shop Banner */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                  CHUKS COMMUNICATION
                </p>
                <p className="text-[9px] font-medium text-slate-600">
                  Park Road, Gwagwalada, Abuja • 07039564380
                </p>
              </div>
              <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase font-mono">
                {product.brand}
              </span>
            </div>

            {/* Core Label Content: QR Code + Product Specs */}
            <div className="flex items-center gap-3 pt-3">
              {/* QR Code Graphic */}
              <div className="h-28 w-28 shrink-0 rounded-xl border border-slate-300 bg-white p-1 flex items-center justify-center">
                {isGenerating ? (
                  <div className="animate-pulse text-xs text-slate-400 font-mono">Generating...</div>
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code for ${product.sku}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <QrCode className="h-10 w-10 text-slate-400" />
                )}
              </div>

              {/* Product Technical Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-black tracking-wider text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                    SKU: {product.sku}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-700 uppercase">
                    {product.stock > 0 ? `${product.stock} In Stock` : 'Backorder'}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight line-clamp-2">
                  {product.name}
                </h4>

                <div className="text-[10px] text-slate-600 flex flex-wrap gap-x-2">
                  <span>Grade: <strong className="text-slate-900">{product.specs?.['Screen Grade'] || product.condition}</strong></span>
                  <span>Cat: <strong className="text-slate-900 capitalize">{product.category}</strong></span>
                </div>

                <div className="pt-1 flex items-baseline justify-between border-t border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Trade Price:</span>
                  <span className="text-base font-black text-slate-900">
                    ₦{product.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Seal */}
            <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-300 pt-1.5 text-[9px] text-slate-600">
              <span className="font-semibold">🛡️ {product.warranty}</span>
              <span className="font-mono text-[8px] text-slate-500">Scan via Chuks Quick Tool</span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2.5 text-xs font-bold text-white border border-slate-700 transition"
            >
              <Printer className="h-4 w-4 text-cyan-400" />
              Print Sticker
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2.5 text-xs font-bold text-white border border-slate-700 transition"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              Save Image
            </button>

            <button
              onClick={handleCopySku}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2.5 text-xs font-bold text-white border border-slate-700 transition"
            >
              {copiedSku ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-300" /> Copy SKU
                </>
              )}
            </button>
          </div>

          {/* Interactive Test in Technician Quick Tool */}
          {onTestScanInScanner && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 flex items-center justify-between gap-3">
              <div className="text-xs">
                <p className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <ScanLine className="h-3.5 w-3.5" />
                  Test Live Lookup in QR Scanner
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Verify how this QR barcode resolves instantly in the Technician Quick Tool.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onTestScanInScanner(product.sku);
                }}
                className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow"
              >
                Scan Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
