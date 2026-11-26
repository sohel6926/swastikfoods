import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Menu,
  Mic,
  Package,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  UtensilsCrossed,
} from 'lucide-react';
import { CATEGORIES, MENU_ITEMS, UPCOMING_EVENTS } from '../data/mockData';
import {
  AddonOption,
  Address,
  CartItem,
  CategoryId,
  CategoryInfo,
  HeroBanner,
  MenuItem,
  OrderRecord,
  ScreenName,
  UpcomingEvent,
} from '../types';
import {
  BANNER_BIRYANI_OFFER,
  BANNER_CATERING_EVENTS,
  CATERING_BANNER_PHOTO,
  DISH_BIRYANI,
  DISH_CATERING,
  DISH_CURRIES,
  DISH_HOME_FOODS,
  FOOD_IMAGE_MAP,
  FoodArtwork,
  HEADER_BG_MASTER,
  HERO_HOMESTYLE_BANNER,
  SWASTIK_HEADER_LOGO,
} from '../components/BrandAssets';
import {
  BottomSheet,
  BottomTabBar,
  CategoryCard,
  CheckboxRow,
  EmptyState,
  FilterChip,
  FloatingCartBar,
  GoldButton,
  PrimaryButton,
  ProductRow,
  QuantityStepper,
  RadioCard,
  TopBar,
  VegIndicator,
} from '../components/UI';

const PROMO_BANNERS = [
  {
    id: 'homestyle',
    isHeroImage: true,
    bannerImage: HERO_HOMESTYLE_BANNER,
    title: 'Homestyle Food, Fresh & Hygienic!',
    target: 'home-foods' as ScreenName,
  },
  {
    id: 'biryani-offer',
    isHeroImage: true,
    bannerImage: BANNER_BIRYANI_OFFER,
    title: 'Hyderabadi Dum Biryani, Flat ₹100 Off!',
    target: 'categories' as ScreenName,
  },
  {
    id: 'catering',
    isHeroImage: true,
    bannerImage: BANNER_CATERING_EVENTS,
    title: 'Weddings & Grand Events, Royal Catering!',
    target: 'catering' as ScreenName,
  },
];

/* Screen 3: Home */
export const HomeScreen: React.FC<{
  userName: string;
  ongoingOrder?: OrderRecord;
  activeAddress: Address;
  addresses: Address[];
  onSelectAddress: (id: string) => void;
  unreadNotifications: number;
  cart: CartItem[];
  favorites: string[];
  menuItems?: MenuItem[];
  heroBanners?: HeroBanner[];
  categories?: CategoryInfo[];
  upcomingEvents?: UpcomingEvent[];
  onToggleFavorite: (id: string) => void;
  onQuickAdd: (item: MenuItem) => void;
  onDecreaseItem: (item: MenuItem) => void;
  onNavigate: (screen: ScreenName, params?: Record<string, any>) => void;
  onPrebookEvent: (evt: UpcomingEvent) => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({
  userName,
  ongoingOrder,
  activeAddress,
  addresses,
  onSelectAddress,
  unreadNotifications,
  cart,
  favorites,
  menuItems,
  heroBanners,
  categories,
  upcomingEvents,
  onToggleFavorite,
  onQuickAdd,
  onDecreaseItem,
  onNavigate,
  onPrebookEvent,
  showToast,
}) => {
    const [bannerIdx, setBannerIdx] = useState(0);
    const [isBannerPaused, setIsBannerPaused] = useState(false);
    const [addrSheetOpen, setAddrSheetOpen] = useState(false);

    const activeBanners = useMemo(() => {
      const live = (heroBanners || []).filter((b) => b.active);
      return live.length > 0 ? live : PROMO_BANNERS;
    }, [heroBanners]);

    const safeBannerIdx = bannerIdx % activeBanners.length;

    // Auto-slide promotional banners every 3.5 seconds (pauses on user hover/touch)
    useEffect(() => {
      if (isBannerPaused || activeBanners.length <= 1) return;
      const timer = setInterval(() => {
        setBannerIdx((prev) => (prev + 1) % activeBanners.length);
      }, 3500);
      return () => clearInterval(timer);
    }, [isBannerPaused, activeBanners.length]);
    const [homeDiet, setHomeDiet] = useState<'all' | 'veg' | 'nonveg'>('all');

    const sourceItems = menuItems && menuItems.length > 0 ? menuItems : MENU_ITEMS;
    const activeCategories = categories && categories.length > 0 ? categories : CATEGORIES;

    const totalCartItems = cart.reduce((sum, c) => sum + c.quantity, 0);
    const cartSubtotal = cart.reduce(
      (sum, c) => sum + (c.unitPrice + c.addons.reduce((a, x) => a + x.price, 0)) * c.quantity,
      0
    );

    const popularItems = useMemo(() => {
      const base = sourceItems.filter((i) => i.bestseller);
      if (homeDiet === 'veg') return base.filter((i) => i.veg).slice(0, 4);
      if (homeDiet === 'nonveg') return base.filter((i) => !i.veg).slice(0, 4);
      return base.slice(0, 4);
    }, [homeDiet, sourceItems]);

    const specialsItems = useMemo(() => {
      const marked = sourceItems.filter((m) => m.isSpecial);
      if (marked.length > 0) return marked;
      const ids = ['chicken-curry', 'veg-biryani', 'paneer-butter-masala', 'dal-tadka'];
      return ids.map((id) => sourceItems.find((m) => m.id === id)!).filter(Boolean);
    }, [sourceItems]);

    const getCartQty = (itemId: string) =>
      cart.filter((c) => c.item.id === itemId).reduce((s, c) => s + c.quantity, 0);

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#FAF4E8]">
        {/* Home Header - Matching Mockup with Leaves, Glow & Master Logo */}
        <header
          className="relative px-4 pt-2 pb-4 shrink-0 overflow-hidden bg-[#072E10]"
          style={{
            backgroundImage: `url(${HEADER_BG_MASTER})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
          }}
        >

          {/* Top bar: Menu hamburger, Center Brand Logo, Right Bell & Heart */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            {/* Menu button */}
            <button
              type="button"
              onClick={() => onNavigate('categories')}
              aria-label="Navigation Menu"
              className="w-9 h-9 flex items-center justify-center text-white tap-press cursor-pointer shrink-0 hover:bg-white/15 rounded-full transition-colors drop-shadow-sm"
            >
              <Menu size={22} strokeWidth={2.4} />
            </button>

            {/* Centered Swastik Foods Logo (Exact from Mockup) */}
            <div className="flex-1 flex justify-center items-center py-0.5">
              <img
                src={SWASTIK_HEADER_LOGO}
                alt="Swastik Foods"
                className="h-[52px] w-auto max-w-[220px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
              />
            </div>

            {/* Bell & Heart icon buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('notifications')}
                aria-label="Notifications"
                className="relative w-9 h-9 rounded-[13px] bg-white shadow-xs border border-black/5 flex items-center justify-center tap-press cursor-pointer text-[#1B1B1B] hover:bg-neutral-50 transition-colors"
              >
                <Bell size={18} strokeWidth={2} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D93B2B] ring-2 ring-white" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('favorites')}
                aria-label="Favorites"
                className="w-9 h-9 rounded-[13px] bg-white shadow-xs border border-black/5 flex items-center justify-center tap-press cursor-pointer text-[#1B1B1B] hover:bg-neutral-50 transition-colors"
              >
                <Heart size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Deliver to Pill */}
          <div className="relative z-10 mt-2.5">
            <button
              type="button"
              onClick={() => setAddrSheetOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF9EE] text-[#1B1B1B] shadow-sm tap-press cursor-pointer border border-[#E8B244]/50 hover:bg-white transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-[#FCE3D4] flex items-center justify-center shrink-0 shadow-2xs">
                <MapPin size={12} className="text-[#D93B2B]" />
              </div>
              <div className="flex items-center gap-1.5 text-left">
                <span className="text-[11px] text-[#7A3E12] font-semibold">Deliver to</span>
                <span className="text-[12.5px] font-bold text-[#1B1B1B] truncate max-w-[155px]">
                  {activeAddress.label}
                </span>
                <ChevronDown size={14} className="text-[#137A33] shrink-0" />
              </div>
            </button>
          </div>

          {/* Search Bar with Mic Icon */}
          <div className="relative z-10 mt-2.5 flex items-center gap-2.5 h-[44px] rounded-full bg-white px-4 shadow-[0_3px_12px_rgba(0,0,0,0.1)] border border-[#E5DAC4]/70">
            <button
              type="button"
              onClick={() => onNavigate('search')}
              className="flex-1 flex items-center gap-2.5 text-left cursor-pointer min-w-0"
            >
              <Search size={18} className="text-[#137A33] shrink-0" />
              <span className="text-[13px] text-[#6B6B6B] truncate font-medium">
                Search curries, daily meals, biryani...
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                showToast('Voice search ready — try "Chicken Curry"', 'info');
                onNavigate('search');
              }}
              aria-label="Voice search"
              className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-[#137A33] cursor-pointer shrink-0 transition-colors"
            >
              <Mic size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-32 space-y-4 pt-3">
          {/* Live Ongoing Order Quick Banner */}
          {ongoingOrder && (
            <button
              type="button"
              onClick={() => onNavigate('track-order', { orderId: ongoingOrder.id })}
              className="w-full rounded-[16px] px-3.5 py-2.5 bg-[#E3F2DC] border border-[#1F6B2B]/20 flex items-center justify-between gap-2.5 text-left tap-press cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#1F6B2B] text-white flex items-center justify-center shrink-0">
                  <Truck size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-semibold text-[#0B3D1A] truncate">
                    Order #{ongoingOrder.id} · {ongoingOrder.stage}
                  </div>
                  <div className="text-[11px] text-[#1F6B2B] truncate">
                    Arriving by {ongoingOrder.eta} · Tap to track live
                  </div>
                </div>
              </div>
              <ChevronRight size={17} className="text-[#1F6B2B] shrink-0" />
            </button>
          )}

          {/* Promo Banner Carousel (Auto-sliding) */}
          <div
            onMouseEnter={() => setIsBannerPaused(true)}
            onMouseLeave={() => setIsBannerPaused(false)}
            onTouchStart={() => setIsBannerPaused(true)}
            onTouchEnd={() => setIsBannerPaused(false)}
            className="relative"
          >
            <div
              onClick={() => onNavigate(activeBanners[safeBannerIdx].target)}
              className="relative overflow-hidden rounded-[20px] shadow-[0_8px_24px_rgba(11,61,26,0.22)] cursor-pointer tap-press hover:scale-[1.01] transition-transform"
            >
              <img
                src={activeBanners[safeBannerIdx].bannerImage}
                alt={activeBanners[safeBannerIdx].title || 'Swastik Foods Banner'}
                className="w-full h-auto block object-cover rounded-[20px]"
              />
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBannerIdx(i)}
                  aria-label={`Banner ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${safeBannerIdx === i ? 'w-5 bg-[#137A33]' : 'w-1.5 bg-black/20 hover:bg-black/35'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* 3 Core Services — "What would you like today?" */}
          <section>
            <h2 className="text-[16px] font-extrabold text-[#113B1C] mb-2.5">
              What would you like today?
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Home Foods',
                  sub: 'Meals & Bulk',
                  photo: DISH_HOME_FOODS,
                  bg: 'bg-[#E2F6E7]',
                  border: 'border-[#C5ECD0]',
                  titleColor: 'text-[#0E441D]',
                  subColor: 'text-[#4F7D5C]',
                  chevronColor: 'text-[#1B612C]',
                  screen: 'home-foods' as ScreenName,
                },
                {
                  label: 'Curries',
                  sub: '250ml to 1L',
                  photo: DISH_CURRIES,
                  bg: 'bg-[#FDECE3]',
                  border: 'border-[#FAD3C0]',
                  titleColor: 'text-[#562208]',
                  subColor: 'text-[#8E563D]',
                  chevronColor: 'text-[#963F17]',
                  screen: 'curries' as ScreenName,
                },
                {
                  label: 'Catering',
                  sub: 'Events & Parties',
                  photo: DISH_CATERING,
                  bg: 'bg-[#F2E9FB]',
                  border: 'border-[#E3D1F7]',
                  titleColor: 'text-[#3E1160]',
                  subColor: 'text-[#7846A3]',
                  chevronColor: 'text-[#6D2E9E]',
                  screen: 'catering' as ScreenName,
                },
              ].map((svc) => (
                <button
                  key={svc.label}
                  type="button"
                  onClick={() => onNavigate(svc.screen)}
                  className={`rounded-[22px] p-2.5 pt-3 pb-3 flex flex-col items-center text-center shadow-[0_4px_16px_rgba(0,0,0,0.05)] border hover:scale-[1.02] active:scale-95 transition-all tap-press cursor-pointer ${svc.bg} ${svc.border}`}
                >
                  {/* 3D Floating Dish Art */}
                  <div className="w-full h-14 flex items-center justify-center mb-1.5 shrink-0">
                    <img
                      src={svc.photo}
                      alt={svc.label}
                      className="max-h-full max-w-full object-contain block"
                    />
                  </div>
                  <span className={`text-[13px] font-black leading-tight w-full ${svc.titleColor}`}>
                    {svc.label}
                  </span>
                  <div className="flex items-center justify-center gap-1.5 w-full mt-1">
                    <span className={`text-[10px] font-bold ${svc.subColor}`}>
                      {svc.sub}
                    </span>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 ${svc.chevronColor}`}>
                      <ChevronRight size={10} strokeWidth={3} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Quick Services Bar (Daily Meals, Bulk Orders, Event Catering, Custom Menu) */}
          <div className="rounded-[20px] bg-white border border-[#EBE4D5] shadow-[0_4px_16px_rgba(0,0,0,0.04)] py-2.5 px-2 grid grid-cols-4 divide-x divide-[#F0EAE0]">
            <button
              type="button"
              onClick={() => onNavigate('home-foods')}
              className="flex items-center justify-center gap-1.5 cursor-pointer tap-press px-1 text-left group"
            >
              <Calendar size={18} className="text-[#137A33] shrink-0" strokeWidth={2.2} />
              <div className="leading-tight">
                <span className="text-[10px] font-bold text-[#1B1B1B] block">Daily</span>
                <span className="text-[10px] font-bold text-[#1B1B1B] block">Meals</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home-foods')}
              className="flex items-center justify-center gap-1.5 cursor-pointer tap-press px-1 text-left group"
            >
              <Package size={18} className="text-[#137A33] shrink-0" strokeWidth={2.2} />
              <div className="leading-tight">
                <span className="text-[10px] font-bold text-[#1B1B1B] block">Bulk</span>
                <span className="text-[10px] font-bold text-[#1B1B1B] block">Orders</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('catering')}
              className="flex items-center justify-center gap-1.5 cursor-pointer tap-press px-1 text-left group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#137A33" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M12 4V2" />
                <path d="M4 18h16" />
                <path d="M4 18a8 8 0 0 1 16 0" />
                <path d="M2 20h20" />
              </svg>
              <div className="leading-tight">
                <span className="text-[10px] font-bold text-[#1B1B1B] block">Event</span>
                <span className="text-[10px] font-bold text-[#1B1B1B] block">Catering</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('catering')}
              className="flex items-center justify-center gap-1.5 cursor-pointer tap-press px-1 text-left group"
            >
              <UtensilsCrossed size={18} className="text-[#137A33] shrink-0" strokeWidth={2.2} />
              <div className="leading-tight">
                <span className="text-[10px] font-bold text-[#1B1B1B] block">Custom</span>
                <span className="text-[10px] font-bold text-[#1B1B1B] block">Menu</span>
              </div>
            </button>
          </div>

          {/* Today's Specials Horizontal Scroll */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4.5 rounded-full bg-gradient-to-b from-[#E6A217] to-[#C98008]" />
                <h2 className="text-[16px] font-black text-[#1B1B1B]">Today's Specials</h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('categories')}
                className="text-[12px] font-extrabold text-[#137A33] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {specialsItems.map((item) => {
                const qty = getCartQty(item.id);
                const isFav = favorites.includes(item.id);
                const price =
                  (item.sizeOptions.find((s) => s.isDefault) || item.sizeOptions[0])?.price ?? 149;
                return (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('product-detail', { itemId: item.id })}
                    className="w-[144px] shrink-0 rounded-[18px] bg-white border border-[#EAE3D2] shadow-[0_6px_18px_rgba(0,0,0,0.06)] p-2.5 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer tap-press"
                  >
                    <div>
                      <div className="relative w-full h-[96px] rounded-[13px] overflow-hidden bg-[#FAF5E8] shadow-2xs">
                        <img
                          src={FOOD_IMAGE_MAP[item.id] || FOOD_IMAGE_MAP['curries']}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(item.id);
                          }}
                          aria-label="Favorite"
                          className={`absolute top-1.5 right-1.5 w-6.5 h-6.5 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer ${isFav ? 'bg-white text-[#D93B2B] shadow-xs' : 'bg-black/40 text-white hover:bg-black/55'
                            }`}
                        >
                          <Heart size={12} fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <h3 className="text-[12.5px] font-extrabold text-[#1B1B1B] mt-2 line-clamp-1">
                        {item.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-2.5 pt-1.5 border-t border-black/5">
                      <span className="text-[13px] font-black text-[#1B1B1B] shrink-0">₹{price}</span>
                      {qty > 0 ? (
                        <QuantityStepper
                          quantity={qty}
                          onIncrease={() => onQuickAdd(item)}
                          onDecrease={() => onDecreaseItem(item)}
                          compact
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickAdd(item);
                          }}
                          className="h-[26px] px-3 rounded-full bg-[#137A33] hover:bg-[#0E6027] active:scale-95 text-white text-[10.5px] font-black tracking-wide inline-flex items-center justify-center shadow-[0_2px_8px_rgba(19,122,51,0.35)] transition-transform cursor-pointer"
                        >
                          ADD +
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Browse Categories Horizontal */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[16px] font-semibold text-[#1B1B1B]">Browse Categories</h2>
              <button
                type="button"
                onClick={() => onNavigate('categories')}
                className="text-[12.5px] font-semibold text-[#1F6B2B] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {activeCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  compact
                  onClick={() => {
                    if (cat.id === 'curries') onNavigate('curries');
                    else if (cat.id === 'home-foods') onNavigate('home-foods');
                    else if (cat.id === 'catering') onNavigate('catering');
                    else onNavigate('category-items', { categoryId: cat.id });
                  }}
                />
              ))}
            </div>
          </section>

          {/* Upcoming Events / Special Menus (#20) */}
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[16px] font-semibold text-[#1B1B1B]">Upcoming Events &amp; Specials</h2>
              <button
                type="button"
                onClick={() => onNavigate('upcoming-events')}
                className="text-[12.5px] font-semibold text-[#1F6B2B] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>See all</span>
                <ArrowRight size={13} />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {(upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents : UPCOMING_EVENTS).map((evt) => (
                <div
                  key={evt.id}
                  style={{ backgroundColor: evt.tint }}
                  className="w-[258px] shrink-0 rounded-[18px] p-3.5 border border-black/5 shadow-[0_4px_14px_rgba(0,0,0,0.06)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#7A3E12]">
                        {evt.offerBadge}
                      </span>
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white shadow-2xs shrink-0">
                        <img
                          src={FOOD_IMAGE_MAP[evt.id] || FOOD_IMAGE_MAP['sweets']}
                          alt={evt.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <h3 className="text-[14px] font-semibold text-[#1B1B1B] mt-1 leading-snug">
                      {evt.title}
                    </h3>
                    <p className="text-[11.5px] text-[#6B6B6B] mt-0.5">{evt.dateRange}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-black/5">
                    <span className="text-[13px] font-bold text-[#1B1B1B]">{evt.priceLabel}</span>
                    <button
                      type="button"
                      onClick={() => onPrebookEvent(evt)}
                      className="h-[30px] px-3.5 rounded-full bg-[#137A33] hover:bg-[#0E6027] active:scale-95 text-white text-[11.5px] font-bold inline-flex items-center gap-1 shadow-xs transition-transform cursor-pointer"
                    >
                      <span>Pre-book</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bestsellers with Inline Veg/Non-Veg Quick Filter */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[16px] font-semibold text-[#1B1B1B]">Popular Curries &amp; Meals</h2>
              <button
                type="button"
                onClick={() => onNavigate('curries')}
                className="text-[12.5px] font-semibold text-[#1F6B2B] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Full Menu</span>
                <ArrowRight size={13} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <FilterChip active={homeDiet === 'all'} onClick={() => setHomeDiet('all')}>
                All Bestsellers
              </FilterChip>
              <FilterChip active={homeDiet === 'veg'} onClick={() => setHomeDiet('veg')}>
                <VegIndicator veg /> Pure Veg
              </FilterChip>
              <FilterChip active={homeDiet === 'nonveg'} onClick={() => setHomeDiet('nonveg')}>
                <VegIndicator veg={false} /> Non-Veg
              </FilterChip>
            </div>
            <div className="space-y-3">
              {popularItems.map((item) => (
                <ProductRow
                  key={item.id}
                  item={item}
                  isFavorite={favorites.includes(item.id)}
                  cartQty={getCartQty(item.id)}
                  onToggleFavorite={onToggleFavorite}
                  onQuickAdd={onQuickAdd}
                  onDecreaseQty={onDecreaseItem}
                  onPress={(it) => onNavigate('product-detail', { itemId: it.id })}
                />
              ))}
            </div>
          </section>
        </div>

        <FloatingCartBar
          count={totalCartItems}
          subtotal={cartSubtotal}
          onViewCart={() => onNavigate('cart')}
        />

        <BottomTabBar
          activeTab="home"
          cartCount={totalCartItems}
          onSelectTab={(tab) => onNavigate(tab)}
        />

        {/* Quick Address Switcher Bottom Sheet */}
        <BottomSheet
          open={addrSheetOpen}
          onClose={() => setAddrSheetOpen(false)}
          title="Select Delivery Location"
        >
          <div className="space-y-2.5">
            {addresses.map((addr) => (
              <RadioCard
                key={addr.id}
                selected={addr.id === activeAddress.id}
                onSelect={() => {
                  onSelectAddress(addr.id);
                  setAddrSheetOpen(false);
                  showToast(`Delivering to ${addr.label}`, 'success');
                }}
                title={`${addr.tag} · ${addr.label}`}
                subtitle={addr.fullAddress}
                rightText={`${addr.distanceKm} km`}
              />
            ))}
            <div className="pt-2">
              <PrimaryButton
                onClick={() => {
                  setAddrSheetOpen(false);
                  onNavigate('addresses');
                }}
              >
                Manage Saved Addresses
              </PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      </div>
    );
  };

/* Screen 4: Categories Grid */
export const CategoriesScreen: React.FC<{
  cartCount: number;
  categories?: CategoryInfo[];
  onBack: () => void;
  onNavigate: (screen: ScreenName, params?: Record<string, any>) => void;
}> = ({ cartCount, categories, onBack, onNavigate }) => (
  <div className="flex-1 flex flex-col min-h-0 bg-[#FAF4E8]">
    <TopBar
      title="Categories"
      onBack={onBack}
      rightSlot={
        <button
          type="button"
          onClick={() => onNavigate('search')}
          aria-label="Search menu"
          className="w-11 h-11 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
        >
          <Search size={20} />
        </button>
      }
    />
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
      <p className="text-[12.5px] text-[#6B6B6B]">
        Tap any category to browse freshly cooked dishes or book event catering.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {(categories && categories.length > 0 ? categories : CATEGORIES).map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onClick={() => {
              if (cat.id === 'curries') onNavigate('curries');
              else if (cat.id === 'home-foods') onNavigate('home-foods');
              else if (cat.id === 'catering') onNavigate('catering');
              else onNavigate('category-items', { categoryId: cat.id });
            }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onNavigate('catering-quote')}
        className="w-full rounded-[18px] p-4 bg-[#0B3D1A] text-white flex items-center justify-between gap-3 shadow-sm tap-press cursor-pointer text-left"
      >
        <div>
          <div className="text-[11px] font-semibold text-[#F5B52E] uppercase tracking-wider">
            Events &amp; Parties
          </div>
          <div className="text-[14px] font-semibold mt-0.5">
            Need Catering for 20–1,000 Guests?
          </div>
        </div>
        <span className="h-9 px-3.5 rounded-full bg-[#F5B52E] text-[#0B3D1A] text-[12px] font-semibold inline-flex items-center shrink-0">
          Get Quote →
        </span>
      </button>
    </div>
    <BottomTabBar
      activeTab="categories"
      cartCount={cartCount}
      onSelectTab={(tab) => onNavigate(tab)}
    />
  </div>
);

/* Screen 5, 16, & Category Items: Menu List Screen */
export const MenuListScreen: React.FC<{
  title: string;
  categoryId: CategoryId;
  isHomeFoods?: boolean;
  menuItems?: MenuItem[];
  cart: CartItem[];
  favorites: string[];
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onQuickAdd: (item: MenuItem) => void;
  onDecreaseItem: (item: MenuItem) => void;
  onNavigate: (screen: ScreenName, params?: Record<string, any>) => void;
}> = ({
  title,
  categoryId,
  isHomeFoods = false,
  menuItems,
  cart,
  favorites,
  onBack,
  onToggleFavorite,
  onQuickAdd,
  onDecreaseItem,
  onNavigate,
}) => {
    const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
    const [homeFoodMode, setHomeFoodMode] = useState<'daily' | 'bulk'>('daily');

    const items = useMemo(() => {
      const source = menuItems && menuItems.length > 0 ? menuItems : MENU_ITEMS;
      return source.filter((i) => i.category === categoryId).filter((i) => {
        if (dietFilter === 'veg') return i.veg;
        if (dietFilter === 'nonveg') return !i.veg;
        return true;
      });
    }, [categoryId, dietFilter, menuItems]);

    const getCartQty = (itemId: string) =>
      cart.filter((c) => c.item.id === itemId).reduce((s, c) => s + c.quantity, 0);

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
        <TopBar
          title={title}
          onBack={onBack}
          rightSlot={
            <button
              type="button"
              onClick={() => onNavigate('search')}
              aria-label="Search"
              className="w-11 h-11 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
            >
              <Search size={20} />
            </button>
          }
        />

        <div className="px-4 pt-3 pb-2 space-y-2.5 shrink-0">
          {/* Daily Meals / Bulk Toggle on Home Foods (#16) */}
          {isHomeFoods && (
            <div className="p-1 rounded-full bg-white border border-black/8 grid grid-cols-2 shadow-2xs">
              <button
                type="button"
                onClick={() => setHomeFoodMode('daily')}
                className={`h-9 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${homeFoodMode === 'daily' ? 'bg-[#1F6B2B] text-white' : 'text-[#6B6B6B]'
                  }`}
              >
                Daily Meals
              </button>
              <button
                type="button"
                onClick={() => setHomeFoodMode('bulk')}
                className={`h-9 rounded-full text-[12.5px] font-semibold transition-all cursor-pointer ${homeFoodMode === 'bulk' ? 'bg-[#1F6B2B] text-white' : 'text-[#6B6B6B]'
                  }`}
              >
                Bulk Order (10+ Plates)
              </button>
            </div>
          )}

          {isHomeFoods && homeFoodMode === 'bulk' && (
            <div className="rounded-[16px] bg-[#E3F2DC] p-3 flex items-center justify-between gap-2">
              <div className="text-[12px] text-[#0B3D1A]">
                <strong className="font-semibold">Bulk Tier Discounts:</strong> Save 10% on 25+ plates &amp; 15% on 50+ plates with Swastik Own-Fleet delivery.
              </div>
              <button
                type="button"
                onClick={() => onNavigate('bulk-order', { itemId: 'veg-meals' })}
                className="h-8 px-3 rounded-full bg-[#1F6B2B] text-white text-[11.5px] font-semibold shrink-0 cursor-pointer"
              >
                Configure
              </button>
            </div>
          )}

          {/* All / Veg / Non-Veg Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <FilterChip active={dietFilter === 'all'} onClick={() => setDietFilter('all')}>
              All
            </FilterChip>
            <FilterChip active={dietFilter === 'veg'} onClick={() => setDietFilter('veg')}>
              <VegIndicator veg /> Veg
            </FilterChip>
            <FilterChip active={dietFilter === 'nonveg'} onClick={() => setDietFilter('nonveg')}>
              <VegIndicator veg={false} /> Non-Veg
            </FilterChip>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-3">
          {items.length === 0 ? (
            <EmptyState
              emoji="🥗"
              title="No dishes match this filter"
              description="Try switching back to All to browse all freshly cooked dishes."
              ctaLabel="Show All Dishes"
              onCta={() => setDietFilter('all')}
            />
          ) : (
            items.map((item) => (
              <ProductRow
                key={item.id}
                item={item}
                isFavorite={favorites.includes(item.id)}
                cartQty={getCartQty(item.id)}
                onToggleFavorite={onToggleFavorite}
                onQuickAdd={onQuickAdd}
                onDecreaseQty={onDecreaseItem}
                actionLabel={isHomeFoods && homeFoodMode === 'bulk' ? 'Bulk Order' : undefined}
                onPress={(it) => {
                  if (isHomeFoods && homeFoodMode === 'bulk') {
                    onNavigate('bulk-order', { itemId: it.id });
                  } else {
                    onNavigate('product-detail', { itemId: it.id });
                  }
                }}
              />
            ))
          )}
        </div>

        <FloatingCartBar
          count={cart.reduce((s, c) => s + c.quantity, 0)}
          subtotal={cart.reduce(
            (s, c) => s + (c.unitPrice + c.addons.reduce((a, x) => a + x.price, 0)) * c.quantity,
            0
          )}
          onViewCart={() => onNavigate('cart')}
        />
      </div>
    );
  };

const DISH_INGREDIENTS_MAP: Record<string, string[]> = {
  'paneer-butter-masala': [
    'Fresh Malai Paneer',
    'Ripe Tomatoes',
    'Cashew Paste',
    'Homemade White Butter',
    'Kasuri Methi',
    'Cardamom & Garam Masala',
    'Fresh Cream',
  ],
  'chicken-curry': [
    'Farm-Fresh Chicken',
    'Caramelized Onions',
    'Tomatoes',
    'Ginger-Garlic Paste',
    'Guntur Red Chilli',
    'Curry Leaves',
    'Whole Garam Masala',
  ],
  'mutton-curry': [
    'Tender Goat Cuts',
    'Shallots & Onions',
    'Fresh Coriander',
    'Ginger-Garlic Paste',
    'Whole Spices',
    'Cold-Pressed Oil',
    'Turmeric & Black Pepper',
  ],
  'veg-biryani': [
    'Aged Basmati Rice',
    'Mixed Seasonal Veggies',
    'Saffron Milk',
    'Pure Desi Ghee',
    'Fried Onions',
    'Mint & Coriander',
    'Whole Biryani Spices',
  ],
  'chicken-biryani': [
    'Aged Basmati Rice',
    'Marinated Chicken',
    'Pure Desi Ghee',
    'Saffron & Rose Water',
    'Curd & Mint',
    'Caramelized Onions',
    'Shahi Garam Masala',
  ],
  'dal-tadka': [
    'Toor & Moong Dal',
    'Pure Cow Ghee',
    'Cumin & Mustard Seeds',
    'Roasted Garlic',
    'Dried Red Chillies',
    'Curry Leaves',
    'Turmeric & Hing',
  ],
};

function getDishIngredients(item: MenuItem): string[] {
  if (item.ingredients && item.ingredients.length > 0) return item.ingredients;
  if (DISH_INGREDIENTS_MAP[item.id]) return DISH_INGREDIENTS_MAP[item.id];
  const n = item.name.toLowerCase();
  if (n.includes('biryani') || n.includes('pulao')) {
    return [
      'Aged Basmati Rice',
      item.veg ? 'Fresh Vegetables / Paneer' : 'Tender Meat',
      'Pure Desi Ghee',
      'Saffron & Mint',
      'Fried Onions',
      'Whole Biryani Spices',
    ];
  }
  if (n.includes('paneer')) {
    return ['Fresh Paneer', 'Tomato-Cashew Gravy', 'Ginger-Garlic', 'White Butter', 'Kasuri Methi', 'Whole Spices'];
  }
  if (n.includes('chicken')) {
    return ['Fresh Chicken', 'Onions & Tomatoes', 'Ginger-Garlic Paste', 'Curry Leaves', 'Roasted Spices', 'Cold-Pressed Oil'];
  }
  if (n.includes('mutton')) {
    return ['Tender Mutton', 'Onions & Spices', 'Ginger-Garlic Paste', 'Coriander', 'Black Pepper', 'Cold-Pressed Oil'];
  }
  if (n.includes('dal') || n.includes('sambar')) {
    return ['Toor Dal', 'Pure Ghee', 'Mustard & Cumin', 'Curry Leaves', 'Garlic & Hing', 'Turmeric'];
  }
  if (item.category === 'sweets') {
    return ['Pure Cow Ghee', 'Jaggery / Sugar', 'Cardamom', 'Roasted Cashews & Raisins', 'Saffron'];
  }
  if (item.category === 'tiffins' || item.category === 'snacks') {
    return ['Stone-Ground Batter / Flour', 'Cold-Pressed Groundnut Oil', 'Curry Leaves', 'Green Chilli', 'Fresh Coconut'];
  }
  return [
    'Fresh Daily Produce',
    'Cold-Pressed Cooking Oil',
    'House-Ground Spices',
    'Ginger-Garlic',
    'Curry Leaves & Coriander',
  ];
}

/* Screen 6: Product Detail */
export const ProductDetailScreen: React.FC<{
  item: MenuItem;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (
    item: MenuItem,
    sizeLabel: string,
    unitPrice: number,
    addons: AddonOption[],
    quantity: number
  ) => void;
  onGoBulk?: () => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({
  item,
  isFavorite,
  onBack,
  onToggleFavorite,
  onAddToCart,
  onGoBulk,
  showToast,
}) => {
    const defaultOpt = item.sizeOptions.find((s) => s.isDefault) || item.sizeOptions[0];
    const [selectedSize, setSelectedSize] = useState(defaultOpt.label);
    const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
    const [qty, setQty] = useState(1);

    const activeSizeObj = item.sizeOptions.find((s) => s.label === selectedSize) || defaultOpt;
    const selectedAddons = item.addons.filter((a) => selectedAddonIds.includes(a.id));
    const addonsCost = selectedAddons.reduce((s, a) => s + a.price, 0);
    const unitWithAddons = activeSizeObj.price + addonsCost;
    const total = unitWithAddons * qty;

    const toggleAddon = (id: string) => {
      setSelectedAddonIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    };

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          {/* Full-bleed Hero Artwork */}
          <div className="relative h-[250px] w-full">
            <FoodArtwork
              imageKey={item.image}
              emoji={item.emoji}
              label={item.name}
              tint={item.tint}
              size="hero"
            />

            {/* Floating Back, Heart, Share */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-[#1B1B1B] tap-press cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(item.id)}
                  aria-label="Toggle favorite"
                  className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center tap-press cursor-pointer"
                >
                  <Heart
                    size={19}
                    className={isFavorite ? 'fill-[#D93B2B] text-[#D93B2B]' : 'text-[#1B1B1B]'}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => showToast(`Link copied for ${item.name}`, 'info')}
                  aria-label="Share dish"
                  className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-[#1B1B1B] tap-press cursor-pointer"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="px-4 pt-4 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <VegIndicator veg={item.veg} size="md" />
                {item.bestseller && (
                  <span className="text-[12px] font-semibold text-[#7A3E12]">Bestseller</span>
                )}
                <span className="text-[12px] text-[#6B6B6B]">·</span>
                <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#1B1B1B] tabular-nums">
                  <Star size={13} className="fill-[#F5B52E] text-[#F5B52E]" />
                  {item.rating.toFixed(1)}
                  <span className="font-normal text-[#6B6B6B]">({item.reviews})</span>
                </span>
              </div>

              <h1 className="text-[20px] font-semibold text-[#1B1B1B] mt-1.5">{item.name}</h1>
              <p className="text-[13px] text-[#6B6B6B] leading-relaxed mt-1.5">{item.description}</p>

              {/* Ingredients Used */}
              <div className="mt-3.5 rounded-[16px] bg-white border border-black/6 p-3.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#113B1C] mb-2">
                  <UtensilsCrossed size={14} className="text-[#1F6B2B]" />
                  <span>Ingredients Used</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getDishIngredients(item).map((ing) => (
                    <span
                      key={ing}
                      className="px-2.5 py-1 rounded-full bg-[#FBF7EE] border border-[#E6DEC8] text-[11.5px] font-medium text-[#1B1B1B]"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {item.supportsBulk && onGoBulk && (
                <button
                  type="button"
                  onClick={onGoBulk}
                  className="mt-3 w-full rounded-[14px] bg-[#E3F2DC] px-3.5 py-2.5 flex items-center justify-between text-[12.5px] font-semibold text-[#1F6B2B] cursor-pointer"
                >
                  <span>Planning for 10+ guests? Order in Bulk</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>

            {/* Quantity / Size Options */}
            <div>
              <h2 className="text-[15px] font-semibold text-[#1B1B1B] mb-2">Choose Quantity</h2>
              <div className="space-y-2">
                {item.sizeOptions.map((opt) => (
                  <RadioCard
                    key={opt.label}
                    selected={selectedSize === opt.label}
                    onSelect={() => setSelectedSize(opt.label)}
                    title={opt.label}
                    rightText={`₹${opt.price}`}
                  />
                ))}
              </div>
            </div>

            {/* Add-ons */}
            {item.addons.length > 0 && (
              <div>
                <h2 className="text-[15px] font-semibold text-[#1B1B1B] mb-2">
                  Add-ons <span className="text-[12px] font-normal text-[#6B6B6B]">(Optional)</span>
                </h2>
                <div className="space-y-2">
                  {item.addons.map((addon) => (
                    <CheckboxRow
                      key={addon.id}
                      checked={selectedAddonIds.includes(addon.id)}
                      onToggle={() => toggleAddon(addon.id)}
                      label={addon.name}
                      rightText={`+₹${addon.price}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Add to Cart CTA */}
        <div className="shrink-0 bg-white border-t border-black/8 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_14px_rgba(0,0,0,0.06)]">
          <QuantityStepper
            quantity={qty}
            onDecrease={() => setQty((q) => Math.max(1, q - 1))}
            onIncrease={() => setQty((q) => q + 1)}
          />
          <PrimaryButton
            className="flex-1"
            onClick={() => {
              onAddToCart(item, activeSizeObj.label, activeSizeObj.price, selectedAddons, qty);
            }}
          >
            <span className="tabular-nums">Add to Cart · ₹{total}</span>
          </PrimaryButton>
        </div>
      </div>
    );
  };

/* Screen 17: Bulk Order Screen (Home Foods) */
export const BulkOrderScreen: React.FC<{
  initialItemId?: string;
  menuItems?: MenuItem[];
  onBack: () => void;
  onAddBulkToCart: (
    item: MenuItem,
    plates: number,
    unitDiscountedPrice: number,
    date: string,
    time: string,
    instructions: string
  ) => void;
}> = ({ initialItemId, menuItems, onBack, onAddBulkToCart }) => {
  const source = menuItems && menuItems.length > 0 ? menuItems : MENU_ITEMS;
  const bulkItems = source.filter((m) => m.supportsBulk || m.category === 'home-foods');
  const [selectedId, setSelectedId] = useState(initialItemId || bulkItems[0].id);
  const [plates, setPlates] = useState(25);
  const [date, setDate] = useState('2026-11-28');
  const [time, setTime] = useState('12:30 PM');
  const [instructions, setInstructions] = useState('Medium spice, pack spoons & plates separately');

  const selectedItem = bulkItems.find((b) => b.id === selectedId) || bulkItems[0];
  const basePrice = selectedItem.sizeOptions[0].price;
  const discountRate = plates >= 50 ? 0.15 : plates >= 25 ? 0.1 : 0;
  const discountedUnit = Math.round(basePrice * (1 - discountRate));
  const totalBulkPrice = discountedUnit * plates;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title="Bulk Meal Order" onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24">
        <div className="rounded-[18px] bg-[#E3F2DC] p-3.5 border border-[#1F6B2B]/15">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0B3D1A]">
            <UtensilsCrossed size={16} className="text-[#1F6B2B]" />
            <span>Swastik Bulk Home Foods</span>
          </div>
          <p className="text-[12px] text-[#1B1B1B]/80 mt-1">
            25–49 plates: <strong>10% off</strong> · 50+ plates: <strong>15% off</strong> · Delivered in Swastik Own Fleet with live tracking.
          </p>
        </div>

        {/* Select Meal */}
        <div>
          <label className="block text-[13px] font-semibold text-[#1B1B1B] mb-1.5">
            Select Meal Box
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full h-[48px] rounded-[14px] bg-white border border-black/12 px-3.5 text-[13.5px] font-medium text-[#1B1B1B] outline-none"
          >
            {bulkItems.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} (₹{it.sizeOptions[0].price}/plate)
              </option>
            ))}
          </select>
        </div>

        {/* Plate Count Picker */}
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14px] font-semibold text-[#1B1B1B]">Number of Plates</span>
            <span className="text-[13px] font-semibold text-[#1F6B2B] tabular-nums">
              {discountRate > 0 ? `${discountRate * 100}% Bulk Savings` : 'Min 10 plates'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[10, 25, 50, 100].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPlates(preset)}
                className={`h-10 rounded-full text-[13px] font-semibold tabular-nums cursor-pointer transition-colors ${plates === preset
                  ? 'bg-[#1F6B2B] text-white'
                  : 'bg-[#FBF7EE] text-[#1B1B1B] border border-black/10'
                  }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-black/6">
            <span className="text-[12.5px] text-[#6B6B6B]">Custom Plate Count</span>
            <QuantityStepper
              quantity={plates}
              onDecrease={() => setPlates((p) => Math.max(10, p - 5))}
              onIncrease={() => setPlates((p) => p + 5)}
            />
          </div>
        </div>

        {/* Advance Date & Time */}
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 space-y-3">
          <h3 className="text-[14px] font-semibold text-[#1B1B1B]">Advance Delivery Schedule</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] text-[#6B6B6B] flex items-center gap-1 mb-1">
                <Calendar size={12} /> Delivery Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 rounded-[12px] border border-black/12 px-2.5 text-[12.5px] font-medium bg-[#FBF7EE]/60"
              />
            </div>
            <div>
              <label className="text-[11.5px] text-[#6B6B6B] flex items-center gap-1 mb-1">
                <Clock size={12} /> Time Slot
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-11 rounded-[12px] border border-black/12 px-2.5 text-[12.5px] font-medium bg-[#FBF7EE]/60"
              >
                <option>08:30 AM</option>
                <option>12:30 PM</option>
                <option>01:30 PM</option>
                <option>07:30 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11.5px] text-[#6B6B6B] block mb-1">Special Instructions</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full rounded-[12px] border border-black/12 p-2.5 text-[12.5px] bg-[#FBF7EE]/60 outline-none"
              placeholder="Packaging, spice level, or serving notes..."
            />
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart */}
      <div className="shrink-0 bg-white border-t border-black/8 px-4 py-3 shadow-[0_-4px_14px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between text-[12px] text-[#6B6B6B] mb-2">
          <span>
            {plates} plates × ₹{discountedUnit}/plate
          </span>
          <span className="font-semibold text-[#1F6B2B] tabular-nums">
            Total ₹{totalBulkPrice.toLocaleString('en-IN')}
          </span>
        </div>
        <PrimaryButton
          onClick={() =>
            onAddBulkToCart(selectedItem, plates, discountedUnit, date, time, instructions)
          }
        >
          Add Bulk Order to Cart · ₹{totalBulkPrice.toLocaleString('en-IN')}
        </PrimaryButton>
      </div>
    </div>
  );
};

/* Screen 20: Upcoming Events / Special Menus */
export const UpcomingEventsScreen: React.FC<{
  upcomingEvents?: UpcomingEvent[];
  onBack: () => void;
  onPrebook: (evt: UpcomingEvent) => void;
}> = ({ upcomingEvents, onBack, onPrebook }) => (
  <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
    <TopBar title="Upcoming Events & Specials" onBack={onBack} />
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3.5">
      {(upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents : UPCOMING_EVENTS).map((evt) => (
        <div
          key={evt.id}
          className="bg-white rounded-[20px] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.07)] border border-black/5"
        >
          <div className="flex items-start gap-3">
            <FoodArtwork
              imageKey={evt.id}
              emoji={evt.emoji}
              label={evt.title}
              tint="cream"
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <VegIndicator veg={evt.veg} />
                <span className="text-[11px] font-semibold text-[#7A3E12]">{evt.offerBadge}</span>
              </div>
              <h2 className="text-[15px] font-semibold text-[#1B1B1B] mt-0.5">{evt.title}</h2>
              <p className="text-[12px] text-[#6B6B6B] mt-0.5">{evt.dateRange}</p>
            </div>
          </div>
          <p className="text-[12.5px] text-[#6B6B6B] mt-3 leading-relaxed">{evt.description}</p>
          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-black/6">
            <span className="text-[15px] font-semibold text-[#1F6B2B] tabular-nums">
              {evt.priceLabel}
            </span>
            <GoldButton
              onClick={() => onPrebook(evt)}
              className="!w-auto !h-[38px] !px-5 !text-[12.5px]"
            >
              <Sparkles size={14} /> Pre-book Now
            </GoldButton>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* Screen 29: Search Results & Filters */
export const SearchScreen: React.FC<{
  menuItems?: MenuItem[];
  cart: CartItem[];
  favorites: string[];
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onQuickAdd: (item: MenuItem) => void;
  onDecreaseItem: (item: MenuItem) => void;
  onOpenProduct: (item: MenuItem) => void;
}> = ({
  menuItems,
  cart,
  favorites,
  onBack,
  onToggleFavorite,
  onQuickAdd,
  onDecreaseItem,
  onOpenProduct,
}) => {
    const [query, setQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [diet, setDiet] = useState<'all' | 'veg' | 'nonveg'>('all');
    const [priceCap, setPriceCap] = useState<'all' | 'under200' | '200to350' | 'above350'>('all');
    const [minRating, setMinRating] = useState<number>(0);
    const [sortBy, setSortBy] = useState<'rec' | 'low' | 'high' | 'rating'>('rec');

    const suggestions = ['Chicken Curry', 'Paneer Butter Masala', 'Veg Biryani', 'Veg Meals', 'Gulab Jamun'];

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      const source = menuItems && menuItems.length > 0 ? menuItems : MENU_ITEMS;
      let list = source.filter((m) => {
        const defaultPrice = (m.sizeOptions.find((s) => s.isDefault) || m.sizeOptions[0]).price;
        if (q && !m.name.toLowerCase().includes(q) && !m.description.toLowerCase().includes(q)) {
          return false;
        }
        if (diet === 'veg' && !m.veg) return false;
        if (diet === 'nonveg' && m.veg) return false;
        if (priceCap === 'under200' && defaultPrice >= 200) return false;
        if (priceCap === '200to350' && (defaultPrice < 200 || defaultPrice > 350)) return false;
        if (priceCap === 'above350' && defaultPrice <= 350) return false;
        if (m.rating < minRating) return false;
        return true;
      });

      if (sortBy === 'low') {
        list = [...list].sort(
          (a, b) =>
            (a.sizeOptions.find((s) => s.isDefault) || a.sizeOptions[0]).price -
            (b.sizeOptions.find((s) => s.isDefault) || b.sizeOptions[0]).price
        );
      } else if (sortBy === 'high') {
        list = [...list].sort(
          (a, b) =>
            (b.sizeOptions.find((s) => s.isDefault) || b.sizeOptions[0]).price -
            (a.sizeOptions.find((s) => s.isDefault) || a.sizeOptions[0]).price
        );
      } else if (sortBy === 'rating') {
        list = [...list].sort((a, b) => b.rating - a.rating);
      }
      return list;
    }, [query, diet, priceCap, minRating, sortBy]);

    const getCartQty = (itemId: string) =>
      cart.filter((c) => c.item.id === itemId).reduce((s, c) => s + c.quantity, 0);

    const resetFilters = () => {
      setQuery('');
      setDiet('all');
      setPriceCap('all');
      setMinRating(0);
      setSortBy('rec');
    };

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
        <TopBar
          title="Search Menu"
          onBack={onBack}
          rightSlot={
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              aria-label="Open filters"
              className="w-11 h-11 rounded-full hover:bg-black/5 flex items-center justify-center text-[#1F6B2B] cursor-pointer"
            >
              <SlidersHorizontal size={19} />
            </button>
          }
        />

        <div className="px-4 pt-3 pb-2 space-y-2.5 shrink-0">
          <div className="flex items-center gap-2 h-[46px] rounded-full bg-white px-4 border border-black/10 shadow-2xs">
            <Search size={18} className="text-[#6B6B6B]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search curries, meals, biryani, sweets..."
              className="flex-1 bg-transparent text-[13.5px] text-[#1B1B1B] outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[11px] font-semibold text-[#6B6B6B] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Live Search Suggestions */}
          {!query && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {suggestions.map((s) => (
                <FilterChip key={s} active={false} onClick={() => setQuery(s)}>
                  {s}
                </FilterChip>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-3">
          <div className="text-[12px] text-[#6B6B6B]">
            Showing <strong className="text-[#1B1B1B]">{filtered.length}</strong> dishes
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="No matching dishes found"
              description="No items matched your search or selected filters."
              ctaLabel="Clear Filters"
              onCta={resetFilters}
            />
          ) : (
            filtered.map((item) => (
              <ProductRow
                key={item.id}
                item={item}
                isFavorite={favorites.includes(item.id)}
                cartQty={getCartQty(item.id)}
                onToggleFavorite={onToggleFavorite}
                onQuickAdd={onQuickAdd}
                onDecreaseQty={onDecreaseItem}
                onPress={onOpenProduct}
              />
            ))
          )}
        </div>

        <BottomSheet open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter & Sort">
          <div className="space-y-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[#1B1B1B] mb-2">Dietary Preference</h3>
              <div className="flex gap-2">
                <FilterChip active={diet === 'all'} onClick={() => setDiet('all')}>
                  All
                </FilterChip>
                <FilterChip active={diet === 'veg'} onClick={() => setDiet('veg')}>
                  <VegIndicator veg /> Veg Only
                </FilterChip>
                <FilterChip active={diet === 'nonveg'} onClick={() => setDiet('nonveg')}>
                  <VegIndicator veg={false} /> Non-Veg
                </FilterChip>
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-[#1B1B1B] mb-2">Price Range</h3>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={priceCap === 'all'} onClick={() => setPriceCap('all')}>
                  Any
                </FilterChip>
                <FilterChip active={priceCap === 'under200'} onClick={() => setPriceCap('under200')}>
                  Under ₹200
                </FilterChip>
                <FilterChip active={priceCap === '200to350'} onClick={() => setPriceCap('200to350')}>
                  ₹200 – ₹350
                </FilterChip>
                <FilterChip active={priceCap === 'above350'} onClick={() => setPriceCap('above350')}>
                  Above ₹350
                </FilterChip>
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-[#1B1B1B] mb-2">Minimum Rating</h3>
              <div className="flex gap-2">
                {[0, 4.5, 4.7].map((r) => (
                  <FilterChip key={r} active={minRating === r} onClick={() => setMinRating(r)}>
                    {r === 0 ? 'All Ratings' : `${r}★ & up`}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-[#1B1B1B] mb-2">Sort By</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'rec', label: 'Recommended' },
                  { id: 'low', label: 'Price: Low to High' },
                  { id: 'high', label: 'Price: High to Low' },
                  { id: 'rating', label: 'Top Rated' },
                ].map((s) => (
                  <FilterChip
                    key={s.id}
                    active={sortBy === s.id}
                    onClick={() => setSortBy(s.id as any)}
                  >
                    {s.label}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="h-[46px] rounded-full border border-black/15 text-[13px] font-semibold text-[#1B1B1B] cursor-pointer"
              >
                Reset
              </button>
              <PrimaryButton onClick={() => setFilterOpen(false)}>Apply Filters</PrimaryButton>
            </div>
          </div>
        </BottomSheet>
      </div>
    );
  };

/* Screen 30: Favorites */
export const FavoritesScreen: React.FC<{
  menuItems?: MenuItem[];
  cart: CartItem[];
  favorites: string[];
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onQuickAdd: (item: MenuItem) => void;
  onDecreaseItem: (item: MenuItem) => void;
  onOpenProduct: (item: MenuItem) => void;
  onExplore: () => void;
}> = ({
  menuItems,
  cart,
  favorites,
  onBack,
  onToggleFavorite,
  onQuickAdd,
  onDecreaseItem,
  onOpenProduct,
  onExplore,
}) => {
    const source = menuItems && menuItems.length > 0 ? menuItems : MENU_ITEMS;
    const favItems = source.filter((m) => favorites.includes(m.id));
    const getCartQty = (itemId: string) =>
      cart.filter((c) => c.item.id === itemId).reduce((s, c) => s + c.quantity, 0);

    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
        <TopBar title="Saved Favorites" onBack={onBack} />
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          {favItems.length === 0 ? (
            <EmptyState
              emoji="💚"
              title="No Favorites Yet"
              description="Tap the heart icon on any curry, meal or biryani to save it here for quick reordering."
              ctaLabel="Browse Menu"
              onCta={onExplore}
            />
          ) : (
            favItems.map((item) => (
              <ProductRow
                key={item.id}
                item={item}
                isFavorite
                cartQty={getCartQty(item.id)}
                onToggleFavorite={onToggleFavorite}
                onQuickAdd={onQuickAdd}
                onDecreaseQty={onDecreaseItem}
                onPress={onOpenProduct}
              />
            ))
          )}
        </div>
      </div>
    );
  };
