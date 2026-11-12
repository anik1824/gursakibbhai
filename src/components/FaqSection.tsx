import React, { useState } from 'react';
import { ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';
import { FAQ_DATA, STORE_INFO } from '../data/gurData';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 md:py-16 bg-[#FFFDF9] border-t border-[#EADBCE]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EADBCE] text-[#5C2B14] text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-[#B45309]" />
            <span>সচরাচর জিজ্ঞাসা</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-bengali-serif text-[#3D1A07]">
            সাধারণ প্রশ্নোত্তর (FAQ)
          </h2>
          <p className="text-sm text-[#6B4226] mt-2">
            অর্ডার করার আগে গ্রাহকদের মনে সচরাচর আসা কিছু সাধারণ প্রশ্নের উত্তর:
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#DFCBB5] overflow-hidden transition-all duration-200 bg-[#FBF4E8]/60"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-[#3D1A07] flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F5EADB]/80 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs flex items-center justify-center font-bold shrink-0">
                      ?
                    </span>
                    <span>{item.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#92400E] transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5C2B14] leading-relaxed border-t border-[#EADBCE]/50 bg-white/70">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#FEF3C7]/60 border border-[#FDE68A] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-bold text-[#451A03] text-sm sm:text-base">
              অন্য কোনো প্রশ্ন বা বিশেষ জিজ্ঞাসা আছে?
            </h4>
            <p className="text-xs text-[#78350F]">
              আমাদের কাস্টমার কেয়ারে সরাসরি কল করুন বা WhatsApp-এ লিখুন।
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${STORE_INFO.phoneRaw}`}
              className="px-4 py-2 rounded-xl bg-[#92400E] hover:bg-[#78350F] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{STORE_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
