# Panduan WhatsApp Business Cloud API — GANK.

Panduan ini untuk pemula lengkap. Ikuti berurutan. Estimasi total: 30–45 menit
(tanpa menunggu approval template). Semua langkah gratis — tidak ada biaya selama
masih dalam batas free tier Meta (1.000 percakapan layanan/bulan).

---

## Tahap 1 — Akun Developer Meta (~5 menit)

1. Buka <https://developers.facebook.com> → klik **Get Started / Mulai**
2. Login dengan akun Facebook/Meta kamu (jika belum punya, daftar dulu)
3. Lengkapi profil developer (nama + nomor HP verifikasi) bila diminta

## Tahap 2 — Buat App + Produk WhatsApp (~5 menit)

1. Di dashboard developer: **My Apps → Create App**
2. Pilih **Business** sebagai jenis app → Next
3. Isi nama app, misal `GANK Notifikasi` → pilih/buat **Business Portfolio**
   (jika diminta buat baru, ikuti wizard-nya, gratis) → **Create App**
4. Setelah app jadi, di halaman app cari produk **WhatsApp** → klik **Set up**
5. Pilih Business Portfolio yang sama bila ditanya kembali

## Tahap 3 — Kirim Pesan Pertama (tes koneksi) (~5 menit)

Meta otomatis membuat **nomor test + token sementara**:

1. Menu **WhatsApp → API Setup** di sidebar app
2. Catat dari halaman itu:
   - **From** = nomor test (mis. `1234567890`) → ini calon *Phone Number ID* terkait
   - **Access token** sementara (berlaku 24 jam)
3. Di bagian **To**, klik **Manage phone number list** → tambahkan nomor WhatsApp
   pribadimu (maksimal 5 nomor di mode development) → verifikasi OTP
4. Klik **Send message** → pesan template `hello_world` akan masuk ke WA-mu

> Kalau pesan sampai, kredensialmu valid. Lanjut ke tahap berikutnya.

## Tahap 4 — Buat Template Pesan GANK. (~10 menit + tunggu approve)

Menu **WhatsApp → Message Templates → Create Template**.
Kategori: **UTILITY** · Bahasa: **Indonesian (id)** · Buat dua template.

### Template 1 — nama: `gank_status_update`

Isi Body (salin persis):

```
Halo {{1}}, kabar baik! Perangkat kamu ({{2}}) dengan kode order {{3}} sekarang berstatus: *{{4}}*.

Pantau progres real-time di sini: {{5}}

Terima kasih telah mempercayakan perangkatmu kepada GANK.
```

### Template 2 — nama: `gank_service_done`

Isi Body (salin persis):

```
Halo {{1}}, perangkat kamu ({{2}}) dengan kode order {{3}} sudah SELESAI diservis!

Total biaya: Rp{{4}}
Semua fungsi sudah lolos checklist akhir kami — kondisi awal dan akhir tercatat transparan.

Detail lengkap: {{5}}
```

Contoh variabel (wajib diisi saat submit): `Budi`, `iPhone 11`, `GANK-SVC-2608-A1B2`,
`450000`, `https://gank.id/tracking`

Klik **Submit for review** → approval biasanya beberapa menit – 24 jam.
Status akan berubah dari *Pending* menjadi *Approved*.

## Tahap 5 — Nomor WhatsApp Produksi (~10 menit)

Nomor test hanya bisa kirim ke 5 nomor terdaftar. Untuk pelanggan sungguhan:

1. Menu **WhatsApp → API Setup → From** → **Add phone number**
2. Siapkan nomor HP baru/khusus bisnis yang **belum terdaftar WhatsApp**
   (nomor pribadi aktif tidak disarankan — akan migrasi & chat lama hilang)
3. Masukkan nomor → verifikasi via SMS/telepon
4. Tampilkan nama bisnis `GANK.` bila diminta (profile WhatsApp Business)

> ⚠️ Jangan gunakan nomor yang sedang aktif dipakai WhatsApp biasa.

## Tahap 6 — Token Permanen (System User) (~10 menit)

Token sementara dari Tahap 3 hanya 24 jam. Untuk produksi:

1. Buka <https://business.facebook.com/settings> (Business Settings portfolio-mu)
2. **Users → System users** → **Add** → nama `gank-bot` → role **Admin** → Create
3. Pilih system user tadi → tab **Assign assets** → Apps → pilih app `GANK Notifikasi`
   → centang **Full control** → Save
4. Tab **Generate new token**:
   - App: pilih app kamu
   - Token expiration: **Never**
   - Permissions: centang `whatsapp_business_messaging` + `whatsapp_business_management`
   - Generate → **salin token sekarang** (hanya tampil sekali!)

## Tahap 7 — Ambil Phone Number ID

Menu **WhatsApp → API Setup → From** → pilih nomor produksi → catat angka
**Phone number ID** (bukan nomor teleponnya).

## Tahap 8 — Aktifkan di Aplikasi

Isi `.env.local` (atau Environment Variables Vercel):

```bash
WHATSAPP_ENABLED=true
WHATSAPP_PHONE_NUMBER_ID=isi_dari_tahap_7
WHATSAPP_ACCESS_TOKEN=isi_dari_tahap_6
NEXT_PUBLIC_APP_URL=https://domain-publik-kamu.com
```

Restart server (`npm run dev`). Setiap perubahan status order kini mengirim WA
otomatis. Hasil pengiriman terlihat di detail order (kartu "Notifikasi WhatsApp")
dan tabel `notification_logs`.

---

## Verifikasi Akhir

1. Login internal → **Order Servis → Order Baru** → isi data pelanggan (pakai
   nomor WA yang terdaftar di penerima dev bila masih mode development)
2. Setelah checklist awal tersimpan → cek WhatsApp pelanggan: notifikasi
   *"Masuk"* harus masuk
3. Ubah status (Diperiksa dst.) → tiap perubahan kirim notifikasi
4. Halaman **Pengaturan** di sistem internal punya tombol **Tes Kirim** untuk
   cek cepat kapan saja

## Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| `(#131030) Recipient not in allowed list` | Mode dev, penerima belum didaftarkan | Daftarkan nomor di API Setup → To |
| `(#132000) Param count mismatch` | Template di Meta beda jumlah `{{n}}` dengan kode | Pastikan template punya tepat 5 variabel sesuai panduan |
| `(#2102007) Pending approval` | Template belum approved | Tunggu approval atau cek ejaan nama template |
| `Error code 190 / access token expired` | Pakai token sementara 24 jam | Buat token permanen (Tahap 6) |
| Pesan tidak terkirim, log `failed` HTTP 400 | Phone Number ID salah | Pastikan ID milik nomor produksi, bukan nomor test |
| Terkirim tapi pelanggan tak menerima | Nomor tujuan format salah | Format `08xx` atau `628xx` sama-sama diterima adapter |

## Biaya (per 2026, dapat berubah)

- Free tier: 1.000 percakapan layanan/bulan gratis
- Template Utility Indonesia: ±Rp400–500 per percakapan setelah melewati kuota
- Satu "percakapan" = jendela 24 jam per pelanggan, berapa pun pesan di dalamnya
