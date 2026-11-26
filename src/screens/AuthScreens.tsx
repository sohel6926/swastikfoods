import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Phone, Sparkles, User, Mail } from 'lucide-react';
import { HeroBiryaniIllustration, SwastikLogo } from '../components/BrandAssets';
import { GoldButton, Modal, PrimaryButton, TopBar } from '../components/UI';

const SPLASH_SLIDES = [
  {
    title: 'Homemade Food, Curries & Professional Catering for Every Occasion',
    badge: 'Fresh from Miyapur Kitchen',
  },
  {
    title: 'Homestyle Curries in 250 ml, 500 ml & 1 L Packs Delivered Hot',
    badge: 'Authentic Andhra & Telangana Flavours',
  },
  {
    title: 'Daily Meal Boxes, Bulk Orders & End-to-End Event Catering',
    badge: 'Weddings · Birthdays · Corporate',
  },
];

/* Screen 1: Splash / Onboarding */
export const SplashScreen: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSlide((prev) => (prev + 1) % SPLASH_SLIDES.length);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex-1 flex flex-col justify-between bg-gradient-to-b from-[#0B3D1A] via-[#124B22] to-[#1A602B] text-white px-6 pt-8 pb-7 overflow-hidden">
      {/* Decorative botanical leaves */}
      <svg
        className="absolute -top-6 -left-8 opacity-20 pointer-events-none"
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
        aria-hidden="true"
      >
        <path d="M20 140C10 70 60 20 135 15C130 85 85 130 20 140Z" fill="#86EFAC" />
      </svg>
      <svg
        className="absolute -bottom-10 -right-10 opacity-15 pointer-events-none"
        width="190"
        height="190"
        viewBox="0 0 190 190"
        fill="none"
        aria-hidden="true"
      >
        <path d="M170 20C180 90 130 155 40 165C50 95 95 45 170 20Z" fill="#F5B52E" />
      </svg>

      {/* Brand Logo */}
      <div className="relative z-10 flex flex-col items-center pt-2">
        <SwastikLogo variant="light" size="md" />
      </div>

      {/* Hero Dish Illustration */}
      <div className="relative z-10 flex flex-col items-center my-auto py-4">
        <div className="relative">
          <div className="absolute inset-4 rounded-full bg-[#F5B52E]/15 blur-2xl" />
          <HeroBiryaniIllustration />
        </div>

        <p className="mt-4 text-[11.5px] font-semibold text-[#F5B52E] tracking-wider uppercase">
          {SPLASH_SLIDES[slide].badge}
        </p>
        <h2 className="mt-2 text-[19px] font-semibold text-center leading-snug text-white max-w-[300px]">
          {SPLASH_SLIDES[slide].title}
        </h2>
        <div className="mt-2.5 flex items-center gap-2 text-[12px] text-white/80 font-medium">
          <span>Curries</span>
          <span aria-hidden="true">·</span>
          <span>Home Foods</span>
          <span aria-hidden="true">·</span>
          <span>Catering</span>
        </div>

        {/* Interactive Pager Dots */}
        <div className="flex items-center gap-2 mt-5">
          {SPLASH_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                slide === idx ? 'w-6 bg-[#F5B52E]' : 'w-2 bg-white/35'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Gold CTA */}
      <div className="relative z-10">
        <GoldButton onClick={onGetStarted}>
          <span>Get Started</span>
          <ArrowRight size={18} />
        </GoldButton>
      </div>
    </div>
  );
};

/* Screen 2: Login */
export const LoginScreen: React.FC<{
  onOtpLogin: (phone: string) => void;
  onPasswordLogin: (phone: string) => void;
  onSocialLogin: (provider: string) => void;
  onGoSignUp: () => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({ onOtpLogin, onPasswordLogin, onSocialLogin, onGoSignUp, showToast }) => {
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('Swastik@123');
  const [showPass, setShowPass] = useState(false);
  const [usePasswordMode, setUsePasswordMode] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const cleanPhone = phone.replace(/\D/g, '');
  const isValidPhone = cleanPhone.length === 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    if (usePasswordMode) {
      if (password.trim().length < 4) {
        showToast('Enter your password (min 4 characters)', 'error');
        return;
      }
      onPasswordLogin(cleanPhone);
    } else {
      onOtpLogin(cleanPhone);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FBF7EE] overflow-y-auto no-scrollbar px-5 pt-4 pb-6">
      <div className="flex justify-center mb-4">
        <SwastikLogo variant="dark" size="sm" />
      </div>

      <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_14px_rgba(0,0,0,0.07)] border border-black/5">
        <h1 className="text-[20px] font-semibold text-[#1B1B1B]">Welcome Back</h1>
        <p className="text-[12.5px] text-[#6B6B6B] mt-0.5">
          Sign in to order fresh curries, daily meals &amp; catering
        </p>

        {/* Primary OTP vs Password Mode Switch */}
        <div className="mt-4 p-1 rounded-full bg-[#FBF7EE] border border-black/5 grid grid-cols-2">
          <button
            type="button"
            onClick={() => setUsePasswordMode(false)}
            className={`h-9 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
              !usePasswordMode ? 'bg-[#1F6B2B] text-white shadow-xs' : 'text-[#6B6B6B]'
            }`}
          >
            Login with OTP
          </button>
          <button
            type="button"
            onClick={() => setUsePasswordMode(true)}
            className={`h-9 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
              usePasswordMode ? 'bg-[#1F6B2B] text-white shadow-xs' : 'text-[#6B6B6B]'
            }`}
          >
            Use Password
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[12px] font-medium text-[#1B1B1B] mb-1">
              Mobile Number
            </label>
            <div className="flex items-center h-[48px] rounded-[14px] border border-black/15 bg-[#FBF7EE]/60 px-3 focus-within:border-[#1F6B2B]">
              <Phone size={17} className="text-[#1F6B2B] shrink-0" />
              <span className="text-[13px] font-semibold text-[#1B1B1B] ml-2 pr-2 border-r border-black/10">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                className="flex-1 bg-transparent pl-2.5 text-[14px] font-medium text-[#1B1B1B] outline-none tabular-nums"
              />
            </div>
          </div>

          {usePasswordMode && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[12px] font-medium text-[#1B1B1B]">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-[12px] font-medium text-[#1F6B2B] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="flex items-center h-[48px] rounded-[14px] border border-black/15 bg-[#FBF7EE]/60 px-3 focus-within:border-[#1F6B2B]">
                <Lock size={17} className="text-[#1F6B2B] shrink-0" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="flex-1 bg-transparent pl-2.5 text-[14px] text-[#1B1B1B] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="w-9 h-9 flex items-center justify-center text-[#6B6B6B] cursor-pointer"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
          )}

          <div className="pt-1">
            <PrimaryButton type="submit">
              {usePasswordMode ? 'Login' : 'Send 6-Digit OTP'}
            </PrimaryButton>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-[11px] font-medium text-[#6B6B6B]">or continue with</span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        {/* Google & Apple */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSocialLogin('Google')}
            className="h-[46px] rounded-full border border-black/12 bg-white hover:bg-black/3 flex items-center justify-center gap-2 text-[13px] font-medium text-[#1B1B1B] tap-press cursor-pointer"
          >
            <span className="font-bold text-[#D93B2B]">G</span>
            <span>Google</span>
          </button>
          <button
            type="button"
            onClick={() => onSocialLogin('Apple')}
            className="h-[46px] rounded-full border border-black/12 bg-white hover:bg-black/3 flex items-center justify-center gap-2 text-[13px] font-medium text-[#1B1B1B] tap-press cursor-pointer"
          >
            <span className="text-[15px]"></span>
            <span>Apple</span>
          </button>
        </div>
      </div>

      <p className="text-center text-[13px] text-[#6B6B6B] mt-5">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={onGoSignUp}
          className="font-semibold text-[#1F6B2B] hover:underline cursor-pointer"
        >
          Sign Up
        </button>
      </p>

      <Modal open={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset Password">
        <p className="text-[13px] text-[#6B6B6B] leading-relaxed">
          We can send a quick OTP to <strong className="text-[#1B1B1B]">+91 {phone || '9876543210'}</strong> to verify your account and sign you in immediately.
        </p>
        <div className="mt-4">
          <PrimaryButton
            onClick={() => {
              setForgotOpen(false);
              if (isValidPhone) onOtpLogin(cleanPhone);
              else showToast('Enter a valid 10-digit mobile number first', 'error');
            }}
          >
            Send Recovery OTP
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
};

/* Screen 14: OTP Verification */
export const OtpScreen: React.FC<{
  phone: string;
  onBack: () => void;
  onVerified: () => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({ phone, onBack, onVerified, showToast }) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      const next = [...digits];
      chars.forEach((c, i) => {
        if (index + i < 6) next[index + i] = c;
      });
      setDigits(next);
      const focusIdx = Math.min(5, index + chars.length);
      inputRefs.current[focusIdx]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const otpCode = digits.join('');

  const handleVerify = () => {
    if (otpCode.length < 6) {
      showToast('Enter all 6 OTP digits', 'error');
      return;
    }
    onVerified();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FBF7EE]">
      <TopBar title="OTP Verification" onBack={onBack} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="bg-white rounded-[22px] p-5 shadow-[0_4px_14px_rgba(0,0,0,0.07)] border border-black/5">
          <h2 className="text-[18px] font-semibold text-[#1B1B1B]">Enter Verification Code</h2>
          <p className="text-[13px] text-[#6B6B6B] mt-1">
            We sent a 6-digit OTP to <span className="font-semibold text-[#1B1B1B]">+91 {phone}</span>
          </p>

          <div className="grid grid-cols-6 gap-2 mt-6">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="tel"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                aria-label={`OTP digit ${idx + 1}`}
                className="h-[50px] w-full rounded-[14px] border-1.5 border-black/15 focus:border-[#1F6B2B] bg-[#FBF7EE] text-center text-[18px] font-semibold text-[#1B1B1B] outline-none tabular-nums"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDigits(['1', '2', '3', '4', '5', '6'])}
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[#1F6B2B] hover:underline cursor-pointer"
          >
            <Sparkles size={13} /> Auto-fill demo OTP (123456)
          </button>

          <div className="mt-6">
            <PrimaryButton onClick={handleVerify} disabled={otpCode.length < 6}>
              Verify &amp; Continue
            </PrimaryButton>
          </div>

          <div className="mt-4 text-center text-[12.5px] text-[#6B6B6B] tabular-nums">
            {timer > 0 ? (
              <span>Resend OTP in 00:{timer < 10 ? `0${timer}` : timer}</span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTimer(30);
                  showToast('New OTP sent to +91 ' + phone, 'success');
                }}
                className="font-semibold text-[#1F6B2B] hover:underline cursor-pointer"
              >
                Resend OTP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Screen 15: Sign Up */
export const SignUpScreen: React.FC<{
  onBack: () => void;
  onContinueOtp: (data: { name: string; phone: string; email: string }) => void;
  showToast: (text: string, variant?: 'success' | 'error' | 'info') => void;
}> = ({ onBack, onContinueOtp, showToast }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (name.trim().length < 2) {
      showToast('Please enter your full name', 'error');
      return;
    }
    if (cleanPhone.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }
    onContinueOtp({ name: name.trim(), phone: cleanPhone, email: email.trim() });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FBF7EE]">
      <TopBar title="Create Account" onBack={onBack} />
      <div className="p-5 overflow-y-auto no-scrollbar">
        <div className="bg-white rounded-[22px] p-5 shadow-[0_4px_14px_rgba(0,0,0,0.07)] border border-black/5">
          <h2 className="text-[18px] font-semibold text-[#1B1B1B]">Join Swastik</h2>
          <p className="text-[12.5px] text-[#6B6B6B] mt-0.5">
            Create your account for home meals, curries &amp; event catering
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
            <div>
              <label className="block text-[12px] font-medium text-[#1B1B1B] mb-1">Full Name</label>
              <div className="flex items-center h-[48px] rounded-[14px] border border-black/15 bg-[#FBF7EE]/60 px-3 focus-within:border-[#1F6B2B]">
                <User size={17} className="text-[#1F6B2B] shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Anil Kumar"
                  className="flex-1 bg-transparent pl-2.5 text-[14px] text-[#1B1B1B] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1B1B1B] mb-1">
                Mobile Number
              </label>
              <div className="flex items-center h-[48px] rounded-[14px] border border-black/15 bg-[#FBF7EE]/60 px-3 focus-within:border-[#1F6B2B]">
                <Phone size={17} className="text-[#1F6B2B] shrink-0" />
                <span className="text-[13px] font-semibold text-[#1B1B1B] ml-2 pr-2 border-r border-black/10">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="flex-1 bg-transparent pl-2.5 text-[14px] text-[#1B1B1B] outline-none tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1B1B1B] mb-1">
                Email <span className="text-[#6B6B6B] font-normal">(Optional)</span>
              </label>
              <div className="flex items-center h-[48px] rounded-[14px] border border-black/15 bg-[#FBF7EE]/60 px-3 focus-within:border-[#1F6B2B]">
                <Mail size={17} className="text-[#1F6B2B] shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anil@example.com"
                  className="flex-1 bg-transparent pl-2.5 text-[14px] text-[#1B1B1B] outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <PrimaryButton type="submit">Continue to Verify OTP</PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
