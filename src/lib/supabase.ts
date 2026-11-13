import { createClient, SupabaseClient } from '@supabase/supabase-js';

// anon key পাবলিক — ব্রাউজারে পাঠানোর জন্যই তৈরি; ডেটার সুরক্ষা RLS নিয়ম দিয়ে হয়
export const DEFAULT_SUPABASE_URL = 'https://aflbrgilchpmwshbmsvv.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGJyZ2lsY2hwbXdzaGJtc3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1ODUzMDYsImV4cCI6MjExMDE2MTMwNn0.s62plXYWlhzOKb6Qh-SOXBh2D_ec-c1vAqYqftBig7g';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL;
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = !!supabase;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase কনফিগার করা নেই। .env ফাইলে VITE_SUPABASE_URL ও VITE_SUPABASE_ANON_KEY দিন।');
  }
  return supabase;
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const sb = requireSupabase();
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await sb.storage.from('media').upload(path, file, { cacheControl: '31536000', upsert: false });
  if (error) throw error;
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}
