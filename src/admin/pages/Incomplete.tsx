import React, { useEffect, useState } from 'react';
import { MessageCircle, Phone, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { bnMoney, errorMessage, toBn, whatsappLink } from '../../lib/format';
import { IncompleteOrder } from '../../types';
import { useAdmin } from '../context';
import { Button, Card, Empty, PageTitle, Spinner, useToast } from '../ui';

export default function Incomplete() {
  const { go, can } = useAdmin();
  const toast = useToast();
  const [list, setList] = useState<IncompleteOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase!
      .from('incomplete_orders')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) toast('error', errorMessage(error));
        setList((data || []) as IncompleteOrder[]);
        setLoading(false);
      });
  }, [toast]);

  const remove = async (ids: string[]) => {
    if (!window.confirm(ids.length > 1 ? 'সব অসম্পূর্ণ অর্ডার মুছে ফেলবেন?' : 'এটি মুছে ফেলবেন?')) return;
    const { error } = await supabase!.from('incomplete_orders').delete().in('id', ids);
    if (error) return toast('error', errorMessage(error));
    setList((l) => l.filter((x) => !ids.includes(x.id)));
  };

  return (
    <div>
      <PageTitle
        title="অসম্পূর্ণ অর্ডার"
        subtitle="যারা ফর্মে নাম/নম্বর দিয়েছেন কিন্তু অর্ডার সম্পন্ন করেননি — কল করে অর্ডার কনফার্ম করুন"
        right={
          list.length > 0 && (
            <Button variant="secondary" onClick={() => remove(list.map((l) => l.id))}>
              <Trash2 className="w-4 h-4" /> সব মুছুন
            </Button>
          )
        }
      />
      <Card>
        {loading ? (
          <Spinner />
        ) : list.length === 0 ? (
          <Empty text="এখন কোনো অসম্পূর্ণ অর্ডার নেই ✅" />
        ) : (
          <div className="divide-y divide-gray-100">
            {list.map((i) => (
              <div key={i.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">
                    {i.customer_name || 'নাম দেয়নি'} <span className="text-gray-500 font-normal">• {i.customer_phone}</span>
                  </p>
                  {i.customer_address && <p className="text-xs text-gray-500 truncate">{i.customer_address}</p>}
                  <p className="text-xs text-gray-600 mt-1">
                    {i.items.length ? i.items.map((it) => `${it.name} ×${toBn(it.quantity)}`).join(', ') : 'কোনো পণ্য সিলেক্ট নেই'}
                    {Number(i.total) > 0 && <b> • ৳{bnMoney(i.total)}</b>}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{new Date(i.updated_at).toLocaleString('bn-BD')}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <a href={`tel:${i.customer_phone}`} className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 text-[#0B6B47]">
                    <Phone className="w-3.5 h-3.5" /> কল
                  </a>
                  <a
                    href={whatsappLink(i.customer_phone || '', `আসসালামু আলাইকুম${i.customer_name ? ` ${i.customer_name}` : ''}, আপনি আমাদের সাইটে অর্ডার শুরু করেছিলেন। অর্ডারটি কনফার্ম করতে সাহায্য করতে পারি?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl bg-green-50 text-green-700"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  {can('new_order') && (
                    <Button size="sm" onClick={() => go('new_order', { incomplete: i.id })}>
                      অর্ডারে রূপান্তর
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remove([i.id])} aria-label="মুছুন">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
