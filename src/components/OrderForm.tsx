import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  Phone,
  User,
  MapPin,
  FileText,
  AlertCircle,
  Tag,
  CreditCard,
  ShoppingBag,
  Clock,
  Sparkles
} from 'lucide-react';
import { GurPackage, CustomerOrder } from '../types';
import { GUR_PACKAGES, STORE_INFO } from '../data/gurData';

interface OrderFormProps {
  selectedPackage: GurPackage;
  onSelectPackage: (pkg: GurPackage) => void;
  onOrderSuccess: (order: CustomerOrder) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  selectedPackage,
  onSelectPackage,
  onOrderSuccess,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Convert numbers to Bengali digits
  const toBengaliNumber = (str: string | number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str
      .toString()
      .replace(/[0-9]/g, (w) => bengaliDigits[parseInt(w, 10)]);
  };

  // Check if free delivery applies:
  // If package has isFreeDelivery flag OR quantity >= 2
  const isFreeDelivery = selectedPackage.isFreeDelivery || quantity >= 2;

  // Delivery fee calculation
  const deliveryFee = isFreeDelivery
    ? 0
    : deliveryArea === 'inside_dhaka'
    ? STORE_INFO.deliveryInsideDhaka
    : STORE_INFO.deliveryOutsideDhaka;

  const subtotal = selectedPackage.discountPrice * quantity;
  const regularTotal = selectedPackage.originalPrice * quantity;
  const totalSavings = regularTotal - subtotal + (isFreeDelivery ? 100 : 0);
  const grandTotal = subtotal + deliveryFee;

  const handlePhoneChange = (val: string) => {
    // Keep digits and BD phone chars
    setPhone(val);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'অনুগ্রহ করে আপনার পুরো নাম লিখুন';
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'অনুগ্রহ করে আপনার মোবাইল নম্বর লিখুন';
    } else if (cleanPhone.length < 11) {
      newErrors.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)';
    }

    if (!address.trim()) {
      newErrors.address = 'অনুগ্রহ করে আপনার বিস্তারিত ডেলিভারি ঠিকানা লিখুন';
    } else if (address.trim().length < 10) {
      newErrors.address = 'বাসা নং, রোড, থানা ও জেলার নাম সহ বিস্তারিত ঠিকানা দিন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Create unique Order ID
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `GP-${randomNum}`;

    const newOrder: CustomerOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerAddress: address.trim(),
      selectedPackage,
      quantity,
      deliveryArea,
      deliveryFee,
      subtotal,
      total: grandTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
      note: note.trim() || undefined,
    };

    // Simulate instant network confirmation
    setTimeout(() => {
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    }, 800);
  };

  return (
    <section id="order-form" className="py-12 md:py-16 scroll-mt-14">
      <div className="max-w-4xl mx-auto px-4">
        {/* Main Card Container */}
        <div className="bg-[#FFFDF9] rounded-3xl border-2 border-[#B45309] shadow-2xl overflow-hidden ring-4 ring-[#B45309]/15">
          {/* Form Header Banner */}
          <div className="bg-gradient-to-r from-[#78350F] via-[#92400E] to-[#78350F] text-white p-4 sm:p-8 text-center relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>সহজ ১-স্টেপ অর্ডার ফর্ম</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-bengali-serif">
              অর্ডারটি সম্পন্ন করতে নিচের তথ্যগুলো পূরণ করুন
            </h2>
            <p className="text-xs sm:text-sm text-[#FDE68A] mt-2 max-w-xl mx-auto">
              কোনো প্রকার অগ্রিম টাকা দিতে হবে না। পার্সেল হাতে পেয়ে গুড়ের ঘ্রাণ ও খাঁটি স্বাদ নিয়ে তবেই মূল্য পরিশোধ করুন!
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
            {/* Step 1: Package Selection Tiles */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <label className="text-base sm:text-lg font-bold font-bengali-serif text-[#3D1A07] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#92400E] text-white text-xs flex items-center justify-center font-bold">
                    ১
                  </span>
                  <span>আপনার পছন্দের প্যাকেজ নির্বাচন করুন:</span>
                </label>
                <span className="text-xs text-[#15803D] font-bold bg-[#DCFCE7] px-2.5 py-1 rounded-full">
                  ২ কেজিতে ফ্রি ডেলিভারি!
                </span>
              </div>

              <div className="space-y-3">
                {GUR_PACKAGES.map((pkg) => {
                  const isChecked = selectedPackage.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => onSelectPackage(pkg)}
                      className={`relative p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'border-[#15803D] bg-[#F0FDF4] shadow-sm ring-2 ring-[#15803D]/20'
                          : 'border-[#DFCBB5] bg-[#FFF9F2] hover:border-[#B45309]'
                      }`}
                    >
                      {/* Left: Radio + Thumb + Title */}
                      <div className="flex items-center gap-3">
                        {/* Radio Checkbox Dot */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isChecked
                              ? 'border-[#15803D] bg-[#15803D]'
                              : 'border-[#A38260] bg-white'
                          }`}
                        >
                          {isChecked && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>

                        {/* Thumbnail */}
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#EADBCE] shrink-0"
                        />

                        {/* Package Info */}
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm sm:text-base text-[#3D1A07]">
                              {pkg.name}
                            </span>
                            {pkg.badge && (
                              <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full font-bold border border-[#FDE68A]">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#78350F]/70 line-clamp-1">
                            {pkg.subTitle}
                          </p>
                        </div>
                      </div>

                      {/* Right: Price */}
                      <div className="text-right shrink-0">
                        <span className="text-xs text-zinc-400 line-through block sm:inline mr-1">
                          ৳{toBengaliNumber(pkg.originalPrice)}
                        </span>
                        <span className="text-base sm:text-lg font-black text-[#92400E]">
                          ৳{toBengaliNumber(pkg.discountPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Quantity Stepper */}
            <div className="bg-[#FBF4E8] p-4 rounded-2xl border border-[#EADBCE] flex items-center justify-between flex-wrap gap-4">
              <label className="text-sm sm:text-base font-bold text-[#3D1A07] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#92400E] text-white text-xs flex items-center justify-center font-bold">
                  ২
                </span>
                <span>প্যাকেজের সংখ্যা (Quantity):</span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl bg-white border border-[#DFCBB5] text-[#78350F] font-bold text-lg flex items-center justify-center hover:bg-[#EADBCE] cursor-pointer shadow-xs"
                >
                  -
                </button>
                <span className="w-10 text-center font-black text-lg text-[#3D1A07]">
                  {toBengaliNumber(quantity)}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-xl bg-white border border-[#DFCBB5] text-[#78350F] font-bold text-lg flex items-center justify-center hover:bg-[#EADBCE] cursor-pointer shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Step 3: Customer Information */}
            <div className="space-y-4">
              <label className="text-base sm:text-lg font-bold font-bengali-serif text-[#3D1A07] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#92400E] text-white text-xs flex items-center justify-center font-bold">
                  ৩
                </span>
                <span>আপনার ডেলিভারির তথ্য দিন:</span>
              </label>

              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#451A03] mb-1.5 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#B45309]" />
                  <span>আপনার পুরো নাম *</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মোঃ তানভীর হাসান"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[#2D180B] focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                      : 'border-[#DFCBB5] focus:ring-[#B45309]'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#451A03] mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#B45309]" />
                  <span>সচল মোবাইল নম্বর * (১১ ডিজিট)</span>
                </label>
                <input
                  type="tel"
                  placeholder="যেমন: 01712345678"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[#2D180B] focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                      : 'border-[#DFCBB5] focus:ring-[#B45309]'
                  }`}
                />
                {errors.phone ? (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                  </p>
                ) : (
                  <p className="text-[11px] text-[#78350F]/70 mt-1">
                    অর্ডার নিশ্চিতকরণ ও ডেলিভারির জন্য এই নম্বরে কল করা হবে।
                  </p>
                )}
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#451A03] mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#B45309]" />
                  <span>সম্পূর্ণ ডেলিভারি ঠিকানা *</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="বাসা নং, রোড নং/গ্রাম, এলাকা, থানা এবং জেলার নাম লিখুন..."
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-sm text-[#2D180B] focus:outline-none focus:ring-2 ${
                    errors.address
                      ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                      : 'border-[#DFCBB5] focus:ring-[#B45309]'
                  }`}
                />
                {errors.address && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.address}
                  </p>
                )}
              </div>

              {/* Delivery Area Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#451A03] mb-2 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#B45309]" />
                  <span>আপনার ডেলিভারি এলাকা নির্বাচন করুন:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Inside Dhaka */}
                  <label
                    className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      deliveryArea === 'inside_dhaka'
                        ? 'border-[#B45309] bg-[#FEF3C7]/40 ring-1 ring-[#B45309]'
                        : 'border-[#DFCBB5] bg-white hover:border-[#B45309]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="deliveryArea"
                        checked={deliveryArea === 'inside_dhaka'}
                        onChange={() => setDeliveryArea('inside_dhaka')}
                        className="accent-[#B45309] w-4 h-4"
                      />
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-[#3D1A07] block">
                          ঢাকার ভিতরে
                        </span>
                        <span className="text-[11px] text-[#78350F]/70">
                          ২৪ থেকে ৪৮ ঘণ্টায় ডেলিভারি
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#92400E]">
                      {isFreeDelivery ? (
                        <span className="text-[#15803D]">ফ্রি!</span>
                      ) : (
                        `৳${toBengaliNumber(STORE_INFO.deliveryInsideDhaka)}`
                      )}
                    </span>
                  </label>

                  {/* Outside Dhaka */}
                  <label
                    className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all ${
                      deliveryArea === 'outside_dhaka'
                        ? 'border-[#B45309] bg-[#FEF3C7]/40 ring-1 ring-[#B45309]'
                        : 'border-[#DFCBB5] bg-white hover:border-[#B45309]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="deliveryArea"
                        checked={deliveryArea === 'outside_dhaka'}
                        onChange={() => setDeliveryArea('outside_dhaka')}
                        className="accent-[#B45309] w-4 h-4"
                      />
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-[#3D1A07] block">
                          ঢাকার বাইরে (সারাদেশ)
                        </span>
                        <span className="text-[11px] text-[#78350F]/70">
                          ২ থেকে ৩ কার্যদিবস
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-[#92400E]">
                      {isFreeDelivery ? (
                        <span className="text-[#15803D]">ফ্রি!</span>
                      ) : (
                        `৳${toBengaliNumber(STORE_INFO.deliveryOutsideDhaka)}`
                      )}
                    </span>
                  </label>
                </div>

                {isFreeDelivery && (
                  <div className="mt-2 text-xs bg-[#DCFCE7] text-[#166534] p-2 rounded-lg font-semibold flex items-center gap-1.5 border border-[#BBF7D0]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>অভিনন্দন! আপনার এই অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!</span>
                  </div>
                )}
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-semibold text-[#78350F]/80 mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>ডেলিভারি নোট বা বিশেষ কোনো নির্দেশনা (ঐচ্ছিক):</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বিকেলে কল দিবেন / অফিসে ডেলিভারি হবে"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#DFCBB5] bg-white text-xs text-[#2D180B] focus:outline-none focus:ring-1 focus:ring-[#B45309]"
                />
              </div>
            </div>

            {/* Step 4: Payment Method */}
            <div className="bg-[#FFF9F2] p-4 sm:p-5 rounded-2xl border border-[#EADBCE] space-y-3">
              <label className="text-sm sm:text-base font-bold text-[#3D1A07] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#B45309]" />
                <span>পেমেন্ট পদ্ধতি:</span>
              </label>

              <div className="p-3.5 rounded-xl border-2 border-[#15803D] bg-white flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#15803D] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#14532D] block">
                      ক্যাশ অন ডেলিভারি (Cash on Delivery)
                    </span>
                    <span className="text-xs text-[#166534]/80">
                      পার্সেল হাতে পেয়ে গুড় মুখে দিয়ে টেস্ট করে মূল্য পরিশোধ করবেন।
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold bg-[#DCFCE7] text-[#166534] px-2.5 py-1 rounded-full shrink-0">
                  ১০০% নিরাপদ
                </span>
              </div>
            </div>

            {/* Step 5: Live Order Summary Card */}
            <div className="bg-[#FAF3E9] p-5 rounded-2xl border border-[#DFCBB5] space-y-3">
              <h4 className="font-bold font-bengali-serif text-[#3D1A07] text-base border-b border-[#EADBCE] pb-2 flex items-center justify-between">
                <span>অর্ডার সামারি (মূল্য বিবরণী)</span>
                <span className="text-xs font-normal text-[#78350F]">
                  প্যাকেজ: {selectedPackage.weight} × {toBengaliNumber(quantity)}
                </span>
              </h4>

              <div className="space-y-2 text-xs sm:text-sm text-[#5C2B14]">
                <div className="flex justify-between">
                  <span>প্যাকেজ সাবটোটাল:</span>
                  <span className="font-semibold">৳{toBengaliNumber(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-[#15803D] font-bold">ফ্রি (৳০)</span>
                    ) : (
                      `৳${toBengaliNumber(deliveryFee)}`
                    )}
                  </span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between text-[#15803D] font-semibold bg-[#DCFCE7]/50 p-1.5 rounded-lg border border-[#BBF7D0]">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> বিশেষ ছাড়ে সাশ্রয়:
                    </span>
                    <span>-৳{toBengaliNumber(totalSavings)}</span>
                  </div>
                )}

                <div className="border-t border-[#DFCBB5] pt-3 flex justify-between items-center text-base sm:text-lg font-black text-[#3D1A07]">
                  <span>সর্বমোট প্রদেয় টাকা:</span>
                  <span className="text-2xl text-[#92400E]">
                    ৳{toBengaliNumber(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Big Action Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 sm:py-5 px-4 sm:px-6 rounded-2xl bg-gradient-to-r from-[#B45309] via-[#92400E] to-[#78350F] hover:from-[#92400E] hover:to-[#5C2B14] text-white text-base sm:text-lg md:text-xl font-black shadow-xl shadow-amber-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed animate-warm-pulse"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>অর্ডার কনফার্ম হচ্ছে...</span>
                  </div>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>
                      অর্ডার নিশ্চিত করুন (৳{toBengaliNumber(grandTotal)})
                    </span>
                  </>
                )}
              </button>

              {/* Guarantees below button */}
              <div className="pt-3 sm:pt-4 grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-center text-[#78350F]">
                <div className="bg-[#FFF9F2] p-2 rounded-lg border border-[#EADBCE]">
                  ✓ কোনো অগ্রিম টাকা নেই
                </div>
                <div className="bg-[#FFF9F2] p-2 rounded-lg border border-[#EADBCE]">
                  ✓ পার্সেল খুলে চেক করুন
                </div>
                <div className="bg-[#FFF9F2] p-2 rounded-lg border border-[#EADBCE]">
                  ✓ ইনস্ট্যান্ট রিটার্ন সুবিধা
                </div>
                <div className="bg-[#FFF9F2] p-2 rounded-lg border border-[#EADBCE]">
                  ✓ ২৪-৪৮ ঘণ্টায় ডেলিভারি
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
