# Warung Ibu — Katalog Harga

Aplikasi katalog harga barang warung. Bukan sistem kasir — fokus pada pencarian cepat, status stok, dan pengelolaan harga yang fleksibel per satuan (pcs/renceng/dus/dll).

## Stack
- **Frontend**: React + Vite + Tailwind CSS v4, React Router
- **Backend**: Supabase (PostgreSQL + Auth + REST API otomatis) — gratis, cocok untuk data relasional (barang ⇄ harga ⇄ lokasi)

## Setup

### 1. Buat project Supabase
1. Daftar gratis di https://supabase.com
2. Buat project baru
3. Buka **SQL Editor**, jalankan isi `supabase/migrations/0001_init.sql`
4. (Opsional) jalankan `supabase/migrations/0002_seed.sql` untuk mengisi 140 barang dari Excel awal — 12 di antaranya sudah punya harga, sisanya perlu dilengkapi manual lewat dashboard (lihat catatan di bawah)
5. Aktifkan **Email Auth** di Authentication settings, lalu buat 1–2 akun untuk Ibu/Anda
6. Salin **Project URL** dan **anon public key** dari Settings → API

### 2. Setup frontend
```bash
cd frontend
cp .env.example .env.local
# isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local
npm install
npm run dev
```

### 3. Deploy
- **Vercel** (disarankan, gratis, auto-deploy dari GitHub): import repo, set root directory `frontend`, isi environment variables yang sama seperti `.env.local`
- Atau **GitHub Pages**: build (`npm run build`), deploy folder `dist` (butuh sedikit konfigurasi base path)

## Catatan penting soal harga
Dari 140 barang di Excel awal, hanya 12 yang punya harga pasti tertulis — sisanya kosong atau bertuliskan "sesuai label" (harga dilihat langsung di rak). Sesuai keputusan desain, **semua barang wajib punya harga pasti di sistem**. Barang yang belum punya harga akan:
- ditandai badge "Belum ada harga" di daftar & dashboard
- muncul di filter khusus (Dashboard → banner kuning → "Lihat")
- tetap bisa dicari dan dilihat detailnya, hanya bagian harga kosong sampai diisi manual lewat halaman Edit

## Struktur database
Lihat `docs/design.md` untuk penjelasan lengkap skema, relasi, dan alasan desain.

## Roadmap
- [x] MVP: search realtime, CRUD barang, harga multi-satuan, toggle status, halaman barang habis
- [ ] Dashboard statistik lanjutan, dark mode (sudah ada di MVP), riwayat harga (skema sudah siap via `price_history`)
- [ ] Export/Import Excel
- [ ] Backup otomatis
