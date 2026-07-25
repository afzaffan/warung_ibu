"""
Konversi daftar_harga_warung_ibu.xlsx -> supabase/migrations/0002_seed.sql

Aturan konversi:
- Tempat (etalase 1/2/atas etalase) -> tabel locations
- Jenis kosong semua -> category_id dibiarkan NULL, category tetap dibuat kosong (siap diisi nanti)
- Harga angka murni (mis. 3500)          -> 1 baris item_prices, unit_label='pcs', qty=1, is_default=true
- Harga "sesuai label" / kosong          -> TIDAK dibuat baris item_prices sama sekali.
                                             Barang tetap masuk ke `items`, tapi ditandai
                                             perlu_harga=true agar muncul sebagai "Belum ada harga"
                                             di dashboard dan wajib diisi manual.
- Harga opsional "Rp5,000 / 3 bungkus"   -> baris item_prices kedua: unit_label='3 bungkus',
                                             qty=3, price=5000, is_default=false
"""
import re
import openpyxl
import uuid

SRC = "/mnt/user-data/uploads/daftar_harga_warung_ibu.xlsx"
OUT = "/home/claude/warung-ibu/supabase/migrations/0002_seed.sql"

wb = openpyxl.load_workbook(SRC, data_only=True)
ws = wb["Sheet1"]
rows = list(ws.iter_rows(min_row=2, values_only=True))

def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

def parse_opsional(text):
    """'Rp5,000 / 3 bungkus' -> (price=5000, qty=3, label='3 bungkus')"""
    if not text:
        return None
    m = re.search(r"rp\s*([\d.,]+)\s*/\s*(\d+)?\s*([a-zA-Z ]+)", text, re.I)
    if not m:
        return None
    price = float(m.group(1).replace(",", "").replace(".", ""))
    qty = int(m.group(2)) if m.group(2) else 1
    label = m.group(3).strip()
    return price, qty, label

locations = {}
for r in rows:
    tempat = r[2]
    if tempat and tempat not in locations:
        locations[tempat] = str(uuid.uuid4())

sql = []
sql.append("-- Auto-generated seed data dari daftar_harga_warung_ibu.xlsx\n")

sql.append("-- Locations")
for name, lid in locations.items():
    sql.append(f"insert into locations (id, name) values ('{lid}', {esc(name)});")

items_needing_price = []
item_count = 0
price_count = 0

sql.append("\n-- Items + Prices")
for r in rows:
    no, nama, tempat, jenis, harga, harga_opsional = r
    if not nama:
        continue
    item_id = str(uuid.uuid4())
    loc_id = locations.get(tempat)
    loc_sql = f"'{loc_id}'" if loc_id else "NULL"
    sql.append(
        f"insert into items (id, name, location_id, category_id, status, note) "
        f"values ('{item_id}', {esc(nama)}, {loc_sql}, NULL, 'tersedia', NULL);"
    )
    item_count += 1

    has_fixed_price = isinstance(harga, (int, float))
    if has_fixed_price:
        sql.append(
            f"insert into item_prices (item_id, unit_label, unit_quantity, price, is_default) "
            f"values ('{item_id}', 'pcs', 1, {harga}, true);"
        )
        price_count += 1
    else:
        items_needing_price.append(nama)

    if isinstance(harga_opsional, str):
        parsed = parse_opsional(harga_opsional)
        if parsed:
            price, qty, label = parsed
            sql.append(
                f"insert into item_prices (item_id, unit_label, unit_quantity, price, is_default) "
                f"values ('{item_id}', {esc(label)}, {qty}, {price}, false);"
            )
            price_count += 1

with open(OUT, "w") as f:
    f.write("\n".join(sql) + "\n")

print(f"Items dibuat: {item_count}")
print(f"Baris harga dibuat: {price_count}")
print(f"Barang TANPA harga pasti (perlu diisi manual via dashboard): {len(items_needing_price)}")
for n in items_needing_price:
    print("  -", n)
print(f"\nOutput ditulis ke: {OUT}")
