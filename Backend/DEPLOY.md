# Deploy FinTrack Backend ke Render

Panduan ini membuat Anda siap deploy tanpa mengubah kode lagi. Pastikan repo sudah di-push ke GitHub.

---

## Prasyarat

- [ ] Repo GitHub sudah berisi folder `Backend/` (monorepo `capstone-fintrack`)
- [ ] Supabase sudah berjalan (tabel `users`, `categories`, `transactions`, `refresh_tokens`)
- [ ] Kategori default sudah di-seed **sekali** ke DB production: `npm run seed` (dari lokal dengan `.env` yang sama)

---

## Opsi A — Blueprint (disarankan)

1. Login [render.com](https://render.com) → **New +** → **Blueprint**
2. Connect repository GitHub `capstone-fintrack`
3. Render membaca `render.yaml` di root repo
4. Isi variabel yang ditandai **sync: false** saat diminta:
   - `DATABASE_USER`
   - `DATABASE_PASSWORD`
   - `DATABASE_HOST` (contoh: `aws-0-ap-southeast-1.pooler.supabase.com`)
5. Klik **Apply** → tunggu deploy selesai

`JWT_SECRET` di-generate otomatis oleh Render.

---

## Opsi B — Web Service manual

| Pengaturan | Nilai |
|------------|--------|
| **Root Directory** | `Backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/ping` |
| **Region** | Singapore |

### Environment Variables (wajib)

| Key | Nilai |
|-----|--------|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `DATABASE_USER` | dari Supabase |
| `DATABASE_PASSWORD` | dari Supabase |
| `DATABASE_HOST` | pooler Supabase |
| `DATABASE_PORT` | `6543` |
| `DATABASE_NAME` | `postgres` |
| `JWT_SECRET` | string acak panjang (beda dari lokal) |

**Jangan set `PORT` manual** — Render mengisi otomatis.

---

## Verifikasi setelah deploy

Ganti `YOUR-SERVICE` dengan nama subdomain Render Anda.

```bash
curl https://YOUR-SERVICE.onrender.com/api/ping
curl https://YOUR-SERVICE.onrender.com/
```

Buka di browser:

- Swagger: `https://YOUR-SERVICE.onrender.com/api-docs`
- Health: `https://YOUR-SERVICE.onrender.com/api/ping`

Di **Logs** Render, pastikan ada:

```text
[database]: Koneksi ke database PostgreSQL berhasil!
```

---

## Seed kategori (sekali)

Dari mesin lokal (`.env` mengarah ke DB yang sama dengan production):

```bash
cd Backend
npm run seed
```

---

## Catatan production

- **Free tier:** cold start ~30–60 detik setelah idle.
- **RLS Supabase:** aktifkan hanya setelah memahami policy; uji agar koneksi `pg` backend tidak terblokir.
- **Frontend nanti:** `baseURL` = `https://YOUR-SERVICE.onrender.com/api`

---

## Troubleshooting

| Gejala | Solusi |
|--------|--------|
| Build gagal "package.json not found" | Set **Root Directory** = `Backend` |
| Service tidak bisa diakses | Pastikan `HOST=0.0.0.0` |
| DB connection failed | Cek env Supabase, port `6543`, password benar |
| Health check gagal | Pastikan path `/api/ping` dan service sudah listen |
