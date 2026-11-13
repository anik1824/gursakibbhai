import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toBn } from '../../lib/format';
import { Category } from '../../types';
import { useTable } from '../useTable';
import { RowActions } from '../RowActions';
import { Button, Card, Empty, Field, Input, Modal, PageTitle, Spinner, Toggle } from '../ui';

export default function Categories() {
  const t = useTable<Category>('categories');
  const [edit, setEdit] = useState<{ row: Partial<Category>; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase!
      .from('products')
      .select('category_id')
      .then(({ data }) => {
        const m: Record<string, number> = {};
        data?.forEach((p) => p.category_id && (m[p.category_id] = (m[p.category_id] || 0) + 1));
        setCounts(m);
      });
  }, [t.rows.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    setSaving(true);
    const ok = await t.save({ ...edit.row, name: edit.row.name?.trim() }, edit.isNew);
    setSaving(false);
    if (ok) setEdit(null);
  };

  return (
    <div className="max-w-3xl">
      <PageTitle
        title="ক্যাটাগরি"
        subtitle="অর্ডার ফর্মে পণ্যগুলো ক্যাটাগরি অনুযায়ী ভাগ করে দেখানো হয়"
        right={<Button onClick={() => setEdit({ row: { name: '', active: true }, isNew: true })}>+ নতুন ক্যাটাগরি</Button>}
      />
      <Card>
        {t.loading ? (
          <Spinner />
        ) : t.rows.length === 0 ? (
          <Empty text="কোনো ক্যাটাগরি নেই" />
        ) : (
          <div className="divide-y divide-gray-100">
            {t.rows.map((c) => (
              <div key={c.id} className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">
                    {c.name} {!c.active && <span className="text-xs text-red-500">(বন্ধ)</span>}
                  </p>
                  <p className="text-xs text-gray-500">{toBn(counts[c.id] || 0)}টি পণ্য</p>
                </div>
                <RowActions
                  active={c.active}
                  onToggle={(v) => t.patch(c.id, { active: v })}
                  onUp={() => t.move(c.id, -1)}
                  onDown={() => t.move(c.id, 1)}
                  onEdit={() => setEdit({ row: { ...c }, isNew: false })}
                  onDelete={() => t.remove(c.id, c.name)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.isNew ? 'নতুন ক্যাটাগরি' : 'ক্যাটাগরি এডিট'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEdit(null)}>
              বাতিল
            </Button>
            <Button type="submit" form="cat-form" loading={saving}>
              সেভ করুন
            </Button>
          </>
        }
      >
        {edit && (
          <form id="cat-form" onSubmit={submit} className="space-y-3">
            <Field label="ক্যাটাগরির নাম *">
              <Input required autoFocus value={edit.row.name} onChange={(e) => setEdit({ ...edit, row: { ...edit.row, name: e.target.value } })} />
            </Field>
            <Toggle checked={!!edit.row.active} onChange={(v) => setEdit({ ...edit, row: { ...edit.row, active: v } })} label="চালু" />
          </form>
        )}
      </Modal>
    </div>
  );
}
