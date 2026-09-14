# Product Requirements Document (PRD)
## Platform Jasa Konsultasi & Development (dengan Sistem Screening Etis dan Pricing Dinamis)
**Versi:** 1.1
**Tanggal:** 6 September 2026
**Status:** Draft
**Pemilik Produk:** [Nama Kamu]
**Cakupan:** Sistem lokal, dioperasikan oleh satu admin/operator (bukan platform multi-freelancer)

---

## Changelog v1.0 → v1.1

- Menambahkan **jalur konsultasi statistik/analisis data ber-disclosure** (§6.1.1) sebagai satu-satunya bentuk keterlibatan dalam pekerjaan bernuansa riset akademik selain penolakan total — dengan pagar pembatas eksplisit agar tidak menjadi celah joki skripsi/penelitian berkedok "konsultasi".
- Menegaskan kembali: **penolakan skripsi/tesis/disertasi/publikasi ilmiah tetap mutlak, tanpa pengecualian** (§13 tidak berubah).
- Menurunkan skala modul Escrow (FR-5.1/5.2) menjadi **pencatatan status pembayaran manual**, bukan penahanan dana pihak ketiga — menyesuaikan cakupan "sistem lokal".
- Menurunkan prioritas Matching Engine (§6.4) menjadi **eksplisit ditunda**, bukan P1, karena sistem ini solo-operator.
- Menambahkan **re-screening lampiran file** dan komunikasi lanjutan (FR-1.6), bukan hanya deskripsi intake.
- Menambahkan **kebijakan retensi data** untuk order yang ditolak (NFR Privasi).
- Menambahkan **deteksi repeat-submission** setelah penolakan (FR-1.7).
- Menambahkan **versioning prompt classifier** untuk keperluan audit (FR-1.8).
- Melengkapi baseline jam untuk kategori "development project" yang sebelumnya kosong (Lampiran A).
- Menyatukan angka multiplier urgensi yang sebelumnya tidak konsisten antara §6.2 dan Lampiran A.

---

## 1. Ringkasan Eksekutif

Platform ini adalah layanan konsultasi teknis dan pengembangan sistem (coding, data science, ML/AI, technical writing non-akademik) yang ditujukan untuk mahasiswa, individu, dan bisnis kecil, dioperasikan sebagai sistem lokal oleh satu admin/operator.

Platform secara struktural **menolak** permintaan yang berpotensi memfasilitasi academic fraud — khususnya joki skripsi, tesis, disertasi, atau naskah untuk publikasi ilmiah (paper mill) — melalui mekanisme screening otomatis dan manual yang terintegrasi ke dalam alur order. Pengecualian **satu-satunya** yang diizinkan adalah **konsultasi statistik/analisis data ber-disclosure** (§6.1.1) — bukan pengerjaan riset atas nama klien, dan tetap tunduk pada verifikasi manual serta pembatasan cakupan pekerjaan yang ketat.

Diferensiasi utama dari kompetitor "jasa joki" generik:

1. **Kebijakan penolakan yang di-enforce oleh sistem**, bukan sekadar pernyataan di halaman FAQ — dan **framing publik harus sama persis dengan kebijakan aktual**. Tidak ada jalur tersembunyi yang meloloskan hal yang secara terbuka dinyatakan ditolak.
2. **Pricing berbasis formula transparan** (effort × urgensi × kompleksitas), bukan tarif flat yang rawan under/over-priced.
3. **Auditability** — setiap keputusan terima/tolak order tercatat, penting untuk akuntabilitas dan evaluasi kebijakan ke depan.

---

## 2. Latar Belakang & Masalah

### 2.1 Masalah yang Diselesaikan

- Mahasiswa/klien butuh bantuan teknis (coding, analisis data, development) tapi kesulitan menemukan penyedia yang **kredibel dan transparan soal harga**.
- Penyedia jasa individu (freelancer) sering kesulitan menentukan harga yang adil — under-price saat sepi, tidak konsisten saat deadline mepet, atau menerima order yang bermasalah secara etis karena tidak ada sistem penyaringan.
- Pasar "jasa joki" di Indonesia mencampuradukkan layanan yang legal (freelance dev/consulting, konsultasi statistik yang diungkap ke institusi) dengan layanan yang secara etis-hukum bermasalah (joki skripsi, joki publikasi), sehingga mencemari reputasi penyedia jasa yang legitimate.

### 2.2 Mengapa Sekarang

Sebagai mahasiswa Informatika dengan fokus system development & AI, ada peluang membangun ini bukan cuma sebagai layanan manual, tapi sebagai **studi kasus sistem nyata**: order management, classifier berbasis LLM, pricing engine, audit trail — yang juga bisa jadi portofolio teknis.

---

## 3. Tujuan Produk (Goals)

| # | Tujuan | Indikator Keberhasilan |
|---|---|---|
| G1 | Menyediakan estimasi harga yang konsisten dan transparan | Variance harga vs jam aktual < 20% |
| G2 | Mencegah order yang melanggar kebijakan (joki skripsi/publikasi) masuk ke pipeline kerja | 100% order ter-flag masuk antrian review manual sebelum diterima |
| G3 | Menjaga kualitas delivery meski di bawah tekanan deadline | Tingkat revisi mayor < 15% dari total order |
| G4 | Memastikan jalur konsultasi ber-disclosure tidak disalahgunakan sebagai kedok joki | 0% order pada jalur disclosure yang lolos tanpa bukti disclosure terverifikasi |

### 3.1 Non-Goals (Di Luar Cakupan)

- Tidak melayani pembuatan skripsi, tesis, disertasi, atau naskah untuk disubmit ke jurnal/konferensi ilmiah, dalam bentuk apapun (termasuk yang "dibungkus" sebagai bab terpisah, atau sebagai "analisis data saja") — **tanpa pengecualian, termasuk pada jalur disclosure di §6.1.1**.
- Tidak menyediakan fitur pembayaran mata uang asing/crypto pada versi awal.
- Tidak membangun mobile app native di fase awal (web-first, mobile-responsive).
- Tidak membangun matching engine multi-freelancer di fase awal — sistem ini didesain untuk satu operator; ekspansi ke multi-freelancer adalah keputusan terpisah di masa depan, bukan bagian dari roadmap saat ini.
- Tidak menahan dana pihak ketiga secara literal (escrow finansial berlisensi) — lihat §6.5 yang direvisi.

---

## 4. Target Pengguna & Persona

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Klien Mahasiswa** | Butuh bantuan tugas mingguan, tubes, laporan magang (non-akademik final) | Harga jelas di awal, estimasi waktu akurat |
| **Klien Riset Ber-disclosure** | Peneliti/mahasiswa yang butuh konsultasi metodologi/statistik/tooling untuk riset yang **diketahui pembimbing/institusinya** | Pendampingan teknis, bukan pengerjaan riset; bukti disclosure diverifikasi di awal |
| **Klien Bisnis Kecil** | Butuh MVP, dashboard, automasi | Kualitas deliverable, dokumentasi teknis |
| **Admin (kamu)** | Mengelola screening, pricing override, dispute, verifikasi disclosure | Visibilitas penuh atas pipeline, kontrol kebijakan |

---

## 5. Alur Pengguna Utama (User Flow)

1. Klien mengisi **intake form terstruktur** (bukan chat bebas) → deskripsi kebutuhan, kategori pekerjaan, deadline, level keterlibatan yang diharapkan.
2. Klien mengisi **deklarasi status akademik** (lihat FR-1.1a): apakah pekerjaan ini terkait syarat kelulusan/publikasi atas nama klien sendiri.
3. Sistem menjalankan **classifier screening** terhadap deskripsi order dan (jika ada) lampiran file (FR-1.6).
4. Jika **flagged**, ATAU kategori "Konsultasi Analisis Data/Statistik" dipilih ATAS pekerjaan yang terkait syarat kelulusan → order masuk antrian review manual admin dengan status "menunggu verifikasi disclosure", klien mendapat notifikasi "sedang ditinjau".
5. Untuk jalur disclosure: admin **memverifikasi bukti disclosure** (lihat FR-6.1.1) sebelum order bisa lanjut ke pricing. Tanpa bukti terverifikasi, order otomatis ditolak.
6. Jika **clear** (baik jalur normal maupun disclosure yang sudah terverifikasi) → sistem menghitung **estimasi harga otomatis** berdasarkan pricing engine.
7. Klien melihat estimasi harga + breakdown (jam kerja, multiplier urgensi, multiplier kompleksitas) → konfirmasi atau negosiasi terbatas dengan admin.
8. Pembayaran dicatat sebagai **status "Dibayar"** di sistem (lihat §6.5 yang direvisi).
9. Order dikerjakan oleh admin, dengan cakupan kerja yang **dibatasi eksplisit** untuk jalur disclosure (lihat FR-6.1.1) selama progress.
10. Progress tracking → delivery → klien review → status pembayaran ditandai "Selesai".
11. Jika ada dispute → masuk alur resolusi dengan referensi ke audit log.

---

## 6. Fitur & Requirement Fungsional

### 6.1 Modul Intake & Screening (Prioritas: P0)

**FR-1.1** Sistem harus menyediakan form intake dengan field wajib:
- Jenis pekerjaan (dropdown: tugas mingguan, tugas besar/tubes, laporan magang, **konsultasi analisis data/statistik (disclosed)**, development project, lainnya)
- Deskripsi kebutuhan (free text)
- Deadline (date picker)
- **Pernyataan penggunaan** (mandatory checkbox): "Dokumen/hasil kerja ini BUKAN bagian dari skripsi/tesis/disertasi dan TIDAK akan disubmit untuk publikasi ilmiah (jurnal/konferensi) atas nama saya sebagai kontribusi orisinal, kecuali telah melalui jalur disclosure yang diverifikasi (§6.1.1)."

**FR-1.1a** Sistem wajib menampilkan pertanyaan deklarasi terpisah (tidak bisa digabung dengan checkbox lain): **"Apakah pekerjaan ini terkait syarat kelulusan (skripsi/tesis/disertasi) atau publikasi ilmiah atas nama Anda?"** (Ya/Tidak)
- Jika **Ya** dan jenis pekerjaan bukan "Konsultasi Analisis Data/Statistik (disclosed)" → order **ditolak otomatis** tanpa masuk pricing engine (lihat §13, kebijakan mutlak).
- Jika **Ya** dan jenis pekerjaan adalah "Konsultasi Analisis Data/Statistik (disclosed)" → order wajib masuk jalur verifikasi disclosure (FR-6.1.1), tidak boleh auto-accept dalam kondisi apa pun.
- Jika **Tidak** → lanjut ke screening normal (FR-1.2).

**FR-1.2** Sistem harus menjalankan classifier (berbasis LLM prompt-based, lihat Bagian 8) terhadap deskripsi order untuk mendeteksi indikasi:
- Kata kunci terlarang (skripsi, tesis, disertasi, jurnal, publikasi, Scopus, SINTA, "atas nama saya", dll.)
- **Sinyal struktural**, bukan hanya kata kunci — misal deskripsi yang menyebutkan kombinasi elemen berpola tesis (bab pendahuluan/metodologi/hasil/pembahasan, sitasi format akademik, "bab 3 saja", "cuma olah data + uji statistiknya", "tinggal nulis laporan dari hasil ini") meskipun berlabel "laporan penelitian" atau "tugas kelas".
- Pola penyamaran (pemecahan pekerjaan menjadi unit kecil untuk menghindari deteksi — lihat §13).

**FR-1.3** Order yang ter-flag classifier ATAU deklarasi FR-1.1a tidak konsisten dengan deskripsi → **wajib** masuk antrian review manual admin, tidak boleh auto-accept.

**FR-1.4** Admin harus dapat melihat *reasoning* di balik flag (bagian mana dari input yang memicu, bukan cuma skor angka) agar keputusan bisa diaudit dan classifier bisa dievaluasi/dikalibrasi ulang.

**FR-1.5** Setiap keputusan (accept/reject/escalate) tersimpan di **audit log** dengan timestamp, admin yang memutuskan, dan alasan.

**FR-1.6** Sistem harus me-*rescreen* **lampiran file** yang diunggah klien (proposal, draf, data) dengan classifier yang sama saat file pertama kali diunggah — bukan hanya deskripsi teks awal — karena permintaan bermasalah sering baru terlihat dari isi file, bukan deskripsi order. File yang men-trigger flag baru setelah order berjalan → order dibekukan sementara dan masuk ulang ke antrian review.

**FR-1.7** Sistem harus mendeteksi **submission berulang** dari klien yang sama (berbasis email/kontak yang didaftarkan) setelah penolakan sebelumnya, dan menampilkan riwayat penolakan tersebut ke admin saat order baru direview — untuk mencegah klien menormalisasi permintaan yang sama dengan deskripsi yang diperhalus.

**FR-1.8** Setiap perubahan pada prompt/threshold classifier harus **diberi versi** (mis. `v1.2`), dan setiap keputusan di audit log (FR-1.5) mencatat versi prompt yang digunakan saat itu — agar keputusan lama tetap bisa ditelusuri ulang meski prompt sudah berubah.

### 6.1.1 Jalur Konsultasi Analisis Data/Statistik (Disclosed) — Pagar Pembatas

Jalur ini **satu-satunya** bentuk keterlibatan yang diizinkan dalam pekerjaan yang terkait syarat kelulusan/publikasi klien. Tujuannya adalah konsultasi teknis yang legal dan lazim (mis. dosen statistik freelance mengajarkan penggunaan SPSS/R, atau reviewer membantu debug kode analisis) — **bukan** jalur untuk mengerjakan substansi riset klien.

**FR-6.1.1a — Syarat wajib sebelum order pada kategori ini diproses:**
- Klien wajib memberikan **nama dan kontak pembimbing/dosen pengampu**.
- Klien wajib menyertakan **bukti disclosure**: tangkapan layar/email/pesan yang menunjukkan pembimbing mengetahui dan mengizinkan adanya bantuan pihak ketiga untuk aspek teknis (bukan substansi) riset.
- Admin **wajib** melakukan verifikasi tambahan sebelum menerima — idealnya menghubungi langsung pembimbing/institusi untuk konfirmasi, bukan hanya menerima dokumen yang diberikan klien secara mentah. Order **tidak boleh** lanjut ke pricing tanpa verifikasi ini selesai dan dicatat di audit log.
- Bukti disclosure yang tidak bisa diverifikasi (kontak tidak merespons, tidak valid, atau mencurigakan) → order ditolak, bukan "diterima dengan asumsi baik".

**FR-6.1.1b — Batasan cakupan pekerjaan (wajib dipatuhi selama pengerjaan):**
Yang **diperbolehkan**:
- Mengajarkan/menjelaskan penggunaan tools (SPSS, R, Python, Excel, dsb.).
- Me-review dan men-debug kode analisis **yang sudah ditulis klien sendiri**.
- Menjelaskan interpretasi hasil statistik yang **sudah dihasilkan klien**.
- Memberi masukan desain metodologi (bukan menentukan metodologi final untuk klien).

Yang **dilarang mutlak**, bahkan di jalur ini:
- Menjalankan analisis inti dari nol lalu menyerahkan hasil/temuan sebagai "kontribusi" klien.
- Menulis bagian bab apa pun dari dokumen tesis/skripsi/laporan penelitian akhir.
- Menghasilkan output yang secara langsung disalin-tempel klien ke dokumen akhir tanpa keterlibatan substantif klien dalam prosesnya.

**FR-6.1.1c — Keterbatasan yang diakui secara sadar:** verifikasi disclosure ini bersifat *best-effort*, bukan jaminan mutlak — dokumen bisa dipalsukan, kontak pembimbing bisa fiktif. Mitigasinya adalah menaikkan friksi (butuh usaha aktif klien untuk memalsukan, dan tanggung jawab atas pernyataan palsu berpindah ke klien secara tertulis), bukan mengklaim sistem ini anti-fraud sempurna. Ini harus dinyatakan apa adanya di kebijakan publik — **tidak boleh dipasarkan seolah menjamin 100% bebas fraud**.

### 6.2 Modul Pricing Engine (Prioritas: P0)

**FR-2.1** Sistem menghitung estimasi harga dengan formula:

```
Harga = (Estimasi Jam × Rate Dasar) × Multiplier Urgensi × Multiplier Kompleksitas + Biaya Tambahan
```

**FR-2.2** Baseline estimasi jam per kategori dapat dikonfigurasi admin (default awal, lihat tabel referensi di Lampiran A), dan **wajib diperbarui secara berkala** berdasarkan data historis jam aktual vs estimasi.

**FR-2.3** Multiplier urgensi dihitung otomatis dari selisih hari saat ini ke deadline, dengan tabel yang dapat dikonfigurasi admin (default, **satu sumber kebenaran** — lihat Lampiran A, tidak ada tabel duplikat lain di dokumen ini).

**FR-2.4** Multiplier kompleksitas ditentukan melalui **checklist terstruktur** yang diisi admin saat asesmen order (bukan input bebas), contoh kriteria: jumlah fitur terintegrasi, kebutuhan riset tambahan, ketergantungan API eksternal, kebutuhan desain arsitektur.

**FR-2.5** Sistem harus menampilkan **feasibility gate**: jika kombinasi scope besar + deadline sangat mepet menghasilkan jam kerja per hari yang tidak realistis (misal >12 jam/hari kerja efektif), sistem menampilkan warning ke admin untuk menawarkan pengurangan scope atau menolak order — bukan otomatis diterima dengan harga tinggi.

**FR-2.6** Klien dapat melihat **breakdown harga** (bukan cuma angka akhir) untuk transparansi dan mengurangi dispute.

### 6.3 Modul Order Management (Prioritas: P0)

**FR-3.1** Dashboard admin menampilkan pipeline status: `Submitted → Screened → (Menunggu Verifikasi Disclosure, jika berlaku) → Accepted/Rejected → Priced → Dibayar → In Progress → Delivered → Completed/Disputed`.

**FR-3.2** Setiap order memiliki halaman detail dengan riwayat komunikasi, file terkait, dan log perubahan status.

**FR-3.3** Sistem mengirim notifikasi otomatis ke klien di setiap perubahan status utama.

### 6.4 Matching Engine — Ditunda (Bukan Bagian Roadmap Saat Ini)

Modul pencocokan order ke banyak freelancer **tidak dirancang dan tidak dibangun** pada versi ini. Sistem ini diasumsikan solo-operator (admin = pengerja). Jika di masa depan ada kebutuhan nyata untuk ekspansi multi-freelancer, ini didesain sebagai proyek arsitektur terpisah, bukan penambahan bertahap ke sistem lokal ini.

### 6.5 Modul Pembayaran (Prioritas: P0) — Direvisi: Bukan Escrow Finansial

**FR-5.1** Sistem mencatat **status pembayaran** per order (Belum Dibayar / Dibayar / Dikembalikan) secara manual oleh admin setelah menerima pembayaran melalui kanal yang sudah ada (transfer bank, QRIS, e-wallet) — sistem **tidak** menahan dana pihak ketiga secara literal maupun terintegrasi dengan payment gateway pihak ketiga pada fase ini.
**FR-5.2** Jika order ditolak setelah pembayaran tercatat (kasus tepi: klien membayar dulu, baru deskripsi lengkap/lampiran ter-review dan ternyata melanggar kebijakan) → admin wajib memproses pengembalian dana secara manual melalui kanal yang sama, dan mencatat status "Dikembalikan" di sistem.

### 6.6 Modul Quality Assurance (Prioritas: P1)

**FR-6.1** Untuk deliverable berupa kode, sistem menjalankan **similarity check** (integrasi tool seperti MOSS/JPlag atau alternatif open-source) untuk memastikan tidak ada plagiarisme template yang berlebihan, dan sebagai bukti *due diligence* jika ada sengketa kualitas.
**FR-6.2** Checklist QA manual sebelum delivery: kelengkapan sesuai scope, dokumentasi, hasil testing (jika applicable).

---

## 7. Requirement Non-Fungsional

| Kategori | Requirement |
|---|---|
| **Keamanan** | Data klien (deskripsi tugas, file) terenkripsi at-rest; akses admin dengan login sederhana (bukan RBAC multi-role — sistem ini solo-operator) |
| **Privasi & Retensi** | Deskripsi order yang di-reject karena kategori terlarang tetap disimpan untuk audit selama **maksimum 12 bulan**, dengan akses terbatas hanya ke admin, lalu dihapus atau dianonimkan kecuali ada dispute aktif yang membutuhkannya |
| **Performa** | Estimasi harga otomatis tampil dalam < 3 detik setelah submit intake form |
| **Auditability** | Semua keputusan accept/reject/pricing override/verifikasi disclosure dapat ditelusuri (siapa, kapan, alasan, versi prompt classifier yang dipakai) |
| **Reliabilitas classifier** | Classifier di-review berkala (misal tiap 20–50 order, disesuaikan dengan volume aktual solo-operator, bukan target kalender tetap) untuk mengukur false positive/negative rate |
| **Biaya operasional** | Panggilan API LLM untuk screening dipantau biayanya (per order dan bulanan), karena ini sistem personal dengan anggaran terbatas |

---

## 8. Spesifikasi Teknis: Classifier Screening

- **Pendekatan:** Prompt-based classification menggunakan LLM (tidak perlu fine-tuning di fase awal), dengan output terstruktur (JSON: `flagged: boolean, confidence: string, reasoning: string, matched_signals: [], prompt_version: string`).
- **Threshold:** Confidence "tinggi" → auto-flag ke antrian manual. Confidence "sedang" → tetap flag tapi prioritas review lebih rendah. Confidence "rendah"/tidak ada sinyal → lanjut ke pricing engine (kecuali kategori disclosure, yang **selalu** wajib verifikasi manual terlepas dari confidence classifier).
- **Human-in-the-loop wajib:** Classifier **tidak pernah** melakukan auto-reject penuh tanpa review manusia untuk kasus ambigu, untuk menghindari false positive yang merugikan klien legitimate. Namun deklarasi eksplisit "Ya, ini untuk syarat kelulusan" pada kategori non-disclosure (FR-1.1a) **boleh** auto-reject, karena ini pernyataan langsung dari klien sendiri, bukan inferensi classifier.
- **Feedback loop:** Setiap keputusan admin (setuju/override hasil classifier) dicatat sebagai data evaluasi untuk kalibrasi ulang prompt/threshold, dengan versi prompt baru dicatat terpisah dari versi lama (FR-1.8).
- **Catatan jujur soal keterbatasan:** classifier berbasis LLM dapat dilewati oleh klien yang cukup termotivasi menyamarkan bahasa. Ini bukan alasan untuk tidak membangunnya, tapi alasan untuk tidak memasarkan sistem ini sebagai "anti-fraud 100%" — kombinasi classifier + review manual + deteksi repeat-submission (FR-1.7) menaikkan biaya/friksi bagi yang ingin menyamarkan permintaan, bukan menghilangkannya sepenuhnya.

---

## 9. Metrik Kesuksesan (Success Metrics)

| Metrik | Target Awal |
|---|---|
| Akurasi classifier (precision terhadap order yang di-review manual) | > 85%, diukur per 20–50 order ter-review (bukan target kalender 3 bulan tetap, mengingat volume solo-operator) |
| Rata-rata deviasi estimasi harga vs invoice akhir | < 15% |
| Tingkat komplain/dispute per total order | < 10% |
| Waktu rata-rata review manual order ter-flag | < 24 jam |
| Order pada jalur disclosure yang lolos verifikasi tanpa bukti valid | 0% (hard requirement, bukan target statistik) |
| Repeat order rate dari klien legitimate | > 30% dalam 6 bulan |

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Klien menyamarkan permintaan terlarang dengan istilah berbeda | Order lolos screening | Kombinasi keyword + sinyal struktural + re-screening lampiran (FR-1.6) + review manual berkelanjutan |
| Jalur disclosure (§6.1.1) disalahgunakan sebagai kedok joki skripsi/penelitian | Kebijakan penolakan jadi tidak berarti, risiko reputasi & hukum | Verifikasi disclosure aktif oleh admin (bukan menerima dokumen mentah), batasan cakupan kerja eksplisit (FR-6.1.1b), audit log wajib per keputusan |
| Klien yang sudah ditolak mengajukan ulang dengan deskripsi diperhalus | Order bermasalah lolos di percobaan kedua | Deteksi repeat-submission berbasis kontak klien (FR-1.7), riwayat penolakan ditampilkan ke admin |
| Dispute harga karena klien merasa multiplier urgensi tidak adil | Reputasi & churn | Transparansi breakdown harga di awal sebelum konfirmasi order, bukan setelah pekerjaan selesai |
| False positive classifier menolak order legitimate | Kehilangan klien baik | Human review wajib sebelum reject final pada kasus ambigu (bukan pada deklarasi eksplisit klien sendiri) |
| Bukti disclosure dipalsukan (email/kontak fiktif) | Jalur disclosure tetap jadi celah meski sudah ada proses verifikasi | Diakui sebagai keterbatasan (FR-6.1.1c), verifikasi aktif oleh admin (kontak langsung ke pembimbing bila memungkinkan) menaikkan friksi, bukan menjamin 100% |

---

## 11. Fase Implementasi (Roadmap)

| Fase | Cakupan | Estimasi Durasi |
|---|---|---|
| **Fase 1 — MVP** | Intake form (termasuk deklarasi FR-1.1a), pricing engine dasar (manual multiplier input), dashboard admin sederhana, screening manual dulu (classifier otomatis belum aktif) | 3–4 minggu |
| **Fase 2** | Integrasi classifier LLM untuk screening otomatis (FR-1.2–1.8), audit log, jalur verifikasi disclosure (§6.1.1) | 2–3 minggu |
| **Fase 3** | Pencatatan status pembayaran, notifikasi otomatis | 1–2 minggu |
| **Fase 4** | QA similarity check | 2–3 minggu |
| **Fase 5** | Analytics & kalibrasi ulang baseline harga dari data historis | Berkelanjutan |

*(Matching engine multi-freelancer sengaja tidak dijadwalkan — lihat §6.4.)*

---

## 12. Lampiran A: Baseline Referensi Harga (Default, Dapat Dikonfigurasi)

| Jenis Pekerjaan | Estimasi Jam Baseline |
|---|---|
| Tugas mingguan | 2–8 jam |
| Tugas besar (tubes) semester | 20–80 jam |
| Laporan magang | 10–20 jam |
| Konsultasi analisis data/statistik (disclosed) | 3–10 jam (sesi konsultasi/pendampingan, bukan pengerjaan penuh) |
| Development project | 15–100 jam (tergantung asesmen kompleksitas, lihat FR-2.4) |

| Multiplier Urgensi (satu-satunya sumber kebenaran — menggantikan tabel duplikat di §6.2) | Nilai |
|---|---|
| > 14 hari | 1.0x |
| 7–14 hari | 1.2x |
| 3–7 hari | 1.5x |
| < 2 hari | 2.0x atau flag "tidak layak" |

| Multiplier Kompleksitas | Nilai |
|---|---|
| Low | 1.0x |
| Medium | 1.2–1.4x |
| High | 1.5–1.8x |
| Expert | 2.0x+ |

---

## 13. Kebijakan Eksplisit (Ditegaskan Kembali, Tidak Berubah dari v1.0)

Platform ini **tidak menerima, dalam bentuk apapun, tanpa pengecualian**, permintaan yang berkaitan dengan:

- Penulisan atau pengerjaan skripsi, tesis, disertasi untuk diklaim sebagai karya klien.
- Penulisan naskah untuk disubmit ke jurnal ilmiah atau konferensi akademik atas nama klien.
- Segala bentuk pemecahan pekerjaan di atas menjadi unit lebih kecil ("bab metodologi saja", "cuma analisis datanya") untuk menghindari deteksi.

**Jalur konsultasi ber-disclosure (§6.1.1) bukan pengecualian dari kebijakan ini** — jalur tersebut secara eksplisit melarang pengerjaan substansi riset, dan hanya mengizinkan pendampingan teknis dengan bukti disclosure yang terverifikasi. Kebijakan ini bersifat mengikat untuk seluruh sistem (intake, classifier, dan keputusan manual admin) dan tidak dapat di-override oleh pertimbangan komersial semata.
