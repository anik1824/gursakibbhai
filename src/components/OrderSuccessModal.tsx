import React from 'react';
import { CheckCircle2, MessageCircle, X, ShoppingBag, MapPin, Printer } from 'lucide-react';
import { Order } from '../types';
import { useSite } from '../lib/site';
import { bnMoney, toBn, whatsappLink } from '../lib/format';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onNewOrder: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose, onNewOrder }) => {
  const { store, landing } = useSite();
  if (!order) return null;

  const itemsText = order.items.map((i) => `${i.name} (${i.quantity}টি)`).join(', ');
  const waText = `আসসালামু আলাইকুম, আমি ${store.name} থেকে অর্ডার করেছি। অর্ডার আইডি: ${order.order_number}, নাম: ${order.customer_name}, ফোন: ${order.customer_phone}, পণ্য: ${itemsText}, সর্বমোট: ৳${order.total}।`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full border-2 border-[var(--c-accent)] shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        <button
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-[#15803D] to-[#166534] text-white p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white text-[#15803D] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
          <h3 className="text-2xl font-bold font-bengali-serif">{landing.success_title}</h3>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">{landing.success_text}</p>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          <div className="bg-[var(--c-bg)] p-3.5 rounded-xl border border-[#DFCBB5] flex items-center justify-between gap-2">
            <div>
              <span className="text-xs text-[var(--c-primary)]/70 block">অর্ডার আইডি (Invoice #)</span>
              <span className="font-mono text-base font-bold text-[var(--c-secondary)]">{order.order_number}</span>
            </div>
            <span className="text-xs bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full font-bold border border-[#BBF7D0]">ক্যাশ অন ডেলিভারি</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DFCBB5] space-y-2">
            <div className="font-bold text-[#3D1A07] border-b border-[#F0E3D3] pb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[var(--c-accent)]" />
              <span>ডেলিভারি বিবরণ:</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-[var(--c-primary)]/70">গ্রাহকের নাম:</span>
              <span className="col-span-2 font-medium text-[#2D180B]">{order.customer_name}</span>
              <span className="text-[var(--c-primary)]/70">মোবাইল:</span>
              <span className="col-span-2 font-medium text-[#2D180B]">{order.customer_phone}</span>
              <span className="text-[var(--c-primary)]/70">ঠিকানা:</span>
              <span className="col-span-2 font-medium text-[#2D180B]">{order.customer_address}</span>
              <span className="text-[var(--c-primary)]/70">এরিয়া:</span>
              <span className="col-span-2 font-medium text-[#2D180B]">
                {order.delivery_area === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে (সারাদেশ)'}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#DFCBB5] space-y-2">
            <div className="font-bold text-[#3D1A07] border-b border-[#F0E3D3] pb-1.5">অর্ডারের আইটেম:</div>
            <div className="space-y-2 divide-y divide-gray-100">
              {order.items.map((it) => (
                <div key={`${it.kind}:${it.id}`} className="flex items-center justify-between gap-2 pt-1">
                  <div>
                    <p className="font-bold text-[#3D1A07]">{it.name}</p>
                    <p className="text-xs text-[var(--c-primary)]/70">
                      পরিমাণ: {toBn(it.quantity)} টি × ৳{bnMoney(it.price)}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-[var(--c-secondary)] whitespace-nowrap">৳{bnMoney(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#F0E3D3] pt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <span>{order.delivery_fee === 0 ? 'ফ্রি (৳০)' : `৳${bnMoney(order.delivery_fee)}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#3D1A07] pt-1 border-t border-[#EADBCE]">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-[var(--c-secondary)] text-lg">৳{bnMoney(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FEF3C7]/60 rounded-xl border border-[#FDE68A] text-xs text-[var(--c-secondary)]">
            📌 <strong>জরুরি তথ্য:</strong> ডেলিভারিম্যান পার্সেল নিয়ে গেলে প্যাকেট খুলে গুড়ের মান ও সুবাস পরীক্ষা করে তবেই মূল্য পরিশোধ করবেন। কোনো অগ্রিম চার্জ নেই।
          </div>
        </div>

        <div className="p-4 bg-[var(--c-bg)] border-t border-[#DFCBB5] space-y-2">
          <a
            href={whatsappLink(store.whatsapp, waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp-এ দ্রুত কনফার্মেশন পাঠান</span>
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2 px-3 rounded-xl border border-[#DFCBB5] bg-white hover:bg-[#F3E5D4] text-[#5C2B14] text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>রিসিপ্ট প্রিন্ট</span>
            </button>
            <button
              onClick={onNewOrder}
              className="flex-1 py-2 px-3 rounded-xl bg-[var(--c-secondary)] hover:bg-[var(--c-primary)] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>আরেকটি অর্ডার করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
