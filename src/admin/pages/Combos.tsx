import React, { useState } from 'react';
import { bnMoney } from '../../lib/format';
import { GurPackage } from '../../types';
import { useTable } from '../useTable';
import { RowActions } from '../RowActions';
import { Button, Card, Empty, Field, ImageInput, Input, ListEditor, Modal, PageTitle, Spinner, Textarea, Toggle } from '../ui';

const blank: Partial<GurPackage> = {
  id: '',
  name: '',
  subtitle: '',
  weight_label: '',
  weight_kg: 2,
  original_price: 0,
  discount_price: 0,
  is_popular: false,
  is_free_delivery: false,
  features: [],
  image_url: '',
  badge: '',
  active: true,
};

export default function Combos() {
  const t = useTable<GurPackage>('packages');
  const [edit, setEdit] = useState<{ row: Partial<GurPackage>; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (p: Partial<GurPackage>) => setEdit((e) => e && { ...e, row: { ...e.row, ...p } });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const r = edit.row;
    setSaving(true);
    const ok = await t.save(
      {
        ...r,
        id: edit.isNew ? r.id?.trim() || undefined : r.id,
        original_price: Number(r.original_price) || 0,
        discount_price: Number(r.discount_price) || 0,
        weight_kg: Number(r.weight_kg) || 0,
        features: (r.features || []).map((f) => f.trim()).filter(Boolean),
        badge: r.badge?.trim() || null,
      },
      edit.isNew
    );
    setSaving(false);
    if (ok) setEdit(null);
  };

  return (
    <div>
      <PageTitle
        title="প্রিমিয়াম কম্বো প্যাক"
        subtitle="ল্যান্ডিং পেজের প্যাকেজ কার্ডগুলো — অর্ডার ফর্মেও এগুলো বেছে নেওয়া যায়"
        right={<Button onClick={() => setEdit({ row: { ...blank, features: [] }, isNew: true })}>+ নতুন কম্বো</Button>}
      />
      <Card>
        {t.loading ? (
          <Spinner />
        ) : t.rows.length === 0 ? (
          <Empty text="কোনো কম্বো প্যাক নেই" />
        ) : (
          <div className="divide-y divide-gray-100">
            {t.rows.map((p) => (
              <div key={p.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={p.image_url || undefined} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-100 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {p.name} {!p.active && <span className="text-xs text-red-500">(বন্ধ)</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      ৳{bnMoney(p.discount_price)} {p.original_price > p.discount_price && <s>৳{bnMoney(p.original_price)}</s>} • {p.weight_label}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {p.is_popular && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">জনপ্রিয়</span>}
                      {p.is_free_delivery && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">ফ্রি ডেলিভারি</span>}
                      {p.badge && <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">{p.badge}</span>}
                    </div>
                  </div>
                </div>
                <RowActions
                  active={p.active}
                  onToggle={(v) => t.patch(p.id, { active: v })}
                  onUp={() => t.move(p.id, -1)}
                  onDown={() => t.move(p.id, 1)}
                  onEdit={() => setEdit({ row: { ...p, badge: p.badge || '' }, isNew: false })}
                  onDelete={() => t.remove(p.id, p.name)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        wide
        title={edit?.isNew ? 'নতুন কম্বো প্যাক' : 'কম্বো এডিট'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEdit(null)}>
              বাতিল
            </Button>
            <Button type="submit" form="combo-form" loading={saving}>
              সেভ করুন
            </Button>
          </>
        }
      >
        {edit && (
          <form id="combo-form" onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="প্যাকের নাম *" className="sm:col-span-2">
                <Input required value={edit.row.name} onChange={(e) => set({ name: e.target.value })} />
              </Field>
              <Field label="সাব-টাইটেল" className="sm:col-span-2">
                <Textarea rows={2} value={edit.row.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
              </Field>
              {edit.isNew && (
                <Field label="আইডি (ঐচ্ছিক, ইংরেজিতে)" hint="খালি রাখলে স্বয়ংক্রিয়ভাবে তৈরি হবে">
                  <Input value={edit.row.id} pattern="[a-z0-9\-]*" onChange={(e) => set({ id: e.target.value.toLowerCase() })} />
                </Field>
              )}
              <Field label="ব্যাজ লেখা" hint="যেমন: সবচেয়ে জনপ্রিয় ⭐">
                <Input value={edit.row.badge || ''} onChange={(e) => set({ badge: e.target.value })} />
              </Field>
              <Field label="অফার মূল্য (৳) *">
                <Input type="number" min={0} required value={edit.row.discount_price} onChange={(e) => set({ discount_price: e.target.value as unknown as number })} />
              </Field>
              <Field label="আগের দাম (৳)">
                <Input type="number" min={0} value={edit.row.original_price} onChange={(e) => set({ original_price: e.target.value as unknown as number })} />
              </Field>
              <Field label="ওজন (লেখা)">
                <Input value={edit.row.weight_label} onChange={(e) => set({ weight_label: e.target.value })} placeholder="২ কেজি (১+১)" />
              </Field>
              <Field label="ওজন (কেজি, সংখ্যায়)">
                <Input type="number" step="0.01" min={0} value={edit.row.weight_kg} onChange={(e) => set({ weight_kg: e.target.value as unknown as number })} />
              </Field>
            </div>
            <ImageInput value={edit.row.image_url || ''} onChange={(url) => set({ image_url: url })} folder="packages" />
            <div>
              <span className="block text-xs font-semibold text-gray-700 mb-1">ফিচার তালিকা</span>
              <ListEditor value={edit.row.features || []} onChange={(v) => set({ features: v })} placeholder="যেমন: সারা দেশে ফ্রি ডেলিভারি" />
            </div>
            <div className="flex flex-wrap gap-5 pt-1">
              <Toggle checked={!!edit.row.active} onChange={(v) => set({ active: v })} label="সাইটে দেখাবে" />
              <Toggle checked={!!edit.row.is_popular} onChange={(v) => set({ is_popular: v })} label="জনপ্রিয় (হাইলাইট)" />
              <Toggle checked={!!edit.row.is_free_delivery} onChange={(v) => set({ is_free_delivery: v })} label="ফ্রি ডেলিভারি" />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
