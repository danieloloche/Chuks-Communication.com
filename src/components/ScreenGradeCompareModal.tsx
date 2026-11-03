import React, { useState } from 'react';
import { X, Smartphone, Check, Zap, ShieldCheck, Sparkles, Layers, ArrowRight } from 'lucide-react';

interface ScreenGradeCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterGrade: (keyword: string) => void;
}

interface GradeInfo {
  grade: string;
  badge: string;
  tagline: string;
  techType: string;
  brightness: string;
  chinBezel: string;
  refreshRate: string;
  trueToneSupport: boolean;
  durability: string;
  priceLevel: 'Budget' | 'Mid-Tier' | 'Premium' | 'OEM Original';
  estimatedPriceRange: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

export const ScreenGradeCompareModal: React.FC<ScreenGradeCompareModalProps> = ({
  isOpen,
  onClose,
  onFilterGrade,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<'All' | 'Apple' | 'Samsung' | 'Tecno & Infinix'>('All');

  if (!isOpen) return null;

  const grades: GradeInfo[] = [
    {
      grade: 'InCell LCD Grade',
      badge: 'Technician Budget Best-Seller',
      tagline: 'Cost-effective glass-integrated LCD with standard responsiveness',
      techType: 'In-Cell TFT / IPS LCD',
      brightness: '450 - 550 nits',
      chinBezel: 'Slightly wider bottom chin (~2.5mm)',
      refreshRate: 'Standard 60Hz',
      trueToneSupport: true,
      durability: 'Standard 9H Tempered Glass',
      priceLevel: 'Budget',
      estimatedPriceRange: '₦18,000 - ₦42,000',
      pros: [
        'Most affordable screen replacement on the market',
        'Direct touch IC integrated into LCD glass',
        'Easy frame fit for budget smartphone repairs',
      ],
      cons: [
        'Higher battery consumption than OLED',
        'Slightly thicker profile than factory OLED',
      ],
      bestFor: 'Cost-conscious repair clients, commercial dispatch bikes, everyday replacement.',
    },
    {
      grade: 'JK Grade Display',
      badge: 'High-Demand Workshop Grade',
      tagline: 'Vivid color balance, ultra-narrow chin, and reinforced flex connectors',
      techType: 'High-Luminance Advanced LCD / OLED',
      brightness: '600 - 700 nits',
      chinBezel: 'Slim 1:1 chin ratio (~1.8mm)',
      refreshRate: '60Hz / 90Hz Adaptive',
      trueToneSupport: true,
      durability: 'Electroplated Oleophobic Corning Coating',
      priceLevel: 'Mid-Tier',
      estimatedPriceRange: '₦28,000 - ₦65,000',
      pros: [
        'Vibrant color reproduction matching 92% of original gamut',
        'True Tone data transfer chip compatible (via JC V1SE / QianLi)',
        'Very low return rate in technician workshops',
      ],
      cons: [
        'Moderately higher cost than basic InCell',
      ],
      bestFor: 'Professional phone technicians wanting zero customer comeback complaints.',
    },
    {
      grade: 'GX Hard OLED',
      badge: 'True Deep Black OLED',
      tagline: 'Glass substrate OLED with true pixel-level contrast and true black levels',
      techType: 'Hard OLED Matrix',
      brightness: '700 - 800 nits',
      chinBezel: 'Near factory standard (~1.4mm)',
      refreshRate: 'Smooth 90Hz / 120Hz ProMotion Ready',
      trueToneSupport: true,
      durability: 'Reinforced glass with ESD protection IC',
      priceLevel: 'Premium',
      estimatedPriceRange: '₦48,000 - ₦115,000',
      pros: [
        'True black pixels (pixels turn off completely in dark mode)',
        '30% lower battery drain compared to LCD screens',
        'Original thin glass thickness fits flush into frame without bulging',
      ],
      cons: [
        'Rigid glass substrate requires careful handling during corner installation',
      ],
      bestFor: 'iPhone X through iPhone 15 Pro, Samsung Galaxy S-Series owners wanting true OLED.',
    },
    {
      grade: 'ZY / RJ Soft OLED',
      badge: 'Flexible Drop-Resistant Substrate',
      tagline: 'Flexible polyimide substrate matching Apple & Samsung curved edge specs',
      techType: 'Flexible COP Soft OLED',
      brightness: '800 - 950 nits',
      chinBezel: 'Exact OEM 1:1 Bezel (<1.2mm)',
      refreshRate: 'Full 120Hz Super Smooth Refresh',
      trueToneSupport: true,
      durability: 'Polyimide flexible core, high impact shock tolerance',
      priceLevel: 'Premium',
      estimatedPriceRange: '₦65,000 - ₦145,000',
      pros: [
        'Flexible OLED layer absorbs corner impacts without internal bleeding',
        'Identical bezel and chin dimensions to factory original',
        'Flawless HDR video playback and outdoor sunlight readability',
      ],
      cons: [
        'Pricier than Hard OLED',
      ],
      bestFor: 'High-end flagship phone users and premium client repairs demanding factory feel.',
    },
    {
      grade: 'Service Pack (OEM Original)',
      badge: '100% Genuine Factory Assembly',
      tagline: 'Authentic manufacturer display with pre-installed magnesium frame & sensors',
      techType: 'Original Dynamic AMOLED 2X / Super Retina XDR',
      brightness: '1,200 - 2,000+ nits peak',
      chinBezel: 'Exact Factory Specification',
      refreshRate: 'Native 120Hz LTPO Adaptive',
      trueToneSupport: true,
      durability: 'Corning Gorilla Glass Victus 2 / Ceramic Shield',
      priceLevel: 'OEM Original',
      estimatedPriceRange: '₦95,000 - ₦240,000',
      pros: [
        '100% genuine component from official distribution channels',
        'Pre-mounted with factory frame, ear-speaker mesh, and thermal pads',
        'Factory calibrated color temperature and touch latency',
      ],
      cons: [
        'Highest price tier',
      ],
      bestFor: 'High-value repairs, insurance claims, and customers who refuse third-party parts.',
    },
  ];

  return (
    <div
      id="screen-grade-compare-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-md overflow-y-auto"
    >
      <div
        id="screen-grade-compare-card"
        className="relative my-auto w-full max-w-5xl rounded-2xl border border-stone-800 bg-stone-900 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-800 bg-stone-950 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 border border-orange-500/40 text-orange-400">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Screen Grade Comparison Guide
                <span className="text-[11px] font-medium text-amber-400 font-mono">
                  · Chuks Standards
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Differences between InCell, JK, GX Hard OLED, Soft OLED, and OEM Service Pack.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Brand Filter Tabs */}
        <div className="border-b border-stone-800 bg-stone-950 px-5 py-2.5 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-400 mr-1 text-[11px] uppercase tracking-wider font-semibold">Filter:</span>
            {(['All', 'Apple', 'Samsung', 'Tecno & Infinix'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`rounded-lg px-3 py-1 font-medium transition ${
                  selectedBrand === b
                    ? 'bg-orange-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-stone-400 hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            All screens backed by Chuks 30-Day Testing Warranty
          </div>
        </div>

        {/* Cards Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grades.map((item) => (
              <div
                key={item.grade}
                className="rounded-xl border border-stone-800 bg-stone-950/70 p-4 flex flex-col justify-between hover:border-orange-500/40 transition group"
              >
                <div>
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                        {item.grade}
                      </h4>
                      <p className="text-[11px] text-amber-400 font-medium">
                        {item.badge}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-stone-300">
                      {item.priceLevel}
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 leading-relaxed mb-3">
                    {item.tagline}
                  </p>

                  {/* Tech specs mini-table */}
                  <div className="space-y-1.5 py-2.5 border-y border-stone-800 text-xs">
                    <div className="flex justify-between text-stone-300">
                      <span className="text-stone-500">Tech Type</span>
                      <span className="font-medium text-stone-200 truncate max-w-[170px]">{item.techType}</span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span className="text-stone-500">Brightness</span>
                      <span className="font-medium text-stone-200">{item.brightness}</span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span className="text-stone-500">Bottom Bezel</span>
                      <span className="font-medium text-stone-200">{item.chinBezel}</span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span className="text-stone-500">Refresh Rate</span>
                      <span className="font-medium text-stone-200">{item.refreshRate}</span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span className="text-stone-500">Est. Price Range</span>
                      <span className="font-bold text-amber-300 font-mono">{item.estimatedPriceRange}</span>
                    </div>
                  </div>

                  {/* Key Advantages */}
                  <div className="mt-3 space-y-1">
                    <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Key Advantages</p>
                    {item.pros.map((pro, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-stone-300">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>

                  {/* Best for */}
                  <div className="mt-3 rounded-lg bg-stone-900 p-2.5 text-xs text-stone-300 border border-stone-800">
                    <strong className="text-stone-200">Recommended for: </strong>
                    <span className="text-stone-400">{item.bestFor}</span>
                  </div>
                </div>

                {/* Filter Action */}
                <button
                  onClick={() => {
                    onClose();
                    onFilterGrade(item.grade.split(' ')[0]);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-950/40 py-2 text-xs font-semibold text-amber-300 hover:bg-orange-900/50 transition"
                >
                  <span>Browse {item.grade.split(' ')[0]} in Store</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Golden Workshop Testing Protocol Notice */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200">
            <h5 className="font-bold text-amber-300 flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4" />
              Golden Testing Rule for Technicians & Buyers:
            </h5>
            <p className="leading-relaxed">
              Before applying B-7000/T-7000 glue or removing the front/back protective warranty seal, connect the screen flex cable to the motherboard and test touch response across all corners, brightness levels, and keyboard typing for at least 5 minutes. Once adhesive is glued or stamps are torn, warranty is void.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-slate-950 px-5 py-3 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400">
            Need parts confirmation? WhatsApp: <strong className="text-slate-200">07039564380</strong>
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
