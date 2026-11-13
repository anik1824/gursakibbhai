import React, { useState } from 'react';
import { Check, EyeOff, Star } from 'lucide-react';
import { toBn } from '../../lib/format';
import { Review } from '../../types';
import { useTable } from '../useTable';
import { Button, Card, Empty, Field, Input, Modal, PageTitle, Select, Spinner, Textarea, Toggle, cx } from '../ui';
import { Pencil, Trash2 } from 'lucide-react';

export default function Reviews() {
  const t = useTable<Review & { sort?: number }>('reviews', 'created_at');
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');
  const [edit, setEdit] = useState<{ row: Partial<Review>; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const pending = t.rows.filter((r) => !r.approved);
  const list = tab === 'pending' ? pending : t.rows.filter((r) => r.approved);
  const set = (p: Partial<Review>) => setEdit((e) => e && { ...e, row: { ...e.row, ...p } });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    setSaving(true);
    const { row } = edit;
    const ok = await t.save(
      {
        id: row.id,
        name: row.name?.trim(),
        location: row.location || null,
        rating: Number(row.rating) || 5,
        comment: row.comment?.trim(),
        package_bought: row.package_bought || null,
        approved: !!row.approved,
        ...(edit.isNew ? { created_at: new Date().toISOString() } : {}),
      } as Partial<Review>,
      edit.isNew
    );
    setSaving(false);
    if (ok) setEdit(null);
  };

  return (
    <div className="max-w-4xl">
      <PageTitle
        title="কাস্টমার রিভিউ"
        subtitle="কাস্টমারদের জমা দেওয়া রিভিউ অনুমোদন দিলে সাইটে দেখাবে"
        right={<Button onClick={() => setEdit({ row: { name: '', location: '', rating: 5, comment: '', package_bought: '', approved: true }, isNew: true })}>+ রিভিউ যোগ করুন</Button>}
      />
      <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 mb-3 w-fit">
        {(
          [
            ['pending', `অনুমোদনের অপেক্ষায় (${toBn(pending.length)})`],
            ['approved', `প্রকাশিত (${toBn(t.rows.length - pending.length)})`],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cx('px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer', tab === k ? 'bg-[#0B6B47] text-white' : 'text-gray-600 hover:bg-gray-100')}
          >
            {l}
          </button>
        ))}
      </div>
      <Card>
        {t.loading ? (
          <Spinner />
        ) : list.length === 0 ? (
          <Empty text={tab === 'pending' ? 'নতুন কোনো রিভিউ নেই' : 'কোনো প্রকাশিত রিভিউ নেই'} />
        ) : (
          <div className="divide-y divide-gray-100">
            {list.map((r) => (
              <div key={r.id} className="p-4 flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{r.name}</p>
                    <span className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cx('w-3.5 h-3.5', i < r.rating ? 'fill-current' : 'text-gray-300')} />
                      ))}
                    </span>
                    <span className="text-[11px] text-gray-400">{new Date(r.created_at).toLocaleDateString('bn-BD')}</span>
                  </div>
                  <p className="text-xs text-gray-500">{[r.location, r.package_bought].filter(Boolean).join(' • ')}</p>
                  <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
                </div>
                <div className="flex items-start gap-1 shrink-0">
                  {r.approved ? (
                    <Button size="sm" variant="secondary" onClick={() => t.patch(r.id, { approved: false })}>
                      <EyeOff className="w-3.5 h-3.5" /> লুকান
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => t.patch(r.id, { approved: true })}>
                      <Check className="w-3.5 h-3.5" /> অনুমোদন
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setEdit({ row: { ...r }, isNew: false })} aria-label="এডিট">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => t.remove(r.id, r.name)} aria-label="মুছুন">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title={edit?.isNew ? 'নতুন রিভিউ' : 'রিভিউ এডিট'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEdit(null)}>
              বাতিল
            </Button>
            <Button type="submit" form="review-form" loading={saving}>
              সেভ করুন
            </Button>
          </>
        }
      >
        {edit && (
          <form id="review-form" onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="নাম *">
                <Input required value={edit.row.name} onChange={(e) => set({ name: e.target.value })} />
              </Field>
              <Field label="এলাকা">
                <Input value={edit.row.location || ''} onChange={(e) => set({ location: e.target.value })} />
              </Field>
              <Field label="রেটিং">
                <Select value={edit.row.rating} onChange={(e) => set({ rating: +e.target.value })}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {'⭐'.repeat(n)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="কোন প্যাকেজ কিনেছেন">
                <Input value={edit.row.package_bought || ''} onChange={(e) => set({ package_bought: e.target.value })} />
              </Field>
            </div>
            <Field label="রিভিউ *">
              <Textarea required rows={4} value={edit.row.comment} onChange={(e) => set({ comment: e.target.value })} />
            </Field>
            <Toggle checked={!!edit.row.approved} onChange={(v) => set({ approved: v })} label="সাইটে প্রকাশিত" />
          </form>
        )}
      </Modal>
    </div>
  );
}
