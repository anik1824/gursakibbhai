import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { GurPackage } from '../types';
import { toBn } from '../lib/format';

interface StickyBottomBarProps {
  selectedPackage?: GurPackage;
  onScrollToOrder: () => void;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({ selectedPackage, onScrollToOrder }) => (
  <div className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t-2 border-[var(--c-accent)] shadow-2xl p-2.5 sm:hidden">
    <div className="flex items-center justify-between gap-2">
      {selectedPackage && (
        <div className="text-left overflow-hidden max-w-[45%]">
          <span className="text-[11px] text-[var(--c-primary)]/70 block truncate">{selectedPackage.name}</span>
          <span className="text-base font-black text-[var(--c-secondary)]">৳{toBn(selectedPackage.discount_price)}</span>
        </div>
      )}
      <button
        onClick={onScrollToOrder}
        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[var(--c-accent)] to-[var(--c-primary)] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer animate-warm-pulse"
      >
        <ShoppingCart className="w-4 h-4" />
        <span>অর্ডার করুন</span>
      </button>
    </div>
  </div>
);
