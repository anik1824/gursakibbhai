import { useEffect, useState } from 'react';
import { proxify, supabase } from '../lib/supabase';
import { errorMessage } from '../lib/format';
import { useToast } from './ui';

export function useSetting<T extends object>(key: string, defaults: T, table: 'settings' | 'private_settings' = 'settings') {
  const [value, setValue] = useState<T>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    supabase!
      .from(table)
      .select('value')
      .eq('key', key)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast('error', errorMessage(error));
        if (data?.value) setValue(proxify({ ...defaults, ...(data.value as T) }));
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, table]);

  const save = async (next: T = value) => {
    setSaving(true);
    const { error } = await supabase!.from(table).upsert({ key, value: next, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast('error', errorMessage(error));
    else toast('success', 'সেভ হয়েছে ✓');
    return !error;
  };

  const patch = (p: Partial<T>) => setValue((v) => ({ ...v, ...p }));

  return { value, setValue, patch, save, loading, saving };
}
