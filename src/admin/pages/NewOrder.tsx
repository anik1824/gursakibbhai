import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { errorMessage, normalizePhone } from '../../lib/format';
import { IncompleteOrder, Order } from '../../types';
import { useAdmin } from '../context';
import { useCatalog } from '../orderTools';
import { OrderDraft, OrderEditor, draftTotals, emptyDraft } from '../OrderEditor';
import { validateDraft } from './Orders';
import { Button, Card, PageTitle, Spinner, useToast } from '../ui';

export default function NewOrder() {
  const { query, go } = useAdmin();
  const catalog = useCatalog();
  const toast = useToast();
  const [draft, setDraft] = useState<OrderDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const incompleteId = query.get('incomplete');

  useEffect(() => {
    if (!incompleteId) return;
    supabase!
      .from('incomplete_orders')
      .select('*')
      .eq('id', incompleteId)
      .maybeSingle()
      .then(({ data }) => {
        const i = data as IncompleteOrder | null;
        if (!i) return;
        setDraft((d) => ({
          ...d,
          customer_name: i.customer_name || '',
          customer_phone: i.customer_phone || '',
          customer_address: i.customer_address || '',
          items: (i.items || []).map((it) => ({ ...it, kind: it.kind || 'product' })),
        }));
      });
  }, [incompleteId]);

  const save = async () => {
    const err = validateDraft(draft);
    if (err) return toast('error', err);
    const t = draftTotals(draft, catalog);
    setSaving(true);
    const { data, error } = await supabase!
      .from('orders')
      .insert({
        customer_name: draft.customer_name.trim(),
        customer_phone: normalizePhone(draft.customer_phone),
        customer_address: draft.customer_address.trim(),
        delivery_area: draft.delivery_area,
        items: draft.items,
        subtotal: t.subtotal,
        delivery_fee: t.fee,
        discount: t.discount,
        total: t.total,
        status: draft.status,
        source: 'call',
        note: draft.note || null,
        admin_note: draft.admin_note || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) return toast('error', errorMessage(error));
    if (incompleteId) await supabase!.from('incomplete_orders').delete().eq('id', incompleteId);
    toast('success', `অর্ডার #${(data as Order).order_number} তৈরি হয়েছে ✓`);
    go('orders', { id: (data as Order).id });
  };

  return (
    <div className="max-w-3xl">
      <PageTitle title="নতুন অর্ডার (কল)" subtitle="ফোনে পাওয়া অর্ডার এখানে বসান — সরাসরি অর্ডার তালিকায় যোগ হবে" />
      <Card className="p-5">
        {catalog.loading ? (
          <Spinner />
        ) : (
          <>
            <OrderEditor draft={draft} onChange={setDraft} catalog={catalog} />
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="secondary" onClick={() => setDraft(emptyDraft())}>
                রিসেট
              </Button>
              <Button loading={saving} onClick={save}>
                অর্ডার সেভ করুন
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
