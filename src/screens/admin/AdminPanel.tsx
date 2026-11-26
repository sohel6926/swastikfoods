import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Edit2,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  HelpCircle,
  Home,
  Layers,
  MapPin,
  Menu,
  MessageSquare,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import {
  AdminTab,
  ExpenseRecord,
  InventoryItem,
  StaffMember,
  SupportTicket,
  VehicleRecord,
  DeliveryProof,
} from '../../types/admin';
import {
  CategoryId,
  CategoryInfo,
  CateringQuote,
  Coupon,
  CouponScope,
  HeroBanner,
  MenuItem,
  OrderRecord,
  OrderStage,
  ScreenName,
  StorefrontContent,
  UpcomingEvent,
} from '../../types';
import {
  CATEGORIES,
  COUPONS,
  CUSTOMER_DIRECTORY,
  SEED_HERO_BANNERS,
  SEED_STOREFRONT,
} from '../../data/mockData';
import {
  SEED_EXPENSES,
  SEED_INVENTORY,
  SEED_STAFF,
  SEED_SUPPORT_TICKETS,
  SEED_VEHICLES,
  SEED_DELIVERY_PROOFS,
} from '../../data/adminMockData';
import { SWASTIK_HEADER_LOGO } from '../../components/BrandAssets';

interface AdminPanelProps {
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, stage: OrderStage) => void;
  onAssignDeliveryPartner: (
    orderId: string,
    partnerType: 'own-vehicle' | 'third-party',
    riderOrPartnerName: string,
    trackingCode?: string
  ) => void;
  menuItems: MenuItem[];
  onToggleItemAvailability: (itemId: string) => void;
  onAddMenuItem?: (item: MenuItem) => void;
  onUpdateMenuItem?: (item: MenuItem) => void;
  quotes: CateringQuote[];
  onUpdateQuoteStatus: (quoteId: string, status: CateringQuote['status'], note?: string) => void;
  onUpdateQuote?: (quote: CateringQuote) => void;
  upcomingEvents: UpcomingEvent[];
  onAddEvent?: (event: UpcomingEvent) => void;
  categories?: CategoryInfo[];
  onSaveCategories?: (cats: CategoryInfo[]) => void;
  heroBanners?: HeroBanner[];
  onSaveHeroBanners?: (banners: HeroBanner[]) => void;
  coupons?: Coupon[];
  onSaveCoupons?: (coupons: Coupon[]) => void;
  storefront?: StorefrontContent;
  onSaveStorefront?: (content: StorefrontContent) => void;
  onSwitchToCustomerApp: () => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  orders,
  onUpdateOrderStatus,
  onAssignDeliveryPartner,
  menuItems,
  onToggleItemAvailability,
  onAddMenuItem,
  onUpdateMenuItem,
  quotes,
  onUpdateQuoteStatus,
  onUpdateQuote,
  upcomingEvents,
  onAddEvent,
  categories = CATEGORIES,
  onSaveCategories,
  heroBanners = SEED_HERO_BANNERS,
  onSaveHeroBanners,
  coupons = COUPONS,
  onSaveCoupons,
  storefront = SEED_STOREFRONT,
  onSaveStorefront,
  onSwitchToCustomerApp,
  showToast,
}) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const parts = path.split('/').filter(Boolean);
      const sub = parts[0] === 'admin' ? parts[1] : '';
      const hash = window.location.hash.toLowerCase().replace('#admin-', '').replace('#', '');
      const candidate = sub || hash;
      const validTabs: AdminTab[] = [
        'dashboard',
        'orders',
        'menu',
        'catering',
        'events',
        'coupons',
        'storefront',
        'inventory',
        'finances',
        'fleet',
        'staff',
        'support',
      ];
      if (validTabs.includes(candidate as AdminTab)) {
        return candidate as AdminTab;
      }
    }
    return 'dashboard';
  });

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      const targetUrl = tab === 'dashboard' ? '/admin' : `/admin/${tab}`;
      try {
        window.history.pushState(null, '', targetUrl);
      } catch {
        // fallback
      }
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Local Operations State (persisted during session)
  const [inventory, setInventory] = useState<InventoryItem[]>(SEED_INVENTORY);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(SEED_EXPENSES);
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(SEED_VEHICLES);
  const [staff, setStaff] = useState<StaffMember[]>(SEED_STAFF);
  const [tickets, setTickets] = useState<SupportTicket[]>(SEED_SUPPORT_TICKETS);
  const [eventsList, setEventsList] = useState<UpcomingEvent[]>(upcomingEvents);

  // Modals state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<OrderRecord | null>(null);
  const [dispatchMode, setDispatchMode] = useState<'own-vehicle' | 'third-party'>('own-vehicle');
  const [selectedRiderId, setSelectedRiderId] = useState<string>('stf-2');
  const [thirdPartyPartner, setThirdPartyPartner] = useState<string>('Rapido');
  const [customTrackingCode, setCustomTrackingCode] = useState<string>('RAP-HYD-' + Math.floor(10000 + Math.random() * 90000));

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [stockAdjustmentQty, setStockAdjustmentQty] = useState<number>(10);
  const [stockActionType, setStockActionType] = useState<'in' | 'out'>('in');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpenseCat, setNewExpenseCat] = useState<ExpenseRecord['category']>('Raw Ingredients');
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('');
  const [newExpensePaidTo, setNewExpensePaidTo] = useState<string>('');
  const [newExpenseNotes, setNewExpenseNotes] = useState<string>('');

  const [isItemEditModalOpen, setIsItemEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [ingredientsText, setIngredientsText] = useState<string>('');

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<CateringQuote | null>(null);

  // Storefront CMS & Coupons state
  const [storefrontSubTab, setStorefrontSubTab] = useState<
    'banners' | 'categories' | 'contact' | 'terms' | 'privacy'
  >('banners');
  const [draftStorefront, setDraftStorefront] = useState<StorefrontContent>(storefront);
  React.useEffect(() => {
    setDraftStorefront(storefront);
  }, [storefront]);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);
  const [editingCategoryOriginalId, setEditingCategoryOriginalId] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponTargetSearch, setCouponTargetSearch] = useState('');

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDates, setNewEventDates] = useState('');
  const [newEventPrice, setNewEventPrice] = useState('349');
  const [newEventBadge, setNewEventBadge] = useState('Festive Special');

  // Filter states
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStage | 'Catering'>('all');
  const [menuFilterCategory, setMenuFilterCategory] = useState<string>('all');
  const [expenseFilterCategory, setExpenseFilterCategory] = useState<string>('all');

  // Computed Financials
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.stage !== 'Cancelled' ? o.totalAmount : 0), 0);
  }, [orders]);

  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const pendingPaymentsAmount = useMemo(() => {
    // COD orders not yet delivered, or catering quote balance amount
    const codOrders = orders
      .filter((o) => o.paymentMethod.toLowerCase().includes('cash') && o.stage !== 'Delivered')
      .reduce((s, o) => s + o.totalAmount, 0);
    const cateringBalance = quotes
      .filter((q) => q.status === 'Confirmed' || q.status === 'Advance Paid')
      .reduce((s, q) => s + q.balanceAmount, 0);
    return codOrders + cateringBalance;
  }, [orders, quotes]);

  const lowStockCount = useMemo(() => {
    return inventory.filter((i) => i.currentStock <= i.minThreshold).length;
  }, [inventory]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => o.stage !== 'Delivered' && o.stage !== 'Cancelled').length;
  }, [orders]);

  const pendingQuotesCount = useMemo(() => {
    return quotes.filter((q) => q.status === 'Requested' || q.status === 'Quote Sent').length;
  }, [quotes]);

  // Handlers
  const handleAssignDispatchSubmit = () => {
    if (!selectedOrderForDispatch) return;
    if (dispatchMode === 'own-vehicle') {
      const selectedStaff = staff.find((s) => s.id === selectedRiderId);
      const riderName = selectedStaff ? selectedStaff.name : 'Ramu Varma';
      onAssignDeliveryPartner(
        selectedOrderForDispatch.id,
        'own-vehicle',
        riderName
      );
      showToast(`Assigned to ${riderName} (Company Vehicle)`, 'success');
    } else {
      onAssignDeliveryPartner(
        selectedOrderForDispatch.id,
        'third-party',
        thirdPartyPartner,
        customTrackingCode
      );
      showToast(`Assigned to ${thirdPartyPartner} (Tracking: ${customTrackingCode})`, 'success');
    }
    setIsDispatchModalOpen(false);
    setSelectedOrderForDispatch(null);
  };

  const handleStockAdjustmentSubmit = () => {
    if (!selectedInventoryItem) return;
    const qtyChange = stockActionType === 'in' ? Number(stockAdjustmentQty) : -Number(stockAdjustmentQty);
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === selectedInventoryItem.id) {
          const newQty = Math.max(0, item.currentStock + qtyChange);
          let newStatus: InventoryItem['status'] = 'in_stock';
          if (newQty <= 0) newStatus = 'critical';
          else if (newQty <= item.minThreshold) newStatus = 'low_stock';
          return {
            ...item,
            currentStock: newQty,
            status: newStatus,
            lastRestocked: stockActionType === 'in' ? new Date().toISOString().split('T')[0] : item.lastRestocked,
          };
        }
        return item;
      })
    );
    showToast(`Updated stock for ${selectedInventoryItem.name}`, 'success');
    setIsStockModalOpen(false);
    setSelectedInventoryItem(null);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newExpenseAmount);
    if (!amt || amt <= 0 || !newExpensePaidTo.trim()) {
      showToast('Please enter valid amount and payee name', 'error');
      return;
    }
    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      category: newExpenseCat,
      amount: amt,
      paidTo: newExpensePaidTo.trim(),
      paymentMode: 'UPI',
      notes: newExpenseNotes.trim() || 'Logged via Admin Panel',
      receiptNumber: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setExpenses((prev) => [newRecord, ...prev]);
    setNewExpenseAmount('');
    setNewExpensePaidTo('');
    setNewExpenseNotes('');
    setIsExpenseModalOpen(false);
    showToast(`Expense of ₹${amt.toLocaleString()} recorded`, 'success');
  };

  const handleToggleStaffAttendance = (staffId: string) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const nextPresent = !s.isPresentToday;
          return {
            ...s,
            isPresentToday: nextPresent,
            status: nextPresent ? 'Available' : 'On Leave',
          };
        }
        return s;
      })
    );
    showToast('Updated staff attendance', 'info');
  };

  const handleResolveTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'Resolved',
              resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              adminNotes: 'Resolved by Admin. Customer verified via phone/WhatsApp.',
            }
          : t
      )
    );
    showToast('Support ticket marked as Resolved', 'success');
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const newEv: UpcomingEvent = {
      id: `event-${Date.now()}`,
      title: newEventTitle.trim(),
      subtitle: 'Festive Home Meal & Special Catering',
      dateRange: newEventDates.trim() || 'Next Weekend',
      offerBadge: newEventBadge.trim() || 'Special',
      priceLabel: `₹${newEventPrice} / box`,
      basePrice: parseFloat(newEventPrice) || 349,
      veg: true,
      emoji: '🎉',
      tint: 'cream',
      description: 'Special seasonal celebration menu curated by Swastik chefs.',
    };
    setEventsList((prev) => [newEv, ...prev]);
    if (onAddEvent) onAddEvent(newEv);
    setIsEventModalOpen(false);
    setNewEventTitle('');
    setNewEventDates('');
    showToast('Published new festive event & pre-booking menu', 'success');
  };

  const exportReport = (format: 'csv' | 'summary') => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Revenue,Rs ${totalRevenue}\n` +
      `Total Expenses,Rs ${totalExpenseAmount}\n` +
      `Net Operating Profit,Rs ${totalRevenue - totalExpenseAmount}\n` +
      `Total Orders,${orders.length}\n` +
      `Active Orders,${activeOrdersCount}\n` +
      `Pending Quotes,${pendingQuotesCount}\n` +
      `Low Stock Alerts,${lowStockCount}\n` +
      `Staff Present Today,${staff.filter((s) => s.isPresentToday).length} of ${staff.length}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SwastikFoods_Operations_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Operations Report exported successfully as ${format.toUpperCase()}`, 'success');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1E293B] flex flex-col font-sans antialiased">
      {/* Top Header Bar */}
      <header className="bg-[#072E10] text-white px-4 lg:px-6 py-3 border-b border-[#0F5E24] shadow-md sticky top-0 z-40">
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Logo & Platform Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              aria-label="Toggle Navigation"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleSelectTab('dashboard')}>
              <img
                src={SWASTIK_HEADER_LOGO}
                alt="Swastik Foods"
                className="h-9 w-auto object-contain filter drop-shadow-sm"
              />
              <div className="hidden sm:block">
                <div className="text-[14px] font-black tracking-wide text-white flex items-center gap-1.5">
                  <span>SWASTIK FOODS</span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#F5B52E] text-[#072E10]">
                    Admin Web
                  </span>
                </div>
                <div className="text-[11px] text-emerald-200/90 font-medium">
                  Operations &amp; Management Portal
                </div>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-300/80" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, dishes, customers, tickets..."
              className="w-full pl-9 pr-3 py-1.5 text-[12.5px] rounded-full bg-white/10 border border-white/15 text-white placeholder-emerald-200/60 focus:outline-none focus:bg-white/20 focus:border-[#F5B52E] transition-all"
            />
          </div>

          {/* Operational Indicators & Customer App Switcher */}
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2 bg-[#0C4119] border border-emerald-700/50 rounded-full px-3 py-1 text-[11px] text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Kitchen: Open</span>
              <span className="text-white/40">|</span>
              <span>Active Orders: <b className="text-white">{activeOrdersCount}</b></span>
            </div>

            {/* Switch to Customer App Button */}
            <button
              type="button"
              onClick={onSwitchToCustomerApp}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5B52E] hover:bg-[#fabc38] text-[#072E10] font-black text-[12px] shadow-sm transition-all cursor-pointer tap-press"
              title="Switch to customer mobile web experience"
            >
              <ShoppingBag size={14} />
              <span className="hidden sm:inline">View Customer App</span>
              <span className="sm:hidden">App</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full px-3 lg:px-6 py-4 gap-5">
        {/* Left Navigation Sidebar */}
        <aside
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } lg:block w-64 shrink-0 bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 self-start sticky top-20`}
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-2">
            Operations &amp; Management
          </div>
          <nav className="space-y-1 text-[13px] font-semibold">
            {[
              { id: 'dashboard' as AdminTab, label: 'Dashboard Overview', icon: BarChart3 },
              {
                id: 'orders' as AdminTab,
                label: 'Orders & Dispatch',
                icon: ShoppingBag,
                badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
                badgeColor: 'bg-emerald-600',
              },
              { id: 'menu' as AdminTab, label: 'Menu & Products', icon: UtensilsCrossed },
              {
                id: 'catering' as AdminTab,
                label: 'Catering Quotes',
                icon: Layers,
                badge: pendingQuotesCount > 0 ? pendingQuotesCount : undefined,
                badgeColor: 'bg-amber-500',
              },
              { id: 'events' as AdminTab, label: 'Upcoming Events', icon: Calendar },
              {
                id: 'coupons' as AdminTab,
                label: 'Coupons & Offers',
                icon: Tag,
                badge: coupons.filter((c) => c.active !== false).length || undefined,
                badgeColor: 'bg-emerald-600',
              },
              { id: 'storefront' as AdminTab, label: 'Storefront & CMS', icon: Home },
              {
                id: 'inventory' as AdminTab,
                label: 'Raw Stock & Inventory',
                icon: Package,
                badge: lowStockCount > 0 ? lowStockCount : undefined,
                badgeColor: 'bg-rose-500',
              },
              { id: 'finances' as AdminTab, label: 'Payments & Expenses', icon: DollarSign },
              { id: 'fleet' as AdminTab, label: 'Vehicles & Trips', icon: Truck },
              { id: 'staff' as AdminTab, label: 'Staff & Attendance', icon: Users },
              {
                id: 'support' as AdminTab,
                label: 'Support & Reviews',
                icon: MessageSquare,
                badge: tickets.filter((t) => t.status === 'Open').length || undefined,
                badgeColor: 'bg-blue-500',
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#072E10] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className={isActive ? 'text-[#F5B52E]' : 'text-slate-500'} />
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full text-white ${
                        isActive ? 'bg-[#F5B52E] text-[#072E10]' : tab.badgeColor
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Support & Documentation link */}
          <div className="mt-4 pt-3 border-t border-slate-100 px-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Swastik Foods Platform</span>
              <span className="font-bold text-emerald-800">v2.4 (Live)</span>
            </div>
            <div className="text-[10.5px] text-slate-400 mt-1">
              Curries · Home Foods · Catering
            </div>
          </div>
        </aside>

        {/* Center Content Workspace */}
        <main className="flex-1 min-w-0 flex flex-col space-y-5">
          {/* ============================================================== */}
          {/* TAB 1: 6.1 DASHBOARD OVERVIEW                                  */}
          {/* ============================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5 animate-screen-forward">
              {/* Header with Title and Export Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <h1 className="text-[20px] font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Operations Dashboard</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Live Summary
                    </span>
                  </h1>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    Real-time metrics for curries, homestyle meals, and event catering across Hyderabad.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportReport('csv')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[12px] transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => exportReport('summary')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#072E10] hover:bg-[#0B4A1A] text-white font-bold text-[12px] transition-colors cursor-pointer"
                  >
                    <FileText size={14} />
                    <span>Print PDF Report</span>
                  </button>
                </div>
              </div>

              {/* 4 Core Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total & Today's Orders */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[12px] font-bold uppercase tracking-wider">Today's Orders</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <ShoppingBag size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[24px] font-black text-slate-900">
                      {orders.length} <span className="text-[14px] font-normal text-slate-400">orders</span>
                    </div>
                    <div className="text-[11.5px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                      <ArrowUpRight size={14} />
                      <span>{activeOrdersCount} in active kitchen &amp; delivery</span>
                    </div>
                  </div>
                </div>

                {/* 2. Today's Revenue */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[12px] font-bold uppercase tracking-wider">Today's Revenue</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[24px] font-black text-slate-900">
                      ₹{totalRevenue.toLocaleString()}
                    </div>
                    <div className="text-[11.5px] text-slate-500 font-medium mt-1">
                      Avg ticket size: ₹{orders.length ? Math.round(totalRevenue / orders.length) : 0}
                    </div>
                  </div>
                </div>

                {/* 3. Pending Payments */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[12px] font-bold uppercase tracking-wider">Pending Payments</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                      <Clock size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[24px] font-black text-rose-600">
                      ₹{pendingPaymentsAmount.toLocaleString()}
                    </div>
                    <div className="text-[11.5px] text-slate-500 font-medium mt-1">
                      COD + Catering Balances due
                    </div>
                  </div>
                </div>

                {/* 4. Net Operating Margin */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[12px] font-bold uppercase tracking-wider">Operating Profit</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                      <DollarSign size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-[24px] font-black text-[#072E10]">
                      ₹{(totalRevenue - totalExpenseAmount).toLocaleString()}
                    </div>
                    <div className="text-[11.5px] text-slate-500 font-medium mt-1">
                      Expenses: ₹{totalExpenseAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Alert Banners */}
              {(activeOrdersCount > 0 || pendingQuotesCount > 0 || lowStockCount > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeOrdersCount > 0 && (
                    <div
                      onClick={() => handleSelectTab('orders')}
                      className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between cursor-pointer hover:bg-emerald-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag size={18} className="text-emerald-700 shrink-0" />
                        <div>
                          <div className="text-[12.5px] font-bold text-emerald-950">
                            {activeOrdersCount} Active Order{activeOrdersCount > 1 ? 's' : ''}
                          </div>
                          <div className="text-[11px] text-emerald-700">Kitchen &amp; dispatch tracking</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-emerald-600" />
                    </div>
                  )}

                  {pendingQuotesCount > 0 && (
                    <div
                      onClick={() => handleSelectTab('catering')}
                      className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Layers size={18} className="text-amber-700 shrink-0" />
                        <div>
                          <div className="text-[12.5px] font-bold text-amber-950">
                            {pendingQuotesCount} Catering Quote{pendingQuotesCount > 1 ? 's' : ''}
                          </div>
                          <div className="text-[11px] text-amber-700">Awaiting review &amp; quote send</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-amber-600" />
                    </div>
                  )}

                  {lowStockCount > 0 && (
                    <div
                      onClick={() => handleSelectTab('inventory')}
                      className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between cursor-pointer hover:bg-rose-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle size={18} className="text-rose-700 shrink-0" />
                        <div>
                          <div className="text-[12.5px] font-bold text-rose-950">
                            {lowStockCount} Low Stock Item{lowStockCount > 1 ? 's' : ''}
                          </div>
                          <div className="text-[11px] text-rose-700">Restock needed for kitchen</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-rose-600" />
                    </div>
                  )}
                </div>
              )}

              {/* Service Breakdown & 7-Day Trend Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* 7-Day Order Activity Simulated Visual Chart */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900">Weekly Revenue &amp; Orders Trend</h3>
                      <p className="text-[11.5px] text-slate-500">Daily performance across all 3 services</p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                      Last 7 Days
                    </span>
                  </div>

                  {/* Chart Bars */}
                  <div className="grid grid-cols-7 gap-2 h-44 items-end pt-4 pb-2 border-b border-slate-100">
                    {[
                      { day: 'Fri', orders: 18, rev: 4200, height: '45%' },
                      { day: 'Sat', orders: 28, rev: 8900, height: '80%' },
                      { day: 'Sun', orders: 34, rev: 11400, height: '95%' },
                      { day: 'Mon', orders: 14, rev: 3500, height: '35%' },
                      { day: 'Tue', orders: 19, rev: 4800, height: '48%' },
                      { day: 'Wed', orders: 22, rev: 5600, height: '56%' },
                      { day: 'Today', orders: orders.length, rev: totalRevenue, height: '75%', active: true },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{item.rev}
                        </span>
                        <div
                          style={{ height: item.height }}
                          className={`w-full max-w-[36px] rounded-t-lg transition-all ${
                            item.active
                              ? 'bg-gradient-to-t from-[#072E10] to-[#147437]'
                              : 'bg-emerald-100 group-hover:bg-emerald-200'
                          }`}
                        />
                        <span
                          className={`text-[11px] ${
                            item.active ? 'font-black text-emerald-900' : 'text-slate-400 font-medium'
                          }`}
                        >
                          {item.day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11.5px] text-slate-500 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#072E10]"></span>
                      <span>Today's active volume</span>
                    </div>
                    <span>Highest day: <b>Sunday (₹11,400)</b></span>
                  </div>
                </div>

                {/* Service Breakdown (Curries vs Home Foods vs Catering) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900">Service Breakdown</h3>
                    <p className="text-[11.5px] text-slate-500">Distribution of orders by business vertical</p>

                    <div className="space-y-4 mt-5">
                      {/* Curries */}
                      <div>
                        <div className="flex items-center justify-between text-[12.5px] font-semibold mb-1">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span>🍛</span> Curries (250ml - 1L)
                          </span>
                          <span className="font-bold text-slate-900">46%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: '46%' }}></div>
                        </div>
                      </div>

                      {/* Home Foods */}
                      <div>
                        <div className="flex items-center justify-between text-[12.5px] font-semibold mb-1">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span>🍱</span> Home Foods &amp; Bulk
                          </span>
                          <span className="font-bold text-slate-900">38%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: '38%' }}></div>
                        </div>
                      </div>

                      {/* Event Catering */}
                      <div>
                        <div className="flex items-center justify-between text-[12.5px] font-semibold mb-1">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <span>🍽️</span> Event &amp; Party Catering
                          </span>
                          <span className="font-bold text-slate-900">16%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: '16%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                    💡 <b>Opportunity:</b> Bulk orders of South Indian thali boxes are up 24% for IT office lunches this week.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: 6.5 ORDER MANAGEMENT & DISPATCH (Scope 4 & 6.5)         */}
          {/* ============================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-screen-forward">
              {/* Header and Filter Tabs */}
              <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-[19px] font-black text-slate-900">Order Management &amp; Dispatch</h1>
                    <p className="text-[12px] text-slate-500">
                      Live dispatch control: Assign company riders or Rapido/third-party partners.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-slate-500 font-medium">Filter:</span>
                    <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-[12px]">
                      {(['all', 'Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'] as const).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setOrderFilter(st)}
                            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              orderFilter === st
                                ? 'bg-[#072E10] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {st === 'all' ? 'All Orders' : st}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders List / Table */}
              <div className="space-y-3">
                {orders
                  .filter((o) => (orderFilter === 'all' ? true : o.stage === orderFilter))
                  .map((order) => {
                    const isCompleted = order.stage === 'Delivered';
                    return (
                      <div
                        key={order.id}
                        className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          {/* Left: Order ID, Time, Customer */}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-[13px] shrink-0">
                              #{order.id.slice(-4)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[15px] font-bold text-slate-900">{order.id}</span>
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                    order.stage === 'Placed'
                                      ? 'bg-amber-100 text-amber-800'
                                      : order.stage === 'Accepted'
                                      ? 'bg-blue-100 text-blue-800'
                                      : order.stage === 'Preparing'
                                      ? 'bg-purple-100 text-purple-800'
                                      : order.stage === 'Out for Delivery'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {order.stage}
                                </span>
                                <span className="text-[11.5px] text-slate-400 font-medium">
                                  {order.deliverySlot}
                                </span>
                              </div>
                              <div className="text-[12.5px] text-slate-600 mt-0.5 flex items-center gap-2">
                                <span>Customer: <b>{order.address.label}</b></span>
                                <span>·</span>
                                <span>{order.address.distanceKm} km away</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Payment & Amount */}
                          <div className="flex items-center gap-3 md:text-right">
                            <div>
                              <div className="text-[17px] font-black text-slate-900">
                                ₹{order.totalAmount}
                              </div>
                              <div className="text-[11px] font-semibold text-slate-500">
                                Mode: <b className="text-emerald-800">{order.paymentMethod}</b>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Items & Delivery Assignment Details */}
                        <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-[12.5px]">
                          {/* Items Summary */}
                          <div className="md:col-span-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Ordered Dishes
                            </span>
                            <div className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              {order.itemsSummary}
                            </div>
                            <div className="text-[11.5px] text-slate-500 mt-1">
                              Delivery to: {order.address.fullAddress}
                            </div>
                          </div>

                          {/* Dispatch & Driver Details */}
                          <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Delivery Partner Mode
                            </span>
                            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 text-[12px]">
                              {order.trackingType === 'own-vehicle' ? (
                                <div>
                                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                                    <Truck size={14} className="text-emerald-700" />
                                    <span>Company Staff Delivery</span>
                                  </div>
                                  <div className="text-emerald-800 text-[11px] mt-0.5">
                                    Rider: <b>{order.riderName || 'Ramu Varma'}</b> ({order.riderPhone || '9849012345'})
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                                    <Truck size={14} className="text-amber-700" />
                                    <span>Third-Party ({order.thirdPartyPartner || 'Rapido'})</span>
                                  </div>
                                  <div className="text-amber-800 text-[11px] mt-0.5">
                                    Tracking ID: <b className="font-mono">{order.thirdPartyTrackingCode || 'RAP-99120'}</b>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Status Transition & Dispatch Assignment */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderForDispatch(order);
                                setIsDispatchModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11.5px] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Truck size={13} />
                              <span>Assign / Change Partner</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast(`Receipt generated for order ${order.id}`, 'info')}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[11.5px] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <FileText size={13} />
                              <span>KOT Slip</span>
                            </button>
                          </div>

                          {/* Quick Stage Controls */}
                          <div className="flex items-center gap-1.5">
                            {order.stage === 'Placed' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateOrderStatus(order.id, 'Accepted');
                                  showToast(`Order ${order.id} accepted!`, 'success');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11.5px] transition-colors cursor-pointer"
                              >
                                Accept Order ✓
                              </button>
                            )}
                            {order.stage === 'Accepted' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateOrderStatus(order.id, 'Preparing');
                                  showToast(`Order ${order.id} moved to Kitchen Preparing`, 'info');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11.5px] transition-colors cursor-pointer"
                              >
                                Send to Kitchen →
                              </button>
                            )}
                            {order.stage === 'Preparing' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateOrderStatus(order.id, 'Out for Delivery');
                                  showToast(`Order ${order.id} is Out for Delivery!`, 'info');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11.5px] transition-colors cursor-pointer"
                              >
                                Mark Out for Delivery →
                              </button>
                            )}
                            {order.stage === 'Out for Delivery' && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateOrderStatus(order.id, 'Delivered');
                                  showToast(`Order ${order.id} marked as Delivered!`, 'success');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11.5px] transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 size={13} />
                                <span>Confirm Delivered</span>
                              </button>
                            )}
                            {isCompleted && (
                              <span className="text-[11.5px] font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 size={14} /> Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: 6.2 PRODUCT & CATEGORY MANAGEMENT                       */}
          {/* ============================================================== */}
          {activeTab === 'menu' && (
            <div className="space-y-4 animate-screen-forward">
              {/* Header and Add Dish Action */}
              <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-[19px] font-black text-slate-900">Product &amp; Category Management</h1>
                  <p className="text-[12px] text-slate-500">
                    Control menu availability, bulk pricing slabs, descriptions, and stock status.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingItem({
                        id: `item-${Date.now()}`,
                        name: '',
                        category: 'curries',
                        veg: true,
                        description: '',
                        rating: 4.8,
                        reviews: '24 reviews',
                        sizeOptions: [
                          { label: '250ml (1 Person)', price: 149, isDefault: true },
                          { label: '500ml (2-3 Persons)', price: 279 },
                          { label: '1000ml (Family Pack)', price: 499 },
                        ],
                        addons: [],
                        image: 'curries',
                        emoji: '🍛',
                        tint: 'peach',
                        ingredients: [],
                      });
                      setIngredientsText('');
                      setIsItemEditModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#072E10] hover:bg-[#0B4A1A] text-white font-bold text-[12px] transition-colors cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Add New Dish</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[12px]">
                {['all', 'curries', 'home-foods', 'biryani', 'catering', 'tiffins', 'snacks', 'sweets'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setMenuFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                        menuFilterCategory === cat
                          ? 'bg-[#072E10] text-[#F5B52E] shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      {cat === 'all'
                        ? 'All Categories'
                        : cat === 'curries'
                        ? '🍛 Curries'
                        : cat === 'home-foods'
                        ? '🍱 Home Foods'
                        : cat === 'biryani'
                        ? '🍲 Biryani'
                        : cat === 'catering'
                        ? '🍽️ Catering'
                        : cat}
                    </button>
                  )
                )}
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems
                  .filter((m) =>
                    menuFilterCategory === 'all' ? true : m.category === menuFilterCategory
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                                item.veg
                                  ? 'border-emerald-600 bg-emerald-50'
                                  : 'border-rose-600 bg-rose-50'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.veg ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              />
                            </span>
                            <h3 className="text-[14.5px] font-bold text-slate-900 leading-snug">
                              {item.name}
                            </h3>
                          </div>
                          {item.bestseller && (
                            <span className="text-[9.5px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 shrink-0">
                              Bestseller
                            </span>
                          )}
                        </div>

                        <p className="text-[11.5px] text-slate-500 mt-2 line-clamp-2">
                          {item.description}
                        </p>

                        {item.ingredients && item.ingredients.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {item.ingredients.slice(0, 4).map((ing) => (
                              <span
                                key={ing}
                                className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/60 text-[10px] font-medium text-amber-900"
                              >
                                {ing}
                              </span>
                            ))}
                            {item.ingredients.length > 4 && (
                              <span className="text-[10px] text-slate-400 font-semibold px-1">
                                +{item.ingredients.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price Options Preview */}
                        <div className="mt-3 bg-slate-50 p-2 rounded-xl text-[11px] text-slate-700 space-y-1">
                          {item.sizeOptions.map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-slate-500">{s.label}</span>
                              <span className="font-bold text-slate-900">₹{s.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Controls: In Stock + Today's Special + Edit */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              onToggleItemAvailability(item.id);
                              showToast(`Updated availability for ${item.name}`, 'info');
                            }}
                            className="flex items-center gap-1.5 cursor-pointer group"
                          >
                            <div
                              className={`w-7 h-4 rounded-full transition-colors relative ${
                                item.rating > 0 ? 'bg-emerald-600' : 'bg-slate-300'
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                                  item.rating > 0 ? 'left-3.5' : 'left-0.5'
                                }`}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-600">In Stock</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...item, isSpecial: !item.isSpecial };
                              onUpdateMenuItem?.(next);
                              showToast(
                                next.isSpecial
                                  ? `Added ${item.name} to Today's Specials`
                                  : `Removed ${item.name} from Today's Specials`,
                                'info'
                              );
                            }}
                            className="flex items-center gap-1.5 cursor-pointer group"
                          >
                            <div
                              className={`w-7 h-4 rounded-full transition-colors relative ${
                                item.isSpecial ? 'bg-amber-500' : 'bg-slate-300'
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                                  item.isSpecial ? 'left-3.5' : 'left-0.5'
                                }`}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-amber-800">Special</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item);
                            setIngredientsText((item.ingredients || []).join(', '));
                            setIsItemEditModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: 6.5 CATERING QUOTE & CONFIRMATION MANAGEMENT            */}
          {/* ============================================================== */}
          {activeTab === 'catering' && (
            <div className="space-y-4 animate-screen-forward">
              {/* Header */}
              <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-[19px] font-black text-slate-900">Event Catering Quotes &amp; Bookings</h1>
                  <p className="text-[12px] text-slate-500">
                    Review guest counts, venue dates, menu choices, and send customized pricing estimates.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                    {quotes.length} Total Inquiries
                  </span>
                </div>
              </div>

              {/* Quotes List */}
              <div className="space-y-3">
                {quotes.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[16px] font-black text-slate-900">
                            {q.eventType} ({q.guestCount} Guests)
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                              q.status === 'Requested'
                                ? 'bg-amber-100 text-amber-800'
                                : q.status === 'Quote Sent'
                                ? 'bg-blue-100 text-blue-800'
                                : q.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : q.status === 'Advance Paid'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {q.status}
                          </span>
                        </div>
                        <div className="text-[12px] text-slate-500 mt-0.5 flex items-center gap-3">
                          <span>Quote #{q.id}</span>
                          <span>·</span>
                          <span>Event Date: <b>{q.eventDate} ({q.eventTime})</b></span>
                          <span>·</span>
                          <span>Venue: <b>{q.venueAddress}</b></span>
                        </div>
                      </div>

                      {/* Estimate Pricing */}
                      <div className="md:text-right">
                        <div className="text-[18px] font-black text-slate-900">
                          ₹{q.totalEstimate.toLocaleString()}
                        </div>
                        <div className="text-[11.5px] text-slate-500">
                          Advance: ₹{q.advanceAmount.toLocaleString()} · Balance: ₹{q.balanceAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Dishes Selected & Custom Notes */}
                    <div className="py-3 text-[12px] space-y-2">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                          Customer Selected Items ({q.selectedDishes.length}) · {q.dietPreference}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {q.selectedDishes.length > 0 ? (
                            q.selectedDishes.map((dish) => (
                              <span
                                key={dish}
                                className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-semibold"
                              >
                                {dish}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500">Custom Chef Package</span>
                          )}
                        </div>
                      </div>
                      {q.customNotes && (
                        <div className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <b>Details &amp; Notes:</b> {q.customNotes}
                        </div>
                      )}
                    </div>

                    {/* Actions: Adjust Price, Send Quote, Confirm Advance */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[11.5px] text-slate-500 flex flex-wrap items-center gap-2">
                        <span>
                          Menu: <b className="text-emerald-800">{q.packageName}</b>
                        </span>
                        <span>·</span>
                        <span>
                          ₹{q.perPlateEstimate}/plate × {q.guestCount}
                        </span>
                        <span>·</span>
                        <span>Setup: ₹{q.serviceCharge.toLocaleString()}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuote({ ...q });
                            setIsQuoteModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11.5px] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 size={12} />
                          <span>Adjust Price</span>
                        </button>
                        {q.status === 'Requested' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateQuoteStatus(q.id, 'Quote Sent');
                              showToast(`Sent quotation of ₹${q.totalEstimate} to customer`, 'success');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#072E10] hover:bg-[#0B4A1A] text-white font-bold text-[11.5px] transition-colors cursor-pointer"
                          >
                            Send Formal Quote →
                          </button>
                        )}
                        {q.status === 'Quote Sent' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateQuoteStatus(q.id, 'Confirmed');
                              showToast(`Event quote #${q.id} marked as Confirmed!`, 'success');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11.5px] transition-colors cursor-pointer"
                          >
                            Mark as Confirmed ✓
                          </button>
                        )}
                        {q.status === 'Confirmed' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateQuoteStatus(q.id, 'Advance Paid');
                              showToast(`Recorded Advance Payment of ₹${q.advanceAmount}`, 'success');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11.5px] transition-colors cursor-pointer"
                          >
                            Record Advance Paid (₹{q.advanceAmount}) ✓
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => showToast(`Opened WhatsApp chat for quote #${q.id}`, 'info')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11.5px] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Send size={12} />
                          <span>WhatsApp Quote</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: 6.3 UPCOMING FESTIVE EVENTS & PRE-BOOKINGS              */}
          {/* ============================================================== */}
          {activeTab === 'events' && (
            <div className="space-y-4 animate-screen-forward">
              <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-[19px] font-black text-slate-900">Upcoming Festive Events &amp; Special Menus</h1>
                  <p className="text-[12px] text-slate-500">
                    Publish seasonal festival pre-booking menus (Sankranti, Ugadi, Diwali, Weekend Biryani Fests).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#072E10] hover:bg-[#0B4A1A] text-white font-bold text-[12px] transition-colors cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Create Festive Event</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventsList.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                          {ev.offerBadge}
                        </span>
                        <span className="text-[11.5px] font-bold text-emerald-800">
                          {ev.priceLabel}
                        </span>
                      </div>
                      <h3 className="text-[16px] font-black text-slate-900 mt-2">
                        {ev.emoji} {ev.title}
                      </h3>
                      <div className="text-[12px] font-semibold text-slate-600 mt-0.5">
                        📅 {ev.dateRange}
                      </div>
                      <p className="text-[12px] text-slate-500 mt-2">
                        {ev.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11.5px]">
                      <span className="text-emerald-700 font-bold">Pre-bookings Open</span>
                      <button
                        type="button"
                        onClick={() => showToast(`Pre-booking details for ${ev.title}`, 'info')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        View Orders
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: COUPONS & TARGETED OFFERS CRUD                            */}
          {/* ============================================================== */}
          {activeTab === 'coupons' && (
            <div className="space-y-4 animate-screen-forward">
              <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-[19px] font-black text-slate-900">Coupons &amp; Promotional Offers</h1>
                  <p className="text-[12px] text-slate-500">
                    Create targeted coupons for all users, an individual customer, selected people, or specific dishes/categories.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCoupon({
                      id: `cpn-${Date.now()}`,
                      code: '',
                      title: '',
                      description: '',
                      discountAmount: 50,
                      minOrder: 300,
                      isPercent: false,
                      active: true,
                      scope: 'all',
                      targetCustomerIds: [],
                      targetProductIds: [],
                      targetCategoryIds: [],
                    });
                    setCouponTargetSearch('');
                    setIsCouponModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#072E10] hover:bg-[#0B4A1A] text-white font-bold text-[12px] cursor-pointer shrink-0"
                >
                  <Plus size={15} />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coupons.map((cpn) => {
                  const scopeLabel =
                    cpn.scope === 'individual'
                      ? 'Individual Person Only'
                      : cpn.scope === 'selected_people'
                        ? `Selected People (${(cpn.targetCustomerIds || []).length})`
                        : cpn.scope === 'selected_products'
                          ? `Selected Products (${(cpn.targetProductIds || []).length})`
                          : cpn.scope === 'selected_categories'
                            ? `Selected Categories (${(cpn.targetCategoryIds || []).length})`
                            : 'All Customers';

                  const targetSummary =
                    cpn.scope === 'individual' || cpn.scope === 'selected_people'
                      ? CUSTOMER_DIRECTORY.filter((c) => (cpn.targetCustomerIds || []).includes(c.id))
                          .map((c) => `${c.name} (${c.phone})`)
                          .join(', ')
                      : cpn.scope === 'selected_products'
                        ? menuItems
                            .filter((m) => (cpn.targetProductIds || []).includes(m.id))
                            .map((m) => m.name)
                            .join(', ')
                        : cpn.scope === 'selected_categories'
                          ? categories
                              .filter((cat) => (cpn.targetCategoryIds || []).includes(cat.id))
                              .map((cat) => cat.title)
                              .join(', ')
                          : 'Eligible for every customer order';

                  return (
                    <div
                      key={cpn.id || cpn.code}
                      className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono font-black text-[13px]">
                              {cpn.code}
                            </span>
                            <span className="text-[12px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                              {cpn.isPercent ? `${cpn.discountAmount}% OFF` : `Flat ₹${cpn.discountAmount} OFF`}
                            </span>
                          </div>
                          <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {scopeLabel}
                          </span>
                        </div>

                        <h3 className="text-[14.5px] font-bold text-slate-900 mt-2">{cpn.title}</h3>
                        <p className="text-[11.5px] text-slate-500 mt-0.5">{cpn.description}</p>
                        <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 rounded-xl p-2.5 space-y-1">
                          <div>
                            <b>Min Order:</b> ₹{cpn.minOrder}
                            {cpn.expiresAt ? ` · Expires: ${cpn.expiresAt}` : ''}
                          </div>
                          <div className="line-clamp-2">
                            <b>Target:</b> {targetSummary || 'None selected'}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = coupons.map((item) =>
                              (item.id || item.code) === (cpn.id || cpn.code)
                                ? { ...item, active: item.active === false }
                                : item
                            );
                            onSaveCoupons?.(updated);
                            showToast(
                              `${cpn.code} ${cpn.active === false ? 'activated' : 'paused'}`,
                              'info'
                            );
                          }}
                          className="flex items-center gap-1.5 cursor-pointer"
                        >
                          <div
                            className={`w-8 h-4 rounded-full transition-colors relative ${
                              cpn.active !== false ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <div
                              className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                                cpn.active !== false ? 'left-4.5' : 'left-0.5'
                              }`}
                            />
                          </div>
                          <span className="text-[11.5px] font-bold text-slate-600">
                            {cpn.active !== false ? 'Active' : 'Paused'}
                          </span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCoupon({ ...cpn, scope: cpn.scope || 'all' });
                              setCouponTargetSearch('');
                              setIsCouponModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const next = coupons.filter(
                                (item) => (item.id || item.code) !== (cpn.id || cpn.code)
                              );
                              onSaveCoupons?.(next);
                              showToast(`Deleted coupon ${cpn.code}`, 'info');
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] cursor-pointer"
                            aria-label="Delete coupon"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: STOREFRONT & CMS (BANNERS, CATEGORIES, CONTACT, LEGAL)    */}
          {/* ============================================================== */}
          {activeTab === 'storefront' && (
            <div className="space-y-4 animate-screen-forward">
              <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h1 className="text-[19px] font-black text-slate-900">Storefront &amp; Pages CMS</h1>
                    <p className="text-[12px] text-slate-500">
                      Manage Hero Banners, Categories, Contact Us, Terms &amp; Conditions, and Privacy Policy live.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[12px]">
                  {(
                    [
                      { id: 'banners', label: 'Hero Banners' },
                      { id: 'categories', label: 'Categories' },
                      { id: 'contact', label: 'Contact Us Page' },
                      { id: 'terms', label: 'Terms & Conditions' },
                      { id: 'privacy', label: 'Privacy Policy' },
                    ] as const
                  ).map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setStorefrontSubTab(sub.id)}
                      className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap cursor-pointer transition-all ${
                        storefrontSubTab === sub.id
                          ? 'bg-[#072E10] text-[#F5B52E]'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SUB-TAB 1: HERO BANNERS */}
              {storefrontSubTab === 'banners' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBanner({
                          id: `banner-${Date.now()}`,
                          title: '',
                          bannerImage: '/assets/brand/hero_homestyle_banner.jpg',
                          target: 'home-foods',
                          active: true,
                        });
                        setIsBannerModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12px] cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Post Hero Banner</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {heroBanners.map((b) => (
                      <div
                        key={b.id}
                        className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-32 bg-slate-100 relative overflow-hidden">
                            <img
                              src={b.bannerImage}
                              alt={b.title}
                              className="w-full h-full object-cover"
                            />
                            <span
                              className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                b.active
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-700 text-white'
                              }`}
                            >
                              {b.active ? 'Live' : 'Hidden'}
                            </span>
                          </div>
                          <div className="p-3.5">
                            <h3 className="text-[13.5px] font-bold text-slate-900">{b.title}</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Links to: <b>{b.target}</b>
                            </p>
                          </div>
                        </div>

                        <div className="px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              const next = heroBanners.map((x) =>
                                x.id === b.id ? { ...x, active: !x.active } : x
                              );
                              onSaveHeroBanners?.(next);
                              showToast(
                                `Banner "${b.title}" ${b.active ? 'hidden' : 'published'}`,
                                'info'
                              );
                            }}
                            className="text-[11.5px] font-bold text-emerald-700 cursor-pointer"
                          >
                            {b.active ? 'Hide Banner' : 'Publish Banner'}
                          </button>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBanner({ ...b });
                                setIsBannerModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onSaveHeroBanners?.(heroBanners.filter((x) => x.id !== b.id));
                                showToast('Banner removed', 'info');
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-[11px] cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: CATEGORIES */}
              {storefrontSubTab === 'categories' && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory({
                          id: 'curries',
                          title: '',
                          subtitle: '',
                          emoji: '🍛',
                          tint: '#FCE3D4',
                          image: 'curries',
                        });
                        setEditingCategoryOriginalId(null);
                        setIsCategoryModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12px] cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Add Category</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            style={{ backgroundColor: cat.tint }}
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                          >
                            {cat.emoji}
                          </div>
                          <div>
                            <h3 className="text-[14px] font-bold text-slate-900">{cat.title}</h3>
                            <p className="text-[11.5px] text-slate-500">{cat.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory({ ...cat });
                              setEditingCategoryOriginalId(cat.id);
                              setIsCategoryModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onSaveCategories?.(categories.filter((c) => c.id !== cat.id));
                              showToast(`Removed category ${cat.title}`, 'info');
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-[11px] cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: CONTACT US PAGE */}
              {storefrontSubTab === 'contact' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 max-w-2xl">
                  <h2 className="text-[15px] font-black text-slate-900">Contact Us Page Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Support Phone:</label>
                      <input
                        type="text"
                        value={draftStorefront.contactUs.phone}
                        onChange={(e) =>
                          setDraftStorefront({
                            ...draftStorefront,
                            contactUs: { ...draftStorefront.contactUs, phone: e.target.value },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11.5px] font-bold text-slate-700 block mb-1">WhatsApp Number:</label>
                      <input
                        type="text"
                        value={draftStorefront.contactUs.whatsapp}
                        onChange={(e) =>
                          setDraftStorefront({
                            ...draftStorefront,
                            contactUs: { ...draftStorefront.contactUs, whatsapp: e.target.value },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Support Email:</label>
                      <input
                        type="email"
                        value={draftStorefront.contactUs.email}
                        onChange={(e) =>
                          setDraftStorefront({
                            ...draftStorefront,
                            contactUs: { ...draftStorefront.contactUs, email: e.target.value },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Operating Hours:</label>
                      <input
                        type="text"
                        value={draftStorefront.contactUs.hours}
                        onChange={(e) =>
                          setDraftStorefront({
                            ...draftStorefront,
                            contactUs: { ...draftStorefront.contactUs, hours: e.target.value },
                          })
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Kitchen Address:</label>
                    <input
                      type="text"
                      value={draftStorefront.contactUs.address}
                      onChange={(e) =>
                        setDraftStorefront({
                          ...draftStorefront,
                          contactUs: { ...draftStorefront.contactUs, address: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Support Note:</label>
                    <textarea
                      rows={2}
                      value={draftStorefront.contactUs.supportNote}
                      onChange={(e) =>
                        setDraftStorefront({
                          ...draftStorefront,
                          contactUs: { ...draftStorefront.contactUs, supportNote: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSaveStorefront?.(draftStorefront);
                      showToast('Updated Contact Us page on storefront!', 'success');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12.5px] cursor-pointer"
                  >
                    Save Contact Us
                  </button>
                </div>
              )}

              {/* SUB-TAB 4: TERMS & CONDITIONS */}
              {storefrontSubTab === 'terms' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 max-w-3xl">
                  <h2 className="text-[15px] font-black text-slate-900">Terms &amp; Conditions Page</h2>
                  <textarea
                    rows={10}
                    value={draftStorefront.termsAndConditions}
                    onChange={(e) =>
                      setDraftStorefront({ ...draftStorefront, termsAndConditions: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 text-[13px] leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSaveStorefront?.(draftStorefront);
                      showToast('Published updated Terms & Conditions!', 'success');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12.5px] cursor-pointer"
                  >
                    Save Terms &amp; Conditions
                  </button>
                </div>
              )}

              {/* SUB-TAB 5: PRIVACY POLICY */}
              {storefrontSubTab === 'privacy' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 max-w-3xl">
                  <h2 className="text-[15px] font-black text-slate-900">Privacy Policy Page</h2>
                  <textarea
                    rows={10}
                    value={draftStorefront.privacyPolicy}
                    onChange={(e) =>
                      setDraftStorefront({ ...draftStorefront, privacyPolicy: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 text-[13px] leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onSaveStorefront?.(draftStorefront);
                      showToast('Published updated Privacy Policy!', 'success');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12.5px] cursor-pointer"
                  >
                    Save Privacy Policy
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: 6.4 RAW MATERIAL & INVENTORY MANAGEMENT                 */}
          {/* ============================================================== */}
          {activeTab === 'inventory' && (
            <div className="space-y-4 animate-screen-forward">
              <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-[19px] font-black text-slate-900">Raw Material &amp; Stock Inventory</h1>
                  <p className="text-[12px] text-slate-500">
                    Track kitchen supplies, packaging materials, and automated low-stock warnings.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800">
                    {lowStockCount} Items Low Stock
                  </span>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Item Name</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Current Stock</th>
                        <th className="py-3 px-3">Min Threshold</th>
                        <th className="py-3 px-3">Cost / Unit</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {inventory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-400">
                              Linked to: {item.linkedDishes.slice(0, 2).join(', ')}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{item.category}</td>
                          <td className="py-3 px-3 font-black text-slate-900">
                            {item.currentStock} {item.unit}
                          </td>
                          <td className="py-3 px-3 text-slate-500 font-medium">
                            {item.minThreshold} {item.unit}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            ₹{item.costPerUnit}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                item.status === 'in_stock'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.status === 'low_stock'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedInventoryItem(item);
                                setIsStockModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11.5px] cursor-pointer"
                            >
                              Adjust Stock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: 6.6 PAYMENTS & EXPENDITURE MANAGEMENT                   */}
          {/* ============================================================== */}
          {activeTab === 'finances' && (
            <div className="space-y-4 animate-screen-forward">
              <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-[19px] font-black text-slate-900">Payments &amp; Expenditure Ledger</h1>
                  <p className="text-[12px] text-slate-500">
                    Track ingredients, fuel, staff salaries, maintenance, and operating profit reports.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#072E10] hover:bg-[#0B4A1A] text-white font-bold text-[12px] transition-colors cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Record New Expense</span>
                </button>
              </div>

              {/* Finance Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Inflow (Sales)
                  </div>
                  <div className="text-[22px] font-black text-emerald-800 mt-1">
                    ₹{totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Orders &amp; Advance payments</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Outflow (Expenses)
                  </div>
                  <div className="text-[22px] font-black text-rose-600 mt-1">
                    ₹{totalExpenseAmount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Ingredients, fuel, salaries</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Net Operating Profit
                  </div>
                  <div className="text-[22px] font-black text-[#072E10] mt-1">
                    ₹{(totalRevenue - totalExpenseAmount).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    Operating healthy margin
                  </div>
                </div>
              </div>

              {/* Expenses Log Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-[14px] font-bold text-slate-900">Recent Operating Expenses</h3>
                  <span className="text-[11px] text-slate-500 font-medium">All vouchers signed</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Paid To</th>
                        <th className="py-3 px-3">Mode</th>
                        <th className="py-3 px-3">Notes</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-[12px] text-slate-600">{exp.date}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800">{exp.category}</td>
                          <td className="py-3 px-3 text-slate-700">{exp.paidTo}</td>
                          <td className="py-3 px-3 text-[11.5px] font-bold text-slate-600">{exp.paymentMode}</td>
                          <td className="py-3 px-3 text-slate-500 text-[12px]">{exp.notes}</td>
                          <td className="py-3 px-4 text-right font-black text-slate-900">
                            ₹{exp.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 8: 6.7 VEHICLE FLEET & TRIP MANAGEMENT                     */}
          {/* ============================================================== */}
          {activeTab === 'fleet' && (
            <div className="space-y-4 animate-screen-forward">
              <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-[19px] font-black text-slate-900">Vehicle Fleet &amp; Trip Log</h1>
                  <p className="text-[12px] text-slate-500">
                    Company vehicles for bulk food drops, catering setups, insurance, and service tracking.
                  </p>
                </div>
                <div className="text-[12px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {vehicles.length} Active Vehicles
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vehicles.map((veh) => (
                  <div
                    key={veh.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {veh.registrationNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            veh.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : veh.status === 'On Delivery'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {veh.status}
                        </span>
                      </div>

                      <h3 className="text-[15px] font-black text-slate-900 mt-2 flex items-center gap-2">
                        <Truck size={17} className="text-[#072E10]" />
                        <span>{veh.type}</span>
                      </h3>

                      <div className="mt-3 space-y-1.5 text-[12px] bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Driver:</span>
                          <span className="font-bold text-slate-900">{veh.driverName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Fuel:</span>
                          <span className="font-medium text-slate-700">{veh.fuelType}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Total Trips:</span>
                          <span className="font-bold text-emerald-800">{veh.totalTripsCompleted}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Insurance Valid:</span>
                          <span className="font-mono text-slate-700">{veh.insuranceValidUntil}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Last serviced: {veh.lastServiceDate}</span>
                      <button
                        type="button"
                        onClick={() => showToast(`Trip logs for ${veh.registrationNumber}`, 'info')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                      >
                        Trip Log
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 9: 6.8 STAFF & ATTENDANCE MANAGEMENT                       */}
          {/* ============================================================== */}
          {activeTab === 'staff' && (
            <div className="space-y-4 animate-screen-forward">
              <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-[19px] font-black text-slate-900">Staff Roster &amp; Attendance</h1>
                  <p className="text-[12px] text-slate-500">
                    Manage kitchen chefs, delivery executives, catering supervisors, and salary roles.
                  </p>
                </div>
                <div className="text-[12px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  {staff.filter((s) => s.isPresentToday).length} of {staff.length} Present Today
                </div>
              </div>

              {/* Staff Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Staff Name</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Phone</th>
                        <th className="py-3 px-3">Monthly Salary</th>
                        <th className="py-3 px-3">Completed Trips</th>
                        <th className="py-3 px-3">Today's Attendance</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staff.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{st.name}</div>
                            <div className="text-[11px] text-slate-400">Rating: ⭐ {st.rating}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded text-[11.5px]">
                              {st.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">{st.phone}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            ₹{st.monthlySalary.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">{st.ordersCompleted}</td>
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => handleToggleStaffAttendance(st.id)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                                st.isPresentToday
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                              }`}
                            >
                              {st.isPresentToday ? '✓ Present' : '✕ On Leave'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => showToast(`Viewing profile for ${st.name}`, 'info')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 10: 6.9 USER & SUPPORT MANAGEMENT                          */}
          {/* ============================================================== */}
          {activeTab === 'support' && (
            <div className="space-y-4 animate-screen-forward">
              <div className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-[19px] font-black text-slate-900">User Inquiries &amp; Support Tickets</h1>
                  <p className="text-[12px] text-slate-500">
                    Resolve customer feedback, packaging queries, catering questions, and refunds.
                  </p>
                </div>
                <div className="text-[12px] font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  {tickets.filter((t) => t.status === 'Open').length} Open Tickets
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold text-slate-900">{t.subject}</span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                              t.status === 'Open'
                                ? 'bg-rose-100 text-rose-800'
                                : t.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {t.status}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              t.priority === 'High'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {t.priority} Priority
                          </span>
                        </div>
                        <div className="text-[11.5px] text-slate-500 mt-0.5">
                          From: <b>{t.customerName}</b> ({t.customerPhone}) · Logged: {t.createdAt}
                        </div>
                      </div>

                      {t.status !== 'Resolved' && (
                        <button
                          type="button"
                          onClick={() => handleResolveTicket(t.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11.5px] transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          Mark as Resolved ✓
                        </button>
                      )}
                    </div>

                    <div className="py-2.5 text-[12.5px] text-slate-700">{t.message}</div>

                    {t.adminNotes && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11.5px] text-slate-600 mt-1">
                        <b>Admin Resolution Note:</b> {t.adminNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: DISPATCH PARTNER ASSIGNMENT                           */}
      {/* ============================================================== */}
      {isDispatchModalOpen && selectedOrderForDispatch && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-[16px] font-black text-slate-900">
                Dispatch Order #{selectedOrderForDispatch.id}
              </h3>
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">
                  Choose Delivery Partner Mode:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDispatchMode('own-vehicle')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      dispatchMode === 'own-vehicle'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Truck size={18} className="mb-1 text-emerald-700" />
                    <div className="text-[12.5px]">Company Staff</div>
                    <div className="text-[10.5px] opacity-75">Own Bike / Tata Ace</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispatchMode('third-party')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      dispatchMode === 'third-party'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <MapPin size={18} className="mb-1 text-amber-700" />
                    <div className="text-[12.5px]">Third-Party (Rapido)</div>
                    <div className="text-[10.5px] opacity-75">Instant auto-book</div>
                  </button>
                </div>
              </div>

              {dispatchMode === 'own-vehicle' ? (
                <div>
                  <label className="text-[12px] font-bold text-slate-700 block mb-1">
                    Select Available Rider:
                  </label>
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] font-medium"
                  >
                    {staff
                      .filter((s) => s.role === 'Delivery Executive')
                      .map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.status})
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 block mb-1">
                      Third-Party Delivery Service:
                    </label>
                    <select
                      value={thirdPartyPartner}
                      onChange={(e) => setThirdPartyPartner(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] font-medium"
                    >
                      <option value="Rapido">Rapido Delivery</option>
                      <option value="Dunzo">Dunzo Partner</option>
                      <option value="Porter">Porter Mini Truck</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-bold text-slate-700 block mb-1">
                      Tracking Link / Reference Code:
                    </label>
                    <input
                      type="text"
                      value={customTrackingCode}
                      onChange={(e) => setCustomTrackingCode(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-[12px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignDispatchSubmit}
                className="px-4 py-2 rounded-xl bg-[#072E10] hover:bg-[#0B4A1A] text-white font-bold text-[12px]"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: INVENTORY STOCK ADJUSTMENT                            */}
      {/* ============================================================== */}
      {isStockModalOpen && selectedInventoryItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-[15px] font-black text-slate-900">
                Adjust Stock: {selectedInventoryItem.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="p-1 rounded-full text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-[12.5px] text-slate-600">
                Current Stock: <b>{selectedInventoryItem.currentStock} {selectedInventoryItem.unit}</b>
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">Action Type:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStockActionType('in')}
                    className={`py-2 rounded-xl text-[12px] font-bold border ${
                      stockActionType === 'in'
                        ? 'bg-emerald-100 border-emerald-600 text-emerald-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    + Stock In (Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockActionType('out')}
                    className={`py-2 rounded-xl text-[12px] font-bold border ${
                      stockActionType === 'out'
                        ? 'bg-rose-100 border-rose-600 text-rose-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    - Stock Out (Used)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-1">
                  Quantity ({selectedInventoryItem.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockAdjustmentQty}
                  onChange={(e) => setStockAdjustmentQty(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-[14px] font-bold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsStockModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold text-[12px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStockAdjustmentSubmit}
                className="px-4 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12px]"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: LOG EXPENSE ENTRY                                     */}
      {/* ============================================================== */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddExpenseSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-[15px] font-black text-slate-900">Record Operating Expense</h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded-full text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Expense Category:</label>
              <select
                value={newExpenseCat}
                onChange={(e) => setNewExpenseCat(e.target.value as any)}
                className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px]"
              >
                <option value="Raw Ingredients">Raw Ingredients</option>
                <option value="Fuel & Travel">Fuel & Travel</option>
                <option value="Kitchen Utilities">Kitchen Utilities (Gas, Water)</option>
                <option value="Vehicle Maintenance">Vehicle Maintenance</option>
                <option value="Packaging & Marketing">Packaging & Marketing</option>
                <option value="Staff Salaries">Staff Salaries</option>
              </select>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Amount (₹):</label>
              <input
                type="number"
                required
                placeholder="e.g. 2500"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-[13px] font-bold"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Paid To (Vendor/Payee):</label>
              <input
                type="text"
                required
                placeholder="e.g. Rythu Bazaar / Sri Sai Motors"
                value={newExpensePaidTo}
                onChange={(e) => setNewExpensePaidTo(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px]"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Notes / Voucher Details:</label>
              <input
                type="text"
                placeholder="Bill description or invoice number"
                value={newExpenseNotes}
                onChange={(e) => setNewExpenseNotes(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px]"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold text-[12px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12px]"
              >
                Save Expense Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: CREATE FESTIVE EVENT                                  */}
      {/* ============================================================== */}
      {isEventModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEventSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-[15px] font-black text-slate-900">Create Festive Event Menu</h3>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-full text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Event Title:</label>
              <input
                type="text"
                required
                placeholder="e.g. Ugadi Vindu Special Feast"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-[13px]"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Date Range:</label>
              <input
                type="text"
                required
                placeholder="e.g. 14 Jan - 16 Jan"
                value={newEventDates}
                onChange={(e) => setNewEventDates(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-[13px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Price per Box / Plate (₹):</label>
                <input
                  type="number"
                  value={newEventPrice}
                  onChange={(e) => setNewEventPrice(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-[13px] font-bold"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Badge:</label>
                <input
                  type="text"
                  value={newEventBadge}
                  onChange={(e) => setNewEventBadge(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 text-[13px]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold text-[12px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12px]"
              >
                Publish Event Menu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: EDIT / ADD MENU DISH                                  */}
      {/* ============================================================== */}
      {isItemEditModalOpen && editingItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-[15px] font-black text-slate-900">
                {menuItems.some((m) => m.id === editingItem.id) ? 'Edit Dish Details' : 'Add New Dish'}
              </h3>
              <button
                type="button"
                onClick={() => setIsItemEditModalOpen(false)}
                className="p-1 rounded-full text-slate-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Category:</label>
                <select
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      category: e.target.value as MenuItem['category'],
                    })
                  }
                  className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px] font-medium"
                >
                  <option value="curries">Curries</option>
                  <option value="home-foods">Home Foods</option>
                  <option value="biryani">Biryani</option>
                  <option value="catering">Catering</option>
                  <option value="tiffins">Tiffins</option>
                  <option value="snacks">Snacks</option>
                  <option value="sweets">Sweets</option>
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Dietary Type:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, veg: true })}
                    className={`py-2 rounded-xl text-[11.5px] font-bold border cursor-pointer ${
                      editingItem.veg
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, veg: false })}
                    className={`py-2 rounded-xl text-[11.5px] font-bold border cursor-pointer ${
                      !editingItem.veg
                        ? 'bg-rose-50 border-rose-600 text-rose-900'
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    Non-Veg
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Dish Name:</label>
              <input
                type="text"
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="e.g. Paneer Butter Masala"
                className="w-full p-2 rounded-xl border border-slate-200 text-[13px] font-bold"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Description:</label>
              <textarea
                rows={2}
                value={editingItem.description}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px]"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">
                Ingredients Used (comma-separated):
              </label>
              <textarea
                rows={2}
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder="e.g. Fresh Malai Paneer, Ripe Tomatoes, Cashew Paste, White Butter, Kasuri Methi"
                className="w-full p-2 rounded-xl border border-slate-200 text-[12px]"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200/80 px-3 py-2">
              <div>
                <div className="text-[12px] font-bold text-amber-950">Feature in Today&apos;s Specials</div>
                <div className="text-[10.5px] text-amber-800">
                  Show this item in the Today&apos;s Specials carousel on the customer Home screen
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditingItem({ ...editingItem, isSpecial: !editingItem.isSpecial })
                }
                className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  editingItem.isSpecial ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    editingItem.isSpecial ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Sizes &amp; Prices:</label>
              <div className="space-y-1.5">
                {editingItem.sizeOptions.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s.label}
                      onChange={(e) => {
                        const nextSizes = [...editingItem.sizeOptions];
                        nextSizes[idx] = { ...nextSizes[idx], label: e.target.value };
                        setEditingItem({ ...editingItem, sizeOptions: nextSizes });
                      }}
                      className="flex-1 p-1.5 rounded-lg border border-slate-200 text-[12px]"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[12px] text-slate-400">₹</span>
                      <input
                        type="number"
                        value={s.price}
                        onChange={(e) => {
                          const nextSizes = [...editingItem.sizeOptions];
                          nextSizes[idx] = {
                            ...nextSizes[idx],
                            price: parseInt(e.target.value) || 0,
                          };
                          setEditingItem({ ...editingItem, sizeOptions: nextSizes });
                        }}
                        className="w-20 p-1.5 rounded-lg border border-slate-200 text-[12px] font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsItemEditModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold text-[12px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingItem.name.trim()) {
                    showToast('Please enter a dish name', 'error');
                    return;
                  }
                  const parsedIngredients = ingredientsText
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const updatedItem: MenuItem = {
                    ...editingItem,
                    ingredients: parsedIngredients.length > 0 ? parsedIngredients : undefined,
                  };
                  const exists = menuItems.some((m) => m.id === updatedItem.id);
                  if (exists) {
                    onUpdateMenuItem?.(updatedItem);
                    showToast(`Saved changes for ${updatedItem.name}`, 'success');
                  } else {
                    onAddMenuItem?.(updatedItem);
                    showToast(`Added ${updatedItem.name} to menu`, 'success');
                  }
                  setIsItemEditModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12px] cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 6: ADJUST & SEND CATERING QUOTE PRICING                  */}
      {/* ============================================================== */}
      {isQuoteModalOpen && editingQuote && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-[15px] font-black text-slate-900">
                Adjust Quote #{editingQuote.id} · {editingQuote.eventType}
              </h3>
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="p-1 rounded-full text-slate-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-[12px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              <b>{editingQuote.guestCount} Guests</b> · {editingQuote.eventDate} ({editingQuote.eventTime}) · {editingQuote.selectedDishes.length} dishes selected
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">
                  Per-Plate Price (₹):
                </label>
                <input
                  type="number"
                  min={50}
                  value={editingQuote.perPlateEstimate}
                  onChange={(e) => {
                    const perPlate = Math.max(0, parseInt(e.target.value) || 0);
                    const total = perPlate * editingQuote.guestCount + editingQuote.serviceCharge;
                    const advance = Math.round(total * 0.3);
                    setEditingQuote({
                      ...editingQuote,
                      perPlateEstimate: perPlate,
                      totalEstimate: total,
                      advanceAmount: advance,
                      balanceAmount: total - advance,
                    });
                  }}
                  className="w-full p-2 rounded-xl border border-slate-200 text-[13px] font-bold"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">
                  Setup &amp; Crew Charge (₹):
                </label>
                <input
                  type="number"
                  min={0}
                  value={editingQuote.serviceCharge}
                  onChange={(e) => {
                    const charge = Math.max(0, parseInt(e.target.value) || 0);
                    const total = editingQuote.perPlateEstimate * editingQuote.guestCount + charge;
                    const advance = Math.round(total * 0.3);
                    setEditingQuote({
                      ...editingQuote,
                      serviceCharge: charge,
                      totalEstimate: total,
                      advanceAmount: advance,
                      balanceAmount: total - advance,
                    });
                  }}
                  className="w-full p-2 rounded-xl border border-slate-200 text-[13px] font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">
                Manager Notes / Inclusions:
              </label>
              <textarea
                rows={2}
                value={editingQuote.customNotes}
                onChange={(e) => setEditingQuote({ ...editingQuote, customNotes: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200 text-[12px]"
              />
            </div>

            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-emerald-900">Revised Total Estimate</div>
                <div className="text-[10.5px] text-emerald-700">
                  30% Advance: ₹{editingQuote.advanceAmount.toLocaleString()} · Balance: ₹
                  {editingQuote.balanceAmount.toLocaleString()}
                </div>
              </div>
              <div className="text-[17px] font-black text-emerald-950">
                ₹{editingQuote.totalEstimate.toLocaleString()}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold text-[12px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextQuote: CateringQuote = {
                    ...editingQuote,
                    status:
                      editingQuote.status === 'Requested' ? 'Quote Sent' : editingQuote.status,
                  };
                  onUpdateQuote?.(nextQuote);
                  setIsQuoteModalOpen(false);
                  showToast(
                    `Updated & sent Quote #${nextQuote.id} (₹${nextQuote.totalEstimate.toLocaleString()})`,
                    'success'
                  );
                }}
                className="px-4 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12px] cursor-pointer"
              >
                Save &amp; Send Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 7: CREATE / EDIT COUPON WITH TARGET SEARCH BAR           */}
      {/* ============================================================== */}
      {isCouponModalOpen && editingCoupon && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-3 my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-[15px] font-black text-slate-900">
                {coupons.some((c) => (c.id || c.code) === (editingCoupon.id || editingCoupon.code))
                  ? `Edit Coupon: ${editingCoupon.code}`
                  : 'Create Targeted Coupon'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 rounded-full text-slate-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Coupon Code:</label>
                <input
                  type="text"
                  value={editingCoupon.code}
                  onChange={(e) =>
                    setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. ANIL100"
                  className="w-full p-2 rounded-xl border border-slate-200 text-[13px] font-mono font-bold uppercase"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Title:</label>
                <input
                  type="text"
                  value={editingCoupon.title}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, title: e.target.value })}
                  placeholder="e.g. Flat ₹100 Off"
                  className="w-full p-2 rounded-xl border border-slate-200 text-[13px]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Description:</label>
              <input
                type="text"
                value={editingCoupon.description}
                onChange={(e) =>
                  setEditingCoupon({ ...editingCoupon, description: e.target.value })
                }
                placeholder="Valid on selected items or customers..."
                className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Type:</label>
                <select
                  value={editingCoupon.isPercent ? 'percent' : 'flat'}
                  onChange={(e) =>
                    setEditingCoupon({ ...editingCoupon, isPercent: e.target.value === 'percent' })
                  }
                  className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px] font-medium"
                >
                  <option value="flat">Flat (₹)</option>
                  <option value="percent">Percent (%)</option>
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">
                  Discount ({editingCoupon.isPercent ? '%' : '₹'}):
                </label>
                <input
                  type="number"
                  min={1}
                  value={editingCoupon.discountAmount}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      discountAmount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-xl border border-slate-200 text-[13px] font-bold"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Min Order (₹):</label>
                <input
                  type="number"
                  min={0}
                  value={editingCoupon.minOrder}
                  onChange={(e) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      minOrder: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2 rounded-xl border border-slate-200 text-[13px] font-bold"
                />
              </div>
            </div>

            {/* Target Scope Selector */}
            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1.5">
                Who / What Can Use This Coupon?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'all', label: 'All Customers' },
                    { id: 'individual', label: 'Individual Person' },
                    { id: 'selected_people', label: 'Selected People' },
                    { id: 'selected_products', label: 'Selected Products' },
                    { id: 'selected_categories', label: 'Selected Categories' },
                  ] as { id: CouponScope; label: string }[]
                ).map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setEditingCoupon({ ...editingCoupon, scope: sc.id });
                      setCouponTargetSearch('');
                    }}
                    className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border text-left cursor-pointer ${
                      (editingCoupon.scope || 'all') === sc.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Bar & Picker for Targeted Scope */}
            {editingCoupon.scope && editingCoupon.scope !== 'all' && (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={couponTargetSearch}
                    onChange={(e) => setCouponTargetSearch(e.target.value)}
                    placeholder={
                      editingCoupon.scope === 'individual' || editingCoupon.scope === 'selected_people'
                        ? 'Search customer by name, phone, or area...'
                        : editingCoupon.scope === 'selected_products'
                          ? 'Search dish by name...'
                          : 'Search category...'
                    }
                    className="w-full h-9 pl-8 pr-3 rounded-lg bg-white border border-slate-200 text-[12px] outline-none"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {(editingCoupon.scope === 'individual' ||
                    editingCoupon.scope === 'selected_people') &&
                    CUSTOMER_DIRECTORY.filter((c) => {
                      const q = couponTargetSearch.toLowerCase();
                      return (
                        c.name.toLowerCase().includes(q) ||
                        c.phone.includes(q) ||
                        c.area.toLowerCase().includes(q)
                      );
                    }).map((cust) => {
                      const selected = (editingCoupon.targetCustomerIds || []).includes(cust.id);
                      return (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => {
                            if (editingCoupon.scope === 'individual') {
                              setEditingCoupon({
                                ...editingCoupon,
                                targetCustomerIds: [cust.id],
                              });
                            } else {
                              const prev = editingCoupon.targetCustomerIds || [];
                              setEditingCoupon({
                                ...editingCoupon,
                                targetCustomerIds: selected
                                  ? prev.filter((id) => id !== cust.id)
                                  : [...prev, cust.id],
                              });
                            }
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11.5px] flex items-center justify-between cursor-pointer ${
                            selected
                              ? 'bg-emerald-100 text-emerald-950 font-bold'
                              : 'bg-white hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span>
                            {cust.name} · {cust.phone} ({cust.area})
                          </span>
                          <span>{selected ? '✓' : '+'}</span>
                        </button>
                      );
                    })}

                  {editingCoupon.scope === 'selected_products' &&
                    menuItems
                      .filter((m) =>
                        m.name.toLowerCase().includes(couponTargetSearch.toLowerCase())
                      )
                      .map((item) => {
                        const selected = (editingCoupon.targetProductIds || []).includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const prev = editingCoupon.targetProductIds || [];
                              setEditingCoupon({
                                ...editingCoupon,
                                targetProductIds: selected
                                  ? prev.filter((id) => id !== item.id)
                                  : [...prev, item.id],
                              });
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11.5px] flex items-center justify-between cursor-pointer ${
                              selected
                                ? 'bg-emerald-100 text-emerald-950 font-bold'
                                : 'bg-white hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span>
                              {item.name} ({item.category})
                            </span>
                            <span>{selected ? '✓' : '+'}</span>
                          </button>
                        );
                      })}

                  {editingCoupon.scope === 'selected_categories' &&
                    categories
                      .filter((cat) =>
                        cat.title.toLowerCase().includes(couponTargetSearch.toLowerCase())
                      )
                      .map((cat) => {
                        const selected = (editingCoupon.targetCategoryIds || []).includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              const prev = editingCoupon.targetCategoryIds || [];
                              setEditingCoupon({
                                ...editingCoupon,
                                targetCategoryIds: selected
                                  ? prev.filter((id) => id !== cat.id)
                                  : [...prev, cat.id],
                              });
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11.5px] flex items-center justify-between cursor-pointer ${
                              selected
                                ? 'bg-emerald-100 text-emerald-950 font-bold'
                                : 'bg-white hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span>
                              {cat.emoji} {cat.title}
                            </span>
                            <span>{selected ? '✓' : '+'}</span>
                          </button>
                        );
                      })}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold text-[12px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingCoupon.code.trim()) {
                    showToast('Please enter a coupon code', 'error');
                    return;
                  }
                  const cleanCoupon: Coupon = {
                    ...editingCoupon,
                    code: editingCoupon.code.trim().toUpperCase(),
                    title: editingCoupon.title.trim() || `Save ₹${editingCoupon.discountAmount}`,
                  };
                  const exists = coupons.some(
                    (c) => (c.id || c.code) === (cleanCoupon.id || cleanCoupon.code)
                  );
                  const next = exists
                    ? coupons.map((c) =>
                        (c.id || c.code) === (cleanCoupon.id || cleanCoupon.code) ? cleanCoupon : c
                      )
                    : [cleanCoupon, ...coupons];
                  onSaveCoupons?.(next);
                  setIsCouponModalOpen(false);
                  showToast(`Saved coupon ${cleanCoupon.code}`, 'success');
                }}
                className="px-4 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12px] cursor-pointer"
              >
                Save Coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 8: POST / EDIT HERO BANNER                               */}
      {/* ============================================================== */}
      {isBannerModalOpen && editingBanner && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-[15px] font-black text-slate-900">Hero Banner Posting</h3>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1 rounded-full text-slate-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Banner Title:</label>
              <input
                type="text"
                value={editingBanner.title}
                onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                placeholder="e.g. Weekend Biryani Special!"
                className="w-full p-2 rounded-xl border border-slate-200 text-[13px] font-bold"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Banner Artwork:</label>
              <select
                value={editingBanner.bannerImage}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, bannerImage: e.target.value })
                }
                className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px] mb-1.5"
              >
                <option value="/assets/brand/hero_homestyle_banner.jpg">Homestyle Food Banner</option>
                <option value="/assets/brand/banner_biryani_offer.jpg">Hyderabadi Biryani Offer</option>
                <option value="/assets/brand/banner_catering_events.jpg">Royal Catering Banner</option>
              </select>
              <input
                type="text"
                value={editingBanner.bannerImage}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, bannerImage: e.target.value })
                }
                placeholder="Or paste custom image URL..."
                className="w-full p-2 rounded-xl border border-slate-200 text-[11.5px]"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Destination Page:</label>
              <select
                value={editingBanner.target}
                onChange={(e) =>
                  setEditingBanner({ ...editingBanner, target: e.target.value as ScreenName })
                }
                className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px]"
              >
                <option value="home-foods">Home Foods</option>
                <option value="curries">Curries</option>
                <option value="catering">Catering</option>
                <option value="categories">Categories</option>
                <option value="upcoming-events">Upcoming Events</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold text-[12px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingBanner.title.trim()) {
                    showToast('Please enter a banner title', 'error');
                    return;
                  }
                  const exists = heroBanners.some((b) => b.id === editingBanner.id);
                  const next = exists
                    ? heroBanners.map((b) => (b.id === editingBanner.id ? editingBanner : b))
                    : [editingBanner, ...heroBanners];
                  onSaveHeroBanners?.(next);
                  setIsBannerModalOpen(false);
                  showToast('Saved hero banner!', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12px] cursor-pointer"
              >
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 9: EDIT / ADD CATEGORY                                   */}
      {/* ============================================================== */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-[15px] font-black text-slate-900">Category Details</h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-full text-slate-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Title:</label>
                <input
                  type="text"
                  value={editingCategory.title}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, title: e.target.value })
                  }
                  className="w-full p-2 rounded-xl border border-slate-200 text-[13px] font-bold"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Emoji:</label>
                <input
                  type="text"
                  value={editingCategory.emoji}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, emoji: e.target.value })
                  }
                  className="w-full p-2 rounded-xl border border-slate-200 text-[13px] text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Subtitle:</label>
              <input
                type="text"
                value={editingCategory.subtitle}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, subtitle: e.target.value })
                }
                className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px]"
              />
            </div>

            <div>
              <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Category Key:</label>
              <select
                value={editingCategory.id}
                onChange={(e) =>
                  setEditingCategory({ ...editingCategory, id: e.target.value as CategoryId })
                }
                className="w-full p-2 rounded-xl border border-slate-200 text-[12.5px]"
              >
                <option value="curries">curries</option>
                <option value="home-foods">home-foods</option>
                <option value="biryani">biryani</option>
                <option value="catering">catering</option>
                <option value="tiffins">tiffins</option>
                <option value="snacks">snacks</option>
                <option value="sweets">sweets</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-slate-600 font-bold text-[12px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingCategory.title.trim()) {
                    showToast('Please enter a category title', 'error');
                    return;
                  }
                  const matchId = editingCategoryOriginalId || editingCategory.id;
                  const exists = editingCategoryOriginalId !== null && categories.some((c) => c.id === matchId);
                  const next = exists
                    ? categories.map((c) => (c.id === matchId ? editingCategory : c))
                    : [...categories.filter((c) => c.id !== editingCategory.id), editingCategory];
                  onSaveCategories?.(next);
                  setIsCategoryModalOpen(false);
                  showToast(`Saved category ${editingCategory.title}`, 'success');
                }}
                className="px-4 py-2 rounded-xl bg-[#072E10] text-white font-bold text-[12px] cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
