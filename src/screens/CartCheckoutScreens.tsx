import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Building2,
  Check,
  CreditCard,
  MapPin,
  ShieldCheck,
  Smartphone,
  Tag,
  Trash2,
  Wallet,
} from 'lucide-react';
import { COUPONS } from '../data/mockData';
import { Address, CartItem, Coupon, ScreenName } from '../types';
import { FoodArtwork, ShoppingBagIllustration } from '../components/BrandAssets';
import {
  BottomSheet,
  BottomTabBar,
  EmptyState,
  OutlineButton,
  PrimaryButton,
  QuantityStepper,
  RadioCard,
  TopBar,
  VegIndicator,
} from '../components/UI';

export const computeDeliveryFee = (address: Address, subtotal: number) => {
  if (subtotal === 0) return 0;
  return address.distanceKm <= 5 ? 40 : 60;
};

/* Screen 8: Cart */
export const CartScreen: React.FC<{
  cart: CartItem[];
  activeAddress: Address;
  appliedCoupon: Coupon | null;
  coupons?: Coupon[];
  onUpdateQty: (cartKey: string, delta: number) => void;
  onRemoveItem: (cartKey: string, delta?: number) => void;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
  onProceedCheckout: () => void;
  onBrowseMenu: () => void;
  onBack: () => void;
  onNavigateTab: (tab: ScreenName) => void;
}> = ({
  cart,
  activeAddress,
  appliedCoupon,
  coupons,
  onUpdateQty,
  onRemoveItem,
  onApplyCoupon,
  onRemoveCoupon,
  onProceedCheckout,
  onBrowseMenu,
  onBack,
  onNavigateTab,
}) => {
  const [couponSheetOpen, setCouponSheetOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');

  const itemTotal = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const addonsTotal = line.addons.reduce((a, x) => a + x.price, 0);
        return sum + (line.unitPrice + addonsTotal) * line.quantity;
      }, 0),
    [cart]
  );

  const deliveryFee = computeDeliveryFee(activeAddress, itemTotal);
  const discount =
    appliedCoupon && itemTotal >= appliedCoupon.minOrder ? appliedCoupon.discountAmount : 0;
  const totalPayable = Math.max(0, itemTotal + deliveryFee - discount);
  const totalCartCount = cart.reduce((s, c) => s + c.quantity, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title="My Cart" onBack={onBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {cart.length === 0 ? (
          <EmptyState
            emoji="🛒"
            title="Your Cart is Empty"
            description="Looks like you haven't added any curries, daily meals, or biryanis yet."
            ctaLabel="Browse Menu"
            onCta={onBrowseMenu}
          />
        ) : (
          <>
            {/* Cart Lines */}
            <div className="space-y-3">
              {cart.map((line) => {
                const addonsUnit = line.addons.reduce((a, x) => a + x.price, 0);
                const lineTotal = (line.unitPrice + addonsUnit) * line.quantity;
                return (
                  <div
                    key={line.cartKey}
                    className="bg-white rounded-[18px] p-3 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/5 flex items-center gap-3"
                  >
                    <FoodArtwork
                      imageKey={line.item.image}
                      emoji={line.item.emoji}
                      label={line.item.name}
                      tint={line.item.tint}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <VegIndicator veg={line.item.veg} />
                          <h3 className="text-[13.5px] font-semibold text-[#1B1B1B] truncate">
                            {line.item.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(line.cartKey)}
                          aria-label={`Remove ${line.item.name}`}
                          className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#6B6B6B] cursor-pointer shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="text-[11.5px] text-[#6B6B6B] mt-0.5 truncate">
                        {line.sizeLabel}
                        {line.addons.length > 0 &&
                          ` · +${line.addons.map((a) => a.name).join(', ')}`}
                        {line.isBulk && line.bulkDate && ` · ${line.bulkDate} (${line.bulkTime})`}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[15px] font-semibold text-[#1F6B2B] tabular-nums">
                          ₹{lineTotal}
                        </span>
                        <QuantityStepper
                          compact
                          quantity={line.quantity}
                          onDecrease={() => onUpdateQty(line.cartKey, -1)}
                          onIncrease={() => onUpdateQty(line.cartKey, 1)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Apply Coupon Row */}
            <div className="bg-white rounded-[18px] p-3.5 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#FFF1D6] flex items-center justify-center shrink-0">
                  <Tag size={17} className="text-[#7A3E12]" />
                </div>
                <div className="min-w-0">
                  {appliedCoupon && discount > 0 ? (
                    <>
                      <div className="text-[13px] font-semibold text-[#1F6B2B]">
                        {appliedCoupon.code} Applied (-₹{discount})
                      </div>
                      <div className="text-[11px] text-[#6B6B6B] truncate">
                        {appliedCoupon.title}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[13.5px] font-semibold text-[#1B1B1B]">Apply Coupon</div>
                      <div className="text-[11px] text-[#6B6B6B]">
                        Try SWASTIK50 or FIRST100
                      </div>
                    </>
                  )}
                </div>
              </div>
              {appliedCoupon && discount > 0 ? (
                <button
                  type="button"
                  onClick={onRemoveCoupon}
                  className="text-[12px] font-semibold text-[#D93B2B] px-2 py-1 cursor-pointer"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCouponSheetOpen(true)}
                  className="text-[12.5px] font-semibold text-[#1F6B2B] inline-flex items-center gap-1 px-2 py-1 cursor-pointer shrink-0"
                >
                  <span>View Offers</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>

            {/* Bill Breakdown */}
            <div className="bg-white rounded-[18px] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/5 space-y-2.5">
              <h3 className="text-[14px] font-semibold text-[#1B1B1B]">Bill Summary</h3>
              <div className="flex items-center justify-between text-[13px] text-[#6B6B6B]">
                <span>Item Total</span>
                <span className="font-medium text-[#1B1B1B] tabular-nums">₹{itemTotal}</span>
              </div>
              <div className="flex items-center justify-between text-[13px] text-[#6B6B6B]">
                <span>Delivery Fee ({activeAddress.distanceKm} km)</span>
                <span className="font-medium text-[#1B1B1B] tabular-nums">₹{deliveryFee}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-[13px] text-[#1F6B2B]">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span className="font-semibold tabular-nums">-₹{discount}</span>
                </div>
              )}
              <div className="h-px bg-black/8 my-1" />
              <div className="flex items-center justify-between text-[15px] font-semibold text-[#1B1B1B]">
                <span>Total Payable</span>
                <span className="text-[17px] text-[#1F6B2B] tabular-nums">₹{totalPayable}</span>
              </div>
            </div>

            <div className="pt-1 pb-2">
              <PrimaryButton onClick={onProceedCheckout}>
                <span>Proceed to Checkout</span>
                <ArrowRight size={17} />
              </PrimaryButton>
            </div>
          </>
        )}
      </div>

      <BottomTabBar
        activeTab="cart"
        cartCount={totalCartCount}
        onSelectTab={onNavigateTab}
      />

      {/* Coupons Bottom Sheet */}
      <BottomSheet
        open={couponSheetOpen}
        onClose={() => setCouponSheetOpen(false)}
        title="Apply Coupon"
      >
        <div className="space-y-3.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Enter coupon code (e.g. SWASTIK50)"
              className="flex-1 h-[44px] rounded-full border border-black/15 bg-white px-4 text-[13px] font-medium uppercase outline-none focus:border-[#1F6B2B]"
            />
            <button
              type="button"
              onClick={() => {
                if (onApplyCoupon(couponInput)) {
                  setCouponSheetOpen(false);
                  setCouponInput('');
                }
              }}
              className="h-[44px] px-5 rounded-full bg-[#1F6B2B] text-white text-[13px] font-semibold cursor-pointer"
            >
              Apply
            </button>
          </div>

          <div className="space-y-2.5">
            {(coupons && coupons.length > 0 ? coupons : COUPONS)
              .filter((c) => c.active !== false)
              .map((c) => {
              const eligible = itemTotal >= c.minOrder;
              return (
                <div
                  key={c.code}
                  className="bg-white rounded-[16px] p-3.5 border border-black/8 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-[#1F6B2B] tracking-wide">
                        {c.code}
                      </span>
                      <span className="text-[11px] text-[#7A3E12] font-medium">
                        · {c.title}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#6B6B6B] mt-0.5">{c.description}</p>
                    {!eligible && (
                      <p className="text-[11px] text-[#D93B2B] mt-0.5">
                        Add ₹{c.minOrder - itemTotal} more to unlock
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onApplyCoupon(c.code)) setCouponSheetOpen(false);
                    }}
                    className={`h-8 px-3.5 rounded-full text-[12px] font-semibold shrink-0 cursor-pointer ${
                      eligible
                        ? 'bg-[#E3F2DC] text-[#1F6B2B]'
                        : 'bg-black/5 text-[#6B6B6B]'
                    }`}
                  >
                    Apply
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

/* Screen 9: Checkout */
export const CheckoutScreen: React.FC<{
  activeAddress: Address;
  addresses: Address[];
  totalPayable: number;
  selectedDate: string;
  selectedSlot: string;
  onChangeDate: (d: string) => void;
  onChangeSlot: (s: string) => void;
  onSelectAddress: (id: string) => void;
  onManageAddresses: () => void;
  onContinuePayment: () => void;
  onRedirectCatering: () => void;
  onBack: () => void;
}> = ({
  activeAddress,
  addresses,
  totalPayable,
  selectedDate,
  selectedSlot,
  onChangeDate,
  onChangeSlot,
  onSelectAddress,
  onManageAddresses,
  onContinuePayment,
  onRedirectCatering,
  onBack,
}) => {
  const [deliveryType, setDeliveryType] = useState<'standard' | 'catering'>('standard');
  const [addrModal, setAddrModal] = useState(false);

  const dateOptions = ['Today, 26 Nov', 'Tomorrow, 27 Nov', 'Fri, 28 Nov'];
  const slotOptions = [
    '12:30 PM - 01:00 PM',
    '01:00 PM - 01:30 PM',
    '07:30 PM - 08:00 PM',
    '08:00 PM - 08:30 PM',
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title="Checkout" onBack={onBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24">
        {/* Delivery Details */}
        <div className="bg-white rounded-[18px] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[14px] font-semibold text-[#1B1B1B]">Delivery Details</span>
            <button
              type="button"
              onClick={() => setAddrModal(true)}
              className="text-[12.5px] font-semibold text-[#1F6B2B] cursor-pointer"
            >
              Change
            </button>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FCE3D4] flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={17} className="text-[#D93B2B]" />
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-[#1B1B1B]">
                {activeAddress.tag} · {activeAddress.label}
              </div>
              <p className="text-[12px] text-[#6B6B6B] mt-0.5 leading-relaxed">
                {activeAddress.fullAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Type */}
        <div className="space-y-2.5">
          <h2 className="text-[15px] font-semibold text-[#1B1B1B]">Delivery Type</h2>
          <RadioCard
            selected={deliveryType === 'standard'}
            onSelect={() => setDeliveryType('standard')}
            title="Home Food / Curries"
            subtitle="Quick Delivery · 30–45 mins"
            rightText={`₹${totalPayable}`}
          />
          <RadioCard
            selected={deliveryType === 'catering'}
            onSelect={() => setDeliveryType('catering')}
            title="Catering Order"
            subtitle="Scheduled Date & Time · Custom Event Quote"
            rightText="Quote"
          />
        </div>

        {deliveryType === 'catering' ? (
          <div className="rounded-[18px] bg-[#FFF1D6] p-4 border border-[#F5B52E]/40 text-[12.5px] text-[#7A3E12] leading-relaxed">
            <strong className="font-semibold text-[#1B1B1B] block mb-1">
              Catering Orders use our Custom Quote Flow
            </strong>
            You&apos;ll pick your event type, guest count, and menu dishes to receive an itemized estimate before paying a 30% advance.
          </div>
        ) : (
          <div className="bg-white rounded-[18px] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/5 space-y-3.5">
            <h2 className="text-[14px] font-semibold text-[#1B1B1B]">Delivery Date &amp; Time</h2>

            <div>
              <span className="text-[11.5px] text-[#6B6B6B] block mb-1.5">Select Date</span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {dateOptions.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onChangeDate(d)}
                    className={`h-9 px-3.5 rounded-full text-[12px] font-medium shrink-0 cursor-pointer border ${
                      selectedDate === d
                        ? 'bg-[#1F6B2B] text-white border-[#1F6B2B]'
                        : 'bg-[#FBF7EE] text-[#1B1B1B] border-black/10'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11.5px] text-[#6B6B6B] block mb-1.5">Select Time Slot</span>
              <div className="grid grid-cols-2 gap-2">
                {slotOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChangeSlot(s)}
                    className={`h-10 px-2.5 rounded-[12px] text-[11.5px] font-medium tabular-nums cursor-pointer border ${
                      selectedSlot === s
                        ? 'bg-[#E3F2DC] text-[#1F6B2B] border-[#1F6B2B] font-semibold'
                        : 'bg-[#FBF7EE] text-[#1B1B1B] border-black/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Continue */}
      <div className="shrink-0 bg-white border-t border-black/8 px-4 py-3 shadow-[0_-4px_14px_rgba(0,0,0,0.06)]">
        {deliveryType === 'catering' ? (
          <PrimaryButton onClick={onRedirectCatering}>
            <span>Go to Catering Quote</span>
            <ArrowRight size={17} />
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={onContinuePayment}>
            <span>Continue to Payment</span>
            <ArrowRight size={17} />
          </PrimaryButton>
        )}
      </div>

      <BottomSheet open={addrModal} onClose={() => setAddrModal(false)} title="Choose Address">
        <div className="space-y-2.5">
          {addresses.map((addr) => (
            <RadioCard
              key={addr.id}
              selected={addr.id === activeAddress.id}
              onSelect={() => {
                onSelectAddress(addr.id);
                setAddrModal(false);
              }}
              title={`${addr.tag} · ${addr.label}`}
              subtitle={addr.fullAddress}
            />
          ))}
          <div className="pt-2">
            <OutlineButton
              onClick={() => {
                setAddrModal(false);
                onManageAddresses();
              }}
            >
              Add / Edit Addresses
            </OutlineButton>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};

/* Screen 10 & #32 Payment Failed: Payment Screen */
export const PaymentScreen: React.FC<{
  amount: number;
  titleLabel?: string;
  walletBalance: number;
  allowCod?: boolean;
  simulatePayFail: boolean;
  onTogglePayFail: () => void;
  onPaymentSuccess: (method: string) => void;
  onBack: () => void;
}> = ({
  amount,
  titleLabel = 'Order Payment',
  walletBalance,
  allowCod = true,
  simulatePayFail,
  onTogglePayFail,
  onPaymentSuccess,
  onBack,
}) => {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cod' | null>(
    'upi'
  );
  const [upiApp, setUpiApp] = useState('GPay');
  const [processing, setProcessing] = useState(false);
  const [failed, setFailed] = useState(false);

  const methodDisplayLabel = () => {
    if (method === 'upi') return `UPI (${upiApp})`;
    if (method === 'card') return 'Credit / Debit Card';
    if (method === 'netbanking') return 'Net Banking';
    if (method === 'wallet') return 'Swastik Wallet';
    return 'Cash on Delivery';
  };

  const triggerPay = (overrideMethod?: typeof method) => {
    const activeMethod = overrideMethod || method;
    if (!activeMethod) return;

    setFailed(false);

    // COD skips 2-second processing state per Section 6
    if (activeMethod === 'cod') {
      onPaymentSuccess('Cash on Delivery');
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      if (simulatePayFail) {
        setFailed(true);
      } else {
        onPaymentSuccess(
          overrideMethod === 'cod' ? 'Cash on Delivery' : methodDisplayLabel()
        );
      }
    }, 2000);
  };

  if (failed) {
    return (
      <div className="flex-1 flex flex-col bg-[#FBF7EE]">
        <TopBar title="Payment Failed" onBack={() => setFailed(false)} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#D93B2B]/12 flex items-center justify-center mb-4">
            <AlertCircle size={42} className="text-[#D93B2B]" />
          </div>
          <h2 className="text-[19px] font-semibold text-[#1B1B1B]">Payment Could Not Be Completed</h2>
          <p className="text-[13px] text-[#6B6B6B] mt-1.5 max-w-[280px] leading-relaxed">
            Your bank declined the ₹{amount.toLocaleString('en-IN')} transaction via {methodDisplayLabel()}. No money was deducted.
          </p>
          <div className="w-full max-w-[280px] mt-6 space-y-3">
            <PrimaryButton
              onClick={() => {
                onTogglePayFail();
                triggerPay();
              }}
            >
              Retry Payment (₹{amount.toLocaleString('en-IN')})
            </PrimaryButton>
            {allowCod && (
              <OutlineButton onClick={() => triggerPay('cod')}>
                Switch to Cash on Delivery
              </OutlineButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title="Payment" onBack={onBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24">
        {/* Payable Banner */}
        <div className="bg-white rounded-[18px] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/5 flex items-center justify-between">
          <div>
            <div className="text-[12px] text-[#6B6B6B]">{titleLabel}</div>
            <div className="text-[13px] font-medium text-[#1B1B1B] mt-0.5">Payable Amount</div>
          </div>
          <div className="text-[22px] font-bold text-[#1F6B2B] tabular-nums">
            ₹{amount.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Radio Methods */}
        <div className="space-y-2.5">
          <RadioCard
            selected={method === 'upi'}
            onSelect={() => setMethod('upi')}
            title="UPI"
            subtitle="GPay, PhonePe, Paytm & BHIM"
            icon={<Smartphone size={20} className="text-[#1F6B2B]" />}
          />
          {method === 'upi' && (
            <div className="pl-4 flex gap-2">
              {['GPay', 'PhonePe', 'Paytm'].map((app) => (
                <button
                  key={app}
                  type="button"
                  onClick={() => setUpiApp(app)}
                  className={`h-8 px-3.5 rounded-full text-[12px] font-semibold cursor-pointer border ${
                    upiApp === app
                      ? 'bg-[#1F6B2B] text-white border-[#1F6B2B]'
                      : 'bg-white text-[#1B1B1B] border-black/12'
                  }`}
                >
                  {app}
                </button>
              ))}
            </div>
          )}

          <RadioCard
            selected={method === 'card'}
            onSelect={() => setMethod('card')}
            title="Credit / Debit Card"
            subtitle="Visa, Mastercard, RuPay"
            icon={<CreditCard size={20} className="text-[#1F6B2B]" />}
          />

          <RadioCard
            selected={method === 'netbanking'}
            onSelect={() => setMethod('netbanking')}
            title="Net Banking"
            subtitle="HDFC, ICICI, SBI, Axis & more"
            icon={<Building2 size={20} className="text-[#1F6B2B]" />}
          />

          <RadioCard
            selected={method === 'wallet'}
            onSelect={() => setMethod('wallet')}
            title="Wallets"
            subtitle={`Swastik Wallet Balance: ₹${walletBalance}`}
            icon={<Wallet size={20} className="text-[#1F6B2B]" />}
          />

          {allowCod && (
            <RadioCard
              selected={method === 'cod'}
              onSelect={() => setMethod('cod')}
              title="Cash on Delivery"
              subtitle="Pay via cash or UPI QR at doorstep"
              icon={<Banknote size={20} className="text-[#1F6B2B]" />}
            />
          )}
        </div>

        {/* Prototype Debug Toggle for Failure Simulation */}
        <div className="rounded-[14px] bg-white/70 border border-black/8 px-3.5 py-2.5 flex items-center justify-between">
          <span className="text-[12px] text-[#6B6B6B]">Simulate payment failure (test error UI)</span>
          <button
            type="button"
            onClick={onTogglePayFail}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              simulatePayFail ? 'bg-[#D93B2B]' : 'bg-black/20'
            }`}
            aria-label="Toggle simulate failure"
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                simulatePayFail ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11.5px] text-[#6B6B6B]">
          <ShieldCheck size={14} className="text-[#1F6B2B]" />
          <span>100% Secure Mock Checkout</span>
        </div>
      </div>

      {/* Sticky Pay Button */}
      <div className="shrink-0 bg-white border-t border-black/8 px-4 py-3 shadow-[0_-4px_14px_rgba(0,0,0,0.06)]">
        <PrimaryButton
          disabled={!method}
          loading={processing}
          onClick={() => triggerPay()}
        >
          {processing
            ? 'Processing Payment...'
            : `Pay ₹${amount.toLocaleString('en-IN')}`}
        </PrimaryButton>
      </div>
    </div>
  );
};

/* Screen 11: Order Placed */
const CONFETTI_PIECES = [
  { left: '12%', color: '#F5B52E', delay: '0s' },
  { left: '25%', color: '#3E9B3F', delay: '0.15s' },
  { left: '38%', color: '#D93B2B', delay: '0.05s' },
  { left: '52%', color: '#1F6B2B', delay: '0.25s' },
  { left: '66%', color: '#F5B52E', delay: '0.1s' },
  { left: '80%', color: '#3E9B3F', delay: '0.2s' },
  { left: '90%', color: '#D93B2B', delay: '0.08s' },
];

export const OrderPlacedScreen: React.FC<{
  orderId: string;
  onTrackOrder: () => void;
  onViewDetails: () => void;
  onGoHome: () => void;
}> = ({ orderId, onTrackOrder, onViewDetails, onGoHome }) => (
  <div className="relative flex-1 flex flex-col justify-between bg-[#FBF7EE] px-6 py-8 overflow-hidden text-center">
    {/* Confetti Animation */}
    <div className="absolute inset-x-0 top-0 h-60 pointer-events-none overflow-hidden" aria-hidden="true">
      {CONFETTI_PIECES.map((c, idx) => (
        <span
          key={idx}
          style={{
            left: c.left,
            backgroundColor: c.color,
            animation: `confettiFall 2.4s ease-out ${c.delay} infinite`,
          }}
          className="absolute top-0 w-2.5 h-4 rounded-xs"
        />
      ))}
    </div>

    <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-[#3E9B3F] text-white flex items-center justify-center shadow-[0_8px_22px_rgba(62,155,63,0.35)] mb-4">
        <Check size={34} strokeWidth={3} />
      </div>

      <h1 className="text-[22px] font-semibold text-[#1B1B1B]">Order Placed Successfully!</h1>
      <p className="text-[13px] text-[#6B6B6B] mt-1.5 max-w-[270px]">
        Thank you for ordering from Swastik. Our kitchen is preparing your food fresh.
      </p>

      <div className="mt-3 px-4 py-1.5 rounded-full bg-[#E3F2DC] text-[13px] font-semibold text-[#1F6B2B] tabular-nums">
        Order ID #{orderId}
      </div>

      <div className="my-6">
        <ShoppingBagIllustration />
      </div>
    </div>

    <div className="relative z-10 space-y-3">
      <PrimaryButton onClick={onTrackOrder}>
        <span>Track Order</span>
        <ArrowRight size={17} />
      </PrimaryButton>
      <OutlineButton onClick={onViewDetails}>View Order Details</OutlineButton>
      <button
        type="button"
        onClick={onGoHome}
        className="w-full py-2 text-[13px] font-medium text-[#6B6B6B] hover:text-[#1B1B1B] cursor-pointer"
      >
        Back to Home
      </button>
    </div>
  </div>
);
