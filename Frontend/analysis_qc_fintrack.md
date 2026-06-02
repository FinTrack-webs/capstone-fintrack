# 📊 Analisis Hasil Quality Control (QC) FinTrack

Berikut adalah hasil pemilahan dan analisis mendalam dari **10 poin revisi Quality Control (QC)** yang Anda terima setelah menghubungkan Backend (BE) dengan Frontend (FE). Kami membaginya menjadi tiga kategori:
1. **Tugas Backend (BE)**: Memerlukan modifikasi kode BE atau penjelasan tentang struktur API.
2. **Tugas Frontend (FE)**: Terkait langsung dengan UI, styling, navigasi, dan routing di sisi klien.
3. **Kolaborasi & Integrasi FE-BE**: Penyelarasan cara Frontend memanggil atau memanfaatkan API Backend yang sudah tersedia.

---

## 🗂️ Tabel Ringkasan Revisi

| No | Poin Revisi | Kategori | PIC Utama | Status / Tindakan yang Diperlukan |
|:---|:---|:---:|:---:|:---|
| **1** | Setelah sign in langsung dashboard? | **Frontend** | FE | **Done FE**: login sukses menyimpan auth dan redirect ke `/dashboard` |
| **2** | Tombol balik masih undo bukan langsung dashboard | **Frontend** | FE | **Done FE**: tombol panah desktop/mobile langsung menuju `/dashboard` |
| **3** | Width nya tidak full | **Frontend** | FE | **Done FE**: layout app dibuat full-width dan responsif; konten desktop mengisi sisa layar setelah sidebar |
| **4** | Setiap tipe beda method | **Integrasi** | FE | **Done FE**: form pemasukan dan pengeluaran memakai endpoint tunggal `POST /api/transactions`; nilai `transaction_type` diselaraskan ke Swagger (`debit` / `credit`) |
| **5** | Filter di riwayat gak ada action | **Integrasi** | FE | **Done FE**: tombol filter membuka kontrol filter dan memanggil ulang `GET /api/transactions` dengan query params BE |
| **6** | UI untuk mode gelap | **Frontend** | FE | **Done FE**: dark mode tersedia di halaman publik dan app, dengan kontras komponen utama dirapikan |
| **7** | Pemasukan & Pengeluaran jadikan 1 | **Frontend** | FE | **Done FE**: satu form transaksi dengan toggle Pemasukan/Pengeluaran; tetap memakai `POST /api/transactions` |
| **8** | Pengaturan & user jadi 1 aja | **Frontend** | FE | **Done FE**: menu Pengaturan dihapus dan pengaturan profil digabung ke halaman Akun |
| **9** | Tombol logout | **Integrasi** | FE | **Done FE**: tombol logout memanggil `POST /api/auth/logout`, membersihkan sesi lokal, lalu kembali ke login |
| **10** | Default score finansial kok 80? | **Integrasi** | FE | **Done FE**: tampilan skor dikoreksi ke 100 jika akun belum punya pemasukan dan pengeluaran |

---

## 🔍 Detail Penjelasan per Poin

### 1. Setelah sign in langsung dashboard?
* **Kategori**: **Frontend (FE)**
* **Penjelasan**:
  * Backend bersifat *stateless*. API login (`POST /api/auth/login`) hanya bertugas memeriksa email & password, lalu mengembalikan token akses (`accessToken` & `refreshToken`).
  * Frontend sudah menyimpan response auth ke localStorage melalui `saveStoredAuth(response.data)`.
  * Setelah login sukses, Frontend langsung menjalankan `router.push("/dashboard")`.
  * **Status**: **Selesai di Frontend**.

### 2. Tombol balik masih undo bukan langsung dashboard
* **Kategori**: **Frontend (FE)**
* **Penjelasan**:
  * Perilaku tombol kembali/batal di UI diatur sepenuhnya oleh Frontend.
  * Tombol panah di sidebar desktop dan header mobile sekarang memakai `router.push("/dashboard")`.
  * Tidak ada lagi penggunaan `router.back()` untuk tombol panah utama app shell.
  * **Status**: **Selesai di Frontend**.

### 3. Width nya tidak full
* **Kategori**: **Frontend (FE)**
* **Penjelasan**:
  * Masalah utama ada di layout aplikasi yang masih memakai batas lebar maksimal (`max-w-6xl`) pada konten utama.
  * Konten utama sekarang memakai `w-full` di mobile dan `md:w-[calc(100%-16rem)]` di desktop agar mengisi seluruh sisa layar setelah sidebar.
  * Wrapper animasi halaman juga diberi `w-full min-w-0` agar grid/card di dalamnya tidak membuat overflow horizontal.
  * **Status**: **Selesai di Frontend**.

### 4. Setiap tipe beda method
* **Kategori**: **Kolaborasi & Integrasi FE-BE**
* **Penjelasan**: 
  * Berdasarkan Swagger UI, transaksi baru dibuat lewat endpoint tunggal **`POST /api/transactions`**.
  * Frontend sekarang tetap memakai satu fungsi `fintrackApi.createTransaction()` untuk form pemasukan maupun pengeluaran.
  * Field `transaction_type` juga sudah diselaraskan dengan Swagger, yaitu **`debit`** dan **`credit`**. Label UI tetap menampilkan "Debit" dan "Kredit".
  * Karena tidak ada akses mengubah Backend, field metode pembayaran di UI hanya dipakai sebagai pilihan tampilan lokal dan tidak dikirim sebagai field baru yang tidak ada di schema Backend.
  * **Status**: **Selesai di Frontend**.

### 5. Filter di riwayat gak ada action
* **Kategori**: **Kolaborasi & Integrasi FE-BE**
* **Penjelasan**: 
  * Berdasarkan Swagger UI, API history transaksi (`GET /api/transactions`) mendukung filter:
    * `search` (pencarian teks deskripsi)
    * `category_id` (kategori)
    * `type` (income/expense)
    * `status` (pending/classified/failed)
    * `start_date` & `end_date` (rentang tanggal)
    * `page` dan `limit` (paginasi)
  * Tombol filter di halaman riwayat sekarang membuka kontrol filter.
  * Setiap perubahan filter akan melakukan *fetch ulang* data ke Backend menggunakan query parameters di atas.
  * **Status**: **Selesai di Frontend**.

### 6. UI untuk mode gelap (Dark Mode)
* **Kategori**: **Frontend (FE)**
* **Penjelasan**:
  * Theme provider sudah menyimpan pilihan user di `localStorage` dan mengaktifkan class `.dark` di root HTML.
  * Toggle dark mode tersedia di app shell desktop serta halaman publik seperti landing, login, dan register.
  * Background halaman publik, varian tombol, toast, avatar, dan beberapa state hover/outline sudah diberi kelas dark mode agar kontrasnya aman.
  * **Status**: **Selesai di Frontend**.

### 7. Pemasukan & Pengeluaran jadikan 1
* **Kategori**: **Frontend (FE) / Status: Sudah Terpadu di BE**
* **Penjelasan**: 
  * Di **Backend**, Pemasukan dan Pengeluaran **sudah digabung menjadi 1** di dalam tabel database `transactions`. Pembedanya hanya pada relasi tipe kategorinya.
  * Frontend sekarang memakai satu form transaksi dengan pilihan **Pemasukan** dan **Pengeluaran** di dalam form yang sama.
  * Tombol dashboard juga disederhanakan menjadi satu aksi **Tambah Transaksi**.
  * Route utama sekarang **`/tambah-transaksi`**. Route lama `/tambah-pemasukan` dan `/tambah-pengeluaran` diarahkan ke route tunggal tersebut agar link lama tidak rusak.
  * **Status**: **Selesai di Frontend**.

### 8. Pengaturan & user jadi 1 aja
* **Kategori**: **Frontend (FE)**
* **Penjelasan**:
  * Menu **Pengaturan** terpisah sudah dihapus dari sidebar.
  * Form edit nama profil dan info akun sekarang berada langsung di halaman **Akun Kamu** (`/profil`).
  * Route lama `/profil/edit` diarahkan kembali ke `/profil` agar link lama tidak rusak.
  * **Status**: **Selesai di Frontend**.

### 9. Tombol logout
* **Kategori**: **Kolaborasi & Integrasi FE-BE**
* **Penjelasan**:
  * **Backend** **sudah menyediakan** endpoint logout yang aman:
    * `POST /api/auth/logout` (untuk menghapus token refresh aktif)
    * `POST /api/auth/logout-all` (untuk logout dari semua perangkat)
  * Tombol logout sudah ada di halaman **Akun Kamu**.
  * Saat diklik, Frontend sekarang mengambil `refreshToken`, memanggil `POST /api/auth/logout`, membersihkan auth lokal (`fintrack-auth`), membersihkan session storage, lalu mengarahkan user ke `/login`.
  * Jika server logout gagal merespons, Frontend tetap membersihkan sesi lokal agar perangkat user keluar dengan aman.
  * **Status**: **Selesai di Frontend**.

### 10. Default score finansial kok 80?
* **Kategori**: **Kolaborasi & Integrasi FE-BE**
* **Penjelasan**: 
  * Karena tidak ada akses mengubah Backend, Frontend menormalisasi tampilan skor dari response `GET /api/ai/financial-health-score`.
  * Jika `total_income === 0` dan `total_expense === 0`, user dianggap belum punya data transaksi, sehingga skor yang ditampilkan adalah **100**.
  * Jika sudah ada pemasukan atau pengeluaran, Frontend tetap menampilkan skor dari Backend apa adanya.
  * **Status**: **Selesai di Frontend**.

---
