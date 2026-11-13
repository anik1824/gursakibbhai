import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, BadgeCheck } from 'lucide-react';
import { useSite } from '../lib/site';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/format';

const relativeDate = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'আজকে';
  if (days < 7) return `${days} দিন আগে`;
  if (days < 30) return `${Math.floor(days / 7)} সপ্তাহ আগে`;
  return new Date(iso).toLocaleDateString('bn-BD');
};

export const ReviewsSection: React.FC = () => {
  const { landing, reviews, packages } = useSite();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', rating: 5, comment: '', package_bought: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;
    if (!supabase) {
      setError('এই মুহূর্তে রিভিউ জমা নেওয়া যাচ্ছে না');
      return;
    }
    setState('sending');
    setError('');
    const { error: err } = await supabase.from('reviews').insert({
      name: form.name.trim().slice(0, 80),
      location: form.location.trim().slice(0, 80) || null,
      rating: form.rating,
      comment: form.comment.trim().slice(0, 1000),
      package_bought: form.package_bought || null,
      approved: false,
    });
    if (err) {
      setError(errorMessage(err));
      setState('idle');
      return;
    }
    setState('done');
    setTimeout(() => {
      setState('idle');
      setShowForm(false);
      setForm({ name: '', location: '', rating: 5, comment: '', package_bought: '' });
    }, 2500);
  };

  return (
    <section className="py-12 md:py-16 bg-[#F5EADB]/50 border-t border-[#EADBCE]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EADBCE] text-[#5C2B14] text-xs font-semibold mb-2">
              <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
              <span>{landing.reviews_badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-bengali-serif text-[#3D1A07]">{landing.reviews_title}</h2>
            <p className="text-sm text-[#6B4226] mt-1">{landing.reviews_subtitle}</p>
          </div>

          <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#DFCBB5] shadow-sm flex items-center gap-6 shrink-0">
            <div className="text-center border-r border-[#EADBCE] pr-6">
              <div className="text-3xl font-black text-[var(--c-secondary)] leading-none">
                {landing.reviews_rating}
                <span className="text-base text-zinc-400 font-normal">/৫</span>
              </div>
              <div className="flex items-center justify-center gap-0.5 text-amber-500 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[11px] text-[var(--c-primary)]/70">{landing.reviews_count_text}</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-[#15803D] font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{landing.reviews_stat_1}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#15803D] font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{landing.reviews_stat_2}</span>
              </div>
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {reviews.slice(0, 9).map((r) => (
              <div key={r.id} className="bg-[#FFFDF9] p-5 rounded-2xl border border-[#DFCBB5] shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[var(--c-secondary)] flex items-center justify-center font-bold shrink-0">
                    {r.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[#3D1A07] truncate flex items-center gap-1">
                      {r.name}
                      <BadgeCheck className="w-4 h-4 text-[#15803D] shrink-0" />
                    </p>
                    <p className="text-[11px] text-[var(--c-primary)]/70 truncate">
                      {[r.location, relativeDate(r.created_at)].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-amber-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-current' : 'text-zinc-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-[#4A2511] leading-relaxed flex-1">{r.comment}</p>
                {r.package_bought && (
                  <p className="mt-3 text-[11px] font-semibold text-[var(--c-secondary)] bg-[var(--c-bg)] px-2 py-1 rounded-md self-start">
                    কিনেছেন: {r.package_bought}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--c-accent)] text-[var(--c-primary)] hover:bg-[#FEF3C7] transition-colors text-xs sm:text-sm font-bold cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>আপনার মূল্যবান মতামত বা রিভিউ লিখুন</span>
            </button>
          ) : (
            <div className="max-w-md mx-auto bg-[#FFFDF9] p-5 rounded-2xl border border-[#DFCBB5] shadow-md text-left">
              <h4 className="font-bold font-bengali-serif text-[#3D1A07] mb-3 text-base">আপনার মতামত জানান</h4>

              {state === 'done' ? (
                <div className="p-4 bg-[#DCFCE7] text-[#166534] rounded-xl text-center text-sm font-semibold">
                  ✓ ধন্যবাদ! যাচাইয়ের পর আপনার রিভিউটি প্রকাশ করা হবে।
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#522910] font-semibold mb-1">আপনার নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: তানভীর আহমেদ"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#DFCBB5] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#522910] font-semibold mb-1">আপনার এলাকা / শহর</label>
                      <input
                        type="text"
                        placeholder="যেমন: মিরপুর, ঢাকা"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#DFCBB5] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#522910] font-semibold mb-1">রেটিং</label>
                      <select
                        value={form.rating}
                        onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 rounded-lg border border-[#DFCBB5] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)]"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (৫)</option>
                        <option value="4">⭐⭐⭐⭐ (৪)</option>
                        <option value="3">⭐⭐⭐ (৩)</option>
                        <option value="2">⭐⭐ (২)</option>
                        <option value="1">⭐ (১)</option>
                      </select>
                    </div>
                  </div>

                  {packages.length > 0 && (
                    <div>
                      <label className="block text-[#522910] font-semibold mb-1">কোন প্যাকেজ কিনেছেন?</label>
                      <select
                        value={form.package_bought}
                        onChange={(e) => setForm({ ...form, package_bought: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-[#DFCBB5] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)]"
                      >
                        <option value="">— বেছে নিন (ঐচ্ছিক) —</option>
                        {packages.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-[#522910] font-semibold mb-1">আপনার রিভিউ লিখুন *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="গুড়ের স্বাদ, সুবাস ও ডেলিভারি নিয়ে আপনার অভিজ্ঞতা শেয়ার করুন..."
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#DFCBB5] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--c-accent)]"
                    />
                  </div>

                  {error && <p className="text-red-600 font-semibold">{error}</p>}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={state === 'sending'}
                      className="px-4 py-1.5 rounded-lg bg-[var(--c-accent)] hover:bg-[var(--c-secondary)] text-white font-bold disabled:opacity-60"
                    >
                      {state === 'sending' ? 'জমা হচ্ছে...' : 'রিভিউ জমা দিন'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
