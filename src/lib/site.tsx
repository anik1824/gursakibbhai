import React, { createContext, useContext, useEffect, useState } from 'react';
import { proxify, supabase } from './supabase';
import {
  DEFAULT_BANNERS,
  DEFAULT_CATEGORIES,
  DEFAULT_DELIVERY,
  DEFAULT_LANDING,
  DEFAULT_PACKAGES,
  DEFAULT_PRODUCTS,
  DEFAULT_REVIEWS,
  DEFAULT_STORE,
} from '../data/gurData';
import {
  Banner,
  Category,
  DeliverySettings,
  GurPackage,
  LandingContent,
  Product,
  Review,
  StoreSettings,
} from '../types';

export interface SiteData {
  store: StoreSettings;
  delivery: DeliverySettings;
  landing: LandingContent;
  categories: Category[];
  products: Product[];
  packages: GurPackage[];
  banners: Banner[];
  reviews: Review[];
  pixelId: string;
  gtmId: string;
  customCss: string;
  loading: boolean;
}

const initial: SiteData = {
  store: DEFAULT_STORE,
  delivery: DEFAULT_DELIVERY,
  landing: DEFAULT_LANDING,
  categories: DEFAULT_CATEGORIES,
  products: DEFAULT_PRODUCTS,
  packages: DEFAULT_PACKAGES,
  banners: DEFAULT_BANNERS,
  reviews: DEFAULT_REVIEWS,
  pixelId: '',
  gtmId: '',
  customCss: '',
  loading: !!supabase,
};

const SiteContext = createContext<SiteData>(initial);

export const useSite = () => useContext(SiteContext);

const merge = <T extends object>(base: T, override: unknown): T => {
  if (!override || typeof override !== 'object') return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    if (v === null || v === undefined || v === '') continue;
    const b = (base as Record<string, unknown>)[k];
    out[k] = b && typeof b === 'object' && !Array.isArray(b) && typeof v === 'object' && !Array.isArray(v) ? merge(b as object, v) : v;
  }
  return out as T;
};

export async function loadSiteData(): Promise<SiteData> {
  if (!supabase) return { ...initial, loading: false };
  const [settings, categories, products, packages, banners, reviews] = await Promise.all([
    supabase.from('settings').select('key,value'),
    supabase.from('categories').select('*').eq('active', true).order('sort'),
    supabase.from('products').select('*').eq('active', true).order('sort'),
    supabase.from('packages').select('*').eq('active', true).order('sort'),
    supabase.from('banners').select('*').eq('active', true).order('sort'),
    supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(30),
  ]);
  const s: Record<string, Record<string, unknown>> = {};
  settings.data?.forEach((r: { key: string; value: Record<string, unknown> }) => (s[r.key] = r.value));
  const num = (v: unknown, d: number) => (v === undefined || v === null || v === '' || isNaN(Number(v)) ? d : Number(v));
  const del = s.delivery || {};
  return proxify({
    store: merge(DEFAULT_STORE, s.settings),
    delivery: {
      inside_dhaka: num(del.inside_dhaka, DEFAULT_DELIVERY.inside_dhaka),
      outside_dhaka: num(del.outside_dhaka, DEFAULT_DELIVERY.outside_dhaka),
      free_min_kg: num(del.free_min_kg, DEFAULT_DELIVERY.free_min_kg),
      free_min_amount: num(del.free_min_amount, DEFAULT_DELIVERY.free_min_amount),
    },
    landing: merge(DEFAULT_LANDING, s.landing),
    categories: categories.error ? DEFAULT_CATEGORIES : categories.data ?? [],
    products: products.error ? DEFAULT_PRODUCTS : products.data ?? [],
    packages: packages.error ? DEFAULT_PACKAGES : packages.data ?? [],
    banners: banners.error || !banners.data?.length ? DEFAULT_BANNERS : banners.data,
    reviews: reviews.data ?? [],
    pixelId: String(s.pixel?.pixel_id ?? '').trim(),
    gtmId: String(s.gtm?.container_id ?? '').trim(),
    customCss: String(s.css?.css ?? ''),
    loading: false,
  });
}

function applyTheme(data: SiteData) {
  const root = document.documentElement.style;
  const c = data.store.colors;
  root.setProperty('--c-primary', c.primary);
  root.setProperty('--c-secondary', c.secondary);
  root.setProperty('--c-accent', c.accent);
  root.setProperty('--c-bg', c.background);

  let style = document.getElementById('custom-css') as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = 'custom-css';
    document.head.appendChild(style);
  }
  style.textContent = data.customCss;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    dataLayer?: unknown[];
  }
}

function injectTracking(pixelId: string, gtmId: string) {
  if (pixelId && /^\d{5,20}$/.test(pixelId) && !window.fbq) {
    /* eslint-disable */
    (function (f: any, b: Document, e: string, v: string) {
      if (f.fbq) return;
      const n: any = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true; t.src = v;
      b.head.appendChild(t);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq!('init', pixelId);
    window.fbq!('track', 'PageView');
  }
  if (gtmId && /^GTM-[A-Z0-9]+$/i.test(gtmId) && !document.getElementById('gtm-script')) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.id = 'gtm-script';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    document.head.appendChild(s);
  }
}

export function trackPurchase(order: { order_number: string; total: number; items: { id: string; quantity: number }[] }) {
  window.fbq?.('track', 'Purchase', {
    value: order.total,
    currency: 'BDT',
    content_ids: order.items.map((i) => i.id),
    content_type: 'product',
    num_items: order.items.reduce((s, i) => s + i.quantity, 0),
  }, { eventID: order.order_number });
  window.dataLayer?.push({
    event: 'purchase',
    ecommerce: { transaction_id: order.order_number, value: order.total, currency: 'BDT' },
  });
}

export function trackInitiateCheckout() {
  window.fbq?.('track', 'InitiateCheckout');
  window.dataLayer?.push({ event: 'begin_checkout' });
}

export const SiteProvider: React.FC<{ children: React.ReactNode; tracking?: boolean }> = ({ children, tracking = true }) => {
  const [data, setData] = useState<SiteData>(initial);

  useEffect(() => {
    let alive = true;
    loadSiteData()
      .then((d) => alive && setData(d))
      .catch(() => alive && setData((p) => ({ ...p, loading: false })));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    applyTheme(data);
    if (tracking && !data.loading) injectTracking(data.pixelId, data.gtmId);
  }, [data, tracking]);

  return <SiteContext.Provider value={data}>{children}</SiteContext.Provider>;
};
