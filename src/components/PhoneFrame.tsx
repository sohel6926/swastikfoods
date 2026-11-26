import React from 'react';
import {
  WifiOff,
  AlertTriangle,
  RotateCcw,
  Home,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  User,
  Sparkles,
  Search,
  Shield,
} from 'lucide-react';
import { ScreenName } from '../types';

interface PhoneFrameProps {
  children: React.ReactNode;
  isDarkHeader?: boolean;
  isOffline: boolean;
  onToggleOffline: () => void;
  simulatePayFail: boolean;
  onTogglePayFail: () => void;
  onResetApp: () => void;
  onQuickNavigate: (screen: ScreenName) => void;
  currentScreen: ScreenName;
  onSwitchToAdmin?: () => void;
}

const QUICK_FLOW_SHORTCUTS: { label: string; screen: ScreenName; icon: React.FC<any> }[] = [
  { label: 'Splash & Onboarding', screen: 'splash', icon: Sparkles },
  { label: 'Home & Discovery', screen: 'home', icon: Home },
  { label: 'Curries Menu', screen: 'curries', icon: UtensilsCrossed },
  { label: 'Home Foods & Bulk', screen: 'home-foods', icon: UtensilsCrossed },
  { label: 'Catering & Quotes', screen: 'catering', icon: UtensilsCrossed },
  { label: 'Search & Filters', screen: 'search', icon: Search },
  { label: 'Cart & Checkout', screen: 'cart', icon: ShoppingBag },
  { label: 'Live Order Tracking', screen: 'track-order', icon: Truck },
  { label: 'My Orders & History', screen: 'orders', icon: Truck },
  { label: 'Profile & Addresses', screen: 'profile', icon: User },
];

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  isDarkHeader = false,
  isOffline,
  onToggleOffline,
  simulatePayFail,
  onTogglePayFail,
  onResetApp,
  onQuickNavigate,
  currentScreen,
  onSwitchToAdmin,
}) => {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden overscroll-none bg-[#FBF7EE] flex flex-col sm:static sm:inset-auto sm:min-h-screen sm:h-auto sm:overflow-visible sm:bg-gradient-to-br sm:from-[#F4EFE4] sm:via-[#EAE3D3] sm:to-[#E2DAC6] lg:flex-row items-center justify-center sm:py-6 sm:px-6 lg:gap-10">
      {/* Desktop-only Companion Guide Panel (hidden on mobile & small screens) */}
      <aside className="hidden lg:flex flex-col w-[290px] shrink-0 bg-white/85 backdrop-blur-md rounded-[28px] p-5 shadow-[0_14px_36px_rgba(11,61,26,0.08)] border border-black/6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7A3E12]">
            Swastik Live App
          </span>
          <h2 className="text-[19px] font-semibold text-[#1B1B1B] mt-0.5 leading-snug">
            Swastik Home Foods &amp; Caterers
          </h2>
          <p className="text-[12px] text-[#6B6B6B] mt-1 leading-relaxed">
            Tap inside the phone or jump directly to any user journey below.
          </p>
        </div>

        <div className="mt-4 pt-3.5 border-t border-black/8">
          <div className="text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">
            Quick Screen Jump
          </div>
          <div className="space-y-1">
            {QUICK_FLOW_SHORTCUTS.map((item) => {
              const Icon = item.icon;
              const active = currentScreen === item.screen;
              return (
                <button
                  key={item.screen}
                  type="button"
                  onClick={() => onQuickNavigate(item.screen)}
                  className={`w-full px-3 py-2 rounded-xl text-[12.5px] font-medium flex items-center gap-2.5 transition-colors cursor-pointer text-left ${
                    active
                      ? 'bg-[#1F6B2B] text-white shadow-xs'
                      : 'text-[#1B1B1B] hover:bg-[#E3F2DC]/60'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-[#F5B52E]' : 'text-[#1F6B2B]'} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-black/8 space-y-2">
          <div className="text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-wider">
            Edge-Case Simulators
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onToggleOffline}
              className={`h-9 px-2.5 rounded-xl text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isOffline
                  ? 'bg-[#D93B2B] text-white'
                  : 'bg-[#FBF7EE] text-[#1B1B1B] border border-black/10 hover:bg-black/5'
              }`}
            >
              <WifiOff size={13} />
              <span>{isOffline ? 'Offline On' : 'Offline'}</span>
            </button>
            <button
              type="button"
              onClick={onTogglePayFail}
              className={`h-9 px-2.5 rounded-xl text-[11.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                simulatePayFail
                  ? 'bg-[#D93B2B] text-white'
                  : 'bg-[#FBF7EE] text-[#1B1B1B] border border-black/10 hover:bg-black/5'
              }`}
            >
              <AlertTriangle size={13} />
              <span>{simulatePayFail ? 'Fail On' : 'Pay Fail'}</span>
            </button>
          </div>
          {onSwitchToAdmin && (
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="w-full h-10 px-3 rounded-xl bg-[#072E10] hover:bg-[#0B4A1A] text-white text-[12px] font-bold flex items-center justify-between shadow-xs cursor-pointer transition-colors tap-press"
            >
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-[#F5B52E]" />
                <span>Admin Web Panel</span>
              </div>
              <span className="text-[9.5px] uppercase font-black px-1.5 py-0.5 rounded bg-[#F5B52E] text-[#072E10]">
                Admin
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onResetApp}
            className="w-full h-9 rounded-xl bg-[#FBF7EE] hover:bg-black/5 border border-black/10 text-[12px] font-semibold text-[#6B6B6B] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset App State</span>
          </button>
        </div>
      </aside>

      {/* Tablet / Small-Desktop Top Bar (hidden on mobile & lg+) */}
      <div className="hidden sm:flex lg:hidden items-center gap-2 mb-3 px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md shadow-xs border border-black/5 text-[11px] font-medium text-[#1B1B1B]">
        <span className="text-[#1F6B2B] font-semibold">Swastik</span>
        <span className="text-black/20">|</span>
        {onSwitchToAdmin && (
          <>
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="px-2.5 py-0.5 rounded-full bg-[#072E10] text-[#F5B52E] font-bold text-[10.5px] cursor-pointer"
            >
              Admin Panel ↗
            </button>
            <span className="text-black/20">|</span>
          </>
        )}
        <button
          type="button"
          onClick={() => onQuickNavigate('splash')}
          className={`px-2 py-0.5 rounded-full cursor-pointer ${
            currentScreen === 'splash' ? 'bg-[#1F6B2B] text-white' : 'hover:bg-black/5'
          }`}
        >
          Splash
        </button>
        <button
          type="button"
          onClick={() => onQuickNavigate('home')}
          className={`px-2 py-0.5 rounded-full cursor-pointer ${
            currentScreen === 'home' ? 'bg-[#1F6B2B] text-white' : 'hover:bg-black/5'
          }`}
        >
          Home
        </button>
        <button
          type="button"
          onClick={() => onQuickNavigate('orders')}
          className={`px-2 py-0.5 rounded-full cursor-pointer ${
            currentScreen === 'orders' ? 'bg-[#1F6B2B] text-white' : 'hover:bg-black/5'
          }`}
        >
          Orders
        </button>
        <span className="text-black/20">|</span>
        <button
          type="button"
          onClick={onToggleOffline}
          className={`px-2 py-0.5 rounded-full cursor-pointer ${
            isOffline ? 'bg-[#D93B2B] text-white' : 'hover:bg-black/5 text-[#6B6B6B]'
          }`}
        >
          Offline
        </button>
        <button
          type="button"
          onClick={onResetApp}
          className="px-2 py-0.5 rounded-full hover:bg-black/5 text-[#6B6B6B] cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Phone Frame (390x844 on desktop, locked full-screen on mobile) */}
      <div className="relative w-full flex-1 min-h-0 h-full sm:flex-none sm:w-[390px] sm:h-[844px] sm:rounded-[44px] sm:border-[9px] sm:border-[#1B1B1B] sm:shadow-[0_26px_64px_rgba(11,61,26,0.22)] bg-[#FBF7EE] overflow-hidden overscroll-none flex flex-col shrink-0">
        {/* Desktop Phone Notch + Status Bar (9:41) */}
        <div
          className={`hidden sm:flex relative z-40 shrink-0 h-[42px] px-6 items-center justify-between text-[12px] font-semibold select-none ${
            isDarkHeader ? 'bg-[#0B3D1A] text-white' : 'bg-[#FBF7EE] text-[#1B1B1B]'
          }`}
        >
          <span className="tabular-nums tracking-tight w-12">9:41</span>
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[132px] h-[24px] bg-[#1B1B1B] rounded-b-2xl flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="w-10 h-1 rounded-full bg-[#333333]" />
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" aria-hidden="true">
              <rect x="0" y="7" width="2.6" height="4" rx="0.8" />
              <rect x="4" y="5" width="2.6" height="6" rx="0.8" />
              <rect x="8" y="2.5" width="2.6" height="8.5" rx="0.8" />
              <rect x="12" y="0" width="2.6" height="11" rx="0.8" />
            </svg>
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden="true">
              <path
                d="M1 3.5C4.3 0.5 9.7 0.5 13 3.5M3.3 6C5.4 4.1 8.6 4.1 10.7 6M5.8 8.5C6.5 7.9 7.5 7.9 8.2 8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="w-[22px] h-[11px] rounded-[3px] border border-current p-[1.5px] flex items-center">
              <div className="h-full w-[82%] rounded-[1.5px] bg-current" />
            </div>
          </div>
        </div>

        {/* Offline Banner inside viewport if simulated offline */}
        {isOffline && (
          <div className="relative z-40 bg-[#D93B2B] text-white px-4 py-2 flex items-center justify-between text-[12px] font-medium shrink-0">
            <div className="flex items-center gap-2">
              <WifiOff size={14} />
              <span>You are offline. Showing cached menu.</span>
            </div>
            <button
              type="button"
              onClick={onToggleOffline}
              className="underline font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Active Screen Viewport */}
        <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden bg-[#FBF7EE]">
          {children}
        </div>

        {/* Desktop Bottom Home Indicator */}
        <div
          className={`hidden sm:flex h-[18px] shrink-0 items-center justify-center ${
            isDarkHeader ? 'bg-[#0B3D1A]' : 'bg-white'
          }`}
          aria-hidden="true"
        >
          <div
            className={`w-[116px] h-[4px] rounded-full ${
              isDarkHeader ? 'bg-white/35' : 'bg-[#1B1B1B]/20'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
