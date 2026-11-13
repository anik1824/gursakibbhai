import React, { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, ShieldCheck, Truck, ArrowRight, PhoneCall, Flame, Award } from 'lucide-react';
import { useSite } from '../lib/site';
import { telLink, toBn } from '../lib/format';

interface HeroProps {
  onScrollToOrder: () => void;
}

const BULLET_ICONS = [
  <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />,
  <ShieldCheck className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />,
  <Truck className="w-5 h-5 text-[var(--c-accent)] shrink-0 mt-0.5" />,
  <Award className="w-5 h-5 text-[var(--c-accent)] shrink-0 mt-0.5" />,
];

// প্রতি N ঘণ্টায় রিসেট হওয়া কাউন্টডাউন — রিলোড করলেও একই সময় দেখায়
const remainingSeconds = (hours: number) => {
  const cycle = Math.max(1, hours) * 3600;
  return cycle - (Math.floor(Date.now() / 1000) % cycle);
};

const BulletText: React.FC<{ text: string }> = ({ text }) => {
  const [head, ...rest] = text.split('—');
  if (!rest.length) return <span>{text}</span>;
  return (
    <span>
      <strong>{head.trim()}</strong> — {rest.join('—').trim()}
    </span>
  );
};

export const Hero: React.FC<HeroProps> = ({ onScrollToOrder }) => {
  const { store, landing, banners } = useSite();
  const [secs, setSecs] = useState(() => remainingSeconds(landing.countdown_hours));
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    setSecs(remainingSeconds(landing.countdown_hours));
    const t = setInterval(() => setSecs(remainingSeconds(landing.countdown_hours)), 1000);
    return () => clearInterval(t);
  }, [landing.countdown_hours]);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  const pad = (n: number) => toBn(String(n).padStart(2, '0'));
  const parts = [
    { v: Math.floor(secs / 3600), l: 'ঘণ্টা' },
    { v: Math.floor((secs % 3600) / 60), l: 'মিনিট' },
    { v: secs % 60, l: 'সেকেন্ড' },
  ];
  const current = banners[slide % Math.max(1, banners.length)];

  return (
    <section className="relative pt-6 pb-12 md:py-16 overflow-hidden">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#E8CCA8]/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4">
        {landing.countdown_hours > 0 && (
          <div className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-[var(--c-primary)] via-[var(--c-secondary)] to-[var(--c-primary)] text-white p-3 md:p-3.5 rounded-2xl shadow-md border border-[var(--c-accent)]/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#FEF3C7] text-[var(--c-accent)] rounded-lg">
                <Flame className="w-5 h-5 fill-current animate-bounce" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-[#FDE68A]">{landing.offer_label}</p>
                <p className="text-sm font-bold">{landing.offer_title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {parts.map((p, i) => (
                <React.Fragment key={p.l}>
                  {i > 0 && <span className="text-yellow-400 font-bold">:</span>}
                  <div className="bg-[#451A03]/80 border border-[#F59E0B]/40 px-2.5 py-1 rounded-lg text-center min-w-[50px]">
                    <span className="block text-base md:text-lg font-bold text-[#FDE68A] leading-none">{pad(p.v)}</span>
                    <span className="text-[10px] text-zinc-300">{p.l}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {landing.hero_badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE3D0] border border-[#DFCBB5] text-[#5C2B14] text-xs md:text-sm font-medium shadow-xs">
                <Sparkles className="w-4 h-4 text-[var(--c-accent)]" />
                <span>{landing.hero_badge}</span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-bengali-serif text-[#3D1A07] leading-[1.25] tracking-tight">
              {landing.hero_title}{' '}
              {landing.hero_highlight && (
                <span className="text-[var(--c-secondary)] underline decoration-[#D97706]/50 decoration-wavy underline-offset-8">
                  {landing.hero_highlight}
                </span>
              )}{' '}
              {landing.hero_title_end}
            </h1>

            <p className="text-base sm:text-lg text-[#5A3825] leading-relaxed max-w-xl mx-auto lg:mx-0">{landing.hero_description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto lg:mx-0 text-left">
              {landing.hero_bullets.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-[#FFF9F2] p-2.5 rounded-xl border border-[#EADBCE]">
                  {BULLET_ICONS[i % BULLET_ICONS.length]}
                  <span className="text-xs md:text-sm text-[#422006] font-medium">
                    <BulletText text={b} />
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <button
                onClick={onScrollToOrder}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--c-accent)] via-[var(--c-secondary)] to-[var(--c-primary)] hover:from-[var(--c-secondary)] hover:to-[#5C2B14] text-white text-base md:text-lg font-bold shadow-xl shadow-amber-900/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer animate-warm-pulse"
              >
                <span>{landing.hero_cta}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href={telLink(store.phone)}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-[#FFFDF9] hover:bg-[#F3E5D4] text-[#5C2B14] border border-[#CBB396] text-sm md:text-base font-bold shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[var(--c-accent)]" />
                <span>কল করে অর্ডার দিন: {store.phone}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-2 bg-gradient-to-tr from-[var(--c-accent)]/30 to-[#F59E0B]/20 rounded-3xl blur-md" />

              <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-[#EADBCE] h-[360px] sm:h-[440px]">
                {banners.map((b, i) => (
                  <img
                    key={b.id}
                    src={b.image_url}
                    alt={b.title || store.name}
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
                      i === slide % banners.length ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 text-white">
                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      {current?.title && (
                        <span className="text-xs bg-[var(--c-accent)] text-white px-2 py-0.5 rounded-md font-semibold">{current.title}</span>
                      )}
                      {current?.subtitle && <p className="text-sm font-bold mt-1 text-[#FDE68A]">{current.subtitle}</p>}
                    </div>
                    {landing.hero_price_text && (
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-zinc-300 block">{landing.hero_price_label}</span>
                        <span className="text-lg font-bold text-white">{landing.hero_price_text}</span>
                      </div>
                    )}
                  </div>
                  {banners.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                      {banners.map((b, i) => (
                        <button
                          key={b.id}
                          onClick={() => setSlide(i)}
                          aria-label={`স্লাইড ${i + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${i === slide % banners.length ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {landing.hero_tag_left && (
                  <div className="absolute top-3 left-3 bg-[#15803D] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/40">
                    <span className="w-2 h-2 rounded-full bg-lime-300 animate-ping" />
                    <span>{landing.hero_tag_left}</span>
                  </div>
                )}
                {landing.hero_tag_right && (
                  <div className="absolute top-3 right-3 bg-[#451A03]/90 text-[#FDE68A] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-[#F59E0B]/40">
                    <span>{landing.hero_tag_right}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
