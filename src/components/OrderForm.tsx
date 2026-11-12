import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  User,
  MapPin,
  FileText,
  AlertCircle,
  Tag,
  CreditCard,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { CustomerOrder, GurProduct, OrderItem } from '../types';
import { CHECKOUT_PRODUCTS, STORE_INFO } from '../data/gurData';

interface OrderFormProps {
  onOrderSuccess: (order: CustomerOrder) => void;
}

export interface SelectedProductState {
  [productId: string]: {
    selected: boolean;
    quantity: number;
  };
}

export const OrderForm: React.FC<OrderFormProps> = ({ onOrderSuccess }) => {
  // Initialize selection matching Image 2:
  // "১ কেজি গোল পাটালি গুড়" is checked by default (quantity 1), all others have quantity 1 and unchecked
  const [productStates, setProductStates] = useState<SelectedProductState>(() => {
    const initial: SelectedProductState = {};
    CHECKOUT_PRODUCTS.forEach((prod) => {
      initial[prod.id] = {
        selected: !!prod.isDefaultSelected,
        quantity: 1,
      };
    });
    return initial;
  });

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [deliveryArea, setDeliveryArea] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [note, setNote] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Toggle checkbox for a product
  const toggleProduct = (productId: string) => {
    setProductStates((prev) => {
      const current = prev[productId] || { selected: false, quantity: 1 };
      return {
        ...prev,
        [productId]: {
          ...current,
          selected: !current.selected,
        },
      };
    });
    if (errors.products) {
      setErrors((prev) => ({ ...prev, products: '' }));
    }
  };

  // Change quantity for a product
  const updateQuantity = (productId: string, delta: number) => {
    setProductStates((prev) => {
      const current = prev[productId] || { selected: false, quantity: 1 };
      const newQty = Math.max(1, current.quantity + delta);
      return {
        ...prev,
        [productId]: {
          selected: true, // Auto-select when modifying quantity
          quantity: newQty,
        },
      };
    });
    if (errors.products) {
      setErrors((prev) => ({ ...prev, products: '' }));
    }
  };

  // Direct manual quantity input
  const setDirectQuantity = (productId: string, value: number) => {
    const validQty = Math.max(1, isNaN(value) ? 1 : value);
    setProductStates((prev) => ({
      ...prev,
      [productId]: {
        selected: true,
        quantity: validQty,
      },
    }));
  };

  // Calculate selected items, weight, subtotal
  const selectedItems: OrderItem[] = CHECKOUT_PRODUCTS.filter(
    (p) => productStates[p.id]?.selected
  ).map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    quantity: productStates[p.id]?.quantity || 1,
    image: p.image,
  }));

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Approximate weight calculation: 2kg or more gets FREE delivery!
  const totalWeightInKg = selectedItems.reduce((sum, item) => {
    const is2Kg = item.id.includes('2kg');
    return sum + (is2Kg ? 2 : 1) * item.quantity;
  }, 0);

  const isFreeDelivery = totalWeightInKg >= 2;

  const deliveryFee = selectedItems.length === 0
    ? 0
    : isFreeDelivery
    ? 0
    : deliveryArea === 'inside_dhaka'
    ? STORE_INFO.deliveryInsideDhaka
    : STORE_INFO.deliveryOutsideDhaka;

  const grandTotal = subtotal + deliveryFee;

  // Convert numbers to Bengali digits
  const toBengaliNumber = (str: string | number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str
      .toString()
      .replace(/[0-9]/g, (w) => bengaliDigits[parseInt(w, 10)]);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (selectedItems.length === 0) {
      newErrors.products = 'অনুগ্রহ করে কমপক্ষে একটি গুড় সিলেক্ট করুন';
    }

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
    } else if (address.trim().length < 8) {
      newErrors.address = 'বাসা নং, রোড, থানা ও জেলার নাম সহ বিস্তারিত ঠিকানা দিন';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `GP-${randomNum}`;

    const newOrder: CustomerOrder = {
      id: `ord_${Date.now()}`,
      orderNumber,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerAddress: address.trim(),
      items: selectedItems,
      deliveryArea,
      deliveryFee,
      subtotal,
      total: grandTotal,
      status: 'pending',
      createdAt: new Date().toISOString(),
      note: note.trim() || undefined,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    }, 800);
  };

  return (
    <section id="order-form" className="py-8 sm:py-12 scroll-mt-14">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        {/* Main Card Container */}
        <div className="bg-[#FFFDF9] rounded-2xl sm:rounded-3xl border border-[#DFCBB5] shadow-xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#78350F] text-white p-4 sm:p-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold font-bengali-serif">
              অর্ডারটি সম্পন্ন করতে নিচের তথ্যগুলো পূরণ করুন
            </h2>
            <p className="text-xs sm:text-sm text-[#FDE68A] mt-1">
              কোনো অগ্রিম পেমেন্ট নেই • পণ্য হাতে পেয়ে চেক করে টাকা দিন
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-7 space-y-7">
            {/* YOUR PRODUCTS SECTION (As in Image 2) */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Your Products
                </h3>
                {isFreeDelivery && (
                  <span className="text-xs bg-[#DCFCE7] text-[#15803D] font-bold px-2.5 py-1 rounded-full border border-[#BBF7D0]">
                    ✓ ফ্রি ডেলিভারি একটিভ
                  </span>
                )}
              </div>

              {errors.products && (
                <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.products}</span>
                </div>
              )}

              {/* 2-Column Product Cards Grid (Matching Image 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {CHECKOUT_PRODUCTS.map((prod) => {
                  const state = productStates[prod.id] || { selected: false, quantity: 1 };
                  const isChecked = state.selected;
                  const qty = state.quantity;
                  const itemTotalPrice = prod.price * qty;

                  return (
                    <div
                      key={prod.id}
                      className={`relative rounded-xl border p-3 sm:p-4 transition-all duration-200 flex items-center justify-between gap-3 ${
                        isChecked
                          ? 'border-gray-400 bg-[#F4EFE6]/70 shadow-xs ring-1 ring-[#78350F]/20'
                          : 'border-gray-300 bg-[#FAFAFA] hover:bg-gray-100/70'
                      }`}
                    >
                      {/* Left: Checkbox + Thumbnail */}
                      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        {/* Checkbox input */}
                        <label className="cursor-pointer p-1 -m-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleProduct(prod.id)}
                            className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded border-gray-400 text-[#78350F] focus:ring-[#78350F] cursor-pointer accent-[#78350F]"
                          />
                        </label>

                        {/* Thumbnail image */}
                        <img
                          src={prod.image}
                          alt={prod.name}
                          onClick={() => toggleProduct(prod.id)}
                          className="w-13 h-13 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-300 shadow-2xs cursor-pointer"
                        />
                      </div>

                      {/* Right: Product Name & Quantity Stepper & Price */}
                      <div className="flex-1 min-w-0">
                        {/* Title with multiplier */}
                        <div
                          onClick={() => toggleProduct(prod.id)}
                          className="font-bold text-xs sm:text-sm text-gray-900 cursor-pointer truncate"
                          title={prod.name}
                        >
                          {prod.name} × {qty}
                        </div>

                        {/* Stepper + Price Row */}
                        <div className="flex items-center gap-2 sm:gap-3 mt-2">
                          {/* Stepper buttons [-] [qty] [+] */}
                          <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(prod.id, -1)}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-r border-gray-300 text-xs sm:text-sm font-bold cursor-pointer select-none active:bg-gray-200"
                              title="পরিমাণ কমান"
                            >
                              -
                            </button>
                            <input
                              type="text"
                              value={qty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                                setDirectQuantity(prod.id, val);
                              }}
                              className="w-7 sm:w-9 h-6 sm:h-7 text-center text-xs sm:text-sm font-bold text-gray-800 border-none focus:outline-none bg-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => updateQuantity(prod.id, 1)}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-l border-gray-300 text-xs sm:text-sm font-bold cursor-pointer select-none active:bg-gray-200"
                              title="পরিমাণ বাড়ান"
                            >
                              +
                            </button>
                          </div>

                          {/* Calculated Item Price (Bengali Taka Format) */}
                          <div className="font-bold text-xs sm:text-sm text-gray-900 tracking-tight whitespace-nowrap">
                            {itemTotalPrice.toFixed(2)}৳
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BILLING / CUSTOMER DETAILS */}
            <div className="pt-2 border-t border-gray-200 space-y-4">
              <h3 className="text-base sm:text-lg font-bold font-bengali-serif text-[#3D1A07] flex items-center gap-2">
                <User className="w-4 h-4 text-[#B45309]" />
                <span>আপনার ডেলিভারির তথ্য দিন:</span>
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">
                  আপনার নাম *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মোঃ তানভীর হাসান"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                      : 'border-gray-300 focus:ring-[#78350F]'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">
                  মোবাইল নম্বর * (১১ ডিজিট)
                </label>
                <input
                  type="tel"
                  placeholder="যেমন: 01712345678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                      : 'border-gray-300 focus:ring-[#78350F]'
                  }`}
                />
                {errors.phone ? (
                  <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    অর্ডার কনফার্ম করার জন্য এই নম্বরে কল করা হবে।
                  </p>
                )}
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">
                  সম্পূর্ণ ঠিকানা *
                </label>
                <textarea
                  rows={2}
                  placeholder="বাসা নং, রোড নং/গ্রাম, এলাকা, থানা এবং জেলার নাম লিখুন..."
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                    errors.address
                      ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                      : 'border-gray-300 focus:ring-[#78350F]'
                  }`}
                />
                {errors.address && (
                  <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.address}
                  </p>
                )}
              </div>

              {/* Delivery Area Options */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                  ডেলিভারি এরিয়া:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      deliveryArea === 'inside_dhaka'
                        ? 'border-[#78350F] bg-[#FEF3C7]/40 ring-1 ring-[#78350F]'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="deliveryArea"
                        checked={deliveryArea === 'inside_dhaka'}
                        onChange={() => setDeliveryArea('inside_dhaka')}
                        className="accent-[#78350F] w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm font-bold text-gray-800">
                        ঢাকার ভেতরে
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#78350F]">
                      {isFreeDelivery ? <span className="text-emerald-700">ফ্রি!</span> : '70.00৳'}
                    </span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                      deliveryArea === 'outside_dhaka'
                        ? 'border-[#78350F] bg-[#FEF3C7]/40 ring-1 ring-[#78350F]'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="deliveryArea"
                        checked={deliveryArea === 'outside_dhaka'}
                        onChange={() => setDeliveryArea('outside_dhaka')}
                        className="accent-[#78350F] w-4 h-4"
                      />
                      <span className="text-xs sm:text-sm font-bold text-gray-800">
                        ঢাকার বাইরে (সারাদেশ)
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#78350F]">
                      {isFreeDelivery ? <span className="text-emerald-700">ফ্রি!</span> : '130.00৳'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Delivery Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  ডেলিভারি নোট বা বিশেষ নির্দেশনা (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বিকেলে কল দিবেন..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#78350F]"
                />
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/60 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
              </div>
              <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-semibold shrink-0">
                পণ্য পেয়ে টাকা দিন
              </span>
            </div>

            {/* ORDER SUMMARY (Your Order Breakdown) */}
            <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-2.5 text-xs sm:text-sm">
              <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 text-sm sm:text-base">
                Your Order Summary
              </h4>

              {selectedItems.length === 0 ? (
                <p className="text-gray-500 italic py-2">কোনো পণ্য সিলেক্ট করা নেই। উপরের তালিকা থেকে পণ্য সিলেক্ট করুন।</p>
              ) : (
                <div className="space-y-1.5 divide-y divide-gray-100">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between pt-1.5 text-gray-700">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-semibold text-gray-900">{(item.price * item.quantity).toFixed(2)}৳</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>সাবটোটাল:</span>
                  <span className="font-semibold">{subtotal.toFixed(2)}৳</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-bold">ফ্রি (০.০০৳)</span>
                    ) : (
                      `${deliveryFee.toFixed(2)}৳`
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-base sm:text-lg font-black text-gray-900 pt-2 border-t border-gray-300">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="text-xl sm:text-2xl text-[#78350F]">
                    {grandTotal.toFixed(2)}৳
                  </span>
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || selectedItems.length === 0}
                className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-[#8D4925] via-[#78350F] to-[#5C2B14] hover:from-[#78350F] hover:to-[#451A03] text-white text-base sm:text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed animate-warm-pulse"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>অর্ডার প্রসেস হচ্ছে...</span>
                  </div>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>অর্ডার নিশ্চিত করুন ({grandTotal.toFixed(2)}৳)</span>
                  </>
                )}
              </button>

              <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] sm:text-[11px] text-center text-gray-600">
                <div className="bg-gray-100 p-1.5 rounded">✓ ক্যাশ অন ডেলিভারি</div>
                <div className="bg-gray-100 p-1.5 rounded">✓ পার্সেল খুলে চেক করুন</div>
                <div className="bg-gray-100 p-1.5 rounded">✓ রিটার্ন গ্যারান্টি</div>
                <div className="bg-gray-100 p-1.5 rounded">✓ সারাদেশে হোম ডেলিভারি</div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
