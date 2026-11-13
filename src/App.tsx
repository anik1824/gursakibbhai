import React, { useState } from 'react';
import { Sparkles, ArrowDown } from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PackageCard } from './components/PackageCard';
import { StorySection } from './components/StorySection';
import { ReviewsSection } from './components/ReviewsSection';
import { OrderForm } from './components/OrderForm';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { FaqSection } from './components/FaqSection';
import { StickyBottomBar } from './components/StickyBottomBar';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { useSite } from './lib/site';
import { GurPackage, Order } from './types';

export default function App() {
  const { packages, landing } = useSite();
  const [picked, setPicked] = useState<{ id: string; n: number } | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const selectedPackage =
    packages.find((p) => p.id === picked?.id) || packages.find((p) => p.is_popular) || packages[0];

  const scrollToOrderForm = () => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });

  const handlePackageSelect = (pkg: GurPackage) => {
    setPicked((p) => ({ id: pkg.id, n: (p?.n || 0) + 1 }));
    scrollToOrderForm();
  };

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[#2C1810] flex flex-col selection:bg-[var(--c-accent)] selection:text-white overflow-x-hidden">
      <Header onScrollToOrder={scrollToOrderForm} />

      <main className="flex-1 pb-20 sm:pb-8">
        <Hero onScrollToOrder={scrollToOrderForm} />

        {packages.length > 0 && (
          <section id="packages" className="py-12 md:py-16 scroll-mt-14">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EADBCE] text-[#5C2B14] text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--c-accent)]" />
                  <span>{landing.packages_badge}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-bengali-serif text-[#3D1A07]">{landing.packages_title}</h2>
                <p className="text-sm md:text-base text-[#6B4226] mt-2">{landing.packages_subtitle}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} isSelected={picked?.id === pkg.id} onSelect={handlePackageSelect} />
                ))}
              </div>

              <div className="mt-10 text-center">
                <button
                  onClick={scrollToOrderForm}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFFDF9] hover:bg-[#F3E5D4] text-[#5C2B14] border border-[#DFCBB5] text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  <span>নিচে সরাসরি অর্ডার ফর্মে যান</span>
                  <ArrowDown className="w-4 h-4 text-[var(--c-accent)] animate-bounce" />
                </button>
              </div>
            </div>
          </section>
        )}

        <StorySection />
        <ReviewsSection />
        <OrderForm onOrderSuccess={setConfirmedOrder} picked={picked} />
        <FaqSection />
      </main>

      <FloatingWhatsApp />
      <StickyBottomBar selectedPackage={selectedPackage} onScrollToOrder={scrollToOrderForm} />
      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onNewOrder={() => {
          setConfirmedOrder(null);
          scrollToOrderForm();
        }}
      />
    </div>
  );
}
