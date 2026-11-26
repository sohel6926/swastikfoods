export type ScreenName =
  | 'splash'
  | 'login'
  | 'otp'
  | 'signup'
  | 'home'
  | 'categories'
  | 'curries'
  | 'home-foods'
  | 'category-items'
  | 'product-detail'
  | 'bulk-order'
  | 'catering'
  | 'catering-quote'
  | 'catering-bookings'
  | 'catering-quote-detail'
  | 'upcoming-events'
  | 'cart'
  | 'checkout'
  | 'payment'
  | 'order-placed'
  | 'track-order'
  | 'orders'
  | 'order-details'
  | 'rating'
  | 'profile'
  | 'addresses'
  | 'wallet'
  | 'support'
  | 'notifications'
  | 'search'
  | 'favorites';

export interface RouteEntry {
  screen: ScreenName;
  params?: Record<string, any>;
}

export interface SizeOption {
  label: string;
  price: number;
  isDefault?: boolean;
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
}

export type CategoryId =
  | 'home-foods'
  | 'curries'
  | 'biryani'
  | 'catering'
  | 'tiffins'
  | 'snacks'
  | 'combos'
  | 'sweets';

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  veg: boolean;
  description: string;
  ingredients?: string[];
  rating: number;
  reviews: string;
  bestseller?: boolean;
  sizeOptions: SizeOption[];
  addons: AddonOption[];
  image: string;
  emoji: string;
  tint: 'peach' | 'cream' | 'green';
  supportsBulk?: boolean;
  isSpecial?: boolean;
}

export interface HeroBanner {
  id: string;
  title: string;
  bannerImage: string;
  target: ScreenName;
  active: boolean;
}

export interface StorefrontContent {
  contactUs: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    hours: string;
    supportNote: string;
  };
  termsAndConditions: string;
  privacyPolicy: string;
}

export interface CustomerDirectoryEntry {
  id: string;
  name: string;
  phone: string;
  area: string;
}

export interface CategoryInfo {
  id: CategoryId;
  title: string;
  subtitle: string;
  tint: string;
  emoji: string;
  image: string;
}

export interface CartItem {
  cartKey: string;
  item: MenuItem;
  sizeLabel: string;
  unitPrice: number;
  addons: AddonOption[];
  quantity: number;
  isBulk?: boolean;
  bulkPlates?: number;
  bulkDate?: string;
  bulkTime?: string;
  bulkInstructions?: string;
}

export interface Address {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  label: string;
  fullAddress: string;
  landmark: string;
  distanceKm: number;
  isDefault: boolean;
}

export type OrderTrackingType = 'own-vehicle' | 'third-party';

export type OrderStage =
  | 'Placed'
  | 'Accepted'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderTimelineStep {
  title: string;
  time: string;
  completed: boolean;
  active?: boolean;
  subtitle?: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  dateLabel: string;
  itemsSummary: string;
  items: CartItem[];
  itemTotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  address: Address;
  deliverySlot: string;
  stage: OrderStage;
  eta: string;
  trackingType: OrderTrackingType;
  thirdPartyPartner?: string;
  thirdPartyTrackingCode?: string;
  riderName?: string;
  riderRating?: number;
  riderPhone?: string;
  ratingSubmitted?: {
    stars: number;
    tags: string[];
    comment: string;
  };
}

export type QuoteStatus =
  | 'Requested'
  | 'Quote Sent'
  | 'Confirmed'
  | 'Advance Paid'
  | 'Completed';

export interface CateringQuote {
  id: string;
  eventType: string;
  eventDate: string;
  eventTime: string;
  venueAddress: string;
  guestCount: number;
  dietPreference: 'Veg' | 'Non-Veg' | 'Both';
  packageId: string;
  packageName: string;
  selectedDishes: string[];
  customNotes: string;
  status: QuoteStatus;
  createdAt: string;
  perPlateEstimate: number;
  serviceCharge: number;
  totalEstimate: number;
  advanceAmount: number;
  balanceAmount: number;
}

export interface CateringPackage {
  id: string;
  name: string;
  pricePerPlate: number;
  tagline: string;
  highlights: string[];
  tint: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  subtitle: string;
  dateRange: string;
  offerBadge: string;
  priceLabel: string;
  basePrice: number;
  veg: boolean;
  emoji: string;
  tint: string;
  description: string;
  isCatering?: boolean;
}

export type CouponScope =
  | 'all'
  | 'individual'
  | 'selected_people'
  | 'selected_products'
  | 'selected_categories';

export interface Coupon {
  id?: string;
  code: string;
  title: string;
  description: string;
  discountAmount: number;
  minOrder: number;
  isPercent?: boolean;
  active?: boolean;
  scope?: CouponScope;
  targetCustomerIds?: string[];
  targetProductIds?: string[];
  targetCategoryIds?: CategoryId[];
  expiresAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  group: 'Today' | 'Earlier';
  type: 'order' | 'catering' | 'offer';
  read: boolean;
  orderId?: string;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  variant: 'success' | 'error' | 'info';
}

export interface WalletTransaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
}
