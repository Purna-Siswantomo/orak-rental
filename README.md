# Otak Rental

Landing page publik (informasi jasa & kategori pekerjaan) + kalkulator harga untuk admin
berdasarkan kategori pekerjaan, urgensi (deadline), dan kompleksitas. Order dicatat manual oleh
admin (bukan lewat form publik/self-service) setelah diskusi dengan klien.

Instagram: [@otakrental](https://www.instagram.com/otakrental/)

## Desain / brand

**Redesign (Sep 2026):** landing page dibangun ulang total dengan bahasa desain "SaaS bersih",
diinspirasi dari struktur/pola UX situs referensi (bukan disalin) — hero gelap yang membuka jadi
badan halaman terang, satu warna aksen (biru), penekanan lewat warna pada satu kata di headline,
bento grid untuk kategori, accordion untuk FAQ. Arah sebelumnya (tema cyberpunk gelap penuh +
latar belakang Three.js/WebGL) **dilepas sepenuhnya** — selain tidak cocok lagi dengan arah baru,
ini juga menutup bug render WebGL yang belum terpecahkan di sesi sebelumnya (scene tidak tampil
di sebagian kombinasi GPU/driver, walau draw call & kamera terbukti benar lewat debugging pixel
manual). Tidak ada lagi dependency `three`/`@types/three`.

- **Font:** [Geist Sans + Geist Mono](https://vercel.com/font) lewat paket `geist` (bukan Google
  Fonts) — dipasang di `src/app/layout.tsx`, tersedia sebagai `--font-geist-sans` /
  `--font-geist-mono`.
- **Warna:** satu aksen biru (`blue-600`) dipakai konsisten untuk semua tombol/link/ikon di
  seluruh halaman publik maupun admin. Band gelap (`#0a0a0c`) dipakai di hero + footer sebagai
  "bookend", badan halaman di antaranya putih/zinc-50. Tint warna per kategori (`JOB_TYPE_CONFIG`)
  di bento grid kategori pekerjaan itu alat bantu scan, bukan aksen kompetitor — CTA tetap satu
  warna.
- **Komponen baru:** `PricingPreview.tsx` (preview formula asli dengan angka contoh berlabel
  jelas "Contoh kalkulasi", bukan mockup fiktif), `CategoryBento.tsx` (bento 6 kategori dari
  `JOB_TYPE_CONFIG`, satu tile unggulan lebih besar), `FaqAccordion.tsx` (client component,
  accordion sederhana tanpa dependency tambahan).
- **Konten yang sengaja tidak ada:** tidak ada logo klien ("Trusted by ...") karena belum ada
  klien besar riil untuk ditampilkan, dan tidak ada testimoni karena membuat kutipan/nama fiktif
  bertentangan dengan sikap etis platform ini sendiri (lihat PRD.md §13). Kedua bagian itu diganti
  konten yang sudah nyata ada di aplikasi (kategori pekerjaan, kebijakan feasibility gate &
  batasan etis).

Foto yang tersisa dipakai sebagai gambar pendukung (`public/images/network.webp`) sumbernya dari
Unsplash ([Unsplash License](https://unsplash.com/license) — bebas dipakai komersial tanpa
atribusi wajib): `unsplash.com/photos/cec3da58eef4`.

Ini implementasi yang **disederhanakan** dari visi awal di [PRD.md](./PRD.md) (v1.1): tanpa
intake self-service, tanpa screening/disclosure otomatis, tanpa audit log — karena kebutuhan
aktual saat ini murni penentuan harga, bukan marketplace multi-pihak. PRD.md masih berlaku
sebagai dokumen kebijakan/visi kalau nanti sistem ini dikembangkan lagi ke arah situ.

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000):

- `/` — landing page publik (info jasa, kategori pekerjaan, kontak WhatsApp)
- `/admin/login` — login admin
- `/admin`, `/admin/orders/new`, `/admin/orders/[id]`, `/admin/config` — **terproteksi login**,
  redirect ke `/admin/login` kalau belum masuk

### Login admin

Kredensial diatur lewat `.env` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`) — **ganti nilai default**
sebelum dipakai. Session disimpan sebagai cookie httpOnly yang ditandatangani pakai
`SESSION_SECRET` (juga di `.env`); mengubah `SESSION_SECRET` akan otomatis logout semua sesi
yang sedang aktif. Proteksi diterapkan lewat `src/proxy.ts` (Next.js middleware) ke seluruh
route `/admin/*` dan API `/api/orders*`, `/api/config*`.

**Catatan Turbopack:** kalau editor kamu punya ekstensi seperti Console Ninja terpasang, ia bisa
menyebabkan error JS acak & klik/input tidak responsif saat dev server jalan dengan Turbopack
(default `next dev` di Next 16). Kalau itu terjadi, jalankan dengan webpack sebagai gantinya:

```bash
npx next dev --webpack
```

## Rumus pricing

```
Harga = (Estimasi Jam x Rate Dasar) x Multiplier Urgensi x Multiplier Kompleksitas + Biaya Tambahan
```

Multiplier urgensi dihitung otomatis dari sisa hari ke deadline (dikonfigurasi di
`/admin/config`). Kalau kombinasi jam & deadline menghasilkan >12 jam kerja efektif/hari, sistem
menampilkan peringatan (feasibility gate) sebelum harga bisa disimpan — bisa di-override manual.

## Menjalankan lewat Docker

```bash
docker compose up --build -d
```

Buka [http://localhost:3000](http://localhost:3000). Container otomatis menjalankan migrasi
(`prisma migrate deploy`) dan mengisi ulang baseline pricing default (`prisma/seed.ts`, idempotent
lewat upsert) setiap kali start, lalu menjalankan `next start`.

Data SQLite disimpan di Docker volume `harga_joki_data` (path `/app/data/dev.db` di dalam
container) — jadi aman dari restart/rebuild container. `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan
`SESSION_SECRET` ikut terbawa dari `.env` (lewat `env_file` di `docker-compose.yml`); hanya
`DATABASE_URL` yang di-override khusus untuk path di dalam container.

Perintah lain yang berguna:

```bash
docker compose logs -f app     # lihat log (termasuk hasil migrasi/seed saat start)
docker compose restart app     # restart tanpa rebuild
docker compose down            # stop & hapus container (volume data TETAP ada)
docker compose down -v         # stop & hapus container + volume (data ikut terhapus)
```

## Database

SQLite lokal lewat Prisma. `DATABASE_URL` di `.env` memakai **path absolut** (bukan relatif) —
ini karena path proyek mengandung spasi, dan resolusi path relatif Prisma Client (provider
`prisma-client`) ternyata relatif terhadap folder `src/generated/prisma`, bukan cwd atau lokasi
`schema.prisma`. Kalau proyek dipindah ke folder lain, sesuaikan `DATABASE_URL` di `.env`.

Perintah yang berguna:

```bash
npx prisma studio        # lihat/edit data lewat UI
npx prisma migrate dev   # setelah mengubah prisma/schema.prisma
npx tsx prisma/seed.ts   # isi ulang baseline pricing default (Lampiran A di PRD.md)
```
