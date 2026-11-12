import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PackageCard } from './components/PackageCard';
import { StorySection } from './components/StorySection';
import { ReviewsSection } from './components/ReviewsSection';
import { OrderForm } from './components/OrderForm';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { FaqSection } from './components/FaqSection';
import { StickyBottomBar } from './components/StickyBottomBar';
import { OrderListDrawer } from './components/OrderListDrawer';
import { GUR_PACKAGES, STORE_INFO } from './data/gurData';
import { GurPackage, CustomerOrder } from './types';
import { Sparkles, ShoppingBag, ArrowDown } from 'lucide-react';

export default function App() {
  // Currently selected package in form
  // Default to the most popular 2kg combo pack
  const [selectedPackage, setSelectedPackage] = useState<GurPackage>(
    GUR_PACKAGES.find((p) => p.isPopular) || GUR_PACKAGES[0]
  );

  // Orders stored in localStorage for persistence
  const [orders, setOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem('gp_gur_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Seed with 1 realistic initial order for demo visualization
    return [
      {
        id: 'ord_init_1',
        orderNumber: 'GP-84920',
        customerName: 'তানভীর আহমেদ',
        customerPhone: '01712345678',
        customerAddress: 'বাড়ি #১২, রোড #০৫, ব্লক-সি, বনশ্রী, ঢাকা',
        selectedPackage: GUR_PACKAGES[2], // 2kg Combo
        quantity: 1,
        deliveryArea: 'inside_dhaka',
        deliveryFee: 0,
        subtotal: 1200,
        total: 1200,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        note: 'বিকেলের পর কল দিয়ে ডেলিভারি দিন',
      },
    ];
  });

  // Recent order modal
  const [confirmedOrder, setConfirmedOrder] = useState<CustomerOrder | null>(null);

  // Order List drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Save orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gp_gur_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Smooth scroll helper
  const scrollToOrderForm = () => {
    const el = document.getElementById('order-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePackageSelect = (pkg: GurPackage) => {
    setSelectedPackage(pkg);
    scrollToOrderForm();
  };

  const handleOrderSuccess = (newOrder: CustomerOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setConfirmedOrder(newOrder);
  };

  const handleUpdateStatus = (orderId: string, status: CustomerOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleClearAllOrders = () => {
    if (window.confirm('আপনি কি সত্যিই সব সংরক্ষিত অর্ডার মুছতে চান?')) {
      setOrders([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF4E8] text-[#2C1810] flex flex-col selection:bg-[#B45309] selection:text-white overflow-x-hidden">
      {/* Top Header */}
      <Header
        onScrollToOrder={scrollToOrderForm}
        orderCount={orders.length}
        onOpenOrdersDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1 pb-20 sm:pb-8">
        {/* 1. Hero Section */}
        <Hero onScrollToOrder={scrollToOrderForm} />

        {/* 2. Package Showcase Grid */}
        <section id="packages" className="py-12 md:py-16 scroll-mt-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EADBCE] text-[#5C2B14] text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
                <span>আমাদের পণ্য সম্ভার</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-bengali-serif text-[#3D1A07]">
                পছন্দের সাইজ ও প্যাকেজ বেছে নিন
              </h2>
              <p className="text-sm md:text-base text-[#6B4226] mt-2">
                নিচের যেকোনো প্যাকেজ সিলেক্ট করে সহজেই অর্ডার সম্পন্ন করুন। ২ কেজি বা ততোধিক অর্ডারে ডেলিভারি চার্জ একদম ফ্রি!
              </p>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {GUR_PACKAGES.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  isSelected={selectedPackage.id === pkg.id}
                  onSelect={handlePackageSelect}
                />
              ))}
            </div>

            {/* Direct Scroll Banner */}
            <div className="mt-10 text-center">
              <button
                onClick={scrollToOrderForm}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFFDF9] hover:bg-[#F3E5D4] text-[#5C2B14] border border-[#DFCBB5] text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <span>নিচে সরাসরি অর্ডার ফর্মে যান</span>
                <ArrowDown className="w-4 h-4 text-[#B45309] animate-bounce" />
              </button>
            </div>
          </div>
        </section>

        {/* 3. Village Heritage & Sap Boiling Story */}
        <StorySection />

        {/* 4. Customer Testimonials & Reviews */}
        <ReviewsSection />

        {/* 6. The 1-Step Checkout Order Form */}
        <OrderForm
          selectedPackage={selectedPackage}
          onSelectPackage={setSelectedPackage}
          onOrderSuccess={handleOrderSuccess}
        />

        {/* 7. Frequently Asked Questions (FAQ) */}
        <FaqSection />
      </main>

      {/* Sticky Bottom Order Bar for Mobile */}
      <StickyBottomBar
        selectedPackage={selectedPackage}
        onScrollToOrder={scrollToOrderForm}
      />

      {/* Order Success Modal (Invoice Receipt) */}
      <OrderSuccessModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onNewOrder={() => {
          setConfirmedOrder(null);
          scrollToOrderForm();
        }}
      />

      {/* Admin / Store Order Management Drawer */}
      <OrderListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        orders={orders}
        onUpdateStatus={handleUpdateStatus}
        onDeleteOrder={handleDeleteOrder}
        onClearAll={handleClearAllOrders}
      />
    </div>
  );
}
