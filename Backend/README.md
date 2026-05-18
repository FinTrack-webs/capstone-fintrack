# FinTrack Backend API

FinTrack Backend adalah RESTful API yang dibangun menggunakan **Node.js** dan **Express.js**, terintegrasi dengan **PostgreSQL (Supabase)** sebagai basis data utama. API ini mengelola semua data transaksi keuangan, sistem autentikasi modern berbasis session/token revocation, dan klasifikasi cerdas bertenaga AI.

---

## Panduan Memulai (Quick Start)

### 1. Prasyarat (Prerequisites)
Pastikan Anda memiliki **Node.js** (versi >= 16) dan akses database **PostgreSQL/Supabase**.

### 2. Instalasi & Setup Dependensi
Clone repositori ini, lalu instal dependensi library yang dibutuhkan:
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan (.env)
Salin berkas `.env.example` menjadi `.env`, kemudian sesuaikan dengan kredensial database Supabase Anda:
```bash
cp .env.example .env
```

### 4. Database Seeding (Kategori Default)
Untuk memasukkan 13 kategori keuangan bawaan (default) seperti Makanan, Transportasi, Hiburan, dll. ke dalam database, jalankan:
```bash
npm run seed
```

### 5. Menjalankan Server
*   **Mode Development (dengan Hot Reloading):**
    ```bash
    npm run dev
    ```
*   **Mode Production:**
    ```bash
    npm start
    ```

---

## 1. Panduan Khusus Tim Frontend (Frontend Developer Guide)

Tim Frontend dapat langsung berintegrasi dengan API ini dengan memperhatikan poin-poin berikut:

### Dokumentasi API Interaktif (Swagger UI)
Saat server berjalan, Anda dapat mengakses dokumentasi API interaktif di:
**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**  
*Dokumentasi ini mencakup skema request body, parameter query, headers, dan format response lengkap.*

### Alur Autentikasi (JWT + Session Revocation)
API ini menggunakan metode pengamanan berlapis:
1.  **Access Token (JWT):** Memiliki waktu kedaluwarsa singkat (contoh: 15 menit) untuk keamanan. Simpanlah token ini di dalam **Memory State** aplikasi frontend Anda (Zustand, React State, Redux) agar terhindar dari serangan XSS.
2.  **Refresh Token:** Memiliki waktu kedaluwarsa lama (misal: 7 hari) dan tercatat di database (`refresh_tokens`). Simpan ini di **LocalStorage** atau **Secure HTTP-Only Cookie**.
3.  **Alur Refresh Otomatis:**
    *   Jika request ke API mengembalikan error `401 Unauthorized` karena Access Token kedaluwarsa, tim Frontend harus memanggil endpoint `POST /api/auth/refresh-token` dengan membawa `refreshToken` lama untuk mendapatkan `accessToken` baru tanpa mengganggu kenyamanan user.
4.  **Logout & Session Revocation:**
    *   `POST /api/auth/logout`: Menghapus sesi aktif saat ini di database.
    *   `POST /api/auth/logout-all`: Menghapus seluruh sesi aktif dari semua perangkat (membutuhkan otorisasi).

---

## 2. Panduan Khusus Tim AI (AI Integration & Mock Guide)

Backend FinTrack dilengkapi dengan fitur klasifikasi kategori otomatis berbasis deskripsi transaksi. Saat ini, sistem menggunakan **AI Mock Service** yang meniru perilaku API klasifikasi AI riil untuk mempermudah pengerjaan paralel.

### Cara Kerja Integrasi AI (Fire-and-Forget Pattern)
1.  **Pemicu Otomatis:**
    *   Jika user mencatat transaksi *tanpa* memilih kategori (`category_id` tidak dikirim), server akan secara otomatis menandai status transaksi tersebut sebagai `pending` dan memicu klasifikasi kategori di latar belakang (**Async Fire-and-Forget**).
2.  **Fuzzy Matching & Klasifikasi:**
    *   Logika di `src/services/aiMockService.js` saat ini melakukan pemindaian kata kunci dari deskripsi transaksi (contoh: kata "bensin" akan otomatis diklasifikasikan ke kategori "Transportasi").
    *   Jika klasifikasi berhasil, database transaksi akan langsung diperbarui dengan `category_id` yang sesuai dan mengubah status transaksi dari `pending` menjadi `completed`.
    *   Jika tidak ada kecocokan kata kunci sama sekali, kategori akan otomatis jatuh ke kategori fallback **"Lainnya"** (kategori ID 13).

### Ekspektasi untuk Model Klasifikasi AI Riil (Production)
Tim AI diharapkan membangun model klasifikasi teks / NLP dengan spesifikasi berikut saat nanti menggantikan mock service ini:
*   **Input Model:** String deskripsi transaksi (contoh: `"Beli nasi goreng di warung"`).
*   **Output Model:** Nama kategori (contoh: `"Makanan & Minuman"`) atau kode ID kategori yang cocok dengan daftar di database.
*   **Waktu Respon:** Karena proses ini berjalan secara asinkron (background task), model klasifikasi harus dioptimalkan untuk memproses di bawah 2 detik demi menjaga integritas database dan kenyamanan pengguna saat melakukan reload di dashboard.

---

## 3. Pengujian API (API Testing Suite)
Untuk memastikan stabilitas endpoint, backend ini dilengkapi dengan suite pengujian integrasi menggunakan **Newman (Postman CLI)** yang mencakup 22 requests dengan 34 assertions (100% PASS).

Untuk menjalankan pengujian otomatis:
```bash
npm run test:api
```

---
*FinTrack Backend Team - Alief albayu*
