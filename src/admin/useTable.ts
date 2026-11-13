import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { errorMessage } from '../lib/format';
import { useToast } from './ui';

type Row = { id: string; sort?: number };

export function useTable<T extends Row>(table: string, orderBy = 'sort') {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const reload = useCallback(async () => {
    const { data, error } = await supabase!.from(table).select('*').order(orderBy, { ascending: orderBy === 'sort' });
    if (error) toast('error', errorMessage(error));
    setRows((data || []) as T[]);
    setLoading(false);
  }, [table, orderBy, toast]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = async (row: Partial<T>, isNew: boolean) => {
    const { id, ...rest } = row as Partial<T> & { id?: string };
    const nextSort = orderBy === 'sort' ? { sort: rest.sort ?? rows.reduce((m, r) => Math.max(m, r.sort ?? 0), 0) + 1 } : {};
    const payload = (isNew ? { ...rest, ...(id ? { id } : {}), ...nextSort } : rest) as Record<string, unknown>;
    const res = isNew
      ? await supabase!.from(table).insert(payload).select().single()
      : await supabase!.from(table).update(payload).eq('id', id!).select().single();
    if (res.error) {
      toast('error', res.error.code === '23505' ? 'এই আইডি আগে থেকেই আছে' : errorMessage(res.error));
      return false;
    }
    toast('success', 'সেভ হয়েছে ✓');
    await reload();
    return true;
  };

  const remove = async (id: string, label: string) => {
    if (!window.confirm(`"${label}" মুছে ফেলবেন?`)) return;
    const { error } = await supabase!.from(table).delete().eq('id', id);
    if (error) return toast('error', errorMessage(error));
    toast('success', 'মুছে ফেলা হয়েছে');
    setRows((r) => r.filter((x) => x.id !== id));
  };

  const patch = async (id: string, p: Partial<T>) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...p } : x)));
    const { error } = await supabase!.from(table).update(p as Record<string, unknown>).eq('id', id);
    if (error) {
      toast('error', errorMessage(error));
      reload();
    }
  };

  const move = async (id: string, dir: -1 | 1) => {
    const i = rows.findIndex((r) => r.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    const withSort = next.map((r, k) => ({ ...r, sort: k + 1 }));
    setRows(withSort);
    await Promise.all(
      [withSort[i], withSort[j]].map((r) => supabase!.from(table).update({ sort: r.sort }).eq('id', r.id))
    );
  };

  return { rows, loading, reload, save, remove, patch, move };
}
