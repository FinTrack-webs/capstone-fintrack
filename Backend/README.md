# FinTrack Backend API

FinTrack Backend adalah RESTful API yang dibangun menggunakan **Node.js** dan **Express.js**, terintegrasi dengan **PostgreSQL (Supabase)** sebagai basis data utama. API ini mengelola semua data transaksi keuangan, sistem autentikasi modern berbasis session/token revocation, klasifikasi cerdas bertenaga AI, serta fitur-fitur komprehensif lainnya seperti profil pengguna, analitik grafis, target tabungan, dan ekspor data CSV.

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

## 🚀 Pembaruan Fitur Baru (Fase 2)

Aplikasi telah diperbarui secara ekstensif pada Fase 2, menambahkan 5 modul fungsionalitas besar:

1. **User Profile & Settings:** Pengguna dapat memperbarui data profil (nama, telepon, alamat), mengunggah URL avatar, mengubah kata sandi, dan mengatur keamanan *Two-Factor Authentication* (2FA).
2. **Analytics & Reporting:** Tersedia endpoint untuk menarik data laporan total pengeluaran bulanan, perbandingan pemasukan dan pengeluaran (harian/mingguan/bulanan), serta distribusi alokasi dana per kategori.
3. **Savings Goals:** Fitur CRUD untuk merencanakan target tabungan di masa depan. Sistem backend akan secara otomatis mengalkulasi dan mengembalikan persentase progres (`progress_percentage`) setiap target tabungan.
4. **AI Insights & Financial Health Score:** Endpoint untuk menganalisis dan mendiagnosis skor kesehatan keuangan (0-100) serta peringatan bahaya pengeluaran (*over-spending warnings*) berdasarkan aturan simulasi AI di backend.
5. **Transactions Filter, Pagination & Export CSV:** API riwayat transaksi kini dilengkapi filter lengkap (tanggal, tipe, status, kategori), halaman (pagination), dan fungsionalitas untuk mengekspor data laporan langsung menjadi format *file* CSV (`GET /api/transactions/export`).

---

## 1. Integrasi Frontend (Frontend Architecture)

Aplikasi frontend berkomunikasi dengan API ini dengan menerapkan standar keamanan dan performa berikut:

### Dokumentasi API Interaktif (Swagger UI)
Saat server berjalan, Anda dapat mengakses dokumentasi API interaktif di:
**[https://backend-fintrack-production.up.railway.app/api-docs](https://backend-fintrack-production.up.railway.app/api-docs)**  
*Dokumentasi ini mencakup skema request body, parameter query, headers, dan format response lengkap.*

### Alur Autentikasi (JWT + Session Revocation)
API ini menggunakan metode pengamanan berlapis:
1.  **Access Token (JWT):** Memiliki waktu kedaluwarsa singkat (contoh: 15 menit) untuk keamanan. Simpanlah token ini di dalam **Memory State** aplikasi frontend Anda (Zustand, React State, Redux) agar terhindar dari serangan XSS.
2.  **Refresh Token:** Memiliki waktu kedaluwarsa lama (misal: 7 hari) dan tercatat di database (`refresh_tokens`). Simpan ini di **LocalStorage** atau **Secure HTTP-Only Cookie**.
3.  **Alur Refresh Otomatis:**
    *   Jika request ke API mengembalikan error `401 Unauthorized` karena Access Token kedaluwarsa, Frontend akan memanggil endpoint `POST /api/auth/refresh-token` dengan membawa `refreshToken` lama untuk mendapatkan `accessToken` baru secara transparan tanpa me-logout pengguna secara paksa.
4.  **Logout & Session Revocation:**
    *   `POST /api/auth/logout`: Menghapus sesi aktif saat ini di database.
    *   `POST /api/auth/logout-all`: Menghapus seluruh sesi aktif dari semua perangkat (membutuhkan otorisasi).

---

## 2. Integrasi Model AI (AI Architecture)

Backend FinTrack dirancang sebagai jembatan cerdas (*intelligent proxy*) yang berkomunikasi dengan **FinTrack AI Service** (berbasis Python) via HTTP request.

### Cara Kerja Integrasi AI (Dual Endpoint & Fire-and-Forget)
1.  **Endpoint Preview (`/predict-only`):**
    *   Tersedia endpoint `POST /api/transactions/predict-only` untuk mengetes akurasi model klasifikasi tanpa menyimpan data ke database. Endpoint ini akan meneruskan parameter input secara langsung ke AI Service.
2.  **Klasifikasi Otomatis (Fire-and-Forget):**
    *   Jika user mencatat transaksi baru via `POST /api/transactions` *tanpa* memilih `category_id`, server akan menandai transaksi dengan status `pending` dan secara asinkron memanggil AI Service.
    *   Jika AI berhasil mengklasifikasikan, database akan diperbarui dengan `category_id` (hasil pemetaan), `ai_confidence`, dan status menjadi `classified`.
3.  **Mode Testing Lokal (Mock AI):**
    *   Jika AI service riil belum berjalan di komputer Anda, jalankan backend dengan perintah `NODE_ENV=test npm run dev` untuk menggunakan *AI Mock Service* lokal (simulasi instan).

### Ekspektasi API Model Klasifikasi (FinTrack AI)
Backend Node.js mengekspektasikan AI API berjalan di URL yang diatur pada `.env` (`FINTRACK_API_URL`) dan memiliki dua rute berikut berdasarkan `account_type`:
*   `POST /predict/personal`
*   `POST /predict/business`

**Request dari Backend ke AI:**
```json
{
  "description": "Beli nasi goreng",
  "transaction_type": "debit"
}
```
**Ekspektasi Response dari AI:**
```json
{
  "predicted_category": "Makanan",
  "confidence_score": 0.95
}
```

---

**Live API Documentation (Swagger):** 
Anda dapat mengakses dokumentasi API secara langsung di **[https://backend-fintrack-production.up.railway.app/api-docs](https://backend-fintrack-production.up.railway.app/api-docs)**.

*(Catatan: Endpoint ini merupakan basis utama (baseURL) yang digunakan oleh aplikasi Frontend untuk beroperasi).*


---

## 4. Pengujian API (API Testing Suite)
Untuk memastikan stabilitas endpoint, backend ini dilengkapi dengan suite pengujian integrasi menggunakan **Newman (Postman CLI)** yang telah diperbarui dengan seluruh *test case* fitur Fase 2, mencakup puluhan *requests* dan *assertions* (100% PASS).

Untuk menjalankan pengujian otomatis:
```bash
npm run test:api
```

---
*FinTrack Backend - Alief albayu*
