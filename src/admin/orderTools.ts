import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_DELIVERY, DEFAULT_STORE } from '../data/gurData';
import { DeliverySettings, GurPackage, Order, Product, StoreSettings } from '../types';
import { bnMoney, toBn } from '../lib/format';

export interface Catalog {
  products: Product[];
  packages: GurPackage[];
  delivery: DeliverySettings;
  store: StoreSettings;
  loading: boolean;
}

export function useCatalog(): Catalog {
  const [c, setC] = useState<Catalog>({ products: [], packages: [], delivery: DEFAULT_DELIVERY, store: DEFAULT_STORE, loading: true });
  useEffect(() => {
    Promise.all([
      supabase!.from('products').select('*').order('sort'),
      supabase!.from('packages').select('*').order('sort'),
      supabase!.from('settings').select('key,value').in('key', ['delivery', 'settings']),
    ]).then(([p, k, s]) => {
      const get = (key: string) => s.data?.find((r) => r.key === key)?.value || {};
      const d = get('delivery');
      setC({
        products: (p.data || []) as Product[],
        packages: (k.data || []) as GurPackage[],
        delivery: {
          inside_dhaka: Number(d.inside_dhaka ?? DEFAULT_DELIVERY.inside_dhaka),
          outside_dhaka: Number(d.outside_dhaka ?? DEFAULT_DELIVERY.outside_dhaka),
          free_min_kg: Number(d.free_min_kg ?? DEFAULT_DELIVERY.free_min_kg),
          free_min_amount: Number(d.free_min_amount ?? DEFAULT_DELIVERY.free_min_amount),
        },
        store: { ...DEFAULT_STORE, ...get('settings') },
        loading: false,
      });
    });
  }, []);
  return c;
}

export async function courierRequest(body: Record<string, unknown>) {
  const { data } = await supabase!.auth.getSession();
  const res = await fetch('/api/steadfast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token ?? ''}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({ error: 'সার্ভার থেকে সঠিক উত্তর আসেনি' }));
  if (!res.ok) throw new Error(json.error || `Error ${res.status}`);
  return json;
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function printInvoices(orders: Order[], store: Pick<StoreSettings, 'name' | 'phone' | 'address'>) {
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  const pages = orders
    .map(
      (o) => `
    <section class="inv">
      <header>
        <div><h1>${esc(store.name)}</h1><p>${esc(store.address)}<br/>হটলাইন: ${esc(store.phone)}</p></div>
        <div class="r"><h2>ইনভয়েস</h2><p>#${esc(o.order_number)}<br/>${esc(new Date(o.created_at).toLocaleString('bn-BD'))}</p></div>
      </header>
      <div class="to"><b>প্রাপক:</b> ${esc(o.customer_name)}<br/><b>মোবাইল:</b> ${esc(o.customer_phone)}<br/><b>ঠিকানা:</b> ${esc(o.customer_address)}
      ${o.courier?.tracking_code ? `<br/><b>ট্র্যাকিং:</b> ${esc(o.courier.tracking_code)}` : ''}</div>
      <table><thead><tr><th>পণ্য</th><th>পরিমাণ</th><th>দাম</th><th>মোট</th></tr></thead><tbody>
      ${o.items.map((i) => `<tr><td>${esc(i.name)}</td><td>${toBn(i.quantity)}</td><td>৳${bnMoney(i.price)}</td><td>৳${bnMoney(i.price * i.quantity)}</td></tr>`).join('')}
      </tbody></table>
      <div class="tot">
        <p>সাবটোটাল: ৳${bnMoney(o.subtotal)}</p>
        <p>ডেলিভারি চার্জ: ৳${bnMoney(o.delivery_fee)}</p>
        ${Number(o.discount) ? `<p>ছাড়: −৳${bnMoney(o.discount)}</p>` : ''}
        <p class="g">ক্যাশ অন ডেলিভারি: ৳${bnMoney(o.total)}</p>
      </div>
      ${o.note ? `<p class="note"><b>নোট:</b> ${esc(o.note)}</p>` : ''}
    </section>`
    )
    .join('');
  w.document.write(`<!doctype html><html lang="bn"><head><meta charset="utf-8"/><title>Invoice</title>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body{font-family:'Hind Siliguri',sans-serif;color:#111;margin:0}
    .inv{padding:28px 36px;page-break-after:always}
    header{display:flex;justify-content:space-between;border-bottom:2px solid #0B6B47;padding-bottom:10px}
    h1{margin:0;color:#0B6B47;font-size:22px} h2{margin:0;font-size:18px} p{margin:4px 0;font-size:13px}
    .r{text-align:right} .to{margin:16px 0;font-size:13px;line-height:1.7}
    table{width:100%;border-collapse:collapse;font-size:13px} th,td{border:1px solid #ddd;padding:7px;text-align:left} th{background:#ECFDF5}
    .tot{margin-top:12px;text-align:right} .g{font-size:17px;font-weight:700;color:#0B6B47}
    .note{margin-top:12px;font-size:12px;color:#444}
  </style></head><body>${pages}<script>window.onload=()=>setTimeout(()=>window.print(),400)</script></body></html>`);
  w.document.close();
}
