import React from 'react';
import { GUR_IMAGES } from '../data/gurData';
import { Check, Sparkles, HeartHandshake, Trees, Flame, UtensilsCrossed } from 'lucide-react';

export const StorySection: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-[#F5EADB]/60 border-y border-[#EADBCE]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EADBCE] text-[#5C2B14] text-xs font-semibold mb-3">
            <Trees className="w-3.5 h-3.5 text-[#B45309]" />
            <span>যশোরের মাটির খাঁটি ঘ্রাণ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-bengali-serif text-[#3D1A07]">
            যেভাবে তৈরি হয় আমাদের এই খাঁটি খেজুরের গুড়
          </h2>
          <p className="text-sm md:text-base text-[#6B4226] mt-2">
            শত বছরের পারিবারিক ঐতিহ্য ও গাছিদের নিপুণ হাতের পরম যত্ন — কোনো কৃত্রিম চিনি কিংবা ভেজালের ঠাঁই নেই এখানে।
          </p>
        </div>

        {/* Visual Story - Boiling Gur Showcase */}
        <div className="max-w-2xl mx-auto mb-12">
          {/* Boiling Gur Image with Badge */}
          <div className="relative group">
            <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-[#EADBCE]">
              <img
                src={GUR_IMAGES.boiling}
                alt="মাটির চুলায় কাঠের জ্বাল দিয়ে খেজুরের রস ফুটানো"
                className="w-full h-[320px] sm:h-[400px] object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>
            <div className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-4 sm:bottom-4 bg-[#451A03]/95 text-white p-3 sm:p-3.5 rounded-xl shadow-lg border border-[#B45309]/50 sm:max-w-xs text-xs">
              <div className="flex items-center gap-2 mb-1 text-[#FDE68A] font-bold">
                <Flame className="w-4 h-4 text-[#F59E0B]" />
                <span>মাটির চুলায় কাঠের জ্বাল</span>
              </div>
              <p className="text-zinc-200 leading-snug">
                ভোরের কুয়াশা মোড়া যশোরের পল্লীতে তাজা রস বড় কড়াইয়ে কাঠের মৃদু জ্বালে ঘণ্টা পর ঘণ্টা ফুটিয়ে ঘন করা হয়।
              </p>
            </div>
          </div>
        </div>

        {/* Pitha Pairing Banner */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#DFCBB5] overflow-hidden shadow-md grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="md:col-span-5 h-64 md:h-full min-h-[220px]">
            <img
              src={GUR_IMAGES.pitha}
              alt="ভাপা ও চিতই পিঠার সাথে ঝোলা গুড়"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-7 p-6 sm:p-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>শীতের পিঠা ও সকালের নাস্তা</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-bengali-serif text-[#3D1A07]">
              গরম গরম ভাপা ও চিতই পিঠার সাথে আসল ঝোলা গুড়ের তৃপ্তি!
            </h3>
            <p className="text-xs sm:text-sm text-[#6B4226] leading-relaxed">
              শীতের সকালে মাটির চুলায় সেঁকা নরম চিতই পিঠা কিংবা ভাপা পিঠার মাঝে এই গাঢ় সোনালী খাঁটি ঝোলা গুড়ের মিষ্টি ছোঁয়া—বাঙ্গালির প্রাণের এই অনুভূতি আর কোনো কিছুতেই পাওয়া সম্ভব নয়।
            </p>
            <div className="pt-1 flex flex-wrap gap-2 text-xs font-medium text-[#522910]">
              <span className="bg-[#FBF4E8] px-2.5 py-1 rounded-md border border-[#EADBCE]">
                ✓ পায়েসের জন্য দারুণ সোনালী রঙ
              </span>
              <span className="bg-[#FBF4E8] px-2.5 py-1 rounded-md border border-[#EADBCE]">
                ✓ দুধে দিলে কখনোই দুধ ফাটবে না
              </span>
              <span className="bg-[#FBF4E8] px-2.5 py-1 rounded-md border border-[#EADBCE]">
                ✓ প্রাকৃতিক আয়রন ও পুষ্টিগুণে ভরপুর
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
