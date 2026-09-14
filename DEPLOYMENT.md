# Deployment ke Vercel + PostgreSQL

## 1. Setup Database PostgreSQL

### Option A: Neon.tech (Recommended - Free Serverless PostgreSQL)
1. **Buat akun**: https://neon.tech → Sign up
2. **Buat project** → copy connection string format:
   ```
   postgresql://neondb_owner:***@ep-xxxx.neon.tech/neondb?sslmode=require
   ```
3. **Test lokal** (opsional):
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   ```

### Option B: Supabase (PostgreSQL + Auth)
1. **Buat akun**: https://supabase.com → Sign up
2. **New Project** → copy dari "Connection Pooling" tab:
   ```
   postgresql://postgres:***@db.supabase.co:5432/postgres
   ```

### Option C: PlanetScale (MySQL Serverless - jika mau MySQL)
1. Follow https://planetscale.com setup
2. Generate connection string dari dashboard

---

## 2. Update Prisma Schema

File sudah diupdate ke PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 3. Deploy ke Vercel

### Step 1: Siapkan repo Git
```bash
cd "C:/Users/Purna Siswantomo/Documents/Harga Joki"
git init
git add .
git commit -m "feat: PostgreSQL migration, admin login auth, hide admin button"
git branch -M main
git remote add origin https://github.com/your-username/harga-joki.git
git push -u origin main
```

### Step 2: Import ke Vercel
1. **https://vercel.com** → New Project
2. **Import Git Repository** → select `harga-joki`
3. **Environment Variables** → add:
   - `DATABASE_URL` = PostgreSQL connection string dari Neon/Supabase
   - `ADMIN_USERNAME` = `admin`
   - `ADMIN_PASSWORD` = strong password (gunakan password generator)
   - `SESSION_SECRET` = random 32+ char hex string
     - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `NODE_ENV` = `production`

4. **Deploy** → wait ~3-5 min

### Step 3: Migration Database
```bash
# After deploy, run migration:
vercel env pull .env.production.local
vercel build
npx prisma db push --skip-generate  # Create tables in PostgreSQL
```

---

## 4. Security Checklist

✓ **Admin Button Hidden** - tombol tidak terlihat di public page
✓ **Protected Routes** - `/admin`, `/api/orders`, `/api/config` auth-gated via proxy
✓ **Login Redirect** - unauthenticated → `/admin/login`
✓ **Session Tokens** - HTTP-only cookies, HMAC-SHA256 signed
✓ **Database** - PostgreSQL (not SQLite)
✓ **Env Variables** - tidak hardcoded, tersimpan di Vercel Settings
✓ **CORS** - terbatas ke origin sendiri (default Next.js)

---

## 5. Access Admin Area

- **Public Page**: https://harga-joki.vercel.app/
- **Admin Login**: https://harga-joki.vercel.app/admin/login
  - Username: `admin`
  - Password: (dari env var)
- **Admin Dashboard**: https://harga-joki.vercel.app/admin (auto-redirect ke /admin/login jika belum login)

---

## 6. Local Development

```bash
# Copy .env.example ke .env.local, update DATABASE_URL
cp .env.example .env.local

# Setup PostgreSQL lokal (optional, atau gunakan Neon dev branch)
# Install PostgreSQL: https://www.postgresql.org/download/windows/

# Setup Prisma
npx prisma db push  # Create tables
npx prisma generate # Generate types

# Dev server
npm run dev
# Open http://localhost:3000
```

---

## 7. Production Checklist

- [ ] `.env.example` committed (tanpa secrets) ✓
- [ ] `.env*` in `.gitignore` ✓
- [ ] PostgreSQL DATABASE_URL di Vercel Settings
- [ ] ADMIN_PASSWORD strong (12+ char, mix of symbols/numbers)
- [ ] SESSION_SECRET random 32+ hex chars
- [ ] First login ke `/admin/login` berhasil
- [ ] Orders dashboard (`/admin`) loadable
- [ ] Can create/edit/delete orders
- [ ] Payment status update works
- [ ] Logout (`/api/auth/logout`) clears session

---

## 8. Troubleshooting

**Build error: "DATABASE_URL belum dikonfigurasi"**
- Solution: Add `DATABASE_URL` to Vercel Environment Variables

**Login page blank**
- Check: `/admin/login` route exists (build succeeded)
- Browser: Inspect Console for JS errors

**"Unauthorized" API 401**
- Verify SESSION_SECRET set di Vercel & lokal `.env.local`
- Clear cookies: `Application → Cookies → delete admin_session`

**Database "relation does not exist"**
- Run: `npx prisma db push` after deployment
- Or via Vercel CLI: `vercel env pull && npx prisma db push`

