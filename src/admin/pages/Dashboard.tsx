import React, { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpRight, Ban, Box, Clock, Coins, ShoppingCart, Truck, TrendingUp, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { bnMoney, errorMessage, toBn } from '../../lib/format';
import { IncompleteOrder, Order, OrderStatus } from '../../types';
import { useAdmin } from '../context';
import { Card, CardHeader, Empty, Input, Select, Spinner, STATUS, STATUS_KEYS, StatusBadge, cx, useToast } from '../ui';

type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'month' | 'last_month' | 'all';
const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'আজ' },
  { key: 'yesterday', label: 'গতকাল' },
  { key: '7d', label: '৭ দিন' },
  { key: '30d', label: '৩০ দিন' },
  { key: 'month', label: 'এই মাস' },
  { key: 'last_month', label: 'গত মাস' },
  { key: 'all', label: 'সব সময়' },
];

const DAY = 86400000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isConfirmed = (s: OrderStatus) => s === 'confirmed' || s === 'shipped' || s === 'delivered';

function rangeBounds(key: RangeKey, from: string, to: string): { start: Date | null; end: Date } {
  const today = startOfDay(new Date());
  if (from || to) {
    const s = from ? new Date(`${from}T00:00:00`) : null;
    const e = to ? new Date(new Date(`${to}T00:00:00`).getTime() + DAY) : new Date(today.getTime() + DAY);
    return { start: s, end: e };
  }
  const tomorrow = new Date(today.getTime() + DAY);
  switch (key) {
    case 'today':
      return { start: today, end: tomorrow };
    case 'yesterday':
      return { start: new Date(today.getTime() - DAY), end: today };
    case '7d':
      return { start: new Date(today.getTime() - 6 * DAY), end: tomorrow };
    case '30d':
      return { start: new Date(today.getTime() - 29 * DAY), end: tomorrow };
    case 'month':
      return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: tomorrow };
    case 'last_month':
      return { start: new Date(today.getFullYear(), today.getMonth() - 1, 1), end: new Date(today.getFullYear(), today.getMonth(), 1) };
    default:
      return { start: null, end: tomorrow };
  }
}

function stats(list: Order[]) {
  const confirmed = list.filter((o) => isConfirmed(o.status));
  const by = (s: OrderStatus) => list.filter((o) => o.status === s);
  const sum = (l: Order[]) => l.reduce((a, o) => a + Number(o.total), 0);
  return {
    total: list.length,
    customers: new Set(list.map((o) => o.customer_phone)).size,
    confirmed: confirmed.length,
    sales: sum(confirmed),
    pending: { n: by('pending').length, amt: sum(by('pending')) },
    shipped: { n: by('shipped').length, amt: sum(by('shipped')) },
    cancelled: { n: by('cancelled').length, amt: sum(by('cancelled')) },
    delivered: by('delivered').length,
    avg: list.length ? sum(list.filter((o) => o.status !== 'cancelled')) / Math.max(1, list.filter((o) => o.status !== 'cancelled').length) : 0,
  };
}

const pct = (cur: number, prev: number) => (prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100));

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'শুভ রাত্রি 🌙';
  if (h < 12) return 'শুভ সকাল ☀️';
  if (h < 16) return 'শুভ দুপুর 🌤️';
  if (h < 19) return 'শুভ বিকাল 🌇';
  return 'শুভ সন্ধ্যা 🌙';
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('bn-BD', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

const Ring: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-[76px] h-[76px] shrink-0">
      <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke="#FCD34D"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(Math.min(100, value) / 100) * c} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-sm font-bold">{toBn(value)}%</span>
        <span className="text-[8px] text-emerald-100 leading-tight">{label}</span>
      </div>
    </div>
  );
};

const GradientStat: React.FC<{ title: string; value: string; change: number; icon: React.ReactNode; gradient: string }> = ({
  title,
  value,
  change,
  icon,
  gradient,
}) => (
  <div className={cx('relative overflow-hidden rounded-2xl p-5 text-white shadow-sm', gradient)}>
    <div className="absolute -right-6 -top-8 w-28 h-28 rounded-full bg-white/10" />
    <div className="absolute -right-2 -bottom-12 w-32 h-32 rounded-full bg-white/10" />
    <div className="relative flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-white/20 grid place-items-center shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-white/85">{title}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-md">
          <TrendingUp className="w-3 h-3" /> {change >= 0 ? '' : '−'}
          {toBn(Math.abs(change))}% আগের সময়ের তুলনায়
        </span>
      </div>
    </div>
  </div>
);

const MiniStat: React.FC<{ title: string; value: string; icon: React.ReactNode; tint: string }> = ({ title, value, icon, tint }) => (
  <Card className="p-4 flex items-center gap-3">
    <div className={cx('w-11 h-11 rounded-full grid place-items-center shrink-0', tint)}>{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] text-gray-500">{title}</p>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  </Card>
);

function SalesChart({ orders, start, end }: { orders: Order[]; start: Date | null; end: Date }) {
  const buckets = useMemo(() => {
    const first = start || (orders.length ? startOfDay(new Date(orders[orders.length - 1].created_at)) : startOfDay(new Date()));
    const days = Math.max(1, Math.round((end.getTime() - first.getTime()) / DAY));
    const monthly = days > 92;
    const map = new Map<string, { label: string; sales: number; orders: number }>();
    if (monthly) {
      const d = new Date(first.getFullYear(), first.getMonth(), 1);
      while (d < end) {
        map.set(`${d.getFullYear()}-${d.getMonth()}`, { label: d.toLocaleDateString('bn-BD', { month: 'short' }), sales: 0, orders: 0 });
        d.setMonth(d.getMonth() + 1);
      }
    } else {
      for (let t = first.getTime(); t < end.getTime(); t += DAY) {
        const d = new Date(t);
        map.set(d.toDateString(), { label: toBn(d.getDate()), sales: 0, orders: 0 });
      }
    }
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      const k = monthly ? `${d.getFullYear()}-${d.getMonth()}` : startOfDay(d).toDateString();
      const b = map.get(k);
      if (!b) return;
      b.orders += 1;
      if (isConfirmed(o.status)) b.sales += Number(o.total);
    });
    return [...map.values()];
  }, [orders, start, end]);

  const maxS = Math.max(1, ...buckets.map((b) => b.sales));
  const maxO = Math.max(1, ...buckets.map((b) => b.orders));
  const step = Math.ceil(buckets.length / 12);

  return (
    <div className="px-5 pb-5">
      <div className="h-56 flex items-end gap-[3px] border-b border-gray-200">
        {buckets.map((b, i) => (
          <div key={i} className="flex-1 h-full flex items-end justify-center gap-[2px] group relative min-w-0">
            <div className="w-1/2 max-w-[10px] rounded-t bg-[#0B8A5A]" style={{ height: `${Math.max(2, (b.sales / maxS) * 100)}%` }} />
            <div className="w-1/2 max-w-[10px] rounded-t bg-[#FBBF24]" style={{ height: `${Math.max(2, (b.orders / maxO) * 100)}%` }} />
            <div className="pointer-events-none absolute bottom-full mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] rounded-md px-2 py-1 whitespace-nowrap z-10">
              {b.label}: ৳{bnMoney(b.sales)} • {toBn(b.orders)} অর্ডার
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-[3px] mt-1.5">
        {buckets.map((b, i) => (
          <span key={i} className="flex-1 text-center text-[9px] text-gray-400 truncate min-w-0">
            {i % step === 0 ? b.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { me, go, can } = useAdmin();
  const toast = useToast();
  const [range, setRange] = useState<RangeKey>('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [prevOrders, setPrevOrders] = useState<Order[]>([]);
  const [incomplete, setIncomplete] = useState<IncompleteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentLimit, setRecentLimit] = useState(10);

  const { start, end } = useMemo(() => rangeBounds(range, from, to), [range, from, to]);

  useEffect(() => {
    setLoading(true);
    const cols = 'id,order_number,customer_name,customer_phone,items,total,status,created_at';
    const prevStart = start ? new Date(start.getTime() - (end.getTime() - start.getTime())) : null;
    let q = supabase!.from('orders').select(cols).lt('created_at', end.toISOString()).order('created_at', { ascending: false }).limit(10000);
    if (prevStart) q = q.gte('created_at', prevStart.toISOString());
    Promise.all([
      q,
      can('incomplete') || can('dashboard')
        ? supabase!.from('incomplete_orders').select('*').order('updated_at', { ascending: false }).limit(5)
        : Promise.resolve({ data: [], error: null }),
    ]).then(([o, inc]) => {
      if (o.error) toast('error', errorMessage(o.error));
      const all = (o.data || []) as Order[];
      setOrders(start ? all.filter((x) => new Date(x.created_at) >= start) : all);
      setPrevOrders(start ? all.filter((x) => new Date(x.created_at) < start) : []);
      setIncomplete((inc.data || []) as IncompleteOrder[]);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start?.getTime(), end.getTime()]);

  const s = useMemo(() => stats(orders), [orders]);
  const p = useMemo(() => stats(prevOrders), [prevOrders]);
  const confirmRate = s.total ? Math.round((s.confirmed / s.total) * 100) : 0;
  const deliveryRate = s.confirmed ? Math.round((s.delivered / s.confirmed) * 100) : 0;
  const rangeLabel = from || to ? 'নির্বাচিত সময়' : RANGES.find((r) => r.key === range)!.label;

  const statusCounts = STATUS_KEYS.map((k) => ({ k, n: orders.filter((o) => o.status === k).length }));
  let acc = 0;
  const conic = s.total
    ? statusCounts
        .filter((x) => x.n)
        .map((x) => {
          const a = acc;
          acc += (x.n / s.total) * 360;
          return `${STATUS[x.k].color} ${a}deg ${acc}deg`;
        })
        .join(', ')
    : '#E5E7EB 0deg 360deg';

  const top = useMemo(() => {
    const m = new Map<string, { name: string; qty: number; amt: number }>();
    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) =>
        o.items.forEach((it) => {
          const k = `${it.kind}:${it.id}`;
          const cur = m.get(k) || { name: it.name, qty: 0, amt: 0 };
          cur.qty += it.quantity;
          cur.amt += it.price * it.quantity;
          m.set(k, cur);
        })
      );
    return [...m.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [orders]);

  const displayName = me.name || me.email.split('@')[0];

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#064E35] via-[#0B6B47] to-[#13A06A] text-white p-6 sm:p-8">
        <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-block text-[11px] bg-white/15 px-2.5 py-1 rounded-full font-semibold">{greeting()}</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-3">স্বাগতম, {displayName}!</h2>
            <p className="text-sm text-emerald-50 mt-1">
              {rangeLabel} — {toBn(s.total)}টি অর্ডার •{' '}
              <button className="underline font-semibold cursor-pointer" onClick={() => go('orders', { status: 'pending' })}>
                {toBn(s.pending.n)}টি কলের অপেক্ষায়
              </button>
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="rounded-2xl bg-white/10 border border-white/20 px-5 py-4 min-w-[130px]">
              <p className="text-[11px] text-emerald-100">কনফার্মড বিক্রি</p>
              <p className="text-2xl font-bold text-[#FCD34D]">৳{bnMoney(s.sales)}</p>
            </div>
            <Ring value={confirmRate} label="কনফার্ম রেট" />
            <Ring value={deliveryRate} label="ডেলিভারি রেট" />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 overflow-x-auto">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => {
                setRange(r.key);
                setFrom('');
                setTo('');
              }}
              className={cx(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer',
                range === r.key && !from && !to ? 'bg-[#0B6B47] text-white' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-auto" aria-label="শুরুর তারিখ" />
          <span className="text-xs text-gray-500">থেকে</span>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-auto" aria-label="শেষ তারিখ" />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <GradientStat
              title="মোট অর্ডার"
              value={toBn(s.total)}
              change={pct(s.total, p.total)}
              icon={<ShoppingCart className="w-5 h-5" />}
              gradient="bg-gradient-to-br from-[#8B5CF6] to-[#C084FC]"
            />
            <GradientStat
              title="মোট কাস্টমার"
              value={toBn(s.customers)}
              change={pct(s.customers, p.customers)}
              icon={<Users className="w-5 h-5" />}
              gradient="bg-gradient-to-br from-[#F43F5E] to-[#FB7185]"
            />
            <GradientStat
              title="কনফার্মড অর্ডার"
              value={toBn(s.confirmed)}
              change={pct(s.confirmed, p.confirmed)}
              icon={<Box className="w-5 h-5" />}
              gradient="bg-gradient-to-br from-[#2563EB] to-[#38BDF8]"
            />
            <GradientStat
              title="মোট বিক্রি (কনফার্মড)"
              value={`৳${bnMoney(s.sales)}`}
              change={pct(s.sales, p.sales)}
              icon={<Activity className="w-5 h-5" />}
              gradient="bg-gradient-to-br from-[#065F46] to-[#0B8A5A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MiniStat
              title="পেন্ডিং (কলের অপেক্ষায়)"
              value={`${toBn(s.pending.n)}টি • ৳${bnMoney(s.pending.amt)}`}
              icon={<Clock className="w-5 h-5 text-amber-600" />}
              tint="bg-amber-100"
            />
            <MiniStat
              title="শিপড (পথে আছে)"
              value={`${toBn(s.shipped.n)}টি • ৳${bnMoney(s.shipped.amt)}`}
              icon={<Truck className="w-5 h-5 text-violet-600" />}
              tint="bg-violet-100"
            />
            <MiniStat
              title="বাতিল"
              value={`${toBn(s.cancelled.n)}টি • ৳${bnMoney(s.cancelled.amt)}`}
              icon={<Ban className="w-5 h-5 text-red-500" />}
              tint="bg-red-100"
            />
            <MiniStat title="গড় অর্ডার মূল্য" value={`৳${bnMoney(s.avg)}`} icon={<Coins className="w-5 h-5 text-emerald-700" />} tint="bg-emerald-100" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card accent="#0B6B47">
              <CardHeader
                title="বিক্রির চিত্র"
                subtitle="দিনভিত্তিক বিক্রি আর অর্ডার"
                right={
                  <div className="flex items-center gap-3 text-[11px] text-gray-600">
                    <span className="flex items-center gap-1">
                      <i className="w-2 h-2 rounded-full bg-[#0B8A5A]" /> বিক্রি
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="w-2 h-2 rounded-full bg-[#FBBF24]" /> অর্ডার
                    </span>
                  </div>
                }
              />
              <SalesChart orders={orders} start={start} end={end} />
            </Card>

            <Card accent="#F59E0B">
              <CardHeader title="অর্ডার স্ট্যাটাস" subtitle={rangeLabel} />
              <div className="px-5 pb-5 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative w-36 h-36 rounded-full shrink-0" style={{ background: `conic-gradient(${conic})` }}>
                  <div className="absolute inset-[18px] rounded-full bg-white flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{toBn(s.total)}</span>
                    <span className="text-[11px] text-gray-500">অর্ডার</span>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-2">
                  {statusCounts.map(({ k, n }) => (
                    <button
                      key={k}
                      onClick={() => go('orders', { status: k })}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-xs cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <i className="w-2 h-2 rounded-full" style={{ background: STATUS[k].color }} />
                        {STATUS[k].label}
                      </span>
                      <b>{toBn(s.total ? Math.round((n / s.total) * 100) : 0)}%</b>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card accent="#F97316">
              <CardHeader
                title="অসম্পূর্ণ অর্ডার"
                subtitle="কল করলেই অর্ডার"
                right={
                  <button onClick={() => go('incomplete')} className="text-xs font-semibold text-[#0B6B47] flex items-center gap-0.5 cursor-pointer">
                    সব <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                }
              />
              <div className="px-5 pb-5">
                {incomplete.length === 0 ? (
                  <Empty text="এখন কোনো অসম্পূর্ণ অর্ডার নেই ✅" />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {incomplete.map((i) => (
                      <div key={i.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{i.customer_name || 'নাম নেই'}</p>
                          <p className="text-[11px] text-gray-500">
                            {i.customer_phone} • {fmtDate(i.updated_at)}
                          </p>
                        </div>
                        <a href={`tel:${i.customer_phone}`} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0B6B47] shrink-0">
                          কল
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <Card accent="#0B6B47" className="xl:col-span-2">
              <CardHeader
                title="সাম্প্রতিক অর্ডার"
                subtitle={`সবশেষ আসা • ${toBn(Math.min(recentLimit, orders.length))}/${toBn(orders.length)}টি দেখাচ্ছে`}
                right={
                  <div className="flex items-center gap-2">
                    <Select value={recentLimit} onChange={(e) => setRecentLimit(+e.target.value)} className="w-auto py-1 text-xs">
                      {[5, 10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                          {toBn(n)}টি
                        </option>
                      ))}
                    </Select>
                    <button onClick={() => go('orders')} className="text-xs font-semibold text-[#0B6B47] flex items-center gap-0.5 cursor-pointer whitespace-nowrap">
                      সব দেখুন <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                }
              />
              <div className="px-5 pb-5 overflow-x-auto">
                {orders.length === 0 ? (
                  <Empty text="এই সময়ে কোনো অর্ডার নেই" />
                ) : (
                  <table className="w-full text-xs min-w-[640px]">
                    <thead>
                      <tr className="bg-emerald-50 text-[#0B6B47] text-left">
                        <th className="px-3 py-2.5 rounded-l-xl">আইডি</th>
                        <th className="px-3 py-2.5">কাস্টমার</th>
                        <th className="px-3 py-2.5">পণ্য</th>
                        <th className="px-3 py-2.5">টাকা</th>
                        <th className="px-3 py-2.5">স্ট্যাটাস</th>
                        <th className="px-3 py-2.5 rounded-r-xl">তারিখ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.slice(0, recentLimit).map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => go('orders', { id: o.id })}>
                          <td className="px-3 py-3 font-mono font-semibold">#{o.order_number}</td>
                          <td className="px-3 py-3">{o.customer_name}</td>
                          <td className="px-3 py-3 text-gray-600 max-w-[260px] truncate">
                            {o.items.map((i) => `${i.name} ×${toBn(i.quantity)}`).join(', ')}
                          </td>
                          <td className="px-3 py-3 font-bold">৳{bnMoney(o.total)}</td>
                          <td className="px-3 py-3">
                            <StatusBadge status={o.status} />
                          </td>
                          <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{fmtDate(o.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>

            <Card accent="#E11D48">
              <CardHeader title="টপ সেলিং পণ্য" subtitle={`${rangeLabel} • বাতিল ছাড়া`} />
              <div className="px-5 pb-5">
                {top.length === 0 ? (
                  <Empty text="এখনো কোনো বিক্রি নেই" />
                ) : (
                  <div className="space-y-3">
                    {top.map((t, i) => (
                      <div key={t.name}>
                        <div className="flex justify-between gap-2 text-xs mb-1">
                          <span className="font-semibold truncate">
                            {toBn(i + 1)}. {t.name}
                          </span>
                          <span className="text-gray-500 whitespace-nowrap">
                            {toBn(t.qty)}টি • ৳{bnMoney(t.amt)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-gradient-to-r from-[#0B6B47] to-[#13A06A]" style={{ width: `${(t.qty / top[0].qty) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
