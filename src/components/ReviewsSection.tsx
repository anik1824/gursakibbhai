import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, MessageSquare } from 'lucide-react';
import { REVIEWS_DATA } from '../data/gurData';
import { ReviewItem } from '../types';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(REVIEWS_DATA);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    location: '',
    rating: 5,
    comment: '',
    packageBought: '২ কেজি স্পেশাল কম্বো প্যাক',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    const item: ReviewItem = {
      id: `user-rev-${Date.now()}`,
      name: newReview.name,
      location: newReview.location || 'বাংলাদেশ',
      rating: newReview.rating,
      date: 'আজকে',
      comment: newReview.comment,
      verified: true,
      avatarText: newReview.name.slice(0, 1),
      packageBought: newReview.packageBought,
    };

    setReviews([item, ...reviews]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
      setNewReview({
        name: '',
        location: '',
        rating: 5,
        comment: '',
        packageBought: '২ কেজি স্পেশাল কম্বো প্যাক',
      });
    }, 2000);
  };

  return (
    <section className="py-12 md:py-16 bg-[#F5EADB]/50 border-t border-[#EADBCE]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Heading & Stats Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EADBCE] text-[#5C2B14] text-xs font-semibold mb-2">
              <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
              <span>প্রকৃত গ্রাহকদের অভিজ্ঞতা</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-bengali-serif text-[#3D1A07]">
              আমাদের গুড় খেয়ে গ্রাহকরা যা বলছেন
            </h2>
            <p className="text-sm text-[#6B4226] mt-1">
              সারা দেশের হাজারো পরিবার আমাদের খাঁটি খেজুরের গুড় খেয়ে সন্তুষ্ট।
            </p>
          </div>

          {/* Social Proof Summary Card */}
          <div className="bg-[#FFFDF9] p-4 rounded-xl border border-[#DFCBB5] shadow-sm flex items-center gap-6 shrink-0">
            <div className="text-center border-r border-[#EADBCE] pr-6">
              <div className="text-3xl font-black text-[#92400E] leading-none">
                ৪.৯<span className="text-base text-zinc-400 font-normal">/৫</span>
              </div>
              <div className="flex items-center justify-center gap-0.5 text-amber-500 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-[11px] text-[#78350F]/70">১,৮৫০+ রিভিউ</span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-[#15803D] font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>১২,৫০০+ সফল ডেলিভারি</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#15803D] font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>৯৯% পজিটিভ মতামত</span>
              </div>
            </div>
          </div>
        </div>


        {/* Leave a review button toggle */}
        <div className="text-center">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#B45309] text-[#78350F] hover:bg-[#FEF3C7] transition-colors text-xs sm:text-sm font-bold cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>আপনার মূল্যবান মতামত বা রিভিউ লিখুন</span>
            </button>
          ) : (
            <div className="max-w-md mx-auto bg-[#FFFDF9] p-5 rounded-2xl border border-[#DFCBB5] shadow-md text-left">
              <h4 className="font-bold font-bengali-serif text-[#3D1A07] mb-3 text-base">
                আপনার মতামত জানান
              </h4>

              {submitted ? (
                <div className="p-4 bg-[#DCFCE7] text-[#166534] rounded-xl text-center text-sm font-semibold">
                  ✓ ধন্যবাদ! আপনার রিভিউটি সফলভাবে যুক্ত হয়েছে।
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#522910] font-semibold mb-1">
                      আপনার নাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: তানভীর আহমেদ"
                      value={newReview.name}
                      onChange={(e) =>
                        setNewReview({ ...newReview, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#DFCBB5] bg-white focus:outline-none focus:ring-2 focus:ring-[#B45309]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[#522910] font-semibold mb-1">
                        আপনার এলাকা / শহর
                      </label>
                      <input
                        type="text"
                        placeholder="যেমন: মিরপুর, ঢাকা"
                        value={newReview.location}
                        onChange={(e) =>
                          setNewReview({ ...newReview, location: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#DFCBB5] bg-white focus:outline-none focus:ring-2 focus:ring-[#B45309]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#522910] font-semibold mb-1">
                        রেটিং (১-৫)
                      </label>
                      <select
                        value={newReview.rating}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            rating: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[#DFCBB5] bg-white focus:outline-none focus:ring-2 focus:ring-[#B45309]"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (৫ তারকা)</option>
                        <option value="4">⭐⭐⭐⭐ (৪ তারকা)</option>
                        <option value="3">⭐⭐⭐ (৩ তারকা)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#522910] font-semibold mb-1">
                      আপনার রিভিউ লিখুন *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="গুড়ের স্বাদ, সুবাস ও ডেলিভারি নিয়ে আপনার অভিজ্ঞতা শেয়ার করুন..."
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-[#DFCBB5] bg-white focus:outline-none focus:ring-2 focus:ring-[#B45309]"
                    />
                  </div>

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
                      className="px-4 py-1.5 rounded-lg bg-[#B45309] hover:bg-[#92400E] text-white font-bold"
                    >
                      রিভিউ জমা দিন
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
