import React, { useState } from 'react';
import { X, CreditCard, Building2, PhoneCall, MessageCircle, Truck, ShieldCheck, CheckCircle, Copy, Check, Lock, Loader2, Wrench } from 'lucide-react';
import { CartItem, PaymentMethod, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedDiscount?: { code: string; discount: number } | null;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedDiscount,
  onOrderSuccess,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Abuja - Gwagwalada (Park Road Store Pickup / Local Dispatch)');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [technicianNote, setTechnicianNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  // Card details
  const [cardNumber, setCardNumber] = useState('5399 4120 8891 0024');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardName, setCardName] = useState('Emeka Nwosu');

  // Interactive states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpSimulation, setShowOtpSimulation] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');
  const [copiedBank, setCopiedBank] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const validItems = (items || []).filter((item): item is CartItem => Boolean(item && item.product && typeof item.product.price === 'number'));
  const subtotal = validItems.reduce((sum, item) => sum + (item.product.price || 0) * (item.quantity || 1), 0);
  const discountAmount = appliedDiscount?.discount || 0;
  const isFreeShip = subtotal >= 50000;
  const shippingFee = validItems.length === 0 ? 0 : isFreeShip ? 0 : 2500;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('8163301810');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress) {
      setFormError('Please fill in your name, phone number, and delivery address.');
      return;
    }
    setFormError('');

    if (paymentMethod === 'card') {
      // Show realistic 3D secure verification simulation
      setShowOtpSimulation(true);
    } else {
      processFinalOrder('paid');
    }
  };

  const processFinalOrder = async (payStatus: 'paid' | 'pending') => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
          brand: item.product.brand,
        })),
        totalAmount: grandTotal,
        subtotal,
        shippingFee,
        discountAmount,
        promoCode: appliedDiscount?.code || undefined,
        customerName,
        customerEmail: customerEmail || 'customer@chuksstore.ng',
        customerPhone,
        deliveryAddress,
        deliveryCity,
        deliveryNotes,
        technicianNote: technicianNote.trim() || undefined,
        paymentMethod,
        paymentStatus: payStatus,
        orderStatus: 'processing',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!res.ok) throw new Error('Order creation failed');
      const createdOrder: Order = await res.json();
      onOrderSuccess(createdOrder);
      onClose();
    } catch (err) {
      console.error(err);
      setFormError('Failed to process order. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowOtpSimulation(false);
    }
  };

  return (
    <div id="checkout-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div
        id="checkout-modal-card"
        className="relative my-auto w-full max-w-2xl max-h-[95dvh] rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Secure Checkout</h2>
              <p className="text-xs text-slate-400">Chuks Communication 256-Bit Encrypted</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 3D Secure OTP Simulation Modal overlay */}
        {showOtpSimulation && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl">
              <div className="flex items-center justify-center gap-2 text-cyan-400 font-bold mb-2">
                <ShieldCheck className="h-6 w-6" />
                <span>Verified by 3D Secure</span>
              </div>
              <p className="text-xs text-slate-300">
                A simulated one-time authentication passcode was sent to your phone {customerPhone}.
              </p>
              <div className="my-4">
                <label className="text-[11px] font-medium text-slate-400 uppercase">One-Time Password (OTP)</label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 text-center text-lg font-mono tracking-widest text-cyan-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOtpSimulation(false)}
                  className="flex-1 rounded-lg bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => processFinalOrder('paid')}
                  className="flex-1 rounded-lg bg-cyan-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-cyan-500"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm & Authorize'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleInitialSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {formError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
              {formError}
            </div>
          )}

          {/* Customer & Delivery Information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <Truck className="h-4 w-4" /> 1. Delivery & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Chukwudi Okafor"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">State / City *</label>
                <select
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Abuja - Gwagwalada (Park Road Store Pickup / Local Dispatch)">Abuja - Gwagwalada (Store Pickup / Local Rider)</option>
                  <option value="Abuja - Metropolis (Garki, Wuse, Kubwa, Lugbe, Apo)">Abuja - Metropolis (Same Day Express)</option>
                  <option value="Lagos (Express Waybill - 24 to 48 Hours)">Lagos (Express Waybill - 24 to 48 Hours)</option>
                  <option value="Kaduna / Kano / Niger State (Express Waybill)">Kaduna / Kano / Niger State (Express Waybill)</option>
                  <option value="Kogi / Benue / Plateau (Express Waybill)">Kogi / Benue / Plateau (Express Waybill)</option>
                  <option value="Port Harcourt / South-South (48 Hours)">Port Harcourt / South-South (48 Hours)</option>
                  <option value="Enugu / Onitsha / South-East (48 Hours)">Enugu / Onitsha / South-East (48 Hours)</option>
                  <option value="Ibadan / Ogun / South-West (48 Hours)">Ibadan / Ogun / South-West (48 Hours)</option>
                  <option value="Other States (Nationwide Park Waybill)">Other States (Nationwide Park Waybill)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">Street Delivery Address *</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. Shop 12, Computer Village / 45 Broad Street"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">Delivery Notes (Optional)</label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="e.g. Call when arriving at junction"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Technician & Workshop Order Instructions */}
              <div className="sm:col-span-2 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="checkout-technician-note" className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-cyan-400" />
                    Technician / Workshop Order Note (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Printed on Order Invoice</span>
                </div>
                <textarea
                  id="checkout-technician-note"
                  rows={2}
                  value={technicianNote}
                  onChange={(e) => setTechnicianNote(e.target.value)}
                  placeholder="e.g. 'Testing required before shipping', 'Include specific calibration tool', 'Test touch & OCA seal'..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none"
                />
                {/* Quick preset chips */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-[10px] font-medium text-slate-400 self-center">Quick Presets:</span>
                  {[
                    'Testing required before shipping',
                    'Include specific calibration tool',
                    'Test touch screen & OCA seal',
                    'Fast charge down-board check',
                    'Urgent repair order - Dispatch today',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setTechnicianNote((prev) => (prev ? `${prev}; ${preset}` : preset));
                      }}
                      className="rounded-md border border-cyan-500/30 bg-cyan-950/60 px-2 py-0.5 text-[10px] font-medium text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition active:scale-95"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4" /> 2. Select Payment Method
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  paymentMethod === 'card'
                    ? 'border-orange-500 bg-orange-950/40 text-white shadow-md'
                    : 'border-stone-800 bg-stone-950/50 text-stone-400 hover:text-white'
                }`}
              >
                <CreditCard className="h-5 w-5 mb-1 text-orange-400" />
                <span className="text-xs font-semibold">Debit Card</span>
                <span className="text-[10px] text-stone-500">Instant OTP</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  paymentMethod === 'transfer'
                    ? 'border-orange-500 bg-orange-950/40 text-white shadow-md'
                    : 'border-stone-800 bg-stone-950/50 text-stone-400 hover:text-white'
                }`}
              >
                <Building2 className="h-5 w-5 mb-1 text-orange-400" />
                <span className="text-xs font-semibold">Bank Transfer</span>
                <span className="text-[10px] text-stone-500">Chuks Bank</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ussd')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  paymentMethod === 'ussd'
                    ? 'border-orange-500 bg-orange-950/40 text-white shadow-md'
                    : 'border-stone-800 bg-stone-950/50 text-stone-400 hover:text-white'
                }`}
              >
                <PhoneCall className="h-5 w-5 mb-1 text-orange-400" />
                <span className="text-xs font-semibold">USSD / Mobile</span>
                <span className="text-[10px] text-stone-500">*737# Dial</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-orange-500 bg-orange-950/40 text-white shadow-md'
                    : 'border-stone-800 bg-stone-950/50 text-stone-400 hover:text-white'
                }`}
              >
                <Truck className="h-5 w-5 mb-1 text-orange-400" />
                <span className="text-xs font-semibold">Pay on Delivery</span>
                <span className="text-[10px] text-stone-500">In-person</span>
              </button>
            </div>

            {/* Payment Sub-panel */}
            <div className="mt-4 rounded-xl bg-slate-950/70 p-4 border border-slate-800">
              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Card Information</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <Lock className="h-3 w-3" /> 256-Bit SSL Safe
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="5399 0000 0000 0000"
                      className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400">Expiration Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400">Security Code (CVV)</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="space-y-3 text-xs">
                  <p className="text-stone-300">
                    Transfer exactly <strong className="text-amber-400">₦{grandTotal.toLocaleString()}</strong> to the official Chuks Communication account:
                  </p>
                  <div className="rounded-lg bg-stone-900 p-3 border border-stone-700/80 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Bank Name:</span>
                      <span className="font-bold text-amber-400 text-right">Moniepoint MFB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Account Name:</span>
                      <span className="font-bold text-white text-right">Chuks Ogo Sam Venture</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-stone-800">
                      <span className="text-stone-400">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-amber-400 tracking-wider">8163301810</span>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="rounded px-2 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-stone-950 flex items-center gap-1 font-semibold text-[11px] transition"
                          title="Copy account number"
                        >
                          {copiedBank ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-stone-800 text-[11px]">
                      <span className="text-stone-400">Transfer From:</span>
                      <span className="font-medium text-stone-300 text-right">Any Nigerian Bank App, USSD, OPay or POS</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-stone-400">Instant Transfer Verification:</span>
                    <a
                      href={`https://wa.me/2347039564380?text=${encodeURIComponent(
                        `Hello Chuks Communication Admin, I have transferred ₦${grandTotal.toLocaleString()} to Moniepoint (Chuks Ogo Sam Venture - 8163301810) for my order.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp: 07039564380
                    </a>
                  </div>
                </div>
              )}

              {paymentMethod === 'ussd' && (
                <div className="space-y-2 text-xs text-stone-300">
                  <p>Dial from your registered banking SIM to transfer to <strong>Moniepoint MFB - Chuks Ogo Sam Venture (8163301810)</strong>:</p>
                  <div className="rounded-lg bg-stone-900 p-3 font-mono text-amber-300 border border-stone-700 space-y-1">
                    <div>*737*2*{grandTotal}*8163301810# (GTBank)</div>
                    <div>*966*{grandTotal}*8163301810# (Zenith Bank)</div>
                    <div>*894*{grandTotal}*8163301810# (First Bank)</div>
                    <div>*901*{grandTotal}*8163301810# (Access Bank)</div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cash_on_delivery' && (
                <div className="text-xs text-stone-300 space-y-1">
                  <p className="font-semibold text-amber-300">Pay upon delivery or physical pickup:</p>
                  <p className="text-stone-400">
                    You can pay via card POS or cash directly to the dispatch rider upon inspection of your phone parts.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Summary Box */}
          <div className="rounded-xl bg-stone-950 p-4 border border-stone-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>Items Subtotal ({items.length})</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Wholesale Bulk Discount</span>
                <span>-₦{discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-400">
              <span>Shipping to {deliveryCity}</span>
              <span>{shippingFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `₦${shippingFee.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between border-t border-stone-800 pt-2 text-sm font-bold text-white">
              <span>Total Payable</span>
              <span className="text-amber-400 text-base">₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 rounded-xl bg-stone-800 py-3 text-xs font-semibold text-stone-300 hover:bg-stone-700 transition"
            >
              Back
            </button>
            <button
              id="confirm-pay-order-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 py-3 text-sm font-bold text-stone-950 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Place Order (₦{grandTotal.toLocaleString()})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
