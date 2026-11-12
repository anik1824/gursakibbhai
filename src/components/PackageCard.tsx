import React from 'react';
import { Check, Sparkles, Truck, Tag, ShoppingCart } from 'lucide-react';
import { GurPackage } from '../types';

interface PackageCardProps {
  pkg: GurPackage;
  isSelected: boolean;
  onSelect: (pkg: GurPackage) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  isSelected,
  onSelect,
}) => {
  // Convert numbers to Bengali digits
  const toBengaliNumber = (str: string | number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str
      .toString()
      .replace(/[0-9]/g, (w) => bengaliDigits[parseInt(w, 10)]);
  };

  const discountAmount = pkg.originalPrice - pkg.discountPrice;

  return (
    <div
      onClick={() => onSelect(pkg)}
      className={`relative rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden ${
        pkg.isPopular
          ? 'bg-[#FFFDF9] border-2 border-[#B45309] shadow-xl ring-2 ring-[#B45309]/30 transform lg:-translate-y-2'
          : 'bg-[#FFFDF9] border border-[#DFCBB5] hover:border-[#B45309] shadow-md hover:shadow-lg'
      } ${isSelected ? 'ring-4 ring-[#15803D]' : ''}`}
    >
      {/* Popular / Special Badge */}
      {pkg.badge && (
        <div
          className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-xl shadow-xs z-10 flex items-center gap-1 ${
            pkg.isPopular
              ? 'bg-gradient-to-r from-[#B45309] to-[#92400E] text-white'
              : 'bg-[#FEF3C7] text-[#92400E] border-b border-l border-[#FDE68A]'
          }`}
        >
          {pkg.isPopular && <Sparkles className="w-3 h-3 text-[#FDE68A]" />}
          <span>{pkg.badge}</span>
        </div>
      )}

      {/* Product Image Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-[#F2E5D5]">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute bottom-2.5 left-3 text-white">
          <span className="text-xs bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full font-semibold border border-white/20">
            ওজন: {pkg.weight}
          </span>
        </div>

        {/* Free delivery badge if applicable */}
        {pkg.isFreeDelivery && (
          <div className="absolute bottom-2.5 right-3 bg-[#15803D] text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <Truck className="w-3 h-3" />
            <span>ফ্রি ডেলিভারি</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h3 className="text-lg font-bold font-bengali-serif text-[#3D1A07] mb-1 line-clamp-1">
            {pkg.name}
          </h3>
          <p className="text-xs text-[#78350F]/80 mb-3 line-clamp-1">
            {pkg.subTitle}
          </p>

          {/* Pricing Box */}
          <div className="bg-[#FBF4E8] p-3 rounded-xl border border-[#EADBCE] mb-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400 line-through mr-2">
                ৳{toBengaliNumber(pkg.originalPrice)}
              </span>
              <span className="text-2xl font-black text-[#92400E]">
                ৳{toBengaliNumber(pkg.discountPrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                <Tag className="w-3 h-3" /> সাশ্রয় ৳{toBengaliNumber(discountAmount)}
              </span>
            </div>
          </div>

          {/* Feature List */}
          <ul className="space-y-2 mb-5">
            {pkg.features.map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#522910]">
                <div className="w-4 h-4 rounded-full bg-[#15803D]/10 text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isSelected
                ? 'bg-[#15803D] text-white shadow-md'
                : pkg.isPopular
                ? 'bg-gradient-to-r from-[#B45309] to-[#78350F] hover:from-[#92400E] hover:to-[#5C2B14] text-white shadow-md'
                : 'bg-[#F2E5D5] hover:bg-[#EADBCE] text-[#5C2B14]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isSelected ? '✓ সিলেক্টেড (ফর্ম পূরণ করুন)' : 'এই প্যাকেজটি অর্ডার করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
