# FinTrack Frontend

FinTrack adalah aplikasi manajemen keuangan pribadi yang membantu pengguna mencatat pemasukan, pengeluaran, memantau kondisi finansial, serta mendapatkan insight berbasis AI.

## Fitur Utama

- Dashboard ringkasan keuangan
- Pencatatan pemasukan dan pengeluaran
- Riwayat transaksi dengan pencarian
- Grafik keuangan interaktif
- AI Insight untuk analisis kondisi keuangan
- Financial Health Score
- Manajemen profil pengguna
- Login dan registrasi
- Dark mode / Light mode
- Responsive design

## Teknologi yang Digunakan

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion
- Lucide React

## Struktur Proyek

```text
app/
├── login/
├── register/
├── (app)/dashboard/
├── (app)/transaksi/
├── (app)/laporan/
├── (app)/ai-insight/
├── (app)/profil/
├── (app)/tambah-pemasukan/
└── (app)/tambah-pengeluaran/

components/
constants/
types/
utils/
```

## Instalasi

### 1. Clone repository

```bash
git clone <repository-url>
cd Fintrack_Frontend
```

### 2. Install dependency

```bash
npm install
```

### 3. Konfigurasi environment

Buat file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Sesuaikan URL dengan backend yang digunakan.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di:

```text
http://localhost:3000
```

## Build Production

```bash
npm run build
```

## Linting

```bash
npm run lint
```

## Integrasi API

Frontend menggunakan helper API pada folder:

```text
utils/api.ts
```

Endpoint yang digunakan meliputi:

- Authentication (Login & Register)
- Dashboard Summary
- Transactions
- Categories
- AI Insights
- Financial Health Score
- Profile Management

## Halaman Utama

| Halaman | Deskripsi |
|----------|------------|
| Dashboard | Ringkasan kondisi keuangan pengguna |
| Transaksi | Riwayat transaksi dan pencarian |
| Tambah Pemasukan | Input data pemasukan |
| Tambah Pengeluaran | Input data pengeluaran |
| Laporan | Ringkasan laporan keuangan |
| AI Insight | Analisis keuangan berbasis AI |
| Profil | Pengelolaan data pengguna |

## Author

Tim Pengembang FinTrack
