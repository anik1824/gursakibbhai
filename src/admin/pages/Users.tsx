import React, { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { errorMessage, toBn } from '../../lib/format';
import { AdminUser } from '../../types';
import { useAdmin } from '../context';
import { ALL_NAV, NAV_GROUPS } from '../nav';
import { Button, Card, Field, Input, Modal, PageTitle, Select, Spinner, useToast } from '../ui';

const ROLE_LABEL: Record<AdminUser['role'], string> = { owner: 'মালিক', admin: 'অ্যাডমিন', staff: 'স্টাফ' };

export default function UsersPage() {
  const { me } = useAdmin();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<{ row: Partial<AdminUser>; isNew: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data, error } = await supabase!.from('admin_users').select('*').order('created_at');
    if (error) toast('error', errorMessage(error));
    setUsers((data || []) as AdminUser[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const r = edit.row;
    const payload = {
      email: r.email!.trim().toLowerCase(),
      name: r.name?.trim() || null,
      role: r.role,
      permissions: r.role === 'staff' ? r.permissions || [] : [],
    };
    setSaving(true);
    const res = edit.isNew
      ? await supabase!.from('admin_users').insert(payload)
      : await supabase!.from('admin_users').update(payload).eq('id', r.id!);
    setSaving(false);
    if (res.error) return toast('error', res.error.code === '23505' ? 'এই ইমেইল আগে থেকেই যোগ করা আছে' : errorMessage(res.error));
    toast('success', 'সেভ হয়েছে ✓');
    setEdit(null);
    load();
  };

  const remove = async (u: AdminUser) => {
    if (!window.confirm(`${u.email} এর অ্যাক্সেস সরিয়ে দেবেন?`)) return;
    const { error } = await supabase!.from('admin_users').delete().eq('id', u.id);
    if (error) return toast('error', errorMessage(error));
    setUsers((l) => l.filter((x) => x.id !== u.id));
  };

  const togglePerm = (key: string) =>
    setEdit((e) => {
      if (!e) return e;
      const p = new Set(e.row.permissions || []);
      p.has(key) ? p.delete(key) : p.add(key);
      return { ...e, row: { ...e.row, permissions: [...p] } };
    });

  const canEdit = (u: AdminUser) => u.id !== me.id && (u.role !== 'owner' || me.role === 'owner');

  return (
    <div className="max-w-4xl">
      <PageTitle
        title="ইউজার ও অনুমতি"
        subtitle="টিমের সদস্যদের ইমেইল যোগ করুন — তারা ওই ইমেইল দিয়ে অ্যাকাউন্ট খুলে লগইন করলেই প্যানেলে ঢুকতে পারবেন"
        right={<Button onClick={() => setEdit({ row: { email: '', name: '', role: 'staff', permissions: ['dashboard', 'orders', 'new_order', 'incomplete'] }, isNew: true })}>+ নতুন ইউজার</Button>}
      />
      <Card>
        {loading ? (
          <Spinner />
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#0B6B47] grid place-items-center font-bold shrink-0">
                    {(u.name || u.email).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {u.name || u.email} {u.id === me.id && <span className="text-xs text-gray-400">(আপনি)</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {u.email} • {ROLE_LABEL[u.role]}
                      {u.role === 'staff' && ` • ${toBn(u.permissions.length)}টি পেজের অনুমতি`}
                    </p>
                  </div>
                </div>
                {canEdit(u) && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEdit({ row: { ...u }, isNew: false })} aria-label="এডিট">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(u)} aria-label="মুছুন">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        wide
        title={edit?.isNew ? 'নতুন ইউজার' : 'ইউজার এডিট'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEdit(null)}>
              বাতিল
            </Button>
            <Button type="submit" form="user-form" loading={saving}>
              সেভ করুন
            </Button>
          </>
        }
      >
        {edit && (
          <form id="user-form" onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="ইমেইল *">
                <Input type="email" required value={edit.row.email} onChange={(e) => setEdit({ ...edit, row: { ...edit.row, email: e.target.value } })} />
              </Field>
              <Field label="নাম">
                <Input value={edit.row.name || ''} onChange={(e) => setEdit({ ...edit, row: { ...edit.row, name: e.target.value } })} />
              </Field>
              <Field label="রোল">
                <Select value={edit.row.role} onChange={(e) => setEdit({ ...edit, row: { ...edit.row, role: e.target.value as AdminUser['role'] } })}>
                  <option value="staff">স্টাফ (নির্দিষ্ট পেজ)</option>
                  <option value="admin">অ্যাডমিন (সব পেজ)</option>
                  {me.role === 'owner' && <option value="owner">মালিক</option>}
                </Select>
              </Field>
            </div>
            {edit.row.role === 'staff' ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold">কোন কোন পেজ দেখতে ও পরিবর্তন করতে পারবে</p>
                {NAV_GROUPS.map((g) => (
                  <div key={g.label}>
                    <p className="text-[11px] font-semibold text-gray-400 mb-1">{g.label}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {g.items.map((it) => (
                        <label key={it.key} className="flex items-center gap-2 text-sm p-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-[#0B6B47]"
                            checked={(edit.row.permissions || []).includes(it.key)}
                            onChange={() => togglePerm(it.key)}
                          />
                          {it.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEdit({ ...edit, row: { ...edit.row, permissions: ALL_NAV.map((n) => n.key) } })}>
                    সব সিলেক্ট
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => setEdit({ ...edit, row: { ...edit.row, permissions: [] } })}>
                    সব বাদ
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">{edit.row.role === 'owner' ? 'মালিক' : 'অ্যাডমিন'} সব পেজ দেখতে ও পরিবর্তন করতে পারবেন।</p>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
}
