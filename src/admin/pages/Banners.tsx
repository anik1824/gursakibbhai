import React, { useState } from 'react';
import { Banner } from '../../types';
import { useTable } from '../useTable';
import { RowActions } from '../RowActions';
import { Button, Card, Empty, Field, ImageInput, Input, Modal, PageTitle, Spinner, Toggle, useToast } from '../ui';

export default function Banners() {
  const t = useTable<Banner>('banners');
  const toast = useToast();
  const [edit, setEdit] = useState<{ row: Partial<Banner>; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (p: Partial<Banner>) => setEdit((e) => e && { ...e, row: { ...e.row, ...p } });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    if (!edit.row.image_url) return toast('error', 'একটি ছবি দিন');
    setSaving(true);
    const ok = await t.save({ ...edit.row, title: edit.row.title || null, subtitle: edit.row.subtitle || null }, edit.isNew);
    setSaving(false);
    if (ok) setEdit(null);
  };

  return (
    <div className="max-w-4xl">
      <PageTitle
        title="ব্যানার / স্লাইডার"
        subtitle="হিরো সেকশনের ছবি — একাধিক ব্যানার থাকলে অটো স্লাইড হবে"
        right={<Button onClick={() => setEdit({ row: { image_url: '', title: '', subtitle: '', active: true }, isNew: true })}>+ নতুন ব্যানার</Button>}
      />
      <Card>
        {t.loading ? (
          <Spinner />
        ) : t.rows.length === 0 ? (
          <Empty text="কোনো ব্যানার নেই — সাইটে ডিফল্ট ছবি দেখানো হবে" />
        ) : (
          <div className="divide-y divide-gray-100">
            {t.rows.map((b) => (
              <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={b.image_url} alt="" className="w-28 h-16 rounded-xl object-cover bg-gray-100 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {b.title || 'শিরোনাম নেই'} {!b.active && <span className="text-xs text-red-500">(বন্ধ)</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{b.subtitle}</p>
                  </div>
                </div>
                <RowActions
                  active={b.active}
                  onToggle={(v) => t.patch(b.id, { active: v })}
                  onUp={() => t.move(b.id, -1)}
                  onDown={() => t.move(b.id, 1)}
                  onEdit={() => setEdit({ row: { ...b, title: b.title || '', subtitle: b.subtitle || '' }, isNew: false })}
                  onDelete={() => t.remove(b.id, b.title || 'ব্যানার')}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.isNew ? 'নতুন ব্যানার' : 'ব্যানার এডিট'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEdit(null)}>
              বাতিল
            </Button>
            <Button type="submit" form="banner-form" loading={saving}>
              সেভ করুন
            </Button>
          </>
        }
      >
        {edit && (
          <form id="banner-form" onSubmit={submit} className="space-y-3">
            <ImageInput value={edit.row.image_url || ''} onChange={(url) => set({ image_url: url })} folder="banners" label="ব্যানার ছবি *" />
            <Field label="ছোট ট্যাগ লেখা">
              <Input value={edit.row.title || ''} onChange={(e) => set({ title: e.target.value })} placeholder="যশোরের বিখ্যাত পাটালি ও ঝোলা" />
            </Field>
            <Field label="নিচের লেখা">
              <Input value={edit.row.subtitle || ''} onChange={(e) => set({ subtitle: e.target.value })} placeholder="১০০% খাঁটি ও নির্ভেজাল খেজুরের গুড়" />
            </Field>
            <Toggle checked={!!edit.row.active} onChange={(v) => set({ active: v })} label="চালু" />
          </form>
        )}
      </Modal>
    </div>
  );
}
