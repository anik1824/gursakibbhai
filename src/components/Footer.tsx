import React from 'react';
import { Phone, MessageCircle, MapPin, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { STORE_INFO } from '../data/gurData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#3D1A07] text-[#FDF8F0] pt-12 pb-20 sm:pb-12 border-t-4 border-[#B45309]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#5C2B14]">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#B45309] text-white flex items-center justify-center font-bold text-lg border border-[#F59E0B]">
                🌴
              </div>
              <span className="text-2xl font-bold font-bengali-serif text-[#FDE68A]">
                {STORE_INFO.name}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#DFCBB5] leading-relaxed">
              যশোরের প্রত্যন্ত পল্লী থেকে খাঁটি ও নির্ভেজাল খেজুরের গুড়, খাঁটি গাওয়া ঘি, মধু ও গ্রামীণ ঐতিহ্যবাহী পুষ্টিকর খাবার সরাসরি আপনার পরিবারে পৌঁছে দেওয়াই আমাদের অঙ্গীকার।
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-[#FDE68A]">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span>১০০% প্রাকৃতিক ও রাসায়নিক মুক্ত খাঁটি খাদ্য</span>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-base font-bold font-bengali-serif text-[#FDE68A]">
              যোগাযোগ ও কাস্টমার সাপোর্ট
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-[#DFCBB5]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>হটলাইন: <a href={`tel:${STORE_INFO.phoneRaw}`} className="text-white hover:underline font-bold">{STORE_INFO.phone}</a></span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>WhatsApp: <a href={STORE_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">{STORE_INFO.phone}</a></span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <span>ঠিকানা: {STORE_INFO.address}</span>
              </div>
            </div>
          </div>

          {/* Guarantees */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-base font-bold font-bengali-serif text-[#FDE68A]">
              আমাদের প্রতিশ্রুতি
            </h4>
            <ul className="space-y-1.5 text-xs text-[#DFCBB5]">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                <span>১০০% ক্যাশ অন ডেলিভারি</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                <span>পার্সেল খুলে চেক করার সুযোগ</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                <span>ভেজাল প্রমাণে মূল্য ফেরত</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                <span>সারা দেশে দ্রুত হোম ডেলিভারি</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#DFCBB5]/70 text-center sm:text-left">
          <p>© {new Date().getFullYear()} {STORE_INFO.name} (Gramer Ponno). সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1 justify-center">
            <span>যশোরের ঐতিহ্য বাঁচিয়ে রাখার এক খাঁটি প্রয়াস</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-current inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
