# 🤖 AI AGENT TASK: FinTrack Backend — Feature Update (Phase 2)

## 🎯 KONTEKS
Kamu melanjutkan pengembangan backend **FinTrack** yang sudah berjalan.
Struktur, tech stack, dan aturan arsitektur **tidak berubah** — ikuti semua rules di `agent.md` dan konvensi di `GEMINI.md`.

Backend saat ini sudah memiliki endpoint berikut (JANGAN diubah, hanya ditambah):
- ✅ `Auth` — register, login, refresh-token, logout, logout-all
- ✅ `Categories` — full CRUD
- ✅ `Transactions` — full CRUD + `POST /transactions/predict-only`
- ✅ `Dashboard` — `GET /dashboard` (ringkasan saldo, pemasukan, pengeluaran)

---

## 📋 TASK: Implementasi 6 Fitur Baru

Tambahkan fitur-fitur berikut **secara bertahap sesuai urutan prioritas**. Setiap fitur wajib mengikuti pola **Controller → Service → Repository** dan dilengkapi **Swagger JSDoc annotation** di route-nya.

---

### 🔴 PRIORITAS 1 — User Profile & Settings

**Tambahkan endpoint:**
```
GET    /api/users/profile       — Ambil profil user yang sedang login
PUT    /api/users/profile       — Update nama lengkap, nomor telepon, alamat
PUT    /api/users/password      — Ganti kata sandi (input: current_password, new_password)
PUT    /api/users/avatar        — Upload/update URL foto profil (simpan URL string, bukan file upload)
PUT    /api/users/2fa           — Toggle 2FA on/off (simpan sebagai boolean di DB)
```

**Perubahan Schema DB — Tambahkan kolom ke tabel `users`:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_fa_enabled BOOLEAN DEFAULT false;
```

**Validasi Joi (`joiSchemas.js`):**
- `updateProfileSchema`: `full_name` (string, max 255), `phone` (string, max 20), `address` (string)
- `changePasswordSchema`: `current_password` (string, required), `new_password` (string, min 8, required)
- `updateAvatarSchema`: `avatar_url` (string URI, required)
- `toggle2faSchema`: `enabled` (boolean, required)

**Aturan bisnis:**
- Semua endpoint wajib pakai middleware `authenticate` (protected route).
- `PUT /users/password`: verifikasi `current_password` dengan `bcryptjs.compare()` sebelum update.
- `GET /users/profile`: jangan return `password_hash`.

---

### 🔴 PRIORITAS 2 — Analytics

**Tambahkan endpoint:**
```
GET  /api/analytics/monthly-expenses      — Pengeluaran per bulan (Aktual vs Anggaran)
GET  /api/analytics/income-vs-expense     — Perbandingan pemasukan vs pengeluaran
GET  /api/analytics/expense-distribution  — Distribusi pengeluaran per kategori (untuk pie chart)
```

**Query params yang WAJIB didukung:**
```
?start_date=YYYY-MM-DD
?end_date=YYYY-MM-DD
?period=weekly|monthly   (untuk income-vs-expense, default: monthly)
```

**Contoh response `GET /analytics/expense-distribution`:**
```json
{
  "data": [
    { "category_name": "Makanan", "total": 1500000, "percentage": 40 },
    { "category_name": "Bisnis",  "total": 1125000, "percentage": 30 },
    { "category_name": "Utilitas","total": 750000,  "percentage": 20 },
    { "category_name": "Lainnya", "total": 375000,  "percentage": 10 }
  ]
}
```

**Contoh response `GET /analytics/income-vs-expense`:**
```json
{
  "period": "monthly",
  "data": [
    { "label": "Jan", "income": 8000000, "expense": 3200000 },
    { "label": "Feb", "income": 7500000, "expense": 4100000 }
  ]
}
```

**Aturan bisnis:**
- Semua endpoint protected, hanya return data milik user yang login.
- Query SQL menggunakan `DATE_TRUNC` untuk grouping per bulan/minggu.
- `monthly-expenses`: untuk MVP, kolom `anggaran` bisa di-hardcode atau return `null` dulu karena belum ada tabel budget.

---

### 🟠 PRIORITAS 3 — Savings Goals (Target Tabungan)

**Tambahkan endpoint:**
```
GET    /api/savings-goals           — List semua target tabungan milik user
POST   /api/savings-goals           — Buat target baru
GET    /api/savings-goals/:id       — Detail satu target
PUT    /api/savings-goals/:id       — Update target (nama, jumlah target, jumlah terkini)
DELETE /api/savings-goals/:id       — Hapus target
```

**Tambahkan tabel baru:**
```sql
CREATE TABLE IF NOT EXISTS savings_goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  target_amount  BIGINT NOT NULL CHECK (target_amount > 0),
  current_amount BIGINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
```

**Validasi Joi:**
- `createSavingsGoalSchema`: `name` (string, required), `target_amount` (number, min 1, required), `current_amount` (number, min 0, optional default 0)
- `updateSavingsGoalSchema`: semua field optional

**Response wajib menyertakan field `progress_percentage`:**
```json
{
  "id": "uuid",
  "name": "Target Umroh",
  "target_amount": 30000000,
  "current_amount": 22500000,
  "progress_percentage": 75,
  "created_at": "..."
}
```

**Aturan bisnis:**
- User hanya bisa akses savings goals miliknya sendiri.
- `progress_percentage` dihitung di Service layer: `Math.round((current / target) * 100)`.

---

### 🟠 PRIORITAS 4 — AI Insights & Financial Health Score

**Tambahkan endpoint:**
```
GET  /api/ai/insights                — List rekomendasi/insight AI untuk user
GET  /api/ai/financial-health-score  — Skor kesehatan finansial (0–100)
```

**PENTING: Gunakan Mock Logic (sesuai aturan `agent.md` — tidak boleh call API eksternal).**

**Mock Logic untuk `financial-health-score`:**
Hitung berdasarkan data transaksi user (query ke DB):
```
score = 100
- Jika total pengeluaran bulan ini > total pemasukan → kurangi 30 poin
- Jika tidak ada transaksi pemasukan bulan ini → kurangi 20 poin
- Jika ada kategori "Hiburan" > 20% dari total pengeluaran → kurangi 10 poin
- Jika user punya minimal 1 savings goal dengan progress > 50% → tambah 5 poin
Skor minimal: 0, maksimal: 100
```

**Mock Logic untuk `insights`:**
Return array insight statis yang dipilih berdasarkan kondisi sederhana:
```javascript
// Contoh kondisi
if (expense > income) insights.push({ type: "warning", message: "Pengeluaran bulan ini melebihi pemasukan. Pertimbangkan untuk mengurangi pengeluaran." })
if (entertainmentRatio > 0.2) insights.push({ type: "tip", message: "Pengeluaran hiburan Anda cukup tinggi. Hemat Rp200rb dengan mengurangi kategori Hiburan." })
```

**Contoh response `GET /ai/insights`:**
```json
{
  "data": [
    { "type": "tip", "message": "Hemat Rp200rb bulan depan dengan mengurangi kategori Hiburan.", "action_label": "Lihat Rincian" },
    { "type": "warning", "message": "Pengeluaran bulan ini mendekati batas pemasukan Anda." }
  ]
}
```

---

### 🟡 PRIORITAS 5 — Export Transaksi

**Tambahkan endpoint:**
```
GET  /api/transactions/export   — Export transaksi ke CSV
```

**Query params:**
```
?format=csv          (untuk MVP, hanya support csv)
?start_date=YYYY-MM-DD
?end_date=YYYY-MM-DD
?category_id=
```

**Implementasi:**
- Gunakan **native string building** untuk generate CSV (jangan tambah library baru).
- Set response headers:
  ```javascript
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  ```
- Kolom CSV: `Tanggal,Deskripsi,Kategori,Jumlah,Status`

---

### 🟡 PRIORITAS 6 — Filter & Pagination pada Transactions

**Update endpoint yang sudah ada:**
```
GET  /api/transactions   — Tambahkan dukungan filter & pagination
```

**Query params yang wajib ditambahkan (jika belum ada):**
```
?search=          — pencarian di kolom description (ILIKE)
?category_id=     — filter berdasarkan category_id
?type=income|expense — filter berdasarkan tipe kategori
?status=pending|classified|failed — filter classification_status
?start_date=YYYY-MM-DD
?end_date=YYYY-MM-DD
?page=1           — default: 1
?limit=10         — default: 10, maksimal: 100
```

**Response wajib menyertakan metadata pagination:**
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "total_pages": 15
  }
}
```

---

## 🗂️ FILE YANG PERLU DIBUAT/DIUPDATE

### File Baru:
```
src/routes/users.js
src/routes/analytics.js
src/routes/savingsGoals.js
src/routes/ai.js

src/controllers/usersController.js
src/controllers/analyticsController.js
src/controllers/savingsGoalsController.js
src/controllers/aiController.js

src/services/usersService.js
src/services/analyticsService.js
src/services/savingsGoalsService.js
src/services/aiService.js

src/repositories/usersRepository.js
src/repositories/analyticsRepository.js
src/repositories/savingsGoalsRepository.js
```

### File yang Diupdate:
```
src/routes/index.js              — Daftarkan semua route baru
src/routes/transactions.js       — Tambah route export + update filter
src/controllers/transactionsController.js  — Tambah handler export
src/services/transactionsService.js        — Tambah logic export + filter
src/repositories/transactionsRepository.js — Tambah query filter & pagination
src/utils/joiSchemas.js          — Tambah semua schema validasi baru
```

---

## ✅ CHECKLIST SETIAP FITUR SEBELUM SELESAI

Untuk setiap endpoint baru, pastikan:
- [ ] Ada Swagger JSDoc annotation di file route-nya
- [ ] Input divalidasi dengan Joi via middleware `validate()`
- [ ] Error ditangani dengan `asyncHelper` (tidak ada try/catch manual di controller)
- [ ] Semua query SQL ada di Repository layer, bukan di Service
- [ ] Response menggunakan format standar: `{ "message": "...", "data": ... }`
- [ ] Endpoint protected wajib pakai middleware `authenticate`
- [ ] Tidak ada library baru yang ditambahkan

---

## 🗄️ MIGRATION SCRIPT

Buat file `src/database/migration_phase2.sql` yang berisi seluruh query ALTER TABLE dan CREATE TABLE dari semua fitur di atas, siap dijalankan sekaligus di Supabase SQL Editor.

---

## 📦 DELIVERABLE

1. **Semua file kode** — lengkap (full file, jangan dipotong)
2. **`src/database/migration_phase2.sql`** — query schema lengkap
3. **Update `src/tests/newman-collection.json`** — tambahkan test case untuk semua endpoint baru
4. **Verifikasi `package.json`** — pastikan tidak ada dependency baru yang ditambahkan
