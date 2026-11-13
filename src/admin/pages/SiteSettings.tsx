import React from 'react';
import { DEFAULT_STORE } from '../../data/gurData';
import { StoreSettings } from '../../types';
import { useSetting } from '../useSetting';
import { Button, Card, Field, ImageInput, Input, PageTitle, Spinner } from '../ui';

const COLOR_FIELDS: { key: keyof StoreSettings['colors']; label: string }[] = [
  { key: 'primary', label: 'প্রধান রং (হেডার, ফর্ম)' },
  { key: 'secondary', label: 'দ্বিতীয় রং (দাম, শিরোনাম)' },
  { key: 'accent', label: 'অ্যাকসেন্ট রং (বাটন, বর্ডার)' },
  { key: 'background', label: 'পেজের ব্যাকগ্রাউন্ড' },
];

export default function SiteSettings() {
  const s = useSetting<StoreSettings>('settings', DEFAULT_STORE);
  if (s.loading) return <Spinner />;
  const v = s.value;
  const colors = { ...DEFAULT_STORE.colors, ...v.colors };

  return (
    <div className="max-w-3xl space-y-4">
      <PageTitle title="সাইট সেটিংস ও রং" subtitle="দোকানের নাম, যোগাযোগ ও ওয়েবসাইটের রং" />
      <Card className="p-5 space-y-3">
        <p className="font-bold">দোকানের তথ্য</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="দোকানের নাম">
            <Input value={v.name} onChange={(e) => s.patch({ name: e.target.value })} />
          </Field>
          <Field label="ট্যাগলাইন">
            <Input value={v.tagline} onChange={(e) => s.patch({ tagline: e.target.value })} />
          </Field>
          <Field label="হটলাইন নম্বর (যেভাবে দেখাবে)">
            <Input value={v.phone} onChange={(e) => s.patch({ phone: e.target.value })} placeholder="01607-365565" />
          </Field>
          <Field label="WhatsApp নম্বর" hint="যেমন: 8801607365565 বা 01607365565">
            <Input value={v.whatsapp} onChange={(e) => s.patch({ whatsapp: e.target.value })} />
          </Field>
          <Field label="ঠিকানা" className="sm:col-span-2">
            <Input value={v.address} onChange={(e) => s.patch({ address: e.target.value })} />
          </Field>
          <Field label="অর্ডার আইডির প্রিফিক্স" hint="যেমন GP → GP-261113-AB12C">
            <Input value={v.order_prefix} maxLength={6} onChange={(e) => s.patch({ order_prefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} />
          </Field>
          <Field label="লোগো ইমোজি (ছবি না থাকলে)">
            <Input value={v.logo_emoji} maxLength={4} onChange={(e) => s.patch({ logo_emoji: e.target.value })} />
          </Field>
        </div>
        <ImageInput label="লোগো ছবি (ঐচ্ছিক)" value={v.logo_url} onChange={(url) => s.patch({ logo_url: url })} folder="logo" />
      </Card>

      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-bold">ওয়েবসাইটের রং</p>
          <Button size="sm" variant="secondary" onClick={() => s.patch({ colors: DEFAULT_STORE.colors })}>
            ডিফল্টে ফিরুন
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COLOR_FIELDS.map((c) => (
            <Field key={c.key} label={c.label}>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors[c.key]}
                  onChange={(e) => s.patch({ colors: { ...colors, [c.key]: e.target.value } })}
                  className="w-11 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                />
                <Input
                  value={colors[c.key]}
                  onChange={(e) => s.patch({ colors: { ...colors, [c.key]: e.target.value } })}
                  pattern="#[0-9a-fA-F]{6}"
                />
              </div>
            </Field>
          ))}
        </div>
        <div className="rounded-xl p-4 flex items-center gap-3 flex-wrap" style={{ background: colors.background }}>
          <span className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: colors.accent }}>
            অর্ডার করুন
          </span>
          <span className="px-4 py-2 rounded-xl text-white text-sm font-bold" style={{ background: colors.primary }}>
            ফর্ম হেডার
          </span>
          <span className="text-2xl font-black" style={{ color: colors.secondary }}>
            ৳১২০০
          </span>
        </div>
      </Card>

      <Button loading={s.saving} onClick={() => s.save({ ...v, colors })}>
        সেভ করুন
      </Button>
    </div>
  );
}
