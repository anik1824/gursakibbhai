import React from 'react';
import { useSetting } from '../useSetting';
import { Button, Card, Field, Input, PageTitle, Spinner, useToast } from '../ui';

export function PixelPage() {
  const s = useSetting('pixel', { pixel_id: '' });
  const toast = useToast();
  if (s.loading) return <Spinner />;
  const save = () => {
    const id = s.value.pixel_id.trim();
    if (id && !/^\d{5,20}$/.test(id)) return toast('error', 'Pixel ID শুধু সংখ্যা হবে (যেমন 1234567890123456)');
    s.save({ pixel_id: id });
  };
  return (
    <div className="max-w-2xl space-y-4">
      <PageTitle title="Facebook Pixel" subtitle="বিজ্ঞাপনের কনভার্শন ট্র্যাক করতে Meta Pixel যুক্ত করুন" />
      <Card className="p-5 space-y-3">
        <Field label="Pixel ID" hint="Meta Events Manager → Data Sources থেকে পাবেন। খালি রাখলে Pixel বন্ধ থাকবে।">
          <Input value={s.value.pixel_id} onChange={(e) => s.patch({ pixel_id: e.target.value })} placeholder="1234567890123456" inputMode="numeric" />
        </Field>
        <Button loading={s.saving} onClick={save}>
          সেভ করুন
        </Button>
      </Card>
      <Card className="p-5 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-900">যে ইভেন্টগুলো স্বয়ংক্রিয়ভাবে পাঠানো হয়</p>
        <p>• <b>PageView</b> — সাইট খুললে</p>
        <p>• <b>InitiateCheckout</b> — অর্ডার ফর্মে লেখা শুরু করলে</p>
        <p>• <b>Purchase</b> — অর্ডার সফল হলে (মোট টাকা, BDT ও পণ্যের আইডিসহ)</p>
      </Card>
    </div>
  );
}

export function GtmPage() {
  const s = useSetting('gtm', { container_id: '' });
  const toast = useToast();
  if (s.loading) return <Spinner />;
  const save = () => {
    const id = s.value.container_id.trim().toUpperCase();
    if (id && !/^GTM-[A-Z0-9]+$/.test(id)) return toast('error', 'Container ID এভাবে হবে: GTM-XXXXXXX');
    s.save({ container_id: id });
  };
  return (
    <div className="max-w-2xl space-y-4">
      <PageTitle title="Google Tag Manager" subtitle="Google Analytics, Ads সহ যেকোনো ট্যাগ GTM দিয়ে যুক্ত করুন" />
      <Card className="p-5 space-y-3">
        <Field label="Container ID" hint="খালি রাখলে GTM বন্ধ থাকবে">
          <Input value={s.value.container_id} onChange={(e) => s.patch({ container_id: e.target.value })} placeholder="GTM-XXXXXXX" />
        </Field>
        <Button loading={s.saving} onClick={save}>
          সেভ করুন
        </Button>
      </Card>
      <Card className="p-5 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-900">dataLayer ইভেন্ট</p>
        <p>• <b>begin_checkout</b> — অর্ডার ফর্মে লেখা শুরু করলে</p>
        <p>• <b>purchase</b> — অর্ডার সফল হলে (transaction_id, value, currency)</p>
      </Card>
    </div>
  );
}
