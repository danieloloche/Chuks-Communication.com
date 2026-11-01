import React from 'react';
import {
  Home,
  BookOpen,
  FileText,
  MessageCircle,
  ShoppingCart,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenHome: () => void;
  onOpenLedger: () => void;
  onOpenInvoice?: () => void;
  onOpenAIChat: () => void;
  onOpenCart: () => void;
  cartCount: number;
  isDarkMode?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenHome,
  onOpenLedger,
  onOpenInvoice,
  onOpenAIChat: _onOpenAIChat,
  onOpenCart,
  cartCount,
  isDarkMode = false,
}) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] md:hidden backdrop-blur-lg transition-colors ${
        isDarkMode
          ? 'border-stone-800 bg-stone-950/95 text-stone-400 shadow-2xl'
          : 'border-slate-200 bg-white/95 text-slate-600 shadow-lg'
      }`}
    >
      <div className="flex items-center justify-around">
        {/* Home / Shop */}
        <button
          onClick={onOpenHome}
          className={`flex flex-col items-center gap-0.5 p-1 active:scale-95 transition ${
            isDarkMode ? 'text-stone-400 hover:text-amber-400' : 'text-slate-600 hover:text-orange-600'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Shop</span>
        </button>

        {/* Ledger & Pinouts */}
        <button
          onClick={onOpenLedger}
          className={`flex flex-col items-center gap-0.5 p-1 active:scale-95 transition ${
            isDarkMode ? 'text-stone-400 hover:text-amber-400' : 'text-slate-600 hover:text-orange-600'
          }`}
        >
          <BookOpen className="h-5 w-5 text-orange-500" />
          <span className="text-[10px] font-semibold">Ledger</span>
        </button>

        {/* Shop Invoice Pad & Calculator */}
        {onOpenInvoice ? (
          <button
            onClick={onOpenInvoice}
            className={`flex flex-col items-center gap-0.5 p-1 active:scale-95 transition ${
              isDarkMode ? 'text-amber-300 hover:text-orange-400' : 'text-orange-600 hover:text-orange-700'
            }`}
          >
            <div className="relative">
              <FileText className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-[10px] font-bold">Invoice</span>
          </button>
        ) : null}

        {/* WhatsApp Direct */}
        <a
          href="https://wa.me/2347039564380?text=Hello%20Chuks%20Communication%2C%20I%20have%20an%20inquiry%20about%20phone%20parts%20and%20accessories"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex flex-col items-center gap-0.5 p-1 active:scale-95 transition ${
            isDarkMode ? 'text-stone-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
          }`}
        >
          <MessageCircle className="h-5 w-5 text-emerald-500" />
          <span className="text-[10px] font-semibold">WhatsApp</span>
        </a>

        {/* Cart */}
        <button
          onClick={onOpenCart}
          className={`relative flex flex-col items-center gap-0.5 p-1 active:scale-95 transition ${
            isDarkMode ? 'text-stone-400 hover:text-amber-400' : 'text-slate-600 hover:text-orange-600'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-[10px] font-black text-stone-950">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Cart</span>
        </button>
      </div>
    </div>
  );
};
