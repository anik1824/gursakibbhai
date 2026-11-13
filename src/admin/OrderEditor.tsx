import React, { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { DeliveryArea, OrderItem, OrderStatus } from '../types';
import { calcTotals } from '../lib/pricing';
import { bnMoney } from '../lib/format';
import { Catalog } from './orderTools';
import { Button, Field, Input, Select, STATUS, STATUS_KEYS, Textarea, Toggle } from './ui';

export interface OrderDraft {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_area: DeliveryArea;
  items: OrderItem[];
  delivery_fee: number;
  manual_fee: boolean;
  discount: number;
  note: string;
  admin_note: string;
  status: OrderStatus;
}

export const emptyDraft = (): OrderDraft => ({
  customer_name: '',
  customer_phone: '',
  customer_address: '',
  delivery_area: 'inside_dhaka',
  items: [],
  delivery_fee: 0,
  manual_fee: false,
  discount: 0,
  note: '',
  admin_note: '',
  status: 'confirmed',
});

export function draftTotals(d: OrderDraft, catalog: Catalog) {
  const freePkgs = new Set(catalog.packages.filter((p) => p.is_free_delivery).map((p) => p.id));
  const auto = calcTotals(
    d.items.map((i) => ({ ...i, free_delivery: i.kind === 'package' && freePkgs.has(i.id) })),
    d.delivery_area,
    catalog.delivery
  );
  const fee = d.manual_fee ? Number(d.delivery_fee) || 0 : auto.fee;
  const discount = Math.max(0, Number(d.discount) || 0);
  return { subtotal: auto.subtotal, fee, discount, total: Math.max(0, auto.subtotal + fee - discount) };
}

export const OrderEditor: React.FC<{
  draft: OrderDraft;
  onChange: (d: OrderDraft) => void;
  catalog: Catalog;
  showStatus?: boolean;
}> = ({ draft, onChange, catalog, showStatus = true }) => {
  const set = (p: Partial<OrderDraft>) => onChange({ ...draft, ...p });
  const t = draftTotals(draft, catalog);

  const options = useMemo(
    () => [
      ...catalog.products.map((p) => ({ key: `product:${p.id}`, kind: 'product' as const, id: p.id, name: p.name, price: Number(p.price), kg: Number(p.weight_kg), image: p.image_url, active: p.active })),
      ...catalog.packages.map((p) => ({ key: `package:${p.id}`, kind: 'package' as const, id: p.id, name: p.name, price: Number(p.discount_price), kg: Number(p.weight_kg), image: p.image_url, active: p.active })),
    ],
    [catalog.products, catalog.packages]
  );

  const addItem = (key: string) => {
    const o = options.find((x) => x.key === key);
    if (!o) return;
    const existing = draft.items.findIndex((i) => `${i.kind}:${i.id}` === key);
    if (existing >= 0) {
      set({ items: draft.items.map((i, j) => (j === existing ? { ...i, quantity: i.quantity + 1 } : i)) });
    } else {
      set({ items: [...draft.items, { kind: o.kind, id: o.id, name: o.name, price: o.price, quantity: 1, weight_kg: o.kg, image: o.image }] });
    }
  };

  const updateItem = (idx: number, p: Partial<OrderItem>) => set({ items: draft.items.map((i, j) => (j === idx ? { ...i, ...p } : i)) });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="কাস্টমারের নাম *">
          <Input value={draft.customer_name} onChange={(e) => set({ customer_name: e.target.value })} />
        </Field>
        <Field label="মোবাইল নম্বর *">
          <Input type="tel" value={draft.customer_phone} onChange={(e) => set({ customer_phone: e.target.value })} placeholder="01XXXXXXXXX" />
        </Field>
        <Field label="সম্পূর্ণ ঠিকানা *" className="sm:col-span-2">
          <Textarea rows={2} value={draft.customer_address} onChange={(e) => set({ customer_address: e.target.value })} />
        </Field>
        <Field label="ডেলিভারি এরিয়া">
          <Select value={draft.delivery_area} onChange={(e) => set({ delivery_area: e.target.value as DeliveryArea })}>
            <option value="inside_dhaka">ঢাকার ভেতরে</option>
            <option value="outside_dhaka">ঢাকার বাইরে</option>
          </Select>
        </Field>
        {showStatus && (
          <Field label="স্ট্যাটাস">
            <Select value={draft.status} onChange={(e) => set({ status: e.target.value as OrderStatus })}>
              {STATUS_KEYS.map((k) => (
                <option key={k} value={k}>
                  {STATUS[k].label}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-sm font-bold">পণ্য</p>
          <Select value="" onChange={(e) => addItem(e.target.value)} className="w-auto max-w-[60%] text-xs">
            <option value="">+ পণ্য যোগ করুন</option>
            <optgroup label="পণ্য">
              {options
                .filter((o) => o.kind === 'product')
                .map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.name} — ৳{o.price}
                    {o.active ? '' : ' (বন্ধ)'}
                  </option>
                ))}
            </optgroup>
            <optgroup label="কম্বো প্যাক">
              {options
                .filter((o) => o.kind === 'package')
                .map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.name} — ৳{o.price}
                    {o.active ? '' : ' (বন্ধ)'}
                  </option>
                ))}
            </optgroup>
          </Select>
        </div>
        {draft.items.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center border border-dashed rounded-xl">কোনো পণ্য যোগ করা হয়নি</p>
        ) : (
          <div className="space-y-2">
            {draft.items.map((it, idx) => (
              <div key={`${it.kind}:${it.id}`} className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2.5 rounded-xl border border-gray-200">
                {it.image && <img src={it.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                <p className="text-sm font-semibold flex-1 min-w-[140px]">{it.name}</p>
                <Input
                  type="number"
                  min={1}
                  value={it.quantity}
                  onChange={(e) => updateItem(idx, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-16 text-center"
                  aria-label="পরিমাণ"
                />
                <span className="text-xs text-gray-400">×</span>
                <Input
                  type="number"
                  min={0}
                  value={it.price}
                  onChange={(e) => updateItem(idx, { price: Math.max(0, Number(e.target.value) || 0) })}
                  className="w-24"
                  aria-label="দাম"
                />
                <span className="text-sm font-bold w-20 text-right">৳{bnMoney(it.price * it.quantity)}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => set({ items: draft.items.filter((_, j) => j !== idx) })} aria-label="মুছুন">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Toggle
            checked={draft.manual_fee}
            onChange={(v) => set({ manual_fee: v, delivery_fee: v ? t.fee : draft.delivery_fee })}
            label="ডেলিভারি চার্জ নিজে বসাব"
          />
          <Input
            type="number"
            min={0}
            disabled={!draft.manual_fee}
            value={draft.manual_fee ? draft.delivery_fee : t.fee}
            onChange={(e) => set({ delivery_fee: Number(e.target.value) || 0 })}
            aria-label="ডেলিভারি চার্জ"
          />
        </div>
        <Field label="ছাড় (টাকা)">
          <Input type="number" min={0} value={draft.discount} onChange={(e) => set({ discount: Number(e.target.value) || 0 })} />
        </Field>
        <Field label="কাস্টমারের নোট">
          <Input value={draft.note} onChange={(e) => set({ note: e.target.value })} />
        </Field>
        <Field label="অ্যাডমিন নোট (শুধু আপনি দেখবেন)">
          <Input value={draft.admin_note} onChange={(e) => set({ admin_note: e.target.value })} />
        </Field>
      </div>

      <div className="rounded-xl bg-emerald-50 p-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span>সাবটোটাল</span>
          <span>৳{bnMoney(t.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>ডেলিভারি চার্জ</span>
          <span>৳{bnMoney(t.fee)}</span>
        </div>
        {t.discount > 0 && (
          <div className="flex justify-between">
            <span>ছাড়</span>
            <span>−৳{bnMoney(t.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base text-[#0B6B47] pt-1 border-t border-emerald-200">
          <span>সর্বমোট</span>
          <span>৳{bnMoney(t.total)}</span>
        </div>
      </div>
    </div>
  );
};
