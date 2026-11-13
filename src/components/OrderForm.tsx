import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, User, AlertCircle, ShoppingBag, Gift } from 'lucide-react';
import { DeliveryArea, ItemKind, Order } from '../types';
import { useSite, trackInitiateCheckout, trackPurchase } from '../lib/site';
import { supabase } from '../lib/supabase';
import { calcTotals } from '../lib/pricing';
import { bnMoney, errorMessage, isValidBdPhone, toBn } from '../lib/format';

interface OrderFormProps {
  onOrderSuccess: (order: Order) => void;
  picked: { id: string; n: number } | null;
}

interface Line {
  key: string;
  kind: ItemKind;
  id: string;
  name: string;
  price: number;
  weight_kg: number;
  image: string;
  free_delivery: boolean;
  group: string;
}

type LineState = Record<string, { selected: boolean; quantity: number }>;

const newSessionId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const OrderForm: React.FC<OrderFormProps> = ({ onOrderSuccess, picked }) => {
  const { products, packages, categories, delivery, landing, loading } = useSite();

  const lines: Line[] = useMemo(() => {
    const catName = (id?: string | null) => categories.find((c) => c.id === id)?.name || 'পণ্যসমূহ';
    const catRank = (id?: string | null) => {
      const i = categories.findIndex((c) => c.id === id);
      return i < 0 ? categories.length : i;
    };
    const sortedProducts = [...products].sort((a, b) => catRank(a.category_id) - catRank(b.category_id) || a.sort - b.sort);
    return [
      ...sortedProducts.map((p) => ({
        key: `product:${p.id}`,
        kind: 'product' as const,
        id: p.id,
        name: p.name,
        price: Number(p.price),
        weight_kg: Number(p.weight_kg),
        image: p.image_url,
        free_delivery: false,
        group: catName(p.category_id),
      })),
      ...packages.map((k) => ({
        key: `package:${k.id}`,
        kind: 'package' as const,
        id: k.id,
        name: k.name,
        price: Number(k.discount_price),
        weight_kg: Number(k.weight_kg),
        image: k.image_url,
        free_delivery: k.is_free_delivery,
        group: 'প্রিমিয়াম কম্বো প্যাক',
      })),
    ];
  }, [products, packages, categories]);

  const [state, setState] = useState<LineState>({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<DeliveryArea>('inside_dhaka');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sessionId = useRef(newSessionId());
  const checkoutTracked = useRef(false);

  // ডেটা লোড হলে ডিফল্ট সিলেক্টেড পণ্য চেক করা
  useEffect(() => {
    if (loading) return;
    setState((prev) => {
      if (Object.values(prev).some((s) => s.selected)) return prev;
      const next: LineState = {};
      products.forEach((p) => {
        if (p.is_default_selected) next[`product:${p.id}`] = { selected: true, quantity: 1 };
      });
      return next;
    });
  }, [loading, products]);

  useEffect(() => {
    if (!picked) return;
    const key = `package:${picked.id}`;
    setState((prev) => ({ ...prev, [key]: { selected: true, quantity: prev[key]?.quantity || 1 } }));
    setErrors((e) => ({ ...e, products: '' }));
  }, [picked]);

  const get = (key: string) => state[key] || { selected: false, quantity: 1 };

  const setLine = (key: string, patch: Partial<{ selected: boolean; quantity: number }>) => {
    setState((prev) => ({ ...prev, [key]: { ...(prev[key] || { selected: false, quantity: 1 }), ...patch } }));
    if (errors.products) setErrors((e) => ({ ...e, products: '' }));
  };

  const selected = lines.filter((l) => get(l.key).selected).map((l) => ({ ...l, quantity: get(l.key).quantity }));
  const totals = calcTotals(selected, deliveryArea, delivery);

  const groups = useMemo(() => {
    const map = new Map<string, Line[]>();
    lines.forEach((l) => map.set(l.group, [...(map.get(l.group) || []), l]));
    return [...map.entries()];
  }, [lines]);

  // অসম্পূর্ণ অর্ডার সেভ (ফোন নম্বর দেওয়ার পর)
  useEffect(() => {
    if (!supabase || phone.replace(/\D/g, '').length < 6) return;
    const t = setTimeout(() => {
      supabase!
        .rpc('save_incomplete_order', {
          payload: {
            session_id: sessionId.current,
            name,
            phone,
            address,
            total: totals.total,
            items: selected.map((s) => ({ kind: s.kind, id: s.id, name: s.name, price: s.price, quantity: s.quantity })),
          },
        })
        .then(() => undefined);
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, phone, address, totals.total]);

  const markStarted = () => {
    if (!checkoutTracked.current) {
      checkoutTracked.current = true;
      trackInitiateCheckout();
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (selected.length === 0) e.products = 'অনুগ্রহ করে কমপক্ষে একটি গুড় সিলেক্ট করুন';
    if (!name.trim()) e.name = 'অনুগ্রহ করে আপনার পুরো নাম লিখুন';
    if (!phone.trim()) e.phone = 'অনুগ্রহ করে আপনার মোবাইল নম্বর লিখুন';
    else if (!isValidBdPhone(phone)) e.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)';
    if (!address.trim()) e.address = 'অনুগ্রহ করে আপনার বিস্তারিত ডেলিভারি ঠিকানা লিখুন';
    else if (address.trim().length < 8) e.address = 'বাসা নং, রোড, থানা ও জেলার নাম সহ বিস্তারিত ঠিকানা দিন';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    if (!supabase) {
      setSubmitError('এই মুহূর্তে অনলাইনে অর্ডার নেওয়া যাচ্ছে না। অনুগ্রহ করে কল করে অর্ডার দিন।');
      return;
    }
    setIsSubmitting(true);
    const { data, error } = await supabase.rpc('place_order', {
      payload: {
        session_id: sessionId.current,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        delivery_area: deliveryArea,
        note: note.trim(),
        items: selected.map((s) => ({ kind: s.kind, id: s.id, quantity: s.quantity })),
      },
    });
    setIsSubmitting(false);
    if (error) {
      setSubmitError(errorMessage(error));
      return;
    }
    const order = data as Order;
    trackPurchase(order);
    sessionId.current = newSessionId();
    setName('');
    setPhone('');
    setAddress('');
    setNote('');
    onOrderSuccess(order);
  };

  const inputCls = (err?: string) =>
    `w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 ${
      err ? 'border-red-500 focus:ring-red-400 bg-red-50/20' : 'border-gray-300 focus:ring-[var(--c-primary)]'
    }`;

  const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
    msg ? (
      <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5" /> {msg}
      </p>
    ) : null;

  return (
    <section id="order-form" className="py-8 sm:py-12 scroll-mt-14">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="bg-[#FFFDF9] rounded-2xl sm:rounded-3xl border border-[#DFCBB5] shadow-xl overflow-hidden">
          <div className="bg-[var(--c-primary)] text-white p-4 sm:p-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold font-bengali-serif">{landing.order_form_title}</h2>
            <p className="text-xs sm:text-sm text-[#FDE68A] mt-1">{landing.order_form_subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} onFocus={markStarted} className="p-4 sm:p-7 space-y-7" noValidate>
            <div>
              <div className="flex items-center justify-between mb-3.5 gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">আপনার পণ্য বেছে নিন</h3>
                {totals.isFree && (
                  <span className="text-xs bg-[#DCFCE7] text-[#15803D] font-bold px-2.5 py-1 rounded-full border border-[#BBF7D0] shrink-0">
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

              <div className="space-y-5">
                {groups.map(([group, groupLines]) => (
                  <div key={group}>
                    {groups.length > 1 && (
                      <p className="text-xs font-bold text-[var(--c-primary)] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        {group === 'প্রিমিয়াম কম্বো প্যাক' && <Gift className="w-3.5 h-3.5" />}
                        {group}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {groupLines.map((l) => {
                        const s = get(l.key);
                        return (
                          <div
                            key={l.key}
                            className={`relative rounded-xl border p-3 sm:p-4 transition-all duration-200 flex items-center justify-between gap-3 ${
                              s.selected
                                ? 'border-gray-400 bg-[#F4EFE6]/70 shadow-xs ring-1 ring-[var(--c-primary)]/20'
                                : 'border-gray-300 bg-[#FAFAFA] hover:bg-gray-100/70'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                              <label className="cursor-pointer p-1 -m-1">
                                <input
                                  type="checkbox"
                                  checked={s.selected}
                                  onChange={() => setLine(l.key, { selected: !s.selected })}
                                  className="w-4 h-4 rounded border-gray-400 cursor-pointer accent-[var(--c-primary)]"
                                  aria-label={l.name}
                                />
                              </label>
                              {l.image && (
                                <img
                                  src={l.image}
                                  alt={l.name}
                                  loading="lazy"
                                  onClick={() => setLine(l.key, { selected: !s.selected })}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-300 shadow-sm cursor-pointer"
                                />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div
                                onClick={() => setLine(l.key, { selected: !s.selected })}
                                className="font-bold text-sm sm:text-base text-gray-900 cursor-pointer line-clamp-2"
                                title={l.name}
                              >
                                {l.name} × {toBn(s.quantity)}
                              </div>
                              <div className="flex items-center gap-2.5 sm:gap-3.5 mt-2">
                                <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => setLine(l.key, { selected: true, quantity: Math.max(1, s.quantity - 1) })}
                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-r border-gray-300 text-sm font-bold cursor-pointer select-none"
                                    aria-label="পরিমাণ কমান"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={s.quantity}
                                    onChange={(e) => {
                                      const v = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                                      setLine(l.key, { selected: true, quantity: Math.min(99, Math.max(1, isNaN(v) ? 1 : v)) });
                                    }}
                                    className="w-8 sm:w-10 h-7 sm:h-8 text-center text-xs sm:text-sm font-bold text-gray-800 border-none focus:outline-none bg-transparent"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setLine(l.key, { selected: true, quantity: Math.min(99, s.quantity + 1) })}
                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-l border-gray-300 text-sm font-bold cursor-pointer select-none"
                                    aria-label="পরিমাণ বাড়ান"
                                  >
                                    +
                                  </button>
                                </div>
                                <div className="font-bold text-sm sm:text-base text-gray-900 tracking-tight whitespace-nowrap">
                                  ৳{bnMoney(l.price * s.quantity)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 space-y-4">
              <h3 className="text-base sm:text-lg font-bold font-bengali-serif text-[#3D1A07] flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--c-accent)]" />
                <span>আপনার ডেলিভারির তথ্য দিন:</span>
              </h3>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">আপনার নাম *</label>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="যেমন: মোঃ তানভীর হাসান"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                  }}
                  className={inputCls(errors.name)}
                />
                <FieldError msg={errors.name} />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">মোবাইল নম্বর * (১১ ডিজিট)</label>
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="যেমন: 01712345678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                  }}
                  className={inputCls(errors.phone)}
                />
                {errors.phone ? (
                  <FieldError msg={errors.phone} />
                ) : (
                  <p className="text-[11px] text-gray-500 mt-0.5">অর্ডার কনফার্ম করার জন্য এই নম্বরে কল করা হবে।</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1">সম্পূর্ণ ঠিকানা *</label>
                <textarea
                  rows={2}
                  autoComplete="street-address"
                  placeholder="বাসা নং, রোড নং/গ্রাম, এলাকা, থানা এবং জেলার নাম লিখুন..."
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((p) => ({ ...p, address: '' }));
                  }}
                  className={inputCls(errors.address)}
                />
                <FieldError msg={errors.address} />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">ডেলিভারি এরিয়া:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(
                    [
                      ['inside_dhaka', 'ঢাকার ভেতরে', delivery.inside_dhaka],
                      ['outside_dhaka', 'ঢাকার বাইরে (সারাদেশ)', delivery.outside_dhaka],
                    ] as const
                  ).map(([value, label, fee]) => (
                    <label
                      key={value}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        deliveryArea === value ? 'border-[var(--c-primary)] bg-[#FEF3C7]/40 ring-1 ring-[var(--c-primary)]' : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="deliveryArea"
                          checked={deliveryArea === value}
                          onChange={() => setDeliveryArea(value)}
                          className="accent-[var(--c-primary)] w-4 h-4"
                        />
                        <span className="text-xs sm:text-sm font-bold text-gray-800">{label}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[var(--c-primary)]">
                        {totals.isFree ? <span className="text-emerald-700">ফ্রি!</span> : `৳${bnMoney(fee)}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">ডেলিভারি নোট বা বিশেষ নির্দেশনা (ঐচ্ছিক):</label>
                <input
                  type="text"
                  placeholder="যেমন: বিকেলে কল দিবেন..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[var(--c-primary)]"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/60 flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>ক্যাশ অন ডেলিভারি (Cash on Delivery)</span>
              </div>
              <span className="text-[11px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-semibold shrink-0">পণ্য পেয়ে টাকা দিন</span>
            </div>

            <div className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-2.5 text-xs sm:text-sm">
              <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 text-sm sm:text-base">অর্ডারের সারসংক্ষেপ</h4>
              {selected.length === 0 ? (
                <p className="text-gray-500 italic py-2">কোনো পণ্য সিলেক্ট করা নেই। উপরের তালিকা থেকে পণ্য সিলেক্ট করুন।</p>
              ) : (
                <div className="space-y-1.5 divide-y divide-gray-100">
                  {selected.map((item) => (
                    <div key={item.key} className="flex justify-between gap-3 pt-1.5 text-gray-700">
                      <span>
                        {item.name} × {toBn(item.quantity)}
                      </span>
                      <span className="font-semibold text-gray-900 whitespace-nowrap">৳{bnMoney(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>সাবটোটাল:</span>
                  <span className="font-semibold">৳{bnMoney(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-semibold">
                    {totals.fee === 0 ? <span className="text-emerald-600 font-bold">ফ্রি (৳০)</span> : `৳${bnMoney(totals.fee)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-base sm:text-lg font-black text-gray-900 pt-2 border-t border-gray-300">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="text-xl sm:text-2xl text-[var(--c-primary)]">৳{bnMoney(totals.total)}</span>
                </div>
              </div>
            </div>

            <div>
              {submitError && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting || selected.length === 0}
                className="w-full py-3.5 sm:py-4 px-6 rounded-xl bg-gradient-to-r from-[#8D4925] via-[var(--c-primary)] to-[#5C2B14] hover:from-[var(--c-primary)] hover:to-[#451A03] text-white text-base sm:text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed animate-warm-pulse"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>অর্ডার প্রসেস হচ্ছে...</span>
                  </div>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>অর্ডার নিশ্চিত করুন (৳{bnMoney(totals.total)})</span>
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
