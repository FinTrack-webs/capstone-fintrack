# Deploy FinTrack Backend ke Vercel

Panduan untuk **deploy pertama kali**. Backend sudah jalan di lokal; belum perlu khawatir soal Render — langsung ke Vercel saja.

Repo monorepo: di Vercel wajib set **Root Directory** = `Backend`.

---

## Checklist singkat

| # | Langkah | Status |
|---|---------|--------|
| 0 | Backend jalan lokal (`npm run dev`) | ✅ biasanya sudah |
| 1 | Push kode ke GitHub | ⬜ |
| 2 | Import repo di Vercel | ⬜ |
| 3 | Isi Environment Variables | ⬜ |
| 4 | Deploy → tes `/api/ping` | ⬜ |

---

## 0. Push ke GitHub (jika belum)

```bash
cd /path/ke/capstone-fintrack
git add .
git commit -m "chore: siapkan deploy Vercel"
git push
```

---

## Prasyarat

- [ ] Akun [vercel.com](https://vercel.com) (login GitHub)
- [ ] Supabase aktif — **satu DB** dipakai lokal & production (env sama)
- [ ] File `Backend/.env.vercel` sudah diisi (copy dari `.env` lokal)

---

## Langkah deploy

### 1. Import project

1. Vercel Dashboard → **Add New** → **Project**
2. Import repository `capstone-fintrack`
3. **Root Directory** → klik **Edit** → pilih folder **`Backend`**
4. Framework Preset: **Other** (bukan Next.js)
5. Build Command: *(kosongkan)*
6. Output Directory: *(kosongkan)*
7. Install Command: `npm install` (default)

### 2. Environment Variables

Di **Environment Variables**, tambahkan (atau paste dari `.env.vercel`):

| Key | Nilai |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_USER` | dari Supabase |
| `DATABASE_PASSWORD` | dari Supabase |
| `DATABASE_HOST` | pooler Supabase |
| `DATABASE_PORT` | `6543` |
| `DATABASE_NAME` | `postgres` |
| `JWT_SECRET` | string acak panjang (**beda** dari lokal) |

**Tidak perlu:** `HOST`, `PORT` — Vercel mengatur otomatis.

Cara cepat:
```bash
cp .env.vercel.example .env.vercel
# isi nilai, lalu copy-paste ke Vercel → Environment Variables
```

### 3. Deploy

Klik **Deploy** → tunggu build selesai.

URL production: `https://<nama-project>.vercel.app`

---

## Verifikasi

```bash
curl https://<nama-project>.vercel.app/api/ping
curl https://<nama-project>.vercel.app/
```

- Swagger: `https://<nama-project>.vercel.app/api-docs`
- Logs: Vercel Dashboard → Project → **Logs**

---

## Seed kategori (sekali)

Dari lokal (`.env` ke DB yang sama):

```bash
cd Backend
npm run seed
```

---

## Development lokal

```bash
npm run dev
```

Tetap pakai `.env` dengan `HOST=localhost` dan `PORT=3000`.

---

## Memahami `vercel.json` vs route `/api`

| | Arti |
|---|------|
| `"destination": "/api"` di `vercel.json` | Mengarah ke **file** `api/index.js` (entry serverless Vercel). **Hanya aktif saat deploy Vercel**, tidak mempengaruhi `npm run dev`. |
| Route Express `/api/...` | Prefix API di kode (`app.use('/api', routes)`). Contoh: `/api/ping`, `/api/auth/login`. |

**Lokal (`npm run dev`):** `vercel.json` diabaikan. Buka:
- `http://localhost:3000/` → welcome
- `http://localhost:3000/api` → daftar route API
- `http://localhost:3000/api/ping` → health check

---

## Catatan Vercel

- **Serverless:** cold start pertama bisa lambat (~1–3 detik).
- **AI mock (background):** klasifikasi async bisa terpotong saat cold start; untuk production penuh pertimbangkan worker terpisah nanti.
- **Frontend:** `baseURL` = `https://<nama-project>.vercel.app/api`

---

## Troubleshooting

| Gejala | Solusi |
|--------|--------|
| 404 semua route | Pastikan `vercel.json` ada di `Backend/` dan Root Directory = `Backend` |
| DB connection failed | Cek env Supabase, port `6543`, password benar |
| Build error | Pastikan `api/index.js` dan `src/app.js` ada |
