import React from 'react';
import { Phone, MessageCircle, ShoppingBag, ShieldCheck, Award, ListOrdered } from 'lucide-react';
import { STORE_INFO } from '../data/gurData';

interface HeaderProps {
  onScrollToOrder: () => void;
  orderCount: number;
  onOpenOrdersDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onScrollToOrder,
  orderCount,
  onOpenOrdersDrawer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF4E8]/95 backdrop-blur-md border-b border-[#E8D9C5] shadow-sm">
      {/* Top Flash Announcement Bar */}
      <div className="bg-[#5C2B14] text-[#FDF8F0] px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs md:text-sm font-medium">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-1.5 sm:gap-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1 w-full md:w-auto">
            <span className="inline-block animate-pulse">❄️</span>
            <span>
              <strong>শীতকালীন ধামাকা অফার:</strong> ২ কেজি বা বেশিতে ডেলিভারি চার্জ সম্পূর্ণ <span className="bg-[#D97706] text-white px-1.5 py-0.5 rounded font-bold">ফ্রি!</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs">
            <a
              href={`tel:${STORE_INFO.phoneRaw}`}
              className="flex items-center gap-1 hover:text-[#FBBF24] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>হটলাইন: {STORE_INFO.phone}</span>
            </a>
            <span className="text-[#8D4925]">|</span>
            <span className="flex items-center gap-1 text-[#FCD34D]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>১০০% ক্যাশ অন ডেলিভারি</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-[#78350F] to-[#451A03] flex items-center justify-center shadow-md text-white font-bold text-base sm:text-lg border border-[#B45309] shrink-0">
            <span className="text-lg sm:text-xl">🌴</span>
          </div>
          <div>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-lg sm:text-xl md:text-2xl font-bold font-bengali-serif text-[#451A03] tracking-tight">
                {STORE_INFO.name}
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-xs bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D97706]" /> যশোরের গুড়
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#78350F]/80 hidden sm:block">
              {STORE_INFO.tagline} • কোনো চিনি বা কেমিক্যাল নেই
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Admin Order Drawer trigger */}
          <button
            onClick={onOpenOrdersDrawer}
            className="relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-[#D5C2AA] bg-[#FFF9F2] hover:bg-[#F3E5D4] text-[#5C2B14] text-xs font-medium flex items-center gap-1 transition-all shadow-xs"
            title="অর্ডার হিস্টোরি ও তালিকা দেখুন"
          >
            <ListOrdered className="w-4 h-4 text-[#8D4925]" />
            <span className="hidden md:inline">অর্ডার তালিকা</span>
            {orderCount > 0 && (
              <span className="bg-[#D97706] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {orderCount}
              </span>
            )}
          </button>

          {/* Quick Call Button */}
          <a
            href={`tel:${STORE_INFO.phoneRaw}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#78350F]/30 text-[#5C2B14] hover:bg-[#EFE3D0] transition-colors text-xs font-semibold"
          >
            <Phone className="w-3.5 h-3.5 text-[#B45309]" />
            <span>{STORE_INFO.phone}</span>
          </a>

          {/* WhatsApp Direct */}
          <a
            href={STORE_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors text-xs font-semibold border border-[#25D366]/30"
            title="WhatsApp এ মেসেজ দিন"
          >
            <MessageCircle className="w-4 h-4 text-[#128C7E]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Big Order CTA */}
          <button
            onClick={onScrollToOrder}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#B45309] to-[#92400E] hover:from-[#92400E] hover:to-[#78350F] text-white text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>অর্ডার করুন</span>
          </button>
        </div>
      </div>
    </header>
  );
};
