import React from 'react';
import { DEFAULT_DELIVERY } from '../../data/gurData';
import { DeliverySettings } from '../../types';
import { useSetting } from '../useSetting';
import { Button, Card, Field, Input, PageTitle, Spinner } from '../ui';

export default function Delivery() {
  const s = useSetting<DeliverySettings>('delivery', DEFAULT_DELIVERY);
  if (s.loading) return <Spinner />;
  const num = (k: keyof DeliverySettings) => (e: React.ChangeEvent<HTMLInputElement>) => s.patch({ [k]: Math.max(0, Number(e.target.value) || 0) });

  return (
    <div className="max-w-2xl space-y-4">
      <PageTitle title="ডেলিভারি চার্জ" subtitle="অর্ডার ফর্মে ও সার্ভারে এই চার্জ অনুযায়ী মোট টাকা হিসাব হয়" />
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="ঢাকার ভেতরে (৳)">
            <Input type="number" min={0} value={s.value.inside_dhaka} onChange={num('inside_dhaka')} />
          </Field>
          <Field label="ঢাকার বাইরে (৳)">
            <Input type="number" min={0} value={s.value.outside_dhaka} onChange={num('outside_dhaka')} />
          </Field>
        </div>
        <p className="text-sm font-semibold pt-2">ফ্রি ডেলিভারি</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="সর্বনিম্ন ওজন (কেজি)" hint="এই ওজন বা বেশি হলে ফ্রি • ০ = বন্ধ">
            <Input type="number" step="0.5" min={0} value={s.value.free_min_kg} onChange={num('free_min_kg')} />
          </Field>
          <Field label="সর্বনিম্ন অর্ডার মূল্য (৳)" hint="এই টাকা বা বেশি হলে ফ্রি • ০ = বন্ধ">
            <Input type="number" min={0} value={s.value.free_min_amount} onChange={num('free_min_amount')} />
          </Field>
        </div>
        <p className="text-xs text-gray-500">"ফ্রি ডেলিভারি" চালু করা কম্বো প্যাক অর্ডারে থাকলে সবসময় ডেলিভারি ফ্রি হবে।</p>
        <Button loading={s.saving} onClick={() => s.save()}>
          সেভ করুন
        </Button>
      </Card>
    </div>
  );
}
