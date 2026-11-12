import React from 'react';
import { CheckCircle2, MessageCircle, Phone, X, ShoppingBag, MapPin, Printer } from 'lucide-react';
import { CustomerOrder } from '../types';
import { STORE_INFO } from '../data/gurData';

interface OrderSuccessModalProps {
  order: CustomerOrder | null;
  onClose: () => void;
  onNewOrder: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onNewOrder,
}) => {
  if (!order) return null;

  // Convert numbers to Bengali digits
  const toBengaliNumber = (str: string | number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str
      .toString()
      .replace(/[0-9]/g, (w) => bengaliDigits[parseInt(w, 10)]);
  };

  const handlePrint = () => {
    window.print();
  };

  const itemsText = order.items && order.items.length > 0
    ? order.items.map((i) => `${i.name} (${i.quantity}টি)`).join(', ')
    : order.selectedPackage?.name || 'খেজুরের গুড়';

  const whatsappMessage = encodeURIComponent(
    `আসসালামু আলাইকুম, আমি গ্রামের পণ্য থেকে যশোরের খেজুরের গুড় অর্ডার করেছি। আমার অর্ডার আইডি: ${order.orderNumber}, নাম: ${order.customerName}, ফোন: ${order.customerPhone}, পণ্য: ${itemsText}, সর্বমোট: ৳${order.total}।`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FFFDF9] rounded-3xl max-w-lg w-full border-2 border-[#B45309] shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#15803D] to-[#166534] text-white p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white text-[#15803D] flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>
          <h3 className="text-2xl font-bold font-bengali-serif">
            আলহামদুলিল্লাহ! আপনার অর্ডারটি নিশ্চিত হয়েছে
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            শীঘ্রই আমাদের কাস্টমার প্রতিনিধি আপনার নম্বরে কল করে অর্ডারটি চূড়ান্ত করবেন।
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Order ID & Date */}
          <div className="bg-[#FBF4E8] p-3.5 rounded-xl border border-[#DFCBB5] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#78350F]/70 block">অর্ডার আইডি (Invoice #)</span>
              <span className="font-mono text-base font-bold text-[#92400E]">
                {order.orderNumber}
              </span>
            </div>
            <span className="text-xs bg-[#DCFCE7] text-[#15803D] px-2.5 py-1 rounded-full font-bold border border-[#BBF7D0]">
              ক্যাশ অন ডেলিভারি
            </span>
          </div>

          {/* Customer Details */}
          <div className="bg-white p-4 rounded-xl border border-[#DFCBB5] space-y-2">
            <div className="font-bold text-[#3D1A07] border-b border-[#F0E3D3] pb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#B45309]" />
              <span>ডেলিভারি বিবরণ:</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-[#78350F]/70">গ্রাহকের নাম:</span>
              <span className="col-span-2 font-medium text-[#2D180B]">{order.customerName}</span>

              <span className="text-[#78350F]/70">মোবাইল:</span>
              <span className="col-span-2 font-medium text-[#2D180B]">{order.customerPhone}</span>

              <span className="text-[#78350F]/70">ঠিকানা:</span>
              <span className="col-span-2 font-medium text-[#2D180B]">{order.customerAddress}</span>

              <span className="text-[#78350F]/70">এরিয়া:</span>
              <span className="col-span-2 font-medium text-[#2D180B]">
                {order.deliveryArea === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে (সারাদেশ)'}
              </span>
            </div>
          </div>

          {/* Product Items */}
          <div className="bg-white p-4 rounded-xl border border-[#DFCBB5] space-y-2">
            <div className="font-bold text-[#3D1A07] border-b border-[#F0E3D3] pb-1.5">
              অর্ডারের আইটেম:
            </div>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-2 divide-y divide-gray-100">
                {order.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between pt-1">
                    <div>
                      <p className="font-bold text-[#3D1A07]">{it.name}</p>
                      <p className="text-xs text-[#78350F]/70">
                        পরিমাণ: {toBengaliNumber(it.quantity)} টি × ৳{toBengaliNumber(it.price)}
                      </p>
                    </div>
                    <span className="font-bold text-sm text-[#92400E]">
                      ৳{toBengaliNumber(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            ) : order.selectedPackage ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#3D1A07]">{order.selectedPackage.name}</p>
                  <p className="text-xs text-[#78350F]/70">
                    পরিমাণ: {toBengaliNumber(order.quantity || 1)} টি × ৳{toBengaliNumber(order.selectedPackage.discountPrice)}
                  </p>
                </div>
                <span className="font-bold text-sm text-[#92400E]">
                  ৳{toBengaliNumber(order.subtotal)}
                </span>
              </div>
            ) : null}

            <div className="border-t border-[#F0E3D3] pt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <span>{order.deliveryFee === 0 ? 'ফ্রি (৳০)' : `৳${toBengaliNumber(order.deliveryFee)}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#3D1A07] pt-1 border-t border-[#EADBCE]">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-[#92400E] text-lg">৳{toBengaliNumber(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="p-3 bg-[#FEF3C7]/60 rounded-xl border border-[#FDE68A] text-xs text-[#92400E]">
            📌 <strong>জরুরি তথ্য:</strong> ডেলিভারিম্যান পার্সেল নিয়ে গেলে প্যাকেট খুলে গুড়ের মান ও সুবাস পরীক্ষা করে তবেই মূল্য পরিশোধ করবেন। কোনো অগ্রিম চার্জ নেই।
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#FBF4E8] border-t border-[#DFCBB5] space-y-2">
          {/* WhatsApp Direct Confirm */}
          <a
            href={`https://wa.me/8801580946990?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp-এ দ্রুত কনফার্মেশন পাঠান</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2 px-3 rounded-xl border border-[#DFCBB5] bg-white hover:bg-[#F3E5D4] text-[#5C2B14] text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>রিসিপ্ট প্রিন্ট</span>
            </button>

            <button
              onClick={onNewOrder}
              className="flex-1 py-2 px-3 rounded-xl bg-[#92400E] hover:bg-[#78350F] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
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
