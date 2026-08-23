# GANK. — Servis HP & Jual Beli HP Bekas

Website dengan dua sistem: **publik** (landing parallax, katalog HP bekas, lacak servis) dan **internal** (dashboard, order servis dengan checklist fungsional, stok) — dibangun dengan prinsip **Jujur. Cepat. Transparan.**

## Tech Stack

- Next.js 16 (App Router, Turbopack) + TypeScript
- Tailwind CSS v4 — dark monochrome + aksen electric blue
- Supabase — Postgres, Auth, Row Level Security
- Recharts (grafik dashboard), Framer Motion (parallax), next-themes (dark/light internal)

## Struktur

```
src/
├── app/
│   ├── (public)/            # Publik — tanpa login
│   │   ├── page.tsx         # Landing parallax
│   │   ├── katalog/         # Katalog + detail HP bekas
│   │   └── tracking/        # Lacak servis via kode order
│   └── internal/
│       ├── login/           # Login wajib
│       └── (app)/           # Dilindungi proxy.ts + RLS
│           ├── page.tsx     # Dashboard: grafik performa + donat kerusakan
│           ├── servis/      # Order + checklist awal/akhir (gate status selesai)
│           └── stok/        # Kelola listing HP (admin)
├── proxy.ts                 # Guard rute /internal/* (Next 16: middleware → proxy)
├── lib/                     # Supabase clients, actions, WhatsApp adapter
└── supabase/migration.sql   # Skema DB + RLS + trigger + seed
```

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local   # lalu isi nilainya
npm run dev
```

### 2. Supabase

1. Buat project di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → jalankan seluruh isi `supabase/migration.sql`
3. Ambil **Project URL** dan **anon key** di Settings → API → isi ke `.env.local`
4. Buat user admin pertama: bagian komentar paling bawah `migration.sql` berisi perintah INSERT ke `auth.users` — ganti email/password lalu jalankan sekali

> Service role key hanya dibutuhkan jika kelak memakai admin API server-side; saat ini tidak dipakai.

### 3. WhatsApp Business Cloud API (Meta)

Notifikasi otomatis terkirim pada **setiap perubahan status** order.

1. Daftar di [developers.facebook.com](https://developers.facebook.com) → Create App → jenis **Business** → tambahkan produk **WhatsApp**
2. Mode pengembangan: gunakan nomor test bawaan + token sementara untuk uji coba (maks. 5 nomor penerima)
3. Buat 2 **message template** kategori *Utility*, bahasa **Indonesian (id)**:

   **`gank_status_update`**
   ```
   Halo {{1}}, kabar baik! Perangkat kamu ({{2}}) dengan kode order {{3}} sekarang berstatus: *{{4}}*.

   Pantau progres real-time di sini: {{5}}

   Terima kasih telah mempercayakan perangkatmu kepada GANK.
   ```

   **`gank_service_done`**
   ```
   Halo {{1}}, perangkat kamu ({{2}}) dengan kode order {{3}} sudah SELESAI diservis! 🎉

   Total biaya: Rp{{4}}
   Semua fungsi sudah lolos checklist akhir kami.

   Detail lengkap: {{5}}
   ```

4. Setelah business verified: buat *System User* di Business Settings → generate **permanent token** dengan izin `whatsapp_business_messaging`
5. Isi `.env.local`:
   ```
   WHATSAPP_ENABLED=true
   WHATSAPP_PHONE_NUMBER_ID=...
   WHATSAPP_ACCESS_TOKEN=...
   NEXT_PUBLIC_APP_URL=https://domainkamu.com
   ```

Setiap pengiriman dicatat di tabel `notification_logs`. Jika gagal, tombol **Kirim Ulang Notifikasi** tersedia di detail order.

## Alur Checklist Fungsional (inti konsistensi servis)

1. Order baru dibuat → **popup checklist awal muncul otomatis** — kondisi 12 komponen direkam
2. Teknisi mengerjakan sesuai diagnosis
3. Status tidak bisa menjadi **Selesai** tanpa checklist akhir lengkap — divalidasi di UI, server action, **dan trigger database**
4. Halaman detail menampilkan tabel perbandingan awal vs akhir sebagai bukti transparan

## Role Internal

| Role | Akses |
|---|---|
| Admin | Semua: dashboard, order, checklist, stok |
| Teknisi | Dashboard, order, checklist, update status |

Role ditentukan di kolom `profiles.role` (dibuat otomatis oleh trigger dari metadata signup).

## Deployment

### Vercel (direkomendasikan)

```bash
npx vercel
```

Atau hubungkan repo di [vercel.com/new](https://vercel.com/new). Set semua variabel environment dari `.env.example` di Project Settings → Environment Variables. Tidak ada konfigurasi khusus — aplikasi portable ke hosting Node.js mana pun (`npm run build && npm start`).
