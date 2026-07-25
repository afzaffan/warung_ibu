-- Warung Ibu - Skema awal
-- Prinsip: setiap barang WAJIB punya minimal satu harga pasti di item_prices.
-- Tidak ada lagi konsep "harga mengikuti label rak" (pricing_type dihapus).

create extension if not exists "pgcrypto";

create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_id uuid references locations(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  status text not null default 'tersedia' check (status in ('tersedia', 'habis')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index items_name_idx on items using gin (to_tsvector('simple', name));
create index items_status_idx on items(status);

-- Harga per satuan. Satu barang bisa punya banyak baris (pcs, renceng, dus, dst)
-- tanpa perlu menambah kolom baru di masa depan.
create table item_prices (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  unit_label text not null,        -- "pcs", "renceng", "dus", "3 bungkus", dst (bebas)
  unit_quantity numeric not null default 1 check (unit_quantity > 0),
  price numeric not null check (price >= 0),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index item_prices_item_id_idx on item_prices(item_id);

-- Hanya boleh ada satu is_default = true per item
create unique index item_prices_one_default_per_item
  on item_prices(item_id)
  where is_default;

create table price_history (
  id uuid primary key default gen_random_uuid(),
  item_price_id uuid not null references item_prices(id) on delete cascade,
  old_price numeric,
  new_price numeric not null,
  changed_at timestamptz not null default now()
);

-- Trigger: catat riwayat setiap kali harga berubah
create or replace function log_price_change()
returns trigger as $$
begin
  if (tg_op = 'UPDATE' and old.price is distinct from new.price) then
    insert into price_history (item_price_id, old_price, new_price)
    values (new.id, old.price, new.price);
  elsif (tg_op = 'INSERT') then
    insert into price_history (item_price_id, old_price, new_price)
    values (new.id, null, new.price);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_log_price_change
after insert or update on item_prices
for each row execute function log_price_change();

-- updated_at otomatis
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_items_updated_at before update on items
for each row execute function set_updated_at();

create trigger trg_item_prices_updated_at before update on item_prices
for each row execute function set_updated_at();

-- View praktis: barang + harga default, dipakai untuk list & search
create view items_with_default_price as
select
  i.id,
  i.name,
  i.status,
  i.note,
  l.name as location_name,
  c.name as category_name,
  ip.price as default_price,
  ip.unit_label as default_unit_label,
  ip.unit_quantity as default_unit_quantity
from items i
left join locations l on l.id = i.location_id
left join categories c on c.id = i.category_id
left join item_prices ip on ip.item_id = i.id and ip.is_default = true;

-- RLS: aktifkan tapi izinkan semua untuk role 'authenticated' (Ibu & Anda login lewat Supabase Auth)
alter table locations enable row level security;
alter table categories enable row level security;
alter table items enable row level security;
alter table item_prices enable row level security;
alter table price_history enable row level security;

create policy "authenticated full access" on locations for all to authenticated using (true) with check (true);
create policy "authenticated full access" on categories for all to authenticated using (true) with check (true);
create policy "authenticated full access" on items for all to authenticated using (true) with check (true);
create policy "authenticated full access" on item_prices for all to authenticated using (true) with check (true);
create policy "authenticated read" on price_history for select to authenticated using (true);
