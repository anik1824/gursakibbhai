import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { GurPackage } from '../types';
import { toBn } from '../lib/format';

interface StickyBottomBarProps {
  selectedPackage?: GurPackage;
  onScrollToOrder: () => void;
}

export const StickyBottomBar: React.FC<StickyBottomBarProps> = ({ selectedPackage, onScrollToOrder }) => (
  <div
    className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t-2 border-[var(--c-accent)] shadow-2xl px-3 pt-3 sm:hidden"
    style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
  >
    <div className="flex items-center justify-between gap-3">
      {selectedPackage && (
        <div className="text-left overflow-hidden max-w-[42%]">
          <span className="text-xs text-[var(--c-primary)]/70 block truncate">{selectedPackage.name}</span>
          <span className="text-lg font-black text-[var(--c-secondary)]">৳{toBn(selectedPackage.discount_price)}</span>
        </div>
      )}
      <button
        onClick={onScrollToOrder}
        className="flex-1 min-h-[52px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[var(--c-accent)] to-[var(--c-primary)] text-white text-base font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer animate-warm-pulse active:scale-[0.98]"
      >
        <ShoppingCart className="w-5 h-5" />
        <span>অর্ডার করুন</span>
      </button>
    </div>
  </div>
);
