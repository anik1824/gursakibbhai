import React from 'react';
import { Phone, MessageCircle, ShoppingBag, ShieldCheck, Award } from 'lucide-react';
import { useSite } from '../lib/site';
import { telLink, whatsappLink } from '../lib/format';

interface HeaderProps {
  onScrollToOrder: () => void;
}

export const StoreLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { store } = useSite();
  return (
    <div className={`rounded-xl bg-gradient-to-br from-[var(--c-primary)] to-[#451A03] flex items-center justify-center shadow-md text-white font-bold border border-[var(--c-accent)] shrink-0 overflow-hidden ${className}`}>
      {store.logo_url ? (
        <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-lg sm:text-xl">{store.logo_emoji}</span>
      )}
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ onScrollToOrder }) => {
  const { store, landing } = useSite();
  const waText = `আসসালামু আলাইকুম, আমি ${store.name} এর পণ্য সম্পর্কে জানতে চাই`;

  return (
    <header className="sticky top-0 z-40 bg-[var(--c-bg)]/95 backdrop-blur-md border-b border-[#E8D9C5] shadow-sm">
      {landing.announcement && (
        <div className="bg-[#5C2B14] text-[#FDF8F0] px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-xs md:text-sm font-medium">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-1.5 sm:gap-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1 w-full md:w-auto">
              <span className="inline-block animate-pulse">❄️</span>
              <span>{landing.announcement}</span>
            </div>

            <div className="hidden md:flex items-center gap-4 text-xs">
              <a href={telLink(store.phone)} className="flex items-center gap-1 hover:text-[#FBBF24] transition-colors">
                <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>হটলাইন: {store.phone}</span>
              </a>
              <span className="text-[#8D4925]">|</span>
              <span className="flex items-center gap-1 text-[#FCD34D]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>১০০% ক্যাশ অন ডেলিভারি</span>
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <StoreLogo className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12" />
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-lg sm:text-xl md:text-2xl font-bold font-bengali-serif text-[#451A03] tracking-tight">
                {store.name}
              </span>
              <span className="hidden min-[400px]:flex text-[9px] sm:text-[10px] md:text-xs bg-[#FEF3C7] text-[var(--c-secondary)] border border-[#FDE68A] px-1.5 py-0.5 rounded-full font-semibold items-center gap-0.5">
                <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D97706]" /> যশোরের গুড়
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[var(--c-primary)]/80 hidden sm:block">{store.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href={telLink(store.phone)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--c-primary)]/30 text-[#5C2B14] hover:bg-[#EFE3D0] transition-colors text-xs font-semibold"
          >
            <Phone className="w-3.5 h-3.5 text-[var(--c-accent)]" />
            <span>{store.phone}</span>
          </a>

          <a
            href={whatsappLink(store.whatsapp, waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 p-1.5 sm:px-3 sm:py-2 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors text-xs font-semibold border border-[#25D366]/30"
            title="WhatsApp এ মেসেজ দিন"
          >
            <MessageCircle className="w-4 h-4 text-[#128C7E]" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          <button
            onClick={onScrollToOrder}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[var(--c-accent)] to-[var(--c-secondary)] hover:from-[var(--c-secondary)] hover:to-[var(--c-primary)] text-white text-xs md:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>অর্ডার করুন</span>
          </button>
        </div>
      </div>
    </header>
  );
};
