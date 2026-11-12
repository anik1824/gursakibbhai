import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Truck,
  ArrowRight,
  PhoneCall,
  Flame,
  Award
} from 'lucide-react';
import { GUR_IMAGES, STORE_INFO } from '../data/gurData';

interface HeroProps {
  onScrollToOrder: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToOrder }) => {
  // Flash sale countdown timer (persists in state)
  const [timeLeft, setTimeLeft] = useState({
    hours: 7,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 11, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const format2Digits = (num: number) => num.toString().padStart(2, '0');

  // Convert numbers to Bengali digits
  const toBengaliNumber = (str: string | number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str
      .toString()
      .replace(/[0-9]/g, (w) => bengaliDigits[parseInt(w, 10)]);
  };

  return (
    <section className="relative pt-6 pb-12 md:py-16 overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#E8CCA8]/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4">
        {/* Urgent Flash Sale Countdown Banner */}
        <div className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-[#78350F] via-[#92400E] to-[#78350F] text-white p-3 md:p-3.5 rounded-2xl shadow-md border border-[#B45309]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#FEF3C7] text-[#B45309] rounded-lg">
              <Flame className="w-5 h-5 fill-current animate-bounce" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[#FDE68A]">
                শীতকালীন স্পেশাল অফার
              </p>
              <p className="text-sm font-bold">
                আজকের অফার শেষ হতে বাকি:
              </p>
            </div>
          </div>

          {/* Countdown Blocks */}
          <div className="flex items-center gap-2">
            <div className="bg-[#451A03]/80 border border-[#F59E0B]/40 px-2.5 py-1 rounded-lg text-center min-w-[50px]">
              <span className="block text-base md:text-lg font-bold text-[#FDE68A] leading-none">
                {toBengaliNumber(format2Digits(timeLeft.hours))}
              </span>
              <span className="text-[10px] text-zinc-300">ঘণ্টা</span>
            </div>
            <span className="text-yellow-400 font-bold">:</span>
            <div className="bg-[#451A03]/80 border border-[#F59E0B]/40 px-2.5 py-1 rounded-lg text-center min-w-[50px]">
              <span className="block text-base md:text-lg font-bold text-[#FDE68A] leading-none">
                {toBengaliNumber(format2Digits(timeLeft.minutes))}
              </span>
              <span className="text-[10px] text-zinc-300">মিনিট</span>
            </div>
            <span className="text-yellow-400 font-bold">:</span>
            <div className="bg-[#451A03]/80 border border-[#F59E0B]/40 px-2.5 py-1 rounded-lg text-center min-w-[50px]">
              <span className="block text-base md:text-lg font-bold text-[#FDE68A] leading-none">
                {toBengaliNumber(format2Digits(timeLeft.seconds))}
              </span>
              <span className="text-[10px] text-zinc-300">সেকেন্ড</span>
            </div>
          </div>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Copy & Benefits */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE3D0] border border-[#DFCBB5] text-[#5C2B14] text-xs md:text-sm font-medium shadow-xs">
              <Sparkles className="w-4 h-4 text-[#B45309]" />
              <span>যশোরের আসল গাছিদের স্বহস্তে তৈরি ১০০% খাঁটি গুড়</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-bengali-serif text-[#3D1A07] leading-[1.25] tracking-tight">
              শীতের পিঠা-পায়েসের আসল স্বাদ পেতে{' '}
              <span className="text-[#92400E] underline decoration-[#D97706]/50 decoration-wavy underline-offset-8">
                যশোরের ঐতিহ্যবাহী
              </span>{' '}
              খাঁটি খেজুরের গুড়!
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#5A3825] leading-relaxed max-w-xl mx-auto lg:mx-0">
              কোনো প্রকার চিনি, হাইড্রোজ, বা কেমিক্যাল ছাড়াই কাঠের চুলায় ঘণ্টার পর ঘণ্টা জ্বাল দিয়ে তৈরি সুস্বাদু দানাদার পাটালি ও ঘন সোনালী ঝোলা গুড়। পার্সেল খুলে মুখে দিয়ে নিশ্চিত হয়ে তবেই টাকা পরিশোধ করুন!
            </p>

            {/* Key Assurance Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto lg:mx-0 text-left">
              <div className="flex items-start gap-2.5 bg-[#FFF9F2] p-2.5 rounded-xl border border-[#EADBCE]">
                <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm text-[#422006] font-medium">
                  <strong>এক ফোঁটাও চিনি নেই</strong> — শতভাগ প্রাকৃতিক রস
                </span>
              </div>

              <div className="flex items-start gap-2.5 bg-[#FFF9F2] p-2.5 rounded-xl border border-[#EADBCE]">
                <ShieldCheck className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm text-[#422006] font-medium">
                  <strong>পার্সেল চেক করে পেমেন্ট</strong> — কোনো অগ্রিম টাকা নেই
                </span>
              </div>

              <div className="flex items-start gap-2.5 bg-[#FFF9F2] p-2.5 rounded-xl border border-[#EADBCE]">
                <Truck className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm text-[#422006] font-medium">
                  <strong>সারা দেশে হোম ডেলিভারি</strong> — ২ কেজিতে ফ্রি ডেলিভারি!
                </span>
              </div>

              <div className="flex items-start gap-2.5 bg-[#FFF9F2] p-2.5 rounded-xl border border-[#B45309] shrink-0 mt-0.5">
                <Award className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm text-[#422006] font-medium">
                  <strong>পছন্দ না হলে ইনস্ট্যান্ট রিটার্ন</strong> — শতভাগ রিস্ক ফ্রি
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                onClick={onScrollToOrder}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#B45309] via-[#92400E] to-[#78350F] hover:from-[#92400E] hover:to-[#5C2B14] text-white text-base md:text-lg font-bold shadow-xl shadow-amber-900/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer animate-warm-pulse"
              >
                <span>অর্ডার করতে এখানে ক্লিক করুন</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href={`tel:${STORE_INFO.phoneRaw}`}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#FFFDF9] hover:bg-[#F3E5D4] text-[#5C2B14] border border-[#CBB396] text-sm md:text-base font-bold shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#B45309]" />
                <span>কল করে অর্ডার দিন: {STORE_INFO.phone}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Visual Image with Highlights */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative border & glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#B45309]/30 to-[#F59E0B]/20 rounded-3xl blur-md" />

              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-[#EADBCE]">
                <img
                  src={GUR_IMAGES.hero}
                  alt="যশোরের খাঁটি খেজুরের পাটালি ও ঝোলা গুড়"
                  className="w-full h-[360px] sm:h-[440px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />

                {/* Overlay Badge Bottom */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs bg-[#B45309] text-white px-2 py-0.5 rounded-md font-semibold">
                        যশোরের বিখ্যাত পাটালি ও ঝোলা
                      </span>
                      <p className="text-sm font-bold mt-1 text-[#FDE68A]">
                        ১০০% খাঁটি ও নির্ভেজাল খেজুরের গুড়
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-300 block">শুরু মাত্র</span>
                      <span className="text-lg font-bold text-white">৳৬০০ থেকে</span>
                    </div>
                  </div>
                </div>

                {/* Floating Top Left Badge */}
                <div className="absolute top-3 left-3 bg-[#15803D] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/40">
                  <span className="w-2 h-2 rounded-full bg-lime-300 animate-ping" />
                  <span>চিনিমুক্ত গ্যারান্টি</span>
                </div>

                {/* Floating Top Right Badge */}
                <div className="absolute top-3 right-3 bg-[#451A03]/90 text-[#FDE68A] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-[#F59E0B]/40">
                  <span>ক্যাশ অন ডেলিভারি</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
