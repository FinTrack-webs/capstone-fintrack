# FinTrack: Smart Financial Management System

FinTrack adalah platform manajemen keuangan cerdas yang membantu pengguna memantau transaksi pribadi dan bisnis. Dilengkapi dengan klasifikasi otomatis bertenaga AI, analisis kesehatan keuangan, dan dashboard interaktif.

## 🚀 Komponen Proyek

Proyek ini terdiri dari 4 bagian utama yang saling terintegrasi:

1.  **Backend**: RESTful API menggunakan Node.js (Express) dan PostgreSQL (Supabase).
2.  **AI Service**: Layanan klasifikasi transaksi menggunakan Python (FastAPI/TensorFlow).
3.  **Frontend**: Dashboard user menggunakan Next.js (TypeScript) dan Tailwind CSS.
4.  **Data Science**: Analisis tren dan preprocessing data menggunakan Jupyter Notebook.

---

## 🛠️ Cara Replikasi (Langkah Demi Langkah)

Ikuti urutan di bawah ini untuk menjalankan seluruh sistem di lokal:

### 1. Persiapan Awal
```bash
git clone https://github.com/FinTrack-webs/capstone-fintrack.git
cd capstone-fintrack
```

### 2. Backend Setup (API Utama)
Backend mengelola database dan logika bisnis.
```bash
cd Backend
npm install
cp .env.example .env   # Sesuaikan kredensial DB Supabase & JWT
npm run seed           # Memasukkan kategori default
npm run dev            # Berjalan di http://localhost:8080
```

### 3. AI Service Setup (Klasifikasi Otomatis)
Layanan ini harus berjalan agar fitur deteksi kategori otomatis berfungsi.
```bash
cd ../AI
python3 -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend Setup (Antarmuka Pengguna)
```bash
cd ../Frontend
npm install
cp .env.example .env.local  # Atur NEXT_PUBLIC_API_URL ke backend
npm run dev                 # Berjalan di http://localhost:3000
```

### 5. Data Science (Opsional - Dashboard Analisis)
Jika ingin melihat visualisasi data mentah dan analisis tren:
```bash
cd "../Data Science"
pip install -r requirements.txt
streamlit run dashboard/dashboard.py
```

---

## 📋 Fitur Utama
- **Klasifikasi AI**: Otomatis mendeteksi kategori dari deskripsi transaksi.
- **Financial Health Score**: Penilaian kondisi keuangan berbasis algoritma.
- **Reporting**: Laporan pemasukan & pengeluaran bulanan.
- **Savings Goals**: Manajemen target tabungan dengan progres otomatis.
- **Export Data**: Ekspor riwayat transaksi ke format CSV.

## 👥 Tim Pengembang
- **Backend**: Muhammad Alief Albayu
- **Frontend**: Nazwa Hilda Syafira
- **AI/ML**: Gracyella Sinaga
- **Data Science**: Claudia maharani, Amar Bachtiar Tirta

---
*FinTrack - Capstone Project*
