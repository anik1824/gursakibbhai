/// <reference types="node" />
// Vercel Serverless Function: অ্যাডমিন প্যানেল থেকে Steadfast কুরিয়ারে অর্ডার পাঠানো
import { createClient } from '@supabase/supabase-js';

const BASE = 'https://portal.packzy.com/api/v1';
const DEFAULT_SUPABASE_URL = 'https://aflbrgilchpmwshbmsvv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbGJyZ2lsY2hwbXdzaGJtc3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1ODUzMDYsImV4cCI6MjExMDE2MTMwNn0.s62plXYWlhzOKb6Qh-SOXBh2D_ec-c1vAqYqftBig7g';

type Req = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown };
type Res = { status: (c: number) => Res; json: (b: unknown) => void };

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total: number;
  note: string | null;
  status: string;
  courier: Record<string, unknown> | null;
}

const STATUS_MAP: Record<string, string> = {
  delivered: 'delivered',
  partial_delivered: 'delivered',
  delivered_approval_pending: 'delivered',
  partial_delivered_approval_pending: 'delivered',
  cancelled: 'cancelled',
  cancelled_approval_pending: 'cancelled',
};

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const url = process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const auth = String(req.headers.authorization || '');
  if (!auth.startsWith('Bearer ') || auth.length < 20) return res.status(401).json({ error: 'লগইন করুন' });

  const sb = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
  const creds = await sb.rpc('get_courier_credentials');
  if (creds.error) return res.status(403).json({ error: creds.error.message });
  const { api_key, secret_key } = (creds.data || {}) as { api_key?: string; secret_key?: string };
  if (!api_key || !secret_key) return res.status(400).json({ error: 'প্রথমে "কুরিয়ার (Steadfast)" পেজে API Key ও Secret Key সেভ করুন' });

  const sf = async (path: string, init?: { method?: string; body?: unknown }) => {
    const r = await fetch(`${BASE}${path}`, {
      method: init?.method || 'GET',
      headers: { 'Api-Key': api_key, 'Secret-Key': secret_key, 'Content-Type': 'application/json' },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
    const data = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    if (!r.ok || (data.status && Number(data.status) !== 200)) {
      const errs = data.errors ? Object.values(data.errors as Record<string, string[]>).flat().join(', ') : '';
      throw new Error(errs || String(data.message || `Steadfast error ${r.status}`));
    }
    return data;
  };

  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}) as {
    action?: string;
    order_ids?: string[];
    order_id?: string;
  };

  try {
    if (body.action === 'balance') {
      const data = await sf('/get_balance');
      return res.status(200).json({ current_balance: data.current_balance });
    }

    if (body.action === 'create') {
      const ids = (body.order_ids || []).slice(0, 100);
      const { data: orders, error } = await sb.from('orders').select('*').in('id', ids);
      if (error) return res.status(403).json({ error: error.message });
      const results = [];
      for (const o of (orders || []) as OrderRow[]) {
        if (o.courier && (o.courier as { consignment_id?: unknown }).consignment_id) {
          results.push({ id: o.id, ok: false, error: `#${o.order_number} আগেই পাঠানো হয়েছে` });
          continue;
        }
        try {
          const data = await sf('/create_order', {
            method: 'POST',
            body: {
              invoice: o.order_number,
              recipient_name: o.customer_name.slice(0, 100),
              recipient_phone: o.customer_phone,
              recipient_address: o.customer_address.slice(0, 250),
              cod_amount: Number(o.total),
              note: o.note || '',
            },
          });
          const c = data.consignment as { consignment_id: number; tracking_code: string; status: string };
          const upd = await sb
            .from('orders')
            .update({
              courier: { provider: 'steadfast', consignment_id: c.consignment_id, tracking_code: c.tracking_code, status: c.status, sent_at: new Date().toISOString() },
              status: o.status === 'pending' || o.status === 'confirmed' ? 'shipped' : o.status,
              updated_at: new Date().toISOString(),
            })
            .eq('id', o.id)
            .select()
            .single();
          if (upd.error) throw new Error(upd.error.message);
          results.push({ id: o.id, ok: true, order: upd.data });
        } catch (e) {
          results.push({ id: o.id, ok: false, error: `#${o.order_number}: ${(e as Error).message}` });
        }
      }
      return res.status(200).json({ results });
    }

    if (body.action === 'status' && body.order_id) {
      const { data: o, error } = await sb.from('orders').select('*').eq('id', body.order_id).single();
      if (error || !o) return res.status(404).json({ error: 'অর্ডার পাওয়া যায়নি' });
      const order = o as OrderRow;
      const cid = (order.courier as { consignment_id?: number } | null)?.consignment_id;
      if (!cid) return res.status(400).json({ error: 'এই অর্ডার এখনো কুরিয়ারে পাঠানো হয়নি' });
      const data = await sf(`/status_by_cid/${encodeURIComponent(String(cid))}`);
      const ds = String(data.delivery_status || '');
      const upd = await sb
        .from('orders')
        .update({
          courier: { ...order.courier, status: ds },
          status: STATUS_MAP[ds] || order.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
        .select()
        .single();
      if (upd.error) return res.status(403).json({ error: upd.error.message });
      return res.status(200).json({ order: upd.data });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    return res.status(502).json({ error: (e as Error).message });
  }
}
