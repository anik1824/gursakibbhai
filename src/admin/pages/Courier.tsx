import React, { useState } from 'react';
import { Eye, EyeOff, Wallet } from 'lucide-react';
import { bnMoney, errorMessage } from '../../lib/format';
import { courierRequest } from '../orderTools';
import { useSetting } from '../useSetting';
import { Button, Card, Field, Input, PageTitle, Spinner, useToast } from '../ui';

export default function Courier() {
  const s = useSetting('courier', { api_key: '', secret_key: '' }, 'private_settings');
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);

  const test = async () => {
    setTesting(true);
    try {
      const r = await courierRequest({ action: 'balance' });
      setBalance(Number(r.current_balance ?? 0));
      toast('success', 'Steadfast এর সাথে সংযোগ সফল ✓');
    } catch (e) {
      setBalance(null);
      toast('error', errorMessage(e));
    }
    setTesting(false);
  };

  if (s.loading) return <Spinner />;

  return (
    <div className="max-w-2xl space-y-4">
      <PageTitle title="কুরিয়ার (Steadfast)" subtitle="Steadfast Courier এর API Key দিলে অর্ডার পেজ থেকে এক ক্লিকে পার্সেল বুক করা যাবে" />
      <Card className="p-5 space-y-4">
        <Field label="API Key">
          <Input type={show ? 'text' : 'password'} value={s.value.api_key} onChange={(e) => s.patch({ api_key: e.target.value.trim() })} autoComplete="off" />
        </Field>
        <Field label="Secret Key">
          <Input type={show ? 'text' : 'password'} value={s.value.secret_key} onChange={(e) => s.patch({ secret_key: e.target.value.trim() })} autoComplete="off" />
        </Field>
        <button type="button" onClick={() => setShow(!show)} className="text-xs text-gray-600 flex items-center gap-1 cursor-pointer">
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {show ? 'লুকান' : 'দেখান'}
        </button>
        <div className="flex gap-2 flex-wrap">
          <Button loading={s.saving} onClick={() => s.save()}>
            সেভ করুন
          </Button>
          <Button variant="secondary" loading={testing} onClick={test}>
            <Wallet className="w-4 h-4" /> সংযোগ পরীক্ষা ও ব্যালেন্স
          </Button>
        </div>
        {balance !== null && (
          <p className="text-sm font-semibold text-[#0B6B47]">
            বর্তমান ব্যালেন্স: ৳{bnMoney(balance)}
          </p>
        )}
      </Card>
      <Card className="p-5 text-sm text-gray-600 space-y-2">
        <p className="font-semibold text-gray-900">কীভাবে API Key পাবেন</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>Steadfast মার্চেন্ট প্যানেলে লগইন করুন।</li>
          <li>Settings → API অপশন থেকে API Key ও Secret Key কপি করুন।</li>
          <li>এখানে বসিয়ে সেভ করুন, তারপর "সংযোগ পরীক্ষা" চাপুন।</li>
        </ol>
        <p className="text-xs">Key গুলো শুধু অ্যাডমিনরা দেখতে পারেন — ওয়েবসাইটের ভিজিটররা কখনো দেখতে পান না।</p>
      </Card>
    </div>
  );
}
