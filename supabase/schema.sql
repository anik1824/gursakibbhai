-- গ্রামের পণ্য — Supabase schema
-- Supabase Dashboard → SQL Editor এ পুরো ফাইলটি পেস্ট করে Run করুন। একাধিকবার চালালেও সমস্যা নেই।

create extension if not exists pgcrypto;

-- ============ TABLES ============

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  role text not null default 'staff' check (role in ('owner','admin','staff')),
  permissions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.private_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key default ('p-' || substr(md5(random()::text), 1, 8)),
  name text not null,
  weight_label text not null default '',
  weight_kg numeric not null default 1,
  price numeric not null check (price >= 0),
  original_price numeric,
  image_url text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  is_default_selected boolean not null default false,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.packages (
  id text primary key default ('k-' || substr(md5(random()::text), 1, 8)),
  name text not null,
  subtitle text not null default '',
  weight_label text not null default '',
  weight_kg numeric not null default 1,
  original_price numeric not null default 0,
  discount_price numeric not null check (discount_price >= 0),
  is_popular boolean not null default false,
  is_free_delivery boolean not null default false,
  features text[] not null default '{}',
  image_url text not null default '',
  badge text,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text,
  subtitle text,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  rating int not null default 5 check (rating between 1 and 5),
  comment text not null,
  package_bought text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.gen_order_number() returns text
language sql volatile set search_path = public as $$
  select coalesce(nullif((select value->>'order_prefix' from public.settings where key = 'settings'), ''), 'GP')
    || '-' || to_char(now() at time zone 'Asia/Dhaka', 'YYMMDD')
    || '-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default public.gen_order_number(),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  delivery_area text not null default 'inside_dhaka' check (delivery_area in ('inside_dhaka','outside_dhaka')),
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  delivery_fee numeric not null default 0,
  discount numeric not null default 0,
  total numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  source text not null default 'web' check (source in ('web','call')),
  note text,
  admin_note text,
  courier jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_phone_idx on public.orders (customer_phone);

create table if not exists public.incomplete_orders (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  customer_name text,
  customer_phone text,
  customer_address text,
  items jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ PERMISSION HELPERS ============

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.has_perm(p text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and (role in ('owner','admin') or p = any(permissions))
  );
$$;

-- প্রথম লগইন করা ইউজার স্বয়ংক্রিয়ভাবে owner হবে (যদি এখনো কোনো অ্যাডমিন না থাকে)
create or replace function public.claim_first_admin() returns boolean
language plpgsql security definer set search_path = public as $$
declare v_email text := auth.jwt() ->> 'email';
begin
  if v_email is null then return false; end if;
  lock table public.admin_users in exclusive mode;
  if exists (select 1 from public.admin_users) then
    return public.is_admin();
  end if;
  perform set_config('app.bootstrap', '1', true);
  insert into public.admin_users (email, role) values (lower(v_email), 'owner');
  return true;
end $$;

-- শুধু মালিক (owner) অন্য কাউকে owner বানাতে বা owner কে বদলাতে/মুছতে পারবেন
create or replace function public.guard_admin_users() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_is_owner boolean;
begin
  if auth.uid() is null or current_setting('app.bootstrap', true) = '1' then
    return coalesce(new, old);
  end if;
  v_is_owner := exists (select 1 from public.admin_users where lower(email) = v_email and role = 'owner');
  if ((tg_op <> 'INSERT' and old.role = 'owner') or (tg_op <> 'DELETE' and new.role = 'owner')) and not v_is_owner then
    raise exception 'শুধু মালিক এই পরিবর্তন করতে পারেন';
  end if;
  if tg_op <> 'INSERT' and lower(old.email) = v_email then
    raise exception 'নিজের অ্যাকাউন্ট নিজে পরিবর্তন বা মুছতে পারবেন না';
  end if;
  return coalesce(new, old);
end $$;

drop trigger if exists admin_users_guard on public.admin_users;
create trigger admin_users_guard before insert or update or delete on public.admin_users
  for each row execute function public.guard_admin_users();

-- কুরিয়ার API key শুধু অর্ডার/কুরিয়ার অনুমতিপ্রাপ্তরা সার্ভার ফাংশনের মাধ্যমে পায়
create or replace function public.get_courier_credentials() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not (public.has_perm('orders') or public.has_perm('courier')) then
    raise exception 'অনুমতি নেই';
  end if;
  return coalesce((select value from public.private_settings where key = 'courier'), '{}'::jsonb);
end $$;

-- ============ RLS ============

alter table public.admin_users enable row level security;
alter table public.settings enable row level security;
alter table public.private_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.packages enable row level security;
alter table public.banners enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;
alter table public.incomplete_orders enable row level security;

drop policy if exists admin_users_read on public.admin_users;
create policy admin_users_read on public.admin_users for select to authenticated using (public.is_admin());
drop policy if exists admin_users_write on public.admin_users;
create policy admin_users_write on public.admin_users for all to authenticated
  using (public.has_perm('users')) with check (public.has_perm('users'));

drop policy if exists settings_read on public.settings;
create policy settings_read on public.settings for select using (key <> 'fraud' or public.is_admin());
drop policy if exists settings_write on public.settings;
create policy settings_write on public.settings for all to authenticated
  using (public.has_perm(key)) with check (public.has_perm(key));

drop policy if exists private_settings_all on public.private_settings;
create policy private_settings_all on public.private_settings for all to authenticated
  using (public.has_perm(key)) with check (public.has_perm(key));

drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select using (active or public.is_admin());
drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories for all to authenticated
  using (public.has_perm('categories')) with check (public.has_perm('categories'));

drop policy if exists products_read on public.products;
create policy products_read on public.products for select using (active or public.is_admin());
drop policy if exists products_write on public.products;
create policy products_write on public.products for all to authenticated
  using (public.has_perm('products')) with check (public.has_perm('products'));

drop policy if exists packages_read on public.packages;
create policy packages_read on public.packages for select using (active or public.is_admin());
drop policy if exists packages_write on public.packages;
create policy packages_write on public.packages for all to authenticated
  using (public.has_perm('combos')) with check (public.has_perm('combos'));

drop policy if exists banners_read on public.banners;
create policy banners_read on public.banners for select using (active or public.is_admin());
drop policy if exists banners_write on public.banners;
create policy banners_write on public.banners for all to authenticated
  using (public.has_perm('banners')) with check (public.has_perm('banners'));

drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews for select using (approved or public.is_admin());
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews for insert to anon, authenticated
  with check (approved = false or public.has_perm('reviews'));
drop policy if exists reviews_modify on public.reviews;
create policy reviews_modify on public.reviews for update to authenticated
  using (public.has_perm('reviews')) with check (public.has_perm('reviews'));
drop policy if exists reviews_delete on public.reviews;
create policy reviews_delete on public.reviews for delete to authenticated using (public.has_perm('reviews'));

drop policy if exists orders_read on public.orders;
create policy orders_read on public.orders for select to authenticated
  using (public.has_perm('orders') or public.has_perm('dashboard') or public.has_perm('new_order'));
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders for insert to authenticated
  with check (public.has_perm('new_order') or public.has_perm('orders'));
drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders for update to authenticated
  using (public.has_perm('orders')) with check (public.has_perm('orders'));
drop policy if exists orders_delete on public.orders;
create policy orders_delete on public.orders for delete to authenticated using (public.has_perm('orders'));

drop policy if exists incomplete_read on public.incomplete_orders;
create policy incomplete_read on public.incomplete_orders for select to authenticated
  using (public.has_perm('incomplete') or public.has_perm('dashboard'));
drop policy if exists incomplete_delete on public.incomplete_orders;
create policy incomplete_delete on public.incomplete_orders for delete to authenticated
  using (public.has_perm('incomplete'));

-- ============ PUBLIC RPCs ============

create or replace function public.normalize_phone(p text) returns text
language sql immutable as $$
  select regexp_replace(
    regexp_replace(translate(coalesce(p, ''), '০১২৩৪৫৬৭৮৯', '0123456789'), '[^0-9]', '', 'g'),
    '^880?', '0');
$$;

-- ওয়েবসাইট থেকে অর্ডার: দাম, ডেলিভারি চার্জ ও ফেক-অর্ডার চেক সব সার্ভারে হিসাব হয়
create or replace function public.place_order(payload jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_name text := left(trim(coalesce(payload ->> 'name', '')), 120);
  v_phone text := public.normalize_phone(payload ->> 'phone');
  v_addr text := left(trim(coalesce(payload ->> 'address', '')), 500);
  v_area text := coalesce(payload ->> 'delivery_area', 'inside_dhaka');
  v_note text := nullif(left(trim(coalesce(payload ->> 'note', '')), 500), '');
  v_items jsonb := '[]'::jsonb;
  it jsonb;
  v_qty int;
  r record;
  v_sub numeric := 0;
  v_kg numeric := 0;
  v_free boolean := false;
  v_del jsonb;
  v_fraud jsonb;
  v_fee numeric;
  v_count int;
  v_order public.orders;
begin
  if length(v_name) < 2 then raise exception 'অনুগ্রহ করে আপনার নাম লিখুন'; end if;
  if v_phone !~ '^01[3-9][0-9]{8}$' then raise exception 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন'; end if;
  if v_area not in ('inside_dhaka', 'outside_dhaka') then v_area := 'outside_dhaka'; end if;

  select value into v_fraud from public.settings where key = 'fraud';
  if coalesce((v_fraud ->> 'enabled')::boolean, false) then
    if v_phone = any (array(select public.normalize_phone(x) from jsonb_array_elements_text(coalesce(v_fraud -> 'blocked_phones', '[]'::jsonb)) x)) then
      raise exception '%', coalesce(nullif(v_fraud ->> 'block_message', ''), 'এই নম্বর থেকে অনলাইনে অর্ডার নেওয়া সম্ভব নয়। অনুগ্রহ করে কল করুন।');
    end if;
    if coalesce((v_fraud ->> 'max_orders_per_day')::int, 0) > 0 then
      select count(*) into v_count from public.orders
        where customer_phone = v_phone and created_at > now() - interval '24 hours';
      if v_count >= (v_fraud ->> 'max_orders_per_day')::int then
        raise exception 'এই নম্বর থেকে আজ ইতিমধ্যে অর্ডার করা হয়েছে। নতুন অর্ডারের জন্য অনুগ্রহ করে কল করুন।';
      end if;
    end if;
    if length(v_addr) < coalesce((v_fraud ->> 'min_address_length')::int, 8) then
      raise exception 'বাসা নং, রোড, থানা ও জেলাসহ বিস্তারিত ঠিকানা দিন';
    end if;
  elsif length(v_addr) < 8 then
    raise exception 'বাসা নং, রোড, থানা ও জেলাসহ বিস্তারিত ঠিকানা দিন';
  end if;

  for it in select * from jsonb_array_elements(coalesce(payload -> 'items', '[]'::jsonb)) loop
    v_qty := greatest(1, least(99, coalesce((it ->> 'quantity')::int, 1)));
    if it ->> 'kind' = 'package' then
      select id, name, discount_price as price, weight_kg, image_url, is_free_delivery as free
        into r from public.packages where id = it ->> 'id' and active;
    else
      select id, name, price, weight_kg, image_url, false as free
        into r from public.products where id = it ->> 'id' and active;
    end if;
    if not found then raise exception 'একটি পণ্য এখন আর পাওয়া যাচ্ছে না, পেজটি রিফ্রেশ করুন'; end if;
    v_items := v_items || jsonb_build_object(
      'kind', coalesce(it ->> 'kind', 'product'), 'id', r.id, 'name', r.name,
      'price', r.price, 'quantity', v_qty, 'weight_kg', r.weight_kg, 'image', r.image_url);
    v_sub := v_sub + r.price * v_qty;
    v_kg := v_kg + r.weight_kg * v_qty;
    v_free := v_free or r.free;
  end loop;
  if jsonb_array_length(v_items) = 0 then raise exception 'অনুগ্রহ করে কমপক্ষে একটি পণ্য সিলেক্ট করুন'; end if;

  select value into v_del from public.settings where key = 'delivery';
  v_fee := case when v_area = 'inside_dhaka'
    then coalesce((v_del ->> 'inside_dhaka')::numeric, 70)
    else coalesce((v_del ->> 'outside_dhaka')::numeric, 130) end;
  if v_free
     or (coalesce((v_del ->> 'free_min_kg')::numeric, 0) > 0 and v_kg >= (v_del ->> 'free_min_kg')::numeric)
     or (coalesce((v_del ->> 'free_min_amount')::numeric, 0) > 0 and v_sub >= (v_del ->> 'free_min_amount')::numeric) then
    v_fee := 0;
  end if;

  insert into public.orders (customer_name, customer_phone, customer_address, delivery_area, items, subtotal, delivery_fee, total, note, source)
  values (v_name, v_phone, v_addr, v_area, v_items, v_sub, v_fee, v_sub + v_fee, v_note, 'web')
  returning * into v_order;

  if coalesce(payload ->> 'session_id', '') <> '' then
    delete from public.incomplete_orders where session_id = payload ->> 'session_id';
  end if;

  return to_jsonb(v_order);
end $$;

-- কাস্টমার ফর্ম পূরণ শুরু করলে অসম্পূর্ণ অর্ডার হিসেবে সেভ হয়
create or replace function public.save_incomplete_order(payload jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_phone text := public.normalize_phone(payload ->> 'phone');
begin
  if coalesce(payload ->> 'session_id', '') = '' or length(v_phone) < 6 then return; end if;
  insert into public.incomplete_orders (session_id, customer_name, customer_phone, customer_address, items, total, updated_at)
  values (
    left(payload ->> 'session_id', 64),
    left(payload ->> 'name', 120),
    left(v_phone, 20),
    left(payload ->> 'address', 500),
    case when jsonb_typeof(payload -> 'items') = 'array' and jsonb_array_length(payload -> 'items') <= 30 then payload -> 'items' else '[]'::jsonb end,
    coalesce((payload ->> 'total')::numeric, 0),
    now())
  on conflict (session_id) do update set
    customer_name = excluded.customer_name,
    customer_phone = excluded.customer_phone,
    customer_address = excluded.customer_address,
    items = excluded.items,
    total = excluded.total,
    updated_at = now();
end $$;

grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.save_incomplete_order(jsonb) to anon, authenticated;
grant execute on function public.claim_first_admin() to authenticated;
grant execute on function public.get_courier_credentials() to authenticated;
revoke execute on function public.get_courier_credentials() from anon;

-- ============ STORAGE (ছবি আপলোড) ============

insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_read on storage.objects;
create policy media_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists media_insert on storage.objects;
create policy media_insert on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists media_update on storage.objects;
create policy media_update on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists media_delete on storage.objects;
create policy media_delete on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ============ SEED DATA ============

insert into public.settings (key, value) values
  ('settings', '{"name":"গ্রামের পণ্য","tagline":"যশোরের খাঁটি ও ঐতিহ্যবাহী খেজুরের গুড়","phone":"01580-946990","whatsapp":"8801580946990","address":"বাঘারপাড়া, যশোর, বাংলাদেশ","logo_emoji":"🌴","logo_url":"","order_prefix":"GP","colors":{"primary":"#78350F","secondary":"#92400E","accent":"#B45309","background":"#FBF4E8"}}'),
  ('delivery', '{"inside_dhaka":70,"outside_dhaka":130,"free_min_kg":2,"free_min_amount":0}'),
  ('fraud', '{"enabled":true,"max_orders_per_day":3,"min_address_length":8,"blocked_phones":[],"block_message":""}'),
  ('pixel', '{"pixel_id":""}'),
  ('gtm', '{"container_id":""}'),
  ('css', '{"css":""}'),
  ('landing', '{}')
on conflict (key) do nothing;

insert into public.private_settings (key, value) values ('courier', '{"api_key":"","secret_key":""}')
on conflict (key) do nothing;

insert into public.categories (id, name, sort) values
  ('00000000-0000-0000-0000-000000000001', 'পাটালি গুড়', 1),
  ('00000000-0000-0000-0000-000000000002', 'ঝোলা ও লিকুইড গুড়', 2),
  ('00000000-0000-0000-0000-000000000003', 'স্পেশাল গুড়', 3)
on conflict (id) do nothing;

insert into public.products (id, name, weight_label, weight_kg, price, image_url, category_id, is_default_selected, sort) values
  ('jhola-1kg', '১ কেজি ঝোলা গুড়', '১ কেজি', 1, 330, '/images/jhola_gur_jar_1794507048040.jpg', '00000000-0000-0000-0000-000000000002', false, 1),
  ('foil-patali-1kg', '১ কেজি ফয়েল পাটলি গুড়', '১ কেজি', 1, 380, '/images/foil_patali_gur_1794507048093.jpg', '00000000-0000-0000-0000-000000000001', false, 2),
  ('danadar-1kg', '১ কেজি দানাদার গুড়', '১ কেজি', 1, 360, '/images/danadar_gur_1794507069082.jpg', '00000000-0000-0000-0000-000000000003', false, 3),
  ('gol-patali-1kg', '১ কেজি গোল পাটালি গুড়', '১ কেজি', 1, 350, '/images/gol_patali_gur_1794507048802.jpg', '00000000-0000-0000-0000-000000000001', true, 4),
  ('chocolate-1kg', '১ কেজি চকলেট গুড়', '১ কেজি', 1, 550, '/images/chocolate_gur_1794507069477.jpg', '00000000-0000-0000-0000-000000000003', false, 5),
  ('liquid-2kg', '২ কেজি লিকুইড গুড়', '২ কেজি', 2, 700, '/images/liquid_gur_2kg_1794507070762.jpg', '00000000-0000-0000-0000-000000000002', false, 6)
on conflict (id) do nothing;

insert into public.packages (id, name, subtitle, weight_label, weight_kg, original_price, discount_price, is_popular, is_free_delivery, features, image_url, badge, sort) values
  ('patali-1kg', '১ কেজি প্রিমিয়াম দানাদার পাটালি গুড়', 'মুখে দিলে মোমের মতো গলে যাওয়া খাঁটি স্বাদের পাটালি', '১ কেজি', 1, 750, 650, false, false,
    array['১০০% প্রাকৃতিক খেজুরের রসে তৈরি','চিনি ও কেমিক্যাল মুক্ত গ্যারান্টি','মন মাতানো প্রাকৃতিক সুবাস','ফুড গ্রেড ও ইকো-ফ্রেন্ডলি কলাপাতা প্যাকেজিং'],
    '/images/jessore_gur_hero_1794499057825.jpg', 'সেরা স্বাদ', 1),
  ('jhola-pack-1kg', '১ কেজি স্পেশাল ঝোলা গুড় (নালী গুড়)', 'চিতই ও ভাপা পিঠা খাওয়ার জন্য অমৃতসম খাঁটি ঝোলা', '১ কেজি', 1, 700, 600, false, false,
    array['ঘন, মিষ্টি ও গাঢ় সোনালী রঙের আসল ঝোলা','কোনো কৃত্রিম সুগন্ধি বা কালার নেই','হাঁড়ি থেকে ঢেলে সরাসরি পিঠায় খাওয়ার উপযুক্ত','নিরাপদ স্পিল-প্রুফ পাত্রে ডেলিভারি'],
    '/images/pitha_with_gur_1794499057924.jpg', 'পিঠার সেরা সঙ্গী', 2),
  ('combo-2kg', '২ কেজি স্পেশাল কম্বো প্যাক (পাটালি + ঝোলা)', '১ কেজি দানাদার পাটালি + ১ কেজি খাঁটি ঝোলা গুড়', '২ কেজি (১+১)', 2, 1450, 1200, true, true,
    array['১ কেজি খাঁটি পাটালি + ১ কেজি সুস্বাদু ঝোলা','সারা দেশে হোম ডেলিভারি সম্পূর্ণ ফ্রি!','প্যাকেজে সরাসরি ২৫০ টাকা সাশ্রয়','শীতের পিঠা উৎসবের পরিপূর্ণ সমাধান'],
    '/images/packaging_presentation_1794499076581.jpg', 'সবচেয়ে জনপ্রিয় ⭐', 3),
  ('patali-2kg', '২ কেজি প্রিমিয়াম পাটালি গুড় প্যাক', 'পরিবারের মিষ্টি ও পিঠা তৈরির জন্য ভরপুর স্টক', '২ কেজি', 2, 1500, 1250, false, true,
    array['সম্পূর্ণ দানাদার সুস্বাদু পাটালি গুড়','সারা দেশে হোম ডেলিভারি ফ্রি','দীর্ঘদিন সংরক্ষণ উপযোগী','২৫০ টাকা নগদ সাশ্রয়'],
    '/images/jessore_gur_hero_1794499057825.jpg', 'ফ্রি ডেলিভারি', 4),
  ('mega-3kg', '৩ কেজি মেগা ফ্যামিলি ধামাকা প্যাক', '২ কেজি পাটালি + ১ কেজি ঝোলা গুড় (মেগা সেভার)', '৩ কেজি', 3, 2200, 1750, false, true,
    array['২ কেজি দানাদার পাটালি + ১ কেজি প্রিমিয়াম ঝোলা','সারা দেশে ফ্রি হোম ডেলিভারি','সরাসরি ৪৫০ টাকা অবিশ্বাস্য ছাড়!','স্পেশাল প্রিমিয়াম গিফট বক্স প্যাকিং'],
    '/images/packaging_presentation_1794499076581.jpg', 'মেগা সেভার 💥', 5)
on conflict (id) do nothing;

insert into public.banners (image_url, title, subtitle, sort)
select '/images/jessore_gur_hero_1794499057825.jpg', 'যশোরের বিখ্যাত পাটালি ও ঝোলা', '১০০% খাঁটি ও নির্ভেজাল খেজুরের গুড়', 1
where not exists (select 1 from public.banners);

insert into public.reviews (name, location, rating, comment, package_bought, approved, created_at)
select * from (values
  ('ফারহানা ইসলাম তমা', 'ধানমন্ডি, ঢাকা', 5, 'যশোরের গুড়ের আসল স্বাদটা পেয়ে মন ভরে গেল! প্যাকেজটা খোলার সাথে সাথে ঘরজুড়ে খেজুরের রসের মিষ্টি গন্ধ ছড়িয়ে পড়েছিল। চিতই পিঠা দিয়ে ঝোলা গুড় খেয়ে বাসার সবাই মুগ্ধ।', '২ কেজি স্পেশাল কম্বো প্যাক', true, now() - interval '2 days'),
  ('মোহাম্মদ রফিকুল আলম', 'জিইসি মোড়, চট্টগ্রাম', 5, 'গ্রামের পণ্যের গুড় খেয়ে মনে হলো ছোটবেলায় নানার বাড়িতে যে গুড় খেতাম সেই আসল স্বাদ। মিষ্টিটা অত্যন্ত সুষম, মুখে দিলে একদম মিশে যায়।', '১ কেজি প্রিমিয়াম পাটালি গুড়', true, now() - interval '4 days'),
  ('তানজিনা আক্তার সুমি', 'উত্তরা, ঢাকা', 5, 'পায়েসের জন্য পাটালি গুড় নিয়েছিলাম। কোনো দুধ ফাটেনি, চমৎকার সোনালী রঙ হয়েছে আর অসম্ভব সুন্দর ঘ্রাণ।', '২ কেজি স্পেশাল কম্বো প্যাক', true, now() - interval '7 days'),
  ('মাহমুদুল হাসান', 'উপশহর, সিলেট', 5, 'প্যাকেজিং খুবই মজবুত ও প্রিমিয়াম ছিল। ডেলিভারি খুবই দ্রুত পেয়েছি। আবার অর্ডার করব ইনশাআল্লাহ।', '৩ কেজি মেগা ফ্যামিলি প্যাক', true, now() - interval '8 days')
) v(name, location, rating, comment, package_bought, approved, created_at)
where not exists (select 1 from public.reviews);
