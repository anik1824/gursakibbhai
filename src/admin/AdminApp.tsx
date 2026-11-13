import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ArrowUpRight, ExternalLink, LogOut, Menu, Phone, RefreshCw, X } from 'lucide-react';
import { proxify, supabase } from '../lib/supabase';
import { errorMessage } from '../lib/format';
import { AdminUser } from '../types';
import { AdminContext } from './context';
import { ALL_NAV, NAV_GROUPS } from './nav';
import { Button, Field, Input, Spinner, ToastProvider, cx } from './ui';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import NewOrder from './pages/NewOrder';
import Incomplete from './pages/Incomplete';
import Products from './pages/Products';
import Combos from './pages/Combos';
import Categories from './pages/Categories';
import Banners from './pages/Banners';
import Courier from './pages/Courier';
import Fraud from './pages/Fraud';
import Delivery from './pages/Delivery';
import Landing from './pages/Landing';
import Reviews from './pages/Reviews';
import SiteSettings from './pages/SiteSettings';
import { PixelPage, GtmPage } from './pages/Tracking';
import CustomCss from './pages/CustomCss';
import UsersPage from './pages/Users';

const PAGES: Record<string, React.FC> = {
  dashboard: Dashboard,
  orders: Orders,
  new_order: NewOrder,
  incomplete: Incomplete,
  products: Products,
  combos: Combos,
  categories: Categories,
  banners: Banners,
  courier: Courier,
  fraud: Fraud,
  delivery: Delivery,
  landing: Landing,
  reviews: Reviews,
  settings: SiteSettings,
  pixel: PixelPage,
  gtm: GtmPage,
  css: CustomCss,
  users: UsersPage,
};

const BRAND_LOGO = '/brand/sakibs-world-mark.svg';

const BrandName: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'sm' }) => (
  <span className={cx('font-bold italic tracking-tight leading-none whitespace-nowrap', size === 'lg' ? 'text-2xl' : 'text-[17px]')}>
    <span className="text-[#1C1917]">Sakib&rsquo;s</span> <span className="text-[#D97706]">World</span>
  </span>
);

// সাইট সেটিংসের লোগো ব্যবহার হয়, না থাকলে ডিফল্ট মধুর লোগো
let logoCache: Promise<string> | null = null;
function useBrandLogo() {
  const [logo, setLogo] = useState(BRAND_LOGO);
  useEffect(() => {
    logoCache ??= Promise.resolve(supabase!.from('settings').select('value').eq('key', 'settings').maybeSingle()).then(
      ({ data }) => proxify(String(data?.value?.logo_url || '')) || BRAND_LOGO,
      () => BRAND_LOGO
    );
    logoCache.then(setLogo);
  }, []);
  return logo;
}

const pageFromPath = () => window.location.pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'dashboard';

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#F5F7F6] flex items-center justify-center p-4 font-['Hind_Siliguri',sans-serif]">{children}</div>
);

function NotConfigured() {
  return (
    <Shell>
      <div className="max-w-md bg-white rounded-2xl border border-gray-200 p-6 text-sm text-gray-700 space-y-2">
        <h1 className="text-lg font-bold text-gray-900">Supabase কানেক্ট করা নেই</h1>
        <p>
          প্রজেক্টের <code>.env</code> ফাইলে (এবং Vercel এর Environment Variables এ) <code>VITE_SUPABASE_URL</code> ও{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> যোগ করুন, তারপর আবার বিল্ড করুন।
        </p>
      </div>
    </Shell>
  );
}

function Login() {
  const logo = useBrandLogo();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res =
      mode === 'login'
        ? await supabase!.auth.signInWithPassword({ email, password })
        : await supabase!.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (res.error) {
      setMsg({ ok: false, text: res.error.message === 'Invalid login credentials' ? 'ইমেইল বা পাসওয়ার্ড ভুল' : res.error.message });
    } else if (mode === 'signup' && !res.data.session) {
      setMsg({ ok: true, text: 'অ্যাকাউন্ট তৈরি হয়েছে। ইমেইলে পাঠানো লিংকে ক্লিক করে ভেরিফাই করুন, তারপর লগইন করুন।' });
      setMode('login');
    }
  };

  return (
    <Shell>
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col items-center text-center pb-1">
          <img src={logo} alt="Sakib's World" width={84} height={84} className="w-[84px] h-[84px] object-contain drop-shadow-md" />
          <h1 className="mt-3">
            <BrandName size="lg" />
          </h1>
          <p className="text-[11px] text-[#15803D] font-semibold mt-1">প্রকৃতির বিশুদ্ধ স্বাদের বিশ্বস্ত ঠিকানা</p>
          <p className="text-xs text-gray-500 mt-3">
            অ্যাডমিন প্যানেল • {mode === 'login' ? 'লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
          </p>
        </div>
        <Field label="ইমেইল">
          <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="পাসওয়ার্ড" hint={mode === 'signup' ? 'কমপক্ষে ৬ অক্ষর' : undefined}>
          <Input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {msg && <p className={cx('text-xs font-semibold', msg.ok ? 'text-emerald-700' : 'text-red-600')}>{msg.text}</p>}
        <Button type="submit" loading={busy} className="w-full">
          {mode === 'login' ? 'লগইন' : 'অ্যাকাউন্ট তৈরি করুন'}
        </Button>
        <p className="text-xs text-center text-gray-500">
          {mode === 'login' ? 'অ্যাকাউন্ট নেই? ' : 'আগে থেকেই অ্যাকাউন্ট আছে? '}
          <button type="button" className="text-[#0B6B47] font-semibold cursor-pointer" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}
          </button>
        </p>
      </form>
    </Shell>
  );
}

export default function AdminApp() {
  if (!supabase) return <NotConfigured />;
  return (
    <ToastProvider>
      <AdminRoot />
    </ToastProvider>
  );
}

function AdminRoot() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [me, setMe] = useState<AdminUser | null | undefined>(undefined);
  const [err, setErr] = useState('');

  useEffect(() => {
    supabase!.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase!.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const email = session?.user.email;
  useEffect(() => {
    if (!email) {
      setMe(undefined);
      return;
    }
    (async () => {
      setErr('');
      const claim = await supabase!.rpc('claim_first_admin');
      if (claim.error) {
        setErr(errorMessage(claim.error));
        setMe(null);
        return;
      }
      const { data } = await supabase!.from('admin_users').select('*').ilike('email', email).maybeSingle();
      setMe((data as AdminUser) || null);
    })();
  }, [email]);

  if (session === undefined) return <Spinner />;
  if (!session) return <Login />;
  if (me === undefined) return <Spinner />;
  if (!me)
    return (
      <Shell>
        <div className="max-w-sm bg-white rounded-2xl border border-gray-200 p-6 text-center space-y-3">
          <h1 className="font-bold text-gray-900">অ্যাক্সেস নেই</h1>
          <p className="text-sm text-gray-600">
            <b>{email}</b> ইমেইলটিকে এখনো অ্যাডমিন হিসেবে যোগ করা হয়নি। মালিককে "ইউজার ও অনুমতি" থেকে আপনার ইমেইল যোগ করতে বলুন।
          </p>
          {err && <p className="text-xs text-red-600">{err}</p>}
          <Button variant="secondary" onClick={() => supabase!.auth.signOut()}>
            লগআউট
          </Button>
        </div>
      </Shell>
    );
  return <Layout me={me} />;
}

function Layout({ me }: { me: AdminUser }) {
  const logo = useBrandLogo();
  const [page, setPage] = useState(pageFromPath());
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search));
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [storeName, setStoreName] = useState('গ্রামের পণ্য');

  const can = useCallback((perm: string) => me.role === 'owner' || me.role === 'admin' || me.permissions.includes(perm), [me]);

  useEffect(() => {
    const onPop = () => {
      setPage(pageFromPath());
      setQuery(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', onPop);
    supabase!
      .from('settings')
      .select('value')
      .eq('key', 'settings')
      .maybeSingle()
      .then(({ data }) => data?.value?.name && setStoreName(data.value.name));
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = useCallback((p: string, q?: Record<string, string>) => {
    const qs = q ? `?${new URLSearchParams(q)}` : '';
    window.history.pushState(null, '', `/admin/${p}${qs}`);
    setPage(p);
    setQuery(new URLSearchParams(qs));
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const visibleGroups = NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => can(i.key)) })).filter((g) => g.items.length);
  const firstAllowed = visibleGroups[0]?.items[0]?.key;
  const activeKey = PAGES[page] && can(page) ? page : firstAllowed;
  const active = ALL_NAV.find((n) => n.key === activeKey);
  const Page = activeKey ? PAGES[activeKey] : null;

  const ctx = useMemo(() => ({ me, can, go, query, storeName, refreshKey }), [me, can, go, query, storeName, refreshKey]);

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <img src={logo} alt="" width={44} height={44} className="w-11 h-11 object-contain shrink-0" />
        <div className="min-w-0">
          <BrandName />
          <p className="text-[11px] text-gray-500 mt-1">অ্যাডমিন প্যানেল</p>
        </div>
        <button className="ml-auto lg:hidden p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => setMenuOpen(false)} aria-label="মেনু বন্ধ">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {visibleGroups.map((g) => (
          <div key={g.label}>
            <p className="px-2 mb-1 text-[11px] font-semibold text-gray-400">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map((it) => (
                <a
                  key={it.key}
                  href={`/admin/${it.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(it.key);
                  }}
                  className={cx(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                    it.key === activeKey ? 'bg-[#0B6B47] text-white font-semibold shadow-sm' : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <it.icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="truncate">{it.label}</span>
                </a>
              ))}
            </div>
          </div>
        ))}

        {can('new_order') && (
          <div className="rounded-2xl bg-gradient-to-br from-[#0B6B47] to-[#0E8A5C] p-4 text-center text-white">
            <div className="w-10 h-10 rounded-xl bg-[#FCD34D] text-[#3b2a00] grid place-items-center mx-auto mb-2">
              <Phone className="w-5 h-5" />
            </div>
            <p className="font-bold text-sm">ফোনে অর্ডার এসেছে?</p>
            <p className="text-[11px] text-emerald-100 mt-0.5 mb-3">কলে পাওয়া অর্ডার এখান থেকে বসান</p>
            <Button variant="yellow" className="w-full" onClick={() => go('new_order')}>
              নতুন অর্ডার <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </nav>

      <div className="border-t border-gray-100 px-3 py-3 space-y-0.5">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-100">
          <ExternalLink className="w-[18px] h-[18px]" /> সাইট দেখুন
        </a>
        <button
          onClick={() => supabase!.auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px]" /> লগআউট
        </button>
      </div>
    </div>
  );

  return (
    <AdminContext.Provider value={ctx}>
      <div className="min-h-screen bg-[#F5F7F6] text-gray-900 font-['Hind_Siliguri',sans-serif]">
        <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">{sidebar}</aside>
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMenuOpen(false)}>
            <aside className="w-72 max-w-[85vw] h-full bg-white" onClick={(e) => e.stopPropagation()}>
              {sidebar}
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => setMenuOpen(true)} aria-label="মেনু">
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-lg leading-tight truncate">{active?.title || 'অ্যাডমিন'}</h1>
              <p className="text-[11px] text-gray-500 truncate">
                {me.email} · {me.role === 'owner' ? 'মালিক' : me.role === 'admin' ? 'অ্যাডমিন' : 'স্টাফ'}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setRefreshKey((k) => k + 1)}>
              <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">রিফ্রেশ</span>
            </Button>
            <a
              href="/"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-[#0B6B47] hover:bg-emerald-100"
            >
              স্টোরে ফিরুন
            </a>
          </header>

          <main className="p-4 sm:p-6 max-w-[1600px]">
            {Page ? <Page key={`${activeKey}-${refreshKey}`} /> : <p className="text-sm text-gray-500">আপনার কোনো পেজের অনুমতি নেই।</p>}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
