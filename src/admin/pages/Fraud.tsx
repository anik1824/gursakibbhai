import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FraudSettings } from '../../types';
import { isValidBdPhone, normalizePhone, toBn } from '../../lib/format';
import { useSetting } from '../useSetting';
import { Button, Card, Field, Input, PageTitle, Spinner, Textarea, Toggle, useToast } from '../ui';

const defaults: FraudSettings = { enabled: true, max_orders_per_day: 3, min_address_length: 8, blocked_phones: [], block_message: '' };

export default function Fraud() {
  const s = useSetting<FraudSettings>('fraud', defaults);
  const toast = useToast();
  const [phone, setPhone] = useState('');

  if (s.loading) return <Spinner />;
  const v = s.value;

  const addPhone = () => {
    if (!isValidBdPhone(phone)) return toast('error', 'সঠিক মোবাইল নম্বর দিন');
    const p = normalizePhone(phone);
    if (!v.blocked_phones.includes(p)) s.patch({ blocked_phones: [...v.blocked_phones, p] });
    setPhone('');
  };

  return (
    <div className="max-w-2xl space-y-4">
      <PageTitle title="ফেক অর্ডার প্রোটেকশন" subtitle="ভুয়া ও বারবার অর্ডার আটকানোর নিয়ম — সার্ভারে চেক হয়, তাই কেউ এড়িয়ে যেতে পারবে না" />
      <Card className="p-5 space-y-4">
        <Toggle checked={v.enabled} onChange={(x) => s.patch({ enabled: x })} label="প্রোটেকশন চালু" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="একই নম্বর থেকে ২৪ ঘণ্টায় সর্বোচ্চ অর্ডার" hint="০ দিলে কোনো সীমা থাকবে না">
            <Input type="number" min={0} value={v.max_orders_per_day} onChange={(e) => s.patch({ max_orders_per_day: Number(e.target.value) || 0 })} />
          </Field>
          <Field label="ঠিকানার সর্বনিম্ন দৈর্ঘ্য (অক্ষর)">
            <Input type="number" min={0} value={v.min_address_length} onChange={(e) => s.patch({ min_address_length: Number(e.target.value) || 0 })} />
          </Field>
        </div>
        <Field label="ব্লক করা নম্বরে যে মেসেজ দেখাবে" hint="খালি রাখলে ডিফল্ট মেসেজ দেখাবে">
          <Textarea rows={2} value={v.block_message} onChange={(e) => s.patch({ block_message: e.target.value })} placeholder="এই নম্বর থেকে অনলাইনে অর্ডার নেওয়া সম্ভব নয়। অনুগ্রহ করে কল করুন।" />
        </Field>
      </Card>

      <Card className="p-5 space-y-3">
        <p className="font-semibold">ব্লক করা নম্বর ({toBn(v.blocked_phones.length)})</p>
        <div className="flex gap-2">
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhone())}
            placeholder="01XXXXXXXXX"
          />
          <Button variant="secondary" onClick={addPhone}>
            যোগ করুন
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {v.blocked_phones.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full">
              {p}
              <button onClick={() => s.patch({ blocked_phones: v.blocked_phones.filter((x) => x !== p) })} className="cursor-pointer" aria-label="সরান">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {v.blocked_phones.length === 0 && <p className="text-xs text-gray-500">কোনো নম্বর ব্লক করা নেই</p>}
        </div>
      </Card>

      <Button loading={s.saving} onClick={() => s.save()}>
        সেভ করুন
      </Button>
    </div>
  );
}
