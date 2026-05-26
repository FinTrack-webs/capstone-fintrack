# FinTrack API

API untuk klasifikasi otomatis kategori transaksi keuangan personal dan bisnis menggunakan model machine learning.

---

## Prasyarat

Pastikan sistem kamu sudah terinstall:

- **Python 3.10+** (disarankan 3.10–3.12, hindari 3.14 karena TensorFlow belum support)
- **pip**
- **python3-venv**

Cek versi Python kamu:
```bash
python3 --version
```

---

## Struktur Folder

```
fintrack-api/
├── app.py
├── personal_fintrack_model.keras
├── business_fintrack_model.keras
└── requirements.txt
```

---

## Instalasi & Menjalankan API

### 1. Masuk ke folder project/buka terminal di vscode

### 2. Install python3-venv (kalau belum)
```bash
sudo apt install python3-venv
```

### 3. Buat virtual environment
```bash
python3 -m venv venv
```

### 4. Aktifkan virtual environment
```bash
source venv/bin/activate
```

Terminal kamu akan berubah jadi ada prefix `(venv)`:
```
(venv) user@device ~/Downloads/fintrack-api $
```

### 5. Install dependencies
```bash
pip install -r requirements.txt
```

### 6. Jalankan API
```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

API berjalan di: `http://localhost:8000` #default

---

## Test API

### Cara 1 — Lewat browser (Swagger UI)
Buka: `http://localhost:8000/docs`

Swagger UI memungkinkan kamu test semua endpoint langsung dari browser tanpa tools tambahan.

### Cara 2 — Lewat terminal (curl)

**Health check:**
```bash
curl http://localhost:8000/
```

**Prediksi transaksi personal:**
```bash
curl -X POST http://localhost:8000/predict/personal \
  -H "Content-Type: application/json" \
  -d '{"description": "Grab ke kantor", "transaction_type": "debit"}'
```

**Prediksi transaksi bisnis:**
```bash
curl -X POST http://localhost:8000/predict/business \
  -H "Content-Type: application/json" \
  -d '{"description": "Beli stok barang", "transaction_type": "debit"}'
```

### Contoh response sukses:
```json
{
  "model": "personal_finance",
  "description": "Grab ke kantor",
  "transaction_type": "debit",
  "predicted_category": "Transportasi",
  "confidence_score": 0.9731
}
```

---

## Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Health check |
| POST | `/predict/personal` | Klasifikasi transaksi personal |
| POST | `/predict/business` | Klasifikasi transaksi bisnis |

### Request Body (POST)

| Field | Tipe | Contoh |
|-------|------|--------|
| `description` | string | `"Grab ke kantor"` |
| `transaction_type` | string | `"debit"` / `"kredit"` / `"transfer"` |

---

## Kategori yang Tersedia

### Personal (9 kategori)
`Belanja Bulanan` · `Gaji` · `Hiburan` · `Makanan & Minuman` · `Pembayaran Langganan` · `Pulsa & Internet` · `Tempat Tinggal` · `Transfer Teman/Keluarga` · `Transportasi`

### Bisnis (14 kategori)
`Biaya Bank` · `Gaji & Karyawan` · `Lain-lain` · `Marketing & Promosi` · `Modal & Investasi` · `Operasional Kantor` · `Pajak & Perizinan` · `Pembelian Stok` · `Penjualan` · `Peralatan & Aset` · `Piutang` · `Software & Langganan` · `Transportasi & Logistik` · `Utang & Cicilan`

---

## Menjalankan Ulang (Sesi Baru)

Setiap kali buka terminal baru, aktifkan dulu venv-nya sebelum run:

```bash
cd ~/Downloads/fintrack-api
source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Untuk keluar dari venv:
```bash
deactivate
```

---

## Checklist Sebelum Serahkan ke Backend

- [ ] API bisa jalan tanpa error di terminal
- [ ] `http://localhost:8000/` mengembalikan `{"message": "FinTrack API Running!"}`
- [ ] Endpoint `/predict/personal` dan `/predict/business` sudah dicoba dan menghasilkan respons yang masuk akal
- [ ] Kedua file `.keras` sudah ikut disertakan
