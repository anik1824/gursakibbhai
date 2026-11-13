import React from 'react';
import { DEFAULT_LANDING } from '../../data/gurData';
import { FaqItem, LandingContent } from '../../types';
import { useSetting } from '../useSetting';
import { Button, Card, Field, ImageInput, Input, ListEditor, PageTitle, Spinner, Textarea } from '../ui';

type Key = keyof LandingContent;
type FieldDef = { key: Key; label: string; type?: 'text' | 'textarea' | 'number' | 'list' | 'image' };

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'উপরের ঘোষণা ও অফার',
    fields: [
      { key: 'announcement', label: 'হেডারের ঘোষণা বার (খালি রাখলে লুকানো থাকবে)' },
      { key: 'offer_label', label: 'অফারের ছোট লেখা' },
      { key: 'offer_title', label: 'কাউন্টডাউনের শিরোনাম' },
      { key: 'countdown_hours', label: 'কাউন্টডাউন কত ঘণ্টা পরপর রিসেট হবে (০ = লুকানো)', type: 'number' },
    ],
  },
  {
    title: 'হিরো সেকশন',
    fields: [
      { key: 'hero_badge', label: 'উপরের ব্যাজ' },
      { key: 'hero_title', label: 'শিরোনাম (প্রথম অংশ)' },
      { key: 'hero_highlight', label: 'শিরোনাম (হাইলাইট অংশ)' },
      { key: 'hero_title_end', label: 'শিরোনাম (শেষ অংশ)' },
      { key: 'hero_description', label: 'বর্ণনা', type: 'textarea' },
      { key: 'hero_bullets', label: 'সুবিধার পয়েন্ট ("—" এর আগের অংশ বোল্ড হবে)', type: 'list' },
      { key: 'hero_cta', label: 'অর্ডার বাটনের লেখা' },
      { key: 'hero_price_label', label: 'ছবির উপর দামের ছোট লেখা' },
      { key: 'hero_price_text', label: 'ছবির উপর দাম' },
      { key: 'hero_tag_left', label: 'ছবির বাম কোণের ট্যাগ' },
      { key: 'hero_tag_right', label: 'ছবির ডান কোণের ট্যাগ' },
    ],
  },
  {
    title: 'প্যাকেজ সেকশন',
    fields: [
      { key: 'packages_badge', label: 'ব্যাজ' },
      { key: 'packages_title', label: 'শিরোনাম' },
      { key: 'packages_subtitle', label: 'বর্ণনা', type: 'textarea' },
    ],
  },
  {
    title: 'গল্প / তৈরির প্রক্রিয়া',
    fields: [
      { key: 'story_badge', label: 'ব্যাজ' },
      { key: 'story_title', label: 'শিরোনাম' },
      { key: 'story_subtitle', label: 'বর্ণনা', type: 'textarea' },
      { key: 'story_image', label: 'বড় ছবি', type: 'image' },
      { key: 'story_caption_title', label: 'ছবির ক্যাপশন শিরোনাম' },
      { key: 'story_caption', label: 'ছবির ক্যাপশন', type: 'textarea' },
      { key: 'pitha_image', label: 'পিঠা সেকশনের ছবি', type: 'image' },
      { key: 'pitha_badge', label: 'পিঠা সেকশনের ব্যাজ' },
      { key: 'pitha_title', label: 'পিঠা সেকশনের শিরোনাম' },
      { key: 'pitha_text', label: 'পিঠা সেকশনের লেখা', type: 'textarea' },
      { key: 'pitha_points', label: 'পিঠা সেকশনের পয়েন্ট', type: 'list' },
    ],
  },
  {
    title: 'রিভিউ সেকশন',
    fields: [
      { key: 'reviews_badge', label: 'ব্যাজ' },
      { key: 'reviews_title', label: 'শিরোনাম' },
      { key: 'reviews_subtitle', label: 'বর্ণনা' },
      { key: 'reviews_rating', label: 'রেটিং (যেমন ৪.৯)' },
      { key: 'reviews_count_text', label: 'রিভিউ সংখ্যা লেখা' },
      { key: 'reviews_stat_1', label: 'পরিসংখ্যান ১' },
      { key: 'reviews_stat_2', label: 'পরিসংখ্যান ২' },
    ],
  },
  {
    title: 'অর্ডার ফর্ম ও সফল মেসেজ',
    fields: [
      { key: 'order_form_title', label: 'অর্ডার ফর্মের শিরোনাম' },
      { key: 'order_form_subtitle', label: 'অর্ডার ফর্মের নিচের লেখা' },
      { key: 'success_title', label: 'অর্ডার সফল হলে শিরোনাম' },
      { key: 'success_text', label: 'অর্ডার সফল হলে লেখা', type: 'textarea' },
    ],
  },
  {
    title: 'FAQ সেকশন',
    fields: [
      { key: 'faq_title', label: 'শিরোনাম' },
      { key: 'faq_subtitle', label: 'বর্ণনা' },
    ],
  },
];

export default function Landing() {
  const s = useSetting<LandingContent>('landing', DEFAULT_LANDING);
  if (s.loading) return <Spinner />;
  const v = s.value;

  const render = (f: FieldDef) => {
    const val = v[f.key];
    const set = (x: unknown) => s.patch({ [f.key]: x } as Partial<LandingContent>);
    switch (f.type) {
      case 'textarea':
        return (
          <Field key={f.key} label={f.label} className="sm:col-span-2">
            <Textarea rows={3} value={val as string} onChange={(e) => set(e.target.value)} />
          </Field>
        );
      case 'number':
        return (
          <Field key={f.key} label={f.label}>
            <Input type="number" min={0} value={val as number} onChange={(e) => set(Math.max(0, Number(e.target.value) || 0))} />
          </Field>
        );
      case 'list':
        return (
          <div key={f.key} className="sm:col-span-2">
            <span className="block text-xs font-semibold text-gray-700 mb-1">{f.label}</span>
            <ListEditor value={val as string[]} onChange={set} />
          </div>
        );
      case 'image':
        return (
          <div key={f.key} className="sm:col-span-2">
            <ImageInput label={f.label} value={val as string} onChange={set} folder="landing" />
          </div>
        );
      default:
        return (
          <Field key={f.key} label={f.label}>
            <Input value={val as string} onChange={(e) => set(e.target.value)} />
          </Field>
        );
    }
  };

  const setFaq = (faqs: FaqItem[]) => s.patch({ faqs });

  return (
    <div className="max-w-4xl space-y-4">
      <PageTitle
        title="ল্যান্ডিং পেজের লেখা"
        subtitle="ওয়েবসাইটের সব লেখা এখান থেকে বদলান — সেভ করলেই সাইটে দেখাবে"
        right={
          <Button loading={s.saving} onClick={() => s.save()}>
            সব সেভ করুন
          </Button>
        }
      />
      {SECTIONS.map((sec) => (
        <Card key={sec.title} className="p-5">
          <p className="font-bold mb-3">{sec.title}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{sec.fields.map(render)}</div>
        </Card>
      ))}

      <Card className="p-5 space-y-3">
        <p className="font-bold">প্রশ্নোত্তর (FAQ)</p>
        {v.faqs.map((f, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-2">
            <div className="flex gap-2">
              <Input value={f.question} placeholder="প্রশ্ন" onChange={(e) => setFaq(v.faqs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))} />
              <Button variant="secondary" onClick={() => setFaq(v.faqs.filter((_, j) => j !== i))}>
                মুছুন
              </Button>
            </div>
            <Textarea rows={3} value={f.answer} placeholder="উত্তর" onChange={(e) => setFaq(v.faqs.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))} />
          </div>
        ))}
        <Button variant="secondary" size="sm" onClick={() => setFaq([...v.faqs, { question: '', answer: '' }])}>
          + নতুন প্রশ্ন
        </Button>
      </Card>

      <div className="flex justify-end">
        <Button loading={s.saving} onClick={() => s.save({ ...v, faqs: v.faqs.filter((f) => f.question.trim()) })}>
          সব সেভ করুন
        </Button>
      </div>
    </div>
  );
}
