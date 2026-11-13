import React from 'react';
import { Trees, Flame, UtensilsCrossed } from 'lucide-react';
import { useSite } from '../lib/site';

export const StorySection: React.FC = () => {
  const { landing } = useSite();

  return (
    <section className="py-12 md:py-16 bg-[#F5EADB]/60 border-y border-[#EADBCE]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EADBCE] text-[#5C2B14] text-xs font-semibold mb-3">
            <Trees className="w-3.5 h-3.5 text-[var(--c-accent)]" />
            <span>{landing.story_badge}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-bengali-serif text-[#3D1A07]">{landing.story_title}</h2>
          <p className="text-sm md:text-base text-[#6B4226] mt-2">{landing.story_subtitle}</p>
        </div>

        {landing.story_image && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-[#EADBCE]">
                <img
                  src={landing.story_image}
                  alt={landing.story_caption_title}
                  loading="lazy"
                  className="w-full h-[320px] sm:h-[400px] object-cover group-hover:scale-102 transition-transform duration-500"
                />
              </div>
              {(landing.story_caption_title || landing.story_caption) && (
                <div className="absolute bottom-2 left-2 right-2 sm:left-auto sm:right-4 sm:bottom-4 bg-[#451A03]/95 text-white p-3 sm:p-3.5 rounded-xl shadow-lg border border-[var(--c-accent)]/50 sm:max-w-xs text-xs">
                  <div className="flex items-center gap-2 mb-1 text-[#FDE68A] font-bold">
                    <Flame className="w-4 h-4 text-[#F59E0B]" />
                    <span>{landing.story_caption_title}</span>
                  </div>
                  <p className="text-zinc-200 leading-snug">{landing.story_caption}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-[#FFFDF9] rounded-2xl border border-[#DFCBB5] overflow-hidden shadow-md grid grid-cols-1 md:grid-cols-12 items-center">
          {landing.pitha_image && (
            <div className="md:col-span-5 h-64 md:h-full min-h-[220px]">
              <img src={landing.pitha_image} alt={landing.pitha_title} loading="lazy" className="w-full h-full object-cover" />
            </div>
          )}
          <div className={`${landing.pitha_image ? 'md:col-span-7' : 'md:col-span-12'} p-6 sm:p-8 space-y-3`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[var(--c-secondary)] text-xs font-bold">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>{landing.pitha_badge}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-bengali-serif text-[#3D1A07]">{landing.pitha_title}</h3>
            <p className="text-xs sm:text-sm text-[#6B4226] leading-relaxed">{landing.pitha_text}</p>
            <div className="pt-1 flex flex-wrap gap-2 text-xs font-medium text-[#522910]">
              {landing.pitha_points.map((p, i) => (
                <span key={i} className="bg-[var(--c-bg)] px-2.5 py-1 rounded-md border border-[#EADBCE]">
                  ✓ {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
