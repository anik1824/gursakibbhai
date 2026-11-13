import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, Phone, Printer, Search, Send, Trash2, Truck, RefreshCw, Pencil } from 'lucide-react';
import { proxify, supabase } from '../../lib/supabase';
import { bnMoney, errorMessage, isValidBdPhone, normalizePhone, toBn, whatsappLink } from '../../lib/format';
import { Order, OrderStatus } from '../../types';
import { useAdmin } from '../context';
import { courierRequest, printInvoices, useCatalog } from '../orderTools';
import { OrderDraft, OrderEditor, draftTotals } from '../OrderEditor';
import { Button, Card, Empty, Input, Modal, PageTitle, Select, Spinner, STATUS, STATUS_KEYS, StatusBadge, cx, useToast } from '../ui';

const PAGE = 50;

const fmtDate = (iso: string) => new Date(iso).toLocaleString('bn-BD', { day: 'numeric', month: 'short', year: '2-digit', hour: 'numeric', minute: '2-digit' });

export function validateDraft(d: OrderDraft): string | null {
  if (d.customer_name.trim().length < 2) return 'কাস্টমারের নাম দিন';
  if (!isValidBdPhone(d.customer_phone)) return 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন';
  if (d.customer_address.trim().length < 5) return 'ঠিকানা দিন';
  if (d.items.length === 0) return 'কমপক্ষে একটি পণ্য যোগ করুন';
  return null;
}

const toDraft = (o: Order): OrderDraft => ({
  customer_name: o.customer_name,
  customer_phone: o.customer_phone,
  customer_address: o.customer_address,
  delivery_area: o.delivery_area,
  items: o.items,
  delivery_fee: Number(o.delivery_fee),
  manual_fee: true,
  discount: Number(o.discount),
  note: o.note || '',
  admin_note: o.admin_note || '',
  status: o.status,
});

function OrderDetail({ order, onClose, onSaved, onDeleted }: { order: Order; onClose: () => void; onSaved: (o: Order) => void; onDeleted: (id: string) => void }) {
  const catalog = useCatalog();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<OrderDraft>(() => toDraft(order));
  const [busy, setBusy] = useState('');
  const [history, setHistory] = useState<{ total: number; cancelled: number } | null>(null);

  useEffect(() => {
    supabase!
      .from('orders')
      .select('status')
      .eq('customer_phone', order.customer_phone)
      .then(({ data }) => data && setHistory({ total: data.length, cancelled: data.filter((d) => d.status === 'cancelled').length }));
  }, [order.customer_phone]);

  const update = async (patch: Partial<Order>, label = 'আপডেট হয়েছে ✓') => {
    const { data, error } = await supabase!
      .from('orders')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .select()
      .single();
    if (error) {
      toast('error', errorMessage(error));
      return false;
    }
    onSaved(data as Order);
    toast('success', label);
    return true;
  };

  const saveEdit = async () => {
    const err = validateDraft(draft);
    if (err) return toast('error', err);
    const t = draftTotals(draft, catalog);
    setBusy('save');
    const ok = await update({
      customer_name: draft.customer_name.trim(),
      customer_phone: normalizePhone(draft.customer_phone),
      customer_address: draft.customer_address.trim(),
      delivery_area: draft.delivery_area,
      items: draft.items,
      subtotal: t.subtotal,
      delivery_fee: t.fee,
      discount: t.discount,
      total: t.total,
      note: draft.note || null,
      admin_note: draft.admin_note || null,
      status: draft.status,
    });
    setBusy('');
    if (ok) setEditing(false);
  };

  const sendCourier = async () => {
    setBusy('courier');
    try {
      const res = await courierRequest({ action: 'create', order_ids: [order.id] });
      const r = res.results?.[0];
      if (r?.ok) {
        onSaved(r.order);
        toast('success', `Steadfast এ পাঠানো হয়েছে • ট্র্যাকিং: ${r.order.courier?.tracking_code}`);
      } else toast('error', r?.error || 'পাঠানো যায়নি');
    } catch (e) {
      toast('error', errorMessage(e));
    }
    setBusy('');
  };

  const checkCourier = async () => {
    setBusy('check');
    try {
      const res = await courierRequest({ action: 'status', order_id: order.id });
      onSaved(res.order);
      toast('success', `কুরিয়ার স্ট্যাটাস: ${res.order.courier?.status}`);
    } catch (e) {
      toast('error', errorMessage(e));
    }
    setBusy('');
  };

  const remove = async () => {
    if (!window.confirm(`#${order.order_number} অর্ডারটি স্থায়ীভাবে মুছে ফেলবেন?`)) return;
    const { error } = await supabase!.from('orders').delete().eq('id', order.id);
    if (error) return toast('error', errorMessage(error));
    toast('success', 'অর্ডার মুছে ফেলা হয়েছে');
    onDeleted(order.id);
  };

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={`অর্ডার #${order.order_number}`}
      footer={
        editing ? (
          <>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              বাতিল
            </Button>
            <Button loading={busy === 'save'} onClick={saveEdit}>
              সেভ করুন
            </Button>
          </>
        ) : (
          <>
            <Button variant="danger" onClick={remove}>
              <Trash2 className="w-4 h-4" /> মুছুন
            </Button>
            <Button variant="secondary" onClick={() => printInvoices([order], catalog.store)}>
              <Printer className="w-4 h-4" /> প্রিন্ট
            </Button>
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil className="w-4 h-4" /> এডিট
            </Button>
          </>
        )
      }
    >
      {editing ? (
        catalog.loading ? (
          <Spinner />
        ) : (
          <OrderEditor draft={draft} onChange={setDraft} catalog={catalog} />
        )
      ) : (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <span className="text-xs text-gray-500">{fmtDate(order.created_at)}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{order.source === 'call' ? '📞 কল অর্ডার' : '🌐 ওয়েবসাইট'}</span>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">স্ট্যাটাস পরিবর্তন</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_KEYS.map((k) => (
                <button
                  key={k}
                  onClick={() => k !== order.status && update({ status: k }, `স্ট্যাটাস: ${STATUS[k].label}`)}
                  className={cx(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer',
                    k === order.status ? `${STATUS[k].cls} border-transparent` : 'border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {STATUS[k].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-200 p-3 space-y-1">
              <p className="font-bold">{order.customer_name}</p>
              <p className="text-gray-600">{order.customer_phone}</p>
              <p className="text-gray-600">{order.customer_address}</p>
              <p className="text-xs text-gray-500">{order.delivery_area === 'inside_dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}</p>
              {history && (
                <p className={cx('text-xs font-semibold', history.cancelled > 0 ? 'text-red-600' : 'text-gray-500')}>
                  এই নম্বরে মোট {toBn(history.total)}টি অর্ডার, {toBn(history.cancelled)}টি বাতিল
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <a href={`tel:${order.customer_phone}`} className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-[#0B6B47]">
                  <Phone className="w-3.5 h-3.5" /> কল
                </a>
                <a
                  href={whatsappLink(order.customer_phone, `আসসালামু আলাইকুম ${order.customer_name}, আপনার অর্ডার #${order.order_number} সম্পর্কে যোগাযোগ করছি।`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-3 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> কুরিয়ার (Steadfast)
              </p>
              {order.courier?.consignment_id ? (
                <div className="text-xs space-y-1">
                  <p>
                    কনসাইনমেন্ট আইডি: <b>{order.courier.consignment_id}</b>
                  </p>
                  <p>
                    ট্র্যাকিং কোড: <b>{order.courier.tracking_code}</b>
                  </p>
                  <p>
                    স্ট্যাটাস: <b>{order.courier.status}</b>
                  </p>
                  <Button size="sm" variant="secondary" loading={busy === 'check'} onClick={checkCourier}>
                    <RefreshCw className="w-3.5 h-3.5" /> স্ট্যাটাস আপডেট
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500">এখনো কুরিয়ারে পাঠানো হয়নি</p>
                  <Button size="sm" loading={busy === 'courier'} onClick={sendCourier} disabled={order.status === 'cancelled'}>
                    <Send className="w-3.5 h-3.5" /> Steadfast এ পাঠান
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
            {order.items.map((i) => (
              <div key={`${i.kind}:${i.id}`} className="flex items-center gap-3 p-3">
                {i.image && <img src={i.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                <p className="flex-1">
                  {i.name} <span className="text-gray-500">× {toBn(i.quantity)}</span>
                </p>
                <p className="font-semibold">৳{bnMoney(i.price * i.quantity)}</p>
              </div>
            ))}
            <div className="p-3 text-xs space-y-1 bg-gray-50 rounded-b-xl">
              <div className="flex justify-between">
                <span>সাবটোটাল</span>
                <span>৳{bnMoney(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি</span>
                <span>৳{bnMoney(order.delivery_fee)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between">
                  <span>ছাড়</span>
                  <span>−৳{bnMoney(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#0B6B47]">
                <span>সর্বমোট</span>
                <span>৳{bnMoney(order.total)}</span>
              </div>
            </div>
          </div>

          {(order.note || order.admin_note) && (
            <div className="text-xs space-y-1">
              {order.note && (
                <p>
                  <b>কাস্টমারের নোট:</b> {order.note}
                </p>
              )}
              {order.admin_note && (
                <p>
                  <b>অ্যাডমিন নোট:</b> {order.admin_note}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function Orders() {
  const { query, go } = useAdmin();
  const toast = useToast();
  const catalog = useCatalog();
  const [status, setStatus] = useState<OrderStatus | 'all'>((query.get('status') as OrderStatus) || 'all');
  const [source, setSource] = useState<'all' | 'web' | 'call'>('all');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [count, setCount] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<Order | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const s = query.get('status');
    if (s) setStatus(s as OrderStatus);
    const id = query.get('id');
    if (id)
      supabase!
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle()
        .then(({ data }) => data && setOpen(data as Order));
  }, [query]);

  const buildQuery = useCallback(
    (from: number) => {
      let q = supabase!.from('orders').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, from + PAGE - 1);
      if (status !== 'all') q = q.eq('status', status);
      if (source !== 'all') q = q.eq('source', source);
      if (debounced) {
        const s = debounced.replace(/[,()%*\\]/g, ' ').trim();
        q = q.or(`customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%,order_number.ilike.%${s}%`);
      }
      return q;
    },
    [status, source, debounced]
  );

  const load = useCallback(async () => {
    setLoading(true);
    const { data, count: c, error } = await buildQuery(0);
    if (error) toast('error', errorMessage(error));
    setOrders(proxify((data || []) as Order[]));
    setCount(c || 0);
    setSelected(new Set());
    setLoading(false);
    const res = await Promise.all(
      STATUS_KEYS.map((k) => supabase!.from('orders').select('id', { count: 'exact', head: true }).eq('status', k))
    );
    const all = await supabase!.from('orders').select('id', { count: 'exact', head: true });
    const m: Record<string, number> = { all: all.count || 0 };
    STATUS_KEYS.forEach((k, i) => (m[k] = res[i].count || 0));
    setCounts(m);
  }, [buildQuery, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    const { data } = await buildQuery(orders.length);
    setOrders((o) => [...o, ...proxify((data || []) as Order[])]);
  };

  const replace = (o: Order) => {
    setOrders((list) => list.map((x) => (x.id === o.id ? o : x)));
    setOpen((cur) => (cur?.id === o.id ? o : cur));
  };

  const selectedOrders = orders.filter((o) => selected.has(o.id));

  const bulkStatus = async (s: OrderStatus) => {
    if (!selected.size) return;
    setBulkBusy(true);
    const { data, error } = await supabase!
      .from('orders')
      .update({ status: s, updated_at: new Date().toISOString() })
      .in('id', [...selected])
      .select();
    setBulkBusy(false);
    if (error) return toast('error', errorMessage(error));
    (data as Order[]).forEach(replace);
    toast('success', `${toBn(data!.length)}টি অর্ডার: ${STATUS[s].label}`);
    load();
  };

  const bulkCourier = async () => {
    const ids = selectedOrders.filter((o) => !o.courier?.consignment_id && o.status !== 'cancelled').map((o) => o.id);
    if (!ids.length) return toast('error', 'পাঠানোর মতো কোনো অর্ডার সিলেক্ট করা নেই');
    setBulkBusy(true);
    try {
      const res = await courierRequest({ action: 'create', order_ids: ids });
      const ok = res.results.filter((r: { ok: boolean }) => r.ok);
      ok.forEach((r: { order: Order }) => replace(r.order));
      const failed = res.results.filter((r: { ok: boolean }) => !r.ok);
      toast(failed.length ? 'error' : 'success', `${toBn(ok.length)}টি পাঠানো হয়েছে${failed.length ? `, ${toBn(failed.length)}টি ব্যর্থ: ${failed[0].error}` : ''}`);
    } catch (e) {
      toast('error', errorMessage(e));
    }
    setBulkBusy(false);
  };

  const bulkDelete = async () => {
    if (!window.confirm(`${toBn(selected.size)}টি অর্ডার স্থায়ীভাবে মুছে ফেলবেন?`)) return;
    const { error } = await supabase!.from('orders').delete().in('id', [...selected]);
    if (error) return toast('error', errorMessage(error));
    toast('success', 'মুছে ফেলা হয়েছে');
    load();
  };

  const allChecked = orders.length > 0 && orders.every((o) => selected.has(o.id));

  return (
    <div>
      <PageTitle
        title="সব অর্ডার"
        subtitle={`মোট ${toBn(count)}টি অর্ডার`}
        right={<Button onClick={() => go('new_order')}>+ নতুন অর্ডার</Button>}
      />

      <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 overflow-x-auto mb-3">
        {(['all', ...STATUS_KEYS] as const).map((k) => (
          <button
            key={k}
            onClick={() => setStatus(k)}
            className={cx(
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer',
              status === k ? 'bg-[#0B6B47] text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {k === 'all' ? 'সব' : STATUS[k].label} ({toBn(counts[k] ?? 0)})
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="নাম, মোবাইল বা অর্ডার আইডি দিয়ে খুঁজুন" className="pl-9" />
        </div>
        <Select value={source} onChange={(e) => setSource(e.target.value as typeof source)} className="sm:w-48">
          <option value="all">সব সোর্স</option>
          <option value="web">ওয়েবসাইট</option>
          <option value="call">কল অর্ডার</option>
        </Select>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 mb-3 rounded-2xl bg-emerald-50 border border-emerald-200">
          <span className="text-sm font-semibold text-[#0B6B47]">{toBn(selected.size)}টি সিলেক্টেড</span>
          <Select onChange={(e) => e.target.value && bulkStatus(e.target.value as OrderStatus)} value="" className="w-auto text-xs" disabled={bulkBusy}>
            <option value="">স্ট্যাটাস বদলান</option>
            {STATUS_KEYS.map((k) => (
              <option key={k} value={k}>
                {STATUS[k].label}
              </option>
            ))}
          </Select>
          <Button size="sm" loading={bulkBusy} onClick={bulkCourier}>
            <Truck className="w-3.5 h-3.5" /> Steadfast এ পাঠান
          </Button>
          <Button size="sm" variant="secondary" onClick={() => printInvoices(selectedOrders, catalog.store)}>
            <Printer className="w-3.5 h-3.5" /> ইনভয়েস প্রিন্ট
          </Button>
          <Button size="sm" variant="danger" onClick={bulkDelete}>
            <Trash2 className="w-3.5 h-3.5" /> মুছুন
          </Button>
        </div>
      )}

      <Card>
        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <Empty text="কোনো অর্ডার পাওয়া যায়নি" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[860px]">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="p-3 w-8">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={() => setSelected(allChecked ? new Set() : new Set(orders.map((o) => o.id)))}
                      className="accent-[#0B6B47]"
                      aria-label="সব সিলেক্ট"
                    />
                  </th>
                  <th className="p-3">আইডি</th>
                  <th className="p-3">কাস্টমার</th>
                  <th className="p-3">পণ্য</th>
                  <th className="p-3">টাকা</th>
                  <th className="p-3">স্ট্যাটাস</th>
                  <th className="p-3">কুরিয়ার</th>
                  <th className="p-3">তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setOpen(o)}>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(o.id)}
                        onChange={() =>
                          setSelected((s) => {
                            const n = new Set(s);
                            n.has(o.id) ? n.delete(o.id) : n.add(o.id);
                            return n;
                          })
                        }
                        className="accent-[#0B6B47]"
                        aria-label="সিলেক্ট"
                      />
                    </td>
                    <td className="p-3 font-mono font-semibold whitespace-nowrap">
                      #{o.order_number}
                      {o.source === 'call' && <span className="ml-1">📞</span>}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold">{o.customer_name}</p>
                      <p className="text-gray-500">{o.customer_phone}</p>
                    </td>
                    <td className="p-3 text-gray-600 max-w-[260px]">
                      <p className="truncate">{o.items.map((i) => `${i.name} ×${toBn(i.quantity)}`).join(', ')}</p>
                    </td>
                    <td className="p-3 font-bold whitespace-nowrap">৳{bnMoney(o.total)}</td>
                    <td className="p-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="p-3 text-gray-500">{o.courier?.tracking_code || '—'}</td>
                    <td className="p-3 text-gray-500 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {orders.length < count && !loading && (
          <div className="p-3 text-center border-t border-gray-100">
            <Button variant="secondary" onClick={loadMore}>
              আরো দেখুন ({toBn(count - orders.length)}টি বাকি)
            </Button>
          </div>
        )}
      </Card>

      {open && (
        <OrderDetail
          key={open.id + open.updated_at}
          order={open}
          onClose={() => {
            setOpen(null);
            if (query.get('id')) window.history.replaceState(null, '', '/admin/orders');
          }}
          onSaved={replace}
          onDeleted={(id) => {
            setOpen(null);
            setOrders((l) => l.filter((x) => x.id !== id));
            setCount((c) => c - 1);
          }}
        />
      )}
    </div>
  );
}
