import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { bnMoney } from '../../lib/format';
import { Category, Product } from '../../types';
import { useTable } from '../useTable';
import { RowActions } from '../RowActions';
import { Button, Card, Empty, Field, ImageInput, Input, Modal, PageTitle, Select, Spinner, Toggle } from '../ui';

const blank: Partial<Product> = {
  id: '',
  name: '',
  weight_label: '১ কেজি',
  weight_kg: 1,
  price: 0,
  original_price: null,
  image_url: '',
  category_id: null,
  is_default_selected: false,
  active: true,
};

export default function Products() {
  const t = useTable<Product>('products');
  const [cats, setCats] = useState<Category[]>([]);
  const [edit, setEdit] = useState<{ row: Partial<Product>; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    supabase!
      .from('categories')
      .select('*')
      .order('sort')
      .then(({ data }) => setCats((data || []) as Category[]));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    setSaving(true);
    const r = edit.row;
    const ok = await t.save(
      {
        ...r,
        id: edit.isNew ? r.id?.trim() || undefined : r.id,
        name: r.name?.trim(),
        price: Number(r.price) || 0,
        original_price: r.original_price ? Number(r.original_price) : null,
        weight_kg: Number(r.weight_kg) || 0,
        category_id: r.category_id || null,
      },
      edit.isNew
    );
    setSaving(false);
    if (ok) setEdit(null);
  };

  const set = (p: Partial<Product>) => setEdit((e) => e && { ...e, row: { ...e.row, ...p } });
  const rows = filter ? t.rows.filter((r) => (filter === 'none' ? !r.category_id : r.category_id === filter)) : t.rows;

  return (
    <div>
      <PageTitle
        title="পণ্য"
        subtitle="অর্ডার ফর্মে যে পণ্যগুলো দেখানো হয়"
        right={
          <>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-auto">
              <option value="">সব ক্যাটাগরি</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="none">ক্যাটাগরি ছাড়া</option>
            </Select>
            <Button onClick={() => setEdit({ row: { ...blank }, isNew: true })}>+ নতুন পণ্য</Button>
          </>
        }
      />
      <Card>
        {t.loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <Empty text="কোনো পণ্য নেই" />
        ) : (
          <div className="divide-y divide-gray-100">
            {rows.map((p) => (
              <div key={p.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={p.image_url || undefined} alt="" className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {p.name} {!p.active && <span className="text-xs text-red-500">(বন্ধ)</span>}
                      {p.is_default_selected && <span className="ml-1 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">ডিফল্ট</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      ৳{bnMoney(p.price)}
                      {p.original_price ? <s className="ml-1">৳{bnMoney(p.original_price)}</s> : null} • {p.weight_label} •{' '}
                      {cats.find((c) => c.id === p.category_id)?.name || 'ক্যাটাগরি নেই'}
                    </p>
                  </div>
                </div>
                <RowActions
                  active={p.active}
                  onToggle={(v) => t.patch(p.id, { active: v })}
                  onUp={() => t.move(p.id, -1)}
                  onDown={() => t.move(p.id, 1)}
                  onEdit={() => setEdit({ row: { ...p }, isNew: false })}
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
        title={edit?.isNew ? 'নতুন পণ্য' : 'পণ্য এডিট'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEdit(null)}>
              বাতিল
            </Button>
            <Button type="submit" form="product-form" loading={saving}>
              সেভ করুন
            </Button>
          </>
        }
      >
        {edit && (
          <form id="product-form" onSubmit={submit} className="space-y-3">
            <Field label="পণ্যের নাম *">
              <Input required value={edit.row.name} onChange={(e) => set({ name: e.target.value })} placeholder="যেমন: ১ কেজি গোল পাটালি গুড়" />
            </Field>
            {edit.isNew && (
              <Field label="আইডি (ঐচ্ছিক, ইংরেজিতে)" hint="খালি রাখলে স্বয়ংক্রিয়ভাবে তৈরি হবে">
                <Input value={edit.row.id} pattern="[a-z0-9\-]*" onChange={(e) => set({ id: e.target.value.toLowerCase() })} placeholder="gol-patali-1kg" />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="বিক্রয় মূল্য (৳) *">
                <Input type="number" min={0} required value={edit.row.price} onChange={(e) => set({ price: e.target.value as unknown as number })} />
              </Field>
              <Field label="আগের দাম (৳)">
                <Input type="number" min={0} value={edit.row.original_price ?? ''} onChange={(e) => set({ original_price: (e.target.value || null) as unknown as number })} />
              </Field>
              <Field label="ওজন (লেখা)">
                <Input value={edit.row.weight_label} onChange={(e) => set({ weight_label: e.target.value })} placeholder="১ কেজি" />
              </Field>
              <Field label="ওজন (কেজি, সংখ্যায়)" hint="ফ্রি ডেলিভারি হিসাবে লাগে">
                <Input type="number" step="0.01" min={0} value={edit.row.weight_kg} onChange={(e) => set({ weight_kg: e.target.value as unknown as number })} />
              </Field>
              <Field label="ক্যাটাগরি">
                <Select value={edit.row.category_id || ''} onChange={(e) => set({ category_id: e.target.value || null })}>
                  <option value="">— নেই —</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <ImageInput value={edit.row.image_url || ''} onChange={(url) => set({ image_url: url })} folder="products" />
            <div className="flex flex-wrap gap-5 pt-1">
              <Toggle checked={!!edit.row.active} onChange={(v) => set({ active: v })} label="সাইটে দেখাবে" />
              <Toggle checked={!!edit.row.is_default_selected} onChange={(v) => set({ is_default_selected: v })} label="ফর্মে আগে থেকে সিলেক্টেড" />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
