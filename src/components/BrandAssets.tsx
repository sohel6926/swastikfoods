import React, { useState } from 'react';

export const HERO_BIRYANI_PHOTO = '/src/assets/images/hero_biryani_handi_1795691419511.jpg';
export const CATERING_BANNER_PHOTO = '/src/assets/images/catering_buffet_banner_1795691421148.jpg';

export const SWASTIK_LOGO_PHOTO = '/assets/brand/swastik_logo_transparent.png';
export const SWASTIK_HEADER_LOGO = '/assets/brand/swastik_header_glow_logo.png';
export const HEADER_BG_MASTER = '/assets/brand/header_bg_master.jpg';
export const HERO_HOMESTYLE_BANNER = '/assets/brand/hero_homestyle_banner.jpg';
export const BANNER_BIRYANI_OFFER = '/assets/brand/banner_biryani_offer.jpg';
export const BANNER_CATERING_EVENTS = '/assets/brand/banner_catering_events.jpg';
export const DISH_HOME_FOODS = '/assets/brand/dish_home_foods.png';
export const DISH_CURRIES = '/assets/brand/dish_curries.png';
export const DISH_BIRYANI = '/assets/brand/dish_biryani.png';
export const DISH_CATERING = '/assets/brand/dish_catering.png';

const IMG_PANEER = '/src/assets/images/paneer_butter_masala_1795691421631.jpg';
const IMG_CHICKEN = '/src/assets/images/andhra_chicken_curry_1795691421821.jpg';
const IMG_MUTTON = '/src/assets/images/telangana_mutton_curry_1795691423420.jpg';
const IMG_PALAK_DAL = '/src/assets/images/palak_paneer_dal_1795691422244.jpg';
const IMG_BIRYANI = '/src/assets/images/hyderabadi_dum_biryani_1795691423781.jpg';
const IMG_VEG_MEALS = '/src/assets/images/south_indian_meals_1795691424204.jpg';
const IMG_NONVEG_MEALS = '/src/assets/images/nonveg_thali_meals_1795691426194.jpg';
const IMG_TIFFINS = '/src/assets/images/south_indian_tiffins_1795691425304.jpg';
const IMG_SNACKS = '/src/assets/images/indian_crispy_snacks_1795691467587.jpg';
const IMG_SWEETS = '/src/assets/images/indian_festive_sweets_1795691467382.jpg';

export const FOOD_IMAGE_MAP: Record<string, string> = {
  // Categories
  'home-foods': IMG_VEG_MEALS,
  curries: IMG_CHICKEN,
  biryani: IMG_BIRYANI,
  catering: CATERING_BANNER_PHOTO,
  tiffins: IMG_TIFFINS,
  snacks: IMG_SNACKS,
  combos: IMG_NONVEG_MEALS,
  sweets: IMG_SWEETS,

  // Curries
  'paneer-butter-masala': IMG_PANEER,
  'chicken-curry': IMG_CHICKEN,
  'mutton-curry': IMG_MUTTON,
  'palak-paneer': IMG_PALAK_DAL,
  'egg-curry': IMG_MUTTON,
  'dal-tadka': IMG_PALAK_DAL,
  'kadai-paneer': IMG_PANEER,
  'chicken-tikka-masala': IMG_CHICKEN,
  'fish-curry': IMG_MUTTON,
  'mixed-veg-curry': IMG_PALAK_DAL,

  // Home Foods
  'veg-meals': IMG_VEG_MEALS,
  'non-veg-meals': IMG_NONVEG_MEALS,
  'chapati-combo': IMG_VEG_MEALS,
  'curd-rice': IMG_VEG_MEALS,
  'lemon-rice': IMG_VEG_MEALS,
  'sambar-rice': IMG_VEG_MEALS,
  pulihora: IMG_VEG_MEALS,

  // Biryani & Rice
  'veg-biryani': HERO_BIRYANI_PHOTO,
  'chicken-biryani': IMG_BIRYANI,
  'mutton-biryani': IMG_BIRYANI,
  'egg-biryani': IMG_BIRYANI,
  'jeera-rice': HERO_BIRYANI_PHOTO,

  // Tiffins
  'ghee-idli': IMG_TIFFINS,
  'masala-dosa': IMG_TIFFINS,
  pesarattu: IMG_TIFFINS,
  'pongal-vada': IMG_TIFFINS,
  'poori-bhaji': IMG_TIFFINS,

  // Snacks
  samosa: IMG_SNACKS,
  'onion-pakoda': IMG_SNACKS,
  'chicken-65': IMG_CHICKEN,
  'paneer-tikka': IMG_PANEER,
  'mirchi-bajji': IMG_SNACKS,

  // Combos
  'exec-veg-thali': IMG_VEG_MEALS,
  'royal-nonveg-thali': IMG_NONVEG_MEALS,
  'family-curry-feast': IMG_PANEER,
  'bachelor-meal-box': IMG_VEG_MEALS,

  // Sweets
  'gulab-jamun': IMG_SWEETS,
  'double-ka-meetha': IMG_SWEETS,
  'carrot-halwa': IMG_SWEETS,
  bobbatlu: IMG_SWEETS,

  // Upcoming Events
  'evt-diwali': IMG_SWEETS,
  'evt-newyear': CATERING_BANNER_PHOTO,
  'evt-sankranti': IMG_SWEETS,
};

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export const SwastikLogo: React.FC<LogoProps> = ({ variant = 'dark', size = 'md' }) => {
  const [imgErr, setImgErr] = useState(false);
  const isLight = variant === 'light';

  if (!imgErr) {
    return (
      <div
        className={`w-full flex justify-center select-none ${
          size === 'sm' ? 'max-w-[330px]' : 'max-w-[316px]'
        }`}
      >
        <div
          className={`w-full overflow-hidden rounded-[18px] px-2.5 py-1.5 ${
            isLight
              ? 'bg-[#FAF4E8] border border-[#F5B52E]/50 shadow-[0_10px_26px_rgba(0,0,0,0.28)]'
              : 'bg-[#FAF4E8] border border-black/8 shadow-[0_4px_14px_rgba(0,0,0,0.06)]'
          }`}
        >
          <img
            src={SWASTIK_LOGO_PHOTO}
            alt="Swastik Home Foods & Caterers"
            referrerPolicy="no-referrer"
            onError={() => setImgErr(true)}
            className="w-full h-auto block object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center select-none">
      <span
        className="font-script text-[42px] leading-none px-2"
        style={{ color: isLight ? '#FFFFFF' : '#1F6B2B' }}
      >
        Swastik
      </span>
      <span
        className="text-[10px] font-bold tracking-[0.2em] uppercase mt-1"
        style={{ color: isLight ? '#F5B52E' : '#7A3E12' }}
      >
        HOME FOODS &amp; CATERERS
      </span>
    </div>
  );
};

interface FoodArtworkProps {
  imageKey: string;
  emoji: string;
  label: string;
  tint?: 'peach' | 'cream' | 'green';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

const TINT_GRADIENTS: Record<'peach' | 'cream' | 'green', string> = {
  peach: 'from-[#FCE3D4] via-[#F9D5BE] to-[#F5C5A8]',
  cream: 'from-[#FFF1D6] via-[#FFE6B8] to-[#FAD896]',
  green: 'from-[#E3F2DC] via-[#D0EAC4] to-[#BBE0AA]',
};

export const FoodArtwork: React.FC<FoodArtworkProps> = ({
  imageKey,
  emoji,
  label,
  tint = 'cream',
  size = 'md',
  className = '',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const photoSrc = FOOD_IMAGE_MAP[imageKey];
  const grad = TINT_GRADIENTS[tint];

  if (size === 'hero') {
    return (
      <div
        className={`relative w-full h-full bg-gradient-to-br ${grad} flex flex-col items-center justify-center overflow-hidden ${className}`}
      >
        {photoSrc && !imgFailed ? (
          <>
            <img
              src={photoSrc}
              alt={label}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />
            <div className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-black/55 backdrop-blur-xs text-[11px] font-medium text-white">
              Freshly Prepared · {label}
            </div>
          </>
        ) : (
          <>
            <div className="w-48 h-48 rounded-full bg-white/45 flex items-center justify-center shadow-inner">
              <div className="w-36 h-36 rounded-full bg-white/80 flex items-center justify-center shadow-md border border-white">
                <span className="text-[76px] leading-none drop-shadow-sm" role="img" aria-label={label}>
                  {emoji}
                </span>
              </div>
            </div>
            <div className="mt-3 px-4 py-1 rounded-full bg-white/80 backdrop-blur-xs text-[11px] font-medium text-[#7A3E12] shadow-xs">
              Freshly Prepared · {label}
            </div>
          </>
        )}
      </div>
    );
  }

  const sizeClasses =
    size === 'sm'
      ? 'w-16 h-16 rounded-2xl'
      : size === 'lg'
        ? 'w-24 h-24 rounded-2xl'
        : 'w-20 h-20 rounded-2xl';

  const emojiSize = size === 'sm' ? 'text-3xl' : size === 'lg' ? 'text-5xl' : 'text-4xl';

  return (
    <div
      className={`relative shrink-0 bg-gradient-to-br ${grad} ${sizeClasses} flex items-center justify-center overflow-hidden border border-black/8 shadow-2xs ${className}`}
    >
      {photoSrc && !imgFailed ? (
        <img
          src={photoSrc}
          alt={label}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-[78%] h-[78%] rounded-full bg-white/70 flex items-center justify-center shadow-xs">
          <span className={`${emojiSize} leading-none select-none`} role="img" aria-label={label}>
            {emoji}
          </span>
        </div>
      )}
    </div>
  );
};

export const HeroBiryaniIllustration: React.FC = () => {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      <div className="relative w-[228px] h-[228px] rounded-full p-1.5 bg-gradient-to-br from-[#F5B52E] via-[#FDE68A] to-[#B86228] shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
        <div className="w-full h-full rounded-full overflow-hidden bg-[#0B3D1A]">
          <img
            src={HERO_BIRYANI_PHOTO}
            alt="Hyderabadi Dum Biryani in copper handi"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover scale-105"
          />
        </div>
      </div>
    );
  }

  return (
    <svg width="210" height="175" viewBox="0 0 210 175" fill="none" aria-hidden="true">
      <ellipse cx="105" cy="136" rx="92" ry="26" fill="#2A7A38" />
      <path d="M42 86C42 122 68 140 105 140C142 140 168 122 168 86H42Z" fill="#8B4513" />
      <ellipse cx="105" cy="86" rx="64" ry="18" fill="#F5B52E" />
      <ellipse cx="105" cy="82" rx="52" ry="12" fill="#FDE68A" />
    </svg>
  );
};

export const ShoppingBagIllustration: React.FC = () => (
  <svg width="132" height="128" viewBox="0 0 132 128" fill="none" aria-hidden="true">
    <circle cx="66" cy="68" r="54" fill="#E3F2DC" />
    <path
      d="M46 44V34C46 23 55 15 66 15C77 15 86 23 86 34V44"
      stroke="#7A3E12"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <rect x="30" y="42" width="72" height="66" rx="14" fill="#1F6B2B" />
    <rect x="30" y="42" width="72" height="16" rx="6" fill="#3E9B3F" />
    <circle cx="66" cy="78" r="16" fill="#F5B52E" />
    <path
      d="M59 78L64 83L74 72"
      stroke="#0B3D1A"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
