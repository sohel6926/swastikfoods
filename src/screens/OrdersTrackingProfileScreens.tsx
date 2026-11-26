import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  MessageCircle,
  Navigation,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Send,
  Star,
  Tag,
  Trash2,
  Truck,
  User,
  Utensils,
  Wallet,
} from 'lucide-react';
import { COUPONS, SEED_STOREFRONT, SUPPORT_FAQS } from '../data/mockData';
import {
  Address,
  CateringQuote,
  Coupon,
  NotificationItem,
  StorefrontContent,
  OrderRecord,
  OrderStage,
  OrderTimelineStep,
  ScreenName,
  UserProfile,
  WalletTransaction,
} from '../types';
import { FoodArtwork } from '../components/BrandAssets';
import {
  BottomSheet,
  BottomTabBar,
  EmptyState,
  FilterChip,
  GoldButton,
  Modal,
  OutlineButton,
  PrimaryButton,
  StatusTimeline,
  TopBar,
} from '../components/UI';

const ORDER_STAGES: OrderStage[] = [
  'Placed',
  'Accepted',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

/* Screen 12 & 31: Track Order (Own-Vehicle Map vs Third-Party Rapido) */
export const TrackOrderScreen: React.FC<{
  order: OrderRecord;
  onBack: () => void;
  onAdvanceStage: (orderId: string) => void;
  onRateOrder: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({ order, onBack, onAdvanceStage, onRateOrder, onViewDetails, showToast }) => {
  const [autoSim, setAutoSim] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'rider', text: 'Namaste! I have picked up your Swastik order and am on the way.' },
  ]);
  const [thirdPartyModal, setThirdPartyModal] = useState(false);

  const stageIndex = ORDER_STAGES.indexOf(order.stage);
  const isDelivered = order.stage === 'Delivered';

  // Auto-advance simulation every 4.5 seconds while active
  useEffect(() => {
    if (!autoSim || isDelivered || order.stage === 'Cancelled') return;
    const id = setInterval(() => {
      onAdvanceStage(order.id);
    }, 4500);
    return () => clearInterval(id);
  }, [autoSim, isDelivered, order.stage, order.id, onAdvanceStage]);

  // Scooter position along SVG curve (0% -> 100%)
  const progressPct =
    order.stage === 'Placed'
      ? 12
      : order.stage === 'Accepted'
        ? 25
        : order.stage === 'Preparing'
          ? 42
          : order.stage === 'Out for Delivery'
            ? 74
            : 96;

  // Approximate point along cubic bezier from (45,115) -> (305,42)
  const t = progressPct / 100;
  const scooterX = 45 + (305 - 45) * t;
  const scooterY = 112 - 68 * Math.sin(t * Math.PI * 0.55);

  const timelineSteps: OrderTimelineStep[] = [
    {
      title: 'Order Confirmed',
      time: '12:10 PM',
      completed: stageIndex >= 1,
      active: stageIndex === 0,
      subtitle: 'Swastik Kitchen accepted your order',
    },
    {
      title: 'Preparing Your Order',
      time: stageIndex >= 2 ? '12:20 PM' : 'Est. 12:20 PM',
      completed: stageIndex >= 2,
      active: stageIndex === 1,
      subtitle: 'Freshly cooked and hygienically packed',
    },
    {
      title: 'Out for Delivery',
      time: stageIndex >= 3 ? '12:45 PM' : 'Est. 12:45 PM',
      completed: stageIndex >= 3,
      active: stageIndex === 2,
      subtitle:
        order.trackingType === 'own-vehicle'
          ? `${order.riderName || 'Ramesh'} (Swastik Fleet) is en route`
          : `Picked up by ${order.thirdPartyPartner || 'Rapido'} partner`,
    },
    {
      title: isDelivered ? 'Delivered' : 'Expected Delivery',
      time: order.eta,
      completed: isDelivered,
      active: stageIndex === 3,
      subtitle: order.address.label,
    },
  ];

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((m) => [
      ...m,
      { from: 'user', text: chatInput.trim() },
      { from: 'rider', text: 'Got it sir, reaching your gate in 5 mins!' },
    ]);
    setChatInput('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar
        title={`Track #${order.id}`}
        onBack={onBack}
        rightSlot={
          <button
            type="button"
            onClick={() => onViewDetails(order.id)}
            className="text-[12px] font-semibold text-[#1F6B2B] px-2 cursor-pointer"
          >
            Details
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-6">
        {/* Tracking Variant Header: Own-Vehicle Map vs Third-Party Rapido */}
        {order.trackingType === 'own-vehicle' ? (
          <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.08)] border border-black/5">
            <div className="px-4 py-2.5 bg-[#E3F2DC] flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[#0B3D1A] flex items-center gap-1.5">
                <Truck size={14} className="text-[#1F6B2B]" />
                Swastik Own-Fleet Live Map
              </span>
              <span className="font-semibold text-[#1F6B2B] tabular-nums">ETA {order.eta}</span>
            </div>

            {/* Stylized Vector Map */}
            <div className="relative h-[164px] bg-[#EFE9DA] overflow-hidden">
              <svg viewBox="0 0 350 155" className="w-full h-full" aria-label="Delivery route map">
                {/* City blocks */}
                <rect x="12" y="14" width="76" height="44" rx="8" fill="#E4DCC8" />
                <rect x="108" y="16" width="90" height="36" rx="8" fill="#E4DCC8" />
                <rect x="218" y="18" width="114" height="52" rx="8" fill="#E4DCC8" />
                <rect x="24" y="82" width="108" height="58" rx="8" fill="#E4DCC8" />
                <rect x="158" y="92" width="96" height="48" rx="8" fill="#E4DCC8" />
                {/* Roads */}
                <path d="M0 70 H350 M142 0 V155 M270 0 V155" stroke="#FFFFFF" strokeWidth="8" />
                {/* Green Delivery Route */}
                <path
                  d="M45 112 Q 160 105, 305 44"
                  fill="none"
                  stroke="#1F6B2B"
                  strokeWidth="4.5"
                  strokeDasharray="7 5"
                  strokeLinecap="round"
                />
                {/* Kitchen Pin */}
                <circle cx="45" cy="112" r="9" fill="#0B3D1A" />
                <text x="45" y="134" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#1B1B1B">
                  Kitchen
                </text>
                {/* Destination Red Pin */}
                <circle cx="305" cy="44" r="10" fill="#D93B2B" />
                <circle cx="305" cy="44" r="4" fill="#FFFFFF" />
                <text x="305" y="26" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#1B1B1B">
                  You
                </text>
              </svg>

              {/* Animated Scooter Marker */}
              <div
                style={{
                  left: `${(scooterX / 350) * 100}%`,
                  top: `${(scooterY / 155) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute transition-all duration-700 ease-out w-10 h-10 rounded-full bg-[#F5B52E] border-2 border-white shadow-lg flex items-center justify-center text-lg"
                title="Swastik Delivery Rider"
              >
                🛵
              </div>
            </div>

            {/* Rider Card (Ramesh, 4.8) */}
            <div className="p-3.5 flex items-center justify-between gap-3 border-t border-black/5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#1F6B2B] text-white font-semibold flex items-center justify-center text-[15px]">
                  {(order.riderName || 'R')[0]}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#1B1B1B]">
                    {order.riderName || 'Ramesh'}
                  </div>
                  <div className="text-[12px] text-[#6B6B6B] flex items-center gap-1 tabular-nums">
                    <Star size={12} className="fill-[#F5B52E] text-[#F5B52E]" />
                    <span>{order.riderRating || 4.8}</span>
                    <span>· Swastik Fleet</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    showToast(`Calling ${order.riderName || 'Ramesh'} (${order.riderPhone || '+91 98480 11223'})`, 'info')
                  }
                  aria-label="Call rider"
                  className="w-11 h-11 rounded-full bg-[#E3F2DC] text-[#1F6B2B] flex items-center justify-center tap-press cursor-pointer"
                >
                  <Phone size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  aria-label="Chat with rider"
                  className="w-11 h-11 rounded-full bg-[#1F6B2B] text-white flex items-center justify-center tap-press cursor-pointer"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Third-Party Tracking Variant (#31) */
          <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.08)] border border-black/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#7A3E12] uppercase tracking-wide">
                  Third-Party Delivery
                </span>
                <h2 className="text-[16px] font-semibold text-[#1B1B1B] mt-0.5">
                  Delivered via {order.thirdPartyPartner || 'Rapido'}
                </h2>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#FFF1D6] flex items-center justify-center text-2xl">
                🏍️
              </div>
            </div>

            <div className="rounded-[14px] bg-[#FBF7EE] px-3.5 py-2.5 flex items-center justify-between text-[12px]">
              <span className="text-[#6B6B6B]">Tracking Code</span>
              <span className="font-semibold text-[#1B1B1B] tabular-nums">
                {order.thirdPartyTrackingCode || `RPD-${order.id}`}
              </span>
            </div>

            <OutlineButton onClick={() => setThirdPartyModal(true)}>
              <ExternalLink size={16} />
              <span>Open Live Tracking Link</span>
            </OutlineButton>
          </div>
        )}

        {/* Simulation Controls */}
        {!isDelivered && (
          <div className="rounded-[16px] bg-white px-3.5 py-2.5 border border-black/6 flex items-center justify-between gap-2 text-[12px]">
            <label className="flex items-center gap-2 text-[#6B6B6B] cursor-pointer">
              <input
                type="checkbox"
                checked={autoSim}
                onChange={(e) => setAutoSim(e.target.checked)}
                className="accent-[#1F6B2B]"
              />
              <span>Auto-advance progress (4.5s)</span>
            </label>
            <button
              type="button"
              onClick={() => onAdvanceStage(order.id)}
              className="px-3 py-1 rounded-full bg-[#E3F2DC] text-[#1F6B2B] font-semibold cursor-pointer"
            >
              Next Step
            </button>
          </div>
        )}

        {/* Vertical Timeline */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/5">
          <h3 className="text-[15px] font-semibold text-[#1B1B1B] mb-3.5">Order Status</h3>
          <StatusTimeline steps={timelineSteps} />
        </div>

        {/* Prompt Rating when Delivered */}
        {isDelivered && !order.ratingSubmitted && (
          <div className="rounded-[20px] bg-[#E3F2DC] p-4 border border-[#1F6B2B]/20 text-center space-y-3">
            <div className="text-[15px] font-semibold text-[#0B3D1A]">
              Order Delivered! How was your meal?
            </div>
            <GoldButton onClick={() => onRateOrder(order.id)}>
              <Star size={17} />
              <span>Rate &amp; Review Order</span>
            </GoldButton>
          </div>
        )}
      </div>

      {/* Rider Chat Sheet */}
      <BottomSheet
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title={`Chat with ${order.riderName || 'Ramesh'}`}
      >
        <div className="space-y-3">
          <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-[12.5px] ${
                  m.from === 'user'
                    ? 'ml-auto bg-[#1F6B2B] text-white'
                    : 'bg-white border border-black/8 text-[#1B1B1B]'
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Message rider..."
              className="flex-1 h-11 rounded-full bg-white border border-black/15 px-4 text-[13px] outline-none"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="w-11 h-11 rounded-full bg-[#1F6B2B] text-white flex items-center justify-center cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </BottomSheet>

      {/* Third-Party Tracking Link Preview Modal */}
      <Modal
        open={thirdPartyModal}
        onClose={() => setThirdPartyModal(false)}
        title={`${order.thirdPartyPartner || 'Rapido'} Live Status`}
      >
        <div className="space-y-3 text-[13px] text-[#6B6B6B]">
          <p>
            External Partner Ref:{' '}
            <strong className="text-[#1B1B1B]">
              {order.thirdPartyTrackingCode || `RPD-${order.id}`}
            </strong>
          </p>
          <p>
            Current Status: <strong className="text-[#1F6B2B]">{order.stage}</strong>
          </p>
          <p>Drop Address: {order.address.fullAddress}</p>
          <PrimaryButton onClick={() => setThirdPartyModal(false)}>Done</PrimaryButton>
        </div>
      </Modal>
    </div>
  );
};

/* Screen 13 & 24: My Orders & Payment History Hub */
export const OrdersScreen: React.FC<{
  orders: OrderRecord[];
  cartCount: number;
  onTrackOrder: (orderId: string) => void;
  onViewOrderDetails: (orderId: string) => void;
  onReorder: (order: OrderRecord) => void;
  onRateOrder: (orderId: string) => void;
  onNavigate: (screen: ScreenName, params?: Record<string, any>) => void;
}> = ({
  orders,
  cartCount,
  onTrackOrder,
  onViewOrderDetails,
  onReorder,
  onRateOrder,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'ongoing' | 'completed' | 'cancelled' | 'payments'>('ongoing');

  const ongoing = orders.filter((o) => o.stage !== 'Delivered' && o.stage !== 'Cancelled');
  const completed = orders.filter((o) => o.stage === 'Delivered');
  const cancelled = orders.filter((o) => o.stage === 'Cancelled');

  const activeList = tab === 'ongoing' ? ongoing : tab === 'completed' ? completed : cancelled;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title="My Orders" />

      {/* Sub Tabs */}
      <div className="px-4 pt-2.5 pb-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        <FilterChip active={tab === 'ongoing'} onClick={() => setTab('ongoing')}>
          Ongoing ({ongoing.length})
        </FilterChip>
        <FilterChip active={tab === 'completed'} onClick={() => setTab('completed')}>
          Completed ({completed.length})
        </FilterChip>
        <FilterChip active={tab === 'cancelled'} onClick={() => setTab('cancelled')}>
          Cancelled ({cancelled.length})
        </FilterChip>
        <FilterChip active={tab === 'payments'} onClick={() => setTab('payments')}>
          Payment History
        </FilterChip>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-4">
        {tab === 'payments' ? (
          <div className="space-y-2.5 pt-1">
            {orders.map((o) => (
              <div
                key={o.id}
                onClick={() => onViewOrderDetails(o.id)}
                className="bg-white rounded-[16px] p-3.5 shadow-xs border border-black/5 flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E3F2DC] flex items-center justify-center text-[#1F6B2B]">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold text-[#1B1B1B] tabular-nums">
                      Order #{o.id}
                    </div>
                    <div className="text-[11.5px] text-[#6B6B6B]">
                      {o.dateLabel} · {o.paymentMethod}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-semibold text-[#1F6B2B] tabular-nums">
                    ₹{o.totalAmount}
                  </div>
                  <div className="text-[10.5px] text-[#6B6B6B]">
                    {o.stage === 'Cancelled' ? 'Refunded' : 'Paid'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeList.length === 0 ? (
          <EmptyState
            emoji="📦"
            title={`No ${tab} orders`}
            description="Your orders in this category will appear here."
            ctaLabel="Order Fresh Food"
            onCta={() => onNavigate('curries')}
          />
        ) : (
          <div className="space-y-3 pt-1">
            {activeList.map((order) => {
              const leadItem = order.items[0]?.item;
              const stageStep =
                order.stage === 'Placed'
                  ? 1
                  : order.stage === 'Accepted'
                    ? 2
                    : order.stage === 'Preparing'
                      ? 2
                      : order.stage === 'Out for Delivery'
                        ? 3
                        : 4;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-[18px] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/5 space-y-3"
                >
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-[#7A3E12] tabular-nums">
                      #{order.id} · {order.dateLabel}
                    </span>
                    <span
                      className={`font-semibold ${
                        order.stage === 'Cancelled' ? 'text-[#D93B2B]' : 'text-[#1F6B2B]'
                      }`}
                    >
                      {order.stage}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {leadItem && (
                      <FoodArtwork
                        imageKey={leadItem.image}
                        emoji={leadItem.emoji}
                        label={leadItem.name}
                        tint={leadItem.tint}
                        size="sm"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold text-[#1B1B1B] truncate">
                        {order.itemsSummary}
                      </h3>
                      <p className="text-[12px] text-[#6B6B6B] mt-0.5">
                        {order.trackingType === 'own-vehicle'
                          ? 'Swastik Own Fleet'
                          : `Via ${order.thirdPartyPartner || 'Rapido'}`}{' '}
                        · ETA {order.eta}
                      </p>
                    </div>
                  </div>

                  {tab === 'ongoing' && (
                    <div className="space-y-1">
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 rounded-full ${
                              step <= stageStep ? 'bg-[#1F6B2B]' : 'bg-black/10'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-[#6B6B6B]">
                        <span>Confirmed</span>
                        <span>Preparing</span>
                        <span>On the Way</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-black/6 gap-2">
                    <span className="text-[15px] font-semibold text-[#1F6B2B] tabular-nums">
                      ₹{order.totalAmount}
                    </span>

                    <div className="flex items-center gap-2">
                      {tab === 'ongoing' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onViewOrderDetails(order.id)}
                            className="h-9 px-3.5 rounded-full border border-black/15 text-[12px] font-semibold text-[#1B1B1B] cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => onTrackOrder(order.id)}
                            className="h-9 px-4 rounded-full bg-[#1F6B2B] text-white text-[12px] font-semibold cursor-pointer"
                          >
                            Track Order
                          </button>
                        </>
                      ) : (
                        <>
                          {order.stage === 'Delivered' && !order.ratingSubmitted && (
                            <button
                              type="button"
                              onClick={() => onRateOrder(order.id)}
                              className="h-9 px-3.5 rounded-full bg-[#FFF1D6] text-[#7A3E12] text-[12px] font-semibold cursor-pointer"
                            >
                              Rate
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onReorder(order)}
                            className="h-9 px-4 rounded-full bg-[#1F6B2B] text-white text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw size={13} /> Reorder
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomTabBar
        activeTab="orders"
        cartCount={cartCount}
        onSelectTab={(t) => onNavigate(t)}
      />
    </div>
  );
};

/* Screen 23: Order Details & Invoice */
export const OrderDetailsScreen: React.FC<{
  order: OrderRecord;
  onBack: () => void;
  onTrack: () => void;
  onReorder: () => void;
  onRate: () => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({ order, onBack, onTrack, onReorder, onRate, showToast }) => {
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title={`Order #${order.id}`} onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24">
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 flex items-center justify-between">
          <div>
            <div className="text-[12px] text-[#6B6B6B]">{order.createdAt}</div>
            <div className="text-[15px] font-semibold text-[#1B1B1B] mt-0.5">{order.stage}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setInvoiceOpen(true);
              showToast('Invoice ready to download', 'success');
            }}
            className="h-9 px-3.5 rounded-full bg-[#E3F2DC] text-[#1F6B2B] text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} /> Invoice
          </button>
        </div>

        {/* Items */}
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 space-y-2.5">
          <h3 className="text-[14px] font-semibold text-[#1B1B1B]">Ordered Items</h3>
          {order.items.map((line) => (
            <div key={line.cartKey} className="flex items-center justify-between text-[13px]">
              <div>
                <span className="font-medium text-[#1B1B1B]">
                  {line.quantity} × {line.item.name}
                </span>
                <span className="block text-[11.5px] text-[#6B6B6B]">{line.sizeLabel}</span>
              </div>
              <span className="font-semibold text-[#1B1B1B] tabular-nums">
                ₹{line.unitPrice * line.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Address & Payment */}
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 space-y-2 text-[12.5px]">
          <h3 className="text-[14px] font-semibold text-[#1B1B1B]">Delivery &amp; Payment</h3>
          <p className="text-[#6B6B6B]">
            <strong className="text-[#1B1B1B]">{order.address.tag}:</strong>{' '}
            {order.address.fullAddress}
          </p>
          <p className="text-[#6B6B6B]">
            <strong className="text-[#1B1B1B]">Slot:</strong> {order.deliverySlot}
          </p>
          <p className="text-[#6B6B6B]">
            <strong className="text-[#1B1B1B]">Payment:</strong> {order.paymentMethod}
          </p>
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 space-y-2 text-[13px]">
          <div className="flex justify-between text-[#6B6B6B]">
            <span>Item Total</span>
            <span className="tabular-nums">₹{order.itemTotal}</span>
          </div>
          <div className="flex justify-between text-[#6B6B6B]">
            <span>Delivery Fee</span>
            <span className="tabular-nums">₹{order.deliveryFee}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-[#1F6B2B]">
              <span>Coupon Discount</span>
              <span className="tabular-nums">-₹{order.discount}</span>
            </div>
          )}
          <div className="h-px bg-black/8" />
          <div className="flex justify-between text-[15px] font-semibold text-[#1B1B1B]">
            <span>Total Paid</span>
            <span className="text-[#1F6B2B] tabular-nums">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-white border-t border-black/8 px-4 py-3 grid grid-cols-2 gap-3">
        {order.stage !== 'Delivered' && order.stage !== 'Cancelled' ? (
          <>
            <OutlineButton onClick={onReorder}>Reorder</OutlineButton>
            <PrimaryButton onClick={onTrack}>Track Order</PrimaryButton>
          </>
        ) : (
          <>
            {order.stage === 'Delivered' && !order.ratingSubmitted ? (
              <OutlineButton onClick={onRate}>Rate Order</OutlineButton>
            ) : (
              <OutlineButton onClick={() => setInvoiceOpen(true)}>View Receipt</OutlineButton>
            )}
            <PrimaryButton onClick={onReorder}>Reorder</PrimaryButton>
          </>
        )}
      </div>

      {/* Mock Invoice Receipt Modal */}
      <Modal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} title="Tax Invoice">
        <div className="space-y-3 text-[12px]">
          <div className="text-center border-b border-dashed border-black/15 pb-2.5">
            <div className="font-bold text-[14px] text-[#1F6B2B]">
              SWASTIK HOME FOODS &amp; CATERERS
            </div>
            <div className="text-[#6B6B6B]">Miyapur, Hyderabad · GSTIN 36AABCS1429B1Z</div>
            <div className="mt-1 font-semibold tabular-nums">
              Invoice #{order.id} · {order.createdAt}
            </div>
          </div>
          <div className="space-y-1.5">
            {order.items.map((l) => (
              <div key={l.cartKey} className="flex justify-between">
                <span>
                  {l.quantity}× {l.item.name} ({l.sizeLabel})
                </span>
                <span className="tabular-nums">₹{l.unitPrice * l.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dashed border-black/15 pt-2 flex justify-between font-bold text-[14px]">
            <span>Grand Total</span>
            <span className="text-[#1F6B2B] tabular-nums">₹{order.totalAmount}</span>
          </div>
          <PrimaryButton
            onClick={() => {
              setInvoiceOpen(false);
              showToast(`Invoice #${order.id}.pdf saved`, 'success');
            }}
          >
            Save PDF Receipt
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
};

/* Screen 25: Rating & Feedback */
export const RatingScreen: React.FC<{
  order: OrderRecord;
  onBack: () => void;
  onSubmitRating: (orderId: string, stars: number, tags: string[], comment: string) => void;
}> = ({ order, onBack, onSubmitRating }) => {
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>(['Taste', 'Packaging']);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const tagOptions = ['Taste', 'Packaging', 'Delivery', 'Value', 'Hot & Fresh'];

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col bg-[#FBF7EE]">
        <TopBar title="Thank You" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-[#E3F2DC] flex items-center justify-center text-[#1F6B2B] mb-4">
            <CheckCircle2 size={44} />
          </div>
          <h2 className="text-[20px] font-semibold text-[#1B1B1B]">Thanks for Your Feedback!</h2>
          <p className="text-[13px] text-[#6B6B6B] mt-1.5 max-w-[260px]">
            Your {stars}-star rating helps our Miyapur kitchen maintain authentic home taste.
          </p>
          <div className="w-full max-w-[240px] mt-6">
            <PrimaryButton onClick={onBack}>Back to Orders</PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title="Rate Your Order" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
        <div className="bg-white rounded-[20px] p-5 shadow-xs border border-black/5 text-center">
          <div className="text-[12px] text-[#7A3E12] font-semibold">Order #{order.id}</div>
          <h2 className="text-[16px] font-semibold text-[#1B1B1B] mt-1">{order.itemsSummary}</h2>

          <div className="flex items-center justify-center gap-2.5 mt-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                aria-label={`Rate ${n} stars`}
                className="p-1 cursor-pointer tap-press"
              >
                <Star
                  size={34}
                  className={n <= stars ? 'fill-[#F5B52E] text-[#F5B52E]' : 'text-black/15'}
                />
              </button>
            ))}
          </div>
          <div className="text-[12.5px] font-medium text-[#1F6B2B] mt-2">
            {stars === 5 ? 'Loved it!' : stars >= 4 ? 'Very Good' : stars === 3 ? 'Okay' : 'Needs Improvement'}
          </div>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold text-[#1B1B1B] mb-2">What stood out?</h3>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((t) => (
              <FilterChip key={t} active={tags.includes(t)} onClick={() => toggleTag(t)}>
                {t}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[18px] p-4 border border-black/5">
          <label className="text-[13px] font-semibold text-[#1B1B1B] block mb-1.5">
            Comments (Optional)
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about spice level, portion size, or delivery..."
            className="w-full rounded-[12px] border border-black/12 p-3 text-[13px] bg-[#FBF7EE]/60 outline-none"
          />
        </div>

        <PrimaryButton
          onClick={() => {
            onSubmitRating(order.id, stars, tags, comment);
            setSubmitted(true);
          }}
        >
          Submit Feedback
        </PrimaryButton>
      </div>
    </div>
  );
};

/* Screen 22: My Profile */
export const ProfileScreen: React.FC<{
  user: UserProfile;
  cartCount: number;
  onUpdateUser: (u: UserProfile) => void;
  onLogout: () => void;
  onNavigate: (screen: ScreenName) => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({ user, cartCount, onUpdateUser, onLogout, onNavigate, showToast }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const menuRows: { label: string; sub: string; icon: React.FC<any>; screen: ScreenName }[] = [
    { label: 'Saved Addresses', sub: 'Miyapur, HITEC City & more', icon: MapPin, screen: 'addresses' },
    { label: 'Catering Bookings', sub: 'Quotes, advance & balance', icon: Utensils, screen: 'catering-bookings' },
    { label: 'Saved Favorites', sub: 'Your hearted dishes', icon: Heart, screen: 'favorites' },
    { label: 'Wallet & Offers', sub: 'Balance & coupon codes', icon: Wallet, screen: 'wallet' },
    { label: 'Notifications', sub: 'Order & event updates', icon: Bell, screen: 'notifications' },
    { label: 'Help & Support', sub: 'FAQs, Call & WhatsApp', icon: HelpCircle, screen: 'support' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title="My Profile" />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-full bg-[#1F6B2B] text-white font-semibold text-[18px] flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold text-[#1B1B1B] truncate">{user.name}</h2>
              <div className="text-[12.5px] text-[#6B6B6B] tabular-nums">+91 {user.phone}</div>
              <div className="text-[11.5px] text-[#6B6B6B] truncate">{user.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            aria-label="Edit profile"
            className="w-10 h-10 rounded-full bg-[#E3F2DC] text-[#1F6B2B] flex items-center justify-center cursor-pointer shrink-0"
          >
            <Pencil size={16} />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/5 divide-y divide-black/6">
          {menuRows.map((row) => {
            const Icon = row.icon;
            return (
              <button
                key={row.label}
                type="button"
                onClick={() => onNavigate(row.screen)}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-black/2 cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E3F2DC] flex items-center justify-center text-[#1F6B2B]">
                    <Icon size={17} />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold text-[#1B1B1B]">{row.label}</div>
                    <div className="text-[11.5px] text-[#6B6B6B]">{row.sub}</div>
                  </div>
                </div>
                <ChevronRight size={17} className="text-[#6B6B6B]" />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full h-[48px] rounded-full border border-[#D93B2B]/30 bg-white text-[#D93B2B] font-semibold text-[13.5px] flex items-center justify-center gap-2 tap-press cursor-pointer"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>

      <BottomTabBar activeTab="profile" cartCount={cartCount} onSelectTab={onNavigate} />

      <BottomSheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="space-y-3.5">
          <div>
            <label className="text-[12px] font-medium text-[#1B1B1B] block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 rounded-[12px] bg-white border border-black/15 px-3 text-[13.5px]"
            />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#1B1B1B] block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-[12px] bg-white border border-black/15 px-3 text-[13.5px]"
            />
          </div>
          <PrimaryButton
            onClick={() => {
              onUpdateUser({ ...user, name: name.trim() || user.name, email: email.trim() });
              setEditOpen(false);
              showToast('Profile updated', 'success');
            }}
          >
            Save Changes
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
};

/* Screen 21: Saved Addresses */
export const AddressesScreen: React.FC<{
  addresses: Address[];
  onBack: () => void;
  onSetDefault: (id: string) => void;
  onAddAddress: (addr: Omit<Address, 'id'>) => void;
  onDeleteAddress: (id: string) => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({ addresses, onBack, onSetDefault, onAddAddress, onDeleteAddress, showToast }) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tag, setTag] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [label, setLabel] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');

  const fillLocation = () => {
    setLabel('Miyapur X Roads, Hyderabad');
    setFullAddress('Plot 45, Deepthi Sree Nagar, Miyapur, Hyderabad - 500049');
    setLandmark('Near Miyapur Metro Station');
    showToast('Current GPS location detected (Miyapur)', 'info');
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !fullAddress.trim()) {
      showToast('Enter area label and full address', 'error');
      return;
    }
    onAddAddress({
      tag,
      label: label.trim(),
      fullAddress: fullAddress.trim(),
      landmark: landmark.trim(),
      distanceKm: 3.8,
      isDefault: false,
    });
    setSheetOpen(false);
    setLabel('');
    setFullAddress('');
    setLandmark('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title="Saved Addresses" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 pb-24">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-white rounded-[18px] p-4 shadow-xs border ${
              addr.isDefault ? 'border-[#1F6B2B]' : 'border-black/6'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-[#1B1B1B]">
                  {addr.tag} · {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="text-[11px] font-semibold text-[#1F6B2B]">· Default</span>
                )}
              </div>
              <span className="text-[11.5px] text-[#6B6B6B] tabular-nums">{addr.distanceKm} km</span>
            </div>

            <p className="text-[12.5px] text-[#6B6B6B] mt-1 leading-relaxed">{addr.fullAddress}</p>
            {addr.landmark && (
              <p className="text-[11.5px] text-[#7A3E12] mt-0.5">Landmark: {addr.landmark}</p>
            )}

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black/6">
              {!addr.isDefault ? (
                <button
                  type="button"
                  onClick={() => onSetDefault(addr.id)}
                  className="text-[12px] font-semibold text-[#1F6B2B] cursor-pointer"
                >
                  Set as Default
                </button>
              ) : (
                <span className="text-[11.5px] text-[#1F6B2B] font-medium">Active Delivery Address</span>
              )}

              {addresses.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteAddress(addr.id)}
                  aria-label="Delete address"
                  className="text-[#D93B2B] p-1 cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 bg-white border-t border-black/8 px-4 py-3">
        <PrimaryButton onClick={() => setSheetOpen(true)}>
          <Plus size={17} /> Add New Address
        </PrimaryButton>
      </div>

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add New Address">
        <form onSubmit={handleAdd} className="space-y-3">
          <button
            type="button"
            onClick={fillLocation}
            className="w-full h-11 rounded-full bg-[#E3F2DC] text-[#1F6B2B] text-[13px] font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Navigation size={15} /> Use Current Location
          </button>

          <div className="flex gap-2">
            {(['Home', 'Work', 'Other'] as const).map((t) => (
              <FilterChip key={t} active={tag === t} onClick={() => setTag(t)}>
                {t}
              </FilterChip>
            ))}
          </div>

          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Area / Locality (e.g. Miyapur, Hyderabad)"
            className="w-full h-11 rounded-[12px] bg-white border border-black/15 px-3 text-[13px]"
          />
          <textarea
            rows={2}
            value={fullAddress}
            onChange={(e) => setFullAddress(e.target.value)}
            placeholder="Flat / House No., Building, Street"
            className="w-full rounded-[12px] bg-white border border-black/15 p-3 text-[13px]"
          />
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="Landmark (Optional)"
            className="w-full h-11 rounded-[12px] bg-white border border-black/15 px-3 text-[13px]"
          />

          <PrimaryButton type="submit">Save Address</PrimaryButton>
        </form>
      </BottomSheet>
    </div>
  );
};

/* Screen 26: Wallet & Offers */
export const WalletOffersScreen: React.FC<{
  balance: number;
  transactions: WalletTransaction[];
  coupons?: Coupon[];
  onBack: () => void;
  onApplyCouponFromOffers: (code: string) => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({ balance, transactions, coupons, onBack, onApplyCouponFromOffers, showToast }) => (
  <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
    <TopBar title="Wallet & Offers" onBack={onBack} />
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
      {/* Wallet Balance */}
      <div className="rounded-[22px] p-5 bg-gradient-to-br from-[#0B3D1A] to-[#1F6B2B] text-white shadow-[0_6px_18px_rgba(11,61,26,0.22)]">
        <span className="text-[12px] text-white/80">Swastik Wallet Balance</span>
        <div className="text-[28px] font-bold mt-1 tabular-nums">₹{balance.toFixed(2)}</div>
        <p className="text-[11.5px] text-[#F5B52E] mt-1">
          Usable on Curries, Daily Meals &amp; Catering Advance
        </p>
      </div>

      {/* Coupons */}
      <section className="space-y-2.5">
        <h2 className="text-[15px] font-semibold text-[#1B1B1B]">Available Offers</h2>
        {(coupons && coupons.length > 0 ? coupons : COUPONS)
          .filter((c) => c.active !== false)
          .map((c) => (
          <div
            key={c.code}
            className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 flex items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-[#1F6B2B]" />
                <span className="text-[13.5px] font-bold text-[#1F6B2B]">{c.code}</span>
                <span className="text-[12px] font-medium text-[#7A3E12]">· {c.title}</span>
              </div>
              <p className="text-[11.5px] text-[#6B6B6B] mt-1">{c.description}</p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onApplyCouponFromOffers(c.code)}
                className="h-8 px-3.5 rounded-full bg-[#1F6B2B] text-white text-[11.5px] font-semibold cursor-pointer"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => showToast(`Copied ${c.code}`, 'info')}
                className="text-[11px] text-[#6B6B6B] inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <Copy size={11} /> Copy
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Transactions */}
      <section className="space-y-2.5">
        <h2 className="text-[15px] font-semibold text-[#1B1B1B]">Recent Wallet Activity</h2>
        <div className="bg-white rounded-[18px] divide-y divide-black/6 border border-black/5">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-medium text-[#1B1B1B]">{tx.title}</div>
                <div className="text-[11px] text-[#6B6B6B]">{tx.date}</div>
              </div>
              <span
                className={`text-[14px] font-semibold tabular-nums ${
                  tx.type === 'credit' ? 'text-[#1F6B2B]' : 'text-[#D93B2B]'
                }`}
              >
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

/* Screen 27: Help, Contact Us & Policies */
export const SupportScreen: React.FC<{
  user: UserProfile;
  storefront?: StorefrontContent;
  onBack: () => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({ user, storefront = SEED_STOREFRONT, onBack, showToast }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [name, setName] = useState(user.name);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [legalDoc, setLegalDoc] = useState<'terms' | 'privacy' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast('Please enter a subject and message', 'error');
      return;
    }
    showToast('Enquiry sent! Our team will call you shortly.', 'success');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title="Contact & Support" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5 pb-12">
        {/* Call / WhatsApp Quick Support */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => showToast(`Calling Swastik Kitchen: ${storefront.contactUs.phone}`, 'info')}
            className="h-12 rounded-[16px] bg-white border border-black/8 shadow-xs flex items-center justify-center gap-2 text-[13px] font-semibold text-[#1F6B2B] tap-press cursor-pointer"
          >
            <Phone size={17} /> Call Support
          </button>
          <button
            type="button"
            onClick={() => showToast(`Opening WhatsApp: ${storefront.contactUs.whatsapp}`, 'info')}
            className="h-12 rounded-[16px] bg-[#E3F2DC] border border-[#1F6B2B]/15 shadow-xs flex items-center justify-center gap-2 text-[13px] font-semibold text-[#1F6B2B] tap-press cursor-pointer"
          >
            <MessageCircle size={17} /> WhatsApp Us
          </button>
        </div>

        {/* Live Contact Us Card (Managed from Admin) */}
        <div className="bg-white rounded-[18px] p-4 border border-black/6 shadow-xs space-y-2 text-[12.5px]">
          <h2 className="text-[14.5px] font-bold text-[#1B1B1B]">Contact Us</h2>
          <div className="text-[#444] space-y-1">
            <div><span className="font-semibold text-[#1B1B1B]">Phone:</span> {storefront.contactUs.phone}</div>
            <div><span className="font-semibold text-[#1B1B1B]">Email:</span> {storefront.contactUs.email}</div>
            <div><span className="font-semibold text-[#1B1B1B]">Hours:</span> {storefront.contactUs.hours}</div>
            <div><span className="font-semibold text-[#1B1B1B]">Kitchen:</span> {storefront.contactUs.address}</div>
          </div>
          {storefront.contactUs.supportNote && (
            <div className="text-[11.5px] text-[#1F6B2B] bg-[#E3F2DC]/60 px-3 py-2 rounded-xl">
              {storefront.contactUs.supportNote}
            </div>
          )}
        </div>

        {/* Legal Pages Links */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setLegalDoc('terms')}
            className="h-11 rounded-[14px] bg-white border border-black/8 text-[12.5px] font-semibold text-[#1B1B1B] cursor-pointer hover:bg-[#FAF5E8]"
          >
            Terms &amp; Conditions
          </button>
          <button
            type="button"
            onClick={() => setLegalDoc('privacy')}
            className="h-11 rounded-[14px] bg-white border border-black/8 text-[12.5px] font-semibold text-[#1B1B1B] cursor-pointer hover:bg-[#FAF5E8]"
          >
            Privacy Policy
          </button>
        </div>

        {legalDoc && (
          <BottomSheet
            open={Boolean(legalDoc)}
            onClose={() => setLegalDoc(null)}
            title={legalDoc === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
          >
            <div className="text-[12.5px] text-[#333] whitespace-pre-line leading-relaxed pb-4">
              {legalDoc === 'terms' ? storefront.termsAndConditions : storefront.privacyPolicy}
            </div>
          </BottomSheet>
        )}

        {/* FAQ Accordion */}
        <section className="space-y-2">
          <h2 className="text-[15px] font-semibold text-[#1B1B1B]">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {SUPPORT_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-[16px] border border-black/6 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-3.5 flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <span className="text-[13px] font-semibold text-[#1B1B1B]">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={17} className="text-[#1F6B2B] shrink-0" />
                    ) : (
                      <ChevronDown size={17} className="text-[#6B6B6B] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 text-[12.5px] text-[#6B6B6B] leading-relaxed border-t border-black/5 pt-2.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 space-y-3"
        >
          <h2 className="text-[15px] font-semibold text-[#1B1B1B]">Send an Enquiry</h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full h-11 rounded-[12px] border border-black/12 px-3 text-[13px] bg-[#FBF7EE]/50"
          />
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. Bulk lunch enquiry)"
            className="w-full h-11 rounded-[12px] border border-black/12 px-3 text-[13px] bg-[#FBF7EE]/50"
          />
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            className="w-full rounded-[12px] border border-black/12 p-3 text-[13px] bg-[#FBF7EE]/50"
          />
          <PrimaryButton type="submit">Submit Enquiry</PrimaryButton>
        </form>
      </div>
    </div>
  );
};

/* Screen 28: Notifications */
export const NotificationsScreen: React.FC<{
  notifications: NotificationItem[];
  onBack: () => void;
  onMarkAllRead: () => void;
  onSelectNotification: (n: NotificationItem) => void;
}> = ({ notifications, onBack, onMarkAllRead, onSelectNotification }) => {
  const todayList = notifications.filter((n) => n.group === 'Today');
  const earlierList = notifications.filter((n) => n.group === 'Earlier');

  const renderItem = (n: NotificationItem) => (
    <button
      key={n.id}
      type="button"
      onClick={() => onSelectNotification(n)}
      className={`w-full text-left rounded-[16px] p-3.5 border flex items-start gap-3 tap-press cursor-pointer ${
        n.read ? 'bg-white border-black/5' : 'bg-[#E3F2DC]/45 border-[#1F6B2B]/20'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          n.type === 'order'
            ? 'bg-[#E3F2DC] text-[#1F6B2B]'
            : n.type === 'catering'
              ? 'bg-[#FCE3D4] text-[#7A3E12]'
              : 'bg-[#FFF1D6] text-[#7A3E12]'
        }`}
      >
        {n.type === 'order' ? (
          <Truck size={17} />
        ) : n.type === 'catering' ? (
          <Utensils size={17} />
        ) : (
          <Tag size={17} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[13px] font-semibold text-[#1B1B1B] truncate">{n.title}</h3>
          <span className="text-[10.5px] text-[#6B6B6B] shrink-0">{n.time}</span>
        </div>
        <p className="text-[12px] text-[#6B6B6B] mt-0.5 leading-relaxed">{n.message}</p>
      </div>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar
        title="Notifications"
        onBack={onBack}
        rightSlot={
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-[11.5px] font-semibold text-[#1F6B2B] px-2 cursor-pointer whitespace-nowrap"
          >
            Mark read
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5">
        {notifications.length === 0 ? (
          <EmptyState
            emoji="🔔"
            title="All Caught Up"
            description="Order status updates and catering alerts will appear here."
          />
        ) : (
          <>
            {todayList.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-[13px] font-semibold text-[#6B6B6B]">Today</h2>
                <div className="space-y-2">{todayList.map(renderItem)}</div>
              </section>
            )}
            {earlierList.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-[13px] font-semibold text-[#6B6B6B]">Earlier</h2>
                <div className="space-y-2">{earlierList.map(renderItem)}</div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};
