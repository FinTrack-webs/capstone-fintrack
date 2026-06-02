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
**[https://backend-fintrack-production.up.railway.app/api-docs](https://backend-fintrack-production.up.railway.app/api-docs)**  
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

## 2. Panduan Khusus Tim AI (AI Integration)

Backend FinTrack sekarang sudah sepenuhnya terintegrasi untuk berkomunikasi dengan **FinTrack AI Service** (Python) via HTTP request.

### Cara Kerja Integrasi AI (Dual Endpoint & Fire-and-Forget)
1.  **Endpoint Preview (`/predict-only`):**
    *   Tersedia endpoint `POST /api/transactions/predict-only` bagi tim AI dan Frontend untuk mengetes akurasi model klasifikasi tanpa menyimpan data ke database. Endpoint ini meneruskan input (`description`, `transaction_type`, `account_type`) ke AI Service.
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

## 3. Status Deployment (Railway)

Saat ini, Backend FinTrack **telah berhasil di-deploy ke Railway** dan berjalan secara *live* (bersinkronisasi otomatis dengan repositori GitHub). ini untuk link Backend: **[https://backend-fintrack-production.up.railway.app](https://backend-fintrack-production.up.railway.app)**

**Langkah Selanjutnya untuk Tim:**
*   **Tim Frontend:** Silakan gunakan URL API dari Railway ini sebagai `baseURL` HTTP Client (Axios/Fetch) di aplikasi frontend Anda.
*   **Tim AI:** Segera setelah service AI (Python) berhasil di-deploy, berikan **URL API AI tersebut** kepada tim Backend agar bisa dipasang ke variabel lingkungan (`FINTRACK_API_URL`) di dashboard Railway Backend.


---

## 4. Pengujian API (API Testing Suite)
Untuk memastikan stabilitas endpoint, backend ini dilengkapi dengan suite pengujian integrasi menggunakan **Newman (Postman CLI)** yang mencakup 22 requests dengan 34 assertions (100% PASS).

Untuk menjalankan pengujian otomatis:
```bash
npm run test:api
```

---
*FinTrack Backend - Alief albayu*
