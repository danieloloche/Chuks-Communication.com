import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Cpu,
  Layers,
  Search,
  MessageCircle,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Calculator,
  Sliders,
  QrCode,
  ScanLine,
  Camera,
  FlipHorizontal,
  Flashlight,
  Upload,
  RefreshCw,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle2,
  Package,
  Wrench,
  Tag,
  Sparkles,
  Printer,
  ExternalLink,
  FileText,
} from 'lucide-react';
import jsQR from 'jsqr';
import { SCREEN_COMPATIBILITY_GROUPS } from '../data/compatibilityLedger';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { Product } from '../types';
import { ProductBoxGraphic } from './ProductBoxGraphic';
import { printDirectHtml, generateTechnicianQuotePrintHtml } from '../utils/printHelpers';

interface TechnicianQuickToolProps {
  onOpenLedger: () => void;
  onFilterSearch: (term: string) => void;
  products?: Product[];
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onOpenQRLabel?: (product: Product) => void;
}

interface ScanHistoryItem {
  id: string;
  product: Product;
  rawCode: string;
  scannedAt: string;
}

const SAMPLE_BARCODES = [
  { label: 'iPhone 11 JK Screen', code: 'IP11-JK-64', desc: 'JK High Color • ₦24,000' },
  { label: 'Tecno Pop 5 InCell', code: 'TEC-POP5-IC', desc: 'InCell Flex • ₦10,500' },
  { label: 'Samsung S21 Service Pack', code: 'SAM-S21-SP', desc: 'OEM AMOLED • ₦68,000' },
  { label: 'Relife Optical Calibrator', code: 'REL-RL071-CAL', desc: 'Biometric Tool • ₦15,000' },
  { label: 'Mechanic T12 Soldering Station', code: 'MEC-T12-SOLD', desc: 'Smart Station • ₦42,000' },
  { label: 'iPhone 13PM TI Battery', code: 'IP13PM-BATT-TI', desc: 'High Capacity • ₦19,500' },
];

export const TechnicianQuickTool: React.FC<TechnicianQuickToolProps> = ({
  onOpenLedger,
  onFilterSearch,
  products = INITIAL_PRODUCTS,
  onSelectProduct,
  onAddToCart,
  onOpenQRLabel,
}) => {
  const [activeTab, setActiveTab] = useState<'quick-cross' | 'qr-scanner' | 'grade-guide' | 'quote-builder'>('qr-scanner');
  const [selectedGroupCode, setSelectedGroupCode] = useState<string>(SCREEN_COMPATIBILITY_GROUPS[0].compatibleCodes[0]);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Quote builder state
  const [quotePhone, setQuotePhone] = useState('iPhone 11');
  const [quoteGrade, setQuoteGrade] = useState('JK Grade (High Color)');
  const [quotePrice, setQuotePrice] = useState('24000');
  const [quoteWorkmanship, setQuoteWorkmanship] = useState('5000');
  const [customerName, setCustomerName] = useState('');

  // QR Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [unmatchedCode, setUnmatchedCode] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [addedSuccessToast, setAddedSuccessToast] = useState<string | null>(null);
  const [copiedSkuToast, setCopiedSkuToast] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isScanningRef = useRef(false);
  const lastScanTimeRef = useRef(0);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    const handleOpenScanner = () => {
      setActiveTab('qr-scanner');
      setTimeout(() => {
        const el = document.getElementById('technician-quick-tool');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
    window.addEventListener('chuks_open_qr_scanner', handleOpenScanner);
    return () => {
      window.removeEventListener('chuks_open_qr_scanner', handleOpenScanner);
    };
  }, []);

  const currentGroup = SCREEN_COMPATIBILITY_GROUPS.find((g) =>
    g.compatibleCodes.includes(selectedGroupCode)
  ) || SCREEN_COMPATIBILITY_GROUPS[0];

  // Soft sound feedback on successful scan
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Lookup product in catalog by scanned code / SKU / ID / QR content
  const lookupProduct = useCallback((code: string): Product | null => {
    const raw = code.trim();
    if (!raw) return null;

    // 1. JSON QR content
    if (raw.startsWith('{') && raw.endsWith('}')) {
      try {
        const parsed = JSON.parse(raw);
        const candidate = parsed.sku || parsed.id || parsed.code || parsed.productId;
        if (candidate) {
          const matched = lookupProduct(String(candidate));
          if (matched) return matched;
        }
      } catch {
        // Continue
      }
    }

    // 2. URL QR content
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      try {
        const url = new URL(raw);
        const param = url.searchParams.get('sku') || url.searchParams.get('id') || url.searchParams.get('p');
        if (param) {
          const matched = lookupProduct(param);
          if (matched) return matched;
        }
      } catch {
        // Continue
      }
    }

    const upper = raw.toUpperCase();

    // 3. Exact SKU match
    const bySku = products.find((p) => p.sku.toUpperCase() === upper);
    if (bySku) return bySku;

    // 4. Exact ID match
    const byId = products.find((p) => p.id.toLowerCase() === raw.toLowerCase());
    if (byId) return byId;

    // 5. SKU substring match
    const bySubSku = products.find(
      (p) => upper.includes(p.sku.toUpperCase()) || p.sku.toUpperCase().includes(upper)
    );
    if (bySubSku) return bySubSku;

    // 6. Compatible model match
    const byModel = products.find((p) =>
      p.compatibleModels.some((m) => m.toUpperCase().includes(upper) || upper.includes(m.toUpperCase()))
    );
    if (byModel) return byModel;

    // 7. Product name keyword match
    const byName = products.find((p) => p.name.toUpperCase().includes(upper));
    if (byName) return byName;

    return null;
  }, [products]);

  // Handle a detected QR code string
  const handleDecodedCode = useCallback((rawCode: string) => {
    const cleanCode = rawCode.trim();
    if (!cleanCode) return;

    playBeep();
    const matched = lookupProduct(cleanCode);

    if (matched) {
      setScannedProduct(matched);
      setUnmatchedCode(null);
      setScanHistory((prev) => {
        const next = [
          {
            id: `${matched.id}-${Date.now()}`,
            product: matched,
            rawCode: cleanCode,
            scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          },
          ...prev.filter((item) => item.product.id !== matched.id),
        ];
        return next.slice(0, 8);
      });
    } else {
      setScannedProduct(null);
      setUnmatchedCode(cleanCode);
    }
  }, [lookupProduct]);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
    setHasTorch(false);
  }, []);

  // Frame processing loop with native BarcodeDetector + downscaled jsQR fallback
  const processVideoFrame = useCallback(async () => {
    if (!isScanningRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const now = Date.now();
    // Throttle decoding to at most once per 100ms for high frame-rate rendering and minimal CPU load
    if (
      now - lastScanTimeRef.current >= 100 &&
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      video.videoWidth > 0 &&
      video.videoHeight > 0
    ) {
      lastScanTimeRef.current = now;

      // 1. Try Native Hardware BarcodeDetector if available
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          const detector = new (window as unknown as { BarcodeDetector: new (opts: unknown) => { detect: (src: unknown) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector({
            formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e'],
          });
          const barcodes = await detector.detect(video);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            handleDecodedCode(barcodes[0].rawValue);
            stopCamera();
            return;
          }
        } catch {
          // Fall back to canvas jsQR
        }
      }

      // 2. High-Performance Downscaled Canvas jsQR
      const maxDim = 640;
      let w = video.videoWidth;
      let h = video.videoHeight;
      if (w > maxDim) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          handleDecodedCode(code.data);
          stopCamera();
          return;
        }
      }
    }

    if (isScanningRef.current) {
      animationFrameRef.current = requestAnimationFrame(processVideoFrame);
    }
  }, [handleDecodedCode, stopCamera]);

  // Start camera stream
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by this browser environment. You can upload an image label or select a sample part below.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities && track.getCapabilities()) as { torch?: boolean } | undefined;
        setHasTorch(Boolean(capabilities?.torch));
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        isScanningRef.current = true;
        animationFrameRef.current = requestAnimationFrame(processVideoFrame);
      }
    } catch (err) {
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError' || error.name === 'SecurityError') {
        if (isInIframe) {
          setCameraError('Camera access is restricted inside embedded preview tabs. You can launch in a dedicated browser tab to scan with your camera, upload an image, or use sample barcodes below.');
        } else {
          setCameraError('Camera permission was denied. Please allow camera permissions in your browser or use the image upload & demo barcodes below.');
        }
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('No camera device detected on this system. You can upload a photo of the part label or test sample codes below.');
      } else {
        setCameraError(`Camera notice: ${error.message || 'Device busy'}. You can upload a part image or choose a sample barcode.`);
      }
      setIsCameraActive(false);
    }
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasTorch) {
      try {
        const next = !isTorchOn;
        await (track as MediaStreamTrack & { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
          advanced: [{ torch: next }],
        });
        setIsTorchOn(next);
      } catch {
        // Torch constraint error
      }
    }
  };

  // Toggle front/back camera
  const toggleCameraFacing = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
  };

  // Switch facingMode when toggled during active camera
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Clean up camera stream on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    if (activeTab !== 'qr-scanner') {
      stopCamera();
    }
  }, [activeTab, stopCamera]);

  // Process uploaded image file with downscaling for large phone photos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // Downscale image if too large (e.g. 12-48MP smartphone photos) to prevent memory exhaustion
        const maxDim = 1000;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);

          // Try native detector first
          if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
            try {
              const detector = new (window as unknown as { BarcodeDetector: new (opts: unknown) => { detect: (src: unknown) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector({
                formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e'],
              });
              const barcodes = await detector.detect(canvas);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                handleDecodedCode(barcodes[0].rawValue);
                return;
              }
            } catch {
              // fallback
            }
          }

          const imgData = ctx.getImageData(0, 0, w, h);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code && code.data) {
            handleDecodedCode(code.data);
          } else {
            setCameraError('Could not detect a clear QR barcode in the uploaded image. Please ensure the label is in focus, well-lit, and uncropped, or choose a sample part code below.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manual code submit
  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    handleDecodedCode(manualCodeInput);
  };

  // Pre-fill quote builder with scanned product
  const handleUseInQuote = (product: Product) => {
    setQuotePhone(product.compatibleModels[0] || product.name);
    setQuoteGrade(
      product.category === 'screens'
        ? (product.specs?.['Screen Grade'] || product.specs?.['Display Type'] || product.condition)
        : product.condition
    );
    setQuotePrice(String(product.price));
    setActiveTab('quote-builder');
  };

  const handleGenerateQuote = () => {
    const total = (Number(quotePrice) || 0) + (Number(quoteWorkmanship) || 0);
    const text = `*CHUKS COMMUNICATION - REPAIR & PARTS ESTIMATE*\n📍 Park Road, Gwagwalada, Abuja • 07039564380\n----------------------------------------\n${customerName ? `👤 Customer: ${customerName}\n` : ''}📱 Phone Model: ${quotePhone}\n🔧 Component: Screen Replacement (${quoteGrade})\n🏷️ Screen Price: ₦${Number(quotePrice).toLocaleString()}\n🛠️ Professional Installation: ₦${Number(quoteWorkmanship).toLocaleString()}\n----------------------------------------\n💰 *Total Estimate: ₦${total.toLocaleString()}*\n🛡️ Warranty: 30-Day Testing & Touch Warranty\n----------------------------------------\nTested with zero-defect standards at Chuks Communication.`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);

    const waUrl = `https://wa.me/2347039564380?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div id="technician-workbench-container" className="w-full">
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4 sm:p-6 backdrop-blur-md shadow-xl">
        {/* Header with Switcher Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
                <Cpu className="h-4 w-4" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Technician Tools & Part Scanner
              </h3>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Scan QR labels, check screen compatibility, or generate quick customer quotes.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-stone-800 bg-stone-950 p-1 self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('qr-scanner')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'qr-scanner'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 font-bold shadow-md shadow-orange-500/20'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Scan Part QR</span>
            </button>
            <button
              onClick={() => setActiveTab('quick-cross')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'quick-cross'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Cross-Codes Matrix
            </button>
            <button
              onClick={() => setActiveTab('grade-guide')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'grade-guide'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              Grade Comparison
            </button>
            <button
              onClick={() => setActiveTab('quote-builder')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'quote-builder'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 font-bold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              WhatsApp Job Quote
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('chuks_open_shop_invoice'))}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition text-amber-300 bg-orange-950/40 border border-orange-500/35 hover:bg-orange-900/40"
              title="Open Chuks-Ogo Sam Ventures Shop Invoice Pad"
            >
              <FileText className="h-3.5 w-3.5 text-orange-400" />
              <span>Shop Invoice Pad</span>
            </button>
          </div>
        </div>

        {/* Tab: QR Scanner (FEATURED) */}
        {activeTab === 'qr-scanner' && (
          <div className="pt-4 space-y-5">
            {/* Top Toolbar / Scanner Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Viewfinder & Camera Viewport */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScanLine className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Camera Viewfinder & Barcode Reader
                    </span>
                  </div>
                  {isCameraActive && (
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 animate-pulse">
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                      Scanning Frame...
                    </span>
                  )}
                </div>

                {/* Viewfinder Box */}
                <div className="relative aspect-video sm:aspect-[4/3] w-full rounded-2xl border-2 border-slate-800 bg-slate-950 overflow-hidden flex flex-col items-center justify-center shadow-inner">
                  {/* Hidden Offscreen Canvas for jsQR Frame Decoding */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* HTML Video element */}
                  <video
                    ref={videoRef}
                    className={`h-full w-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                    muted
                    autoPlay
                    playsInline
                  />

                  {/* Active Laser Reticle Overlay */}
                  {isCameraActive && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                      {/* Targeting Box */}
                      <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl border-2 border-emerald-400/60 bg-emerald-500/5 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
                        {/* Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

                        {/* Animated Laser Scanning Line */}
                        <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-[bounce_2s_infinite]"></div>

                        <div className="absolute bottom-2 inset-x-0 text-center">
                          <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                            Align QR / SKU inside frame
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inactive Standby Viewport */}
                  {!isCameraActive && (
                    <div className="p-6 text-center space-y-3 z-10 max-w-sm">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 shadow-lg shadow-emerald-500/10">
                        <QrCode className="h-7 w-7" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Technician Part Label Scanner</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Point your device camera at screen boxes, down board wraps, battery labels, or parts barcodes.
                        </p>
                      </div>
                      <button
                        onClick={startCamera}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:brightness-110 active:scale-95 transition"
                      >
                        <Camera className="h-4 w-4" />
                        Start Live Camera Scanner
                      </button>
                    </div>
                  )}

                  {/* Viewport Control Pill (When Camera is Active) */}
                  {isCameraActive && (
                    <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between gap-2 rounded-xl bg-slate-900/90 border border-slate-700/80 p-2 backdrop-blur-md">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={toggleCameraFacing}
                          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 transition"
                          title="Switch Front/Back Camera"
                        >
                          <FlipHorizontal className="h-3.5 w-3.5 text-orange-400" />
                          <span>Flip</span>
                        </button>

                        {hasTorch && (
                          <button
                            onClick={toggleTorch}
                            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition ${
                              isTorchOn
                                ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                                : 'border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700'
                            }`}
                            title="Toggle Flashlight / Torch"
                          >
                            <Flashlight className="h-3.5 w-3.5" />
                            <span>{isTorchOn ? 'Flash On' : 'Flash'}</span>
                          </button>
                        )}
                      </div>

                      <button
                        onClick={stopCamera}
                        className="rounded-lg bg-rose-600/80 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-rose-600 transition"
                      >
                        Stop Camera
                      </button>
                    </div>
                  )}
                </div>

                {/* Error Banner */}
                {cameraError && (
                  <div className="flex flex-col gap-2 rounded-xl border border-amber-500/40 bg-stone-900/90 p-3 text-xs text-amber-300">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-white">Camera Scanner Notice</p>
                        <p className="text-[11px] text-stone-300 mt-0.5">{cameraError}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1.5 text-xs transition shadow"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Photo / Label File</span>
                      </button>
                      <button
                        onClick={startCamera}
                        className="flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 text-xs transition"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Retry Camera</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Alternative Input Tools: Image Upload & Manual Barcode Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {/* File Upload Button */}
                  <label className="flex items-center justify-center gap-2 rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-xs font-semibold text-stone-300 hover:border-stone-700 hover:bg-stone-900 cursor-pointer transition">
                    <Upload className="h-3.5 w-3.5 text-orange-400" />
                    <span>Upload Label Photo</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Manual Quick Form */}
                  <form onSubmit={handleManualLookup} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={manualCodeInput}
                      onChange={(e) => setManualCodeInput(e.target.value)}
                      placeholder="Paste SKU / Code..."
                      className="w-full rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-orange-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-xl bg-stone-800 border border-stone-700 px-3 py-2 text-xs font-semibold text-orange-400 hover:bg-stone-700 transition"
                      title="Instant Lookup"
                    >
                      <Search className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Instant Scanned Part Detail Card */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Tag className="h-4 w-4" />
                    Scanned Part & Inventory Lookup
                  </span>
                  {scannedProduct && (
                    <button
                      onClick={() => {
                        setScannedProduct(null);
                        setUnmatchedCode(null);
                        if (!isCameraActive) startCamera();
                      }}
                      className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Scan Next Part
                    </button>
                  )}
                </div>

                {/* Case 1: Part Found */}
                {scannedProduct && (
                  <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-4">
                    {/* Glowing corner accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                    {/* Verified Match Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                          Part Identified & Verified
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="rounded-lg bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300">
                          SKU: {scannedProduct.sku}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(scannedProduct.sku);
                            setCopiedSkuToast(true);
                            setTimeout(() => setCopiedSkuToast(false), 2000);
                          }}
                          className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Copy SKU"
                        >
                          {copiedSkuToast ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Main Part Presentation */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <ProductBoxGraphic
                        product={scannedProduct}
                        size="md"
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl shrink-0 border border-slate-700"
                      />

                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-cyan-950 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                            {scannedProduct.brand}
                          </span>
                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-700">
                            {scannedProduct.condition}
                          </span>
                          <span className="rounded-md bg-purple-950 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                            {scannedProduct.repairDifficulty}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                          {scannedProduct.name}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-1">
                          {scannedProduct.description}
                        </p>

                        {/* Stock & Inventory Status Pill */}
                        <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                          <div
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-bold ${
                              scannedProduct.stock > 5
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : scannedProduct.stock > 0
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                scannedProduct.stock > 5
                                  ? 'bg-emerald-400'
                                  : scannedProduct.stock > 0
                                  ? 'bg-amber-400'
                                  : 'bg-rose-400'
                              }`}
                            />
                            <span>
                              {scannedProduct.stock > 0
                                ? `${scannedProduct.stock} In Stock (Gwagwalada Shop)`
                                : 'Out of Stock - Backorder'}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400">
                            Warranty: <strong className="text-slate-200">{scannedProduct.warranty}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Technician Price & Inventory Breakdown */}
                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Trade Unit Price</p>
                        <p className="text-lg font-black text-emerald-400 mt-0.5">
                          ₦{scannedProduct.price.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Available Stock</p>
                        <p className="text-sm font-bold text-slate-200 mt-0.5">
                          {scannedProduct.stock > 0 ? `${scannedProduct.stock} Units` : 'Out of Stock'}
                        </p>
                        <p className="text-[10px] text-slate-400">Gwagwalada Shop</p>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Testing Warranty</p>
                        <p className="text-xs font-bold text-cyan-300 mt-0.5">
                          {scannedProduct.warranty}
                        </p>
                        <p className="text-[10px] text-slate-400">Stamp & flex seal intact</p>
                      </div>
                    </div>

                    {/* Compatible Models Quick Chips */}
                    {scannedProduct.compatibleModels && scannedProduct.compatibleModels.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">
                          Compatible Chassis & Flex Codes:
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto no-scrollbar">
                          {scannedProduct.compatibleModels.map((model) => (
                            <span
                              key={model}
                              className="rounded bg-slate-800/90 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-200 font-mono"
                            >
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                      {onAddToCart && (
                        <button
                          onClick={() => {
                            onAddToCart(scannedProduct);
                            setAddedSuccessToast(`Added ${scannedProduct.name.split(' ')[0]} to cart!`);
                            setTimeout(() => setAddedSuccessToast(null), 2500);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add to Repair Cart
                        </button>
                      )}

                      <button
                        onClick={() => handleUseInQuote(scannedProduct)}
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 hover:text-white transition"
                        title="Transfer to WhatsApp Job Quote Calculator"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Create WhatsApp Quote
                      </button>

                      {onOpenQRLabel && (
                        <button
                          onClick={() => onOpenQRLabel(scannedProduct)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                          title="Generate or print sticker QR label"
                        >
                          <Printer className="h-3.5 w-3.5 text-cyan-400" />
                          Print Label
                        </button>
                      )}

                      {onSelectProduct ? (
                        <button
                          onClick={() => onSelectProduct(scannedProduct)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                        >
                          <Eye className="h-3.5 w-3.5 text-cyan-400" />
                          View Full Specs
                        </button>
                      ) : (
                        <button
                          onClick={() => onFilterSearch(scannedProduct.sku)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                        >
                          <Search className="h-3.5 w-3.5 text-cyan-400" />
                          Catalog Search
                        </button>
                      )}
                    </div>

                    {/* Added Toast */}
                    {addedSuccessToast && (
                      <div className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 p-2 text-center text-xs font-bold text-emerald-300 animate-fadeIn">
                        ✓ {addedSuccessToast}
                      </div>
                    )}
                  </div>
                )}

                {/* Case 2: Code Scanned but Not Found in Catalog */}
                {!scannedProduct && unmatchedCode && (
                  <div className="rounded-2xl border border-amber-500/40 bg-slate-950 p-5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                      <AlertCircle className="h-5 w-5" />
                      <h4 className="text-sm font-bold text-white">Part Label Not in Catalog</h4>
                    </div>
                    <p className="text-xs text-slate-300">
                      Decoded string: <strong className="font-mono text-cyan-300">{unmatchedCode}</strong>
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This barcode or QR code does not match an active SKU directly in the database. You can search the full store catalog or chat with the store parts specialist.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => onFilterSearch(unmatchedCode)}
                        className="rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition"
                      >
                        Search Catalog for &ldquo;{unmatchedCode.slice(0, 16)}&rdquo;
                      </button>
                      <button
                        onClick={() => {
                          setUnmatchedCode(null);
                          if (!isCameraActive) startCamera();
                        }}
                        className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                      >
                        Try Another Code
                      </button>
                    </div>
                  </div>
                )}

                {/* Case 3: Empty Placeholder with Quick Demo Barcode Pickers */}
                {!scannedProduct && !unmatchedCode && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                        Quick Test / Demo Shop Part Barcodes
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Click any of the workshop demo barcodes below to test instant part lookup, pricing, and live inventory verification:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SAMPLE_BARCODES.map((item) => (
                        <button
                          key={item.code}
                          onClick={() => handleDecodedCode(item.code)}
                          className="flex flex-col text-left rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 hover:border-emerald-500/50 hover:bg-slate-900 transition group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-emerald-300 line-clamp-1">
                              {item.label}
                            </span>
                            <span className="font-mono text-[10px] text-emerald-400 font-bold shrink-0">
                              {item.code}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {item.desc}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 text-xs text-slate-400 flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        Every screened part at Chuks Communication includes our <strong>30-Day Testing & Touch Warranty</strong>. Technicians in Abuja & neighboring states can scan parts upon delivery for immediate cross-verification.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scan History Strip (If Any Scanned in This Workshop Session) */}
            {scanHistory.length > 0 && (
              <div className="border-t border-slate-800 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-cyan-400" />
                    Session Scanned Parts Log ({scanHistory.length})
                  </span>
                  <button
                    onClick={() => setScanHistory([])}
                    className="text-[10px] text-slate-500 hover:text-slate-300"
                  >
                    Clear History
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {scanHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setScannedProduct(item.product)}
                      className="cursor-pointer rounded-xl border border-slate-800 bg-slate-950 p-2.5 hover:border-cyan-500/50 transition flex items-center gap-2.5"
                    >
                      <ProductBoxGraphic
                        product={item.product}
                        size="xs"
                        className="w-10 h-10 rounded shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">
                          {item.product.name}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                          <span className="font-mono text-cyan-400">₦{item.product.price.toLocaleString()}</span>
                          <span>{item.scannedAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Cross-Codes Matrix */}
        {activeTab === 'quick-cross' && (
          <div className="pt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2">
                Popular Transsion (Tecno / Infinix / Itel) Flex Codes:
              </p>
              <div className="flex flex-wrap gap-2">
                {SCREEN_COMPATIBILITY_GROUPS.map((group) => {
                  const primaryCode = group.compatibleCodes[0];
                  const isSelected = currentGroup.compatibleCodes.includes(primaryCode);
                  return (
                    <button
                      key={group.label}
                      onClick={() => setSelectedGroupCode(primaryCode)}
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-950/70 text-cyan-300 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-mono text-cyan-400">{primaryCode}</span>
                      <span className="text-[11px] text-slate-400">({group.label.split('(')[0]})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Selected Group View */}
            <div className="rounded-xl border border-cyan-500/30 bg-slate-950/70 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{currentGroup.label}</span>
                    <span className="rounded bg-cyan-950 border border-cyan-500/40 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
                      Pinout Compatible
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{currentGroup.popularPhones}</p>
                </div>
                <button
                  onClick={() => onFilterSearch(currentGroup.compatibleCodes[0])}
                  className="flex items-center gap-1 self-start sm:self-auto rounded-lg bg-cyan-600/20 border border-cyan-500/40 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-600 hover:text-white transition"
                >
                  <Search className="h-3.5 w-3.5" />
                  Search Parts in Catalog
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-300 uppercase text-[11px]">Interchangeable Screen Codes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentGroup.compatibleCodes.map((code) => (
                      <span
                        key={code}
                        className="rounded-md bg-slate-800 px-2 py-1 font-mono font-bold text-cyan-300 border border-slate-700"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-300 uppercase text-[11px]">Direct Phone Models Supported:</p>
                  <p className="rounded-lg bg-slate-900 p-2 text-slate-300 leading-relaxed border border-slate-800">
                    {currentGroup.popularPhones}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400">
                  Estimated Ledger Price: <strong className="text-white">{currentGroup.averagePrice}</strong> (InCell / JK)
                </span>
                <button
                  onClick={onOpenLedger}
                  className="text-cyan-400 hover:underline font-semibold flex items-center gap-1"
                >
                  Open Full Ledger Table <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Grade Comparison Guide */}
        {activeTab === 'grade-guide' && (
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 flex flex-col justify-between">
              <div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700">
                  STANDARD ECONOMY
                </span>
                <h5 className="text-sm font-bold text-white mt-2">InCell LCD</h5>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Best value for budget repair jobs. Integrated digitizer and display with standard color temperature.
                </p>
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                  <p>• <strong>Brightness:</strong> ~450 Nits</p>
                  <p>• <strong>Bezel:</strong> Standard thickness</p>
                  <p>• <strong>Touch Rate:</strong> 60Hz - 90Hz</p>
                  <p>• <strong>IC Swap:</strong> Basic</p>
                </div>
              </div>
              <p className="text-emerald-400 font-bold text-xs pt-3 border-t border-slate-800 mt-3">
                ✓ 30-Day Testing Warranty
              </p>
            </div>

            <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-3.5 flex flex-col justify-between ring-1 ring-cyan-500/30">
              <div>
                <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                  TECHNICIAN POPULAR
                </span>
                <h5 className="text-sm font-bold text-white mt-2">JK Grade (King)</h5>
                <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                  Top choice for iPhone and high-end Transsion. 98% sRGB color gamut, flexible FPC cable, zero touch ghosting.
                </p>
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-200">
                  <p>• <strong>Brightness:</strong> ~650 Nits (Outdoor)</p>
                  <p>• <strong>Bezel:</strong> Slim 1.9mm chin</p>
                  <p>• <strong>Touch Rate:</strong> 90Hz - 120Hz smooth</p>
                  <p>• <strong>Durability:</strong> 9H scratch resistance</p>
                </div>
              </div>
              <p className="text-cyan-300 font-bold text-xs pt-3 border-t border-cyan-900/40 mt-3">
                ✓ TrueTone Programming Ready
              </p>
            </div>

            <div className="rounded-xl border border-blue-500/40 bg-blue-950/20 p-3.5 flex flex-col justify-between">
              <div>
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                  OLED HARD / SOFT
                </span>
                <h5 className="text-sm font-bold text-white mt-2">GX Hard OLED</h5>
                <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                  True individual organic light emitting diodes. Infinite contrast ratio, pitch black pixels, and low battery drain.
                </p>
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-200">
                  <p>• <strong>Brightness:</strong> ~850 Nits HDR</p>
                  <p>• <strong>Bezel:</strong> Exact OEM curvature</p>
                  <p>• <strong>Sensor:</strong> In-display optical ready</p>
                  <p>• <strong>TrueTone:</strong> 100% supported</p>
                </div>
              </div>
              <p className="text-blue-300 font-bold text-xs pt-3 border-t border-blue-900/40 mt-3">
                ✓ Premium Replacement
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3.5 flex flex-col justify-between">
              <div>
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  FACTORY ORIGINAL
                </span>
                <h5 className="text-sm font-bold text-white mt-2">Service Pack OLED</h5>
                <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                  100% genuine Samsung / Apple service unit with original middle frame, pre-calibrated touch IC, and factory oleophobic coating.
                </p>
                <div className="mt-3 space-y-1.5 text-[11px] text-slate-200">
                  <p>• <strong>Brightness:</strong> 1200+ Nits Peak</p>
                  <p>• <strong>Frame:</strong> Pre-installed aluminum</p>
                  <p>• <strong>Display:</strong> 120Hz Dynamic AMOLED</p>
                  <p>• <strong>Fingerprint:</strong> Instant recognition</p>
                </div>
              </div>
              <p className="text-amber-300 font-bold text-xs pt-3 border-t border-amber-900/40 mt-3">
                ✓ Factory Sealed Guarantee
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: WhatsApp Job Quote Builder */}
        {activeTab === 'quote-builder' && (
          <div className="pt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
            <div className="lg:col-span-7 space-y-3">
              <p className="text-slate-300 font-medium">
                Create a professional repair quote to send directly to your customer via WhatsApp:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Customer Name (Optional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Alhaji Ibrahim"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Phone Model</label>
                  <input
                    type="text"
                    value={quotePhone}
                    onChange={(e) => setQuotePhone(e.target.value)}
                    placeholder="e.g. iPhone 11, Camon 20, S21"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Screen Grade</label>
                  <select
                    value={quoteGrade}
                    onChange={(e) => setQuoteGrade(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="InCell Standard Grade">InCell Standard Grade</option>
                    <option value="JK Grade (High Color)">JK Grade (High Color)</option>
                    <option value="GX Hard OLED Grade">GX Hard OLED Grade</option>
                    <option value="100% Original Service Pack">100% Original Service Pack</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Screen Cost (₦)</label>
                  <input
                    type="number"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    placeholder="24000"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Workmanship / Fixing Fee (₦)</label>
                  <input
                    type="number"
                    value={quoteWorkmanship}
                    onChange={(e) => setQuoteWorkmanship(e.target.value)}
                    placeholder="5000"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleGenerateQuote}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:brightness-110 active:scale-95 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  {copiedQuote ? 'Copied & Sending...' : 'Send on WhatsApp'}
                </button>

                <button
                  onClick={() => {
                    const price = Number(quotePrice) || 0;
                    const labor = Number(quoteWorkmanship) || 0;
                    const html = generateTechnicianQuotePrintHtml({
                      workshopName: 'Chuks Certified Repair Services',
                      customerName: customerName || 'Valued Client',
                      customerPhone: '',
                      deviceModel: quotePhone || 'Smartphone',
                      items: [
                        {
                          name: `Screen Replacement (${quoteGrade})`,
                          partCost: price,
                          laborFee: labor,
                          warranty: '30-Day Testing & Touch Warranty',
                        },
                      ],
                      partsTotal: price,
                      laborTotal: labor,
                      grandTotal: price + labor,
                      note: 'All parts sourced authentic from Chuks Communication, Park Road, Gwagwalada, Abuja.',
                    });
                    printDirectHtml(html, `Estimate-${quotePhone || 'Repair'}`);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 transition"
                  title="Print official repair job card directly"
                >
                  <Printer className="h-4 w-4" />
                  Print Estimate
                </button>

                <button
                  onClick={() => {
                    const total = (Number(quotePrice) || 0) + (Number(quoteWorkmanship) || 0);
                    const text = `*CHUKS COMMUNICATION - REPAIR & PARTS ESTIMATE*\n📍 After First Bank, Park Road, Gwagwalada, Abuja (07039564380)\n----------------------------------------\n${customerName ? `👤 Customer: ${customerName}\n` : ''}📱 Phone Model: ${quotePhone}\n🔧 Component: Screen Replacement (${quoteGrade})\n🏷️ Screen Price: ₦${Number(quotePrice).toLocaleString()}\n🛠️ Professional Installation: ₦${Number(quoteWorkmanship).toLocaleString()}\n----------------------------------------\n💰 *Total Estimate: ₦${total.toLocaleString()}*\n🛡️ Warranty: 30-Day Testing & Touch Warranty`;
                    navigator.clipboard.writeText(text);
                    setCopiedQuote(true);
                    setTimeout(() => setCopiedQuote(false), 2000);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  {copiedQuote ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  Copy Text
                </button>
              </div>
            </div>

            {/* Live Quote Preview */}
            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-slate-300 space-y-2">
              <div className="flex items-center justify-between text-slate-500 border-b border-slate-800 pb-2">
                <span>ESTIMATE PREVIEW</span>
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="font-bold text-white text-xs">CHUKS COMMUNICATION</p>
              <p className="text-slate-400 text-[10px]">Park Road, Gwagwalada, Abuja (07039564380)</p>
              <div className="border-t border-dashed border-slate-800 my-2" />
              {customerName && <p>Customer: {customerName}</p>}
              <p>Model: <strong className="text-cyan-300">{quotePhone}</strong></p>
              <p>Grade: {quoteGrade}</p>
              <p>Part Price: ₦{(Number(quotePrice) || 0).toLocaleString()}</p>
              <p>Installation: ₦{(Number(quoteWorkmanship) || 0).toLocaleString()}</p>
              <div className="border-t border-dashed border-slate-800 my-2" />
              <p className="text-sm font-black text-emerald-400">
                TOTAL: ₦{((Number(quotePrice) || 0) + (Number(quoteWorkmanship) || 0)).toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 pt-1">30-Day Testing & Touch Warranty</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
