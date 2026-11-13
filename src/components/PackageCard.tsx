import React from 'react';
import { Check, Sparkles, Truck, Tag, ShoppingCart } from 'lucide-react';
import { GurPackage } from '../types';
import { toBn } from '../lib/format';

interface PackageCardProps {
  pkg: GurPackage;
  isSelected: boolean;
  onSelect: (pkg: GurPackage) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, isSelected, onSelect }) => {
  const discountAmount = pkg.original_price - pkg.discount_price;

  return (
    <div
      onClick={() => onSelect(pkg)}
      className={`relative rounded-3xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${
        pkg.is_popular
          ? 'bg-[#FFFDF9] border-2 border-[var(--c-accent)] shadow-2xl ring-2 ring-[var(--c-accent)]/30 transform lg:-translate-y-2'
          : 'bg-[#FFFDF9] border border-[#DFCBB5] hover:border-[var(--c-accent)] shadow-md hover:shadow-xl'
      } ${isSelected ? 'ring-4 ring-[#15803D]' : ''}`}
    >
      {pkg.badge && (
        <div
          className={`absolute top-0 right-0 text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-bl-2xl shadow-md z-10 flex items-center gap-1.5 ${
            pkg.is_popular
              ? 'bg-gradient-to-r from-[var(--c-accent)] to-[var(--c-secondary)] text-white'
              : 'bg-[#FEF3C7] text-[var(--c-secondary)] border-b border-l border-[#FDE68A]'
          }`}
        >
          {pkg.is_popular && <Sparkles className="w-3.5 h-3.5 text-[#FDE68A]" />}
          <span>{pkg.badge}</span>
        </div>
      )}

      <div className="relative h-60 sm:h-72 md:h-80 overflow-hidden bg-[#F2E5D5]">
        {pkg.image_url && (
          <img
            src={pkg.image_url}
            alt={pkg.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {pkg.weight_label && (
          <div className="absolute bottom-3 left-3.5 text-white">
            <span className="text-xs sm:text-sm bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full font-bold border border-white/20">
              ওজন: {pkg.weight_label}
            </span>
          </div>
        )}

        {pkg.is_free_delivery && (
          <div className="absolute bottom-3 right-3.5 bg-[#15803D] text-white text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>ফ্রি ডেলিভারি</span>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-bengali-serif text-[#3D1A07] mb-2 leading-snug">{pkg.name}</h3>
          {pkg.subtitle && <p className="text-sm sm:text-base text-[#6B3410] font-medium mb-4 leading-relaxed">{pkg.subtitle}</p>}

          <div className="bg-[var(--c-bg)] p-3.5 sm:p-4 rounded-2xl border border-[#EADBCE] mb-5 flex items-center justify-between gap-2 flex-wrap">
            <div>
              {pkg.original_price > pkg.discount_price && (
                <span className="text-sm sm:text-base text-zinc-400 line-through mr-2">৳{toBn(pkg.original_price)}</span>
              )}
              <span className="text-3xl sm:text-4xl font-black text-[var(--c-secondary)]">৳{toBn(pkg.discount_price)}</span>
            </div>
            {discountAmount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#15803D] bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#BBF7D0] shadow-2xs">
                <Tag className="w-3.5 h-3.5" /> সাশ্রয় ৳{toBn(discountAmount)}
              </span>
            )}
          </div>

          <ul className="space-y-2.5 mb-6">
            {pkg.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-[15px] text-[#4A2511] font-medium leading-relaxed">
                <div className="w-5 h-5 rounded-full bg-[#15803D]/15 text-[#15803D] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className={`w-full py-3.5 sm:py-4 px-5 rounded-2xl font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md hover:shadow-lg ${
            isSelected
              ? 'bg-[#15803D] hover:bg-[#166534] text-white ring-2 ring-emerald-500/40'
              : pkg.is_popular
              ? 'bg-gradient-to-r from-[var(--c-accent)] to-[var(--c-primary)] hover:from-[var(--c-secondary)] hover:to-[#5C2B14] text-white'
              : 'bg-[#F2E5D5] hover:bg-[#EADBCE] text-[#5C2B14]'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{isSelected ? '✓ সিলেক্টেড (ফর্ম পূরণ করুন)' : 'এই প্যাকেজটি অর্ডার করুন'}</span>
        </button>
      </div>
    </div>
  );
};
