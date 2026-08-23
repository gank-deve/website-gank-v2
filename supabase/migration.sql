-- ============================================================
-- GANK. — Skema Database Supabase
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Tabel profil user internal -------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'teknisi' check (role in ('admin', 'teknisi')),
  created_at timestamptz not null default now()
);

-- 2. Jenis kerusakan ------------------------------------------
create table if not exists public.damage_types (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

-- 3. Order servis ---------------------------------------------
create table if not exists public.service_orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_name text not null,
  customer_phone text not null,
  device_brand text not null default '',
  device_model text not null,
  imei text not null default '',
  complaint text not null default '',
  damage_type_id bigint references public.damage_types(id),
  status text not null default 'masuk'
    check (status in ('masuk','diperiksa','menunggu_acc','proses','selesai','diambil','batal')),
  estimated_cost numeric(12,2) not null default 0,
  final_cost numeric(12,2),
  technician_note text not null default '',
  technician_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_service_orders_code on public.service_orders (code);
create index if not exists idx_service_orders_status on public.service_orders (status);
create index if not exists idx_service_orders_created on public.service_orders (created_at desc);

-- 4. Checklist fungsional (awal & akhir) ----------------------
create table if not exists public.service_checklists (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.service_orders(id) on delete cascade,
  phase text not null check (phase in ('awal', 'akhir')),
  item_key text not null,
  passed boolean not null default false,
  note text not null default '',
  checked_by uuid references auth.users(id),
  checked_at timestamptz not null default now(),
  unique (order_id, phase, item_key)
);

-- 5. Riwayat status order -------------------------------------
create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.service_orders(id) on delete cascade,
  status text not null,
  note text not null default '',
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_history_order on public.order_status_history (order_id, created_at);

-- 6. Stok HP bekas (katalog publik) ---------------------------
create table if not exists public.phone_listings (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  storage text not null default '',
  ram text not null default '',
  color text not null default '',
  condition_grade text not null default 'baik'
    check (condition_grade in ('mulus','baik','layak')),
  price numeric(12,2) not null,
  description text not null default '',
  photos text[] not null default '{}',
  status text not null default 'available' check (status in ('available','sold','hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_listings_status on public.phone_listings (status, price);

-- 7. Log notifikasi WhatsApp ----------------------------------
create table if not exists public.notification_logs (
  id bigint generated always as identity primary key,
  order_id uuid references public.service_orders(id) on delete cascade,
  channel text not null default 'whatsapp',
  destination text not null,
  template text not null default '',
  status text not null check (status in ('sent','failed','skipped')),
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notif_order on public.notification_logs (order_id, created_at desc);

-- ============================================================
-- TRIGGER & FUNGSI
-- ============================================================

-- Auto-create profile saat user baru mendaftar lewat Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'teknisi')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Generator kode order: GANK-SVC-YYMM-XXXX
create or replace function public.generate_order_code()
returns text
language sql
as $$
  select 'GANK-SVC-' ||
    to_char(now(), 'FMyymm') || '-' ||
    upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4))
$$;

-- Guard: status 'selesai' WAJIB melewati checklist akhir lengkap.
-- Ini lapisan validasi terakhir di level database.
create or replace function public.guard_completion_checklist()
returns trigger
language plpgsql
as $$
declare
  total_items constant int := 12; -- harus sama dengan CHECKLIST_ITEMS di aplikasi
  filled int;
begin
  if lower(new.status) = 'selesai' and lower(coalesce(old.status, '')) is distinct from 'selesai' then
    select count(*) into filled
    from public.service_checklists
    where order_id = new.id and phase = 'akhir';

    if filled < total_items then
      raise exception
        'Checklist fungsional akhir belum lengkap (%/%). Isi checklist terlebih dahulu sebelum menandai selesai.',
        filled, total_items;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_completion on public.service_orders;
create trigger trg_guard_completion
  before update of status on public.service_orders
  for each row execute function public.guard_completion_checklist();

-- Set completed_at otomatis saat masuk status selesai
create or replace function public.set_completed_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'selesai' and old.status is distinct from 'selesai' then
    new.completed_at := now();
  end if;
  if new.status = 'diambil' and old.status is distinct from 'diambil' then
    new.completed_at := coalesce(new.completed_at, old.completed_at);
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_set_completed on public.service_orders;
create trigger trg_set_completed
  before update on public.service_orders
  for each row execute function public.set_completed_at();

-- Fungsi tracking publik (aman untuk anonim): hanya kolom terbatas
create or replace function public.track_order(p_code text)
returns table (
  code text,
  device_model text,
  status text,
  estimated_cost numeric,
  final_cost numeric,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer set search_path = public
stable
as $$
  select code, device_model, status, estimated_cost, final_cost, created_at, updated_at
  from public.service_orders
  where upper(code) = upper(trim(p_code))
  limit 1;
$$;

create or replace function public.track_order_history(p_code text)
returns table (status text, created_at timestamptz)
language sql
security definer set search_path = public
stable
as $$
  select h.status, h.created_at
  from public.order_status_history h
  join public.service_orders o on o.id = h.order_id
  where upper(o.code) = upper(trim(p_code))
  order by h.created_at asc;
$$;

grant execute on function public.track_order(text) to anon, authenticated;
grant execute on function public.track_order_history(text) to anon, authenticated;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.damage_types enable row level security;
alter table public.service_orders enable row level security;
alter table public.service_checklists enable row level security;
alter table public.order_status_history enable row level security;
alter table public.phone_listings enable row level security;
alter table public.notification_logs enable row level security;

-- Helper: apakah user saat ini internal dengan role tertentu?
create or replace function public.is_internal(required_role text default null)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (required_role is null or p.role = required_role)
  );
$$;

-- profiles: user hanya boleh lihat profil sendiri; admin lihat semua
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (id = auth.uid() or public.is_internal('admin'));

drop policy if exists "admin manages profiles" on public.profiles;
create policy "admin manages profiles" on public.profiles
  for all using (public.is_internal('admin'));

-- damage_types: baca semua yang login; tulis admin
drop policy if exists "internal reads damage types" on public.damage_types;
create policy "internal reads damage types" on public.damage_types
  for select to authenticated using (true);

drop policy if exists "admin writes damage types" on public.damage_types;
create policy "admin writes damage types" on public.damage_types
  for all to authenticated using (public.is_internal('admin'));

-- service_orders: hanya internal
drop policy if exists "internal full access orders" on public.service_orders;
create policy "internal full access orders" on public.service_orders
  for all to authenticated using (public.is_internal()) with check (public.is_internal());

-- service_checklists: hanya internal
drop policy if exists "internal full access checklists" on public.service_checklists;
create policy "internal full access checklists" on public.service_checklists
  for all to authenticated using (public.is_internal()) with check (public.is_internal());

-- order_status_history: internal read; insert via server action
drop policy if exists "internal reads history" on public.order_status_history;
create policy "internal reads history" on public.order_status_history
  for select to authenticated using (public.is_internal());

drop policy if exists "internal inserts history" on public.order_status_history;
create policy "internal inserts history" on public.order_status_history
  for insert to authenticated with check (public.is_internal());

-- phone_listings: publik bisa baca yang available; admin kelola penuh
drop policy if exists "public reads available listings" on public.phone_listings;
create policy "public reads available listings" on public.phone_listings
  for select using (status = 'available');

drop policy if exists "internal reads all listings" on public.phone_listings;
create policy "internal reads all listings" on public.phone_listings
  for select to authenticated using (public.is_internal());

drop policy if exists "admin writes listings" on public.phone_listings;
create policy "admin writes listings" on public.phone_listings
  for all to authenticated using (public.is_internal('admin')) with check (public.is_internal('admin'));

-- notification_logs: internal read + insert (dari server action); admin retry/read semua
drop policy if exists "internal reads notifications" on public.notification_logs;
create policy "internal reads notifications" on public.notification_logs
  for select to authenticated using (public.is_internal());

drop policy if exists "internal inserts notifications" on public.notification_logs;
create policy "internal inserts notifications" on public.notification_logs
  for insert to authenticated with check (public.is_internal());

-- ============================================================
-- SEED DATA
-- ============================================================

insert into public.damage_types (name) values
  ('Layar Pecah'),
  ('Baterai Drop / Mati Total'),
  ('Kerusakan Software / Bootloop'),
  ('Kena Air / Liquid Damage'),
  ('Charging Port Rusak'),
  ('Speaker / Mic Rusak'),
  ('Kamera Rusak'),
  ('Lainnya')
on conflict (name) do nothing;

insert into public.phone_listings (brand, model, storage, ram, color, condition_grade, price, description, status) values
  ('iPhone', '13 128GB', '128 GB', '4 GB', 'Midnight', 'mulus', 6499000, 'Fullset, iBox, health battery 92%. Mulus seperti baru.', 'available'),
  ('Samsung', 'Galaxy S22 5G', '256 GB', '8 GB', 'Phantom Black', 'baik', 5750000, 'Minyel tipis di bezel, layar mulus. Lengkap charger ori.', 'available'),
  ('Xiaomi', 'Redmi Note 12 Pro', '256 GB', '8 GB', 'Arctic White', 'mulus', 2350000, 'Pemakaian pribadi, masih garansi distributor.', 'available'),
  ('iPhone', '11 64GB', '64 GB', '4 GB', 'Purple', 'layak', 3450000, 'Baterai 85%, kondisi normal semua fungsi.', 'available'),
  ('OPPO', 'Reno8 5G', '256 GB', '8 GB', 'Shimmer Black', 'baik', 3100000, 'Layar amoled mulus, bodi minim bekas.', 'available'),
  ('Samsung', 'Galaxy A54 5G', '128 GB', '8 GB', 'Awesome Lime', 'mulus', 2999000, 'Like new, fullset dus dan aksesori.', 'available')
on conflict do nothing;

-- ============================================================
-- (OPSIONAL) Buat user admin pertama — HANYA JIKA BELUM ADA USER.
-- Ganti email & password sesuai kebutuhan, lalu jalankan sekali:
--
--   insert into auth.users (
--     instance_id, id, aud, role, email, encrypted_password,
--     email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
--     created_at, updated_at, confirmation_token, recovery_token
--   ) values (
--     '00000000-0000-0000-0000-000000000000',
--     gen_random_uuid(),
--     'authenticated', 'authenticated',
--     'admin@gank.id',
--     crypt('GankAdmin123!', gen_salt('bf')),
--     now(),
--     '{"provider":"email","providers":["email"]}',
--     '{"full_name":"Admin GANK","role":"admin"}',
--     now(), now(), '', ''
--   );
--
-- Trigger handle_new_user akan otomatis membuat baris profiles
-- dengan role admin (diambil dari raw_user_meta_data->>'role').
-- ============================================================

-- ============================================================
-- STORAGE: Foto unit HP bekas (bucket publik)
-- Aman dijalankan ulang (idempotent).
-- ============================================================

insert into storage.buckets (id, name, public)
values ('phone-photos', 'phone-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "public read phone photos" on storage.objects;
create policy "public read phone photos"
on storage.objects for select
using (bucket_id = 'phone-photos');

drop policy if exists "internal insert phone photos" on storage.objects;
create policy "internal insert phone photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'phone-photos' and public.is_internal());

drop policy if exists "internal update phone photos" on storage.objects;
create policy "internal update phone photos"
on storage.objects for update
to authenticated
using (bucket_id = 'phone-photos' and public.is_internal());

drop policy if exists "internal delete phone photos" on storage.objects;
create policy "internal delete phone photos"
on storage.objects for delete
using (bucket_id = 'phone-photos' and public.is_internal());
