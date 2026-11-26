import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Edit3,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import {
  CATERING_EVENTS,
  CATERING_MENU_ITEMS,
  CATERING_PACKAGES,
  CateringMenuItem,
} from '../data/mockData';
import { CateringQuote, OrderTimelineStep, QuoteStatus } from '../types';
import { CATERING_BANNER_PHOTO } from '../components/BrandAssets';
import {
  EmptyState,
  FilterChip,
  GoldButton,
  OutlineButton,
  PrimaryButton,
  StatusTimeline,
  TopBar,
} from '../components/UI';

const MENU_CATEGORIES: CateringMenuItem['category'][] = [
  'Starters & Drinks',
  'Curries & Dal',
  'Biryani & Rice',
  'Breads & Sides',
  'Sweets & Live',
];

const PACKAGE_DEFAULT_DISHES: Record<string, string[]> = {
  silver: [
    'Fresh Lime & Mint Cooler',
    'Paneer Butter Masala',
    'Dal Tadka & Pulihora',
    'Veg Dum Biryani',
    'Phulka, Butter Naan & Papad',
    'Ghee Bobbatlu & Double Ka Meetha',
  ],
  gold: [
    'Fresh Lime & Mint Cooler',
    'Crispy Paneer 65 / Manchurian',
    'Paneer Butter Masala',
    'Andhra Chicken Curry',
    'Hyderabadi Chicken Dum Biryani',
    'Baghara Rice, Sambar & Steamed Rice',
    'Phulka, Butter Naan & Papad',
    'Hot Gulab Jamun & Vanilla Ice Cream',
  ],
  platinum: [
    'Fresh Lime & Mint Cooler',
    'Live Mirchi Bajji & Chaat Counter',
    'Andhra Pepper Chicken Fry',
    'Paneer Butter Masala',
    'Mutton Rogan Josh / Curry',
    'Royal Mutton Dum Biryani',
    'Veg Dum Biryani',
    'Phulka, Butter Naan & Papad',
    'Ghee Bobbatlu & Double Ka Meetha',
    'Live Dosa & Appam Counter',
  ],
};

/* Screen 7: Catering Services — Step 1: Select Items Needed First */
export const CateringServicesScreen: React.FC<{
  onBack: () => void;
  onStartQuote: (payload: {
    selectedDishes: string[];
    perPlateEstimate: number;
    packageId?: string;
    dietPreference: 'Veg' | 'Non-Veg' | 'Both';
  }) => void;
  onViewBookings: () => void;
  bookingsCount: number;
  showToast?: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({ onBack, onStartQuote, onViewBookings, bookingsCount, showToast }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'cat-paneer-bm',
    'cat-veg-biryani',
    'cat-bobbatlu',
  ]);
  const [activePackageId, setActivePackageId] = useState<string | undefined>(undefined);
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg' | 'selected'>('all');

  const selectedItems = useMemo(
    () => CATERING_MENU_ITEMS.filter((item) => selectedIds.includes(item.id)),
    [selectedIds]
  );

  const selectedDishNames = useMemo(
    () => selectedItems.map((i) => i.name),
    [selectedItems]
  );

  // Calculate per-plate price from selected items (minimum base ₹199/plate if custom)
  const rawPerPlate = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.pricePerPlate, 0),
    [selectedItems]
  );

  const activePkg = CATERING_PACKAGES.find((p) => p.id === activePackageId);
  const estimatedPerPlate = activePkg
    ? activePkg.pricePerPlate
    : selectedItems.length > 0
      ? Math.max(199, rawPerPlate)
      : 0;

  const toggleItem = (id: string) => {
    setActivePackageId(undefined);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const applyPackagePreset = (pkgId: string) => {
    const names = PACKAGE_DEFAULT_DISHES[pkgId] || [];
    const matchedIds = CATERING_MENU_ITEMS.filter((m) => names.includes(m.name)).map((m) => m.id);
    setSelectedIds(matchedIds);
    setActivePackageId(pkgId);
  };

  const inferredDiet: 'Veg' | 'Non-Veg' | 'Both' = useMemo(() => {
    if (selectedItems.length === 0) return 'Veg';
    const hasVeg = selectedItems.some((i) => i.isVeg);
    const hasNonVeg = selectedItems.some((i) => !i.isVeg);
    if (hasVeg && hasNonVeg) return 'Both';
    return hasNonVeg ? 'Non-Veg' : 'Veg';
  }, [selectedItems]);

  const filteredItems = useMemo(() => {
    return CATERING_MENU_ITEMS.filter((item) => {
      if (dietFilter === 'veg') return item.isVeg;
      if (dietFilter === 'nonveg') return !item.isVeg;
      if (dietFilter === 'selected') return selectedIds.includes(item.id);
      return true;
    });
  }, [dietFilter, selectedIds]);

  const handleProceed = () => {
    if (selectedItems.length === 0) {
      showToast?.('Please select at least 1 item to proceed', 'error');
      return;
    }
    onStartQuote({
      selectedDishes: selectedDishNames,
      perPlateEstimate: estimatedPerPlate,
      packageId: activePackageId,
      dietPreference: inferredDiet,
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar
        title="Catering Services"
        onBack={onBack}
        rightSlot={
          <button
            type="button"
            onClick={onViewBookings}
            className="px-2.5 h-8 rounded-full bg-[#E3F2DC] text-[#1F6B2B] text-[11.5px] font-semibold cursor-pointer whitespace-nowrap"
          >
            Bookings ({bookingsCount})
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-28">
        {/* Compact Hero Banner */}
        <div className="relative rounded-[20px] overflow-hidden min-h-[130px] flex flex-col justify-end p-4 text-white shadow-[0_6px_20px_rgba(11,61,26,0.2)] bg-[#0B3D1A]">
          <img
            src={CATERING_BANNER_PHOTO}
            alt="Swastik Wedding and Event Catering Buffet"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B3D1A]/95 via-[#0B3D1A]/75 to-[#0B3D1A]/30" />
          <div className="relative z-10">
            <span className="text-[10.5px] font-semibold text-[#F5B52E] uppercase tracking-wider">
              Swastik Event Catering · 20 to 1,000+ Guests
            </span>
            <h2 className="text-[17px] font-bold leading-snug mt-0.5">
              Build Your Custom Catering Menu
            </h2>
            <p className="text-[11.5px] text-white/85 mt-0.5">
              First pick the dishes you need below, then enter your event &amp; guest details.
            </p>
          </div>
        </div>

        {/* 2-Step Indicator */}
        <div className="flex items-center gap-2 bg-white rounded-[14px] px-3 py-2.5 border border-black/5 shadow-2xs">
          <div className="flex items-center gap-1.5 flex-1">
            <span className="w-5 h-5 rounded-full bg-[#137A33] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <span className="text-[12px] font-bold text-[#113B1C] truncate">
              Select Menu Items
            </span>
          </div>
          <ArrowRight size={13} className="text-[#888] shrink-0" />
          <div className="flex items-center gap-1.5 flex-1 justify-end opacity-60">
            <span className="w-5 h-5 rounded-full bg-black/10 text-[#1B1B1B] text-[11px] font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <span className="text-[11.5px] font-semibold text-[#666] truncate">
              Event &amp; Pricing
            </span>
          </div>
        </div>

        {/* Quick Package Presets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13.5px] font-bold text-[#1B1B1B] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#E6A217]" />
              Quick Package Presets (Optional)
            </h3>
            {activePackageId && (
              <button
                type="button"
                onClick={() => {
                  setActivePackageId(undefined);
                  setSelectedIds([]);
                }}
                className="text-[11px] font-semibold text-[#D93B2B] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {CATERING_PACKAGES.map((pkg) => {
              const isSelected = activePackageId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => applyPackagePreset(pkg.id)}
                  style={{ backgroundColor: pkg.tint }}
                  className={`w-[170px] shrink-0 rounded-[16px] p-3 text-left border-2 transition-all cursor-pointer tap-press ${
                    isSelected ? 'border-[#1F6B2B] shadow-sm' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[12.5px] font-bold text-[#1B1B1B] truncate">
                      {pkg.name.split(' ')[0]}
                    </span>
                    <span className="text-[12px] font-black text-[#1F6B2B] tabular-nums">
                      ₹{pkg.pricePerPlate}/pl
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#555] line-clamp-2 mt-1 leading-snug">
                    {pkg.highlights.slice(0, 2).join(' · ')}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 1: Menu Item Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#1B1B1B]">
              Select Items You Need
            </h3>
            <span className="text-[11.5px] font-semibold text-[#1F6B2B] bg-[#E3F2DC] px-2.5 py-0.5 rounded-full">
              {selectedIds.length} selected
            </span>
          </div>

          {/* Diet & View Filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <FilterChip active={dietFilter === 'all'} onClick={() => setDietFilter('all')}>
              All Items
            </FilterChip>
            <FilterChip active={dietFilter === 'veg'} onClick={() => setDietFilter('veg')}>
              Veg Only
            </FilterChip>
            <FilterChip active={dietFilter === 'nonveg'} onClick={() => setDietFilter('nonveg')}>
              Non-Veg
            </FilterChip>
            <FilterChip
              active={dietFilter === 'selected'}
              onClick={() => setDietFilter('selected')}
            >
              Selected ({selectedIds.length})
            </FilterChip>
          </div>

          {/* Categorized Items List */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-[18px] p-6 text-center border border-black/5">
              <UtensilsCrossed size={24} className="mx-auto text-[#999] mb-2" />
              <p className="text-[13px] font-semibold text-[#1B1B1B]">No items in this filter</p>
              <button
                type="button"
                onClick={() => setDietFilter('all')}
                className="mt-2 text-[12px] font-bold text-[#1F6B2B] cursor-pointer"
              >
                Show All Items
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {MENU_CATEGORIES.map((category) => {
                const catItems = filteredItems.filter((item) => item.category === category);
                if (catItems.length === 0) return null;
                return (
                  <div key={category} className="space-y-2">
                    <h4 className="text-[12.5px] font-extrabold uppercase tracking-wide text-[#7A3E12]">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {catItems.map((item) => {
                        const checked = selectedIds.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className={`w-full rounded-[16px] p-3 text-left flex items-center justify-between gap-3 border transition-all cursor-pointer tap-press ${
                              checked
                                ? 'bg-[#E9F6E3] border-[#1F6B2B] shadow-2xs'
                                : 'bg-white border-black/6 hover:border-black/15'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              {/* Veg / Non-veg dot */}
                              <span
                                className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center shrink-0 mt-1 ${
                                  item.isVeg ? 'border-[#1F6B2B]' : 'border-[#C62828]'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.isVeg ? 'bg-[#1F6B2B]' : 'bg-[#C62828]'
                                  }`}
                                />
                              </span>
                              <div className="min-w-0">
                                <div className="text-[13.5px] font-bold text-[#1B1B1B] leading-snug">
                                  {item.name}
                                </div>
                                <div className="text-[11px] text-[#666] line-clamp-1 mt-0.5">
                                  {item.description}
                                </div>
                                <div className="text-[11.5px] font-extrabold text-[#1F6B2B] mt-1 tabular-nums">
                                  +₹{item.pricePerPlate}/plate
                                </div>
                              </div>
                            </div>

                            <div
                              className={`h-8 px-3 rounded-full text-[11.5px] font-bold flex items-center gap-1 shrink-0 transition-all ${
                                checked
                                  ? 'bg-[#1F6B2B] text-white'
                                  : 'bg-[#F5F0E6] text-[#1B1B1B]'
                              }`}
                            >
                              {checked ? (
                                <>
                                  <Check size={13} strokeWidth={3} />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={13} strokeWidth={2.5} />
                                  <span>Add</span>
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Proceed CTA */}
      <div className="shrink-0 bg-white border-t border-black/8 px-4 py-3 shadow-[0_-4px_14px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11.5px] font-semibold text-[#666]">
              {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
            </div>
            <div className="text-[15px] font-black text-[#1B1B1B] tabular-nums">
              {selectedIds.length > 0 ? `Est. ₹${estimatedPerPlate}/plate` : 'Pick items above'}
            </div>
          </div>
          <button
            type="button"
            onClick={handleProceed}
            className={`h-11 px-4 rounded-full font-bold text-[13px] inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer tap-press ${
              selectedIds.length > 0
                ? 'bg-[#F5B52E] hover:bg-[#E6A217] text-[#1B1B1B]'
                : 'bg-black/10 text-[#777]'
            }`}
          >
            <span>Event Details</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* Screen 18: Catering Quote Request Form — Step 2: Event, Guests & Pricing */
export const CateringQuoteFormScreen: React.FC<{
  initialEventType?: string;
  initialPackageId?: string;
  initialSelectedDishes?: string[];
  initialPerPlate?: number;
  initialDietPreference?: 'Veg' | 'Non-Veg' | 'Both';
  defaultAddress: string;
  onBack: () => void;
  onSubmitQuote: (quote: CateringQuote) => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({
  initialEventType = 'Weddings',
  initialPackageId,
  initialSelectedDishes,
  initialPerPlate,
  initialDietPreference = 'Both',
  defaultAddress,
  onBack,
  onSubmitQuote,
  showToast,
}) => {
  const [eventType, setEventType] = useState(initialEventType);
  const [eventDate, setEventDate] = useState('2026-12-12');
  const [eventTime, setEventTime] = useState('12:30 PM');
  const [venueAddress, setVenueAddress] = useState(defaultAddress);
  const [contactPhone, setContactPhone] = useState('+91 98480 12345');
  const [guestCount, setGuestCount] = useState(50);
  const [serviceStyle, setServiceStyle] = useState<
    'Full Buffet Setup' | 'Live Counters + Crew' | 'Bulk Hot-Box Delivery'
  >('Full Buffet Setup');
  const [dietPreference, setDietPreference] = useState<'Veg' | 'Non-Veg' | 'Both'>(
    initialDietPreference
  );
  const [selectedDishes, setSelectedDishes] = useState<string[]>(
    initialSelectedDishes && initialSelectedDishes.length > 0
      ? initialSelectedDishes
      : ['Paneer Butter Masala', 'Veg Dum Biryani', 'Ghee Bobbatlu & Double Ka Meetha']
  );
  const [customNotes, setCustomNotes] = useState('');

  const activePkg = initialPackageId
    ? CATERING_PACKAGES.find((p) => p.id === initialPackageId)
    : undefined;

  // Compute per-plate estimate from selected items or preset
  const perPlateEstimate = useMemo(() => {
    if (activePkg) return activePkg.pricePerPlate;
    if (initialPerPlate && initialPerPlate > 0 && selectedDishes.length === initialSelectedDishes?.length) {
      return initialPerPlate;
    }
    const matchedTotal = CATERING_MENU_ITEMS.filter((m) =>
      selectedDishes.includes(m.name)
    ).reduce((sum, m) => sum + m.pricePerPlate, 0);
    return selectedDishes.length > 0 ? Math.max(199, matchedTotal) : 349;
  }, [activePkg, initialPerPlate, initialSelectedDishes, selectedDishes]);

  const serviceCharge =
    serviceStyle === 'Bulk Hot-Box Delivery'
      ? 0
      : serviceStyle === 'Live Counters + Crew'
        ? guestCount >= 100
          ? 6500
          : 4000
        : guestCount >= 100
          ? 4500
          : 2500;

  const foodSubtotal = perPlateEstimate * guestCount;
  const totalEstimate = foodSubtotal + serviceCharge;
  const advanceAmount = Math.round(totalEstimate * 0.3);

  const removeDish = (dish: string) => {
    if (selectedDishes.length <= 1) {
      showToast('Keep at least 1 dish or go back to add more', 'info');
      return;
    }
    setSelectedDishes((prev) => prev.filter((d) => d !== dish));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDishes.length === 0) {
      showToast('Please select at least one menu dish', 'error');
      return;
    }
    if (!venueAddress.trim()) {
      showToast('Please enter the event venue address', 'error');
      return;
    }
    if (guestCount < 15) {
      showToast('Minimum guest count for catering is 15', 'error');
      return;
    }
    const notesWithMeta = [
      `Service: ${serviceStyle}`,
      contactPhone.trim() ? `Phone: ${contactPhone.trim()}` : '',
      customNotes.trim(),
    ]
      .filter(Boolean)
      .join(' · ');

    const newQuote: CateringQuote = {
      id: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
      eventType,
      eventDate,
      eventTime,
      venueAddress: venueAddress.trim(),
      guestCount,
      dietPreference,
      packageId: activePkg?.id || 'custom',
      packageName: activePkg?.name || `Custom Menu (${selectedDishes.length} items)`,
      selectedDishes,
      customNotes: notesWithMeta,
      status: 'Requested',
      createdAt: 'Today',
      perPlateEstimate,
      serviceCharge,
      totalEstimate,
      advanceAmount,
      balanceAmount: totalEstimate - advanceAmount,
    };
    onSubmitQuote(newQuote);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title="Event & Price Details" onBack={onBack} />
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24">
        {/* 2-Step Indicator */}
        <div className="flex items-center gap-2 bg-white rounded-[14px] px-3 py-2.5 border border-black/5 shadow-2xs">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 flex-1 text-left cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-[#E3F2DC] text-[#1F6B2B] text-[11px] font-bold flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={3} />
            </span>
            <span className="text-[11.5px] font-semibold text-[#1F6B2B] truncate">
              Menu ({selectedDishes.length})
            </span>
          </button>
          <ArrowRight size={13} className="text-[#888] shrink-0" />
          <div className="flex items-center gap-1.5 flex-1 justify-end">
            <span className="w-5 h-5 rounded-full bg-[#137A33] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <span className="text-[12px] font-bold text-[#113B1C] truncate">
              Event &amp; Price
            </span>
          </div>
        </div>

        {/* Selected Items Summary */}
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#1B1B1B]">
              Selected Menu Items ({selectedDishes.length})
            </h3>
            <button
              type="button"
              onClick={onBack}
              className="text-[12px] font-semibold text-[#1F6B2B] inline-flex items-center gap-1 cursor-pointer"
            >
              <Edit3 size={12} />
              <span>Edit Items</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedDishes.map((dish) => (
              <span
                key={dish}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E3F2DC] text-[#113B1C] text-[11.5px] font-semibold"
              >
                <span>{dish}</span>
                <button
                  type="button"
                  onClick={() => removeDish(dish)}
                  aria-label={`Remove ${dish}`}
                  className="text-[#1F6B2B] hover:text-[#D93B2B] font-bold cursor-pointer leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Event Type Selection */}
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 space-y-2.5">
          <label className="text-[13.5px] font-bold text-[#1B1B1B] block">
            Select Event Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATERING_EVENTS.map((evt) => {
              const active = eventType === evt.label;
              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => setEventType(evt.label)}
                  style={{ backgroundColor: evt.tint }}
                  className={`rounded-[14px] p-2.5 flex flex-col items-center text-center tap-press cursor-pointer border-2 transition-all ${
                    active ? 'border-[#1F6B2B] shadow-xs' : 'border-transparent'
                  }`}
                >
                  <span className="text-xl mb-0.5">{evt.emoji}</span>
                  <span className="text-[11px] font-semibold text-[#1B1B1B] leading-tight">
                    {evt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date, Time & Venue */}
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-semibold text-[#1B1B1B] flex items-center gap-1 mb-1">
                <Calendar size={12} /> Event Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                className="w-full h-11 rounded-[12px] border border-black/15 px-2.5 text-[12.5px] bg-[#FBF7EE]/60"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-[#1B1B1B] flex items-center gap-1 mb-1">
                <Clock size={12} /> Serving Time
              </label>
              <select
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full h-11 rounded-[12px] border border-black/15 px-2.5 text-[12.5px] bg-[#FBF7EE]/60"
              >
                <option value="08:30 AM">08:30 AM (Breakfast)</option>
                <option value="12:30 PM">12:30 PM (Lunch)</option>
                <option value="04:30 PM">04:30 PM (High Tea)</option>
                <option value="07:30 PM">07:30 PM (Dinner)</option>
                <option value="08:30 PM">08:30 PM (Late Dinner)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#1B1B1B] flex items-center gap-1 mb-1">
              <MapPin size={12} /> Venue Address
            </label>
            <textarea
              rows={2}
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              className="w-full rounded-[12px] border border-black/15 p-2.5 text-[12.5px] bg-[#FBF7EE]/60 outline-none"
              placeholder="Function hall / apartment clubhouse / home address"
            />
          </div>

          <div>
            <label className="text-[12px] font-semibold text-[#1B1B1B] block mb-1">
              Contact Phone Number
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+91 98480 12345"
              className="w-full h-10 rounded-[12px] border border-black/15 px-3 text-[12.5px] bg-[#FBF7EE]/60 outline-none"
            />
          </div>
        </div>

        {/* Number of People (Guest Count), Service Style & Diet */}
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#1F6B2B]" />
              <div>
                <span className="text-[14px] font-bold text-[#1B1B1B] block">
                  Number of People
                </span>
                <span className="text-[10.5px] text-[#666]">Min 15 guests</span>
              </div>
            </div>
            <div className="inline-flex items-center rounded-full bg-[#E3F2DC] h-10 px-1">
              <button
                type="button"
                onClick={() => setGuestCount((g) => Math.max(15, g - 10))}
                aria-label="Decrease guests"
                className="w-8 h-full flex items-center justify-center text-[#1F6B2B] cursor-pointer"
              >
                <Minus size={15} />
              </button>
              <input
                type="number"
                min={15}
                max={2000}
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 15))}
                aria-label="Number of guests"
                className="w-14 text-center text-[14px] font-bold text-[#1B1B1B] bg-transparent outline-none tabular-nums"
              />
              <button
                type="button"
                onClick={() => setGuestCount((g) => g + 10)}
                aria-label="Increase guests"
                className="w-8 h-full flex items-center justify-center text-[#1F6B2B] cursor-pointer"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Quick guest count chips */}
          <div className="flex gap-1.5 flex-wrap">
            {[30, 50, 100, 200, 500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setGuestCount(preset)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer border transition-all ${
                  guestCount === preset
                    ? 'bg-[#1F6B2B] text-white border-[#1F6B2B]'
                    : 'bg-[#FBF7EE] text-[#1B1B1B] border-black/10'
                }`}
              >
                {preset} Guests
              </button>
            ))}
          </div>

          <div>
            <span className="text-[12px] font-semibold text-[#1B1B1B] block mb-1.5">
              Service Type
            </span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {(
                ['Full Buffet Setup', 'Live Counters + Crew', 'Bulk Hot-Box Delivery'] as const
              ).map((style) => (
                <FilterChip
                  key={style}
                  active={serviceStyle === style}
                  onClick={() => setServiceStyle(style)}
                >
                  {style}
                </FilterChip>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[12px] font-semibold text-[#1B1B1B] block mb-1.5">
              Menu Preference
            </span>
            <div className="flex gap-2">
              {(['Veg', 'Non-Veg', 'Both'] as const).map((pref) => (
                <FilterChip
                  key={pref}
                  active={dietPreference === pref}
                  onClick={() => setDietPreference(pref)}
                >
                  {pref}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Requirements */}
        <div className="bg-white rounded-[18px] p-4 border border-black/5">
          <label className="text-[12px] font-semibold text-[#1B1B1B] block mb-1">
            Other Requirements &amp; Notes
          </label>
          <textarea
            rows={2}
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            placeholder="E.g., Banana leaf service, Jain / no-onion-garlic counter, extra serving staff..."
            className="w-full rounded-[12px] border border-black/15 p-2.5 text-[12.5px] bg-[#FBF7EE]/60 outline-none"
          />
        </div>

        {/* Price Breakdown */}
        <div className="rounded-[18px] bg-[#E3F2DC] p-4 space-y-2 border border-[#1F6B2B]/15">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-[#0B3D1A]">
              Menu ({guestCount} guests × ₹{perPlateEstimate}/pl)
            </span>
            <span className="text-[13px] font-bold text-[#0B3D1A] tabular-nums">
              ₹{foodSubtotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#1F6B2B]">
              {serviceStyle === 'Bulk Hot-Box Delivery'
                ? 'Hot-Box Delivery (Free Setup)'
                : `${serviceStyle} & Crew`}
            </span>
            <span className="text-[12.5px] font-semibold text-[#0B3D1A] tabular-nums">
              {serviceCharge === 0 ? 'FREE' : `₹${serviceCharge.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="h-px bg-[#1F6B2B]/15" />
          <div className="flex items-center justify-between pt-0.5">
            <div>
              <div className="text-[13px] font-bold text-[#0B3D1A]">Estimated Total Price</div>
              <div className="text-[11px] text-[#1F6B2B]">
                30% Advance: ₹{advanceAmount.toLocaleString('en-IN')} · 70% on Event Day
              </div>
            </div>
            <div className="text-[18px] font-black text-[#0B3D1A] tabular-nums">
              ₹{totalEstimate.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <PrimaryButton type="submit">Submit Catering Request</PrimaryButton>
      </form>
    </div>
  );
};

/* Screen 19A: Catering Bookings List */
export const CateringBookingsScreen: React.FC<{
  quotes: CateringQuote[];
  onBack: () => void;
  onSelectQuote: (quoteId: string) => void;
  onNewQuote: () => void;
}> = ({ quotes, onBack, onSelectQuote, onNewQuote }) => (
  <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
    <TopBar title="Catering Bookings" onBack={onBack} />
    <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3.5">
      {quotes.length === 0 ? (
        <EmptyState
          emoji="🍽️"
          title="No Catering Quotes Yet"
          description="Request a tailored menu quote for weddings, birthdays, or corporate events."
          ctaLabel="Get Catering Quote"
          onCta={onNewQuote}
        />
      ) : (
        quotes.map((q) => (
          <div
            key={q.id}
            onClick={() => onSelectQuote(q.id)}
            className="bg-white rounded-[18px] p-4 shadow-[0_4px_14px_rgba(0,0,0,0.07)] border border-black/5 tap-press cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-[#7A3E12] tabular-nums">
                #{q.id} · {q.eventType}
              </span>
              <span
                className={`text-[11.5px] font-semibold ${
                  q.status === 'Completed' || q.status === 'Advance Paid'
                    ? 'text-[#1F6B2B]'
                    : 'text-[#D93B2B]'
                }`}
              >
                {q.status}
              </span>
            </div>

            <h3 className="text-[15px] font-semibold text-[#1B1B1B] mt-1">{q.packageName}</h3>
            <p className="text-[12px] text-[#6B6B6B] mt-0.5">
              {q.eventDate} at {q.eventTime} · {q.guestCount} guests ({q.dietPreference})
            </p>

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black/6">
              <span className="text-[14px] font-bold text-[#1F6B2B] tabular-nums">
                Est. ₹{q.totalEstimate.toLocaleString('en-IN')}
              </span>
              <span className="text-[12px] font-semibold text-[#1F6B2B] inline-flex items-center gap-1">
                <span>
                  {q.status === 'Quote Sent'
                    ? 'Pay Advance'
                    : q.status === 'Advance Paid'
                      ? 'Pay Balance'
                      : 'View Status'}
                </span>
                <ArrowRight size={13} />
              </span>
            </div>
          </div>
        ))
      )}

      {quotes.length > 0 && (
        <div className="pt-2">
          <OutlineButton onClick={onNewQuote}>+ Request Another Catering Quote</OutlineButton>
        </div>
      )}
    </div>
  </div>
);

/* Screen 19B: Catering Quote Detail & Advance/Balance Payment */
const QUOTE_STAGES: QuoteStatus[] = [
  'Requested',
  'Quote Sent',
  'Confirmed',
  'Advance Paid',
  'Completed',
];

export const CateringQuoteDetailScreen: React.FC<{
  quote: CateringQuote;
  onBack: () => void;
  onSimulateQuoteSent: (quoteId: string) => void;
  onPayAdvance: (quote: CateringQuote) => void;
  onPayBalance: (quote: CateringQuote) => void;
}> = ({ quote, onBack, onSimulateQuoteSent, onPayAdvance, onPayBalance }) => {
  const currentIdx = QUOTE_STAGES.indexOf(quote.status);

  const steps: OrderTimelineStep[] = QUOTE_STAGES.map((st, idx) => ({
    title: st,
    time: idx <= currentIdx ? (idx === 0 ? quote.createdAt : 'Updated') : 'Pending',
    completed: idx < currentIdx || quote.status === 'Completed',
    active: idx === currentIdx && quote.status !== 'Completed',
    subtitle:
      st === 'Quote Sent' && idx === currentIdx
        ? `Pay 30% advance (₹${quote.advanceAmount.toLocaleString('en-IN')}) to confirm`
        : st === 'Advance Paid' && idx === currentIdx
          ? `Balance ₹${quote.balanceAmount.toLocaleString('en-IN')} due before event`
          : undefined,
  }));

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FBF7EE]">
      <TopBar title={`Quote #${quote.id}`} onBack={onBack} />

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24">
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[#1B1B1B]">{quote.eventType}</h2>
            <span className="text-[12px] font-semibold text-[#1F6B2B]">{quote.status}</span>
          </div>
          <p className="text-[12.5px] text-[#6B6B6B] mt-1">
            {quote.eventDate} at {quote.eventTime} · {quote.guestCount} Guests ({quote.dietPreference})
          </p>
          <p className="text-[12px] text-[#6B6B6B] mt-1">{quote.venueAddress}</p>
        </div>

        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5">
          <h3 className="text-[14px] font-semibold text-[#1B1B1B] mb-3">Booking Status</h3>
          <StatusTimeline steps={steps} />
        </div>

        {/* Itemized Estimate */}
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5 space-y-2">
          <h3 className="text-[14px] font-semibold text-[#1B1B1B]">Itemized Estimate</h3>
          <div className="flex justify-between text-[12.5px] text-[#6B6B6B]">
            <span>
              {quote.packageName} ({quote.guestCount} × ₹{quote.perPlateEstimate})
            </span>
            <span className="text-[#1B1B1B] font-medium tabular-nums">
              ₹{(quote.guestCount * quote.perPlateEstimate).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-[12.5px] text-[#6B6B6B]">
            <span>Service Crew &amp; Chafing Setup</span>
            <span className="text-[#1B1B1B] font-medium tabular-nums">
              ₹{quote.serviceCharge.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="h-px bg-black/8 my-1" />
          <div className="flex justify-between text-[14px] font-semibold text-[#1B1B1B]">
            <span>Total Estimate</span>
            <span className="text-[#1F6B2B] tabular-nums">
              ₹{quote.totalEstimate.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-[12.5px] text-[#7A3E12]">
            <span>30% Advance Booking Amount</span>
            <span className="font-semibold tabular-nums">
              ₹{quote.advanceAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-[12.5px] text-[#6B6B6B]">
            <span>70% Remaining Balance</span>
            <span className="font-semibold tabular-nums">
              ₹{quote.balanceAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Selected Dishes */}
        <div className="bg-white rounded-[18px] p-4 shadow-xs border border-black/5">
          <h3 className="text-[14px] font-semibold text-[#1B1B1B] mb-2">Selected Dishes</h3>
          <ul className="space-y-1 text-[12.5px] text-[#6B6B6B]">
            {quote.selectedDishes.map((d) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Footer */}
      <div className="shrink-0 bg-white border-t border-black/8 px-4 py-3 shadow-[0_-4px_14px_rgba(0,0,0,0.06)]">
        {quote.status === 'Requested' && (
          <OutlineButton onClick={() => onSimulateQuoteSent(quote.id)}>
            Simulate Manager Sending Quote
          </OutlineButton>
        )}
        {(quote.status === 'Quote Sent' || quote.status === 'Confirmed') && (
          <PrimaryButton onClick={() => onPayAdvance(quote)}>
            Pay 30% Advance · ₹{quote.advanceAmount.toLocaleString('en-IN')}
          </PrimaryButton>
        )}
        {quote.status === 'Advance Paid' && (
          <GoldButton onClick={() => onPayBalance(quote)}>
            Pay Remaining Balance · ₹{quote.balanceAmount.toLocaleString('en-IN')}
          </GoldButton>
        )}
        {quote.status === 'Completed' && (
          <div className="text-center text-[13px] font-semibold text-[#1F6B2B] py-2">
            Full Catering Payment Completed ✓
          </div>
        )}
      </div>
    </div>
  );
};
