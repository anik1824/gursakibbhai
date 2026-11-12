import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { GurPackage } from '../types';
import { STORE_INFO } from '../data/gurData';

interface StickyBottomBarProps {
  selectedPackage: GurPackage;
  onScrollToOrder: () => void;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({
  selectedPackage,
  onScrollToOrder,
}) => {
  // Convert numbers to Bengali digits
  const toBengaliNumber = (str: string | number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str
      .toString()
      .replace(/[0-9]/g, (w) => bengaliDigits[parseInt(w, 10)]);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t-2 border-[#B45309] shadow-2xl p-2.5 sm:hidden">
      <div className="flex items-center justify-between gap-2">

        {/* Center: Selected Pack Price Info */}
        <div className="text-left overflow-hidden">
          <span className="text-[11px] text-[#78350F]/70 block truncate">
            {selectedPackage.name}
          </span>
          <span className="text-base font-black text-[#92400E]">
            ৳{toBengaliNumber(selectedPackage.discountPrice)}
          </span>
        </div>

        {/* Right: Big Order Button */}
        <button
          onClick={onScrollToOrder}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#B45309] to-[#78350F] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer animate-warm-pulse"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>অর্ডার করুন</span>
        </button>
      </div>
    </div>
  );
};
