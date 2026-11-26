import React, { useCallback, useMemo, useState } from 'react';
import {
  CATEGORIES,
  COUPONS,
  CUSTOMER_DIRECTORY,
  MENU_ITEMS,
  SEED_ADDRESSES,
  SEED_CART,
  SEED_HERO_BANNERS,
  SEED_NOTIFICATIONS,
  SEED_ORDERS,
  SEED_QUOTES,
  SEED_STOREFRONT,
  SEED_USER,
  SEED_WALLET_TXNS,
  UPCOMING_EVENTS,
} from './data/mockData';
import { AdminPanel } from './screens/admin/AdminPanel';
import {
  AddonOption,
  Address,
  CartItem,
  CategoryId,
  CategoryInfo,
  CateringQuote,
  Coupon,
  HeroBanner,
  MenuItem,
  NotificationItem,
  OrderRecord,
  OrderStage,
  RouteEntry,
  ScreenName,
  StorefrontContent,
  ToastMessage,
  UpcomingEvent,
  UserProfile,
} from './types';
import { PhoneFrame } from './components/PhoneFrame';
import { ToastContainer } from './components/UI';
import { LoginScreen, OtpScreen, SignUpScreen, SplashScreen } from './screens/AuthScreens';
import {
  BulkOrderScreen,
  CategoriesScreen,
  FavoritesScreen,
  HomeScreen,
  MenuListScreen,
  ProductDetailScreen,
  SearchScreen,
  UpcomingEventsScreen,
} from './screens/HomeAndCatalogScreens';
import {
  CartScreen,
  CheckoutScreen,
  OrderPlacedScreen,
  PaymentScreen,
  computeDeliveryFee,
} from './screens/CartCheckoutScreens';
import {
  CateringBookingsScreen,
  CateringQuoteDetailScreen,
  CateringQuoteFormScreen,
  CateringServicesScreen,
} from './screens/CateringScreens';
import {
  AddressesScreen,
  NotificationsScreen,
  OrderDetailsScreen,
  OrdersScreen,
  ProfileScreen,
  RatingScreen,
  SupportScreen,
  TrackOrderScreen,
  WalletOffersScreen,
} from './screens/OrdersTrackingProfileScreens';

const STAGE_SEQUENCE: OrderStage[] = [
  'Placed',
  'Accepted',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

function useSyncedState<T>(storageKey: string, initialValue: T | (() => T)) {
  const [state, setState] = useState<T>(() => {
    const fallback = typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
    if (typeof window === 'undefined') return fallback;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved) as T;
    } catch {
      // ignore parse/storage errors
    }
    return fallback;
  });

  const setSyncedState: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore storage quota errors
        }
        return next;
      });
    },
    [storageKey]
  );

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          setState(JSON.parse(e.newValue) as T);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  return [state, setSyncedState] as const;
}

export default function App() {
  // Navigation Screen Stack + Transition Direction
  const [stack, setStack] = useState<RouteEntry[]>([{ screen: 'splash' }]);
  const stackRef = React.useRef<RouteEntry[]>(stack);
  stackRef.current = stack;
  const [navDirection, setNavDirection] = useState<'forward' | 'back'>('forward');

  // App Memory State
  const [user, setUser] = useState<UserProfile>(SEED_USER);
  const [pendingAuthPhone, setPendingAuthPhone] = useState<string>(SEED_USER.phone);
  const [pendingSignUp, setPendingSignUp] = useState<UserProfile | null>(null);

  const [addresses, setAddresses] = useState<Address[]>(SEED_ADDRESSES);
  const [cart, setCart] = useState<CartItem[]>(SEED_CART);
  const [favorites, setFavorites] = useState<string[]>(['paneer-butter-masala', 'chicken-biryani']);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [checkoutDate, setCheckoutDate] = useState('Today, 26 Nov');
  const [checkoutSlot, setCheckoutSlot] = useState('12:30 PM - 01:00 PM');

  const checkIsAdmin = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#admin' ||
      hash.startsWith('#admin') ||
      hash.startsWith('#/admin')
    );
  }, []);

  const [appMode, setAppMode] = useState<'customer' | 'admin'>(() => {
    return checkIsAdmin() ? 'admin' : 'customer';
  });

  const [menuItems, setMenuItems] = useSyncedState<MenuItem[]>('swastik_menu_items_v1', () =>
    MENU_ITEMS.map((m) => ({
      ...m,
      isSpecial: ['chicken-curry', 'veg-biryani', 'paneer-butter-masala', 'dal-tadka'].includes(m.id),
    }))
  );
  const [categories, setCategories] = useSyncedState<CategoryInfo[]>(
    'swastik_categories_v1',
    CATEGORIES
  );
  const [heroBanners, setHeroBanners] = useSyncedState<HeroBanner[]>(
    'swastik_hero_banners_v1',
    SEED_HERO_BANNERS
  );
  const [coupons, setCoupons] = useSyncedState<Coupon[]>('swastik_coupons_v1', COUPONS);
  const [storefront, setStorefront] = useSyncedState<StorefrontContent>(
    'swastik_storefront_v1',
    SEED_STOREFRONT
  );
  const [upcomingEvents, setUpcomingEvents] = useSyncedState<UpcomingEvent[]>(
    'swastik_upcoming_events_v1',
    UPCOMING_EVENTS
  );

  React.useEffect(() => {
    if (!checkIsAdmin() && (!window.history.state || !window.history.state.swastikStack)) {
      try {
        window.history.replaceState({ swastikStack: stackRef.current }, '');
      } catch {
        // ignore history errors in restricted contexts
      }
    }

    const handleUrlChange = (event?: PopStateEvent) => {
      const isAdmin = checkIsAdmin();
      setAppMode(isAdmin ? 'admin' : 'customer');
      if (!isAdmin && event?.state?.swastikStack && Array.isArray(event.state.swastikStack) && event.state.swastikStack.length > 0) {
        const nextStack: RouteEntry[] = event.state.swastikStack;
        setNavDirection(nextStack.length < stackRef.current.length ? 'back' : 'forward');
        setStack(nextStack);
      }
    };

    const handleHashChange = () => {
      setAppMode(checkIsAdmin() ? 'admin' : 'customer');
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [checkIsAdmin]);

  const switchToAdmin = useCallback(() => {
    setAppMode('admin');
    try {
      window.history.pushState({ swastikAdmin: true }, '', '/admin');
    } catch {
      window.location.hash = '#admin';
    }
  }, []);

  const switchToCustomer = useCallback(() => {
    setAppMode('customer');
    try {
      window.history.pushState({ swastikStack: stackRef.current }, '', '/');
    } catch {
      window.location.hash = '#customer';
    }
  }, []);

  const handleUpdateOrderStatus = useCallback((orderId: string, stage: OrderStage) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, stage } : o))
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Order #${orderId} Update`,
        message: `Your order status is now: ${stage}`,
        time: 'Just now',
        group: 'Today',
        type: 'order',
        read: false,
        orderId,
      },
      ...prev,
    ]);
  }, []);

  const handleAssignDeliveryPartner = useCallback(
    (
      orderId: string,
      partnerType: 'own-vehicle' | 'third-party',
      riderOrPartnerName: string,
      trackingCode?: string
    ) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            return {
              ...o,
              trackingType: partnerType,
              riderName: partnerType === 'own-vehicle' ? riderOrPartnerName : o.riderName,
              thirdPartyPartner: partnerType === 'third-party' ? riderOrPartnerName : undefined,
              thirdPartyTrackingCode: trackingCode || o.thirdPartyTrackingCode,
            };
          }
          return o;
        })
      );
    },
    []
  );

  const handleToggleItemAvailability = useCallback((itemId: string) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === itemId ? { ...m, rating: m.rating > 0 ? 0 : 4.8 } : m))
    );
  }, []);

  const handleUpdateQuoteStatus = useCallback(
    (quoteId: string, status: CateringQuote['status']) => {
      setQuotes((prev) =>
        prev.map((q) => (q.id === quoteId ? { ...q, status } : q))
      );
    },
    []
  );

  const [orders, setOrders] = useSyncedState<OrderRecord[]>('swastik_orders_v1', SEED_ORDERS);
  const [quotes, setQuotes] = useSyncedState<CateringQuote[]>('swastik_quotes_v1', SEED_QUOTES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const [walletBalance, setWalletBalance] = useState<number>(450);
  const [walletTxns, setWalletTxns] = useState(SEED_WALLET_TXNS);

  // Catering Advance / Balance Payment Context
  const [pendingQuotePayment, setPendingQuotePayment] = useState<{
    quoteId: string;
    mode: 'advance' | 'balance';
    amount: number;
  } | null>(null);

  // Prototype Test Toggles
  const [isOffline, setIsOffline] = useState(false);
  const [simulatePayFail, setSimulatePayFail] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const currentRoute = stack[stack.length - 1];
  const currentScreen = currentRoute.screen;

  const showToast = useCallback(
    (text: string, variant: 'success' | 'error' | 'info' = 'info') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-2), { id, text, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 2600);
    },
    []
  );

  const pushScreen = useCallback((screen: ScreenName, params?: Record<string, any>) => {
    setNavDirection('forward');
    const nextStack = [...stackRef.current, { screen, params }];
    setStack(nextStack);
    try {
      window.history.pushState({ swastikStack: nextStack }, '');
    } catch {
      // ignore
    }
  }, []);

  const replaceRoot = useCallback((screen: ScreenName, params?: Record<string, any>) => {
    setNavDirection('forward');
    const nextStack = [{ screen, params }];
    setStack(nextStack);
    try {
      window.history.replaceState({ swastikStack: nextStack }, '');
    } catch {
      // ignore
    }
  }, []);

  const goBack = useCallback(() => {
    setNavDirection('back');
    if (stackRef.current.length > 1) {
      if (window.history.state?.swastikStack?.length > 1) {
        window.history.back();
      } else {
        setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
      }
    }
  }, []);

  const switchTab = useCallback((tab: ScreenName) => {
    const nextStack: RouteEntry[] = [
      { screen: 'home' },
      ...(tab === 'home' ? [] : [{ screen: tab }]),
    ];
    const current = stackRef.current;
    if (
      current.length === nextStack.length &&
      current[current.length - 1]?.screen === nextStack[nextStack.length - 1]?.screen
    ) {
      return;
    }
    setNavDirection('forward');
    setStack(nextStack);
    try {
      window.history.pushState({ swastikStack: nextStack }, '');
    } catch {
      // ignore
    }
  }, []);

  const activeAddress = useMemo(
    () => addresses.find((a) => a.isDefault) || addresses[0],
    [addresses]
  );

  // Cart Totals
  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, line) => {
        const addonsCost = line.addons.reduce((s, a) => s + a.price, 0);
        return sum + (line.unitPrice + addonsCost) * line.quantity;
      }, 0),
    [cart]
  );

  const deliveryFee = computeDeliveryFee(activeAddress, cartSubtotal);
  const couponDiscount =
    appliedCoupon && cartSubtotal >= appliedCoupon.minOrder ? appliedCoupon.discountAmount : 0;
  const cartTotalPayable = Math.max(0, cartSubtotal + deliveryFee - couponDiscount);
  const cartTotalCount = cart.reduce((s, c) => s + c.quantity, 0);

  // Favorites
  const toggleFavorite = useCallback(
    (itemId: string) => {
      setFavorites((prev) => {
        const exists = prev.includes(itemId);
        showToast(exists ? 'Removed from favorites' : 'Saved to favorites', 'info');
        return exists ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      });
    },
    [showToast]
  );

  // Add to Cart (distinct size/addons -> separate cart line)
  const addToCart = useCallback(
    (
      item: MenuItem,
      sizeLabel: string,
      unitPrice: number,
      addons: AddonOption[],
      quantity: number,
      bulkMeta?: {
        isBulk: boolean;
        plates: number;
        date: string;
        time: string;
        instructions: string;
      }
    ) => {
      const addonIds = addons
        .map((a) => a.id)
        .sort()
        .join(',');
      const key = bulkMeta
        ? `${item.id}__bulk_${bulkMeta.plates}_${bulkMeta.date}`
        : `${item.id}__${sizeLabel}__${addonIds}`;

      setCart((prev) => {
        const idx = prev.findIndex((c) => c.cartKey === key);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
          return updated;
        }
        return [
          ...prev,
          {
            cartKey: key,
            item,
            sizeLabel,
            unitPrice,
            addons,
            quantity,
            isBulk: bulkMeta?.isBulk,
            bulkPlates: bulkMeta?.plates,
            bulkDate: bulkMeta?.date,
            bulkTime: bulkMeta?.time,
            bulkInstructions: bulkMeta?.instructions,
          },
        ];
      });
      showToast(`Added ${item.name} to cart`, 'success');
    },
    [showToast]
  );

  const quickAddItem = useCallback(
    (item: MenuItem) => {
      const def = item.sizeOptions.find((s) => s.isDefault) || item.sizeOptions[0];
      addToCart(item, def.label, def.price, [], 1);
    },
    [addToCart]
  );

  const decreaseItemFromList = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.item.id === item.id);
      if (idx < 0) return prev;
      const target = prev[idx];
      if (target.quantity <= 1) {
        return prev.filter((_, i) => i !== idx);
      }
      const next = [...prev];
      next[idx] = { ...target, quantity: target.quantity - 1 };
      return next;
    });
  }, []);

  const updateCartQty = useCallback((cartKey: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.cartKey === cartKey ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  }, []);

  const removeCartLine = useCallback(
    (cartKey: string) => {
      setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
      showToast('Item removed from cart', 'info');
    },
    [showToast]
  );

  // Coupons
  const handleApplyCoupon = useCallback(
    (rawCode: string): boolean => {
      const code = rawCode.trim().toUpperCase();
      const found = coupons.find((c) => c.code.toUpperCase() === code && c.active !== false);
      if (!found) {
        showToast('Invalid or inactive coupon code.', 'error');
        return false;
      }
      if (found.scope === 'individual' || found.scope === 'selected_people') {
        const matchedCustomer = CUSTOMER_DIRECTORY.find(
          (cust) => cust.phone === user.phone || cust.name.toLowerCase() === user.name.toLowerCase()
        );
        if (!matchedCustomer || !(found.targetCustomerIds || []).includes(matchedCustomer.id)) {
          showToast(`Coupon ${found.code} is valid only for selected customers`, 'error');
          return false;
        }
      }
      if (found.scope === 'selected_products') {
        const hasMatch = cart.some((line) => (found.targetProductIds || []).includes(line.item.id));
        if (!hasMatch) {
          showToast(`Add an eligible dish to cart to use ${found.code}`, 'error');
          return false;
        }
      }
      if (found.scope === 'selected_categories') {
        const hasMatch = cart.some((line) =>
          (found.targetCategoryIds || []).includes(line.item.category)
        );
        if (!hasMatch) {
          showToast(`Add a dish from an eligible category to use ${found.code}`, 'error');
          return false;
        }
      }
      if (cartSubtotal < found.minOrder) {
        showToast(`Add ₹${found.minOrder - cartSubtotal} more to use ${found.code}`, 'error');
        return false;
      }
      const discountValue = found.isPercent
        ? Math.round((cartSubtotal * found.discountAmount) / 100)
        : found.discountAmount;
      setAppliedCoupon({ ...found, discountAmount: discountValue });
      showToast(`${found.code} applied! Saved ₹${discountValue}`, 'success');
      return true;
    },
    [cart, cartSubtotal, coupons, showToast, user.name, user.phone]
  );

  // Order Placement
  const handleOrderPaymentSuccess = useCallback(
    (method: string) => {
      if (pendingQuotePayment) {
        const { quoteId, mode, amount } = pendingQuotePayment;
        setQuotes((prev) =>
          prev.map((q) => {
            if (q.id !== quoteId) return q;
            return {
              ...q,
              status: mode === 'advance' ? 'Advance Paid' : 'Completed',
            };
          })
        );
        if (method === 'Swastik Wallet') {
          setWalletBalance((b) => Math.max(0, b - amount));
          setWalletTxns((prev) => [
            {
              id: `wt-${Date.now()}`,
              title: `Catering ${mode === 'advance' ? 'Advance' : 'Balance'} (#${quoteId})`,
              date: 'Today',
              amount,
              type: 'debit',
            },
            ...prev,
          ]);
        }
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            title: `Catering Payment Confirmed (#${quoteId})`,
            message: `Paid ₹${amount.toLocaleString('en-IN')} via ${method}.`,
            time: 'Just now',
            group: 'Today',
            type: 'catering',
            read: false,
          },
          ...prev,
        ]);
        setPendingQuotePayment(null);
        showToast(
          mode === 'advance'
            ? '30% Advance paid! Event slot confirmed.'
            : 'Balance paid! Catering booking completed.',
          'success'
        );
        goBack();
        return;
      }

      const newOrderId = `SWF${Math.floor(10000 + Math.random() * 89999)}`;
      const hasBulk = cart.some((c) => c.isBulk);
      const firstItemName = cart[0]?.item.name || 'Swastik Meal';
      const summary =
        cart.length > 1 ? `${firstItemName} +${cart.length - 1} more` : firstItemName;

      if (method === 'Swastik Wallet') {
        setWalletBalance((b) => Math.max(0, b - cartTotalPayable));
        setWalletTxns((prev) => [
          {
            id: `wt-${Date.now()}`,
            title: `Order #${newOrderId}`,
            date: 'Today',
            amount: cartTotalPayable,
            type: 'debit',
          },
          ...prev,
        ]);
      }

      const newOrder: OrderRecord = {
        id: newOrderId,
        createdAt: '26 Nov 2026, Just now',
        dateLabel: 'Today',
        itemsSummary: summary,
        items: cart,
        itemTotal: cartSubtotal,
        deliveryFee,
        discount: couponDiscount,
        totalAmount: cartTotalPayable,
        paymentMethod: method,
        address: activeAddress,
        deliverySlot: `${checkoutDate}, ${checkoutSlot}`,
        stage: 'Placed',
        eta: hasBulk ? 'Scheduled Own-Fleet' : '35 mins',
        trackingType: hasBulk ? 'own-vehicle' : 'third-party',
        thirdPartyPartner: hasBulk ? undefined : 'Rapido',
        thirdPartyTrackingCode: hasBulk ? undefined : `RPD-HYD-${newOrderId.slice(3)}`,
        riderName: hasBulk ? 'Ramesh' : undefined,
        riderRating: hasBulk ? 4.8 : undefined,
        riderPhone: hasBulk ? '+91 98480 11223' : undefined,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: `Order #${newOrderId} Placed`,
          message: `Confirmed via ${method}. ${hasBulk ? 'Assigned to Swastik Own Fleet.' : 'Rapido partner will pick up shortly.'}`,
          time: 'Just now',
          group: 'Today',
          type: 'order',
          read: false,
          orderId: newOrderId,
        },
        ...prev,
      ]);

      setCart([]);
      setAppliedCoupon(null);
      pushScreen('order-placed', { orderId: newOrderId });
    },
    [
      pendingQuotePayment,
      cart,
      cartSubtotal,
      deliveryFee,
      couponDiscount,
      cartTotalPayable,
      activeAddress,
      checkoutDate,
      checkoutSlot,
      goBack,
      pushScreen,
      showToast,
    ]
  );

  // Live Tracking Simulation Progression
  const handleAdvanceOrderStage = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const idx = STAGE_SEQUENCE.indexOf(o.stage);
        if (idx < 0 || idx >= STAGE_SEQUENCE.length - 1) return o;
        const nextStage = STAGE_SEQUENCE[idx + 1];

        setNotifications((nPrev) => [
          {
            id: `notif-${Date.now()}-${Math.random()}`,
            title: `Order #${o.id}: ${nextStage}`,
            message:
              nextStage === 'Delivered'
                ? 'Your meal has been delivered. Enjoy your food!'
                : `Your Swastik order status updated to ${nextStage}.`,
            time: 'Just now',
            group: 'Today',
            type: 'order',
            read: false,
            orderId: o.id,
          },
          ...nPrev,
        ]);

        return {
          ...o,
          stage: nextStage,
          eta: nextStage === 'Delivered' ? 'Delivered' : o.eta,
        };
      })
    );
  }, []);

  // Reorder
  const handleReorder = useCallback(
    (order: OrderRecord) => {
      setCart(order.items);
      showToast(`Added ${order.items.length} item(s) from #${order.id} to cart`, 'success');
      switchTab('cart');
    },
    [showToast, switchTab]
  );

  // Prebook Upcoming Event
  const handlePrebookEvent = useCallback(
    (evt: UpcomingEvent) => {
      if (evt.isCatering) {
        pushScreen('catering-quote', { eventType: 'Festivals' });
      } else {
        const promoItem: MenuItem = {
          id: evt.id,
          name: evt.title,
          category: 'combos',
          veg: evt.veg,
          description: evt.description,
          rating: 4.9,
          reviews: 'Pre-booking',
          sizeOptions: [{ label: evt.priceLabel, price: evt.basePrice, isDefault: true }],
          addons: [],
          image: evt.id,
          emoji: evt.emoji,
          tint: 'cream',
        };
        addToCart(promoItem, 'Festive Pre-book', evt.basePrice, [], 1);
        pushScreen('cart');
      }
    },
    [addToCart, pushScreen]
  );

  // Reset Prototype
  const handleResetApp = () => {
    setUser(SEED_USER);
    setAddresses(SEED_ADDRESSES);
    setCart(SEED_CART);
    setFavorites(['paneer-butter-masala', 'chicken-biryani']);
    setAppliedCoupon(null);
    setOrders(SEED_ORDERS);
    setQuotes(SEED_QUOTES);
    setNotifications(SEED_NOTIFICATIONS);
    setWalletBalance(450);
    setWalletTxns(SEED_WALLET_TXNS);
    setIsOffline(false);
    setSimulatePayFail(false);
    setPendingQuotePayment(null);
    replaceRoot('splash');
    showToast('App reset to initial state', 'info');
  };

  // Render active screen
  const renderScreen = () => {
    const params = currentRoute.params || {};

    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onGetStarted={() => pushScreen('login')} />;

      case 'login':
        return (
          <LoginScreen
            onOtpLogin={(phone) => {
              setPendingAuthPhone(phone);
              setPendingSignUp(null);
              pushScreen('otp', { phone });
            }}
            onPasswordLogin={(phone) => {
              setUser((u) => ({ ...u, phone }));
              showToast('Welcome back to Swastik!', 'success');
              replaceRoot('home');
            }}
            onSocialLogin={(provider) => {
              showToast(`Signed in with ${provider}`, 'success');
              replaceRoot('home');
            }}
            onGoSignUp={() => pushScreen('signup')}
            showToast={showToast}
          />
        );

      case 'signup':
        return (
          <SignUpScreen
            onBack={goBack}
            onContinueOtp={(data) => {
              setPendingAuthPhone(data.phone);
              setPendingSignUp({
                name: data.name,
                phone: data.phone,
                email: data.email || 'user@swastik.in',
              });
              pushScreen('otp', { phone: data.phone });
            }}
            showToast={showToast}
          />
        );

      case 'otp':
        return (
          <OtpScreen
            phone={params.phone || pendingAuthPhone}
            onBack={goBack}
            onVerified={() => {
              if (pendingSignUp) {
                setUser(pendingSignUp);
                setPendingSignUp(null);
                showToast(`Welcome, ${pendingSignUp.name}!`, 'success');
              } else {
                setUser((u) => ({ ...u, phone: params.phone || pendingAuthPhone }));
                showToast('OTP Verified! Welcome back.', 'success');
              }
              replaceRoot('home');
            }}
            showToast={showToast}
          />
        );

      case 'home':
        return (
          <HomeScreen
            userName={user.name}
            ongoingOrder={orders.find(
              (o) => o.stage !== 'Delivered' && o.stage !== 'Cancelled'
            )}
            activeAddress={activeAddress}
            addresses={addresses}
            onSelectAddress={(id) =>
              setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
            }
            unreadNotifications={notifications.filter((n) => !n.read).length}
            cart={cart}
            favorites={favorites}
            menuItems={menuItems}
            heroBanners={heroBanners}
            categories={categories}
            upcomingEvents={upcomingEvents}
            onToggleFavorite={toggleFavorite}
            onQuickAdd={quickAddItem}
            onDecreaseItem={decreaseItemFromList}
            onNavigate={(scr, p) => {
              if (scr === 'categories' || scr === 'cart' || scr === 'orders' || scr === 'profile') {
                switchTab(scr);
              } else {
                pushScreen(scr, p);
              }
            }}
            onPrebookEvent={handlePrebookEvent}
            showToast={showToast}
          />
        );

      case 'categories':
        return (
          <CategoriesScreen
            cartCount={cartTotalCount}
            categories={categories}
            onBack={() => switchTab('home')}
            onNavigate={(scr, p) => {
              if (scr === 'home' || scr === 'cart' || scr === 'orders' || scr === 'profile') {
                switchTab(scr);
              } else {
                pushScreen(scr, p);
              }
            }}
          />
        );

      case 'curries':
        return (
          <MenuListScreen
            title="Curries"
            categoryId="curries"
            menuItems={menuItems}
            cart={cart}
            favorites={favorites}
            onBack={goBack}
            onToggleFavorite={toggleFavorite}
            onQuickAdd={quickAddItem}
            onDecreaseItem={decreaseItemFromList}
            onNavigate={pushScreen}
          />
        );

      case 'home-foods':
        return (
          <MenuListScreen
            title="Home Foods"
            categoryId="home-foods"
            isHomeFoods
            menuItems={menuItems}
            cart={cart}
            favorites={favorites}
            onBack={goBack}
            onToggleFavorite={toggleFavorite}
            onQuickAdd={quickAddItem}
            onDecreaseItem={decreaseItemFromList}
            onNavigate={pushScreen}
          />
        );

      case 'category-items': {
        const catId = (params.categoryId as CategoryId) || 'biryani';
        const cat = categories.find((c) => c.id === catId);
        return (
          <MenuListScreen
            title={cat?.title || 'Menu'}
            categoryId={catId}
            menuItems={menuItems}
            cart={cart}
            favorites={favorites}
            onBack={goBack}
            onToggleFavorite={toggleFavorite}
            onQuickAdd={quickAddItem}
            onDecreaseItem={decreaseItemFromList}
            onNavigate={pushScreen}
          />
        );
      }

      case 'product-detail': {
        const item = menuItems.find((m) => m.id === params.itemId) || menuItems[0];
        return (
          <ProductDetailScreen
            item={item}
            isFavorite={favorites.includes(item.id)}
            onBack={goBack}
            onToggleFavorite={toggleFavorite}
            onAddToCart={(it, size, price, addons, qty) => {
              addToCart(it, size, price, addons, qty);
              goBack();
            }}
            onGoBulk={
              item.supportsBulk ? () => pushScreen('bulk-order', { itemId: item.id }) : undefined
            }
            showToast={showToast}
          />
        );
      }

      case 'bulk-order':
        return (
          <BulkOrderScreen
            initialItemId={params.itemId}
            menuItems={menuItems}
            onBack={goBack}
            onAddBulkToCart={(item, plates, unitPrice, date, time, instructions) => {
              addToCart(item, `Bulk · ${plates} plates`, unitPrice, [], plates, {
                isBulk: true,
                plates,
                date,
                time,
                instructions,
              });
              pushScreen('cart');
            }}
          />
        );

      case 'upcoming-events':
        return (
          <UpcomingEventsScreen
            upcomingEvents={upcomingEvents}
            onBack={goBack}
            onPrebook={handlePrebookEvent}
          />
        );

      case 'search':
        return (
          <SearchScreen
            menuItems={menuItems}
            cart={cart}
            favorites={favorites}
            onBack={goBack}
            onToggleFavorite={toggleFavorite}
            onQuickAdd={quickAddItem}
            onDecreaseItem={decreaseItemFromList}
            onOpenProduct={(it) => pushScreen('product-detail', { itemId: it.id })}
          />
        );

      case 'favorites':
        return (
          <FavoritesScreen
            menuItems={menuItems}
            cart={cart}
            favorites={favorites}
            onBack={goBack}
            onToggleFavorite={toggleFavorite}
            onQuickAdd={quickAddItem}
            onDecreaseItem={decreaseItemFromList}
            onOpenProduct={(it) => pushScreen('product-detail', { itemId: it.id })}
            onExplore={() => pushScreen('curries')}
          />
        );

      case 'catering':
        return (
          <CateringServicesScreen
            onBack={goBack}
            bookingsCount={quotes.length}
            onViewBookings={() => pushScreen('catering-bookings')}
            onStartQuote={(payload) => pushScreen('catering-quote', payload)}
            showToast={showToast}
          />
        );

      case 'catering-quote':
        return (
          <CateringQuoteFormScreen
            initialEventType={params.eventType}
            initialPackageId={params.packageId}
            initialSelectedDishes={params.selectedDishes}
            initialPerPlate={params.perPlateEstimate}
            initialDietPreference={params.dietPreference}
            defaultAddress={activeAddress.fullAddress}
            onBack={goBack}
            onSubmitQuote={(newQuote) => {
              setQuotes((prev) => [newQuote, ...prev]);
              setNotifications((prev) => [
                {
                  id: `notif-${Date.now()}`,
                  title: `Quote Request #${newQuote.id} Submitted`,
                  message: `We received your ${newQuote.eventType} catering request for ${newQuote.guestCount} guests.`,
                  time: 'Just now',
                  group: 'Today',
                  type: 'catering',
                  read: false,
                },
                ...prev,
              ]);
              showToast(`Quote #${newQuote.id} submitted!`, 'success');
              pushScreen('catering-bookings');
            }}
            showToast={showToast}
          />
        );

      case 'catering-bookings':
        return (
          <CateringBookingsScreen
            quotes={quotes}
            onBack={goBack}
            onSelectQuote={(quoteId) => pushScreen('catering-quote-detail', { quoteId })}
            onNewQuote={() => pushScreen('catering-quote')}
          />
        );

      case 'catering-quote-detail': {
        const quote = quotes.find((q) => q.id === params.quoteId) || quotes[0];
        return (
          <CateringQuoteDetailScreen
            quote={quote}
            onBack={goBack}
            onSimulateQuoteSent={(quoteId) => {
              setQuotes((prev) =>
                prev.map((q) => (q.id === quoteId ? { ...q, status: 'Quote Sent' } : q))
              );
              showToast('Quote estimate approved & sent!', 'success');
            }}
            onPayAdvance={(q) => {
              setPendingQuotePayment({
                quoteId: q.id,
                mode: 'advance',
                amount: q.advanceAmount,
              });
              pushScreen('payment');
            }}
            onPayBalance={(q) => {
              setPendingQuotePayment({
                quoteId: q.id,
                mode: 'balance',
                amount: q.balanceAmount,
              });
              pushScreen('payment');
            }}
          />
        );
      }

      case 'cart':
        return (
          <CartScreen
            cart={cart}
            activeAddress={activeAddress}
            appliedCoupon={appliedCoupon}
            coupons={coupons}
            onUpdateQty={updateCartQty}
            onRemoveItem={removeCartLine}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={() => {
              setAppliedCoupon(null);
              showToast('Coupon removed', 'info');
            }}
            onProceedCheckout={() => pushScreen('checkout')}
            onBrowseMenu={() => pushScreen('curries')}
            onBack={() => switchTab('home')}
            onNavigateTab={switchTab}
          />
        );

      case 'checkout':
        return (
          <CheckoutScreen
            activeAddress={activeAddress}
            addresses={addresses}
            totalPayable={cartTotalPayable}
            selectedDate={checkoutDate}
            selectedSlot={checkoutSlot}
            onChangeDate={setCheckoutDate}
            onChangeSlot={setCheckoutSlot}
            onSelectAddress={(id) =>
              setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
            }
            onManageAddresses={() => pushScreen('addresses')}
            onContinuePayment={() => {
              setPendingQuotePayment(null);
              pushScreen('payment');
            }}
            onRedirectCatering={() => {
              showToast('Redirecting to Catering Quote Request', 'info');
              pushScreen('catering-quote');
            }}
            onBack={goBack}
          />
        );

      case 'payment':
        return (
          <PaymentScreen
            amount={pendingQuotePayment ? pendingQuotePayment.amount : cartTotalPayable}
            titleLabel={
              pendingQuotePayment
                ? `Catering #${pendingQuotePayment.quoteId} (${
                    pendingQuotePayment.mode === 'advance' ? '30% Advance' : 'Balance'
                  })`
                : 'Swastik Order Payment'
            }
            walletBalance={walletBalance}
            allowCod={!pendingQuotePayment}
            simulatePayFail={simulatePayFail}
            onTogglePayFail={() => setSimulatePayFail((v) => !v)}
            onPaymentSuccess={handleOrderPaymentSuccess}
            onBack={() => {
              setPendingQuotePayment(null);
              goBack();
            }}
          />
        );

      case 'order-placed': {
        const orderId = params.orderId || orders[0].id;
        return (
          <OrderPlacedScreen
            orderId={orderId}
            onTrackOrder={() => pushScreen('track-order', { orderId })}
            onViewDetails={() => pushScreen('order-details', { orderId })}
            onGoHome={() => replaceRoot('home')}
          />
        );
      }

      case 'track-order': {
        const order = orders.find((o) => o.id === params.orderId) || orders[0];
        return (
          <TrackOrderScreen
            order={order}
            onBack={goBack}
            onAdvanceStage={handleAdvanceOrderStage}
            onRateOrder={(orderId) => pushScreen('rating', { orderId })}
            onViewDetails={(orderId) => pushScreen('order-details', { orderId })}
            showToast={showToast}
          />
        );
      }

      case 'orders':
        return (
          <OrdersScreen
            orders={orders}
            cartCount={cartTotalCount}
            onTrackOrder={(orderId) => pushScreen('track-order', { orderId })}
            onViewOrderDetails={(orderId) => pushScreen('order-details', { orderId })}
            onReorder={handleReorder}
            onRateOrder={(orderId) => pushScreen('rating', { orderId })}
            onNavigate={(scr, p) => {
              if (scr === 'home' || scr === 'categories' || scr === 'cart' || scr === 'profile') {
                switchTab(scr);
              } else {
                pushScreen(scr, p);
              }
            }}
          />
        );

      case 'order-details': {
        const order = orders.find((o) => o.id === params.orderId) || orders[0];
        return (
          <OrderDetailsScreen
            order={order}
            onBack={goBack}
            onTrack={() => pushScreen('track-order', { orderId: order.id })}
            onReorder={() => handleReorder(order)}
            onRate={() => pushScreen('rating', { orderId: order.id })}
            showToast={showToast}
          />
        );
      }

      case 'rating': {
        const order = orders.find((o) => o.id === params.orderId) || orders[0];
        return (
          <RatingScreen
            order={order}
            onBack={goBack}
            onSubmitRating={(orderId, stars, tags, comment) => {
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === orderId
                    ? { ...o, ratingSubmitted: { stars, tags, comment } }
                    : o
                )
              );
              showToast('Thank you for rating Swastik!', 'success');
            }}
          />
        );
      }

      case 'profile':
        return (
          <ProfileScreen
            user={user}
            cartCount={cartTotalCount}
            onUpdateUser={setUser}
            onLogout={() => {
              showToast('Logged out successfully', 'info');
              replaceRoot('login');
            }}
            onNavigate={(scr) => {
              if (scr === 'home' || scr === 'categories' || scr === 'cart' || scr === 'orders') {
                switchTab(scr);
              } else {
                pushScreen(scr);
              }
            }}
            showToast={showToast}
          />
        );

      case 'addresses':
        return (
          <AddressesScreen
            addresses={addresses}
            onBack={goBack}
            onSetDefault={(id) => {
              setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
              showToast('Default delivery address updated', 'success');
            }}
            onAddAddress={(addr) => {
              const newAddr: Address = { ...addr, id: `addr-${Date.now()}` };
              setAddresses((prev) => [...prev, newAddr]);
              showToast('New address saved', 'success');
            }}
            onDeleteAddress={(id) => {
              setAddresses((prev) => {
                const next = prev.filter((a) => a.id !== id);
                if (next.length > 0 && !next.some((a) => a.isDefault)) {
                  next[0] = { ...next[0], isDefault: true };
                }
                return next;
              });
              showToast('Address deleted', 'info');
            }}
            showToast={showToast}
          />
        );

      case 'wallet':
        return (
          <WalletOffersScreen
            balance={walletBalance}
            transactions={walletTxns}
            coupons={coupons}
            onBack={goBack}
            onApplyCouponFromOffers={(code) => {
              if (handleApplyCoupon(code)) {
                switchTab('cart');
              }
            }}
            showToast={showToast}
          />
        );

      case 'support':
        return (
          <SupportScreen
            user={user}
            storefront={storefront}
            onBack={goBack}
            showToast={showToast}
          />
        );

      case 'notifications':
        return (
          <NotificationsScreen
            notifications={notifications}
            onBack={goBack}
            onMarkAllRead={() => {
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              showToast('All notifications marked as read', 'info');
            }}
            onSelectNotification={(n) => {
              setNotifications((prev) =>
                prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
              );
              if (n.orderId) {
                pushScreen('track-order', { orderId: n.orderId });
              } else if (n.type === 'catering') {
                pushScreen('catering-bookings');
              } else {
                pushScreen('wallet');
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  if (appMode === 'admin') {
    return (
      <>
        <ToastContainer toasts={toasts} />
        <AdminPanel
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onAssignDeliveryPartner={handleAssignDeliveryPartner}
          menuItems={menuItems}
          onToggleItemAvailability={handleToggleItemAvailability}
          onAddMenuItem={(item) => setMenuItems((prev) => [item, ...prev])}
          onUpdateMenuItem={(item) =>
            setMenuItems((prev) => prev.map((m) => (m.id === item.id ? item : m)))
          }
          quotes={quotes}
          onUpdateQuoteStatus={handleUpdateQuoteStatus}
          onUpdateQuote={(updated) =>
            setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
          }
          upcomingEvents={upcomingEvents}
          onAddEvent={(ev) => setUpcomingEvents((prev) => [ev, ...prev])}
          categories={categories}
          onSaveCategories={setCategories}
          heroBanners={heroBanners}
          onSaveHeroBanners={setHeroBanners}
          coupons={coupons}
          onSaveCoupons={setCoupons}
          storefront={storefront}
          onSaveStorefront={setStorefront}
          onSwitchToCustomerApp={switchToCustomer}
          showToast={showToast}
        />
      </>
    );
  }

  return (
    <PhoneFrame
      isDarkHeader={currentScreen === 'splash'}
      isOffline={isOffline}
      onToggleOffline={() => setIsOffline((v) => !v)}
      simulatePayFail={simulatePayFail}
      onTogglePayFail={() => setSimulatePayFail((v) => !v)}
      onResetApp={handleResetApp}
      onQuickNavigate={(scr) => {
        if (scr === 'splash') replaceRoot('splash');
        else switchTab(scr);
      }}
      currentScreen={currentScreen}
      onSwitchToAdmin={switchToAdmin}
    >
      <ToastContainer toasts={toasts} />
      <div
        key={`${currentScreen}-${stack.length}`}
        className={`flex-1 flex flex-col min-h-0 ${
          navDirection === 'forward' ? 'animate-screen-forward' : 'animate-screen-back'
        }`}
      >
        {renderScreen()}
      </div>
    </PhoneFrame>
  );
}
