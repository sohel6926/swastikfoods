import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Home,
  LayoutGrid,
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
  Star,
  User,
  X,
} from 'lucide-react';
import { CategoryInfo, MenuItem, OrderTimelineStep, ScreenName, ToastMessage } from '../types';
import { FOOD_IMAGE_MAP, FoodArtwork } from './BrandAssets';

/* Primary Green Pill Button */
export const PrimaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }
> = ({ children, className = '', loading, disabled, ...rest }) => (
  <button
    type="button"
    disabled={disabled || loading}
    className={`w-full h-[50px] px-6 rounded-full bg-[#1F6B2B] hover:bg-[#185722] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(31,107,43,0.24)] tap-press cursor-pointer whitespace-nowrap ${className}`}
    {...rest}
  >
    {loading ? (
      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
    ) : (
      children
    )}
  </button>
);

/* Gold CTA Pill Button */
export const GoldButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <button
    type="button"
    className={`w-full h-[50px] px-6 rounded-full bg-[#F5B52E] hover:bg-[#eab024] text-[#0B3D1A] font-semibold text-[14px] flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(245,181,46,0.3)] tap-press cursor-pointer whitespace-nowrap ${className}`}
    {...rest}
  >
    {children}
  </button>
);

/* Outline Pill Button */
export const OutlineButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className = '',
  ...rest
}) => (
  <button
    type="button"
    className={`w-full h-[48px] px-6 rounded-full border-1.5 border-[#1F6B2B] bg-white text-[#1F6B2B] font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-[#E3F2DC]/40 tap-press cursor-pointer whitespace-nowrap ${className}`}
    {...rest}
  >
    {children}
  </button>
);

/* Interactive Filter Chip (36px height) */
export const FilterChip: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`h-[36px] px-4 rounded-full text-[13px] font-medium flex items-center gap-1.5 shrink-0 whitespace-nowrap tap-press cursor-pointer transition-colors ${
      active
        ? 'bg-[#1F6B2B] text-white shadow-xs'
        : 'bg-white text-[#1B1B1B] border border-black/10 hover:bg-[#E3F2DC]/50'
    }`}
  >
    {children}
  </button>
);

/* Authentic FSSAI Veg / Non-Veg Marker */
export const VegIndicator: React.FC<{ veg: boolean; size?: 'sm' | 'md' }> = ({
  veg,
  size = 'sm',
}) => {
  const box = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const color = veg ? '#1F6B2B' : '#D93B2B';
  return (
    <span
      className={`inline-flex items-center justify-center ${box} rounded-[3px] border-[1.5px] shrink-0 bg-white`}
      style={{ borderColor: color }}
      aria-label={veg ? 'Vegetarian' : 'Non-Vegetarian'}
      title={veg ? 'Veg' : 'Non-Veg'}
    >
      {veg ? (
        <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B2B]" />
      ) : (
        <span
          className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-[#D93B2B]"
        />
      )}
    </span>
  );
};

/* Category Card (Modern Food Delivery Card: Appetizing Photo Header, Floating Badges, Brand Accent, Explore Action) */
export const CategoryCard: React.FC<{
  category: CategoryInfo;
  onClick: () => void;
  compact?: boolean;
}> = ({ category, onClick, compact = false }) => {
  const [imgErr, setImgErr] = React.useState(false);
  const photo = FOOD_IMAGE_MAP[category.image];

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group w-[124px] shrink-0 rounded-[20px] bg-white border border-black/8 hover:border-[#1F6B2B]/40 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_rgba(31,107,43,0.12)] transition-all duration-200 overflow-hidden flex flex-col text-left tap-press cursor-pointer"
      >
        <div
          style={{ backgroundColor: category.tint }}
          className="h-[84px] w-full relative overflow-hidden"
        >
          {photo && !imgErr ? (
            <img
              src={photo}
              alt={category.title}
              referrerPolicy="no-referrer"
              onError={() => setImgErr(true)}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[34px] leading-none" role="img" aria-label={category.title}>
                {category.emoji}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-white/95 backdrop-blur-md shadow-2xs flex items-center justify-center text-[13px] leading-none border border-white/70">
            {category.emoji}
          </div>
        </div>
        <div className="p-2.5 bg-white">
          <div className="text-[12.5px] font-bold text-[#1B1B1B] group-hover:text-[#1F6B2B] transition-colors truncate">
            {category.title}
          </div>
          <div className="text-[10.5px] font-medium text-[#7A3E12] truncate mt-0.5">
            {category.subtitle}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ backgroundColor: category.tint }}
      className="group w-full rounded-[22px] p-3.5 pb-4 flex flex-col items-center text-center shadow-[0_4px_14px_rgba(0,0,0,0.05)] border border-black/5 hover:border-black/15 hover:scale-[1.02] active:scale-95 transition-all duration-200 tap-press cursor-pointer"
    >
      <div className="w-16 h-16 rounded-full bg-white overflow-hidden mb-2.5 shadow-xs border-2 border-white shrink-0">
        {photo && !imgErr ? (
          <img
            src={photo}
            alt={category.title}
            referrerPolicy="no-referrer"
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[28px]">
            {category.emoji}
          </div>
        )}
      </div>

      <div className="text-[13.5px] font-black text-[#1B1B1B] leading-tight truncate w-full">
        {category.title}
      </div>
      <div className="text-[11px] font-semibold text-[#6B6B6B] mt-0.5 truncate w-full">
        {category.subtitle}
      </div>
    </button>
  );
};

/* Quantity Stepper (- 1 +) */
export const QuantityStepper: React.FC<{
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  compact?: boolean;
}> = ({ quantity, onDecrease, onIncrease, compact = false }) => (
  <div
    className={`inline-flex items-center rounded-full bg-[#E3F2DC] border border-[#1F6B2B]/25 shrink-0 ${
      compact ? 'h-[26px]' : 'h-[38px]'
    }`}
    onClick={(e) => e.stopPropagation()}
  >
    <button
      type="button"
      onClick={onDecrease}
      aria-label="Decrease quantity"
      className={`${
        compact ? 'w-[22px]' : 'w-9'
      } h-full flex items-center justify-center text-[#1F6B2B] hover:bg-[#1F6B2B]/10 rounded-l-full cursor-pointer`}
    >
      <Minus size={compact ? 11 : 14} strokeWidth={2.5} />
    </button>
    <span
      className={`${
        compact ? 'px-0.5 min-w-[14px] text-[11.5px]' : 'px-1.5 min-w-[22px] text-[13px]'
      } text-center font-bold text-[#1B1B1B] tabular-nums`}
    >
      {quantity}
    </span>
    <button
      type="button"
      onClick={onIncrease}
      aria-label="Increase quantity"
      className={`${
        compact ? 'w-[22px]' : 'w-9'
      } h-full flex items-center justify-center text-[#1F6B2B] hover:bg-[#1F6B2B]/10 rounded-r-full cursor-pointer`}
    >
      <Plus size={compact ? 11 : 14} strokeWidth={2.5} />
    </button>
  </div>
);

/* Reusable Product Row (Thumbnail, Name, Price, Size, Heart, Green "+") */
export const ProductRow: React.FC<{
  item: MenuItem;
  isFavorite: boolean;
  cartQty: number;
  onToggleFavorite: (id: string) => void;
  onQuickAdd: (item: MenuItem) => void;
  onDecreaseQty?: (item: MenuItem) => void;
  onPress: (item: MenuItem) => void;
  actionLabel?: string;
}> = ({
  item,
  isFavorite,
  cartQty,
  onToggleFavorite,
  onQuickAdd,
  onDecreaseQty,
  onPress,
  actionLabel,
}) => {
  const defaultSize = item.sizeOptions.find((s) => s.isDefault) || item.sizeOptions[0];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPress(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPress(item);
        }
      }}
      className="w-full bg-white rounded-[18px] p-3 flex items-center gap-3 shadow-[0_4px_14px_rgba(0,0,0,0.07)] border border-black/5 tap-press cursor-pointer text-left"
    >
      <FoodArtwork
        imageKey={item.image}
        emoji={item.emoji}
        label={item.name}
        tint={item.tint}
        size="md"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <VegIndicator veg={item.veg} />
          <h3 className="text-[14px] font-semibold text-[#1B1B1B] truncate">{item.name}</h3>
        </div>

        <p className="text-[11.5px] text-[#6B6B6B] truncate mt-0.5">{item.description}</p>

        <div className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B] mt-1">
          <span className="inline-flex items-center gap-0.5 text-[#1B1B1B] font-semibold tabular-nums">
            <Star size={11} className="fill-[#F5B52E] text-[#F5B52E]" />
            {item.rating.toFixed(1)}
          </span>
          <span aria-hidden="true">·</span>
          <span>{defaultSize.label}</span>
          {item.bestseller && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#7A3E12] font-semibold">Bestseller</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[15px] font-semibold text-[#1F6B2B] tabular-nums">
            ₹{defaultSize.price}
          </span>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => onToggleFavorite(item.id)}
              aria-label={isFavorite ? `Remove ${item.name} from favorites` : `Save ${item.name} to favorites`}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 cursor-pointer"
            >
              <Heart
                size={17}
                strokeWidth={1.8}
                className={isFavorite ? 'fill-[#D93B2B] text-[#D93B2B]' : 'text-[#6B6B6B]'}
              />
            </button>

            {actionLabel ? (
              <button
                type="button"
                onClick={() => onPress(item)}
                className="h-9 px-3.5 rounded-full bg-[#1F6B2B] text-white text-[12px] font-semibold tap-press cursor-pointer whitespace-nowrap"
              >
                {actionLabel}
              </button>
            ) : cartQty > 0 && onDecreaseQty ? (
              <QuantityStepper
                compact
                quantity={cartQty}
                onDecrease={() => onDecreaseQty(item)}
                onIncrease={() => onQuickAdd(item)}
              />
            ) : (
              <button
                type="button"
                onClick={() => onQuickAdd(item)}
                aria-label={`Add ${item.name} to cart`}
                className="h-9 px-3.5 rounded-full bg-[#3E9B3F] hover:bg-[#1F6B2B] text-white text-[12px] font-semibold flex items-center gap-1 shadow-xs tap-press cursor-pointer"
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Radio Card */
export const RadioCard: React.FC<{
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle?: string;
  rightText?: string;
  icon?: React.ReactNode;
}> = ({ selected, onSelect, title, subtitle, rightText, icon }) => (
  <button
    type="button"
    onClick={onSelect}
    className={`w-full text-left rounded-[16px] p-3.5 flex items-center gap-3 transition-all tap-press cursor-pointer border ${
      selected
        ? 'bg-[#E3F2DC]/55 border-[#1F6B2B] shadow-xs'
        : 'bg-white border-black/10 hover:border-black/20'
    }`}
  >
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? 'border-[#1F6B2B]' : 'border-[#6B6B6B]/50'
      }`}
    >
      {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#1F6B2B]" />}
    </div>
    {icon && <div className="shrink-0">{icon}</div>}
    <div className="flex-1 min-w-0">
      <div className="text-[14px] font-semibold text-[#1B1B1B]">{title}</div>
      {subtitle && <div className="text-[12px] text-[#6B6B6B] mt-0.5">{subtitle}</div>}
    </div>
    {rightText && (
      <span className="text-[14px] font-semibold text-[#1F6B2B] tabular-nums shrink-0">
        {rightText}
      </span>
    )}
  </button>
);

/* Checkbox Row */
export const CheckboxRow: React.FC<{
  checked: boolean;
  onToggle: () => void;
  label: string;
  rightText?: string;
}> = ({ checked, onToggle, label, rightText }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full min-h-[44px] py-2 px-3 rounded-[14px] bg-white border border-black/8 flex items-center justify-between gap-3 tap-press cursor-pointer text-left"
  >
    <div className="flex items-center gap-3 min-w-0">
      <div
        className={`w-5 h-5 rounded-[6px] border-1.5 flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'bg-[#1F6B2B] border-[#1F6B2B] text-white' : 'border-[#6B6B6B]/50 bg-white'
        }`}
      >
        {checked && <Check size={13} strokeWidth={2.75} />}
      </div>
      <span className="text-[13px] font-medium text-[#1B1B1B] truncate">{label}</span>
    </div>
    {rightText && (
      <span className="text-[13px] font-semibold text-[#1F6B2B] tabular-nums shrink-0">
        {rightText}
      </span>
    )}
  </button>
);

/* Vertical Status Timeline */
export const StatusTimeline: React.FC<{ steps: OrderTimelineStep[] }> = ({ steps }) => (
  <div className="flex flex-col">
    {steps.map((step, idx) => {
      const isLast = idx === steps.length - 1;
      return (
        <div key={step.title} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                step.completed
                  ? 'bg-[#1F6B2B] border-[#1F6B2B] text-white'
                  : step.active
                    ? 'bg-[#F5B52E] border-[#F5B52E] text-[#0B3D1A]'
                    : 'bg-white border-black/20 text-transparent'
              }`}
            >
              {step.completed ? (
                <Check size={13} strokeWidth={2.75} />
              ) : step.active ? (
                <span className="w-2 h-2 rounded-full bg-[#0B3D1A]" />
              ) : null}
            </div>
            {!isLast && (
              <div
                className={`w-[2px] flex-1 min-h-[26px] my-1 ${
                  step.completed ? 'bg-[#1F6B2B]' : 'bg-black/10'
                }`}
              />
            )}
          </div>
          <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-4'}`}>
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[13px] font-semibold ${
                  step.completed || step.active ? 'text-[#1B1B1B]' : 'text-[#6B6B6B]'
                }`}
              >
                {step.title}
              </span>
              <span className="text-[11px] font-medium text-[#6B6B6B] tabular-nums shrink-0">
                {step.time}
              </span>
            </div>
            {step.subtitle && (
              <p className="text-[11px] text-[#6B6B6B] mt-0.5">{step.subtitle}</p>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

/* TopBar (Back Arrow, Centered Title, Optional Right Slot) */
export const TopBar: React.FC<{
  title: string;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  dark?: boolean;
}> = ({ title, onBack, rightSlot, dark = false }) => (
  <header
    className={`h-[54px] shrink-0 px-3 flex items-center justify-between border-b ${
      dark
        ? 'bg-[#0B3D1A] text-white border-white/10'
        : 'bg-[#FBF7EE]/95 backdrop-blur-md text-[#1B1B1B] border-black/5'
    }`}
  >
    <div className="w-11 flex items-center justify-start">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className={`w-11 h-11 rounded-full flex items-center justify-center tap-press cursor-pointer ${
            dark ? 'hover:bg-white/10 text-white' : 'hover:bg-black/5 text-[#1B1B1B]'
          }`}
        >
          <ArrowLeft size={21} strokeWidth={1.85} />
        </button>
      )}
    </div>

    <h1 className="text-[17px] font-semibold truncate text-center flex-1 px-2">{title}</h1>

    <div className="min-w-[44px] flex items-center justify-end gap-1">{rightSlot}</div>
  </header>
);

/* Bottom Tab Bar (5 Tabs: Home, Categories, Cart w/ Red Badge, Orders, Profile) */
export const BottomTabBar: React.FC<{
  activeTab: ScreenName;
  cartCount: number;
  onSelectTab: (screen: ScreenName) => void;
}> = ({ activeTab, cartCount, onSelectTab }) => {
  const tabs: { id: ScreenName; label: string; icon: React.FC<any> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'cart', label: 'Cart', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: ReceiptText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Primary Navigation"
      className="h-[64px] shrink-0 bg-white border-t border-black/8 grid grid-cols-5 items-center px-1 shadow-[0_-4px_14px_rgba(0,0,0,0.04)]"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className="relative h-full flex flex-col items-center justify-center tap-press cursor-pointer"
            aria-label={tab.label}
          >
            <div
              className={`flex flex-col items-center justify-center transition-all ${
                isActive ? 'bg-[#E8F8EA] px-3.5 py-0.5 rounded-full' : 'p-0.5'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.4 : 1.75}
                  className={isActive ? 'text-[#1F6B2B]' : 'text-[#6B6B6B]'}
                />
                {tab.id === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#D93B2B] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
            <span
              className={`text-[10px] whitespace-nowrap mt-0.5 ${
                isActive ? 'text-[#1F6B2B] font-bold' : 'text-[#6B6B6B] font-medium'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

/* Bottom Sheet */
export const BottomSheet: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/45 backdrop-blur-[1px]">
      <div className="flex-1" onClick={onClose} />
      <div className="bg-[#FBF7EE] rounded-t-[26px] max-h-[85%] flex flex-col shadow-2xl animate-sheet-up">
        <div className="pt-2.5 pb-2 px-4 flex flex-col items-center border-b border-black/5 shrink-0">
          <div className="w-10 h-1 rounded-full bg-black/20 mb-2.5" />
          <div className="w-full flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#1B1B1B]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sheet"
              className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
};

/* Centered Modal */
export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px]">
      <div className="w-full max-w-[350px] bg-white rounded-[22px] p-4 shadow-2xl max-h-[85%] flex flex-col animate-sheet-up">
        <div className="flex items-center justify-between pb-2.5 border-b border-black/8 shrink-0">
          <h2 className="text-[16px] font-semibold text-[#1B1B1B]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="pt-3 overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
};

/* Toast Notification */
export const ToastContainer: React.FC<{ toasts: ToastMessage[] }> = ({ toasts }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="absolute top-14 left-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-2xl shadow-lg text-[12.5px] font-medium text-white flex items-center gap-2 animate-sheet-up ${
            t.variant === 'error'
              ? 'bg-[#D93B2B]'
              : t.variant === 'success'
                ? 'bg-[#1F6B2B]'
                : 'bg-[#1B1B1B]'
          }`}
        >
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
};

/* Skeleton Shimmer Loader */
export const SkeletonCard: React.FC = () => (
  <div className="w-full bg-white rounded-[18px] p-3 flex items-center gap-3 border border-black/5">
    <div className="w-20 h-20 rounded-2xl skeleton-shimmer shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
      <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
      <div className="h-4 w-1/4 rounded-md skeleton-shimmer" />
    </div>
  </div>
);

/* Reusable Empty / Error State */
export const EmptyState: React.FC<{
  emoji: string;
  title: string;
  description: string;
  ctaLabel?: string;
  onCta?: () => void;
}> = ({ emoji, title, description, ctaLabel, onCta }) => (
  <div className="flex flex-col items-center justify-center text-center px-6 py-12">
    <div className="w-20 h-20 rounded-full bg-[#FFF1D6] flex items-center justify-center text-4xl mb-4 shadow-xs">
      {emoji}
    </div>
    <h3 className="text-[16px] font-semibold text-[#1B1B1B]">{title}</h3>
    <p className="text-[13px] text-[#6B6B6B] mt-1.5 max-w-[260px] leading-relaxed">{description}</p>
    {ctaLabel && onCta && (
      <div className="mt-5 w-full max-w-[210px]">
        <PrimaryButton onClick={onCta}>{ctaLabel}</PrimaryButton>
      </div>
    )}
  </div>
);

/* Floating 1-Tap Cart Bar for Browse Screens */
export const FloatingCartBar: React.FC<{
  count: number;
  subtotal: number;
  onViewCart: () => void;
}> = ({ count, subtotal, onViewCart }) => {
  if (count <= 0) return null;
  return (
    <div className="shrink-0 px-3 py-2 bg-transparent">
      <div className="w-full h-[52px] pl-4 pr-1.5 rounded-full bg-[#083512] text-white shadow-[0_10px_28px_rgba(8,53,18,0.42)] flex items-center justify-between border border-[#1b5e28]">
        <div className="flex items-center gap-2.5 text-[13.5px] font-black tracking-tight">
          <ShoppingBag size={19} className="text-[#64D97B]" />
          <span className="tabular-nums">
            {count} {count === 1 ? 'item' : 'items'} · ₹{subtotal.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="h-5 w-px bg-white/25 mx-2" />
        <button
          type="button"
          onClick={onViewCart}
          className="h-[38px] px-4 rounded-full bg-gradient-to-r from-[#F7BA2A] to-[#E59E10] hover:from-[#f8c344] hover:to-[#eaab26] text-[#083512] text-[12.5px] font-black flex items-center gap-1.5 tap-press cursor-pointer shrink-0 transition-transform active:scale-95 shadow-[0_2px_10px_rgba(247,186,42,0.4)]"
        >
          <span>View Cart</span>
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

