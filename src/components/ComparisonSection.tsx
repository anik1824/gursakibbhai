import React from 'react';
import { COMPARISON_POINTS } from '../data/gurData';
import { XCircle, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export const ComparisonSection: React.FC = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EADBCE] text-[#5C2B14] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
            <span>সচেতনতার সাথে যাচাই করুন</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-bengali-serif text-[#3D1A07]">
            সাধারণ বাজারের গুড় বনাম গ্রামের পণ্যের খাঁটি গুড়
          </h2>
          <p className="text-sm md:text-base text-[#6B4226] mt-2">
            কম দামে বাজারে যা পাচ্ছেন তা বেশিরভাগই চিনি আর ক্ষতিকর কেমিক্যালের মিশ্রণ। কেন আমাদের গুড় সম্পূর্ণ আলাদা দেখুন:
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#DFCBB5] shadow-lg overflow-hidden mb-12">
          {/* Header row */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#DFCBB5] text-center font-bengali-serif font-bold text-sm md:text-base">
            <div className="hidden md:block md:col-span-4 p-4 bg-[#F5EADB] text-[#5C2B14] text-left">
              বৈশিষ্ট্য ও মানদণ্ড
            </div>
            <div className="md:col-span-4 p-4 bg-[#FEE2E2]/70 text-[#991B1B] border-t md:border-t-0 md:border-l border-[#DFCBB5] flex items-center justify-center gap-2">
              <XCircle className="w-5 h-5 text-[#DC2626]" />
              <span>সাধারণ বাজারের কেমিক্যালযুক্ত গুড়</span>
            </div>
            <div className="md:col-span-4 p-4 bg-[#DCFCE7]/70 text-[#166534] border-t md:border-t-0 md:border-l border-[#DFCBB5] flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
              <span>গ্রামের পণ্যের ১০০% খাঁটি গুড়</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#EADBCE]">
            {COMPARISON_POINTS.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 text-xs md:text-sm items-stretch hover:bg-[#FBF4E8]/50 transition-colors"
              >
                {/* Feature Name */}
                <div className="md:col-span-4 p-3.5 md:p-4 font-bold text-[#451A03] bg-[#FAF3E9]/50 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-[#B45309] mr-2 shrink-0 md:inline-block hidden" />
                  {item.feature}
                </div>

                {/* Market Gur (Negative) */}
                <div className="md:col-span-4 p-3.5 md:p-4 text-[#991B1B] bg-[#FEF2F2]/40 md:border-l border-[#DFCBB5] flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                  <span>{item.market}</span>
                </div>

                {/* Gramer Ponno Gur (Positive) */}
                <div className="md:col-span-4 p-3.5 md:p-4 text-[#166534] bg-[#F0FDF4]/50 md:border-l border-[#DFCBB5] font-medium flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                  <span>{item.gramerPonno}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Quick Tips to Detect Pure Gur */}
        <div className="bg-[#FFFDF9] p-6 sm:p-8 rounded-2xl border border-[#DFCBB5] shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 text-[#92400E]">
            <HelpCircle className="w-6 h-6 text-[#D97706]" />
            <h3 className="text-xl font-bold font-bengali-serif text-[#3D1A07]">
              খাঁটি খেজুরের গুড় চেনার ৩টি সহজ উপায়:
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="bg-[#FBF4E8] p-4 rounded-xl border border-[#EADBCE]">
              <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#92400E] font-bold flex items-center justify-center mb-2">
                ১
              </div>
              <h4 className="font-bold text-[#3D1A07] mb-1">রঙ ও স্বাভাবিক উজ্জ্বলতা</h4>
              <p className="text-[#6B4226] leading-relaxed">
                খাঁটি গুড় কিছুটা কালচে বা লালচে-সোনালী রঙের হবে। অতিরিক্ত চকচকে ফর্সা বা হলদেটে রঙের হলে বুঝতে হবে এতে হাইড্রোজ বা সোডা মেশানো।
              </p>
            </div>

            <div className="bg-[#FBF4E8] p-4 rounded-xl border border-[#EADBCE]">
              <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#92400E] font-bold flex items-center justify-center mb-2">
                ২
              </div>
              <h4 className="font-bold text-[#3D1A07] mb-1">স্বভাবসুলভ ঘ্রাণ ও কোমলতা</h4>
              <p className="text-[#6B4226] leading-relaxed">
                মুখে দেওয়ার সাথে সাথেই মিষ্টি সুবাস ছড়িয়ে পড়বে এবং দাঁতে আটকে না গিয়ে মাখনের মতো মিশে যাবে। কোনো খসখসে চিনির ভাব থাকবে না।
              </p>
            </div>

            <div className="bg-[#FBF4E8] p-4 rounded-xl border border-[#EADBCE]">
              <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#92400E] font-bold flex items-center justify-center mb-2">
                ৩
              </div>
              <h4 className="font-bold text-[#3D1A07] mb-1">পানিতে ও দুধে পরীক্ষা</h4>
              <p className="text-[#6B4226] leading-relaxed">
                এক গ্লাস পানিতে দিলে খাঁটি গুড় ধীরে ধীরে গলবে এবং নিচে তলানি জমবে না। আর গরম দুধে দিলে কোনো অবস্থাতেই দুধ ছানা কাটবে না।
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
