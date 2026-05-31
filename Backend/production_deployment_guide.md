# 🚀 Panduan Peluncuran Produksi FinTrack Backend

Dokumen ini berisi rangkuman pembaruan API terbaru dan panduan praktis bagi Anda selaku Developer untuk meluncurkan sistem ke lingkungan produksi (**Supabase** & **Railway**) agar berjalan dengan mulus tanpa kendala.

---

## 📊 Rangkuman Pembaruan API & Status Progress

Semua poin revisi QC utama yang berhubungan dengan Backend telah berhasil diselesaikan dan diverifikasi:

| Fitur / Poin Revisi | Deskripsi Teknis | Status | Lokasi File Utama |
|:---|:---|:---:|:---|
| **Default Financial Score (Poin 10)** | Menghapus pemotongan skor `-20` bagi user baru yang belum memiliki transaksi. Skor awal kini tetap `100` (bersih). | **Selesai! ✅** | [aiInsightService.js](file:///home/alief/Documents/capstone-fintrack/Backend/src/services/aiInsightService.js) |
| **Penyimpanan Gambar (BE-Server Upload)** | Implementasi upload file gambar biner lokal (maks 2MB, format JPEG/JPG/PNG/WEBP) menggunakan `multer`. | **Selesai! ✅** | [upload.js](file:///home/alief/Documents/capstone-fintrack/Backend/src/middlewares/upload.js) |
| **Pemberitahuan Statis Upload** | Menyajikan file statis avatar dari folder lokal `/uploads/avatars` melalui URL publik. | **Selesai! ✅** | [app.js](file:///home/alief/Documents/capstone-fintrack/Backend/src/app.js) |
| **Skema Verifikasi 2FA (OTP Codes)** | Membuat tabel `otp_codes` di PostgreSQL untuk menampung data OTP sementara dengan masa berlaku 5 menit. | **Selesai! ✅** | [otp_migration.sql](file:///home/alief/Documents/capstone-fintrack/Backend/src/database/otp_migration.sql) |
| **Kirim OTP via Email Resmi** | Integrasi `nodemailer` dengan Gmail SMTP resmi untuk mengirimkan email OTP HTML yang elegan. | **Selesai! ✅** | [mailer.js](file:///home/alief/Documents/capstone-fintrack/Backend/src/utils/mailer.js) |
| **API Baru: Verifikasi 2FA** | Membuat endpoint `POST /api/auth/verify-2fa` untuk memvalidasi OTP dan memberikan JWT Token utama. | **Selesai! ✅** | [auth.js](file:///home/alief/Documents/capstone-fintrack/Backend/src/routes/auth.js) |
| **Pembaruan Swagger UI Docs** | Menyisipkan JSDoc Swagger yang interaktif sehingga route baru bisa di-test langsung dari browser. | **Selesai! ✅** | [users.js](file:///home/alief/Documents/capstone-fintrack/Backend/src/routes/users.js) |

---

## 🛠️ Checklist & Langkah Menuju Produksi (Step-by-Step)

### Langkah 1: Push Perubahan ke GitHub (Sisi Lokal)
Kirimkan seluruh perubahan kode terbaru di lokal ke repositori GitHub agar Railway mendeteksi perubahan dan melakukan *auto-build*:

```bash
git add .
git commit -m "feat: implement image upload, 2FA OTP Gmail SMTP, and fix default financial score"
git push origin main
```

---

### Langkah 2: Status Database Supabase (Done! ✅)
* **Kabar Baik**: Migrasi tabel `otp_codes` beserta indeks pendukungnya sudah **sukses dieksekusi secara live ke database Supabase Anda** saat kita menjalankan script `node src/database/run_migration.js` tadi.
* **Tindakan**: **Tidak diperlukan tindakan apa pun** pada bagian database Supabase. Semua skema tabel sudah siap di sisi cloud!

---

### Langkah 3: Set Variabel Lingkungan di Railway (Sisi Production)
Masuk ke **[Railway Dashboard](https://railway.app)** $\rightarrow$ Pilih project **FinTrack** $\rightarrow$ Pilih layanan **Backend** $\rightarrow$ Tab **Variables**. 

Tambahkan variabel-variabel berikut untuk SMTP Gmail Anda yang telah terbukti sukses saat pengetesan:

| Nama Variabel (Key) | Nilai (Value) | Keterangan |
|:---|:---|:---|
| `SMTP_HOST` | `smtp.gmail.com` | Host SMTP Gmail resmi |
| `SMTP_PORT` | `587` | Port SMTP standar Gmail |
| `SMTP_SECURE` | `false` | Biarkan `false` agar otomatis ditingkatkan ke STARTTLS |
| `SMTP_USER` | `aliefalbayu@gmail.com` | Email Gmail pengirim Anda |
| `SMTP_PASSWORD` | `abcdefghijklmnop` | 16-karakter sandi aplikasi dari Akun Google Anda |
| `SMTP_FROM_NAME` | `FinTrack Support` | Nama pengirim email |
| `SMTP_FROM_EMAIL` | `aliefalbayu@gmail.com` | Email pengirim email |

*Klik **Save** untuk menerapkan perubahan. Railway akan melakukan deploy ulang otomatis.*

---

### Langkah 4: Setup Penyimpanan File Persisten (Railway Volume)
Agar file avatar yang diunggah pengguna tidak terhapus setiap kali ada *deploy ulang* atau kontainer *restart*, pasangkan penyimpanan permanen pada Railway:

1. Di dashboard Railway, klik tombol **`+ New`** di pojok kanan atas, lalu pilih **`Volume`**.
2. Berikan ukuran minimal (misalnya **1 GB** atau **5 GB** sudah sangat lebih dari cukup untuk berkas avatar).
3. Hubungkan/attach Volume tersebut ke layanan **Backend FinTrack** Anda.
4. Set **Mount Path** ke: `/app/public/uploads`
5. Selesai! Sekarang semua avatar pengguna akan disimpan dengan aman selamanya di disk cloud terpisah.

---

### Langkah 5: Koordinasi Integrasi dengan Developer Frontend (FE)
Bagikan panduan integrasi ini kepada developer Frontend Anda agar mereka dapat menghubungkan kode baru mereka ke endpoint Backend Anda:

> #### 📢 PANDUAN INTEGRASI ENDPOINT BARU UNTUK FRONTEND (FE)
> 
> Halo tim FE! Pembaruan API di produksi sudah aktif. Silakan buka **`/api-docs`** pada domain produksi (misal: `https://fintrack-backend.up.railway.app/api-docs`) untuk melihat dokumentasi interaktif Swagger terbaru.
>
> Berikut adalah panduan cara mengonsumsi 2 fitur baru kita:
>
> **1. Fitur Upload Avatar (Multipart)**:
> * **Endpoint**: `POST /api/users/avatar/upload`
> * **Headers**: `Authorization: Bearer <token>`
> * **Body (FormData)**: Key bernama `avatar` berjenis file biner gambar.
> 
> **2. Fitur Alur Login 2FA OTP**:
> * Saat melakukan `POST /api/auth/login`, Backend akan memindai apakah status 2FA pengguna aktif.
> * Jika aktif, response JSON akan bernilai:
>   `{ "status": "success", "message": "OTP verifikasi...", "data": { "two_fa_required": true, "email": "..." } }`
> * **Tugas FE**: Tahan pemindahan ke dashboard, tampilkan form input OTP 6-digit di UI, lalu setelah diisi, panggil endpoint verifikasi berikut:
>   * **Endpoint**: `POST /api/auth/verify-2fa`
>   * **Body (JSON)**: `{ "email": "user@example.com", "otp_code": "123456" }`
>   * **Response**: Mengembalikan token akses JWT utama (`accessToken` & `refreshToken`) untuk masuk ke dashboard secara resmi.
